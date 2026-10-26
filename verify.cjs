'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

async function main() {
  assert.equal(process.platform, 'linux');
  assert.equal(process.getuid(), 10000);
  assert.equal(process.getgid(), 10000);
  const source = spawnSync('git', ['rev-parse', '--verify', 'HEAD'], {
    encoding: 'utf8', timeout: 5000, maxBuffer: 1024,
  });
  assert.equal(source.status, 0);
  const commit = source.stdout.trim();
  assert.match(commit, /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/);
  const proof = {
    case: 'g10-byo-runner-acceptance-20261024',
    commit,
    hostname: os.hostname(),
    uid: process.getuid(),
    gid: process.getgid(),
    configSha256: crypto.createHash('sha256').update(fs.readFileSync('.capricorn-ci.json')).digest('hex'),
    fixtureSha256: crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex'),
  };
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'g10-byo-fixture-'));
  const filename = path.join(directory, 'round-trip.txt');
  try {
    fs.writeFileSync(filename, 'G10 isolated runner filesystem round-trip\n', { flag: 'wx', mode: 0o600 });
    assert.equal(fs.readFileSync(filename, 'utf8'), 'G10 isolated runner filesystem round-trip\n');
    assert.equal(fs.statSync(filename).uid, 10000);
    process.stdout.write(`G10_BYO_SOURCE_COMMIT=${commit}\n`);
    process.stdout.write(`G10_BYO_BEGIN ${JSON.stringify(proof)}\n`);
    // Give the parent one bounded observation window for the server's busy state.
    await new Promise(resolve => setTimeout(resolve, 12000));
  } finally {
    if (fs.existsSync(filename)) fs.unlinkSync(filename);
    fs.rmdirSync(directory);
  }
  assert.equal(fs.existsSync(directory), false);
  process.stdout.write('G10_BYO_FIXTURE_CLEANUP=ABSENT\n');
  process.stdout.write(`G10_BYO_PASS ${JSON.stringify(proof)}\n`);
}

main().catch(() => {
  process.stderr.write('G10_BYO_FAIL: runner identity, source or filesystem assertion failed.\n');
  process.exitCode = 1;
});
