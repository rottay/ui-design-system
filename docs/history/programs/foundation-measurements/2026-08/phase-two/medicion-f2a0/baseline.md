# F2A-0 — Censo y medición F2 asimétrico. Baseline del árbol de hoy

**READ-ONLY cumplido**: `git status --porcelain` sólo muestra los 2 archivos
de este write-set (verificado al cerrar, ver comando en §E). Cero builds,
cero tests pesados, cero escrituras fuera de `docs/f2a/medicion-f2a0/`.

Fuentes: `packages/core/governance/manifest/cascade/catalog/index.json` (64 raíces) y
`packages/core/src/foundation/tokens/css/facade/artifacts/{rottay,bithire,evnto}/index.css`.
Todo número de este documento tiene su comando exacto citado; los scripts
completos viven en `/private/tmp/f2a0-measure.mjs` y
`/private/tmp/f2a0-residuo.mjs` (fuera del repo, no forman parte de la
entrega — el resultado ya está volcado en `data.json`).

---

## B. LO QUE FALSIFICA EXACTO

| # | predicción | medido | comando | veredicto |
|---|---|---|---|---|
| 1 | Σassignments = 261 = 95+96+70 | **rottay 95 · bithire 96 · evnto 70 · total 261** | `python3 -c "import json; d=json.load(open('packages/core/governance/manifest/cascade/catalog/index.json')); roots=d['roots']; tot={'rottay':0,'bithire':0,'evnto':0}; [tot.update({k: tot[k]+r['assignments'].get(k,0)}) for r in roots for k in tot]; print(tot, sum(tot.values()))"` | ✓ exacto |
| 2 | 34 asimétricas = 16 con cero + 18 sin cero (30 simétricas) | **34 = 16 + 18** (30 simétricas) | clasificación: `len(set(assignments[t] for t in temas)) > 1` sobre las 64 raíces | ✓ exacto |
| 3 | rottay en 0 en exactamente 7: tier.raised.fg, tier.overlay.fg, tier.overlay.bg, control.ratio.radius, state.delta.pressed, state.delta.expanded, effect.intensity | **las mismas 7, exactas** | filtro `assignments.rottay==0` sobre las 16 con-cero | ✓ exacto |
| 4 | bithire en 0 en exactamente 2: alpha.ladder, state.delta.checked | **las mismas 2, exactas** | filtro `assignments.bithire==0` sobre las 16 con-cero | ✓ exacto |
| 5 | evnto en 0 — la cifra histórica del roadmap decía 11/16 | **16/16** (todas las 16 con-cero incluyen evnto) | filtro `assignments.evnto==0` sobre las 16 con-cero | ✓ exacto — **resuelve la discrepancia histórica: el recompute del DT (16) es el correcto hoy; 11/16 es una cifra vieja del roadmap que no reproduce contra el catálogo actual** |
| 6 | 10 raíces `por-crear`: 0 declaraciones + 0 lectores en los 3 artefactos | **10/10 confirmadas, las diez en cero** | grep de `^\s*<canal>:` (declaración) y `var(<canal>)` (lector) en los 3 `index.css`, sobre los 10 canales `channelStatus:"por-crear"` | ✓ exacto |
| 7 | `--ds-color-primary`: declarado/congelado, mitad "6" del "6+15" | **6 declaraciones literales exactas** (2 por tema: base+modo) | `grep -n "^\s*--ds-color-primary:" packages/core/src/foundation/tokens/css/facade/artifacts/{rottay,bithire,evnto}/index.css` | ✓ exacto (la mitad "6"; la mitad "15" NO reproduce, ver §A.3) |
| 8 | H3 evnto: `--ds-card-border`/`--ds-card-border-color` declarados, con lectores | **1 declaración cada uno (sólo base, ninguno tiene override de modo); 0 lectores de `--ds-card-border`, 3 de `--ds-card-border-color`** | `grep -n "^\s*--ds-card-border\(-color\)\?:"` + `grep -c "var(--ds-card-border\(-color\)\?)"` sobre `evnto/index.css` | ✓ medido, sin predicción numérica previa que falsificar — dato nuevo |
| 9 | H4 bithire: `--ds-table-bg`/`--ds-table-row-bg` iguales entre sí, distintos de `tier.control.bg` | **base: ambos `var(--ds-surface-card)` (no `--ds-surface-control`); modo: ambos `#0f1520` literal (idénticos entre sí, ninguno de los dos alias)** | declaraciones de los 4 canales en `bithire/index.css` | ✓ confirmado: NO es cero-delta contra `tier.control.bg` (`--ds-surface-control`), bien excluido — mismo veredicto que la medición histórica |

