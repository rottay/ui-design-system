# ERRATA — d6-2c-ii-red-attribution (coordinator, 2026-09-15, audit d6-main-2026-09-15)

Corrections to the figures in this directory, verified by Codex against the recovered raw logs
(now preserved in `logs/`). The group reports stand as written by the executor; this errata owns
the numeric corrections.

1. **compiler group base total.** `compiler.md` says "42/42 títulos rojos en las dos ramas". The
   recovered base run `logs/compiler-head.log` records **73 failures**, not 42. Exact-identity
   comparison: all 42 candidate failures occur in the base log; 31 base-only (missing dist/export
   artifacts and additional old-artifact assertions). "All 42 are inherited" remains supported;
   "42/42 red in both branches" was not the actual run total, and equality of the two test
   environments must not be inferred.
2. **mine group.** `mine-now.log` 19 failures vs `mine-head.log` 18; exact overlap 18, one
   candidate-only (the torture-tenant fixtures through the real bithire envelope — the only
   lot-caused red in that group, as reported).
3. **"Zero product files touched" was too broad.** The consolidated report's claim holds for the
   five delegated groups, but the lot as a whole includes the adapter-matrix correction integrated
   as `170a41a5a` — a scoped, disclosed production DECLARATION change with no intended emitted-byte
   change. Stated correctly everywhere else in this directory; the blanket phrasing is retired.
4. **171 -> 5 is a mixed outcome, not 166 repaired product defects.** The 171 closes combine
   corrected fixtures, true production fixes, retired obsolete assertions, and explicit pins
   asserting currently-bad/inert behavior (contrast debt and reach gaps that stay OPEN in
   WO-DER-06/WO-EVI-02). The final-74 focused rerun (`logs/final-74.log`: 1478 pass / 5 fail)
   predates the coordinator's roster-fix and N1; it is not a current full-suite result and must
   not be promoted to one.
5. **A/B attribution (~100 inherited / ~71 lot-caused) is approximate**, assembled per-group
   against a temporary `git archive HEAD` tree; there is no single durable 171-row A/B table with
   immutable base/candidate digests. The recovered raw logs preserved here are the durable record
   behind the per-group claims.
