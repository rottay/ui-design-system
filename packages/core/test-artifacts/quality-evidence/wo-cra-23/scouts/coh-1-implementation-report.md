# COH-1 — Implementation report (Sonnet)

**Fecha:** 2026-08-30 · **Rol:** Sonnet (implementación) · **Repo:** worktree aislado
`/Users/daniel/Developer/Rottay/ui-design-system-coh-1` (rama `wo-cra-23/coh-1-status-tints`,
HEAD `e14213be86ee750e702a37f75070a00112a7e733`)

**Autoridad seguida:** `coh-1-opus-formula-review.md` (fórmula adjudicada, repo principal,
solo-lectura). Cero desviaciones de la fórmula en sí. Dos desviaciones de alcance quedan
documentadas en la sección F, ambas por ausencia de un artefacto en esta rama, no por
decisión propia.

---

## A. Fórmula implementada (sin cambios respecto a la adjudicación)

```
-bg               = var(--ds-color-{tone}-50)
-border           = color-mix(in srgb, var(--ds-color-{tone}) 20%, transparent)
alpha-{tone}-10   = color-mix(in srgb, var(--ds-color-{tone}) 10%, transparent)
alpha-{tone}-20   = color-mix(in srgb, var(--ds-color-{tone}) 20%, transparent)   [no info-20]
-ink              = sin cambios (default.css:480-483, autoridad tinted-well-tone-ink)
```

Ancla: el **canal propio del tono** (`--ds-color-{tone}`), nunca el paso `-500`. Guard: el
piso solo emite para un tono si el bloque que compila lleva el seed de ese tono
(`if (!palette[\`${role}Color\`]) continue`).

---

## B. Qué cambió, por archivo

### B.1 `infrastructure/compilers/kernel/runtime/brand-theme/index.ts` (compilador — Parte 1 y 2)

- **`deriveStatusTintFloor(palette)`** (nueva, exportada) — el piso. Itera `ON_TONE_ROLES`;
  por tono con seed presente, emite `-bg`, `-border`, `alpha-10` y (excepto `info`)
  `alpha-20`. Mergeada en `brandThemeToCssVariables` inmediatamente antes de
  `setExtendedPaletteVariables` (misma posición que el piso existente
  `deriveExtendedPaletteFloor`), así que un canal autorado sigue ganando por canal.
- **`STATUS_SEED_SHADOWING_FIELDS`** (nueva tabla hermana, exportada, 15 entradas: 4 tonos ×
  bg+border+alpha10 + 3 alpha20) — **no** se extendió `SEED_SHADOWING_FIELDS` (la tabla
  primaria), tal como exige la adjudicación (rompería el cierre `SEED_FAMILY` de
  `provenance-acceptance.test.ts:120-215`).
- **`applyTenantStatusSeedDerivations`** (nueva función, sitio A hermano) — re-deriva
  bg/border/alpha de un tenant DB sobre un baseline que aún hornea un literal, con las
  mismas 3 guardas que `applyTenantSeedDerivations`: (1) el seed de ESE tono es del tenant,
  (2) un leaf tenant sobre el canal derivado gana (`STATUS_SEED_SHADOWING_FIELDS`), (3) un
  valor que no cuece color propio se conserva (`bakesItsOwnColor`). Llamada en los dos
  mismos sitios que la función primaria (`compileModeBlocks` y el bloque base de
  `compileBrandTheme`).