---

## A. LO QUE NO FALSIFICA — parar acá

### A.1 `tier.page.fg`: predicción "42 con #A0A0A5" (rottay) — medido **13**, no 42

Cabeza: `--ds-sidebar-item-color`. Valor base de rottay: `#A0A0A5` (línea 843
del artefacto). Contando, en el bloque BASE únicamente (líneas 13–1210),
canales `--ds-*` cuyo valor declarado es textualmente `#A0A0A5` (insensible a
mayúsculas), **excluyendo la cabeza misma**:

```
awk 'NR>=13 && NR<1211' packages/core/src/foundation/tokens/css/facade/artifacts/rottay/index.css \
  | grep -oiP '^\s*--ds-[a-z0-9-]+(?=:\s*#A0A0A5\s*;)' | tr -d ' ' | sort -u | wc -l
```

Da **14** (13 excluyendo `--ds-sidebar-item-color`). La lista completa está en
`data.json` → `residuoF2.item2_tier_page_fg.rottay.matchingChannelsExcludingHead`
(13 canales: `--ds-color-accent`, `--ds-color-accent-500`,
`--ds-color-link-visited`, `--ds-color-neutral-500`, `--ds-color-primary-500`,
`--ds-color-secondary`, `--ds-color-secondary-500`, `--ds-color-text-page`,
`--ds-list-meta-description-color`, `--ds-list-secondary-text-color`,
`--ds-menu-dark-item-color`, `--ds-page-shell-subtitle-color`,
`--ds-text-secondary`).

**No es un subconjunto de la lista histórica** (`docs/f4a/medicion-f4a0/tier-page-fg-43.txt`,
42 canales): comparé por `diff` y NINGUNO de mis 13 aparece completo dentro de
esa lista de 42 salvo unos pocos (`--ds-color-text-page` sí coincide; la
mayoría de los 42 históricos — `--ds-avatar-default-color`,
`--ds-button-ghost-color`, `--ds-card-body-color`, etc. — **no tienen hoy el
valor `#A0A0A5`** en el artefacto de rottay). El árbol se movió entre la
medición de F4A-0 y hoy (múltiples packets F4B/F2 landearon en el medio);
esto NO es un error de método, es un número histórico que ya no describe el
árbol actual. **Medí bithire y evnto también**, mismo método, sus propios
valores cabeza: bithire (`#53697E`) → **17**; evnto (`#3d3d3d`) → **2**.
Ninguno de los tres reproduce ninguna cifra histórica que yo conozca; los
reporto como el estado de hoy, sin forzarlos.

### A.2 `--ds-color-primary`: la mitad "15" del "6+15" no la pude reproducir

La mitad "6" SÍ falsifica exacto (§B.7): 6 declaraciones literales, 2 por
tema. Para la mitad "15" probé tres lecturas y ninguna da 15:

1. **Comentario de congelamiento citado junto a la declaración**: busqué
   `freeze|congela|frozen|FROZEN|pin\b` en
   `packages/core/src/foundation/tokens/css/foundation/**` cerca de
   `color-primary` — **0 resultados**. Busqué también en los 3 fuentes TS
   autorados (`foundation/tokens/ts/presentation/brand-themes/{rottay,bithire,evnto}/index.ts`)
   alrededor de la asignación real del valor (`primaryColor: '#FFFFFF'`,
   rottay línea 3414) — sin comentario de congelamiento adjunto.
2. **Lectores totales por tema** (`grep -c "var(--ds-color-primary)"`
   contado por ocurrencia, no por línea): **rottay 53 · bithire 95 · evnto
   22** (total 170). Ninguno es 15, y el total tampoco.
