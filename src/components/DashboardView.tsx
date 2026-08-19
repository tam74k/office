import React, { useState, useMemo } from 'react';
import { 
  Users, 
  FileText, 
  Clock, 
  UserCheck, 
  Stethoscope, 
  Stamp, 
  Plane, 
  Search, 
  Filter, 
  RotateCcw, 
  Eye, 
  Edit,
  Printer, 
  Send, 
  Calendar,
  Building,
  TrendingUp,
  MapPin,
  Briefcase,
  Globe2,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  Legend
} from 'recharts';
import { Client, Order, OrderItem, Country, Profession, OrderStatus, OfficeProfile, WhatsAppTemplate } from '../types';
import { matchesFlexibleArabic, formatCurrency, formatDate, openWhatsApp, buildWhatsAppMessage } from '../utils/helpers';
import { OrdersView } from './OrdersView';
import { ClientAutocomplete, CountryAutocomplete, ProfessionAutocomplete } from './FormAutocomplete';

export interface DashboardViewProps {
  clients: Client[];
  orders: Order[];
  countries: Country[];
  cities?: any[];
  professions: Profession[];
  officeProfile: OfficeProfile;
  whatsAppTemplates: WhatsAppTemplate[];
  onSelectSponsorCountry?: (countryName: string) => void;
  onViewOrder?: (order: Order) => void;
  onViewOrderDetails?: (order: Order) => void;
  onEditOrder?: (order: Order) => void;
  onUpdateOrder?: (order: Order) => void;
  onUpdateOrderStatus?: (order: Order, newStatus: OrderStatus) => void;
  onDeleteOrder?: (orderId: string) => void;
  onPrintOrder?: (order: Order) => void;
  onPrintReceipt?: (order: Order) => void;
  onAddNewOrder?: () => void;
  onAddNewClient?: () => void;
  onNavigateToTab?: (tab: any) => void;
}

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; border: string; barColor: string }> = {
  'جديد': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', barColor: '#3b82f6' },
  'تم الاختيار': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', barColor: '#f59e0b' },
  'كشف طبي': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', barColor: '#a855f7' },
  'تم التفييز': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', barColor: '#10b981' },
  'تم السفر': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', barColor: '#0d9488' },
  'ملغي': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', barColor: '#64748b' }
};

const CHART_PALETTE = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6'];

