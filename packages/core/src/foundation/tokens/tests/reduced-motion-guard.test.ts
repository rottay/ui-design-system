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

/* Classic and Rustic are read-only this programme, so the batch's scope is Modern plus shared.
   A rule that LEAVES this scope by relocation does not leave the guard: it is followed by a
   named row instead (RELOCATED_MOTION_ROWS, below), because the frozen file it lands in is
   not a roster member and must not be read as one. */
const IN_SCOPE = walk(CSS_ROOT)
  .filter((f) => f.includes("/engines/modern/") || f.includes("/components/"))
  .sort();

const rel = (f: string): string => f.slice(CSS_ROOT.length + 1);

/** The 23 stylesheets that carry the sentinel and are the reduced-motion OWNER of the motion
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
  "presentation/components/skin/skeleton-anatomy/index.css",
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

/** The bodies of EVERY `prefers-reduced-motion: reduce` block in the file, brace-balanced
 *  and concatenated; `null` when the file has none.
 *
 *  ALL of them, not the first. This read used to stop at the first block, which made a
 *  second one invisible: a file could guard its motion correctly and still be reported as
 *  an owner with a gap, and -- worse in the other direction -- a guard could be deleted
 *  from the second block without the roster noticing. The skeleton-anatomy skin is the
 *  worked example: its bones are guarded near the top and the table-rows mode, added
 *  later, carries its own block near the bottom. Six of its eight animating selectors were
 *  read as guarded and two as a gap, when all eight were collapsed on disk.
 *
 *  One block per section is the shape this file's authors actually write, because a guard
 *  belongs next to the motion it collapses. The instrument has to read the file the way it
 *  is written. */
