# COH-1 — Scout: tints status derivados desde sus seeds (WO-CRA-23)

**Fecha:** 2026-08-30 · **Alcance:** READ-ONLY · **Repo:** `/Users/daniel/Developer/Rottay/ui-design-system`
**Control de referencia:** `palette.status-seeds` (`packages/core/manifest/controls/palette.status-seeds.json`)

> Scout de preparación para la cohorte COH-1. No se modificó ningún archivo; este
> reporte es el único artefacto creado. Todo número es reproducible con el comando
> citado en su sección.

---

## 0. Análisis previo existente

No existe análisis previo de COH-1 ni de "status-tints" en el programa:

```
grep -rn "COH-1\|status-tints" packages/core/scripts/quality-evidence/ packages/core/manifest/ docs/   # 0 resultados
grep -rln "COH-1" packages/core --include="*.json" --include="*.md"                                    # 0 resultados
```

Lo más cercano (y la motivación directa de esta cohorte) ya está **pre-declarado en el
harness F4C**: `packages/showroom/scripts/f4c-canary-capture.mjs:201-208` define
`UNDECLARED_CHANNELS_WATCHED` con los 7 canales fuera de `declaredOutputs`
(`--ds-color-success-bg`, `-border`, `-ink`, `--ds-color-alpha-success-10`,
`--ds-color-warning-bg`, `--ds-color-error-bg`, `--ds-color-info-bg`), y `:217-233`
define `DECLARED_PARTIAL_PROPAGATION`: el `backgroundColor` de `badge-success` y
`workbench-status-success` **puede NO seguir al seed** porque `--ds-color-success-bg`
es "literal del BrandTheme, fuera de declaredOutputs". COH-1 es exactamente el
trabajo que convierte esa propagación parcial pre-declarada en propagación total.

El propio registro de capabilities documenta la exclusión deliberada:
`packages/core/src/foundation/contracts/composition/tenants/capabilities/index.ts:855-861`
— "`--ds-color-{tone}-bg` / `-border` (y `--ds-color-info-ink`) están deliberadamente
EXCLUIDOS: pertenecen a `EXTENDED_PALETTE_CHANNELS` (:493-517), un record authoreado
`field -> channel` alimentado por `successBgColor`, `errorBorderColor`, `infoInkColor`
y sus hermanos. Ningún SEED status los alcanza."

---

## 1. Censo de canales y valores actuales

### 1.1 Familias de canales y dónde se DECLARAN/EMITEN

| Familia | Canales | Emisor | Cita |
|---|---|---|---|
| Seed passthrough | `--ds-color-{success,warning,error,info}` | compilador kernel, `if (seed)` | `src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts:846-851` |
| Rampa perceptual | `--ds-color-{tone}-{50..900}` (10 por tono) | `deriveTenantColorRamps` (OKLCH, gamut-mapped); pasos authored en `palette.ramps` pisan a los derivados | mismo archivo `:340-366`, llamada `:1033`; roles `:316-326` |
| Ink sobre sólido | `--ds-color-on-{tone}` | `deriveReadableInk` (WCAG, elige `#ffffff`/`#171717`) | `:856-861`; algoritmo `src/infrastructure/compilers/kernel/foundation/css/color-math/readable-ink/index.ts:93` |
| Tints | `--ds-tint-{tone}-{4,8,12,16,24}` (5 por tono) | `setTintScaleVariables`, gated por seed | `:1054` (llamada), `:1434-1451`, `:1460-1474` |
| **bg/border** | `--ds-color-{tone}-bg`, `--ds-color-{tone}-border` | `EXTENDED_PALETTE_CHANNELS`, write-if-present (literal authored) | `:493-550` (mapa; `successBgColor` en `:509`), emisión `:610-630` + `:869` |
| **ink sobre pozo** | `--ds-color-{info,warning,error,success}-ink` | **solo foundation** `default.css` (color-mix srgb hacia neutral-900; info = hue crudo); el compilador solo emite `--ds-color-info-ink` si se authorea `infoInkColor` | `src/foundation/tokens/css/foundation/themes/default.css:480-483`; mapa `:517`; autoridad `tinted-well-tone-ink` en `capabilities/index.ts:1019-1031` |
| **alpha** | `--ds-color-alpha-{tone}-{10,20}` (⚠ `alpha-info-20` **no existe**: ni contrato ni default) | `EXTENDED_PALETTE_CHANNELS` (`:532-538`) si authored; si no, literales foundation | `default.css:197-203`; contrato `src/foundation/contracts/composition/tenants/themes/index.ts:501-507` (solo `alphaInfo10`) |
| Rampa foundation | `--ds-color-{tone}-{50..900}` en `:root` (sin tenant) | literales estáticos (tailwind-like) | `default.css:67-118`; aliases de canal `:182-186` |

