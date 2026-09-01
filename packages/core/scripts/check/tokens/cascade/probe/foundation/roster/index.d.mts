/**
 * @fileoverview The typed boundary for the fixture roster.
 *
 * `index.mjs` is the runtime; this file is the only thing a TypeScript caller
 * can see of it. It therefore has to state the roster's real shape — the fields
 * `fixtures/index.json` actually carries and the exact arguments each export accepts —
 * because a declaration that widened anything to `any` would hand the checker
 * back the same blindness the roster exists to remove. A fixture whose `targets`
 * were typed loosely would let a drift test compile while reading a field no
 * fixture declares, which is the TypeScript-side version of the lying counter
 * described in the runtime module.
 *
 * WHERE `readonly` APPEARS, AND WHY IT GOES DEEPER THAN THE FREEZE.
 * `FIXTURES`, `FIXTURE_IDS` and `KNOWN_TARGET_KEYS` are frozen at runtime, but
 * `Object.freeze` is shallow: it seals each fixture's own properties and leaves
 * the `targets` and `requiresSelectors` arrays writable. The stated contract is
 * stricter than the freeze — "a run must not mutate the roster" — so the types
 * carry the rest of it. Readonly here is a prohibition on consumers, not a claim
 * that the runtime enforces every level.
 *
 * Values that are freshly allocated per call and handed to the caller
 * (`declaredProperties`, `directControlFixtureIds`, the `missing` list from
 * `validateFixture`) are typed mutable, because they are the caller's to keep.
 *
 * @module Tooling/ResolutionProbe/Foundation/Roster
 */

/**
 * One reading site on a fixture: the element to select inside the fixture's
 * `html`, and the properties to read off it.
 */
export interface ProbeTarget {
  /** Target-local id. Unique within its fixture; pairs with the fixture id to form a target key. */
  readonly id: string;
  /** Why this target is read. Absent on the obvious `root` target of a single-target fixture. */
  readonly why?: string;
  /** Selector resolved against the fixture's rendered `html`. */
  readonly selector: string;
  /** Property names read off the selected element, in declared order. */
  readonly properties: readonly string[];
}

/**
 * An element shape plus the properties to read off it.
 *
 * A fixture that names a real component takes its shape from that component's
 * render; a `synthetic` fixture stands for no component and reads a dial
 * directly, which is why the drift suite exempts it from render coverage.
 */
export interface ProbeFixture {
  /** Roster-unique id, as named on the CLI and in bindings. */
  readonly id: string;
  /** Why this fixture is on the roster. */
  readonly why?: string;
  /** True when the fixture stands for no component. Absent means it does. */
  readonly synthetic?: boolean;
  /**
   * Selectors that must occur verbatim in the CSS about to be measured. A
   * fixture whose selectors are missing is reported `unmatched`, never
   * measured as zeros.
   */
  readonly requiresSelectors: readonly string[];
  /** The element shape, as static markup. */
  readonly html: string;
  /** Every reading site on this fixture, in declared order. */
  readonly targets: readonly ProbeTarget[];
}

/**
 * A `fixtureId/targetId` pair — the only form a binding or a causal `--bind`
 * flag may use to name a target.
 */
export type ProbeTargetKey = `${string}/${string}`;

/** The result of checking one fixture's declared selectors against real CSS. */
export interface FixtureValidation {
  /** True when every declared selector occurs verbatim in the CSS. */
  matched: boolean;
  /** The declared selectors the CSS does not contain, in declared order. */
  missing: string[];
}

/** The roster's own note: how a fixture shape is derived, and how to regenerate one. */
export const ROSTER_NOTE: string;

/** Every fixture, in declared order. Frozen: a run must not mutate the roster. */
export const FIXTURES: readonly ProbeFixture[];

/** Every fixture id, in declared order. */
export const FIXTURE_IDS: readonly string[];

/**
 * The named fixtures, in the order requested. Returns the whole roster when
 * `ids` is omitted, null, or empty.
 *
 * @throws when an id is not on the roster, naming every known id.
 */
export function getFixtures(ids?: readonly string[] | null): readonly ProbeFixture[];

/**
 * Checks a fixture's declared selectors against the CSS that will be measured.
 * Verbatim substring match, deliberately.
 */
export function validateFixture(fixture: ProbeFixture, css: string): FixtureValidation;

/** Every property the given fixtures read, deduplicated and sorted. Defaults to the whole roster. */
export function declaredProperties(fixtures?: readonly ProbeFixture[]): string[];

/** Every `fixtureId/targetId` key this roster can actually produce. */
export const KNOWN_TARGET_KEYS: readonly ProbeTargetKey[];

/**
 * Fails closed, naming every key that is not a real fixture/target pair.
 *
 * @throws when any key is absent from {@link KNOWN_TARGET_KEYS}.
 */
export function assertKnownTargetKeys(
  keys: readonly string[],
  options?: { readonly context?: string },
): void;

/**
 * Ids of the fixtures that read every one of `channels` on a single target —
 * the only fixtures eligible to prove control liveness. Empty when no channels
 * are asked for.
 */
export function directControlFixtureIds(options: {
  readonly fixtures?: readonly ProbeFixture[];
  readonly channels?: readonly string[];
}): string[];
