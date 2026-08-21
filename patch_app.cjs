const fs = require('fs');
let appFile = fs.readFileSync('src/App.tsx', 'utf8');

if (!appFile.includes('ReportsView')) {
  appFile = appFile.replace(
    "import { ProfessionsView }",
    "import { ReportsView } from './components/ReportsView';\nimport { ProfessionsView }"
  );
  
  const reportsTabStr = `          {activeTab === 'reports' && (
            <ReportsView
              orders={orders}
              clients={clients}
              countries={countries}
              professions={professions}
              officeProfile={officeProfile}
            />
          )}

          {activeTab === 'dashboard'`;

  appFile = appFile.replace("{activeTab === 'dashboard'", reportsTabStr);
  fs.writeFileSync('src/App.tsx', appFile);
}
