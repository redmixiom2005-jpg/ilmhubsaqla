/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'uz' | 'ru' | 'en' | 'krill';
export type Theme = 'light' | 'dark';

export type DownloadJobStatus =
  | 'queued'
  | 'analyzing'
  | 'downloading'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface VideoQualityOption {
  quality: string;           // e.g. "1080p", "720p", "480p", "360p", "audio"
  label: string;             // e.g. "1080p Full HD", "720p HD", "Audio (MP3)"
  resolution?: string;       // e.g. "1920x1080"
  height?: number;           // e.g. 1080
  estimatedSize?: string;    // e.g. "~45 MB"
  isHD?: boolean;
  is4K?: boolean;
  isAudioOnly?: boolean;
  ext: 'mp4' | 'mp3' | 'm4a' | 'webm';
  formatId?: string;
}

export interface VideoMetadata {
  id: string;
  url: string;
  title: string;
  description: string;
  thumbnail: string;
  channel: string;
  channelUrl?: string;
  duration: number;          // in seconds
  durationFormatted: string; // e.g. "12:34"
  uploadDate?: string;
  viewCount?: number;
  viewCountFormatted?: string;
  type: 'video' | 'shorts';
  availableQualities: VideoQualityOption[];
}

export interface DownloadJob {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  quality: string;
  format: string;
  formatId?: string;
  status: DownloadJobStatus;
  progress: number;          // 0 to 100
  speed?: string;            // e.g. "4.2 MB/s"
  eta?: string;              // e.g. "00:15"
  downloaded?: string;       // e.g. "18.4 MB"
  total?: string;            // e.g. "45.2 MB"
  filename?: string;
  downloadUrl?: string;
  error?: string;
  errorCode?: string;
  createdAt: number;
  updatedAt: number;
}

export interface HistoryItem {
  id: string;
  jobId?: string;
  title: string;
  thumbnail: string;
  channel?: string;
  quality: string;
  format: string;
  duration?: string;
  filename: string;
  timestamp: number;
  downloadUrl?: string;
  fileSize?: string;
}

export interface ServerHealth {
  success: boolean;
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  ytDlp: boolean;
  ytDlpVersion?: string;
  ffmpeg: boolean;
  ffmpegVersion?: string;
  timestamp: string;
}

export type ApiErrorCode =
  | 'INVALID_URL'
  | 'UNSUPPORTED_URL'
  | 'PLAYLIST_NOT_SUPPORTED'
  | 'VIDEO_UNAVAILABLE'
  | 'PRIVATE_VIDEO'
  | 'FORMAT_UNAVAILABLE'
  | 'DOWNLOAD_FAILED'
  | 'FFMPEG_MISSING'
  | 'YTDLP_MISSING'
  | 'RATE_LIMITED'
  | 'JOB_NOT_FOUND'
  | 'DOWNLOAD_CANCELLED'
  | 'INTERNAL_ERROR';

export interface ApiError {
  code: ApiErrorCode | string;
  message: string;
  details?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
