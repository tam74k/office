import { Order, OrderItem, WhatsAppTemplate, OfficeProfile } from '../types';

/**
 * Format currency with symbol or code
 */
export function formatCurrency(amount: number | undefined, currency: string = 'SAR'): string {
  if (amount === undefined || amount === null) return `0 ${currency}`;
  return `${amount.toLocaleString('ar-SA')} ${currency}`;
}

/**
 * Clean phone number for WhatsApp international standard link
 * Removes spaces, dashes, parentheses and leading plus/zeroes if redundant
 */
export function sanitizeWhatsAppPhone(phone: string, phoneCode: string = ''): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  
  // If number starts with 00, replace with nothing
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }
  
  // If phoneCode provided (e.g. +966) and phone starts with 0, drop the 0
  const cleanCode = phoneCode.replace(/[^0-9]/g, '');
  if (cleanCode && !cleaned.startsWith(cleanCode)) {
    if (cleaned.startsWith('0')) {
      cleaned = cleanCode + cleaned.substring(1);
    } else {
      cleaned = cleanCode + cleaned;
    }
  }

  return cleaned;
}

/**
 * Replace template variables with dynamic values
 */
export function buildWhatsAppMessage(
  templateText: string,
  order: Order,
  item?: OrderItem,
  officeProfile?: OfficeProfile
): string {
  let result = templateText;

  const targetProfession = item ? item.profession_name : (order.items.map(i => i.profession_name).join(' و ') || 'عمالة');
  const targetCountry = item ? item.worker_country_name : (order.items.map(i => i.worker_country_name).join(' و ') || '-');
  const itemStatus = item ? item.status : order.status;

  const replacements: Record<string, string> = {
    '{اسم_العميل}': order.client_name || 'عميلنا العزيز',
    '{رقم_الطلب}': order.order_number || '-',
    '{المهنة}': targetProfession,
    '{الدولة}': targetCountry,
    '{حالة_الطلب}': itemStatus,
    '{اسم_المكتب}': officeProfile?.name || 'مكتب الاستقدام',
    '{رقم_المكتب}': officeProfile?.phone || officeProfile?.mobile || '',
    '{المتبقي}': order.remaining_amount ? `${order.remaining_amount} ${officeProfile?.default_currency || 'SAR'}` : '0',
    '{المرشح}': item?.candidate_name || 'قيد الترشيح'
  };

  for (const [key, value] of Object.entries(replacements)) {
    result = result.split(key).join(value);
  }

  return result;
}

/**
 * Open WhatsApp directly in web or app
 */
export function openWhatsApp(phone: string, message: string, phoneCode: string = '') {
  const targetNumber = sanitizeWhatsAppPhone(phone, phoneCode);
  const encodedMsg = encodeURIComponent(message);
  const url = `https://wa.me/${targetNumber}?text=${encodedMsg}`;
  window.open(url, '_blank');
}

/**
 * Flexible non-exact / fuzzy Arabic substring search
 * Normalizes Arabic letters (أ إ آ -> ا, ة -> ه, ى -> ي) for superior search experience
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove diacritics / tashkeel
    .replace(/\s+/g, ' ');
}

export function matchesFlexibleArabic(source: string, query: string): boolean {
  if (!query) return true;
  if (!source) return false;
  const normSource = normalizeArabicText(source);
  const normQuery = normalizeArabicText(query);
  
  // Split query into words to match all tokens regardless of order
  const tokens = normQuery.split(' ').filter(t => t.length > 0);
  return tokens.every(token => normSource.includes(token));
}

/**
 * Format standard Arabic Date
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}