- **Hallazgo y corrección durante la implementación (no en la fórmula, en el mecanismo de
  provenance):** la guarda 1 original, calcada del patrón primario
  (`authoredPaths.has(...)`), producía falsos positivos. `collectPatchAuthoredPaths`
  enumera un keypath por su sola PRESENCIA como clave del objeto, incluso con valor
  `undefined` — y `migrate-v1`'s `paletteFields()` construye SIEMPRE las cuatro claves de
  estado (`successColor`, `warningColor`, `errorColor`, `infoColor`), autoradas o no. Un
  documento DB que solo toca `backgroundMode` (sin tocar ningún seed de estado) hacía que
  `authoredPaths` contuviera `modes.light.palette.errorColor` de todos modos, y la guarda 1
  trataba a `error` como tenant-autorado sin serlo — verificado en vivo: rompía
  `--ds-color-alpha-error-10` de **rottay** (que sí autora ese campo en su overlay light)
  aun cuando ningún documento de prueba tocaba `error`. Corregido **sin tocar la función
  compartida** `collectPatchAuthoredPaths` (usada también por la familia primaria; tocarla
  sale del paquete acotado de COH-1): la nueva firma de `applyTenantStatusSeedDerivations`
  recibe `toneSeedIsTenantAuthored: Record<OnToneRole, boolean>`, precomputado por el
  *caller* leyendo el **valor crudo del `tenantPatch`** (`tenantPatch?.palette?.[...]` /
  `tenantPatch?.modes?.[mode]?.palette?.[...]`), no la mera pertenencia al Set. Esto exigió
  agregar un parámetro `tenantPatch` a `compileModeBlocks` (antes no lo recibía; el tema ya
  llegaba resuelto). Ver el docblock de la función para el detalle completo.

### B.2 `foundation/tokens/ts/presentation/brand-themes/bithire/index.ts`

- Retirados los 8 literales light: `successBgColor`, `successBorderColor`,
  `warningBgColor`, `warningBorderColor`, `errorBgColor`, `errorBorderColor`,
  `infoBgColor`, `infoBorderColor` (el bug: verde horneado ajeno al seed azul).
- Retirado el verde horneado del chrome de input (`chrome.controls.input.successBorder`
  `"#2F8B68"` → `"var(--ds-color-success)"`; `successBg` `"color-mix(in srgb, #2F8B68 4%,
  #FFFFFF)"` → `"color-mix(in srgb, var(--ds-color-success) 4%, #FFFFFF)"`), en paridad con
  el overlay dark del mismo control.
- Dark **no tocado** (ya hue-consistente con el seed azul, confirmado cero-delta).

### B.3 `foundation/tokens/ts/presentation/brand-themes/evnto/index.ts`

- Retirados los 4 `*BgColor` light (corrección mínima sub-perceptual: `#f0fdf4`→`#F5FFF6`
  success, etc.) y los 4 `*BorderColor` light (cero-delta byte: cada uno ya autoraba
  exactamente la cadena que el piso emite).
- Dark **no tocado**.

### B.4 `foundation/contracts/composition/tenants/capabilities/index.ts`

- Control `palette.status-seeds`: `derivedChannels` 68 → 83 (+8 bg/border, +7 alphas;
  `--ds-color-alpha-info-20` sigue excluido — retirada ejecutada, `residual-adjudication.json`).
  Reescrito el comentario "deliberately EXCLUDED" (ya no es cierto) y la prosa `compat`.
  `--ds-color-info-ink` sigue excluido (autoridad `tinted-well-tone-ink`, sin relación).

### B.5 `ui/patterns/customization/brand-studio/index.tsx`

- `SEMANTIC_GROUND`: retiradas las 4 entradas `-bg` (la tercera fórmula, seed al 12%, que el
  piso vuelve redundante-o-divergente). Quedan solo los 4 seeds.

### B.6 Artefactos regenerados (mecánicos, no editados a mano)

- `manifest/controls/*.json` (20 archivos) — `registryDigest` se mueve en TODOS porque es
  `sha256` del archivo completo `capabilities/index.ts`; solo `palette.status-seeds.json`
  cambia de contenido real (`derivedChannels`/`calibration.channels`/`compat`).
  `manifest/index.json`, `manifest/generated/slot-inventory.json` regenerados en cadena.
- `scripts/tokens/slot-inventory/slot-inventory.baseline.json` — ratchet decrece-only, 3
  contadores bajados con razón escrita: `rows` 3629→3613 (-16, los 16 campos retirados),
  `unassignedRows` 297→286 (-11), `rowsWithoutRootAttribution` 1443→1437 (-6).
