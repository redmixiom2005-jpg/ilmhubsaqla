/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  History,
  Trash2,
  Download,
  AlertTriangle,
  Clock,
  HardDrive,
  FileVideo
} from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onRemoveItem: (id: string) => void;
  onClearHistory: () => void;
  onSelectVideo: (item: HistoryItem) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onRemoveItem,
  onClearHistory,
  onSelectVideo
}) => {
  const { t } = useLanguage();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[85vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                {t.historyTitle}
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {history.length} ta saqlangan yuklash
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.clearHistory}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={t.closeBtn}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3">
          {history.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3 text-slate-400 dark:text-slate-500">
              <History className="w-12 h-12 stroke-[1.5]" />
              <p className="text-sm font-medium">{t.emptyHistory}</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/80 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Thumbnail / Icon */}
                  <div className="relative w-16 h-11 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <FileVideo className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  {/* Title & metadata */}
                  <div className="flex flex-col min-w-0">
                    <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                        {item.quality.toUpperCase()}
                      </span>
                      <span>{item.format.toUpperCase()}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(item.timestamp)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                  {item.downloadUrl && (
                    <a
                      href={item.downloadUrl}
                      download={item.filename}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                      title={t.saveFileBtn}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t.saveFileBtn}</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="O‘chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Clear Confirmation Dialog */}
        {showClearConfirm && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border-t border-rose-200 dark:border-rose-900 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{t.clearHistoryConfirmMsg}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                {t.closeBtn}
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearHistory();
                  setShowClearConfirm(false);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700"
              >
                {t.confirmBtn}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
