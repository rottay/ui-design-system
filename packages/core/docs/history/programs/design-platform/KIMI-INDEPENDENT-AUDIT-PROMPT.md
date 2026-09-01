# Kimi independent design-platform audit prompt

Copy everything below the separator into Kimi from
`/Users/daniel/Developer/Rottay`.

---

You are joining the Rottay Design Platform 10/10 as an independent senior
frontend and design-systems auditor. Other models designed and implemented the
current architecture. Your job in this run is to understand it from zero,
challenge it rigorously and propose how to raise its quality and delivery
speed.

This run is **audit and proposal only**.

Do not refactor or implement components yet. Do not edit source code, tokens,
recipes, contracts, compilers, providers, CSS, tests, stories, fixtures,
generated artifacts, package manifests, registries, ledgers or applications.
Do not install or remove dependencies. Do not commit, push, open a PR, publish,
reset, checkout, clean the dirty worktree, or alter the stash.

The only permitted repository writes are these two new documentation files:

1. `packages/core/docs/rottay-design-platform-10-10/KIMI-INDEPENDENT-DS-AUDIT-2026-07-23.md`
2. `packages/core/docs/rottay-design-platform-10-10/KIMI-PROPOSED-EXECUTION-PLAN-2026-07-23.md`

If you cannot safely write those documents, return their complete contents in
your final response. No implementation begins until the user and Codex review
your proposal and explicitly approve a subsequent implementation prompt.

## Mission

Rottay is not building a BitHire-only library. It needs a reusable
product-construction platform for many applications, first-party verticals and
customer tenants.

The desired platform must deliver:

- world-class defaults that make ordinary product composition look polished
  without application-level repair;
- deep white-label differentiation that can make identical markup resemble
  genuinely different products;
- governed tokens and recipe profiles rather than tenant-specific forks;
- reusable behavior, anatomy, accessibility, responsive logic and motion;
- static first-party themes and DB-owned customer appearance through the same
  canonical runtime;
- EN, ES and AR/RTL;
- bounded application customization without exposing DS internals;
- a modern, restrained AI-native interaction language;
- enough breadth and ergonomics to ship products quickly.

BitHire Candidates is a proving ground and visual diagnostic surface. It does
not own the shared grammar.

## Current claims to verify

Do not assume these are true merely because existing documents say so:

- 92 public primitive families;
- 14/92 certified primitives (15.2%);
- 119 total certification artifacts;
- 14/119 certified artifacts (11.8%);
- 1,615 tenant channels with 236 acknowledged dead;
- ownership ratchet of 4,074 findings;
- 89 engine-backed primitives plus CodeBlock, MarkdownView and
  VoiceInputButton;
- Classic, Modern and Rustic engines exist;
- current product delivery prioritizes Modern;
- DaisyUI 5.5.19 is confined to an internal Modern projection;
- static `BrandTheme` and DB Appearance emit the same canonical `--ds-*`
  runtime channels;
- application code cannot become another design system.

Distinguish carefully between:

- absent implementation;
- implemented but uncertified;
- sound contract with weak visual authorship;
- weak contract hidden by attractive CSS;
- stale tests or documentation;
- missing evidence;
- ownership conflict;
- app misuse;
- actual architectural flaw.

## Read completely before judging

The primary Kimi process must read these itself:

1. `/Users/daniel/Developer/Rottay/ui-design-system/CLAUDE.md`
2. `/Users/daniel/Developer/Rottay/ui-design-system/roadmap/README.md`
3. `/Users/daniel/Developer/Rottay/ui-design-system/roadmap/registry.json`
4. `/Users/daniel/Developer/Rottay/docs-engineering/engineering/design-system/runtime/engines/modern/README.md`
5. `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rottay-design-platform-10-10/README.md`
6. `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rottay-design-platform-10-10/MASTER-IMPLEMENTATION-PLAN.md`
7. `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rottay-design-platform-10-10/SUPPLIER-ARCHITECTURE.md`
8. `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rottay-design-platform-10-10/COMPONENT-LEDGER.md`
9. `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rottay-design-platform-10-10/EXECUTION-BACKLOG.md`
10. `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rottay-design-platform-10-10/CLAUDE-IMPLEMENTATION-RUNBOOK.md`
11. `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rottay-design-platform-10-10/CODEX-AUDIT-PROTOCOL.md`
12. every `CODEX-AUDIT-*.md` in that directory, chronologically;
13. `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/docs/rottay-design-platform-10-10/CLAUDE-NEXT-WAVE-PROMPT.md`.