- `supplier-contract.json` — +2 exports públicos (`deriveStatusTintFloor`,
  `STATUS_SEED_SHADOWING_FIELDS`).
- `hooks-manifest.json` — `compilerEmissionPatterns` 12→14 (los 2 nuevos patrones de
  derivación); 4 canales `-bg` salen de la lista de "component tokens" (ya no son literales
  de componente, son referencias del compilador).
- `src/foundation/tokens/css/facade/artifacts/{bithire,evnto,rottay}/index.css`,
  `styles/*.css` — regenerados por `pnpm build`.

---

## C. Tabla antes/después por canal por vertical

Todos los valores "antes" son de `git show HEAD:...`; "después" del artefacto compilado
tras el build de esta sesión.

### C.1 bithire (light) — el bug, corregido

| canal | antes | después | clase |
|---|---|---|---|
| `success-bg` | `#f0fdf4` (verde) | `var(--ds-color-success-50)` = `#F0F9FF` (azul) | **corrección mayor** |
| `success-border` | `rgba(5,118,66,0.25)` (verde) | `color-mix(..success 20%..)` = `rgba(50,124,168,0.20)` | **corrección mayor** |
| `warning-bg` | `#fffbeb` | `var(-50)` = `#FFF6EA` | menor |
| `warning-border` | `rgba(231,163,62,0.25)` | `rgba(214,160,78,0.20)` | menor |
| `error-bg` | `#fef2f2` | `var(-50)` = `#FFF5F4` | menor |
| `error-border` | `rgba(204,16,22,0.25)` | `rgba(197,80,76,0.20)` | menor |
| `info-bg` | `#f0f7ff` | `var(-50)` = `#F3F8FF` | menor |
| `info-border` | `rgba(10,102,194,0.25)` | `rgba(58,111,176,0.20)` | menor |
| `alpha-success-10/20` | `rgba(34,197,94,·)` (foundation verde) | `color-mix(..success·)` = `rgba(50,124,168,·)` | **corrección mayor** |
| `alpha-warning-10/20` | `rgba(245,158,11,·)` | `rgba(214,160,78,·)` | menor |
| `alpha-error-10/20` | `rgba(239,68,68,·)` | `rgba(197,80,76,·)` | menor |
| `alpha-info-10` | `rgba(59,130,246,·)` | `rgba(58,111,176,·)` | menor |
| chrome input `successBorder` | `#2F8B68` (verde) | `var(--ds-color-success)` | corrección (adyacente) |
| chrome input `successBg` | `color-mix(..#2F8B68..)` | `color-mix(..var(--ds-color-success)..)` | corrección (adyacente) |
| **dark** (los 8 + input) | autorado, hue-consistente | **sin cambio** | N/A |

### C.2 evnto (light)

| canal | antes | después | clase |
|---|---|---|---|
| `success-bg` | `#f0fdf4` | `var(-50)` = `#F5FFF6` | corrección menor |
| `warning-bg` | `#fefce8` | `var(-50)` = `#FFFBF7` | corrección menor |
| `error-bg` | `#fef2f2` | `var(-50)` = `#FFFBFA` | corrección menor |
| `info-bg` | `#f8fafc` | `var(-50)` = `#FAFCFF` | corrección menor |
| `*-border` (4) | ya `color-mix(..20%..)` | idéntico | **cero-delta byte** |
| `alpha-*` (7) | nunca autorado, heredaba foundation | sigue al seed propio | corrección (info es slate, ya no azul) |
| **dark** (bg + los que ya derivaban) | — | **sin cambio** | N/A |

### C.3 rottay (sin tocar el vertical; 2 canales nuevos, no reclasificados, en dark)

