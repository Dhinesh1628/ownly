const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'seedData.js');
let code = fs.readFileSync(seedPath, 'utf8');

const accurateHelpers = `const now = new Date();
const hoursAgo = (h) => new Date(now.getTime() - h * 60 * 60 * 1000);
const daysAgo = (d, h = 0) => new Date(now.getTime() - (d * 24 + h) * 60 * 60 * 1000);

const WORKSPACE_TIMEZONE = 'America/Los_Angeles';

const formatInTZ = (date, options) =>
  new Intl.DateTimeFormat('en-US', { timeZone: WORKSPACE_TIMEZONE, ...options }).format(date);

const makePSTDate = (daysFromNow, hourPST = 17, minutePST = 0) => {
  const pstDayStr = now.toLocaleDateString('en-CA', { timeZone: WORKSPACE_TIMEZONE }); // YYYY-MM-DD
  const [y, m, d] = pstDayStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + daysFromNow, hourPST + 8, minutePST));
};

const formatDeadline = (daysFromNow, hourPST = 17, minutePST = 0) => {
  const d = makePSTDate(daysFromNow, hourPST, minutePST);
  const weekday = formatInTZ(d, { weekday: 'short' });
  const month = formatInTZ(d, { month: 'short' });
  const day = formatInTZ(d, { day: 'numeric' });
  const time = formatInTZ(d, { hour: 'numeric', minute: '2-digit', hour12: true });
  return \`\${weekday}, \${month} \${day}, \${time} PST\`;
};

const formatMeeting = (title, daysFromNow, hourPST = 10, minutePST = 0, attendees = []) => {
  const d = makePSTDate(daysFromNow, hourPST, minutePST);
  const weekday = formatInTZ(d, { weekday: 'short' });
  const month = formatInTZ(d, { month: 'short' });
  const day = formatInTZ(d, { day: 'numeric' });
  const time = formatInTZ(d, { hour: 'numeric', minute: '2-digit', hour12: true });
  return {
    title,
    date: \`\${weekday}, \${month} \${day}\`,
    time: \`\${time} PST\`,
    attendees,
  };
};`;

code = code.replace(
  /const now = new Date\(\);[\s\S]*?return \{\s*title,\s*date:\s*`\$\{weekday\}, \$\{month\} \$\{day\}`,\s*time:\s*`\$\{time\} PST`,\s*attendees,\s*\};\s*\};/,
  accurateHelpers
);

fs.writeFileSync(seedPath, code, 'utf8');
console.log('Accurate PST helper written to seedData.js');