function reduceBlocks(blanked: string): string | null {
  const opens = [...blanked.matchAll(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{/g)];
  if (opens.length === 0) return null;
  const bodies: string[] = [];
  for (const open of opens) {
    let i = (open.index ?? 0) + open[0].length;
    const start = i;
    for (let depth = 1; i < blanked.length && depth > 0; i += 1) {
      if (blanked[i] === "{") depth += 1;
      else if (blanked[i] === "}") depth -= 1;
    }
    bodies.push(blanked.slice(start, i - 1));
  }
  return bodies.join("\n");
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

/** The preludes of the rules inside a reduce block that PERFORM the collapse. A block may hold
 *  more than one: a file that collapses a transition and an animation under different preludes
 *  writes one rule per prelude, and naming the animation longhands on a selector that only
 *  transitions would be an absentee owner in the other direction. A rule that substitutes paint
 *  under `reduce` -- a flat fill standing in for a sweep -- collapses nothing and is deliberately
 *  not read as a guard entry, so it can neither satisfy this direction nor inflate it. */
function guardedSelectors(block: string): string[] {
  return [...block.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter((rule) => REDUCED_MOTION_TRIPLE.some((shape) => shape.test(rule[2])))
    .flatMap((rule) => splitSelectorList(rule[1]));
}

/** The shape a reduce guard must NOT take. `transition: none` / `animation: none` removes the
 *  motion rather than shortening it, so `transitionend`/`animationend` never fire and anything
 *  sequenced on those events stalls forever. The longhand triple above is the reason this is a
 *  regression and not a style preference. */
const KILLS_MOTION = /(^|[\s;])(transition|animation)\s*:\s*none/m;

/** The comment every roster file opens its guard with. It is read from the RAW source, not the
 *  blanked one: it is prose, and it is what makes roster membership self-declaring on disk. */
const SENTINEL = /Reduced motion: durations collapse but the transition still fires/;

describe("R5 motion batch -- the guarded roster is exactly the 23 motion-owning files", () => {
  it("matches the roster on disk, with no file added or dropped", () => {
    const onDisk = IN_SCOPE.filter((f) => SENTINEL.test(readFileSync(f, "utf8"))).map(rel);
    expect(onDisk).toEqual(ROSTER);
  });

  it.each(ROSTER)("%s carries a reduce guard collapsing duration without killing the event", (path) => {
    const blanked = blankComments(readFileSync(join(CSS_ROOT, path), "utf8"));
    const block = reduceBlocks(blanked);
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

    const block = reduceBlocks(blanked) ?? "";
    /* Exact ownership, both directions at once. Forward: every animating selector is collapsed,
       or the file has a real gap. Backward: the guard names NOTHING else, because a prelude entry
       with no motion behind it is an absentee owner -- the longhands are `!important`, so they
       reach the element over whatever a neighbouring stylesheet declares for it, and the file
       ends up collapsing motion it does not own. That is the shape the named rows below were
       written to forbid one family at a time; here it is enforced for the whole roster.

       An ARRAY, never a `Set`: deduplicating `guarded` would make a selector repeated inside one
       prelude -- or across two collapse rules -- indistinguishable from a selector written once,
       and the repeat is precisely the defect this direction exists to catch. `productive` is
       already a Set by construction -- one rule per selector is the CSS, not an assumption being
       smuggled in here.

       The per-family rows further down are not made redundant by this: they pin WHICH selectors
       each file owns, while this one only pins that the two sides agree. */
    const guarded = guardedSelectors(block);
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

    const block = reduceBlocks(blanked);
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

    const block = reduceBlocks(owner);
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
    expect(reduceBlocks(skin)).toBeNull();
    expect(SENTINEL.test(skinSource)).toBe(false);

    /* ...and it is motionless because its only shorthand CANCELS motion, not because the paint
       was emptied out. Without this, a deleted forced-colors block would read as success. */
    expect(skin).toMatch(/animation:\s*none/);
  });
});

/** Motion that LEFT the batch's path-shaped scope by relocation, and the guard that followed it.
 *
 *  L6 / STOP-3 moved the classic ScrollArea scrollbar paint out of
 *  `presentation/components/skin/scroll-area` -- which was a roster member, and is not one any
 *  more because it no longer animates anything -- into the engine that owns it. The destination
 *  is a FROZEN file, so `IN_SCOPE` does not reach it and must not: measured on this tree, the
 *  frozen stylesheets hold 7 files with productive motion and 6 of them carry no guard at all
 *  (the rustic button, card, input, progress and stats-grid skins, and the rustic theme). Those
 *  are real debt, but they are not this batch's and the freeze forbids this lane from fixing
 *  them, so widening the scope would only redden the sweep on work nobody here may do.
 *
 *  A roster row would be just as wrong in the other direction: the classic theme animates a
 *  large antd surface it does not guard, so declaring it a motion OWNER would claim a coverage
 *  it does not have. The row below is therefore scoped to the relocated SELECTOR, not the file:
 *  it asserts the rule still animates, and that the same file collapses exactly that selector.
 *  A guarded rule cannot become unobserved by moving house, and nothing else is claimed. */
const RELOCATED_MOTION_ROWS = [
  {
    path: "runtime/engines/classic/theme/index.css",
    from: "presentation/components/skin/scroll-area/index.css",
    selector: ".rottay-scroll-area-classic::-webkit-scrollbar-thumb",
  },
];

describe("relocated motion -- a guard follows its rule out of the batch's path scope", () => {
  it.each(RELOCATED_MOTION_ROWS)(
    "$selector still animates in $path, and that file collapses it",
    ({ path, selector }) => {
      const blanked = blankComments(readFileSync(join(CSS_ROOT, path), "utf8"));

      /* Forward: the motion is really there. Without this the guard assertion below would pass
         vacuously on a file that had quietly lost the transition in the move. */
      expect([...productiveSelectors(blanked)]).toContain(selector);

      /* And the collapse names it, in the same file, with the canonical longhand triple. */
      const block = reduceBlocks(blanked);
      expect(block).not.toBeNull();
      expect(guardedSelectors(block ?? "")).toContain(selector);
      expect(block).toMatch(reducedMotionDuration("transition-duration"));
      expect(block).not.toMatch(KILLS_MOTION);
    },
  );

  it.each(RELOCATED_MOTION_ROWS)("$from no longer animates, so it owes no guard", ({ from }) => {
    const source = readFileSync(join(CSS_ROOT, from), "utf8");
    const blanked = blankComments(source);
    /* The origin left the roster because its motion left, not because someone deleted a
       sentinel: both directions are asserted so a half-done relocation is caught. */
    expect([...productiveSelectors(blanked)]).toEqual([]);
    expect(reduceBlocks(blanked)).toBeNull();
    expect(SENTINEL.test(source)).toBe(false);
  });

  /* PLANTED. The two rows above read the tree, so they go green the moment the tree is right and
     say nothing about whether the reading would catch a tree that is wrong. These plant both
     failures on synthetic sources and prove the same helpers report them. */
  it("PLANTED: a relocated rule whose guard did not follow is caught", () => {
    const withoutGuard = `.rottay-scroll-area-classic::-webkit-scrollbar-thumb {
      background: red;
      transition: background 0.2s ease;
    }`;
    const selector = ".rottay-scroll-area-classic::-webkit-scrollbar-thumb";
    expect([...productiveSelectors(withoutGuard)]).toContain(selector);
    expect(reduceBlocks(withoutGuard)).toBeNull();

    const withGuard = `${withoutGuard}
    @media (prefers-reduced-motion: reduce) {
      ${selector} {
        transition-duration: 0.01ms !important;
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
      }
    }`;
    expect(guardedSelectors(reduceBlocks(withGuard) ?? "")).toContain(selector);
  });

  it("PLANTED: a relocation that dropped the motion on the way is caught", () => {
    /* The origin is clean and the destination never received the transition. The forward
       assertion is what bites: without it, an empty destination reads as a successful move. */
    const destinationMissingTheRule = `.rottay-scroll-area-classic::-webkit-scrollbar-thumb {
      background: red;
    }`;
    expect([...productiveSelectors(destinationMissingTheRule)]).toEqual([]);
  });
});

/** The skeleton-anatomy table-rows guard, and the two defects that hid it.
 *
 *  The reported symptom was an accessibility gap: the roster said this file animated eight
 *  selectors and collapsed six. The motion was in fact collapsed on disk the whole time --
 *  the table-rows mode carries its own reduce block, and its guard reached both variants --
 *  so nothing ever swept for a reader who asked for reduced motion. What was wrong was the
 *  SHAPE, in two independent places, and a 2x2 over (CSS, reader) shows neither fix alone
 *  is enough: HEAD's CSS stays red under either reader, and the every-block reader on
 *  HEAD's CSS turns the two missing rows into one absentee owner instead.
 *
 *    - the reader stopped at the FIRST reduce block, so the second was invisible; and
 *    - the guard named every bar under a loading row, not the two that animate, which the
 *      file's own ownership law forbids: an `!important` collapse reaching an element whose
 *      motion this file does not own is how a stylesheet ends up cancelling a neighbour's.
 *
 *  Both are covered below on synthetic sources, so the cases keep biting after the tree is
 *  right. */
describe("skeleton-anatomy table rows -- a second guard block, and a guard that named too much", () => {
  const TWO_BLOCK_SOURCE = `
    .bones[data-loading='true'] [data-part='bone'] { animation: pulse 1s infinite; }
    @media (prefers-reduced-motion: reduce) {
      .bones[data-loading='true'] [data-part='bone'] {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
      }
    }
    .rows[data-loading='true'][data-animation='pulse'] [data-part='bar'] { animation: pulse 1s infinite; }
    @media (prefers-reduced-motion: reduce) {
      .rows[data-loading='true'][data-animation='pulse'] [data-part='bar'] {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
      }
    }`;

  /** The read as it was: stops at the first block. Kept here, and nowhere else, so the
   *  regression it caused stays reproducible instead of becoming a story in a comment. */
  const firstBlockOnly = (blanked: string): string | null => {
    const open = blanked.match(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)\s*\{/);
    if (open?.index === undefined) return null;
    let i = open.index + open[0].length;
    const start = i;
    for (let depth = 1; i < blanked.length && depth > 0; i += 1) {
      if (blanked[i] === "{") depth += 1;
      else if (blanked[i] === "}") depth -= 1;
    }
    return blanked.slice(start, i - 1);
  };

  it("PLANTED: a second reduce block is read, and the superseded reader proves it was not", () => {
    const productive = [...productiveSelectors(TWO_BLOCK_SOURCE)].sort();
    expect(productive).toHaveLength(2);

    /* The defect, reproduced: the old read sees one of the two collapses. */
    expect(guardedSelectors(firstBlockOnly(TWO_BLOCK_SOURCE) ?? "").sort()).toEqual([
      ".bones[data-loading='true'] [data-part='bone']",
    ]);

    /* And the read in force sees both, so the file balances. */
    expect(guardedSelectors(reduceBlocks(TWO_BLOCK_SOURCE) ?? "").sort()).toEqual(productive);
  });

  it("PLANTED: a guard broader than its motion is still an absentee owner", () => {
    /* The exactness law is NOT relaxed by reading more blocks. A guard that collapses every
       bar under a loading row -- including bars no rule in this file animates -- reaches
       elements whose motion it does not own, and the two sides must disagree. */
    const broad = `
      .rows[data-loading='true'][data-animation='pulse'] [data-part='bar'] { animation: pulse 1s infinite; }
      @media (prefers-reduced-motion: reduce) {
        .rows[data-loading='true'] [data-part='bar'] {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
        }
      }`;
    const productive = [...productiveSelectors(broad)].sort();
    const guarded = guardedSelectors(reduceBlocks(broad) ?? "").sort();
    expect(guarded).not.toEqual(productive);
    expect(guarded.filter((s) => !productive.includes(s))).toEqual([
      ".rows[data-loading='true'] [data-part='bar']",
    ]);
  });

  it("the narrowing collapses exactly what the broad guard did, measured with a selector engine", () => {
    /* Containment, not an argument about it. Every element the superseded broad selector
       collapsed either still matches one of the two named selectors, or never animated --
       so no reader who asked for reduced motion loses a collapse by this change. */
    const BROAD = ".ds-skeleton-anatomy-rows[data-loading='true'] [data-part='skeleton-bar']";
    const NAMED = [
      ".ds-skeleton-anatomy-rows[data-loading='true'][data-animation='pulse'] [data-part='skeleton-bar']",
      ".ds-skeleton-anatomy-rows[data-loading='true'][data-animation='shimmer'] [data-part='skeleton-bar']",
    ];

    const bar = (animation: string | null): Element => {
      const row = document.createElement("div");
      row.className = "ds-skeleton-anatomy-rows";
      row.setAttribute("data-loading", "true");
      if (animation !== null) row.setAttribute("data-animation", animation);
      const cell = document.createElement("div");
      cell.setAttribute("data-part", "skeleton-bar");
      row.append(cell);
      document.body.append(row);
      return cell;
    };

    for (const animation of ["pulse", "shimmer"]) {
      const element = bar(animation);
      expect(element.matches(BROAD)).toBe(true);
      expect(NAMED.some((selector) => element.matches(selector))).toBe(true);
    }

    /* The one case the narrowing drops: a bar under a loading row with no animation chosen.
       It matched the broad guard and has nothing to collapse, which is exactly the reach the
       ownership law objects to. */
    const inert = bar(null);
    expect(inert.matches(BROAD)).toBe(true);
    expect(NAMED.some((selector) => inert.matches(selector))).toBe(false);
  });

  it("the shipped file balances, and its rows guard names both variants", () => {
    const source = readFileSync(
      join(CSS_ROOT, "presentation/components/skin/skeleton-anatomy/index.css"),
      "utf8",
    );
    const blanked = blankComments(source);
    const productive = [...productiveSelectors(blanked)].sort();
    expect(productive).toHaveLength(8);
    expect(guardedSelectors(reduceBlocks(blanked) ?? "").sort()).toEqual(productive);

    /* Two blocks, not one: the guard lives beside the motion it collapses, which is the
       shape the reader was taught to expect. */
    expect(blanked.match(/@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/g)).toHaveLength(2);
  });
});
