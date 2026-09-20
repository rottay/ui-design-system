/**
 * The class migration window, and the end trigger that closes it.
 *
 * The window is an EMISSION arm: the canonical class is stamped beside the
 * superseded one and every skin rule selects the pair. So this suite has to
 * prove three different things, and the third is the one that expires:
 *
 *   1. the pair is stamped, and no superseded class travels alone;
 *   2. the pair is SELECTED, at byte-equal specificity — `:is()` takes the
 *      specificity of its most specific argument, so a two-class pair is the
 *      (a,b,c) of one class, and this file computes that rather than asserting
 *      it in prose;
 *   3. the rostered consumers still author the superseded spelling. When the
 *      last one stops, the suite goes RED on good news, which is the only
 *      closure signal that cannot be forgotten.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import postcss from 'postcss';

import { ACTION_DOCK_CLASSES, APP_SHELL_CLASSES, CLASS_MIGRATION_WINDOWS } from '..';

interface Owner {
  readonly family: string;
  /** The authored source that stamps the classes. */
  readonly source: string;
  /** The Modern-scope skin that selects them. */
  readonly skin: string;
  /** The paired spellings the owner imports. */
  readonly paired: Readonly<Record<string, string>>;
}

const OWNERS: readonly Owner[] = [
  {
    family: 'app-shell',
    source: 'src/components/structures/shell/app-shell/index.tsx',
    skin: 'src/foundation/tokens/css/presentation/components/skin/app-shell/index.css',
    paired: APP_SHELL_CLASSES,
  },
  {
    family: 'action-dock',
    source: 'src/components/structures/workspace/action-dock/runtime/rendering/index.tsx',
    skin: 'src/foundation/tokens/css/presentation/components/skin/action-dock/index.css',
    paired: ACTION_DOCK_CLASSES,
  },
];

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

const windowFor = (family: string) => {
  const found = CLASS_MIGRATION_WINDOWS.find((entry) => entry.family === family);
  if (!found) throw new Error(`no declared window for ${family}`);
  return found;
};

// ---------------------------------------------------------------------------
// Specificity — CSS Selectors 4, computed, not asserted
// ---------------------------------------------------------------------------

type Specificity = readonly [number, number, number];

const compare = (a: Specificity, b: Specificity): number => {
  for (let i = 0; i < 3; i += 1) if (a[i] !== b[i]) return a[i]! - b[i]!;
  return 0;
};

/** Split a selector list on top-level commas. */
function splitTop(list: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of list) {
    if (char === '(' || char === '[') depth += 1;
    else if (char === ')' || char === ']') depth -= 1;
    if (char === ',' && depth === 0) {
      out.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim()) out.push(current);
  return out.map((value) => value.trim());
}

/**
 * `:is()`, `:not()` and `:has()` contribute their MOST SPECIFIC argument;
 * `:where()` contributes nothing. That rule is the whole reason this window
 * can exist without moving a single cascade.
 */
function specificity(selector: string): Specificity {
  let ids = 0;
  let classes = 0;
  let types = 0;
  let i = 0;
  while (i < selector.length) {
    const rest = selector.slice(i);
    const char = selector[i]!;
    if (char === '#') {
      ids += 1;
      i += /^#[\w-]+/.exec(rest)![0].length;
      continue;
    }
    if (char === '.') {
      classes += 1;
      i += /^\.[\w-]+/.exec(rest)![0].length;
      continue;
    }
    if (char === '[') {
      let depth = 0;
      let j = i;
      for (; j < selector.length; j += 1) {
        if (selector[j] === '[') depth += 1;
        else if (selector[j] === ']') {
          depth -= 1;
          if (depth === 0) break;
        }
      }
      classes += 1;
      i = j + 1;
      continue;
    }
    if (char === ':') {
      const pseudo = /^::?[\w-]+/.exec(rest)!;
      const name = pseudo[0].replace(/^::?/, '').toLowerCase();
      let next = i + pseudo[0].length;
      let args: string | null = null;
      if (selector[next] === '(') {
        let depth = 0;
        let j = next;
        for (; j < selector.length; j += 1) {
          if (selector[j] === '(') depth += 1;
          else if (selector[j] === ')') {
            depth -= 1;
            if (depth === 0) break;
          }
        }
        args = selector.slice(next + 1, j);
        next = j + 1;
      }
      if (name === 'where') {
        // contributes nothing
      } else if (args !== null && ['is', 'not', 'has', 'matches', 'any'].includes(name)) {
        let best: Specificity = [0, 0, 0];
        for (const argument of splitTop(args)) {
          const value = specificity(argument);
          if (compare(value, best) > 0) best = value;
        }
        ids += best[0];
        classes += best[1];
        types += best[2];
      } else if (pseudo[0].startsWith('::')) types += 1;
      else classes += 1;
      i = next;
      continue;
    }
    const type = /^[\w-]+|^\*/.exec(rest);
    if (type) {
      if (type[0] !== '*') types += 1;
      i += type[0].length;
      continue;
    }
    i += 1;
  }
  return [ids, classes, types];
}

