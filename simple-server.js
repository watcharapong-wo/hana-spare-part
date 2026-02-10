const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'OK' }));
});

server.listen(3000, () => {
  console.log('Simple server running on 3000');
});

console.log('Server creation complete');
