/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Link2,
  Clipboard,
  X,
  Search,
  Loader2,
  Video,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface UrlInputProps {
  url: string;
  setUrl: (url: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  disabled?: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({
  url,
  setUrl,
  onAnalyze,
  isAnalyzing,
  disabled
}) => {
  const { t } = useLanguage();
  const [pasteNotice, setPasteNotice] = useState(false);

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text.trim());
          setPasteNotice(true);
          setTimeout(() => setPasteNotice(false), 2000);
        }
      }
    } catch {
      // ignore clipboard permission rejection
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isAnalyzing && url.trim()) {
      onAnalyze();
    }
  };

  const isShorts = url.toLowerCase().includes('/shorts/');
  const isYouTube =
    url.toLowerCase().includes('youtube.com') || url.toLowerCase().includes('youtu.be');

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-3 sm:p-5 shadow-xl shadow-blue-500/5 transition-all">
      <div className="flex flex-col gap-3">
        {/* Input Bar */}
        <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1 flex items-center">
            <div className="absolute left-4 pointer-events-none text-slate-400">
              {isShorts ? (
                <Sparkles className="w-5 h-5 text-amber-500" />
              ) : isYouTube ? (
                <Video className="w-5 h-5 text-red-500" />
              ) : (
                <Link2 className="w-5 h-5" />
              )}
            </div>

            <input
              type="text"
              id="youtube-url-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled || isAnalyzing}
              placeholder={t.inputPlaceholder}
              aria-label={t.inputPlaceholder}
              className="w-full pl-12 pr-20 py-3.5 sm:py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            />

            {/* Quick Action inside Input: Clear or Paste */}
            <div className="absolute right-3 flex items-center gap-1">
              {url ? (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                  title={t.clearBtn}
                  aria-label={t.clearBtn}
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePaste}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors border border-blue-200/60 dark:border-blue-800/60"
                  title={t.pasteBtn}
                  aria-label={t.pasteBtn}
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{pasteNotice ? t.copied : t.pasteBtn}</span>
                </button>
              )}
            </div>
          </div>

          {/* Primary Analyze Button */}
          <button
            type="button"
            id="analyze-submit-button"
            onClick={onAnalyze}
            disabled={!url.trim() || isAnalyzing || disabled}
            className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 transition-all"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t.analyzing}</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>{t.analyzeBtn}</span>
              </>
            )}
          </button>
        </div>

        {/* Input Helper info */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            {isShorts && (
              <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                {t.youtubeShorts}
              </span>
            )}
            {isYouTube && !isShorts && (
              <span className="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                <Video className="w-3.5 h-3.5" />
                {t.youtubeVideo}
              </span>
            )}
            {!url && (
              <span className="flex items-center gap-1.5 opacity-80">
                <AlertCircle className="w-3.5 h-3.5" />
                {t.supportedFormats}
              </span>
            )}
          </div>

          {/* Example shortcut helper */}
          {!url && (
            <div className="hidden sm:flex items-center gap-2">
              <span>Masalan:</span>
              <button
                type="button"
                onClick={() => setUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                youtu.be/...
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
