import { useState } from 'react';
import { ChevronDown, ChevronRight, Edit2, Trash2, Package } from 'lucide-react';
import { useRecordStore } from '../store/useRecordStore';
import { StatusBadge } from './StatusBadge';
import type { DistributionGroup, SnackPackRecord } from '../types';

export const DistributionView = () => {
  const { getDistributionGroups, selectedIds, highlightedRecordIds, toggleSelect, openForm, deleteRecord } = useRecordStore();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const groups = getDistributionGroups();

  const toggleGroup = (key: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedGroups(newExpanded);
  };

  const getRowClass = (record: SnackPackRecord) => {
    let classes = 'transition-all duration-200 ';
    if (selectedIds.has(record.id)) {
      classes += 'bg-orange-50/80 ';
    }
    if (highlightedRecordIds.has(record.id)) {
      classes += 'bg-amber-100/80 animate-pulse ';
    }
    return classes;
  };

  if (groups.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-3xl">📦</span>
        </div>
        <p className="text-gray-500 mb-2">暂无发放记录</p>
        <p className="text-sm text-gray-400">请先添加零食包记录</p>
      </div>
    );
  }

  let currentBatch = '';

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-orange-500" />
          <div>
            <h3 className="font-medium text-gray-900">发放清单视图</h3>
            <p className="text-sm text-gray-500">
              按目标批次和口味组合归并，共 {groups.length} 个分组
            </p>
          </div>
        </div>
      </div>

      {groups.map((group, groupIndex) => {
        const groupKey = `${group.batch}-${group.flavor}`;
        const isExpanded = expandedGroups.has(groupKey);
        const showBatchHeader = group.batch !== currentBatch;
        currentBatch = group.batch;

        return (
          <div key={groupKey} style={{ animation: `fadeInUp 0.3s ease-out ${groupIndex * 0.05}s both` }}>
            {showBatchHeader && (
              <div className="mt-6 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {group.batch}
                  </h3>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    批次
                  </span>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleGroup(groupKey)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-medium text-gray-900">
                        {group.flavor}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {group.records.length} 条记录
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-500">
                      {group.totalQuantity}
                    </p>
                    <p className="text-xs text-gray-500">总份数</p>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50/50">
                          <th className="px-4 py-2 text-left">
                            <span className="text-xs font-medium text-gray-500">选择</span>
                          </th>
                          <th className="px-4 py-2 text-left">
                            <span className="text-xs font-medium text-gray-500">编号</span>
                          </th>
                          <th className="px-4 py-2 text-left">
                            <span className="text-xs font-medium text-gray-500">份数</span>
                          </th>
                          <th className="px-4 py-2 text-left">
                            <span className="text-xs font-medium text-gray-500">责任人</span>
                          </th>
                          <th className="px-4 py-2 text-left">
                            <span className="text-xs font-medium text-gray-500">过敏提示</span>
                          </th>
                          <th className="px-4 py-2 text-left">
                            <span className="text-xs font-medium text-gray-500">复核备注</span>
                          </th>
                          <th className="px-4 py-2 text-left">
                            <span className="text-xs font-medium text-gray-500">状态</span>
                          </th>
                          <th className="px-4 py-2 text-left">
                            <span className="text-xs font-medium text-gray-500">操作</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {group.records.map((record, idx) => (
                          <tr
                            key={record.id}
                            className={`hover:bg-gray-50 ${getRowClass(record)}`}
                            style={{ animation: `fadeIn 0.2s ease-out ${idx * 0.03}s both` }}
                          >
                            <td className="px-4 py-2.5">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(record.id)}
                                onChange={() => toggleSelect(record.id)}
                                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                              />
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="font-mono text-sm text-gray-900">
                                {record.packageNumber}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="text-sm font-medium text-gray-900">
                                {record.quantity}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-1.5">
                                <span>👤</span>
                                <span className="text-sm text-gray-900">
                                  {record.responsiblePerson}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={`text-sm ${
                                record.status === 'ready' && !record.allergyWarning
                                  ? 'text-red-500 font-medium'
                                  : 'text-gray-600'
                              }`}>
                                {record.allergyWarning || (
                                  <span className="text-gray-400">无</span>
                                )}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 max-w-[180px]">
                              <span className="text-sm text-gray-600 truncate block" title={record.reviewNotes}>
                                {record.reviewNotes || (
                                  <span className="text-gray-400">无</span>
                                )}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <StatusBadge status={record.status} size="sm" />
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openForm(record)}
                                  className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                  title="编辑"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm('确定要删除这条记录吗？')) {
                                      deleteRecord(record.id);
                                    }
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="删除"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
