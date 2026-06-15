import { Package, Plus, List, LayoutGrid } from 'lucide-react';
import { useRecordStore } from '../store/useRecordStore';
import type { ViewMode } from '../types';

export const Header = () => {
  const { viewMode, setViewMode, openForm } = useRecordStore();

  const handleModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: '"Noto Sans SC", system-ui, sans-serif' }}>
                零食包管理系统
              </h1>
              <p className="text-xs text-gray-500">分装清单 · 复核记录</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleModeChange('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                列表模式
              </button>
              <button
                onClick={() => handleModeChange('distribution')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'distribution'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                发放清单
              </button>
            </div>

            <button
              onClick={() => openForm()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium text-sm shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              新增记录
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
