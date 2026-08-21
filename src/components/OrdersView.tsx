import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Eye, 
  Printer, 
  Send, 
  Trash2, 
  Edit3, 
  Calendar, 
  UserCheck, 
  Clock, 
  Stethoscope, 
  Stamp, 
  Plane, 
  PlusCircle, 
  X, 
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Globe2,
  Coins,
  ChevronDown
} from 'lucide-react';
import { Order, OrderItem, Client, Country, Profession, OrderStatus, OfficeProfile, WhatsAppTemplate } from '../types';
import { formatCurrency, formatDate, openWhatsApp, buildWhatsAppMessage, matchesFlexibleArabic } from '../utils/helpers';
import { ProfessionAutocomplete, CountryAutocomplete, ClientAutocomplete } from './FormAutocomplete';

interface OrdersViewProps {
  orders: Order[];
  clients: Client[];
  countries: Country[];
  professions: Profession[];
  officeProfile: OfficeProfile;
  whatsAppTemplates: WhatsAppTemplate[];
  onSaveOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onPrintOrder: (order: Order) => void;
  selectedClientForNewOrder?: Client | null;
  onClearSelectedClient?: () => void;
  onAddNewClient: () => void;
  isModalMode?: boolean;
  countryNameForModal?: string;
  onCloseModal?: () => void;
}

