import React from 'react';
import { X, Printer, CheckCircle, FileText, Phone, MapPin, Mail, ShieldCheck } from 'lucide-react';
import { Order, OfficeProfile } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';

interface ReceiptPrintModalProps {
  order: Order | null;
  officeProfile: OfficeProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({
  order,
  officeProfile,
  isOpen,
  onClose
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      id="receipt-print-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 no-print-bg"
    >
      <div 
        id="receipt-dialog"
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-4 text-slate-800"
      >
        {/* Action Header - Hidden when printing */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">معاينة وطباعة إيصال وسند طلب الاستقدام</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-trigger-print"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-emerald-600/30"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الإيصال فوراً</span>
            </button>
            <button
              id="btn-close-receipt-modal"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas Area */}
        <div id="printable-receipt-content" className="p-6 sm:p-8 bg-white print:p-0">
          {/* Office Official Header */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-black text-2xl shadow-md ring-4 ring-emerald-100">
                  {officeProfile.name ? officeProfile.name.charAt(0) : 'ن'}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                    {officeProfile.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1.5 font-medium">
                    <span>ترخيص رقم: <strong className="text-slate-900">{officeProfile.license_number}</strong></span>
                    <span>•</span>
                    <span>س.ت: <strong className="text-slate-900">{officeProfile.cr_number}</strong></span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-left text-xs space-y-1 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 justify-end">
                  <span>سند استقدام وعقد طلب رسمي</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="dir-ltr text-right font-mono text-emerald-700 font-bold">
                  {order.order_number}
                </div>
                <div>تاريخ العقد: {formatDate(order.contract_date || order.created_at)}</div>
              </div>
            </div>

            {/* Office Contact Strip */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {officeProfile.address} - {officeProfile.city}</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {officeProfile.phone} | {officeProfile.mobile}</span>
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {officeProfile.email}</span>
            </div>
          </div>

          {/* Client & Order Overview Grid */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              بيانات العميل (الكفيل) والطلب
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">اسم العميل:</span>
                <span className="font-bold text-slate-900 text-sm">{order.client_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">رقم الجوال:</span>
                <span className="font-mono font-bold text-slate-900 dir-ltr text-right inline-block">{order.client_mobile}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">الدولة والمدينة:</span>
                <span className="font-semibold text-slate-900">{order.sponsor_country_name} - {order.city_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">حالة الطلب:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle className="w-3 h-3" /> {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Requested Workers Table */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>تفاصيل العمالة والمهن المطلوبة ({order.items.length})</span>
              <span className="text-emerald-700 font-normal text-[11px]">تفاصيل الكوادر</span>
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">المهنة المطلوبة</th>
                    <th className="p-2.5">دولة الاستقدام</th>
                    <th className="p-2.5">العمر المطلوب</th>
                    <th className="p-2.5">الجنس والديانة</th>
                    <th className="p-2.5">الخبرة المطلوبة</th>
                    <th className="p-2.5">الراتب المتفق عليه</th>
                    <th className="p-2.5">المرشح / الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/60">
                      <td className="p-2.5 font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-2.5 font-bold text-slate-900">{item.profession_name}</td>
                      <td className="p-2.5 font-medium text-slate-800">{item.worker_country_name}</td>
                      <td className="p-2.5 text-slate-600">من {item.age_min} إلى {item.age_max} سنة</td>
                      <td className="p-2.5 text-slate-600">{item.gender} • {item.religion}</td>
                      <td className="p-2.5 text-slate-600">{item.experience_type} {item.experience_years ? `(${item.experience_years} سنوات)` : ''}</td>
                      <td className="p-2.5 font-bold font-mono text-emerald-700">{formatCurrency(item.salary, item.currency)}</td>
                      <td className="p-2.5">
                        <div className="font-semibold text-slate-800">{item.candidate_name || 'قيد الترشيح'}</div>
                        <div className="text-[10px] text-slate-500">{item.status}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {order.notes && (
              <div className="mt-2.5 text-xs text-slate-600 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60">
                <strong className="text-amber-900">ملاحظات وشروط خاصة:</strong> {order.notes}
              </div>
            )}
          </div>

          {/* Financial Summary & Calculations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-800 mb-1">تفاصيل السداد والدفع</div>
              <div className="flex justify-between text-slate-600">
                <span>طريقة الدفع المعتمدة:</span>
                <span className="font-semibold text-slate-900">{order.payment_method || 'نقدي / تحويل'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>الوصول المتوقع:</span>
                <span className="font-semibold text-slate-900">{formatDate(order.expected_arrival_date) || 'خلال المدة النظامية'}</span>
              </div>
            </div>

            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700">
                <span>إجمالي تكلفة الاستقدام:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{formatCurrency(order.total_cost, officeProfile.default_currency)}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-800">
                <span>المبلغ المسدد (الدفعة المقدمة):</span>
                <span className="font-bold font-mono text-sm">{formatCurrency(order.paid_amount, officeProfile.default_currency)}</span>
              </div>
              <div className="pt-2 border-t border-emerald-200 flex justify-between items-center text-slate-900">
                <span className="font-black text-sm">المتبقي عند الاستلام:</span>
                <span className="font-black font-mono text-base text-rose-700">{formatCurrency(order.remaining_amount, officeProfile.default_currency)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="text-[11px] text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-6 leading-relaxed">
            <div className="font-bold text-slate-800 mb-1">الشروط والأحكام العامة للاستقدام:</div>
            <p className="whitespace-pre-line text-slate-600">{officeProfile.terms_and_conditions}</p>
          </div>

          {/* Signatures & Stamps Footer */}
          <div className="pt-4 border-t-2 border-dashed border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="text-slate-500 font-medium mb-10">توقيع العميل (الكفيل) والموافقة:</div>
              <div className="border-b border-slate-400 w-36 mx-auto mb-1"></div>
              <div className="text-slate-700 font-semibold">{order.client_name}</div>
            </div>
            <div>
              <div className="text-slate-500 font-medium mb-10">ختم وتوقيع المدير المسؤول:</div>
              <div className="border-b border-slate-400 w-36 mx-auto mb-1"></div>
              <div className="text-slate-700 font-semibold">{officeProfile.name}</div>
            </div>
          </div>

          {/* Printable Footer Note */}
          <div className="text-center text-[10px] text-slate-400 mt-6">
            {officeProfile.footer_note}
          </div>
        </div>
      </div>
    </div>
  );
};
