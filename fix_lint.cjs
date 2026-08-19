const fs = require('fs');

// 1. DashboardView: remove suggestion useMemos and references
let dbFile = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');
dbFile = dbFile.replace(/const clientNameSuggestions = useMemo\([\s\S]*?\}, \[clients, orders, clientQuery\]\);/g, '');
dbFile = dbFile.replace(/const professionSuggestions = useMemo\([\s\S]*?\}, \[professions, orders, professionQuery\]\);/g, '');
dbFile = dbFile.replace(/const workerCountrySuggestions = useMemo\([\s\S]*?\}, \[countries, countryQuery\]\);/g, '');

// Also remove them from the banner check
dbFile = dbFile.replace(
  /\(clientQuery \|\| mobileQuery \|\| countryQuery \|\| professionQuery \|\|/g,
  '(selectedClientId || mobileQuery || selectedWorkerCountryId || selectedProfessionId ||'
);
fs.writeFileSync('src/components/DashboardView.tsx', dbFile);

// 2. OrderFormModal: remove clientSearchQuery, fix types
let ofmFile = fs.readFileSync('src/components/OrderFormModal.tsx', 'utf8');
ofmFile = ofmFile.replace(/setClientSearchQuery\(.*?\);/g, '');
ofmFile = ofmFile.replace(/setShowClientDropdown\(.*?\);/g, '');
ofmFile = ofmFile.replace(/const filteredClients = useMemo\([\s\S]*?\}, \[clients, clientSearchQuery\]\);/g, '');

ofmFile = ofmFile.replace(/gender: '',/g, "gender: 'غير محدد',");
ofmFile = ofmFile.replace(/religion: '',/g, "religion: 'لا يشترط',");
ofmFile = ofmFile.replace(/experience_type: '',/g, "experience_type: 'جديد (بدون خبرة)',");
fs.writeFileSync('src/components/OrderFormModal.tsx', ofmFile);

// 3. OrdersView: remove clientSearchQuery, fix types
let ovFile = fs.readFileSync('src/components/OrdersView.tsx', 'utf8');
ovFile = ovFile.replace(/setClientSearchQuery\(.*?\);/g, '');
ovFile = ovFile.replace(/setShowClientDropdown\(.*?\);/g, '');

ovFile = ovFile.replace(/gender: '',/g, "gender: 'غير محدد',");
ovFile = ovFile.replace(/religion: '',/g, "religion: 'لا يشترط',");
ovFile = ovFile.replace(/experience_type: '',/g, "experience_type: 'جديد (بدون خبرة)',");
fs.writeFileSync('src/components/OrdersView.tsx', ovFile);

