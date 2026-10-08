import { existsSync, readFileSync } from 'node:fs';
import { baselinePath } from '../paths/index.mjs';

/**
 * Path keys for the HARD-2 censuses are SPARSE: a file/class pair is emitted
 * when it counts above zero or when the baseline already pins it. A new
 * non-zero pair is therefore an unbaselined key (red), a drained pair stays
 * emitted at 0 until the baseline is tightened, and a deleted file disappears
 * (red) -- the fleet guarantees without thousands of permanent zero rows.
 */
const baselineKeys = existsSync(baselinePath)
  ? new Set(Object.keys(JSON.parse(readFileSync(baselinePath, 'utf8'))))
  : new Set();

function sparse(out, key, count) {
  if (count > 0 || baselineKeys.has(key)) out[key] = count;
}

export {
  baselineKeys,
  sparse,
};
