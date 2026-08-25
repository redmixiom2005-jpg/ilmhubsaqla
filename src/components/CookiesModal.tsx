/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Cookie,
  X,
  CheckCircle2,
  AlertTriangle,
  Upload,
  FileText,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Info,
  KeyRound,
  RefreshCw
} from 'lucide-react';

interface CookiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCookiesUpdated?: () => void;
}

export const CookiesModal: React.FC<CookiesModalProps> = ({
  isOpen,
  onClose,
  onCookiesUpdated
}) => {
  const { t } = useLanguage();
  const [hasCookies, setHasCookies] = useState<boolean>(false);
  const [cookiePath, setCookiePath] = useState<string | null>(null);
  const [cookieText, setCookieText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cookies');
      if (res.ok) {
        const json = await res.json();
        setHasCookies(Boolean(json?.data?.hasCookies));
        setCookiePath(json?.data?.path || null);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
      setMessage(null);
    }
  }, [isOpen]);

  const handleSave = async (rawCookies: string) => {
    if (!rawCookies || !rawCookies.trim()) {
      setMessage({ type: 'error', text: 'Cookies matni bo‘sh bo‘lishi mumkin emas' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookies: rawCookies.trim() })
      });
      const json = await res.json();
      if (json.success) {
        setHasCookies(true);
        setCookieText('');
        setMessage({ type: 'success', text: 'Cookies muvaffaqiyatli saqlandi! Endi videolarni erkin yuklab olishingiz mumkin.' });
        if (onCookiesUpdated) onCookiesUpdated();
      } else {
        setMessage({ type: 'error', text: json.error?.message || 'Xatolik yuz berdi' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/cookies', { method: 'DELETE' });
      if (res.ok) {
        setHasCookies(false);
        setCookiePath(null);
        setMessage({ type: 'success', text: 'Cookies o‘chirildi' });
        if (onCookiesUpdated) onCookiesUpdated();
      }
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setCookieText(content);
        handleSave(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
              <Cookie className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                YouTube Cookies (Anti-Bot)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                YouTube bot himoyasini chetlab o‘tish va yuqori tezlikda yuklash
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Status Box */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${hasCookies ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'}`}>
                {hasCookies ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Hozirgi holat</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {hasCookies ? 'Cookies Faol (Yuklashga tayyor)' : 'Cookies kiritilmagan'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={checkStatus}
                disabled={isLoading}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Tekshirish"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              {hasCookies && (
                <button
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>O‘chirish</span>
                </button>
              )}
            </div>
          </div>

          {/* Feedback Message */}
          {message && (
            <div
              className={`p-3 rounded-2xl text-xs font-medium flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {message.type === 'success' ? <ShieldCheck className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Drag & Drop or File Upload */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-800/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  cookies.txt faylini yuklang yoki shu yerga tashlang
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Faylni tanlash uchun bosing (.txt format)
                </p>
              </div>
            </div>
          </div>

          {/* Textarea Paste */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Yoki cookies matnini to‘g‘ridan-to‘g‘ri nusxalang (paste):</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Netscape formati</span>
            </label>
            <textarea
              value={cookieText}
              onChange={(e) => setCookieText(e.target.value)}
              placeholder="# Netscape HTTP Cookie File&#10;# https://curl.haxx.se/rfc/cookie_spec.html&#10;.youtube.com	TRUE	/	TRUE	1790000000	SID	..."
              rows={4}
              className="w-full text-xs font-mono p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Yopish
            </button>
            <button
              type="button"
              onClick={() => handleSave(cookieText)}
              disabled={isSaving || !cookieText.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saqlanmoqda...' : 'Cookiesni Saqlash'}</span>
            </button>
          </div>

          {/* 3-Step Guide */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex flex-col gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>Cookies.txt faylini 1 daqiqada qanday olish mumkin?</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-200/90 pl-1">
              <li>
                Brauzeringizga (Chrome / Edge / Firefox) bepul <strong className="font-semibold">"Get cookies.txt LOCALLY"</strong> yoki <strong className="font-semibold">"Cookie-Editor"</strong> kengaytmasini o‘rnating.
              </li>
              <li>
                <strong className="font-semibold">youtube.com</strong> sahifasiga kiring va kengaytma tugmasini bosing.
              </li>
              <li>
                <strong className="font-semibold">"Export"</strong> yoki <strong className="font-semibold">"Copy / Export as Netscape"</strong> tugmasini bosing va faylni yuklang yoki matnni yuqoriga qo‘ying.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
