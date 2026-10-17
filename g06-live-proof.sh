#!/bin/sh
set -eu
test "${G06_LOG_PROOF_VALUE:-}" = 'g06-public-synthetic-20261017-mask-proof'
prefix=${G06_LOG_PROOF_VALUE%-mask-proof}
printf 'g06:stdout:open\n'
printf 'g06:stderr:open\n' >&2
sleep 3
printf 'g06:stdout:split=%s' "$prefix"
sleep 3
printf '%s\n' '-mask-proof'
printf 'g06:stderr:split=%s' "$prefix" >&2
sleep 3
printf '%s\n' '-mask-proof' >&2
for tick in 1 2 3 4; do
  printf 'g06:stdout:tick=%s\n' "$tick"
  printf 'g06:stderr:tick=%s\n' "$tick" >&2
  sleep 3
done
printf 'g06:stdout:done\n'
printf 'g06:stderr:done\n' >&2
