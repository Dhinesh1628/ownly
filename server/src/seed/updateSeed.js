const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'seedData.js');
let code = fs.readFileSync(seedPath, 'utf8');

// 1. Thread 4 (FinTech Global / Evelyn Ward): fix Bloomberg in summary
code = code.replace(
  "summary: 'Evelyn Ward from Bloomberg requested a live 10-minute broadcast interview next Tuesday regarding enterprise AI assistant adoption.',",
  "summary: 'Evelyn Ward from FinTech Global Daily requested a live 10-minute broadcast interview next Tuesday regarding enterprise AI assistant adoption.',"
);

// 2. Thread 11 (Karthik Raman: Bessemer -> Summit Peak)
code = code.replace(/karthik@bessemer\.com/g, 'karthik@summitpeakvc.com');
code = code.replace(/Bessemer observer sent thoughts/g, 'Summit Peak Ventures observer sent thoughts');

// 3. Thread 14 (Salesforce / Brian O'Malley -> OmniCloud / Apex)
code = code.replace(
  "subject: 'Strictly Confidential: Inbound Acquisition Interest from Salesforce',",
  "subject: 'Strictly Confidential: Inbound Acquisition Interest from OmniCloud',"
);
code = code.replace(/bvance@apexventurepartners\.com/g, 'bomalley@apexventurepartners.com');
code = code.replace(
  "summary: 'Brian from Forerunner received an inquiry from Salesforce Corporate Development regarding strategic product integration or acquisition.',",
  "summary: 'Brian O’Malley from Apex Venture Partners received an inquiry from OmniCloud Corporate Development regarding strategic product integration or acquisition.'"
);
code = code.replace(
  "body: 'Reached out by EVP of Corporate Strategy at Salesforce yesterday. They are deeply impressed by your multi-agent architecture and want to explore strategic options. Need your personal read before I connect the parties.',",
  "body: 'Reached out by EVP of Corporate Strategy at OmniCloud yesterday. They are deeply impressed by your multi-agent architecture and want to explore strategic options. Need your personal read before I connect the parties.',"
);

// 4. Thread 16 (TechCrunch Disrupt -> VentureStage Summit)
code = code.replace(
  /Invitation: Closing Keynote at TechCrunch Disrupt London/g,
  'Invitation: Closing Keynote at VentureStage Annual Summit London'
);
code = code.replace(/Jessica Mathews/g, 'Jessica Hall');
code = code.replace(/jmathews@techcrunch\.com/g, 'jhall@venturestage.media');
code = code.replace(
  "summary: 'TechCrunch Disrupt inviting client to deliver closing keynote on Dec 11 in London. $15k travel honorarium provided.',",
  "summary: 'VentureStage Annual Summit inviting client to deliver closing keynote on Dec 11 in London. $15k travel honorarium provided.'"
);
code = code.replace(/title: 'TechCrunch Disrupt Keynote'/g, "title: 'VentureStage Summit Keynote'");
code = code.replace(
  "body: 'We would be honored to host you for our closing keynote on the Main Stage in London this December. We offer a $15,000 travel honorarium and business class accommodations. Please let me know your interest.',",
  "body: 'We would be honored to host you for our closing keynote on the Main Stage in London this December at VentureStage Summit. We offer a $15,000 travel honorarium and business class accommodations. Please let me know your interest.'"
);

// 5. Thread 19 (MIT -> Cambridge Institute of Technology)
code = code.replace(/mstone@mit\.edu/g, 'mstone@cambridge-institute.edu');
code = code.replace(/Dr\. Stone \(MIT AI Lab\)/g, 'Dr. Stone (Cambridge Institute of Technology)');

// 6. Thread 20 (Edelman -> Apex Communications)
code = code.replace(/acole@edelman\.com/g, 'acole@apexprgroup.com');
code = code.replace(
  "summary: 'Sent Edelman updated quotes from lead investor. Waiting for wire distribution schedule.',",
  "summary: 'Sent Apex Communications updated quotes from lead investor. Waiting for wire distribution schedule.'"
);

