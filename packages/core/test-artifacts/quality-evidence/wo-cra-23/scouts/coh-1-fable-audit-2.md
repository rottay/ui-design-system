# COH-1 - Re-auditoria FABLE 5 tras remediacion DEFECTS-4 (WO-CRA-23)

**Fecha:** 2026-08-30 - **Rol:** Fable 5, auditor independiente, READ-ONLY (unico
archivo escrito: este). - **Worktree:** `/Users/daniel/Developer/Rottay/ui-design-system-coh-1`,
rama `wo-cra-23/coh-1-status-tints`, `git status` limpio antes y despues.
**Candidato completo:** `e14213be8..HEAD` = `bcccaf9ca` (implementacion, auditada en
`coh-1-fable-audit.md`) + `30d24c0a8` (docs) + `3222d4e7c` (remediacion DEFECTS-4).

**Metodo:** mismo aislamiento que la primera pasada — toda mutacion y toda sonda corrio
en una copia full-tree `/tmp/coh1-remed-audit` (= `git archive 3222d4e7c` + symlink
`node_modules`), con restauracion via `git show <sha>:<path>` tras cada mutacion; la
comparacion contra HEAD puro corrio en `/tmp/coh1-head2` (= `e14213be8`). Ni `git stash`,
ni checkout, ni un byte escrito en el worktree fuera de este informe. Los tests y gates
del worktree corrieron in situ (son read-only).

---

## VEREDICTO: ACCEPT

Los cuatro defectos estan remediados y probados con mutacion (cada valla nueva se
verifico en rojo bajo su mutante y en verde en el arbol commiteado). Ninguna regresion:
los mismos 14 rojos pre-existentes, byte-identicos por nombre contra HEAD puro; cero
movimiento en artifacts generados; gates identicos. **El lote queda listo para
integracion a main**, sujeto a las condiciones de integracion F4C ya registradas
(G.1 del informe previo, sin cambio).

---

## 1. D1 (P1) — puerta DB real: REMEDIADO y probado en vivo

**Forma de la correccion (leida del diff de `3222d4e7c`):** input HERMANO cerrado
`tenantStatusSeedAuthorship` (`TenantStatusSeedAuthorship`: record booleano
`{ base, modes.{light,dark} }` por `OnToneRole`), derivado en
`deriveTenantStatusSeedAuthorship` (`tenant-theme/index.ts:1888-1906`) del
`envelope.patch` CRUDO — post-`migrateV1`, pre-proyeccion — leyendo el VALOR
(`!== undefined`, lo que absorbe las cuatro claves fantasma que `paletteFields()`
siempre construye), nunca membership del Set. Pasado en el call site de la puerta
(`:2122-2126`). En `compileBrandTheme` (`brand-theme/index.ts:2358-2364`) y
`compileModeBlocks` (`:1999-2012`) el calculo de `toneSeedIsTenantAuthored` PREFIERE
el canal cuando esta presente y cae al texto viejo (lectura directa de `tenantPatch`)
cuando esta ausente. `tenantPostureFloors` intacta (cero hunks sobre ella; sonda
confirma que sigue proyectando solo `typography/surfaces/motion`). Es exactamente la
variante "input hermano explicito" de mi B.4.1.

**Sonda 1 reproducida** (5/5 verde, `/tmp/coh1-remed-audit`, archivo de sonda solo en
la copia):

```
compileTenantThemeConfig(rottay, { backgroundMode:"dark", status:{ success:"#7C3AED" } })
  delta base (claves success): --ds-color-success = #7C3AED
                               --ds-color-success-bg     = var(--ds-color-success-50)   <- ANTES ausente
                               --ds-color-success-border = color-mix(in srgb, var(--ds-color-success) 20%, transparent)
                               --ds-color-alpha-success-20 = color-mix(... 20%, transparent)
                               --ds-color-on-success (pre-existente, ver abajo)
doc silencioso en palette.status -> CERO canales status en base y en todos los modeDeltas
tenantPostureFloors({palette,modes}) -> keys typography,surfaces,motion; palette/modes undefined (intacta)
compileBrandTheme(tenantPatch crudo, sin sibling)      -> -bg = var(--ds-color-success-50)  (fallback dispara)
compileBrandTheme(tenantPatch = proyeccion, sin sibling) -> -bg = rgba(34, 197, 94, 0.10)   (fallback NO dispara)
```

