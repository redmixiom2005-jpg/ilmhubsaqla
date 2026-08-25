/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChildProcess, spawn } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { DownloadJob, DownloadJobStatus } from '../types';
import { config } from './config';

interface ActiveJobProcess {
  job: DownloadJob;
  process?: ChildProcess;
  targetFilePrefix: string;
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

      child.on('close', (code) => {
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
            job.status = 'completed';
            job.progress = 100;
            job.filename = completedFilename;
            job.downloadUrl = `/api/download/${job.id}/file`;
            job.updatedAt = Date.now();
            this.jobs.set(job.id, job);
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
    if (!resolved.startsWith(config.downloadDir)) {
      return null;
    }

    if (fs.existsSync(resolved)) {
      return resolved;
    }

    return null;
  }
}

export const jobManager = new DownloadJobManager();
