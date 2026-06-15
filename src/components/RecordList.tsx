import { Edit2, Trash2 } from 'lucide-react';
import { useRecordStore } from '../store/useRecordStore';
import { StatusBadge } from './StatusBadge';
import type { SnackPackRecord } from '../types';

export const RecordList = () => {
  const {
    filteredRecords,
    selectedIds,
    highlightedRecordIds,
    toggleSelect,
    toggleSelectAll,
    openForm,
    deleteRecord,
  } = useRecordStore();

  const allSelected = filteredRecords.length > 0 && 
    filteredRecords.every((r) => selectedIds.has(r.id));

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

  if (filteredRecords.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-3xl">📦</span>
        </div>
        <p className="text-gray-500 mb-2">暂无记录</p>
        <p className="text-sm text-gray-400">点击右上角「新增记录」按钮开始添加</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                编号
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                口味组合
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                份数
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                目标批次
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                责任人
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                过敏提示
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                复核备注
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRecords.map((record, index) => (
              <tr
                key={record.id}
                className={`hover:bg-gray-50 ${getRowClass(record)}`}
                style={{
                  animation: `fadeInUp 0.3s ease-out ${index * 0.02}s both`,
                }}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(record.id)}
                    onChange={() => toggleSelect(record.id)}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                  />
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-sm text-gray-900">
                    {record.packageNumber}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span>🍊</span>
                    <span className="text-sm text-gray-900">
                      {record.flavorCombination}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-gray-900">
                    {record.quantity}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm ${!record.targetBatch ? 'text-red-500' : 'text-gray-900'}`}>
                    {record.targetBatch || '未设置'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span>👤</span>
                    <span className="text-sm text-gray-900">
                      {record.responsiblePerson}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
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
                <td className="px-4 py-3 max-w-[200px]">
                  <span className="text-sm text-gray-600 truncate block" title={record.reviewNotes}>
                    {record.reviewNotes || (
                      <span className="text-gray-400">无</span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={record.status} size="sm" />
                </td>
                <td className="px-4 py-3">
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
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-sm text-gray-500">
        共 {filteredRecords.length} 条记录
        {selectedIds.size > 0 && (
          <span className="ml-2 text-orange-600">
            已选择 {selectedIds.size} 条
          </span>
        )}
      </div>
    </div>
  );
};
