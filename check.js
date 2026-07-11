const fs = require('fs');
const content = fs.readFileSync('src/app/admin/page.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.match(/className="[^"]*text-slate-300[^"]*"/)) {
    if (!line.includes('dark:') && !line.includes('darkMode ?')) {
      console.log((i+1) + ': ' + line.trim());
    }
  }
});
