/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { config } from './src/server/config';
import { apiRouter } from './src/server/routes';
import { checkSystemDependencies } from './src/server/ytdlp';

async function startServer() {
  const app = express();
  const requestWindows = new Map<string, { startedAt: number; count: number }>();

  // CORS configuration
  const allowedOrigins = config.frontendUrl
    ? config.frontendUrl.split(',').map((u) => u.trim()).filter(Boolean)
    : [];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl or same-origin)
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        // In development allow localhosts
        if (config.nodeEnv !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Origin not allowed'));
      },
      credentials: true
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use('/api', (req, res, next) => {
    if (req.path === '/health') {
      next();
      return;
    }
    const key = req.ip || 'unknown';
    const now = Date.now();
    const window = requestWindows.get(key);
    if (!window || now - window.startedAt >= 60_000) {
      requestWindows.set(key, { startedAt: now, count: 1 });
      next();
      return;
    }
    if (window.count >= 30) {
      res.status(429).json({
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' }
      });
      return;
    }
    window.count += 1;
    next();
  });

  // Mount API router FIRST
  app.use('/api', apiRouter);

  // Vite middleware in development vs Static files in production
  if (config.nodeEnv !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(config.port, '0.0.0.0', async () => {
    const health = await checkSystemDependencies();

    const ytStatus = health.ytDlp ? 'AVAILABLE ✓' : 'MISSING ✗';
    const ffmpegStatus = health.ffmpeg ? 'AVAILABLE ✓' : 'MISSING ✗';
    const downloadsStatus = fs.existsSync(config.downloadDir) ? 'READY ✓' : 'ERROR ✗';

    console.log(`
╔══════════════════════════════════════════╗
║       ILMHUB SAQLA BOT BACKEND           ║
╠══════════════════════════════════════════╣
║ Server:       RUNNING                    ║
║ Port:         ${String(config.port).padEnd(27)}║
║ yt-dlp:       ${ytStatus.padEnd(27)}║
║ FFmpeg:       ${ffmpegStatus.padEnd(27)}║
║ Downloads:    ${downloadsStatus.padEnd(27)}║
║ Environment:  ${config.nodeEnv.padEnd(27)}║
╚══════════════════════════════════════════╝
    `);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting IlmHub Saqla Bot server:', err);
  process.exit(1);
});