Then inspect representative implementation from every layer:

- foundation and semantic token definitions;
- generated/compiled CSS and channel ownership;
- static `BrandTheme`, DB Appearance schemas and both compiler paths;
- recipe profiles, recipe manifest and consumption;
- tenant, locale, direction, density and recipe runtime providers;
- typography, density, surfaces, depth, borders, radii and motion;
- Modern adapters and Daisy projection confinement;
- primitive facades, contracts, engines, CSS skins, tests and stories;
- patterns, structures and surfaces;
- application boundary and BitHire Candidates consumption;
- token, tenant-channel, ownership, parity and boundary gates;
- existing Showroom/Storybook evidence.

Documentation is a hypothesis. Code and observed runtime behavior determine
whether it is true.

## Existing authority model to challenge constructively

The current intended model is:

```text
foundation values
  -> semantic intent
    -> component recipes
      -> compounds and patterns
        -> canonical surfaces
          -> application composition
            -> vertical/tenant personality
```

### Theme sources

- Rottay, BitHire and other code-owned verticals use typed static
  `BrandTheme`.
- Customer tenants such as The Management use validated DB Appearance.
- Both should compile before first paint to canonical `--ds-*` channels.
- Hostname selects identity, not an application CSS fork.
- Components should never fetch tenant data or branch by tenant name.

### Three customization levels

1. **DS platform:** foundation, semantic intent, recipes, anatomy, states,
   accessibility, responsive behavior and premium defaults.
2. **Vertical/tenant:** bounded personality through static or DB-owned tokens
   and recipes, without behavior or markup forks.
3. **Application:** product hierarchy, workflow, responsive information
   priority and domain compounds through public props, slots and documented
   hooks, without repairing primitives.

Audit whether this is actually implemented, whether it is understandable to
developers and whether it can make tenants differ in typography, geometry,
border strategy, depth, density, icon treatment and motion—not only color.

If you recommend changing the model, explain:

- the concrete defect;
- the proposed replacement;
- migration cost;
- white-label impact;
- application API impact;
- how to avoid a second token authority;
- why the benefit outweighs the disruption.

Do not propose a rewrite simply because another library is familiar.

## Supplier and engine questions

Audit critically:

- whether keeping Classic, Modern and Rustic still creates value;
- whether focusing delivery on Modern is correct;
- whether DaisyUI is helping, leaking or merely adding indirection;
- whether Daisy can remain an internal replaceable projection;
- whether Tailwind, Mantine, Ant, Base UI, React Aria or another supplier would
  solve a proven capability gap;
- whether a supplier would improve behavior only or also visual quality;
- how public Rottay contracts remain supplier-neutral;
- bundle, SSR, hydration, accessibility, maintenance and replacement cost.

Do not install anything. For every suggested dependency provide a decision
memo with alternatives and a clear adopt/reject/bake-off recommendation.
“It looks nicer” is not sufficient.

## Required independent audit

Write a candid report. Do not protect previous models or agree for politeness.

### 1. Score current state and attainable ceiling

Use a 1–10 score for both current quality and realistic attainable quality:

