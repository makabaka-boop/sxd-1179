import { create } from 'zustand';
import type { SnackPackRecord, Filters, Alert, Status, ViewMode, DistributionGroup } from '../types';
import { loadRecords, saveRecords, generateId } from '../utils/storage';
import { validateRecords, getUniqueValues } from '../utils/validator';
import { mockRecords } from '../data/mockData';

interface RecordState {
  records: SnackPackRecord[];
  filteredRecords: SnackPackRecord[];
  filters: Filters;
  selectedIds: Set<string>;
  alerts: Alert[];
  viewMode: ViewMode;
  editingRecord: SnackPackRecord | null;
  isFormOpen: boolean;
  highlightedRecordIds: Set<string>;
}

interface RecordActions {
  initRecords: () => void;
  addRecord: (record: Omit<SnackPackRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRecord: (id: string, updates: Partial<SnackPackRecord>) => void;
  deleteRecord: (id: string) => void;
  batchUpdateStatus: (ids: string[], status: Status) => void;
  batchUpdateResponsiblePerson: (ids: string[], person: string) => void;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  clearSelection: () => void;
  setViewMode: (mode: ViewMode) => void;
  openForm: (record?: SnackPackRecord) => void;
  closeForm: () => void;
  highlightRecords: (ids: string[]) => void;
  clearHighlights: () => void;
  getFlavorOptions: () => string[];
  getPersonOptions: () => string[];
  getBatchOptions: () => string[];
  getDistributionGroups: () => DistributionGroup[];
}

const initialFilters: Filters = {
  flavor: [],
  responsiblePerson: [],
  targetBatch: [],
  status: [],
};

const applyFilters = (records: SnackPackRecord[], filters: Filters): SnackPackRecord[] => {
  return records.filter((record) => {
    if (filters.flavor.length > 0 && !filters.flavor.includes(record.flavorCombination)) {
      return false;
    }
    if (filters.responsiblePerson.length > 0 && !filters.responsiblePerson.includes(record.responsiblePerson)) {
      return false;
    }
    if (filters.targetBatch.length > 0 && !filters.targetBatch.includes(record.targetBatch)) {
      return false;
    }
    if (filters.status.length > 0 && !filters.status.includes(record.status)) {
      return false;
    }
    return true;
  });
};

const groupByDistribution = (records: SnackPackRecord[]): DistributionGroup[] => {
  const groupMap = new Map<string, DistributionGroup>();

  records.forEach((record) => {
    const batch = record.targetBatch || '未分配批次';
    const flavor = record.flavorCombination || '未分类';
    const key = `${batch}||${flavor}`;

    const existing = groupMap.get(key);
    if (existing) {
      existing.records.push(record);
      existing.totalQuantity += record.quantity;
    } else {
      groupMap.set(key, {
        batch,
        flavor,
        records: [record],
        totalQuantity: record.quantity,
      });
    }
  });

  return Array.from(groupMap.values()).sort((a, b) => {
    if (a.batch !== b.batch) return a.batch.localeCompare(b.batch);
    return a.flavor.localeCompare(b.flavor);
  });
};

export const useRecordStore = create<RecordState & RecordActions>((set, get) => ({
  records: [],
  filteredRecords: [],
  filters: initialFilters,
  selectedIds: new Set(),
  alerts: [],
  viewMode: 'list',
  editingRecord: null,
  isFormOpen: false,
  highlightedRecordIds: new Set(),

  initRecords: () => {
    let records = loadRecords();
    if (records.length === 0) {
      records = mockRecords;
      saveRecords(records);
    }
    const alerts = validateRecords(records);
    const filtered = applyFilters(records, get().filters);
    set({ records, filteredRecords: filtered, alerts });
  },

  addRecord: (recordData) => {
    const now = new Date().toISOString();
    const newRecord: SnackPackRecord = {
      ...recordData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const records = [...get().records, newRecord];
    saveRecords(records);
    const alerts = validateRecords(records);
    const filtered = applyFilters(records, get().filters);
    set({ records, filteredRecords: filtered, alerts, isFormOpen: false, editingRecord: null });
  },

  updateRecord: (id, updates) => {
    const records = get().records.map((r) =>
      r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
    );
    saveRecords(records);
    const alerts = validateRecords(records);
    const filtered = applyFilters(records, get().filters);
    set({ records, filteredRecords: filtered, alerts, isFormOpen: false, editingRecord: null });
  },

  deleteRecord: (id) => {
    const records = get().records.filter((r) => r.id !== id);
    const selectedIds = new Set(get().selectedIds);
    selectedIds.delete(id);
    saveRecords(records);
    const alerts = validateRecords(records);
    const filtered = applyFilters(records, get().filters);
    set({ records, filteredRecords: filtered, alerts, selectedIds });
  },

  batchUpdateStatus: (ids, status) => {
    const records = get().records.map((r) =>
      ids.includes(r.id) ? { ...r, status, updatedAt: new Date().toISOString() } : r
    );
    saveRecords(records);
    const alerts = validateRecords(records);
    const filtered = applyFilters(records, get().filters);
    set({ records, filteredRecords: filtered, alerts, selectedIds: new Set() });
  },

  batchUpdateResponsiblePerson: (ids, person) => {
    const records = get().records.map((r) =>
      ids.includes(r.id) ? { ...r, responsiblePerson: person, updatedAt: new Date().toISOString() } : r
    );
    saveRecords(records);
    const alerts = validateRecords(records);
    const filtered = applyFilters(records, get().filters);
    set({ records, filteredRecords: filtered, alerts, selectedIds: new Set() });
  },

  setFilters: (newFilters) => {
    const filters = { ...get().filters, ...newFilters };
    const filtered = applyFilters(get().records, filters);
    set({ filters, filteredRecords: filtered });
  },

  resetFilters: () => {
    const filtered = applyFilters(get().records, initialFilters);
    set({ filters: initialFilters, filteredRecords: filtered });
  },

  toggleSelect: (id) => {
    const selectedIds = new Set(get().selectedIds);
    if (selectedIds.has(id)) {
      selectedIds.delete(id);
    } else {
      selectedIds.add(id);
    }
    set({ selectedIds });
  },

  toggleSelectAll: () => {
    const { selectedIds, filteredRecords } = get();
    const filteredIds = filteredRecords.map((r) => r.id);
    const allSelected = filteredIds.every((id) => selectedIds.has(id));

    if (allSelected) {
      const newSelected = new Set(selectedIds);
      filteredIds.forEach((id) => newSelected.delete(id));
      set({ selectedIds: newSelected });
    } else {
      const newSelected = new Set(selectedIds);
      filteredIds.forEach((id) => newSelected.add(id));
      set({ selectedIds: newSelected });
    }
  },

  clearSelection: () => {
    set({ selectedIds: new Set() });
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  openForm: (record) => {
    set({ isFormOpen: true, editingRecord: record || null });
  },

  closeForm: () => {
    set({ isFormOpen: false, editingRecord: null });
  },

  highlightRecords: (ids) => {
    set({ highlightedRecordIds: new Set(ids) });
  },

  clearHighlights: () => {
    set({ highlightedRecordIds: new Set() });
  },

  getFlavorOptions: () => getUniqueValues(get().records, 'flavorCombination'),
  getPersonOptions: () => getUniqueValues(get().records, 'responsiblePerson'),
  getBatchOptions: () => getUniqueValues(get().records, 'targetBatch'),

  getDistributionGroups: () => groupByDistribution(get().filteredRecords),
}));
