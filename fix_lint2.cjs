const fs = require('fs');
let dbFile = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

dbFile = dbFile.replace(/const workerCountrySuggestions = useMemo\([\s\S]*?\}, \[countries, orders, countryQuery\]\);/g, '');

fs.writeFileSync('src/components/DashboardView.tsx', dbFile);
