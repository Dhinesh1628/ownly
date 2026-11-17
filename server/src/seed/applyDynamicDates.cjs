const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'seedData.js');
let code = fs.readFileSync(seedPath, 'utf8');

// Replace top helpers
const topHelpers = `const now = new Date();
const hoursAgo = (h) => new Date(now.getTime() - h * 60 * 60 * 1000);
const daysAgo = (d, h = 0) => new Date(now.getTime() - (d * 24 + h) * 60 * 60 * 1000);

const WORKSPACE_TIMEZONE = 'America/Los_Angeles';

const formatInTZ = (date, options) =>
  new Intl.DateTimeFormat('en-US', { timeZone: WORKSPACE_TIMEZONE, ...options }).format(date);

const formatDeadline = (daysFromNow, hour = 17, minute = 0) => {
  const d = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
  d.setHours(hour, minute, 0, 0);
  const weekday = formatInTZ(d, { weekday: 'short' });
  const month = formatInTZ(d, { month: 'short' });
  const day = formatInTZ(d, { day: 'numeric' });
  const time = formatInTZ(d, { hour: 'numeric', minute: '2-digit', hour12: true });
  return \`\${weekday}, \${month} \${day}, \${time} PST\`;
};

const formatMeeting = (title, daysFromNow, hour = 10, minute = 0, attendees = []) => {
  const d = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
  d.setHours(hour, minute, 0, 0);
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
  /const now = new Date\(\);\s*const hoursAgo = \(h\) => new Date\(now\.getTime\(\) - h \* 60 \* 60 \* 1000\);\s*const daysAgo = \(d, h = 0\) => new Date\(now\.getTime\(\) - \(d \* 24 \+ h\) \* 60 \* 60 \* 1000\);/,
  topHelpers
);

// Replace hardcoded deadlines with dynamic formatDeadline calls
// Thread 0: Series A Term Sheet (Due Friday / 5 days)
code = code.replace(
  "deadlines: ['Fri, Nov 20, 5:00 PM PST'],",
  "deadlines: [formatDeadline(5, 17, 0)],"
);

// Thread 1: Elena Rostova meeting
code = code.replace(
  "meetings: [{ title: 'Q4 Strategy Sync', date: 'Friday', time: '10:00 AM PST', attendees: ['elena@stridegrowth.io'] }],",
  "meetings: [formatMeeting('Q4 Strategy Sync', 5, 10, 0, ['elena@stridegrowth.io'])],"
);

// Thread 3: AWS Invoice (Due Today)
code = code.replace(
  "deadlines: ['Sun, Nov 15, 11:59 PM PST'],",
  "deadlines: [formatDeadline(0, 23, 59)],"
);

// Thread 4: FinTech Network (Due Tomorrow 1 day, meeting 2 days)
code = code.replace(
  "subject: 'FinTech Global Daily: Interview on Enterprise AI Agent rollouts',",
  "subject: 'FinTech Network: Interview on Enterprise AI Agent rollouts',"
);
code = code.replace(
  "summary: 'Evelyn Ward from FinTech Global Daily requested a live 10-minute broadcast interview next Tuesday regarding enterprise AI assistant adoption.',",
  "summary: 'Evelyn Ward from FinTech Network requested a live 10-minute broadcast interview regarding enterprise AI assistant adoption.',"
);
code = code.replace(
  "reason: 'Major tier-1 media interview request requiring client on-air spokesperson confirmation.',",
  "reason: 'FinTech Network broadcast interview request requiring client on-air spokesperson confirmation.',"
);
code = code.replace(
  "deadlines: ['Mon, Nov 16, 5:00 PM EST'],",
  "deadlines: [formatDeadline(1, 17, 0)],"
);
code = code.replace(
  "meetings: [{ title: 'FinTech Global Live Segment', date: 'Tuesday Nov 17', time: '11:30 AM EST', attendees: ['eward@fintechnetwork.io'] }],",
  "meetings: [formatMeeting('FinTech Network Live Segment', 2, 11, 30, ['eward@fintechnetwork.io'])],"
);
code = code.replace(
  "subject: 'FinTech Global Daily: Interview on Enterprise AI Agent rollouts',",
  "subject: 'FinTech Network: Interview on Enterprise AI Agent rollouts',"
);
code = code.replace(
  "body: 'We are hosting a segment next Tuesday at 11:30 AM EST on FinTech Global Daily focusing on AI agents in executive workflows. Would you be open to joining live via studio or remote link? Please let me know by tomorrow.',",
  "body: 'We are hosting a segment on FinTech Network focusing on AI agents in executive workflows. Would you be open to joining live via studio or remote link? Please let me know by tomorrow.',"
);

// Thread 6: Acme MSA (Due in 15 days - Later)
code = code.replace(
  "deadlines: ['Mon, Nov 30, 5:00 PM PST'],",
  "deadlines: [formatDeadline(15, 17, 0)],"
);

// Thread 8: Executive Dinner (Due tomorrow 1 day, meeting in 19 days)
code = code.replace(
  "deadlines: ['Mon, Nov 16, 12:00 PM PST'],",
  "deadlines: [formatDeadline(1, 12, 0)],"
);
code = code.replace(
  "meetings: [{ title: 'Executive Dinner', date: 'Dec 4', time: '7:30 PM', attendees: ['8 attendees'] }],",
  "meetings: [formatMeeting('Executive Dinner', 19, 19, 30, ['Chef Jean-Luc', '8 attendees'])],"
);

// Thread 12: NeurIPS (Due in 10 days, meeting in 23 days)
code = code.replace(
  "deadlines: ['Wed, Nov 25, 5:00 PM EST'],",
  "deadlines: [formatDeadline(10, 17, 0)],"
);
code = code.replace(
  "meetings: [{ title: 'NeurIPS 2026', date: 'Dec 8', time: '9:00 AM', attendees: ['speaker lounge'] }],",
  "meetings: [formatMeeting('NeurIPS 2026 Session', 23, 9, 0, ['speaker lounge'])],"
);

// Thread 15: Apple MacBook Quote (Due in 15 days)
code = code.replace(
  "deadlines: ['Mon, Nov 30, 11:59 PM PST'],",
  "deadlines: [formatDeadline(15, 23, 59)],"
);

// Thread 16: VentureStage Summit Keynote (Due in 5 days, meeting in 26 days)
code = code.replace(
  "deadlines: ['Fri, Nov 20, 5:00 PM PST'],",
  "deadlines: [formatDeadline(5, 17, 0)],"
);
code = code.replace(
  "meetings: [{ title: 'VentureStage Summit Keynote', date: 'Dec 11', time: '4:00 PM GMT', attendees: ['jhall@venturestage.media'] }],",
  "meetings: [formatMeeting('VentureStage Summit Keynote', 26, 8, 0, ['jhall@venturestage.media'])],"
);

// Thread 18: Dental Cleaning (Meeting in 5 days)
code = code.replace(
  "meetings: [{ title: 'Dental Cleaning', date: 'Nov 20', time: '8:30 AM', attendees: ['Dr. Vance'] }],",
  "meetings: [formatMeeting('Dental Cleaning', 5, 8, 30, ['Dr. Vance'])],"
);

// Thread 19: Advisory Agreement (Due in 3 days)
code = code.replace(
  "deadlines: ['Wed, Nov 18, 9:00 AM PST'],",
  "deadlines: [formatDeadline(3, 9, 0)],"
);

// Thread 20: Draft Press Release (Due in 2 days)
code = code.replace(
  "deadlines: ['Tue, Nov 17, 2:00 PM EST'],",
  "deadlines: [formatDeadline(2, 11, 0)],"
);

// Thread 21: Castilleja School (Due in 16 days)
code = code.replace(
  "deadlines: ['Tue, Dec 1, 5:00 PM PST'],",
  "deadlines: [formatDeadline(16, 17, 0)],"
);

// Thread 23: Mission St HQ Lease Guarantee (Due in 3 days)
code = code.replace(
  "deadlines: ['Wed, Nov 18, 5:00 PM PST'],",
  "deadlines: [formatDeadline(3, 17, 0)],"
);

// Thread 24: Board Meeting Lunch (Due in 25 days, meeting in 30 days)
code = code.replace(
  "deadlines: ['Thu, Dec 10, 6:00 PM PST'],",
  "deadlines: [formatDeadline(25, 18, 0)],"
);
code = code.replace(
  "meetings: [{ title: 'Q4 Board Meeting Lunch', date: 'Dec 15', time: '12:30 PM', attendees: ['12 board members'] }],",
  "meetings: [formatMeeting('Q4 Board Meeting Lunch', 30, 12, 30, ['12 board members'])],"
);

// Thread 26: Angel Check Allocation (Due in 5 days)
code = code.replace(
  "deadlines: ['Fri, Nov 20, 12:00 PM EST'],",
  "deadlines: [formatDeadline(5, 9, 0)],"
);

// Thread 30: Board Resolution (Due in 16 days)
code = code.replace(
  "deadlines: ['Tue, Dec 1, 5:00 PM PST'],",
  "deadlines: [formatDeadline(16, 17, 0)],"
);

// Thread 31: Brex Verification (Due in 5 days)
code = code.replace(
  "deadlines: ['Fri, Nov 20, 5:00 PM EST'],",
  "deadlines: [formatDeadline(5, 14, 0)],"
);

// Thread 32: Offer Letter Chloe Bennett (Due in 2 days)
code = code.replace(
  "deadlines: ['Tue, Nov 17, 5:00 PM PST'],",
  "deadlines: [formatDeadline(2, 17, 0)],"
);

// Thread 34: Tax Loss Harvesting (Due in 30 days, meeting in 7 days)
code = code.replace(
  "deadlines: ['Tue, Dec 15, 5:00 PM EST'],",
  "deadlines: [formatDeadline(30, 14, 0)],"
);
code = code.replace(
  "meetings: [{ title: 'Q4 Tax Strategy Call', date: 'Next week', time: 'TBD', attendees: ['nicholas@sterlingwealth.com'] }],",
  "meetings: [formatMeeting('Q4 Tax Strategy Call', 7, 13, 0, ['nicholas@sterlingwealth.com'])],"
);

// Thread 36: Podcast invite
code = code.replace(
  "meetings: [{ title: 'The Executive Pod Recording', date: 'Next Thursday', time: '3:00 PM GMT', attendees: ['Harrison Cole'] }],",
  "meetings: [formatMeeting('The Executive Pod Recording', 4, 10, 0, ['Harrison Cole'])],"
);

// Thread 38: Settlement Proposal (Due in 10 days)
code = code.replace(
  "deadlines: ['Wed, Nov 25, 5:00 PM PST'],",
  "deadlines: [formatDeadline(10, 17, 0)],"
);

// Thread 39: Lucid Vehicle Pickup (Meeting in 10 days)
code = code.replace(
  "meetings: [{ title: 'Lucid Vehicle Pickup', date: 'Nov 25', time: '9:00 AM', attendees: ['Lucid Concierge'] }],",
  "meetings: [formatMeeting('Lucid Vehicle Pickup', 10, 9, 0, ['Lucid Concierge'])],"
);

// Thread 41: SF Symphony (Due in 16 days)
code = code.replace(
  "deadlines: ['Tue, Dec 1, 12:00 PM EST'],",
  "deadlines: [formatDeadline(16, 9, 0)],"
);

// Thread 42: Beacon Assurance (Due in 30 days)
code = code.replace(
  "deadlines: ['Tue, Dec 15, 5:00 PM EST'],",
  "deadlines: [formatDeadline(30, 14, 0)],"
);

// Thread 44: Leadership Retreat (Due in 13 days, meeting in 68 days)
code = code.replace(
  "deadlines: ['Sat, Nov 28, 6:00 PM PST'],",
  "deadlines: [formatDeadline(13, 18, 0)],"
);
code = code.replace(
  "meetings: [{ title: 'Leadership Retreat', date: 'Jan 22-25', time: 'All day', attendees: ['Executive team'] }],",
  "meetings: [formatMeeting('Leadership Retreat', 68, 9, 0, ['Executive team'])],"
);

fs.writeFileSync(seedPath, code, 'utf8');
console.log('Dynamic relative dates and timezone PST applied to seedData.js');