/** Every authored selector in a skin, keyframe blocks excluded. */
function selectorsOf(css: string): string[] {
  const out: string[] = [];
  postcss.parse(css).walkRules((rule) => {
    const parent = rule.parent as { type?: string; name?: string } | undefined;
    if (parent?.type === 'atrule' && /keyframes/.test(parent.name ?? '')) return;
    for (const selector of rule.selectors) out.push(selector.replace(/\s+/g, ' ').trim());
  });
  return out;
}

/**
 * How often each arm of one window pair appears in a skin, and how often they
 * appear as a pair. `(?![\w-])` keeps `__navigation-drawer` out of the
 * `__navigation-drawer-body` count.
 */
function armCounts(skin: string, superseded: string, canonical: string) {
  const boundary = '(?![\\w-])';
  const count = (token: string): number =>
    skin.match(new RegExp(`\\.${token}${boundary}`, 'g'))?.length ?? 0;
  return {
    superseded_: count(superseded),
    canonical_: count(canonical),
    paired:
      skin.match(new RegExp(`\\.${canonical}, \\.${superseded}${boundary}`, 'g'))?.length ?? 0,
  };
}

describe('the class migration window — specificity', () => {
  it('computes a two-class `:is()` pair as one class', () => {
    // The premise the whole mechanism rests on, stated as arithmetic.
    expect(specificity(':is(.ds-app-shell, .rottay-app-shell)')).toEqual([0, 1, 0]);
    expect(specificity('.rottay-app-shell')).toEqual([0, 1, 0]);
    // And the calculator is not blind: a real second class still counts.
    expect(specificity('.ds-app-shell.rottay-app-shell')).toEqual([0, 2, 0]);
    expect(specificity(':where(.ds-app-shell)')).toEqual([0, 0, 0]);
  });

  it.each(OWNERS)('keeps every $family selector at the specificity of its superseded form', (owner) => {
    const pairs = windowFor(owner.family).pairs as Readonly<Record<string, string>>;
    const selectors = selectorsOf(read(owner.skin));
    const touched = selectors.filter((selector) =>
      Object.keys(pairs).some((superseded) => selector.includes(`.${superseded}`)),
    );
    expect(touched.length).toBeGreaterThan(0);

    for (const selector of touched) {
      // Collapse each pair back to the single superseded class the selector
      // carried before the window opened, and compare the two readings.
      let collapsed = selector;
      for (const [superseded, canonical] of Object.entries(pairs)) {
        collapsed = collapsed.split(`:is(.${canonical}, .${superseded})`).join(`.${superseded}`);
      }
      collapsed = collapsed.replace(
        /:is\(((?:\.[\w-]+, )*\.[\w-]+)\)/g,
        (whole, list: string) => {
          const names = splitTop(list);
          const superseded = names.filter((name) => !name.startsWith('.ds-'));
          return superseded.length === names.length / 2 ? `:is(${superseded.join(', ')})` : whole;
        },
      );
      expect({ selector, specificity: specificity(selector) }).toEqual({
        selector,
        specificity: specificity(collapsed),
      });
    }
  });
});

describe('the class migration window — the pair is stamped and selected', () => {
  it.each(OWNERS)('$family stamps the canonical class beside every superseded one', (owner) => {
    const source = read(owner.source);
    for (const [superseded, canonical] of Object.entries(windowFor(owner.family).pairs)) {
      // The source never spells a class inline: it reads the paired value, so
      // the declaration alone decides what is emitted.
      expect(owner.paired[superseded]).toBe(`${canonical} ${superseded}`);
      expect(source, `${owner.family} stamps ${superseded}`).toContain(`'${superseded}'`);
      expect(source, `${owner.family} spells ${canonical} inline`).not.toContain(`"${canonical}`);
    }
  });

  it.each(OWNERS)('$family names no class outside its declared window', (owner) => {
    const declared = new Set(Object.keys(windowFor(owner.family).pairs));
    const prefix = owner.family === 'app-shell' ? 'rottay-app-shell' : 'rottay-action-dock';
    const pattern = new RegExp(`${prefix}[A-Za-z0-9_-]*`, 'g');
    const stray = [...read(owner.source).matchAll(pattern), ...read(owner.skin).matchAll(pattern)]
      .map((match) => match[0])
      .filter((token) => !declared.has(token));
    expect([...new Set(stray)].sort()).toEqual([]);
  });

  it.each(OWNERS)('$family selects both arms everywhere it selects either', (owner) => {
    const skin = read(owner.skin);
    for (const [superseded, canonical] of Object.entries(windowFor(owner.family).pairs)) {
      const counts = armCounts(skin, superseded, canonical);
      // Both directions, because each catches a different regression: a
      // superseded class with no canonical twin is a rule the window never
      // reached, and a canonical class with no superseded twin is a rule that
      // silently stopped matching every pinned consumer.
      expect({ superseded, ...counts }).toEqual({
        superseded,
        superseded_: counts.paired,
        canonical_: counts.paired,
        paired: counts.paired,
      });
    }
  });
});

