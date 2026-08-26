/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { UrlInput } from './components/UrlInput';
import { VideoCard } from './components/VideoCard';
import { QualitySelector } from './components/QualitySelector';
import { DownloadManager } from './components/DownloadManager';
import { DownloadCompleted } from './components/DownloadCompleted';
import { StorageInfo } from './components/StorageInfo';
import { HistoryModal } from './components/HistoryModal';
import { ErrorBanner } from './components/ErrorBanner';
import { Footer } from './components/Footer';
import { api } from './services/api';
import {
  getHistory,
  saveHistoryItem,
  removeHistoryItem,
  clearHistory
} from './services/history';
import {
  ApiError,
  DownloadJob,
  HistoryItem,
  VideoMetadata
} from './types';
import { Shield, Zap, DownloadCloud } from 'lucide-react';

const MainContent: React.FC = () => {
  const { t } = useLanguage();

  // State
  const [url, setUrl] = useState('');
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<string>('720p');
  const [selectedFormat, setSelectedFormat] = useState<string>('mp4');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isStartingDownload, setIsStartingDownload] = useState(false);
  const [activeJob, setActiveJob] = useState<DownloadJob | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>(() => getHistory());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Analyze video handler
  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError({
        code: 'EMPTY_URL',
        message: t.errors.EMPTY_URL
      });
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setVideoMetadata(null);
    setActiveJob(null);

    try {
      const res = await api.analyzeVideo(url.trim());

      if (res.success && res.data) {
        setVideoMetadata(res.data);

        // Pre-select 720p or 1080p if available, otherwise first quality
        const has720 = res.data.availableQualities.find((q) => q.quality === '720p');
        const has1080 = res.data.availableQualities.find((q) => q.quality === '1080p');
        const first = res.data.availableQualities[0];

        if (has720) {
          setSelectedQuality('720p');
        } else if (has1080) {
          setSelectedQuality('1080p');
        } else if (first) {
          setSelectedQuality(first.quality);
        }
        setSelectedFormat('mp4');
      } else {
        setError(
          res.error || {
            code: 'VIDEO_UNAVAILABLE',
            message: 'Failed to analyze video'
          }
        );
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError({
        code: 'NETWORK_ERROR',
        message: errorObj.message || t.errors.NETWORK_ERROR
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Start download handler
  const handleStartDownload = async () => {
    if (!videoMetadata || !selectedQuality) return;

    setError(null);
    setIsStartingDownload(true);

    try {
      const res = await api.createDownload({
        url: videoMetadata.url,
        quality: selectedQuality,
        format: selectedFormat,
        formatId: videoMetadata.availableQualities.find((option) => option.quality === selectedQuality)?.formatId,
        title: videoMetadata.title
      });

      if (res.success && res.data) {
        setActiveJob(res.data);
      } else {
        setError(
          res.error || {
            code: 'DOWNLOAD_FAILED',
            message: 'Failed to start download'
          }
        );
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError({
        code: 'NETWORK_ERROR',
        message: errorObj.message || t.errors.NETWORK_ERROR
      });
    } finally {
      setIsStartingDownload(false);
    }
  };

  // Cancel download handler
  const handleCancelDownload = async (jobId: string) => {
    setIsCancelling(true);
    try {
      await api.cancelDownload(jobId);
      if (activeJob && activeJob.id === jobId) {
        setActiveJob({
          ...activeJob,
          status: 'cancelled'
        });
      }
    } catch (err) {
      console.error('Cancel download error:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  // Polling for active download job progress
  useEffect(() => {
    if (!activeJob) return;

    const isActive = ['queued', 'analyzing', 'downloading', 'processing'].includes(activeJob.status);
    if (!isActive) return;

    const pollJob = async () => {
      try {
        const res = await api.getDownloadProgress(activeJob.id);
        if (res.success && res.data) {
          const updated = res.data;
          setActiveJob(updated);

          // If completed, save to history
          if (updated.status === 'completed') {
            const newHistory = saveHistoryItem({
              jobId: updated.id,
              title: videoMetadata?.title || updated.title,
              thumbnail: videoMetadata?.thumbnail || '',
              channel: videoMetadata?.channel,
              quality: updated.quality,
              format: updated.format,
              duration: videoMetadata?.durationFormatted,
              filename: (updated.filename || 'video.mp4').replace(/^ilmhub_[a-zA-Z0-9_-]+_/, ''),
              downloadUrl: api.getDownloadFileUrl(updated.id),
              fileSize: updated.total
            });
            setHistory(newHistory);
          } else if (updated.status === 'failed') {
            setError({
              code: updated.errorCode || 'DOWNLOAD_FAILED',
              message: updated.error || t.errors.DOWNLOAD_FAILED
            });
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    // Poll every 800ms
    pollTimerRef.current = setInterval(pollJob, 800);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [activeJob?.id, activeJob?.status, videoMetadata, t.errors.DOWNLOAD_FAILED]);

  // Reset to analyze another video
  const handleReset = () => {
    setUrl('');
    setVideoMetadata(null);
    setActiveJob(null);
    setError(null);
  };

  // History item select
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setIsHistoryOpen(false);
  };

  // Clear history handler
  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  // Remove history item handler
  const handleRemoveHistoryItem = (id: string) => {
    const updated = removeHistoryItem(id);
    setHistory(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header Bar */}
      <Header
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6 sm:gap-8">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center gap-3 py-2 sm:py-4">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-2xl leading-tight">
            {t.tagline}
          </h1>
        </div>

        {/* Error Banner */}
        {error && (
          <ErrorBanner
            error={error}
            onDismiss={() => setError(null)}
            onRetry={handleAnalyze}
          />
        )}

        {/* URL Input Box */}
        <UrlInput
          url={url}
          setUrl={setUrl}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          disabled={activeJob !== null && ['queued', 'analyzing', 'downloading', 'processing'].includes(activeJob.status)}
        />

        {/* Active Download Progress */}
        {activeJob && ['queued', 'analyzing', 'downloading', 'processing'].includes(activeJob.status) && (
          <DownloadManager
            job={activeJob}
            onCancel={handleCancelDownload}
            isCancelling={isCancelling}
          />
        )}

        {/* Download Completed View */}
        {activeJob && activeJob.status === 'completed' && (
          <DownloadCompleted job={activeJob} onReset={handleReset} />
        )}

        {/* Video Card and Quality Selector (if analyzed and not in completed state) */}
        {videoMetadata && (!activeJob || activeJob.status === 'cancelled' || activeJob.status === 'failed') && (
          <div className="flex flex-col gap-5">
            <VideoCard video={videoMetadata} />
            <QualitySelector
              video={videoMetadata}
              selectedQuality={selectedQuality}
              onSelectQuality={setSelectedQuality}
              selectedFormat={selectedFormat}
              onSelectFormat={setSelectedFormat}
              onStartDownload={handleStartDownload}
              isStarting={isStartingDownload}
            />
          </div>
        )}

        {/* Storage Destination & Browser Model Info */}
        <StorageInfo />

        {/* Feature Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-sm">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Yuqori tezlik</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">To‘g‘ridan-to‘g‘ri yt-dlp tezligi</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-sm">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Xavfsiz va toza</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Reklamasiz, viruslarsiz</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 shadow-sm">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900 dark:text-white">4K & Full HD</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">FFmpeg yordamida audio+video</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onRemoveItem={handleRemoveHistoryItem}
        onClearHistory={handleClearHistory}
        onSelectVideo={handleSelectHistoryItem}
      />

    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <MainContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
