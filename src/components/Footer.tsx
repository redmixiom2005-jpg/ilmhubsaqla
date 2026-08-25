/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="w-full mt-auto border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm transition-colors py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center gap-6">
        {/* Brand & Slogan */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm border border-blue-600/20 bg-blue-600 flex items-center justify-center">
              <img
                src="/logo.svg"
                alt="IlmHub"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
              {t.appName}
            </span>
          </div>

          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 max-w-md">
            {t.appSlogan}
          </p>
        </div>

        {/* Legal & Usage Notice Box */}
        <div className="w-full max-w-2xl px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span>{t.legalNotice}</span>
        </div>

        {/* Copyright & Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400 dark:text-slate-500">
          <p>© {new Date().getFullYear()} IlmHub Saqla Bot. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-1.5 font-medium">
            <span>Fast, secure & responsive</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-amber-500">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full HD & 4K</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
