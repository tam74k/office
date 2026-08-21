import React, { useState } from 'react';
import { Globe2, Plus, Edit3, Trash2, CheckCircle2, XCircle, Search, X, Flag } from 'lucide-react';
import { Country } from '../types';

interface CountriesViewProps {
  countries: Country[];
  onSaveCountry: (country: Country) => void;
  onDeleteCountry: (countryId: string) => void;
}

export const CountriesView: React.FC<CountriesViewProps> = ({
  countries,
  onSaveCountry,
  onDeleteCountry
}) => {
  const [filterType, setFilterType] = useState<'all' | 'sponsor' | 'worker'>('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);

  const [formData, setFormData] = useState<Partial<Country>>({
    name: '',
    code: '',
    phone_code: '+',
    flag_emoji: '🏳️',
    is_sponsor_country: false
  });

  const openNewModal = () => {
    setFormData({
      name: '',
      code: '',
      phone_code: '+',
      flag_emoji: '🏳️',
      is_sponsor_country: false
    });
    setEditingCountry(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Country) => {
    setFormData({ ...c });
    setEditingCountry(c);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone_code) {
      alert('يرجى إدخال اسم الدولة وكود الاتصال الدولي');
      return;
    }

    const countryToSave: Country = {
      id: editingCountry ? editingCountry.id : `c_${Date.now()}`,
      name: formData.name || '',
      code: formData.code?.toUpperCase() || 'XX',
      phone_code: formData.phone_code?.startsWith('+') ? formData.phone_code : `+${formData.phone_code}`,
      flag_emoji: formData.flag_emoji || '🏳️',
      is_sponsor_country: !!formData.is_sponsor_country
    };

    onSaveCountry(countryToSave);
    setIsModalOpen(false);
  };

  const filtered = countries.filter(c => {
    if (filterType === 'sponsor' && !c.is_sponsor_country) return false;
    if (filterType === 'worker' && c.is_sponsor_country) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.phone_code.includes(search)) return false;
    return true;
  });

  return (
    <div id="countries-view-root" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-emerald-600" />
            <span>جدول الدول (دول الكفلاء ودول الاستقدام)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">
            إضافة وتعديل الدول، أكواد الاتصال الدولي، وتحديد إن كانت دولة كفيل (مستقدم) أو دولة عامل (استقدام)
          </p>
        </div>

        <button
          id="btn-add-country"
          onClick={openNewModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة دولة جديدة</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterType === 'all' ? 'bg-white dark:bg-slate-900 dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            جميع الدول ({countries.length})
          </button>
          <button
            onClick={() => setFilterType('sponsor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterType === 'sponsor' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            دول الكفلاء ({countries.filter(c => c.is_sponsor_country).length})
          </button>
          <button
            onClick={() => setFilterType('worker')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterType === 'worker' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            دول الاستقدام ({countries.filter(c => !c.is_sponsor_country).length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو كود الاتصال..."
            className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50"
          />
          <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400 dark:text-slate-500 dark:text-slate-400" />
        </div>
      </div>

      {/* Countries Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {filtered.map(country => (
          <div
            key={country.id}
            className="bg-white dark:bg-slate-900 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl leading-none">{country.flag_emoji || '🏳️'}</span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{country.name}</h3>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 dark:text-slate-400 font-mono font-semibold uppercase">{country.code}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(country)}
                    className="p-1.5 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`هل ترغب بحذف دولة ${country.name}؟`)) {
                        onDeleteCountry(country.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-[11px]">كود الاتصال الدولي:</span>
                  <span className="font-mono font-bold text-emerald-800 dir-ltr">{country.phone_code}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-[11px]">تصنيف الدولة:</span>
                  {country.is_sponsor_country ? (
                    <span className="text-emerald-800 font-bold text-[11px] bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-md">
                      دولة كفيل (مستقدم)
                    </span>
                  ) : (
                    <span className="text-blue-800 font-bold text-[11px] bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-md">
                      دولة عامل (استقدام)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">
            <div className="bg-slate-900 dark:bg-slate-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">{editingCountry ? 'تعديل بيانات الدولة' : 'إضافة دولة جديدة'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">اسم الدولة:</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="مثال: المملكة العربية السعودية"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">كود الاتصال الدولي:</label>
                  <input
                    type="text"
                    value={formData.phone_code || ''}
                    onChange={(e) => setFormData(p => ({ ...p, phone_code: e.target.value }))}
                    placeholder="+966"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50 font-mono dir-ltr text-right"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">رمز العلم (Emoji):</label>
                  <input
                    type="text"
                    value={formData.flag_emoji || ''}
                    onChange={(e) => setFormData(p => ({ ...p, flag_emoji: e.target.value }))}
                    placeholder="🇸🇦"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50 text-center text-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">رمز الدولة (ISO Code):</label>
                <input
                  type="text"
                  value={formData.code || ''}
                  onChange={(e) => setFormData(p => ({ ...p, code: e.target.value }))}
                  placeholder="SA"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50 font-mono uppercase"
                />
              </div>

              {/* Sponsor Country Checkbox */}
              <div className="bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_sponsor_country || false}
                    onChange={(e) => setFormData(p => ({ ...p, is_sponsor_country: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block text-xs">تعيين كـ (دولة كفيل / مستقدم)</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 block">
                      عند التفعيل تظهر فقط في اختيار جنسية العميل، وعند الإلغاء تظهر في اختيار جنسية العامل المستقدم
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30"
                >
                  حفظ الدولة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