Las dos ultimas filas prueban que el camino estatico (resolution-probe,
`ingress/index.mjs:1468`, que pasa `tenantPatch: patch` crudo y NUNCA el sibling) queda
byte-identico al comportamiento pre-D1: el fallback es el texto viejo sin cambios.
`grep` confirma que `tenantStatusSeedAuthorship` existe solo en los dos archivos de
compilador; el unico proveedor productivo es la puerta.

**Nota `--ds-color-on-success` (NO es defecto ni ensanche):** aparece en el delta base
de la sonda y no figuraba en mi matriz previa (§B.2). A/B ejecutado: con la puerta
REVERTIDA (mutante pre-D1) el delta ya trae `on-success` — proviene del loop de tinta
incondicional pre-existente (`brand-theme/index.ts:925`, hunk-free en la remediacion),
que consulta la paleta fusionada y no la autoria. Mi matriz previa lo omitio por
filtro (`--ds-color-success*`), no porque no estuviera. Cero comportamiento nuevo.

**Limitacion pre-existente que sigue en pie (fuera de COH-1, para el asiento):** en
rottay el seed del tenant no re-deriva `--ds-color-success-50` (rampa autorada, clase
Opus F.1.2); el `-bg` derivado resuelve al `-50` del baseline/foundation, no a un tinte
del seed nuevo. Ya registrado en mi informe previo (B.2, ultimo parrafo); lote hermano.

## 2. D2 (P1) — test afirmativo por la puerta: REMEDIADO y MUERDE

Nuevo bloque en `coh-1-status-tint-tenant-derivation.test.ts:251-379`: 10 tests, todos
via `compileTenantThemeConfig` (nunca `compileBrandTheme` a mano), baseline rottay (el
unico que sigue horneando literales): bloque BASE (`backgroundMode:"dark"` = default de
rottay, 5 tests: sanity seed, `-bg` afirmativo, `-border`, `alpha-20`, tonos no
contestados intactos), bloque MODE (`"light"`, 5 tests, incluida la pata `alpha-10` que
solo el overlay light de rottay hornea), y documento silente (cero bytes status en base
y modos). Suite completa: **18/18 verde** en el worktree.

**Prueba de mordida (mutacion real, no mental):** en la copia /tmp elimine las 3 lineas
del wiring de la puerta (`tenantStatusSeedAuthorship: deriveTenantStatusSeedAuthorship(...)`)
y re-corri la suite: **4 failed | 14 passed** — van a rojo exactamente los 4 asertos
afirmativos de derivacion (`-bg` base, `-border` base, `alpha-20` base, y el combinado
`-bg/-border/alpha-10/alpha-20` del bloque mode). El aserto es sobre la puerta real:
una puerta muerta ya no puede pasar esta suite. Archivo restaurado byte-exacto via
`git show` tras la prueba.

## 3. D3 (P2) — vocabulario cerrado de provenance: REMEDIADO y la valla MUERDE

- `iso/index.ts`: `CONSULTED_PROVENANCE_FIELDS` +19 entradas exactas — los 4 seeds
  (`palette.{success,warning,error,info}Color`) y las 15 hojas de
  `STATUS_SEED_SHADOWING_FIELDS` (sin `alphaInfo20`, correcto) — como literales
  duplicados con razon escrita (capa `foundation` no puede importar de
  `infrastructure/compilers`). Docblock reescrito a "exactly THREE compiler sites ...
  a fourth site cannot quietly start asking". La ley vuelve a ser cierta.
- `brand-theme/index.ts:1703-1707`: nuevo export `STATUS_SEED_FIELDS`, derivado de
  `ON_TONE_ROLES` (no hand-listed). `supplier-contract.json` +2 lineas (el export, en
  sus dos secciones); `contract` al dia.
