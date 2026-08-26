/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ApiError } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  error: ApiError | null;
  onDismiss: () => void;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  error,
  onDismiss,
  onRetry
}) => {
  const { t } = useLanguage();

  if (!error) return null;

  // Retrieve translated message by code or fallback
  const errorCode = error.code as keyof typeof t.errors;
  const localizedMsg = t.errors[errorCode] || error.message || t.errors.INTERNAL_ERROR;

  return (
    <div className="w-full rounded-3xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/80 p-4 sm:p-5 shadow-lg shadow-rose-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-start gap-3 min-w-0">
        <div className="p-2 rounded-2xl bg-rose-100 dark:bg-rose-900/80 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5 sm:mt-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-rose-900 dark:text-rose-200">
              {t.errorTitle}
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed break-words">
            {localizedMsg}
          </p>
          {error.details && error.details !== localizedMsg && (
            <span className="text-[11px] text-rose-500 dark:text-rose-400 font-mono mt-1 truncate">
              {error.details}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 flex-wrap">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Qayta urinish</span>
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 dark:hover:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
          aria-label={t.closeBtn}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
