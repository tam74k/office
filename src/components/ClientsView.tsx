import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Archive, 
  RotateCcw, 
  FileText, 
  Send, 
  MapPin, 
  Phone, 
  Mail, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  PlusCircle, 
  X, 
  Eye, 
  Globe2, 
  Calendar,
  Layers,
  ChevronLeft
} from 'lucide-react';
import { Client, Order, Country, City, Profession, OfficeProfile, WhatsAppTemplate } from '../types';
import { matchesFlexibleArabic, formatCurrency, formatDate, openWhatsApp, buildWhatsAppMessage } from '../utils/helpers';
import { CountryAutocomplete, ProfessionAutocomplete } from './FormAutocomplete';

interface ClientsViewProps {
  clients: Client[];
  orders: Order[];
  countries: Country[];
  cities: City[];
  professions: Profession[];
  officeProfile: OfficeProfile;
  whatsAppTemplates: WhatsAppTemplate[];
  onSaveClient: (client: Client) => void;
  onToggleArchiveClient: (clientId: string) => void;
  onDeleteClient: (clientId: string) => void;
  onCreateOrderForClient: (client: Client) => void;
  onViewOrderDetails: (order: Order) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  orders,
  countries,
  cities,
  professions,
  officeProfile,
  whatsAppTemplates,
  onSaveClient,
  onToggleArchiveClient,
  onDeleteClient,
  onCreateOrderForClient,
  onViewOrderDetails
}) => {
  // Tabs: Active vs Archived
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  // Search Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('الكل');
  const [selectedProfessionFilter, setSelectedProfessionFilter] = useState<string>('الكل');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<Client | null>(null);

  // Filter countries to sponsor countries only for clients!
  const sponsorCountries = useMemo(() => {
    return countries.filter(c => c.is_sponsor_country);
  }, [countries]);

  // Form State
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    national_id: '',
    country_id: sponsorCountries[0]?.id || 'c_sa',
    country_name: sponsorCountries[0]?.name || 'المملكة العربية السعودية',
    phone_code: sponsorCountries[0]?.phone_code || '+966',
    mobile: '',
    city_id: '',
    city_name: '',
    address: '',
    email: '',
    notes: '',
    is_archived: false
  });

  // Cities filtered by selected country in form
  const availableCitiesInForm = useMemo(() => {
    if (!formData.country_id) return [];
    return cities.filter(c => c.country_id === formData.country_id);
  }, [cities, formData.country_id]);

  // Open Form for new client
  const openNewClientModal = () => {
    setFormData({
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
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const openEditClientModal = (client: Client) => {
    setFormData({ ...client });
    setEditingClient(client);
    setIsFormOpen(true);
  };

  // Handle Country selection in Form: automatically sets phone_code and filters cities!
  const handleCountryChangeInForm = (countryId: string) => {
    const selectedCountry = sponsorCountries.find(c => c.id === countryId);
    if (!selectedCountry) {
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
      country_id: selectedCountry.id,
      country_name: selectedCountry.name,
      phone_code: selectedCountry.phone_code, // Automatically set phone code!
      city_id: '',
      city_name: ''
    }));
  };

  const handleCityChangeInForm = (cityId: string) => {
    const matchedCity = cities.find(c => c.id === cityId);
    setFormData(prev => ({
      ...prev,
      city_id: cityId,
      city_name: matchedCity ? matchedCity.name : ''
    }));
  };

  const handleSubmitClientForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) {
      alert('يرجى كتابة اسم العميل ورقم الجوال');
      return;
    }

    const cleanMobile = formData.mobile.replace(/[^0-9]/g, '');
    const cleanCode = (formData.phone_code || '+966').replace(/[^0-9]/g, '');
    const fullMobile = `+${cleanCode}${cleanMobile.startsWith('0') ? cleanMobile.substring(1) : cleanMobile}`;

    const clientToSave: Client = {
      id: editingClient ? editingClient.id : `cli_${Date.now()}`,
      name: formData.name || '',
      national_id: formData.national_id || '',
      country_id: formData.country_id || sponsorCountries[0]?.id || '',
      country_name: formData.country_name || sponsorCountries[0]?.name || '',
      phone_code: formData.phone_code || '+966',
      mobile: formData.mobile || '',
      full_mobile: fullMobile,
      city_id: formData.city_id || '',
      city_name: formData.city_name || '',
      address: formData.address || '',
      email: formData.email || '',
      notes: formData.notes || '',
      is_archived: formData.is_archived || false,
      created_at: editingClient ? editingClient.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onSaveClient(clientToSave);
    setIsFormOpen(false);
  };

  // Client counts
  const activeClientsCount = useMemo(() => clients.filter(c => !c.is_archived).length, [clients]);
  const archivedClientsCount = useMemo(() => clients.filter(c => c.is_archived).length, [clients]);

  // Filtered Clients list
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Archive tab check
      if (activeTab === 'active' && client.is_archived) return false;
      if (activeTab === 'archived' && !client.is_archived) return false;

      // Country filter
      if (selectedCountryFilter !== 'الكل' && client.country_name !== selectedCountryFilter) {
        return false;
      }

      // Search query (Flexible non-exact match on name, phone, id)
      if (searchQuery) {
        const matchName = matchesFlexibleArabic(client.name, searchQuery);
        const matchMobile = client.mobile.includes(searchQuery) || (client.full_mobile && client.full_mobile.includes(searchQuery));
        const matchId = client.national_id.includes(searchQuery);
        const matchAddress = matchesFlexibleArabic(client.address, searchQuery);

        // Check if any order of this client has requested profession
        const clientOrders = orders.filter(o => o.client_id === client.id);
        const matchProfessionInOrders = clientOrders.some(o => 
          o.items.some(it => matchesFlexibleArabic(it.profession_name, searchQuery))
        );

        if (!matchName && !matchMobile && !matchId && !matchAddress && !matchProfessionInOrders) {
          return false;
        }
      }

      // Profession filter
      if (selectedProfessionFilter !== 'الكل') {
        const clientOrders = orders.filter(o => o.client_id === client.id);
        const hasProf = clientOrders.some(o => 
          o.items.some(it => it.profession_name === selectedProfessionFilter)
        );
        if (!hasProf) return false;
      }

      return true;
    });
  }, [clients, orders, activeTab, selectedCountryFilter, searchQuery, selectedProfessionFilter]);

  const handleSendWelcomeWhatsApp = (client: Client) => {
    const welcomeTpl = whatsAppTemplates.find(t => t.status === 'ترحيب') || whatsAppTemplates[0];
    let msg = welcomeTpl ? welcomeTpl.template : `أهلاً بك أستاذ ${client.name} في ${officeProfile.name}`;
    msg = msg.split('{اسم_العميل}').join(client.name);
    msg = msg.split('{اسم_المكتب}').join(officeProfile.name);
    msg = msg.split('{رقم_المكتب}').join(officeProfile.phone || officeProfile.mobile || '');
    openWhatsApp(client.full_mobile || client.mobile, msg, client.phone_code);
  };

  return (
    <div id="clients-view-root" className="space-y-6 pb-12">
      {/* Header & Add Client Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>إدارة العملاء (الكفلاء وأصحاب العمل)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">
            سجل الكفلاء، متابعة طلبات كل عميل، إضافة طلبات مباشرة، وإدارة الأرشيف والتواصل المباشر
          </p>
        </div>

        <button
          id="btn-open-new-client-modal"
          onClick={openNewClientModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة عميل جديد (كفيل)</span>
        </button>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        {/* Active vs Archived Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <button
            id="tab-active-clients"
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'active'
                ? 'bg-slate-900 dark:bg-slate-950 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:bg-slate-800'
            }`}
          >
            <span>العملاء النشطون</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
              activeTab === 'active' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}>
              {activeClientsCount}
            </span>
          </button>

          <button
            id="tab-archived-clients"
            onClick={() => setActiveTab('archived')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'archived'
                ? 'bg-slate-900 dark:bg-slate-950 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:bg-slate-800'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>الأرشيف (غير النشطين)</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
              activeTab === 'archived' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}>
              {archivedClientsCount}
            </span>
          </button>
        </div>

        {/* Search Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Text Search */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">بحث بالاسم أو الجوال أو الهوية:</label>
            <div className="relative">
              <input
                id="clients-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="مثال: القحطاني، 05012..."
                className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden bg-slate-50 dark:bg-slate-950/50"
              />
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400 dark:text-slate-500 dark:text-slate-400" />
            </div>
          </div>

          {/* Country Filter */}
          <div className="w-48 relative">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">دولة الكفيل:</label>
            <div className="relative">
              <CountryAutocomplete
                countries={sponsorCountries}
                selectedId={selectedCountryFilter === 'الكل' ? '' : (sponsorCountries.find(c => c.name === selectedCountryFilter)?.id || '')}
                onChange={(c) => setSelectedCountryFilter(c ? c.name : 'الكل')}
                placeholder="جميع دول الكفلاء"
                allowAll={true}
                onlyWorkerCountries={false}
              />
            </div>
          </div>

          {/* Profession Filter */}
          <div className="w-56 relative">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">المهن المطلوبة لطلبات العميل:</label>
            <div className="relative">
              <ProfessionAutocomplete
                professions={professions}
                selectedId={selectedProfessionFilter === 'الكل' ? '' : (professions.find(p => p.name === selectedProfessionFilter)?.id || '')}
                onChange={(p) => setSelectedProfessionFilter(p ? p.name : 'الكل')}
                placeholder="جميع المهن"
                allowAll={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-400 dark:text-slate-500 dark:text-slate-400">
            <Users className="w-12 h-12 mx-auto text-slate-300 stroke-1 mb-2" />
            <p className="font-bold text-slate-700 dark:text-slate-200">لا يوجد عملاء مطابقون</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">تأكد من شروط البحث أو التبديل بين النشط والمؤرشف</p>
          </div>
        ) : (
          filteredClients.map(client => {
            const clientOrders = orders.filter(o => o.client_id === client.id);
            return (
              <div
                key={client.id}
                id={`client-card-${client.id}`}
                className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-emerald-300 transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Name & Actions */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 flex items-center justify-center font-bold text-base">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">{client.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 dark:text-slate-400" />
                          <span>{client.country_name} • {client.city_name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditClientModal(client)}
                        title="تعديل بيانات العميل"
                        className="p-1.5 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onToggleArchiveClient(client.id)}
                        title={client.is_archived ? 'استعادة من الأرشيف' : 'نقل إلى الأرشيف'}
                        className="p-1.5 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                      >
                        {client.is_archived ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Client Info Strip */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">الجوال:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white dir-ltr">{client.full_mobile || `${client.phone_code} ${client.mobile}`}</span>
                    </div>
                    {client.national_id && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">الهوية / الإقامة:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-200">{client.national_id}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500 truncate" title={client.address}>
                        العنوان: {client.address}
                      </div>
                    )}
                  </div>

                  {/* Orders counter badge & preview */}
                  <div className="mb-4">
                    <button
                      onClick={() => setSelectedClientForDetails(client)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-900 transition-colors text-xs font-bold border border-emerald-200/60"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-700" />
                        <span>طلبات العميل المسجلة:</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-xs">
                        {clientOrders.length} طلب
                      </span>
                    </button>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    id={`btn-wa-client-${client.id}`}
                    onClick={() => handleSendWelcomeWhatsApp(client)}
                    className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>مراسلة واتساب</span>
                  </button>

                  <button
                    id={`btn-add-order-for-client-${client.id}`}
                    onClick={() => onCreateOrderForClient(client)}
                    className="flex items-center gap-1 text-white bg-slate-900 dark:bg-slate-950 hover:bg-slate-800 dark:hover:bg-slate-800 dark:hover:bg-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>+ طلب استقدام</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Client Orders History Drawer / Modal */}
      {selectedClientForDetails && (
        <div 
          id="client-history-modal"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">
            <div className="bg-slate-900 dark:bg-slate-950 text-white p-5 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">سجل وطلبات العميل: {selectedClientForDetails.name}</h3>
              </div>
              <button
                onClick={() => setSelectedClientForDetails(null)}
                className="p-1.5 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-800 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Client Info Banner */}
              <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{selectedClientForDetails.name}</div>
                  <div className="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-mono dir-ltr text-right mt-0.5">{selectedClientForDetails.full_mobile || selectedClientForDetails.mobile}</div>
                  <div className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-[11px] mt-0.5">{selectedClientForDetails.country_name} - {selectedClientForDetails.city_name}</div>
                </div>
                <button
                  onClick={() => {
                    const c = selectedClientForDetails;
                    setSelectedClientForDetails(null);
                    onCreateOrderForClient(c);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة طلب جديد لهذا العميل</span>
                </button>
              </div>

              {/* Client's Orders List */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                  جميع طلبات الاستقدام لهذا العميل ({orders.filter(o => o.client_id === selectedClientForDetails.id).length})
                </h4>

                {orders.filter(o => o.client_id === selectedClientForDetails.id).length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 dark:text-slate-500">
                    لا توجد طلبات مسجلة لهذا العميل حتى الآن.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders
                      .filter(o => o.client_id === selectedClientForDetails.id)
                      .map(order => (
                        <div key={order.id} className="bg-white dark:bg-slate-900 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-bold font-mono text-slate-900 dark:text-white text-xs flex items-center gap-2">
                              <span>{order.order_number}</span>
                              <span className="text-slate-400 dark:text-slate-500 dark:text-slate-400 font-normal">•</span>
                              <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-normal">{formatDate(order.contract_date)}</span>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800">
                              {order.status}
                            </span>
                          </div>

                          {/* Items */}
                          <div className="space-y-1">
                            {order.items.map((it, idx) => (
                              <div key={it.id || idx} className="text-[11px] bg-slate-50 dark:bg-slate-950/50 p-2 rounded-lg flex items-center justify-between">
                                <div>
                                  <strong className="text-slate-900 dark:text-white">{it.profession_name}</strong>
                                  <span className="text-slate-400 dark:text-slate-500 dark:text-slate-400 mx-1">من</span>
                                  <span className="text-emerald-700 font-semibold">{it.worker_country_name}</span>
                                </div>
                                <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500">{it.status}</span>
                              </div>
                            ))}
                          </div>

                          {/* Bottom Row */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                            <span className="font-mono text-slate-600 dark:text-slate-300">
                              التكلفة: <strong>{formatCurrency(order.total_cost, officeProfile.default_currency)}</strong>
                            </span>
                            <button
                              onClick={() => {
                                setSelectedClientForDetails(null);
                                onViewOrderDetails(order);
                              }}
                              className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>عرض تفاصيل الطلب كاملة</span>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {isFormOpen && (
        <div 
          id="client-form-modal"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">
            <div className="bg-slate-900 dark:bg-slate-950 text-white p-5 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">
                  {editingClient ? 'تعديل بيانات العميل' : 'إضافة عميل جديد (كفيل)'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-800 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitClientForm} className="p-6 space-y-4 text-xs">
              {/* Client Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">اسم العميل (الكفيل):</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="الاسم الثلاثي أو الرباعي..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-950"
                  required
                />
              </div>

              {/* National ID / Iqama */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">رقم الهوية الوطنية / السجل المدني / الإقامة:</label>
                <input
                  type="text"
                  value={formData.national_id || ''}
                  onChange={(e) => setFormData(p => ({ ...p, national_id: e.target.value }))}
                  placeholder="مثال: 1084729183"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-950 font-mono"
                />
              </div>

              {/* Sponsor Country Selection (Shows ONLY Sponsor Countries!) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">
                  دولة العميل (تظهر دول الكفلاء فقط):
                </label>
                <div className="relative">
                  <CountryAutocomplete
                    countries={sponsorCountries}
                    selectedId={formData.country_id || ''}
                    onlyWorkerCountries={false}
                    onChange={(c) => handleCountryChangeInForm(c.id)}
                    placeholder="ابحث عن دولة..."
                  />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">
                  * عند اختيار الدولة يتم تحديث كود الاتصال الدولي وتصفية قائمة المدن تلقائياً.
                </p>
              </div>

              {/* Phone Code + Mobile Phone Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">رقم الموبايل:</label>
                <div className="flex items-center gap-2" dir="ltr">
                  <div className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-mono font-bold text-xs shrink-0">
                    {formData.phone_code || '+966'}
                  </div>
                  <input
                    type="tel"
                    value={formData.mobile || ''}
                    onChange={(e) => setFormData(p => ({ ...p, mobile: e.target.value }))}
                    placeholder="501234567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-950 font-mono text-xs"
                    required
                  />
                </div>
              </div>

              {/* City Selection (Filtered for this sponsor country!) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">
                  المدينة (مصفاة بحسب دولة الكفيل):
                </label>
                <select
                  value={formData.city_id || ''}
                  onChange={(e) => handleCityChangeInForm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-950"
                >
                  <option value="">اختر المدينة...</option>
                  {availableCitiesInForm.length === 0 ? (
                    <option value="" disabled>لا توجد مدن مسجلة لهذه الدولة</option>
                  ) : (
                    availableCitiesInForm.map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">العنوان التفصيلي / الحي:</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                  placeholder="مثال: حي الياسمين، شارع أنس بن مالك"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-950"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">البريد الإلكتروني (اختياري):</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="client@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-950"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">ملاحظات على العميل:</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                  placeholder="تفضيلات، متطلبات خاصة..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-950"
                />
              </div>

              {/* Form Action Buttons */}
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
                  {editingClient ? 'حفظ التعديلات' : 'إضافة العميل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
