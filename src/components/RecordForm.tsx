import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useRecordStore } from '../store/useRecordStore';
import { STATUS_LABELS } from '../types';
import type { Status, SnackPackRecord } from '../types';

export const RecordForm = () => {
  const { isFormOpen, editingRecord, closeForm, addRecord, updateRecord } = useRecordStore();

  const [formData, setFormData] = useState({
    packageNumber: '',
    flavorCombination: '',
    quantity: 1,
    targetBatch: '',
    responsiblePerson: '',
    allergyWarning: '',
    reviewNotes: '',
    status: 'pending_pack' as Status,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingRecord) {
      setFormData({
        packageNumber: editingRecord.packageNumber,
        flavorCombination: editingRecord.flavorCombination,
        quantity: editingRecord.quantity,
        targetBatch: editingRecord.targetBatch,
        responsiblePerson: editingRecord.responsiblePerson,
        allergyWarning: editingRecord.allergyWarning,
        reviewNotes: editingRecord.reviewNotes,
        status: editingRecord.status,
      });
    } else {
      setFormData({
        packageNumber: '',
        flavorCombination: '',
        quantity: 1,
        targetBatch: '',
        responsiblePerson: '',
        allergyWarning: '',
        reviewNotes: '',
        status: 'pending_pack',
      });
    }
    setErrors({});
  }, [editingRecord, isFormOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.packageNumber.trim()) {
      newErrors.packageNumber = '请输入零食包编号';
    }
    if (!formData.flavorCombination.trim()) {
      newErrors.flavorCombination = '请输入口味组合';
    }
    if (formData.quantity < 1) {
      newErrors.quantity = '份数必须大于0';
    }
    if (!formData.responsiblePerson.trim()) {
      newErrors.responsiblePerson = '请输入责任人';
    }
    if (formData.status === 'ready' && !formData.allergyWarning.trim()) {
      newErrors.allergyWarning = '状态为「可发放」时必须填写过敏提示';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingRecord) {
      updateRecord(editingRecord.id, formData as Partial<SnackPackRecord>);
    } else {
      addRecord(formData as Omit<SnackPackRecord, 'id' | 'createdAt' | 'updatedAt'>);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 1 : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const { [name]: removed, ...rest } = prev;
        void removed;
        return rest;
      });
    }
  };

  if (!isFormOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeForm}
      />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scaleIn"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingRecord ? '编辑记录' : '新增记录'}
          </h2>
          <button
            onClick={closeForm}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                零食包编号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="packageNumber"
                value={formData.packageNumber}
                onChange={handleChange}
                placeholder="例如：SNACK-001"
                className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
                  errors.packageNumber
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-200 focus:border-orange-500 focus:ring-orange-200'
                } focus:outline-none focus:ring-2`}
              />
              {errors.packageNumber && (
                <p className="mt-1 text-xs text-red-500">{errors.packageNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                口味组合 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="flavorCombination"
                value={formData.flavorCombination}
                onChange={handleChange}
                placeholder="例如：经典原味组合"
                className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
                  errors.flavorCombination
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-200 focus:border-orange-500 focus:ring-orange-200'
                } focus:outline-none focus:ring-2`}
              />
              {errors.flavorCombination && (
                <p className="mt-1 text-xs text-red-500">{errors.flavorCombination}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                份数 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
                  errors.quantity
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-200 focus:border-orange-500 focus:ring-orange-200'
                } focus:outline-none focus:ring-2`}
              />
              {errors.quantity && (
                <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                目标批次
              </label>
              <input
                type="text"
                name="targetBatch"
                value={formData.targetBatch}
                onChange={handleChange}
                placeholder="例如：2024-SPRING-01"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                责任人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="responsiblePerson"
                value={formData.responsiblePerson}
                onChange={handleChange}
                placeholder="例如：张三"
                className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
                  errors.responsiblePerson
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-200 focus:border-orange-500 focus:ring-orange-200'
                } focus:outline-none focus:ring-2`}
              />
              {errors.responsiblePerson && (
                <p className="mt-1 text-xs text-red-500">{errors.responsiblePerson}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                状态
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-colors bg-white"
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                过敏提示
                {formData.status === 'ready' && <span className="text-red-500"> *</span>}
              </label>
              <input
                type="text"
                name="allergyWarning"
                value={formData.allergyWarning}
                onChange={handleChange}
                placeholder="例如：含有花生、大豆制品"
                className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
                  errors.allergyWarning
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-200 focus:border-orange-500 focus:ring-orange-200'
                } focus:outline-none focus:ring-2`}
              />
              {errors.allergyWarning && (
                <p className="mt-1 text-xs text-red-500">{errors.allergyWarning}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                复核备注
              </label>
              <textarea
                name="reviewNotes"
                value={formData.reviewNotes}
                onChange={handleChange}
                rows={3}
                placeholder="请输入复核备注信息..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={closeForm}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20"
          >
            {editingRecord ? '保存修改' : '创建记录'}
          </button>
        </div>
      </div>
    </div>
  );
};
