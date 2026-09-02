# COH-1 - Auditoria independiente FABLE 5 (WO-CRA-23)

**Fecha:** 2026-08-30 - **Rol:** Fable 5, auditor independiente, READ-ONLY (unico
archivo escrito: este). - **Worktree:** `/Users/daniel/Developer/Rottay/ui-design-system-coh-1`,
rama `wo-cra-23/coh-1-status-tints`. - **Commit auditado:** `bcccaf9ca` sobre
`e14213be8` (el commit `30d24c0a8` posterior es solo docs, 13 lineas en
`docs/reference/tokens/README.md`; leido, consistente, no altera este veredicto).

**Autoridad seguida:** `coh-1-opus-formula-review.md` (repo principal). Insumos:
`coh-1-implementation-report.md`, `coh-1-sonnet-prep.md`, `git diff e14213be8..bcccaf9ca`
(46 archivos), los dos tests nuevos, y ejecucion propia de tests, gates y sondas.

**Metodo de aislamiento:** para toda comparacion contra HEAD puro y para toda sonda
que exigiera un archivo nuevo, use copias full-tree en `/tmp` materializadas con
`git archive <sha> | tar -x` + symlink de `node_modules` (`/tmp/coh1-head-audit` =
`e14213be8`, `/tmp/coh1-lot-audit` = `bcccaf9ca`). Ni `git stash`, ni `git checkout`,
ni un solo byte escrito en el worktree fuera de este informe. `git status` limpio
antes y despues.

---

## VEREDICTO: DEFECTS-4

