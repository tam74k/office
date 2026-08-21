const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Ensure useEffect is imported if not already (it is, but let's check)
if (!content.includes('useEffect')) {
  content = content.replace("import React, { useState }", "import React, { useState, useEffect }");
}

// Add state and effect right inside App()
const stateHook = `
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('app-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('app-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);
`;

if (!content.includes('const [isDarkMode, setIsDarkMode] = useState')) {
  content = content.replace(
    "export function App() {\n  const [activeTab, setActiveTab]",
    `export function App() {${stateHook}\n  const [activeTab, setActiveTab]`
  );
}

// Update Sidebar props
content = content.replace(
  "isMobileOpen={isMobileMenuOpen}",
  "isMobileOpen={isMobileMenuOpen}\n        isDarkMode={isDarkMode}\n        toggleTheme={toggleTheme}"
);

fs.writeFileSync('src/App.tsx', content);
console.log("App.tsx updated");
