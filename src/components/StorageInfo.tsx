/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Folder, HardDrive, ShieldCheck, ArrowDownToLine } from 'lucide-react';

export const StorageInfo: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full bg-blue-50/50 dark:bg-slate-900/50 border border-blue-100 dark:border-slate-800 rounded-3xl p-4 sm:p-5 transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
            <Folder className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                {t.storageTitle}
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Yuklashlar (Downloads)</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              {t.storageDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-blue-500" />
            <span>MP4 / MP3</span>
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tezkor oqim</span>
          </span>
        </div>
      </div>
    </div>
  );
};
