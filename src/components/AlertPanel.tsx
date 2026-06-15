import { AlertTriangle, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useRecordStore } from '../store/useRecordStore';
import type { Alert } from '../types';

export const AlertPanel = () => {
  const { alerts, highlightRecords, clearHighlights } = useRecordStore();
  const [expanded, setExpanded] = useState(true);

  if (alerts.length === 0) return null;

  const handleAlertClick = (alert: Alert) => {
    highlightRecords(alert.recordIds);
    setTimeout(() => {
      clearHighlights();
    }, 5000);
  };

  const getAlertIcon = (alert: Alert) => {
    return alert.severity === 'error' ? (
      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
    ) : (
      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
    );
  };

  const getAlertBg = (alert: Alert) => {
    return alert.severity === 'error'
      ? 'bg-red-50 border-red-100 hover:bg-red-100'
      : 'bg-amber-50 border-amber-100 hover:bg-amber-100';
  };

  return (
    <div className="mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-t-xl transition-all"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span className="font-medium text-amber-800">
            系统检测到 {alerts.length} 个异常
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-amber-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-amber-600" />
        )}
      </button>

      {expanded && (
        <div className="border-x border-b border-amber-200 rounded-b-xl p-3 bg-white space-y-2">
          {alerts.map((alert, index) => (
            <button
              key={`${alert.type}-${index}`}
              onClick={() => handleAlertClick(alert)}
              className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer text-left ${getAlertBg(alert)}`}
            >
              {getAlertIcon(alert)}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${alert.severity === 'error' ? 'text-red-800' : 'text-amber-800'}`}>
                  {alert.message}
                </p>
                <p className={`text-xs mt-1 ${alert.severity === 'error' ? 'text-red-600' : 'text-amber-600'}`}>
                  涉及 {alert.recordIds.length} 条记录 · 点击定位
                </p>
              </div>
              <X className="w-3.5 h-3.5 opacity-50 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
