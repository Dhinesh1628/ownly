import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedFilePath = path.join(__dirname, 'seedData.js');

let content = fs.readFileSync(seedFilePath, 'utf8');

// 1. Replace Public Figures
const replacements = [
  { search: /Marc Andreessen/g, replace: 'Marcus Vance' },
  { search: /marc@a16z-fund\.com/g, replace: 'marcus@vancecap.com' },
  { search: /a16z-fund\.com/g, replace: 'vancecap.com' },
  { search: /\ba16z\b/g, replace: 'Vance Capital' },
  { search: /David Sacks/g, replace: 'Julian Thorne' },
  { search: /david@craftventures\.com/g, replace: 'julian@craftpointvc.com' },
  { search: /craftventures\.com/g, replace: 'craftpointvc.com' },
  { search: /Craft Ventures/g, replace: 'Craftpoint Capital' },
  { search: /Emily Chang/g, replace: 'Evelyn Ward' },
  { search: /echang@bloomberg\.net/g, replace: 'eward@fintechnetwork.io' },
  { search: /bloomberg\.net/g, replace: 'fintechnetwork.io' },
  { search: /Bloomberg Technology: Interview on Enterprise AI Agent rollouts/g, replace: 'FinTech Global Daily: Interview on Enterprise AI Agent rollouts' },
  { search: /Bloomberg Technology/g, replace: 'FinTech Global Daily' },
  { search: /Bloomberg TV Live Segment/g, replace: 'FinTech Global Live Segment' },
  { search: /Bloomberg TV/g, replace: 'FinTech Global Network' },
  { search: /Ben Thompson/g, replace: 'Brett Taylor' },
  { search: /ben@stratechery\.com/g, replace: 'brett@techcurated.com' },
  { search: /stratechery\.com/g, replace: 'techcurated.com' },
  { search: /Stratechery: The Architecture of Autonomous Operations/g, replace: 'Tech Curated: The Architecture of Autonomous Operations' },
  { search: /Stratechery/g, replace: 'Tech Curated' },
  { search: /Brian O'Malley/g, replace: 'Bradley Vance' },
  { search: /bomalley@forerunnervc\.com/g, replace: 'bvance@apexventurepartners.com' },
  { search: /Peter Thiel's fund/g, replace: 'Apex Horizon Fund' },
  { search: /Guillermo Rauch/g, replace: 'Graham Vance' },
  { search: /guillermo@vercel\.com/g, replace: 'graham@vortexcloud.io' },
  { search: /Roelof Botha/g, replace: 'Raymond Sterling' },
  { search: /roelof@sequoiacap\.com/g, replace: 'raymond@highlineventures.com' },
  { search: /sequoiacap\.com/g, replace: 'highlineventures.com' },
  { search: /Sequoia board rep Roelof/g, replace: 'Highline Ventures board rep Raymond' },
  { search: /\bSequoia\b/g, replace: 'Highline Ventures' },
  { search: /Producer, 20VC/g, replace: 'Producer, Executive Pod' },
  { search: /production@thetwentyminutevc\.com/g, replace: 'production@executivepod.media' },
  { search: /thetwentyminutevc\.com/g, replace: 'executivepod.media' },
  { search: /Jessica Lessin/g, replace: 'Vivian Rhodes' },
  { search: /editorial@theinformation\.com/g, replace: 'editorial@techinsightjournal.com' },
  { search: /theinformation\.com/g, replace: 'techinsightjournal.com' },
  { search: /The Information/g, replace: 'Tech Insight Journal' },

  // 2. Concrete Deadlines
  { search: /'by Friday November 20th'/g, replace: "'Fri, Nov 20, 5:00 PM PST'" },
  { search: /'RSVP by tomorrow 5 PM'/g, replace: "'Mon, Nov 16, 5:00 PM EST'" },
  { search: /'Sign before month-end'/g, replace: "'Mon, Nov 30, 5:00 PM PST'" },
  { search: /'Confirmation requested by Monday'/g, replace: "'Mon, Nov 16, 12:00 PM PST'" },
  { search: /'Submit photo by Nov 25'/g, replace: "'Wed, Nov 25, 5:00 PM EST'" },
  { search: /'Nov 30 expiration'/g, replace: "'Mon, Nov 30, 11:59 PM PST'" },
  { search: /'RSVP by Friday Nov 20'/g, replace: "'Fri, Nov 20, 5:00 PM PST'" },
  { search: /'Sign before board meeting'/g, replace: "'Wed, Nov 18, 9:00 AM PST'" },
  { search: /'Wire lock by Tuesday 2 PM'/g, replace: "'Tue, Nov 17, 2:00 PM EST'" },
  { search: /'Commitment by Dec 1'/g, replace: "'Tue, Dec 1, 5:00 PM PST'" },
  { search: /'Decision required by Wednesday'/g, replace: "'Wed, Nov 18, 5:00 PM PST'" },
  { search: /'Final headcount by Dec 10'/g, replace: "'Thu, Dec 10, 6:00 PM PST'" },
  { search: /'Wire cutoff Nov 20'/g, replace: "'Fri, Nov 20, 12:00 PM EST'" },
  { search: /'Acceptance before December 1'/g, replace: "'Tue, Dec 1, 5:00 PM PST'" },
  { search: /'5 business days'/g, replace: "'Fri, Nov 20, 5:00 PM EST'" },
  { search: /'Nov 17 decision deadline'/g, replace: "'Tue, Nov 17, 5:00 PM PST'" },
  { search: /'Dec 15 deadline'/g, replace: "'Tue, Dec 15, 5:00 PM EST'" },
  { search: /'Nov 25 hard deadline'/g, replace: "'Wed, Nov 25, 5:00 PM PST'" },
  { search: /'Host committee announcement Dec 1'/g, replace: "'Tue, Dec 1, 12:00 PM EST'" },
  { search: /'Dec 15 audit deadline'/g, replace: "'Tue, Dec 15, 5:00 PM EST'" },
  { search: /'Hold expires Nov 28'/g, replace: "'Sat, Nov 28, 6:00 PM PST'" },
];

for (const { search, replace } of replacements) {
  content = content.replace(search, replace);
}

// Ensure Thread 2 summary is clean and accurate:
content = content.replace(
  /summary:\s*'Elena requested moving Thursday 2 PM strategy call due to a client conflict\. Provided slots for Friday morning\.'/,
  `summary: 'Elena Rostova requested moving the strategy sync from Thursday due to an APAC team conflict. Current status is awaiting calendar coordination; next step is for the assistant to send updated time slots between 10 AM and 1 PM PST on Friday.'`
);

fs.writeFileSync(seedFilePath, content, 'utf8');
console.log('Successfully audited seedData.js');
