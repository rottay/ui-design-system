# Owner decision packet — 2026-10-15

Provenance: the owner's prompt of 2026-10-15 answering the DT packets
`owner-decision-p88-vs-2-19-37.md` (release strategy) and `owner-decision-suspense-variant.md`
(Suspense Phase B variant), both under `.tmp/ds-kimi-2026-10-14/`. Registered by the release-4.0
reconciliation lot. **Text status: confirmed by the DT against the owner's verbatim prompt**
(`.tmp/ds-kimi-2026-10-14/owner-prompt-2026-10-15.txt`, saved 2026-10-15 ~13:05 NY). Rulings 1
and 2 quote the owner's binding clauses verbatim (Spanish, in quotation marks). Ruling 5's
acceptance clauses were completed from the verbatim text after the lot delivered. Elsewhere the
bodies are summaries; where a summary and the verbatim prompt differ, the verbatim prompt governs.
Labels marked "(DT packet)" come from the DT's decision packets
(`owner-decision-p88-vs-2-19-37.md`, `owner-decision-suspense-variant.md`) and the DT's ceremony
briefs. They are not owner text.

These resolutions do NOT mark any WO done. They do not pre-approve an implementation and do not
authorize app edits, WIP removal or any criteria cut. Each execution follows the standing ceremony:
a writer, independent review, focal tests per lot, and the integrator's commit.

## 1 — P-88 ships as a MAJOR (option (a) of the release packet)
The next publish is a major. P-88 is a legitimate breaking change, not a 2.x patch. The strips
integrated under the P-88 source law stay as they are: no compat-revert lots (option (b), DT
packet) and no exemption by measured consumption (option (c), DT packet). Owner text: "No
restaurar temporalmente todos los canales retirados solamente para poder publicar un patch.
Corregir la clasificación de los changesets afectados y las notas que confunden “inert en HEAD”
con “inert en el paquete instalado”." WO-RET-07 remains the receiver where the inert caller
props leave the types; its timing follows the open version question below.

**Binding limits (owner, verbatim): "La versión major no autoriza cualquier eliminación:"**
- "No retirar campos necesarios para admitir documentos persistidos sin su migración segura."
- "No borrar capacidades útiles por bajar contadores."
- "No cerrar WO-RET-07 si sus obligaciones reales siguen pendientes."
- "No intervenir en apps para hacer pasar el cierre del DS."

**Provenance first (owner, verbatim):** "Reconciliar primero la procedencia de 2.19.37 frente a
2.19.36 en fuente: versión, commit, artefacto e integridad. No inventar una historia de release ni
sobrescribir versiones existentes." The reconciliation state is under "Before any publish" below.

**Express overlap exception.** `docs/releasing.md` ("Deprecation policy", step 2) requires at
least one minor of overlap before a removal. That requirement is waived for exactly two classes:
the identified P-88 breaks and the sync-SSR break (ruling 6). They ship directly in the major
together with an exact inventory, a migration guide, the replacements and reviewed evidence. The
exception does NOT generalize to any other deprecation or retirement.

Inventory requirement: every P-88 behavior change since the published 2.19.37 is named in a
`major` changeset with its per-family break against 2.19.37. Release-reconciliation lot of
2026-10-15: `.changeset/arc12-*`, `e8b-*`, `w25-p88-*`, and the guide
`packages/core/docs/consumer-contract/migration/p88-caller-anatomy/index.md`.