| # | Sev | Que | Donde |
|---|---|---|---|
| D1 | **P1** | La Parte 2 (`applyTenantStatusSeedDerivations`) esta MUERTA en la puerta DB productiva: el guard 1 lee `tenantPatch.palette` / `tenantPatch.modes`, pero `compileTenantThemeConfig` pasa `tenantPostureFloors(envelope.patch)`, una proyeccion que solo lleva `typography/surfaces/motion`. Todo tono queda `toneSeedIsTenantAuthored=false` en todo bloque. Probado en vivo. | `tenant-theme/index.ts:1838-1858, :2024, :2073`; `brand-theme/index.ts:1822, :1969-1976, :2285-2289` |
| D2 | **P1** (misma raiz, distinto artefacto) | La suite T2 no puede distinguir una puerta viva de una muerta: el test "guard 1 mechanism" construye `tenantPatch` a mano y salta la puerta; el test de puerta DB afirma solo AUSENCIAS (`toBeUndefined`) que son ciertas con la funcion inerte. Cero aserto afirmativo del canal `-bg` por la puerta real sobre un baseline que hornea. | `coh-1-status-tint-tenant-derivation.test.ts:108-114, :122-150` |
| D3 | **P2** | Tercer sitio de provenance fuera del vocabulario cerrado: `applyTenantStatusSeedDerivations` consulta 15 campos via `isTenantAuthoredField` que NO estan en `CONSULTED_PROVENANCE_FIELDS`; la ley escrita ("read at exactly two compiler sites... a third site cannot quietly start asking") queda falsa y el cierre ejecutable no lo detecta porque solo une las dos tablas viejas. La valla mP6 no cubre ni los 15 campos ni los 4 seeds. Hoy inerte por D1; se vuelve viva al remediar D1. | `iso/index.ts:1093-1109`; `provenance-acceptance.test.ts:979-987`; `brand-theme/index.ts:1834-1838` |
| D4 | P3 | Prosa: (a) el docblock del piso afirma que el overlay dark de evnto "never declares successColor, so the guard already excludes it" -- mecanicamente falso: `applyModeOverlay` fusiona la paleta (`:1575`), el piso SI dispara en dark y el delta lo deduplica; resultado identico, explicacion incorrecta. (b) El reporte declara como pre-existente un rojo fantasma (#2, "evnto 460 vs pin 468") que NO existe en HEAD puro. (c) Los 11 rojos pre-existentes de `rottay-t1-mass-drain` ("the common lowering emits every migrated channel") no se enumeran en D.2/D.4 del reporte, que presenta el archivo como corregido. | `brand-theme/index.ts:680-688`; reporte E.2, D.4 |

Todo lo demas -- la formula (A), los retiros (C), la gobernanza (D), los pines
actualizados (E), la pre-existencia de #1/#3/#4/#5 (F) y el desvio F4C (G.1) --
esta CONFORME y verificado con evidencia abajo. D1+D2+D3 se remedian juntos en un
mismo delta (estimado: ~30 lineas de compilador + 1 test afirmativo + 19 entradas
de vocabulario); tras eso, ACCEPT.

---

## A. Fidelidad a la formula adjudicada -- CONFORME

Fuente: `packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts`.

| Requisito de Opus | Implementacion | Evidencia |
|---|---|---|
| `-bg = var(--ds-color-{tone}-50)` | `vars[\`${channel}-bg\`] = \`var(${channel}-50)\`` | `:691-706`; artifact `bithire/index.css:368` (`--ds-color-success-bg: var(--ds-color-success-50)`) |
| `-border = color-mix(in srgb, var(--ds-color-{tone}) 20%, transparent)` | literal identico | `:700`; `bithire/index.css:369` |
| alphas ancladas al SEED (`var(--ds-color-{tone})`), no al `-500` | `color-mix(in srgb, var(${channel}) 10%/20%, transparent)` con `channel = --ds-color-${role}` | `:697-703`; `bithire/index.css:262-268` |
| `--ds-color-alpha-info-20` NUNCA emitido | `if (role !== "info")` | `:702`; `grep -c alpha-info-20` = 0 en los 3 artifacts y en `styles/*.css`; `STATUS_SEED_SHADOWING_FIELDS` tiene 15 entradas, sin `alpha-info-20` (`:1663-1680`) |
| `--ds-color-info-ink` intacto | no aparece en `derivedChannels` ni en el piso | `capabilities/index.ts:866-868` (comentario "stays EXCLUDED"); `tone-ink-authority` con los mismos 7/9 que HEAD |
| `default.css` NO tocado | ausente del `git diff --stat` | T4 pinea `:197-203` y `:252-259` byte a byte (`coh-1-status-tint-floor.test.ts`, bloque "foundation :root is untouched"), verde |
| `SEED_SHADOWING_FIELDS` NO extendido; tabla hermana | el diff no toca la tabla primaria; `STATUS_SEED_SHADOWING_FIELDS` nueva | `:1663`; cierre `SEED_FAMILY` de `provenance-acceptance.test.ts:120,213-215` sigue verde |
| Guard "solo si el bloque lleva el seed del tono" | `if (!palette[\`${role}Color\`]) continue` sobre `bt.palette` del bloque | `:695`; merge en `:925`, inmediatamente antes de `setExtendedPaletteVariables` (`:926`), mismo slot que `deriveExtendedPaletteFloor` (`:921`) |
| precedencia por canal (authored gana) | el piso se mergea antes del techo | test "an authored literal still outranks the floor, per channel not per family", verde |

Nota sobre el guard (D4a): `applyModeOverlay` hace `palette: mergeModeOverlay(bt.palette,
overlay.palette)` (`:1575`), asi que la paleta del bloque dark SIEMPRE lleva el seed del
base cuando el overlay no lo restate. El piso dispara en dark y emite la misma cadena
que light; `compileModeBlocks` solo restate claves cuyo valor difiere, asi que el
delta dark queda limpio. Es exactamente el cero-delta que Opus tabulo en A.5 y lo
confirma el artifact (`evnto/index.css` pierde las 4 lineas `-bg` del bloque dark:
`:532-566` del diff). El comportamiento es correcto; el docblock `:680-688` explica
la razon equivocada ("that overlay simply never declares successColor"). El defecto
de la rampa ciega al modo de evnto dark (Opus F.1.2) persiste sin cambio, como se
esperaba.

Contraste T5 verificado por el test desde el compilado (`>= 4.5`), verde.

## B. Mecanismo de provenance -- DEFECTO P1 (D1) + P1 (D2)

### B.1 El diagnostico de Sonnet es correcto

- `migrate-v1/index.ts:402-423`: `paletteFields()` construye SIEMPRE las claves
  `primaryColor ... successColor, warningColor, errorColor, infoColor`, con valor
  `undefined` si el documento no las trae.
- `iso/index.ts:1075-1088`: `collectPatchAuthoredPaths` enumera keypaths por presencia
  de clave (documentado como "over-approximation"), no por valor.
- El propio arbol ya documenta este falso positivo para la familia PRIMARIA:
  `src/tooling/resolution-probe/runtime/ingress/index.mjs:1390-1402` ("ten seed fields
  are all `undefined`, which `collectPatchAuthoredPaths` collects as ten AUTHORED
  keypaths including `palette.primaryColor` ... 24 of the 36 receipted DB-arm compiles
  change value that way").
- Lo reproduje en vivo contra `dist` del worktree: documento DB con solo
  `general.palette.backgroundMode` sobre bithire produce un delta de 6 claves con
  `--ds-color-border-focus = #3A6FB0` (y 7 claves con `#FFFFFF` sobre rottay) sin que
  ningun tenant haya autorado `primaryColor`. **Pre-existente, familia primaria,
  intacta por COH-1.** Queda para el DT como deuda de la familia primaria, no de este lote.

Leer el valor crudo del patch en vez del Set es, en principio, la correccion adecuada
(el `!== undefined` absorbe las claves fantasma que `paletteFields` fabrica) y NO toca
la familia primaria: `applyTenantSeedDerivations` (`:1738-1762`) no cambia; los dos
call sites primarios (`:1949-1957`, `:2262-2271`) no cambian;
`provenance-acceptance.test.ts` tiene exactamente el mismo unico rojo que en HEAD.

### B.2 Pero el patch crudo NUNCA llega por la puerta productiva (D1)

`compileTenantThemeConfig` (`tenant-theme/index.ts:2013-2075`) construye
`tenantFloors = tenantPostureFloors(envelope.patch)` (`:2024`) y pasa
`tenantPatch: tenantFloors` (`:2073`). `tenantPostureFloors` (`:1838-1858`) devuelve
**exactamente** `{ typography, surfaces, motion }` -- sin `palette`, sin `modes`. Su
propio comentario en el call site lo dice: "the projection reads six named posture
keypaths and nothing else".

Consecuencia: en `brand-theme/index.ts:2285-2289` (bloque base) y `:1969-1976` (bloques
de modo), `tenantPatch?.palette?.[...]` y `tenantPatch?.modes?.[mode]?.palette?.[...]`
son `undefined` para todo tenant DB, `toneSeedIsTenantAuthored[role] === false` para
los cuatro tonos, y `applyTenantStatusSeedDerivations` retorna en `:1822` sin tocar un
byte. El unico camino que SI lleva un patch con paleta es el brazo estatico del
resolution-probe (`ingress/index.mjs:1468`, `tenantPatch: patch`), que no es produccion.

**Prueba en vivo** (copia aislada de `bcccaf9ca`, vitest, archivo de sonda anadido
solo en la copia; contenido reproducido al final de este informe):

```
compileTenantThemeConfig(doc, rottay), doc = { general.palette: { backgroundMode:"dark", status:{ success:"#7C3AED" } } }
  base delta  = { --ds-color-success: "#7C3AED" }             <- solo el seed
  (rottay hornea --ds-color-success-bg: rgba(34,197,94,0.10) en :3546 y NO aparece re-derivado)

compileBrandTheme(rottayBrandTheme, tenantPatch = { palette:{ successColor:"#7C3AED" } }, authored = {palette.successColor})
  --ds-color-success-bg     = var(--ds-color-success-50)      <- DISPARA (patch crudo)
compileBrandTheme(rottayBrandTheme, tenantPatch = tenantPostureFloors({ palette:{ successColor:"#7C3AED" } }), mismo authored)
  --ds-color-success-bg     = rgba(34, 197, 94, 0.10)         <- NO dispara (proyeccion)
tenantPostureFloors({palette:{successColor}, modes:{light:{palette:{successColor}}}}) -> keys: typography,surfaces,motion; palette: undefined; modes: undefined
```

Matriz completa por la puerta DB (`status.success = #7C3AED`), solo claves de la
familia success en el delta:

| vertical / backgroundMode | base | modo |
|---|---|---|
| rottay light | `{}` | light: `{ --ds-color-success }` |
| rottay dark | `{ --ds-color-success }` | light: `{ --ds-color-success: #16A34A }` |
| bithire light | `{ --ds-color-success, --ds-color-success-50: #F7F6FF }` | dark: `{ success: #5ca6cf, -50: #0d1b29 }` |
| bithire dark | `{}` | dark: `{ --ds-color-success }` |
| evnto light | `{ --ds-color-success, -50: #FCFBFF }` | dark: `{ -50: #F5FFF6 }` |
| evnto dark | `{}` | dark: `{ --ds-color-success }` |

Ningun `-bg`/`-border`/alpha aparece jamas. Para bithire light y evnto light eso es
CORRECTO y esperado (los literales se retiraron; el piso emite la misma cadena en
baseline y tenant, y el pixel se mueve por `-50`). Para **rottay (ambos modos,
`rottay/index.ts:395,400` y `:3546-3547`) y bithire dark (`bithire/index.ts:339,344`)**,
que siguen horneando literales, el tenant queda con el pozo verde/azul del vertical:
es literalmente el defecto de white-label que la adjudicacion B.iii / C.4 declaro
cerrado y que el reporte C.5 afirma "verificado". No lo esta por la puerta real.

Limitacion adicional que aflora (pre-existente, fuera de COH-1, para el asiento): en
rottay el seed del tenant tampoco re-deriva `--ds-color-success-50` (rottay autora
sus pasos de rampa como alphas literales; el delta no trae `-50`). Aun con la puerta
arreglada, el `-bg` de un tenant en rottay resolveria al `-50` verde autorado. Es la
misma clase que Opus F.1.2 (rampa autorada que pisa la derivacion); lote hermano.

### B.3 La suite no puede verlo (D2)

`coh-1-status-tint-tenant-derivation.test.ts`:
- `:108-114` ("carry no delta bytes"): afirma `toBeUndefined()` para `-bg`, `-border`,
  alpha-10/20 en el delta de bithire. Es verdadero tanto si la funcion dispara como si
  esta muerta, porque bithire ya no hornea nada.
- `:122-150` ("guard 1 mechanism"): compila con `compileBrandTheme` y un `tenantPatch`
  construido a mano. Verifica el mecanismo, no la puerta. El docblock del archivo lo
  reconoce ("bypassing only the DB-document intake layer that has nothing to test
  yet") -- pero SI habia algo que testear: rottay hornea.

Un solo aserto afirmativo habria cazado D1: `compileFor(rottay, {backgroundMode:"dark",
status:{success}})` => `variables["--ds-color-success-bg"] === "var(--ds-color-success-50)"`.
Hoy devuelve `undefined`.

### B.4 Remediacion recomendada (decision del DT)

1. Hacer viajar la autoria de seeds de estado por la puerta: extender la proyeccion
   (`tenantPostureFloors` o un input hermano explicito, p. ej. `tenantSeedAuthorship`)
   con `palette.{success,warning,error,info}Color` y
   `modes.{light,dark}.palette.{...}Color` leidos del `envelope.patch` crudo. Como
   `paletteFields` deja `undefined` lo no autorado, la lectura `!== undefined` ya es
   correcta. `mergeBrandThemeFloors` es inocuo para paleta (`resolved` ya la lleva).
2. Test afirmativo por la puerta DB sobre rottay (baseline que hornea): `-bg`, `-border`
   y las alphas del tono contestado deben aparecer en el delta con la formula; los
   otros tres tonos ausentes; documento silente => delta sin estado (ya existe).
3. D3 en el mismo delta (ver G.2).

## C. Retiros -- CONFORME, tabla C del reporte sostenida por diff y artifacts

| Reclamo | Diff | Artifact |
|---|---|---|
| bithire light: 8 literales retirados | `bithire/index.ts` hunk `@@ -3453,22 +3453,20`: salen `successBgColor/BorderColor`, `warning*`, `error*`, `info*` (8) | `artifacts/bithire/index.css` diff: 8 lineas `-bg/-border` pasan a formula (`:295-296, :308-309, :368-369, :388-389`) + 7 alphas nuevas (`:262-268`) |
| bithire input chrome | hunk `@@ -6748,12 +6746,21`: `successBorder "#2F8B68"` -> `var(--ds-color-success)`; `successBg` -> `color-mix(... var(--ds-color-success) 4%, #FFFFFF)`; `@domicile` re-anotado `derived` | `bithire/index.css:620-621` |
| bithire dark intacto | ningun hunk en la region `:334-394` | ningun hunk en el bloque dark del artifact |
| evnto light: 4 bg + 4 border | hunk `@@ -1857,22 +1857,21` (4 `*BgColor`) y `@@ -1894,26 +1893,10` (4 `*BorderColor`) | 4 `-bg` a `var(-50)` (`:136, :149, :206, :226`); las 4 lineas `-border` son CONTEXTO del diff (byte-identicas: T3 cero-delta demostrado); +7 alphas (`:104-110`) |
| evnto dark intacto en fuente | ningun hunk en `:200-232` | el bloque dark del artifact pierde 4 lineas `-bg` (`:532-566`) porque ahora son identicas al base -- valor efectivo identico, es la deduplicacion del delta, no un cambio |
| rottay intacto | `rottay/index.ts` no esta en el diff | `artifacts/rottay/index.css`: exactamente +4 (`alpha-{error,info,success,warning}-10` en el bloque dark, `:322, :324, :330, :332`), los 2 deltas minimos y 2 cero-delta que Opus enumero en A.5 |
| `alpha-info-20` | -- | 0 ocurrencias en 8 archivos |

Valores de la tabla C.1/C.2/C.3 del reporte cotejados contra `git show e14213be8:`
(antes) y el artifact del worktree (despues): coinciden. Linea prístina
`bithire/index.ts:3456` en HEAD = `successColor: "#327CA8"` (el worktree nacio limpio;
la contaminacion F4C fase D que Opus §0 denuncio estaba en el repo principal, no aqui).

## D. Gobernanza -- CONFORME

- `capabilities/index.ts`: `derivedChannels` +15 (`:942-960`), comentario de exclusion
  reescrito (`:855-868`), `compat` actualizado. 68 -> 83.
- Manifest regenerado, no editado a mano: `palette.status-seeds.json`
  `declaredOutputs.channels` = 83 y `calibration.channels` = 83 (contados con node);
  `semanticOwner.registryDigest` = `94497930e7b9...` == `shasum -a 256
  capabilities/index.ts` (verificado igual). Los otros 19 controles mueven solo el
  digest (2 lineas cada uno), como corresponde a un sha del archivo completo.
- `slot-inventory.baseline.json`: `rows` 3629->3613 (-16), `unassignedRows` 297->286
  (-11), `rowsWithoutRootAttribution` 1443->1437 (-6), los tres con razon escrita que
  nombra los 16 slots. `node scripts/tokens/slot-inventory/index.mjs --check` =>
  `OK -- 3613 filas, ledger 6/6 en su ancla`.
- `supplier-contract.json`: +2 exports (`STATUS_SEED_SHADOWING_FIELDS`,
  `deriveStatusTintFloor`); `contract:check` => up to date.
- `hooks-manifest.json`: `compilerEmissionPatterns` 12->14, 4 `-bg` salen de component
  tokens; `hooks:check` => "published contract is current".
- `lint:artifacts` => exit 0, los 3 artifacts al dia. `structure:check` => 0 findings.
  `tsc --noEmit` => exit 0.
- `manifest/generator/index.mjs --check`: 117 receipts F4B con digest stale en el
  worktree Y 117 en la copia de HEAD puro. Pre-existente, cuenta identica (el reporte
  E.5 dice que sus ediciones stalean "MAS receipts"; la cuenta no cambia).

## E. Tests -- CONFORME salvo D2

Re-corridos en el worktree (`npx vitest run`, 8 archivos): 836 tests, **822 verde, 14
rojos en 3 archivos**. Los 14 son byte-identicos (mismo nombre, mismo aserto, mismo
valor) en la copia de HEAD puro: **todos pre-existentes**.

| Archivo | Worktree | HEAD puro |
|---|---|---|
| `coh-1-status-tint-floor.test.ts` | 33/33 verde | n/a (nuevo) |
| `coh-1-status-tint-tenant-derivation.test.ts` | 8/8 verde (pero ver D2) | n/a |
| `brand-authored-residue-retirement.test.ts` | verde | -- |
| `modern-tenant-value-free.test.ts` | verde | -- |
| `mass-c3-bithire-drain.test.ts` | verde | -- |
| `provenance-acceptance.test.ts` | 1 rojo (case D DEFERRED-7) | mismo 1 rojo |
| `tone-ink-authority.test.ts` | 2 rojos (bithire warning-ink `#191919` vs `#171717`; rottay info-ink `#60A5FA` vs `#3B82F6`) | mismos 2 |
| `rottay-t1-mass-drain.test.ts` | 11 rojos ("the common lowering emits every migrated channel": tooltip-bg, textarea-*, popover-*, list-*, form-*, divider-text) | mismos 11 |

Lectores del blast radius de Opus D.4 no cubiertos por el barrido de Sonnet:
`src/ui/primitives/display/Badge/tests` (10 archivos) + `Heatmaps.correctness.test.tsx`
=> 126/126 verde.

Pines actualizados, revisados uno a uno: cada cambio lleva justificacion escrita y es
minimo.
- `brand-authored-residue-retirement.test.ts:1064` y `:1087`: `#f0fdf4` ->
  `var(--ds-color-success-50)` (razon: retiro del literal). `:1092-1118`: "evnto dark
  adds exactly the 3 signed reset pins" -- explica el mecanismo de deduplicacion del
  delta; correcto (verificado en el artifact). `B29`/`E25` re-firmados con razon (8/29 y
  4/25 canales cambian por diseno). `R35` rottay intacto.
- `provenance-acceptance.test.ts:477-509`: 1192->1196, 1229->1236, 468->475 con
  aritmetica escrita. Verificada contra los diffs de artifact: rottay +4 (solo dark
  alpha-10), bithire +7, evnto +7 alphas nuevas; los 8/8 canales retirados ya eran
  claves explicitas. Cuadra.
- `rottay-t1-mass-drain.test.ts:2175-2196, :2462-2539`: 4 filas dark alpha-10 salen del
  loop generico y entran a un bloque propio que afirma la formula desde `EMITTED` y
  prueba cero-delta (success/warning) vs delta (error/info) parseando el seed. Minimo
  y justificado.
- `modern-tenant-value-free.test.ts:238-244`: 3 entradas del allowlist retiradas con
  razon (ningun BrandTheme reclama ya esos hex; el test "no stale entry" lo exige).

## F. Hallazgos pre-existentes declarados (seccion E del reporte)

| # | Reclamo | Verificacion |
|---|---|---|
| 1 | case D DEFERRED-7 `--ds-button-primary-bg` | **CONFIRMADO pre-existente**: rojo identico en la copia de `e14213be8`. Causa plausible: `git show e14213be8:...bithire/index.ts` muestra `chrome.controls.buttonPrimary.bg: "var(--ds-color-primary)"` en el bloque `:6222+` (la misma cadena que derivaria la familia primaria, luego no entra al delta). |
| 2 | "keeps the shipped first-party variable counts", evnto 460 vs 468 | **NO REPRODUCIDO**: ese test esta VERDE en HEAD puro y verde en el worktree con el pin 475. Reclamo fantasma (D4b), probablemente de un estado intermedio del arbol de Sonnet. |
| 3 | tone-ink 2 filas | **CONFIRMADO pre-existente**: mismos 2 asertos, mismos valores, leyendo `styles/{bithire,rottay}.css` commiteados en HEAD. |
| 4 | `f4c-canary-capture.mjs` ausente | **CONFIRMADO**: `git ls-files | grep f4c-canary-capture` = 0 en la rama; existe en main desde `23426a0e1`, posterior a `e14213be8` (ancestro confirmado con `merge-base --is-ancestor`). |
| 5 | receipts F4B stale | **CONFIRMADO pre-existente**: 117/117 en ambos arboles. |
| -- | 11 rojos `rottay-t1` "common lowering" | Pre-existentes (identicos en HEAD) pero no enumerados por el reporte en D.2/D.4 (D4c). |

## G. Los dos desvios de alcance

### G.1 Harness F4C (`UNDECLARED_CHANNELS_WATCHED` / `DECLARED_PARTIAL_PROPAGATION`) -- deuda ACEPTABLE, con condiciones de integracion

No bloquea: el artefacto no existe en la rama y no era decision de Sonnet. Medido para
la integracion en main (`e14213be8..b682164f6`, 287 archivos tocados vs 46 de COH-1):
**cero archivos en comun** -- rebase limpio. Los receipts F4C no estan registrados en
`manifest/families/*` (ningun `*.receipt.json` bajo `F4C/`, ningun "F4C" en
`packages/core/manifest`), asi que `manifest --check` no se pone rojo al integrar.

Condiciones que deben quedar en el paquete de integracion, no como deseo:
1. `f4c-canary-capture.mjs:213-221`: 6 de los 7 canales "watched" pasan a declarados
   (`-ink` sigue fuera); la linea `:2162` (`[...declaredChannels,
   ...UNDECLARED_CHANNELS_WATCHED]`) los duplicaria. Editar en el mismo commit.
2. `DECLARED_PARTIAL_PROPAGATION` (`badge-success`, `workbench-status-success`) pasa a
   ser falso: tras COH-1 ambos DEBEN seguir al seed.
3. **Re-correr el F4C focal** (matriz E.2 de Opus: `badge-success`, `badge-error`,
   `workbench-status-success`, `badge-warning`, alerts rustic, controles negativos).
   COH-1 convierte filas NON-MOVER en MOVER: ese es el testigo visual del lote y hoy no
   existe. El receipt viaja el sha256 del manifest, que ya cambio.

### G.2 `CONSULTED_PROVENANCE_FIELDS` no ensanchado -- NO aceptable como deuda silenciosa (D3, P2)

El argumento de Sonnet ("Opus no lo nombro; ensancharlo excede el paquete") invierte la
carga: la ley que Opus si nombro -- "replicar `applyTenantSeedDerivations` con sus tres
guardas" -- implica entrar al vocabulario que esas guardas consultan.
`iso/index.ts:1093-1099` dice textualmente que provenance "is read at exactly two
compiler sites ... This set is the union of those two tables and is the single
authority they are checked against, so a third site cannot quietly start asking about
a field nobody agreed to make provenance-sensitive". COH-1 es ese tercer sitio
(`brand-theme/index.ts:1834-1838` consulta `palette.successBgColor` y 14 mas via
`isTenantAuthoredField`). El cierre ejecutable (`provenance-acceptance.test.ts:979-987`)
une solo las dos tablas viejas, por eso sigue verde: la valla es por convencion, no
mecanica, y acaba de fallar en su unico proposito. La valla mP6 (`:989+`) tampoco cubre
los 15 campos ni los 4 seeds de estado.

Hoy la exposicion es nula porque D1 deja la funcion inerte; al remediar D1 se vuelve
viva. Remedio (mismo delta que D1): anadir los 15 campos de
`STATUS_SEED_SHADOWING_FIELDS` y `palette.{success,warning,error,info}Color` al set;
el test de cierre une TRES tablas (+`STATUS_SEED_SHADOWING_FIELDS` + los 4 seeds);
actualizar el docblock a "three sites". ~20 lineas.

## H. Reclamos del reporte vs diff (lo que el diff no sostiene)

- Reporte C.5 / B.1 ("verificado ... sí sobrescribe el literal horneado"): sostenido
  solo con `compileBrandTheme` y patch manual; por `compileTenantThemeConfig` es falso
  (D1).
- Reporte E.2 (#2): rojo inexistente en HEAD (D4b).
- Reporte D.2/D.4: `rottay-t1-mass-drain` presentado como corregido sin enumerar sus
  11 rojos pre-existentes (D4c). D.3 los cubre solo por agregado ("57 identicas").
- Reporte E.5 ("mueven el digest de MAS receipts"): la cuenta stale es 117 en ambos
  arboles; sin efecto.
- Todo lo demas que el reporte afirma (tabla C, conteos, pines, gates, retiros, 83
  canales, generados-no-editados) lo sostienen el diff, los artifacts y mis corridas.

## I. Anexo: sondas (contenido, para reproducibilidad; corrieron solo en copias /tmp)

Sonda 1 (vitest, en `/tmp/coh1-lot-audit/packages/core/src/infrastructure/compilers/composition/tenant-theme/tests/zz-fable-coh1-door-probe.test.ts`):

```ts
import { compileBrandTheme } from "@/infrastructure/compilers/kernel/runtime/brand-theme";
import { rottayBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes/rottay";
import { compileTenantThemeConfig, getTenantThemeVerticalEnvelope, hydrateTenantThemeConfig, tenantPostureFloors } from "../index";
const compileFor = (vertical, doc) => compileTenantThemeConfig(
  hydrateTenantThemeConfig(doc, { tenantId: "t_probe", slug: "probe", verticalKey: vertical, rowVersion: 1 }),
  { verticalEnvelope: getTenantThemeVerticalEnvelope(vertical)! });
// puerta DB real
compileFor("rottay", { schemaVersion: 1, mode: "advanced", visualFoundation: { general: { palette: { backgroundMode: "dark", status: { success: "#7C3AED" } } } } }).variables
//   -> { "--ds-color-success": "#7C3AED" }  (sin -bg/-border/alpha)
// proyeccion
tenantPostureFloors({ palette: { successColor: "#7C3AED" }, modes: { light: { palette: { successColor: "#7C3AED" } } } })
//   -> keys typography,surfaces,motion; palette undefined; modes undefined
// contra-prueba
compileBrandTheme({ brandTheme: rottayBrandTheme, tenantSlug: "p", tenantPatch: { palette: { successColor: "#7C3AED" } }, tenantAuthoredPaths: new Set(["palette.successColor"]) }).cssVariables["--ds-color-success-bg"]
//   -> "var(--ds-color-success-50)"
compileBrandTheme({ brandTheme: rottayBrandTheme, tenantSlug: "p", tenantPatch: tenantPostureFloors({ palette: { successColor: "#7C3AED" } }), tenantAuthoredPaths: new Set(["palette.successColor"]) }).cssVariables["--ds-color-success-bg"]
//   -> "rgba(34, 197, 94, 0.10)"
```

Sonda 2 (node ESM contra `packages/core/dist/index.js` del worktree, `/tmp/coh1-probe.mjs`):
documento `{ general: { palette: { backgroundMode: "light" } } }` sobre bithire =>
delta de 6 claves con `--ds-color-border-focus = #3A6FB0` (falso positivo de la familia
primaria, pre-existente); documento solo-tipografia => delta de 1 clave (control).

Comandos de gates (worktree, `packages/core`): `node manifest/generator/index.mjs --check`
(117 stale F4B, = HEAD); `node scripts/tokens/slot-inventory/index.mjs --check` (OK 3613);
`node scripts/verticals/build-vertical-artifacts/index.mjs --check` (exit 0);
`node scripts/packaging/generate-supplier-contract/index.mjs --check` (up to date);
`node scripts/boundaries/app-ds-hook-contract-gate/index.mjs --manifest-check` (current);
`node scripts/structure/core-structure-audit/index.mjs --check` (0 findings);
`npx tsc --noEmit` (exit 0).

---

**Veredicto final: DEFECTS-4** (D1 P1, D2 P1, D3 P2, D4 P3). La formula, los retiros,
la gobernanza y los pines son correctos y completos; lo que falta es que la Parte 2
exista por la puerta por la que un tenant real entra, un test que lo vea, y el
vocabulario cerrado que la ley exige. Remediado eso y re-auditado el delta, ACCEPT.
