import assert from 'node:assert/strict';

async function verify() {
  console.log('Testing Vite Dev Server response at http://localhost:3000/...');
  const res = await fetch('http://localhost:3000/');
  assert.strictEqual(res.status, 200, 'Server must return status 200');
  const html = await res.text();
  assert.ok(html.includes('Jurislink'), 'HTML must contain title Jurislink');
  assert.ok(html.includes('/src/main.tsx'), 'HTML must contain script entry /src/main.tsx');
  console.log('✅ Server HTTP 200 OK verified. HTML length:', html.length);

  // Verify main.tsx bundle serving
  const jsRes = await fetch('http://localhost:3000/src/main.tsx');
  assert.strictEqual(jsRes.status, 200, 'Vite must serve main.tsx');
  const jsCode = await jsRes.text();
  assert.ok(jsCode.includes('App'), 'Script must include App');
  console.log('✅ Vite TypeScript module bundling verified.');
}

verify().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
