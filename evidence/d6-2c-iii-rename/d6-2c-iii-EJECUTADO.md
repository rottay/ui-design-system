# D6-2c-iii — EJECUTADO. Rename cerrado BrandTheme -> FlatTheme.

Ejecutor: claude-admin (Opus). Base declarada: `9049d79b0`. **Cero commits.**
Brief + GO + ADDENDA del owner aplicados.

## 0. Deriva de base durante el lote (informativo, sin colisión)

HEAD se movió mientras trabajaba: el coordinador commiteó `ca53f0af9` y `fcb025468`.
Tocaron `evidence/.../ERRATA.md`, `probe/foundation/roster/fixtures/index.json` y `roadmap/**`.
Ninguno está en mi superficie de rename; mis 275 archivos siguen sin commitear. El digest de
referencia sobre `dist` sigue válido porque nada de eso entra al build.

## 1. Paso 0 — censos y colisiones

- Greps de colisión: **35 nombres del GO original = 0**, **17 nombres de clase C = 0**. Limpio.
- Censo de sitios de `brandTheme` (§4): 458 ocurrencias en 109 archivos, clasificadas por sitio.
  - 30 campo tipado del catálogo (`contracts/theme/runtime/catalog/index.ts:128` + filas)
  - 37 literales de string, TODOS la propiedad `TenantConfig.brandTheme`
  - 162 campo de entrada del fixture de tests (`FlatThemeFixtureInput.brandTheme`)
  - clave del adapter de scripts + `staticBrandThemePath` + `brandThemePath`
  - 12 declaraciones locales genuinas + ~14 parámetros

### SEXTA CLASE DE SITIO — decisión tomada, para revisión del DT

`FlatThemeFixtureInput.brandTheme` (declarado en `tests/support/theme-lowering/index.ts`, con
**162 sitios de construcción**) no es ni local ni ninguno de los cinco nombres de dato del §4.
No es superficie serializada: es un campo de interfaz en proceso, verificado por tsc.
**Lo dejé VERBATIM**, que es la opción conservadora: no renombrar lo no adjudicado. El gate §8
excluye tests, así que llega a 0 igual. Si el DT lo quiere renombrado es un sed + tsc.

## 2. Sustitución ejecutada

Mapa cerrado de **47 pares** sobre `src scripts tests showroom`, `*.ts *.tsx *.mjs`,
excluyendo `scripts/check/modern-rescue/**` y `governance/**`.

**264 archivos, 1913 sustituciones.** Más 11 ediciones manuales declaradas (abajo).

Verbatim confirmado con conteo exacto pre-lote: `brandThemePath` 36, `staticBrandThemePath` 21,
`compileBrandTheme` 25, `compileBrandThemeDeprecated` 7, `themeToBrandTheme` 5,
`CompileBrandTheme` 3, `brandThemeToBranding` 6, `brandThemeToCssVariables` 7.

### Las 11 ediciones manuales (todo lo que NO es sustitución mecánica)

1. `lowering/index.ts` 101/119/123/127/128 — local de PRODUCCIÓN `brandTheme` -> `flatTheme`.
2. `showroom torture-surface/index.tsx` 237..329 — local renombrado; el campo `source.brandTheme`
   y la clave de ventana `__probeBrandTheme` quedan (son dato).
3. `retired-identity/index.mjs:54` — REVERTIDO al nombre histórico por orden §9.
4. `themes/index.ts` — docblock de guardrail 5 sobre la declaración.
5. `file-export/index.ts` — docblock de guardrail 5 sobre el transporte de draft.
6. `iso/index.ts:1322` — prosa `BRANDTHEME` -> `FlatTheme` (§1).
7. `tenant-theme/index.ts:538` — `BrandThemeSurfaces.rhythm` -> `FlatTheme.surfaces.rhythm`
   (el tipo nombrado no existía: doc-rot previa, corregida a la forma real).
8. `modern-tenant-value-free.test.ts` 13/180/191 — prosa presente. La línea 173, fechada
   2026-08-02, queda VERBATIM por ser historia.
9. `Calendar.pass1-premium.test.tsx:269` — prosa.
10. `db-row-canary.test.ts:7` — prosa.
11. `spring-easing/index.ts:6` — prosa.

### Prosa dejada verbatim con razón

- `brandThemeToCssVariables`: 6 ocurrencias son DATO en el árbol sellado; la 7ª nombra una
  función que ya no existe -> historia.
- `brandThemeToBranding`: 6 comentarios de procedencia de un mapper borrado -> historia.
- `RETIRED_DOORS` y el pin negativo de `CompileBrandTheme` -> intactos.

### Superficies de dato NO renombradas, reportadas