Los 68 canales de `declaredOutputs` del control (`palette.status-seeds.json:24-96`)
cubren seed passthrough + rampas + `on-*` + tints. **Quedan fuera: `-bg`, `-border`,
`-ink`, `alpha-*`** — objeto de COH-1.

Emisión a CSS: los artefactos committed `src/foundation/tokens/css/facade/artifacts/{rottay,bithire,evnto}/index.css`
son build output puro de `compileBrandTheme` — header de
`scripts/verticals/build-vertical-artifacts/index.mjs:1-20`; cadena
`pnpm -C packages/core build` → `build:vertical-artifacts` + `build:css`
(`packages/core/package.json:666-667`), con gates `--check` en `:706-707`.

### 1.2 Valores actuales por vertical (fuente: brand-theme TS → artefacto committed)

Comandos de reproducción:
```
grep -n "successColor\|successBgColor\|successBorderColor" packages/core/src/foundation/tokens/ts/presentation/brand-themes/<v>/index.ts
grep -n "\--ds-color-success" packages/core/src/foundation/tokens/css/facade/artifacts/<v>/index.css
```

**Rottay** (defaultMode `dark`, overlay `light` — `rottay/index.ts:48-49`; PALETTE base
en `:3382`, overlay en `:69`):

| Canal | dark (base) | light (overlay) |
|---|---|---|
| seed `--ds-color-success` | `#22C55E` (`:3545`) | `#16A34A` (`:390`) |
| `-bg` | `rgba(34,197,94,0.10)` (`:3546`; artifact `:434`) | `rgba(22,163,74,0.06)` (`:395`; artifact `:1489`) |
| `-border` | `rgba(34,197,94,0.22)` (`:3547`; artifact `:435`) | `rgba(22,163,74,0.20)` (`:400`) |
| rampa | authored completa (`:3420-3431`; `-50` dark = `rgba(34,197,94,0.08)`, light = `rgba(22,163,74,0.06)`) | idem overlay |
| alpha | solo `-20` al 0.18 (`:3572-3574`); `-10` hereda foundation | `-10` 0.08 / `-20` 0.14 (`:512-542`) |

warning/error/info: misma forma, seeds `#F59E0B`/`#F87171`/`#60A5FA` (dark) y
`#D97706`/`#DC2626`/`#2563EB` (light) — `:3548-3560`, `:405-445`. **Rottay trackea su
seed en todo** (los rgba son el propio seed con alfa).

**BitHire** (defaultMode `light`, overlay `dark` — `bithire/index.ts:55-56`; PALETTE
base en `:3243`, overlay en `:76`):

| Canal | light (base) | dark (overlay) |
|---|---|---|
| seed `--ds-color-success` | **`#327CA8` (azul)** `:3456` → artifact `:350` | `#5ca6cf` `:334` → artifact `:1393` |
| `-bg` | **`#f0fdf4` (VERDE legacy)** `:3457` → artifact `:361` | `#132b40` `:339` → artifact `:1396` |
| `-border` | **`rgba(5,118,66,0.25)` (VERDE)** `:3458` → artifact `:362` | `rgba(92,166,207,0.3)` `:344` |
| rampa | derivada del seed azul (`-50` = `#F0F9FF`, artifact `:355`) | authored (`:123-134`; `-100` = `#132b40` = el bg actual) |
| alpha | **ninguno authored** → hereda foundation VERDE `rgba(34,197,94,0.10/0.20)` (`default.css:197-198`) | idem |

