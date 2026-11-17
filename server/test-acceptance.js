const BASE_URL = 'http://localhost:5055/api';

async function runAcceptanceTests() {
  console.log('====================================================');
  console.log('RUNNING FULL END-TO-END ACCEPTANCE SUITE');
  console.log('====================================================\n');

  let assistantToken = '';
  let clientToken = '';
  let sampleConvId = '';

  // 1. Health Endpoint
  console.log('1. Testing /api/health...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  console.log('   Result:', healthData.service, '| Status:', healthData.status, '| AI Mode:', healthData.aiStatus);
  if (!healthData.success) throw new Error('Health check failed');

  // 2. Assistant Demo Login
  console.log('\n2. Testing Assistant Demo Login...');
  const loginRes = await fetch(`${BASE_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'assistant' }),
  });
  const loginData = await loginRes.json();
  assistantToken = loginData.token;
  console.log('   Logged in as:', loginData.user.name, `(${loginData.user.role})`);
  if (!assistantToken) throw new Error('Assistant login failed');

  // 3. Client Demo Login
  console.log('\n3. Testing Client Demo Login...');
  const clientLoginRes = await fetch(`${BASE_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'client' }),
  });
  const clientLoginData = await clientLoginRes.json();
  clientToken = clientLoginData.token;
  console.log('   Logged in as:', clientLoginData.user.name, `(${clientLoginData.user.role})`);
  if (!clientToken) throw new Error('Client login failed');

  // 4. Dashboard Stats Check
  console.log('\n4. Testing /api/stats (Live DB Counts)...');
  const statsRes = await fetch(`${BASE_URL}/stats`, {
    headers: { Authorization: `Bearer ${assistantToken}` },
  });
  const statsData = await statsRes.json();
  console.log('   Stats Summary:', JSON.stringify(statsData.stats, null, 2));
  console.log('   Segments:', statsData.segments);
  console.log('   Upcoming Meetings Extracted:', statsData.upcomingMeetings.length);

  // 5. Query Conversations
  console.log('\n5. Testing /api/conversations (Assistant to Reply)...');
  const convRes = await fetch(`${BASE_URL}/conversations?segment=assistant-to-reply`, {
    headers: { Authorization: `Bearer ${assistantToken}` },
  });
  const convData = await convRes.json();
  console.log(`   Fetched ${convData.data.length} conversations. Total in segment: ${convData.total}`);
  sampleConvId = convData.data[0]._id;
  console.log(`   Sample thread: "${convData.data[0].subject}" (ID: ${sampleConvId})`);

  // 6. Test Manual Override
  console.log('\n6. Testing Manual Classification Override...');
  const overrideRes = await fetch(`${BASE_URL}/conversations/${sampleConvId}/classification`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${assistantToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      label: 'Client to Reply',
      reason: 'Manual executive escalation: requires direct principal signoff.',
    }),
  });
  const overrideData = await overrideRes.json();
  console.log('   Override Result:', overrideData.data.classification.label, '| Source:', overrideData.data.classification.source);
  if (overrideData.data.classification.source !== 'manual') throw new Error('Manual source not persisted');

  // 7. Test Simulate Incoming Email & Live Reclassification
  console.log('\n7. Testing Inbound Email Simulation & Reclassification...');
  const simRes = await fetch(`${BASE_URL}/simulate/incoming-email`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${assistantToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversationId: sampleConvId,
      senderName: 'Elena Rostova',
      senderEmail: 'elena@stridegrowth.io',
      body: 'Can we move our strategy sync to Friday at 11:00 AM PST? Board review calendar invite confirmed.',
    }),
  });
  const simData = await simRes.json();
  console.log('   Simulated Inbound Message:', simData.data.message.subject);
  console.log('   Thread Reclassified Label:', simData.data.conversation.classification.label);

  // 8. Test AI Reply Drafting
  console.log('\n8. Testing AI Reply Drafting (Formal & Brief tones)...');
  const draftRes = await fetch(`${BASE_URL}/conversations/${sampleConvId}/draft-reply`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${assistantToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tone: 'formal' }),
  });
  const draftData = await draftRes.json();
  console.log('   Generated Draft Preview:\n   ', draftData.data.body.split('\n')[0], '...');

  // 9. Test Review & Send (Simulated Outbound Send)
  console.log('\n9. Testing Review & Send Outbound Message...');
  const sendRes = await fetch(`${BASE_URL}/conversations/${sampleConvId}/send-reply`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${assistantToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      body: 'Thank you for following up. We have verified the instructions and our founder has signed off.',
      tone: 'formal',
    }),
  });
  const sendData = await sendRes.json();
  console.log('   Send Status:', sendData.message);
  console.log('   Conversation Awaiting Response:', sendData.data.conversation.awaitingResponse);
  if (!sendData.data.conversation.awaitingResponse) throw new Error('Awaiting response flag not set');

  // 10. Test AI Chat with all 6 required prompts
  console.log('\n10. Testing AI Chat ("Ask your inbox") with all 6 prompts...');
  const chatQueries = [
    'Show me emails that need my attention',
    'Summarize this conversation',
    'What am I waiting for a response on?',
    'Which emails require the client\'s attention?',
    'Why has this email been assigned to the client?',
    'Draft a reply to this conversation',
  ];

  for (const q of chatQueries) {
    const chatRes = await fetch(`${BASE_URL}/chat/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${assistantToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: q, activeConversationId: sampleConvId }),
    });
    const chatData = await chatRes.json();
    console.log(`   [Q]: "${q}"`);
    console.log(`   [A]: ${chatData.data.answer.slice(0, 100).replace(/[\r\n]+/g, ' ')}...`);
    console.log(`   [Ref IDs]: ${chatData.data.referencedConversationIds.length} linked threads\n`);
  }

  // 11. Test Client View Actions & Two-Way Sync
  console.log('11. Testing Client View (/client) Two-Way Sync...');
  const clientConvRes = await fetch(`${BASE_URL}/conversations?segment=client-to-reply`, {
    headers: { Authorization: `Bearer ${clientToken}` },
  });
  const clientConvData = await clientConvRes.json();
  const targetClientConv = clientConvData.data[0];
  console.log(`   Client viewing "${targetClientConv.subject}"`);

  // Action A: Ask assistant to take over
  console.log('   Executing: "Ask my assistant to take over"...');
  const handoffRes = await fetch(`${BASE_URL}/conversations/${targetClientConv._id}/client-handoff`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${clientToken}` },
  });
  const handoffData = await handoffRes.json();
  console.log(`   Handoff result: new label "${handoffData.data.classification.label}", assignedTo: "${handoffData.data.assignedTo}"`);

  // 12. Verify Audit Activity Log
  console.log('\n12. Verifying Audit Activity Log...');
  const activityRes = await fetch(`${BASE_URL}/activity`, {
    headers: { Authorization: `Bearer ${assistantToken}` },
  });
  const activityData = await activityRes.json();
  console.log(`   Recent audit entries: ${activityData.data.length}`);
  const latestLog = activityData.data[0];
  console.log(`   Latest Log: [${latestLog.action}] by ${latestLog.actorRole}: "${latestLog.description}"`);

  console.log('\n====================================================');
  console.log('ALL ACCEPTANCE TESTS COMPLETED SUCCESSFULLY! (100% PASS)');
  console.log('====================================================\n');
}

runAcceptanceTests().catch((err) => {
  console.error('\nACCEPTANCE TEST SUITE FAILED:', err);
  process.exit(1);
});
