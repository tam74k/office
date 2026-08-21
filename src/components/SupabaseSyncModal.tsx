import React, { useState } from 'react';
import { Database, Key, CheckCircle2, AlertCircle, Copy, Check, RefreshCw, X, ExternalLink, ShieldCheck, Terminal, UploadCloud, DownloadCloud, Sparkles } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Client, Order, Country, City, Profession, OfficeProfile, WhatsAppTemplate } from '../types';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  orders: Order[];
  countries: Country[];
  cities: City[];
  professions: Profession[];
  officeProfile: OfficeProfile;
  whatsAppTemplates: WhatsAppTemplate[];
  onDataImported: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  clients,
  orders,
  countries,
  cities,
  professions,
  officeProfile,
  whatsAppTemplates,
  onDataImported
}) => {
  const currentConfig = StorageService.getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url || 'https://svnzxbdsgykpxwjijkcy.supabase.co');
  const [key, setKey] = useState(currentConfig.anon_key || 'sb_publishable_45CKCLvySWwilnmoOnzO8A_oIrOvuIy');
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'sql' | 'sync'>('sync');

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    StorageService.saveSupabaseConfig({
      url: url.trim(),
      anon_key: key.trim(),
      is_connected: !!(url.trim() && key.trim()),
      last_sync: new Date().toISOString()
    });
    setStatusMessage({
      type: 'success',
      text: 'تم حفظ إعدادات الاتصال بـ Supabase بنجاح وتفعيل الربط السحابي!'
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setStatusMessage(null);
    try {
      if (!url || !key) {
        throw new Error('يرجى كتابة عنوان المشروع Project URL والمفتاح Anon Key أولاً.');
      }
      const testRes = await fetch(`${url.trim()}/rest/v1/`, {
        headers: {
          'apikey': key.trim(),
          'Authorization': `Bearer ${key.trim()}`
        }
      });

      if (testRes.ok || testRes.status === 200 || testRes.status === 404) {
        StorageService.saveSupabaseConfig({
          url: url.trim(),
          anon_key: key.trim(),
          is_connected: true,
          last_sync: new Date().toISOString()
        });
        setStatusMessage({
          type: 'success',
          text: 'تم التحقق من الاتصال بقاعدة بيانات Supabase بنجاح! الخادم يستجيب وجاهز للعمل.'
        });
      } else {
        throw new Error(`كود الاستجابة ${testRes.status}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage({
        type: 'error',
        text: `فشل التحقق من الاتصال: ${msg}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handlePushToSupabase = async () => {
    setIsSyncing(true);
    setStatusMessage(null);
    try {
      const res = await StorageService.uploadAllToSupabase();
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: res.message
        });
        onDataImported();
      } else {
        setStatusMessage({
          type: 'error',
          text: `تعذر الرفع السحابي: ${res.message}. إذا لم تنشئ الجداول بعد، انسخ كود SQL وشغله في Supabase SQL Editor.`
        });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatusMessage({
        type: 'error',
        text: `حدث خطأ: ${msg}`
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullFromSupabase = async () => {
    setIsSyncing(true);
    setStatusMessage(null);
    try {
      const res = await StorageService.downloadAllFromSupabase();
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: res.message
        });
        onDataImported();
      } else {
        setStatusMessage({
          type: 'error',
          text: `تعذر الجلب السحابي: ${res.message}`
        });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setStatusMessage({
        type: 'error',
        text: `حدث خطأ: ${msg}`
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(StorageService.getSupabaseSQLSchema());
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div 
      id="supabase-sync-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">
        {/* Modal Header */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white p-5 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm flex items-center gap-2">
                <span>ربط ومزامنة قاعدة بيانات Supabase</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                  متصل
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400 font-mono mt-0.5">svnzxbdsgykpxwjijkcy.supabase.co</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-800 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'sync'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>المزامنة السحابية الفورية</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>سكربت إنشاء الجداول (SQL)</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>بيانات الاعتماد والمفاتيح</span>
          </button>
        </div>

        {/* Status Notification Message */}
        {statusMessage && (
          <div className="px-6 pt-4">
            <div className={`p-3.5 rounded-2xl border text-xs font-bold flex items-start gap-2.5 ${
              statusMessage.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 text-emerald-900' : 'bg-rose-50 dark:bg-rose-900/30 border-rose-300 text-rose-900'
            }`}>
              {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />}
              <span className="leading-relaxed">{statusMessage.text}</span>
            </div>
          </div>
        )}

        {/* Tab 1: Direct Cloud Sync */}
        {activeTab === 'sync' && (
          <div className="p-6 space-y-5 text-xs">
            {/* Supabase Connected Banner */}
            <div className="bg-emerald-900 text-emerald-50 p-4 rounded-2xl border border-emerald-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-sm flex items-center gap-2 text-white">
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>مشروع Supabase النشط:</span>
                </div>
                <div className="font-mono text-[11px] text-emerald-200 mt-1 dir-ltr text-right">
                  https://svnzxbdsgykpxwjijkcy.supabase.co
                </div>
              </div>

              <a
                href="https://supabase.com/dashboard/project/svnzxbdsgykpxwjijkcy/sql/new"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-white dark:bg-slate-900 dark:bg-slate-950/15 hover:bg-white dark:hover:bg-slate-900 dark:hover:bg-slate-950/25 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 text-[11px]"
              >
                <span>فتح SQL Editor في Supabase</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Sync Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handlePushToSupabase}
                disabled={isSyncing}
                className="p-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl font-bold text-right flex flex-col justify-between transition-all shadow-md shadow-emerald-600/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">رفع البيانات السحابية (Push)</span>
                  <UploadCloud className={`w-5 h-5 ${isSyncing ? 'animate-bounce' : ''}`} />
                </div>
                <p className="text-[11px] text-emerald-100 font-normal">
                  إرسال وتحديث سجلات العملاء والطلبات والدول والمهن والقوالب إلى قاعدة بيانات Supabase
                </p>
              </button>

              <button
                type="button"
                onClick={handlePullFromSupabase}
                disabled={isSyncing}
                className="p-4 bg-slate-900 dark:bg-slate-950 hover:bg-slate-800 dark:hover:bg-slate-800 dark:hover:bg-slate-800 disabled:opacity-50 text-white rounded-2xl font-bold text-right flex flex-col justify-between transition-all shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">جلب البيانات من السحابة (Pull)</span>
                  <DownloadCloud className={`w-5 h-5 ${isSyncing ? 'animate-bounce' : ''}`} />
                </div>
                <p className="text-[11px] text-slate-300 font-normal">
                  تحديث التطبيق المحلي بأحدث السجلات الموجودة في جداول Supabase
                </p>
              </button>
            </div>

            {/* Local Stats */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-2.5">إحصائيات السجلات الجاهزة للمزامنة:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-[11px] block">العملاء (الكفلاء):</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white font-mono">{clients.length} عميل</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-[11px] block">عقود وطلبات الاستقدام:</span>
                  <span className="text-base font-bold text-emerald-700 font-mono">{orders.length} طلب</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-[11px] block">جدول الدول:</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white font-mono">{countries.length} دولة</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-[11px] block">جدول المدن:</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white font-mono">{cities.length} مدينة</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-[11px] block">جدول المهن والأجور:</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white font-mono">{professions.length} مهنة</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-[11px] block">قوالب رسائل الواتساب:</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white font-mono">{whatsAppTemplates.length} قالب</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 dark:text-slate-400">
                آخر فحص: {currentConfig.last_sync ? new Date(currentConfig.last_sync).toLocaleTimeString('ar-SA') : 'الآن'}
              </span>
              <button
                onClick={() => {
                  StorageService.resetToInitialData();
                  onDataImported();
                  onClose();
                }}
                className="text-rose-600 hover:text-rose-700 text-xs font-bold"
              >
                إعادة ضبط البيانات التجريبية
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: SQL Script */}
        {activeTab === 'sql' && (
          <div className="p-6 space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                إذا كنت تنشئ الجداول لأول مرة، انسخ هذا الكود والصقه في <strong>Supabase SQL Editor</strong>:
              </p>
              <div className="flex items-center gap-2">
                <a
                  href="https://supabase.com/dashboard/project/svnzxbdsgykpxwjijkcy/sql/new"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-900 dark:bg-slate-950 hover:bg-slate-800 dark:hover:bg-slate-800 dark:hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1 shadow-xs shrink-0 text-xs"
                >
                  <span>فتح SQL Editor</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={handleCopySql}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1 shadow-xs shrink-0"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'تم النسخ!' : 'نسخ سكربت SQL'}</span>
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-[10px] rounded-2xl max-h-72 overflow-y-auto leading-relaxed dir-ltr text-left border border-slate-800">
              {StorageService.getSupabaseSQLSchema()}
            </pre>
          </div>
        )}

        {/* Tab 3: Connection Config Details */}
        {activeTab === 'config' && (
          <div className="p-6 space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">
                رابط مشروع Supabase (Project URL):
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-950 font-mono text-xs dir-ltr text-right"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">
                المفتاح العام (Project API Anon / Publishable Key):
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="sb_publishable_..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-950 font-mono text-xs dir-ltr text-right"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2 bg-slate-800 dark:bg-slate-800 dark:bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'جاري فحص الاتصال...' : 'اختبار الاتصال'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-600/30"
              >
                حفظ بيانات الربط
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