warning `#D6A04E`/error `#C5504C`/info `#3A6FB0` (light, `:3459-3471`) con bg
`#fffbeb`/`#fef2f2`/`#f0f7ff` y borders `rgba(...,0.25)`; dark `:349-394` (bg oscuros
hue-consistentes, `infoInkColor: var(--ds-color-info-300)` `:394`).
**Bug confirmado: seed success azul con pozo y borde verdes en light.** Además el
chrome de input light lleva otro verde cocido: `successBorder: "#2F8B68"` y
`successBg: color-mix(in srgb, #2F8B68 4%, #FFFFFF)` (`bithire/index.ts:~6754-6756`)
→ artifact `:613`; el dark overlay del mismo control sí usa `var(--ds-color-success)`
(artifact `:1476`).

**Evnto** (defaultMode `light`, overlay `dark` — `evnto/index.ts:49-50`; PALETTE base
en `:1652`, overlay en `:70`):

| Canal | light (base) | dark (overlay) |
|---|---|---|
| seed | `#15803D` / `#A16207` / `#B91C1C` / `#475569` (`:1860-1870`) | no redeclara seeds |
| `-bg` | `#f0fdf4` / `#fefce8` / `#fef2f2` / `#f8fafc` (`:1861-1875`; artifact `:199`, `:219`, `:129`, `:142`) | **`var(--ds-color-{tone}-50)`** (`:217-232`; artifact `:556`) |
| `-border` | **`color-mix(in srgb, var(--ds-color-{tone}) 20%, transparent)`** (`:1901-1916`; artifact `:200`) | hereda la fórmula light |
| alpha | ninguno authored → foundation | idem |

Evnto light tiene bg **literales cercanos pero no derivados** (su `-50` derivado es
`#F5FFF6`, no `#f0fdf4` — artifact `:193`); sus borders ya son derivados del canal.

**`-ink` en las tres verticales:** ningún artefacto lo emite (salvo `info-ink` dark de
bithire, artifact `:1345`); resuelve siempre de `default.css:480-483` — **ya sigue al
seed por construcción**. Test de autoridad:
`src/foundation/tokens/css/foundation/themes/tests/tone-ink-authority.test.ts:79-102`.

**Tenants DB:** la puerta `appearance.general.palette.status.{…}` solo lleva seed
(`palette.status-seeds.json:20-23`) y confluye a `BrandPalette.{successColor,…}` en
`src/infrastructure/compilers/composition/tenant-theme/migrate-v1/index.ts:402-423`
(vocabulario cerrado `:333`), entrando al mismo lowering (`compileTenantThemeConfig`,
`src/infrastructure/compilers/composition/tenant-theme/index.ts:1861` →
`compileTheme`). Hoy: `-bg` DB resuelve vía `default.css:252` (`var(--ds-color-{tone}-50)`,
que SÍ es rampa derivada del seed tenant) **salvo** que la vertical baseline authoree
el literal (bithire/rottay lo hacen → el tenant hereda el literal). `-border` y
`alpha-*` DB son **siempre los literales foundation verdes/ámbar/rojo/azul**
(`default.css:253-259`, `:197-203`) — no siguen al seed tenant.

---

## 2. Mapa de productores

Campo BrandPalette → canal (todo en `kernel/runtime/brand-theme/index.ts` salvo nota):

- `successColor` → `--ds-color-success` (`:846-847`), rampa (`:350-356`), tints
  (`:1443-1444`), `--ds-color-on-success` (`:856-861`), e indirectamente `-ink` (lee el
  canal en `default.css:483`). **Un seed alcanza 21 canales; ninguno es `-bg`/`-border`.**
- `successBgColor` → `--ds-color-success-bg` (`:509`); `successBorderColor` →
  `-border` (`:510`). Idem warning/error/info (`:511-516`); `infoInkColor` →
  `--ds-color-info-ink` (`:517`). **No existen `successInkColor`/`warningInkColor`/
  `errorInkColor`** en el contrato (`themes/index.ts:448-507`) — asimetría deliberada,
  los `-ink` son autoridad foundation.
- `alphaSuccess10/20`, `alphaWarning10/20`, `alphaError10/20`, `alphaInfo10` →
  `--ds-color-alpha-*` (`:532-538`).
- Precedencia: floor derivado (solo para los 4 canales de `deriveInteractionFloor`)
  `:649-653` mergeado en `:868`, **debajo** de `setExtendedPaletteVariables` `:869` —
  "derivación es el piso, authored es el techo" (`:643-648`). Hoy `-bg`/`-border`/
  `alpha` **no tienen piso derivado**: o authored o foundation.
