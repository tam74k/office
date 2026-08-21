const fs = require('fs');

let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const oldWorker = `      // Worker Country filter (checks across all order detail items)
      if (selectedWorkerCountryId) {
        const hasMatchingCountry = order.items.some(item => item.worker_country_id === selectedWorkerCountryId);
        if (!hasMatchingCountry) return false;
      }`;

const newWorker = `      // Worker Country filter (checks across all order detail items)
      if (selectedWorkerCountryId) {
        const workerCountry = countries.find(c => c.id === selectedWorkerCountryId);
        const hasMatchingCountry = order.items.some(item => 
          item.worker_country_id === selectedWorkerCountryId || 
          (workerCountry && item.worker_country_name === workerCountry.name)
        );
        if (!hasMatchingCountry) return false;
      }`;

const oldProfession = `      // Profession filter (checks across all order detail items)
      if (selectedProfessionId) {
        const hasMatchingProfession = order.items.some(item => item.profession_id === selectedProfessionId);
        if (!hasMatchingProfession) return false;
      }`;

const newProfession = `      // Profession filter (checks across all order detail items)
      if (selectedProfessionId) {
        const profession = professions.find(p => p.id === selectedProfessionId);
        const hasMatchingProfession = order.items.some(item => 
          item.profession_id === selectedProfessionId ||
          (profession && item.profession_name === profession.name)
        );
        if (!hasMatchingProfession) return false;
      }`;

content = content.replace(oldWorker, newWorker);
content = content.replace(oldProfession, newProfession);

fs.writeFileSync('src/components/DashboardView.tsx', content);
console.log("Updated DashboardView filters");