| canal | antes | después | clase |
|---|---|---|---|
| `-bg`, `-border`, `alpha-*-20`, `alpha-success/warning-10` (light+dark) | autorado propio | **sin cambio** | N/A (ceiling gana) |
| `alpha-error-10` (dark) | no emitido explícito; foundation `rgba(239,68,68,0.10)` vía cascada | `color-mix(..error..)` = `rgba(248,113,113,0.10)` | corrección mínima (nuevo canal explícito) |
| `alpha-info-10` (dark) | no emitido explícito; foundation `rgba(59,130,246,0.10)` | `color-mix(..info..)` = `rgba(96,165,250,0.10)` | corrección mínima (nuevo canal explícito) |
| `alpha-success-10` (dark) | ídem, foundation `rgba(34,197,94,0.10)` | `color-mix(..success..)` = **mismo RGB** (`rgba(34,197,94,0.10)`) | cero-delta byte, nuevo canal explícito |
| `alpha-warning-10` (dark) | ídem, foundation `rgba(245,158,11,0.10)` | mismo RGB | cero-delta byte, nuevo canal explícito |

### C.4 `:root` (default.css) — no tocado

Verificado byte-exacto (`coh-1-status-tint-floor.test.ts`, bloque T4): las 8 líneas
`:197-203` (alpha) y `:252-259` (bg/border) son idénticas a HEAD.

### C.5 DB tenant sobre un baseline que aún hornea (mecanismo, no bithire hoy)

Bithire ya no bakea nada, así que el defecto original del scout §5.5 quedó cerrado por la
Parte 1 sola para bithire. La Parte 2 (`applyTenantStatusSeedDerivations`) sigue siendo
necesaria en general: verificado con un clon sintético de bithire que re-hornea
`successBgColor`/`successBorderColor` — un tenant que solo autora su propio seed
`palette.status.success` sí sobrescribe el literal horneado con la fórmula derivada
(`coh-1-status-tint-tenant-derivation.test.ts`, bloque "guard 1 mechanism").

---

## D. Tests corridos y resultados

### D.1 Nuevos (T1-T5 del plan de verificación de Opus, sección E.1)

- `foundation/tokens/__tests__/coh-1-status-tint-floor.test.ts` — **33/33 verde**. Cubre T1
  (piso por tono y por ausencia, precedencia por canal), T3 (bg/border cero-delta ya
  cubierto por el mecanismo general), T4 (`:root` congelado), T5 (contraste ink/pozo,
  computado desde el compilado, no copiado del review — bithire light success clears WCAG
  AA para texto grande).
- `infrastructure/compilers/composition/tenant-theme/tests/coh-1-status-tint-tenant-derivation.test.ts`
  — **8/8 verde**. Cubre T2 completo: seed passthrough, re-derivación de la rampa,
  guard 1 (mecanismo, vía clon sintético con literal horneado), guard 2 (tenant leaf gana),
  guard 3 (`bakesItsOwnColor`), case C (silencio no mueve nada).

### D.2 Blast radius (pedido explícito del encargo)

- `brand-authored-residue-retirement.test.ts` — **72/72 verde**. 2 pines de valor
  actualizados (`:1064` bithire, evnto equivalente) + 2 hashes re-firmados
  (`B29 default light`, `E25 default light` — moviéndose legítimamente porque 8/4 canales
  de esos rosters cambiaron de valor por diseño) + el pin de "evnto dark mode adds exactly
  the 3 signed reset pins" (antes 7 — los 4 status `-bg` se retiran del delta de dark
  porque light ahora resuelve a la MISMA cadena que dark ya autoraba).
- `provenance-acceptance.test.ts` — **23/24 verde** en aislamiento; el 1 rojo restante
  (`case D: the bithire DEFERRED-7 ...--ds-button-primary-bg`) es **pre-existente,
  confirmado en HEAD sin ningún cambio mío** (ver sección E). 2 pines de conteo
  actualizados con aritmética completa (`rottay` 1192→1196, `bithire` 1229→1236, `evnto`
  468→475 — los tres cuadran exactamente con "+7 alphas nunca antes emitidos" por vertical,
  medido, no estimado).
- `mass-c3-bithire-drain.test.ts` — verde, sin cambios necesarios (confirmado: sus
  referencias a "successBorder" son de `chrome.controls.select`, una familia distinta).
