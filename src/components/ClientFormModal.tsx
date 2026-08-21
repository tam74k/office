import React, { useState, useEffect, useMemo } from 'react';
import { X, Users, Globe2, MapPin, Phone, Mail, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Client, Country, City } from '../types';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  clientToEdit?: Client | null;
  countries: Country[];
  cities: City[];
  onClientSavedAndSelect?: (client: Client) => void;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clientToEdit,
  countries,
  cities,
  onClientSavedAndSelect
}) => {
  const sponsorCountries = useMemo(() => {
    const list = countries.filter(c => c.is_sponsor_country);
    return list.length > 0 ? list : countries;
  }, [countries]);

  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    national_id: '',
    country_id: '',
    country_name: '',
    phone_code: '',
    mobile: '',
    city_id: '',
    city_name: '',
    address: '',
    email: '',
    notes: '',
    is_archived: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (clientToEdit) {
      setFormData({ ...clientToEdit });
    } else {
      setFormData({
        id: `cli_${Date.now()}`,
        name: '',
        national_id: '',
        country_id: '',
        country_name: '',
        phone_code: '',
        mobile: '',
        city_id: '',
        city_name: '',
        address: '',
        email: '',
        notes: '',
        is_archived: false,
        created_at: new Date().toISOString()
      });
    }
    setErrors({});
  }, [clientToEdit, isOpen, sponsorCountries, countries, cities]);

  const availableCities = useMemo(() => {
    if (!formData.country_id) return [];
    return cities.filter(c => c.country_id === formData.country_id);
  }, [cities, formData.country_id]);

  if (!isOpen) return null;

  const handleCountryChange = (countryId: string) => {
    const selected = countries.find(c => c.id === countryId);
    if (!selected) {
      setFormData(prev => ({
        ...prev,
        country_id: '',
        country_name: '',
        phone_code: '',
        city_id: '',
        city_name: ''
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      country_id: selected.id,
      country_name: selected.name,
      phone_code: selected.phone_code,
      city_id: '',
      city_name: ''
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'اسم العميل مطلوب';
    if (!formData.national_id?.trim()) newErrors.national_id = 'رقم الهوية / الإقامة مطلوب';
    if (!formData.mobile?.trim()) newErrors.mobile = 'رقم الجوال مطلوب';
    if (!formData.country_id) newErrors.country_id = 'دولة الكفيل مطلوبة';
    if (!formData.city_id) newErrors.city_id = 'المدينة مطلوبة';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const cleanedMobile = (formData.mobile || '').replace(/^0+/, '').replace(/\s+/g, '');
    const fullMobile = `${formData.phone_code || '+966'}${cleanedMobile}`;

    const clientToSave: Client = {
      id: formData.id || `cli_${Date.now()}`,
      name: formData.name!.trim(),
      national_id: formData.national_id!.trim(),
      country_id: formData.country_id!,
      country_name: formData.country_name!,
      phone_code: formData.phone_code!,
      mobile: cleanedMobile,
      full_mobile: fullMobile,
      city_id: formData.city_id!,
      city_name: formData.city_name!,
      address: formData.address || '',
      email: formData.email || '',
      notes: formData.notes || '',
      is_archived: formData.is_archived || false,
      created_at: formData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onSave(clientToSave);
    if (onClientSavedAndSelect) {
      onClientSavedAndSelect(clientToSave);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-xs" dir="rtl">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 dark:bg-slate-950 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {clientToEdit ? 'تعديل بيانات العميل (الكفيل)' : 'تسجيل عميل (كفيل) جديد'}
              </h3>
              <p className="text-xs text-slate-300">
                أدخل بيانات العميل للتسجيل وربط طلبات الاستقدام
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-white hover:bg-slate-800 dark:hover:bg-slate-800 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                اسم العميل (الكفيل) الكامل <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: سيد القحطاني"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 transition-all ${
                    errors.name ? 'border-red-500 ring-red-200' : 'border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name}</p>}
            </div>

            {/* National ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                رقم الهوية الوطنية / الإقامة <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.national_id || ''}
                  onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                  placeholder="مثال: 1084729183"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 transition-all ${
                    errors.national_id ? 'border-red-500 ring-red-200' : 'border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                />
              </div>
              {errors.national_id && <p className="text-xs text-red-500 mt-1 font-medium">{errors.national_id}</p>}
            </div>

            {/* Sponsor Country Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                دولة الكفيل <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.country_id || ''}
                onChange={(e) => handleCountryChange(e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 transition-all ${
                  errors.country_id ? 'border-red-500 ring-red-200' : 'border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-200'
                }`}
              >
                <option value="">اختر الدولة...</option>
                {sponsorCountries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.flag_emoji} {c.name} ({c.phone_code})
                  </option>
                ))}
              </select>
              {errors.country_id && <p className="text-xs text-red-500 mt-1 font-medium">{errors.country_id}</p>}
            </div>

            {/* Mobile with Auto Dial Code */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                رقم الجوال <span className="text-red-500">*</span> (يضاف رمز الدولة تلقائياً)
              </label>
              <div className="flex items-center gap-2">
                <div className="px-3.5 py-2.5 bg-slate-200 dark:bg-slate-700/80 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 select-none min-w-[75px] text-center" dir="ltr">
                  {formData.phone_code || '+966'}
                </div>
                <input
                  type="tel"
                  value={formData.mobile || ''}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="501234567"
                  className={`flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 transition-all ${
                    errors.mobile ? 'border-red-500 ring-red-200' : 'border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-200'
                  }`}
                  dir="ltr"
                />
              </div>
              {errors.mobile && <p className="text-xs text-red-500 mt-1 font-medium">{errors.mobile}</p>}
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                المدينة
              </label>
              <select
                value={formData.city_id || ''}
                onChange={(e) => {
                  const selectedCity = availableCities.find(c => c.id === e.target.value);
                  setFormData({
                    ...formData,
                    city_id: e.target.value,
                    city_name: selectedCity ? selectedCity.name : ''
                  });
                }}
                disabled={!formData.country_id}
                className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 transition-all ${
                  errors.city_id ? 'border-red-500 ring-red-200' : 'border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-200'
                }`}
              >
                <option value="">اختر المدينة...</option>
                {availableCities.map((ct) => (
                  <option key={ct.id} value={ct.id}>
                    {ct.name}
                  </option>
                ))}
              </select>
              {errors.city_id && <p className="text-xs text-red-500 mt-1 font-medium">{errors.city_id}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                البريد الإلكتروني (اختياري)
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@mail.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                dir="ltr"
              />
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                العنوان بالتفصيل
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="مثال: الرياض - حي الياسمين - شارع أنس بن مالك"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                ملاحظات إضافية
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                placeholder="تفضيلات العميل، اشتراطات خاصة..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{clientToEdit ? 'حفظ التعديلات' : 'تسجيل العميل'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
