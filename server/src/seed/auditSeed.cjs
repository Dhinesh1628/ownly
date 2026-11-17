const { rawSeedEmails } = require('./seedData.js');

const bannedTerms = ['thiel', '20vc', 'stebbings', 'bloomberg', 'techcrunch', 'bessemer', 'deepmind', 'fenwick', 'edelman'];

console.log('--- AUDITING 45 THREADS ---');
let issues = 0;

rawSeedEmails.forEach((c, i) => {
  const json = JSON.stringify(c).toLowerCase();
  bannedTerms.forEach(term => {
    if (json.includes(term)) {
      console.log(`[BANNED TERM] Thread ${i} contains "${term}": ${c.subject}`);
      issues++;
    }
  });

  // Check deadlines format if present
  if (c.extracted?.deadlines?.length > 0) {
    c.extracted.deadlines.forEach(d => {
      // should have day/date/time e.g. "Mon, Nov 16, 5:00 PM EST"
      if (!/^[A-Z][a-z]{2},\s[A-Z][a-z]{2}\s\d{1,2}/.test(d)) {
        console.log(`[DEADLINE FORMAT] Thread ${i} has informal deadline: "${d}"`);
        issues++;
      }
    });
  }
});

console.log(`Audit complete. Issues found: ${issues}`);
