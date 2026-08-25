/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DownloadJob } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  Loader2,
  XCircle,
  Zap,
  Clock,
  HardDrive,
  Cpu,
  Layers,
  AlertTriangle
} from 'lucide-react';

interface DownloadManagerProps {
  job: DownloadJob;
  onCancel: (jobId: string) => void;
  isCancelling: boolean;
}

export const DownloadManager: React.FC<DownloadManagerProps> = ({
  job,
  onCancel,
  isCancelling
}) => {
  const { t } = useLanguage();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const getStatusInfo = () => {
    switch (job.status) {
      case 'queued':
        return {
          title: t.queued,
          description: t.queuedNotice,
          color: 'text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
          icon: Layers
        };
      case 'analyzing':
        return {
          title: t.analyzing,
          description: 'Server yt-dlp ma\'lumotlarini tayyorlamoqda...',
          color: 'text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800',
          icon: Loader2
        };
      case 'processing':
        return {
          title: t.processing,
          description: t.mergingAudioVideo,
          color: 'text-indigo-600 dark:text-indigo-400',
          badge: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
          icon: Cpu
        };
      case 'downloading':
      default:
        return {
          title: t.downloading,
          description: `YouTube orqali ${job.quality} sifatda saqlanmoqda`,
          color: 'text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800',
          icon: Loader2
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  const progressPercent = Math.min(100, Math.max(0, Math.round(job.progress * 10) / 10));

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl shadow-blue-500/5 transition-all">
      <div className="flex flex-col gap-5">
        {/* Header & Status row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <StatusIcon className={`w-5 h-5 ${job.status !== 'queued' ? 'animate-spin' : ''}`} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  {statusInfo.title}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.badge}`}>
                  {job.quality.toUpperCase()} • {job.format.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {statusInfo.description}
              </p>
            </div>
          </div>

          {/* Cancel button */}
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            disabled={isCancelling}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 self-start sm:self-auto rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            <span>{isCancelling ? t.cancelling : t.cancelBtn}</span>
          </button>
        </div>

        {/* Video Title */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
          📄 {job.title}
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>{job.status === 'processing' ? t.processing : `${progressPercent}%`}</span>
            <span>{job.status === 'queued' ? t.queued : progressPercent >= 100 ? '100%' : `${progressPercent}%`}</span>
          </div>

          <div className="w-full h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                job.status === 'processing'
                  ? 'w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 animate-pulse'
                  : 'bg-gradient-to-r from-blue-600 to-blue-500'
              }`}
              style={{ width: job.status === 'processing' ? '100%' : `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Real Metrics Grid (Speed, ETA, Downloaded Size) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {/* Speed */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t.speed}</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                {job.speed || '—'}
              </span>
            </div>
          </div>

          {/* ETA */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t.eta}</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                {job.eta || '—'}
              </span>
            </div>
          </div>

          {/* Size */}
          <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t.size}</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                {job.downloaded && job.total
                  ? `${job.downloaded} / ${job.total}`
                  : job.total || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Cancellation Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/60">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  {t.cancelBtn}?
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Hozirgi yuklash to‘xtatiladi va vaqtinchalik fayllar tozalanadi.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.closeBtn}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCancelModal(false);
                    onCancel(job.id);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700"
                >
                  {t.confirmBtn}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
