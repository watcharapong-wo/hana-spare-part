const http = require('http');

function makeRequest(method, path, token = null, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data: data ? JSON.parse(data) : null });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  try {
    // 1) Login
    console.log('1️⃣ Login...');
    const loginRes = await makeRequest('POST', '/auth/login', null, {
      username: 'admin',
      password: 'ItSp@re-2026!Secure'
    });
    const token = loginRes.data.token;
    console.log(`✓ Token obtained\n`);

    // 2) DELETE /spareparts/2 (HAS TRANSACTION - should fail with 409)
    console.log('2️⃣ DELETE /spareparts/2 (has 1 transaction - should FAIL with 409)...');
    const del2Res = await makeRequest('DELETE', '/spareparts/2', token);
    console.log(`Status: ${del2Res.statusCode}`);
    if (del2Res.statusCode === 409) {
      console.log('✓ CORRECT: Got 409 Conflict');
      console.log(`Message: ${del2Res.data.message}`);
      console.log(`Transactions count: ${del2Res.data.transactions_count}`);
    } else {
      console.log(`❌ ERROR: Expected 409, got ${del2Res.statusCode}`);
    }

    // 3) DELETE /spareparts/3 (NO TRANSACTIONS - should succeed with 200)
    console.log('\n3️⃣ DELETE /spareparts/3 (no transactions - should SUCCEED with 200)...');
    const del3Res = await makeRequest('DELETE', '/spareparts/3', token);
    console.log(`Status: ${del3Res.statusCode}`);
    if (del3Res.statusCode === 200) {
      console.log('✓ CORRECT: Delete succeeded');
      console.log(`Deleted: ${del3Res.data.data.name}`);
    } else {
      console.log(`❌ ERROR: Expected 200, got ${del3Res.statusCode}`);
      console.log('Response:', del3Res.data);
    }

    console.log('\n✅ All tests completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
