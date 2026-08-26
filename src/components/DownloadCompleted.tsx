/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DownloadJob } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  CheckCircle2,
  Download,
  FolderDown,
  RotateCcw,
  Copy,
  Check,
  FileVideo,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface DownloadCompletedProps {
  job: DownloadJob;
  onReset: () => void;
}

export const DownloadCompleted: React.FC<DownloadCompletedProps> = ({
  job,
  onReset
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [isSavingDirectory, setIsSavingDirectory] = useState(false);
  const [directorySaved, setDirectorySaved] = useState(false);

  const isIOS = typeof navigator !== 'undefined' && (
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );

  const fileUrl = api.getDownloadFileUrl(job.id);
  const cleanFilename = (job.filename || 'video.mp4').replace(/^ilmhub_[a-zA-Z0-9_-]+_/, '');

  const handleCopyLink = () => {
    try {
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${window.location.origin}${fileUrl}`;
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownload = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isIOS) return;

    event.preventDefault();
    const opened = window.open(fileUrl, '_blank', 'noopener,noreferrer');
    if (!opened) {
      window.location.assign(fileUrl);
    }
  };

  // Optional File System Access API for modern browsers (Chrome/Edge/Desktop)
  const handleSaveToDirectory = async () => {
    // Check if showDirectoryPicker is supported
    if ('showDirectoryPicker' in window) {
      try {
        setIsSavingDirectory(true);
        // @ts-expect-error window.showDirectoryPicker is experimental standard
        const dirHandle = await window.showDirectoryPicker();
        const fileHandle = await dirHandle.getFileHandle(cleanFilename, { create: true });
        const writable = await fileHandle.createWritable();

        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error('Failed to fetch file stream');

        if (res.body) {
          await res.body.pipeTo(writable);
        } else {
          const blob = await res.blob();
          await writable.write(blob);
          await writable.close();
        }

        setDirectorySaved(true);
        setTimeout(() => setDirectorySaved(false), 3000);
      } catch (err: unknown) {
        const error = err as Error;
        if (error.name !== 'AbortError') {
          console.warn('Folder save fallback to normal download:', err);
          // Fallback to normal download
          window.location.href = fileUrl;
        }
      } finally {
        setIsSavingDirectory(false);
      }
    } else {
      // Standard browser download trigger
      window.location.href = fileUrl;
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/60 rounded-3xl p-5 sm:p-7 shadow-xl shadow-emerald-500/5 transition-all">
      <div className="flex flex-col items-center text-center gap-5">
        {/* Celebration Icon */}
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-600/10">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div className="absolute -top-1 -right-1 p-1 rounded-full bg-amber-400 text-slate-950 shadow-sm animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Header Text */}
        <div className="flex flex-col gap-1 max-w-lg">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {t.completedTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t.completedDesc}
          </p>
        </div>

        {/* File Details Box */}
        <div className="w-full max-w-md p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center gap-3 text-left">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
            <FileVideo className="w-6 h-6" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
              {cleanFilename}
            </span>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                {job.quality.toUpperCase()}
              </span>
              <span>•</span>
              <span>{job.format.toUpperCase()}</span>
              {job.total && (
                <>
                  <span>•</span>
                  <span>{t.actualSize}: {job.filesize || job.total}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {isIOS && (
          <div className="w-full max-w-md rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-3 text-left text-xs text-blue-800 dark:text-blue-200">
            <p className="font-bold">{t.iosTitle}</p>
            <p className="mt-1 leading-relaxed">{t.iosDownloadHint}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full max-w-md flex flex-col gap-2.5 pt-1">
          {/* Main Direct Download button */}
          <a
            href={fileUrl}
            onClick={handleDownload}
            id="download-file-button"
            className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-base sm:text-lg text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <span>{t.saveFileBtn}</span>
          </a>

          {/* Secondary Actions Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {!isIOS && (
              <button
                type="button"
                onClick={handleSaveToDirectory}
                disabled={isSavingDirectory}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors"
              >
                <FolderDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{directorySaved ? t.copied : isSavingDirectory ? t.processing : t.saveToFolderBtn}</span>
              </button>
            )}

            {/* Copy direct link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? t.copied : t.copyLink}</span>
            </button>
          </div>

          {/* Another video button */}
          <button
            type="button"
            onClick={onReset}
            className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.anotherVideoBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
