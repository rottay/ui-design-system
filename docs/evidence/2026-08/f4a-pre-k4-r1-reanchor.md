# R-1 — re-anclaje formal de pierna 1 post hardening pre-K4 (Codex DT)

Fecha: 2026-08-21. Repo: `/Users/daniel/Developer/Rottay/ui-design-system`.
HEAD sin mover: `9d5582dfdf1d02f1d7e8fd468720b1d829e50454`. Staged: 0.

## Puerta satisfecha

- T-1a postaudit Fable `ACCEPT`: `/private/tmp/f4a-pre-k4-t1a-fable-postaudit.md`, SHA `f5c3f1044f03261b40f271eceb1189df0e81acca856b52ba2f1403075a8cb851`.
- T-1b SOURCE_READY Sonnet: `/private/tmp/f4a-pre-k4-t1b-sonnet-source-ready.md`, SHA `1a42e6fffc22b1a7dcb1b42c12cb5adbc088de905bb0da9b79ff996fc5c66e86`.
- T-1b postaudit Fable `ACCEPT`: `/private/tmp/f4a-pre-k4-t1b-fable-postaudit.md`, SHA `df8f92c8ce08d48651596d9eaed55b2d4228bd4e04941feff4fb8fe7ed2f1ac9`.

## Expectativa declarada antes de correr

Ambos tests causales `export-missing` y `export-unshipped` deben quedar verdes; si alguno queda rojo no se bendice como baseline. Las dos corridas oficiales de `pnpm test:scripts` deben tener exactamente el mismo conjunto nominal de tests, fallas y skips. Se ejecutan serialmente bajo Node `v22.17.0`, después del postaudit T-1b, sin otra suite pesada concurrente.

## Corridas oficiales

- Run 1: `/private/tmp/f4a-r1-official-run-1.log`, SHA `9d931a1fa811b2c63bf23a3a70a0d3ef5a1e5fe3886eabe322cb461ddf19e007`.
- Run 2: `/private/tmp/f4a-r1-official-run-2.log`, SHA `e59903275b46a94b56dd2cf0709f3fb9cc22da633654c3fbe636e901c500c260`.
- Ambas: `1719 tests / 1706 pass / 12 fail / 1 skip / 0 cancelled / 0 todo`; exit 1 esperado por las 12 fallas conocidas.
- Diff de nombres completos de tests entre runs: vacío.
- Diff de nombres de fallas entre runs: vacío. Ambos listados tienen SHA `9e1d1a198c0275632964a29e904bc4077424315473ba331781be3a0f955fc6ba`.
- Diff de skips entre runs: vacío.
- `export-missing` y `export-unshipped`: ambos verdes en las dos corridas; no aparecen en fallas.

## Dos tests agregados y skip, nombrados

Comparación nominal contra la última corrida durable de 1717 (`/private/tmp/f4a-13-pierna1-mia.log`): no se removió ningún test y se agregaron exactamente dos, ambos verdes:

1. `coordinator succession fails closed`;
2. `tenant art direction creative advisor retirement fails closed`.

El único skip es:

`--modern reports the four states over the real tree and keeps them internally consistent # SKIP dist is not built; the gate imports contract values from dist`.

## Set nominal de 12 fallas aceptado como baseline operativa

1. `CK-H1 tenant-preview floors retain the exact tenant-derived identities`;
2. `CK-H1 brand-studio floors retain one live swatch and eight domain-object sites`;
3. `CK-H1 counters cannot fall below their certified identity floors`;
4. `CK-H1 migration reaches the exact 21/13/0/9 paint floors`;
5. `CK-H1 pins the post-prohibition rendered topology`;
6. `a CSS path bound by any family row resolves and still ships`;
7. `engine audit wires full runtime/fleet censuses and rejects vanished keys`;
8. `canonical CRA15 source produces deterministic structural evidence without a false completion claim`;
9. `generated public source and declarations expose only supplier-free component types`;
10. `committed fleet capability registries equal the productive app sources`;
11. `default macro roots match the governed graphics and UI taxonomy`;
12. `every scoped owner and ranked child resolves to a real directory`.

Estas fallas son la baseline operativa, no una certificación ni una renuncia a drenarlas en sus frentes gobernados. La mejora causal es estable: la carrera `export-*` ya no forma parte de la baseline.

## Ruling

R-1 queda RE-ANCLADO en `1719 / 12 / 1 skip`, con identidad nominal exacta. Esta baseline supersede el literal histórico `1717/13` para la aceptación futura de K4 y K5. Los briefs y asientos históricos no se editan. Cualquier corrida futura con un nombre agregado/removido, una falla adicional, un skip distinto o el retorno de cualquiera de los dos `export-*` es drift y debe investigarse; no se re-ancla automáticamente.

No hubo writes de source en este acto. El único write de autoridad es el asiento del DT en el roadmap canónico. Cero commit/stage/git mutante.

# VERDICT: R1_REANCHORED
