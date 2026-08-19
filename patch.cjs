const fs = require('fs');
let file = fs.readFileSync('src/components/FormAutocomplete.tsx', 'utf8');

// Patch ProfessionAutocomplete
file = file.replace(
  'onChange: (profession: Profession) => void;',
  'onChange: (profession: Profession | null) => void;\n  allowAll?: boolean;'
);
file = file.replace(
  "placeholder = 'ابحث عن مهنة (مثال: سائق، عاملة منزلية...)'",
  "placeholder = 'ابحث عن مهنة (مثال: سائق، عاملة منزلية...)',\n  allowAll = false"
);
file = file.replace(
  "setQuery('');",
  "setQuery(allowAll ? 'الكل' : '');"
);

// Patch CountryAutocomplete
file = file.replace(
  'onChange: (country: Country) => void;',
  'onChange: (country: Country | null) => void;\n  allowAll?: boolean;'
);
file = file.replace(
  "onlyWorkerCountries = true",
  "onlyWorkerCountries = true,\n  allowAll = false"
);
// note there are 2 setQuery(''); let's just replace all setQuery(''); in the file for now, wait no, let's do it carefully.
fs.writeFileSync('src/components/FormAutocomplete.tsx', file);
