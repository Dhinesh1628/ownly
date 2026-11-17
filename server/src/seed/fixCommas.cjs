const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'seedData.js');
let code = fs.readFileSync(seedPath, 'utf8');

// Ensure all summary lines end with a comma before extracted:
code = code.replace(/summary:\s*('[\s\S]*?')\s*\n\s*extracted:/g, 'summary: $1,\n    extracted:');

// Ensure all body lines end with a comma before sentAt:
code = code.replace(/body:\s*('[\s\S]*?')\s*\n\s*sentAt:/g, 'body: $1,\n        sentAt:');

// Ensure all subject lines end with a comma before body:
code = code.replace(/subject:\s*('[\s\S]*?')\s*\n\s*body:/g, 'subject: $1,\n        body:');

fs.writeFileSync(seedPath, code, 'utf8');
console.log('Commas validated successfully');
