'use strict';

const http = require('node:http');
const os = require('node:os');
const { performance } = require('node:perf_hooks');

const port = Number(process.env.PORT || 3000);
const mode = ['fail', 'after-traffic'].includes(process.env.DELIVERY_PROOF_HEALTH)
  ? process.env.DELIVERY_PROOF_HEALTH : 'ok';
const revision = String(process.env.DELIVERY_PROOF_REVISION || 'baseline').slice(0, 96);
const instance = os.hostname().slice(0, 64);
const failAfterMs = 2000;
let trafficArmedAtMs = null;

const server = http.createServer((request, response) => {
  const path = String(request.url || '/').split('?', 1)[0];
  const now = performance.now();
  const justArmed = mode === 'after-traffic' && trafficArmedAtMs === null
    && request.method === 'GET' && path === '/';
  if (justArmed) trafficArmedAtMs = now;
  const failed = mode === 'fail' || (mode === 'after-traffic'
    && trafficArmedAtMs !== null && now - trafficArmedAtMs >= failAfterMs);
  const body = JSON.stringify({
    app: 'delivery-proof-20261021',
    revision,
    instance,
    health: failed ? 'fail' : 'ok',
    healthMode: mode,
    trafficArmed: trafficArmedAtMs !== null,
    trafficJustArmed: justArmed,
    trafficArmCount: trafficArmedAtMs === null ? 0 : 1,
    trafficArmedAtMs: trafficArmedAtMs === null ? null : Math.floor(trafficArmedAtMs),
    failAfterMs: mode === 'after-traffic' ? failAfterMs : null,
  }) + '\n';
  response.writeHead(path === '/health' && failed ? 503 : 200, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    Connection: 'close',
  });
  response.end(body);
});

server.listen(port, '0.0.0.0');
