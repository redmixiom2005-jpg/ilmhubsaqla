/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Language } from '../types';
import {
  Sun,
  Moon,
  History,
  Globe,
  Check,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  historyCount: number;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  historyCount,
  onOpenHistory
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'uz', label: t.langUz, flag: '🇺🇿' },
    { code: 'ru', label: t.langRu, flag: '🇷🇺' },
    { code: 'en', label: t.langEn, flag: '🇬🇧' },
    { code: 'krill', label: t.langKrill, flag: '🟦' }
  ];

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0 w-11 h-11 rounded-2xl overflow-hidden shadow-md shadow-blue-500/10 border border-blue-600/20 bg-blue-600 flex items-center justify-center">
            <img
              src="/logo.svg"
              alt="IlmHub Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                // fallback to PNG if SVG fails
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white truncate">
                {t.appName}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls: History, Language, Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="relative inline-flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            title={t.historyTitle}
            aria-label={t.historyTitle}
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline ml-1.5 text-xs font-medium">
              {t.historyTitle}
            </span>
            {historyCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-600 text-white leading-none">
                {historyCount}
              </span>
            )}
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="inline-flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-xs font-medium"
              aria-expanded={langMenuOpen}
              aria-label="Select language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentLangObj.flag}</span>
              <span className="hidden sm:inline">{currentLangObj.label}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setLangMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/10 z-50 p-1 py-1.5">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        language === l.code
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                      {language === l.code && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            title={theme === 'dark' ? t.themeLight : t.themeDark}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
