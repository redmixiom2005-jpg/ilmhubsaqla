/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChildProcess, execFile, spawn } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { DeviceFormat, DownloadJob, DownloadJobStatus } from '../types';
import { config } from './config';
import { formatBytes } from './ytdlp';

const execFileAsync = promisify(execFile);

interface ActiveJobProcess {
  job: DownloadJob;
  process?: ChildProcess;
  targetFilePrefix: string;
}

interface MediaProbe {
  format?: { format_name?: string; duration?: string };
  streams?: Array<{
    codec_type?: string;
    codec_name?: string;
    codec_tag_string?: string;
    width?: number;
    height?: number;
    r_frame_rate?: string;
  }>;
}

class DownloadJobManager {
  private jobs = new Map<string, DownloadJob>();
  private activeProcesses = new Map<string, ActiveJobProcess>();
  private queue: string[] = [];
  private activeCount = 0;

  constructor() {
    // Run cleanup every 30 minutes
    setInterval(() => this.cleanupOldFiles(), 30 * 60 * 1000);
    // Initial cleanup on boot
    setTimeout(() => this.cleanupOldFiles(), 5000);
  }

  public createJob(params: {
    url: string;
    quality: string;
    format: string;
    formatId?: string;
    deviceFormat?: DeviceFormat;
    title?: string;
  }): DownloadJob {
    const id = crypto.randomUUID();
    const now = Date.now();

    const job: DownloadJob = {
      id,
      url: params.url,
      title: params.title || 'YouTube Video',
      quality: params.quality || '720p',
      format: params.format || 'mp4',
      formatId: params.formatId,
      deviceFormat: params.deviceFormat,
      status: 'queued',
      progress: 0,
      createdAt: now,
      updatedAt: now
    };

    this.jobs.set(id, job);
    this.queue.push(id);
    this.processQueue();

    return job;
  }

  public getJob(id: string): DownloadJob | undefined {
    return this.jobs.get(id);
  }

