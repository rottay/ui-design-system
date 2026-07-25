# Codex audit — OLA 3 / DS-Q001L

Date: 2026-07-23
Auditor: Codex
Scope: Claude handoff “OLA 3 — Codex decide aceptación”
Repository state: dirty worktree preserved; no commit, push, PR or stash mutation

## Verdict

- **DS-Q001L inspection harness: accepted after Codex remediation and sighted
  browser review.**
- **OLA 3 as a whole: only Phase 1 is accepted.** Phases 2–4 were not started,
  so DS-A004 semantic material, the exact Modern/Daisy bridge and the
  application-boundary ratchet remain open.
- The DS-S001 nucleus accepted in OLA 2 remains accepted and was not rebuilt
  as a parallel architecture.
- Certified program counts remain **14/92 (15.2%)** and **14/119 (11.8%)**.
  The harness certifies platform infrastructure; it does not certify another
  public component family.

## Material inaccuracies and defects found

1. The three reported Playwright failures were primarily harness defects:
   recipe-owned decorative indicators were counted as product DOM, the
   selected-row selector did not match the public DataTable anatomy and the
   reduced-motion assertion expected literal zero instead of the governed
   `0.01ms` floor.
2. The four `SurfacesLongTailBatch` failures were not harmless pre-existing
   noise. Surface code attempted to overwrite primitive-owned `data-part`
   anatomy on `Text`, producing invalid contracts and selectors that could not
   reliably match.
3. `SurfaceSectionCard` declarations are emitted and publicly reachable after
   the sanctioned core build. The handoff warning about total `.d.ts` absence
   was stale.
4. The original DB fixture used obsolete flat `general` keys and hid the
   invalid object behind a type cast. It therefore did not faithfully exercise
   the current customer-tenant Appearance contract.
5. Sighted browser inspection found a defect absent from the original test:
   the editorial tenant canvas was light while Tabs still inherited a dark
   recipe tray, creating illegible inactive labels.
6. The last finding also confirms that DS-A004 is still real work. Until the
   governed material projection covers every semantic role, some advanced
   component materials need explicit DB `--ds-*` overrides.

## Codex remediation

- corrected DOM parity to exclude only recipe-owned decoration while retaining
  semantic anatomy parity;
- corrected loading, selected and empty-state assertions to the actual public
  DataTable contract;
- aligned reduced-motion evidence with the system's non-zero browser floor;
- removed invalid attempts to rename primitive `data-part` anatomy from
  surfaces;
- moved surface-specific styling hooks to BEM classes and real primitive root
  anatomy across SectionCard and the affected long-tail surfaces;
- repaired and strengthened the six long-tail surface contract tests;
- converted the editorial customer fixture to the current nested Appearance
  contract for palette, typography, shape, density, motion and surfaces;
- replaced the unsafe Appearance cast with a compile-time `satisfies` check;
- added governed DB token overrides for the remaining Tabs material channels
  so the visual fixture is readable without application CSS or tenant-name
  branching;
- added a token-only specimen canvas so both governed sources have explicit,
  testable foreground/background contracts;
- corrected Spanish fixture accents and preserved EN, ES and AR/RTL coverage.

## Technical evidence

| Gate | Result |
| --- | ---: |
| DS-Q001L Playwright matrix | **15/15 pass** |
| `SurfacesLongTailBatch.contract` | **6/6 pass** |
| Recipe/profile focused suite | pass |
| Core TypeScript typecheck | pass |
| Showroom TypeScript typecheck | pass |
| `engine-token-audit --check` | pass |
| Ownership/pattern gate | pass, 4,074/4,074 baseline unchanged |
| Supplier contract gate | pass |
| CSS source gate | pass |
| Core production build | pass |
| CRA declaration gate | pass, 8 entries / 70 declarations |
| Showroom production build | pass, 302 static pages |
| `git diff --check` | pass |
| Baselines widened | none |
| Dependencies added or removed | none |

The final Playwright matrix proves:

- one semantic tree under a static technical `BrandTheme` and a DB editorial
  `Appearance`;
- opposing Button, Card, Tabs, Tag, SectionCard and DataTable recipes;
- readable governed canvas colors for both sources;
- semantic DOM parity;
- EN, ES and AR/RTL long-content behavior;
- dense Arabic mobile behavior at 393×852;
- no horizontal overflow in the declared matrix;
- editorial touch target floor;
- visible keyboard focus;
- disabled, loading, selected and empty states;
- reduced-motion duration collapse.

## Sighted browser evidence

Codex inspected the production showroom in the in-app browser, using one tab:

- technical static, Spanish, keyboard-focus state on desktop;
- editorial DB, English on desktop;
- editorial DB, Arabic/RTL, dense content at 393×852.

Accepted invariants:

- the technical profile is square, ruled, dense and typographically distinct;
- the editorial profile is rounded, warm, spacious and visibly distinct
  without changing component markup;
- text remains readable after the Tabs material correction;
- Arabic direction, ordering and wrapping are coherent;
- mobile controls and DataTable cards remain inside the viewport;
- there are no colored left rails, text collisions or application-owned
  repairs in the specimen.

This is acceptance of the deterministic architecture harness, not a claim that
these deliberately adversarial fixtures are the final visual language for a
product.

## Remaining work

1. **Phase 2 / DS-A004:** make all 119 semantic-material channels observable
   through public material roles, or delete channels with no coherent owner.
   The temporary explicit Tabs overrides in the editorial fixture are direct
   evidence of the missing systemic projection; Phase 2 must make equivalent
   personality changes automatic.
2. **Phase 3:** make the exact installed Daisy projection executable and
   supplier-neutral. Daisy remains an implementation detail, not a theme
   authority.
3. **Phase 4:** add the cross-repository application-boundary ratchet and
   migrate only the smallest BitHire Candidates canary slice required to prove
   the public contracts.
4. Do not start DS-S002 and do not install React Aria, Base UI or another
   styling framework in the next wave.

The next implementation prompt must begin at Phase 2. It must not spend another
wave rebuilding or self-redesigning the accepted DS-S001/DS-Q001L foundation.
