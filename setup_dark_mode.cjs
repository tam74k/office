const fs = require('fs');
const path = require('path');

const mapping = {
  'bg-white': 'bg-white dark:bg-slate-900',
  'bg-slate-50': 'bg-slate-50 dark:bg-slate-900/50',
  'bg-slate-50/50': 'bg-slate-50/50 dark:bg-slate-900/30',
  'bg-slate-100': 'bg-slate-100 dark:bg-slate-800',
  'bg-slate-100/50': 'bg-slate-100/50 dark:bg-slate-800/50',
  'bg-slate-100/90': 'bg-slate-100/90 dark:bg-slate-950',
  'bg-slate-200': 'bg-slate-200 dark:bg-slate-700',
  'bg-slate-800': 'bg-slate-800 dark:bg-slate-800',
  'bg-slate-900': 'bg-slate-900 dark:bg-slate-950',
  'bg-emerald-50': 'bg-emerald-50 dark:bg-emerald-900/30',
  'bg-emerald-100': 'bg-emerald-100 dark:bg-emerald-900/50',
  'bg-amber-50': 'bg-amber-50 dark:bg-amber-900/30',
  'bg-amber-100': 'bg-amber-100 dark:bg-amber-900/50',
  'bg-blue-50': 'bg-blue-50 dark:bg-blue-900/30',
  'bg-blue-100': 'bg-blue-100 dark:bg-blue-900/50',
  'bg-rose-50': 'bg-rose-50 dark:bg-rose-900/30',
  'bg-rose-100': 'bg-rose-100 dark:bg-rose-900/50',
  'text-slate-900': 'text-slate-900 dark:text-white',
  'text-slate-800': 'text-slate-800 dark:text-slate-100',
  'text-slate-700': 'text-slate-700 dark:text-slate-200',
  'text-slate-600': 'text-slate-600 dark:text-slate-300',
  'text-slate-500': 'text-slate-500 dark:text-slate-400',
  'text-slate-400': 'text-slate-400 dark:text-slate-500',
  'border-slate-100': 'border-slate-100 dark:border-slate-800',
  'border-slate-200': 'border-slate-200 dark:border-slate-700',
  'border-slate-300': 'border-slate-300 dark:border-slate-600',
  'divide-slate-100': 'divide-slate-100 dark:divide-slate-800',
  'divide-slate-200': 'divide-slate-200 dark:divide-slate-700',
  'ring-slate-100': 'ring-slate-100 dark:ring-slate-800',
  'ring-slate-200': 'ring-slate-200 dark:ring-slate-700',
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Prevent double matching by only matching classes that aren't immediately followed by dark:
  // e.g. "bg-white" matched, but not "bg-white dark:bg-slate-900"
  // Note: we just check if the newContent changes. If the script was already run, it might double up if we aren't careful.
  // Actually, we can use negative lookahead for " dark:" to prevent this.
  
  const regex = /(?:([a-z0-9:-]+):)?\b(bg-white|bg-slate-(?:50(?:\/50)?|100(?:\/50|\/90)?|200|800|900)|bg-emerald-(?:50|100)|bg-amber-(?:50|100)|bg-blue-(?:50|100)|bg-rose-(?:50|100)|text-slate-[4-9]00|border-slate-[1-3]00|divide-slate-[1-2]00|ring-slate-[1-2]00)\b(?!\s+dark:)/g;

  let newContent = content.replace(regex, (match, prefix, coreClass) => {
    if (!mapping[coreClass]) return match;
    
    let mapped = mapping[coreClass]; // e.g. "bg-white dark:bg-slate-900"
    let parts = mapped.split(' ');
    
    if (prefix) {
      let darkPart = parts[1]; // "dark:bg-slate-900"
      let darkCore = darkPart.replace('dark:', ''); // "bg-slate-900"
      return `${prefix}:${parts[0]} dark:${prefix}:${darkCore}`;
    } else {
      return mapped;
    }
  });

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log("Updated", filePath);
  }
}

const dir = 'src/components';
fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.tsx') && !file.includes('Theme')) {
    processFile(path.join(dir, file));
  }
});
processFile('src/App.tsx');
