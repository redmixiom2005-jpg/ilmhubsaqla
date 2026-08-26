/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import { config } from './config';
import { ServerHealth, VideoMetadata, VideoQualityOption } from '../types';

const execFileAsync = promisify(execFile);

function getCookieArgs(): string[] {
  const cookiePath = config.getCookieFile();
  if (cookiePath && fs.existsSync(cookiePath)) {
    return ['--cookies', cookiePath];
  }
  return [];
}

// Helper to format seconds into MM:SS or HH:MM:SS
export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Helper to format bytes to MB/GB
export function formatBytes(bytes: number): string {
  if (!bytes || isNaN(bytes) || bytes <= 0) return '';
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// Helper to format view counts
export function formatViews(count?: number): string {
  if (!count || isNaN(count)) return '';
  if (count >= 1_000_000_000) {
    return `${(count / 1_000_000_000).toFixed(1)}B`;
  }
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toLocaleString();
}

export async function checkSystemDependencies(): Promise<ServerHealth> {
  let ytDlpOk = false;
  let ytDlpVersion: string | undefined;
  let ffmpegOk = false;
  let ffmpegVersion: string | undefined;

  try {
    const { stdout } = await execFileAsync(config.ytDlpPath, ['--version'], { timeout: 5000 });
    ytDlpVersion = stdout.trim();
    ytDlpOk = true;
  } catch (err) {
    console.warn('yt-dlp check warning:', err);
  }

  try {
    const { stdout } = await execFileAsync(config.ffmpegPath, ['-version'], { timeout: 5000 });
    const firstLine = stdout.split('\n')[0] || '';
    ffmpegVersion = firstLine.replace('ffmpeg version ', '').split(' ')[0];
    ffmpegOk = true;
  } catch (err) {
    console.warn('ffmpeg check warning:', err);
  }

  const isHealthy = ytDlpOk && ffmpegOk;
  const isDegraded = ytDlpOk && !ffmpegOk;

  return {
    success: true,
    service: 'IlmHub Saqla Bot',
    status: isHealthy ? 'healthy' : isDegraded ? 'degraded' : 'unhealthy',
    ytDlp: ytDlpOk,
    ytDlpVersion,
    ffmpeg: ffmpegOk,
    ffmpegVersion,
    timestamp: new Date().toISOString()
  };
}

interface YtDlpRawFormat {
  format_id?: string;
  format_note?: string;
  ext?: string;
  resolution?: string;
  width?: number;
  height?: number;
  fps?: number;
  filesize?: number;
  filesize_approx?: number;
  vcodec?: string;
  acodec?: string;
  tbr?: number;
}

function estimateFormatSize(format: YtDlpRawFormat | undefined, duration: number): number {
  if (!format) return 0;
  return format.filesize || format.filesize_approx || (format.tbr && duration
    ? Math.round((format.tbr * 1024 * duration) / 8)
    : 0) || 0;
}

interface YtDlpRawMetadata {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  uploader?: string;
  channel?: string;
  uploader_url?: string;
  channel_url?: string;
  duration?: number;
  upload_date?: string;
  view_count?: number;
  formats?: YtDlpRawFormat[];
  thumbnails?: Array<{ url: string; width?: number; height?: number; preference?: number }>;
  webpage_url?: string;
  is_live?: boolean;
}

// Enhanced Fallback metadata fetch using official YouTube oEmbed API and Bot Scraping
async function fetchOEmbedMetadata(cleanUrl: string, isShorts = false): Promise<VideoMetadata> {
  // Extract video ID from URL
  let videoId = '';
  const idMatch = cleanUrl.match(/(?:watch\?v=|shorts\/|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{6,15})/);
  if (idMatch) {
    videoId = idMatch[1];
  }

  let title = isShorts ? 'YouTube Shorts' : 'YouTube Video';
  let channel = 'YouTube Channel';
  let channelUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : cleanUrl;
  let description = '';
  let thumbnail = videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : '';

  // 1. Try official oEmbed API
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`;
    const res = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(6000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.title) title = data.title;
      if (data.author_name) channel = data.author_name;
      if (data.author_url) channelUrl = data.author_url;
      if (data.thumbnail_url && !thumbnail) thumbnail = data.thumbnail_url;
    }
  } catch (e) {
    console.warn('oEmbed fetch warning:', e);
  }

  // 2. Try scraping YouTube Watch page with social bot headers (gets full description & high-res image without bot challenge)
  try {
    const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : cleanUrl;
    const pageRes = await fetch(watchUrl, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: AbortSignal.timeout(6000)
    });
    if (pageRes.ok) {
      const html = await pageRes.text();
      
      // Title
      const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
      if (titleMatch && titleMatch[1]) {
        title = decodeHtmlEntities(titleMatch[1]);
      }

      // Description
      const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/) || html.match(/<meta name="description" content="([^"]+)"/);
      if (descMatch && descMatch[1]) {
        description = decodeHtmlEntities(descMatch[1]);
      }

      // Image
      const imgMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
      if (imgMatch && imgMatch[1]) {
        thumbnail = decodeHtmlEntities(imgMatch[1]);
      }
    }
  } catch (e) {
    console.warn('Social bot scrape warning:', e);
  }

  // If thumbnail is empty, fallback to hqdefault
  if (!thumbnail && videoId) {
    thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }

  const qualityOptions: VideoQualityOption[] = [
    { quality: '2160p', label: '2160p 4K Ultra HD', height: 2160, isHD: true, is4K: true, ext: 'mp4' },
    { quality: '1440p', label: '1440p 2K QHD', height: 1440, isHD: true, ext: 'mp4' },
    { quality: '1080p', label: '1080p Full HD', height: 1080, isHD: true, ext: 'mp4' },
    { quality: '720p',  label: '720p HD', height: 720, isHD: true, ext: 'mp4' },
    { quality: '480p',  label: '480p Standard', height: 480, isHD: false, ext: 'mp4' },
    { quality: '360p',  label: '360p Low', height: 360, isHD: false, ext: 'mp4' },
    { quality: 'audio', label: 'Audio Only (MP3)', isAudioOnly: true, isHD: false, ext: 'mp3' }
  ];

  return {
    id: videoId || 'video',
    url: cleanUrl,
    title,
    description,
    thumbnail,
    channel,
    channelUrl,
    duration: 0,
    durationFormatted: isShorts ? 'Shorts' : 'HD',
    type: isShorts ? 'shorts' : 'video',
    availableQualities: qualityOptions
  };
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

export async function fetchVideoMetadata(cleanUrl: string, isShorts = false): Promise<VideoMetadata> {
  const args = [
    '--dump-json',
    '--no-playlist',
    '--no-warnings',
    '--no-check-certificates',
    '--prefer-free-formats',
    ...getCookieArgs(),
    cleanUrl
  ];

  try {
    const { stdout, stderr } = await execFileAsync(config.ytDlpPath, args, {
      timeout: 25000,
      maxBuffer: 10 * 1024 * 1024 // 10MB JSON buffer
    });

    if (!stdout || !stdout.trim()) {
      throw new Error(`Empty response from yt-dlp: ${stderr || 'No metadata returned'}`);
    }

    // Find the JSON object in stdout (in case yt-dlp outputs deprecation notices or prefix logs)
    const trimmed = stdout.trim();
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error(`Invalid JSON in yt-dlp response: ${stderr || trimmed.slice(0, 200)}`);
    }

    const jsonSubstring = trimmed.slice(firstBrace, lastBrace + 1);

    let raw: YtDlpRawMetadata;
    try {
      raw = JSON.parse(jsonSubstring);
    } catch (parseErr) {
      throw new Error(`Failed to parse yt-dlp metadata JSON: ${(parseErr as Error).message}`);
    }

    if (raw.is_live) {
      throw new Error('Live streams cannot be downloaded.');
    }

    // Best thumbnail selection
    let thumbnail = raw.thumbnail || '';
    if (raw.thumbnails && raw.thumbnails.length > 0) {
      // pick highest resolution thumbnail
      const sorted = [...raw.thumbnails].sort((a, b) => (b.width || 0) * (b.height || 0) - (a.width || 0) * (a.height || 0));
      if (sorted[0] && sorted[0].url) {
        thumbnail = sorted[0].url;
      }
    }

    const duration = raw.duration || 0;
    const rawFormats = raw.formats || [];

    // Analyze available video heights/qualities
    const bestFormatByHeight = new Map<number, YtDlpRawFormat>();

    for (const f of rawFormats) {
      if (f.height && f.height > 0 && f.vcodec && f.vcodec !== 'none') {
        const current = bestFormatByHeight.get(f.height);
        const score = (f.ext === 'mp4' ? 1000000 : 0) + (f.vcodec?.startsWith('avc1') ? 100000 : 0) + (f.acodec === 'none' ? 10000 : 0) + (f.tbr || 0);
        const currentScore = current ? (current.ext === 'mp4' ? 1000000 : 0) + (current.vcodec?.startsWith('avc1') ? 100000 : 0) + (current.acodec === 'none' ? 10000 : 0) + (current.tbr || 0) : -1;
        if (!current || score > currentScore) {
          bestFormatByHeight.set(f.height, f);
        }
      }
    }

    const qualityOptions: VideoQualityOption[] = [];
    const bestAudioFormat = rawFormats
      .filter((format) => format.acodec && format.acodec !== 'none')
      .sort((a, b) => {
        const aAudioOnly = a.vcodec === 'none' ? 1 : 0;
        const bAudioOnly = b.vcodec === 'none' ? 1 : 0;
        return bAudioOnly - aAudioOnly || estimateFormatSize(b, duration) - estimateFormatSize(a, duration);
      })[0];
    for (const [height, format] of [...bestFormatByHeight.entries()].sort(([a], [b]) => b - a)) {
      const size = estimateFormatSize(format, duration) + (format.acodec === 'none' ? estimateFormatSize(bestAudioFormat, duration) : 0);
      qualityOptions.push({
        quality: `${height}p`,
        label: `${height}p${height >= 2160 ? ' 4K Ultra HD' : height >= 1440 ? ' 2K QHD' : height >= 1080 ? ' Full HD' : height >= 720 ? ' HD' : ' Standard'}`,
        height,
        resolution: format.resolution || `${height}p`,
        isHD: height >= 720,
        is4K: height >= 2160,
        isAudioOnly: false,
        ext: 'mp4',
        formatId: format.format_id,
        estimatedSize: size ? `~${formatBytes(size)}` : undefined,
        estimatedSizeBytes: size || undefined
      });
    }

    if (rawFormats.some((format) => format.acodec && format.acodec !== 'none')) {
      qualityOptions.push({ quality: 'audio', label: 'Audio Only (MP3)', isAudioOnly: true, isHD: false, ext: 'mp3' });
    }

    return {
      id: raw.id,
      url: raw.webpage_url || cleanUrl,
      title: raw.title || 'Untitled Video',
      description: raw.description || '',
      thumbnail,
      channel: raw.channel || raw.uploader || 'YouTube Channel',
      channelUrl: raw.channel_url || raw.uploader_url,
      duration,
      durationFormatted: formatDuration(duration),
      uploadDate: raw.upload_date ? `${raw.upload_date.slice(0, 4)}-${raw.upload_date.slice(4, 6)}-${raw.upload_date.slice(6, 8)}` : undefined,
      viewCount: raw.view_count,
      viewCountFormatted: formatViews(raw.view_count),
      type: isShorts ? 'shorts' : 'video',
      availableQualities: qualityOptions
    };
  } catch (error) {
    console.warn(`yt-dlp metadata failed for ${cleanUrl}:`, (error as Error).message);
    throw error;
  }
}
