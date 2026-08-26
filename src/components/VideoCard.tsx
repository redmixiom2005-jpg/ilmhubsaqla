/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VideoMetadata } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  Clock,
  Eye,
  Calendar,
  User,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Video as VideoIcon,
  ImageOff,
  Copy,
  Check,
  Maximize2
} from 'lucide-react';

interface VideoCardProps {
  video: VideoMetadata;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const { t } = useLanguage();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const handleCopyDesc = () => {
    if (!video.description) return;
    navigator.clipboard.writeText(video.description);
    setCopiedDesc(true);
    setTimeout(() => setCopiedDesc(false), 2000);
  };

  return (
    <>
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl shadow-blue-500/5 transition-all">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Left Column: Thumbnail (12 on mobile, 5 on desktop) */}
          <div className="lg:col-span-5 flex flex-col gap-2">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-inner group">
              {/* Shimmer Skeleton while loading */}
              {!imgLoaded && !imgError && (
                <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse flex items-center justify-center">
                  <VideoIcon className="w-10 h-10 text-slate-300 dark:text-slate-700 animate-bounce" />
                </div>
              )}

              {/* Thumbnail Image */}
              {!imgError ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onLoad={() => setImgLoaded(true)}
                  onError={() => {
                    setImgError(true);
                    setImgLoaded(true);
                  }}
                  className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                    imgLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                  <ImageOff className="w-8 h-8" />
                  <span className="text-xs font-medium">Thumbnail unavailable</span>
                </div>
              )}

              {/* Zoom image button */}
              {imgLoaded && !imgError && (
                <button
                  type="button"
                  onClick={() => setShowFullImage(true)}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  title="Rasmni to‘liq ko‘rish"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Duration Badge */}
              {video.durationFormatted && (
                <div className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>{video.durationFormatted}</span>
                </div>
              )}

              {/* Type Badge */}
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-blue-600/90 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1 shadow-md">
                {video.type === 'shorts' ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{t.youtubeShorts}</span>
                  </>
                ) : (
                  <>
                    <VideoIcon className="w-3.5 h-3.5" />
                    <span>{t.youtubeVideo}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Metadata Details (12 on mobile, 7 on desktop) */}
          <div className="lg:col-span-7 flex flex-col gap-3 min-w-0">
            {/* Title */}
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white leading-snug break-words">
              {video.title}
            </h2>

            {/* Channel & Meta Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {/* Channel info */}
              <div className="flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                <User className="w-4 h-4 flex-shrink-0" />
                {video.channelUrl ? (
                  <a
                    href={video.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1 truncate max-w-[200px]"
                  >
                    <span className="truncate">{video.channel}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                ) : (
                  <span className="truncate max-w-[200px]">{video.channel}</span>
                )}
              </div>

              {/* Views count */}
              {video.viewCountFormatted && (
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Eye className="w-4 h-4 flex-shrink-0" />
                  <span>{video.viewCountFormatted} {t.views.toLowerCase()}</span>
                </div>
              )}

              {/* Published date */}
              {video.uploadDate && (
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>{video.uploadDate}</span>
                </div>
              )}
            </div>

            {/* Video Description (Full & Multi-line collapsible) */}
            {video.description ? (
              <div className="mt-1 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Tavsif (Description)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyDesc}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {copiedDesc ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedDesc ? 'Nusxalandi' : 'Nusxalash'}</span>
                  </button>
                </div>
                <div
                  className={`text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line break-words ${
                    !showDesc ? 'line-clamp-3' : 'max-h-80 overflow-y-auto pr-1'
                  }`}
                >
                  {video.description}
                </div>
                {video.description.length > 150 && (
                  <button
                    onClick={() => setShowDesc(!showDesc)}
                    className="self-start inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-1"
                  >
                    <span>{showDesc ? t.hideDescription : t.showDescription}</span>
                    {showDesc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Full Thumbnail Modal */}
      {showFullImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
            />
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/70 hover:bg-black text-white"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
