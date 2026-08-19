import { Country, City, Profession, Client, Order, WhatsAppTemplate, OfficeProfile } from '../types';

export const INITIAL_COUNTRIES: Country[] = [
  // دول الكفلاء (Sponsor Countries)
  { id: 'c_sa', name: 'المملكة العربية السعودية', code: 'SA', phone_code: '+966', flag_emoji: '🇸🇦', is_sponsor_country: true },
  { id: 'c_ae', name: 'الإمارات العربية المتحدة', code: 'AE', phone_code: '+971', flag_emoji: '🇦🇪', is_sponsor_country: true },
  { id: 'c_kw', name: 'دولة الكويت', code: 'KW', phone_code: '+965', flag_emoji: '🇰🇼', is_sponsor_country: true },
  { id: 'c_qa', name: 'دولة قطر', code: 'QA', phone_code: '+974', flag_emoji: '🇶🇦', is_sponsor_country: true },
  { id: 'c_bh', name: 'مملكة البحرين', code: 'BH', phone_code: '+973', flag_emoji: '🇧🇭', is_sponsor_country: true },
  { id: 'c_om', name: 'سلطنة عمان', code: 'OM', phone_code: '+968', flag_emoji: '🇴🇲', is_sponsor_country: true },

  // دول الاستقدام والعمالة (Worker Countries)
  { id: 'c_in', name: 'الهند', code: 'IN', phone_code: '+91', flag_emoji: '🇮🇳', is_sponsor_country: false },
  { id: 'c_ph', name: 'الفلبين', code: 'PH', phone_code: '+63', flag_emoji: '🇵🇭', is_sponsor_country: false },
  { id: 'c_sd', name: 'السودان', code: 'SD', phone_code: '+249', flag_emoji: '🇸🇩', is_sponsor_country: false },
  { id: 'c_et', name: 'إثيوبيا', code: 'ET', phone_code: '+251', flag_emoji: '🇪🇹', is_sponsor_country: false },
  { id: 'c_ke', name: 'كينيا', code: 'KE', phone_code: '+254', flag_emoji: '🇰🇪', is_sponsor_country: false },
  { id: 'c_ug', name: 'أوغندا', code: 'UG', phone_code: '+256', flag_emoji: '🇺🇬', is_sponsor_country: false },
  { id: 'c_bd', name: 'بنغلاديش', code: 'BD', phone_code: '+880', flag_emoji: '🇧🇩', is_sponsor_country: false },
  { id: 'c_lk', name: 'سريلانكا', code: 'LK', phone_code: '+94', flag_emoji: '🇱🇰', is_sponsor_country: false },
  { id: 'c_pk', name: 'باكستان', code: 'PK', phone_code: '+92', flag_emoji: '🇵🇰', is_sponsor_country: false },
  { id: 'c_eg', name: 'جمهورية مصر العربية', code: 'EG', phone_code: '+20', flag_emoji: '🇪🇬', is_sponsor_country: false },
  { id: 'c_id', name: 'إندونيسيا', code: 'ID', phone_code: '+62', flag_emoji: '🇮🇩', is_sponsor_country: false },
  { id: 'c_ma', name: 'المملكة المغربية', code: 'MA', phone_code: '+212', flag_emoji: '🇲🇦', is_sponsor_country: false },
  { id: 'c_np', name: 'نيبال', code: 'NP', phone_code: '+977', flag_emoji: '🇳🇵', is_sponsor_country: false },
  { id: 'c_vn', name: 'فيتنام', code: 'VN', phone_code: '+84', flag_emoji: '🇻🇳', is_sponsor_country: false }
];