3. **Comentarios "pin"/"pinned by hand"** en los 3 fuentes TS (cualquier
   mención, no sólo sobre `color-primary`): rottay 5, bithire 11, evnto 4
   (total 20) — tampoco 15.

No inventé una cuarta lectura para cerrar el número. Los datos crudos de las
tres están en `data.json` → `residuoF2.item3_color_primary`.

### A.3 Divergencia sistemática: "assignment" del catálogo ≠ "declaración" en el artefacto

Confirmado en los 10 `por-crear` (§B.6, 0 declaraciones) pero TAMBIÉN visible
dentro de las 34 asimétricas: `alpha.ladder` declara `assignments.rottay: 2`
en el catálogo (modos `base`+`light`) pero su canal `--ds-alpha-8` tiene **0**
declaraciones reales en `rottay/index.css` — el mismo patrón que
`docs/f4a/medicion-f4a0/baseline.md` §A.2 ya documentó para
`--ds-state-hover-shift`. No es un caso aislado de esta medición: es
estructural para toda raíz `por-crear` o `solo-artefacto` cuyo "assignment"
cuenta una intención del catálogo, no una escritura real en el CSS
compilado. Lista completa por raíz en `data.json` (comparar
`assignments.<tema>` contra `artifactMeasurement.<tema>.declarationCount` de
cada una de las 34).

---

## C. Las 34 asimétricas — tabla resumen

(Detalle completo, con línea y valor de cada declaración y cada consumidor,
en `data.json` → `asymmetricRoots`.)

### C.1 Las 16 con al menos un tema en cero

| rootId | channel | channelStatus | DD | rottay | bithire | evnto | tema(s) en 0 |
|---|---|---|---|---|---|---|---|
| tier.raised.fg | --ds-material-raised-foreground | existe | sí | 0 | 2 | 0 | rottay, evnto |
| tier.overlay.fg | --ds-material-overlay-foreground | solo-artefacto | sí | 0 | 2 | 0 | rottay, evnto |
| tier.accent.bg | --ds-surface-accent | por-crear | **NO** | 2 | 2 | 0 | evnto |
| tier.overlay.bg | --ds-material-overlay-background | existe | sí | 0 | 1 | 0 | rottay, evnto |
| control.ratio.padding | --ds-control-padding-ratio-label | por-crear | sí | 1 | 1 | 0 | evnto |
| tier.overlay.border | --ds-color-border | existe | sí | 2 | 2 | 0 | evnto |
| control.ratio.fontSize | --ds-input-md-font-size | existe | sí | 1 | 1 | 0 | evnto |
| control.ratio.lineHeight | --ds-input-md-line-height | existe | sí | 1 | 1 | 0 | evnto |
| control.ratio.iconSize | --ds-input-md-icon-size | existe | sí | 1 | 1 | 0 | evnto |
| control.ratio.gap | --ds-control-gap-ratio | por-crear | sí | 1 | 1 | 0 | evnto |
| control.ratio.radius | --ds-button-md-radius | existe | sí | 0 | 1 | 0 | rottay, evnto |
| state.delta.pressed | --ds-state-pressed-shift | por-crear | sí | 0 | 2 | 0 | rottay, evnto |
| alpha.ladder | --ds-alpha-8 | por-crear | sí | 2 | 0 | 0 | bithire, evnto |
| state.delta.checked | --ds-state-checked-shift | por-crear | sí | 2 | 0 | 0 | bithire, evnto |
| state.delta.expanded | --ds-state-expanded-shift | por-crear | sí | 0 | 2 | 0 | rottay, evnto |
| effect.intensity | --ds-effect-intensity | existe | **NO** | 0 | 1 | 0 | rottay, evnto |

**14 de las 16 son `derivationDebt: true`; 2 no lo son** (`tier.accent.bg` y
`effect.intensity`) — coincide exactamente con lo que
`docs/f4a/medicion-f4a0/baseline.md` §A.4 ya había medido sobre un conjunto
relacionado ("14 son derivationDebt:true y sólo 2 son de las 22"). Verificado
por columna sobre las 16, no heredado: `sum(1 for r in filas if r.derivationDebt)`.

