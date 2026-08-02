/**
 * The SINGLE touch-target authority (FASE F).
 *
 * There used to be two systems: a per-FILE census keyed on skin filenames
 * with its own exemption table, and this per-SELECTOR discovery. Two tables
 * meant a skin could be adjudicated in one and unadjudicated in the other,
 * and the per-file table could absolve a whole file because ONE control in it
 * was floored. The per-file system is retired; `adjudications.json` is the
 * only table and this module is the only mechanism.
 *
 * WHAT IS A TARGET. Interactivity is discovered, never listed:
 *   CSS (PostCSS-real, never a regex over raw text)
 *     `css-native`  a selector compound whose element type is natively
 *                   interactive (`button`, `input`, `select`, `textarea`,
 *                   `summary`, or `a` carrying `[href]`)
 *     `css-role`    a compound carrying an interactive `[role=...]` or any
 *                   `[tabindex]` — ARIA promotes an inert box to a control
 *     `css-pointer` the rule declares `cursor: pointer`, or the selector
 *                   carries `:focus-visible`
 *   TSX (TypeScript AST over the production tree)
 *     `tsx-native`  an intrinsic native interactive element
 *     `tsx-role`    any element carrying an interactive `role` literal
 *     `tsx-handler` an intrinsic NON-native element (div/span/li) given
 *                   interaction by onClick/onPointerDown/onPointerUp/
 *                   onKeyDown/onKeyUp — the classic unfloored fake button
 *
 * WHAT IS A FLOOR. A rule whose declarations size a box from a touch channel
 * (`--ds-*touch-target*` / `--ds-*touch-size*`) or the sanctioned physical
 * literals (44px / 2.75rem), VALID only when the rule is unconditional or
 * inside a coarse-pointer / hover-none media query. A floor inside a width
 * media query proves nothing about a touch device.
 *
 * WHAT COUNTS AS PROOF. Exactly three FORMAL relations, all of which name the
 * same physical box:
 *   `equal`        same normalized selector
 *   `after-idiom`  the floor is the target's own `::after` hit-area
 *   `structural`   same root scope compound AND same final data-part compound
 * `ancestor` was a relation and is now DELETED: a floored container never
 * proves the size of a child hitbox — a 300px card says nothing about the
 * 16px close button inside it. Every row that survived only through it had to
 * be re-proven or demoted to explicit debt.
 *
 * The audit is BIDIRECTIONAL: a discovered target with neither proof nor a
 * selector-level adjudication fails; an adjudication whose target no longer
 * exists fails as stale. Debt is explicit (owner + reason) and decrease-only.
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
// PostCSS is a package dependency; loaded lazily so importing types stays free.
const postcss = require('postcss') as typeof import('postcss');

export interface SourceFile {
  readonly name: string;
  readonly content: string;
}

export type CssInteraction = 'css-native' | 'css-role' | 'css-pointer';
export type TsxInteraction = 'tsx-native' | 'tsx-role' | 'tsx-handler';
export type TouchInteraction = CssInteraction | TsxInteraction;

export interface DiscoveredTarget {
  readonly file: string;
  readonly selector: string;
  readonly interaction: CssInteraction;
}

export interface DiscoveredFloor {
  readonly file: string;
  readonly selector: string;
  readonly media: string | null;
}

export interface TouchDiscovery {
  readonly targets: readonly DiscoveredTarget[];
  readonly floors: readonly DiscoveredFloor[];
}

const FLOOR_VALUE = /--ds-[a-z-]*touch-(?:target|size)|44px|2\.75rem/;
const FLOOR_PROP = /^(?:min-)?(?:block|inline)-size$|^(?:min-)?(?:height|width)$|^inset$/;

/** Elements the user agent makes interactive without any author help. */
export const NATIVE_INTERACTIVE_ELEMENTS: ReadonlySet<string> = new Set([
  'button',
  'input',
  'select',
  'textarea',
  'summary',
]);

