# Baseline And Root Causes

## Baseline Scores

- visible Rotate / Modern quality: `5.2/10`
- premium feel: `4.8/10`
- shell / layout ownership: `4.4/10`
- dashboard control room: `4.6/10`
- user workspace / data UX: `5.4/10`
- tenancy / customization architecture: `~5.8/10`
- guardrails and truthfulness: `5.4/10`
- cross-app coherence: `4.9/10`

## Root Causes

1. The product is visually under-directed.
   The current language leans on subtle grids, glossy slabs, faint borders, and small labels instead of hierarchy, contrast, rhythm, and restraint.

2. The shell has no single owner.
   The DS supplies primitives and some structures, but `app-platform` still owns sidebar geometry, content insets, topbar behavior, and route-level spacing math.

3. The dashboard is overcomposed.
   Too many blocks compete at the same weight, so the control room feels like many panels instead of a single operating surface with clear priorities.

4. The data workspace is capable but visually cheap.
   The table, toolbar, filters, and row actions feel functionally rich but weakly prioritized and too gray.

5. The tenant story is still hybrid at the app boundary.
   `TENANT_MODEL.md` is stronger than the live admin authoring and DB adapter story in `app-platform`.

6. Guardrails catch wiring drift better than product-quality drift.
   Current tests prove providers and compilers; they do not strongly protect shell ownership, canonical token fidelity, or premium UX quality.

## What The Screenshots Confirm

- the dashboard has too many equal-weight surfaces above the fold
- the top chrome is too quiet to feel like a flagship shell
- the user workspace reads as a dark spreadsheet instead of a premium operational tool
- typography and material separation are too restrained for the amount of information shown

