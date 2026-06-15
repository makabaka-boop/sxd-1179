import type { SnackPackRecord, Status } from '../types';

const STORAGE_KEY = 'snack_pack_records';
const CURRENT_VERSION = '1.1';

interface StorageData {
  version: string;
  records: SnackPackRecord[];
  lastUpdated: string;
}

const defaultRecord: Omit<SnackPackRecord, 'id' | 'createdAt' | 'updatedAt'> = {
  packageNumber: '',
  flavorCombination: '',
  quantity: 0,
  targetBatch: '',
  responsiblePerson: '',
  allergyWarning: '',
  reviewNotes: '',
  status: 'pending_pack' as Status,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const migrateRecord = (record: any): SnackPackRecord => {
  return {
    ...defaultRecord,
    ...record,
    id: record.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: record.createdAt || new Date().toISOString(),
    updatedAt: record.updatedAt || new Date().toISOString(),
    quantity: typeof record.quantity === 'number' ? record.quantity : (parseInt(record.quantity, 10) || 0),
    status: record.status || 'pending_pack',
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isRecordValid = (record: any): record is SnackPackRecord => {
  return (
    record &&
    typeof record === 'object' &&
    'id' in record &&
    'packageNumber' in record
  );
};

export const loadRecords = (): SnackPackRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsed: any = JSON.parse(data);

      if (Array.isArray(parsed)) {
        return parsed
          .filter(isRecordValid)
          .map(migrateRecord);
      }

      if (parsed && Array.isArray(parsed.records)) {
        return parsed.records
          .filter(isRecordValid)
          .map(migrateRecord);
      }

      if (parsed && isRecordValid(parsed)) {
        return [migrateRecord(parsed)];
      }
    }
  } catch (e) {
    console.error('Failed to load records from localStorage:', e);
  }
  return [];
};

export const saveRecords = (records: SnackPackRecord[]): void => {
  try {
    const data: StorageData = {
      version: CURRENT_VERSION,
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