export const DashboardView: React.FC<DashboardViewProps> = (props) => {
  const {
    clients = [],
    orders = [],
    countries = [],
    professions = [],
    officeProfile,
    whatsAppTemplates = [],
  } = props;

  const handleViewOrder = (order: Order) => {
    if (props.onViewOrderDetails) props.onViewOrderDetails(order);
    else if (props.onViewOrder) props.onViewOrder(order);
  };

  const handleEditOrder = (order: Order) => {
    if (props.onEditOrder) {
      props.onEditOrder(order);
    }
  };

  const handleStatusChange = (order: Order, newStatus: OrderStatus) => {
    const updatedItems = order.items.map(it => ({ ...it, status: newStatus }));
    const updatedOrder: Order = {
      ...order,
      status: newStatus,
      items: updatedItems,
      updated_at: new Date().toISOString()
    };
    if (props.onUpdateOrder) {
      props.onUpdateOrder(updatedOrder);
    } else if (props.onUpdateOrderStatus) {
      props.onUpdateOrderStatus(updatedOrder, newStatus);
    }
  };

  const handleItemStatusChange = (order: Order, itemId: string, newStatus: OrderStatus) => {
    const updatedItems = order.items.map(it => it.id === itemId ? { ...it, status: newStatus } : it);
    const allSame = updatedItems.every(it => (it.status || order.status) === newStatus);
    const updatedOrder: Order = {
      ...order,
      items: updatedItems,
      status: allSame ? newStatus : order.status,
      updated_at: new Date().toISOString()
    };
    if (props.onUpdateOrder) {
      props.onUpdateOrder(updatedOrder);
    } else if (props.onUpdateOrderStatus) {
      props.onUpdateOrderStatus(updatedOrder, updatedOrder.status);
    }
  };

  const handlePrintOrder = (order: Order) => {
    if (props.onPrintReceipt) props.onPrintReceipt(order);
    else if (props.onPrintOrder) props.onPrintOrder(order);
  };

  const handleAddNewOrder = () => {
    if (props.onAddNewOrder) props.onAddNewOrder();
    else if (props.onNavigateToTab) props.onNavigateToTab('orders');
  };

  const handleAddNewClient = () => {
    if (props.onAddNewClient) props.onAddNewClient();
    else if (props.onNavigateToTab) props.onNavigateToTab('clients');
  };

  // Advanced Multi-Filter States with Autocomplete
  const [selectedClientId, setSelectedClientId] = useState('');
  const [mobileQuery, setMobileQuery] = useState(''); // Kept just in case it's used elsewhere
  const [selectedWorkerCountryId, setSelectedWorkerCountryId] = useState('');
  const [selectedProfessionId, setSelectedProfessionId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('الكل');
  const [selectedSponsorCountry, setSelectedSponsorCountry] = useState<string>('الكل');
  const [selectedCountryForModal, setSelectedCountryForModal] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Autocomplete Suggestions Dropdown state
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [showProfessionSuggestions, setShowProfessionSuggestions] = useState(false);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);

  // Status Counts (counting requested workers and contracts)
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'جديد': 0,
      'تم الاختيار': 0,
      'كشف طبي': 0,
      'تم التفييز': 0,
      'تم السفر': 0,
      'ملغي': 0
    };
    orders.forEach(o => {
      if (o.items && o.items.length > 0) {
        o.items.forEach(it => {
          const st = it.status || o.status || 'جديد';
          if (counts[st] !== undefined) {
            counts[st]++;
          }
        });
      } else {
        if (counts[o.status] !== undefined) {
          counts[o.status]++;
        }
      }
    });
    return counts;
  }, [orders]);

  // Sponsor Countries List
  const sponsorCountries = useMemo(() => {
    return countries.filter(c => c.is_sponsor_country);
  }, [countries]);

  // Autocomplete data lists
  

  

  

  // Filtered Orders logic applying all simultaneous filters with flexible Arabic matching & item status matching
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Client Name filter
      if (selectedClientId && order.client_id !== selectedClientId) {
        return false;
      }
      if (mobileQuery) {
        const cleanQuery = mobileQuery.replace(/[^0-9]/g, '');
        const cleanOrderMobile = order.client_mobile.replace(/[^0-9]/g, '');
        if (!cleanOrderMobile.includes(cleanQuery)) return false;
      }
      // Sponsor Country filter
      if (selectedSponsorCountry !== 'الكل' && order.sponsor_country_name !== selectedSponsorCountry) {
        return false;
      }
      // Status filter: match if order has this status OR if any individual requested item in the order has this status!
      if (selectedStatus !== 'الكل') {
        const hasMatchingItemStatus = order.items.some(item => (item.status || order.status) === selectedStatus);
        const matchesOrderStatus = order.status === selectedStatus;
        if (!hasMatchingItemStatus && !matchesOrderStatus) {
          return false;
        }
      }
      // Date range filter
      if (startDate) {
        const orderDate = new Date(order.contract_date || order.created_at);
        const start = new Date(startDate);
        if (orderDate < start) return false;
      }
      if (endDate) {
        const orderDate = new Date(order.contract_date || order.created_at);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (orderDate > end) return false;
      }
      // Worker Country filter (checks across all order detail items)
      if (selectedWorkerCountryId) {
        const hasMatchingCountry = order.items.some(item => item.worker_country_id === selectedWorkerCountryId);
        if (!hasMatchingCountry) return false;
      }
      // Profession filter (checks across all order detail items)
      if (selectedProfessionId) {
        const hasMatchingProfession = order.items.some(item => item.profession_id === selectedProfessionId);
        if (!hasMatchingProfession) return false;
      }

      return true;
    });
  }, [orders, selectedClientId, mobileQuery, selectedSponsorCountry, selectedStatus, startDate, endDate, selectedWorkerCountryId, selectedProfessionId]);

  // Chart 1: Orders by Month
  const monthlyData = useMemo(() => {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const monthCounts = new Array(12).fill(0);
    orders.forEach(o => {
      const date = new Date(o.created_at || o.contract_date);
      const monthIdx = date.getMonth();
      if (monthIdx >= 0 && monthIdx < 12) {
        monthCounts[monthIdx]++;
      }
    });
    return months.map((name, idx) => ({
      name,
      طلبات: monthCounts[idx]
    }));
  }, [orders]);

  // Chart 2: Orders by Sponsor Country
  const sponsorCountryData = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(o => {
      const cName = o.sponsor_country_name || 'أخرى';
      map[cName] = (map[cName] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({
      name: name.replace('المملكة العربية السعودية', 'السعودية').replace('الإمارات العربية المتحدة', 'الإمارات').replace('دولة ', '').replace('مملكة ', ''),
      fullName: name,
      count
    }));
  }, [orders]);

  // Chart 3: Orders by Worker Country
  const workerCountryData = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        const cName = item.worker_country_name || 'غير محدد';
        map[cName] = (map[cName] || 0) + 1;
      });
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [orders]);

  // Chart 4: Orders by Profession
  const professionData = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        const pName = item.profession_name || 'أخرى';
        map[pName] = (map[pName] || 0) + 1;
      });
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [orders]);

  const handleResetFilters = () => {
    setSelectedClientId('');
              setMobileQuery('');
              setSelectedWorkerCountryId('');
              setSelectedProfessionId('');
    setSelectedStatus('الكل');
    setSelectedSponsorCountry('الكل');
    setStartDate('');
    setEndDate('');
  };

  const handleSendWhatsApp = (order: Order) => {
    const matchedTemplate = whatsAppTemplates.find(t => t.status === order.status) || whatsAppTemplates[0];
    const text = matchedTemplate ? matchedTemplate.template : `مرحباً ${order.client_name} بخصوص طلبك ${order.order_number}`;
    const firstItem = order.items[0];
    const msg = buildWhatsAppMessage(text, order, firstItem, officeProfile);
    openWhatsApp(order.client_mobile, msg);
  };

  const handleSendItemWhatsApp = (order: Order, item: OrderItem) => {
    const itemStatus = item.status || order.status;
    const matchedTemplate = whatsAppTemplates.find(t => t.status === itemStatus) || whatsAppTemplates[0];
    const text = matchedTemplate ? matchedTemplate.template : `مرحباً ${order.client_name} بخصوص طلبك ${order.order_number}`;
    const msg = buildWhatsAppMessage(text, order, item, officeProfile);
    openWhatsApp(order.client_mobile, msg);
  };

  return (
    <div id="dashboard-view-container" className="space-y-6 pb-12">
      {/* Top Banner & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-l from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Building className="w-4 h-4" />
            <span>لوحة المؤشرات والعمليات اليومية</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {officeProfile.name || 'إدارة مكاتب استقدام العمالة'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            متابعة شاملة لطلبات العملاء، والعمالة المستقدمة، والإحصائيات، ومزامنة الواتساب
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="btn-quick-new-client"
            onClick={handleAddNewClient}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 shadow-sm"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>+ عميل جديد</span>
          </button>
          <button
            id="btn-quick-new-order"
            onClick={handleAddNewOrder}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
          >
            <FileText className="w-4 h-4" />
            <span>+ طلب استقدام جديد</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Overview Cards (Clients, Orders & Breakdown by Status) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* Total Clients */}
        <div id="stat-total-clients" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-600">إجمالي العملاء</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{clients.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">كفيل مسجل بالنظام</div>
        </div>

        {/* Total Orders */}
        <div id="stat-total-orders" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-600">عدد الطلبات</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">{orders.length}</div>
          <div className="text-[11px] text-emerald-600 mt-1">طلب استقدام رئيسي</div>
        </div>

        {/* Status: جديد */}
        <div id="stat-status-new" className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200/80 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold text-blue-900">جديد</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-blue-700 font-mono">{statusCounts['جديد']}</div>
          <div className="text-[11px] text-blue-600/80 mt-1">بانتظار الفرز</div>
        </div>

        {/* Status: تم الاختيار */}
        <div id="stat-status-selected" className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold text-amber-900">تم الاختيار</span>
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">{statusCounts['تم الاختيار']}</div>
          <div className="text-[11px] text-amber-600/80 mt-1">تم اعتماد المرشح</div>
        </div>

        {/* Status: كشف طبي */}
        <div id="stat-status-medical" className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <span className="text-xs font-bold text-purple-900">كشف طبي</span>
            <Stethoscope className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-purple-700 font-mono">{statusCounts['كشف طبي']}</div>
          <div className="text-[11px] text-purple-600/80 mt-1">إجراء الفحوصات</div>
        </div>

        {/* Status: تم التفييز */}
        <div id="stat-status-visa" className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold text-emerald-900">تم التفييز</span>
            <Stamp className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">{statusCounts['تم التفييز']}</div>
          <div className="text-[11px] text-emerald-600/80 mt-1">صدرت التأشيرة</div>
        </div>

        {/* Status: تم السفر */}
        <div id="stat-status-travel" className="bg-teal-50/60 p-4 rounded-2xl border border-teal-200/80 shadow-xs">
          <div className="flex items-center justify-between text-teal-600 mb-2">
            <span className="text-xs font-bold text-teal-900">تم السفر</span>
            <Plane className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-teal-700 font-mono">{statusCounts['تم السفر']}</div>
          <div className="text-[11px] text-teal-600/80 mt-1">وصل للمستقدم</div>
        </div>
      </div>

      {/* Interactive Sponsor Countries Quick Bar (دول الكفلاء مع الأعلام) */}
      <div id="sponsor-countries-section" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              دول الكفلاء (اضغط لعرض الطلبات الخاصة بهذه الدولة مباشرة):
            </h3>
          </div>
          <span className="text-xs text-slate-500">تصفية فورية بناءً على دولة العميل</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <button
            id="sponsor-btn-all"
            onClick={() => setSelectedSponsorCountry('الكل')}
            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
              selectedSponsorCountry === 'الكل'
                ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/30'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <span className="text-2xl">🌍</span>
            <span className="font-bold text-xs">جميع الدول</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/10 font-mono">
              {orders.length} طلب
            </span>
          </button>

          {sponsorCountries.map(sc => {
            const countryOrdersCount = orders.filter(o => o.sponsor_country_id === sc.id || o.sponsor_country_name === sc.name).length;
            const isSelected = selectedSponsorCountry === sc.name;
            return (
              <button
                key={sc.id}
                id={`sponsor-btn-${sc.code.toLowerCase()}`}
                onClick={() => setSelectedCountryForModal(sc.name)}
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center bg-slate-50 hover:bg-emerald-50 text-slate-800 border-slate-200`}
              >
                <span className="text-3xl leading-none">{sc.flag_emoji}</span>
                <span className="font-bold text-xs truncate max-w-full">
                  {sc.name.replace('المملكة العربية السعودية', 'السعودية').replace('الإمارات العربية المتحدة', 'الإمارات').replace('دولة ', '').replace('مملكة ', '')}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-slate-200/70 text-slate-700`}>
                  {countryOrdersCount} طلب
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders View Modal for Selected Country */}
      {selectedCountryForModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-slate-50 w-full max-w-7xl h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="overflow-y-auto p-4 sm:p-6 w-full flex-1">
              <OrdersView
                orders={orders.filter(o => o.sponsor_country_name === selectedCountryForModal)}
                clients={clients}
                countries={countries}
                professions={professions}
                officeProfile={officeProfile}
                whatsAppTemplates={whatsAppTemplates}
                onSaveOrder={props.onUpdateOrder!}
                onDeleteOrder={props.onDeleteOrder!}
                onPrintOrder={props.onPrintReceipt!}
                onAddNewClient={props.onAddNewClient!}
                isModalMode={true}
                countryNameForModal={selectedCountryForModal}
                onCloseModal={() => setSelectedCountryForModal(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Advanced Multi-Filters Box with Autocomplete and Flexible Search */}
      <div id="advanced-filters-panel" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-sm text-slate-900">
              الفلاتر المتقدمة (بحث ذكي بالإكمال التلقائي وتصفية متعددة في آن واحد)
            </h4>
          </div>
          <button
            id="btn-reset-dashboard-filters"
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة تعيين الفلاتر</span>
          </button>
        </div>

        {/* 6-Filter Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* 1. Client Name with Autocomplete */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">العميل:</label>
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

          {/* 2. Mobile Phone */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">رقم الجوال:</label>
            <input
              id="filter-mobile"
              type="text"
              value={mobileQuery}
              onChange={(e) => setMobileQuery(e.target.value)}
              placeholder="مثال: 50123..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50 font-mono dir-ltr text-right"
            />
          </div>

          {/* 3. Worker Country */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">دولة الاستقدام (العامل):</label>
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

          {/* 4. Profession */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">المهنة المطلوبة:</label>
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

          {/* 5. Order Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">حالة الطلب:</label>
            <select
              id="filter-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50"
            >
              <option value="الكل">الكل</option>
              <option value="جديد">جديد</option>
              <option value="مكتمل">مكتمل</option>
              <option value="ملغي">ملغي</option>
              <option value="قيد الإجراء">قيد الإجراء</option>
            </select>
          </div>

          {/* 6. Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">من تاريخ:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2 py-2 text-[10px] rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">إلى تاريخ:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2 py-2 text-[10px] rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Results status banner */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            نتائج البحث المطابقة: <strong className="text-emerald-700 font-bold">{filteredOrders.length}</strong> من أصل {orders.length} طلب
          </span>
          {(selectedClientId || mobileQuery || selectedWorkerCountryId || selectedProfessionId || selectedStatus !== 'الكل' || selectedSponsorCountry !== 'الكل' || startDate || endDate) && (
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium text-[11px]">
              الفلاتر نشطة ومطبقة الآن
            </span>
          )}
        </div>
      </div>

      {/* Filtered Orders Table Section (Directly Below Filters) */}
      <div id="filtered-orders-table-wrapper" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span>قائمة الطلبات المصفاة</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                {filteredOrders.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              عرض الطلبات مع زر واتساب مباشر والطباعة وتفاصيل العمالة المستقدمة
            </p>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <FileText className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
            <p className="text-sm font-medium text-slate-600">لا توجد طلبات مطابقة للفلاتر المحددة</p>
            <button
              onClick={handleResetFilters}
              className="text-xs text-emerald-600 font-bold hover:underline inline-block cursor-pointer"
            >
              إعادة ضبط الفلاتر وعرض كافة الطلبات
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">رقم الطلب والتاريخ</th>
                  <th className="p-3.5">العميل (الكفيل)</th>
                  <th className="p-3.5">دولة وموقع العميل</th>
                  <th className="p-3.5 min-w-[280px]">المهن والعمالة المطلوبة (الحالة الفردية)</th>
                  <th className="p-3.5">حالة العقد الكلي</th>
                  <th className="p-3.5">المالية والتكلفة</th>
                  <th className="p-3.5 text-center">إجراءات سريعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map(order => {
                  const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS['جديد'];
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Order Number & Date */}
                      <td className="p-3.5 font-mono">
                        <div className="font-bold text-slate-900">{order.order_number}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" /> {formatDate(order.contract_date || order.created_at)}
                        </div>
                      </td>

                      {/* Client Info */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{order.client_name}</div>
                        <div className="text-[11px] font-mono text-slate-500 dir-ltr text-right">
                          {order.client_mobile}
                        </div>
                      </td>

                      {/* Sponsor Location */}
                      <td className="p-3.5">
                        <div className="font-medium text-slate-800">{order.sponsor_country_name}</div>
                        <div className="text-[11px] text-slate-500">{order.city_name}</div>
                      </td>

                      {/* Detailed Worker Items with Individual Status and WhatsApp */}
                      <td className="p-3.5">
                        <div className="space-y-2">
                          {order.items.map((item, idx) => {
                            const itemSt = (item.status || order.status) as OrderStatus;
                            const itemStyle = STATUS_COLORS[itemSt] || STATUS_COLORS['جديد'];
                            const isSelectedStatusMatch = selectedStatus !== 'الكل' && itemSt === selectedStatus;
                            return (
                              <div
                                key={item.id || idx}
                                className={`p-2 rounded-xl border transition-all text-[11px] ${
                                  isSelectedStatusMatch
                                    ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500/20'
                                    : 'bg-slate-50/90 border-slate-200'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[9px]">
                                      {idx + 1}
                                    </span>
                                    <span className="font-bold text-slate-900 text-xs">{item.profession_name}</span>
                                    <span className="text-slate-400 text-[10px]">من</span>
                                    <span className="font-semibold text-emerald-700 text-xs">{item.worker_country_name}</span>
                                    <span className="text-slate-400 text-[10px]">({item.experience_type})</span>
                                  </div>

                                  {/* Send WhatsApp specifically for this worker item */}
                                  <button
                                    type="button"
                                    onClick={() => handleSendItemWhatsApp(order, item)}
                                    title={`إرسال واتساب للعميل بخصوص (${item.profession_name}) - ${itemSt}`}
                                    className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-[10px] font-bold transition-all shadow-2xs cursor-pointer"
                                  >
                                    <Send className="w-2.5 h-2.5" />
                                    <span>واتساب</span>
                                  </button>
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/70">
                                  <div className="text-slate-600 truncate max-w-[130px]">
                                    {item.candidate_name ? (
                                      <span className="font-medium text-slate-800" title={item.candidate_name}>
                                        👤 {item.candidate_name}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 text-[10px]">قيد الفرز والترشيح</span>
                                    )}
                                  </div>

                                  {/* Individual Worker Status Dropdown */}
                                  <div className="relative inline-block">
                                    <select
                                      id={`select-status-item-${item.id || idx}`}
                                      value={itemSt}
                                      onChange={(e) => handleItemStatusChange(order, item.id, e.target.value as OrderStatus)}
                                      title="تعديل حالة هذا العامل/المهنة"
                                      className={`appearance-none text-[10px] font-bold px-2 py-0.5 pl-5 rounded-lg border cursor-pointer transition-all focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${itemStyle.bg} ${itemStyle.text} ${itemStyle.border}`}
                                    >
                                      <option value="جديد">جديد</option>
                                      <option value="تم الاختيار">تم الاختيار</option>
                                      <option value="كشف طبي">كشف طبي</option>
                                      <option value="تم التفييز">تم التفييز</option>
                                      <option value="تم السفر">تم السفر</option>
                                      <option value="ملغي">ملغي</option>
                                    </select>
                                    <ChevronDown className="w-2.5 h-2.5 absolute left-1 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      {/* Overall Order Status Interactive Selector */}
                      <td className="p-3.5">
                        <div className="relative inline-block">
                          <select
                            id={`select-status-order-${order.id}`}
                            value={order.status}
                            onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                            title="تغيير حالة العقد الكلي وتحديث كافة المهن"
                            className={`appearance-none text-xs font-bold px-3 py-1.5 pl-7 pr-3 rounded-full border cursor-pointer transition-all shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                          >
                            <option value="جديد" className="bg-white text-slate-800 font-medium">جديد</option>
                            <option value="تم الاختيار" className="bg-white text-slate-800 font-medium">تم الاختيار</option>
                            <option value="كشف طبي" className="bg-white text-slate-800 font-medium">كشف طبي</option>
                            <option value="تم التفييز" className="bg-white text-slate-800 font-medium">تم التفييز</option>
                            <option value="تم السفر" className="bg-white text-slate-800 font-medium">تم السفر</option>
                            <option value="ملغي" className="bg-white text-slate-800 font-medium">ملغي</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      </td>

                      {/* Financials */}
                      <td className="p-3.5 font-mono">
                        <div className="font-bold text-slate-900">{formatCurrency(order.total_cost, officeProfile.default_currency)}</div>
                        <div className="text-[11px] text-slate-500">
                          المتبقي: <span className="font-semibold text-rose-600">{formatCurrency(order.remaining_amount, officeProfile.default_currency)}</span>
                        </div>
                      </td>

                      {/* Actions: Direct WhatsApp, Edit, View, Print */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Dedicated WhatsApp Button for entire contract */}
                          <button
                            id={`btn-wa-order-${order.id}`}
                            onClick={() => handleSendWhatsApp(order)}
                            title="إرسال رسالة واتساب للطلب ككل"
                            className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          {/* Edit Order */}
                          <button
                            id={`btn-edit-order-${order.id}`}
                            onClick={() => handleEditOrder(order)}
                            title="تعديل بيانات الطلب والمهن"
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* View Details */}
                          <button
                            id={`btn-view-order-${order.id}`}
                            onClick={() => handleViewOrder(order)}
                            title="عرض تفاصيل الطلب والعمالة"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Print Receipt */}
                          <button
                            id={`btn-print-order-${order.id}`}
                            onClick={() => handlePrintOrder(order)}
                            title="طباعة إيصال وسند العقد"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Visual Analytics & Charts Section (4 Required Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Orders by Month */}
        <div id="chart-orders-monthly" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                1. عدد الطلبات خلال شهور السنة
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">توزيع زمني سنوي</span>
          </div>
          <div className="h-60 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  formatter={(value) => [`${value} طلب`, 'الطلبات']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="طلبات" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#orderGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Orders by Sponsor Country */}
        <div id="chart-orders-sponsor-country" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                2. أعداد الطلبات بناءً على دولة الكفيل (المستقدم)
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">حسب مقرات العملاء</span>
          </div>
          <div className="h-60 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sponsorCountryData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  formatter={(value) => [`${value} طلب`, 'عدد الطلبات']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                  {sponsorCountryData.map((_, index) => (
                    <Cell key={`cell-sponsor-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Orders by Worker Country */}
        <div id="chart-orders-worker-country" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-600" />
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                3. أعداد الطلبات بناءً على دولة العامل (بلدان الاستقدام)
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">أكثر الجنسيات طلباً</span>
          </div>
          <div className="h-60 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workerCountryData} layout="vertical">
                <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                <Tooltip 
                  formatter={(value) => [`${value} عامل`, 'العدد']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]}>
                  {workerCountryData.map((_, index) => (
                    <Cell key={`cell-worker-${index}`} fill={CHART_PALETTE[(index + 3) % CHART_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Orders by Profession */}
        <div id="chart-orders-profession" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-600" />
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                4. أعداد الطلبات وفقاً للمهن المطلوبة
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">توزيع الكوادر</span>
          </div>
          <div className="h-60 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={professionData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} interval={0} angle={-15} textAnchor="end" height={45} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  formatter={(value) => [`${value} طلب`, 'إجمالي الكوادر']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]}>
                  {professionData.map((_, index) => (
                    <Cell key={`cell-prof-${index}`} fill={CHART_PALETTE[(index + 2) % CHART_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