- Re-derivación tenant (solo primary hoy): `applyTenantSeedDerivations` `:1645-1670`,
  con `SEED_SHADOWING_FIELDS` `:1572-1588` y guarda `bakesItsOwnColor` `:1608-1610`.
  **Es el patrón exacto que COH-1 debe extender a los 4 tonos.**
- Chrome (familia adyacente, fuera del núcleo COH-1): `--ds-badge-success-bg` etc. en
  `kernel/foundation/css/chrome-variables/index.ts:810`; input `:2089-2098`; toggle
  `:2331`. Rottay authors literales que trackean su seed (`rottay/index.ts:2166-2183`);
  bithire light badge usa fórmula derivada (`color-mix 12%`, artifact `:66`) pero su
  input light cuece `#2F8B68`.
- Build: `scripts/verticals/build-vertical-artifacts/index.mjs` (header `:1-20`) →
  `renderFirstPartyArtifact`; gate de frescura `lint:artifacts`
  (`package.json:706-707`).

**Derivaciones existentes:** rampas OKLCH (`deriveOklchRamp`), tint ramp
`color-mix(in oklab, var(--ds-color-{role}) N%, var(--ds-color-bg-primary))`
(`tintStep`, `:1472-1474` — OKLAB no OKLCH, justificación medida `:1416-1432`),
readable ink WCAG, y el floor de interacción. `-bg`/`-border`/`alpha` son **100%
literales** donde están authored.

---

## 3. Mapa de consumidores por familia

Comando: `grep -rn -- "--ds-color-success-bg\|--ds-color-success-border\|--ds-color-success-ink\|--ds-tint-success-" packages/core/src --include="*.css"`

| Canal | Consumidores (archivo:línea) |
|---|---|
| `-bg` | modern: `badge.css:396,403,417` (soft, con fallback `alpha-*-10`), `shift-matrix.css:207,216,225`; presentation: `record-workbench.css:95,101,107,113`, `cell-renderers.css:43-66`, `export-button.css:50`, `guided-draft-form.css:280` (info), `chart-heatmap.css:28,38` (info), `surface-states.css:55` (info); rustic: `alert.css:30-45`, `message.css:39-51`, `toast.css:55-67`, `live-feed.css:43-65` (todos como fallback de canal de componente) |
| `-border` | `badge.css:398,405,412,419` (outline), `shift-matrix.css:208,217,226`, `cell-renderers.css:45-66`, `surface-states.css:61`, rustic `alert.css:31-46`, `message.css:56-68`, `toast.css:91-100`, `live-feed.css:68` |
| `-ink` | `badge.css:397,404,418` (soft color), `alert.css:84-105`, `callout.css:37-95`, `message.css:85-149`, `notification.css:103-179`, `toast.css:148-169`, `shift-matrix.css:212-296`, `tag-input.css:133`, `export-button.css:51` |
| `--ds-tint-{tone}-*` | washes modern: `alert.css:85-107`, `callout.css:44-97`, `message.css:92-151`, `notification.css:111-181`, `toast.css:149-172`, `result.css:88-108` (todos con fallback color-mix inline) |
| `--ds-color-alpha-{tone}-*` | fallback en `badge.css:396,403,417`; `default.css:1001`; `foundation/base/shadows.css` (4 usos) |
| rampa `-100/-200/…` | `activity-compact.css:166-176`, `activity-ticker.css:214-224`, `activity-cards.css:155-165`, `avatar.css:85`, `card.css:574`, `button.css:187-189`, `toggle.css:70-71`, `checkbox.css:73`, `radio.css:63` — **ya siguen al seed** (rampa derivada/authored por tono) |
| seed directo | `timeline.css:36-38`, `activity-*.css` (dots/chevrons), `dashboard-activity-interactions.css:91-149`, `result` en `default.css:1953-1959` |

Skins del encargo: badge ✅, alert ✅, callout ✅, tag ✅ (vía `tag-input.css:133` +
`--ds-tag-success-bg` de `default.css:1203-1213`, familia chrome adyacente),
record-workbench ✅, activity-compact ✅ (lee rampa, no `-bg`), result ✅ (lee
`--ds-tint-{tone}-8`), timeline ✅ (lee seed directo).