- `modern-tenant-value-free.test.ts` — **5/5 verde**. Retirada la entrada
  `KNOWN_TENANT_LITERALS` para `#f0fdf4`/`#fef2f2`/`#fffbeb` (los únicos 3 claimants
  desaparecieron del `TENANT_COLORS` al retirar los campos; verificado por grep que ningún
  otro campo de ningún vertical usa esos 3 hex).
- `tone-ink-authority.test.ts` — 7/9 verde; 2 rojos **pre-existentes, confirmados en HEAD
  sin ningún cambio mío y persistentes después de un build limpio** (ver sección E).

### D.3 Barrido amplio (no pedido explícitamente, hecho para cerrar con confianza)

`vitest run src/foundation/tokens src/infrastructure/compilers
src/ui/patterns/customization/brand-studio` (3348 tests): comparado test-por-test contra la
misma corrida sobre HEAD puro (mismo comando, arbol restaurado vía `git stash`/`git show`
temporal, jamás con `git checkout --`/`git reset` sobre el arbol vivo). **Cero fallos
nuevos.** El diff de la lista de fallos es exactamente:
- 23 líneas que faltan en HEAD (mis tests nuevos, rojos por diseño antes de existir el
  mecanismo — verdes ahora) — desaparecen, no aparecen.
- 4 líneas que aparecían solo con mi cambio (`rottay-t1-mass-drain.test.ts`, las mismas 4
  filas dark alpha-10 de C.3) — **corregidas** en este mismo lote (ver D.4).
- Las 57 restantes son **idénticas** en ambos árboles.

### D.4 Corrección de un test de blast radius no listado en el encargo

`rottay-t1-mass-drain.test.ts` — el piso ahora emite explícitamente
`--ds-color-alpha-{error,info,success,warning}-10` en el bloque dark de rottay, canales que
antes NUNCA aparecían en `cssVariables` (caían a la cascada de `default.css:root`). El test
"the deleted channels were derivations, not paint" resolvía esos 4 canales contra un mapa
`FLOORS` grabado estáticamente (una foto de la cascada de antes); ahora hay un productor
real y el mapa quedó obsoleto para esas 4 filas exactas. Corregido: las 4 filas se excluyen
del loop genérico (`deleteRowsPreCoh1Floor`) y se verifican en un bloque nuevo
`COH-1 — the four superseded dark alpha-10 rows...` que prueba, desde el artefacto
compilado (no copiando cifras del review): (a) la fórmula exacta que emite cada una, (b)
que success/warning son cero-delta byte (el seed dark de rottay coincide con el default de
foundation) y (c) que error/info difieren del default de foundation (corrección mínima
intencional, no invento un color). **6/6 verde.**

### D.5 Gates mecánicos

- `pnpm -C packages/core build` — **OK**. Conteos de variables compiladas: rottay 1196,
  bithire 1236, evnto 475 (cuadran exacto con los pines de D.2).
- `pnpm -C packages/core typecheck` — **OK**.
- `pnpm -C packages/core structure:check` — **OK**, 0 findings.
- `node manifest/generator/index.mjs --check` — **OK** salvo la staleness de evidence
  receipts F4B (ver sección E, pre-existente).
- `node scripts/tokens/slot-inventory/index.mjs --check` — **OK, ledger 6/6 en su ancla**.
- `pnpm -C packages/core lint:artifacts` — **OK**, los 3 artifacts al día.

---

## E. Hallazgos pre-existentes, NO introducidos por COH-1 (confirmados contra HEAD puro)

Verificado en cada caso restaurando temporalmente el árbol a `git show HEAD:...` (nunca
`git checkout --`/`git reset` sobre el árbol vivo; siempre vía copia manual o
`git stash push -u` con mensaje único, aplicado con `git stash apply <sha>` y confirmado
byte-exacto antes de dropear), corriendo el mismo test, y restaurando mis cambios después.

