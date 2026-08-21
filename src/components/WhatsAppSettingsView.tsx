import React, { useState } from 'react';
import { MessageSquare, Send, Save, RotateCcw, CheckCircle2, Sparkles, Tag, Smartphone, Copy } from 'lucide-react';
import { WhatsAppTemplate, OfficeProfile, OrderStatus } from '../types';
import { INITIAL_WHATSAPP_TEMPLATES } from '../data/initialData';

interface WhatsAppSettingsViewProps {
  templates: WhatsAppTemplate[];
  officeProfile: OfficeProfile;
  onSaveTemplates: (templates: WhatsAppTemplate[]) => void;
}

const TEMPLATE_VARIABLES = [
  { tag: '{اسم_العميل}', label: 'اسم العميل (الكفيل)' },
  { tag: '{رقم_الطلب}', label: 'رقم الطلب' },
  { tag: '{المهنة}', label: 'المهنة المطلوبة' },
  { tag: '{الدولة}', label: 'دولة الاستقدام (العامل)' },
  { tag: '{حالة_الطلب}', label: 'حالة الطلب الحالية' },
  { tag: '{اسم_المكتب}', label: 'اسم المكتب' },
  { tag: '{رقم_المكتب}', label: 'هاتف المكتب' },
  { tag: '{المتبقي}', label: 'المبلغ المتبقي' },
  { tag: '{المرشح}', label: 'اسم المرشح' }
];

export const WhatsAppSettingsView: React.FC<WhatsAppSettingsViewProps> = ({
  templates,
  officeProfile,
  onSaveTemplates
}) => {
  const [localTemplates, setLocalTemplates] = useState<WhatsAppTemplate[]>(templates);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || 'tpl_new');
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  const activeTemplate = localTemplates.find(t => t.id === selectedTemplateId) || localTemplates[0];

  const handleTextChange = (newText: string) => {
    setLocalTemplates(prev => prev.map(tpl => {
      if (tpl.id === selectedTemplateId) {
        return { ...tpl, template: newText };
      }
      return tpl;
    }));
  };

  const handleInsertVariable = (tag: string) => {
    if (!activeTemplate) return;
    const updated = activeTemplate.template + ' ' + tag;
    handleTextChange(updated);
    setCopiedVar(tag);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  const handleSaveAll = () => {
    onSaveTemplates(localTemplates);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 2500);
  };

  const handleResetDefaults = () => {
    if (confirm('هل ترغب باستعادة قوالب الواتساب الافتراضية؟')) {
      setLocalTemplates(INITIAL_WHATSAPP_TEMPLATES);
      onSaveTemplates(INITIAL_WHATSAPP_TEMPLATES);
    }
  };

  // Simulated Live Preview Text
  const simulatedPreview = React.useMemo(() => {
    if (!activeTemplate) return '';
    let preview = activeTemplate.template;
    const sampleValues: Record<string, string> = {
      '{اسم_العميل}': 'سيد القحطاني',
      '{رقم_الطلب}': 'REC-2025-0101',
      '{المهنة}': 'سائق خاص',
      '{الدولة}': 'الهند',
      '{حالة_الطلب}': activeTemplate.status,
      '{اسم_المكتب}': officeProfile.name || 'مكتب النخبة الدولي للاستقدام',
      '{رقم_المكتب}': officeProfile.phone || officeProfile.mobile || '+966 11 2839400',
      '{المتبقي}': `9,500 ${officeProfile.default_currency || 'SAR'}`,
      '{المرشح}': 'محمد راجي خان'
    };
    for (const [key, val] of Object.entries(sampleValues)) {
      preview = preview.split(key).join(val);
    }
    return preview;
  }, [activeTemplate, officeProfile]);

  return (
    <div id="whatsapp-settings-root" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <span>تخصيص قوالب رسائل الواتساب الذكية</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">
            تخصيص نص الرسالة لكل مرحلة وحالة (جديد، كشف طبي، تفييز، سفر) مع دمج المتغيرات الديناميكية تلقائياً
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>الاستعادة للافتراضي</span>
          </button>

          <button
            id="btn-save-whatsapp-templates"
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
          >
            <Save className="w-4 h-4" />
            <span>حفظ القوالب</span>
          </button>
        </div>
      </div>

      {/* Success alert */}
      {isSavedAlert && (
        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>تم حفظ جميع قوالب رسائل الواتساب بنجاح!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Template Selector Tabs & Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Template Tabs */}
          <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">اختر حالة الطلب لتعديل القالب الخاص بها:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {localTemplates.map(tpl => {
                const isSelected = tpl.id === selectedTemplateId;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500/30'
                        : 'bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{tpl.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        isSelected ? 'bg-white dark:bg-slate-900 dark:bg-slate-950/20 text-white' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800'
                      }`}>
                        {tpl.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Variables Insertion Chips */}
          <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>المتغيرات الذكية المتاحة (اضغط للإدراج في نص الرسالة):</span>
              </span>
              {copiedVar && <span className="text-[11px] text-emerald-600 font-bold">تم إدراج {copiedVar}</span>}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {TEMPLATE_VARIABLES.map(v => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => handleInsertVariable(v.tag)}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-1"
                >
                  <Tag className="w-3 h-3 text-slate-400 dark:text-slate-500 dark:text-slate-400" />
                  <span>{v.tag}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-sans">({v.label})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Textarea Editor */}
          <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-100">
                نص قالب: <span className="text-emerald-700">{activeTemplate?.title}</span> ({activeTemplate?.status})
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 dark:text-slate-400">يدعم الإيموجي وتنسيق واتساب (*عريض*، _مائل_)</span>
            </div>

            <textarea
              id="whatsapp-template-textarea"
              value={activeTemplate?.template || ''}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={8}
              className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950/50 focus:bg-white dark:focus:bg-slate-950 text-xs leading-relaxed font-sans focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden"
              placeholder="اكتب قالب الرسالة هنا..."
            />
          </div>
        </div>

        {/* Right Column: WhatsApp Mobile Chat Simulator / Live Preview */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>معاينة حية للرسالة في تطبيق واتساب:</span>
            </h3>

            {/* Mobile Mockup Screen */}
            <div className="bg-[#0b141a] rounded-3xl p-3.5 text-white shadow-xl max-w-sm mx-auto border-4 border-slate-800">
              {/* WhatsApp Header */}
              <div className="bg-[#202c33] p-2.5 rounded-2xl flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
                  {officeProfile.name ? officeProfile.name.charAt(0) : 'ن'}
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="font-bold text-xs truncate">{officeProfile.name || 'مكتب الاستقدام'}</div>
                  <div className="text-[10px] text-emerald-400">متصل الآن (حساب أعمال موثق)</div>
                </div>
              </div>

              {/* Chat Message Bubble */}
              <div className="space-y-2 p-1 min-h-64 flex flex-col justify-end">
                <div className="bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-xs text-[11px] leading-relaxed max-w-[90%] self-end shadow-md whitespace-pre-line">
                  {simulatedPreview}
                  <div className="text-[9px] text-emerald-200 text-left mt-1.5 flex items-center justify-end gap-1">
                    <span>10:30 ص</span>
                    <span>✓✓</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400 text-center">
                يتم إرسال هذا النص تلقائياً عند الضغط على زر واتساب المرفق بالطلب
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
