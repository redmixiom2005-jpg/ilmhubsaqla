/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ServerHealth } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  Activity,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Server,
  Terminal,
  Cpu,
  FolderCheck,
  RefreshCw,
  Cookie,
  KeyRound,
  Trash2,
  Upload
} from 'lucide-react';

interface ServerStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverHealth: ServerHealth | null;
  onRefreshHealth: () => void;
  isChecking: boolean;
}

export const ServerStatusModal: React.FC<ServerStatusModalProps> = ({
  isOpen,
  onClose,
  serverHealth,
  onRefreshHealth,
  isChecking
}) => {
  const { t } = useLanguage();
  const [hasCookies, setHasCookies] = useState<boolean>(false);
  const [cookieInput, setCookieInput] = useState<string>('');
  const [showCookieForm, setShowCookieForm] = useState<boolean>(false);
  const [isSavingCookies, setIsSavingCookies] = useState<boolean>(false);
  const [cookieMsg, setCookieMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkCookieStatus();
    }
  }, [isOpen]);

  const checkCookieStatus = async () => {
    try {
      const res = await fetch('/api/cookies');
      if (res.ok) {
        const json = await res.json();
        setHasCookies(Boolean(json?.data?.hasCookies));
      }
    } catch {
      // ignore
    }
  };

  const handleSaveCookies = async () => {
    if (!cookieInput.trim()) return;
    setIsSavingCookies(true);
    setCookieMsg(null);
    try {
      const res = await fetch('/api/cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookies: cookieInput.trim() })
      });
      const json = await res.json();
      if (json.success) {
        setHasCookies(true);
        setCookieInput('');
        setShowCookieForm(false);
        setCookieMsg({ type: 'success', text: 'Cookies muvaffaqiyatli saqlandi!' });
      } else {
        setCookieMsg({ type: 'error', text: json.error?.message || 'Xatolik yuz berdi' });
      }
    } catch (e) {
      setCookieMsg({ type: 'error', text: (e as Error).message });
    } finally {
      setIsSavingCookies(false);
    }
  };

  const handleDeleteCookies = async () => {
    try {
      await fetch('/api/cookies', { method: 'DELETE' });
      setHasCookies(false);
      setCookieMsg({ type: 'success', text: 'Cookies o‘chirildi' });
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                {t.serverStatus}
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                IlmHub Downloader Server Diagnostics
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onRefreshHealth}
              disabled={isChecking}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Qayta tekshirish"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            </button>
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

        {/* Content */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Status Row */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
                <Server className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Service</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {serverHealth?.service || 'IlmHub Saqla Bot'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {serverHealth?.status === 'healthy' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.serverHealthy}</span>
                </span>
              ) : serverHealth?.status === 'degraded' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{t.serverDegraded}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{t.serverOffline}</span>
                </span>
              )}
            </div>
          </div>

          {/* Subsystem checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* yt-dlp */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">yt-dlp</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {serverHealth?.ytDlpVersion ? `v${serverHealth.ytDlpVersion}` : 'Downloader Engine'}
                  </span>
                </div>
              </div>
              {serverHealth?.ytDlp ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600" />
              )}
            </div>

            {/* FFmpeg */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">FFmpeg</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {serverHealth?.ffmpegVersion ? `v${serverHealth.ffmpegVersion}` : 'Audio/Video Merger'}
                  </span>
                </div>
              </div>
              {serverHealth?.ffmpeg ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600" />
              )}
            </div>

            {/* YouTube Cookies Status */}
            <div className="col-span-1 sm:col-span-2 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Cookie className="w-4 h-4 text-amber-500" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">YouTube Cookies (Anti-Bot)</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {hasCookies ? 'Faol (cookies.txt mavjud)' : 'Mavjud emas (Sign in required holati yuz bersa kerak)'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasCookies ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <button
                      type="button"
                      onClick={handleDeleteCookies}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title="Cookiesni o‘chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCookieForm(!showCookieForm)}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300"
                  >
                    {showCookieForm ? 'Yopish' : '+ Cookie qo‘shish'}
                  </button>
                )}
              </div>
            </div>

            {/* Cookies Input Form */}
            {showCookieForm && (
              <div className="col-span-1 sm:col-span-2 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>YouTube cookies.txt matnini kiriting:</span>
                </div>
                <textarea
                  value={cookieInput}
                  onChange={(e) => setCookieInput(e.target.value)}
                  placeholder="# Netscape HTTP Cookie File&#10;.youtube.com TRUE / TRUE 1750000000 ..."
                  rows={4}
                  className="w-full text-xs font-mono p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Get cookies.txt / Cookie-Editor kengaytmasi orqali eksport qiling
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveCookies}
                    disabled={isSavingCookies || !cookieInput.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {isSavingCookies ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                </div>
              </div>
            )}

            {cookieMsg && (
              <div
                className={`col-span-1 sm:col-span-2 p-2.5 rounded-xl text-xs font-medium ${
                  cookieMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                {cookieMsg.text}
              </div>
            )}

            {/* Downloads Directory */}
            <div className="col-span-1 sm:col-span-2 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FolderCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Downloads Directory</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Auto-cleanup: 24h retention
                  </span>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
