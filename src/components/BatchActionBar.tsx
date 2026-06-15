import { useState, useRef, useEffect } from 'react';
import { X, Check, Users, Tag } from 'lucide-react';
import { useRecordStore } from '../store/useRecordStore';
import { STATUS_LABELS } from '../types';
import type { Status } from '../types';

export const BatchActionBar = () => {
  const { selectedIds, clearSelection, batchUpdateStatus, batchUpdateResponsiblePerson, getPersonOptions } = useRecordStore();
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPersonDropdown, setShowPersonDropdown] = useState(false);
  const [newPerson, setNewPerson] = useState('');
  const statusRef = useRef<HTMLDivElement>(null);
  const personRef = useRef<HTMLDivElement>(null);

  const personOptions = getPersonOptions();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (personRef.current && !personRef.current.contains(e.target as Node)) {
        setShowPersonDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (selectedIds.size === 0) return null;

  const handleStatusChange = (status: Status) => {
    if (confirm(`确定要将选中的 ${selectedIds.size} 条记录状态更新为「${STATUS_LABELS[status]}」吗？`)) {
      const result = batchUpdateStatus(Array.from(selectedIds), status);
      if (!result.success && result.message) {
        alert(result.message);
      }
    }
    setShowStatusDropdown(false);
  };

  const handlePersonChange = (person: string) => {
    if (confirm(`确定要将选中的 ${selectedIds.size} 条记录责任人更新为「${person}」吗？`)) {
      batchUpdateResponsiblePerson(Array.from(selectedIds), person);
    }
    setShowPersonDropdown(false);
    setNewPerson('');
  };

  const handleCustomPersonSubmit = () => {
    if (newPerson.trim()) {
      handlePersonChange(newPerson.trim());
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slideUp">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
            已选择 {selectedIds.size} 条
          </span>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        <div className="relative" ref={statusRef}>
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Tag className="w-4 h-4" />
            调整状态
          </button>
          {showStatusDropdown && (
            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-36 z-50">
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => handleStatusChange(value as Status)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={personRef}>
          <button
            onClick={() => setShowPersonDropdown(!showPersonDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Users className="w-4 h-4" />
            调整责任人
          </button>
          {showPersonDropdown && (
            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-48 z-50">
              <div className="px-3 pb-2 border-b border-gray-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPerson}
                    onChange={(e) => setNewPerson(e.target.value)}
                    placeholder="输入新责任人"
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-orange-500 focus:ring-1 focus:ring-orange-200 focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleCustomPersonSubmit()}
                  />
                  <button
                    onClick={handleCustomPersonSubmit}
                    disabled={!newPerson.trim()}
                    className="px-2 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="py-1">
                <p className="px-4 py-1 text-xs text-gray-400">选择已有责任人</p>
                {personOptions.map((person) => (
                  <button
                    key={person}
                    onClick={() => handlePersonChange(person)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    {person}
                  </button>
                ))}
                {personOptions.length === 0 && (
                  <p className="px-4 py-2 text-sm text-gray-400">暂无选项</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-200" />

        <button
          onClick={clearSelection}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="取消选择"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