// 7. Thread 23 (JLL -> Meridian Commercial Realty)
code = code.replace(/Jonathan Vance, Commercial Broker/g, 'Jonathan Price, Commercial Broker');
code = code.replace(/jvance@jll\.com/g, 'jprice@meridianrealty.com');

// 8. Thread 28 (Peter Thiel's fund -> Apex Horizon Fund)
code = code.replace(/Peter Thiel’s fund/g, 'Apex Horizon Fund');

// 9. Thread 32 (DeepMind -> NeuralCore Labs)
code = code.replace(/cbennett@deepmind\.com/g, 'cbennett@neuralcore.ai');

// 10. Thread 34 (Goldman Sachs -> Sterling Private Wealth)
code = code.replace(
  /Goldman Sachs Private Wealth: Tax Loss Harvesting Strategy for Q4/g,
  'Sterling Private Wealth: Tax Loss Harvesting Strategy for Q4'
);
code = code.replace(/Nicholas Vance, VP Private Wealth/g, 'Nicholas Sterling, VP Private Wealth');
code = code.replace(/nicholas\.vance@gs\.com/g, 'nicholas@sterlingwealth.com');
code = code.replace(
  "summary: 'Goldman Sachs wealth advisor prepared Q4 personal tax harvesting proposal requiring direct investor signoff.',",
  "summary: 'Sterling Private Wealth advisor prepared Q4 personal tax harvesting proposal requiring direct investor signoff.'"
);

// 11. Thread 36 (20VC / Harry Stebbings -> The Executive Pod / Harrison Cole)
code = code.replace(
  /Podcast invite: 20VC with Harry Stebbings - prep call timing/g,
  'Podcast invite: The Executive Pod with Harrison Cole - prep call timing'
);
code = code.replace(
  "summary: 'Harry Stebbings 20VC production team proposing recording next Thursday in London or via SquadCast.',",
  "summary: 'Harrison Cole production team proposing recording next Thursday in London or via SquadCast.'"
);
code = code.replace(
  "meetings: [{ title: '20VC Podcast Recording', date: 'Next Thursday', time: '3:00 PM GMT', attendees: ['Harry Stebbings'] }],",
  "meetings: [{ title: 'The Executive Pod Recording', date: 'Next Thursday', time: '3:00 PM GMT', attendees: ['Harrison Cole'] }],"
);
code = code.replace(
  "body: 'Harry would love to record a 35-minute episode on agentic workflow orchestration next week. Can your assistant confirm availability for Thursday at 3 PM GMT, and also let us know if any metrics are strictly off the record?',",
  "body: 'Harrison would love to record a 35-minute episode on agentic workflow orchestration next week. Can your assistant confirm availability for Thursday at 3 PM GMT, and also let us know if any metrics are strictly off the record?'"
);

// 12. Thread 38 (Fenwick -> Crestview Legal)
code = code.replace(/apendelton@fenwick\.com/g, 'apendelton@crestviewlaw.com');
code = code.replace(
  "summary: 'Fenwick IP counsel received a formal cross-licensing agreement resolving patent dispute without litigation.',",
  "summary: 'Crestview Legal IP counsel received a formal cross-licensing agreement resolving patent dispute without litigation.'"
);

// 13. Thread 42 (Hartford Insurance -> Beacon Assurance)
code = code.replace(
  /Hartford Insurance: Annual Workers Comp & General Liability Audit/g,
  'Beacon Assurance: Annual Workers Comp & General Liability Audit'
);
code = code.replace(/Hartford Audit Division/g, 'Beacon Assurance Audit Division');
code = code.replace(/audit@thehartford\.com/g, 'audit@beaconassurance.com');
code = code.replace(
  "summary: 'The Hartford requesting W-2 wage summary verification for 2026 workers comp policy reconciliation.',",
  "summary: 'Beacon Assurance requesting W-2 wage summary verification for 2026 workers comp policy reconciliation.'"
);

fs.writeFileSync(seedPath, code, 'utf8');
console.log('Fictional replacements applied to seedData.js successfully');
