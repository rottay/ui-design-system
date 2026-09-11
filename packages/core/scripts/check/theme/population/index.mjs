/**
 * The POPULATION owner: which families are in the denominator of a causal
 * measurement, which axis each one declares it consumes, and the catalog
 * revision all of that was read at.
 *
 * WHY A DENOMINATOR NEEDS AN OWNER. `roadmap/kit-2026-09.md` section 5 rule 4
 * measures "the percentage of families with a computed-style difference
 * attributable to that axis", and the R4 amendment of `WO-EVI-02` adds the
 * only rule that makes such a percentage comparable: the denominator is the
 * set of families that DECLARE they consume the axis, read from the typed
 * catalog at a RECORDED revision and published with the run. A percentage
 * whose denominator moved between runs is not a measurement, and a denominator
 * that can be shrunk is not a threshold. So no gate in this lane computes its
 * own population; they all read this file, and this file states its revision.
 *
 * WHAT "DECLARES" MEANS HERE, STATED RATHER THAN ASSUMED. The catalog declares
 * a control's group (the axis) and its head channels. It does NOT carry a
 * per-family "I consume shape" flag, and inventing one in a gate would be a
 * second listing of the kind F-04 found five times. What a family DOES declare,
 * in its own authored source, is the painted property it takes a position on:
 * a skin that never writes a `border-radius` has not declared it consumes
 * shape, and counting it in shape's denominator would dilute the axis with
 * families that were never asked. The declaration is therefore read from the
 * family's own Modern skin, per axis, using the painted longhands kit rule 4
 * names verbatim -- the same properties the probe then reads back off the
 * browser. One vocabulary, declared in one place, used by both halves.
 *
 * SCOPE: MODERN ONLY (owner decision 2026-09-05). Classic and Rustic are
 * frozen; counting their paint would put frozen debt in a denominator that
 * exists to be certified against.
 *
 * Usage:
 *   node scripts/check/theme/population/index.mjs          the published report
 *   node scripts/check/theme/population/index.mjs --json    the same, machine-readable
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';
import {
  CATALOG_SOURCE,
  readThemeCatalog,
  readThemeCatalogAnnex,
  readThemeCatalogRetired,
} from '../../../libraries/theme-catalog/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = findPackageRoot(HERE);

/**
 * The six NON-CHROMATIC axes of kit section 5 rule 4, and the painted
 * longhands each one owns.
 *
 * Quoted from the rule rather than paraphrased: "shape (`border-radius`),
 * typography (`font-family`, `font-size`, `font-weight`), rhythm (`padding`,
 * `gap`, `margin`), depth (`box-shadow`, `border-width`), states (the
 * `*-hover`, `*-active`, `*-selected` channels computed under `:hover` and
 * `[data-state]`), motion (`transition-duration`, `animation-duration`)".
 *
 * `colour` is deliberately absent. The rule excludes it because a palette move
 * repaints everything and would carry every other axis over its threshold; the
 * two negative controls exist to prove exactly that it does not.
 *
 * `authored` is what a skin writes (shorthands included, because that is how a
 * stylesheet is authored); `computed` is what the browser hands back for the
 * same position. They differ on purpose: `border-radius` is authored once and
 * computed as four corners, `padding` as four sides. A gate that read one list
 * for both halves would either miss declarations or miss differences.
 */
