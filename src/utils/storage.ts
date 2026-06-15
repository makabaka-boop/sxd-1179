import type { SnackPackRecord } from '../types';

const STORAGE_KEY = 'snack_pack_records';

interface StorageData {
  version: string;
  records: SnackPackRecord[];
  lastUpdated: string;
}

export const loadRecords = (): SnackPackRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed: StorageData = JSON.parse(data);
      return parsed.records || [];
    }
  } catch (e) {
    console.error('Failed to load records from localStorage:', e);
  }
  return [];
};

export const saveRecords = (records: SnackPackRecord[]): void => {
  try {
    const data: StorageData = {
      version: '1.0',
      records,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save records to localStorage:', e);
  }
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