- `provenance-acceptance.test.ts`: el cierre une TRES tablas via `THREE_SITE_UNION()`
  compartida; test mutante in-suite ("dropping one entry ... desyncs"); la valla mP6
  contamina ahora tambien `palette.status.success` y espera los 4 campos
  sobre-aproximados (con comentario que documenta la trampa presencia-de-clave).

**Corrida completa en el worktree: 24/25** — unico rojo = "case D: the bithire
DEFERRED-7" (el MISMO pre-existente de HEAD, F.1 del informe previo); cierre verde;
mutante in-suite verde; mP6 verde.

**Prueba de mordida (mutacion externa):** en la copia /tmp quite UNA entrada
(`palette.successColor`) de `CONSULTED_PROVENANCE_FIELDS` y re-corri: **4 failed | 21
passed** — se ponen rojos el cierre, el mutante in-suite Y la valla mP6 (mas el case D
pre-existente). La valla ya no es por convencion: es mecanica y detecta el
estrechamiento por cualquiera de los dos lados.

## 4. D4 (P3) — prosa: REMEDIADO en los tres puntos

- **D4a:** docblock del piso (`brand-theme/index.ts:685-700`) reescrito con el
  mecanismo correcto: `applyModeOverlay` FUSIONA la paleta, el piso SI dispara en el
  dark de evnto con el mismo seed, y lo que vacia el delta es la deduplicacion de
  `compileModeBlocks` (`baseVars[key] !== value`), no una ausencia del seed. Coincide
  con mi nota de A (D4a) palabra por palabra en sustancia.
- **D4b:** el rojo fantasma "evnto 460 vs pin 468" salio de la lista pre-existente del
  reporte (seccion E renumerada 1-4) con nota de correccion explicita que cita F.2.
- **D4c:** los 11 rojos de `rottay-t1-mass-drain` enumerados uno a uno en D.4 del
  reporte. Cotejados contra mi corrida: la lista del reporte es exactamente la lista
  real (ver §5).
- La seccion "G. Remediacion DEFECTS-4" del implementation report describe la forma de
  la correccion, la mordida verificada del test afirmativo y los gates; todo lo que
  afirma lo sostienen el diff y mis corridas.

## 5. Regresiones estructurales — NINGUNA

**Tests (worktree, in situ):**

| Suite | Resultado | vs HEAD |
|---|---|---|
| `coh-1-status-tint-floor.test.ts` | 37/37 verde (33 + 4 pins T3) | n/a (nuevo) |
| `coh-1-status-tint-tenant-derivation.test.ts` | 18/18 verde (8 + 10 D1/D2) | n/a |
| `provenance-acceptance.test.ts` | 24/25 — 1 rojo: case D DEFERRED-7 | mismo unico rojo |
| `brand-authored-residue-retirement` + `mass-c3-bithire-drain` + `modern-tenant-value-free` | verdes | -- |
| `tone-ink-authority.test.ts` | 2 rojos (bithire warning-ink, rottay info-ink) | mismos 2 |
| `rottay-t1-mass-drain.test.ts` | 539/550 — 11 rojos | HEAD puro re-corrido en `/tmp/coh1-head2`: 537/548, **los MISMOS 11 nombres de test** (tooltip-bg, textarea-border/color/count-color, popover-border/title-border, list-text light, list-secondary dark, form-extra/help, divider-text). El +2 neto de total (548→550) es la reestructura D.4 de `bcccaf9ca` (-4 filas del loop, +6 tests del bloque alpha-10), ya auditada. |

Total de rojos: **14, todos pre-existentes, misma identidad que HEAD.** Ninguno nuevo,
ninguno "reparado" fuera de alcance.

**Familia primaria intacta:** `applyTenantSeedDerivations` (`:1763`) y sus dos call
sites (`:1974` en `compileModeBlocks`, `:2332` en `compileBrandTheme`) quedan fuera de
todos los hunks del diff (verificado contra la lista `@@` completa). El fallback del
sibling reproduce el texto viejo, y las sondas 4/5 de §1 prueban que el brazo estatico
se comporta byte-igual con y sin la remediacion.

