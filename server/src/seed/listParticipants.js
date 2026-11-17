import { rawSeedEmails } from './seedData.js';

rawSeedEmails.forEach((e, idx) => {
  const p = e.participants?.[0] || {};
  console.log(`#${idx + 1}: ${p.name} <${p.email}> | Sub: ${e.subject.slice(0, 50)}`);
});