export const INITIAL_CITIES: City[] = [
  // مدن السعودية
  { id: 'ct_ryd', country_id: 'c_sa', name: 'الرياض' },
  { id: 'ct_jed', country_id: 'c_sa', name: 'جدة' },
  { id: 'ct_dmm', country_id: 'c_sa', name: 'الدمام' },
  { id: 'ct_mkk', country_id: 'c_sa', name: 'مكة المكرمة' },
  { id: 'ct_med', country_id: 'c_sa', name: 'المدينة المنورة' },
  { id: 'ct_khb', country_id: 'c_sa', name: 'الخبر' },
  { id: 'ct_abp', country_id: 'c_sa', name: 'أبها' },
  { id: 'ct_tbk', country_id: 'c_sa', name: 'تبوك' },
  { id: 'ct_qsm', country_id: 'c_sa', name: 'القصيم - بريدة' },
  { id: 'ct_hfr', country_id: 'c_sa', name: 'حفر الباطن' },

  // مدن الإمارات
  { id: 'ct_dxb', country_id: 'c_ae', name: 'دبي' },
  { id: 'ct_auh', country_id: 'c_ae', name: 'أبوظبي' },
  { id: 'ct_shj', country_id: 'c_ae', name: 'الشارقة' },
  { id: 'ct_ajm', country_id: 'c_ae', name: 'عجمان' },
  { id: 'ct_rak', country_id: 'c_ae', name: 'رأس الخيمة' },
  { id: 'ct_ain', country_id: 'c_ae', name: 'العين' },

  // مدن الكويت
  { id: 'ct_kwt', country_id: 'c_kw', name: 'مدينة الكويت' },
  { id: 'ct_hml', country_id: 'c_kw', name: 'حولي' },
  { id: 'ct_ahm', country_id: 'c_kw', name: 'الأحمدي' },
  { id: 'ct_frw', country_id: 'c_kw', name: 'الفروانية' },
  { id: 'ct_jhr', country_id: 'c_kw', name: 'الجهراء' },

  // مدن قطر
  { id: 'ct_doh', country_id: 'c_qa', name: 'الدوحة' },
  { id: 'ct_ryn', country_id: 'c_qa', name: 'الريان' },
  { id: 'ct_wkr', country_id: 'c_qa', name: 'الوكرة' },

  // مدن البحرين
  { id: 'ct_man', country_id: 'c_bh', name: 'المنامة' },
  { id: 'ct_mhr', country_id: 'c_bh', name: 'المحرق' },
  { id: 'ct_rif', country_id: 'c_bh', name: 'الرفاع' },

  // مدن عمان
  { id: 'ct_msc', country_id: 'c_om', name: 'مسقط' },
  { id: 'ct_sll', country_id: 'c_om', name: 'صلالة' },
  { id: 'ct_soh', country_id: 'c_om', name: 'صحار' }
];

export const INITIAL_PROFESSIONS: Profession[] = [
  { id: 'p_driver', name: 'سائق خاص', category: 'منزلية', default_salary: 1600, currency: 'SAR', description: 'سياقة سيارة خاصة، رخصة قيادة، معرفة الطرق' },
  { id: 'p_maid', name: 'عاملة منزلية', category: 'منزلية', default_salary: 1500, currency: 'SAR', description: 'تنظيف، غسيل، ترتيب شؤون المنزل' },
  { id: 'p_cook', name: 'طباخ منزلي / طاهي', category: 'منزلية', default_salary: 1800, currency: 'SAR', description: 'طهي الوجبات الخليجية والعربية والعالمية' },
  { id: 'p_nanny', name: 'مربية أطفال', category: 'منزلية', default_salary: 1700, currency: 'SAR', description: 'رعاية الأطفال والأنشطة التعليمية والترفيهية' },
  { id: 'p_nurse', name: 'ممرضة / ممرض منزلي', category: 'منزلية', default_salary: 2800, currency: 'SAR', description: 'رعاية كبار السن وذوي الاحتياجات الخاصة والشهادات الطبية' },
  { id: 'p_guard', name: 'حارس منزلي / أمن', category: 'منزلية', default_salary: 1400, currency: 'SAR', description: 'حراسة الفيلا والممتلكات' },
  { id: 'p_farmer', name: 'مزارع منزلي', category: 'منزلية', default_salary: 1300, currency: 'SAR', description: 'تنسيق الحدائق والري والزراعة' },
  
  // مهنية
  { id: 'p_plumber', name: 'سباك صحي ومعماري', category: 'مهنية', default_salary: 2200, currency: 'SAR', description: 'تمديدات وتأسيس وصيانة شبكات السباكة' },
  { id: 'p_electrician', name: 'كهربائي تمديدات ومباني', category: 'مهنية', default_salary: 2400, currency: 'SAR', description: 'أعمال الكهرباء، لوحات التوزيع، الإنارة' },
  { id: 'p_carpenter', name: 'نجار أبواب وديكور', category: 'مهنية', default_salary: 2100, currency: 'SAR', description: 'نجارة مسلحة، أثاث وديكور' },
  { id: 'p_ac_tech', name: 'فني تكييف وتبريد', category: 'مهنية', default_salary: 2600, currency: 'SAR', description: 'تركيب وصيانة مكيفات سبليت ومركزي' },
  { id: 'p_mason', name: 'بناء وبلاط وسيراميك', category: 'مهنية', default_salary: 2000, currency: 'SAR', description: 'أعمال البناء والتشطيبات وتركيب البلاط' },
  { id: 'p_welder', name: 'لحام وحداد معادن', category: 'مهنية', default_salary: 2300, currency: 'SAR', description: 'أعمال الحدادة واللحام الإنشائي' },
  { id: 'p_barber', name: 'حلاق / كوافير رجالي', category: 'مهنية', default_salary: 2500, currency: 'SAR', description: 'قص الشعر، العناية، خدمات الصالون' },
  { id: 'p_tailor', name: 'خياط وتفصيل أزياء', category: 'مهنية', default_salary: 2200, currency: 'SAR', description: 'تفصيل الثياب والملابس الرجالية والنسائية' }
];

// Completely Clean Initial Clients (no demo data)
export const INITIAL_CLIENTS: Client[] = [];