### C.2 Las 18 sin ningún tema en cero (asimétricas por conteo, no por ausencia)

`state.delta.active` · `tier.page.ink` · `tier.accent.fg` · `spacing.step` ·
`type.scale` · `control.height` · `state.delta.focus` · `ramp.seed.accent` ·
`ramp.seed.success` · `ramp.seed.error` · `ramp.seed.warning` ·
`tier.accent.border` · `radius.base` · `scrim.opacity` ·
`state.delta.selected` · `type.leading` · `gradient.recipe` ·
`glass.recipe`.

(assignments completos, collapses, governedBy, exposure de cada una: `data.json`.)

---

## D. Los 6 ítems del residuo F2 — resumen

**1. Par `border`/`border-primary`.** Los TRES temas hoy tienen la MISMA
relación: `--ds-color-border-primary: var(--ds-color-border)` en el bloque
base, sin re-declaración en el bloque de modo (el modo sólo cambia
`--ds-color-border`, y `border-primary` seguí la cascada). Valores base:
rottay `#28282C`, bithire `#d4e0ea`, evnto `rgba(0,0,0,0.08)`; valores de
modo (sólo `border`): rottay `#E5E5E3`, bithire `#253545`, evnto `#2E2C24`.
**Nota**: la medición histórica (`docs/f4a/medicion-f4a0/baseline.md` §D.1)
decía que evnto tenía la relación "al revés" (`border` aliasando a
`border-primary`) — **hoy no es así**: los tres son consistentes, evnto
incluido. El árbol cambió entre esa medición y ésta. Hermanos declarados en
`packages/core/src/foundation/tokens/css/foundation/monochrome/index.css:62-63`
y `packages/core/src/foundation/tokens/css/foundation/themes/default.css:236-237`
(y su propio bloque de modo, `:2118`/`:2142`).

**2. `tier.page.fg`.** Ver §A.1 — no falsifica (13/17/2, no 42/?/?).

**3. `--ds-color-primary`.** 6 declaraciones literales exactas (§B.7); la
mitad "15" no reproduce por ninguna de 3 lecturas intentadas (§A.2).

**4. H3 evnto `--ds-card-border`/`--ds-card-border-color`.** Ambos
declarados una sola vez (bloque base, líneas 77/78), ambos alias directo de
`--ds-color-border`. Consumidores: `--ds-card-border` **0**;
`--ds-card-border-color` **3** (líneas 284, 285, 290 — todas dentro de
`--ds-premium-card-*`). `--ds-card-border` está declarado pero muerto en
evnto.

**5. H4 bithire `--ds-table-bg`/`--ds-table-row-bg`.** Base: ambos
`var(--ds-surface-card)` (NO `--ds-surface-control`, el canal de
`tier.control.bg`). Modo: ambos `#0f1520` literal, idénticos entre sí. 0
consumidores directos de ninguno de los dos canales en `bithire/index.css`.
`--ds-surface-card` y `--ds-surface-control` coinciden en base (`#FFFFFF`
ambos) pero divergen en modo (`var(--ds-color-bg-surface)` vs
`var(--ds-color-bg-primary)`) — confirma que `table-bg`/`table-row-bg` NO son
cero-delta contra `tier.control.bg`, correctamente excluidos.

**6. Las 10 `por-crear`.** Confirmado: 0 declaraciones y 0 lectores, las
diez, en los tres artefactos (§B.6).

---

## E. Verificación de write-set y entregables

```
git status --porcelain
 ?? docs/f2a/medicion-f2a0/data.json
 ?? docs/f2a/medicion-f2a0/baseline.md
```

Entregables:

```
docs/f2a/medicion-f2a0/data.json     tabla máquina: 64 raíces (summary), 34 asimétricas con
                                      medición de artefacto completa (declaraciones+consumidores,
                                      línea y valor), sección residuoF2 (6 ítems)
docs/f2a/medicion-f2a0/baseline.md   este documento
```