// ---------------------------------------------------------------------------
// The end trigger
// ---------------------------------------------------------------------------

interface RosterEntry {
  readonly id: string;
  readonly family: string;
  readonly repo: string;
  readonly path: string;
}

/**
 * The consumers measured at this window's opening, each naming its sibling
 * repository root and the file that proves it. app-platform authors none of
 * these classes and therefore has no row.
 */
const NAMED_CONSUMERS: readonly RosterEntry[] = [
  {
    id: 'app-bithire/vertical shell sidebar',
    family: 'app-shell',
    repo: '../../../app-bithire',
    path: '../../../app-bithire/src/vertical/surface/shell/sidebar/styles/index.css',
  },
  {
    id: 'app-bithire/vertical shell app-layout',
    family: 'app-shell',
    repo: '../../../app-bithire',
    path: '../../../app-bithire/src/vertical/surface/shell/app-layout/styles/index.css',
  },
  {
    id: 'app-bithire/details surface-shell mobile-tray',
    family: 'action-dock',
    repo: '../../../app-bithire',
    path: '../../../app-bithire/src/ui/details/surface-shell/mobile-tray/styles.css',
  },
  {
    id: 'app-evnto/vertical shell phone-navigation',
    family: 'app-shell',
    repo: '../../../app-evnto',
    path: '../../../app-evnto/src/vertical/shell/__tests__/phone-navigation.test.tsx',
  },
];

type RosterReading =
  | { readonly state: 'absent'; readonly detail: string }
  | { readonly state: 'present'; readonly source: string };

/**
 * A missing repository and a missing file inside a present repository both
 * read ABSENT: a consumer that moved cannot be mistaken for one that migrated.
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

const readRoster = (read_: (entry: RosterEntry) => RosterReading): string => {
  const absent: string[] = [];
  const authored: string[] = [];
  for (const entry of NAMED_CONSUMERS) {
    const reading = read_(entry);
    if (reading.state === 'absent') {
      absent.push(`${entry.id}: ABSENT (${reading.detail})`);
      continue;
    }
    for (const superseded of Object.keys(windowFor(entry.family).pairs)) {
      if (reading.source.includes(superseded)) authored.push(`${entry.id}: ${superseded}`);
    }
  }
  if (absent.length > 0) {
    return `roster UNREADABLE — re-roster the consumer at its current path; the window stays open: ${absent.join(', ')}`;
  }
  if (authored.length > 0) return WINDOW_OPEN;
  return 'window trigger PASSED — every named consumer authors the canonical spelling; close the window';
};

describe('the class migration window — the end trigger', () => {
  it('states the end trigger: a named consumer still authors the old spelling', () => {
    // END TRIGGER, and it fires by going GREEN-to-RED on good news. When the
    // last consumer migrates: drop each `pairs` entry, collapse every `:is()`
    // pair in the two skins back to one canonical class, migrate the two in-DS
    // emitters of the old dock spelling (`patterns/forms/step-wizard/runtime/
    // sticky-actions` stamps it, `skin/collection-workspace` selects it), and
    // delete this suite with the registry it reads.
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
      source: '.ds-app-shell__navigation-sidebar{display:none}',
    }));
    expect(migrated).toContain('trigger PASSED');
  });

  it('fails when a skin rule loses either arm', () => {
    const owner = OWNERS[0]!;
    const [superseded, canonical] = Object.entries(windowFor(owner.family).pairs)[0]!;
    const skin = read(owner.skin);

    // Plant 1: the superseded arm is dropped. Every pinned consumer selecting
    // that class stops matching, and the canonical count outruns the pair.
    const dropped = skin.split(`:is(.${canonical}, .${superseded})`).join(`.${canonical}`);
    const afterDrop = armCounts(dropped, superseded, canonical);
    expect(afterDrop.canonical_).toBeGreaterThan(afterDrop.paired);

    // Plant 2: a rule the window never reached, still on the old spelling alone.
    const missed = `${skin}\n.${superseded} [data-part="content"] { color: red; }\n`;
    const afterMiss = armCounts(missed, superseded, canonical);
    expect(afterMiss.superseded_).toBeGreaterThan(afterMiss.paired);

    // And the tree itself holds both readings.
    const live = armCounts(skin, superseded, canonical);
    expect([live.superseded_, live.canonical_]).toEqual([live.paired, live.paired]);
  });
});
