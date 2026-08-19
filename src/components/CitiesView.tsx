import React, { useState } from 'react';
import { MapPin, Plus, Edit3, Trash2, Search, X, Globe2 } from 'lucide-react';
import { City, Country } from '../types';

interface CitiesViewProps {
  cities: City[];
  countries: Country[];
  onSaveCity: (city: City) => void;
  onDeleteCity: (cityId: string) => void;
}

export const CitiesView: React.FC<CitiesViewProps> = ({
  cities,
  countries,
  onSaveCity,
  onDeleteCity
}) => {
  const [selectedCountryId, setSelectedCountryId] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);

  const [formData, setFormData] = useState<Partial<City>>({
    name: '',
    country_id: countries[0]?.id || ''
  });

  const openNewModal = () => {
    setFormData({
      name: '',
      country_id: selectedCountryId !== 'all' ? selectedCountryId : (countries[0]?.id || '')
    });
    setEditingCity(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: City) => {
    setFormData({ ...c });
    setEditingCity(c);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.country_id) {
      alert('يرجى كتابة اسم المدينة واختيار الدولة');
      return;
    }

    const country = countries.find(x => x.id === formData.country_id);

    const cityToSave: City = {
      id: editingCity ? editingCity.id : `ct_${Date.now()}`,
      name: formData.name || '',
      country_id: formData.country_id || '',
      country_name: country?.name || ''
    };

    onSaveCity(cityToSave);
    setIsModalOpen(false);
  };

  const filteredCities = cities.filter(c => {
    if (selectedCountryId !== 'all' && c.country_id !== selectedCountryId) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div id="cities-view-root" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <span>جدول المدن والمناطق</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة المدن التابعة لكل دولة، لتصفية المدن المتاحة تلقائياً عند تسجيل أو تعديل بيانات الكفيل
          </p>
        </div>

        <button
          id="btn-add-city"
          onClick={openNewModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مدينة جديدة</span>
        </button>
      </div>

      {/* Filter by Country & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Country Selector Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">تصفية حسب الدولة:</label>
          <select
            value={selectedCountryId}
            onChange={(e) => setSelectedCountryId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 font-medium"
          >
            <option value="all">جميع الدول ({cities.length} مدينة)</option>
            {countries.map(c => {
              const count = cities.filter(city => city.country_id === c.id).length;
              return (
                <option key={c.id} value={c.id}>
                  {c.flag_emoji} {c.name} ({count} مدينة)
                </option>
              );
            })}
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">بحث عن اسم المدينة:</label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="مثال: الرياض، دبي، الكويت..."
              className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50"
            />
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Cities Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filteredCities.map(city => {
          const country = countries.find(c => c.id === city.country_id);
          return (
            <div
              key={city.id}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-xl shrink-0">{country?.flag_emoji || '📍'}</span>
                    <h3 className="font-bold text-xs text-slate-900 truncate">{city.name}</h3>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => openEditModal(city)}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`هل ترغب بحذف مدينة ${city.name}؟`)) {
                          onDeleteCity(city.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-medium truncate">
                  {country?.name || 'دولة'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit City Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 text-slate-800">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">{editingCity ? 'تعديل اسم المدينة' : 'إضافة مدينة جديدة'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">الدولة التابعة لها المدينة:</label>
                <select
                  value={formData.country_id || ''}
                  onChange={(e) => setFormData(p => ({ ...p, country_id: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold"
                  required
                >
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.flag_emoji} {c.name} {c.is_sponsor_country ? '(دولة كفيل)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم المدينة:</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="مثال: الرياض، دبي، الخبر..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50"
                  required
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
                  حفظ المدينة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