---

## 4. Fórmula candidata y medición del delta

### 4.1 Fórmula (patrones que el sistema YA usa)

- **`-bg` → `var(--ds-color-{tone}-50)`**. Precedente doble: el default foundation ya
  es exactamente eso (`default.css:252,254,256,258`) y evnto dark lo authorea así
  (`evnto/index.ts:217-232`). La rampa `-50` deriva del seed por `deriveTenantColorRamps`
  contra el ground del modo.
- **`-border` → `color-mix(in srgb, var(--ds-color-{tone}) 20%, transparent)`**.
  Precedente: los 4 borders light de evnto ya son esa fórmula
  (`evnto/index.ts:1901-1916`); y `rgba(seed,0.20)` ≡ `color-mix srgb 20%` sobre
  transparent (semántica exacta en sRGB).
- **`alpha-{10,20}` → `color-mix(in srgb, var(--ds-color-{tone}-500) {10,20}%, transparent)`**.
  Ojo: los literales foundation (`default.css:197-203`) están clavados al paso **500**
  de la rampa foundation (`#22c55e`, `#f59e0b`, `#ef4444`, `#3b82f6`), NO al canal
  `--ds-color-{tone}` (que es `-600`/`-400`, `default.css:182-186`). Derivando del
  paso `-500` la conversión es **byte-exacta en `:root`**.
- **`-ink`: no tocar** — ya deriva del canal (`default.css:480-483`), autoridad
  `tinted-well-tone-ink` (`capabilities/index.ts:1019-1031`).
- Mecanismo: (a) **piso derivado** en el compilador cuando hay seed y el campo está
  sin authorear (patrón `deriveExtendedPaletteFloor`, `:649-653`); (b) **re-derivación
  tenant** extendiendo `applyTenantSeedDerivations` (`:1645-1670`) a los 4 tonos con
  entradas `palette.{successBgColor,…}` en `SEED_SHADOWING_FIELDS` (`:1572-1588`) —
  la guarda `bakesItsOwnColor` preserva `var()`-referencias y solo rescribe literales
  cocidos del baseline.

### 4.2 Delta real por vertical (actual → derivado)

**BitHire light** (ground `#F4F8FB`, `bithire/index.ts:3383`):

| Canal | Actual | Derivado | Clase |
|---|---|---|---|
| success-bg | `#f0fdf4` 🟢 | `#F0F9FF` (`-50` del seed azul, artifact `:355`) | **CORRECCIÓN VISUAL MAYOR (el bug)** |
| success-border | `rgba(5,118,66,0.25)` 🟢 | `rgba(50,124,168,0.20)` | **CORRECCIÓN VISUAL MAYOR** |
| warning-bg | `#fffbeb` | `#FFF6EA` (artifact `:375`) | corrección menor (misma familia) |
| warning-border | `rgba(231,163,62,0.25)` | `rgba(214,160,78,0.20)` | corrección menor |
| error-bg | `#fef2f2` | `#FFF5F4` (`:282`) | corrección menor |
| error-border | `rgba(204,16,22,0.25)` | `rgba(197,80,76,0.20)` | corrección menor |
| info-bg | `#f0f7ff` | `#F3F8FF` (`:295`) | corrección menor |
| info-border | `rgba(10,102,194,0.25)` | `rgba(58,111,176,0.20)` | corrección menor |
| alpha-success-10/20 | `rgba(34,197,94,…)` 🟢 foundation | `rgba(38,113,156,…)` (`-500` `#26719C`) | **CORRECCIÓN VISUAL MAYOR** |
| alpha-warning/error/info | literales foundation | derivados del `-500` propio | corrección (info: azul foundation → `#376BAB`) |
| input success chrome | `#2F8B68` cocido 🟢 | `var(--ds-color-success)` al 4% (paridad con dark, artifact `:1476`) | **CORRECCIÓN VISUAL MAYOR** |

**BitHire dark:** bg/border ya son hue-consistentes con `#5ca6cf`; derivar movería
success-bg `#132b40` → `#0d1b29` (`-50` authored) o lo deja igual si se adopta
`-100` (`#132b40` = `-100` authored — **CERO-DELTA** con esa elección). Los alpha
foundation verdes sobre ground oscuro `#0f1520` sí son corrección.

