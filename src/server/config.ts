/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import path from 'path';
import fs from 'fs';
import os from 'os';
import dotenv from 'dotenv';

dotenv.config();

// Find yt-dlp binary
const findYtDlp = (): string => {
  if (process.env.YTDLP_PATH && fs.existsSync(process.env.YTDLP_PATH)) {
    return process.env.YTDLP_PATH;
  }
  const localBin = path.join(process.cwd(), 'bin', 'yt-dlp');
  if (fs.existsSync(localBin)) {
    return localBin;
  }
  const usrLocalBin = '/usr/local/bin/yt-dlp';
  if (fs.existsSync(usrLocalBin)) {
    return usrLocalBin;
  }
  return 'yt-dlp';
};

// Find ffmpeg binary
const findFfmpeg = (): string => {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH;
  }
  const usrBinFfmpeg = '/usr/bin/ffmpeg';
  if (fs.existsSync(usrBinFfmpeg)) {
    return usrBinFfmpeg;
  }
  return 'ffmpeg';
};

const getDownloadDir = (): string => {
  if (process.env.NODE_ENV === 'production') {
    return '/tmp/ilmhub-saqla';
  }
  if (process.env.DOWNLOAD_DIR) {
    return path.resolve(process.env.DOWNLOAD_DIR);
  }
  return path.resolve(process.cwd(), './downloads');
};

const getCookieFile = (): string | null => {
  if (process.env.COOKIES_FILE && fs.existsSync(process.env.COOKIES_FILE)) {
    return path.resolve(process.env.COOKIES_FILE);
  }
  if (process.env.YTDLP_COOKIES) {
    const tmpCookie = path.join(os.tmpdir(), 'ilmhub_cookies.txt');
    try {
      fs.writeFileSync(tmpCookie, process.env.YTDLP_COOKIES, 'utf-8');
      return tmpCookie;
    } catch (err) {
      console.warn('Could not write YTDLP_COOKIES to /tmp:', err);
    }
  }
  const localCookie = path.resolve(process.cwd(), 'cookies.txt');
  if (fs.existsSync(localCookie)) {
    return localCookie;
  }
  const tmpCookie = path.join(os.tmpdir(), 'cookies.txt');
  if (fs.existsSync(tmpCookie)) {
    return tmpCookie;
  }
  return null;
};

export const config = {
  port: parseInt(process.env.PORT || '8080', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || '',
  downloadDir: getDownloadDir(),
  maxConcurrentDownloads: parseInt(process.env.MAX_CONCURRENT_DOWNLOADS || '2', 10),
  downloadTimeoutMs: parseInt(process.env.DOWNLOAD_TIMEOUT_MS || String(30 * 60 * 1000), 10),
  retentionHours: parseInt(process.env.DOWNLOAD_RETENTION_HOURS || '24', 10),
  ytDlpPath: findYtDlp(),
  ffmpegPath: findFfmpeg(),
  getCookieFile
};

// Ensure download directory exists
if (!fs.existsSync(config.downloadDir)) {
  try {
    fs.mkdirSync(config.downloadDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create downloads directory:', err);
  }
}
