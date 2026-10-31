const fs = require('fs');
const html = fs.readFileSync('x:/5555555/content-planner.html', 'utf8');

const lines = html.split('\n');
const titles = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('/* ============================================================') || line.includes('/* ----------')) {
    const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
    titles.push(`Line ${i + 1}: ${line.trim()} | Next: ${nextLine}`);
  }
}

fs.writeFileSync('x:/TESTWEB/section-titles.txt', titles.join('\n'), 'utf8');
console.log('Saved section titles. Total:', titles.length);