/** ARIA roles that promise a discrete, pointable control. */
export const INTERACTIVE_ROLES: ReadonlySet<string> = new Set([
  'button',
  'link',
  'checkbox',
  'radio',
  'switch',
  'menuitem',
  'tab',
  'option',
  'slider',
]);

/** Handlers that turn an inert element into something a finger must hit. */
export const INTERACTION_HANDLERS: readonly string[] = [
  'onClick',
  'onPointerDown',
  'onPointerUp',
  'onKeyDown',
  'onKeyUp',
];

function stripBalancedPseudo(selector: string, name: string): string {
  let out = selector;
  let index;
  while ((index = out.indexOf(`${name}(`)) !== -1) {
    let depth = 0;
    let i = index + name.length;
    do {
      if (out[i] === '(') depth += 1;
      else if (out[i] === ')') depth -= 1;
      i += 1;
    } while (i < out.length && depth > 0);
    out = out.slice(0, index) + out.slice(i);
  }
  return out;
}

export function normalizeSelector(selector: string): string {
  let out = selector;
  for (const fn of [':is', ':where', ':not', ':has']) {
    out = stripBalancedPseudo(out, fn);
  }
  out = out.replace(
    /:(hover|focus-visible|focus-within|focus|active|disabled|checked|enabled|first-child|last-child)\b/g,
    ''
  );
  out = out.replace(/\[data-state[^\]]*\]/g, '');
  return out.replace(/\s+/g, ' ').trim().replace(/[ >+~]+$/, '').trim();
}

/**
 * A pseudo-element is a rendered PART of a box, not a box a finger can aim
 * at: `input::placeholder` and `input::selection` are the same tap target as
 * `input`. Targets are collapsed onto their originating element; floors keep
 * their `::after` because the after-idiom hit-area is a real proof relation.
 */
export function stripPseudoElements(selector: string): string {
  return selector.replace(/::[a-zA-Z-]+(\([^)]*\))?/g, '').trim();
}

/**
 * Split a selector into its compounds at top-level combinators. Brackets and
 * quotes are respected, so `[data-part='a b']` stays one token instead of
 * fracturing into two meaningless ones.
 */
export function splitCompounds(selector: string): string[] {
  const out: string[] = [];
  let buffer = '';
  let depth = 0;
  let quote: string | null = null;
  for (const char of selector) {
    if (quote) {
      buffer += char;
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      buffer += char;
      continue;
    }
    if (char === '[' || char === '(') depth += 1;
    else if (char === ']' || char === ')') depth -= 1;
    else if (depth === 0 && /[\s>+~]/.test(char)) {
      if (buffer) out.push(buffer);
      buffer = '';
      continue;
    }
    buffer += char;
  }
  if (buffer) out.push(buffer);
  return out;
}

/** The element type a compound selects, or null when it selects by class/attr. */
export function compoundElementType(compound: string): string | null {
  const match = compound.match(/^([a-zA-Z][a-zA-Z0-9-]*)/);
  return match ? match[1].toLowerCase() : null;
}

