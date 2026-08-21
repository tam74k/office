import React, { useState, useMemo } from 'react';
import { Client, Order, Country, Profession, OfficeProfile } from '../types';
import { Printer, Filter, Calendar } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { ClientAutocomplete, CountryAutocomplete, ProfessionAutocomplete } from './FormAutocomplete';

interface ReportsViewProps {
  orders: Order[];
  clients: Client[];
  countries: Country[];
  professions: Profession[];
  officeProfile: OfficeProfile;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  orders,
  clients,
  countries,
  professions,
  officeProfile,
}) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedSponsorCountryId, setSelectedSponsorCountryId] = useState('');
  const [selectedWorkerCountryId, setSelectedWorkerCountryId] = useState('');
  const [selectedProfessionId, setSelectedProfessionId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const sponsorCountries = useMemo(() => {
    return countries.filter(c => c.is_sponsor_country);
  }, [countries]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (selectedClientId && order.client_id !== selectedClientId) return false;

      if (selectedSponsorCountryId) {
        const sponsorCountry = sponsorCountries.find(c => c.id === selectedSponsorCountryId);
        const matchesId = order.sponsor_country_id === selectedSponsorCountryId;
        const matchesName = sponsorCountry && order.sponsor_country_name === sponsorCountry.name;
        if (!matchesId && !matchesName) return false;
      }

      if (selectedWorkerCountryId) {
        const workerCountry = countries.find(c => c.id === selectedWorkerCountryId);
        const hasMatchingCountry = order.items.some(item => 
          item.worker_country_id === selectedWorkerCountryId || 
          (workerCountry && item.worker_country_name === workerCountry.name)
        );
        if (!hasMatchingCountry) return false;
      }

      if (selectedProfessionId) {
        const profession = professions.find(p => p.id === selectedProfessionId);
        const hasMatchingProfession = order.items.some(item => 
          item.profession_id === selectedProfessionId ||
          (profession && item.profession_name === profession.name)
        );
        if (!hasMatchingProfession) return false;
      }

      if (startDate) {
        const orderDate = new Date(order.contract_date || order.created_at);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (orderDate < start) return false;
      }

      if (endDate) {
        const orderDate = new Date(order.contract_date || order.created_at);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (orderDate > end) return false;
      }

      return true;
    });
  }, [orders, selectedClientId, selectedSponsorCountryId, selectedWorkerCountryId, selectedProfessionId, startDate, endDate, sponsorCountries]);

  const handlePrint = () => {
    window.print();
  };

  const handleClearFilters = () => {
    setSelectedClientId('');
    setSelectedSponsorCountryId('');
    setSelectedWorkerCountryId('');
    setSelectedProfessionId('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      {/* Header (Hidden in Print) */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">التقارير</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">تصفية وطباعة تقارير الطلبات التفصيلية</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة التقرير</span>
        </button>
      </div>

      {/* Filters (Hidden in Print) */}
      <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm print:hidden space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">عوامل التصفية</h4>
          </div>
          <button
            onClick={handleClearFilters}
            className="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
          >
            تفريغ الحقول
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">العميل:</label>
            <div className="relative">
              <ClientAutocomplete
                clients={clients.filter(c => !c.is_archived)}
                selectedId={selectedClientId}
                onChange={(c) => setSelectedClientId(c ? c.id : '')}
                allowAll={true}
                placeholder="الكل..."
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">دولة الكفيل:</label>
            <div className="relative">
              <CountryAutocomplete
                countries={sponsorCountries}
                selectedId={selectedSponsorCountryId}
                onChange={(c) => setSelectedSponsorCountryId(c ? c.id : '')}
                onlyWorkerCountries={false}
                allowAll={true}
                placeholder="الكل..."
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">دولة الاستقدام (العامل):</label>
            <div className="relative">
              <CountryAutocomplete
                countries={countries}
                selectedId={selectedWorkerCountryId}
                onChange={(c) => setSelectedWorkerCountryId(c ? c.id : '')}
                onlyWorkerCountries={true}
                allowAll={true}
                placeholder="الكل..."
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">المهنة المطلوبة:</label>
            <div className="relative">
              <ProfessionAutocomplete
                professions={professions}
                selectedId={selectedProfessionId}
                onChange={(p) => setSelectedProfessionId(p ? p.id : '')}
                allowAll={true}
                placeholder="الكل..."
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">من تاريخ:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2 py-2 text-[10px] sm:text-xs rounded-xl border border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50 dark:bg-slate-950/50 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">إلى تاريخ:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2 py-2 text-[10px] sm:text-xs rounded-xl border border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50 dark:bg-slate-950/50 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Print Report Header (Visible ONLY in Print) */}
      <div className="hidden print:flex flex-row items-start justify-between border-b-2 border-slate-800 pb-4 mb-6">
        <div className="text-right">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{officeProfile.name || 'مكتب الاستقدام'}</h1>
          {officeProfile.cr_number && <p className="text-sm font-bold text-slate-700 dark:text-slate-200">رقم السجل التجاري: <span className="font-mono">{officeProfile.cr_number}</span></p>}
          {officeProfile.license_number && <p className="text-sm font-bold text-slate-700 dark:text-slate-200">ترخيص رقم: <span className="font-mono">{officeProfile.license_number}</span></p>}
        </div>
        <div className="text-left flex flex-col items-end justify-start">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 dark:text-slate-500 dark:text-slate-400 font-bold text-xl overflow-hidden">
            شعار المكتب
          </div>
        </div>
      </div>

      {/* Print Title (Visible ONLY in Print) */}
      <div className="hidden print:block text-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b-2 border-slate-300 dark:border-slate-600 inline-block pb-1 px-4">تقرير الطلبات التفصيلي</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 font-mono">
          تاريخ الطباعة: {formatDate(new Date().toISOString())}
        </p>
      </div>

      {/* Results Section */}
      <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden print:shadow-none print:border-none print:rounded-none">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 dark:bg-slate-900 dark:bg-slate-950/30 print:hidden">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <span>النتائج</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 text-[11px] font-bold font-mono">
              {filteredOrders.length}
            </span>
          </h3>
        </div>
        
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500 dark:text-slate-400 print:hidden">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">لا توجد نتائج مطابقة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs print:text-[10px]">
              <thead className="bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 print:bg-slate-200 dark:print:bg-slate-700 print:border-slate-400 print:text-black">
                <tr>
                  <th className="p-3 print:p-2 border-b print:border-slate-400">رقم الطلب</th>
                  <th className="p-3 print:p-2 border-b print:border-slate-400">التاريخ</th>
                  <th className="p-3 print:p-2 border-b print:border-slate-400">العميل</th>
                  <th className="p-3 print:p-2 border-b print:border-slate-400">الجوال</th>
                  <th className="p-3 print:p-2 border-b print:border-slate-400">المهن والجنسيات (الاستقدام)</th>
                  <th className="p-3 print:p-2 border-b print:border-slate-400">حالة الطلب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-slate-300">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 dark:hover:bg-slate-950/80 transition-colors print:hover:bg-transparent">
                    <td className="p-3 print:p-2 font-mono font-bold text-slate-900 dark:text-white print:text-black">{order.order_number}</td>
                    <td className="p-3 print:p-2 font-mono text-slate-600 dark:text-slate-300 print:text-black">{formatDate(order.contract_date || order.created_at)}</td>
                    <td className="p-3 print:p-2 font-bold text-slate-900 dark:text-white print:text-black">{order.client_name}</td>
                    <td className="p-3 print:p-2 font-mono text-slate-600 dark:text-slate-300 print:text-black" dir="ltr">{order.client_mobile}</td>
                    <td className="p-3 print:p-2">
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <span className="font-bold text-slate-800 dark:text-slate-100 print:text-black">{item.profession_name}</span>
                            <span className="text-slate-400 dark:text-slate-500 dark:text-slate-400 print:text-black">من</span>
                            <span className="font-bold text-emerald-700 print:text-black">{item.worker_country_name}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 print:p-2 font-bold text-slate-700 dark:text-slate-200 print:text-black">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Print Report Footer (Visible ONLY in Print) */}
      <div className="hidden print:block mt-8 pt-4 border-t-2 border-slate-800 text-center space-y-2">
        {officeProfile.address && <p className="text-sm text-slate-800 dark:text-slate-100 font-bold">{officeProfile.address} {officeProfile.city && ` - ${officeProfile.city}`}</p>}
        <div className="flex justify-center gap-6 font-mono font-bold text-sm text-slate-800 dark:text-slate-100" dir="ltr">
          {officeProfile.phone && <span>{officeProfile.phone}</span>}
          {officeProfile.mobile && <span>{officeProfile.mobile}</span>}
        </div>
      </div>
    </div>
  );
};
