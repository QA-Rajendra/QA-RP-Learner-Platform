async function testDelete() {
  const targetId = '6a9918243578c5d9fe7aa56e';
  console.log(`Sending DELETE to https://qa-rp-learner-platform.vercel.app/api/test-cases/${targetId}...`);

  const res = await fetch(`https://qa-rp-learner-platform.vercel.app/api/test-cases/${targetId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  console.log('Status Code:', res.status);
  const text = await res.text();
  console.log('Response Body:', text);
}

testDelete().catch(err => console.error('Error:', err));
