/**
 * @fileoverview The planted per-vertical branch the `no-vertical-branch` drill
 * runs the gate against. The mutant exists only inside the Vite transform of
 * the run that asks for it: no file on disk is rewritten.
 *
 * Two plants are needed, and that is a property of the code rather than of the
 * mutant: `ChromeVariableContext` carries no identity, so a branch on a
 * vertical cannot fire until the caller is also made to hand one in.
 *
 * `DS_VERTICAL_BRANCH_MUTANT`: `none` (default) transforms nothing; `branch`
 * plants the context field, the branch and the caller argument. An anchor that
 * no longer matches exactly once throws, so a drifted source fails the drill
 * instead of silently running it un-planted.
 */
import { defineConfig, mergeConfig } from 'vitest/config';

import base from '../../../vitest.config';

const MODES = ['none', 'branch'];
const MUTANT = process.env.DS_VERTICAL_BRANCH_MUTANT ?? 'none';
if (!MODES.includes(MUTANT)) {
  throw new Error(`DS_VERTICAL_BRANCH_MUTANT must be one of ${MODES.join(' | ')}; got ${MUTANT}`);
}

const CHROME = '/infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts';
const CALLER = '/infrastructure/compilers/runtime/theme/runtime/lowering/foundation/chrome/index.ts';

const CONTEXT_FIELD_ANCHOR = '  modePrefix?: string;\n}';
const BRANCH_ANCHOR = '  return vars;\n}';
const CALLER_ANCHOR = '    radiusBaseline,\n    mode,';

const BRANCH =
  "  const vertical = context.vertical;\n  if (vertical === 'rottay') vars['--ds-sidebar-bg'] = '#0C0C0E';\n";

function announce(tag: string): void {
  process.stderr.write(`[no-vertical-branch-mutant] planted ${tag}\n`);
}

function swap(code: string, from: string, to: string, tag: string): string {
  if (code.split(from).length !== 2) throw new Error(`mutant anchor not unique: ${tag}`);
  announce(tag);
  return code.replace(from, to);
}

/** The branch goes ahead of the emitter's FINAL return, after every block has composed. */
function plantBranch(code: string): string {
  const at = code.lastIndexOf(BRANCH_ANCHOR);
  if (at < 0) throw new Error('mutant anchor missing: branch');
  announce('branch');
  return code.slice(0, at) + BRANCH + code.slice(at);
}

export default mergeConfig(
  base,
  defineConfig({
    plugins: [
      {
        name: 'no-vertical-branch-mutant',
        enforce: 'pre',
        transform(code, id) {
          if (MUTANT === 'none') return null;
          const file = id.split('?')[0];
          if (file.endsWith(CHROME)) {
            const withField = swap(
              code,
              CONTEXT_FIELD_ANCHOR,
              '  modePrefix?: string;\n  vertical?: string;\n}',
              'context-field'
            );
            return { code: plantBranch(withField), map: null };
          }
          if (file.endsWith(CALLER)) {
            return {
              code: swap(code, CALLER_ANCHOR, '    radiusBaseline,\n    vertical: bt.id,\n    mode,', 'caller'),
              map: null,
            };
          }
          return null;
        },
      },
    ],
  })
);
