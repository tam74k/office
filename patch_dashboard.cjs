const fs = require('fs');
let file = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

// 1. Add imports
file = file.replace(
  "import { OrdersView } from './OrdersView';",
  "import { OrdersView } from './OrdersView';\nimport { ClientAutocomplete, CountryAutocomplete, ProfessionAutocomplete } from './FormAutocomplete';"
);

// 2. Change state variables
file = file.replace(
  "const [clientQuery, setClientQuery] = useState('');\n  const [mobileQuery, setMobileQuery] = useState('');\n  const [countryQuery, setCountryQuery] = useState('');\n  const [professionQuery, setProfessionQuery] = useState('');",
  "const [selectedClientId, setSelectedClientId] = useState('');\n  const [mobileQuery, setMobileQuery] = useState(''); // Kept just in case it's used elsewhere\n  const [selectedWorkerCountryId, setSelectedWorkerCountryId] = useState('');\n  const [selectedProfessionId, setSelectedProfessionId] = useState('');"
);

// 3. Remove custom suggestion logics (clientSuggestions, professionSuggestions, workerCountrySuggestions)
// I will just replace the whole useMemo blocks with empty string to avoid unused vars
// Actually we can leave them if they are just unused or remove them properly.
// Let's replace the filter logic first
file = file.replace(
  /if \(clientQuery[\s\S]*?if \(mobileQuery\)/,
  `if (selectedClientId && order.client_id !== selectedClientId) {
        return false;
      }
      if (mobileQuery)`
);

file = file.replace(
  /if \(countryQuery\) \{[\s\S]*?matchesFlexibleArabic\(item.worker_country_name, countryQuery\)[\s\S]*?return false;\n      \}/,
  `if (selectedWorkerCountryId) {
        const hasMatchingCountry = order.items.some(item => item.worker_country_id === selectedWorkerCountryId);
        if (!hasMatchingCountry) return false;
      }`
);

file = file.replace(
  /if \(professionQuery\) \{[\s\S]*?matchesFlexibleArabic\(item.profession_name, professionQuery\)[\s\S]*?return false;\n      \}/,
  `if (selectedProfessionId) {
        const hasMatchingProfession = order.items.some(item => item.profession_id === selectedProfessionId);
        if (!hasMatchingProfession) return false;
      }`
);

// Update dependencies array
file = file.replace(
  "[orders, clientQuery, mobileQuery, selectedSponsorCountry, selectedStatus, startDate, endDate, countryQuery, professionQuery]",
  "[orders, selectedClientId, mobileQuery, selectedSponsorCountry, selectedStatus, startDate, endDate, selectedWorkerCountryId, selectedProfessionId]"
);

fs.writeFileSync('src/components/DashboardView.tsx', file);
