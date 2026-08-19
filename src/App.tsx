import React, { useState, useEffect, useCallback } from 'react';
import { 
  Client, 
  Order, 
  OrderStatus,
  Country, 
  City, 
  Profession, 
  OfficeProfile, 
  WhatsAppTemplate, 
  NavigationTab 
} from './types';
import { StorageService } from './services/storageService';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ClientsView } from './components/ClientsView';
import { OrdersView } from './components/OrdersView';
import { CountriesView } from './components/CountriesView';
import { CitiesView } from './components/CitiesView';
import { ProfessionsView } from './components/ProfessionsView';
import { WhatsAppSettingsView } from './components/WhatsAppSettingsView';
import { OfficeProfileView } from './components/OfficeProfileView';
import { ReceiptPrintModal } from './components/ReceiptPrintModal';
import { ClientFormModal } from './components/ClientFormModal';
import { OrderFormModal } from './components/OrderFormModal';
import { Menu, UserPlus, PlusCircle } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Data States
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [officeProfile, setOfficeProfile] = useState<OfficeProfile>(StorageService.getOfficeProfile());
  const [whatsAppTemplates, setWhatsAppTemplates] = useState<WhatsAppTemplate[]>([]);

  // In-Place Modals States
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [preselectedClientForOrder, setPreselectedClientForOrder] = useState<Client | null>(null);

  // Receipt Modal State
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  // Pre-opened order for editing/viewing in OrdersView
  const [preOpenedOrder, setPreOpenedOrder] = useState<Order | null>(null);

  // Load all data from Supabase & Storage
  const refreshAllData = useCallback(async () => {
    try {
      const data = await StorageService.fetchInitialDataFromSupabase();
      setClients(data.clients);
      setOrders(data.orders);
      setCountries(data.countries);
      setCities(data.cities);
      setProfessions(data.professions);
      setWhatsAppTemplates(data.whatsappTemplates);
      setOfficeProfile(data.officeProfile);
    } catch (e) {
      console.warn('Sync error:', e);
      setClients(StorageService.getClients());
      setOrders(StorageService.getOrders());
      setCountries(StorageService.getCountries());
      setCities(StorageService.getCities());
      setProfessions(StorageService.getProfessions());
      setOfficeProfile(StorageService.getOfficeProfile());
      setWhatsAppTemplates(StorageService.getWhatsAppTemplates());
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Clients Handlers
  const handleSaveClient = async (client: Client) => {
    await StorageService.saveClient(client);
    setClients(StorageService.getClients());
  };

  const handleToggleArchiveClient = async (clientId: string) => {
    await StorageService.toggleArchiveClient(clientId);
    setClients(StorageService.getClients());
  };

  const handleDeleteClient = async (clientId: string) => {
    await StorageService.deleteClient(clientId);
    setClients(StorageService.getClients());
  };

  // Orders Handlers
  const handleSaveOrder = async (order: Order) => {
    await StorageService.saveOrder(order);
    setOrders(StorageService.getOrders());
  };

  const handleUpdateOrderStatus = async (order: Order, newStatus: OrderStatus) => {
    const updatedOrder: Order = {
      ...order,
      status: newStatus,
      updated_at: new Date().toISOString()
    };
    await StorageService.saveOrder(updatedOrder);
    setOrders(StorageService.getOrders());
  };

  const handleDeleteOrder = async (orderId: string) => {
    await StorageService.deleteOrder(orderId);
    setOrders(StorageService.getOrders());
  };

  // Countries Handlers
  const handleSaveCountry = async (country: Country) => {
    await StorageService.saveCountry(country);
    setCountries(StorageService.getCountries());
  };

  const handleDeleteCountry = async (countryId: string) => {
    await StorageService.deleteCountry(countryId);
    setCountries(StorageService.getCountries());
  };

  // Cities Handlers
  const handleSaveCity = async (city: City) => {
    await StorageService.saveCity(city);
    setCities(StorageService.getCities());
  };

  const handleDeleteCity = async (cityId: string) => {
    await StorageService.deleteCity(cityId);
    setCities(StorageService.getCities());
  };

  // Professions Handlers
  const handleSaveProfession = async (prof: Profession) => {
    await StorageService.saveProfession(prof);
    setProfessions(StorageService.getProfessions());
  };

  const handleDeleteProfession = async (profId: string) => {
    await StorageService.deleteProfession(profId);
    setProfessions(StorageService.getProfessions());
  };

  // WhatsApp Templates Handlers
  const handleSaveWhatsAppTemplates = async (templates: WhatsAppTemplate[]) => {
    await StorageService.saveWhatsAppTemplates(templates);
    setWhatsAppTemplates(StorageService.getWhatsAppTemplates());
  };

  // Office Profile Handlers
  const handleSaveOfficeProfile = async (profile: OfficeProfile) => {
    await StorageService.saveOfficeProfile(profile);
    setOfficeProfile(profile);
  };

  // In-Place Modal Triggers (stay in the current tab!)
  const handleOpenNewClientModal = (editing: Client | null = null) => {
    setClientToEdit(editing);
    setIsClientModalOpen(true);
  };

  const handleOpenNewOrderModal = (editing: Order | null = null, client: Client | null = null) => {
    setOrderToEdit(editing);
    setPreselectedClientForOrder(client);
    setIsOrderModalOpen(true);
  };

  const handleViewOrderDetails = (order: Order) => {
    setPreOpenedOrder(order);
    setActiveTab('orders');
  };

  const handlePrintReceipt = (order: Order) => {
    setReceiptOrder(order);
  };

  return (
    <div id="recruitment-app-root" className="min-h-screen bg-slate-100/90 text-slate-800 flex font-sans antialiased selection:bg-emerald-500 selection:text-white" dir="rtl">
      {/* Sidebar Navigation - Part of the standard document flow */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setPreOpenedOrder(null);
        }}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        officeProfile={officeProfile}
        ordersCount={orders.length}
        clientsCount={clients.length}
        onQuickNewClient={() => handleOpenNewClientModal(null)}
        onQuickNewOrder={() => handleOpenNewOrderModal(null, null)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Mobile & Tablet Top Bar */}
        <header className="lg:hidden bg-slate-900 text-white p-3 sm:p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 focus:outline-hidden cursor-pointer"
              aria-label="فتح القائمة"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-sm text-white">
                {officeProfile.name ? officeProfile.name.charAt(0) : 'ن'}
              </div>
              <span className="font-bold text-xs sm:text-sm truncate max-w-[180px] sm:max-w-[240px]">
                {officeProfile.name || 'إدارة الاستقدام'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenNewClientModal(null)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              title="إضافة عميل"
            >
              <UserPlus className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleOpenNewOrderModal(null, null)}
              className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>طلب جديد</span>
            </button>
          </div>
        </header>

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              clients={clients}
              orders={orders}
              countries={countries}
              cities={cities}
              professions={professions}
              officeProfile={officeProfile}
              whatsAppTemplates={whatsAppTemplates}
              onNavigateToTab={setActiveTab}
              onViewOrderDetails={handleViewOrderDetails}
              onEditOrder={(order) => handleOpenNewOrderModal(order, null)}
              onUpdateOrder={handleSaveOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onDeleteOrder={handleDeleteOrder}
              onPrintReceipt={handlePrintReceipt}
              onAddNewOrder={() => handleOpenNewOrderModal(null, null)}
              onAddNewClient={() => handleOpenNewClientModal(null)}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsView
              clients={clients}
              orders={orders}
              countries={countries}
              cities={cities}
              professions={professions}
              officeProfile={officeProfile}
              whatsAppTemplates={whatsAppTemplates}
              onSaveClient={handleSaveClient}
              onToggleArchiveClient={handleToggleArchiveClient}
              onDeleteClient={handleDeleteClient}
              onCreateOrderForClient={(client) => handleOpenNewOrderModal(null, client)}
              onViewOrderDetails={handleViewOrderDetails}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={orders}
              clients={clients}
              countries={countries}
              professions={professions}
              officeProfile={officeProfile}
              whatsAppTemplates={whatsAppTemplates}
              onSaveOrder={handleSaveOrder}
              onDeleteOrder={handleDeleteOrder}
              onPrintOrder={handlePrintReceipt}
              onAddNewClient={() => handleOpenNewClientModal(null)}
            />
          )}

          {activeTab === 'countries' && (
            <CountriesView
              countries={countries}
              onSaveCountry={handleSaveCountry}
              onDeleteCountry={handleDeleteCountry}
            />
          )}

          {activeTab === 'cities' && (
            <CitiesView
              cities={cities}
              countries={countries}
              onSaveCity={handleSaveCity}
              onDeleteCity={handleDeleteCity}
            />
          )}

          {activeTab === 'professions' && (
            <ProfessionsView
              professions={professions}
              onSaveProfession={handleSaveProfession}
              onDeleteProfession={handleDeleteProfession}
            />
          )}

          {activeTab === 'whatsapp' && (
            <WhatsAppSettingsView
              templates={whatsAppTemplates}
              officeProfile={officeProfile}
              onSaveTemplates={handleSaveWhatsAppTemplates}
            />
          )}

          {activeTab === 'profile' && (
            <OfficeProfileView
              officeProfile={officeProfile}
              onSaveProfile={handleSaveOfficeProfile}
            />
          )}
        </main>
      </div>

      {/* In-Place Client Creation / Edit Modal */}
      <ClientFormModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setClientToEdit(null);
        }}
        onSave={handleSaveClient}
        clientToEdit={clientToEdit}
        countries={countries}
        cities={cities}
        onClientSavedAndSelect={(savedClient) => {
          // If order modal was waiting or opened, attach client
          setPreselectedClientForOrder(savedClient);
        }}
      />

      {/* In-Place Order Creation / Edit Modal */}
      <OrderFormModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setOrderToEdit(null);
          setPreselectedClientForOrder(null);
        }}
        onSave={handleSaveOrder}
        orderToEdit={orderToEdit}
        clients={clients}
        countries={countries}
        professions={professions}
        officeProfile={officeProfile}
        preselectedClient={preselectedClientForOrder}
        onOpenNewClientModal={() => {
          handleOpenNewClientModal(null);
        }}
      />

      {/* Official Receipt & Contract Print Modal */}
      {receiptOrder && (
        <ReceiptPrintModal
          isOpen={!!receiptOrder}
          onClose={() => setReceiptOrder(null)}
          order={receiptOrder}
          officeProfile={officeProfile}
        />
      )}
    </div>
  );
}

export default App;
