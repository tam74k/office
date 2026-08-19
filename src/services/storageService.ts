import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Country, 
  City, 
  Profession, 
  Client, 
  Order, 
  OrderItem,
  WhatsAppTemplate, 
  OfficeProfile, 
  SupabaseConfig 
} from '../types';
import { 
  INITIAL_COUNTRIES, 
  INITIAL_CITIES, 
  INITIAL_PROFESSIONS, 
  INITIAL_WHATSAPP_TEMPLATES, 
  INITIAL_OFFICE_PROFILE 
} from '../data/initialData';

const STORAGE_KEYS = {
  COUNTRIES: 'recruitment_app_countries_v3',
  CITIES: 'recruitment_app_cities_v3',
  PROFESSIONS: 'recruitment_app_professions_v3',
  CLIENTS: 'recruitment_app_clients_v3',
  ORDERS: 'recruitment_app_orders_v3',
  WHATSAPP_TEMPLATES: 'recruitment_app_whatsapp_v3',
  OFFICE_PROFILE: 'recruitment_app_office_v3',
  SUPABASE_CONFIG: 'recruitment_app_supabase_v3',
};

const DEFAULT_SUPABASE_URL = 'https://svnzxbdsgykpxwjijkcy.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_45CKCLvySWwilnmoOnzO8A_oIrOvuIy';