Open for the owner (registered by the lot, not decided here): the version arithmetic. The
pending set already holds the unpublished `major-canonical-tree.md` ("3.0.0 — the canonical-tree
release"), and `changeset version` from 2.19.36 or 2.19.37 computes **3.0.0**. "4.0" in this
ruling therefore names the next major release. Whether that release is numbered 3.0.0 or the
3.0 line is skipped to 4.0.0 is not resolved. The same question touches the deprecations ledger
(`removeIn: "4.0"`) and WO-RET-07's "4.0 major line".

## 2 — Freeze ceremony: row by row
Owner text: "Con la decisión de major, podés continuar la ceremonia preparada, pero sólo fila por
fila:"
- "excepción escrita,"
- "bytes actuales revisados,"
- "motivo exacto,"
- "prueba aplicable,"
- "autorización por la puerta oficial."

"No reponer ciegamente las trece autorizaciones anteriores ni hacer un re-pin global. Verificar las
filas restantes con la adjudicación del contrato publicado."

**"Un freeze verde acredita autorización de fuente, no compatibilidad de publicación."**

Ceremony mechanics (DT ceremony brief, not owner text): each row is applied through the door with
`--check` after it (the count drops by exactly one). Each row's reason names ruling 1 as the
release vehicle for the published-contract break the freeze-row9 adjudication established for that
row's hunk(s). Rows 7 (classic Tag) and 10 (classic Button) (DT packet numbering) carry the
adjudication's verdicts; no compat lot is owed, because the break ships in the major.

## 3 — Suspense Phase B: GO on the corrected arm-y
GO for implementation and validation (NOT final acceptance) of the corrected arm-y (A1-H with an
implementation-identity re-arm; "A1-H" is a DT packet label). Constraints:
- Targeted warming uses supported mechanisms only. No React internals.
- Warm only what the server rendered, through an explicit server-to-client signal that respects
  request, tenant and pack isolation, and keep lazy loading everywhere else.
- A failed warm must never block the page.
- The probes become real tests. P1/P1c (DT packet labels) become factory tests that pin
  no-over-rearm.

## 4 — The bar ruling, corrected
- Reveal elimination is recorded separately, as a causal finding (mutant C2) on the measured
  surfaces.
- The strict bar (`toBe(0)` on 450/450; the denominator is the DT packet's) is NOT passed by any arm with reds. No red becomes green
  through narrative reclassification, rate aggregation across conditions, a CLS-threshold
  comparison or a "separate residual". p = 0.73 is not evidence of equivalence.
- No WO closes on this evidence while it requires the strict test.
- The rate-attribution experiment is authorized: hypothesis and criterion fixed in advance, one
  run, every result preserved.

## 5 — Joint validation: clicks + Q2
The DS-owned ancestor boundaries and the warming design are validated jointly. The matrix covers:
- small and heavy regions;
- cold and warm caches;
- throttled CPU and a controlled slow network;
- clicks on DS controls and on warm siblings;
- native listeners and default actions;
- SSR failures and regional isolation.

Instruments count attempted events and handled events separately. A handled click is never counted
as lost. Acceptance law (owner's exact clauses): the new architecture must not widen the
interaction loss versus HEAD; a regression to full-page failure is not accepted as a silent
solution; the reveal must not be hidden behind a global fallback or by delaying all first paint.
"Documenting the lost clicks" is not an accepted default fallback, and the solution is not handed
off to the apps.

## 6 — Legacy sync SSR is a documented major break
Under arm-y, `renderToString` / `renderToStaticMarkup` over a cold lazy family raises React's own
error instead of silently rendering the empty fallback. It ships as a documented contract change
in the major, under ruling 1's exception. It is delivered with a `major` changeset, the factory
fiche, the consumer census (the app test files that use `renderToStaticMarkup` are reported, never
edited), the shared test helper and the negative that pins the behavior.

## Publish and push authorizations
- **Push:** a normal push of reviewed DS commits is authorized when needed. Never force.
- **Prerelease:** owner text: "usar prerelease 4.0 con tag explícito no estable, sin mover latest
  ni actualizar aplicaciones". It is authorized for validation; the number follows the open version
  question in ruling 1. It
  never moves `latest` and never updates an application. The registry currently reads
  `latest = 2.19.37`.
- **Registry access, measured 2026-10-15 by this lot:** `npm view @rottay/design-system` against
  `https://npm.pkg.github.com` answered (no E401). The E401 blocker recorded earlier does not
  reproduce from this machine's credentials. Publishing itself was not attempted.
- **Before any publish:** reconcile the version line. The registry has 2.19.37 (published
  2026-08-10T03:52:51Z by `davila23`, no `gitHead`, integrity `sha512-FUAskmZj...`, shasum
  `164181ba0a47543310dae36708a90162396cd8a4`, the same integrity in all three app lockfiles).
  `packages/core/package.json` reads 2.19.36 and no commit carries 2.19.37.
- **Provenance of 2.19.37 (reconstruction, release-reconciliation lot):** most likely built from
  the main tree at `a7d72bcf0` (2026-08-09 21:37), whose markers ship in the dist, and before
  `6da1cfebe` (23:12), whose markers do not. It was published by hand with an uncommitted version
  bump. Whether that tree also carried uncommitted edits cannot be determined from local
  evidence: no build stamp ships and no `gitHead` was recorded. Evidence:
  `.tmp/ds-kimi-2026-10-14/release-40-reconciliation/report.txt` section 1.
- **CHANGELOG gap:** `packages/core/CHANGELOG.md` stops at 2.19.34; 2.19.35, 2.19.36 and
  2.19.37 have no entry. Before any publish, add an honest entry or gap note for them (for
  2.19.37: published from the `a7d72bcf0`-era tree, no changeset record). Do not invent content
  or overwrite an existing version.
