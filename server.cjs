'use strict';

const http = require('node:http');

const server = http.createServer((request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; form-action 'none'; base-uri 'none'");
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('Content-Type', request.url === '/health' ? 'text/plain' : 'text/html; charset=utf-8');
  response.end(request.url === '/health' ? 'ok\n'
    : '<!doctype html><html lang="en"><head><title>G25 fixture</title></head><body>Capricorncorp synthetic G25 acceptance</body></html>');
});

server.listen(3000, '0.0.0.0');
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => server.close(() => process.exit(0)));
}
