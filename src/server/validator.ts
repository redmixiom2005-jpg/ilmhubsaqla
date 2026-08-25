/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ValidationResult {
  isValid: boolean;
  errorCode?: string;
  errorMessage?: string;
  cleanUrl?: string;
  videoId?: string;
  isShorts?: boolean;
}

export function validateYouTubeUrl(rawUrl: string): ValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return {
      isValid: false,
      errorCode: 'INVALID_URL',
      errorMessage: 'URL cannot be empty'
    };
  }

  const trimmed = rawUrl.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
  } catch {
    return {
      isValid: false,
      errorCode: 'INVALID_URL',
      errorMessage: 'Invalid URL format'
    };
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');

  const isYouTubeHost = [
    'youtube.com',
    'm.youtube.com',
    'music.youtube.com',
    'youtu.be',
    'youtube-nocookie.com'
  ].includes(host);

  if (!isYouTubeHost) {
    return {
      isValid: false,
      errorCode: 'UNSUPPORTED_URL',
      errorMessage: 'Only YouTube videos and YouTube Shorts are supported'
    };
  }

  // Check if it's a playlist URL
  if (parsed.pathname === '/playlist' || (parsed.searchParams.has('list') && !parsed.searchParams.has('v') && !parsed.pathname.includes('/shorts/'))) {
    return {
      isValid: false,
      errorCode: 'PLAYLIST_NOT_SUPPORTED',
      errorMessage: 'Playlist URLs are not supported. Please enter a single YouTube video or Shorts URL.'
    };
  }

  let videoId = '';
  let isShorts = false;

  if (host === 'youtu.be') {
    videoId = parsed.pathname.slice(1).split('/')[0];
  } else if (parsed.pathname.startsWith('/shorts/')) {
    isShorts = true;
    videoId = parsed.pathname.replace('/shorts/', '').split('/')[0];
  } else if (parsed.pathname.startsWith('/watch')) {
    videoId = parsed.searchParams.get('v') || '';
  } else if (parsed.pathname.startsWith('/embed/')) {
    videoId = parsed.pathname.replace('/embed/', '').split('/')[0];
  } else if (parsed.pathname.startsWith('/v/')) {
    videoId = parsed.pathname.replace('/v/', '').split('/')[0];
  }

  // Remove any extra query params attached to videoId
  videoId = videoId.split('?')[0].split('&')[0];

  if (!videoId || videoId.length < 3) {
    return {
      isValid: false,
      errorCode: 'INVALID_URL',
      errorMessage: 'Could not extract valid YouTube video ID from URL'
    };
  }

  // Canonical clean URL
  const cleanUrl = isShorts
    ? `https://www.youtube.com/shorts/${videoId}`
    : `https://www.youtube.com/watch?v=${videoId}`;

  return {
    isValid: true,
    cleanUrl,
    videoId,
    isShorts
  };
}
