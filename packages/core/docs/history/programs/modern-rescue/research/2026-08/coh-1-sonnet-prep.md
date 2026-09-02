# COH-1 — Preparación Sonnet (WO-CRA-23)

**Fecha:** 2026-08-30 · **Alcance:** preparación (no implementación) · **Repo:** worktree aislado
`/Users/daniel/Developer/Rottay/ui-design-system-coh-1` (rama `wo-cra-23/coh-1-status-tints`,
HEAD `e14213be86ee750e702a37f75070a00112a7e733` — mismo commit que el repo principal en el
momento del scout previo, verificado con `git log -1 --format='%H %s'`).

> No se tocó ningún archivo de producción del repositorio. Los únicos artefactos nuevos son
> este reporte y dos suites de test DRAFT (marcadas explícitamente como pre-implementación,
> ejecutadas contra el compilador real de este worktree — ver §5). La fórmula final la fija
> Opus en paralelo; este documento dejar listo el terreno para que su implementación sea
> mecánica, no la decide.

Este documento **verifica contra el código del worktree** cada cita del scout previo
(`packages/core/docs/history/programs/modern-rescue/research/2026-08/coh-1-status-tints.md`,
mismo repo principal, solo lectura) y añade lo que ese scout no cubría: qué archivos son
GENERADOS vs autorados a mano, qué gates ratchet además del F4C hay que tocar, y por qué
`applyTenantSeedDerivations` no es una extensión trivial.

---

## 1. Verificación del scout previo — todo cotejado línea a línea

Cada cita de línea del scout (`brand-theme/index.ts`, `default.css`, `capabilities/index.ts`,
los tres `brand-themes/*/index.ts`, los tres tests de pines) fue releída directamente en este
worktree con `sed -n`/`grep -n`. **Las 100% de las líneas citadas coinciden byte a byte** con
el worktree, incluyendo:

- `EXTENDED_PALETTE_CHANNELS` en `brand-theme/index.ts:493-550` (`successBgColor` en `:509`,
  `alphaSuccess10` en `:532`, etc.) — confirmado.
- Emisión: `setExtendedPaletteVariables` en `:610-630`; floor precedence en `:846-869`
  (`bt.palette.successColor` → `--ds-color-success` en `:846-847`; el floor existente
  `deriveExtendedPaletteFloor(effectivePrimary)` en `:868` mergeado **antes** de
  `setExtendedPaletteVariables(vars, bt.palette)` en `:869`) — confirmado.
- `default.css`: `-bg` ya es `var(--ds-color-{tone}-50)` en `:252,254,256,258`; `-border`
  literal `rgba(...,0.2)` en `:253,255,257,259`; alpha en `:197-203` (⚠ `alpha-info-20`
  confirmado ausente — no hay línea para él); `-ink` en `:480-483`; ramas foundation
  `:67-118` con el paso `-500` exacto por tono — confirmado, incluyendo el alias canónico
  `--ds-color-success: var(--ds-color-success-600)` (no `-500`) en `:183`, que es la razón
  por la que la fórmula de alpha usa el paso `-500` explícito y no el canal `--ds-color-{tone}`.
- `capabilities/index.ts`: bloque "deliberately EXCLUDED" en `:855-861`, `derivedChannels`
  de `status-seeds` en `:862-934` (68 entradas: 4 seed + 40 rampa + 4 on-tone + 20 tint),
  `compat:` en `:936-937` — confirmado.
- Los tres `brand-themes/*/index.ts`: valores de rottay (dark `:3545-3560`, light overlay
  `:390-445`), bithire (light `:3456-3471`, dark `:334-394`, input chrome `:6754-6756`),
  evnto (light `:1860-1916`, dark `:200-232`) — confirmado byte a byte, incluyendo que
  **bithire DARK sí autora `successBgColor`/`...BorderColor` para los 4 tonos** con valores
  hue-consistentes con su seed azul (`:334-394`) — el bug vive solo en LIGHT.
