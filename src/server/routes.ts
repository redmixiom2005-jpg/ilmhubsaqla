/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { config } from './config';
import { checkSystemDependencies, fetchVideoMetadata } from './ytdlp';
import { validateYouTubeUrl } from './validator';
import { jobManager } from './jobManager';

export const apiRouter = Router();

// 1. GET /api/health
apiRouter.get('/health', async (_req: Request, res: Response) => {
  try {
    const health = await checkSystemDependencies();
    res.json({
      success: true,
      service: health.service,
      status: health.status,
      ytDlp: health.ytDlp,
      ytDlpVersion: health.ytDlpVersion,
      ffmpeg: health.ffmpeg,
      ffmpegVersion: health.ffmpegVersion,
      timestamp: health.timestamp
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Health check failed'
      }
    });
  }
});

// 2. POST /api/analyze
apiRouter.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    const validation = validateYouTubeUrl(url);
    if (!validation.isValid || !validation.cleanUrl) {
      res.status(400).json({
        success: false,
        error: {
          code: validation.errorCode || 'INVALID_URL',
          message: validation.errorMessage || 'Invalid YouTube URL provided'
        }
      });
      return;
    }

    const metadata = await fetchVideoMetadata(validation.cleanUrl, validation.isShorts);

    res.json({
      success: true,
      data: metadata
    });
  } catch (err: unknown) {
    const error = err as Error;
    const msg = error.message || '';

    let code = 'INTERNAL_ERROR';
    let userMsg = 'Failed to analyze video';

    if (msg.includes('Private video') || msg.includes('Sign in if you\'ve been granted access')) {
      code = 'PRIVATE_VIDEO';
      userMsg = 'This video is private';
    } else if (msg.includes('Video unavailable') || msg.includes('This video has been removed')) {
      code = 'VIDEO_UNAVAILABLE';
      userMsg = 'This video is unavailable or has been deleted';
    } else if (msg.includes('Live stream')) {
      code = 'UNSUPPORTED_URL';
      userMsg = 'Live streams cannot be downloaded';
    } else if (msg.includes('playlist')) {
      code = 'PLAYLIST_NOT_SUPPORTED';
      userMsg = 'Playlist URLs are not supported';
    } else if (msg.includes('yt-dlp: not found') || msg.includes('ENOENT')) {
      code = 'YTDLP_MISSING';
      userMsg = 'yt-dlp is not available on the server';
    }

    res.status(400).json({
      success: false,
      error: {
        code,
        message: userMsg
      }
    });
  }
});

// 3. POST /api/download
apiRouter.post('/download', async (req: Request, res: Response) => {
  try {
    const { url, quality, format, formatId, title } = req.body;

    const validation = validateYouTubeUrl(url);
    if (!validation.isValid || !validation.cleanUrl) {
      res.status(400).json({
        success: false,
        error: {
          code: validation.errorCode || 'INVALID_URL',
          message: validation.errorMessage || 'Invalid YouTube URL'
        }
      });
      return;
    }

    const job = jobManager.createJob({
      url: validation.cleanUrl,
      quality: quality || '720p',
      format: format || 'mp4',
      formatId: typeof formatId === 'string' && /^[a-zA-Z0-9_.+-]+$/.test(formatId) ? formatId : undefined,
      title: title || 'YouTube Video'
    });

    res.json({
      success: true,
      data: job
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to start download job'
      }
    });
  }
});

// 4. GET /api/download/:jobId/progress & /api/download/:jobId/status
const getJobHandler = (req: Request, res: Response) => {
  const { jobId } = req.params;
  if (!jobId) {
    res.status(400).json({
      success: false,
      error: { code: 'INVALID_JOB_ID', message: 'Job ID is required' }
    });
    return;
  }

  const job = jobManager.getJob(jobId);
  if (!job) {
    res.status(404).json({
      success: false,
      error: { code: 'JOB_NOT_FOUND', message: 'Download job not found' }
    });
    return;
  }

  res.json({
    success: true,
    data: job
  });
};

apiRouter.get('/download/:jobId/progress', getJobHandler);
apiRouter.get('/download/:jobId/status', getJobHandler);

