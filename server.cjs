'use strict';

const http = require('node:http');

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'content-type': 'text/plain', 'cache-control': 'no-store' });
  response.end(request.url === '/health' ? 'ok\n' : JSON.stringify({
    application: 'Capricorncorp synthetic DevOps acceptance',
    revision: 'v2',
    acceptanceVersion: process.env.ACCEPTANCE_VERSION || null,
    proof: process.env.WHOLE_SUITE_PROOF || null,
  }) + '\n');
});

server.listen(3000, '0.0.0.0');
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => server.close(() => process.exit(0)));
}
