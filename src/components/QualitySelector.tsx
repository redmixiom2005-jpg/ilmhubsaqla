/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { VideoMetadata, VideoQualityOption } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  Download,
  CheckCircle2,
  Sparkles,
  Music,
  Tv,
  Film,
  HardDrive
} from 'lucide-react';

interface QualitySelectorProps {
  video: VideoMetadata;
  selectedQuality: string;
  onSelectQuality: (quality: string) => void;
  selectedFormat: string;
  onSelectFormat: (format: string) => void;
  onStartDownload: () => void;
  isStarting: boolean;
}

export const QualitySelector: React.FC<QualitySelectorProps> = ({
  video,
  selectedQuality,
  onSelectQuality,
  selectedFormat,
  onSelectFormat,
  onStartDownload,
  isStarting
}) => {
  const { t } = useLanguage();

  const isAudioSelected = selectedQuality === 'audio' || selectedFormat === 'mp3';

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl shadow-blue-500/5 transition-all">
      <div className="flex flex-col gap-5">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t.qualityTitle}
            </h3>
          </div>

          {/* Format selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t.formatTitle}:
            </span>
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  onSelectFormat('mp4');
                  if (selectedQuality === 'audio') {
                    // Pick first non-audio quality
                    const firstVideo = video.availableQualities.find((q) => !q.isAudioOnly);
                    if (firstVideo) onSelectQuality(firstVideo.quality);
                  }
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedFormat === 'mp4'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                MP4 Video
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectFormat('mp3');
                  onSelectQuality('audio');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedFormat === 'mp3'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                MP3 Audio
              </button>
            </div>
          </div>
        </div>

        {/* Quality Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {video.availableQualities.map((opt: VideoQualityOption) => {
            const isSelected = selectedQuality === opt.quality;

            return (
              <button
                key={opt.quality}
                type="button"
                onClick={() => {
                  onSelectQuality(opt.quality);
                  if (opt.isAudioOnly) {
                    onSelectFormat('mp3');
                  } else if (selectedFormat === 'mp3') {
                    onSelectFormat('mp4');
                  }
                }}
                className={`relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 ring-2 ring-blue-600/30 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {opt.isAudioOnly ? (
                      <Music className="w-4 h-4" />
                    ) : opt.is4K ? (
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    ) : (
                      <Tv className="w-4 h-4" />
                    )}
                  </div>

                  {/* Label & Details */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm">{opt.label}</span>
                      {opt.is4K && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-400 text-slate-950 leading-none">
                          4K
                        </span>
                      )}
                      {opt.isHD && !opt.is4K && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white leading-none">
                          HD
                        </span>
                      )}
                    </div>
                    {opt.estimatedSize && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <HardDrive className="w-3 h-3" />
                        <span>{opt.estimatedSize}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Radio selection circle */}
                <div className="flex items-center justify-center">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Start Download Button */}
        <div className="pt-2">
          <button
            type="button"
            id="start-download-button"
            onClick={onStartDownload}
            disabled={isStarting || !selectedQuality}
            className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-base sm:text-lg text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <span>
              {isAudioSelected ? t.audioOnly : `${t.downloadBtn} (${selectedQuality.toUpperCase()})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
