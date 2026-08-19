export type OrderStatus = 'جديد' | 'تم الاختيار' | 'كشف طبي' | 'تم التفييز' | 'تم السفر' | 'ملغي';

export interface Country {
  id: string;
  name: string;
  code: string;
  phone_code: string;
  flag_emoji: string;
  is_sponsor_country: boolean; // true = دولة كفيل (مستقدم), false = دولة عامل (استقدام)
  created_at?: string;
}

export interface City {
  id: string;
  country_id: string;
  country_name?: string;
  name: string;
  created_at?: string;
}

export interface Profession {
  id: string;
  name: string;
  category: 'منزلية' | 'مهنية';
  default_salary: number;
  currency: string;
  description?: string;
  created_at?: string;
}

export interface Client {
  id: string;
  name: string;
  national_id: string;
  country_id: string;
  country_name?: string;
  phone_code: string;
  mobile: string;
  full_mobile?: string;
  city_id: string;
  city_name?: string;
  address: string;
  email?: string;
  notes?: string;
  is_archived: boolean;
  created_at: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  profession_id: string;
  profession_name: string;
  worker_country_id: string;
  worker_country_name: string;
  age_min: number;
  age_max: number;
  gender: 'ذكر' | 'أنثى' | 'غير محدد';
  religion: 'مسلم' | 'غير مسلم' | 'لا يشترط';
  experience_type: 'جديد (بدون خبرة)' | 'خبرة سابقة بالخليج' | 'خبرة محلية' | 'خبرة عامة';
  experience_years?: number;
  salary: number;
  currency: string;
  notes?: string;
  status: OrderStatus;
  candidate_name?: string;
  passport_number?: string;
  visa_number?: string;
  recruitment_cost?: number;
}

export interface Order {
  id: string;
  order_number: string;
  client_id: string;
  client_name: string;
  client_mobile: string;
  sponsor_country_id: string;
  sponsor_country_name: string;
  city_name: string;
  status: OrderStatus;
  total_cost: number;
  paid_amount: number;
  remaining_amount: number;
  payment_method: string;
  contract_date: string;
  expected_arrival_date?: string;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface WhatsAppTemplate {
  id: string;
  status: OrderStatus | 'ترحيب' | 'تحديث_عام';
  title: string;
  template: string;
}

export interface OfficeProfile {
  name: string;
  license_number: string;
  cr_number: string;
  phone: string;
  mobile: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  country: string;
  fax?: string;
  logo_url?: string;
  default_currency: string;
  terms_and_conditions: string;
  footer_note: string;
}

export interface SupabaseConfig {
  url: string;
  anon_key: string;
  is_connected: boolean;
  last_sync: string | null;
}

export type NavigationTab = 
  | 'dashboard'
  | 'orders'
  | 'clients'
  | 'countries'
  | 'cities'
  | 'professions'
  | 'whatsapp'
  | 'profile'
  | 'office'
  | 'supabase';

export type ActiveView = NavigationTab;

