const fs = require('fs');
let dbFile = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const replacement = `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
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
        </div>`;

dbFile = dbFile.replace(/<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">[\s\S]*?<\/div>\s*<\/div>/, replacement);

fs.writeFileSync('src/components/DashboardView.tsx', dbFile);