// Completely Clean Initial Orders (no demo data)
export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tpl_new',
    status: 'جديد',
    title: 'طلب جديد وتسجيل العقد',
    template: `مرحباً بك عميلنا العزيز {اسم_العميل} 🌸
نشكرك لاختيارك {اسم_المكتب}.

تم بنجاح تسجيل طلبك رقم: *{رقم_الطلب}*
🔹 المهنة المطلوبة: {المهنة}
🔹 دولة الاستقدام: {الدولة}
🔹 حالة الطلب الحالية: *{حالة_الطلب}*

نعمل حالياً على فرز السير الذاتية ومطابقة أفضل الكفاءات حسب شروطكم.
لأي استفسار يمكنك التواصل معنا عبر هذا الرقم أو الاتصال على {رقم_المكتب}.`
  },
  {
    id: 'tpl_selected',
    status: 'تم الاختيار',
    title: 'إشعار اختيار المرشح والسيرة الذاتية',
    template: `السلام عليكم أستاذ {اسم_العميل} 🌷
نود إبلاغكم بأنه تم ترشيح واختيار السيرة الذاتية المناسبة لطلبكم رقم *{رقم_الطلب}* ({المهنة} من {الدولة}).

🔹 حالة الطلب: *{حالة_الطلب}*
🔹 المرحلة التالية: إجراء الفحص الطبي المعتمد وتجهيز المستندات الرسمية.

يسعدنا دائماً خدمتكم - {اسم_المكتب}.`
  },
  {
    id: 'tpl_medical',
    status: 'كشف طبي',
    title: 'تحديث مرحلة الفحص الطبي',
    template: `عزيزنا العميل {اسم_العميل} 🩺
نفيدكم ببدء إجراءات الفحص الطبي الشامل للمرشح في دولة {الدولة} لطلبكم رقم *{رقم_الطلب}* ({المهنة}).

🔹 حالة الطلب: *{حالة_الطلب}*
سيتم إشعاركم فور صدور نتائج الكشف الطبي واعتمادها من المراكز المعتمدة.
شاكرين ثقتكم في {اسم_المكتب}.`
  },
  {
    id: 'tpl_visa',
    status: 'تم التفييز',
    title: 'بشارة صدور التأشيرة (تم التفييز)',
    template: `بشرى سارة أستاذ {اسم_العميل} 🎉
يسر {اسم_المكتب} إبلاغكم بصدور التأشيرة بنجاح (تم التفييز) لطلبكم رقم *{رقم_الطلب}* الخاص بـ ({المهنة} - {الدولة}).

🔹 حالة الطلب: *{حالة_الطلب}*
يتم حالياً حجز تذاكر الطيران وتنسيق موعد السفر والوصول، وسنزودكم ببيانات الرحلة قريباً بإذن الله.`
  },
  {
    id: 'tpl_travel',
    status: 'تم السفر',
    title: 'إشعار السفر وموعد الوصول',
    template: `مرحباً بك {اسم_العميل} ✈️
نحيطكم علماً بأنه قد تم إتمام إجراءات السفر ({حالة_الطلب}) للعامل/العاملة لطلبكم رقم *{رقم_الطلب}*.

🔹 المهنة: {المهنة}
🔹 دولة القدوم: {الدولة}
نتمنى لكم التوفيق ونسعد بتقييمكم لخدمتنا في {اسم_المكتب} على الرقم {رقم_المكتب}.`
  },
  {
    id: 'tpl_welcome',
    status: 'ترحيب',
    title: 'رسالة ترحيبية عامة للعميل',
    template: `أهلاً وسهلاً بك أستاذ {اسم_العميل} في {اسم_المكتب} 🤝
يسعدنا تقديم أرقى خدمات استقدام العمالة المهنية والمنزلية من مختلف الدول المعتمدة.
يسرنا الرد على استفساراتكم ومتابعة طلباتكم بكل اهتمام عبر هذا الرقم أو الهاتف: {رقم_المكتب}.`
  }
];

export const INITIAL_OFFICE_PROFILE: OfficeProfile = {
  name: 'مكتب الاستقدام المعتمد',
  license_number: '',
  cr_number: '',
  phone: '',
  mobile: '',
  whatsapp: '',
  email: '',
  address: '',
  city: '',
  country: 'المملكة العربية السعودية',
  fax: '',
  logo_url: '',
  default_currency: 'SAR',
  terms_and_conditions: `1. يلتزم المكتب باستقدام العامل/العاملة المطابقة للشروط والمواصفات المحددة في هذا العقد.
2. مدة التجربة وضمان الكفاءة والفحص الطبي ثلاثة أشهر (90 يوماً) وفق اللائحة المنظمة لوزارة الموارد البشرية.
3. في حال ثبوت عدم اللياقة الطبية أو امتناع العامل عن العمل دون سبب مشروع يتم التعويض أو الاستبدال وفق الأنظمة.
4. يلتزم العميل بسداد المستحقات والرواتب في مواعيدها وتوفير السكن الملائم والرعاية الصحية.`,
  footer_note: 'شكراً لتعاملكم معنا - خدمتكم شرف لنا وسعادتكم غايتنا.'
};
