/**
 * The app-shell supersession window, and the end trigger that closes it.
 * The window is a read arm on fourteen public hook names, never a second emission.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { appShellChromeDeriver } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/chrome/app-shell';
import {
  SHELL_PUBLISHED_CHANNELS,
  SHELL_SUPERSEDED_HOOK_CHANNELS,
} from '../../contracts';

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    'src/foundation/tokens/css/presentation/components/skin/app-shell/index.css',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

const HOOKS = readFileSync(resolve(process.cwd(), 'scripts/libraries/hooks/index.mjs'), 'utf8');

const PAIRS = Object.entries(SHELL_SUPERSEDED_HOOK_CHANNELS);

interface RosterEntry {
  readonly id: string;
  readonly repo: string;
  readonly path: string;
}

/** Each rostered consumer names its sibling repository root and the file that proves it. */
const NAMED_CONSUMERS: readonly RosterEntry[] = [
  {
    id: 'app-bithire/vertical shell app-layout',
    repo: '../../../app-bithire',
    path: '../../../app-bithire/src/vertical/surface/shell/app-layout/styles/index.css',
  },
];

type RosterReading =
  | { readonly state: 'absent'; readonly detail: string }
  | { readonly state: 'present'; readonly source: string };

/**
 * A missing repository and a missing file inside a present repository both read
 * ABSENT: a consumer that moved cannot be mistaken for a consumer that migrated.
 */
const readConsumer = ({ repo, path }: Pick<RosterEntry, 'repo' | 'path'>): RosterReading => {
  if (!existsSync(resolve(process.cwd(), repo, 'package.json'))) {
    return { state: 'absent', detail: 'sibling repository not checked out' };
  }
  const file = resolve(process.cwd(), path);
  if (!existsSync(file)) {
    return { state: 'absent', detail: 'rostered file missing from a checked-out repository' };
  }
  return { state: 'present', source: readFileSync(file, 'utf8') };
};

const WINDOW_OPEN = 'window open';

/**
 * Three readings, three verdicts: unreadable roster, window open, trigger passed.
 * Only the middle one is green, so both ends of the window fail closed.
 */
const readRoster = (read: (entry: RosterEntry) => RosterReading): string => {
  const absent: string[] = [];
  const authored: string[] = [];
  for (const entry of NAMED_CONSUMERS) {
    const reading = read(entry);
    if (reading.state === 'absent') {
      absent.push(`${entry.id}: ABSENT (${reading.detail})`);
      continue;
    }
    for (const [superseded] of PAIRS) {
      if (reading.source.includes(superseded)) authored.push(`${entry.id}: ${superseded}`);
    }
  }
  if (absent.length > 0) {
    return `roster UNREADABLE — re-roster the consumer at its current path; the window stays open: ${absent.join(', ')}`;
  }
  if (authored.length > 0) return WINDOW_OPEN;
  return 'window trigger PASSED — every named consumer authors the canonical spelling; close the window';
};

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

  it('states the end trigger: a named consumer still authors the old spelling', () => {
    // END TRIGGER, and it fires by going GREEN-to-RED on good news: when the
    // last consumer migrates, delete SHELL_SUPERSEDED_HOOK_CHANNELS, the first
    // arm of each skin read, the fourteen superseded hook rows and this suite.
    expect(readRoster(readConsumer)).toBe(WINDOW_OPEN);
  });

  it('reports ABSENT, never migrated, when a rostered consumer is not on disk', () => {
    const entry = NAMED_CONSUMERS[0]!;
    const movedFile = readConsumer({ repo: entry.repo, path: `${entry.path}.moved` });
    const missingRepo = readConsumer({ repo: `${entry.repo}-not-checked-out`, path: entry.path });
    expect([movedFile.state, missingRepo.state]).toEqual(['absent', 'absent']);

    for (const reading of [movedFile, missingRepo]) {
      const verdict = readRoster(() => reading);
      expect(verdict).not.toBe(WINDOW_OPEN);
      expect(verdict).toContain('ABSENT');
      expect(verdict).not.toContain('trigger PASSED');
    }

    // The other red, with the other reading: present and fully migrated.
    const migrated = readRoster(() => ({
      state: 'present',
      source: ':root{--ds-app-shell-header-radius:0}',
    }));
    expect(migrated).toContain('trigger PASSED');
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
