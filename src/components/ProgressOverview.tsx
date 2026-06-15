import { Package, Boxes, CheckCircle, Clock, AlertOctagon, AlertTriangle, User, ChevronRight } from 'lucide-react';
import { useRecordStore } from '../store/useRecordStore';
import { STATUS_COLORS } from '../types';
import type { BatchProgress } from '../types';

const MetricCard = ({
  icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  bgColor: string;
}) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-2xl font-bold" style={{ color }}>
          {value}
        </p>
      </div>
    </div>
  </div>
);

const BatchCard = ({
  batch,
  isSelected,
  onClick,
}: {
  batch: BatchProgress;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const getProgressColor = (rate: number) => {
    if (rate >= 80) return '#2EC4B6';
    if (rate >= 50) return '#FFB703';
    return '#8ECAE6';
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-xl border shadow-sm p-4 hover:shadow-md hover:border-orange-300 transition-all duration-200 ${
        isSelected ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-100'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 truncate">{batch.batch}</h4>
            {batch.alertCount > 0 && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                <AlertTriangle className="w-3 h-3" />
                {batch.alertCount}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">{batch.totalPackages} 条记录 · {batch.totalQuantity} 份</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">完成率</span>
          <span className="text-sm font-semibold" style={{ color: getProgressColor(batch.completionRate) }}>
            {batch.completionRate}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${batch.completionRate}%`,
              backgroundColor: getProgressColor(batch.completionRate),
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: STATUS_COLORS.ready }}>
            {batch.readyQuantity}
          </p>
          <p className="text-[10px] text-gray-500">可发放</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: STATUS_COLORS.pending_review }}>
            {batch.pendingReviewQuantity}
          </p>
          <p className="text-[10px] text-gray-500">待复核</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: STATUS_COLORS.pending_pack }}>
            {batch.pendingPackQuantity}
          </p>
          <p className="text-[10px] text-gray-500">待分装</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: STATUS_COLORS.suspended }}>
            {batch.suspendedQuantity}
          </p>
          <p className="text-[10px] text-gray-500">暂缓</p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
        <User className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs text-gray-600">
          主要责任人：<span className="font-medium">{batch.primaryResponsiblePerson}</span>
        </span>
        {batch.responsiblePersons.length > 1 && (
          <span className="text-xs text-gray-400">
            +{batch.responsiblePersons.length - 1}人
          </span>
        )}
      </div>

      {batch.alertCount > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-50">
          <div className="flex flex-wrap gap-1.5">
            {batch.missingAllergyCount > 0 && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-50 text-red-600 text-[10px] font-medium rounded">
                <AlertOctagon className="w-3 h-3" />
                缺少过敏提示 {batch.missingAllergyCount}
              </span>
            )}
            {batch.missingBatchCount > 0 && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-medium rounded">
                <AlertTriangle className="w-3 h-3" />
                缺少批次 {batch.missingBatchCount}
              </span>
            )}
          </div>
        </div>
      )}
    </button>
  );
};

export const ProgressOverview = () => {
  const { getOverviewMetrics, getBatchProgressList, filters, setFilters, highlightRecords, clearHighlights } = useRecordStore();
  const metrics = getOverviewMetrics();
  const batchProgressList = getBatchProgressList();

  const handleBatchClick = (batch: BatchProgress) => {
    const batchName = batch.batch === '未分配批次' ? '' : batch.batch;
    const currentBatches = filters.targetBatch;
    const isAlreadySelected = currentBatches.includes(batchName);

    if (isAlreadySelected) {
      setFilters({ targetBatch: [] });
    } else {
      setFilters({ targetBatch: [batchName] });
    }

    highlightRecords(batch.records.map((r) => r.id));
    setTimeout(() => {
      clearHighlights();
    }, 3000);
  };

  const isBatchSelected = (batch: BatchProgress): boolean => {
    const batchName = batch.batch === '未分配批次' ? '' : batch.batch;
    return filters.targetBatch.includes(batchName);
  };

  return (
    <div className="mb-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        <MetricCard
          icon={<Package className="w-5 h-5 text-gray-600" />}
          label="总包数"
          value={metrics.totalPackages}
          color="#374151"
          bgColor="#F3F4F6"
        />
        <MetricCard
          icon={<Boxes className="w-5 h-5 text-orange-600" />}
          label="总份数"
          value={metrics.totalQuantity}
          color="#EA580C"
          bgColor="#FFF7ED"
        />
        <MetricCard
          icon={<CheckCircle className="w-5 h-5" style={{ color: STATUS_COLORS.ready }} />}
          label="可发放"
          value={metrics.readyQuantity}
          color={STATUS_COLORS.ready}
          bgColor="#CCFBF1"
        />
        <MetricCard
          icon={<Clock className="w-5 h-5" style={{ color: STATUS_COLORS.pending_review }} />}
          label="待复核"
          value={metrics.pendingReviewQuantity}
          color={STATUS_COLORS.pending_review}
          bgColor="#FEF3C7"
        />
        <MetricCard
          icon={<AlertOctagon className="w-5 h-5" style={{ color: STATUS_COLORS.suspended }} />}
          label="暂缓"
          value={metrics.suspendedQuantity}
          color={STATUS_COLORS.suspended}
          bgColor="#FEE2E2"
        />
      </div>

      {batchProgressList.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full" />
            <h3 className="font-semibold text-gray-800">批次进度概览</h3>
            <span className="text-xs text-gray-500">
              共 {batchProgressList.length} 个批次 · 点击卡片筛选查看
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {batchProgressList.map((batch) => (
              <BatchCard
                key={batch.batch}
                batch={batch}
                isSelected={isBatchSelected(batch)}
                onClick={() => handleBatchClick(batch)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