- `src/foundation/i18n/.../locales/{en,es,fr,pt,ar}/components.json`:
  `"editorHeading": "Bounded BrandTheme fields"` es **copia de producto visible al usuario** en
  5 idiomas. No es identificador. Fuera del alcance de una sustitución cerrada. VERBATIM.
- `scripts/check/tokens/customization/visual-worklist/index.json` y
  `cascade/channels/theme-parity/baseline/index.json`: prosa en archivos de dato de gates; el
  segundo documenta `compileBrandTheme` como historia. VERBATIM.

## 3. STOP PARCIAL — el directorio `tests/fixtures/brand-themes/` NO se renombró

§9 manda STOP de esa parte si aparece UNA referencia de dato o baseline. Aparecen cuatro clases:

1. `scripts/package/artifacts/inventory/index.mjs:54` -> `const FIXTURES_DIR_REL = 'tests/fixtures/brand-themes'` (script de producción), con su drill pineando `dist/tests/fixtures/brand-themes/torture/index.js`.
2. `scripts/check/contracts/motion/registry/index.json` -> registro `verifiedBy` con digest que nombra la ruta actual de un finding relocalizado.
3. Árbol SELLADO: 5 referencias en `modern-rescue/{program,orchestration,art-direction,check}`.
4. `artifact-renderer/tests/single-author.test.ts:159` -> `expect(css).not.toContain('brand-themes')`, aserción sobre string.

## 4. Corrección de censo: el showroom NO estaba en 0

La tabla del DT decía "Showroom: 0". Medido: **104 ocurrencias en 31 archivos de
`showroom/src`**, más 7 archivos en `showroom/e2e` y 1 en `showroom/scripts`. Todos renombrados.
Identificador nuevo encontrado sólo ahí: `__probeBrandTheme`, clave de `window` escrita por la
página y leída por los specs de Playwright — es dato cruzado entre procesos, queda VERBATIM y
allowlisteada.

## 5. Guardrail 1 y 4 de la ADDENDA — diff real, no sólo conteos

**Prueba constructiva**: tomé cada archivo en HEAD, le apliqué el mapa cerrado y comparé con el
árbol de trabajo.

| | |
|---|---|
| archivos de fuente cambiados | 266 |
| normalizan a IDÉNTICO bajo el mapa (rename puro) | **255** |
| requieren explicación | 11 (exactamente las ediciones manuales de §2) |

`lowering/foundation/intake/index.ts` — el único archivo con `isGovernedActive` — está en el
conjunto PURO: su diff es rename y nada más, byte a byte. Su semántica gobernada sigue visible:

```
42:  charts: isGovernedActive(theme.charts) ? theme.charts.value : {},
47:  if (isGovernedActive(theme.motion)) brand.motion = theme.motion.value;
```

Invariantes, medidos sobre todos los archivos cambiados, HEAD vs árbol:

| invariante | HEAD | ahora |
|---|---|---|
| `\bas\b` | 2394 | 2394 |
| `@ts-(ignore\|expect-error\|nocheck)` | 6 | 6 |
| aserciones no nulas | 227 | 227 |
| `\bas\b` por archivo bajo `lowering/` | 141 total | 141, **idéntico archivo por archivo** |
| llamadas `isGovernedActive` bajo `lowering/` | 10 en 1 archivo | 10 en 1 archivo |

Barrido de narración: las únicas líneas de comentario NUEVAS son los dos docblocks del
guardrail 5. Nombran `WO-DER-08` porque el guardrail lo exige textualmente.

## 6. Typecheck — target corregido (ADDENDA §2)

| comando | target | resultado |
|---|---|---|
| `pnpm exec tsc --noEmit` desde `packages/core` | tsc 5.9.3, config resuelta | **exit 0** |
| control negativo: error de tipo plantado | mismo | **exit 2** (prueba que corre) |
| control negativo retirado | mismo | exit 0 |
| `pnpm --filter @rottay/design-system exec tsc --noEmit` | filtro SÍ matchea | **exit 0** |
| `pnpm run typecheck:tests` (core) | tsc 5.9.3 | **OK — 0 errors at baseline 0** |
| `pnpm --filter @rottay/core exec tsc --noEmit` | — | **reproducido: "No projects matched the filters", exit 0 sin ejecutar** |

### Showroom: no se puede typechequear en su arnés, y no es por el rename

`packages/showroom/node_modules` es un **symlink al checkout canónico**
`/Users/daniel/Developer/Rottay/ui-design-system/...`, cuyo `dist` es del **5 de septiembre**.
El showroom compila contra el build de otro árbol, diez días viejo.