- foundation token architecture;
- semantic-token completeness;
- static `BrandTheme`;
- DB Appearance and validation;
- static-vs-DB equivalence;
- recipe/profile architecture;
- typography;
- density;
- color and emphasis;
- surface/depth grammar;
- border/radius/segmentation grammar;
- icon system and optical alignment;
- motion and transitions;
- responsive/container behavior;
- accessibility and input-modality parity;
- i18n and RTL;
- primitive contract quality;
- primitive default visual quality;
- patterns and structures;
- canonical surfaces;
- application boundary;
- white-label differentiation;
- automated gates;
- deterministic visual evidence;
- developer ergonomics;
- speed of creating a new product.

For each category include evidence, root cause, highest-leverage improvement
and implementation difficulty.

### 2. Review everything previously done

Explain:

- what OLA 1–5 got right;
- what should be frozen;
- what is overengineered;
- what remains too crude visually;
- what is an architecture improvement without visible value yet;
- what claims are unsupported;
- what moved complexity instead of removing it;
- what should be simplified;
- what should eventually be deleted;
- whether the accepted 14 primitives still deserve their status;
- why progress reached only 14/92 and whether the certification process itself
  is too slow.

Do not modify accepted status. Flag disagreements for Codex.

### 3. Produce a complete 92-family census

For every primitive include:

- ID and name;
- public/canonical owner;
- engines;
- ledger state;
- contract completeness;
- accessibility/behavior risk;
- visual-craft risk;
- token and recipe coverage;
- white-label differentiation potential;
- EN/ES/AR/RTL status;
- mobile and coarse-pointer status;
- motion/reduced-motion status;
- ownership conflict or reconstruction;
- test/evidence quality;
- recommended priority and macro-wave;
- estimated work size;
- immediate certification, repair, redesign, merge or defer recommendation.

### 4. Rank the real reasons screens look crude

Evaluate and rank:

- weak token values;
- insufficient semantic vocabulary;
- recipe axes not reaching CSS;
- primitive anatomy;
- excessive rectangular uniformity;
- flat or inconsistent surfaces;
- weak typography hierarchy;
- border/radius inconsistency;
- icon geometry;
- motion/state gaps;
- supplier projection leakage;
- weak pattern/surface composition;
- hardcoded app chrome;
- lack of deterministic visual review.

Do not answer “all.” Produce a ranked causal chain and state which layer owns
each fix.

### 5. Audit white-label capability

Using identical markup, compare conceptually and—if runtime inspection is
available—visually:

- BitHire static theme;
- The Management DB theme;
- technical radius-zero/high-density fixture;
- soft editorial/rounded/spacious fixture.

Assess typography, geometry, borders, surfaces, depth, density, icon
containers, motion tenor, dark mode, mobile and RTL. Identify axes that exist
but are not consumed and axes that do not exist.

### 6. Audit corrected OLA 5 authority

Verify rather than rewrite:

- structural `--ds-density-scale`, global semantic
  `--ds-density-mode-factor` and nested local `data-density` are independent;
- root density derives from Appearance, not structural scale;
- root metadata does not double-apply density;
- nested density scope affects only its subtree;
- Arabic-safe fallback is the final base/heading/display compiler invariant;
- implicit Modern Text remains stable;
- semantic motion has typed recipes and reduced-motion final states;
- `SemanticSurface` and surface roles are the public surface vocabulary;
- canonical density attributes are non-paint;
- DataTable mobile anatomy and specificity fixes work.

State whether F2 is truly closed. The currently missing proof is a same-tree
matrix of static/DB × compact/comfortable/spacious × EN/ES/AR with compiler,
CSS, DOM, JS and observed geometry agreement.

## Visual and frontend-quality audit

If you have browser control, inspect existing Storybook/Showroom and BitHire
Candidates. Keep tabs/processes bounded and close unused pages. Record exact
URLs and viewports.

Judge:

- hierarchy, type measure and contrast;
- alignment and grid;
- borders at corners/intersections;
- radius consistency;
- section and header segmentation;
- surface nesting and elevation;
- icon optics;
- pills/badges;
- tooltips/popovers/overlays;
- hover/focus/press/disabled/loading/error;
- transition continuity;
- mobile adaptation;
- long content and RTL;
- empty-space balance;
- overlapping or clipped content;
- whether tenant differences go beyond palette.

