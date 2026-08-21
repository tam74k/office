const fs = require('fs');

let content = fs.readFileSync('src/components/ReportsView.tsx', 'utf8');

const oldLogic = `      if (selectedSponsorCountryId) {
        const sponsorCountry = sponsorCountries.find(c => c.id === selectedSponsorCountryId);
        if (sponsorCountry && order.sponsor_country_name !== sponsorCountry.name) return false;
      }

      if (selectedWorkerCountryId) {
        const hasMatchingCountry = order.items.some(item => item.worker_country_id === selectedWorkerCountryId);
        if (!hasMatchingCountry) return false;
      }

      if (selectedProfessionId) {
        const hasMatchingProfession = order.items.some(item => item.profession_id === selectedProfessionId);
        if (!hasMatchingProfession) return false;
      }`;

const newLogic = `      if (selectedSponsorCountryId) {
        const sponsorCountry = sponsorCountries.find(c => c.id === selectedSponsorCountryId);
        const matchesId = order.sponsor_country_id === selectedSponsorCountryId;
        const matchesName = sponsorCountry && order.sponsor_country_name === sponsorCountry.name;
        if (!matchesId && !matchesName) return false;
      }

      if (selectedWorkerCountryId) {
        const workerCountry = countries.find(c => c.id === selectedWorkerCountryId);
        const hasMatchingCountry = order.items.some(item => 
          item.worker_country_id === selectedWorkerCountryId || 
          (workerCountry && item.worker_country_name === workerCountry.name)
        );
        if (!hasMatchingCountry) return false;
      }

      if (selectedProfessionId) {
        const profession = professions.find(p => p.id === selectedProfessionId);
        const hasMatchingProfession = order.items.some(item => 
          item.profession_id === selectedProfessionId ||
          (profession && item.profession_name === profession.name)
        );
        if (!hasMatchingProfession) return false;
      }`;

if (content.includes('const sponsorCountry = sponsorCountries.find(c => c.id === selectedSponsorCountryId);')) {
  content = content.replace(oldLogic, newLogic);
  fs.writeFileSync('src/components/ReportsView.tsx', content);
  console.log("Updated ReportsView filters");
} else {
  console.log("Could not find the target code in ReportsView.tsx");
}
