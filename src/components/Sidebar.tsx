import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Globe2, 
  MapPin, 
  Briefcase, 
  MessageSquare, 
  Building2, 
  Menu,
  X,
  PhoneCall,
  CheckCircle2,
  PlusCircle,
  UserPlus
, Moon,
  Sun,
} from 'lucide-react';
import { NavigationTab, OfficeProfile } from '../types';
import { BarChart2 } from 'lucide-react';

export interface SidebarProps {
  isDarkMode?: boolean;
  toggleTheme?: () => void;
  activeTab?: NavigationTab;
  activeView?: NavigationTab;
  setActiveTab?: (view: NavigationTab) => void;
  setActiveView?: (view: NavigationTab) => void;
  officeProfile: OfficeProfile;
  ordersCount?: number;
  clientsCount?: number;
  isOpenMobile?: boolean;
  isMobileOpen?: boolean;
  setIsOpenMobile?: (open: boolean) => void;
  setIsMobileOpen?: (open: boolean) => void;
  onQuickNewClient?: () => void;
  onQuickNewOrder?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const activeCurrent = props.activeTab || props.activeView || 'dashboard';
  const handleSetActive = (view: NavigationTab) => {
    if (props.setActiveTab) {
      props.setActiveTab(view);
    } else if (props.setActiveView) {
      props.setActiveView(view);
    }
  };

  const isMobileOpen = props.isOpenMobile ?? props.isMobileOpen ?? false;
  const setMobileOpen = (open: boolean) => {
    if (props.setIsOpenMobile) props.setIsOpenMobile(open);
    if (props.setIsMobileOpen) props.setIsMobileOpen(open);
  };

  const menuItems = [
    { id: 'dashboard' as NavigationTab, label: 'لوحة المعلومات', icon: LayoutDashboard, badge: null },
    { id: 'reports' as NavigationTab, label: 'التقارير', icon: BarChart2, badge: null },
    { id: 'orders' as NavigationTab, label: 'إدارة الطلبات', icon: FileText, badge: props.ordersCount },
    { id: 'clients' as NavigationTab, label: 'العملاء (الكفلاء)', icon: Users, badge: props.clientsCount },
    { id: 'countries' as NavigationTab, label: 'جدول الدول', icon: Globe2, badge: null },
    { id: 'cities' as NavigationTab, label: 'جدول المدن', icon: MapPin, badge: null },
    { id: 'professions' as NavigationTab, label: 'المهن والأجور', icon: Briefcase, badge: null },
    { id: 'whatsapp' as NavigationTab, label: 'رسائل الواتساب', icon: MessageSquare, badge: null },
    { id: 'profile' as NavigationTab, label: 'بيانات المكتب', icon: Building2, badge: null },
  ];

  const handleNavClick = (viewId: NavigationTab) => {
    handleSetActive(viewId);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 dark:bg-slate-950 text-white select-none">
      {/* Office Branding Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-lg ring-2 ring-emerald-400/30">
            {props.officeProfile.name ? props.officeProfile.name.charAt(0) : 'ن'}
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-sm text-slate-100 truncate leading-snug">
              {props.officeProfile.name || 'مكتب الاستقدام'}
            </h1>
            <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3 inline" /> {props.officeProfile.license_number ? `ترخيص: ${props.officeProfile.license_number}` : 'نظام معتمد'}
            </p>
          </div>
        </div>
        <button 
          id="btn-close-mobile-menu"
          onClick={() => setMobileOpen(false)}
          aria-label="إغلاق القائمة الجانبية"
          className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-white hover:bg-slate-800 dark:hover:bg-slate-800 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Action In-Place Creation Buttons */}
      <div className="p-3 border-b border-slate-800 space-y-2">
        <button
          id="sidebar-btn-new-order"
          onClick={() => {
            if (props.onQuickNewOrder) props.onQuickNewOrder();
            setMobileOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ تسجيل طلب استقدام</span>
        </button>
        <button
          id="sidebar-btn-new-client"
          onClick={() => {
            if (props.onQuickNewClient) props.onQuickNewClient();
            setMobileOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 dark:bg-slate-800 dark:bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-emerald-400" />
          <span>+ إضافة عميل (كفيل)</span>
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase">
          أقسام النظام
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeCurrent === item.id;
          return (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-800 dark:hover:bg-slate-800 dark:hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white dark:bg-slate-900 dark:bg-slate-950/20 text-white' : 'bg-slate-800 dark:bg-slate-800 dark:bg-slate-800 text-emerald-400 border border-slate-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

            {/* Theme Toggle */}
      {props.toggleTheme && (
        <div className="px-3 pb-3">
          <button
            onClick={props.toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 dark:bg-slate-800 hover:bg-slate-700 dark:hover:bg-slate-700 rounded-xl text-xs font-medium text-slate-300 dark:text-slate-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              {props.isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-400" />}
              <span>{props.isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${props.isDarkMode ? 'bg-emerald-600' : 'bg-slate-600'}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${props.isDarkMode ? 'left-0.5' : 'right-0.5'}`} />
            </div>
          </button>
        </div>
      )}
      
      {/* Office Footer Contact */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400">
          <span className="text-[11px]">{props.officeProfile.city || 'المملكة'}</span>
          <span className="font-mono text-emerald-400 font-bold text-[11px]" dir="ltr">
            {props.officeProfile.phone || props.officeProfile.mobile || ''}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar - Part of the standard document flow so it never covers left data */}
      <aside 
        id="desktop-sidebar"
        className="hidden lg:flex lg:flex-col lg:w-64 print:hidden lg:shrink-0 lg:sticky lg:top-0 lg:h-screen lg:border-l lg:border-slate-800 shadow-xl z-20"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Sliding Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            id="mobile-nav-backdrop"
            onClick={() => setMobileOpen(false)}
            aria-label="إغلاق القائمة"
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-right duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
