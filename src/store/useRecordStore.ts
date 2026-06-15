import { create } from 'zustand';
import type { SnackPackRecord, Filters, Alert, Status, ViewMode, DistributionGroup, OverviewMetrics, BatchProgress } from '../types';
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
  batchUpdateStatus: (ids: string[], status: Status) => { success: boolean; message?: string };
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
  getOverviewMetrics: () => OverviewMetrics;
  getBatchProgressList: () => BatchProgress[];
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

const calculateOverviewMetrics = (records: SnackPackRecord[]): OverviewMetrics => {
  const totalPackages = records.length;
  let totalQuantity = 0;
  let readyQuantity = 0;
  let pendingReviewQuantity = 0;
  let suspendedQuantity = 0;

  records.forEach((record) => {
    totalQuantity += record.quantity;
    switch (record.status) {
      case 'ready':
        readyQuantity += record.quantity;
        break;
      case 'pending_review':
        pendingReviewQuantity += record.quantity;
        break;
      case 'suspended':
        suspendedQuantity += record.quantity;
        break;
    }
  });

  return {
    totalPackages,
    totalQuantity,
    readyQuantity,
    pendingReviewQuantity,
    suspendedQuantity,
  };
};

const calculateBatchProgress = (records: SnackPackRecord[]): BatchProgress[] => {
  const batchMap = new Map<string, SnackPackRecord[]>();

  records.forEach((record) => {
    const batch = record.targetBatch || '未分配批次';
    const existing = batchMap.get(batch) || [];
    batchMap.set(batch, [...existing, record]);
  });

  const progressList: BatchProgress[] = [];

  batchMap.forEach((batchRecords, batch) => {
    const totalPackages = batchRecords.length;
    let totalQuantity = 0;
    let readyQuantity = 0;
    let pendingReviewQuantity = 0;
    let suspendedQuantity = 0;
    let pendingPackQuantity = 0;
    let missingAllergyCount = 0;
    let missingBatchCount = 0;

    const personCount = new Map<string, number>();

    batchRecords.forEach((record) => {
      totalQuantity += record.quantity;
      switch (record.status) {
        case 'ready':
          readyQuantity += record.quantity;
          break;
        case 'pending_review':
          pendingReviewQuantity += record.quantity;
          break;
        case 'suspended':
          suspendedQuantity += record.quantity;
          break;
        case 'pending_pack':
          pendingPackQuantity += record.quantity;
          break;
      }

      if (record.status === 'ready' && (!record.allergyWarning || record.allergyWarning.trim() === '')) {
        missingAllergyCount++;
      }
      if (!record.targetBatch || record.targetBatch.trim() === '') {
        missingBatchCount++;
      }

      const person = record.responsiblePerson || '未分配';
      personCount.set(person, (personCount.get(person) || 0) + 1);
    });

    const completionRate = totalQuantity > 0 ? Math.round((readyQuantity / totalQuantity) * 100) : 0;
    const alertCount = missingAllergyCount + missingBatchCount;

    const sortedPersons = Array.from(personCount.entries()).sort((a, b) => b[1] - a[1]);
    const primaryResponsiblePerson = sortedPersons.length > 0 ? sortedPersons[0][0] : '未分配';
    const responsiblePersons = sortedPersons.map(([person]) => person);

    progressList.push({
      batch,
      totalPackages,
      totalQuantity,
      readyQuantity,
      pendingReviewQuantity,
      suspendedQuantity,
      pendingPackQuantity,
      completionRate,
      alertCount,
      missingAllergyCount,
      missingBatchCount,
      primaryResponsiblePerson,
      responsiblePersons,
      records: batchRecords,
    });
  });

  return progressList.sort((a, b) => a.batch.localeCompare(b.batch));
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
    if (status === 'ready') {
      const selectedRecords = get().records.filter((r) => ids.includes(r.id));
      const missingAllergy = selectedRecords.filter(
        (r) => !r.allergyWarning || r.allergyWarning.trim() === ''
      );
      if (missingAllergy.length > 0) {
        return {
          success: false,
          message: `有 ${missingAllergy.length} 条记录缺少过敏提示，无法标记为「可发放」。请先补充过敏提示后再操作。`,
        };
      }
    }
    const records = get().records.map((r) =>
      ids.includes(r.id) ? { ...r, status, updatedAt: new Date().toISOString() } : r
    );
    saveRecords(records);
    const alerts = validateRecords(records);
    const filtered = applyFilters(records, get().filters);
    const currentSelected = new Set(get().selectedIds);
    set({ records, filteredRecords: filtered, alerts, selectedIds: currentSelected });
    return { success: true };
  },

  batchUpdateResponsiblePerson: (ids, person) => {
    const records = get().records.map((r) =>
      ids.includes(r.id) ? { ...r, responsiblePerson: person, updatedAt: new Date().toISOString() } : r
    );
    saveRecords(records);
    const alerts = validateRecords(records);
    const filtered = applyFilters(records, get().filters);
    const currentSelected = new Set(get().selectedIds);
    set({ records, filteredRecords: filtered, alerts, selectedIds: currentSelected });
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
  getOverviewMetrics: () => calculateOverviewMetrics(get().filteredRecords),
  getBatchProgressList: () => calculateBatchProgress(get().filteredRecords),
}));
