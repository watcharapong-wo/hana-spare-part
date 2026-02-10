const http = require('http');

// Helper function to make HTTP request
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
    console.log(`Status: ${loginRes.statusCode}`);
    const token = loginRes.data.token;
    console.log(`Token: ${token.substring(0, 30)}...`);

    // 2) Get spareparts
    console.log('\n2️⃣ Get spareparts...');
    const spareRes = await makeRequest('GET', '/spareparts', token);
    console.log(`Status: ${spareRes.statusCode}`);
    const spareparts = spareRes.data.data;
    console.log(`Total: ${spareparts.length}`);
    spareparts.slice(0, 3).forEach(p => {
      console.log(`  ID=${p.id}, Name=${p.name}`);
    });

    // 3) Try to delete sparepart ID=1 (should have transactions)
    console.log('\n3️⃣ DELETE /spareparts/1 (should be BLOCKED with 409)...');
    const del1Res = await makeRequest('DELETE', '/spareparts/1', token);
    console.log(`Status: ${del1Res.statusCode}`);
    console.log(`Response:`, JSON.stringify(del1Res.data, null, 2));

    // 4) Try to delete ID=999
    console.log('\n4️⃣ DELETE /spareparts/999 (should return 404)...');
    const del999Res = await makeRequest('DELETE', '/spareparts/999', token);
    console.log(`Status: ${del999Res.statusCode}`);
    console.log(`Response:`, JSON.stringify(del999Res.data, null, 2));

    console.log('\n✅ Tests completed');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
