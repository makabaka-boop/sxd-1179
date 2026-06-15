import { X, Filter, RefreshCw } from 'lucide-react';
import { useRecordStore } from '../store/useRecordStore';
import { STATUS_LABELS } from '../types';
import type { Status } from '../types';

export const FilterBar = () => {
  const {
    filters,
    setFilters,
    resetFilters,
    getFlavorOptions,
    getPersonOptions,
    getBatchOptions,
  } = useRecordStore();

  const flavorOptions = getFlavorOptions();
  const personOptions = getPersonOptions();
  const batchOptions = getBatchOptions();
  const statusOptions = Object.entries(STATUS_LABELS) as [Status, string][];

  const toggleFilter = (
    filterType: 'flavor' | 'responsiblePerson' | 'targetBatch' | 'status',
    value: string
  ) => {
    const current = filters[filterType] as string[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFilters({ [filterType]: updated });
  };

  const hasActiveFilters =
    filters.flavor.length > 0 ||
    filters.responsiblePerson.length > 0 ||
    filters.targetBatch.length > 0 ||
    filters.status.length > 0;

  const FilterSection = ({
    title,
    options,
    filterKey,
    icon,
  }: {
    title: string;
    options: [string, string][];
    filterKey: 'flavor' | 'responsiblePerson' | 'targetBatch' | 'status';
    icon: string;
  }) => {
    const selected = filters[filterKey] as string[];
    return (
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
          <span>{icon}</span>
          {title}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {options.map(([value, label]) => (
            <button
              key={value}
              onClick={() => toggleFilter(filterKey, value)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                selected.includes(value)
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
          {options.length === 0 && (
            <span className="text-xs text-gray-400">暂无选项</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">筛选条件</span>
          {hasActiveFilters && (
            <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
              {filters.flavor.length +
                filters.responsiblePerson.length +
                filters.targetBatch.length +
                filters.status.length}{' '}
              个已选
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            重置筛选
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FilterSection
          title="口味组合"
          options={flavorOptions.map((f) => [f, f])}
          filterKey="flavor"
          icon="🍊"
        />
        <FilterSection
          title="责任人"
          options={personOptions.map((p) => [p, p])}
          filterKey="responsiblePerson"
          icon="👤"
        />
        <FilterSection
          title="目标批次"
          options={batchOptions.map((b) => [b, b])}
          filterKey="targetBatch"
          icon="📦"
        />
        <FilterSection
          title="状态"
          options={statusOptions}
          filterKey="status"
          icon="✅"
        />
      </div>
    </div>
  );
};
