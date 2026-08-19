import React, { useState } from 'react';
import { Building2, Save, CheckCircle2, Phone, Mail, MapPin, Printer, FileText, Globe2, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { OfficeProfile } from '../types';

interface OfficeProfileViewProps {
  officeProfile: OfficeProfile;
  onSaveProfile: (profile: OfficeProfile) => void;
}

export const OfficeProfileView: React.FC<OfficeProfileViewProps> = ({
  officeProfile,
  onSaveProfile
}) => {
  const [formData, setFormData] = useState<OfficeProfile>({ ...officeProfile });
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 2500);
  };

  return (
    <div id="office-profile-view-root" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span>بيانات وهوية مكتب الاستقدام</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            الاسم، السجل التجاري، رقم الترخيص، أرقام التواصل، الشعار، والشروط العامة المستخدمة في السندات والإيصالات
          </p>
        </div>

        <button
          id="btn-save-office-profile-top"
          onClick={handleSubmit}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
        >
          <Save className="w-4 h-4" />
          <span>حفظ التعديلات</span>
        </button>
      </div>

      {isSavedAlert && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>تم حفظ وتحديث بيانات المكتب بنجاح وتطبيقها في كامل المنظومة!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>البيانات الرسمية والتراخيص</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Office Name */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم المكتب التجاري الكامل:</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="مكتب النخبة الدولي للاستقدام"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs font-bold"
                required
              />
            </div>

            {/* License Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">رقم ترخيص الاستقدام:</label>
              <input
                type="text"
                value={formData.license_number || ''}
                onChange={(e) => setFormData(p => ({ ...p, license_number: e.target.value }))}
                placeholder="140889/استقدام"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs font-mono"
              />
            </div>

            {/* CR Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">رقم السجل التجاري (C.R):</label>
              <input
                type="text"
                value={formData.cr_number || ''}
                onChange={(e) => setFormData(p => ({ ...p, cr_number: e.target.value }))}
                placeholder="1010892741"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs font-mono"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">هاتف المكتب الثابت:</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                placeholder="0112839400"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs font-mono dir-ltr text-right"
              />
            </div>

            {/* Mobile / WhatsApp */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">جوال الاستقبال وخدمة العملاء:</label>
              <input
                type="text"
                value={formData.mobile || ''}
                onChange={(e) => setFormData(p => ({ ...p, mobile: e.target.value }))}
                placeholder="0501239988"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs font-mono dir-ltr text-right"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">البريد الإلكتروني الرسمي:</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                placeholder="info@recruitment.sa"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs"
              />
            </div>

            {/* Fax */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">الفاكس:</label>
              <input
                type="text"
                value={formData.fax || ''}
                onChange={(e) => setFormData(p => ({ ...p, fax: e.target.value }))}
                placeholder="0112839401"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs font-mono dir-ltr text-right"
              />
            </div>

            {/* Country & City */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">الدولة والمدينة:</label>
              <input
                type="text"
                value={formData.country ? `${formData.country} - ${formData.city}` : ''}
                onChange={(e) => {
                  const parts = e.target.value.split('-');
                  setFormData(p => ({
                    ...p,
                    country: parts[0]?.trim() || '',
                    city: parts[1]?.trim() || ''
                  }));
                }}
                placeholder="المملكة العربية السعودية - الرياض"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">العملة الافتراضية للعقود:</label>
              <input
                type="text"
                value={formData.default_currency || 'SAR'}
                onChange={(e) => setFormData(p => ({ ...p, default_currency: e.target.value }))}
                placeholder="SAR"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs font-mono font-bold"
              />
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">العنوان التفصيلي للمقر:</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                placeholder="طريق الملك فهد، برج النخبة، الطابق الرابع"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs"
              />
            </div>

            {/* Terms and Conditions for Contract Printing */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                بنود وشروط العقد الافتراضية (تظهر في إيصال وسند الاستقدام المطبوع):
              </label>
              <textarea
                value={formData.terms_and_conditions || ''}
                onChange={(e) => setFormData(p => ({ ...p, terms_and_conditions: e.target.value }))}
                rows={4}
                className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs leading-relaxed"
              />
            </div>

            {/* Footer note */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">تذييل السندات والإيصالات:</label>
              <input
                type="text"
                value={formData.footer_note || ''}
                onChange={(e) => setFormData(p => ({ ...p, footer_note: e.target.value }))}
                placeholder="شكراً لتعاملكم مع مكتبنا..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/30"
            >
              حفظ وتطبيق البيانات
            </button>
          </div>
        </div>

        {/* Right Column: Live Letterhead & Official Card Preview */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>معاينة ترويسة المكتب الرسمية:</span>
            </h4>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md ring-4 ring-emerald-100">
                {formData.name ? formData.name.charAt(0) : 'ن'}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 leading-snug">{formData.name}</h4>
                <div className="text-[11px] text-slate-500 mt-1">
                  ترخيص: <strong>{formData.license_number}</strong> • س.ت: <strong>{formData.cr_number}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 space-y-1 text-right">
                <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {formData.address} - {formData.city}</div>
                <div className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {formData.phone} | {formData.mobile}</div>
                <div className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {formData.email}</div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