**Rottay** (dark base / light overlay): sus literales **son el seed con alfa**.
- light: `-bg` = `rgba(22,163,74,0.06)` = su `-50` authored → **CERO-DELTA exacto**;
  `-border` 0.20 = canal al 20% → **CERO-DELTA exacto**.
- dark: `-bg` 0.10 vs `-50` 0.08 → corrección mínima; `-border` 0.22 vs 0.20 →
  corrección mínima. Si los literales se conservan (authored gana al piso):
  **CERO-DELTA total** — recomendado, es su dirección de arte.
- alpha authored (0.08/0.14/0.18): se conservan bajo "authored gana" → CERO-DELTA.

**Evnto light:** borders ya derivados → **CERO-DELTA**. bg `#f0fdf4`→`#F5FFF6`,
`#fefce8`→`#FFFBF7`, `#fef2f2`→`#FFFBFA`, `#f8fafc`→`#FAFCFF` → correcciones mínimas
(misma familia de tono). alpha info: azul foundation `rgba(59,130,246,0.10)` → slate
del seed `#475569` → **corrección visible** (su info ES slate).

**Evnto dark:** `-bg` ya es la forma propuesta → **CERO-DELTA**.

**Foundation `:root` (sin tenant):** convertir borders (`default.css:253-259`) y
alphas (`:197-203`) a las fórmulas con paso `-500` → **CERO-DELTA byte-exacto en
`:root`**, y todo tenant sin literal pasa a seguir a su seed. Los `-bg` foundation ya
son `var(-50)` (`:252-258`) → CERO-DELTA por definición.

**Tenants DB:** hoy `-border`/`alpha` nunca siguen al seed → CORRECCIÓN (fix);
`-bg` depende de si la vertical baseline authorea el literal (bithire/rottay: sí → el
tenant DB pinta el literal del baseline; tras la re-derivación tenant, pasa a seguir
su seed → CORRECCIÓN intended para tenants de bithire).

---

## 5. Propuesta de implementación acotada

1. **Compilador** (`src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts`):
   - Nuevo `deriveStatusTintFloor(palette)`: por tono con seed hex/var presente y campo
     ausente, emite `-bg = var(--ds-color-{tone}-50)`,
     `-border = color-mix(in srgb, var(--ds-color-{tone}) 20%, transparent)`,
     `alpha-{tone}-10/20 = color-mix(in srgb, var(--ds-color-{tone}-500) {10,20}%, transparent)`.
     Mergearlo **antes** de `setExtendedPaletteVariables` (`:869`), junto al floor
     existente (`:868`). Guardas `if (seed)` como el resto (`compat` del control,
     `palette.status-seeds.json:99`).
   - Extender `applyTenantSeedDerivations` (`:1645-1670`) a los 4 tonos: mismas
     guardas (provenance, `SEED_SHADOWING_FIELDS` + `bakesItsOwnColor`). Añadir las
     entradas de shadowing `palette.{success,warning,error,info}{Bg,Border}Color` y
     `palette.alpha{Success,…}{10,20}` a `SEED_SHADOWING_FIELDS` (`:1572-1588`).
2. **Foundation** (`default.css`): `:253-259` borders y `:197-203` alphas → fórmulas
   `-500` (CERO-DELTA en `:root`, verificado en §4.2). No tocar `:480-483` (`-ink`).
3. **BitHire light** (`brand-themes/bithire/index.ts`): retirar `successBgColor`/
   `successBorderColor` (`:3457-3458`) y el verde cocido del input chrome (`:6754-6756`),
   dejando el piso/fórmula (paridad con su dark). Decidir warning/error/info: retirar
   (corrección menor) o conservar (CERO-DELTA). Recomendación: retirar los 8 bg/border
   para que los 4 tonos sigan al dial.
4. **Evnto light**: retirar los 4 `*BgColor` literales (`:1861-1875`) — corrección
   mínima — o conservarlos (CERO-DELTA). Rottay: **no tocar** (CERO-DELTA conservando).
