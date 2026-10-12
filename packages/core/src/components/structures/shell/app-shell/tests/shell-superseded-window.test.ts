/**
 * The app-shell supersession window, in-repo half: producer, skin arms, public hooks.
 * The consumer read and the end trigger belong to the `supersession-window` gate.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { appShellChromeDeriver } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/chrome/app-shell';
import {
  SHELL_PUBLISHED_CHANNELS,
  SHELL_SUPERSEDED_HOOK_CHANNELS,
} from '../../../foundation/shell-contracts';

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    'src/foundation/tokens/css/presentation/components/skin/app-shell/index.css',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

const HOOKS = readFileSync(resolve(process.cwd(), 'scripts/libraries/hooks/index.mjs'), 'utf8');

const PAIRS = Object.entries(SHELL_SUPERSEDED_HOOK_CHANNELS);

/** The consumer read is cross-repo, so it lives in this gate and its CI step, not here. */
const RECEIVER = 'scripts/check/boundaries/applications/supersession-window/index.mjs';

/** `--ds-shell-x` must not match inside `--ds-shell-x-inline-end`. */
const channelBoundary = '(?![a-z0-9-])';

const countReads = (text: string, channel: string): number =>
  text.match(new RegExp(`var\\(\\s*${channel}${channelBoundary}`, 'g'))?.length ?? 0;

/** The superseded spelling read as a first arm, with the canonical one behind it. */
const countArmed = (text: string, superseded: string, canonical: string): number =>
  text.match(
    new RegExp(`var\\(\\s*${superseded},\\s*var\\(\\s*${canonical}${channelBoundary}`, 'g'),
  )?.length ?? 0;

describe('the app-shell supersession window', () => {
  it('produces only the canonical spelling', () => {
    const produced = new Set<string>(appShellChromeDeriver.produces);
    for (const [superseded, canonical] of PAIRS) {
      // The superseded name must stay unproduced: a root emission would win
      // over the consumer's own scoped write and close the window early.
      expect({ superseded, produced: produced.has(superseded) }).toEqual({
        superseded,
        produced: false,
      });
      expect({ canonical, produced: produced.has(canonical) }).toEqual({
        canonical,
        produced: true,
      });
    }
  });

  it('reads the superseded arm first, everywhere the skin reads the pair', () => {
    for (const [superseded, canonical] of PAIRS) {
      const supersededReads = countReads(SKIN, superseded);
      const armed = countArmed(SKIN, superseded, canonical);
      expect({ superseded, supersededReads, armed }).toEqual({
        superseded,
        supersededReads: armed,
        armed,
      });
      expect(armed).toBeGreaterThan(0);
    }
  });

  it('keeps the window disjoint from the published band', () => {
    const published = new Set<string>(SHELL_PUBLISHED_CHANNELS);
    for (const [superseded] of PAIRS) {
      // A published name is not superseded — it keeps its spelling by contract.
      expect({ superseded, published: published.has(superseded) }).toEqual({
        superseded,
        published: false,
      });
    }
  });

  it('publishes both spellings of every window pair as a public hook', () => {
    for (const [superseded, canonical] of PAIRS) {
      expect(HOOKS, superseded).toContain(`'${superseded}'`);
      expect(HOOKS, canonical).toContain(`'${canonical}'`);
    }
  });

  it('hands the consumer read and its end trigger to the named cross-repo receiver', () => {
    // END TRIGGER: the receiver goes GREEN-to-RED on good news, when the last
    // named consumer migrates at the pinned revision. Then delete this suite too.
    expect(existsSync(resolve(process.cwd(), RECEIVER))).toBe(true);
    const workflow = readFileSync(resolve(process.cwd(), '../../.github/workflows/ci.yml'), 'utf8');
    expect(workflow).toContain(`run: node packages/core/${RECEIVER} --check`);
  });

  it('fails when a window read loses its canonical arm', () => {
    const [superseded, canonical] = PAIRS[0]!;
    const planted = SKIN.replace(
      new RegExp(`(var\\(\\s*${superseded},\\s*)var\\(\\s*${canonical}${channelBoundary}`, 'g'),
      '$1var(--ds-planted-dropped-arm',
    );
    expect(countReads(planted, superseded)).toBeGreaterThan(
      countArmed(planted, superseded, canonical),
    );
  });
});
