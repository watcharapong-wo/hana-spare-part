const http = require('http');
const fs = require('fs');

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
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const data = Buffer.concat(chunks);
        resolve({ statusCode: res.statusCode, headers: res.headers, data });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  try {
    console.log('1️⃣ Login...');
    const loginRes = await makeRequest('POST', '/auth/login', null, {
      username: 'admin',
      password: 'ItSp@re-2026!Secure'
    });
    const loginData = JSON.parse(loginRes.data.toString());
    const token = loginData.token;
    console.log(`✓ Token obtained\n`);

    // Test 1: Export Stock Summary
    console.log('2️⃣ Testing GET /reports/export/stock-summary.xlsx...');
    const stockRes = await makeRequest('GET', '/reports/export/stock-summary.xlsx', token);
    console.log(`Status: ${stockRes.statusCode}`);
    console.log(`Content-Type: ${stockRes.headers['content-type']}`);
    console.log(`Content-Disposition: ${stockRes.headers['content-disposition']}`);
    console.log(`File Size: ${stockRes.data.length} bytes`);
    
    if (stockRes.statusCode === 200) {
      const filename = 'test-stock-summary.xlsx';
      fs.writeFileSync(filename, stockRes.data);
      console.log(`✓ Saved to ${filename}\n`);
    }

    // Test 2: Export Recent Transactions
    console.log('3️⃣ Testing GET /reports/export/recent-transactions.xlsx?limit=50...');
    const txRes = await makeRequest('GET', '/reports/export/recent-transactions.xlsx?limit=50', token);
    console.log(`Status: ${txRes.statusCode}`);
    console.log(`Content-Type: ${txRes.headers['content-type']}`);
    console.log(`Content-Disposition: ${txRes.headers['content-disposition']}`);
    console.log(`File Size: ${txRes.data.length} bytes`);
    
    if (txRes.statusCode === 200) {
      const filename = 'test-recent-transactions.xlsx';
      fs.writeFileSync(filename, txRes.data);
      console.log(`✓ Saved to ${filename}\n`);
    }

    console.log('✅ Excel export tests completed!');
    console.log('\n📝 Check the generated .xlsx files in the current directory');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