1. **`provenance-acceptance.test.ts` — "case D: the bithire DEFERRED-7"** —
   `--ds-button-primary-bg` no aparece en el delta. Causa: `chrome.controls.buttonPrimary.bg`
   de bithire ya está autorado como `"var(--ds-color-primary)"` — la MISMA cadena literal
   que `derivePrimarySemantics` derivaría — así que el delta nunca lo muestra (mismo
   principio que C.3, pero para la familia primaria). Confirmado rojo en HEAD sin tocar una
   línea.
2. **`provenance-acceptance.test.ts` — "keeps the shipped first-party variable counts"
   (evnto: 460 vs pin 468)** — pre-existente; una divergencia entre `compileBrandTheme`
   directo (468) y `compileTheme(FIRST_PARTY_THEMES.evnto)` (460) que ya existía en HEAD, no
   relacionada a status. No tocado (fuera del paquete acotado).
3. **`tone-ink-authority.test.ts` — 2 filas (`bithire` warning-ink, `rottay` info-ink)** —
   pines de valor esperado que no coinciden con el bundle compilado, confirmado en HEAD
   **antes y después de un build limpio** (así que no es staleness de dist). No relacionado
   a status tints (ink de warning/info, no bg/border/alpha).
4. **`f4c-canary-capture.mjs` no existe en este worktree.** El punto de rama de este
   worktree (`e14213be8`, "entry 25") es ANTERIOR al commit del repo principal que introdujo
   el harness F4C (`23426a0e1`, "F4C canary CERRADO", posterior en el log de main). Por
   tanto **`UNDECLARED_CHANNELS_WATCHED`/`DECLARED_PARTIAL_PROPAGATION`, que el encargo pide
   actualizar, no se pudieron tocar — el archivo no existe en esta rama.** Esto no es una
   decisión mía: es que el artefacto que había que editar todavía no había llegado a esta
   rama cuando se cortó. Queda pendiente para cuando este trabajo se integre con (o se
   re-base sobre) el estado de main posterior a `23426a0e1`.
5. **Evidence receipts F4B (`test-artifacts/quality-evidence/wo-cra-23/F4B/**/*.receipt.json`)
   ya estaban stale contra el árbol en HEAD**, antes de cualquier edición mía (confirmado
   restaurando el árbol completo y corriendo `manifest/generator/index.mjs --check`). Mis
   ediciones (capabilities/index.ts, bithire, evnto) mueven el digest de MÁS receipts
   (comparten "owned files" con muchos controles no relacionados a status), pero la
   condición "stale" en sí no la causo yo. No re-capturé evidencia F4B — es un proceso de
   captura por navegador, fuera del paquete acotado de COH-1 y de mi rol de implementador.

## F. Desviaciones de la fórmula adjudicada

**Ninguna en la fórmula misma.** Las únicas desviaciones son de ALCANCE, ambas por ausencia
de un artefacto que el encargo asumía presente en este worktree:

1. No se tocó `packages/showroom/scripts/f4c-canary-capture.mjs` (no existe en esta rama —
   ver E.4).
2. No se registró `applyTenantStatusSeedDerivations` en `CONSULTED_PROVENANCE_FIELDS`
   (`foundation/contracts/composition/tenants/themes/iso/index.ts`). Es una decisión
   deliberada, no un olvido: ese vocabulario cerrado está test-cerrado
   (`provenance-acceptance.test.ts`, "the consulted-provenance authority is closed") como
   *exactamente* la unión de las tablas de los DOS sitios existentes (primario, sidebar), y
   el review de Opus — exhaustivo en su análisis de blast radius (sección D) — nunca lo
   menciona como parte del write-set. Ensancharlo unilateralmente sería exceder el paquete
   acotado. Documentado aquí como deuda nombrada: hoy no hay ningún campo real que pueda
   rellenar `palette.{tone}Color` por accidente (verificado: ningún perfil expresivo toca
   campos de paleta), así que no hay vulnerabilidad activa, solo una cobertura de fence más
   angosta que la que tendría si un DT decide ensancharla en un lote propio.

---

## G. Commits

Ver `git log` de esta rama para los commits de este lote (mensaje convencional, sin
co-autor, sin push).