const ROLE_ATTR = /\[role\s*[~|^$*]?=\s*['"]?([a-zA-Z-]+)['"]?\]/;
const TABINDEX_ATTR = /\[tabindex/;

/**
 * The interaction class of a selector, or null when nothing about it is
 * interactive. Priority is native > role > pointer: the strongest evidence
 * names the row so the census reads as a claim about the ELEMENT, not about
 * whichever declaration happened to be scanned first.
 */
export function classifySelector(
  normalized: string,
  raw: string,
  declaresCursorPointer: boolean
): CssInteraction | null {
  // Element/role evidence is read from the SUBJECT compound — the last one —
  // because that is the box the rule styles. `.checkbox input:focus-visible ~
  // [data-part='box']` paints the box, not the input; calling it a native
  // target would file the defect against the wrong element. An input that no
  // rule ever subjects is still caught, by TSX discovery.
  const compounds = splitCompounds(normalized);
  const subject = compounds[compounds.length - 1] ?? normalized;
  const type = compoundElementType(subject);
  if (type) {
    if (NATIVE_INTERACTIVE_ELEMENTS.has(type)) return 'css-native';
    if (type === 'a' && /\[href/.test(subject)) return 'css-native';
  }
  const role = subject.match(ROLE_ATTR)?.[1]?.toLowerCase();
  if (role && INTERACTIVE_ROLES.has(role)) return 'css-role';
  if (TABINDEX_ATTR.test(subject)) return 'css-role';
  if (declaresCursorPointer || /:focus-visible/.test(raw)) return 'css-pointer';
  return null;
}

/**
 * Root scope compound + final data-part compound = the physical box.
 *
 * A leading element type is dropped when the compound also selects by class
 * or attribute: `input.rottay-input[data-part='root']` and
 * `.rottay-input[data-part='root']` are the same painted box, and the floor
 * is authored on one form while the state rules are authored on the other.
 * A bare type (`button`) keeps its name — dropping it would leave nothing.
 */
export function structuralKey(selector: string): string {
  const clean = selector.replace(/::after$/, '');
  const compounds = splitCompounds(clean);
  if (compounds.length === 0) return clean;
  const root = compounds[0].replace(/^[a-zA-Z][a-zA-Z0-9-]*(?=[.[#])/, '');
  const scope = root.match(/^[.a-z0-9_-]+/i)?.[0] ?? root;
  const last = compounds[compounds.length - 1];
  const part = last.match(/\[data-part[^\]]*\]/)?.[0] ?? last;
  return `${scope} :: ${part}`;
}

export function discoverTouchSurface(
  files: readonly SourceFile[]
): TouchDiscovery {
  const targets = new Map<string, DiscoveredTarget>();
  const floors: DiscoveredFloor[] = [];
  for (const file of files) {
    let root;
    try {
      root = postcss.parse(file.content, { from: file.name });
    } catch {
      continue;
    }
    root.walkRules((rule) => {
      let cursorPointer = false;
      let floorDecl = false;
      rule.walkDecls((decl) => {
        if (decl.prop === 'cursor' && /pointer/.test(decl.value)) cursorPointer = true;
        if (FLOOR_PROP.test(decl.prop) && FLOOR_VALUE.test(decl.value)) floorDecl = true;
      });
      const media =
        rule.parent?.type === 'atrule' && (rule.parent as { name?: string }).name === 'media'
          ? String((rule.parent as { params?: string }).params ?? '')
          : null;
      for (const raw of rule.selectors ?? []) {
        const base = normalizeSelector(raw);
        const targetBase = stripPseudoElements(base);
        const interaction = targetBase
          ? classifySelector(targetBase, raw, cursorPointer)
          : null;
        if (targetBase && interaction) {
          targets.set(`${file.name} :: ${targetBase}`, {
            file: file.name,
            selector: targetBase,
            interaction,
          });
        }
        if (floorDecl) {
          floors.push({ file: file.name, selector: base, media });
        }
      }
    });
  }
  return { targets: [...targets.values()], floors };
}

export type CoverageRelation = 'equal' | 'after-idiom' | 'structural' | 'shared-base';

/**
 * The 44px law is enforced in TWO halves. The per-component half lives in the
 * skins; the shared half is ONE unlayered `@media (pointer: coarse)` block in
 * `facade/entrypoints/base.css` that floors every `button`, `a`, `select`,
 * `summary`, `input[type=checkbox|radio]` and six ARIA roles at once. Because
 * it is unlayered it BEATS every skin rule in `@layer rottay-engines`, so a
 * census that reads only the skin directory would file hundreds of false debts
 * against controls the shared rule already floors. It is parsed, never
 * transcribed — a hand-copied list would drift from the shipped stylesheet.
 *
 * Note the deliberate gap: the shared rule does NOT claim
 * `[role=checkbox|radio|switch|slider|option|row]`, because those roles sit on
 * an indicator or inside virtualized geometry where a shared visual floor
 * would redesign the control. Those stay component-owned, and this census
 * holds them to their own skins exactly as before.
 */
export function discoverSharedFloors(
  files: readonly SourceFile[]
): readonly string[] {
  return discoverTouchSurface(files)
    .floors.filter((floor) => floorMediaIsValid(floor.media))
    .map((floor) => floor.selector);
}

function attributeFacts(compound: string): Set<string> {
  const facts = new Set<string>();
  for (const match of compound.matchAll(/\[([a-zA-Z-]+)(?:\s*[~|^$*]?=\s*['"]?([^'"\]]*)['"]?)?\]/g)) {
    facts.add(match[2] === undefined ? match[1] : `${match[1]}=${match[2]}`);
  }
  return facts;
}

function classFacts(compound: string): Set<string> {
  return new Set(
    [...compound.matchAll(/\.([a-zA-Z0-9_-]+)/g)].map((match) => match[1])
  );
}

/**
 * Does one shared-floor selector reach a box described by an element type plus
 * a set of attribute/class facts? Every constraint the shared selector states
 * must hold; a selector that states none reaches nothing.
 */
function sharedSelectorReaches(
  shared: string,
  type: string | null,
  attributes: ReadonlySet<string>,
  classes: ReadonlySet<string>
): boolean {
  const compounds = splitCompounds(shared);
  if (compounds.length !== 1) return false;
  const compound = compounds[0];
  const sharedType = compoundElementType(compound);
  if (sharedType && sharedType !== type) return false;
  const sharedAttributes = attributeFacts(compound);
  const sharedClasses = classFacts(compound);
  if (!sharedType && sharedAttributes.size === 0 && sharedClasses.size === 0) return false;
  for (const fact of sharedAttributes) if (!attributes.has(fact)) return false;
  for (const fact of sharedClasses) if (!classes.has(fact)) return false;
  return true;
}

export function sharedFloorFor(
  type: string | null,
  attributes: ReadonlySet<string>,
  classes: ReadonlySet<string>,
  sharedFloors: readonly string[]
): string | null {
  for (const shared of sharedFloors) {
    if (sharedSelectorReaches(shared, type, attributes, classes)) return shared;
  }
  return null;
}

export function floorMediaIsValid(media: string | null): boolean {
  return media === null || /pointer:\s*coarse|hover:\s*none/.test(media);
}

/**
 * The formal proof, or null. The relation is part of the evidence — a caller
 * that cannot name HOW a floor covers a target has not proven anything.
 */
export function proveCoverage(
  target: { readonly file: string; readonly selector: string },
  floors: readonly DiscoveredFloor[],
  sharedFloors: readonly string[] = []
): { floor: DiscoveredFloor; relation: CoverageRelation } | null {
  const key = structuralKey(target.selector);
  for (const floor of floors) {
    if (floor.file !== target.file || !floorMediaIsValid(floor.media)) continue;
    const floorBase = floor.selector.replace(/::after$/, '');
    if (floor.selector === target.selector) return { floor, relation: 'equal' };
    if (floor.selector.endsWith('::after') && floorBase === target.selector) {
      return { floor, relation: 'after-idiom' };
    }
    if (structuralKey(floor.selector) === key) return { floor, relation: 'structural' };
  }
  const compounds = splitCompounds(target.selector.replace(/::after$/, ''));
  const subject = compounds[compounds.length - 1] ?? target.selector;
  const shared = sharedFloorFor(
    compoundElementType(subject),
    attributeFacts(subject),
    classFacts(subject),
    sharedFloors
  );
  return shared
    ? { floor: { file: SHARED_FLOOR_FILE, selector: shared, media: null }, relation: 'shared-base' }
    : null;
}

/** Synthetic origin for a proof that comes from the shared unlayered block. */
export const SHARED_FLOOR_FILE = '<shared base floor>';

// ---------------------------------------------------------------------------
// TSX discovery
// ---------------------------------------------------------------------------

export interface DiscoveredTsxTarget {
  readonly file: string;
  /** The JSX tag: `button`, `div`, or a component name. */
  readonly element: string;
  /**
   * `[data-part='x']` or `.a.b` when statically present, else `dynamic`.
   * A dynamic discriminator can never be matched to a CSS floor, so it always
   * requires adjudication — silence is not proof.
   */
  readonly discriminator: string;
  readonly interaction: TsxInteraction;
  /**
   * Static `role` / `type` / `data-ds-interactive` facts, as `name=value`.
   * These decide whether the SHARED base floor reaches the element.
   */
  readonly signals?: readonly string[];
}

function loadTypeScript(): typeof import('typescript') {
  // Function-local so importing this module never pulls the compiler in.
  return require('typescript') as typeof import('typescript');
}

function staticAttributeValue(
  ts: typeof import('typescript'),
  attribute: import('typescript').JsxAttribute,
  source: import('typescript').SourceFile
): string | null {
  const initializer = attribute.initializer;
  if (!initializer) return '';
  if (ts.isStringLiteral(initializer)) return initializer.text;
  if (
    ts.isJsxExpression(initializer) &&
    initializer.expression &&
    ts.isStringLiteral(initializer.expression)
  ) {
    return initializer.expression.text;
  }
  void source;
  return null;
}

export function discoverTsxTouchTargets(
  files: readonly SourceFile[]
): readonly DiscoveredTsxTarget[] {
  const ts = loadTypeScript();
  const rows = new Map<string, DiscoveredTsxTarget>();

  for (const file of files) {
    const source = ts.createSourceFile(
      file.name,
      file.content,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );

    const visit = (node: import('typescript').Node): void => {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tag = node.tagName.getText(source);
        const attributes = new Map<string, string | null>();
        for (const property of node.attributes.properties) {
          if (!ts.isJsxAttribute(property)) continue;
          attributes.set(
            property.name.getText(source),
            staticAttributeValue(ts, property, source)
          );
        }

        // A lowercase tag is an intrinsic DOM element; an uppercase tag is a
        // component whose own skin owns its floor.
        const intrinsic = /^[a-z]/.test(tag);
        const native =
          intrinsic &&
          (NATIVE_INTERACTIVE_ELEMENTS.has(tag) ||
            (tag === 'a' && attributes.has('href')));
        const role = attributes.get('role');
        const roleInteractive = typeof role === 'string' && INTERACTIVE_ROLES.has(role);
        const handled =
          intrinsic && INTERACTION_HANDLERS.some((handler) => attributes.has(handler));

        let interaction: TsxInteraction | null = null;
        if (native) interaction = 'tsx-native';
        else if (roleInteractive) interaction = 'tsx-role';
        else if (handled) interaction = 'tsx-handler';

        if (interaction) {
          const part = attributes.get('data-part');
          const className = attributes.get('className');
          const discriminator = part
            ? `[data-part='${part}']`
            : className
              ? `.${className.trim().split(/\s+/).join('.')}`
              : 'dynamic';
          // The facts the SHARED floor selects on. Retained because a row's
          // element alone cannot decide it: `input[type='checkbox']` is
          // floored by the shared rule while `input[type='text']` is not.
          const signals = new Set<string>();
          for (const name of ['role', 'type', 'data-ds-interactive']) {
            const value = attributes.get(name);
            if (typeof value === 'string' && value) signals.add(`${name}=${value}`);
          }
          const row: DiscoveredTsxTarget = {
            file: file.name,
            element: tag,
            discriminator,
            interaction,
            signals: [...signals].sort(),
          };
          rows.set(tsxTargetKey(row), row);
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(source);
  }

  return [...rows.values()];
}

export function tsxTargetKey(row: {
  readonly file: string;
  readonly element: string;
  readonly discriminator: string;
}): string {
  return `${row.file} :: ${row.element} :: ${row.discriminator}`;
}

function kebab(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * The component a TSX file paints. An engine implementation lives at
 * `.../<Component>/engines/modern/*.tsx` — including nested part folders, so
 * the owner is read from the segment BEFORE `engines`, not from the file's
 * own folder. A structure or surface is owned by its own folder.
 */
export function tsxSkinOwner(file: string): string | null {
  const parts = file.split('/');
  const enginesIndex = parts.lastIndexOf('engines');
  const owner = enginesIndex > 0 ? parts[enginesIndex - 1] : parts[parts.length - 2];
  return owner ? kebab(owner) : null;
}

/**
 * The skin files that could own a TSX file's paint, resolved against the real
 * corpus because the naming is irregular: `QRCode` paints from `qrcode.css`
 * and `Modal` from `overlay-modal.css`. Exact forms win outright; an affix
 * match is accepted only when it is UNAMBIGUOUS, since two candidates prove
 * nothing about which one owns the box. No candidate means the row cannot be
 * resolved mechanically and must be adjudicated.
 */
export function resolveSkinFilesForTsx(
  file: string,
  corpus: readonly string[]
): readonly string[] {
  const owner = tsxSkinOwner(file);
  if (!owner) return [];
  const names = new Set(corpus);
  const exact = [
    `${owner}.css`,
    `${owner.replace(/-/g, '')}.css`,
    `pattern-${owner}.css`,
    `ds-${owner}.css`,
  ].filter((name) => names.has(name));
  if (exact.length > 0) return exact;
  const affix = corpus.filter(
    (name) => name.endsWith(`-${owner}.css`) || name.startsWith(`${owner}-`)
  );
  return affix.length === 1 ? affix : [];
}

function finalCompound(selector: string): string {
  const compounds = splitCompounds(selector.replace(/::after$/, ''));
  return compounds.length ? compounds[compounds.length - 1] : selector;
}

const PART_ATTR = /\[data-part\s*([~|^$*]?)=\s*['"]?([^'"\]]+)['"]?\]/;

/**
 * A TSX row is covered by the SHARED base floor when the element's own tag and
 * static facts fall inside that unlayered block, otherwise when its own skin
 * carries a VALID floor on the same discriminator. Skin scope is the
 * component's file, never the whole corpus: `[data-part='root']` exists in
 * ninety skins and proves nothing on its own.
 */
export function proveTsxCoverage(
  row: DiscoveredTsxTarget,
  floors: readonly DiscoveredFloor[],
  skinCorpus: readonly string[] = floors.map((floor) => floor.file),
  sharedFloors: readonly string[] = []
): DiscoveredFloor | null {
  const attributes = new Set(row.signals ?? []);
  const shared = /^[a-z]/.test(row.element)
    ? sharedFloorFor(row.element, attributes, new Set(), sharedFloors)
    : null;
  if (shared) return { file: SHARED_FLOOR_FILE, selector: shared, media: null };

  if (row.discriminator === 'dynamic') return null;
  const candidates = new Set(resolveSkinFilesForTsx(row.file, skinCorpus));
  if (candidates.size === 0) return null;

  const part = row.discriminator.match(PART_ATTR)?.[2] ?? null;
  const classes = part
    ? []
    : row.discriminator.split('.').filter(Boolean).map((token) => `.${token}`);

  for (const floor of floors) {
    if (!candidates.has(floor.file) || !floorMediaIsValid(floor.media)) continue;
    const compound = finalCompound(floor.selector);
    if (part !== null) {
      const match = compound.match(PART_ATTR);
      if (!match) continue;
      const [, operator, value] = match;
      if (operator === '^' ? part.startsWith(value) : part === value) return floor;
      continue;
    }
    if (classes.some((token) => compound.includes(token))) return floor;
  }
  return null;
}

// ---------------------------------------------------------------------------
// The audit
// ---------------------------------------------------------------------------

export interface TouchAdjudication {
  /**
   * CSS rows: `${file} :: ${structuralKey}`. TSX rows:
   * `${file} :: ${element} :: ${discriminator}`. Both are matched
   * structurally, never textually against the authored selector.
   */
  readonly key: string;
  readonly kind: 'exempt' | 'debt';
  readonly reason: string;
  /** REQUIRED for debt: who owns flooring or culling this target. */
  readonly owner?: string;
}

export interface MechanicalTouchAudit {
  readonly targets: number;
  readonly proven: number;
  readonly adjudicated: number;
  readonly tsxTargets: number;
  readonly tsxProven: number;
  readonly tsxAdjudicated: number;
  readonly byClass: Readonly<Partial<Record<TouchInteraction, number>>>;
  readonly byRelation: Readonly<Partial<Record<CoverageRelation, number>>>;
  readonly violations: readonly string[];
}

export function auditTouchTargetsMechanical(
  files: readonly SourceFile[],
  adjudications: readonly TouchAdjudication[],
  tsxFiles: readonly SourceFile[] = [],
  sharedFloorSources: readonly SourceFile[] = []
): MechanicalTouchAudit {
  const sharedFloors = discoverSharedFloors(sharedFloorSources);
  const { targets, floors } = discoverTouchSurface(files);
  const tsxTargets = discoverTsxTouchTargets(tsxFiles);
  const violations: string[] = [];
  const byKey = new Map(adjudications.map((row) => [row.key, row]));
  const used = new Set<string>();
  const byClass: Partial<Record<TouchInteraction, number>> = {};
  const byRelation: Partial<Record<CoverageRelation, number>> = {};
  let proven = 0;
  let adjudicated = 0;
  let tsxProven = 0;
  let tsxAdjudicated = 0;

  const checkRow = (file: string, key: string): void => {
    const row = byKey.get(key);
    if (!row) return;
    used.add(key);
    if (row.kind !== 'exempt' && row.kind !== 'debt') {
      violations.push(`${file}: adjudication with unknown kind '${row.kind}': ${key}`);
    }
    if (row.reason.trim().length < 20) {
      violations.push(`${file}: adjudication without substantive reason: ${key}`);
    }
    if (row.kind === 'debt' && !row.owner) {
      violations.push(`${file}: DEBT without owner: ${key}`);
    }
  };

  for (const target of targets) {
    byClass[target.interaction] = (byClass[target.interaction] ?? 0) + 1;
    const proof = proveCoverage(target, floors, sharedFloors);
    if (proof) {
      proven += 1;
      byRelation[proof.relation] = (byRelation[proof.relation] ?? 0) + 1;
      continue;
    }
    const key = `${target.file} :: ${structuralKey(target.selector)}`;
    if (!byKey.has(key)) {
      violations.push(
        `${target.file}: interactive target WITHOUT proof or adjudication: ${target.selector} [${target.interaction}]`
      );
      continue;
    }
    checkRow(target.file, key);
    adjudicated += 1;
  }

  const skinCorpus = files.map((file) => file.name);
  for (const row of tsxTargets) {
    byClass[row.interaction] = (byClass[row.interaction] ?? 0) + 1;
    if (proveTsxCoverage(row, floors, skinCorpus, sharedFloors)) {
      tsxProven += 1;
      continue;
    }
    const key = tsxTargetKey(row);
    if (!byKey.has(key)) {
      violations.push(
        `${row.file}: TSX interactive element WITHOUT floor proof or adjudication: <${row.element}> ${row.discriminator} [${row.interaction}]`
      );
      continue;
    }
    checkRow(row.file, key);
    tsxAdjudicated += 1;
  }

  for (const row of adjudications) {
    if (!used.has(row.key)) {
      violations.push(`stale adjudication (target no longer discovered): ${row.key}`);
    }
  }

  return {
    targets: targets.length,
    proven,
    adjudicated,
    tsxTargets: tsxTargets.length,
    tsxProven,
    tsxAdjudicated,
    byClass,
    byRelation,
    violations,
  };
}