export const AXES = Object.freeze({
  shape: {
    group: 'shape',
    authored: ['border-radius', 'border-start-start-radius', 'border-start-end-radius',
      'border-end-start-radius', 'border-end-end-radius'],
    computed: ['border-top-left-radius', 'border-top-right-radius',
      'border-bottom-left-radius', 'border-bottom-right-radius'],
  },
  typography: {
    group: 'typography',
    authored: ['font-family', 'font-size', 'font-weight', 'font'],
    computed: ['font-family', 'font-size', 'font-weight'],
  },
  rhythm: {
    group: 'rhythm',
    authored: ['padding', 'padding-block', 'padding-inline', 'padding-top', 'padding-right',
      'padding-bottom', 'padding-left', 'gap', 'row-gap', 'column-gap',
      'margin', 'margin-block', 'margin-inline', 'margin-top', 'margin-right',
      'margin-bottom', 'margin-left'],
    computed: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      'row-gap', 'column-gap', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
  },
  depth: {
    group: 'depth',
    authored: ['box-shadow', 'border-width', 'border', 'border-block-width', 'border-inline-width',
      'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'],
    computed: ['box-shadow', 'border-top-width', 'border-right-width',
      'border-bottom-width', 'border-left-width'],
  },
  states: {
    group: 'states',
    authored: [],
    computed: [],
    /**
     * States is the one axis whose declaration is not a property name. A
     * family declares it consumes states by having a rule that only applies in
     * a state -- `:hover`, `:active`, `[data-state='selected']` -- or by
     * reading a `*-hover`/`*-active`/`*-selected` channel. The probe reads the
     * same element twice, once in the state, which is why the declaration has
     * to be about the SELECTOR rather than about a longhand.
     */
    stateSelectors: [':hover', ':active', ':focus-visible', '[data-state='],
    stateChannelSuffixes: ['-hover', '-active', '-selected', '-pressed'],
  },
  motion: {
    group: 'motion',
    authored: ['transition-duration', 'transition', 'animation-duration', 'animation'],
    computed: ['transition-duration', 'animation-duration'],
  },
});

export const AXIS_IDS = Object.freeze(Object.keys(AXES));

/** The chromatic group the by-axis probe excludes, named so the exclusion is checkable. */
export const EXCLUDED_GROUP = 'color';

/**
 * The catalog revision every population is read at.
 *
 * It is a CONTENT digest of the authored catalog plus the row ids it declares,
 * not a git revision: a gate that needed git would be unrunnable on a tarball
 * (F-76), and a working tree with an edited catalog is a different population
 * from the commit it sits on however the commit is named. The git revision is
 * reported ALONGSIDE it when a checkout is present, because a reader comparing
 * two runs wants both, but nothing branches on it.
 */
export function catalogRevision(sourcePath = CATALOG_SOURCE) {
  const bytes = readFileSync(sourcePath);
  const rows = readThemeCatalog(sourcePath);
  return {
    source: sourcePath,
    digest: createHash('sha256').update(bytes).digest('hex').slice(0, 16),
    decisionRows: rows.length,
    annexRows: readThemeCatalogAnnex(sourcePath).length,
    retiredRows: readThemeCatalogRetired(sourcePath).length,
    rowIds: rows.map((row) => row.id),
  };
}

/** axis -> the head channels the catalog's rows of that group declare. */
export function axisChannels(sourcePath = CATALOG_SOURCE) {
  const byAxis = new Map(AXIS_IDS.map((axis) => [axis, new Set()]));
  for (const row of readThemeCatalog(sourcePath)) {
    const axis = AXIS_IDS.find((id) => AXES[id].group === row.group);
    if (!axis) continue;
    for (const channel of row.produces?.channels ?? []) byAxis.get(axis).add(channel);
  }
  return byAxis;
}

/** axis -> the catalog row ids of that group, in kit order. */
export function axisControls(sourcePath = CATALOG_SOURCE) {
  const byAxis = new Map(AXIS_IDS.map((axis) => [axis, []]));
  for (const row of readThemeCatalog(sourcePath)) {
    const axis = AXIS_IDS.find((id) => AXES[id].group === row.group);
    if (axis) byAxis.get(axis).push(row.id);
  }
  return byAxis;
}

const MODERN_SKIN_ROOT = 'src/foundation/tokens/css/runtime/engines/modern/skin';
const AGNOSTIC_SKIN_ROOT = 'src/foundation/tokens/css/presentation/components/skin';

/**
 * Every Modern skin family on disk: the folder under `skin/` IS the family id,
 * which is the same resolution `check/family-cut` uses (`skinBelongsToFamily`).
 * A family with no skin folder paints nothing in Modern and is therefore in no
 * axis denominator -- it has not declared anything to measure.
 */
export function skinFamilies(root = DEFAULT_ROOT) {
  const families = new Map();
  for (const skinRoot of [MODERN_SKIN_ROOT, AGNOSTIC_SKIN_ROOT]) {
    const base = join(root, skinRoot);
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const files = collectCss(join(base, entry.name));
      if (files.length === 0) continue;
      const existing = families.get(entry.name) ?? [];
      families.set(entry.name, [...existing, ...files]);
    }
  }
  return families;
}

