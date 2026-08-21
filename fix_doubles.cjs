const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // Fix dark:dark:
  newContent = newContent.replace(/dark:dark:/g, 'dark:');
  
  // Fix weird fractions like bg-slate-900/50/50
  newContent = newContent.replace(/\/50\/50/g, '/50');
  newContent = newContent.replace(/\/50\/80/g, '/80');
  newContent = newContent.replace(/\/30\/50/g, '/50');
  
  // Replace dark:bg-slate-950/50/50 or similar
  
  // specific bad patterns: dark:bg-slate-950/20 text-white inside backticks
  newContent = newContent.replace(/bg-white dark:bg-slate-900\/20/g, 'bg-white/20');
  // wait, the original was 'bg-white/20 text-white' inside the sidebar

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log("Fixed", filePath);
  }
}

const dir = 'src/components';
fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.tsx')) {
    processFile(path.join(dir, file));
  }
});
processFile('src/App.tsx');
