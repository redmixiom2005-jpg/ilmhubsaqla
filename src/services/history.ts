/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HistoryItem } from '../types';

const HISTORY_STORAGE_KEY = 'ilmhub_download_history';
const MAX_HISTORY_ITEMS = 50;

export const getHistory = (): HistoryItem[] => {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to read download history:', err);
  }
  return [];
};

export const saveHistoryItem = (item: Omit<HistoryItem, 'id' | 'timestamp'> & { id?: string }): HistoryItem[] => {
  try {
    const current = getHistory();
    const newItem: HistoryItem = {
      ...item,
      id: item.id || `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now()
    };

    // Filter out if duplicate job or identical title/quality within short window
    const filtered = current.filter(
      (h) => h.jobId !== newItem.jobId && !(h.title === newItem.title && h.quality === newItem.quality)
    );

    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save history item:', err);
    return getHistory();
  }
};

export const removeHistoryItem = (id: string): HistoryItem[] => {
  try {
    const current = getHistory();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete history item:', err);
    return getHistory();
  }
};

export const clearHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
};