// 5. POST /api/download/:jobId/cancel
apiRouter.post('/download/:jobId/cancel', (req: Request, res: Response) => {
  const { jobId } = req.params;
  if (!jobId) {
    res.status(400).json({
      success: false,
      error: { code: 'INVALID_JOB_ID', message: 'Job ID is required' }
    });
    return;
  }

  const success = jobManager.cancelJob(jobId);
  if (!success) {
    res.status(404).json({
      success: false,
      error: { code: 'JOB_NOT_FOUND', message: 'Download job not found or already ended' }
    });
    return;
  }

  res.json({
    success: true,
    data: { cancelled: true }
  });
});

// 6. GET /api/download/:jobId/file (Streaming download delivery)
apiRouter.get('/download/:jobId/file', (req: Request, res: Response) => {
  const { jobId } = req.params;
  if (!jobId) {
    res.status(400).send('Job ID required');
    return;
  }

  const filePath = jobManager.getFilePathForJob(jobId);
  if (!filePath || !fs.existsSync(filePath)) {
    res.status(404).send('File not found or download is not ready yet');
    return;
  }

  const stat = fs.statSync(filePath);
  const rawFileName = path.basename(filePath);
  // Remove internal prefix like ilmhub_uuid_ from public download name
  const cleanFileName = rawFileName.replace(/^ilmhub_[a-zA-Z0-9_-]+_/, '') || 'video.mp4';
  const encodedName = encodeURIComponent(cleanFileName).replace(/['()]/g, escape).replace(/\*/g, '%2A');

  const ext = path.extname(filePath).toLowerCase();
  let contentType = 'application/octet-stream';
  if (ext === '.mp4') contentType = 'video/mp4';
  else if (ext === '.mp3') contentType = 'audio/mpeg';
  else if (ext === '.m4a') contentType = 'audio/mp4';
  else if (ext === '.webm') contentType = 'video/webm';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': stat.size,
    'Content-Disposition': `attachment; filename="${cleanFileName.replace(/"/g, '')}"; filename*=UTF-8''${encodedName}`,
    'Cache-Control': 'no-cache'
  });

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);

  stream.on('error', (streamErr) => {
    console.error(`Stream error for file ${filePath}:`, streamErr);
    if (!res.headersSent) {
      res.status(500).send('File streaming error');
    }
  });
});

// 7. GET /api/cookies (Check if cookies are loaded)
apiRouter.get('/cookies', (req: Request, res: Response) => {
  const cookiePath = config.getCookieFile();
  const hasCookies = Boolean(cookiePath && fs.existsSync(cookiePath));
  res.json({
    success: true,
    data: {
      hasCookies,
      path: hasCookies ? cookiePath : null
    }
  });
});

// 8. POST /api/cookies (Save cookies.txt)
apiRouter.post('/cookies', (req: Request, res: Response) => {
  try {
    const { cookies } = req.body;
    if (!cookies || typeof cookies !== 'string' || !cookies.trim()) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_COOKIES', message: 'Cookies text content is required' }
      });
      return;
    }

    const targetPath = process.env.NODE_ENV === 'production'
      ? path.join(config.downloadDir, 'cookies.txt')
      : path.resolve(process.cwd(), 'cookies.txt');

    fs.writeFileSync(targetPath, cookies.trim(), 'utf-8');

    res.json({
      success: true,
      data: {
        hasCookies: true,
        path: targetPath,
        message: 'Cookies saved successfully'
      }
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({
      success: false,
      error: { code: 'COOKIE_SAVE_ERROR', message: error.message }
    });
  }
});

// 9. DELETE /api/cookies (Remove cookies.txt)
apiRouter.delete('/cookies', (req: Request, res: Response) => {
  try {
    const cookiePath = config.getCookieFile();
    if (cookiePath && fs.existsSync(cookiePath)) {
      fs.unlinkSync(cookiePath);
    }
    res.json({
      success: true,
      data: { hasCookies: false, message: 'Cookies deleted' }
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({
      success: false,
      error: { code: 'COOKIE_DELETE_ERROR', message: error.message }
    });
  }
});