export const StorageService = {
  getSupabaseConfig(): SupabaseConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
    if (!raw) {
      const initial: SupabaseConfig = { 
        url: DEFAULT_SUPABASE_URL, 
        anon_key: DEFAULT_SUPABASE_ANON_KEY, 
        is_connected: true, 
        last_sync: new Date().toISOString() 
      };
      localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(initial));
      return initial;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.url || !parsed.anon_key) {
        parsed.url = DEFAULT_SUPABASE_URL;
        parsed.anon_key = DEFAULT_SUPABASE_ANON_KEY;
        parsed.is_connected = true;
      }
      return parsed;
    } catch {
      return { url: DEFAULT_SUPABASE_URL, anon_key: DEFAULT_SUPABASE_ANON_KEY, is_connected: true, last_sync: null };
    }
  },

  saveSupabaseConfig(config: SupabaseConfig) {
    localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(config));
  },

  getSupabaseClient(): SupabaseClient | null {
    const config = this.getSupabaseConfig();
    if (!config.url || !config.anon_key) return null;
    try {
      return createClient(config.url, config.anon_key);
    } catch (e) {
      console.error('Error initializing Supabase client:', e);
      return null;
    }
  },

  // 1. Countries
  getCountries(): Country[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COUNTRIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(INITIAL_COUNTRIES));
      return INITIAL_COUNTRIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_COUNTRIES;
    }
  },

  saveCountries(countries: Country[]) {
    localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
  },

  async saveCountry(country: Country) {
    const list = this.getCountries();
    const index = list.findIndex(c => c.id === country.id);
    if (index >= 0) {
      list[index] = country;
    } else {
      list.push(country);
    }
    this.saveCountries(list);

    const supabase = this.getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('countries').upsert([{
          name: country.name,
          phone_code: country.phone_code,
          is_sponsor: Boolean(country.is_sponsor_country),
          flag: country.flag_emoji
        }]);
      } catch (e) {
        console.warn('Supabase sync country error:', e);
      }
    }
  },

  async deleteCountry(countryId: string) {
    const list = this.getCountries().filter(c => c.id !== countryId);
    this.saveCountries(list);

    const supabase = this.getSupabaseClient();
    if (supabase) {
      try {
        const isNumeric = /^\d+$/.test(countryId);
        if (isNumeric) {
          await supabase.from('countries').delete().eq('id', Number(countryId));
        }
      } catch (e) {
        console.warn('Supabase delete country error:', e);
      }
    }
  },

  // 2. Cities
  getCities(): City[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CITIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(INITIAL_CITIES));
      return INITIAL_CITIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CITIES;
    }
  },

  saveCities(cities: City[]) {
    localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(cities));
  },

  async saveCity(city: City) {
    const list = this.getCities();
    const index = list.findIndex(c => c.id === city.id);
    if (index >= 0) {
      list[index] = city;
    } else {
      list.push(city);
    }
    this.saveCities(list);

    const supabase = this.getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('cities').upsert([{
          name: city.name,
          country_id: /^\d+$/.test(city.country_id) ? Number(city.country_id) : null
        }]);
      } catch (e) {
        console.warn('Supabase save city error:', e);
      }
    }
  },

  async deleteCity(cityId: string) {
    const list = this.getCities().filter(c => c.id !== cityId);
    this.saveCities(list);

    const supabase = this.getSupabaseClient();
    if (supabase) {
      try {
        if (/^\d+$/.test(cityId)) {
          await supabase.from('cities').delete().eq('id', Number(cityId));
        }
      } catch (e) {
        console.warn('Supabase delete city error:', e);
      }
    }
  },

  // 3. Professions
  getProfessions(): Profession[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFESSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROFESSIONS, JSON.stringify(INITIAL_PROFESSIONS));
      return INITIAL_PROFESSIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PROFESSIONS;
    }
  },

  saveProfessions(professions: Profession[]) {
    localStorage.setItem(STORAGE_KEYS.PROFESSIONS, JSON.stringify(professions));
  },

  async saveProfession(prof: Profession) {
    const list = this.getProfessions();
    const index = list.findIndex(p => p.id === prof.id);
    if (index >= 0) {
      list[index] = prof;
    } else {
      list.push(prof);
    }
    this.saveProfessions(list);

    const supabase = this.getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('professions').upsert([{
          name_ar: prof.name,
          name_en: prof.description || null
        }]);
      } catch (e) {
        console.warn('Supabase save profession error:', e);
      }
    }
  },

  async deleteProfession(profId: string) {
    const list = this.getProfessions().filter(p => p.id !== profId);
    this.saveProfessions(list);

    const supabase = this.getSupabaseClient();
    if (supabase) {
      try {
        if (/^\d+$/.test(profId)) {
          await supabase.from('professions').delete().eq('id', Number(profId));
        }
      } catch (e) {
        console.warn('Supabase delete profession error:', e);
      }
    }
  },

  // 4. Clients / Customers
  getClients(): Client[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveClients(clients: Client[]) {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  },

  async saveClient(client: Client): Promise<Client> {
    const supabase = this.getSupabaseClient();
    let savedClient = { ...client };

    if (supabase) {
      try {
        const fullPhone = client.full_mobile || `${client.phone_code || ''}${client.mobile || ''}`;
        const isNumericId = /^\d+$/.test(client.id);

        const customerPayload: Record<string, any> = {
          name_ar: client.name,
          phone: fullPhone || client.mobile,
          visa_number: client.national_id || '',
          commercial_record: client.notes || client.address || null,
          city: client.city_name || null,
          is_archived: Boolean(client.is_archived),
          created_at: client.created_at || new Date().toISOString()
        };

        if (isNumericId) {
          customerPayload.id = Number(client.id);
        }

        const { data, error } = await supabase
          .from('customers')
          .upsert(customerPayload)
          .select();

        if (error) {
          console.error('Supabase customer upsert error:', error);
        } else if (data && data.length > 0) {
          savedClient.id = String(data[0].id);
          savedClient.created_at = data[0].created_at || savedClient.created_at;
          console.log('Customer successfully saved to Supabase with ID:', savedClient.id);
        }
      } catch (e) {
        console.error('Supabase save client exception:', e);
      }
    }

    // Save locally
    const list = this.getClients();
    const index = list.findIndex(c => c.id === savedClient.id || (client.id && c.id === client.id));
    if (index >= 0) {
      list[index] = savedClient;
    } else {
      list.unshift(savedClient);
    }
    this.saveClients(list);

    return savedClient;
  },

  async deleteClient(clientId: string) {
    const list = this.getClients().filter(c => c.id !== clientId);
    this.saveClients(list);

    const supabase = this.getSupabaseClient();
    if (supabase) {
      try {
        if (/^\d+$/.test(clientId)) {
          await supabase.from('customers').delete().eq('id', Number(clientId));
        } else {
          await supabase.from('customers').delete().or(`id.eq.${clientId},visa_number.eq.${clientId}`);
        }
      } catch (e) {
        console.warn('Supabase delete client error:', e);
      }
    }
  },

  async toggleArchiveClient(clientId: string) {
    let updatedClient: Client | null = null;
    const list = this.getClients().map(c => {
      if (c.id === clientId) {
        updatedClient = { ...c, is_archived: !c.is_archived, updated_at: new Date().toISOString() };
        return updatedClient;
      }
      return c;
    });
    this.saveClients(list);

    if (updatedClient) {
      await this.saveClient(updatedClient);
    }
  },

  // 5. Orders & Order Details
  getOrders(): Order[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveOrders(orders: Order[]) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  async saveOrder(order: Order): Promise<Order> {
    const supabase = this.getSupabaseClient();
    let savedOrder = { ...order };

    if (supabase) {
      try {
        // 1. Resolve numeric customer_id from customers table
        let numericCustomerId: number | null = null;
        if (/^\d+$/.test(order.client_id)) {
          numericCustomerId = Number(order.client_id);
        } else {
          // Look up customer by phone or name
          const { data: custData } = await supabase
            .from('customers')
            .select('id')
            .or(`phone.eq.${order.client_mobile},name_ar.eq.${order.client_name}`)
            .limit(1);

          if (custData && custData.length > 0) {
            numericCustomerId = custData[0].id;
          }
        }

        const isNumericOrderId = /^\d+$/.test(order.id);
        const orderPayload: Record<string, any> = {
          customer_id: numericCustomerId,
          visa_number: order.order_number || '',
          order_date: order.contract_date || new Date().toISOString().split('T')[0],
          status: order.status || 'جديد',
          created_at: order.created_at || new Date().toISOString()
        };

        if (isNumericOrderId) {
          orderPayload.id = Number(order.id);
        }

        const { data: orderRes, error: orderErr } = await supabase
          .from('orders')
          .upsert(orderPayload)
          .select();

        if (orderErr) {
          console.error('Supabase order upsert error:', orderErr);
        } else if (orderRes && orderRes.length > 0) {
          const dbOrderId = orderRes[0].id;
          savedOrder.id = String(dbOrderId);
          console.log('Order saved to Supabase with ID:', dbOrderId);

          // 2. Save items in order_details
          if (order.items && order.items.length > 0) {
            // Delete previous details for this order
            await supabase.from('order_details').delete().eq('order_id', dbOrderId);

            const detailsPayload = order.items.map(item => ({
              order_id: dbOrderId,
              specs_ar: item.profession_name || 'مهنة',
              worker_country: item.worker_country_name || 'الهند',
              age_from: Number(item.age_min) || 25,
              age_to: Number(item.age_max) || 45,
              salary: Number(item.salary) || 1500,
              experience_details: item.experience_type || 'جديد'
            }));

            const { error: detErr } = await supabase.from('order_details').insert(detailsPayload);
            if (detErr) {
              console.error('Supabase order_details insert error:', detErr);
            } else {
              console.log(`Saved ${detailsPayload.length} order items to order_details`);
            }
          }
        }
      } catch (e) {
        console.error('Supabase save order exception:', e);
      }
    }

    // Save locally
    const list = this.getOrders();
    const index = list.findIndex(o => o.id === savedOrder.id || (order.id && o.id === order.id));
    if (index >= 0) {
      list[index] = savedOrder;
    } else {
      list.unshift(savedOrder);
    }
    this.saveOrders(list);

    return savedOrder;
  },

  async deleteOrder(orderId: string) {
    const list = this.getOrders().filter(o => o.id !== orderId);
    this.saveOrders(list);

    const supabase = this.getSupabaseClient();
    if (supabase) {
      try {
        if (/^\d+$/.test(orderId)) {
          const numId = Number(orderId);
          await supabase.from('order_details').delete().eq('order_id', numId);
          await supabase.from('orders').delete().eq('id', numId);
        } else {
          await supabase.from('orders').delete().eq('visa_number', orderId);
        }
      } catch (e) {
        console.warn('Supabase delete order error:', e);
      }
    }
  },

  // 6. WhatsApp Templates
  getWhatsAppTemplates(): WhatsAppTemplate[] {
    const raw = localStorage.getItem(STORAGE_KEYS.WHATSAPP_TEMPLATES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WHATSAPP_TEMPLATES, JSON.stringify(INITIAL_WHATSAPP_TEMPLATES));
      return INITIAL_WHATSAPP_TEMPLATES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_WHATSAPP_TEMPLATES;
    }
  },

  async saveWhatsAppTemplates(templates: WhatsAppTemplate[]) {
    localStorage.setItem(STORAGE_KEYS.WHATSAPP_TEMPLATES, JSON.stringify(templates));
  },

  // 7. Office Profile
  getOfficeProfile(): OfficeProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFICE_PROFILE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.OFFICE_PROFILE, JSON.stringify(INITIAL_OFFICE_PROFILE));
      return INITIAL_OFFICE_PROFILE;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_OFFICE_PROFILE;
    }
  },

  async saveOfficeProfile(profile: OfficeProfile) {
    localStorage.setItem(STORAGE_KEYS.OFFICE_PROFILE, JSON.stringify(profile));
  },

  // Fetch full state from Supabase on App Boot
  async fetchInitialDataFromSupabase(): Promise<{
    clients: Client[];
    orders: Order[];
    countries: Country[];
    cities: City[];
    professions: Profession[];
    whatsappTemplates: WhatsAppTemplate[];
    officeProfile: OfficeProfile;
    isSupabaseOnline: boolean;
  }> {
    const supabase = this.getSupabaseClient();
    
    if (!supabase) {
      return {
        clients: this.getClients(),
        orders: this.getOrders(),
        countries: this.getCountries(),
        cities: this.getCities(),
        professions: this.getProfessions(),
        whatsappTemplates: this.getWhatsAppTemplates(),
        officeProfile: this.getOfficeProfile(),
        isSupabaseOnline: false
      };
    }

    try {
      const [countriesRes, citiesRes, profsRes, custRes, ordersRes] = await Promise.all([
        supabase.from('countries').select('*'),
        supabase.from('cities').select('*'),
        supabase.from('professions').select('*'),
        supabase.from('customers').select('*').order('id', { ascending: false }),
        supabase.from('orders').select('*, order_details(*)').order('id', { ascending: false })
      ]);

      // 1. Countries
      let countries: Country[] = [];
      if (countriesRes.data && countriesRes.data.length > 0) {
        countries = countriesRes.data.map(c => ({
          id: String(c.id),
          name: c.name,
          code: c.phone_code ? c.phone_code.replace('+', '') : 'SA',
          phone_code: c.phone_code || '+966',
          flag_emoji: c.flag || '🏳️',
          is_sponsor_country: Boolean(c.is_sponsor)
        }));
        this.saveCountries(countries);
      } else {
        countries = this.getCountries();
      }

      // 2. Cities
      let cities: City[] = [];
      if (citiesRes.data && citiesRes.data.length > 0) {
        cities = citiesRes.data.map(ct => ({
          id: String(ct.id),
          country_id: String(ct.country_id || '1'),
          name: ct.name
        }));
        this.saveCities(cities);
      } else {
        cities = this.getCities();
      }

      // 3. Professions
      let professions: Profession[] = [];
      if (profsRes.data && profsRes.data.length > 0) {
        professions = profsRes.data.map(p => ({
          id: String(p.id),
          name: p.name_ar,
          category: (p.name_ar.includes('سائق') || p.name_ar.includes('منزل') || p.name_ar.includes('مربي') || p.name_ar.includes('طباخ')) ? 'منزلية' : 'مهنية',
          default_salary: 1500,
          currency: 'SAR',
          description: p.name_en || ''
        }));
        this.saveProfessions(professions);
      } else {
        professions = this.getProfessions();
      }

      // 4. Clients (from customers table)
      let clients: Client[] = [];
      if (custRes.data && custRes.data.length > 0) {
        clients = custRes.data.map(c => ({
          id: String(c.id),
          name: c.name_ar,
          national_id: c.visa_number || '',
          country_id: String(c.country_id || '1'),
          country_name: 'المملكة العربية السعودية',
          phone_code: '+966',
          mobile: c.phone || '',
          full_mobile: c.phone || '',
          city_id: String(c.city_id || ''),
          city_name: c.city || '',
          address: c.commercial_record || '',
          notes: '',
          is_archived: Boolean(c.is_archived),
          created_at: c.created_at || new Date().toISOString()
        }));
        this.saveClients(clients);
      } else {
        clients = this.getClients();
      }

      // 5. Orders (from orders & order_details tables)
      let orders: Order[] = [];
      if (ordersRes.data && ordersRes.data.length > 0) {
        orders = ordersRes.data.map((o: any) => {
          const client = clients.find(c => c.id === String(o.customer_id));
          const items: OrderItem[] = (o.order_details || []).map((det: any, idx: number) => ({
            id: String(det.id || idx + 1),
            profession_id: String(det.profession_requested || '1'),
            profession_name: det.specs_ar || 'سائق خاص',
            worker_country_id: String(det.worker_country_id || '1'),
            worker_country_name: det.worker_country || 'الهند',
            age_min: det.age_from || 25,
            age_max: det.age_to || 45,
            experience_type: det.experience_details || 'خبرة سابقة',
            salary: det.salary || 1500,
            currency: 'SAR',
            gender: 'ذكر',
            religion: 'مسلم',
            recruitment_cost: 12000,
            status: o.status || 'جديد'
          }));

          return {
            id: String(o.id),
            order_number: o.visa_number || `ORD-${o.id}`,
            contract_number: o.visa_number || `CTR-${o.id}`,
            client_id: String(o.customer_id || ''),
            client_name: client?.name || 'عميل',
            client_mobile: client?.full_mobile || client?.mobile || '',
            sponsor_country_name: client?.country_name || 'المملكة العربية السعودية',
            city_name: client?.city_name || 'الرياض',
            status: o.status || 'جديد',
            total_cost: items.length * 12000,
            paid_amount: 0,
            remaining_amount: items.length * 12000,
            payment_method: 'تحويل بنكي',
            contract_date: o.order_date || o.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            expected_arrival_date: '',
            notes: '',
            items: items.length > 0 ? items : [{
              id: '1',
              profession_id: '1',
              profession_name: 'سائق خاص',
              worker_country_id: '1',
              worker_country_name: 'الهند',
              age_min: 25,
              age_max: 45,
              experience_type: 'خبرة سابقة',
              salary: 1500,
              currency: 'SAR',
              gender: 'ذكر',
              religion: 'مسلم',
              recruitment_cost: 12000,
              status: o.status || 'جديد'
            }],
            created_at: o.created_at || new Date().toISOString(),
            updated_at: o.created_at || new Date().toISOString()
          };
        });
        this.saveOrders(orders);
      } else {
        orders = this.getOrders();
      }

      const templates = this.getWhatsAppTemplates();
      const office = this.getOfficeProfile();

      const cfg = this.getSupabaseConfig();
      cfg.is_connected = true;
      cfg.last_sync = new Date().toISOString();
      this.saveSupabaseConfig(cfg);

      return {
        clients,
        orders,
        countries,
        cities,
        professions,
        whatsappTemplates: templates,
        officeProfile: office,
        isSupabaseOnline: true
      };
    } catch (err) {
      console.warn('Error fetching from Supabase on start:', err);
      return {
        clients: this.getClients(),
        orders: this.getOrders(),
        countries: this.getCountries(),
        cities: this.getCities(),
        professions: this.getProfessions(),
        whatsappTemplates: this.getWhatsAppTemplates(),
        officeProfile: this.getOfficeProfile(),
        isSupabaseOnline: false
      };
    }
  },

  async uploadAllToSupabase(): Promise<{ success: boolean; message: string }> {
    const supabase = this.getSupabaseClient();
    if (!supabase) return { success: false, message: 'تعذر الاتصال بقاعدة البيانات' };
    try {
      const clients = this.getClients();
      for (const client of clients) {
        await this.saveClient(client);
      }
      const orders = this.getOrders();
      for (const order of orders) {
        await this.saveOrder(order);
      }
      return { success: true, message: 'تم رفع كافة السجلات بنجاح' };
    } catch (e: any) {
      return { success: false, message: e.message || 'حدث خطأ أثناء الرفع' };
    }
  },

  async downloadAllFromSupabase(): Promise<{ success: boolean; message: string }> {
    try {
      const data = await this.fetchInitialDataFromSupabase();
      return { success: true, message: `تم جلب ${data.clients.length} عميل و ${data.orders.length} طلب بنجاح` };
    } catch (e: any) {
      return { success: false, message: e.message || 'حدث خطأ أثناء التنزيل' };
    }
  },

  resetToInitialData() {
    this.saveClients([]);
    this.saveOrders([]);
  },

  getSupabaseSQLSchema(): string {
    return `-- كود إنشاء الجداول المتطابق مع قاعدة بيانات Supabase
CREATE TABLE IF NOT EXISTS public.countries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone_code TEXT NOT NULL,
  is_sponsor BOOLEAN DEFAULT false,
  flag TEXT
);

CREATE TABLE IF NOT EXISTS public.cities (
  id SERIAL PRIMARY KEY,
  country_id INTEGER REFERENCES public.countries(id),
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.professions (
  id SERIAL PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT
);

CREATE TABLE IF NOT EXISTS public.customers (
  id SERIAL PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  country_id INTEGER,
  city_id INTEGER,
  city TEXT,
  phone TEXT NOT NULL,
  visa_number TEXT,
  commercial_record TEXT,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES public.customers(id) ON DELETE CASCADE,
  order_date DATE DEFAULT CURRENT_DATE,
  visa_number TEXT,
  status_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  order_type TEXT,
  status TEXT DEFAULT 'جديد'
);

CREATE TABLE IF NOT EXISTS public.order_details (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES public.orders(id) ON DELETE CASCADE,
  profession_visa INTEGER,
  profession_requested INTEGER,
  quantity INTEGER DEFAULT 1,
  worker_country_id INTEGER,
  worker_country TEXT,
  age_from INTEGER,
  age_to INTEGER,
  experience_details TEXT,
  salary NUMERIC,
  specs_ar TEXT,
  specs_en TEXT,
  specs TEXT
);
`;
  }
};
