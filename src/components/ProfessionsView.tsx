import React, { useState } from 'react';
import { Briefcase, Plus, Edit3, Trash2, Search, X, Coins, CheckCircle, Tag } from 'lucide-react';
import { Profession } from '../types';
import { formatCurrency } from '../utils/helpers';

interface ProfessionsViewProps {
  professions: Profession[];
  onSaveProfession: (profession: Profession) => void;
  onDeleteProfession: (professionId: string) => void;
}

const CURRENCIES = ['SAR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR', 'USD', 'EUR', 'EGP'];

export const ProfessionsView: React.FC<ProfessionsViewProps> = ({
  professions,
  onSaveProfession,
  onDeleteProfession
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'منزلية' | 'مهنية'>('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfession, setEditingProfession] = useState<Profession | null>(null);

  const [formData, setFormData] = useState<Partial<Profession>>({
    name: '',
    category: 'منزلية',
    default_salary: 1500,
    currency: 'SAR',
    description: ''
  });

  const openNewModal = () => {
    setFormData({
      name: '',
      category: 'منزلية',
      default_salary: 1500,
      currency: 'SAR',
      description: ''
    });
    setEditingProfession(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Profession) => {
    setFormData({ ...p });
    setEditingProfession(p);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('يرجى إدخال مسمى المهنة');
      return;
    }

    const profToSave: Profession = {
      id: editingProfession ? editingProfession.id : `p_${Date.now()}`,
      name: formData.name || '',
      category: (formData.category as 'منزلية' | 'مهنية') || 'منزلية',
      default_salary: Number(formData.default_salary) || 0,
      currency: formData.currency || 'SAR',
      description: formData.description || ''
    };

    onSaveProfession(profToSave);
    setIsModalOpen(false);
  };

  const filteredProfessions = professions.filter(p => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div id="professions-view-root" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            <span>جدول المهن والأجور والعملات</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة المهن (المنزلية والمهنية) وتحديد الأجور والرواتب الافتراضية لكل مهنة بشكل منفصل مع دعم مختلف العملات
          </p>
        </div>

        <button
          id="btn-add-profession"
          onClick={openNewModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مهنة جديدة</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              categoryFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            جميع المهن ({professions.length})
          </button>
          <button
            onClick={() => setCategoryFilter('منزلية')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              categoryFilter === 'منزلية' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            عمالة منزلية ({professions.filter(p => p.category === 'منزلية').length})
          </button>
          <button
            onClick={() => setCategoryFilter('مهنية')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              categoryFilter === 'مهنية' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            عمالة مهنية وفنية ({professions.filter(p => p.category === 'مهنية').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالمهنة أو الوصف..."
            className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50"
          />
          <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
        </div>
      </div>

      {/* Professions Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProfessions.map(prof => (
          <div
            key={prof.id}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{prof.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold mt-1 inline-block ${
                    prof.category === 'منزلية' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    عمالة {prof.category}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(prof)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`هل ترغب بحذف مهنة ${prof.name}؟`)) {
                        onDeleteProfession(prof.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {prof.description && (
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                  {prof.description}
                </p>
              )}
            </div>

            {/* Salary Box with distinct currency */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between mt-2">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>الراتب المقترح:</span>
              </span>
              <span className="font-bold text-emerald-800 font-mono text-xs">
                {formatCurrency(prof.default_salary, prof.currency)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Profession Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 text-slate-800">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">{editingProfession ? 'تعديل بيانات المهنة والأجر' : 'إضافة مهنة جديدة'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">مسمى المهنة:</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="مثال: سائق خاص، سباك صحي..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">تصنيف المهنة:</label>
                <select
                  value={formData.category || 'منزلية'}
                  onChange={(e) => setFormData(p => ({ ...p, category: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-bold"
                >
                  <option value="منزلية">عمالة منزلية (سائق، خادمة، طباخ، ممرض...)</option>
                  <option value="مهنية">عمالة مهنية وفنية (سباك، كهربائي، نجار، بناء...)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">الراتب الافتراضي:</label>
                  <input
                    type="number"
                    value={formData.default_salary || 0}
                    onChange={(e) => setFormData(p => ({ ...p, default_salary: Number(e.target.value) }))}
                    placeholder="1500"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">العملة:</label>
                  <select
                    value={formData.currency || 'SAR'}
                    onChange={(e) => setFormData(p => ({ ...p, currency: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-mono font-bold"
                  >
                    {CURRENCIES.map(curr => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">وصف المهنة وشروطها:</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="المهام، المؤهلات المطلوبة..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30"
                >
                  حفظ المهنة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