5. **Tenants DB:** cero cambios de documento ni migración — la puerta
   `appearance.general.palette.status.{…}` ya confluye a `BrandPalette` antes del
   lowering único (`migrate-v1/index.ts:402-423`); los tints **se derivan en
   compilación** por (1). El fixture `themanagement-db-row` no toca status
   (`fixtures/themanagement-db-row/index.ts:73-75`).
6. **Gobernanza:** ensanchar `declaredOutputs` de `palette.status-seeds.json` (o
   nota de compat) para admitir `-bg`/`-border`/`alpha` como canales alcanzados por el
   seed — la exclusión actual (`capabilities/index.ts:855-861`) queda desactualizada
   tras (1b). Es una corrección de declaración (mismo criterio W-SOURCE del `:99`).
7. **Orden:** (1) compilador + tests → (2) foundation → (3) verticales →
   `pnpm -C packages/core build` → gates `--check` → (6) manifiesto → F4C re-run.

---

## 6. Propuesta de test y blast radius

**Unitarios (compilador/normalizador):**
- Nuevo test junto a `tone-ink-authority.test.ts`: por vertical, seed mutado en sandbox
  ⇒ `cssVariables["--ds-color-success-bg"]` resuelve a `var(--ds-color-success-50)` y
  border/alpha a las fórmulas; campo authored gana al piso; seed ausente ⇒ sin emisión.
- Re-derivación tenant: patch con `palette.status.success` ⇒ el literal del baseline
  que hornea color (`bakesItsOwnColor`) es reemplazado; valor `var()` se conserva;
  leaf tenant (`palette.successBgColor` en authoredPaths) gana.
- Actualizar pins existentes que quedan stale:
  `src/foundation/tokens/__tests__/brand-authored-residue-retirement.test.ts:1053`
  (rottay), `:1064` (bithire `#f0fdf4`), `:1084` (evnto), `:1094-1103` (evnto dark);
  `mass-c3-bithire-drain.test.ts:79,104,371,867-870`; verificar
  `modern-tenant-value-free.test.ts:198`.
- Foundation: test byte-exacto `:root` (fórmula `-500` ≡ literal actual).

**F4C (re-ejecución de filas afectadas):** el harness ya vigila los 7 canales
(`f4c-canary-capture.mjs:201-208`) y pre-declara la propagación parcial de
`badge-success`/`workbench-status-success` (`:217-233`). Tras COH-1 esas dos filas
deben pasar de NON-MOVER declarado a MOVER. Corrida completa A→E:
```
pnpm -C packages/showroom dev   # :7001
node packages/showroom/scripts/f4c-canary-capture.mjs packages/core/test-artifacts/quality-evidence/wo-cra-23/F4C/phase-A --phase A
# B: editar seed en fixtures/themanagement-db-row + pnpm -C packages/core tenant-theme-fixtures:generate → --phase B
# C: revert + regenerate → --phase C   (byte-idéntico a A)
# D: editar palette.successColor en bithire/index.ts:3456 + pnpm -C packages/core build → --phase D
# E: revert + build → --phase E        (byte-idéntico a A)
node packages/showroom/scripts/f4c-canary-capture.mjs --compare .../phase-A .../phase-B   # etc.
```
Matriz y comandos: `test-artifacts/quality-evidence/wo-cra-23/F4C/README.md`.

**Blast radius (qué familias cambian de pintura):**
- **BitHire light (mayor):** badge soft, record-workbench, cell-renderers,
  export-button, shift-matrix, rustic alert/message/toast, input success — todo lo que
  lee `-bg`/`-border`/alpha success pasa de verde a azul; warning/error/info mueven
  levemente (misma familia). Badge/tag/alert de F4C (`labels`, `alert`, `workbench`)
  son las capturas sensibles.
- **Evnto:** bg de los 4 tonos (mínimo) + alphas (info azul→slate, visible en badge
  soft). **Rottay:** CERO-DELTA si se conservan sus literales (recomendado).
- **DB tenants:** borders/alphas pasan a seguir al seed (fix de defecto vivo); `-bg`
  de tenants sobre baseline bithire cambia (verde→seed).
- **Chrome adyacente fuera de scope pero a observar:** `--ds-alert-success-bg`,
  `--ds-tag-success-bg`, `--ds-avatar-success-bg` (literales authored por vertical;
  rottay `:2166-2183` trackea seed, bithire input `#2F8B68` no) — cohorte hermana.

