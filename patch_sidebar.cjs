const fs = require('fs');

let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Add Sun and Moon to imports if not there
if (!content.includes('Moon')) {
  content = content.replace("from 'lucide-react';", "  Moon,\n  Sun,\n} from 'lucide-react';");
}

// Add to SidebarProps
if (!content.includes('isDarkMode?: boolean;')) {
  content = content.replace(
    'export interface SidebarProps {',
    'export interface SidebarProps {\n  isDarkMode?: boolean;\n  toggleTheme?: () => void;'
  );
}

// Add the toggle button in the footer
const footerStr = `<div className="p-3.5 border-t border-slate-800 dark:border-slate-800 bg-slate-950/50 dark:bg-slate-950">`;
const toggleHtml = `      {/* Theme Toggle */}
      {props.toggleTheme && (
        <div className="px-3 pb-3">
          <button
            onClick={props.toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 dark:bg-slate-800 hover:bg-slate-700 dark:hover:bg-slate-700 rounded-xl text-xs font-medium text-slate-300 dark:text-slate-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              {props.isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-400" />}
              <span>{props.isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>
            </div>
            <div className={\`w-8 h-4 rounded-full relative transition-colors \${props.isDarkMode ? 'bg-emerald-600' : 'bg-slate-600'}\`}>
              <div className={\`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all \${props.isDarkMode ? 'left-0.5' : 'right-0.5'}\`} />
            </div>
          </button>
        </div>
      )}
      
      {/* Office Footer Contact */}`;

content = content.replace("{/* Office Footer Contact */}", toggleHtml);

fs.writeFileSync('src/components/Sidebar.tsx', content);
console.log("Sidebar updated");
