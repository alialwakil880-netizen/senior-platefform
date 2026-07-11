const fs = require('fs');
let content = fs.readFileSync('src/app/admin/page.tsx', 'utf8');

const colors = ['purple', 'amber', 'emerald', 'blue', 'red', 'indigo'];

colors.forEach(color => {
  const regex = new RegExp(`className="([^"]*)text-${color}-400([^"]*)"`, 'g');
  content = content.replace(regex, (match, p1, p2) => {
    // If it's explicitly a dark variant, skip
    if (match.includes(`dark:text-${color}-400`)) return match;
    // If the string contains a ternary (darkMode ?), skip (it's manually handled)
    if (match.includes('darkMode ?')) return match;
    // Replace standalone text-color-400 with text-color-600 dark:text-color-400
    // But be careful not to create duplicate dark:text-color-400 if it already has one for some reason
    return match.replace(`text-${color}-400`, `text-${color}-600 dark:text-${color}-400`);
  });
});

fs.writeFileSync('src/app/admin/page.tsx', content, 'utf8');