---

## 7. Riesgos y alternativas rechazadas

**Riesgos:**
- **Contraste ink/pozo:** al cambiar el pozo de bithire (verde→azul) el par
  `-ink` se re-evalúa solo (deriva del canal), pero hay que re-medir APCA/WCAG del par
  en badge soft y shift-matrix. El `inkTrap` documentado
  (`src/foundation/tokens/residual-adjudication.json:15278-15291`) advierte que
  `--ds-color-on-success` es ink de sólido, no de pozo — no re-usar ese canal.
- **`:root` sin tenant:** las fórmulas `-500` son byte-exactas sobre la rampa
  foundation; si alguien re-clava la rampa foundation sin regenerar, el gate
  `lint:artifacts`/test de `:root` debe fallar (cubrir con test).
- **Semántica alfa vs opaco:** los `-bg` dark de rottay son pozos con alfa
  (rgba 0.08-0.10) — reemplazarlos por mixes opacos cambiaría comportamiento sobre
  superficies no-ground. La fórmula `var(-50)` preserva el alfa porque el `-50`
  authored de rottay la lleva. No derivar `-bg` con `tint-N` (opaco sobre
  `--ds-color-bg-primary`).
- **Gobernanza:** `declaredOutputs` del control debe ensancharse o el canal-parity
  graph reportará la nueva escritura como hallazgo fantasma (la razón del record
  explícito está en `brand-theme/index.ts:485-492`).
- **Tests con pins de literales:** los listed en §6 fallan hasta actualizarse —
  es la señal esperada, no un regresión; cada pin actualizado debe citar el valor
  derivado.

**Alternativas rechazadas:**
1. **Re-apuntar los skins a `--ds-tint-{tone}-*`** en vez de derivar `-bg`: toca N
   familias, rompe la capa de authoring chrome y contradice la ley de un solo
   productor; los skins ya leen `-bg` con fallbacks sanos.
2. **Añadir `successInkColor` etc. al contrato:** los `-ink` ya derivan del canal
   (`default.css:480-483`) y son autoridad foundation (`capabilities/index.ts:1019-1031`);
   nuevos campos serían una segunda autoridad sin consumidor nuevo.
3. **Derivar `-bg` desde `--ds-tint-{tone}-8`** (oklab sobre bg-primary): rompe los
   pozos alfa de dark (ver riesgo 3) y diverge del precedente doble `-50`
   (`default.css:252`, `evnto/index.ts:217`).
4. **Solo retirar literales sin piso compilador:** deja a los tenants DB sin
   border/alpha derivados cuando la baseline authoree — el defecto DB persiste; la
   re-derivación tenant (5.1b) es la pieza que lo cierra.
5. **Tocar `dark.status` en la puerta DB:** adjudicado fuera de P0
   (`migrate-v1/index.ts:345-349`); su lote propio.

---

## Anexo — comandos de reproducción de los números clave

```bash
# Censo de campos por vertical
grep -n "successColor\|successBgColor\|successBorderColor\|infoInkColor\|alphaSuccess" \
  packages/core/src/foundation/tokens/ts/presentation/brand-themes/{rottay,bithire,evnto}/index.ts
# Valores emitidos
grep -n "\--ds-color-success\b\|\--ds-color-success-bg\|\--ds-color-success-border\|\--ds-color-success-50" \
  packages/core/src/foundation/tokens/css/facade/artifacts/{rottay,bithire,evnto}/index.css
# Productores en el compilador
grep -n "successBgColor\|setTintScaleVariables\|deriveTenantColorRamps\|applyTenantSeedDerivations\|SEED_SHADOWING_FIELDS" \
  packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts
# Foundation
grep -n "\--ds-color-success-bg\|\--ds-color-alpha-success-10\|\--ds-color-success-ink" \
  packages/core/src/foundation/tokens/css/foundation/themes/default.css
# Consumidores
grep -rn "\--ds-color-success-bg\|\--ds-color-success-ink\|\--ds-tint-success-" \
  packages/core/src --include="*.css" -l
# Canales vigilados por F4C
sed -n '199,235p' packages/showroom/scripts/f4c-canary-capture.mjs
```
