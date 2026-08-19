const fs = require('fs');
let file = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

// Replace Client Input
file = file.replace(
  /<div className="relative">\s*<label className="block text-\[11px\] font-bold text-slate-600 mb-1">اسم العميل \(بحث مرن\):<\/label>[\s\S]*?<\/div>\s*<\/div>/,
  `<div className="relative">
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
          </div>`
);

// Replace Mobile Phone ? Let's just remove the Mobile Phone filter entirely since ClientAutocomplete searches mobile too, OR we can leave it. But leaving it is fine. I'll just remove it for cleanliness so it aligns well (5 columns? no, let's just leave it alone since it's 6 columns). Wait, the grid is xl:grid-cols-6. Let's just keep the mobile or hide it? The user said "any field that relates to the client name, professions, or countries". Mobile relates to client, ClientAutocomplete covers mobile. Let's remove it and make the grid 5 columns or whatever. Actually, let's leave Mobile Phone.

// Replace Worker Country Input
file = file.replace(
  /<div className="relative">\s*<label className="block text-\[11px\] font-bold text-slate-600 mb-1">دولة العامل \(الاستقدام\):<\/label>[\s\S]*?<\/div>\s*<\/div>/,
  `<div className="relative">
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
          </div>`
);

// Replace Profession Input
file = file.replace(
  /<div className="relative">\s*<label className="block text-\[11px\] font-bold text-slate-600 mb-1">المهنة المطلوبة \(بحث جزئي\):<\/label>[\s\S]*?<\/div>\s*<\/div>/,
  `<div className="relative">
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
          </div>`
);

// We need to also clear these new variables in the "إعادة تعيين الفلاتر" (Reset Filters) button.
file = file.replace(
  /setClientQuery\(''\);\s*setMobileQuery\(''\);\s*setCountryQuery\(''\);\s*setProfessionQuery\(''\);/,
  `setSelectedClientId('');
              setMobileQuery('');
              setSelectedWorkerCountryId('');
              setSelectedProfessionId('');`
);

fs.writeFileSync('src/components/DashboardView.tsx', file);
