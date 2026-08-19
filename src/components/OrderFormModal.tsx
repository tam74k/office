import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  FileText, 
  Users, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Search, 
  Briefcase, 
  Coins, 
  UserCheck, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Order, OrderItem, Client, Country, Profession, OrderStatus, OfficeProfile } from '../types';
import { formatCurrency } from '../utils/helpers';
import { ProfessionAutocomplete, CountryAutocomplete } from './FormAutocomplete';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Order) => void;
  orderToEdit?: Order | null;
  clients: Client[];
  countries: Country[];
  professions: Profession[];
  officeProfile: OfficeProfile;
  preselectedClient?: Client | null;
  onOpenNewClientModal: () => void;
}

const ORDER_STATUSES: OrderStatus[] = ['جديد', 'تم الاختيار', 'كشف طبي', 'تم التفييز', 'تم السفر', 'ملغي'];

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  orderToEdit,
  clients,
  countries,
  professions,
  officeProfile,
  preselectedClient,
  onOpenNewClientModal
}) => {
  const workerCountries = useMemo(() => {
    const list = countries.filter(c => !c.is_sponsor_country);
    return list.length > 0 ? list : countries;
  }, [countries]);

  const [formData, setFormData] = useState<Partial<Order>>({
    order_number: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    client_id: '',
    client_name: '',
    client_mobile: '',
    sponsor_country_id: '',
    sponsor_country_name: '',
    city_name: '',
    status: 'جديد',
    total_cost: 0,
    paid_amount: 0,
    remaining_amount: 0,
    payment_method: 'تحويل بنكي',
    contract_date: new Date().toISOString().split('T')[0],
    expected_arrival_date: '',
    notes: '',
    items: []
  });

  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize or reset form
  useEffect(() => {
    if (orderToEdit) {
      setFormData({ ...orderToEdit });
      setClientSearchQuery(orderToEdit.client_name || '');
    } else {
      const targetClient = preselectedClient || null;
      const generatedOrderNo = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const initialItem: OrderItem = {
        id: `item_${Date.now()}_1`,
        order_id: '',
        profession_id: '',
        profession_name: '',
        worker_country_id: '',
        worker_country_name: '',
        age_min: undefined,
        age_max: undefined,
        gender: '',
        religion: '',
        experience_type: '',
        experience_years: undefined,
        salary: undefined,
        currency: 'SAR',
        recruitment_cost: undefined,
        status: 'جديد',
        notes: ''
      };

      setFormData({
        id: `ord_${Date.now()}`,
        order_number: generatedOrderNo,
        client_id: targetClient?.id || '',
        client_name: targetClient?.name || '',
        client_mobile: targetClient?.full_mobile || targetClient?.mobile || '',
        sponsor_country_id: targetClient?.country_id || 'c_sa',
        sponsor_country_name: targetClient?.country_name || 'المملكة العربية السعودية',
        city_name: targetClient?.city_name || '',
        status: 'جديد',
        total_cost: 12000,
        paid_amount: 5000,
        remaining_amount: 7000,
        payment_method: 'تحويل بنكي',
        contract_date: new Date().toISOString().split('T')[0],
        expected_arrival_date: '',
        notes: '',
        items: [initialItem],
        created_at: new Date().toISOString()
      });
      setClientSearchQuery(targetClient?.name || '');
    }
    setErrors({});
  }, [orderToEdit, preselectedClient, isOpen, clients, professions, workerCountries]);

  // Recalculate total and remaining whenever items or paid amount change
  const handleItemCostChange = (itemId: string, newCost: number) => {
    const updatedItems = (formData.items || []).map(it => {
      if (it.id === itemId) return { ...it, recruitment_cost: Number(newCost) || 0 };
      return it;
    });

    const newTotal = updatedItems.reduce((sum, it) => sum + (Number(it.recruitment_cost) || 0), 0);
    const paid = Number(formData.paid_amount) || 0;

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      total_cost: newTotal,
      remaining_amount: Math.max(0, newTotal - paid)
    }));
  };

  const handlePaidAmountChange = (paidVal: number) => {
    const paid = Number(paidVal) || 0;
    const total = Number(formData.total_cost) || 0;
    setFormData(prev => ({
      ...prev,
      paid_amount: paid,
      remaining_amount: Math.max(0, total - paid)
    }));
  };

  const handleSelectClient = (client: Client) => {
    setFormData(prev => ({
      ...prev,
      client_id: client.id,
      client_name: client.name,
      client_mobile: client.full_mobile || client.mobile,
      sponsor_country_id: client.country_id,
      sponsor_country_name: client.country_name || '',
      city_name: client.city_name || ''
    }));
    setClientSearchQuery(client.name);
    setShowClientDropdown(false);
    setErrors(prev => ({ ...prev, client_id: '' }));
  };

  // Add Item
  const handleAddItem = () => {
    const newItem: OrderItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      order_id: formData.id || '',
      profession_id: '',
      profession_name: '',
      worker_country_id: '',
      worker_country_name: '',
      age_min: undefined,
      age_max: undefined,
      gender: '',
      religion: '',
      experience_type: '',
      experience_years: undefined,
      salary: undefined,
      currency: 'SAR',
      recruitment_cost: undefined,
      status: 'جديد',
      notes: ''
    };

    const updatedItems = [...(formData.items || []), newItem];
    const newTotal = updatedItems.reduce((sum, it) => sum + (Number(it.recruitment_cost) || 0), 0);
    const paid = Number(formData.paid_amount) || 0;

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      total_cost: newTotal,
      remaining_amount: Math.max(0, newTotal - paid)
    }));
  };

  // Remove Item
  const handleRemoveItem = (itemId: string) => {
    if ((formData.items || []).length <= 1) {
      alert('يجب أن يحتوي الطلب على طلب مهنة واحد على الأقل.');
      return;
    }
    const updatedItems = (formData.items || []).filter(it => it.id !== itemId);
    const newTotal = updatedItems.reduce((sum, it) => sum + (Number(it.recruitment_cost) || 0), 0);
    const paid = Number(formData.paid_amount) || 0;

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      total_cost: newTotal,
      remaining_amount: Math.max(0, newTotal - paid)
    }));
  };

  // Update item details
  const handleUpdateItemField = (itemId: string, field: keyof OrderItem, value: any) => {
    const updatedItems = (formData.items || []).map(it => {
      if (it.id !== itemId) return it;
      
      const updated = { ...it, [field]: value };
      if (field === 'profession_id') {
        const found = professions.find(p => p.id === value);
        if (found) {
          updated.profession_name = found.name;
          updated.salary = found.default_salary;
        }
      }
      if (field === 'worker_country_id') {
        const found = countries.find(c => c.id === value);
        if (found) {
          updated.worker_country_name = found.name;
        }
      }
      return updated;
    });

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const filteredClients = useMemo(() => {
    if (!clientSearchQuery) return clients;
    return clients.filter(c => 
      c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
      c.national_id.includes(clientSearchQuery) ||
      c.mobile.includes(clientSearchQuery)
    );
  }, [clients, clientSearchQuery]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.client_id) newErrors.client_id = 'يجب اختيار العميل (الكفيل) أولاً';
    if (!formData.order_number?.trim()) newErrors.order_number = 'رقم الطلب مطلوب';
    if (!formData.items || formData.items.length === 0) newErrors.items = 'يجب إضافة مهنة واحدة على الأقل في الطلب';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const orderToSave: Order = {
      id: formData.id || `ord_${Date.now()}`,
      order_number: formData.order_number!.trim(),
      client_id: formData.client_id!,
      client_name: formData.client_name!,
      client_mobile: formData.client_mobile || '',
      sponsor_country_id: formData.sponsor_country_id || 'c_sa',
      sponsor_country_name: formData.sponsor_country_name || '',
      city_name: formData.city_name || '',
      status: formData.status || 'جديد',
      total_cost: Number(formData.total_cost) || 0,
      paid_amount: Number(formData.paid_amount) || 0,
      remaining_amount: Number(formData.remaining_amount) || 0,
      payment_method: formData.payment_method || 'تحويل بنكي',
      contract_date: formData.contract_date || new Date().toISOString().split('T')[0],
      expected_arrival_date: formData.expected_arrival_date || '',
      notes: formData.notes || '',
      items: formData.items || [],
      created_at: formData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onSave(orderToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-xs" dir="rtl">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {orderToEdit ? `تعديل طلب استقدام: ${orderToEdit.order_number}` : 'إنشاء طلب استقدام جديد'}
              </h3>
              <p className="text-xs text-slate-300">
                تسجيل طلب رئيسي يحتوي على مهنة أو عدة مهن للعميل ذاته تحت عقد واحد
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Section 1: Client Selection & Contract Numbers */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>بيانات العميل (الكفيل) والعقد</span>
              </h4>
              <button
                type="button"
                onClick={onOpenNewClientModal}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ عميل جديد من هنا</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Client Selection */}
              <div className="sm:col-span-2 relative">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اختر العميل (الكفيل) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={clientSearchQuery}
                    onChange={(e) => {
                      setClientSearchQuery(e.target.value);
                      setShowClientDropdown(true);
                    }}
                    onFocus={() => setShowClientDropdown(true)}
                    placeholder="ابحث بالاسم أو رقم الهوية أو الجوال..."
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-hidden focus:ring-2 transition-all ${
                      errors.client_id ? 'border-red-500 ring-red-200' : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-200'
                    }`}
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>

                {/* Autocomplete Dropdown */}
                {showClientDropdown && (
                  <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {filteredClients.length > 0 ? (
                      filteredClients.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectClient(c)}
                          className="w-full text-right px-4 py-2.5 hover:bg-emerald-50 transition-colors flex items-center justify-between text-xs cursor-pointer"
                        >
                          <div>
                            <p className="font-bold text-slate-800">{c.name}</p>
                            <p className="text-slate-500 text-[11px]">هوية: {c.national_id} | {c.city_name || c.country_name}</p>
                          </div>
                          <span className="font-mono text-emerald-600 font-bold" dir="ltr">{c.full_mobile || c.mobile}</span>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-500">
                        لا يوجد عميل بهذا الاسم. يمكنك الضغط على "+ عميل جديد" لإضافته مباشرة.
                      </div>
                    )}
                  </div>
                )}
                {errors.client_id && <p className="text-xs text-red-500 mt-1 font-medium">{errors.client_id}</p>}
              </div>

              {/* Order Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الطلب <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.order_number || ''}
                  onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-center"
                />
              </div>
            </div>

            {/* Selected Client Info Card Preview */}
            {formData.client_id && (
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800">العميل المعتمد: {formData.client_name}</span>
                  <span className="text-slate-500">({formData.sponsor_country_name} - {formData.city_name})</span>
                </div>
                <span className="font-mono font-bold text-emerald-700" dir="ltr">{formData.client_mobile}</span>
              </div>
            )}
          </div>

          {/* Section 2: Multi-Item Worker Requests */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>المهن والعمالة المطلوبة في هذا الطلب ({formData.items?.length || 0})</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  يمكنك إضافة أكثر من مهنة (مثل: سائق من الهند + طباخ من السودان) تحت نفس الطلب
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ إضافة مهنة أخرى</span>
              </button>
            </div>

            {/* Items Cards */}
            <div className="space-y-3">
              {(formData.items || []).map((item, idx) => (
                <div key={item.id} className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 relative group transition-all hover:border-slate-300">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                    <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[11px] font-bold">
                        {idx + 1}
                      </span>
                      <span>المهنة رقم #{idx + 1}: {item.profession_name || 'مهنة'}</span>
                    </span>
                    {(formData.items || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف المهنة</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Profession with Autocomplete */}
                    <div className="relative">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        المهنة <span className="text-emerald-600 font-normal">(إكمال تلقائي)</span>
                      </label>
                      <ProfessionAutocomplete
                        professions={professions}
                        selectedId={item.profession_id}
                        onChange={(selectedProf) => {
                          handleUpdateItemField(item.id, 'profession_id', selectedProf.id);
                        }}
                      />
                    </div>

                    {/* Worker Country with Autocomplete */}
                    <div className="relative">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        دولة الاستقدام <span className="text-emerald-600 font-normal">(إكمال تلقائي)</span>
                      </label>
                      <CountryAutocomplete
                        countries={countries}
                        selectedId={item.worker_country_id}
                        onlyWorkerCountries={true}
                        onChange={(selectedCountry) => {
                          handleUpdateItemField(item.id, 'worker_country_id', selectedCountry.id);
                        }}
                      />
                    </div>

                    {/* Age Range */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">العمر (من - إلى)</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={item.age_min || 25}
                          onChange={(e) => handleUpdateItemField(item.id, 'age_min', Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center"
                          placeholder="من"
                        />
                        <span className="text-slate-400 text-xs">-</span>
                        <input
                          type="number"
                          value={item.age_max || 40}
                          onChange={(e) => handleUpdateItemField(item.id, 'age_max', Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center"
                          placeholder="إلى"
                        />
                      </div>
                    </div>

                    {/* Cost */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">تكلفة الاستقدام (ريال)</label>
                      <input
                        type="number"
                        value={item.recruitment_cost || 0}
                        onChange={(e) => handleItemCostChange(item.id, Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500 text-center"
                      />
                    </div>

                    {/* Experience Type */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">نوع الخبرة</label>
                      <select
                        value={item.experience_type || ''}
                        onChange={(e) => handleUpdateItemField(item.id, 'experience_type', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-emerald-500"
                      >
                        <option value="">الخبرة...</option>
                        <option value="جديد (بدون خبرة)">جديد (بدون خبرة)</option>
                        <option value="خبرة سابقة بالخليج">خبرة سابقة بالخليج</option>
                        <option value="خبرة محلية">خبرة محلية</option>
                        <option value="خبرة عامة">خبرة عامة</option>
                      </select>
                    </div>

                    {/* Candidate Name (if chosen) */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">اسم المرشح (إن وجد)</label>
                      <input
                        type="text"
                        value={item.candidate_name || ''}
                        onChange={(e) => handleUpdateItemField(item.id, 'candidate_name', e.target.value)}
                        placeholder="اسم العامل/العاملة"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    {/* Item Status */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">حالة المهنة</label>
                      <select
                        value={item.status || 'جديد'}
                        onChange={(e) => handleUpdateItemField(item.id, 'status', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-emerald-500"
                      >
                        {ORDER_STATUSES.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Financials & Status */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>البيانات المالية ومرحلة العقد</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Cost */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">إجمالي التكلفة</label>
                <div className="p-2.5 bg-white border border-slate-300 rounded-xl text-center font-bold text-base text-slate-800">
                  {formatCurrency(formData.total_cost || 0)}
                </div>
              </div>

              {/* Paid Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المدفوع (المقدم)</label>
                <input
                  type="number"
                  value={formData.paid_amount || 0}
                  onChange={(e) => handlePaidAmountChange(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-emerald-600 text-center focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                />
              </div>

              {/* Remaining Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المتبقي</label>
                <div className="p-2.5 bg-white border border-slate-300 rounded-xl text-center font-bold text-base text-amber-600">
                  {formatCurrency(formData.remaining_amount || 0)}
                </div>
              </div>

              {/* Overall Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">حالة الطلب العامة</label>
                <select
                  value={formData.status || 'جديد'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as OrderStatus })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                >
                  {ORDER_STATUSES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">طريقة السداد</label>
                <select
                  value={formData.payment_method || 'تحويل بنكي'}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="تحويل بنكي">تحويل بنكي</option>
                  <option value="نقداً (كاش)">نقداً (كاش)</option>
                  <option value="بطاقة مدى / ائتمان">بطاقة مدى / ائتمان</option>
                  <option value="شيك مصرفي">شيك مصرفي</option>
                </select>
              </div>

              {/* Contract Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ العقد</label>
                <input
                  type="date"
                  value={formData.contract_date || ''}
                  onChange={(e) => setFormData({ ...formData, contract_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              {/* General Notes */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات الطلب</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="أي ملاحظات أو اتفاقات خاصة في هذا العقد..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{orderToEdit ? 'حفظ تعديلات الطلب' : 'تسجيل وحفظ الطلب'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