  public cancelJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job) return false;

    // If currently queued
    const qIndex = this.queue.indexOf(id);
    if (qIndex !== -1) {
      this.queue.splice(qIndex, 1);
    }

    const active = this.activeProcesses.get(id);
    if (active && active.process) {
      try {
        active.process.kill('SIGTERM');
        setTimeout(() => {
          if (active.process && !active.process.killed) {
            active.process.kill('SIGKILL');
          }
        }, 2000);
      } catch (err) {
        console.error(`Failed to kill process for job ${id}:`, err);
      }
    }

    job.status = 'cancelled';
    job.updatedAt = Date.now();
    this.jobs.set(id, job);

    if (active) {
      this.activeProcesses.delete(id);
      this.activeCount = Math.max(0, this.activeCount - 1);
      this.cleanupJobTempFiles(active.targetFilePrefix);
    }

    this.processQueue();
    return true;
  }

  private processQueue() {
    while (this.activeCount < config.maxConcurrentDownloads && this.queue.length > 0) {
      const nextId = this.queue.shift();
      if (!nextId) break;

      const job = this.jobs.get(nextId);
      if (!job || job.status === 'cancelled') continue;

      this.startDownload(job);
    }
  }

  private startDownload(job: DownloadJob) {
    this.activeCount++;
    job.status = 'downloading';
    job.updatedAt = Date.now();
    this.jobs.set(job.id, job);

    const safeJobId = job.id.replace(/[^a-zA-Z0-9_-]/g, '');
    const filePrefix = `ilmhub_${safeJobId}`;
    const outputTemplate = path.join(config.downloadDir, `${filePrefix}_%(title).60B.%(ext)s`);

    const isAudioOnly = job.quality === 'audio' || job.format === 'mp3';
    const heightMatch = job.quality.match(/^(\d+)p$/);
    const targetHeight = heightMatch ? parseInt(heightMatch[1], 10) : 720;

    const cookiePath = config.getCookieFile();
    const cookieArgs = cookiePath && fs.existsSync(cookiePath) ? ['--cookies', cookiePath] : [];

    const args: string[] = [
      '--newline',
      '--no-playlist',
      '--no-warnings',
      '--no-check-certificates',
      ...cookieArgs,
      '--progress-template',
      'ILMHUB_PROG:%(progress._percent_str)s|%(progress._speed_str)s|%(progress._eta_str)s|%(progress._downloaded_bytes_str)s|%(progress._total_bytes_str)s|%(progress.status)s',
      '-o',
      outputTemplate
    ];

    if (isAudioOnly) {
      args.push(
        '-x',
        '--audio-format',
        'mp3',
        '--audio-quality',
        '0',
        '--ffmpeg-location',
        config.ffmpegPath
      );
    } else {
      args.push(
        '-f',
        job.formatId ? `${job.formatId}+bestaudio[ext=m4a]/${job.formatId}+bestaudio/${job.formatId}` : `bestvideo[height<=${targetHeight}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${targetHeight}]+bestaudio/best[height<=${targetHeight}]/best`,
        '--merge-output-format',
        'mp4',
        '--ffmpeg-location',
        config.ffmpegPath
      );
    }

    args.push(job.url);

    let stderrBuffer = '';
    let timedOut = false;

    try {
      const child = spawn(config.ytDlpPath, args, {
        cwd: config.downloadDir,
        env: { ...process.env, PATH: process.env.PATH }
      });

      const timeout = setTimeout(() => {
        timedOut = true;
        if (!child.killed) child.kill('SIGTERM');
        job.status = 'failed';
        job.error = 'Download timed out';
        job.errorCode = 'DOWNLOAD_TIMEOUT';
        job.updatedAt = Date.now();
        this.cleanupJobTempFiles(filePrefix);
      }, config.downloadTimeoutMs);

      this.activeProcesses.set(job.id, {
        job,
        process: child,
        targetFilePrefix: filePrefix
      });

      child.stdout.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        this.parseYtDlpOutput(job, text);
      });

      child.stderr.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        stderrBuffer += text;
        // Check for ffmpeg merging keywords
        if (text.includes('[Merger]') || text.includes('Merging formats') || text.includes('Extracting audio')) {
          job.status = 'processing';
          job.updatedAt = Date.now();
          this.jobs.set(job.id, job);
        }
      });

      child.on('error', (err) => {
        console.error(`Process error for job ${job.id}:`, err);
        job.status = 'failed';
        job.error = err.message || 'Failed to spawn download process';
        job.errorCode = 'DOWNLOAD_FAILED';
        job.updatedAt = Date.now();
        this.finishJob(job.id, filePrefix);
      });

      child.on('close', async (code) => {
        clearTimeout(timeout);
        if (timedOut) {
          this.finishJob(job.id, filePrefix);
          return;
        }
        if (job.status === 'cancelled') {
          this.finishJob(job.id, filePrefix);
          return;
        }

        if (code === 0) {
          // Find generated file
          const completedFilename = this.findGeneratedFile(filePrefix);
          if (completedFilename) {
            try {
              const preparedFilename = await this.prepareOutput(job, completedFilename);
              const completedPath = path.join(config.downloadDir, preparedFilename);
              const fileStats = fs.statSync(completedPath);
              const probe = await this.probeMedia(completedPath);
              const videoStream = probe.streams?.find((stream) => stream.codec_type === 'video');
              const audioStream = probe.streams?.find((stream) => stream.codec_type === 'audio');
              const isAudioOutput = job.quality === 'audio' || job.format === 'mp3';
              if (isAudioOutput ? !audioStream : !videoStream || !audioStream) {
                throw new Error(isAudioOutput ? 'Final MP3 audio stream was not found' : 'Final MP4 must contain both video and audio streams');
              }
              const requestedHeight = Number.parseInt(job.quality, 10);
              if (!isAudioOutput && videoStream?.height && requestedHeight && videoStream.height < requestedHeight) {
                throw new Error(`Final video resolution is below the selected ${job.quality} quality`);
              }
              const extension = path.extname(preparedFilename).slice(1).toLowerCase();
              job.status = 'completed';
              job.progress = 100;
              job.filename = preparedFilename;
              job.downloadUrl = `/api/download/${job.id}/file`;
              job.filesizeBytes = fileStats.size;
              job.filesize = formatBytes(fileStats.size);
              job.total = job.filesize;
              job.extension = extension;
              job.mimeType = isAudioOutput ? 'audio/mpeg' : 'video/mp4';
              job.resolution = isAudioOutput ? undefined : videoStream?.height ? `${videoStream.height}p` : job.quality;
              job.videoCodec = videoStream?.codec_name;
              job.audioCodec = audioStream.codec_name;
              job.updatedAt = Date.now();
              this.jobs.set(job.id, job);
            } catch (error) {
              job.status = 'failed';
              job.error = error instanceof Error ? error.message : 'Final video validation failed';
              job.errorCode = 'FORMAT_CONVERSION_FAILED';
              job.updatedAt = Date.now();
              this.cleanupJobTempFiles(filePrefix);
            }
          } else {
            job.status = 'failed';
            job.error = 'Downloaded file was not found on server';
            job.errorCode = 'DOWNLOAD_FAILED';
          }
        } else {
          job.status = 'failed';
          if (stderrBuffer.includes('Sign in to confirm you’re not a bot') || stderrBuffer.includes('Sign in to confirm you')) {
            job.error = 'YouTube bot tekshiruvi: Yuklab olish uchun serverda cookie talab qilinadi';
            job.errorCode = 'BOT_DETECTION_ERROR';
          } else if (stderrBuffer.includes('Private video')) {
            job.error = 'Ushbu video shaxsiy (private)';
            job.errorCode = 'PRIVATE_VIDEO';
          } else if (stderrBuffer.includes('Video unavailable')) {
            job.error = 'Video mavjud emas yoki o\'chirilgan';
            job.errorCode = 'VIDEO_UNAVAILABLE';
          } else {
            job.error = job.error || `Download process exited with code ${code}`;
            job.errorCode = 'DOWNLOAD_FAILED';
          }
        }

        this.finishJob(job.id, filePrefix);
      });
    } catch (err: unknown) {
      const error = err as Error;
      job.status = 'failed';
      job.error = error.message;
      job.errorCode = 'DOWNLOAD_FAILED';
      this.finishJob(job.id, filePrefix);
    }
  }

  private async probeMedia(filePath: string): Promise<MediaProbe> {
    const { stdout } = await execFileAsync(config.ffprobePath, [
      '-v', 'error', '-show_entries', 'format=format_name,duration',
      '-show_entries', 'stream=codec_type,codec_name,codec_tag_string,width,height,r_frame_rate',
      '-of', 'json', filePath
    ], { timeout: 30000, maxBuffer: 1024 * 1024 });
    return JSON.parse(stdout) as MediaProbe;
  }

  private async prepareOutput(job: DownloadJob, filename: string): Promise<string> {
    const isMp4 = job.quality !== 'audio' && job.format !== 'mp3';
    if (!isMp4 || !job.deviceFormat || ['android', 'windows', 'macos'].includes(job.deviceFormat)) {
      return filename;
    }

    const sourcePath = path.join(config.downloadDir, filename);
    const sourceProbe = await this.probeMedia(sourcePath);
    const video = sourceProbe.streams?.find((stream) => stream.codec_type === 'video');
    const audio = sourceProbe.streams?.find((stream) => stream.codec_type === 'audio');
    const requestedCodec = job.deviceFormat === 'ios-hevc' ? 'hevc' : 'h264';
    const outputFilename = `${filename}.compatible.mp4`;
    const outputPath = path.join(config.downloadDir, outputFilename);
    const canRemux = video?.codec_name === requestedCodec && audio?.codec_name === 'aac' && sourceProbe.format?.format_name?.split(',').includes('mov');
    const ffmpegArgs = canRemux
      ? ['-y', '-i', sourcePath, '-map', '0:v:0', '-map', '0:a:0', '-c', 'copy', ...(requestedCodec === 'hevc' ? ['-tag:v', 'hvc1'] : []), '-movflags', '+faststart', outputPath]
      : ['-y', '-i', sourcePath, '-map', '0:v:0', '-map', '0:a:0', '-c:v', requestedCodec === 'hevc' ? 'libx265' : 'libx264', ...(requestedCodec === 'hevc' ? ['-tag:v', 'hvc1'] : []), '-preset', 'veryfast', '-crf', requestedCodec === 'hevc' ? '28' : '23', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', outputPath];

    await execFileAsync(config.ffmpegPath, ffmpegArgs, { timeout: config.downloadTimeoutMs, maxBuffer: 2 * 1024 * 1024 });
    fs.unlinkSync(sourcePath);
    fs.renameSync(outputPath, sourcePath);
    return filename;
  }

  private parseYtDlpOutput(job: DownloadJob, output: string) {
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.includes('ILMHUB_PROG:')) {
        const parts = line.split('ILMHUB_PROG:')[1].split('|');
        if (parts.length >= 5) {
          const rawPercent = parts[0].trim().replace('%', '');
          const percent = parseFloat(rawPercent);
          if (!isNaN(percent)) {
            job.progress = Math.min(99.9, Math.max(job.progress, percent));
          }

          const rawSpeed = parts[1].trim();
          if (rawSpeed && rawSpeed !== 'NA') {
            job.speed = rawSpeed;
          }

          const rawEta = parts[2].trim();
          if (rawEta && rawEta !== 'NA') {
            job.eta = rawEta;
          }

          const rawDownloaded = parts[3].trim();
          if (rawDownloaded && rawDownloaded !== 'NA') {
            job.downloaded = rawDownloaded;
          }

          const rawTotal = parts[4].trim();
          if (rawTotal && rawTotal !== 'NA') {
            job.total = rawTotal;
          }

          const status = parts[5]?.trim();
          if (status === 'finished') {
            job.status = 'processing';
          }

          job.updatedAt = Date.now();
          this.jobs.set(job.id, job);
        }
      } else if (line.includes('[Merger]') || line.includes('Merging formats') || line.includes('[ExtractAudio]')) {
        job.status = 'processing';
        job.updatedAt = Date.now();
        this.jobs.set(job.id, job);
      } else if (line.includes('[download]') && line.includes('%')) {
        // Fallback regex parser for standard yt-dlp format
        const match = line.match(/\[download\]\s+([\d.]+)%\s+of\s+~?([\d.]+\w+)\s+at\s+([\d.]+\w+\/s)\s+ETA\s+([\d:]+)/);
        if (match) {
          const percent = parseFloat(match[1]);
          if (!isNaN(percent)) {
            job.progress = Math.min(99.9, Math.max(job.progress, percent));
          }
          job.total = match[2];
          job.speed = match[3];
          job.eta = match[4];
          job.updatedAt = Date.now();
          this.jobs.set(job.id, job);
        }
      }
    }
  }

  private finishJob(id: string, filePrefix: string) {
    if (!this.activeProcesses.has(id)) return;
    this.activeProcesses.delete(id);
    this.activeCount = Math.max(0, this.activeCount - 1);
    this.processQueue();
  }

  private findGeneratedFile(filePrefix: string): string | null {
    try {
      const files = fs.readdirSync(config.downloadDir);
      const found = files.find(
        (f) => f.startsWith(filePrefix) && !f.endsWith('.part') && !f.endsWith('.temp') && !f.endsWith('.ytdl')
      );
      return found || null;
    } catch {
      return null;
    }
  }

  private cleanupJobTempFiles(filePrefix: string) {
    try {
      const files = fs.readdirSync(config.downloadDir);
      for (const f of files) {
        if (f.startsWith(filePrefix)) {
          const filePath = path.join(config.downloadDir, f);
          try {
            fs.unlinkSync(filePath);
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // ignore
    }
  }

  private cleanupOldFiles() {
    try {
      const now = Date.now();
      const maxAgeMs = config.retentionHours * 60 * 60 * 1000;
      const files = fs.readdirSync(config.downloadDir);

      for (const file of files) {
        const fullPath = path.join(config.downloadDir, file);
        try {
          const stats = fs.statSync(fullPath);
          if (now - stats.mtimeMs > maxAgeMs) {
            fs.unlinkSync(fullPath);
          }
        } catch {
          // ignore
        }
      }

      // Clean up stale jobs in memory (> 48 hours)
      for (const [id, job] of this.jobs.entries()) {
        if (now - job.createdAt > 48 * 60 * 60 * 1000 && job.status !== 'downloading') {
          this.jobs.delete(id);
        }
      }
    } catch (err) {
      console.error('Error during old files cleanup:', err);
    }
  }

  public getFilePathForJob(jobId: string): string | null {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'completed' || !job.filename) {
      return null;
    }

    // Security check: ensure filename strictly stays inside downloadDir
    const safeJobId = jobId.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!job.filename.startsWith(`ilmhub_${safeJobId}`)) {
      return null;
    }

    const resolved = path.resolve(config.downloadDir, job.filename);
    const downloadRoot = path.resolve(config.downloadDir);
    if (resolved !== downloadRoot && !resolved.startsWith(`${downloadRoot}${path.sep}`)) {
      return null;
    }

    if (fs.existsSync(resolved)) {
      return resolved;
    }

    return null;
  }
}

export const jobManager = new DownloadJobManager();
