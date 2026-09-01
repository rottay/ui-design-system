/** Pins the R5 motion batch: the exact roster of files that own a reduced-motion guard, the
 *  guard's causal shape on each one, and the fact that no in-scope stylesheet animates
 *  unguarded. The roster tracks where motion IS, so a guard that moves to the file declaring
 *  the motion moves the roster row with it. */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const CSS_ROOT = join(__dirname, "../css");

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith(".css")) acc.push(full);
  }
  return acc;
}

/** Comments are blanked, not deleted, so a commented-out `transition:` or the word
 *  "prefers-reduced-motion" in prose can never satisfy a check. */
const blankComments = (css: string): string =>
  css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));

const norm = (s: string): string => s.replace(/\s+/g, " ").trim();

/* Classic and Rustic are read-only this programme, so the batch's scope is Modern plus shared. */
const IN_SCOPE = walk(CSS_ROOT)
  .filter((f) => f.includes("/engines/modern/") || f.includes("/components/"))
  .sort();

const rel = (f: string): string => f.slice(CSS_ROOT.length + 1);

/** The 22 stylesheets that carry the sentinel and are the reduced-motion OWNER of the motion
 *  they declare. This is a current-state roster, not a record of what was once unguarded: a file
 *  belongs here because it both animates something and collapses it, so membership follows the
 *  motion. `record-facts` is the worked example — the collapse used to sit in the modern skin
 *  while the shimmer was declared in the shared one, so it moved to the shared file and the
 *  modern skin left the roster. The modern skin is not a gap: it animates nothing at all, and
 *  its only `animation:` is the forced-colors cancel. */
const ROSTER = [
  "presentation/components/arc/index.css",
  "presentation/components/card/index.css",
  "presentation/components/icon-frame/index.css",
  "presentation/components/meter/index.css",
  "presentation/components/skin/code-block/index.css",
  "presentation/components/skin/collection-workspace-render-dispatch/index.css",
  "presentation/components/skin/guided-draft-form/index.css",
  "presentation/components/skin/image-compounds/index.css",
  "presentation/components/skin/markdown-view/index.css",
  "presentation/components/skin/record-facts/index.css",
  "presentation/components/skin/record-workbench/index.css",
  "presentation/components/skin/scroll-area/index.css",
  "runtime/engines/modern/framework-bridge/index.css",
  "runtime/engines/modern/skin/collapse/index.css",
  "runtime/engines/modern/skin/command-palette/index.css",
  "runtime/engines/modern/skin/environment-toggle/index.css",
  "runtime/engines/modern/skin/locale-switcher/index.css",
  "runtime/engines/modern/skin/pattern-map-view/index.css",
  "runtime/engines/modern/skin/result/index.css",
  "runtime/engines/modern/skin/shortcuts-overlay/index.css",
  "runtime/engines/modern/skin/skeleton/index.css",
  "runtime/engines/modern/skin/user-profile-card/index.css",
];

/** Commas inside `:is()` / `:where()` separate arguments, not selectors, so the split is
 *  paren-depth aware. */
function splitSelectorList(list: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let buf = "";
  for (const ch of list) {
    if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;
    if (ch === "," && depth === 0) {
      parts.push(norm(buf));
      buf = "";
    } else buf += ch;
  }
  if (norm(buf) !== "") parts.push(norm(buf));
  return parts.filter((p) => p !== "");
}

/** A `transition:`/`animation:` shorthand and its value, up to the declaration's end. */
const MOTION_SHORTHAND = /(^|[\s;])(transition|animation)\s*:([^;]*)/gm;

/** A shorthand whose WHOLE value is `none` cancels motion, it does not declare any: a loading
 *  early-return, a forced-colors reset, or a guard someone wrote the wrong way. Counting it as
 *  productive would demand a reduce guard over a rule that has nothing left to collapse. */
const CANCELS_MOTION = /^none(\s*!important)?$/;

/** Selectors carrying a `transition:`/`animation:` shorthand with a real value; keyframe stops
 *  and at-rule preludes are not selectors. A prelude of `A, B` animates both, so it is split
 *  like the guard's list. */