**Artifacts congelados:** `git diff bcccaf9ca..3222d4e7c` sobre
artifacts/CSS/manifests generados = **vacio**. Los unicos archivos tocados: 2 de
compilador, 1 de contrato iso, 3 tests, `supplier-contract.json` (+2, exigido por el
export D3) y los 2 documentos de evidencia. Minimo exacto.

**Gates (worktree):**

| Gate | Resultado |
|---|---|
| `manifest/generator --check` | **117** receipts stale, TODOS `F4B/` (grep sobre el log completo), ni uno mas ni uno menos que HEAD (117 en ambos arboles, F del informe previo) |
| `slot-inventory --check` | OK — 3613 filas, ledger 6/6 en su ancla |
| `tsc --noEmit` | exit 0 |
| `lint:artifacts` | exit 0, los 3 artifacts "up to date" (mismos warnings Lc pre-existentes de rampas-900 dark) |

**Codex T3 (borders evnto):** el bloque "evnto -border channels compile byte-identical
to pre-COH-1 HEAD (T3)" existe (`coh-1-status-tint-floor.test.ts:339-356`), los 4 pins
son byte-identicos a los literales de `git show e14213be8:...evnto/index.ts`
(`successBorderColor`..`infoBorderColor`, cotejados por lectura directa), y MUERDE:
mutando la formula del piso (`-border` 20%→25%) en la copia /tmp, los 4 pins van a rojo
(9 rojos totales en la suite: los 4 pins T3 mas los asertos de formula que tambien
defienden el 20%). Restaurado tras la prueba.

## 6. Residuales que viajan a la integracion (sin cambio, no bloquean)

1. Los 14 rojos pre-existentes (case D DEFERRED-7; tone-ink x2; rottay-t1 x11) — deuda
   de familias ajenas a COH-1, enumerada y byte-estable.
2. Los 117 receipts F4B stale — pre-existentes, cuenta identica a HEAD.
3. Las 3 condiciones de integracion F4C de mi informe previo (G.1): editar
   `UNDECLARED_CHANNELS_WATCHED`/`DECLARED_PARTIAL_PROPAGATION` en el mismo commit de
   integracion y re-correr el F4C focal (el testigo visual del lote sigue sin existir
   en esta rama porque el harness llego a main despues del punto de rama).
4. La rampa `-50` de rottay ciega al seed del tenant (clase Opus F.1.2) y el falso
   positivo de autoria de la familia PRIMARIA (`collectPatchAuthoredPaths` sobre claves
   fantasma) — ambos pre-existentes, documentados en B.1/B.2 del informe previo, lotes
   hermanos.

## 7. Anexo: mutaciones ejecutadas (todas en `/tmp/coh1-remed-audit`, todas restauradas)

| Mutante | Efecto esperado | Observado |
|---|---|---|
| Quitar el wiring `tenantStatusSeedAuthorship` de la puerta (`tenant-theme/index.ts:2125-2127`) | los asertos afirmativos D2 en rojo | 4 failed / 14 passed — exactamente los 4 afirmativos |
| Quitar `palette.successColor` de `CONSULTED_PROVENANCE_FIELDS` | cierre en rojo | cierre + mutante in-suite + mP6 en rojo (4 failed / 21 passed) |
| `-border` del piso 20%→25% | pins T3 en rojo | 4/4 pins T3 en rojo (9 failed / 28 passed) |
| A/B `on-success` (puerta viva vs revertida) | mismo membership en delta | identico en ambos: pre-existente, no del lote |

---

**Veredicto final: ACCEPT.** D1 vive por la puerta por la que entra un tenant real y
esta probado con mutacion; D2 es un testigo afirmativo que distingue puerta viva de
muerta; D3 devuelve la verdad a la ley del vocabulario cerrado y su valla muerde por
ambos lados; D4 deja la prosa honesta. Cero regresiones, artifacts congelados, gates
identicos a HEAD. El lote `e14213be8..3222d4e7c` queda aprobado para integracion a
main bajo las condiciones F4C de §6.3.
