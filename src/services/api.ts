/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiResponse, DownloadJob, ServerHealth, VideoMetadata } from '../types';

export interface CookieStatus {
  hasCookies: boolean;
  path: string | null;
  message?: string;
}

// Use a relative URL only when the frontend and backend share the same server.
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const getFullUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMs: number = 25000
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const url = getFullUrl(endpoint);
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(options.headers || {})
        }
      });

      clearTimeout(timer);

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return {
          success: false,
          error: {
            code: 'INVALID_BACKEND_RESPONSE',
            message: API_BASE_URL
              ? `Backend returned a non-JSON response (HTTP ${res.status})`
              : 'Backend API URL is not configured. Set VITE_API_URL in the frontend deployment.'
          }
        };
      }

      const json = await res.json();
      return json as ApiResponse<T>;
    } catch (err: unknown) {
      clearTimeout(timer);
      const error = err as Error;

      if (error.name === 'AbortError') {
        return {
          success: false,
          error: {
            code: 'TIMEOUT',
            message: 'Request timed out'
          }
        };
      }

      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error.message || 'Failed to connect to server'
        }
      };
    }
  }

  async healthCheck(): Promise<ApiResponse<ServerHealth>> {
    return this.request<ServerHealth>('/api/health', { method: 'GET' }, 8000);
  }

  async analyzeVideo(url: string): Promise<ApiResponse<VideoMetadata>> {
    return this.request<VideoMetadata>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ url })
    }, 45000); // 45s for yt-dlp metadata extraction
  }

  async createDownload(params: {
    url: string;
    quality: string;
    format: string;
    formatId?: string;
    title?: string;
  }): Promise<ApiResponse<DownloadJob>> {
    return this.request<DownloadJob>('/api/download', {
      method: 'POST',
      body: JSON.stringify(params)
    }, 20000);
  }

  async getDownloadProgress(jobId: string): Promise<ApiResponse<DownloadJob>> {
    return this.request<DownloadJob>(`/api/download/${encodeURIComponent(jobId)}/progress`, {
      method: 'GET'
    }, 10000);
  }

  async getDownloadStatus(jobId: string): Promise<ApiResponse<DownloadJob>> {
    return this.request<DownloadJob>(`/api/download/${encodeURIComponent(jobId)}/status`, {
      method: 'GET'
    }, 10000);
  }

  async getCookieStatus(): Promise<ApiResponse<CookieStatus>> {
    return this.request<CookieStatus>('/api/cookies', { method: 'GET' }, 10000);
  }

  async saveCookies(cookies: string): Promise<ApiResponse<CookieStatus>> {
    return this.request<CookieStatus>('/api/cookies', {
      method: 'POST',
      body: JSON.stringify({ cookies })
    }, 10000);
  }

  async deleteCookies(): Promise<ApiResponse<CookieStatus>> {
    return this.request<CookieStatus>('/api/cookies', { method: 'DELETE' }, 10000);
  }

  async cancelDownload(jobId: string): Promise<ApiResponse<{ cancelled: boolean }>> {
    return this.request<{ cancelled: boolean }>(`/api/download/${encodeURIComponent(jobId)}/cancel`, {
      method: 'POST'
    }, 10000);
  }

  getDownloadFileUrl(jobId: string): string {
    return getFullUrl(`/api/download/${encodeURIComponent(jobId)}/file`);
  }

  getBaseUrl(): string {
    return API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  }
}

export const api = new ApiClient();