function productiveSelectors(blanked: string): Set<string> {
  const out = new Set<string>();
  for (const rule of blanked.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = rule[1].trim();
    const animates = [...rule[2].matchAll(MOTION_SHORTHAND)].some(
      (decl) => !CANCELS_MOTION.test(norm(decl[3])),
    );
    if (!animates) continue;
    if (selector === "" || selector.startsWith("@") || selector.includes("%")) continue;
    for (const one of splitSelectorList(selector)) out.add(one);
  }
  return out;
}

/** Body of the first `prefers-reduced-motion: reduce` block, brace-balanced. */
function reduceBlock(blanked: string): string | null {
  const open = blanked.match(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{/);
  if (open?.index === undefined) return null;
  let i = open.index + open[0].length;
  const start = i;
  for (let depth = 1; i < blanked.length && depth > 0; i += 1) {
    if (blanked[i] === "{") depth += 1;
    else if (blanked[i] === "}") depth -= 1;
  }
  return blanked.slice(start, i - 1);
}

/** The conventional near-zero a reduce guard collapses to. Held once, here, so the roster's
 *  assertion still bites on the CSS canon without this file restating a motion timing. */
const REDUCED_MOTION_NEAR_ZERO = "0.01ms";

/** Composes the duration assertion from that value. The dot is escaped, so the near-zero stays
 *  a literal instead of a wildcard that would also accept `0x01ms`. */
const reducedMotionDuration = (property: "transition-duration" | "animation-duration"): RegExp =>
  new RegExp(`${property}:\\s*${REDUCED_MOTION_NEAR_ZERO.replace(/\./g, "\\.")}\\s*!important`);

/** The canonical collapse: both durations to the near-zero, and a repeat pinned to one so an
 *  infinite loop cannot survive as a near-zero flicker. LONGHANDS, so whatever else the
 *  shorthand named -- easing, delay, property list, fill mode -- is left standing. */
const REDUCED_MOTION_TRIPLE: readonly RegExp[] = [
  reducedMotionDuration("transition-duration"),
  reducedMotionDuration("animation-duration"),
  /animation-iteration-count:\s*1\s*!important/,
];

/** The shape a reduce guard must NOT take. `transition: none` / `animation: none` removes the
 *  motion rather than shortening it, so `transitionend`/`animationend` never fire and anything
 *  sequenced on those events stalls forever. The longhand triple above is the reason this is a
 *  regression and not a style preference. */
const KILLS_MOTION = /(^|[\s;])(transition|animation)\s*:\s*none/m;

/** The comment every roster file opens its guard with. It is read from the RAW source, not the
 *  blanked one: it is prose, and it is what makes roster membership self-declaring on disk. */
const SENTINEL = /Reduced motion: durations collapse but the transition still fires/;

describe("R5 motion batch -- the guarded roster is exactly the 22 motion-owning files", () => {
  it("matches the roster on disk, with no file added or dropped", () => {
    const onDisk = IN_SCOPE.filter((f) => SENTINEL.test(readFileSync(f, "utf8"))).map(rel);
    expect(onDisk).toEqual(ROSTER);
  });

  it.each(ROSTER)("%s carries a reduce guard collapsing duration without killing the event", (path) => {
    const blanked = blankComments(readFileSync(join(CSS_ROOT, path), "utf8"));
    const block = reduceBlock(blanked);
    expect(block).not.toBeNull();
    /* Near-zero, not `none`: transitionend/animationend still fire, so no state machine stalls. */
    expect(block).toMatch(reducedMotionDuration("transition-duration"));
    expect(block).toMatch(reducedMotionDuration("animation-duration"));
    expect(block).toMatch(/animation-iteration-count:\s*1\s*!important/);
    /* And the collapse is the ONLY thing in the block: a `transition: none` / `animation: none`
       sitting beside the longhands would win by shorthand order and re-kill the event, so the
       shape assertion has to bite in the negative direction too. */
    expect(block).not.toMatch(KILLS_MOTION);
  });

  it.each(ROSTER)("%s guards exactly what it animates, in both directions", (path) => {
    const blanked = blankComments(readFileSync(join(CSS_ROOT, path), "utf8"));
    const productive = productiveSelectors(blanked);
    /* A guard over nothing passes the shape check vacuously, so every roster file must animate
       something REAL. `productive.size > 0` is the honest probe: a file-level `transition|
       animation:` match would also be satisfied by a lone cancel, which is motion being removed,
       not declared. The roster once contained exactly one such file -- the modern record-facts
       skin, whose only shorthand is the forced-colors cancel -- and it left the roster with its
       motion, so the weaker probe is no longer needed to keep this green. */
    expect(productive.size).toBeGreaterThan(0);

    const block = reduceBlock(blanked) ?? "";
    /* Exact ownership, both directions at once. Forward: every animating selector is collapsed,
       or the file has a real gap. Backward: the guard names NOTHING else, because a prelude entry
       with no motion behind it is an absentee owner -- the longhands are `!important`, so they
       reach the element over whatever a neighbouring stylesheet declares for it, and the file
       ends up collapsing motion it does not own. That is the shape the named rows below were
       written to forbid one family at a time; here it is enforced for the whole roster.

       An ARRAY, never a `Set`: deduplicating `guarded` would make a selector repeated inside one
       prelude indistinguishable from a selector written once, and the repeat is precisely the
       defect this direction exists to catch. `productive` is already a Set by construction -- one
       rule per selector is the CSS, not an assumption being smuggled in here.

       The per-family rows further down are not made redundant by this: they pin WHICH selectors
       each file owns, while this one only pins that the two sides agree. */
    const guarded = splitSelectorList(block.slice(0, block.indexOf("{")));
    expect(guarded.sort()).toEqual([...productive].sort());
  });
});

describe("R5 motion batch -- nothing in scope animates unguarded", () => {
  /* Both members of this sweep ask about PRODUCTIVE motion, the same measure the roster's own
     anti-vacuity check uses. A file whose only shorthand is `animation: none` has nothing left
     to collapse, so demanding a guard from it would be a false finding, and counting it towards
     the floor would inflate the denominator with a file that does not move. */
  it("leaves no in-scope stylesheet animating without a guard", () => {
    const unguarded = IN_SCOPE.filter((f) => {
      const blanked = blankComments(readFileSync(f, "utf8"));
      return productiveSelectors(blanked).size > 0 && !/prefers-reduced-motion/.test(blanked);
    }).map(rel);
    expect(unguarded).toEqual([]);
  });

  it("still sees motion declared across the scope, so the sweep is not measuring an empty set", () => {
    const moving = IN_SCOPE.filter(
      (f) => productiveSelectors(blankComments(readFileSync(f, "utf8"))).size > 0,
    );
    expect(moving.length).toBeGreaterThanOrEqual(ROSTER.length);
  });
});

/** The EditHeader/FormHeader hero is painted from THREE files, so its reduced-motion contract is
 *  the one place a split paint can silently lose a guard: the shared file owns the back chip's
 *  transition (both families at once), and each family file owns its own root's enter animation.
 *  Each row is `file -> the selectors that file is the motion owner of`; the assertions below
 *  read it in both directions, so a guard can neither miss its own selector nor reach across
 *  into a neighbour's. */
const HEADER_HERO_MOTION_OWNERS = [
  {
    path: "presentation/components/skin/header-hero-shared/index.css",
    selectors: [
      ".ds-structure.ds-edit-header [data-part='back-button']",
      ".ds-structure.ds-form-header [data-part='back-button']",
    ],
  },
  {
    path: "presentation/components/skin/edit-header/index.css",
    selectors: [".ds-structure.ds-edit-header[data-part='root']"],
  },
  {
    path: "presentation/components/skin/form-header/index.css",
    selectors: [".ds-structure.ds-form-header[data-part='root']"],
  },
];

describe("header hero -- three files, one guard per declared motion, no selector guarded twice", () => {
  it.each(HEADER_HERO_MOTION_OWNERS)("$path guards exactly what it animates", ({ path, selectors }) => {
    const blanked = blankComments(readFileSync(join(CSS_ROOT, path), "utf8"));
    const expected = [...selectors].sort();

    /* Exact, not superset: a rule that starts animating here must be added to the row (and
       guarded) rather than riding along unguarded. */
    expect([...productiveSelectors(blanked)].sort()).toEqual(expected);

    const block = reduceBlock(blanked);
    expect(block).not.toBeNull();

    /* Exact in the other direction: guarding a neighbour's selector would make two files own
       one collapse, which is how the shared paint lost its guard in the first place. */
    const prelude = (block ?? "").slice(0, (block ?? "").indexOf("{"));
    expect(splitSelectorList(prelude).sort()).toEqual(expected);

    for (const shape of REDUCED_MOTION_TRIPLE) expect(block).toMatch(shape);
    expect(block).not.toMatch(KILLS_MOTION);
  });
});

/** RecordFacts is painted from two files and only ONE of them moves. The shimmer is declared in
 *  the shared skin, which every engine renders, so the collapse belongs there: a guard in the
 *  modern skin would have been an absentee owner, collapsing a selector it does not animate and
 *  leaving classic and rustic sweeping under `reduce`. This pins both halves of that split — the
 *  owner guards exactly its own sweep, and the modern skin stays a legitimate non-member. */
const RECORD_FACTS_MOTION_OWNER = "presentation/components/skin/record-facts/index.css";
const RECORD_FACTS_MODERN_SKIN = "runtime/engines/modern/skin/record-facts/index.css";
const RECORD_FACTS_SWEEP = ".ds-pattern-record-facts .ds-record-facts__skeleton-line::after";

describe("record-facts -- the shimmer is guarded by the file that declares it", () => {
  it("collapses the shared sweep for every engine and leaves the modern skin motionless", () => {
    const ownerSource = readFileSync(join(CSS_ROOT, RECORD_FACTS_MOTION_OWNER), "utf8");
    const owner = blankComments(ownerSource);

    /* Exact, not superset: a second animating rule here must join the guard rather than ride
       along on a prelude written for the sweep alone. */
    expect([...productiveSelectors(owner)]).toEqual([RECORD_FACTS_SWEEP]);

    const block = reduceBlock(owner);
    expect(block).not.toBeNull();

    /* Exact in the other direction too. The prelude is deliberately the base selector ONLY: the
       file's RTL rule re-points `animation-name` and nothing else, and the element it paints
       still matches the base selector, so naming it again would be a second owner for one
       collapse -- the very shape the header-hero rows above exist to forbid. */
    const prelude = (block ?? "").slice(0, (block ?? "").indexOf("{"));
    expect(splitSelectorList(prelude)).toEqual([RECORD_FACTS_SWEEP]);

    for (const shape of REDUCED_MOTION_TRIPLE) expect(block).toMatch(shape);
    /* The guard this replaced was `animation: none`, so the negative is the point of the row. */
    expect(block).not.toMatch(KILLS_MOTION);

    /* The RTL sweep still exists and still travels the other way. Were it deleted, the prelude
       above would be trivially exact and this row would stop proving anything. */
    expect(owner).toMatch(/animation-name:\s*ds-record-facts-shimmer-rtl/);

    const skinSource = readFileSync(join(CSS_ROOT, RECORD_FACTS_MODERN_SKIN), "utf8");
    const skin = blankComments(skinSource);

    /* The modern skin animates nothing, so it owes no guard and carries no sentinel. */
    expect([...productiveSelectors(skin)]).toEqual([]);
    expect(reduceBlock(skin)).toBeNull();
    expect(SENTINEL.test(skinSource)).toBe(false);

    /* ...and it is motionless because its only shorthand CANCELS motion, not because the paint
       was emptied out. Without this, a deleted forced-colors block would read as success. */
    expect(skin).toMatch(/animation:\s*none/);
  });
});
