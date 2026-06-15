import type { SnackPackRecord, Alert, AlertType } from '../types';

const BACKLOG_THRESHOLD = 5;

export const validateRecords = (records: SnackPackRecord[]): Alert[] => {
  const alerts: Alert[] = [];

  const duplicateAlert = checkDuplicateNumbers(records);
  if (duplicateAlert) alerts.push(duplicateAlert);

  const missingBatchAlert = checkMissingBatch(records);
  if (missingBatchAlert) alerts.push(missingBatchAlert);

  const backlogAlerts = checkPersonBacklog(records);
  alerts.push(...backlogAlerts);

  const missingAllergyAlert = checkMissingAllergy(records);
  if (missingAllergyAlert) alerts.push(missingAllergyAlert);

  return alerts;
};

const checkDuplicateNumbers = (records: SnackPackRecord[]): Alert | null => {
  const numberMap = new Map<string, string[]>();

  records.forEach((record) => {
    if (record.packageNumber) {
      const existing = numberMap.get(record.packageNumber) || [];
      numberMap.set(record.packageNumber, [...existing, record.id]);
    }
  });

  const duplicateIds: string[] = [];
  numberMap.forEach((ids) => {
    if (ids.length > 1) {
      duplicateIds.push(...ids);
    }
  });

  if (duplicateIds.length > 0) {
    return {
      type: 'duplicate_number' as AlertType,
      message: `发现 ${duplicateIds.length} 条零食包编号重复，请及时处理`,
      recordIds: duplicateIds,
      severity: 'error',
    };
  }
  return null;
};

const checkMissingBatch = (records: SnackPackRecord[]): Alert | null => {
  const missingIds = records
    .filter((r) => !r.targetBatch || r.targetBatch.trim() === '')
    .map((r) => r.id);

  if (missingIds.length > 0) {
    return {
      type: 'missing_batch' as AlertType,
      message: `有 ${missingIds.length} 条记录缺少目标批次`,
      recordIds: missingIds,
      severity: 'warning',
    };
  }
  return null;
};

const checkPersonBacklog = (records: SnackPackRecord[]): Alert[] => {
  const alerts: Alert[] = [];
  const personRecords = new Map<string, SnackPackRecord[]>();

  records.forEach((record) => {
    const person = record.responsiblePerson || '未分配';
    const existing = personRecords.get(person) || [];
    personRecords.set(person, [...existing, record]);
  });

  personRecords.forEach((personRecs, person) => {
    const sorted = [...personRecs].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    let maxConsecutive = 0;
    let currentConsecutive = 0;
    let consecutiveIds: string[] = [];
    let maxConsecutiveIds: string[] = [];

    sorted.forEach((record) => {
      if (record.status === 'pending_review') {
        currentConsecutive++;
        consecutiveIds.push(record.id);
        if (currentConsecutive > maxConsecutive) {
          maxConsecutive = currentConsecutive;
          maxConsecutiveIds = [...consecutiveIds];
        }
      } else {
        currentConsecutive = 0;
        consecutiveIds = [];
      }
    });

    if (maxConsecutive >= BACKLOG_THRESHOLD) {
      alerts.push({
        type: 'backlog_person' as AlertType,
        message: `责任人「${person}」名下有连续 ${maxConsecutive} 条待复核记录堆积`,
        recordIds: maxConsecutiveIds,
        severity: 'warning',
      });
    }
  });

  return alerts;
};

const checkMissingAllergy = (records: SnackPackRecord[]): Alert | null => {
  const missingIds = records
    .filter((r) => r.status === 'ready' && (!r.allergyWarning || r.allergyWarning.trim() === ''))
    .map((r) => r.id);

  if (missingIds.length > 0) {
    return {
      type: 'missing_allergy' as AlertType,
      message: `有 ${missingIds.length} 条可发放记录缺少过敏提示`,
      recordIds: missingIds,
      severity: 'error',
    };
  }
  return null;
};

export const getUniqueValues = (records: SnackPackRecord[], field: keyof SnackPackRecord): string[] => {
  const values = new Set<string>();
  records.forEach((r) => {
    const val = r[field];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      values.add(String(val));
    }
  });
  return Array.from(values).sort();
};