const ORDER_STATUSES: OrderStatus[] = ['جديد', 'تم الاختيار', 'كشف طبي', 'تم التفييز', 'تم السفر', 'ملغي'];

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  clients,
  countries,
  professions,
  officeProfile,
  whatsAppTemplates,
  onSaveOrder,
  onDeleteOrder,
  onPrintOrder,
  selectedClientForNewOrder,
  onClearSelectedClient,
  onAddNewClient,
  isModalMode,
  countryNameForModal,
  onCloseModal
}) => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('الكل');
  const [selectedProfession, setSelectedProfession] = useState<string>('الكل');
  const [selectedWorkerCountry, setSelectedWorkerCountry] = useState<string>('الكل');

  // Modal / Drawer States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Filter non-sponsor countries for worker selection
  const workerCountries = useMemo(() => {
    return countries.filter(c => !c.is_sponsor_country);
  }, [countries]);

  // Form State
  const [formData, setFormData] = useState<Partial<Order>>({
    order_number: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
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

  // Client search within form autocomplete

  // Detail Item under edit in form
  const [currentItem, setCurrentItem] = useState<Partial<OrderItem>>({
    profession_id: '',
    profession_name: '',
    worker_country_id: '',
    worker_country_name: '',
    age_min: undefined,
    age_max: undefined,
    gender: 'غير محدد',
    religion: 'لا يشترط',
    experience_type: 'جديد (بدون خبرة)',
    experience_years: undefined,
    salary: undefined,
    currency: officeProfile.default_currency || 'SAR',
    notes: '',
    status: 'جديد',
    recruitment_cost: undefined
  });

  // Automatically setup new order if triggered with specific client
  React.useEffect(() => {
    if (selectedClientForNewOrder) {
      openNewOrderModal(selectedClientForNewOrder);
      if (onClearSelectedClient) onClearSelectedClient();
    }
  }, [selectedClientForNewOrder]);

  const openNewOrderModal = (presetClient?: Client) => {
    const newOrderNum = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const client = presetClient || null;

    const defaultItems: OrderItem[] = [
      {
        id: `item_${Date.now()}_1`,
        order_id: '',
        profession_id: '',
        profession_name: '',
        worker_country_id: '',
        worker_country_name: '',
        age_min: undefined,
        age_max: undefined,
        gender: 'غير محدد',
        religion: 'لا يشترط',
        experience_type: 'جديد (بدون خبرة)',
        experience_years: undefined,
        salary: undefined,
        currency: 'SAR',
        notes: '',
        status: 'جديد',
        recruitment_cost: undefined
      }
    ];

    setFormData({
      order_number: newOrderNum,
      client_id: client ? client.id : '',
      client_name: client ? client.name : '',
      client_mobile: client ? client.full_mobile || client.mobile : '',
      sponsor_country_id: client ? client.country_id : '',
      sponsor_country_name: client ? client.country_name || '' : '',
      city_name: client ? client.city_name || '' : '',
      status: 'جديد',
      total_cost: 9000,
      paid_amount: 4500,
      remaining_amount: 4500,
      payment_method: 'تحويل بنكي',
      contract_date: new Date().toISOString().split('T')[0],
      expected_arrival_date: '',
      notes: '',
      items: defaultItems
    });

    
    setEditingOrder(null);
    setIsFormOpen(true);
  };

  const openEditOrderModal = (order: Order) => {
    setFormData({ ...order });
    
    setEditingOrder(order);
    setIsFormOpen(true);
  };

  const handleSelectClientInForm = (client: Client) => {
    setFormData(prev => ({
      ...prev,
      client_id: client.id,
      client_name: client.name,
      client_mobile: client.full_mobile || `${client.phone_code}${client.mobile}`,
      sponsor_country_id: client.country_id,
      sponsor_country_name: client.country_name || '',
      city_name: client.city_name || ''
    }));
    
    
  };

  // Add detail item to order form
  const handleAddItemToOrder = () => {
    if (!currentItem.profession_name || !currentItem.worker_country_name) {
      alert('يرجى اختيار المهنة ودولة الاستقدام للعامل');
      return;
    }

    const newItem: OrderItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      order_id: formData.id || '',
      profession_id: currentItem.profession_id || '',
      profession_name: currentItem.profession_name || '',
      worker_country_id: currentItem.worker_country_id || '',
      worker_country_name: currentItem.worker_country_name || '',
      age_min: currentItem.age_min,
      age_max: currentItem.age_max,
      gender: currentItem.gender || '',
      religion: currentItem.religion || '',
      experience_type: currentItem.experience_type || '',
      experience_years: currentItem.experience_years,
      salary: currentItem.salary,
      currency: currentItem.currency || officeProfile.default_currency || 'SAR',
      notes: currentItem.notes || '',
      status: (currentItem.status as OrderStatus) || 'جديد',
      recruitment_cost: currentItem.recruitment_cost,
      candidate_name: currentItem.candidate_name || '',
      passport_number: currentItem.passport_number || '',
      visa_number: currentItem.visa_number || ''
    };

    const updatedItems = [...(formData.items || []), newItem];
    const totalCost = updatedItems.reduce((acc, it) => acc + (it.recruitment_cost || 0), 0);
    const paid = formData.paid_amount || 0;

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      total_cost: totalCost,
      remaining_amount: Math.max(0, totalCost - paid)
    }));

    // Reset current item builder with defaults
    setCurrentItem({
      profession_id: '',
      profession_name: '',
      worker_country_id: '',
      worker_country_name: '',
      age_min: undefined,
      age_max: undefined,
      gender: 'غير محدد',
      religion: 'لا يشترط',
      experience_type: 'جديد (بدون خبرة)',
      experience_years: undefined,
      salary: undefined,
      currency: officeProfile.default_currency || 'SAR',
      notes: '',
      status: 'جديد',
      recruitment_cost: undefined
    });
  };

  const handleRemoveItemFromOrder = (itemId: string) => {
    const updatedItems = (formData.items || []).filter(it => it.id !== itemId);
    const totalCost = updatedItems.reduce((acc, it) => acc + (it.recruitment_cost || 0), 0);
    const paid = formData.paid_amount || 0;

    setFormData(prev => ({
      ...prev,
      items: updatedItems,
      total_cost: totalCost,
      remaining_amount: Math.max(0, totalCost - paid)
    }));
  };

  const handleSubmitOrderForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_name || !formData.client_id) {
      alert('يرجى تحديد العميل صاحب الطلب');
      return;
    }
    if (!formData.items || formData.items.length === 0) {
      alert('يجب إضافة مهنة / عامل واحد على الأقل داخل هذا الطلب');
      return;
    }

    const orderToSave: Order = {
      id: editingOrder ? editingOrder.id : `ord_${Date.now()}`,
      order_number: formData.order_number || `REC-${Date.now()}`,
      client_id: formData.client_id || '',
      client_name: formData.client_name || '',
      client_mobile: formData.client_mobile || '',
      sponsor_country_id: formData.sponsor_country_id || '',
      sponsor_country_name: formData.sponsor_country_name || '',
      city_name: formData.city_name || '',
      status: (formData.status as OrderStatus) || 'جديد',
      total_cost: Number(formData.total_cost) || 0,
      paid_amount: Number(formData.paid_amount) || 0,
      remaining_amount: Math.max(0, (Number(formData.total_cost) || 0) - (Number(formData.paid_amount) || 0)),
      payment_method: formData.payment_method || 'تحويل بنكي',
      contract_date: formData.contract_date || new Date().toISOString().split('T')[0],
      expected_arrival_date: formData.expected_arrival_date || '',
      notes: formData.notes || '',
      items: formData.items || [],
      created_at: editingOrder ? editingOrder.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onSaveOrder(orderToSave);
    setIsFormOpen(false);
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (searchTerm) {
        const matchesClient = matchesFlexibleArabic(order.client_name, searchTerm);
        const matchesNum = order.order_number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMobile = order.client_mobile.includes(searchTerm);
        const matchesAnyWorker = order.items.some(it => 
          matchesFlexibleArabic(it.profession_name, searchTerm) || 
          matchesFlexibleArabic(it.worker_country_name, searchTerm) ||
          (it.candidate_name && matchesFlexibleArabic(it.candidate_name, searchTerm))
        );
        if (!matchesClient && !matchesNum && !matchesMobile && !matchesAnyWorker) return false;
      }
      if (selectedStatus !== 'الكل' && order.status !== selectedStatus) return false;
      if (selectedProfession !== 'الكل') {
        const hasProf = order.items.some(it => it.profession_name === selectedProfession);
        if (!hasProf) return false;
      }
      if (selectedWorkerCountry !== 'الكل') {
        const hasCountry = order.items.some(it => it.worker_country_name === selectedWorkerCountry);
        if (!hasCountry) return false;
      }
      return true;
    });
  }, [orders, searchTerm, selectedStatus, selectedProfession, selectedWorkerCountry]);

  const handleSendWhatsApp = (order: Order, item?: OrderItem) => {
    const targetStatus = item ? item.status : order.status;
    const matchedTemplate = whatsAppTemplates.find(t => t.status === targetStatus) || whatsAppTemplates[0];
    const text = matchedTemplate ? matchedTemplate.template : `مرحباً بك أستاذ ${order.client_name}`;
    const msg = buildWhatsAppMessage(text, order, item || order.items[0], officeProfile);
    openWhatsApp(order.client_mobile, msg);
  };

  return (
    <div id="orders-view-root" className={`space-y-6 ${isModalMode ? '' : 'pb-12'}`}>
      {/* Top Header & New Order Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>{isModalMode && countryNameForModal ? `طلبات الاستقدام من/إلى دولة: ${countryNameForModal}` : 'إدارة طلبات استقدام العمالة (Master - Detail)'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">
            {isModalMode ? 'استعرض وابحث وعدّل طلبات هذه الدولة بكل سهولة' : 'إضافة ومتابعة طلبات الكفلاء المتعددة، وإسناد العمالة والمهن، وتحديث الحالات والتواصل الفوري'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-create-new-order-modal"
            onClick={() => openNewOrderModal()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء طلب استقدام جديد</span>
          </button>
          
          {isModalMode && onCloseModal && (
            <button
              onClick={onCloseModal}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input with flexible Arabic matcher */}
        <div className="relative">
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">بحث شامل:</label>
          <div className="relative">
            <input
              id="orders-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="اسم العميل، الجوال، المهنة، المرشح..."
              className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden bg-slate-50 dark:bg-slate-950/50"
            />
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400 dark:text-slate-500 dark:text-slate-400" />
          </div>
        </div>

        {/* Status filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">تصفية بحالة الطلب:</label>
          <select
            id="orders-status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50"
          >
            <option value="الكل">جميع الحالات ({orders.length})</option>
            {ORDER_STATUSES.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* Profession Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">المهنة:</label>
          <select
            id="orders-prof-filter"
            value={selectedProfession}
            onChange={(e) => setSelectedProfession(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50"
          >
            <option value="الكل">جميع المهن</option>
            {professions.map(p => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Worker Country Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">دولة الاستقدام (العامل):</label>
          <select
            id="orders-worker-country-filter"
            value={selectedWorkerCountry}
            onChange={(e) => setSelectedWorkerCountry(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50"
          >
            <option value="الكل">جميع الدول</option>
            {workerCountries.map(c => (
              <option key={c.id} value={c.name}>{c.flag_emoji} {c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Master-Detail Cards List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-400 dark:text-slate-500 dark:text-slate-400">
            <FileText className="w-12 h-12 mx-auto text-slate-300 stroke-1 mb-2" />
            <p className="font-bold text-slate-700 dark:text-slate-200">لا توجد طلبات مطابقة</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">جرب تغيير شروط البحث أو اضغط على إنشاء طلب جديد</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            return (
              <div 
                key={order.id} 
                id={`order-card-${order.id}`}
                className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-emerald-300 transition-all overflow-hidden"
              >
                {/* Master Header */}
                <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 flex items-center justify-center font-bold font-mono text-sm shrink-0">
                      #{order.order_number.replace('REC-', '')}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">{order.client_name}</h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 font-mono dir-ltr">({order.client_mobile})</span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                          {order.sponsor_country_name} • {order.city_name}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">
                        <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">{order.order_number}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500 dark:text-slate-400" />
                          تاريخ العقد: {formatDate(order.contract_date || order.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Overview & Master Actions */}
                  <div className="flex flex-wrap items-center gap-3 justify-between lg:justify-end">
                    <div className="text-left font-mono text-xs bg-white dark:bg-slate-900 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-[10px]">إجمالي العقد / المتبقي:</div>
                      <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(order.total_cost, officeProfile.default_currency)}</span>
                      <span className="text-slate-400 dark:text-slate-500 dark:text-slate-400 mx-1">/</span>
                      <span className="font-bold text-rose-600">{formatCurrency(order.remaining_amount, officeProfile.default_currency)}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Direct WhatsApp Button */}
                      <button
                        id={`btn-wa-master-${order.id}`}
                        onClick={() => handleSendWhatsApp(order)}
                        title="إرسال رسالة واتساب للعميل"
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>واتساب العميل</span>
                      </button>

                      {/* View Modal */}
                      <button
                        id={`btn-view-order-card-${order.id}`}
                        onClick={() => setSelectedOrderForView(order)}
                        title="عرض كافة التفاصيل"
                        className="p-2 bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Print Receipt */}
                      <button
                        id={`btn-print-order-card-${order.id}`}
                        onClick={() => onPrintOrder(order)}
                        title="طباعة إيصال العقد"
                        className="p-2 bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <button
                        id={`btn-edit-order-card-${order.id}`}
                        onClick={() => openEditOrderModal(order)}
                        title="تعديل بيانات الطلب"
                        className="p-2 bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        id={`btn-delete-order-card-${order.id}`}
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف الطلب رقم ${order.order_number}؟`)) {
                            onDeleteOrder(order.id);
                          }
                        }}
                        title="حذف الطلب"
                        className="p-2 bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Detail Section: Requested Workers in this order */}
                <div className="p-4 sm:p-5">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-3 flex items-center justify-between">
                    <span>بنود العمالة المستقدمة في هذا الطلب ({order.items.length} عمالة):</span>
                    <span className="text-[11px] text-emerald-700 font-normal">
                      الحالة العامة للطلب: <strong>{order.status}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {order.items.map((item, idx) => (
                      <div 
                        key={item.id || idx} 
                        className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/90 hover:border-emerald-300 transition-colors flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[11px] font-bold">
                                {idx + 1}
                              </span>
                              <div>
                                <h4 className="font-bold text-xs text-slate-900 dark:text-white">{item.profession_name}</h4>
                                <div className="text-[11px] text-emerald-800 font-semibold">
                                  دولة العامل: {item.worker_country_name}
                                </div>
                              </div>
                            </div>

                            <div className="relative inline-block">
                              <select
                                id={`select-status-item-view-${item.id}`}
                                value={item.status || order.status}
                                onChange={(e) => {
                                  const newStatus = e.target.value as OrderStatus;
                                  const updatedItems = order.items.map(it => it.id === item.id ? { ...it, status: newStatus } : it);
                                  const allSame = updatedItems.every(it => (it.status || order.status) === newStatus);
                                  const updatedOrder: Order = {
                                    ...order,
                                    items: updatedItems,
                                    status: allSame ? newStatus : order.status,
                                    updated_at: new Date().toISOString()
                                  };
                                  onSaveOrder(updatedOrder);
                                }}
                                title="تعديل حالة هذا العامل/المهنة"
                                className="appearance-none px-2.5 py-1 pr-2 pl-6 rounded-lg text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 border border-emerald-300 cursor-pointer focus:outline-hidden"
                              >
                                <option value="جديد">جديد</option>
                                <option value="تم الاختيار">تم الاختيار</option>
                                <option value="كشف طبي">كشف طبي</option>
                                <option value="تم التفييز">تم التفييز</option>
                                <option value="تم السفر">تم السفر</option>
                                <option value="ملغي">ملغي</option>
                              </select>
                              <ChevronDown className="w-3 h-3 absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
                            </div>
                          </div>

                          {/* Requirements & specs */}
                          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800 mb-2">
                            <div>العمر: <strong>من {item.age_min} إلى {item.age_max}</strong></div>
                            <div>الخبرة: <strong>{item.experience_type}</strong></div>
                            <div>الجنس/الديانة: <strong>{item.gender} • {item.religion}</strong></div>
                            <div>الراتب المتوقع: <strong className="text-emerald-700 font-mono">{formatCurrency(item.salary, item.currency)}</strong></div>
                          </div>

                          {item.candidate_name && (
                            <div className="text-[11px] text-slate-700 dark:text-slate-200 mb-2 bg-emerald-50 dark:bg-emerald-900/30/70 p-2 rounded-lg border border-emerald-200/60">
                              <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">المرشح المختار:</span> <strong>{item.candidate_name}</strong>
                              {item.passport_number && <span className="mr-2 text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-mono">(جواز: {item.passport_number})</span>}
                            </div>
                          )}

                          {item.notes && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 italic mb-2">
                              شروط خاصة: {item.notes}
                            </p>
                          )}
                        </div>

                        {/* Item WhatsApp Action */}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">تكلفة الاستقدام: <strong className="text-slate-900 dark:text-white font-mono">{formatCurrency(item.recruitment_cost, officeProfile.default_currency)}</strong></span>
                          <button
                            id={`btn-wa-item-${item.id}`}
                            onClick={() => handleSendWhatsApp(order, item)}
                            className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-2 py-1 rounded-lg transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            <span>واتساب هذا البند</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View Order Detail Modal / Drawer */}
      {selectedOrderForView && (
        <div 
          id="order-details-drawer"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">
            <div className="bg-slate-900 dark:bg-slate-950 text-white p-5 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">تفاصيل الطلب: {selectedOrderForView.order_number}</h3>
              </div>
              <button
                onClick={() => setSelectedOrderForView(null)}
                className="p-1.5 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-800 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Client & Master Overview */}
              <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 block text-[11px]">العميل:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedOrderForView.client_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 block text-[11px]">رقم الجوال:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white dir-ltr text-right inline-block">{selectedOrderForView.client_mobile}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 block text-[11px]">الموقع:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedOrderForView.sponsor_country_name} - {selectedOrderForView.city_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 block text-[11px]">تاريخ العقد:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatDate(selectedOrderForView.contract_date)}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 block text-[11px]">الوصول المتوقع:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatDate(selectedOrderForView.expected_arrival_date) || 'غير محدد'}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 block text-[11px]">الحالة العامة:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full inline-block mt-0.5">{selectedOrderForView.status}</span>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                  قائمة العمالة المطلوبة ({selectedOrderForView.items.length})
                </h4>
                <div className="space-y-3">
                  {selectedOrderForView.items.map((item, idx) => (
                    <div key={item.id || idx} className="bg-white dark:bg-slate-900 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-mono">
                            {idx + 1}
                          </span>
                          <span>{item.profession_name}</span>
                          <span className="text-slate-400 dark:text-slate-500 dark:text-slate-400 font-normal">من دولة</span>
                          <span className="text-emerald-700">{item.worker_country_name}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                          {item.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-lg">
                        <div>العمر: <strong>{item.age_min} - {item.age_max} سنة</strong></div>
                        <div>الجنس: <strong>{item.gender}</strong></div>
                        <div>الديانة: <strong>{item.religion}</strong></div>
                        <div>الخبرة: <strong>{item.experience_type}</strong></div>
                      </div>

                      {item.candidate_name && (
                        <div className="text-xs bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-lg text-emerald-900 border border-emerald-200">
                          <strong>بيانات المرشح المعتمد:</strong> {item.candidate_name}
                          {item.passport_number && <span className="mx-2">| رقم الجواز: {item.passport_number}</span>}
                          {item.visa_number && <span>| رقم التأشيرة: {item.visa_number}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Box */}
              <div className="bg-emerald-50 dark:bg-emerald-900/30/60 p-4 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">إجمالي المبلغ:</span> <strong className="text-slate-900 dark:text-white font-mono text-sm">{formatCurrency(selectedOrderForView.total_cost, officeProfile.default_currency)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">المدفوع:</span> <strong className="text-emerald-800 font-mono text-sm">{formatCurrency(selectedOrderForView.paid_amount, officeProfile.default_currency)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">المتبقي:</span> <strong className="text-rose-700 font-mono text-sm font-black">{formatCurrency(selectedOrderForView.remaining_amount, officeProfile.default_currency)}</strong>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => handleSendWhatsApp(selectedOrderForView)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>واتساب العميل</span>
                </button>

                <button
                  onClick={() => {
                    onPrintOrder(selectedOrderForView);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 dark:bg-slate-800 dark:bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الإيصال</span>
                </button>

                <button
                  onClick={() => setSelectedOrderForView(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Master-Detail Order Modal */}
      {isFormOpen && (
        <div 
          id="order-form-modal"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">
            {/* Modal Header */}
            <div className="bg-slate-900 dark:bg-slate-950 text-white p-5 flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">
                  {editingOrder ? `تعديل الطلب: ${editingOrder.order_number}` : 'إنشاء طلب استقدام جديد'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-800 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOrderForm} className="p-6 space-y-6 text-xs">
              {/* 1. Client Section: Client Selector with Autocomplete */}
              <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-xs flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    بيانات العميل (الكفيل صاحب الطلب):
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      onAddNewClient();
                    }}
                    className="text-[11px] text-emerald-700 hover:underline font-bold"
                  >
                    + إضافة عميل جديد بالنظام
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Client Select / Autocomplete Search */}
                  <div className="relative">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      اختيار العميل (بحث بالاسم أو الجوال):
                    </label>
                    <div className="relative">
                      <ClientAutocomplete
                        clients={clients.filter(c => !c.is_archived)}
                        selectedId={formData.client_id || ''}
                        onChange={handleSelectClientInForm}
                        placeholder="اكتب اسم العميل أو رقمه..."
                      />
                    </div>
                  </div>

                  {/* Order Number & Contract Date */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">رقم الطلب:</label>
                      <input
                        type="text"
                        value={formData.order_number || ''}
                        onChange={(e) => setFormData(p => ({ ...p, order_number: e.target.value }))}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:bg-slate-950 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">تاريخ العقد:</label>
                      <input
                        type="date"
                        value={formData.contract_date || ''}
                        onChange={(e) => setFormData(p => ({ ...p, contract_date: e.target.value }))}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:bg-slate-950"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Selected Client details preview */}
                {formData.client_id && (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 text-slate-700 dark:text-slate-200 flex flex-wrap items-center justify-between text-[11px]">
                    <div>
                      الكفيل: <strong>{formData.client_name}</strong> • جوال: <strong className="font-mono">{formData.client_mobile}</strong>
                    </div>
                    <div>
                      الموقع: <strong>{formData.sponsor_country_name} - {formData.city_name}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Worker Items Section: Multiple Workers Builder */}
              <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <span>العمالة والمهن المطلوبة داخل هذا الطلب:</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-mono">
                    العدد الحالي: {formData.items?.length || 0}
                  </span>
                </div>

                {/* Existing Items in this order */}
                {formData.items && formData.items.length > 0 && (
                  <div className="space-y-2">
                    {formData.items.map((it, idx) => (
                      <div key={it.id || idx} className="bg-white dark:bg-slate-900 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">{it.profession_name}</span>
                            <span className="text-slate-400 dark:text-slate-500 dark:text-slate-400 mx-1.5">•</span>
                            <span className="text-emerald-700 font-semibold">{it.worker_country_name}</span>
                            <span className="text-slate-400 dark:text-slate-500 dark:text-slate-400 mx-1.5">•</span>
                            <span className="text-slate-600 dark:text-slate-300">{it.experience_type} ({it.age_min}-{it.age_max} سنة)</span>
                            <span className="text-slate-400 dark:text-slate-500 dark:text-slate-400 mx-1.5">•</span>
                            <span className="font-mono text-emerald-800">{formatCurrency(it.recruitment_cost, officeProfile.default_currency)}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItemFromOrder(it.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                          title="حذف هذا البند"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sub-form to add a new worker item */}
                <div className="p-3.5 bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-xl border border-dashed border-emerald-300 space-y-3">
                  <div className="font-bold text-emerald-800 text-[11px] flex items-center gap-1">
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>إضافة عامل / مهنة جديدة للطلب:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {/* Profession Autocomplete */}
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5">
                        المهنة المطلوبة <span className="text-emerald-600 font-normal">(إكمال تلقائي)</span>:
                      </label>
                      <ProfessionAutocomplete
                        professions={professions}
                        selectedId={currentItem.profession_id || ''}
                        onChange={(prof) => {
                          setCurrentItem(p => ({
                            ...p,
                            profession_id: prof.id,
                            profession_name: prof.name,
                            salary: prof.default_salary,
                            currency: prof.currency
                          }));
                        }}
                      />
                    </div>

                    {/* Worker Country Autocomplete */}
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5">
                        دولة الاستقدام (العامل) <span className="text-emerald-600 font-normal">(إكمال تلقائي)</span>:
                      </label>
                      <CountryAutocomplete
                        countries={countries}
                        selectedId={currentItem.worker_country_id || ''}
                        onlyWorkerCountries={true}
                        onChange={(c) => {
                          setCurrentItem(p => ({
                            ...p,
                            worker_country_id: c.id,
                            worker_country_name: c.name
                          }));
                        }}
                      />
                    </div>

                    {/* Age Range */}
                    <div className="grid grid-cols-2 gap-1">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5">العمر من:</label>
                        <input
                          type="number"
                          value={currentItem.age_min || 25}
                          onChange={(e) => setCurrentItem(p => ({ ...p, age_min: Number(e.target.value) }))}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5">إلى سن:</label>
                        <input
                          type="number"
                          value={currentItem.age_max || 40}
                          onChange={(e) => setCurrentItem(p => ({ ...p, age_max: Number(e.target.value) }))}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50 text-xs"
                        />
                      </div>
                    </div>

                    {/* Experience type */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5">الخبرة المطلوبة:</label>
                      <select
                        value={currentItem.experience_type || ''}
                        onChange={(e) => setCurrentItem(p => ({ ...p, experience_type: e.target.value as any }))}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50 text-xs"
                      >
                        <option value="">الخبرة...</option>
                        <option value="جديد (بدون خبرة)">جديد (بدون خبرة)</option>
                        <option value="خبرة سابقة بالخليج">خبرة سابقة بالخليج</option>
                        <option value="خبرة محلية">خبرة محلية</option>
                        <option value="خبرة عامة">خبرة عامة</option>
                      </select>
                    </div>

                    {/* Gender & Religion */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5">الجنس والديانة:</label>
                      <div className="grid grid-cols-2 gap-1">
                        <select
                          value={currentItem.gender || ''}
                          onChange={(e) => setCurrentItem(p => ({ ...p, gender: e.target.value as any }))}
                          className="w-full px-1.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50 text-xs"
                        >
                          <option value="">الجنس...</option>
                          <option value="ذكر">ذكر</option>
                          <option value="أنثى">أنثى</option>
                          <option value="غير محدد">غير محدد</option>
                        </select>
                        <select
                          value={currentItem.religion || ''}
                          onChange={(e) => setCurrentItem(p => ({ ...p, religion: e.target.value as any }))}
                          className="w-full px-1.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50 text-xs"
                        >
                          <option value="">الديانة...</option>
                          <option value="مسلم">مسلم</option>
                          <option value="غير مسلم">غير مسلم</option>
                          <option value="لا يشترط">لا يشترط</option>
                        </select>
                      </div>
                    </div>

                    {/* Salary */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5">الراتب المتفق عليه:</label>
                      <input
                        type="number"
                        value={currentItem.salary || 1500}
                        onChange={(e) => setCurrentItem(p => ({ ...p, salary: Number(e.target.value) }))}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50 text-xs font-mono"
                      />
                    </div>

                    {/* Recruitment item cost */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-0.5">تكلفة استقدام هذا البند:</label>
                      <input
                        type="number"
                        value={currentItem.recruitment_cost || 8500}
                        onChange={(e) => setCurrentItem(p => ({ ...p, recruitment_cost: Number(e.target.value) }))}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50 text-xs font-mono"
                      />
                    </div>

                    {/* Add Item Button */}
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAddItemToOrder}
                        className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إدراج في الطلب</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Financials & Status */}
              <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">إجمالي تكلفة العقد:</label>
                  <input
                    type="number"
                    value={formData.total_cost || 0}
                    onChange={(e) => {
                      const total = Number(e.target.value);
                      const paid = formData.paid_amount || 0;
                      setFormData(p => ({ ...p, total_cost: total, remaining_amount: Math.max(0, total - paid) }));
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:bg-slate-950 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">الدفعة المدفوعة:</label>
                  <input
                    type="number"
                    value={formData.paid_amount || 0}
                    onChange={(e) => {
                      const paid = Number(e.target.value);
                      const total = formData.total_cost || 0;
                      setFormData(p => ({ ...p, paid_amount: paid, remaining_amount: Math.max(0, total - paid) }));
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:bg-slate-950 font-mono font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">المتبقي عند الوصول:</label>
                  <input
                    type="number"
                    value={formData.remaining_amount || 0}
                    readOnly
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 font-mono font-bold text-rose-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">حالة الطلب:</label>
                  <select
                    value={formData.status || 'جديد'}
                    onChange={(e) => setFormData(p => ({ ...p, status: e.target.value as OrderStatus }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:bg-slate-950 font-bold"
                  >
                    {ORDER_STATUSES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. Notes & Special Requests */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">ملاحظات وشروط خاصة:</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                  placeholder="مثال: يفضل سائق يعرف شوارع العاصمة، وطباخ ممتاز بالأكلات الشعبية..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:bg-slate-950"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/30"
                >
                  {editingOrder ? 'حفظ التعديلات' : 'حفظ وإنشاء الطلب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