Sondeado con un tsconfig temporal que apunta a MI `dist` (creado y borrado, no queda en el árbol):
**todos los errores `has no exported member 'FlatTheme'` desaparecen.** Residual: 4 errores, 3 de
identidad de tipo duplicada (artefacto de mezclar dos dist en la sonda) y 1 en
`torture-sections/tenant-branding/index.tsx:102` (`Theme` vs `FlatTheme`, por `Governed<BrandMotion>`)
en un archivo que **mi lote no tocó** — preexistente, de la familia gobernada de 2c-ii.
Los errores `IMPLEMENTED_ENGINE_NAMES` son los rojos preexistentes ya conocidos del showroom.

## 7. Aceptación del rename — forma de la ADDENDA §1

Receta del digest reproducida: `tar -cf - -T <lista>` + sha256. **El `dist` que tenía en disco ES
el build de referencia**: dio exactamente `f094034002807309ede4fbf6c16edcc055fb415c93d8f967a8256068a50aa114`.
Medido además que el tar crudo lleva mtime, así que el comparador operativo post-build es el
mapa de hashes por archivo, no el tar.

**Determinismo del build, probado**: corrí `pnpm build` dos veces (ambas exit 0) y los 1523
archivos salieron **byte-idénticos entre sí**. Así que toda diferencia contra la referencia es
del rename, no del build.

### Pata (a) — identidad estricta de salida visual/semántica

| | |
|---|---|
| archivos byte-idénticos | **1505 / 1523** |
| archivos CSS byte-idénticos | **16 / 16** |
| archivos que cambiaron | 18 |

**Los 16 CSS salen byte a byte iguales.** Canales, valores y orden no se movieron.

### Pata (b) — los 18 que cambiaron, contra el mapa cerrado

- **10** son alfa-equivalentes por construcción: misma secuencia de tokens, con biyección
  consistente entre identificadores. Sólo el minificador reasignó letras.
- **6** más quedan probados por literales de string idénticos + comparación enmascarada
  (identificadores de 1-2 caracteres normalizados) + listas de import/export ordenadas.
- **`preview-css/index.js`**: enmascarado idéntico; la "diferencia de literal" es mi lexer
  leyendo mal un literal de regex que contiene comillas.
- **`dist/index.js`** (el barrel) queda caracterizado por completo:
  **586 especificadores de módulo idénticos, 980 nombres públicos exportados idénticos,
  587 literales de string idénticos.** Sólo cambió el agrupamiento de sentencias y los alias.
- **1 archivo NO explicado contra el mapa**, y lo digo sin adornarlo:
  `dist/components/patterns/navigation/command-palette/runtime/application-commands/index.js`.
  No contiene ningún identificador renombrado, su FUENTE no está en mi diff, sus 3 dependencias
  no tienen exports renombrados, el barrel lo importa con el mismo alias (`nN`, línea 539) y su
  export público sigue siendo `useCommandPaletteItems`. No guardé su pre-imagen (sólo copié los
  28 archivos que llevaban la cadena), así que no puedo diffearlo.
  **Control que lo cierra**: construir el árbol pre-rename y diffear ese archivo. No lo corrí
  para no mutar el árbol dos veces sobre un lote de 275 archivos. Queda declarado, no rebaselineado.

## 8. Gates re-apuntados

- **theme-lowering-single-door**: enseñado `lowerFlatThemeFixture` (4 sitios). `RETIRED_DOORS`
  intacto verbatim. **64/64 verde, con todos sus positivos plantados.**
- **retired-identity**: detector concatenado PRESERVADO por §9. Positivo plantado corrido a mano
  porque el drill no lo cubre:
  - pata A: planto `platformBrandTheme` -> `FAIL (1 authored residues)` **ROJO**
  - pata B: planto `platformFlatTheme` -> `PASS`, o sea el punto ciego que el DT aceptó, medido
  - pata C: retiro el plantado -> `PASS` **VERDE**
  - drill completo 8/8, y el gate no importa ningún tipo renombrado (sólo fs/path/url/repo-root)

## 9. Gate de aceptación §8

Alcance: `src` (ts/tsx sin tests) + `scripts` (ts/tsx/mjs sin tests, sin modern-rescue) +
`showroom` (ts/tsx).

| identificador | ocurrencias | clase |
|---|---|---|
| brandTheme | 91 | dato §4.1/4.2/4.3 |
| brandThemePath | 32 | dato §4.5 |
| staticBrandThemePath | 9 | dato §4.4 |
| compileBrandTheme | 5 | clase A §2 |
| compileBrandThemeDeprecated | 2 | clase A §2 |
| BrandTheme | 1 | `retired-identity/index.mjs:54`, preservado por §9 |
| __probeBrandTheme | 1 | dato cruzado showroom/e2e |

**No allowlisteadas = 0. PASS.**

## 10. Changeset, contratos y manifiestos

