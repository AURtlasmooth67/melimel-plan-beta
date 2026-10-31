const fs = require('fs');
const html = fs.readFileSync('x:/5555555/content-planner.html', 'utf8');

const lines = html.split('\n');
console.log('Total lines:', lines.length);

const results = [];
lines.forEach((l, i) => {
  const trimmed = l.trim();
  if (trimmed.startsWith('/* ==') || trimmed.startsWith('/* --') || trimmed.includes('class="page"') || trimmed.includes('class="tab-btn"') || trimmed.startsWith('<div id="modal-')) {
    results.push((i + 1) + ': ' + trimmed);
  }
});

fs.writeFileSync('x:/TESTWEB/legacy-inventory.txt', results.join('\n'), 'utf8');
console.log('Saved legacy inventory to x:/TESTWEB/legacy-inventory.txt. Matches:', results.length);
