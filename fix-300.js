const fs = require('fs');
let content = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

// Generic text-slate-300 that are not prefixed
content = content.replace(/className="([^"]*)text-slate-300([^"]*)"/g, (match, p1, p2) => {
  if (p1.includes('dark:') || match.includes('darkMode ?')) return match;
  
  // If it's the loading screen, it's always dark, leave it alone.
  if (match.includes('text-sm font-bold text-slate-300')) return match;
  
  // If it's a dark button (bg-slate-800), let's make the button light in light mode and dark in dark mode
  if (match.includes('bg-slate-800')) {
     let newMatch = match.replace('bg-slate-800', 'bg-slate-100 dark:bg-slate-800');
     newMatch = newMatch.replace('hover:bg-slate-700', 'hover:bg-slate-200 dark:hover:bg-slate-700');
     return newMatch.replace('text-slate-300', 'text-slate-600 dark:text-slate-300');
  }

  return match.replace('text-slate-300', 'text-slate-700 dark:text-slate-300');
});

fs.writeFileSync('src/app/admin/page.tsx', content, 'utf8');