Specific quality constraints:

- no generic colored left rails;
- no raw emoji as functional icons;
- no hardcoded tenant colors;
- no tiny grey text used as fake hierarchy;
- no huge empty cards;
- no unintentional flat sea of boxes;
- no browser-default-looking tooltip or overlay;
- no app-local primitive repair;
- no decorative animation that harms comprehension.

Your visual findings are advisory. Codex will perform the final sighted audit.

## Read-only verification

You may run read-only searches and existing checks. Do not run generators,
formatters with writes, autofixers or migration scripts.

Run expensive commands strictly one at a time. Never run concurrent builds,
typechecks or aggregate suites. Record exact commands, duration and result.

At minimum, if the environment permits:

1. inspect package and workspace status;
2. run focused existing contracts relevant to disputed findings;
3. run `pnpm --filter @rottay/design-system typecheck`;
4. run `pnpm --filter @rottay/design-system pretest`;
5. run `git diff --check`.

If a command would mutate generated files, do not run it; report why.

## Proposed acceleration plan

In the second document, propose the fastest safe route from 14/92 to a
meaningful majority without lowering quality.

Our current hypothesis is:

- one audit/onboarding phase;
- four primitive implementation macro-waves;
- up to four non-overlapping implementation lanes per macro-wave;
- shared foundation changed and frozen before family lanes;
- one coordinator owns barrels, generated artifacts and serial gates;
- Pass 1 contract review and Pass 2 adversarial visual review use different
  criteria/reviewers;
- Codex audits visual evidence and alone certifies.

Challenge the number of waves and grouping. Produce your recommended version.

For each proposed macro-wave include:

- exact primitive families;
- parallel lane ownership;
- shared prerequisites;
- estimated candidate certifications;
- projected primitive percentage if Codex accepts all;
- projected overall 119-artifact percentage;
- patterns/surfaces unlocked;
- primary regression risks;
- evidence matrix;
- serial integration order;
- stop/rollback criteria.

### Candidate K1 grouping to critique

Do not implement this list. Evaluate and improve it.

**Lane A — identity and compact chrome**

- Avatar, Badge, Tag, Link, Kbd;
- supporting Icon/IconButton behavior only where a canonical owner exists.

**Lane B — text and boolean controls**

- Input, Textarea, FormField, Checkbox, Radio, Switch, Toggle.

**Lane C — selection/date/value controls**

- Select, AutoComplete, DatePicker, TimePicker, InputNumber, Slider, Upload.

**Lane D — feedback/readiness**

- Alert, Callout, Message, Progress, Skeleton, Spinner, Empty, Result.

This proposes approximately 27 public families. Determine whether:

- ownership is truly disjoint;
- shared dependencies are ready;
- the tranche is too large or too small;
- any family should move;
- any accepted primitive must be reopened;
- the expected certification gain is realistic;
- a different grouping would yield more visible and reusable value.

Then propose K2–K4 to cover every remaining primitive. Separately propose the
minimum pattern, surface, AI-grammar and Candidates canary waves needed after
primitive normalization.

## Required final response

Return:

1. executive verdict;
2. five most important architectural findings;
3. five largest visual-quality causes;
4. what prior work should be retained;
5. what prior work should be revised;
6. current/ceiling scorecard;
7. summary of the 92-family census;
8. white-label/i18n assessment;
9. supplier/engine recommendation;
10. proposed number and composition of macro-waves;
11. expected percentage progression;
12. exact proposal for the next implementation tranche;
13. open questions requiring user/Codex approval;
14. paths to both written documents;
15. commands run;
16. confirmation that no implementation, dependency, ledger, registry,
    generated-artifact, commit, push, PR or publish change was made.

Do not begin refactoring. End by explicitly requesting approval for a separate
implementation prompt based on the reconciled plan.