- Artefactos compilados (`facade/artifacts/{bithire,evnto}/index.css`): `-50`/`-500`
  derivados confirmados (`success-50` bithire light = `#F0F9FF` en `:355`, `-500` =
  `#26719C` en `:356`; dark `-100` autorado = `#132b40` = el `-bg` actual en `:1394-1396`,
  **no** el `-50` derivado `#0d1b29` — importa para el §3 dark).

**Dos citas del scout no resistieron la verificación línea a línea** (se corrigen aquí, no
invalidan la propuesta):

1. `mass-c3-bithire-drain.test.ts:79,104,371,867-870` — ninguna de esas líneas menciona
   `successBgColor`/`successBorderColor`/`warningBgColor`/etc. (`grep -n` sobre el archivo
   completo solo encuentra `successBorder` en `:989`, y es el whitelist de
   `chrome.controls.input.successBorder` — una familia DISTINTA, el chrome de validación de
   inputs, no `palette.successBorderColor`). **Este test no necesita edición** para el core de
   COH-1; solo la necesitaría si el lote además retira el verde cocido del input chrome
   (`bithire/index.ts:6754-6756`, fuera del núcleo de COH-1 per el propio scout §5.3).
2. `modern-tenant-value-free.test.ts:198` — la mención de `bithire.palette.successBgColor`
   es prosa ilustrativa dentro de un comentario, no una entrada de un array ejecutable
   (`grep -n "bithire\."` sobre el archivo completo da una sola coincidencia, la de prosa).
   Es una afirmación histórica ("este valor ya existía en default.css antes de que bithire lo
   reclamara") que sigue siendo cierta aunque el campo se retire después. **No requiere
   edición.**

---

## 2. Lo que el scout no cubría: generado vs autorado, y gates adicionales

### 2.1 `manifest/controls/palette.status-seeds.json` es GENERADO, no se edita a mano

El scout (§5.6) proponía "ensanchar `declaredOutputs`" como si fuera edición directa del
JSON. Verificado en `packages/core/manifest/generator/index.mjs`:

```
REGISTRY_SOURCE = packages/core/src/foundation/contracts/composition/tenants/capabilities/index.ts   (:72-75)
declaredOutputs.channels = entry.derivedChannels ?? []                                                (:276)
semanticOwner.registryDigest = sha256(readFileSync(REGISTRY_SOURCE))                                  (:257)
```

Es decir: **todo el archivo `manifest/controls/palette.status-seeds.json`** (incluidos
`declaredOutputs.channels`, `calibration.channels` y `registryDigest`) se recalcula desde
`capabilities/index.ts` — nunca se toca el JSON directamente. El único edit site real es el
`derivedChannels` array + el comentario "deliberately EXCLUDED" en `capabilities/index.ts`
(§3 abajo). Después de editar ese archivo:

```bash
node packages/core/manifest/generator/index.mjs --write    # regenera declaredOutputs + registryDigest
node packages/core/manifest/generator/index.mjs --check    # certifica que quedó al día
```

`registryDigest` es un sha256 de **todo el archivo** `capabilities/index.ts`, no solo del
bloque `status-seeds`: cualquier otra edición concurrente a ese archivo en el mismo lote
también lo mueve. Regenerar y commitear el JSON en el mismo commit que la edición del
registry, nunca a mano.

### 2.2 `slot-inventory.baseline.json` — ratchet decrease-only que retirar campos moverá

No mencionado por el scout. `packages/core/scripts/tokens/slot-inventory/index.mjs` parsea
las anotaciones `@domicile`/`@governor` que decoran cada campo autorado en los `brand-themes/*`
(las mismas que aparecen sobre `successBgColor`, `successBorderColor` en bithire/rottay/evnto,
confirmado con `grep -n "@domicile" bithire/index.ts` — decenas de ocurrencias). El baseline
(`packages/core/scripts/tokens/slot-inventory/slot-inventory.baseline.json`) fija hoy
`counters.rows.value = 3629` — "un SLOT autorado del objeto evaluado de un tema" — y es
**decrease-only, editado A MANO con revisión del DT** (cita textual del `law` del archivo):
un contador que sube es regresión; uno que baja **debe bajar el archivo en el mismo commit**.

Consecuencia directa para COH-1: si la implementación retira `successBgColor` /
`successBorderColor` de bithire light (recomendación del scout §5.3, 2 campos autorados que
desaparecen; 6 más si también se retiran warning/error/info) y/o los 4 `*BgColor` de evnto
light (§5.4), `rows` **baja** en esa misma cantidad y el archivo debe editarse en el mismo
commit, o `node packages/core/scripts/tokens/slot-inventory/index.mjs --check` queda rojo por
desalineación (nota: ese `--check` mide por diferencia contra `compileBrandTheme` de **dist**,
así que solo es corrible después de `pnpm -C packages/core build`, no en este worktree ahora).

### 2.3 `applyTenantSeedDerivations` está hoy hard-codeado a `primaryColor`, no es un loop genérico

El scout (§5.1b) dice "extender `applyTenantSeedDerivations` a los 4 tonos" como si fuera
parametrizar una función existente. Verificado que **no** es así:

- La función (`brand-theme/index.ts:1645-1670`) toma un único `effectivePrimary: string |
  undefined` y deriva `{...derivePrimarySemantics({primary}), ...deriveInteractionFloor(
  primary).variables}` — ambas funciones son específicas de la familia PRIMARY (botones, link,
  focus ring), no genéricas por tono.
- Se llama exactamente dos veces, ambas hard-codeadas a `palette.primaryColor` /
  `PRIMARY_SEED_FIELD`: el bloque base (`:2059`, dentro de `compileTenantThemeConfig`) y el
  overlay de modo (`:1763`, dentro del loop de modos). Ninguna reutiliza tono.
- **Lo reutilizable que SÍ existe**: `ON_TONE_ROLES = ['success','warning','error','info']`
  (`kernel/foundation/css/color-math/readable-ink/index.ts:106`), ya importado en
  `brand-theme/index.ts:91` y usado en el loop de `-ink` (`:855-861`) — es el vector de
  4 roles correcto para iterar, y ya vive en el mismo archivo.
- La implementación necesita, como mínimo: (a) una función `deriveStatusTintFloor(palette)`
  nueva que itere `ON_TONE_ROLES` y devuelva el mapa `{bg, border, alpha10, alpha20}` por tono
  (análoga a `deriveExtendedPaletteFloor`, no una extensión de ella — su firma actual solo
  sabe de los 4 canales de PRIMARY); y (b) una decisión de diseño sobre `applyTenantSeedDerivations`:
  generalizarla para aceptar `(vars, seed, provenance, derivedMap)` y llamarla 5 veces (primary
  + 4 tonos) en cada uno de los dos call sites, **o** añadir una función hermana
  `applyTenantStatusSeedDerivations` que internamente recorra `ON_TONE_ROLES` y se llame una
  vez junto a cada `applyTenantSeedDerivations` existente. Ninguna de las dos es mecánica desde
  el código actual; es la pieza de diseño real que le queda a la implementación (no a esta prep).

### 2.4 Por qué el "floor" (Parte 1) solo no alcanza para el caso DB-sobre-bithire

Hallazgo nuevo, no estaba en el scout. Razonamiento verificado leyendo
`compileTenantThemeConfig` (`tenant-theme/index.ts:2045-2069`): el bloque compilado que se
usa para el delta DB (`compiledTheme.cssVariables`) se produce con
`brandThemeToCssVariables(effectiveTheme, ...)`, donde `effectiveTheme` **ya es** el merge
tenant+baseline (`mergeBrandThemeFloors`). Si el nuevo floor de la Parte 1 (§2.3a) se mergea
dentro de `brandThemeToCssVariables` — igual que el floor de `deriveExtendedPaletteFloor` hoy
(`:868`) — sigue estando **antes** de `setExtendedPaletteVariables(vars, bt.palette)` (`:869`),
que escribe incondicionalmente cualquier `successBgColor` presente en el objeto YA MERGEADO.
Para un tenant DB sobre bithire que solo autora su propio `palette.status.success`, el
`effectiveTheme.palette.successBgColor` resuelto sigue siendo el literal verde de la baseline
bithire (`#f0fdf4`) — un tenant en silencio sobre `successBgColor` no es lo mismo que un
`successBgColor` ausente. **Por eso `applyTenantSeedDerivations` (Sitio A, una pasada
posterior con el guard `bakesItsOwnColor`) es imprescindible para bg/border en cualquier
vertical cuya baseline hornee esos literales** (bithire en las cuatro tonos; rottay igual si se
retiran sus literales, cosa que el scout no recomienda). Alpha es distinto: como ninguna
vertical autora `alphaSuccess10/20` etc. en ninguna capa, el floor de la Parte 1 solo, sin
necesidad de la Parte 2, ya debería alcanzar para ese sub-canal — confirmado y dejado como test
ejecutable en `coh-1-status-tint-tenant-derivation.draft.test.ts` (§5).

### 2.5 Evnto: dos de los cuatro campos ya están gobernados como "derived", no "seed"

`evnto/index.ts` decora `successBorderColor` (light, `:1901-1906`) y `successBgColor` (dark
overlay, `:217-222`) con `@domicile derived / @governor deriva de: --ds-color-{border|success-50}`
— la anotación que lee `slot-inventory` ya los clasifica como NO-seed. Retirarlos entero (dejar
que el floor los produzca) es CERO-DELTA de pixel Y baja `rows` en el `slot-inventory.baseline.json`
(dos slots menos por tono retirado); conservarlos tal cual también es CERO-DELTA de pixel pero
no toca el baseline. Es una decisión de limpieza opcional, no una obligación — el scout ya lo
marcaba opcional en §5.4, esto solo añade la consecuencia sobre el gate del §2.2.

---

## 3. Inventario exacto de sitios de edición

Cada fila es un archivo:rango real de este worktree, verificado con `grep -n`/`sed -n` en
esta sesión (no heredado sin revisar del scout).

| # | Archivo:rango | Qué cambia | Obligatorio / opcional |
|---|---|---|---|
| A1 | `infrastructure/compilers/kernel/runtime/brand-theme/index.ts` — nueva función cerca de `:855-869` (junto al loop de `ON_TONE_ROLES` y el floor existente) | `deriveStatusTintFloor(palette)`: itera `ON_TONE_ROLES`, por tono con seed presente y `-bg`/`-border`/`alpha-{10,20}` ausentes en `vars`, escribe la fórmula candidata. Merge **antes** de `:869` (`setExtendedPaletteVariables`) | **Obligatorio** — Parte 1 |
| A2 | mismo archivo, `:1645-1670` (`applyTenantSeedDerivations`) + los dos call sites `:1763` y `:2059` | Generalizar o añadir función hermana para los 4 tonos (ver §2.3). Añadir 8 entradas a `SEED_SHADOWING_FIELDS` (`:1572-1588`): `--ds-color-{tone}-bg` → `palette.{tone}BgColor`, `--ds-color-{tone}-border` → `palette.{tone}BorderColor` | **Obligatorio** — Parte 2, solo así el caso DB-sobre-bithire (§2.4) se corrige |
| B1 | `foundation/tokens/css/foundation/themes/default.css:253,255,257,259` (border) y `:197-203` (alpha) | Literal → fórmula `color-mix(in srgb, var(--ds-color-{tone}[-500]) N%, transparent)`. Confirmado CERO-DELTA de RGB resuelto (§4), no de texto — ver nota en el draft test | **Obligatorio** — cierra el `:root` sin tenant, y es el ancla que el test byte-exacto exige |
| B2 | mismo archivo, no tocar `:252,254,256,258` (`-bg`) ni `:480-483` (`-ink`) | Ya son `var(-50)` / ya derivan del canal — confirmado, no cambian | N/A — confirmar que nada los toca |
| C1 | `foundation/tokens/ts/presentation/brand-themes/bithire/index.ts:3456-3471` (light base) | Retirar `successBgColor`/`successBorderColor` (el bug real, §4); decidir retirar o conservar `warning/error/infoBgColor`/`...BorderColor` (recomendación scout: retirar los 8) | **Obligatorio** los 2 de success; **opcional** los 6 restantes |
| C2 | mismo archivo, `:6754-6756` (input chrome, `chrome.controls.input.successBorder`/`successBg`) | Verde cocido `#2F8B68` → `var(--ds-color-success)` al 4%, paridad con el dark overlay (`:1476` del artifact) | **Opcional**, fuera del núcleo -bg/-border/alpha; familia adyacente (mismo `chrome.controls.input`, no `EXTENDED_PALETTE_CHANNELS`) |
| C3 | mismo archivo, `:334-394` (dark overlay) | **No tocar** — ya hue-consistente con el seed azul del dark, confirmado CERO-DELTA | N/A |
| D1 | `foundation/tokens/ts/presentation/brand-themes/evnto/index.ts:1861-1875` (`*BgColor` light) | Retirar (corrección mínima de tono, §4) o conservar (CERO-DELTA) | Opcional, decisión de arte |
| D2 | mismo archivo, `:1901-1916` (`*BorderColor` light) y `:217-232` (dark `*BgColor`) | Ya son exactamente la fórmula candidata (`color-mix(...)`, `var(--ds-color-{tone}-50)`) — retirar es limpieza de gobernanza (§2.5), no corrección de pixel | Opcional |
| E1 | `foundation/tokens/ts/presentation/brand-themes/rottay/index.ts` (dark `:3545-3560`, light overlay `:390-445`) | **No tocar** — "authored gana" preserva CERO-DELTA total, es la dirección de arte del scout (§4) | N/A — confirmar que nada los toca |
| F1 | `foundation/contracts/composition/tenants/capabilities/index.ts:855-861` (comentario "deliberately EXCLUDED") | Reescribir: ya no es cierto que ningún seed alcance `-bg`/`-border`; documentar la Parte 1/2 como el 5º y 6º emisor | **Obligatorio** — declaración desactualizada tras A1/A2 |
| F2 | mismo archivo, `derivedChannels` array `:862-934` | Añadir 16 canales: `--ds-color-{success,warning,error,info}-{bg,border}` (8) + `--ds-color-alpha-{success,warning,error,info}-{10,20}` excepto `alpha-info-20` (7, no 8 — ese canal no existe, §1) | **Obligatorio** |
| F3 | mismo archivo, `compat:` `:936-937` | Actualizar la prosa ("no status SEED reaches any of them" ya no es cierto) | **Obligatorio**, mismo commit que F1/F2 |
| G1 | `manifest/controls/palette.status-seeds.json` | **No editar a mano** — regenerar con `node packages/core/manifest/generator/index.mjs --write` tras F1-F3, verificar con `--check` | Mecánico, posterior a F |
| H1 | `packages/core/scripts/tokens/slot-inventory/slot-inventory.baseline.json` (`counters.rows.value`) | Bajar a mano en el mismo commit que C1/D1 si se retiran campos autorados (§2.2); verificar con `node packages/core/scripts/tokens/slot-inventory/index.mjs --check` (requiere `dist`, no corrible en este worktree ahora) | Condicional a qué se retira |
| I1 | Tests de pines (existentes, no drafts) — ver §3.1 | Actualizar valores que la corrección mueve | Obligatorio donde aplique |

### 3.1 Tests existentes con pines que quedan stale — verificados, no solo citados

- `foundation/tokens/__tests__/brand-authored-residue-retirement.test.ts`:
  - `:1053` — pin `cssVariables["--ds-color-success-bg"]` = `"rgba(34, 197, 94, 0.10)"` para
    **rottay dark**. Si rottay conserva sus literales (recomendado, E1), **no cambia**.
  - `:1064` — pin `"#f0fdf4"` para **bithire light**. Si C1 retira `successBgColor`, este pin
    pasa a `"var(--ds-color-success-50)"` (el `-50` derivado del seed azul, confirmado
    `#F0F9FF` en el artifact `:355` — pero el pin en TEXTO de fórmula es `var(...)`, no el hex
    resuelto, porque `compileBrandTheme` no resuelve `color-mix`/`var()`).
  - `:1084` — pin `"#f0fdf4"` para **evnto light**. Cambia solo si D1 se ejecuta.
  - `:1094-1103` — pines de **evnto dark** ya son `"var(--ds-color-{tone}-50)"` — coinciden
    con la fórmula candidata **hoy**; no deberían moverse pase lo que pase en A1 (ya son el
    resultado final).
- `mass-c3-bithire-drain.test.ts` y `modern-tenant-value-free.test.ts:198` — **sin cambios
  necesarios**, corrección al scout, ver §1.

---

## 4. Baseline vs candidato — medido, no repetido de memoria

Fórmula candidata (misma que el scout, re-verificada contra precedentes reales del código,
no inventada — ver draft tests §5 para la prueba ejecutable):

```
-bg               = var(--ds-color-{tone}-50)
-border           = color-mix(in srgb, var(--ds-color-{tone}) 20%, transparent)
alpha-{tone}-10/20 = color-mix(in srgb, var(--ds-color-{tone}-500) {10,20}%, transparent)
-ink              = sin cambios
```

| Vertical / modo | Canal | Actual (verificado) | Candidato (fórmula) | Clase |
|---|---|---|---|---|
| Foundation `:root` | `success-border` | `rgba(34, 197, 94, 0.2)` | `color-mix(in srgb, var(--ds-color-success-500) 20%, transparent)` → mismo RGB (`success-500` = `#22c55e` = rgb(34,197,94)) | CERO-DELTA de píxel, texto cambia |
| Foundation `:root` | `alpha-success-10/20` | `rgba(34,197,94,0.10/0.20)` | ídem, mismo RGB | CERO-DELTA de píxel |
| Foundation `:root` | `success-bg` | `var(--ds-color-success-50)` | idéntico | CERO-DELTA de texto y píxel |
| Foundation `:root` | `success-ink` | `color-mix(... var(--ds-color-success) ...)` | sin cambios (B2) | N/A |
| BitHire light | `success-bg` | `#f0fdf4` (verde, bug) | `var(--ds-color-success-50)` = `#F0F9FF` (azul, del seed `#327CA8`) | **CORRECCIÓN MAYOR (el bug)** |
| BitHire light | `success-border` | `rgba(5,118,66,0.25)` (verde) | `color-mix(...) ` = `rgba(50,124,168,0.20)` | **CORRECCIÓN MAYOR** |
| BitHire light | `alpha-success-10/20` | `rgba(34,197,94,·)` (foundation verde, nunca autorado) | `color-mix(... var(--ds-color-success-500) ...)` = del `-500` azul `#26719C` | **CORRECCIÓN MAYOR** |
| BitHire light | `warning/error/info -bg/-border` | literales verdes-adyacentes (`#fffbeb`, `rgba(231,163,62,.25)`, etc.) | derivados del propio seed (`#FFF6EA` etc., artifact confirmado) | corrección menor, misma familia de tono |
| BitHire dark | `success-bg/-border` | `#132b40` / `rgba(92,166,207,0.3)` — **autorado explícito**, hue-consistente | sin tocar (C3) → **CERO-DELTA si no se retira** | N/A si se respeta C3 |
| BitHire dark | `alpha-success-10/20` | foundation verde (nunca autorado en ningún modo) | derivado del `-500` de bithire dark | corrección (afecta ambos modos, no solo light) |
| Rottay dark/light | `-bg`/`-border`/alpha | literales = el propio seed con alfa (verificado byte a byte, p.ej. light `-bg` 0.06 = su propio `-50` autorado) | sin tocar (E1) → **CERO-DELTA total** | N/A si "authored gana" se respeta |
| Evnto light | `-border` | ya `color-mix(in srgb, var(--ds-color-{tone}) 20%, transparent)` | idéntico | CERO-DELTA ya hoy |
| Evnto dark | `-bg` | ya `var(--ds-color-{tone}-50)` | idéntico | CERO-DELTA ya hoy |
| Evnto light | `-bg` | `#f0fdf4`/`#fefce8`/`#fef2f2`/`#f8fafc` (misma familia de tono que el seed) | `-50` derivado (p.ej. success `#F5FFF6`, artifact confirmado) | corrección mínima, opcional (D1) |
| Evnto light | `alpha-info-10` | foundation azul (nunca autorado) | derivado del slate del seed info (`#475569`) | corrección visible (info ES slate en evnto) |
| DB tenant sobre bithire, solo `status.success` propio | `success-bg/-border` | literal verde de la baseline bithire (el tenant en silencio hereda el leaf de la baseline, no "ausente") | re-derivado del seed del tenant vía A2 | **CORRECCIÓN — el defecto vivo del scout §5.5, requiere A2, no solo A1** |

---

## 5. Tests draft — escritos y CORRIDOS contra el compilador real de este worktree

`pnpm install --frozen-lockfile` se corrió una vez en este worktree (no existía
`node_modules`); ambos archivos se ejecutaron con `npx vitest run <archivo>` para confirmar
que compilan y que el split rojo/verde es exactamente el esperado — no es una promesa sin
verificar.

### 5.1 `packages/core/src/foundation/tokens/__tests__/coh-1-status-tint-floor.draft.test.ts`

Static path (`compileBrandTheme` sobre clones de `bithireBrandTheme` con campos borrados,
patrón `withoutKeypath` tomado de `mass-c3-bithire-drain.test.ts:394-413`), más un bloque de
hechos sobre `default.css` leído como texto (mismo enfoque que el "no-loss harness" de
`tone-ink-authority.test.ts`).

Resultado de la corrida (`npx vitest run .../coh-1-status-tint-floor.draft.test.ts`):
**18 passed, 16 failed** — exactamente la partición esperada:

- ROJO (16, esperado — el mecanismo no existe aún): las 4×3 combinaciones tono×{bg,border,alpha}
  del bloque "floor fires" (12) + las 4 del bloque `SEED_SHADOWING_FIELDS` (4).
- VERDE (18, esperado — no dependen de que exista el floor): "authored gana" (1, pinea el bug
  actual a propósito), "seed ausente ⇒ nada" (4), y los 13 hechos sobre `default.css` (RGB de
  `-500` vs literales de border/alpha, `-bg` ya es `var(-50)`, `alpha-info-20` no existe).

### 5.2 `.../tenant-theme/tests/coh-1-status-tint-tenant-derivation.draft.test.ts`

DB path (`compileTenantThemeConfig` + `hydrateTenantThemeConfig` + un `TenantThemeDocument`
con `visualFoundation.general.palette.status.success`, forma confirmada contra un fixture real
y actualmente pasante en `static-db-channel-vocabulary.test.ts:70-93`).

Resultado: **2 passed, 3 failed** — partición esperada:

- VERDE: seed passthrough (`--ds-color-success` = el seed del tenant, ya funciona hoy) y
  "warning/error/info sin tocar" (nada se deriva para tonos sin seed propio).
- ROJO (esperado, es el defecto vivo del §2.4/§4 última fila): `-bg`/`-border`/alpha del tenant
  siguen siendo `undefined` en el delta — hoy el tenant no re-deriva nada porque
  `applyTenantSeedDerivations` no cubre tonos de estado.

Ningún fallo es por un bug de sintaxis o de fixture — ambos archivos importan y compilan
limpio; los 19 rojos son exactamente "la pieza no existe todavía", verificado leyendo el
mensaje de cada assertion (`expected undefined to be '...'`), no un error de compilación o de
tipo.

### 5.3 Cómo re-usarlos

Si Opus fija una fórmula distinta a la candidata, el único cambio necesario es editar el
objeto `FORMULA` en el primer archivo (4 funciones) — los nombres de test, los helpers de
clonado y los bloques "authored gana"/"seed ausente" no dependen de la fórmula. El segundo
archivo depende de `FORMULA.bg`/`FORMULA.border`/`FORMULA.alpha10/20` solo en 3 asserts,
mismo patrón.

---

## 6. Riesgos (verificados en este worktree, no repetidos del scout sin revisar)

1. **`applyTenantSeedDerivations` no es una extensión de una línea** (§2.3) — es la pieza de
   diseño real de COH-1; subestimarla como "añadir 4 entradas a un loop" retrasaría la
   implementación si Opus no la ve venir.
2. **El floor solo (Parte 1) no corrige el caso DB-sobre-bithire** (§2.4) — si la
   implementación se detiene ahí pensando que "ya se deriva en compilación", el defecto vivo
   del scout §5.5 queda sin cerrar para bg/border (alpha sí queda cerrado con Parte 1 sola).
3. **`manifest/controls/palette.status-seeds.json` no se edita nunca a mano** (§2.1) — un
   commit que lo toque directamente sin pasar por el generador quedará desalineado con
   `registryDigest` en el siguiente `--check`.
4. **`slot-inventory.baseline.json` es un ratchet manual** (§2.2) que **no** se puede validar
   en este worktree ahora mismo (su `--check` compila contra `dist`, y este worktree no corre
   builds) — dejar la baja del contador para el mismo commit que retira campos, y correr el
   `--check` recién en el entorno donde sí se buildea.
5. **"Byte-exacto en `:root`" es una afirmación de píxel resuelto, no de texto** — el draft
   test lo prueba parseando hex→RGB, no comparando strings; documentarlo así evita que alguien
   interprete el criterio de aceptación como "el texto de `default.css` no cambia" (si cambia:
   literal → `color-mix`).
6. **`alpha-info-20` no existe** en ningún lado (contrato, `default.css`, ni tiene consumidor
   conocido) — la Parte 1 no debe inventarlo; el draft test lo fija como guarda explícita
   (`expect(() => readVar("alpha-info-20")).toThrow()`).
7. **Contraste ink/pozo tras el cambio de hue en bithire** (ya señalado por el scout §7) sigue
   sin re-medir — este prep no lo hace porque requiere Chromium real (patrón de
   `tone-ink-authority.test.ts`), fuera de alcance de una prep de texto/vitest.

---

## Anexo — comandos reproducidos en esta sesión

```bash
# Instalación (necesaria una vez; no existía node_modules en el worktree)
pnpm install --frozen-lockfile

# Los dos draft tests, corridos y verificados rojo/verde como en §5
cd packages/core
npx vitest run src/foundation/tokens/__tests__/coh-1-status-tint-floor.draft.test.ts
npx vitest run src/infrastructure/compilers/composition/tenant-theme/tests/coh-1-status-tint-tenant-derivation.draft.test.ts

# Regeneración del manifest tras editar capabilities/index.ts (F1-F3), NO corrida en esta sesión
node packages/core/manifest/generator/index.mjs --write
node packages/core/manifest/generator/index.mjs --check

# Ratchet de slots (requiere dist; NO corrible en este worktree ahora)
node packages/core/scripts/tokens/slot-inventory/index.mjs --check
```