function collectCss(dir, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) collectCss(full, found);
    else if (entry.name.endsWith('.css')) found.push(full);
  }
  return found;
}

/**
 * Strips comments before any declaration is counted.
 *
 * The exact defect this closes has already happened once in this tree: a `//`
 * comment documenting a DRAIN was read as a consumer and a gate certified the
 * opposite of what it measured (F-23, `buildConsumedClassSet`). A commented-out
 * `border-radius` is not a declaration that a family consumes shape.
 */
export function stripCssComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, ' ');
}

const DECLARATION = /(^|[;{])\s*([-a-zA-Z]+)\s*:/g;

/** The property names a stylesheet actually declares, comments removed. */
export function declaredProperties(css) {
  const declared = new Set();
  for (const match of stripCssComments(css).matchAll(DECLARATION)) declared.add(match[2].toLowerCase());
  return declared;
}

/** The `--ds-*` channels a stylesheet READS through `var()`. */
export function readChannels(css) {
  const read = new Set();
  for (const match of stripCssComments(css).matchAll(/var\(\s*(--[\w-]+)/g)) read.add(match[1]);
  return read;
}

/**
 * family -> the axes it DECLARES it consumes, with the evidence for each.
 *
 * The evidence is kept rather than collapsed to a boolean because a denominator
 * without evidence cannot be argued with, and this one will be argued with:
 * every percentage this lane publishes is a fraction of it.
 */
export function familyAxisDeclarations(root = DEFAULT_ROOT, sourcePath = CATALOG_SOURCE) {
  const channelsByAxis = axisChannels(sourcePath);
  const declarations = new Map();
  for (const [family, files] of skinFamilies(root)) {
    const css = files.map((file) => readFileSync(file, 'utf8')).join('\n');
    const properties = declaredProperties(css);
    const channels = readChannels(css);
    const stripped = stripCssComments(css);
    const axes = {};
    for (const axis of AXIS_IDS) {
      const spec = AXES[axis];
      const byProperty = spec.authored.filter((name) => properties.has(name));
      const byHeadChannel = [...channelsByAxis.get(axis)].filter((channel) => channels.has(channel));
      const bySelector = axis === 'states'
        ? spec.stateSelectors.filter((needle) => stripped.includes(needle))
        : [];
      const byStateChannel = axis === 'states'
        ? [...channels].filter((channel) => spec.stateChannelSuffixes.some((suffix) => channel.endsWith(suffix)))
        : [];
      const declared = byProperty.length > 0 || byHeadChannel.length > 0
        || bySelector.length > 0 || byStateChannel.length > 0;
      if (declared) {
        axes[axis] = {
          properties: byProperty,
          headChannels: byHeadChannel,
          stateSelectors: bySelector,
          stateChannels: byStateChannel.slice(0, 8),
        };
      }
    }
    declarations.set(family, { family, files: files.map((file) => relativeTo(root, file)), axes });
  }
  return declarations;
}

function relativeTo(root, file) {
  return file.startsWith(root + sep) ? file.slice(root.length + 1) : file;
}

/** axis -> the families in its denominator, sorted. The published population. */
export function axisPopulations(root = DEFAULT_ROOT, sourcePath = CATALOG_SOURCE) {
  const declarations = familyAxisDeclarations(root, sourcePath);
  const populations = new Map(AXIS_IDS.map((axis) => [axis, []]));
  for (const [family, record] of declarations) {
    for (const axis of Object.keys(record.axes)) populations.get(axis).push(family);
  }
  for (const list of populations.values()) list.sort();
  return populations;
}

/** The whole published population, in one object, revision included. */
export function populationReport(root = DEFAULT_ROOT, sourcePath = CATALOG_SOURCE) {
  const revision = catalogRevision(sourcePath);
  const populations = axisPopulations(root, sourcePath);
  const controls = axisControls(sourcePath);
  const families = skinFamilies(root);
  return {
    revision,
    excludedGroup: EXCLUDED_GROUP,
    skinFamilies: families.size,
    axes: AXIS_IDS.map((axis) => ({
      axis,
      group: AXES[axis].group,
      controls: controls.get(axis),
      denominator: populations.get(axis).length,
      families: populations.get(axis),
    })),
  };
}

/** One line the runner prints so every run states the revision it measured at. */
export function populationLine(root = DEFAULT_ROOT, sourcePath = CATALOG_SOURCE) {
  const report = populationReport(root, sourcePath);
  const axes = report.axes.map((entry) => `${entry.axis} ${entry.denominator}`).join(', ');
  return `population: theme catalog ${report.revision.digest} (${report.revision.decisionRows} decisions), `
    + `${report.skinFamilies} modern skin families; per-axis denominators — ${axes}`;
}

export const FLOOR_PATH = join(HERE, 'baseline/index.json');

/**
 * The denominator floor, and the ONLY direction it may move.
 *
 * Every other baseline in this tree is decrease-only, because every other one
 * pins debt. This one pins a POPULATION, and the amendment it implements says
 * the opposite thing: "a denominator may never be shrunk to reach a
 * threshold" (`WO-EVI-02`, R4 amendment 3). A shrinking population makes every
 * percentage in this lane easier to pass, so shrinkage is the regression and
 * growth is the only free direction. Growth is still REPORTED, with the
 * instruction to raise the pin in the same commit, so the floor follows the
 * tree up and a silent drift in either direction is impossible.
 */
export function checkPopulationFloor(root = DEFAULT_ROOT, sourcePath = CATALOG_SOURCE, floorPath = FLOOR_PATH) {
  const report = populationReport(root, sourcePath);
  const floor = JSON.parse(readFileSync(floorPath, 'utf8'));
  const failures = [];
  const pinned = floor.axes ?? {};
  for (const axis of AXIS_IDS) {
    if (!Object.hasOwn(pinned, axis)) {
      failures.push(`${axis}: no pinned denominator floor — an unpinned axis is an unbounded denominator`);
    }
  }
  for (const axis of Object.keys(pinned)) {
    if (!AXIS_IDS.includes(axis)) {
      failures.push(`${axis}: pinned floor names no axis of kit rule 4`);
    }
  }
  for (const entry of report.axes) {
    const min = pinned[entry.axis];
    if (typeof min !== 'number') continue;
    if (entry.denominator < min) {
      failures.push(
        `${entry.axis}: denominator ${entry.denominator} is BELOW its floor ${min} — a denominator may never be `
        + 'shrunk to reach a threshold; restore the families or have the owner lower the floor with a reason',
      );
    } else if (entry.denominator > min) {
      failures.push(
        `${entry.axis}: denominator ${entry.denominator} is ABOVE its pin ${min} — raise the pin in this commit so `
        + 'the published population and the floor keep naming the same set',
      );
    }
  }
  if (typeof floor.skinFamilies === 'number' && report.skinFamilies !== floor.skinFamilies) {
    failures.push(
      `skin families ${report.skinFamilies} != pinned ${floor.skinFamilies} — the corpus every axis denominator `
      + 'is drawn from moved; re-pin it in the same commit',
    );
  }
  if (report.skinFamilies === 0) {
    failures.push('zero skin families found — a vacuous population is not a population');
  }
  return { report, failures };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain && process.argv.includes('--check')) {
  const { report, failures } = checkPopulationFloor();
  console.log(populationLine());
  if (failures.length > 0) {
    for (const failure of failures) console.error(`theme-population FAIL — ${failure}`);
    process.exit(1);
  }
  console.log(`theme-population OK — ${report.axes.length} axes pinned at catalog ${report.revision.digest}`);
} else if (isMain) {
  const report = populationReport();
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`theme population — catalog ${report.revision.digest} at ${report.revision.source}`);
    console.log(`  ${report.revision.decisionRows} decisions, ${report.revision.annexRows} annex, `
      + `${report.revision.retiredRows} retired; excluded group: ${report.excludedGroup}`);
    console.log(`  ${report.skinFamilies} modern skin families in the corpus`);
    for (const entry of report.axes) {
      console.log(`  ${entry.axis.padEnd(11)} denominator ${String(entry.denominator).padStart(4)} `
        + `— controls: ${entry.controls.join(', ') || '(none)'}`);
    }
  }
}