- **Changeset MAJOR extendido**: 41 filas nuevas (59 en total), generadas desde el diff de
  superficie medido con la API del propio gate. Prosa corregida (el rename ya ocurrió) y la fila
  `signature .#BrandTheme` re-apuntada a `.#FlatTheme`.
- **Cruce en los dos sentidos** (ADDENDA §1.3), con `coverSurfaceChanges`:
  - **Dirección 1**: cambios de superficie sin fila = **0**.
  - **Dirección 2**: 14 filas sin cambio en ESTE rango — son las del lote 2c-ii previo en el
    mismo changeset MAJOR (`rottayBrandTheme`, `baselineFor`, `VERTICAL_REGISTRY`, ...).
    Ninguna de mis 41 queda huérfana.
- Superficie pública renombrada, medida: **8 exports** — `BrandTheme`, `BrandThemeMode`,
  `BrandThemeModes`, `BrandThemeModeOverlay`, `serializeBrandTheme`, `deserializeBrandTheme`,
  `brandThemeToTenantAppearance`, `brandThemeToTenantAppearanceAdvanced` — más 33 firmas
  arrastradas. Ningún nombre de clase C es alcanzable desde la raíz (todos viven en `scripts/`).
- **`contracts/runtime/suppliers/index.json`**: 8 entradas renombradas a mano y re-ordenadas
  (las dos listas estaban ordenadas). Diff exacto 8+/8-.
- **`contracts/css/hooks/index.json`**: regenerado con `hooks:generate`. Diff = **43 `BrandTheme`
  -> 43 `FlatTheme` y NADA más** (verificado: cero líneas del diff sin la cadena).
  `hooks:check` verde. `index.d.ts`: 1 comentario reescrito a mano (no es generado).

## 11. Docs (guardrail 6)

- **35 docs activos en alcance, 32 escritos, 84 sustituciones.** Residual: 20 líneas, todas
  `TenantConfig.brandTheme` allowlisteado o `compileBrandTheme` histórico. Más un local en un
  ejemplo de código de `runtime/tenancy/README.md:467`, renombrado.
- **Excluidos como historia**: `docs-engineering/archive/**`, `docs-engineering/engineering/audits/**`
  (auditorías fechadas), `verticals/bithire/audit/**`, `docs/history/**`, `docs/evidence/**`,
  `packages/core/docs/history/**`. No se reescribe historia.
- **`CLAUDE.md`**: la cláusula falsa de la línea 380 ("may survive only as a deprecated
  compatibility alias") reescrita a los dos roles reales, con WO-DER-08 como dueño del split.
  Título de sección y la línea de charts renombrados.
- **Guardrail 5**: docblock en la declaración de `FlatTheme` y en el transporte de draft del
  studio. Ninguno dice "read view" como si fuera el único rol.
- `docs/architecture/index.md` no nombra el tipo (0 ocurrencias); no se tocó.

## 12. Suites focales

`vitest run` sobre single-door + todo `lowering/` + brand-studio + tenant-preview +
preview-scope + theme-contract-freeze:

**49 archivos, 1114 / 1114 verde.** 130 s.

## 13. Estado final

```
$ git status --porcelain | grep -v node_modules | wc -l
275
$ git log --oneline -2
fcb025468 docs(roadmap): audit d6-main-2026-09-15 applied ...
ca53f0af9 test(probe): repair the card fixture's inset-shadow selector ...
```

Cero commits. Árboles sellados (`modern-rescue`, `governance`) sin un solo byte cambiado.
`roadmap/**` sin tocar.

Write set: 275 archivos — 185 `src`, 32 `scripts`, 26 `showroom/src`, 15 `tests`, 6 `showroom/e2e`,
5 `docs`, 3 `contracts`, 1 `showroom/scripts`, `CLAUDE.md`, el changeset.
Más 32 archivos en el repo `docs-engineering` (fuera de r4-recon-opus).

## 14. Para el DT

1. Decidir la sexta clase de sitio: `FlatThemeFixtureInput.brandTheme` (162 sitios), dejado verbatim.
2. Registrar el STOP parcial del directorio `tests/fixtures/brand-themes/` con sus 4 bloqueos.
3. Registrar el residual sellado: 105 ocurrencias (35 en modern-rescue, 70 en governance).
4. Registrar la copia i18n "Bounded BrandTheme fields" en 5 locales como decisión de producto.
5. Cerrar el único byte no explicado con el control de build pre-rename sobre ese archivo.
6. El showroom necesita su `dist` propio para typechequearse; hoy lee el canónico del 5-sep.
7. `brandThemePath`, `staticBrandThemePath`, el campo del catálogo, la propiedad de `TenantConfig`,
   la clave del adapter y `__probeBrandTheme` van a WO-DER-08 como superficie serializada.
