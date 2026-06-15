export type Status = 'pending_pack' | 'pending_review' | 'ready' | 'suspended';

export const STATUS_LABELS: Record<Status, string> = {
  pending_pack: '待分装',
  pending_review: '待复核',
  ready: '可发放',
  suspended: '暂缓',
};

export const STATUS_COLORS: Record<Status, string> = {
  pending_pack: '#8ECAE6',
  pending_review: '#FFB703',
  ready: '#2EC4B6',
  suspended: '#E63946',
};

export interface SnackPackRecord {
  id: string;
  packageNumber: string;
  flavorCombination: string;
  quantity: number;
  targetBatch: string;
  responsiblePerson: string;
  allergyWarning: string;
  reviewNotes: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface Filters {
  flavor: string[];
  responsiblePerson: string[];
  targetBatch: string[];
  status: Status[];
}

export type AlertType = 'duplicate_number' | 'missing_batch' | 'backlog_person' | 'missing_allergy';

export interface Alert {
  type: AlertType;
  message: string;
  recordIds: string[];
  severity: 'warning' | 'error';
}

export type ViewMode = 'list' | 'distribution';

export interface BatchOperation {
  type: 'status' | 'responsiblePerson';
  value: string;
}

export interface DistributionGroup {
  batch: string;
  flavor: string;
  records: SnackPackRecord[];
  totalQuantity: number;
}
