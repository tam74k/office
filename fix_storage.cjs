const fs = require('fs');

let content = fs.readFileSync('src/services/storageService.ts', 'utf8');

// Replace the length > 0 checks with !error checks for data fetching
content = content.replace(
  /if \(countriesRes\.data && countriesRes\.data\.length > 0\) {/g,
  'if (countriesRes.data && !countriesRes.error) {'
);

content = content.replace(
  /if \(citiesRes\.data && citiesRes\.data\.length > 0\) {/g,
  'if (citiesRes.data && !citiesRes.error) {'
);

content = content.replace(
  /if \(profsRes\.data && profsRes\.data\.length > 0\) {/g,
  'if (profsRes.data && !profsRes.error) {'
);

content = content.replace(
  /if \(custRes\.data && custRes\.data\.length > 0\) {/g,
  'if (custRes.data && !custRes.error) {'
);

content = content.replace(
  /if \(ordersRes\.data && ordersRes\.data\.length > 0\) {/g,
  'if (ordersRes.data && !ordersRes.error) {'
);

fs.writeFileSync('src/services/storageService.ts', content);
console.log("Updated storageService.ts length checks");
