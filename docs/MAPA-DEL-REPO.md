# Mapa del repositorio ui-design-system

Qué es cada carpeta, qué hace y dónde algo está escrito dos veces.

Medido el 2026-08-18 sobre el commit `9da1032b5`, recorriendo el árbol carpeta por
carpeta. Los conteos son de disco (`find -type f`) y de git (`git ls-files`),
excluyendo `node_modules/`, `.git/` y `dist/`.

Este documento es descriptivo: dice lo que hay, no lo que debería haber. Cuando el
texto marca `[DUPLICA]` significa que dos carpetas hacen el mismo trabajo, y
`[SIN CONSUMIDOR]` que nada fuera de la propia carpeta la importa.

## Verificación independiente

Las 204 afirmaciones marcadas `[DUPLICA]` o `[SIN CONSUMIDOR]`, más las cinco
afirmaciones fuertes de la cabecera, fueron revisadas una por una por un segundo
lector que no escribió este mapa, contra el árbol real:

| bloque | de acuerdo | en desacuerdo | sin poder verificar |
|---|---:|---:|---:|
| `foundation/` + `infrastructure/` | 92 | 1 | 0 |
| `ui/` | 41 | 9 | 0 |
| `graphics/` + `entrypoints/` + `tooling/` | 22 | 0 | 0 |
| `packages/core` fuera de `src/` + raíz | 33 | 4 | 0 |
| **total** | **188** | **14** | **0** |

Los 14 desacuerdos ya están corregidos en el cuerpo del documento. Ocho de ellos
son el mismo error de método y vale la pena nombrarlo: al marcar `[SIN CONSUMIDOR]`
no conté como consumidores los tests de contrato de `packages/core`, los fixtures
internos de `brand-studio`, ni las páginas `probe/`, `torture-sections/` y
`kit-inventory` del showroom. Ocho componentes marcados como huérfanos sí tienen
quién los use. **El alcance de la medición es parte del resultado.**

El más caro de los otros seis: `modern-rescue/probe/` no es una carpeta duplicada.
Cinco de sus siete archivos son dependencia directa de la sonda de la raíz, que los
importa en sus líneas 76-84. Borrar la carpeta entera, como el texto original
sugería, rompía la sonda de arriba.

---

## Cifras

| | archivos | en git | peso |
|---|---:|---:|---:|
| `packages/core/src/` | 3.989 | 3.989 | 32 MB |
| `packages/core/scripts/` | 632 | 632 | 76 MB |
| `packages/core/docs/` | 158 | 158 | 934 KB |
| `packages/core/styles/` | 6 | 6 | 26 MB |
| `packages/core/test-artifacts/` | 589 | 589 | 49 MB |
| `packages/showroom/` | 1.137 | 929 | 47 MB |
| `roadmap/` + `roadmap-commercial/` | 54 | 54 | 2 MB |
| `scripts/` (raíz) | 24 | 24 | 624 KB |
| `docs/` (raíz) | 2 | 2 | 43 KB |
| `test-artifacts/` (raíz) | 7.577 (6.523 sin contar `node_modules/`) | 203 | 479 MB |

Carpetas descritas en este mapa: **1.400**, de las cuales 587 en `foundation/` e
`infrastructure/`, 422 en `graphics/`, `entrypoints/` y `tooling/`, 295 en `ui/`,
96 en la raíz y el showroom.

## Lo que está escrito dos veces

Resumen; el detalle está en cada sección.

1. **Dos compiladores al mismo destino.** `infrastructure/compilers/kernel/runtime/appearance/`
   y `.../brand-theme/` emiten los mismos canales `--ds-*`, contra la ley de un solo
   compilador. El camino real de base de datos ya usa solo `brand-theme`.
2. **Dos CLIs de quality-evidence, los dos enchufados.** `quality-evidence/cli.mjs`
   corre por `quality-evidence:check`; `v2/cli.mjs` corre por `quality-evidence:v2:*`.
   v2 no reusa nada de v1, y el propio README declara v1 "historical baseline only,
   may not be cited as coverage" mientras el comando sigue ejecutándolo en CI.
3. **Dos sondas de cascada con el mismo nombre.** `modern-rescue/cascade-probe.mjs`
   (776 líneas, en inglés) y `modern-rescue/probe/cascade-probe.mjs` (2.729 líneas,
   en español). Ninguna la invoca nada y ningún glob de tests las alcanza. Ojo: el
   duplicado es SOLO ese archivo dentro de `probe/`. El resto de `probe/`
   (`css-parse`, `css-model`, `leg1-symbolic`, `leg2-chromium`, `value-eval`) son
   dependencias reales de la sonda de la raíz, que las importa en sus líneas 76-84.
   Borrar `probe/` entero rompe la sonda de arriba.
4. **El chrome de colección, escrito en `patterns/` y en `structures/`.**
   `list-toolbar`/`table-toolbar`, `column-settings`/`column-menu`,
   `saved-views`/`saved-views-menu`, `filter-panel`/`field-filters-panel`.
   Los comentarios de `structures/` admiten por escrito la superposición.
5. **Dos recetas de página para la misma pantalla.** `surfaces/data/list` y
   `surfaces/workspace/collection-workspace`, que se autodeclara "la única canónica".
   Lo mismo entre `data/detail` y `workspace/record-workbench`.
6. **Seis marcos de página compitiendo.** `primitives/layout/Layout`,
   `patterns/shell/page-shell`, `structures/shell/app-shell`, `workspace-shell`,
   `page-shell-surface`, `sidebar-surface`. Y cuatro vocabularios de "estado vacío",
   uno por tier.
7. **Un espejo TypeScript muerto de los tokens CSS.** `foundation/tokens/ts/`:
   28 carpetas repiten nombres que el CSS ya define (el CSS tiene el valor, el TS
   solo la cadena `var()`), 31 no las importa nadie, y el barril entero tiene un
   único importador de producción.
8. **Dos árboles `test-artifacts/`**, en la raíz y dentro de `packages/core/`, los
   dos con subcarpetas `release/` y `rottay-design-platform/`.
9. **Dos motores de roadmap.** `roadmap-status.mjs` (3.177 líneas) y
   `roadmap-commercial-status.mjs` (304). No se importan entre sí, pero sí comparten
   código: la cabecera del comercial dice "Copied from scripts/roadmap-status.mjs
   (2026-07-07) ... Byte-identical EXCEPT for exactly TWO functional divergences" y
   `comm -12` da 191 líneas idénticas. Es una copia divergida. El aislamiento fue
   decisión del dueño el 2026-07-07; el costo es que ya divergieron diez a uno.
10. **La arquitectura en tres lugares.** `docs/ARCHITECTURE.md`,
    `docs-engineering/engineering/design-system/architecture/README.md` y
    `packages/core/docs/`. Los dos primeros solapan en cuatro secciones y cada uno
    tiene tres o cuatro exclusivas; ninguno enlaza al otro.
11. **`styles/platform.css` y `styles/rottay.css` son byte-idénticos.** `platform`
    ya no existe como vertical del roster, y el propio `platform-identity-zero-gate.mjs`
    lo contradice.

## Andamios vacíos

25 carpetas sin un solo archivo, todas calcando la estructura de una gemela viva:

- `infrastructure/runtime/presentation-profiles/` — 7 carpetas, calco de `product-profiles/`, cero referencias en el repo.
- `infrastructure/runtime/graphics/continuous-runtime-governor/` — 6; la implementación real vive en `runtime/foundation/graphics/`.
- `entrypoints/public/{patterns,primitives,structures,surfaces}/{contracts,runtime}` — 8.
- `infrastructure/runtime/theming/foundation/color/oklch/` — 2; el OKLCH vivo está en `foundation/kernel/color/oklch/`.
- `graphics/icons/runtime/adapters/phosphor-ssr/` y `graphics/motion/.../animation-lease/` — 2.
- `coverage/` y `coverage-final/` en la raíz — vacías las dos, misma función.

## Advertencias del CLAUDE.md que ya no aplican

- Declara `patterns/commercial/` como deuda de migración con 11 owners a adjudicar.
  **Esa carpeta ya no existe**; los 11 fueron reclasificados por lo que hacen.
- Declara `surface-composition` como taxonomía a corregir. Tampoco existe.
- `.claude/agents/*.md` describen React 18.2.0 y Ant Design 5.21.0 "como librería base". El repo desarrolla contra React 19.2.5 (el peer acepta 18 o 19) y Ant Design 5.29.3, que además es solo el engine `classic`, no la base. Vite 5 sí es correcto: `packages/core` compila con `vite ^5.4.21`; el que usa Next.js 16 + webpack es el showroom.
  El repo es React 19, Next.js 16, webpack, y Ant Design es solo el engine `classic`.

---
## Mapa: raíz del repo + packages/showroom + test-artifacts

Repo: `/Users/daniel/Developer/Rottay/ui-design-system`
Fecha de medición: 2026-08-18. Todo el trabajo fue de solo lectura.

Formato: `ruta` — (N archivos en disco, M versionados en git) frase.
Los conteos excluyen `node_modules/`. "git" = `git ls-files`, "disco" = `find -type f`.

---

### 1. Raíz del repo

#### 1.1 `scripts/` — (24 archivos, 24 en git, 668 KB)

Mezcla dos cosas distintas: la maquinaria viva de los roadmaps y tres auditorías
que sí corren en CI, más 17 codemods muertos de febrero de 2026.

- `scripts/roadmap-status.mjs` — (1 archivo, 3.177 líneas) motor de estado del roadmap principal; único camino legal para cambiar el estado de un WO (`pnpm roadmap:status` / `roadmap:check`). VIVO.
- `scripts/roadmap-status.test.mjs` — (1 archivo, 82 KB) tests del motor anterior, `pnpm roadmap:test`. VIVO.
- `scripts/roadmap-commercial-status.mjs` — (1 archivo, 304 líneas) el mismo trabajo que `roadmap-status.mjs` pero para el programa comercial aislado; `pnpm roadmap:commercial`. **[DUPLICA]** a `scripts/roadmap-status.mjs`: son dos implementaciones separadas del mismo modelo de estado (registry.json + STATUS.md generado). No se importan entre sí, pero no es reimplementación: la cabecera del comercial declara "Copied from scripts/roadmap-status.mjs (2026-07-07) ... Byte-identical EXCEPT for exactly TWO functional divergences" y `comm -12` da 191 líneas idénticas. Es una copia divergida. La duplicación es una decisión explícita del dueño (aislamiento 2026-07-07), no un accidente, pero es duplicación de maquinaria igual.
- `scripts/dependency-honesty.mjs` + `.test.mjs` — (2 archivos, 259 KB) el gate de honestidad de dependencias; `pnpm dependency:honesty`, referenciado por `.github/workflows/ci.yml`. VIVO y es el archivo más grande de la carpeta.
- `scripts/effect-registry-audit.mjs` + `.test.mjs` — (2 archivos) audita la procedencia de los efectos contra `packages/core/provenance/effects`; `pnpm effects:provenance`. VIVO. Importa `CI_GATES` desde `packages/core/scripts/ci-gates.manifest.mjs`.
- `scripts/add-accent-bars.mjs`, `add-hover-transforms.mjs`, `add-style-memo.mjs`, `adopt-card-style.mjs`, `adopt-helpers.mjs`, `audit-helper-gaps.mjs`, `fix-focus-rings.mjs`, `fix-fontsize.mjs`, `fix-glass-adoption.mjs`, `fix-hardcoded-borders.mjs`, `fix-hover-transforms-v2.mjs`, `fix-null-array-guards.mjs`, `fix-rgba-overlays.mjs`, `fix-shadow-helpers.mjs`, `fix-transition-tokens.mjs`, `fix-usememo-v2.mjs`, `helper-gaps-report.json` — (17 archivos, 17 en git, ~110 KB) **[SIN CONSUMIDOR]** codemods de una sola pasada de las fases P0..P3E. Los 16 scripts escriben sobre `packages/core/src/components/custom/`, **una ruta que ya no existe** (`packages/core/src/components` fue borrado en la reorganización a `foundation/ infrastructure/ graphics/ ui/ tooling/`). Ninguno aparece en `package.json`, en `.github/workflows/ci.yml` ni en ningún `.md`; la única referencia cruzada es entre ellos mismos. Su último commit es del 2026-02-08 ("complete engine-awareness improvements across all 337 presets"). `helper-gaps-report.json` es la salida congelada de `audit-helper-gaps.mjs` y apunta a los mismos paths inexistentes.

Sobre la comparación pedida `scripts/` vs `packages/core/scripts/` (632 archivos): **NO hay duplicación por nombre** — `comm -12` sobre las dos listas devuelve cero coincidencias. La división real es: la raíz guarda lo que cruza paquetes (roadmap, dependency-honesty, effect-registry, que necesitan ver `packages/core` y `packages/showroom` a la vez) y `packages/core/scripts/` guarda los ~600 gates internos del paquete core. La única grieta es que `packages/core/scripts/` contiene también gates que se invocan desde la raíz (`cra12:check` llama a `packages/core/scripts/cra-12-motion-governance.mjs` directamente por ruta), así que la frontera "cross-package vs interno" no se respeta al 100%.

#### 1.2 `docs/` — (2 archivos, 2 en git, 44 KB)

Dos documentos de arquitectura que viven en el repo en vez de en el hub del monorepo.

- `docs/ARCHITECTURE.md` — (204 líneas) referencia de arquitectura actual de `@rottay/design-system`: árbol de fuentes de `packages/core/src`, reglas del árbol físico, stack de composición UI, modelo de engines, autoridad de tenant/white-label, iconos, charts, fronteras públicas.
- `docs/history/ARCHITECTURE-0.5.0.md` — (1 archivo) el ledger de migración 0.5.0, marcado explícitamente como evidencia archivada; sus rutas y conteos son históricos.

**Relación con `/Users/daniel/Developer/Rottay/docs-engineering/`**: el `CLAUDE.md` del monorepo dice que toda la documentación vive en `docs-engineering/`, y existe efectivamente `docs-engineering/engineering/design-system/architecture/README.md` (198 líneas). **[DUPLICA]** parcialmente: los dos documentos cubren el mismo tema y tienen tamaño casi idéntico, pero no son copias — se reparten mal. Solapan en "Layer Model / UI composition stack", "Core Physical Hierarchy Law / Physical tree rules", "Ownership Boundary + Promote-To-DS Test" y "Runtime Pipeline / Engine model". El de `docs-engineering` tiene tres secciones que el local no tiene (Custom-Property Namespace Law, Import Boundary, Data Boundary) y el local tiene cuatro que el otro no tiene (Engine model detallado, Icons and brand assets, Charts and responsive behavior, Public boundaries). Es decir: **hoy hay que leer los dos para tener la arquitectura completa**, que es exactamente lo que la regla de `docs-engineering` como fuente única quiere evitar. Ninguno de los dos enlaza al otro.

Además, `docs/ARCHITECTURE.md` está semi-huérfano: los únicos archivos que lo enlazan son `BACKLOG.md`, `DESIGN_SYSTEM_FINAL_REVIEW.md`, `WAVE_4_PRIMITIVES.md`, `DOCUMENTATION_ENHANCEMENT.md` (los cuatro `.md` sueltos de la raíz, todos con fecha 2026-07-17 y sin tocar desde entonces) y su propio archivo de historia. El `README.md` de la raíz **no** lo enlaza; enlaza a `packages/core/docs/TAXONOMY.generated.md`. Nota aparte: existe un tercer sitio de documentación, `packages/core/docs/` (13 entradas: TAXONOMY.generated.md, TENANT_MODEL.md, audits/, rottay-design-platform-10-10/, etc.), que este mapa no cubre pero que agrava el mismo problema de tres ubicaciones.

#### 1.3 `roadmap/` — (50 archivos, 50 en git, 2.5 MB)

El backlog operativo canónico del programa "Modern Engine Premium Uplift": 99 work orders en 6 lanes, con estado en un único registry.

- `roadmap/README.md` — (31 KB) la ley del proceso: orden de arranque, protocolo de handoff, "diecisiete reglas aprendidas a golpes", y la regla de que el estado solo cambia vía `scripts/roadmap-status.mjs`.
- `roadmap/registry.json` — (457 KB, el archivo más grande del repo fuera de `pnpm-lock.yaml`) el único lugar donde vive el estado de cada WO.
- `roadmap/STATUS.md` — (148 KB) el tablero generado a partir del registry; no se edita a mano.
- `roadmap/engine-modern.md` (138 KB), `craft.md` (130 KB), `architecture.md` (112 KB), `tokens.md` (69 KB), `gates.md` (60 KB), `skin-adoption.md` (17 KB) — las 6 lanes con las WO detalladas paso a paso.
- `roadmap/proposals.md` — (170 KB) bandeja de propuestas; según su cabecera todas las rondas fueron aprobadas y convertidas en WO, la bandeja está vacía.
- `roadmap/skin-adoption/` — (36 archivos, 36 en git) los contratos e inventarios por sub-work-order de la lane skin (`wo-skin-03..06`, checkpoints `ck-a`..`ck-i`, addenda y triaje). Es la única subcarpeta y es donde vive el detalle fino que no cabe en `skin-adoption.md`.
- `roadmap/skin-census.json`, `skin-exemptions.json` — (2 archivos) datos de la lane skin; `.github/workflows/ci.yml` los vigila explícitamente (cambiarlos dispara el job de core).
- `roadmap/icon-supplier-decision-2026-07-17.md`, `iconography-fleet-census-2026-07-16.md` — (2 archivos) decisiones fechadas sobre el proveedor de iconos.

#### 1.4 `roadmap-commercial/` — (4 archivos, 4 en git, 96 KB)

El mismo modelo que `roadmap/` pero para un solo programa: relanzar `showroom.rottay.com` con la "Monochrome Signature" y construir el kit `@rottay/design-system/commercial`. Seis work orders, WO-SHW-01..06.

- `roadmap-commercial/README.md` — la ley del programa aislado; declara explícitamente que no comparte grafo ni estado con `roadmap/`.
- `roadmap-commercial/showroom.md` — la única lane, con las 6 WO.
- `roadmap-commercial/registry.json` — el estado.
- `roadmap-commercial/STATUS.md` — el tablero generado.

**[DUPLICA]** a `roadmap/` en forma, no en contenido. Duplica: la estructura de carpeta (README + lane + registry + STATUS generado), el modelo de estado, el vocabulario de WO y la maquinaria (`scripts/roadmap-commercial-status.mjs` es una copia declarada de `scripts/roadmap-status.mjs`, 191 líneas idénticas). No duplica: el alcance (uno es el engine modern, el otro es la superficie comercial). El aislamiento es una decisión firmada del dueño con fecha 2026-07-07, así que esto es duplicación deliberada; el costo es que cualquier mejora al motor de roadmap hay que hacerla dos veces, y el motor comercial es 10 veces más chico (304 vs 3.177 líneas), o sea que ya divergieron en capacidad.

#### 1.5 `.github/` — (1 archivo, 1 en git, 28 KB)

- `.github/workflows/ci.yml` — (607 líneas) el único workflow. Detecta qué paquete cambió (core / showroom / gates) y de ahí dispara los jobs. Su filtro de "core cambió" incluye a mano rutas de fuera de `packages/core/`: `scripts/dependency-honesty*`, `scripts/effect-registry-audit*`, `packages/showroom/e2e/responsive/overflow-baseline.json` y `roadmap/skin-{exemptions,census}.json`. Corre en `self-hosted`.

#### 1.6 `.claude/` — (4 archivos, 3 en git, 32 KB)

Configuración local de Claude Code, mitad viva mitad fósil.

- `.claude/settings.local.json` — (1 archivo, en git aunque `.gitignore` línea "Claude Code local settings" pretende ignorarlo — está versionado desde antes) lista de permisos de Bash.
- `.claude/RESUME.md` — (1 archivo, NO en git) checkpoint automático de sesión escrito el 2026-08-18T01:32Z por la sesión `7e39d28d`. Es un artefacto de herramienta, no del proyecto.
- `.claude/agents/componentes-agent.md` y `storybook-agent.md` — (2 archivos, 2 en git) **[SIN CONSUMIDOR]** definiciones de agente escritas en español con datos vencidos: dicen "React 18.2.0" (hoy 19.2.5 en desarrollo; el peer acepta 18 o 19) y "Ant Design 5.21.0: Librería de componentes base" (hoy 5.29.3, y no es la base: es solo el engine `classic`). "Vite 5" y "Storybook 9" sí siguen siendo correctos para `packages/core`; el que usa Next.js 16 + webpack es el showroom. Ningún archivo del repo los invoca ni los enlaza.

#### 1.7 `.changeset/` — (2 archivos, 2 en git, 8 KB)

Configuración de Changesets para versionar y publicar el paquete (`access: restricted`, `baseBranch: main`). Solo están `config.json` y el `README.md` que viene de fábrica: **cero changesets pendientes**. Los scripts `changeset` / `changeset:version` / `changeset:publish` existen en el `package.json` de la raíz, así que la maquinaria está viva, pero nadie ha dejado un changeset sin consumir.

#### 1.8 `coverage/` y `coverage-final/` — (0 archivos, 0 en git, 0 B cada una)

**[SIN CONSUMIDOR]** Dos carpetas vacías. Cada una contiene únicamente un subdirectorio `.tmp/` también vacío. No hay ni un archivo dentro. Están ignoradas por `.gitignore` (`coverage/`, `coverage-*/`), así que nunca van a versionarse. Son residuo de una corrida de `test:coverage` del 2026-08-07 que quedó a medias o fue limpiada. **[DUPLICA]**: `coverage/` y `coverage-final/` son entre sí el mismo trabajo (salida de cobertura), y ninguna de las dos tiene contenido que las distinga. Se pueden borrar sin efecto.

---

### 2. `packages/showroom/` — (1.137 archivos, 929 en git, 49 MB)

App Next.js 16 independiente que es a la vez el escaparate comercial del design system (showroom.rottay.com) y el laboratorio donde se capturan las pruebas visuales de los gates. Puerto 7001, despliegue en Vercel.

#### 2.1 Nivel 1

- `packages/showroom/src/` — (354 archivos, 354 en git, 4.0 MB) todo el código de la app. Detalle abajo.
- `packages/showroom/e2e/` — (551 archivos, 551 en git, **41 MB**) el arnés Playwright. Es la carpeta más pesada del paquete y el 83 % de su peso son PNG de referencia versionados. Detalle abajo.
- `packages/showroom/scripts/` — (9 archivos, 9 en git, 80 KB) utilidades propias del showroom: `assert-first-paint-authority.mjs` (gate de primera pintura), `showroom-visual-matrix.mjs` + `.config.mjs` (matriz de capturas), `visual-audit.spec.ts`, `vercel-ignore-build.sh` (corta builds de Vercel innecesarios) y `design-cards/` (4 archivos: `generate.mjs`, `template.mjs`, `validate.mjs`, `no-fixture-allowlist.json`, detrás de `pnpm design:cards` / `design:validate`).
- `packages/showroom/build/` — (168 archivos, 0 en git, 2.8 MB) salida de `design:cards`: `build/design-cards/` con `index.html`, `report.json`, `components/` y `_assets/`. Ignorada (`build/` en `.gitignore`). Se regenera.
- `packages/showroom/.tmp/` — (32 archivos, 0 en git, 196 KB) **[SIN CONSUMIDOR]** scripts de depuración desechables dejados a mano durante las waves K2/K3/K4: `k2v-debug-cell.mjs`, `k2v-debug2..4.mjs`, `k3a-inspect-dom.mjs`, `k3a-inspect-desc2.mjs`, `daisy-regression-capture.mjs`, etc. Ignorada por `.gitignore`. Nadie los invoca; son notas de laboratorio congeladas del 2026-07-27.
- `packages/showroom/playwright-report/` — (1 archivo, 0 en git, 520 KB) el `index.html` del último informe de Playwright. Ignorado.
- `packages/showroom/test-results/` — (1 archivo, 0 en git, 4 KB) solo `.last-run.json`. Ignorado.
- `packages/showroom/.vercel/` — (2 archivos, 0 en git, 8 KB) `project.json` + `README.txt` del enlace con el proyecto de Vercel. Ignorado.
- Archivos sueltos de configuración: `package.json`, `next.config.ts`, dos configs de Playwright (`playwright.config.ts` para a11y contra dev server, `playwright.visual.config.ts` para visual/whitelabel/responsive contra build de producción), `tailwind.config.ts` + `postcss.config.mjs` (solo para la landing), `eslint.config.mjs`, tres `tsconfig*.json` con su baseline de ratchet, y dos `.tsbuildinfo` de 227 KB y 419 KB que están en disco pero ignorados.

#### 2.2 `src/` nivel 2 y 3

- `packages/showroom/src/app/` — (234 archivos, 234 en git, 2.5 MB) el App Router. En la raíz: `layout.tsx`, `page.tsx` (la landing comercial, la excepción Tailwind), `globals.css` y `landing-runtime-panel.tsx`.
  - `src/app/(docs)/` — (65 archivos, 65 en git, 1.3 MB) el shell de documentación. Nivel 3: `foundations/` (con `tokens/`, `themes/`, `engines/`, `icons/`), `primitives/[category]`, `patterns/` (con `[group]` y `visualization/` para los 18 charts), `structures/[group]`, `surfaces/[group]`, `verticals/` (`rottay/`, `bithire/`, `evnto/`), `playground/` (con `theme-builder/`), `developers/` (`getting-started/`, `architecture/`) y `shell-check/`.
  - `src/app/probe/` — (162 archivos, 162 en git, 1.1 MB) **la mitad de todas las rutas del showroom**. No es documentación: son 50 rutas-laboratorio sin chrome, cada una construida como lienzo de captura para un work order concreto. Se agrupan en cuatro familias: probes de lane del programa rottay-design-platform (`k0-profiles`, `k1-lane-a/b/c`, `k2-lane-v`, `k3-lane-a/b/c`, `k4-lane-a/b/c/d`, `p1-action-dock`, `p1-list-toolbar`, `wl-canary`), probes de white-label (`whitelabel-torture`, `whitelabel-divergence`, `brand-studio`, `brand-locale-evidence`, `custom-component-pack`, `density-authority`, `visual-authority`), probes de craft/runtime (`craft-cra-02`, `craft-cra-03`, `micro-interactions`, `micro-typography`, `scroll-reveal`, `view-transitions`, `particle-runtime`, `spatial-runtime`, `loading-overlay`, `oauth-transition`, `record-subgrid`, `container-axis`, `daisy-regression`, `semantic-assets`, `recipe-profile-specimen`, `kit-inventory`) y el laboratorio de referencia `ds-reference` (cuya cabecera documenta explícitamente que es solo una matriz de enlaces, para que ninguna captura salga de un lienzo que la lane no posee).
  - `src/app/design-cards/` — (3 archivos, 3 en git) rutas `[tier]` y `manifest` que alimentan el generador de fichas de diseño.
- `packages/showroom/src/components/` — (111 archivos, 111 en git, 1.4 MB) los componentes de la app. Nivel 3:
  - `components/layout/` — (13) el chrome real del sitio: `shell/`, `sidebar/`, `header/`, `footer/`, `search/` (Cmd+K), `state-toast/`.
  - `components/torture-sections/` — (30, la carpeta con más archivos) 27 escenas de tortura agrupadas por familia de componente (`data-table`, `forms`, `fields`, `dropdowns`, `overlay`, `nav`, `headers`, `record`, `rail`, `workspace-chrome`, `dashboard`, `display-1`, `display-2`, `ck-e`, `ck-h1`, `misc-h2`, ...) más un `registry/`. Es el inventario que consumen las specs visuales.
  - `components/playground/` — (8) `engine-switcher/`, `theme-switcher/`, `engine-comparison/`, `component-preview/`, `code-block/`, `prop-table/`.
  - `components/demos/` — (12) las pantallas de demo por vertical: `rottay/` (dashboard, tenant-form, user-list), `bithire/` (pipeline-kanban, recruiter-dashboard, scorecard), `evnto/` (event-dashboard, ticket-builder, venue-layout).
  - `components/landing/` — (4, 128 KB) los bloques de la landing comercial en Tailwind.
  - `components/state-gallery/` (4), `torture-surface/` (4, con `fixtures/`), `product-window/` (3, con `contracts/`), `torture-tenant/` (2, con `specimen/`), `divergence-surface/` (2, con `fixtures/`).
  - Doce carpetas de un solo archivo, cada una atada a un probe concreto: `k0-profile-evidence/`, `k1-lane-a/b/c/`, `k2-lane-v/`, `k3-lane-a/b/c/`, `visual-authority-probe/`, `density-authority/`, `brand-locale-evidence/`, `layout-foundations-evidence/`, `recipe-profile-specimen/`, `torture-first-paint/`, `live-component-showcase/`, `showroom-tenant/`, `showroom-ui/`, `showroom-context/`, `runtime/`, `docs/`.
- `packages/showroom/src/data/` — (9 archivos, 9 en git, 124 KB) `navigation.ts` (el árbol del sidebar), `index.ts` y `registry/` (7 archivos: `primitives.ts`, `patterns.ts`, `structures.ts`, `surfaces.ts`, `charts.ts`, `icons.ts`, `index.ts`) — los registros que deben mantenerse sincronizados a mano con `packages/core/`.

#### 2.3 `e2e/` nivel 2

Cuatro directorios de specs y dos configs; el propio `e2e/README.md` prohíbe añadir un tercer config.

- `e2e/visual/` — (476 archivos, 476 en git, 38 MB) 37 specs de diff de píxeles (WO-GAT-01) contra el build de producción, más `__screenshots__/` con **438 PNG de referencia versionados (38 MB)**. Es la mayor concentración de binarios en git de todo el repo.
- `e2e/whitelabel/` — (47 archivos, 47 en git, 2.0 MB) 22 specs de sonda de estilos computados con tenants hostiles (WO-GAT-03) más `__screenshots__/` (24 PNG, 1.5 MB). Aquí viven las specs de lane `k0`..`k3` y `canary-contracts`.
- `e2e/diagnostics/` — (16 archivos, 16 en git, 220 KB) tests unitarios de Node (no Playwright) que validan rosters y determinismo de los probes: `skin-rule-coverage`, `r6-probe-determinism`, `r6-probe-roster`, `compositions-roster`, `monochrome-roster`, `primitive-category-roster`, etc. Se corren con `pnpm test:diagnostics`.
- `e2e/responsive/` — (8 archivos, 8 en git, 92 KB) sondas de 360 px y área táctil (WO-ENG-12) más el ensamblador de evidencia `cra-15-assemble.mjs` y `overflow-baseline.json` (que CI vigila como si fuera parte de core).
- `e2e/a11y/` — (3 archivos, 3 en git, 24 KB) `axe.spec.ts`, `focus.spec.ts` y su `axe-baseline.json` (WO-GAT-04); es el único directorio que corre contra el dev server.

---

### 3. `test-artifacts/` — (7.577 archivos, de los cuales 1.054 son `node_modules/` de una release embebida; 203 en git, 479 MB)

Volcados de evidencia de gates y auditorías. `.gitignore` los ignora todos por defecto (`test-artifacts/*`) y luego re-admite a mano una lista corta de artefactos "autoritativos"; el resultado es que **el 96,9 % de los archivos y prácticamente todo el peso no está versionado**. Solo 203 de 7.577 archivos están en git, y de esos 178 son de un solo directorio (`r1p-round3-evidence`).

#### 3.1 Primer nivel

- `test-artifacts/rottay-design-platform/` — (1.479 archivos, 178 en git, **209 MB**, 2026-07-23..2026-08-02) el volcado más grande. Lo dejó el programa "rottay-design-platform 10/10", coordinado por Kimi y auditado por Codex, cuyos planes viven en `packages/core/docs/rottay-design-platform-10-10/`. Además de las subcarpetas de wave, guarda en su raíz los handoffs y post-mortems en markdown (`HANDOFF-R0-K2-K3.md`, `HANDOFF-K4-P1-2026-07-24.md`, `DAISY-30-TO-3-RECONCILIATION.md`, `REMEDIATION-MODERN-CHECKPOINT.md`, `K4-LANE-BRIEFS.md`, `P1-P2-INVENTORY.md`, ...). Es el único volcado con prosa de proceso dentro.
- `test-artifacts/release/` — (5.737 archivos, 0 en git, 76 MB, fechas de 1985-10-26 a 2026-07-17) **[SIN CONSUMIDOR]** no es evidencia de gate: son tarballs de npm publicados y **desempaquetados**. `2.19.29/` tiene el `.tgz` más un árbol `unpacked/` de 5.731 archivos (57 MB) — de ahí las fechas de 1985, que es el timestamp de época que npm pone dentro de los tar. `2.19.3/` guarda su `.tgz`, un `npm-cache/` y `npm-publish-2.19.3.json`. Ningún script del repo referencia `test-artifacts/release`.
- `test-artifacts/showroom-commercial-audit-2026-07-07/` — (29 archivos, 0 en git, **110 MB**, todos del 2026-07-07) capturas PNG de la auditoría comercial del showroom que sirve de base de evidencia a `roadmap-commercial/`. 29 archivos y 110 MB: son capturas de página completa enormes (`foundations-index-1280.png`, `chart-line-real-1280.png`, `developers-architecture-1280.png`, variantes a 360 px). Es la peor relación peso/archivo del repo, ~3,8 MB por PNG.
- `test-artifacts/modern-engine-visual-audit-2026-07-06/` — (82 archivos, 0 en git, 38 MB, todos del 2026-07-06) las capturas de la auditoría visual del engine modern que es la base de evidencia del `roadmap/` principal (`button-classic-light.png`, `grid-alert-dark.png`, `engines-comparison-realcomponents.png`, ...). Plano: sin subcarpetas.
- `test-artifacts/engine-modern/` — (140 archivos, **0 en git**, 21 MB, 2026-07-08..2026-07-10) evidencia de la lane `engine-modern` del roadmap, una subcarpeta por WO. Nada de esto sobrevive a un clon limpio.
- `test-artifacts/gates/` — (52 archivos, 2 en git, 8.6 MB, 2026-07-09..2026-07-23) evidencia de la lane `gates`. Los 2 archivos versionados son `gat-07/semantic-evidence.json` y `gat-07/semantic-hash.txt`, que el `.gitignore` llama "la prueba semántica autoritativa verificada byte a byte" — el único caso donde el repo decide que la evidencia ES fuente.
- `test-artifacts/craft/` — (48 archivos, 20 en git, 7.5 MB, 2026-07-08..2026-07-26) evidencia de la lane `craft`. Versionados: el censo generado de `cra-11`, la matriz óptica de `cra-17` (13 archivos) y `cra-16`.
- `test-artifacts/releases/` — (1 archivo, 0 en git, 6.4 MB) **[DUPLICA]** a `test-artifacts/release/`. Contiene un único `.tgz` (`rottay-design-system-2.19.32.tgz`). Dos carpetas hermanas cuyos nombres difieren en una "s" y que hacen exactamente el mismo trabajo: guardar tarballs publicados. La de singular tiene 76 MB, la de plural 6,4 MB.
- `test-artifacts/architecture/` — (3 archivos, 3 en git, 496 KB, 2026-07-26) evidencia de la lane `architecture`; los 3 archivos son el `*.surface-capabilities.generated.json` de `arc-11`, todos versionados.
- `test-artifacts/showroom/` — (3 archivos, 0 en git, 1.3 MB, 2026-07-08) evidencia de `shw-01`, la primera WO del programa comercial.
- `test-artifacts/tokens/` — (3 archivos, 0 en git, 124 KB, 2026-07-09) evidencia de `tok-08`, lo único que dejó la lane `tokens`.

#### 3.2 Segundo nivel (qué programa y de cuándo)

- `architecture/arc-11/` — (3, 3 en git, 2026-07-26) capacidades de superficie generadas.
- `craft/cra-01/` (2, 0 en git, 07-08), `cra-04/` (7, 0, 07-10), `cra-07/` (8, 0, 07-09), `cra-11/` (1, 1, 07-18), `cra-14/` (1, 0, 07-14), `cra-15/` (13, 3, 07-26), `cra-16/` (1, 1, 07-17), `cra-17/` (15, 15, 07-17..07-18, 4.2 MB — la matriz óptica de iconos, íntegra en git).
- `engine-modern/eng-01`..`eng-20/` — 15 subcarpetas (`eng-01,02,03,04,05,06,07,08,09,10,11,12,14,18,20`; faltan 13, 15, 16, 17, 19), **todas con 0 archivos en git**, entre 2 y 84 archivos cada una, del 2026-07-08 al 07-10. Las más pesadas: `eng-01` (3.7 MB), `eng-02` (3.3 MB), `eng-12` (84 archivos, 3.0 MB), `eng-10` (3.0 MB).
- `gates/gat-01/` (3, 0, 07-09), `gat-03/` (9, 0, 07-14), `gat-04/` (12, 0, 07-09), `gat-07/` (2, **2 en git**, 07-18, 2.6 MB), `gates/w4-divergence/` (24, 0, 07-18, 3.8 MB).
- `release/2.19.29/` (5.731, 0, tarball desempaquetado) y `release/2.19.3/` (6, 0, 07-15).
- `rottay-design-platform/K4/` — (632 archivos, 0 en git, **139 MB**, 07-24..08-02) la subcarpeta individual más pesada del repo entero.
- `rottay-design-platform/K3/` (141, 0, 9.5 MB), `K0-K1/` (119, 0, 11 MB), `K2-K3/` (110, 0, 3.8 MB), `P1/` (97, 0, 3.4 MB), `K2/` (73, 0, 5.4 MB), `WL-CANARY/` (72, 0, 5.4 MB, 07-27), `react-aria-spike/` (12, 0, 07-24), `W10/` (11, 0, 07-25), `DAISY-REGRESSION/` (8, 0, 07-26).
- `rottay-design-platform/r1p-round3-evidence/` — (194 archivos, **178 en git**, 31 MB, 07-27..07-28) la excepción: `.gitignore` la re-admite a mano con un comentario propio ("R1-P round-3 audit evidence; allowlisted individually"). Es la única evidencia de este programa que sobrevive a un clon. Dentro tiene prosa (`SUMMARY.md`, `methodology.md`, `audit-postmortem.md`, `claims-extraction.md`, `negative-drill-design.md`), datos (`classification.json`, `manifest.json`, `bithire-overlap.json`, `evnto-overlap.json`, `compiler-capability-map.md`), **scripts** (`scripts/classify/` 16 archivos, `r1p/scripts/` 33 archivos, `r1p/scripts/p1/` 12) y snapshots por tenant (`snapshots/{rottay,bithire,evnto}/_source/`).
- `showroom/shw-01/` (3, 0, 07-08), `tokens/tok-08/` (3, 0, 07-09).

#### 3.3 Dos destinos referenciados que no existen

Al buscar quién escribe en `test-artifacts/`, la ruta más citada del repo (247 menciones, en `packages/core/scripts/quality-evidence/programs/modern-rescue/` y en `channel-liveness-gate.mjs`) es **`test-artifacts/quality-evidence/`, que no existe en disco**. Lo mismo con `test-artifacts/advisory/` (2 menciones). Son destinos del programa Modern Rescue que se crean al vuelo cuando se corre el gate; hoy el árbol está vacío de ellos, es decir que **el volcado que la ley del programa activo considera canónico no está presente**, mientras sí quedan 479 MB de volcados de programas cerrados en julio.

---

### Resumen de marcas

**[DUPLICA]**
- `scripts/roadmap-commercial-status.mjs` vs `scripts/roadmap-status.mjs` (copia declarada y divergida, 191 líneas idénticas; 304 vs 3.177 líneas).
- `roadmap-commercial/` vs `roadmap/` (misma estructura y modelo de estado, alcance distinto, aislamiento deliberado 2026-07-07).
- `docs/ARCHITECTURE.md` vs `docs-engineering/engineering/design-system/architecture/README.md` (solapan cuatro secciones, cada uno tiene tres o cuatro exclusivas, ninguno enlaza al otro).
- `test-artifacts/releases/` vs `test-artifacts/release/` (dos carpetas para tarballs publicados, nombres a una letra de distancia).
- `coverage/` vs `coverage-final/` (ambas vacías, misma función).
- NO duplican: `scripts/` de la raíz y `packages/core/scripts/` — cero nombres de archivo en común, división cross-package vs interno, con la fuga menor de `cra12:check`.

**[SIN CONSUMIDOR]**
- Los 16 codemods + `helper-gaps-report.json` de `scripts/` (escriben sobre `packages/core/src/components/custom/`, ruta borrada).
- `.claude/agents/*.md` (dan React 18.2.0 y Ant Design 5.21.0 "como base"; hoy es 19.2.5 y Ant es solo el engine `classic`; nadie los invoca).
- `coverage/` y `coverage-final/` (vacías).
- `packages/showroom/.tmp/` (32 scripts de depuración a mano, congelados el 2026-07-27).
- `test-artifacts/release/` (tarballs npm desempaquetados, ningún script los referencia).
## Mapa de carpetas: foundation/ e infrastructure/

Repo: /Users/daniel/Developer/Rottay/ui-design-system
Arboles mapeados: packages/core/src/foundation/ y packages/core/src/infrastructure/
Fecha: 2026-08-18. Metodo: lectura de index.ts/index.tsx de cada carpeta (no hay ni un README en las 587), conteo de archivos directos con find -maxdepth 1 -type f, y verificacion de consumidores con grep sobre packages/core/src, packages/core/scripts y packages/showroom/src.

Cifras del terreno:
- 587 carpetas en total (206 en foundation, 381 en infrastructure), con 1051 archivos (696 + 355).
- 469 archivos .css, 468 .ts, 74 .tsx, 33 .json, 7 .woff2. 224 son archivos de test, repartidos en 111 carpetas de tests/ o fixtures/.
- 136 de las 587 carpetas NO tienen ningun archivo directo: existen solo para anidar otra carpeta.
- 38 carpetas mas tienen como unico archivo un index.ts de 10 lineas o menos, es decir un barril que solo reexporta.
- 15 carpetas estan COMPLETAMENTE vacias (cero archivos en todo su subarbol): infrastructure/runtime/presentation-profiles (7), infrastructure/runtime/graphics/continuous-runtime-governor (6) e infrastructure/runtime/theming/foundation/color (2).
- Cero archivos README.md en los dos arboles.

Convenciones de este documento:
- El numero entre parentesis es la cantidad de archivos DIRECTOS de esa carpeta, no recursivo.
- [DUPLICA] marca que otra carpeta hace el mismo trabajo, y nombra cual.
- [SIN CONSUMIDOR] marca que nada fuera de la propia carpeta la importa.

---

#### packages/core/src/foundation/
`foundation/` — (0 archivos) capa mas baja del paquete: define el vocabulario que todo lo demas consume y no depende de nada por encima suyo. Reune el comportamiento sin pintura (anatomia y estado de interaccion), los contratos de tipos (identidad de motor, tokens, tema de inquilino, responsive), el subsistema de idiomas sin React, los calculos puros (color, contraste, matematica, criptografia), los presets de vertical y producto, y el sistema de tokens en sus dos formatos paralelos (CSS y espejo TypeScript). No tiene archivo propio: es una carpeta de agrupacion.
  `foundation/behavior/` — (1 archivo) puerta pública del comportamiento sin pintura: exporta el par anatomía + estado de interacción para que las tres pieles de un mismo componente lean el mismo estado desde el DOM en vez de reimplementarlo cada una.
    `foundation/behavior/kernel/` — (0 archivos) nivel de agrupación sin código propio; solo separa la parte de behavior que no depende de React (`anatomy`) de la que sí (`runtime`).
      `foundation/behavior/kernel/anatomy/` — (1 archivo) define qué partes tiene un componente (`data-part`) y en qué estado está cada parte (`data-state`), con `serializeState`/`partAttributes` que convierten las cinco banderas (hovered, pressed, focused, focusVisible, disabled) en atributos DOM que el CSS de cualquier motor puede matchear con `[data-state~='pressed']`.
    `foundation/behavior/runtime/` — (0 archivos) nivel de agrupación sin código propio; aloja la parte de behavior que necesita React.
      `foundation/behavior/runtime/interaction-state/` — (1 archivo) hook `useInteractionState`: decide una sola vez el trío hover/press/focus y, sobre todo, decide si corresponde anillo de foco según la modalidad de entrada (teclado sí, clic de ratón no), devolviendo los handlers listos para poner en el elemento.
        `foundation/behavior/runtime/interaction-state/tests/` — (1 archivo) prueba con un botón sonda que el atributo `data-state` esté ausente en reposo, que hover/press/blur lo actualicen y que un clic con ratón no dibuje anillo de foco.
  `foundation/contracts/` — (1 archivo) barril público de tipos de sistema: reúne en un solo import los contratos de motor, tema, tenant, tokens, extensiones, perfiles de producto, verticales, errores y patrones; deliberadamente no reexporta props de primitivas (esas viven junto a su componente).
    `foundation/contracts/composition/` — (0 archivos) nivel de agrupación sin código propio; separa los contratos que combinan varias piezas (tenants, temas, perfiles) de los contratos atómicos de `kernel/`.
      `foundation/contracts/composition/components/` — (1 archivo) puerta de compatibilidad que reexporta `BaseComponentProps` y renombra `WithChildren` como `WithChildrenProps` para que imports antiguos sigan compilando. [DUPLICA] a `packages/core/src/foundation/contracts/kernel/common` — el propio archivo declara que la fuente de verdad está allí y que esto es solo el puente durante la convergencia.
      `foundation/contracts/composition/tenants/` — (1 archivo) define el límite del white-label: `TenantConfig`, `TenantBranding` (logo, nombre, colores claro/oscuro, favicon), plan, overrides de tokens, locale y el valor de contexto que expone `TenantProvider`; es lo que un tenant puede cambiar en runtime sin tocar código de componente.
        `foundation/contracts/composition/tenants/capabilities/` — (1 archivo) registro tipado de cada eje personalizable, partido en niveles de acceso (standard, pro, interno) y con estado activo o frontera; cada fila declara por qué ruta se escribe en la base y por qué ruta en el BrandTheme estático, qué canales CSS deriva, y qué archivo de producción la consume, de modo que un gate pueda comprobar que la capacidad existe de verdad.
        `foundation/contracts/composition/tenants/product-profiles/` — (1 archivo) capa intermedia entre los valores por defecto del DS y los overrides del tenant: un perfil de producto (admin, organizador de eventos, operador de reclutamiento) fija personalidad, overrides de tokens y defaults amplios como densidad o vista de lista.
        `foundation/contracts/composition/tenants/themes/` — (1 archivo, 3426 líneas) vocabulario completo de `BrandTheme`: paleta y rampas de color, tipografía, superficies, movimiento, modos claro/oscuro, catálogo de capacidades y las decenas de bloques `Brand*Chrome` (sidebar, shell, tabla, modal, botones, campos, badges...) que describen el aspecto de cada familia de componente; incluye además `ThemeConfig`/`ThemeContextValue`, el estado de tema ya cargado en runtime.
          `foundation/contracts/composition/tenants/themes/iso/` — (1 archivo) contratos Theme-ISO: un único `Theme` total y anidado, un `ThemePatch` recursivo que solo existe en la entrada, `resolveTheme` que falla cerrado, y las conversiones `brandThemeToTheme`/`themeToBrandTheme` más la canonicalización y la ley de nombres; existe para que el tema estático `.ts` y el documento de base de datos terminen en el mismo objeto y en un solo compilador.
            `foundation/contracts/composition/tenants/themes/iso/shape/` — (1 archivo, 2243 líneas) tabla `DEFAULT_CHROME_SHAPE` con la unión de todas las claves de chrome que escriben los tres temas de primera parte, usada para rellenar con `undefined` lo que un tema no autoró y así dejar los tres temas estructuralmente idénticos.
          `foundation/contracts/composition/tenants/themes/tenant-theme/` — (1 archivo) contrato versionado y solo-datos del tema de tenant tal como se guarda en la fila JSONB: qué tokens se pueden sobreescribir, qué variantes de anatomía, qué packs de fuentes y qué rangos numéricos se aceptan; por diseño no puede expresar motor, rutas, permisos, React ni CSS crudo.
            `foundation/contracts/composition/tenants/themes/tenant-theme/artifact-protocol/` — (1 archivo) hoja mínima con la versión de esquema, la lista congelada de los cinco canales por los que puede llegar pintura de tenant al documento y cuáles de ellos cubre el compilador v1; se separa para que el verificador de autoridad visual en runtime la lea sin importar el compilador ni el contrato completo.
            `foundation/contracts/composition/tenants/themes/tenant-theme/fixtures/` — (0 archivos) nivel de agrupación sin código propio; solo aloja los especímenes de prueba del contrato de documento.
              `foundation/contracts/composition/tenants/themes/tenant-theme/fixtures/themanagement-db-row/` — (1 archivo) fila de tenant ficticia escrita hacia adelante en el vocabulario del documento (no derivada de un BrandTheme), que sirve de canario para probar que un cliente que solo llena la consola puede obtener un producto visualmente distinto; nunca se registra como tenant real ni se compila a un bundle.
            `foundation/contracts/composition/tenants/themes/tenant-theme/tests/` — (1 archivo) comprueba que la hoja `artifact-protocol` y el contrato grande exportan exactamente los mismos objetos congelados, en el mismo orden, y que la cobertura v1 es la lista de canales menos `personality`.
    `foundation/contracts/kernel/` — (0 archivos) nivel de agrupación sin código propio; reúne los contratos más bajos, sin React ni proveedor, de los que todo lo demás depende.
      `foundation/contracts/kernel/common/` — (1 archivo) piezas de tipo compartidas por todos los componentes: escala `Size`, `Tone` y su mapa `TONE_TO_VARIANT`, `BaseComponentProps` y los mixins componibles (`LoadableProps`, `DisableableProps`, `ClickableProps`), más los alias de tamaño estilo Ant marcados como obsoletos.
        `foundation/contracts/kernel/common/tests/` — (1 archivo) prueba que los mapas de tono de Badge, Tag, Avatar, Callout, Alert y Progress se resuelven a través del `TONE_TO_VARIANT` del kernel y no de copias propias que puedan desviarse.
      `foundation/contracts/kernel/engine-identity/` — (1 archivo, 7 líneas) declara la unión `EngineName` (`classic | modern | rustic | custom`) sin importar React, para que subpaths puros usen el mismo nombre de motor sin arrastrar tipos de UI.
      `foundation/contracts/kernel/product-profile-identity/` — (1 archivo) declara el conjunto cerrado de claves de perfil de producto (`generic.default`, `events.organizer`, `recruiting.operator`, `rottay.admin`, `rottay.flagship`); es cerrado a propósito para que una clave inventada falle al compilar en vez de caer en silencio al perfil por defecto.
      `foundation/contracts/kernel/responsive/` — (1 archivo, 4 líneas) barril que junta los dos contratos responsive, breakpoints y valores por breakpoint.
        `foundation/contracts/kernel/responsive/breakpoints/` — (1 archivo) única fuente de los cortes de viewport (xs 0, sm 640, md 768, lg 1024, xl 1280, 2xl 1536) y de los helpers que arman las media queries, para que hooks, primitivas de layout y motores no usen escalas distintas.
        `foundation/contracts/kernel/responsive/values/` — (1 archivo) tipo `ResponsiveValue<T>`: un valor suelto vale en todos los tamaños, o un objeto con cascada mobile-first que acepta tanto nombres canónicos (`sm`, `lg`) como alias semánticos (`phone`, `tablet`, `desktop`).
      `foundation/contracts/kernel/spatial/` — (1 archivo) vocabulario del subsistema 3D sin importar React ni Three: modos (estático, reducido, live bajo/alto), backend certificado (solo WebGL2), propósito de la escena, interacción, calidad y estado del contexto, más la versión del protocolo de módulo de escena.
      `foundation/contracts/kernel/tokens/` — (1 archivo) describe el grafo de tokens ya resuelto que devuelve `useTokens()` — colores, espaciado, tipografía, radios, sombras, glass, gradientes, transiciones, superficies, movimiento y personalidad — después de mezclar defaults del motor, perfil de producto y overrides del tenant.
        `foundation/contracts/kernel/tokens/extensions/` — (1 archivo, 973 líneas) protocolo de extensión universal en 16 categorías (slots, columnas, acciones, filtros, render, selección, orden, paginación, movimiento, layout, datos, drag&drop, exportación, teclado, ciclo de vida, accesibilidad); su propia cabecera avisa que es superficie reservada solo-tipos: ningún preset la lee y pasar `extensions` no tiene efecto, queda para censo y baja.
        `foundation/contracts/kernel/tokens/materials/` — (1 archivo) roles semánticos de superficie (canvas, shell, panel, card, inset, control, raised, overlay) con sus facetas coordinadas de fondo, hover, activo, seleccionado, deshabilitado y color de contenido, para que una marca pueda pasar de plana a mullida sin rehacer la anatomía de los componentes.
        `foundation/contracts/kernel/tokens/personality/` — (1 archivo) las cinco dimensiones de personalidad — animación, gráficos, tipografía, acento y tarjeta — que permiten que el mismo código se vea formal, futurista o festivo cambiando datos en vez de ramificar por nombre de tenant o de motor.
        `foundation/contracts/kernel/tokens/typography/` — (1 archivo, 28 líneas) lista los nueve roles tipográficos semánticos (display, pageTitle, sectionTitle, body, supporting, label, caption, code, numeric) y qué propiedades puede fijar cada rol.
      `foundation/contracts/kernel/verticals/` — (1 archivo) contrato `VerticalManifest`: la identidad declarada de cada app (tono, forma, movimiento, densidad, tipo de shell, workspace, dashboard, copy, iconografía) y la unión cerrada de verticales de primera parte `rottay | bithire | evnto`; responde "cómo debe sentirse esta app", no qué features tiene.
    `foundation/contracts/runtime/` — (0 archivos) nivel de agrupación sin código propio; separa los contratos que describen comportamiento en ejecución (motor, movimiento, efectos, errores, datos de patrones) de los atómicos de `kernel/`.
      `foundation/contracts/runtime/components/` — (1 archivo, 3 líneas) barril que expone los contratos de datos de los componentes de tarea sin arrastrar ninguna implementación renderizada.
        `foundation/contracts/runtime/components/patterns/` — (1 archivo) reúne los cinco grupos de formas de datos que comparten los patrones de `ui/patterns` y las superficies que los componen, de modo que la capa de contratos nunca importe código que pinta.
          `foundation/contracts/runtime/components/patterns/communication/` — (1 archivo) formas de una conversación asistida: rol del mensaje, estado de entrega, estado de una llamada a herramienta, actividad del agente y las piezas de contenido (texto, markdown, estado de herramienta) que componen un mensaje.
          `foundation/contracts/runtime/components/patterns/core/` — (1 archivo, 407 líneas) contratos base que usan todos los patrones: `PatternBaseProps`, definición de columna, orden, filtro, paginación, acciones masivas, métricas, campos, columnas de kanban, presets y la configuración de edición en línea de celdas.
          `foundation/contracts/runtime/components/patterns/data/` — (1 archivo) formas de las vistas guardadas (filtros, orden, columnas, agrupación, layout, marca de cambios sin guardar) y el estado de cada filtro activo (aplicado, borrador, inválido) que comparten la barra de filtros y las colecciones.
          `foundation/contracts/runtime/components/patterns/forms/` — (1 archivo, 11 líneas) tipos mínimos del constructor de formularios: layout (vertical, horizontal, grid, pasos), firma del render personalizado de un campo y orientación del asistente por pasos.
          `foundation/contracts/runtime/components/patterns/visualization/` — (1 archivo, 10 líneas) forma canónica de un evento de calendario (id, título, inicio, fin, color, día completo, datos libres) compartida por calendarios y superficies de agenda.
      `foundation/contracts/runtime/effects/` — (1 archivo) catálogo cerrado de los once efectos expresivos (aurora, glass-card, glow, gradiente, patrón de rejilla, magnético, ruido, parallax, partículas, shimmer, spotlight) con su estado de admisión, nivel y propósito; describe requisitos de admisión y ejecución, y por diseño impide que una app registre efectos arbitrarios o que un tenant altere su comportamiento.
      `foundation/contracts/runtime/engine/` — (1 archivo) contratos de la capa multi-motor: metadatos y capacidades de cada motor, valor del contexto, props del proveedor y la interfaz `EngineAwareProps` que deja a un componente elegir motor; describe la selección, no las implementaciones.
      `foundation/contracts/runtime/errors/` — (1 archivo) taxonomía estándar de errores del DS: categorías (carga de asset, tema, motor, validación, red, tenant, i18n, desconocido), niveles de severidad y la forma estructurada y transportable del error, para que todo el sistema los filtre y agrupe igual.
      `foundation/contracts/runtime/motion/` — (1 archivo) contratos de movimiento independientes de librería: siempre milisegundos, curvas semánticas (settled, ease-out, muelle suave, muelle táctil), la política de movimiento según puntero y energía del dispositivo, y el dial acotado que un tenant puede tocar (intensidad, escala de duración, ambiente) con sus límites numéricos.
  `foundation/i18n/` — (1 archivo) barrel del subsistema de idiomas sin React: reexporta los contratos de idioma y todo el runtime (catálogos, formateadores, resolutores) para consumo desde servidor, Edge o navegador. [SIN CONSUMIDOR] ningún archivo importa este barrel; todos los consumidores entran por subrutas más profundas.
    `foundation/i18n/kernel/` — (1) nivel de paso que reexporta los contratos de idioma; [SIN CONSUMIDOR] nadie lo importa, los consumidores van directo a `kernel/contracts`.
      `foundation/i18n/kernel/contracts/` — (1) declara los cinco idiomas soportados (es, en, pt, fr, ar), el idioma por defecto (`en`), el idioma piso de traducción, y las formas `LocaleConfig`, `LocaleTranslations` y el resultado de una resolución; es la única declaración de qué idioma se usa cuando nadie pide ninguno.
    `foundation/i18n/runtime/` — (1) nivel de paso que reexporta catálogo, formateo y resolución; [SIN CONSUMIDOR] nadie importa este nivel, se importan sus tres hijos.
      `foundation/i18n/runtime/catalog/` — (1) expone las dos tablas de datos del subsistema: los metadatos por idioma y el diccionario completo de textos.
        `foundation/i18n/runtime/catalog/configuration/` — (1) tabla con el nombre nativo, la dirección de escritura (ltr/rtl) y los locales de fecha y número de cada uno de los cinco idiomas; es de donde sale que `ar` es RTL.
        `foundation/i18n/runtime/catalog/translations/` — (1) arma el objeto `TRANSLATION_CATALOG` que asocia cada idioma con su diccionario completo.
          `foundation/i18n/runtime/catalog/translations/locales/` — (1) barrel que reexporta los cinco diccionarios; agregar un idioma nuevo implica crear su carpeta aquí y registrarlo también en la configuración de idiomas.
            `foundation/i18n/runtime/catalog/translations/locales/ar/` — (5) diccionario en árabe repartido en cuatro archivos JSON (textos comunes, textos de componentes, mensajes de error y mensajes de validación) más el index que los une; es el único idioma que se pinta de derecha a izquierda.
            `foundation/i18n/runtime/catalog/translations/locales/en/` — (5) diccionario en inglés con los mismos cuatro JSON; es el catálogo garantizado completo que se consulta último cuando ningún otro idioma tiene la clave.
            `foundation/i18n/runtime/catalog/translations/locales/es/` — (5) diccionario en español con los mismos cuatro JSON (comunes, componentes, errores, validación).
            `foundation/i18n/runtime/catalog/translations/locales/fr/` — (5) diccionario en francés con los mismos cuatro JSON.
            `foundation/i18n/runtime/catalog/translations/locales/pt/` — (5) diccionario en portugués (pt-BR) con los mismos cuatro JSON.
      `foundation/i18n/runtime/formatting/` — (1) reexporta los nueve formateadores para que un componente pida `formatCurrency` sin conocer la implementación.
        `foundation/i18n/runtime/formatting/intl/` — (1) implementa con la API `Intl` el formateo de fecha, hora, rango de fechas, número, moneda, porcentaje, tiempo relativo, listas y tamaño de archivo; cada función recibe el locale explícito y si el navegador no lo soporta devuelve texto plano en vez de romper.
          `foundation/i18n/runtime/formatting/intl/tests/` — (1) prueba los nueve formateadores, incluido el camino de error.
      `foundation/i18n/runtime/resolution/` — (1) reexporta los tres resolutores: normalizar un locale, obtener los atributos del documento y buscar un texto traducido.
        `foundation/i18n/runtime/resolution/document/` — (1) calcula el par `lang`/`dir` que la app debe poner en su `<html>` desde el servidor, para que una página en árabe llegue ya en RTL en el primer byte en vez de dar vuelta la página después de hidratar.
          `foundation/i18n/runtime/resolution/document/tests/` — (1) verifica el par lang/dir para los cinco idiomas.
        `foundation/i18n/runtime/resolution/locale/` — (1) convierte una cadena BCP-47 como "en-US" o "es-AR" en el código de dos letras soportado, cayendo al idioma por defecto si no lo reconoce.
          `foundation/i18n/runtime/resolution/locale/tests/` — (1) prueba la normalización y el fallback.
        `foundation/i18n/runtime/resolution/translation/` — (1) busca una clave de texto en cuatro niveles y en este orden — copia del tenant, idioma activo, idioma de fallback configurado, inglés como piso — e interpola los `{parámetros}`; si la clave no está en ninguno devuelve la clave y avisa en desarrollo, señal de bug de autoría.
          `foundation/i18n/runtime/resolution/translation/tests/` — (1) prueba la prioridad de los cuatro niveles y la interpolación.
  `foundation/kernel/` — (0) raíz de las utilidades puras del paquete —sin React, sin DOM, sin módulos de Node— que compiladores y runtime pueden usar por igual en SSR, Edge y navegador.
    `foundation/kernel/accessibility/` — (0) nivel que aloja las dos piezas de accesibilidad de color: validar los colores de una marca y corregir automáticamente el texto ilegible.
      `foundation/kernel/accessibility/branding-contrast/` — (1) valida los pares de color que declara un tenant (texto sobre fondo, primario sobre fondo, etc.) contra los umbrales WCAG 2.2, devuelve las violaciones con alternativas sugeridas, y expone además el contraste APCA en unidades Lc con sus pisos para texto y para controles.
        `foundation/kernel/accessibility/branding-contrast/tests/` — (1) contrasta el cálculo APCA propio contra la implementación de referencia apca-w3.
        `foundation/kernel/accessibility/branding-contrast/text-contrast-autocorrect/` — (1) recorre el mapa de variables `--ds-*` ya compiladas de un tenant y, para cada par texto-sobre-fondo con colores concretos, va corriendo la luminosidad del texto en OKLCH hasta que pasa el piso APCA; nunca falla el compilado, reporta cada corrección para que el editor la muestre.
          `foundation/kernel/accessibility/branding-contrast/text-contrast-autocorrect/tests/` — (1) prueba el corrimiento, los candidatos extremos y las filas no verificables.
      `foundation/kernel/accessibility/wcag/` — (1) utilidades WCAG 2.1 de propósito general: ratio de contraste entre dos colores (acepta hex y `rgb()`), si ese ratio pasa AA o AAA, qué color de texto es legible sobre un fondo dado, y un reporte completo de los cuatro umbrales. [DUPLICA] `packages/core/src/foundation/kernel/color/contrast/` — reimplementa desde cero la linealización sRGB, la luminancia relativa y el ratio de contraste sin importar al dueño declarado; se solapa además con `packages/core/src/foundation/kernel/accessibility/branding-contrast/`. [SIN CONSUMIDOR] fuera de su propio test nadie la importa, ni el código fuente, ni los scripts, ni el showroom, ni el barrel público.
        `foundation/kernel/accessibility/wcag/tests/` — (1) único consumidor de la carpeta anterior; prueba sus cinco funciones.
    `foundation/kernel/collections/` — (1) lee y escribe posiciones de un array por índice entero, admitiendo índices negativos, sin depender de `Array.prototype.at`, que el target ES2020 del paquete no garantiza; lo usan sobre todo los gráficos.
      `foundation/kernel/collections/tests/` — (1) prueba índices negativos, fuera de rango y no enteros.
    `foundation/kernel/color/` — (0) nivel que aloja la matemática de color pura: la colorimetría WCAG por un lado y el espacio perceptual OKLCH por el otro.
      `foundation/kernel/color/contrast/` — (1) dueño único del parseo de hex, la linealización sRGB, la luminancia relativa WCAG 2.2 y el ratio de contraste simétrico; lo consumen los módulos de accesibilidad y la paleta de gráficos.
        `foundation/kernel/color/contrast/tests/` — (1) prueba parseo, linealización, luminancia y ratio.
      `foundation/kernel/color/oklch/` — (1) convierte entre hex sRGB y OKLab/OKLCH (el espacio que usa `oklch()` de CSS Color 4) y mapea al gamut sRGB bajando croma por búsqueda binaria, sin ninguna dependencia externa.
        `foundation/kernel/color/oklch/chart-series/` — (1) deriva diez colores categóricos de gráfico a partir de un solo color semilla de marca: separa tonos, acota el croma para que una marca gris siga distinguible, alterna dos bandas de luminosidad y empuja cada color hasta que pasa el piso 3:1 contra cada fondo.
          `foundation/kernel/color/oklch/chart-series/tests/` — (1) prueba determinismo, separación y el piso de contraste de los diez slots.
        `foundation/kernel/color/oklch/ramp/` — (1) deriva la rampa de diez pasos 50..900 de un rol de color desde una semilla, anclada al fondo real del tenant, de modo que el paso 50 siempre quede pegado al lienzo del tenant sea claro u oscuro.
        `foundation/kernel/color/oklch/tests/` — (2) prueba la ida y vuelta OKLCH/sRGB y el mapeo de gamut, y además `ramp.test.ts` prueba la carpeta hermana `ramp/`, que no tiene carpeta de tests propia.
    `foundation/kernel/cryptography/` — (0) nivel que aloja el único algoritmo de hash del paquete.
      `foundation/kernel/cryptography/sha-256/` — (1) implementación propia de SHA-256 sobre texto UTF-8, escrita para no importar `node:crypto`, de modo que el mismo digest se calcule igual en SSR, en Edge y en el navegador; la usan los digests de artefactos y de esquemas del compilador de temas.
        `foundation/kernel/cryptography/sha-256/tests/` — (1) contrasta el digest contra vectores conocidos.
    `foundation/kernel/geometry/` — (0) nivel que aloja la regla geométrica de los radios de esquina.
      `foundation/kernel/geometry/radius-dial/` — (1) divide cada radio que el tenant escribió a mano por la escala `--ds-radius-scale` que emite la misma compilación, para que el dial de forma siga moviendo las esquinas en vez de quedar clavado por el bloque de tenant; lo comparten los dos emisores que pueden escribir un radio.
    `foundation/kernel/math/` — (1) seis funciones numéricas puras usadas en layout, motion y generación de tokens: `clamp`, `lerp`, `normalize`, `remap`, `roundTo` y `range`. [DUPLICA] parcialmente `packages/core/src/infrastructure/compilers/kernel/foundation/css/color-math/`, que define `clampValue` con el mismo cuerpo en vez de importar `clamp`. Un solo importador en todo el repo (el emisor de postura de apariencia); las otras cinco funciones no tienen consumidor.
      `foundation/kernel/math/tests/` — (1) prueba las seis funciones.
    `foundation/kernel/performance/` — (1) comparadores de props para `React.memo`: uno superficial genérico y una fábrica que ignora claves indicadas (útil para callbacks inestables). [SIN CONSUMIDOR] solo lo reexporta `packages/core/src/index.ts`; ningún componente, script ni el showroom lo usan.
    `foundation/kernel/serialization/` — (1) serializa un valor a JSON canónico (claves ordenadas por code unit, strings recortados, `-0` a `0`, y error explícito ante cualquier valor fuera del modelo JSON) para que dos payloads iguales produzcan el mismo digest, más un clon exacto para cuando hay que conservar el valor en vez de compararlo.
      `foundation/kernel/serialization/tests/` — (1) prueba forma canónica, reconocimiento entre realms y los códigos estables de rechazo.
    `foundation/kernel/typography/` — (1) agrega `"Noto Sans Arabic"` al final de las font stacks del tenant en los tres canales de texto (base, heading, display, nunca mono) de forma idempotente, para que ningún tenant pueda dejar el árabe sin fuente que lo renderice.
      `foundation/kernel/typography/tests/` — (1) prueba que el fallback se agrega, no se duplica y respeta las familias del tenant.
  `foundation/presets/` — (0) raíz de los presets first-party de Rottay que vienen empaquetados con el design system: perfiles de producto, verticales y las baselines de experiencia que ambos comparten.
    `foundation/presets/policy/` — (0) nivel que aloja las baselines de experiencia compartidas entre registros.
      `foundation/presets/policy/experience-baselines/` — (0) nivel con una carpeta por vertical que necesita fijar sus ejes de superficie y motion en un solo lugar.
        `foundation/presets/policy/experience-baselines/evnto/` — (1) objetos congelados con la densidad, los radios, las sombras, el glass, los gradientes, los overlays y el motion canónicos de Evnto; el BrandTheme de Evnto, su preset vertical y su perfil de producto referencian estos mismos objetos para que las tres rutas no puedan divergir ni contaminarse entre sí.
    `foundation/presets/product-profiles/` — (1) registro cerrado de cinco perfiles de producto (`generic.default`, `events.organizer`, `recruiting.operator`, `rottay.admin`, `rottay.flagship`) que describen el ánimo y la densidad de interacción de un dominio, más la función que resuelve uno por clave; la unión es cerrada a propósito para que pedir un perfil inexistente sea error de compilación y no un fallback silencioso.
    `foundation/presets/verticals/` — (1) registro de las tres verticales first-party (`evnto`, `bithire`, `rottay`) con su personalidad, su motor preferido y sus defaults de superficie; deliberadamente NO tiene color, porque el color sale del BrandTheme y este registro llegó a ser una segunda autoridad de color que contradecía al tema.
      `foundation/presets/verticals/tests/` — (1) verifica el perfil de motion de cada vertical y que la clave retirada `platform` no resuelva a nada ni tenga alias.
  `foundation/tokens/` — (6 archivos) raíz del sistema de tokens: su `index.ts` reexporta el fachada TS y documenta que hay dos formatos paralelos del mismo juego de variables `--ds-*` (los CSS que definen valores y los objetos TS que dan handles tipados); junto a él viven cuatro ledgers JSON de adjudicación (`prototype-ledger.json` + su schema, `premium-dead-adjudication.json`, `reads-adjudication.json`, `residual-adjudication.json`) donde se registra, token por token, si un canal tiene escritor/lector real, si se promueve, se reconecta o se propone retirar.
    `foundation/tokens/__tests__/` — (33 archivos) suite de contratos transversales del sistema de tokens que no pertenecen a un archivo CSS concreto: identidad y proyección del roster de verticales de primera parte, paridad y "generado, no editado" de los artifacts de tenant, drenajes por tanda de los tokens de rottay/bithire/evnto (T1/T2/T3), contrato de motion e interacciones, guardas de `prefers-reduced-motion`, namespace obligatorio de los `@keyframes`, presets de densidad, rampas fluidas y distinción de canales de estado.
    `foundation/tokens/css/` — (0) nivel de agrupación que separa el formato CSS (las variables reales que pinta el navegador) del espejo TypeScript de `ts/`; se ordena internamente por rol de dependencia: `foundation/` (valores base) → `runtime/` (motores y personalidad) → `presentation/` (canales por componente y skins) → `facade/` (los entrypoints públicos y los artifacts compilados).
      `foundation/tokens/css/facade/` — (0) frontera pública del CSS: aquí están los archivos que un consumidor importa de verdad (`@rottay/design-system/styles*`) y los artifacts de tenant ya compilados; nada de aquí define valores nuevos, sólo declara el orden de capas y ensambla lo de abajo.
        `foundation/tokens/css/facade/artifacts/` — (0) agrupador de las hojas de pintura de tenant generadas, una carpeta por vertical de primera parte; son salidas de build, no fuentes.
          `foundation/tokens/css/facade/artifacts/bithire/` — (1) `index.css` generado (~2200 líneas) con la pintura del tenant BitHire: declara centenares de `--ds-*` concretos (color, radio, tipografía, sombras por familia) bajo `html[data-tenant='bithire']` / `[data-ds-root][data-vertical='bithire']`, y va deliberadamente SIN capa para ganarle a todas las capas `rottay-*`. [DUPLICA] es la proyección compilada de `packages/core/src/foundation/tokens/ts/presentation/brand-themes/bithire/index.ts` (más la extensión declarada); se regenera con `build:vertical-css` y cualquier edición manual la revierte el gate de paridad.
          `foundation/tokens/css/facade/artifacts/evnto/` — (1) lo mismo para el vertical Evnto: `index.css` generado con los `--ds-*` del tenant Evnto, sin capa, scopeado por `data-tenant`/`data-vertical`. [DUPLICA] proyección compilada de `packages/core/src/foundation/tokens/ts/presentation/brand-themes/evnto/index.ts`.
          `foundation/tokens/css/facade/artifacts/rottay/` — (1) lo mismo para el vertical Rottay/platform: `index.css` generado (~2900 líneas), `color-scheme: dark`, sin capa. [DUPLICA] proyección compilada de `packages/core/src/foundation/tokens/ts/presentation/brand-themes/rottay/index.ts` (no existe una carpeta `platform/`: los brand-themes en fuente son bithire, evnto y rottay).
        `foundation/tokens/css/facade/entrypoints/` — (5) los cinco puntos de entrada CSS: `styles.css` (bundle completo con los tres tenants), `base.css` (todo menos la pintura de tenant, que es lo que consume el build por vertical) y `rottay.css`/`bithire.css`/`evnto.css` (base + un tenant); son los que declaran el orden canónico `@layer theme, base, rottay-framework, rottay-reset, rottay-tokens, rottay-motion, rottay-components, rottay-engines, rottay-personality, rottay-responsive, components, utilities` y los que hacen los ~280 `@import` de skins asignando a cada archivo su capa.
          `foundation/tokens/css/facade/entrypoints/tests/` — (1) contrato del piso de 44px de área táctil: fija que la regla compartida y sin capa de `base.css` siga existiendo, que su cobertura de selectores sólo pueda crecer y que su valor siga siendo una longitud en píxeles físicos.
      `foundation/tokens/css/foundation/` — (0) nivel de agrupación de los valores base del sistema: lo que se importa en la capa `rottay-tokens` (y `rottay-motion` / `rottay-responsive`) y de lo que todo lo demás depende; nada de aquí conoce componentes ni motores.
        `foundation/tokens/css/foundation/animations/` — (5) el vocabulario de movimiento: `transitions.css` define duraciones y curvas (`--ds-motion-*`, `--ds-duration-*`, `--ds-ease-*`) con la cadencia 120/200/320ms, `keyframes.css` define los `@keyframes ds-foundation-*` reutilizables, `premium.css` define la capa de gradiente/vidrio/glow (`--ds-gradient-*`, `--ds-shadow-glow-*`, `--ds-glass-*`) escalada por `--ds-effect-intensity`, y `collection-stagger.css` la entrada escalonada de colecciones (`--ds-stagger-index/step/max`); entran en la capa `rottay-motion`.
        `foundation/tokens/css/foundation/base/` — (8 archivos) las rampas primitivas del sistema en la capa `rottay-tokens`: espaciado, densidad por contenedor (`data-density` → `--ds-density-local-factor` y reproyección del ramp de spacing), tipografía, sombras, bordes/radios y z-index; aparte, `properties.css` registra con `@property` los `--ds-*` animables (se importa SIN capa porque `@property` no es contenido capeable).
          `foundation/tokens/css/foundation/base/tests/` — (3) gates sobre esos archivos base: que los pisos de accesibilidad estén realmente en el CSS enviado y en el compilador, que la proyección CSS de densidad coincida con `DENSITY_MODE_FACTORS` del módulo TypeScript canónico, y que los `initial-value` de las registraciones `@property` no se desvíen del valor en reposo del bundle.
        `foundation/tokens/css/foundation/monochrome/` — (1) la rampa gris de la firma comercial: 11 pasos perceptualmente uniformes (+10 en L* de CIE) de `--ds-mono-0` (negro) a `--ds-mono-1000` (blanco) más los anclajes tinta/papel; es deliberadamente distinta de la escala `--ds-color-neutral-*` (que va teñida de tono) y la importan los dos entrypoints en `rottay-tokens`.
        `foundation/tokens/css/foundation/responsive/` — (5) ajustes condicionados por el entorno de render, importados en `rottay-responsive` (la última capa del DS, así corrigen por encima de tokens, skins y tenant): tamaños de avatar en móvil, política de área táctil y layout de grupo para botones en punteros gruesos, y la neutralización de `letter-spacing` en `:lang(ar)` (el árabe es cursivo y el tracking rompe las uniones); `language-arabic-root.css` repite esa neutralización SIN capa porque la pintura de tenant tampoco tiene capa y le ganaba a la versión capeada.
          `foundation/tokens/css/foundation/responsive/tests/` — (1) gate del caso raíz del guard árabe: que la regla sin capa siga presente y siga ganándole al tracking negativo que publica un artifact de tenant.
        `foundation/tokens/css/foundation/themes/` — (1) `default.css`, el tema por defecto y la autoridad raíz de los canales de fundación (paleta semántica, superficies, texto, bordes, elevación) y de los fallbacks neutros sin tenant; la ley que declara es que un canal de familia no puede estar autorizado a la vez aquí y en `presentation/components/<familia>.css`.
          `foundation/tokens/css/foundation/themes/tests/` — (6) los contratos de esa autoridad raíz: ledger + test de qué canal de componente puede declararse en `default.css`, derivación de los neutros, elevación por lift de superficie, autoridad de tono/tinta y resolución de las escalas de tipografía y radio.
        `foundation/tokens/css/foundation/typography/` — (0) nivel de agrupación que hoy sólo alberga los packs de fuentes autoalojados.
          `foundation/tokens/css/foundation/typography/font-packs/` — (0) agrupador de los packs de fuente opt-in: cada subcarpeta trae su woff2 subset latino con licencia OFL y un `index.css` con el `@font-face` y la propiedad `--ds-font-pack-<id>`; ninguno se importa desde `styles.css`, se publican como subpath `@rottay/design-system/fonts/<id>.css` para que una app pague sólo por lo que activa su envelope.
            `foundation/tokens/css/foundation/typography/font-packs/editorial-display/` — (2) pack de display serif Fraunces (variable 400-700): el woff2 y el CSS que define `--ds-font-pack-editorial-display` con su stack de fallback.
            `foundation/tokens/css/foundation/typography/font-packs/editorial-text/` — (2) pack de texto serif Newsreader (variable 400-600), define `--ds-font-pack-editorial-text`.
            `foundation/tokens/css/foundation/typography/font-packs/geometric-display/` — (2) pack de display sans geométrica Outfit (variable 400-700), define `--ds-font-pack-geometric-display`.
            `foundation/tokens/css/foundation/typography/font-packs/grotesk-display/` — (2) pack de display grotesca Space Grotesk (variable 400-700), define `--ds-font-pack-grotesk-display`; además viaja en el bundle del vertical BitHire.
            `foundation/tokens/css/foundation/typography/font-packs/humanist-text/` — (2) pack de texto sans humanista Public Sans (variable 400-600), define `--ds-font-pack-humanist-text`; también viaja en el bundle de BitHire.
            `foundation/tokens/css/foundation/typography/font-packs/manifest/` — (1) `index.ts`, el registro único que mapea cada pack a sus archivos woff2 físicos, a la propiedad que define y a su stack de fallback; se reexporta desde el entrypoint `/server` para que un shell SSR pueda emitir los `<link rel="preload" as="font">` sin importar el CSS.
            `foundation/tokens/css/foundation/typography/font-packs/plex-mono/` — (3) pack monoespaciado IBM Plex Mono, que a diferencia de los otros son instancias estáticas (un woff2 por peso, 400 y 600) y define `--ds-font-pack-plex-mono`; también viaja en el bundle de BitHire.
            `foundation/tokens/css/foundation/typography/font-packs/tests/` — (1) contrato del registro: que cada archivo declarado exista en disco, que todo `@font-face` lleve `font-display: swap` y que la propiedad `--ds-font-pack-<id>` de cada CSS liste exactamente el fallback que anuncia el manifest.
      `foundation/tokens/css/presentation/` — (0) nivel de agrupación de lo que sí conoce componentes: los canales públicos por familia y la pintura compartida entre motores.
        `foundation/tokens/css/presentation/components/` — (33 archivos) define los canales públicos por familia (`--ds-button-*`, `--ds-input-*`, `--ds-card-*`, `--ds-modal-*`, `--ds-tag-*`, etc., con tamaños, variantes y estados) en `:root`, que es lo que un tenant sobrescribe para recustomizar sin tocar reglas; entra en la capa `rottay-components` vía `index.css`. Ojo con dos archivos: `patterns.css` sí se importa, mientras que `patterns-paint.css` (909 líneas) no lo importa nadie y quedó como lápida — su contenido ya se migró a `patterns.css`.
          `foundation/tokens/css/presentation/components/skin/` — (157 archivos) la pintura compartida entre los tres motores: un archivo por familia de patrón/estructura/superficie (app-shell, action-dock, activity-*, ascii-diagram, auth-surface, billing, widget-board...) con reglas reales sobre clases `ds-*`/`rottay-*` y `data-part`, importadas una por una desde los entrypoints en `rottay-components`. NO duplica `foundation/tokens/css/runtime/engines/modern/skin/`: sólo coinciden 4 nombres (list, record-facts, scroll-area, widget-board) y en esos casos los propios encabezados declaran el reparto — aquí la anatomía base que renderiza cualquier motor, allá la remediación específica de modern en una capa posterior.
      `foundation/tokens/css/runtime/` — (1) `personality.css`, la única proyección de los tokens de personalidad que publica `SystemCssVariablesBridge` hacia los canales canónicos de componente (sombras, scrollbar, `::selection`, blur de overlays) cruzando los tres contratos de DOM de motor; se importa en la capa `rottay-personality`.
        `foundation/tokens/css/runtime/bridges/` — (2) puentes de token a componente de librería ajena: `collapse.css` traduce los `--ds-collapse-*` del wrapper `.ds-collapse` a las clases internas `.ant-collapse-*` del motor classic, en la capa `rottay-components`; `collapse-paint.css` es una lápida deprecada que no importa nadie (su contenido ya viaja en `collapse.css`) y el gate de capas prohíbe importarla.
        `foundation/tokens/css/runtime/engines/` — (1) `index.css`, el índice que ordena la cascada de motores (classic → proyección de framework de modern → theme de modern → bridge de framework → interpolate-size → rustic) y que los entrypoints importan como `layer(rottay-engines)`.
          `foundation/tokens/css/runtime/engines/classic/` — (2) `theme.css` mapea los `--ds-*` a las clases de Ant Design 5.x bajo `html[data-tenant]`, cubriendo hover/focus/active/disabled; y `classic-anatomy-support.json` declara, por familia y variante, si el wrapper de Ant la reproduce (`supported`/`approximated`/`unsupported`) porque classic no tiene skin propio — lo consume `anatomy-variant-gate.mjs`.
          `foundation/tokens/css/runtime/engines/modern/` — (5) el nivel de motor de modern: `theme.css` (puente legado a las variables de DaisyUI 5, con conteo de líneas ratcheteado a la baja), `framework-token-projection.css` (proyecta los `--ds-*` ya resueltos al vocabulario privado del framework, sin definir ningún `--ds-*` nuevo), `framework-bridge.css` (shims de compatibilidad y normalización de controles crudos, cerrado a pintura nueva), `compiled.css` (entrada que Tailwind 4 procesa en build con `source(none)` para generar sólo las utilidades de los entrypoints de modern) e `interpolate-size.css` (habilitador de transiciones a `auto`, scopeado a `[data-engine='modern']`).
            `foundation/tokens/css/runtime/engines/modern/skin/` — (123 archivos) la pintura propia del motor modern, un archivo por primitivo/familia (button, card, modal, tabs, select, calendar, cockpit-header...), scopeada por `rottay-<familia>--modern` + `data-part`/`data-variant` y consumiendo únicamente los canales públicos `--ds-*`; los entrypoints la importan archivo por archivo en `rottay-engines`, que ordena después de `rottay-components`.
            `foundation/tokens/css/runtime/engines/modern/tests/` — (1) contrato del habilitador `interpolate-size`: falla si vuelve a `:root` (y contamina classic/rustic), si pierde su guarda `@supports`, si se duplica o si su hoja se cae de la cascada de motores.
          `foundation/tokens/css/runtime/engines/rustic/` — (1) `theme.css`, la implementación de CSS puro del motor rustic sobre clases `.ds-*`, sin framework y cubriendo todos los estados interactivos.
            `foundation/tokens/css/runtime/engines/rustic/skin/` — (111 archivos) la pintura por familia del motor rustic, deliberadamente SIN capa porque cualquier capa `rottay-*` pierde contra el preflight de Tailwind del consumidor; comparte 110 nombres de archivo con `foundation/tokens/css/runtime/engines/modern/skin/` pero no es duplicación: es la misma familia pintada por otro motor, con otros selectores y otros valores.
    `foundation/tokens/ts/` — (0 archivos) raíz del espejo TypeScript del sistema de tokens: agrupa cuatro ramas (facade, foundation, presentation, runtime) que exponen en TypeScript o bien handles con formato `var(--ds-*)` hacia variables CSS, o bien las decisiones de marca y los registros de perfiles que los compiladores bajan a CSS.
      `foundation/tokens/ts/facade/` — (1) barril único del espejo: reexporta base, componentes, brand-themes y mirrors y arma el objeto `tokens` anidado; es lo único que reexporta `foundation/tokens/index.ts`, y ese barril lo importa un solo archivo de producción (`ui/primitives/layout/Collapse/runtime/tokens/index.ts`) y solo para traer `getCollapseTokens`/`getCollapseSlotTokens`.
        `foundation/tokens/ts/facade/compat/` — (0) carpeta de agrupación para lo que el facade conserva por compatibilidad y ya no es la vía recomendada.
          `foundation/tokens/ts/facade/compat/typography-scale/` — (1) define `typographyScale`, un mapa de diez presets de texto (pageTitle, sectionTitle, body, caption, code, kpiValue...) con valores literales en rem y pesos numéricos como objetos `CSSProperties`, pensado para `style` inline y para dibujo en canvas/SVG donde no se pueden leer variables CSS. [DUPLICA] la misma rampa tipográfica que ya declaran `packages/core/src/foundation/tokens/css/foundation/base/typography.css` y `packages/core/src/foundation/tokens/ts/foundation/base/typography/`, con la diferencia de que acá los números están escritos a mano en vez de referenciar el token. [SIN CONSUMIDOR] `typographyScale` no aparece en ningún archivo de `packages/core/src`, `packages/core/scripts` ni `packages/showroom/src` fuera de esta carpeta y del reexport marcado `@deprecated` en el facade.
      `foundation/tokens/ts/foundation/` — (0) carpeta de agrupación de la capa más baja del espejo: los primitivos globales de los que dependen componentes y temas.
        `foundation/tokens/ts/foundation/base/` — (1) barril que junta color, espaciado, tipografía, sombras, bordes, z-index y densidad, y arma el objeto agregado `baseTokens`. [SIN CONSUMIDOR] `baseTokens` no lo importa nadie: la única coincidencia del nombre fuera de la carpeta es una función local homónima en un test de overrides de tenant; la carpeta solo la alcanza el facade dentro del mismo árbol.
          `foundation/tokens/ts/foundation/base/borders/` — (1) declara constantes tipadas con los handles de borde (`borderWidth`, `radius`, `borderStyle`, `borderColor`, `divider`, `outline`), cada valor la cadena `var(--ds-border-width-*)` / `var(--ds-radius-*)`, más los tipos de clave asociados. [DUPLICA] el inventario de nombres que define con valores reales `packages/core/src/foundation/tokens/css/foundation/base/borders.css`. [SIN CONSUMIDOR] ningún archivo fuera de esta carpeta importa `borderWidth`, `borderStyle`, `divider` ni `outline` desde acá (las coincidencias de esos nombres son propiedades CSS en objetos de estilo, no imports).
          `foundation/tokens/ts/foundation/base/colors/` — (1) declara las escalas de color de 10 pasos (50–900) para primary, secondary, neutral, success, warning, error e info, más blanco/negro y overlays alpha, todo como cadenas `var(--ds-color-*)`. [DUPLICA] los nombres de canal que definen los archivos de tema en `packages/core/src/foundation/tokens/css/foundation/themes/`. [SIN CONSUMIDOR] `colorPrimary`, `colorCommon` y `colorAlphaBlack` no se importan en ningún lado fuera de esta carpeta.
          `foundation/tokens/ts/foundation/base/density/` — (1) define el vocabulario de densidad de verdad y no solo handles: el tipo `DensityMode` (`comfortable`/`compact`), los alias de apariencia (`normal`/`spacious`), la tabla de factores, los nombres de las tres variables de densidad y las funciones `normalizeDensityMode`, `resolveDensityModeFactor`, `resolveEffectiveDensityScale` y `resolveDensityStyleVars`, con presets emitidos como `var(--ds-density-*, <literal>)`. La leen el hook `useTokens`, el emisor de postura del compilador de apariencia, la tabla de datos y el workspace de colección, y dos scripts de auditoría.
          `foundation/tokens/ts/foundation/base/shadows/` — (1) declara los handles de elevación (`shadow` xs–3xl e inner), sombras coloreadas por semántica, sombras por componente (card, button, input, overlay, navegación) y los anillos de foco, todos como `var(--ds-shadow-*)`. [DUPLICA] las definiciones reales de `packages/core/src/foundation/tokens/css/foundation/base/shadows.css`. [SIN CONSUMIDOR] `shadowCard`, `shadowFocusRing` y `dropShadow` no se importan fuera de esta carpeta.
          `foundation/tokens/ts/foundation/base/spacing/` — (1) declara la grilla de 4px en tres niveles —escala numérica 0–96, nombres semánticos xxxs–5xl y espaciado contextual (gutter, section, container, gap, padding, margin)— siempre como `var(--ds-spacing-*)`. [DUPLICA] `packages/core/src/foundation/tokens/css/foundation/base/spacing.css`, que es donde esos nombres tienen valor. [SIN CONSUMIDOR] `spacingScale`, `spacingNamed` y `spacingGutter` no aparecen importados fuera de esta carpeta.
          `foundation/tokens/ts/foundation/base/typography/` — (1) declara familias, tamaños, pesos, interlineado, tracking, transformaciones y estilos de texto ya compuestos (display1, heading1–6, body, caption, label, code) como handles `var(--ds-font-*)`, más utilidades de cifras tabulares y balanceo de línea. [DUPLICA] `packages/core/src/foundation/tokens/css/foundation/base/typography.css`. [SIN CONSUMIDOR] `fontSizeHeading`, `textStyles`, `typeCraft` y `NUMS_TABULAR_CLASS` no se importan fuera de esta carpeta.
          `foundation/tokens/ts/foundation/base/z-index/` — (1) declara la escala global de apilado (base, dropdown, sticky, overlay, modal, tooltip, max) más subescalas por dominio (navegación, menús, overlays, feedback, formularios, utilidades) y valores relativos, como `var(--ds-z-index-*)`. [DUPLICA] `packages/core/src/foundation/tokens/css/foundation/base/z-index.css`. [SIN CONSUMIDOR] `zIndices`, `zIndexUtility` y `zIndexRelative` no se importan fuera de esta carpeta.
      `foundation/tokens/ts/presentation/` — (0) carpeta de agrupación de lo que sí es fuente autorada: identidades de marca y registros cerrados de perfiles que los compiladores convierten en CSS.
        `foundation/tokens/ts/presentation/brand-themes/` — (1) además de reexportar los tres temas, es la autoridad única del padrón de verticales primeras: exporta `FIRST_PARTY_IDENTITIES`, `FIRST_PARTY_VERTICAL_ROSTER`, `FIRST_PARTY_THEMES` y las funciones de clasificación que impiden que un tenant se haga pasar por una marca propia. La leen los compiladores de tema, `foundation/presets/verticals`, el índice público del paquete y varios scripts de build y de gate.
          `foundation/tokens/ts/presentation/brand-themes/bithire/` — (1) fuente autorada del tema BitHire: define en un bloque de decisiones la paleta azul, neutros minerales, radios, superficies, motion, tipografía y chrome, y los expone como un `FirstPartyBrandTheme`; de acá se genera `foundation/tokens/css/facade/artifacts/bithire/index.css`, que es producto de build y no fuente.
          `foundation/tokens/ts/presentation/brand-themes/evnto/` — (1) fuente autorada del tema Evnto: negro sobre blanco, acentos arena, el radio más grande de las tres marcas y entradas expresivas, con la misma forma normal de bloque de decisiones más esqueleto de contrato.
          `foundation/tokens/ts/presentation/brand-themes/rottay/` — (1) fuente autorada del tema Rottay: identidad oscura primero (blanco sobre lienzo #0C0C0E), grafitos, acentos contenidos, motion de resorte y pairing mono para superficies de datos.
        `foundation/tokens/ts/presentation/expressive-profiles/` — (1) registro versionado y cerrado de los ejes expresivos (type, geometry, edge, material, elevation, motif, icon), las experiencias publicadas que los combinan, los pisos de accesibilidad y los sobres de recorte; resuelve fallando cerrado ante ids desconocidos. Lo consumen el compilador de BrandTheme y el de TenantThemeDocument, el esquema de tenant y el índice público del paquete.
          `foundation/tokens/ts/presentation/expressive-profiles/emphasis/` — (1) API compacta "familia + intensidad" para apps: cuantiza un valor 0..1 en cuatro pasos y devuelve canales de componente ya scopeados cuyos valores son cadenas `var()` sobre la canónica, para cuatro familias (card, toolbar, metric-card, panel). La lee `infrastructure/runtime/foundation/recipes/emphasis` y se reexporta desde el índice público.
            `foundation/tokens/ts/presentation/expressive-profiles/emphasis/tests/` — (1) prueba con vitest que el vocabulario esté cerrado, que las escaleras sean coherentes y cuantizadas, que ningún valor sea un literal fuera de una cadena `var()` y que la resolución falle cerrada.
          `foundation/tokens/ts/presentation/expressive-profiles/expansion/` — (1) única función pura que baja un conjunto de ejes ya resuelto a dos salidas: valores por defecto de campos tipados para emisores que ya existen y valores para canales sin otro escritor (roles de profundidad tipográfica, anchos de borde, satélites de elevación); es determinista, sin color math ni DOM. La usan los dos compiladores de tema.
            `foundation/tokens/ts/presentation/expressive-profiles/expansion/tests/` — (1) fija con vitest que la salida sea determinista y estable en orden de claves, que un eje sin fila expanda a nada y que las dos proyecciones de la tabla de tipo (filas de canal para DB y overlay de rol estático) no puedan divergir.
          `foundation/tokens/ts/presentation/expressive-profiles/tests/` — (1) fija la ley del registro: ids y valores de eje cerrados, cada composición publicada dentro de los límites globales de motion y de escala de radio, resolución que falla cerrada y saneamiento de entradas hostiles.
        `foundation/tokens/ts/presentation/recipe-profiles/` — (1) registro cerrado y versionado de perfiles de receta: conjuntos acotados de defaults por familia de componente (por ejemplo forma y variante de button, variante de card) que un tema selecciona por id namespaceado en vez de autorar contenido. Lo leen los dos compiladores de tema y `infrastructure/runtime/foundation/recipes/profiles`.
        `foundation/tokens/ts/presentation/responsive-postures/` — (1) registro de tres perfiles que definen los umbrales de ancho de contenedor y el sesgo de span con que el solver adaptativo resuelve los ítems; es dato puro, no emite ningún canal CSS, y el id viaja del documento de tema al artefacto para leerse en render. Lo validan el esquema de TenantThemeDocument, lo usa `ui/patterns/runtime/adaptive-layout` y se reexporta desde el índice público.
        `foundation/tokens/ts/presentation/typography/` — (0) carpeta de agrupación de las decisiones tipográficas que sí son fuente autorada, a diferencia del espejo de handles de `foundation/base/typography`.
          `foundation/tokens/ts/presentation/typography/pairings/` — (1) define `TYPE_PAIRINGS`, los cuatro presets de emparejamiento de fuentes (heading/base/mono más los diales de tracking de título e interlineado de display) que el compilador de apariencia aplica cuando el tema elige `typePairing`, referenciando slots `var(--ds-font-pack-*)` que solo resuelven si se carga el paquete de fuentes opcional.
            `foundation/tokens/ts/presentation/typography/pairings/tests/` — (1) fija con vitest los stacks de familia y los diales afinados de los cuatro presets para que no se desvíen de la dirección de white-label documentada.
      `foundation/tokens/ts/runtime/` — (0) carpeta de agrupación de lo que el espejo ofrece para tiempo de ejecución: handles por componente, catálogos de referencia por tenant y los resolvedores de personalidad.
        `foundation/tokens/ts/runtime/components/` — (1) barril que reexporta los diecinueve módulos de componente y arma el objeto `componentTokens` para introspección. [SIN CONSUMIDOR] `componentTokens` no lo importa nadie fuera del árbol: las coincidencias del nombre en scripts y tests son variables locales homónimas de otros censos.
          `foundation/tokens/ts/runtime/components/avatar/` — (1) declara los handles del Avatar: siete tamaños con size/fontSize/statusSize/borderWidth, tres formas, siete variantes de color, estados online/offline/away/busy, apilado de grupo, interacciones y transiciones, todos `var(--ds-avatar-*)`. [DUPLICA] `packages/core/src/foundation/tokens/css/presentation/components/avatar.css`, que es donde esos mismos nombres tienen valor. [SIN CONSUMIDOR] ni `avatarTokens` ni `avatarStatus` se importan fuera de esta carpeta; los gates solo la escanean como archivo y la clasifican como espejo de tokens.
          `foundation/tokens/ts/runtime/components/badge/` — (1) declara los handles del Badge: cinco tamaños, tamaños de punto indicador, siete variantes, animaciones de proceso, radio, espaciado, borde, tipografía y anatomía. [DUPLICA] `packages/core/src/foundation/tokens/css/presentation/components/badge.css`. [SIN CONSUMIDOR] `badgeTokens` y `badgeAnatomy` no se importan fuera de esta carpeta.
          `foundation/tokens/ts/runtime/components/button/` — (1) declara los handles del Button: cinco tamaños con alto, padding y tipografía, la matriz completa de variantes visuales y de IA, cuatro variantes semánticas, estados disabled/loading/focus, formas, botón solo-icono, grupos y spinner. [DUPLICA] `packages/core/src/foundation/tokens/css/presentation/components/button.css`. [SIN CONSUMIDOR] `buttonTokens` y `buttonSemanticVariant` no se importan fuera de esta carpeta.
          `foundation/tokens/ts/runtime/components/card/` — (1) declara los handles del Card: tamaños de padding, borde, sombra, sub-slots header/body/footer/media/cover, variantes semánticas, estados interactivos, grilla responsive y anillo de foco. [DUPLICA] `packages/core/src/foundation/tokens/css/presentation/components/card.css`. [SIN CONSUMIDOR] `cardTokens` y `cardCover` no se importan fuera de esta carpeta.
          `foundation/tokens/ts/runtime/components/checkbox/` — (1) declara los handles del Checkbox: cinco tamaños con size/fontSize/borderWidth, opciones de radio, seis variantes de color, estados checked/unchecked/disabled, anillo de foco y transiciones. [DUPLICA] `packages/core/src/foundation/tokens/css/presentation/components/checkbox.css`. [SIN CONSUMIDOR] `checkboxTokens` y `checkboxRadius` no se importan fuera de esta carpeta.
          `foundation/tokens/ts/runtime/components/collapse/` — (1) declara los handles del acordeón con nomenclatura por slot (`--ds-collapse-{slot}-{variant}-{state}-{prop}`) para root, header, content e icon, en tres variantes y seis estados, y además reexporta las dos funciones helper de la subcarpeta. [DUPLICA] `packages/core/src/foundation/tokens/css/presentation/components/collapse.css` en cuanto al inventario de nombres. [SIN CONSUMIDOR] los objetos que declara (`collapseRootTokens`, `collapseTokens`) no se importan fuera de esta carpeta; lo que sí se consume son las funciones de `token-utils`.
            `foundation/tokens/ts/runtime/components/collapse/token-utils/` — (1) es la excepción del subárbol que sí ejecuta trabajo: `getCollapseTokens` y `getCollapseSlotTokens` construyen en tiempo de ejecución el objeto de custom properties y los estilos por slot a partir de variante, tamaño, posición de icono y estado, y el hook `useCollapseTokens` de `ui/primitives/layout/Collapse/runtime/tokens` los invoca vía el barril `@/foundation/tokens`.
              `foundation/tokens/ts/runtime/components/collapse/token-utils/tests/` — (1) prueba con vitest que las dos funciones produzcan las custom properties esperadas para las opciones por defecto y para cada slot.
          `foundation/tokens/ts/runtime/components/icon/` — (1) declara los handles del Icon: seis escalones de tamaño (xs–2xl), configuración de trazo (ancho, linecap, linejoin), color por defecto y transiciones. [DUPLICA] `packages/core/src/foundation/tokens/css/presentation/components/icon.css`. [SIN CONSUMIDOR] `iconTokens` e `iconStroke` no se importan fuera de esta carpeta.
          `foundation/tokens/ts/runtime/components/input/` — (1) declara los handles del Input: cinco tamaños, estados default/hover/focus/disabled/readonly, variantes de validación, addons y prefijos, label y texto de ayuda, botón de limpiar, grupos y textarea. [DUPLICA] `packages/core/src/foundation/tokens/css/presentation/components/input.css`. [SIN CONSUMIDOR] `inputTokens` e `inputAddon` no se importan fuera de esta carpeta.
          `foundation/tokens/ts/runtime/components/list/` — (1) declara los handles de la List: tres tamaños, borde y separadores, secciones header/footer, meta de ítem (avatar, título, descripción), acciones, contenido extra, estados vacío y cargando y gutter de grilla. [DUPLICA] `packages/core/src/foundation/tokens/css/presentation/components/list.css`. [SIN CONSUMIDOR] `listTokens` y `listMeta` no se importan fuera de esta carpeta.
          `foundation/tokens/ts/runtime/components/modal/` — (1) declara los handles del Modal: diez anchos, overlay, sub-slots header/body/footer, botón de cierre, animaciones fade/scale/slide, posicionamiento, variantes drawer y bottom-sheet, sombras de scroll, z-index anidado y efecto vidrio. [DUPLICA] `packages/core/src/foundation/tokens/css/presentation/components/modal.css`. [SIN CONSUMIDOR] `modalTokens` y `modalGlass` no se importan fuera de esta carpeta; el único lugar del repo que nombra el archivo es el inventario de fan-out del programa, que lo etiqueta `ts-token-mirror`.
          `foundation/tokens/ts/runtime/components/qrcode/` — (1) declara los handles del QR: seis tamaños con tamaño de icono central, colores de frente/fondo/borde, estados active/loading/expired/scanned, botón de refresco y transiciones. [DUPLICA] `packages/core/src/foundation/tokens/css/presentation/components/qrcode.css`. [SIN CONSUMIDOR] `qrcodeTokens` y `qrcodeRefreshButton` no se importan fuera de esta carpeta.
          `foundation/tokens/ts/runtime/components/radio/` — (1) declara los handles del Radio: cinco tamaños, seis variantes de color, estados checked/unchecked/disabled, escala del punto interno, anillo de foco y transiciones. [DUPLICA] `packages/core/src/foundation/tokens/css/presentation/components/radio.css`. [SIN CONSUMIDOR] `radioTokens` y `radioDot` no se importan fuera de esta carpeta.
          `foundation/tokens/ts/runtime/components/rate/` — (1) declara los handles del Rate de estrellas: cinco tamaños, colores activo/inactivo/hover, escala de hover, anillo de foco, gap y transiciones. [DUPLICA] `packages/core/src/foundation/tokens/css/presentation/components/rate.css`. [SIN CONSUMIDOR] `rateTokens` y `rateInteraction` no se importan fuera de esta carpeta.
          `foundation/tokens/ts/runtime/components/select/` — (1) declara los handles del Select: cinco tamaños, variantes outline/filled/flushed, estado de validación, panel desplegable, ítems de opción, iconos de flecha y limpiar, tags de selección múltiple, buscador y estados cargando/vacío. [DUPLICA] `packages/core/src/foundation/tokens/css/presentation/components/select.css`. [SIN CONSUMIDOR] `selectTokens` y `selectDropdown` no se importan fuera de esta carpeta.
          `foundation/tokens/ts/runtime/components/space/` — (1) declara los tres presets de separación (small/middle/large) que el componente Space usa como gap entre hijos. [DUPLICA] `packages/core/src/foundation/tokens/css/presentation/components/space.css`. [SIN CONSUMIDOR] `spaceSize` y `spaceTokens` no se importan fuera de esta carpeta.
          `foundation/tokens/ts/runtime/components/spinner/` — (1) declara los handles del Spinner: cuatro tamaños, color principal y de pista, y las propiedades de animación (duración, curva, ancho de trazo). [DUPLICA] `packages/core/src/foundation/tokens/css/presentation/components/spinner.css`. [SIN CONSUMIDOR] `spinnerTokens` y `spinnerAnimation` no se importan fuera de esta carpeta.
          `foundation/tokens/ts/runtime/components/tag/` — (1) declara los handles del Tag: cinco tamaños con padding y alto, opciones de radio, espaciado de icono y de cierre, ancho de borde y tipografía. [DUPLICA] `packages/core/src/foundation/tokens/css/presentation/components/tag.css`. [SIN CONSUMIDOR] `tagTokens` y `tagRadius` no se importan fuera de esta carpeta.
          `foundation/tokens/ts/runtime/components/timeline/` — (1) declara los handles del Timeline: tamaño de punto y de línea, offsets, colores semánticos, tipografía de contenido y etiqueta, y animación del estado pendiente. [DUPLICA] `packages/core/src/foundation/tokens/css/presentation/components/timeline.css`. [SIN CONSUMIDOR] `timelineTokens` y `timelinePending` no se importan fuera de esta carpeta (la coincidencia en el showroom es una clave de copia de una demo, no este símbolo).
          `foundation/tokens/ts/runtime/components/toggle/` — (1) declara los handles del Toggle: cinco tamaños con ancho, alto y desplazamiento del punto, seis variantes de color, pista y etiquetas interna y externa, texto de ayuda, estado de error, foco, carga y opacidad deshabilitada. [DUPLICA] `packages/core/src/foundation/tokens/css/presentation/components/toggle.css`. [SIN CONSUMIDOR] `toggleTokens` y `toggleInner` no se importan fuera de esta carpeta.
        `foundation/tokens/ts/runtime/mirrors/` — (1) barril de los catálogos de referencia por tenant: aclara en su propio encabezado que no son fuente autorada (esa es `presentation/brand-themes/`) y solo expone `tenantTokens` con la entrada rottay. [SIN CONSUMIDOR] `tenantTokens` no se importa en ningún archivo fuera del árbol.
          `foundation/tokens/ts/runtime/mirrors/monochrome/` — (1) espejo TypeScript de la rampa monocroma: expone los once escalones de gris como hex crudo (`MONO_GRAY_HEX`, de #000000 a #ffffff), las dos superficies insignia ink y paper, y además el catálogo de referencias `var(--ds-color-mono-*)`, pensado para herramientas de build que no pueden leer custom properties, por ejemplo la generación de imágenes OG. [DUPLICA] los valores que define `packages/core/src/foundation/tokens/css/foundation/monochrome/index.css`, cosa que el propio encabezado del archivo reconoce. [SIN CONSUMIDOR] `MONO_GRAY_HEX`, `monoTokens` y `SURFACE_INK_HEX` no aparecen en ningún archivo de código fuera de esta carpeta, y ni siquiera se reexportan desde el barril `mirrors/`; solo los cita un JSON de adjudicación de lecturas.
          `foundation/tokens/ts/runtime/mirrors/rottay/` — (1) catálogo tipado de los `var(--ds-*)` del tenant Rottay organizado por rol semántico (marca, fondos, texto, bordes, estados, links, tipografía, radios, sombras), declarado explícitamente como espejo de descubrimiento y no como fuente. [DUPLICA] `packages/core/src/foundation/tokens/ts/presentation/brand-themes/rottay/`, que es la fuente autorada de esa misma identidad, y el artefacto generado `packages/core/src/foundation/tokens/css/facade/artifacts/rottay/index.css`. [SIN CONSUMIDOR] `rottayTokens` y `rottayBrand` no se importan fuera de esta carpeta.
        `foundation/tokens/ts/runtime/personality/` — (1) traduce los tokens de personalidad de alto nivel (animación, acento, tarjeta, tipografía, charts, transiciones) en mapas de custom properties, defaults de props y objetos de estilo listos para usar; `resolvePersonalityCssVariables` es lo único que el puente de variables CSS escribe en `:root`. La consumen ese puente, la fachada de personalidad de infraestructura y once primitivas (Button, Card, Badge, Tag, Statistic, Skeleton, Divider y los compuestos de Typography).
          `foundation/tokens/ts/runtime/personality/tests/` — (2) dos suites de vitest: una fija la lista exhaustiva de claves que emite `resolvePersonalityCssVariables` como cerco de auditoría frente a las colisiones con los compiladores de marca, y la otra fija que las cinco duraciones sean un vocabulario cerrado que se anula bajo movimiento reducido, para que no se retire `--ds-duration-slow` por parecer huérfano.

#### packages/core/src/infrastructure/
`infrastructure/` — (0 archivos) capa que ejecuta lo que `foundation/` solo declara: por un lado los compiladores, que bajan una configuracion de marca o de inquilino a variables CSS; por otro el runtime, que monta el proveedor de React, resuelve el motor activo, el tema, el inquilino, la personalidad, los breakpoints, el idioma y las escenas 3D, y expone los hooks de aplicacion. No tiene archivo propio: es una carpeta de agrupacion.
  `infrastructure/compilers/` — (1 archivo) Barril raíz de toda la maquinaria que convierte la configuración visual de una marca o de un inquilino en variables CSS y tokens; solo reexporta lo que `facade/` declara público, y lo importan `src/index.ts` y dos gates de `scripts/`.
    `infrastructure/compilers/composition/` — (1) Barril del nivel "composición" que solo reexporta `tenant-theme/`; [SIN CONSUMIDOR] nadie importa esta ruta (quien necesita el compilador importa `compilers/composition/tenant-theme` directo).
      `infrastructure/compilers/composition/tenant-theme/` — (1) Toma el documento de tema que un inquilino guardó en base de datos, lo valida contra el esquema, lo migra a un Theme completo, lo baja con `compileTheme` y devuelve un artefacto (variables CSS, apariencia normalizada, scopes, cobertura y digest) que sirve igual en SSR, edge y navegador.
        `infrastructure/compilers/composition/tenant-theme/migrate-v1/` — (1) Convierte un documento de inquilino en formato v1 en un parche de Theme tipado: cada perilla soportada mapea a una ruta de campo y cualquier campo desconocido hace fallar la migración.
        `infrastructure/compilers/composition/tenant-theme/tests/` — (15) Pruebas del compilador de tema de inquilino: identidad de digests, paridad entre el camino estático y el de base de datos, separación de overlays, procedencia, contrato de white-label y estabilidad del artefacto.
          `infrastructure/compilers/composition/tenant-theme/tests/fixtures/` — (5) Archivos JSON congelados con documentos/artefactos de ejemplo y con los digests previos a cada cambio, que esas pruebas usan como referencia byte a byte.
        `infrastructure/compilers/composition/tenant-theme/version/` — (1) Guarda una sola constante con la versión del compilador de temas de inquilino ("tenant-theme-compiler@4"), que entra dentro del digest y por lo tanto invalida los artefactos ya guardados cuando cambia.
    `infrastructure/compilers/facade/` — (1) Decide qué parte de los compiladores es API pública: reexporta el compilador de BrandTheme y el de tema de inquilino, y nada más.
    `infrastructure/compilers/kernel/` — (1) Barril del núcleo puro (bases compartidas + compiladores deterministas); [SIN CONSUMIDOR] ningún archivo del repo importa esta ruta, porque `facade/` importa directo `kernel/runtime/brand-theme`.
      `infrastructure/compilers/kernel/foundation/` — (1) Barril de las piezas base compartidas (CSS, movimiento y esquemas); [SIN CONSUMIDOR] en la práctica: su único importador es `kernel/index.ts`, que a su vez no tiene consumidor.
        `infrastructure/compilers/kernel/foundation/css/` — (1) Barril de las utilidades que producen variables CSS; [SIN CONSUMIDOR] en la práctica: solo lo importa el barril `kernel/foundation/index.ts`, que está en la misma cadena muerta.
          `infrastructure/compilers/kernel/foundation/css/appearance-posture/` — (1) Traduce las "posturas" acotadas de apariencia (par tipográfico, escala de tipo, estilo de botón, escala de radio, densidad, movimiento) a variables CSS, en una tabla única que usan los dos compiladores para no divergir.
          `infrastructure/compilers/kernel/foundation/css/chrome-variables/` — (1) Convierte el objeto `chrome` de un tema (sidebar, layout, tablas, tarjetas, modales, tabs, botones, inputs, tooltips, etc.) en declaraciones planas `--ds-*`.
          `infrastructure/compilers/kernel/foundation/css/color-math/` — (1) Utilidades base de color compartidas: validar colores y dimensiones CSS, normalizar hex, convertir hex a RGB, mezclar colores y detectar si una superficie es oscura.
            `infrastructure/compilers/kernel/foundation/css/color-math/interaction-floor/` — (1) A partir del color primario deriva los cuatro canales de interacción (tinta sobre primario, borde de foco, link y link hover) cuando el tema no los declara, y los omite si la semilla no es un hex medible.
            `infrastructure/compilers/kernel/foundation/css/color-math/palette-derivations/` — (1) Deriva de las semillas de paleta del inquilino los valores por defecto que la UI realmente pinta (escalera de fondos, borde sutil, semánticos de primario), para que cambiar un color de marca mueva más que un solo token.
              `infrastructure/compilers/kernel/foundation/css/color-math/palette-derivations/tests/` — (1) Fija el paso de "borde sutil" contra los valores medidos de las verticales ya publicadas.
            `infrastructure/compilers/kernel/foundation/css/color-math/readable-ink/` — (1) Elige entre la tinta clara y la oscura cuál contrasta mejor sobre un color según WCAG, y devuelve explícitamente "no medible" cuando la semilla no es un hex literal.
            `infrastructure/compilers/kernel/foundation/css/color-math/tests/` — (1) Pruebas de las utilidades base de color (hex/RGB, validación, mezcla) sobre las que se apoyan las derivaciones de arriba.
          `infrastructure/compilers/kernel/foundation/css/scope-projection/` — (1) Reescribe los selectores de un CSS ya generado para que el mismo archivo funcione con el scope viejo (`html[data-tenant='x']`) y con el nuevo (`[data-ds-root][data-vertical='x']`), sin usar PostCSS y preservando comentarios y strings tal cual.
            `infrastructure/compilers/kernel/foundation/css/scope-projection/tests/` — (1) Verifica esa reescritura de selectores sobre artefactos de vertical renderizados de verdad.
        `infrastructure/compilers/kernel/foundation/motion/` — (1) Barril de las utilidades de movimiento; [SIN CONSUMIDOR] en la práctica: solo lo importa `kernel/foundation/index.ts` (cadena muerta), mientras que `spring-easing/` se importa directo.
          `infrastructure/compilers/kernel/foundation/motion/spring-easing/` — (1) Simula numéricamente un resorte amortiguado (tensión/fricción del tema) y lo muestrea en una función CSS `linear()`, para que las animaciones tengan curva de resorte real en vez de una cúbica aproximada.
        `infrastructure/compilers/kernel/foundation/schemas/` — (1) Barril de los manifiestos de esquema; [SIN CONSUMIDOR] en la práctica: solo lo importa `kernel/foundation/index.ts` (cadena muerta), mientras que `schemas/tenant-theme/` se importa directo.
          `infrastructure/compilers/kernel/foundation/schemas/tenant-theme/` — (1) Declara, como dato serializable, qué campos y qué rangos acepta el tema de inquilino v1; de este objeto salen la validación y el digest de esquema (no duplica `packages/core/src/infrastructure/compilers/composition/tenant-theme/`: ese compilador lo importa y lo reexporta en vez de repetir el inventario de campos).
      `infrastructure/compilers/kernel/runtime/` — (1) Barril de los dos compiladores del núcleo; [SIN CONSUMIDOR] en la práctica: su único importador es `kernel/index.ts`, que no tiene consumidor.
        `infrastructure/compilers/kernel/runtime/appearance/` — (1) Convierte los contratos de apariencia guardables en base de datos (`TenantAppearance` general y advanced) en variables CSS y rampas de color. [DUPLICA] `packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/`: baja las mismas familias de canales `--ds-*` (paleta, tipografía, radio, densidad y el mismo objeto `chrome`, que es el mismo tipo en ambos contratos) con su propio emisor; comparten las hojas (`appearance-posture`, `chrome-variables`, `palette-derivations`, `readable-ink`, `interaction-floor`) justamente porque son dos autores del mismo resultado, y el camino canónico de base de datos ya pasa por `compileTheme` de `brand-theme` y de acá solo toma `withExpressiveFieldDefaults`; el resto de sus consumidores son la vista previa de branding y herramientas de auditoría.
          `infrastructure/compilers/kernel/runtime/appearance/tests/` — (4) Pruebas de que los campos declarados de apariencia producen variables CSS reales (nada inerte), incluida la emisión en runtime y la elección de tinta legible.
        `infrastructure/compilers/kernel/runtime/brand-theme/` — (1) Compilador canónico: toma un BrandTheme/Theme más el baseline de la vertical y produce personalidad, `tokenOverrides`, el mapa de variables CSS y el string de CSS que consumen el proveedor de temas y la generación estática de archivos.
          `infrastructure/compilers/kernel/runtime/brand-theme/tests/` — (24) Pruebas del compilador de marca: rampas de color, bloques por modo claro/oscuro, materiales y tipografía semánticos, piso de paleta extendida, fallback de fuentes, easing de resorte, invariantes por inquilino y regresiones premium.
    `infrastructure/compilers/runtime/` — (1) Barril del nivel "runtime" que solo reexporta `tenant-css/`; [SIN CONSUMIDOR] nadie importa esta ruta, todos importan `compilers/runtime/tenant-css` directo.
      `infrastructure/compilers/runtime/tenant-css/` — (1) Entrada pública para generar los archivos CSS estáticos de las verticales propias: expone el renderizador de artefactos, la lista de verticales y la proyección de scopes.
        `infrastructure/compilers/runtime/tenant-css/artifact-renderer/` — (1) Renderiza de forma determinista el archivo CSS de una vertical: compila su BrandTheme, escribe el banner de "generado, no editar", arma el bloque base y los bloques por modo, y proyecta los dos scopes equivalentes.
          `infrastructure/compilers/runtime/tenant-css/artifact-renderer/tests/` — (4) Leyes del formato del artefacto: un único autor, bloques por modo correctos, procedencia y valores neutrales respecto del slug.
            `infrastructure/compilers/runtime/tenant-css/artifact-renderer/tests/support/` — (1) Ayudantes con PostCSS que, dado un artefacto renderizado, dicen en qué estado (sin modo, claro u oscuro) cada regla autoriza la raíz del inquilino; no es un archivo de test, es soporte de esas pruebas.
    `infrastructure/runtime/` — (1 archivo) agrupa todo el motor interno del design system que corre en tiempo de ejecución (arranque, engines, theming, tenant, personalidad, features, responsive, motion, i18n, gráficos, adaptadores y hooks de aplicación); su `index.ts` reexporta esos módulos para que el proveedor los orqueste, y no está pensado para que las apps lo importen directo.
      `infrastructure/runtime/adapters/` — (0) carpeta contenedora de los puntos de inyección con los que la app le presta al design system piezas que el design system decide no tener (por ejemplo su router), sin archivos propios.
        `infrastructure/runtime/adapters/presentation/` — (0) nivel intermedio que indica que estos adaptadores son de capa de presentación (React), sin archivos propios.
          `infrastructure/runtime/adapters/presentation/react/` — (0) nivel intermedio que agrupa los tres adaptadores concretos de React, sin archivos propios.
            `infrastructure/runtime/adapters/presentation/react/compound-components/` — (1) ofrece dos ayudantes para armar componentes compuestos al estilo `Menu.Item`: `createSubComponent` (le pone nombre legible al componente para React DevTools) y `createCompoundComponent` (cuelga los sub-componentes del padre con tipos correctos), más el tipo `PolymorphicProps`. [SIN CONSUMIDOR] fuera de la carpeta sólo aparece en `packages/core/src/index.ts`, que lo reexporta al público; ningún componente del repo lo usa.
              `infrastructure/runtime/adapters/presentation/react/compound-components/tests/` — (1) prueba que esos dos ayudantes asignen bien el `displayName` y adjunten los sub-componentes.
            `infrastructure/runtime/adapters/presentation/react/focus-mode/` — (1) contexto React donde la app publica un booleano de "modo concentración"; el hook `useDsFocusMode` deja que un componente del design system se esconda cuando la app activa ese modo, y lo usa `ui/structures/dashboard/data-terminal-card`.
            `infrastructure/runtime/adapters/presentation/react/navigation/` — (1) contexto React donde la app inyecta su componente `Link` (Next.js, React Router, el que sea); el hook `useNavigationLink` lo entrega a los componentes que pintan rutas internas y, si nadie montó el proveedor, caen a un `<a>` nativo. Lo usan varias structures (record/field, headers, dashboard/insights, etc.).
      `infrastructure/runtime/application/` — (0) carpeta contenedora de los hooks de React de nivel "aplicación": utilidades genéricas y sin semántica de negocio (datos, formularios, atajos, estado, búsqueda, accesibilidad, IA, voz) que el paquete exporta para que las apps las cableen; sin archivos propios.
        `infrastructure/runtime/application/accessibility/` — (1) hooks de accesibilidad: `useKeyboardNavigation` (mover el foco con flechas en listas, menús y grillas), `useRovingTabindex` (el patrón WAI-ARIA de un solo tab-stop por grupo) y `useAriaAnnounce` (anunciar cambios al lector de pantalla con una región aria-live). Lo consume, entre otros, `ui/patterns/data/gallery-view`.
          `infrastructure/runtime/application/accessibility/tests/` — (1) prueba el comportamiento de esos tres hooks de accesibilidad.
        `infrastructure/runtime/application/automation/` — (0) carpeta contenedora de los hooks que hablan con capacidades automáticas del navegador o de un modelo (asistente de chat y dictado por voz); sin archivos propios.
          `infrastructure/runtime/application/automation/assistant/` — (1) hooks de chat con IA independientes del proveedor: `useStreamingText` (ir mostrando el texto que llega de a pedazos, con animación de tipeo) y `useChat` (máquina de estados completa de la conversación que además arma las props listas para `ChatSurface`). [SIN CONSUMIDOR] sólo lo reexporta la fachada pública `infrastructure/runtime/facade/react-hooks`; ningún componente del repo lo llama.
            `infrastructure/runtime/application/automation/assistant/tests/` — (2) prueba la máquina de estados de `useChat` y que `useStreamingText` respete la preferencia de movimiento reducido.
          `infrastructure/runtime/application/automation/voice/` — (0) nivel contenedor del dictado por voz; sin archivos propios.
            `infrastructure/runtime/application/automation/voice/composition/` — (0) nivel intermedio que marca que lo de abajo es código de composición React; sin archivos propios.
              `infrastructure/runtime/application/automation/voice/composition/react/` — (0) nivel intermedio de React para el dictado por voz; sin archivos propios.
                `infrastructure/runtime/application/automation/voice/composition/react/input/` — (1) el hook `useVoiceInput`, que envuelve la Web Speech API del navegador: pide permiso al micrófono, expone estados (no soportado, escuchando, transcribiendo, error) y devuelve la transcripción; lo usan `ui/primitives/inputs/VoiceInputButton` y `ui/structures/workspace/search-command-bar`.
        `infrastructure/runtime/application/commands/` — (1) barril público del registro de comandos: reexporta el proveedor y los hooks de `runtime/registry`. Lo importan `ui/structures/workspace/search-command-bar` y `connected-command-palette`.
          `infrastructure/runtime/application/commands/runtime/` — (0) nivel intermedio que separa la implementación del barril; sin archivos propios.
            `infrastructure/runtime/application/commands/runtime/registry/` — (1) registro global de acciones ejecutables: los componentes registran comandos al montarse y los dan de baja al desmontarse, con categorías, búsqueda difusa, prioridad, condición de disponibilidad y enganche automático con los atajos de teclado; es lo que alimenta la paleta de comandos.
              `infrastructure/runtime/application/commands/runtime/registry/tests/` — (1) prueba el alta y baja automática de comandos, el filtrado y la ejecución del registro.
        `infrastructure/runtime/application/data/` — (1) barril que agrupa los hooks de datos (consulta, exportación a tabla, actualizaciones optimistas, indicador de espera diferido y exportación a PDF). [SIN CONSUMIDOR] su única importación fuera de la carpeta es la fachada pública `infrastructure/runtime/facade/react-hooks`.
          `infrastructure/runtime/application/data/composition/` — (0) nivel intermedio que marca el código de composición React de datos; sin archivos propios.
            `infrastructure/runtime/application/data/composition/react/` — (0) nivel intermedio de React; sin archivos propios.
              `infrastructure/runtime/application/data/composition/react/deferred-pending/` — (1) el hook `useDeferredPending`: recibe el booleano "estoy guardando" de la app y decide cuándo mostrar un spinner y cuándo un esqueleto, leyendo los tiempos de los tokens `--ds-async-*`, para que una espera muy corta no haga parpadear un indicador. Fuera de la carpeta lo referencian la fachada pública y una página de prueba del showroom.
                `infrastructure/runtime/application/data/composition/react/deferred-pending/tests/` — (1) prueba los umbrales de tiempo con los que ese hook enciende spinner y esqueleto.
          `infrastructure/runtime/application/data/runtime/` — (0) nivel intermedio que agrupa las cuatro implementaciones de hooks de datos; sin archivos propios.
            `infrastructure/runtime/application/data/runtime/optimistic/` — (1) `useOptimisticUpdate` y `useOptimisticList`: pintan el resultado esperado en pantalla al instante, lanzan la mutación real por detrás y revierten solos si falla. [SIN CONSUMIDOR] fuera de la carpeta sólo lo reexporta la fachada pública.
              `infrastructure/runtime/application/data/runtime/optimistic/tests/` — (1) prueba que la actualización optimista se aplique y que revierta al estado anterior cuando la mutación falla.
            `infrastructure/runtime/application/data/runtime/pdf-export/` — (1) el hook `usePdfExport`: como el design system no empaqueta ninguna librería de PDF, ofrece cuatro caminos (abrir el diálogo de impresión con CSS de impresión, devolver los datos ya estructurados para que la app use su propia librería, generar un HTML autocontenido, o descargar ese HTML). [SIN CONSUMIDOR] fuera de la carpeta sólo lo reexporta la fachada pública.
              `infrastructure/runtime/application/data/runtime/pdf-export/tests/` — (1) prueba la preparación de datos y la generación del HTML de impresión.
            `infrastructure/runtime/application/data/runtime/query/` — (1) el hook `useSurfaceQuery`: hace la búsqueda de datos con paginación, orden y filtros, y devuelve un objeto `surfaceProps` listo para pasarle a una surface; la surface nunca lo llama sola, lo cablea la app. [SIN CONSUMIDOR] fuera de la carpeta sólo lo reexporta la fachada pública.
              `infrastructure/runtime/application/data/runtime/query/tests/` — (1) prueba la paginación, el orden, el filtrado y los estados de carga de ese hook.
            `infrastructure/runtime/application/data/runtime/table-export/` — (1) el hook `useTableExport`, que baja los datos de una tabla a CSV (con escapado según RFC 4180), a JSON o al portapapeles separado por tabulaciones para pegar en una planilla. [SIN CONSUMIDOR] fuera de la carpeta sólo lo reexporta la fachada pública. [DUPLICA] `packages/core/src/ui/structures/workspace/export-button/runtime/file-export/`, que reimplementa por su cuenta `generateCsv`, `generateJson`, `generateClipboardText` y `triggerDownload` para el mismo botón de exportar.
              `infrastructure/runtime/application/data/runtime/table-export/tests/` — (1) prueba el escapado del CSV, el JSON y el texto para portapapeles.
        `infrastructure/runtime/application/forms/` — (1) barril de los cuatro hooks de formulario (autoguardado, borrador, diferencias y guardia de cambios sin guardar); lo importan las páginas de formulario de `ui/surfaces/presentation/pages/forms/`.
          `infrastructure/runtime/application/forms/auto-save/` — (1) el hook `useAutoSave`: mira el objeto del formulario, espera un rato tras la última tecla y recién ahí llama a guardar, salteando el guardado si nada cambió, y expone el estado (inactivo, guardando, guardado, error) para el cartelito de "Guardado". [SIN CONSUMIDOR] fuera de la carpeta sólo lo reexportan el barril de forms y la fachada pública.
          `infrastructure/runtime/application/forms/draft-save/` — (1) el hook `useDraftSave`: guarda el borrador del formulario en el almacenamiento del navegador con fecha de vencimiento y lo restaura solo al volver a entrar, para no perder lo escrito si se cierra la pestaña. [SIN CONSUMIDOR] fuera de la carpeta sólo lo reexportan el barril de forms y la fachada pública.
          `infrastructure/runtime/application/forms/form-diff/` — (1) el hook `useFormDiff`: compara en profundidad el formulario original contra el actual y devuelve qué campos cambiaron, con valor viejo y nuevo, etiquetas legibles y lista de campos a ignorar. [SIN CONSUMIDOR] fuera de la carpeta sólo lo reexportan el barril de forms y la fachada pública.
          `infrastructure/runtime/application/forms/tests/` — (4) pruebas de los cuatro hooks hermanos: autoguardado, borrador, diferencias y guardia de cambios sin guardar.
          `infrastructure/runtime/application/forms/unsaved-changes-guard/` — (1) el hook `useUnsavedChangesGuard`: bloquea o pide confirmación cuando el usuario quiere irse, cancelar, volver atrás o cambiar de paso con trabajo sin guardar, tanto en el aviso del navegador al cerrar como en acciones explícitas; lo usan las surfaces de formulario, asistente por pasos y detalle-edición.
        `infrastructure/runtime/application/interaction/` — (0) carpeta contenedora de los hooks de interacción directa del usuario (arrastrar para reordenar y atajos de teclado); sin archivos propios.
          `infrastructure/runtime/application/interaction/drag-and-drop/` — (1) el hook `useSortableList`: hace reordenable una lista usando la API nativa de arrastrar y soltar del navegador, sin dependencias externas, con soporte de teclado (espacio para agarrar, flechas para mover, Escape para cancelar) y atributos ARIA. [SIN CONSUMIDOR] fuera de la carpeta sólo lo reexporta la fachada pública.
            `infrastructure/runtime/application/interaction/drag-and-drop/tests/` — (1) prueba el reordenamiento inmutable y el manejo por teclado de esa lista.
          `infrastructure/runtime/application/interaction/shortcuts/` — (1) registro global de atajos de teclado: teclas sueltas, combinaciones con modificadores y secuencias tipo "g luego i", con detección de conflictos, apagado automático mientras se escribe en un campo y ámbitos por pantalla; lo usan la paleta de comandos conectada, la galería y el Tooltip.
            `infrastructure/runtime/application/interaction/shortcuts/tests/` — (1) prueba el registro, las secuencias, la supresión al tipear y los ámbitos de los atajos.
        `infrastructure/runtime/application/navigation/` — (0) carpeta contenedora de los hooks ligados a moverse por la app (estado en la URL y búsqueda global); sin archivos propios.
          `infrastructure/runtime/application/navigation/routing/` — (1) el hook `useRouterState`: sincroniza en los dos sentidos el estado de una pantalla (página, orden, filtros, búsqueda) con los parámetros de la URL, sin atarse a ningún router porque la app le pasa cómo leer y escribir los parámetros; si no le pasan nada, funciona en memoria. [SIN CONSUMIDOR] fuera de la carpeta sólo lo reexporta la fachada pública.
            `infrastructure/runtime/application/navigation/routing/tests/` — (1) prueba la lectura y escritura de parámetros de URL y el modo en memoria.
          `infrastructure/runtime/application/navigation/search/` — (1) el hook `useGlobalSearch`: busca a la vez en varias fuentes (síncronas o asíncronas), espera a que el usuario deje de tipear, puntúa por coincidencia aproximada, agrupa por categoría, guarda las búsquedas recientes y marca los pedazos de texto que coincidieron. [SIN CONSUMIDOR] fuera de la carpeta sólo lo reexporta la fachada pública.
            `infrastructure/runtime/application/navigation/search/tests/` — (1) prueba el retardo, el agrupado por fuente y el resaltado de coincidencias.
        `infrastructure/runtime/application/notifications/` — (1) el hook `useNotificationPreferences`: administra la matriz de categorías por canales de aviso (correo, push, SMS), con encendido individual, por fila, por columna, marca de cambios sin guardar y guardado en lote. [SIN CONSUMIDOR] fuera de la carpeta sólo lo reexporta la fachada pública.
          `infrastructure/runtime/application/notifications/tests/` — (1) prueba los tres modos de encendido, el estado sucio y el guardado en lote de esa matriz.
        `infrastructure/runtime/application/state/` — (1) barril de los tres hooks de estado avanzado (deshacer/rehacer, preferencias de disposición y sincronización entre pestañas); fuera de la carpeta lo importan la fachada pública y `ui/patterns/navigation/command-palette`.
          `infrastructure/runtime/application/state/cross-tab-sync/` — (1) el hook `useCrossTabSync`: manda y recibe avisos entre pestañas abiertas del mismo sitio usando BroadcastChannel (con respaldo en almacenamiento local para navegadores viejos), para que al modificar algo en una pestaña las otras se enteren y refresquen; se reexporta además en `entrypoints/public/runtime/cross-tab-sync`.
          `infrastructure/runtime/application/state/layout-preference/` — (1) el hook `useLayoutPreference`: recuerda entre sesiones cómo dejó el usuario la pantalla (barra lateral, columnas visibles y sus anchos, densidad, modo de vista, orden y filtros), guardando con retardo para no castigar el almacenamiento al redimensionar; lo usa la paleta de comandos.
          `infrastructure/runtime/application/state/tests/` — (2) prueba los hooks de preferencias de disposición y de deshacer/rehacer; no hay prueba de la sincronización entre pestañas.
          `infrastructure/runtime/application/state/undo-redo/` — (1) el hook `useUndoRedo`: mantiene un historial acotado de estados con deshacer y rehacer, banderas para habilitar los botones, corte del futuro cuando se actúa en medio del historial y manejadores listos para Ctrl+Z. [SIN CONSUMIDOR] fuera de la carpeta sólo lo reexportan el barril de state y la fachada pública.
      `infrastructure/runtime/bootstrap/` — (1 archivo) Punto de arranque del sistema de diseño: reexporta la fachada que monta todo el runtime dentro de una aplicación React.
        `infrastructure/runtime/bootstrap/facade/` — (1) Barril público del arranque: expone `DesignSystemProvider`, el puente de variables CSS del sistema y `DSErrorBoundary` como única puerta de entrada.
        `infrastructure/runtime/bootstrap/facade/react/` — (0) Carpeta de agrupación que separa la implementación React de la fachada; no tiene archivos propios.
        `infrastructure/runtime/bootstrap/facade/react/provider/` — (1) Implementa `DesignSystemProvider`, el proveedor raíz que anida en orden a tenant, engine, tema, perfiles de producto, i18n, responsive, motion, comandos y feature flags, y resuelve la configuración del tenant de forma asíncrona.
        `infrastructure/runtime/bootstrap/facade/react/provider/tests/` — (12) Pruebas de integración del proveedor raíz: verifican quién es dueño de los atributos del elemento raíz, el comportamiento de los overrides de tenant, el alcance de la dirección de texto, el límite de resolución de tenant, la propiedad del engine, densidad, política de movimiento, perfil de recetas, la puerta del artefacto retenido, la admisión de packs de componentes, la autoridad visual y el comportamiento gobernado por código.
        `infrastructure/runtime/bootstrap/presentation/` — (0) Carpeta de agrupación de la capa visual del arranque; no tiene archivos propios.
        `infrastructure/runtime/bootstrap/presentation/boundaries/` — (0) Carpeta de agrupación de los límites de error del arranque; no tiene archivos propios.
        `infrastructure/runtime/bootstrap/presentation/boundaries/system-error/` — (1) `DSErrorBoundary`: si el sistema de diseño entero falla al inicializarse, atrapa el error y vuelve a dibujar los hijos en modo seguro (sin proveedores ni tema) para que la página nunca quede en blanco. [DUPLICA] parcialmente el rol de `packages/core/src/ui/structures/feedback/surface-lifecycle/error-boundary/` y de `packages/core/src/infrastructure/runtime/engines/presentation/component-factory/error-boundary/`: son tres límites de error distintos (sistema completo, una superficie, un componente de engine) con fallback y reintento muy parecidos.
      `infrastructure/runtime/dom/` — (0) Raíz de utilidades que tocan el DOM real, fuera de JSX; no tiene archivos propios.
        `infrastructure/runtime/dom/foundation/` — (0) Carpeta de agrupación de los contratos DOM de base; no tiene archivos propios.
        `infrastructure/runtime/dom/foundation/data-part/` — (1) Única función autorizada para poner el atributo `data-part` en un nodo DOM que no viene de JSX (por ejemplo lo que dibuja D3); la auditoría GAT-07 solo reconoce las llamadas importadas desde acá.
        `infrastructure/runtime/dom/runtime/` — (0) Carpeta de agrupación de las utilidades DOM en tiempo de ejecución; no tiene archivos propios.
        `infrastructure/runtime/dom/runtime/css-color-resolution/` — (1) Resuelve un color escrito como cadena de variables CSS (`var(--ds-...)`) a un valor concreto leyendo la cadena de ancestros del elemento dueño, y publica la lista de atributos del proveedor que obligan a recalcular; lo usan gráficos, partículas, QR y marcas de agua. [DUPLICA] su ruta pública en `packages/core/src/ui/patterns/visualization/charts/runtime/foundation/css-color-resolution/`, que ya no implementa nada y solo reexporta esta carpeta como capa de compatibilidad.
      `infrastructure/runtime/effects/` — (1 archivo) Raíz del catálogo de efectos visuales; solo reexporta su fachada.
        `infrastructure/runtime/effects/composition/` — (0) Carpeta de agrupación de la integración de efectos con React; no tiene archivos propios.
        `infrastructure/runtime/effects/composition/react/` — (0) Carpeta de agrupación del nivel React; no tiene archivos propios.
        `infrastructure/runtime/effects/composition/react/provider/` — (1) `EffectRuntimeProvider`: contexto React que enciende o apaga globalmente los efectos y junta los oyentes de telemetría a los que los efectos reportan lo que hicieron.
        `infrastructure/runtime/effects/composition/react/provider/tests/` — (1) Prueba del proveedor de efectos.
        `infrastructure/runtime/effects/facade/` — (1) Barril público de efectos: expone el registro, sus definiciones, la versión, la procedencia de investigación, el lector por identificador, el resolvedor y los validadores.
        `infrastructure/runtime/effects/facade/tests/` — (1) Prueba del registro de efectos vista desde la fachada.
        `infrastructure/runtime/effects/foundation/` — (0) Carpeta de agrupación de los contratos de base de efectos; no tiene archivos propios.
        `infrastructure/runtime/effects/foundation/validation/` — (1) Guardas de tipo que comprueban que un identificador y una definición de efecto sean válidos: propósito, renderizador, tipo de bucle, estrategia ARIA y verticales permitidas.
        `infrastructure/runtime/effects/runtime/` — (0) Carpeta de agrupación del runtime de efectos; no tiene archivos propios.
        `infrastructure/runtime/effects/runtime/registry/` — (1) Catálogo con las definiciones de todos los efectos y su procedencia documental, versionado aparte del paquete.
        `infrastructure/runtime/effects/runtime/registry/resolution/` — (1) Decide, para un efecto y un contexto de ejecución (movimiento reducido, puntero, batería, pestaña visible, elemento en pantalla, pausa del usuario), si el efecto se dibuja, se degrada a un sustituto o queda no disponible, y con qué razón.
      `infrastructure/runtime/engines/` — (1 archivo) Raíz del sistema multi-engine (classic/modern/rustic/custom); solo reexporta su fachada.
        `infrastructure/runtime/engines/composition/` — (0) Carpeta de agrupación de la integración de engines con React; no tiene archivos propios.
        `infrastructure/runtime/engines/composition/react/` — (0) Carpeta de agrupación del nivel React; no tiene archivos propios.
        `infrastructure/runtime/engines/composition/react/provider/` — (1) `EngineProvider` y `useEngineContext`: guardan cuál es el engine activo, permiten cambiarlo y reclaman el atributo correspondiente en el elemento raíz.
        `infrastructure/runtime/engines/facade/` — (1) Barril público del sistema de engines: junta registro, fábrica de componentes, contratos de binding, límite de error, resolución, registro de componentes a medida, proveedor y adaptador de Ant Design.
        `infrastructure/runtime/engines/foundation/` — (0) Carpeta de agrupación de los contratos de base de engines; no tiene archivos propios.
        `infrastructure/runtime/engines/foundation/contracts/` — (0) Carpeta de agrupación de contratos; no tiene archivos propios.
        `infrastructure/runtime/engines/foundation/contracts/binding/` — (1) Carpeta reservada para futuras utilidades de enlace entre engines; su archivo solo contiene `export {}`, es decir no exporta nada. [SIN CONSUMIDOR] la única referencia en todo `packages/core/src`, `packages/core/scripts` y `packages/showroom/src` es el `export *` de `infrastructure/runtime/engines/facade/`.
        `infrastructure/runtime/engines/foundation/registry/` — (1) Catálogo con los metadatos de cada engine (nombre, nombre visible, librería, estado de madurez), la validación del nombre y el engine por defecto.
        `infrastructure/runtime/engines/foundation/registry/tests/` — (1) Prueba del catálogo de engines.
        `infrastructure/runtime/engines/presentation/` — (0) Carpeta de agrupación de la capa visual de engines; no tiene archivos propios.
        `infrastructure/runtime/engines/presentation/adapters/` — (0) Carpeta de agrupación de adaptadores a librerías externas; no tiene archivos propios.
        `infrastructure/runtime/engines/presentation/adapters/antd/` — (1) `AntdConfigProvider`: traduce los colores y el tema del tenant a los tokens semilla de Ant Design cuando el engine activo es `classic`, y baja la especificidad del CSS de antd para que gane el CSS del sistema; con otros engines deja pasar los hijos sin tocar nada.
        `infrastructure/runtime/engines/presentation/component-factory/` — (1) `createEngineComponent`: fábrica que convierte un nombre de componente y un mapa de cargadores por engine en un componente que elige e importa perezosamente la implementación del engine activo; es el mecanismo que usan unos 250 componentes.
        `infrastructure/runtime/engines/presentation/component-factory/error-boundary/` — (1) `EngineErrorBoundary`: atrapa los fallos al cargar o dibujar la implementación de un engine y ofrece mensaje, reintento, reporte y la opción de caer a otro engine.
        `infrastructure/runtime/engines/presentation/component-factory/tests/` — (1) Prueba de integración de cómo la fábrica resuelve un pack de componentes registrado.
        `infrastructure/runtime/engines/runtime/` — (0) Carpeta de agrupación del runtime de engines; no tiene archivos propios.
        `infrastructure/runtime/engines/runtime/customization/` — (0) Carpeta de agrupación de la personalización de engines; no tiene archivos propios.
        `infrastructure/runtime/engines/runtime/customization/component-registry/` — (1) Registro del engine `custom`: permite dar de alta implementaciones propias por nombre de componente, consultar qué hay registrado y configurar a qué engine se cae cuando falta una.
        `infrastructure/runtime/engines/runtime/resolution/` — (1) El único lugar que decide qué engine renderiza, aplicando el orden override explícito → engine de la vertical → engine del tenant (solo si el tenant está habilitado) → `classic` por defecto.
        `infrastructure/runtime/engines/runtime/resolution/tests/` — (1) Prueba de ese orden de resolución.
      `infrastructure/runtime/error-handling/` — (0) Raíz del bus central de errores del sistema de diseño; no tiene archivos propios ni barril.
        `infrastructure/runtime/error-handling/composition/` — (0) Carpeta de agrupación de la integración con React; no tiene archivos propios.
        `infrastructure/runtime/error-handling/composition/react/` — (0) Carpeta de agrupación del nivel React; no tiene archivos propios.
        `infrastructure/runtime/error-handling/composition/react/use-error-handler/` — (1) Hook `useErrorHandler`: da a un componente la forma de reportar errores, leer el registro y suscribirse a una categoría, con alta y baja automáticas al montar y desmontar. [SIN CONSUMIDOR] fuera de su carpeta solo lo referencia `packages/core/src/index.ts`, que lo publica; ningún componente del sistema ni el showroom lo usan.
        `infrastructure/runtime/error-handling/composition/react/use-error-handler/tests/` — (1) Prueba del hook.
        `infrastructure/runtime/error-handling/runtime/` — (0) Carpeta de agrupación del runtime de errores; no tiene archivos propios.
        `infrastructure/runtime/error-handling/runtime/handler/` — (1) `ErrorHandler`: singleton que estandariza el alta de errores con categoría y marca de tiempo, permite suscribirse por categoría, guarda los últimos cien en memoria y solo escribe en consola en desarrollo.
        `infrastructure/runtime/error-handling/runtime/handler/tests/` — (1) Prueba del singleton de errores.
      `infrastructure/runtime/facade/` — (1 archivo) Fachada estable de todo el nivel runtime del paquete; hoy solo reexporta los hooks de React.
        `infrastructure/runtime/facade/react-hooks/` — (1) Barril único con todos los hooks públicos de React del sistema de diseño: tema, tokens, responsive, features, tenant, accesibilidad, arrastrar y soltar, estado, formularios, búsqueda, ruteo, datos, asistente, voz, comandos y notificaciones. [DUPLICA] las exportaciones de las fachadas de dominio hermanas: `useTheme`/`useTokens` ya salen por `packages/core/src/infrastructure/runtime/theming/facade/`, `useMediaQuery`/`useBreakpoints`/`useResponsiveValue` por `packages/core/src/infrastructure/runtime/responsive/facade/`, `useFeatures`/`useHasFeature`/`useFeatureContext` por `packages/core/src/infrastructure/runtime/features/facade/` y `useTenantBranding`/`useTenantContext` por `packages/core/src/infrastructure/runtime/tenant/facade/`; son dos caminos de importación para exactamente los mismos símbolos.
      `infrastructure/runtime/features/` — (1 archivo) Raíz del subsistema de banderas de funcionalidad; solo reexporta su fachada.
        `infrastructure/runtime/features/composition/` — (0) Carpeta de agrupación de la integración con React; no tiene archivos propios.
        `infrastructure/runtime/features/composition/react/` — (0) Carpeta de agrupación del nivel React; no tiene archivos propios.
        `infrastructure/runtime/features/composition/react/provider/` — (1) `FeatureProvider` y su contexto: guardan la lista de funcionalidades habilitadas (con comodín `*` para todas) y exponen la función que responde si una está activa.
        `infrastructure/runtime/features/composition/react/provider/features/` — (1) Hooks `useFeatures`, `useHasFeature` y el alias `useFeatureContext`, separados del proveedor para evitar un import circular; duplican localmente el tipo del contexto por la misma razón.
        `infrastructure/runtime/features/facade/` — (1) Barril público del subsistema: proveedor, contexto, hooks y el componente de compuerta en un solo lugar de importación.
        `infrastructure/runtime/features/presentation/` — (0) Carpeta de agrupación de la capa visual de features; no tiene archivos propios.
        `infrastructure/runtime/features/presentation/gates/` — (0) Carpeta de agrupación de compuertas declarativas; no tiene archivos propios.
        `infrastructure/runtime/features/presentation/gates/feature/` — (1) `FeatureGate`: envoltorio JSX que muestra sus hijos solo si la funcionalidad está habilitada, admite lista de funcionalidades con modo `any`/`all` y una ranura de reemplazo, para evitar ternarios repartidos por las plantillas. [SIN CONSUMIDOR] fuera de su carpeta solo aparece en el barril `infrastructure/runtime/features/facade/` que lo publica; ni el resto de `packages/core/src`, ni `packages/core/scripts`, ni `packages/showroom/src` lo usan.
        `infrastructure/runtime/features/presentation/gates/feature/tests/` — (1) Prueba de la compuerta.
      `infrastructure/runtime/foundation/` — (0 archivos) carpeta agrupadora sin archivos propios: junta las piezas de runtime de más abajo (las que no dependen de nadie dentro de runtime) para que los runtimes y fachadas de arriba puedan usarlas sin depender entre sí.
        `infrastructure/runtime/foundation/change-key/` — (1) genera una cadena corta y sin ambigüedades a partir de un puñado de valores, para que un efecto de React pueda comparar "¿cambió algo?" sin serializar todo el objeto y sin que dos entradas distintas produzcan la misma clave (cada parte lleva su tipo y su largo por delante).
          `infrastructure/runtime/foundation/change-key/tests/` — (1) pruebas que verifican que dos entradas distintas nunca producen la misma clave y que los tipos vacíos (undefined, null, false, cadena vacía, cero) se distinguen entre sí.
        `infrastructure/runtime/foundation/density/` — (1) contrato de densidad visual: componentes de React que marcan un tramo del árbol con `data-density` (compacto, cómodo, espacioso) y un hook para que el código JS lea esa misma postura, de modo que el CSS y el JS nunca digan cosas distintas.
          `infrastructure/runtime/foundation/density/tests/` — (3) pruebas que comprueban que las cinco formas de declarar la densidad terminan en la misma escala efectiva, que el ámbito anidado funciona, y que nadie estampe el atributo sin publicar también el contexto.
        `infrastructure/runtime/foundation/diagnostics/` — (0) carpeta agrupadora sin archivos propios: reúne las utilidades de diagnóstico del runtime.
          `infrastructure/runtime/foundation/diagnostics/development-logging/` — (1) avisos por consola que solo existen en desarrollo y desaparecen en producción, con una variante que muestra cada mensaje una sola vez para no llenar la consola durante los re-render de React.
            `infrastructure/runtime/foundation/diagnostics/development-logging/tests/` — (1) pruebas de que en producción no se imprime nada y de que el aviso con clave se emite una única vez.
        `infrastructure/runtime/foundation/graphics/` — (0) carpeta agrupadora sin archivos propios: contiene el control de recursos gráficos continuos.
          `infrastructure/runtime/foundation/graphics/continuous-runtime-governor/` — (1) barril público del "portero" que limita cuántas animaciones o escenas 3D pueden estar corriendo a la vez en un documento; existe porque un canvas decorativo y una escena espacial pelearían por el mismo presupuesto de cuadros por segundo. Nota: existe una ruta hermana `packages/core/src/infrastructure/runtime/graphics/continuous-runtime-governor/` pero está VACÍA (0 archivos en todo su árbol; solo quedaron las carpetas tras una mudanza), así que NO es una duplicación de código, es residuo de carpetas vacías.
            `infrastructure/runtime/foundation/graphics/continuous-runtime-governor/foundation/` — (0) carpeta agrupadora sin archivos propios: separa las declaraciones del portero de su implementación.
              `infrastructure/runtime/foundation/graphics/continuous-runtime-governor/foundation/contracts/` — (1) declara el vocabulario del portero: las dos clases de trabajo gráfico continuo (decorativo 2D e inmersivo espacial), el presupuesto por defecto (uno de cada, uno en total), los motivos de rechazo y los eventos de telemetría.
            `infrastructure/runtime/foundation/graphics/continuous-runtime-governor/runtime/` — (0) carpeta agrupadora sin archivos propios: aloja la implementación del portero.
              `infrastructure/runtime/foundation/graphics/continuous-runtime-governor/runtime/admission/` — (1) la implementación: entrega y devuelve "permisos" de ejecución, mantiene una cola de espera cuando el presupuesto está lleno, valida las peticiones y emite telemetría.
                `infrastructure/runtime/foundation/graphics/continuous-runtime-governor/runtime/admission/tests/` — (2) pruebas del portero en sí y una prueba de integración que confirma que los adaptadores reales de partículas y de escenas espaciales respetan el mismo presupuesto compartido.
        `infrastructure/runtime/foundation/icons/` — (0) carpeta agrupadora sin archivos propios: aloja el estado de runtime del sistema de iconos.
          `infrastructure/runtime/foundation/icons/active-profile/` — (1) resuelve qué "perfil expresivo" de iconos está activo sin usar estado de módulo: en cliente y SSR usa un contexto de React (para que dos inquilinos anidados no se pisen) y en React Server Components usa una caja por petición.
            `infrastructure/runtime/foundation/icons/active-profile/tests/` — (1) prueba dura que ejercita SSR, hidratación, proveedores anidados con inquilinos distintos, raíces hermanas y renders repetidos alternando inquilino.
        `infrastructure/runtime/foundation/motion/` — (0) carpeta agrupadora sin archivos propios: reúne toda la maquinaria de movimiento (política, recetas y lectura del entorno) que la fachada pública de arriba expone. NO duplica `packages/core/src/infrastructure/runtime/motion/`: el diff de listados no comparte ni un solo archivo (aquí hay preference/, policy/, runtime/browser/; allá hay solo composition/react/provider/, facade/ e index.ts) y `runtime/motion/facade/index.ts` re-exporta explícitamente desde esta carpeta.
          `infrastructure/runtime/foundation/motion/composition/` — (0) carpeta agrupadora sin archivos propios: separa la parte que se integra con React del resto.
            `infrastructure/runtime/foundation/motion/composition/react/` — (0) carpeta agrupadora sin archivos propios: los enganches de React del movimiento.
              `infrastructure/runtime/foundation/motion/composition/react/preference/` — (1) el contexto de React del movimiento y el hook que dice qué política de animación aplica aquí; si no hay proveedor arriba, cae a la preferencia del sistema operativo más el entorno del dispositivo.
                `infrastructure/runtime/foundation/motion/composition/react/preference/recipe/` — (1) hook que convierte el nombre de una receta semántica (por ejemplo "feedback.press") en duraciones, curvas y variables CSS ya resueltas según la política vigente.
                  `infrastructure/runtime/foundation/motion/composition/react/preference/recipe/tests/` — (1) pruebas de que la receta se traduce a las variables CSS y atributos de datos esperados.
          `infrastructure/runtime/foundation/motion/policy/` — (1) la regla de negocio del movimiento: define los tres perfiles (preciso, calmo, expresivo), sus topes de coreografía y cómo se combinan la preferencia del inquilino, la del sistema y el estado del dispositivo para dar una política final.
            `infrastructure/runtime/foundation/motion/policy/recipes/` — (1) el catálogo de recetas de movimiento con sus números concretos (milisegundos de entrada y salida, desplazamiento, escala, escalonado) y la función que los recorta según la política.
              `infrastructure/runtime/foundation/motion/policy/recipes/tests/` — (1) pruebas de que cada receta resuelve los valores esperados bajo cada política.
            `infrastructure/runtime/foundation/motion/policy/tests/` — (1) pruebas de la resolución de política: perfiles, topes y el efecto de reducir movimiento.
          `infrastructure/runtime/foundation/motion/runtime/` — (0) carpeta agrupadora sin archivos propios: la parte que lee cosas reales del navegador.
            `infrastructure/runtime/foundation/motion/runtime/browser/` — (0) carpeta agrupadora sin archivos propios: los lectores del entorno del navegador.
              `infrastructure/runtime/foundation/motion/runtime/browser/environment/` — (1) un almacén compartido que observa el navegador (puntero fino o grueso, ahorro de energía o red limitada, pestaña visible o no) y lo publica a React con un valor seguro para el servidor.
                `infrastructure/runtime/foundation/motion/runtime/browser/environment/tests/` — (1) pruebas del almacén: suscripción, cambio de valores y el instantáneo del servidor.
              `infrastructure/runtime/foundation/motion/runtime/browser/reduced-motion/` — (1) lee la preferencia del sistema operativo "reducir movimiento" con una sola consulta de medios compartida por toda la aplicación.
        `infrastructure/runtime/foundation/recipes/` — (0) carpeta agrupadora sin archivos propios: reúne el sistema de "recetas", que traduce elecciones semánticas (variante, tamaño, forma) en los nombres de clase estables sobre los que pinta la piel visual.
          `infrastructure/runtime/foundation/recipes/contracts/` — (1) declara los tipos del sistema de recetas: qué es un slot, qué es un eje, qué valores admite y cómo se describe una definición; ningún tipo del proveedor externo aparece acá.
            `infrastructure/runtime/foundation/recipes/contracts/families/` — (1) barril que reúne las definiciones de las cinco familias de componentes gobernadas; son datos puros, sin lógica.
              `infrastructure/runtime/foundation/recipes/contracts/families/button/` — (1) la definición del botón: la lista cerrada de variantes, tamaños y formas, y las clases semánticas que la piel moderna pinta para cada una.
              `infrastructure/runtime/foundation/recipes/contracts/families/card/` — (1) la definición de la tarjeta: variantes (elevada, con borde, rellena, fantasma), si es interactiva y su tono, con las clases exactas que siempre emitió.
              `infrastructure/runtime/foundation/recipes/contracts/families/section-card/` — (1) la definición de la tarjeta de sección: sus cuatro partes (raíz, cuerpo, cabecera, contenido) y sus variantes.
              `infrastructure/runtime/foundation/recipes/contracts/families/tabs/` — (1) la definición de las pestañas: por ahora solo las clases de la raíz, porque las variantes visuales todavía viajan por atributos de datos.
              `infrastructure/runtime/foundation/recipes/contracts/families/tag/` — (1) la definición de la etiqueta: las clases de su cáscara, con variante, tamaño y radio aún resueltos por atributos de datos.
          `infrastructure/runtime/foundation/recipes/emphasis/` — (1) un hook que convierte la decisión "esta familia, con esta intensidad" en un objeto `style` listo para poner sobre un componente concreto, para que la aplicación nunca escriba nombres de variables CSS a mano ni toque la raíz del documento.
          `infrastructure/runtime/foundation/recipes/engine/` — (1) el único lugar autorizado a importar la librería externa que resuelve recetas (tailwind-variants); convierte una definición en una función que devuelve las clases finales, en un orden estable.
            `infrastructure/runtime/foundation/recipes/engine/tests/` — (1) pruebas de que el orden de clases resultante es estable y que los ejes booleanos y de valores se seleccionan bien.
          `infrastructure/runtime/foundation/recipes/manifest/` — (1) arma, leyendo las definiciones vivas, un catálogo legible por máquina de lo que una aplicación puede personalizar: slots por familia, ejes con sus valores admitidos, perfiles disponibles y prefijos de variables CSS.
            `infrastructure/runtime/foundation/recipes/manifest/tests/` — (1) pruebas de que el catálogo se deriva de las definiciones reales y no de una lista escrita a mano.
          `infrastructure/runtime/foundation/recipes/profiles/` — (1) monta el "perfil de recetas" validado para un tramo del árbol de React, de modo que los motores de cada componente lean desde ahí sus valores por defecto por familia; un identificador inválido falla cerrado.
            `infrastructure/runtime/foundation/recipes/profiles/tests/` — (2) pruebas de que el mismo árbol bajo dos perfiles opuestos rinde anatomías distintas sin cambiar props, y de que la variable CSS del perfil es solo una etiqueta informativa y nunca una segunda autoridad.
        `infrastructure/runtime/foundation/root-attributes/` — (1) puerta de entrada de la familia que gobierna quién escribe los atributos del elemento raíz del documento; existe porque el servidor, un script previo al pintado y un efecto de cliente escriben los mismos atributos y el último borraba valores que no había creado.
          `infrastructure/runtime/foundation/root-attributes/presentation/` — (1) los dos canales cuyo valor no es un simple texto de atributo: propiedades de estilo en línea (incluido el manejo de `!important`) y nombres de clase, montados sobre la misma pila de propiedad.
          `infrastructure/runtime/foundation/root-attributes/registry/` — (1) el corazón: un único mapa débil por elemento con una pila de reclamos por canal, donde cada reclamo tiene identidad propia, así soltar un reclamo que no está arriba de la pila no toca el DOM y soltar el de arriba restaura el valor original del servidor.
          `infrastructure/runtime/foundation/root-attributes/ssr/` — (1) función pura y segura para el servidor que calcula de una vez todos los atributos gobernados de la raíz (tema, motor, idioma, dirección de texto) para que cada aplicación los ponga tal cual y no los re-derive por su cuenta; nunca resuelve el modo automático porque el servidor no conoce la preferencia del visitante.
            `infrastructure/runtime/foundation/root-attributes/ssr/tests/` — (2) pruebas de la proyección, incluida una que verifica que un documento en árabe sale con idioma y dirección correctos y con una pila de fuentes que realmente cubre el árabe.
          `infrastructure/runtime/foundation/root-attributes/tests/` — (3) pruebas de la pila de reclamos: canales que escribe la aplicación, canales cuyo conjunto de claves es dato variable (`data-anatomy-*`), y el comportamiento general de reclamar y soltar.
      `infrastructure/runtime/graphics/` — (0 archivos) carpeta contenedora sin código propio que agrupa las piezas de runtime que gobiernan los activos gráficos (iconos, logos de marca, logos de servicios cloud y pictogramas).
        `infrastructure/runtime/graphics/asset-governance/` — (1) barril público del interruptor de emergencia de activos gráficos: permite apagar en caliente una clase de activo o un proveedor entero sin recompilar, y recibir avisos cuando un activo se cae.
          `infrastructure/runtime/graphics/asset-governance/foundation/contracts/` — (1) define el vocabulario cerrado del subsistema: las cuatro clases de activo (icono semántico, logo de marca, logo de servicio cloud, pictograma), los tres grupos de proveedor, el mapa clase→proveedor y la forma de los eventos de diagnóstico.
          `infrastructure/runtime/graphics/asset-governance/foundation/` — (0) nivel intermedio sin archivos propios que separa las definiciones puras (contratos) del código que las ejecuta.
          `infrastructure/runtime/graphics/asset-governance/runtime/control/` — (1) implementa el interruptor en sí: guarda qué clases y proveedores están deshabilitados, valida las listas contra el vocabulario permitido y entrega un `dispose` para desinstalar el control.
          `infrastructure/runtime/graphics/asset-governance/runtime/` — (0) nivel intermedio sin archivos propios que agrupa la parte ejecutable del gobierno de activos.
          `infrastructure/runtime/graphics/asset-governance/tests/` — (3) pruebas de que las cuatro fachadas gráficas respetan el interruptor, de que renderizan igual en servidor y en cliente, y de que el paquete ya compilado (`dist/`) sigue cumpliendo lo mismo.
        `infrastructure/runtime/graphics/continuous-runtime-governor/` — (0) [DUPLICA] `packages/core/src/infrastructure/runtime/foundation/graphics/continuous-runtime-governor/` [SIN CONSUMIDOR] carpeta COMPLETAMENTE VACÍA: cero archivos en todo su subárbol. Es el esqueleto de carpetas que quedó tras mudar el código a `infrastructure/runtime/foundation/graphics/continuous-runtime-governor/`, donde sí viven los 5 archivos reales con la misma estructura interna (`index.ts`, `foundation/contracts/`, `runtime/admission/` y sus tests). Ninguna ruta del repo apunta acá.
          `infrastructure/runtime/graphics/continuous-runtime-governor/foundation/` — (0) [SIN CONSUMIDOR] carpeta vacía, resto de la misma mudanza.
            `infrastructure/runtime/graphics/continuous-runtime-governor/foundation/contracts/` — (0) [DUPLICA] `packages/core/src/infrastructure/runtime/foundation/graphics/continuous-runtime-governor/foundation/contracts/` [SIN CONSUMIDOR] carpeta vacía; el contrato real está en la ruta bajo `foundation/graphics/`.
          `infrastructure/runtime/graphics/continuous-runtime-governor/runtime/` — (0) [SIN CONSUMIDOR] carpeta vacía, resto de la misma mudanza.
            `infrastructure/runtime/graphics/continuous-runtime-governor/runtime/admission/` — (0) [DUPLICA] `packages/core/src/infrastructure/runtime/foundation/graphics/continuous-runtime-governor/runtime/admission/` [SIN CONSUMIDOR] carpeta vacía; el código de admisión real está en la ruta bajo `foundation/graphics/`.
              `infrastructure/runtime/graphics/continuous-runtime-governor/runtime/admission/tests/` — (0) [DUPLICA] `packages/core/src/infrastructure/runtime/foundation/graphics/continuous-runtime-governor/runtime/admission/tests/` [SIN CONSUMIDOR] carpeta vacía; los dos tests reales están en la ruta bajo `foundation/graphics/`.
      `infrastructure/runtime/i18n/` — (1 archivo) punto de entrada del idioma en tiempo de ejecución: reúne el proveedor de React, los hooks de traducción/idioma/dirección de texto y los tipos, para que una app envuelva su árbol y obtenga textos e izquierda-a-derecha o derecha-a-izquierda correctos.
        `infrastructure/runtime/i18n/composition/` — (1) barril de los hooks que los componentes usan para leer el idioma activo, traducir textos y saber la dirección de escritura.
          `infrastructure/runtime/i18n/composition/direction/` — (1) hook `useDirection`, que devuelve si el texto va de izquierda a derecha o al revés leyéndolo del idioma activo en vez de medirlo del DOM (que no existe al renderizar en servidor y fuerza recálculos de estilo).
          `infrastructure/runtime/i18n/composition/locale/` — (1) hook `useLocale`, que devuelve el código de idioma actual, su configuración completa y una función para cambiarlo en caliente.
          `infrastructure/runtime/i18n/composition/translation/` — (1) hook `useTranslation`, que entrega la función de traducir con prefijo automático de espacio de nombres, más una variante `tOr` que deja al que llama poner su propio texto de respaldo cuando falta la clave.
        `infrastructure/runtime/i18n/kernel/` — (1) reexporta los tipos de configuración del proveedor de idioma para que se puedan importar sin arrastrar el código de React.
          `infrastructure/runtime/i18n/kernel/contracts/` — (1) define las props del proveedor de idioma y el modo en que publica `lang` y `dir` en el documento (ninguno, o envolviendo en un elemento transparente para islas de idioma distinto al de la página).
        `infrastructure/runtime/i18n/runtime/` — (1) reexporta el contexto y el proveedor de React ya construidos.
          `infrastructure/runtime/i18n/runtime/context/` — (1) reexporta `I18nProvider`, `useI18nContext` y el objeto de contexto desde la carpeta que realmente los crea.
            `infrastructure/runtime/i18n/runtime/context/provider/` — (1) implementa el proveedor de React: mantiene el idioma activo, resuelve cada traducción en una cadena de cuatro niveles (overrides del inquilino → idioma activo → idioma de respaldo configurado → inglés como piso) y lleva la dirección de texto en el contexto.
              `infrastructure/runtime/i18n/runtime/context/provider/tests/` — (1) pruebas de que la resolución es determinista, de que el idioma de respaldo configurado manda, y de que el `lang`/`dir` renderizado en servidor coincide con el del cliente.
      `infrastructure/runtime/motion/` — (1 archivo) punto de entrada de la política de animación: decide cuánto se mueve la interfaz según el producto, la preferencia del inquilino y el ajuste de accesibilidad "reducir movimiento" del sistema operativo.
        `infrastructure/runtime/motion/composition/` — (0) nivel intermedio sin archivos propios.
          `infrastructure/runtime/motion/composition/react/` — (0) nivel intermedio sin archivos propios que separa lo específico de React.
            `infrastructure/runtime/motion/composition/react/provider/` — (1) implementa `MotionProvider`, que resuelve la política de movimiento efectiva y la publica al árbol de React, integrándose además con la librería `motion` para que las animaciones declarativas la obedezcan.
              `infrastructure/runtime/motion/composition/react/provider/tests/` — (1) pruebas del proveedor de movimiento, incluyendo que el resultado en servidor y en cliente coincida y que la preferencia de sistema de "reducir movimiento" se respete.
        `infrastructure/runtime/motion/facade/` — (1) cara pública del subsistema de movimiento: reexporta el proveedor, los hooks de lectura, los sobres de perfil, el normalizador del dial del inquilino y las recetas de animación.
      `infrastructure/runtime/personality/` — (1 archivo) punto de entrada del sistema de "personalidad": los ajustes de carácter visual (intensidad de animación, entrada, elevación al pasar el mouse, estilo de líneas de gráficos) que distinguen un producto o inquilino de otro.
        `infrastructure/runtime/personality/facade/` — (1) cara pública de personalidad: reexporta los resolvedores a variables CSS, los valores por defecto y las dos rutas de personalidad de gráficos (la pura y la de React).
          `infrastructure/runtime/personality/facade/tests/` — (1) pruebas de que la cadena de mezcla de personalidad de gráficos (defecto → vertical → perfil de producto → inquilino) produce el resultado esperado con temas de marca reales.
        `infrastructure/runtime/personality/foundation/` — (0) nivel intermedio sin archivos propios que separa los valores base del código que los resuelve.
          `infrastructure/runtime/personality/foundation/defaults/` — (1) contiene `DEFAULT_PERSONALITY`, los valores base conservadores que se aplican cuando nadie define personalidad; es el piso de la cadena de mezcla.
        `infrastructure/runtime/personality/presentation/` — (0) nivel intermedio sin archivos propios que agrupa lo que necesita React.
          `infrastructure/runtime/personality/presentation/resolution/` — (0) nivel intermedio sin archivos propios.
            `infrastructure/runtime/personality/presentation/resolution/chart-personality/` — (1) hook `useResolvedChartPersonality`, el puente de React que lee el inquilino y el perfil de producto del contexto y devuelve la personalidad de gráfico ya resuelta, cayendo al valor neutro si no hay proveedores.
              `infrastructure/runtime/personality/presentation/resolution/chart-personality/tests/` — (1) prueba de que ese hook también funciona al renderizar en servidor, sin proveedores montados.
        `infrastructure/runtime/personality/runtime/` — (0) nivel intermedio sin archivos propios.
          `infrastructure/runtime/personality/runtime/resolution/` — (0) nivel intermedio sin archivos propios.
            `infrastructure/runtime/personality/runtime/resolution/chart/` — (1) función pura `resolveChartPersonality`, que aplica la precedencia de personalidad de gráficos en un solo lugar para que los distintos renderizadores no implementen mezclas ligeramente distintas.
      `infrastructure/runtime/presentation-profiles/` — (0 archivos) [DUPLICA] `packages/core/src/infrastructure/runtime/product-profiles/` [SIN CONSUMIDOR] carpeta COMPLETAMENTE VACÍA: cero archivos en todo su subárbol. Su estructura interna copia exactamente la de `product-profiles/` (`facade/` y `composition/react/provider/profile/`), y `grep -ra 'presentation-profiles' packages/core packages/showroom` no devuelve ni una sola coincidencia, ni siquiera en pruebas o scripts. Git no la registra (no rastrea carpetas vacías), así que es un esqueleto de carpetas sin historia ni contenido.
        `infrastructure/runtime/presentation-profiles/composition/` — (0) [SIN CONSUMIDOR] carpeta vacía.
          `infrastructure/runtime/presentation-profiles/composition/react/` — (0) [SIN CONSUMIDOR] carpeta vacía.
            `infrastructure/runtime/presentation-profiles/composition/react/provider/` — (0) [DUPLICA] `packages/core/src/infrastructure/runtime/product-profiles/composition/react/provider/` [SIN CONSUMIDOR] carpeta vacía; el proveedor real es el de `product-profiles`.
              `infrastructure/runtime/presentation-profiles/composition/react/provider/profile/` — (0) [DUPLICA] `packages/core/src/infrastructure/runtime/product-profiles/composition/react/provider/profile/` [SIN CONSUMIDOR] carpeta vacía; el hook real es el de `product-profiles`.
              `infrastructure/runtime/presentation-profiles/composition/react/provider/tests/` — (0) [SIN CONSUMIDOR] carpeta vacía; no existe ninguna prueba acá (`product-profiles` tampoco tiene esta carpeta).
        `infrastructure/runtime/presentation-profiles/facade/` — (0) [DUPLICA] `packages/core/src/infrastructure/runtime/product-profiles/facade/` [SIN CONSUMIDOR] carpeta vacía; la cara pública real es la de `product-profiles`.
      `infrastructure/runtime/product-profiles/` — (1 archivo) punto de entrada de los perfiles de producto: paquetes de valores por defecto de experiencia (personalidad, densidad, disposición de superficies) según el tipo de producto, sin que el sistema de diseño sepa de qué app o inquilino se trata.
        `infrastructure/runtime/product-profiles/composition/` — (0) nivel intermedio sin archivos propios.
          `infrastructure/runtime/product-profiles/composition/react/` — (0) nivel intermedio sin archivos propios que separa lo específico de React.
            `infrastructure/runtime/product-profiles/composition/react/provider/` — (1) implementa `ProductProfileProvider`, que acepta una clave del registro, un objeto de perfil literal o nada, y siempre publica un perfil concreto al árbol para que los consumidores no tengan que chequear nulos.
              `infrastructure/runtime/product-profiles/composition/react/provider/profile/` — (1) reexporta el hook de lectura del contexto bajo el nombre corto `useProductProfile`, que es la vía normal para que un componente lea el perfil activo.
        `infrastructure/runtime/product-profiles/facade/` — (1) cara pública de los perfiles de producto: junta el registro de perfiles y su función de búsqueda con el proveedor y el hook de React.
      `infrastructure/runtime/responsive/` — (1 archivo) punto de entrada del comportamiento adaptable a pantalla: centraliza en un solo lugar la detección de tamaño, tipo de puntero, orientación y teclado virtual para toda la interfaz.
        `infrastructure/runtime/responsive/composition/` — (0) nivel intermedio sin archivos propios.
          `infrastructure/runtime/responsive/composition/react/` — (0) nivel intermedio sin archivos propios que separa lo específico de React.
            `infrastructure/runtime/responsive/composition/react/provider/` — (1) implementa `ResponsiveProvider`, que abre una sola tanda de suscripciones a `matchMedia` compartida por todos los consumidores (antes cada componente abría las suyas) y expone clase de dispositivo, puntero, orientación, movimiento reducido y ocultamiento por teclado virtual.
              `infrastructure/runtime/responsive/composition/react/provider/breakpoint-state/` — (1) hook `useBreakpoints`, que traduce el estado del proveedor a banderas cómodas (`isMobile`, `isTablet`, `isDesktop`, `isTouchDevice`) y, si no hay proveedor, cae a sus propias escuchas.
              `infrastructure/runtime/responsive/composition/react/provider/phone-state/` — (1) hook `usePhoneBreakpoint`, versión mínima que solo responde "¿es teléfono?" sin retener los runtimes de tacto, orientación ni preferencia de movimiento.
              `infrastructure/runtime/responsive/composition/react/provider/responsive-value/` — (1) hook `useResponsiveValue`, que recibe un objeto con un valor por punto de corte y devuelve el que corresponde a la pantalla actual, en cascada de menor a mayor y seguro en servidor.
                `infrastructure/runtime/responsive/composition/react/provider/responsive-value/tests/` — (1) pruebas de ese hook a distintos anchos de ventana simulados.
              `infrastructure/runtime/responsive/composition/react/provider/tests/` — (2) pruebas del proveedor: valores por defecto en servidor, detección correcta a 375/768/1280 píxeles, puntero grueso, y el caso aparte del teclado virtual que tapa parte de la pantalla.
        `infrastructure/runtime/responsive/facade/` — (1) cara pública del subsistema adaptable: reexporta el proveedor, los hooks (`useResponsive`, `useMediaQuery`, `useBreakpoints`, `useResponsiveValue`) y las constantes de puntos de corte.
        `infrastructure/runtime/responsive/runtime/` — (0) nivel intermedio sin archivos propios que agrupa las piezas de bajo nivel que no dependen del proveedor.
          `infrastructure/runtime/responsive/runtime/media-query/` — (1) hook `useMediaQuery`, la suscripción cruda y segura en servidor a cualquier consulta de medios de CSS; es la base sobre la que se apoya todo lo demás.
          `infrastructure/runtime/responsive/runtime/style-properties/` — (1) convierte valores de props escritos por punto de corte en propiedades CSS con ámbito, para que un componente pueda aceptar `padding={{ base: 2, lg: 6 }}` y que eso se pinte como CSS en vez de resolverse en JavaScript.
            `infrastructure/runtime/responsive/runtime/style-properties/tests/` — (1) pruebas de la detección de valores por punto de corte y de la generación del CSS resultante.
      `infrastructure/runtime/spatial/` — (1 archivo) Aloja todo el anfitrión de experiencias 3D del design system: decide si una escena WebGL2 puede correr, con qué calidad, y la monta o la apaga; su único archivo reexporta la fachada.
        `infrastructure/runtime/spatial/composition/` — (0) Carpeta agrupadora sin archivos propios; separa el material que depende de React del resto del árbol spatial.
          `infrastructure/runtime/spatial/composition/react/` — (0) Carpeta agrupadora sin archivos propios; contiene los tipos y los hooks de React que alimentan la decisión de mostrar o no la escena 3D.
            `infrastructure/runtime/spatial/composition/react/contracts/` — (0) Carpeta agrupadora sin archivos propios; separa las definiciones de tipos de los hooks que están a su lado.
              `infrastructure/runtime/spatial/composition/react/contracts/types/` — (1) Define las interfaces públicas de la experiencia 3D: qué props recibe el componente anfitrión, qué forma tiene un módulo de escena cargado por la app y cómo la escena reporta estar lista, fallar o informar cuánto tarda cada cuadro.
            `infrastructure/runtime/spatial/composition/react/hydrated/` — (1) Hook que devuelve falso durante el render de servidor y la hidratación, y verdadero recién cuando el cliente tomó el control, para no arrancar trabajo de GPU antes de tiempo.
            `infrastructure/runtime/spatial/composition/react/in-view/` — (1) Hook que usa IntersectionObserver para saber si el contenedor de la escena está a la vista; si no hay evidencia de visibilidad, niega el trabajo continuo de GPU.
            `infrastructure/runtime/spatial/composition/react/viewport/` — (1) Hook que observa media queries para saber si la pantalla es de teléfono o tablet, asumiendo el caso más conservador cuando no puede medir.
            `infrastructure/runtime/spatial/composition/react/webgl2-capability/` — (1) Hook que dispara la prueba de capacidad WebGL2 del navegador, pero sólo después de que todas las compuertas más baratas ya aceptaron la experiencia.
        `infrastructure/runtime/spatial/facade/` — (1) Puerta de entrada segura para servidor: reexporta los presupuestos de calidad, la validación del módulo de escena y el resolvedor de política, sin arrastrar React ni el navegador.
          `infrastructure/runtime/spatial/facade/react/` — (1) Puerta de entrada del lado cliente: reexporta el componente `SpatialExperience` y sus tipos, que es lo único que consumen las apps y el entrypoint público `entrypoints/graphics/spatial`.
        `infrastructure/runtime/spatial/foundation/` — (0) Carpeta agrupadora sin archivos propios; junta las piezas puras (sin React, sin navegador) de las que dependen el runtime y la presentación.
          `infrastructure/runtime/spatial/foundation/quality/` — (1) Guarda los techos de calidad certificados de cada modo en vivo (resolución máxima de píxel, antialias, preferencia de energía) y la regla de que una señal de bajo rendimiento sólo puede bajar la calidad, nunca subirla.
          `infrastructure/runtime/spatial/foundation/validation/` — (1) Valida, sin confiar en el objeto recibido, que el módulo de escena que carga la app tenga exactamente la versión, el backend WebGL2 y el componente `Scene` esperados; cualquier excepción se traduce en rechazo.
            `infrastructure/runtime/spatial/foundation/validation/tests/` — (1) Prueba que ese validador acepte sólo la forma exacta del contrato v1 y rechace variantes hostiles.
        `infrastructure/runtime/spatial/presentation/` — (0) Carpeta agrupadora sin archivos propios; contiene el componente visible que ata todas las capas anteriores.
          `infrastructure/runtime/spatial/presentation/experience/` — (1) Es el componente `SpatialExperience`: junta hidratación, visibilidad, viewport, capacidad WebGL2, política y permiso de contexto para montar la escena 3D o mostrar un reemplazo estático, y gestiona canvas, accesibilidad y desmontaje.
            `infrastructure/runtime/spatial/presentation/experience/error-boundary/` — (1) Frontera de error de React que atrapa un fallo de la escena, avisa al anfitrión y muestra el reemplazo, con capacidad de rearmarse cuando cambia la clave de reintento.
            `infrastructure/runtime/spatial/presentation/experience/tests/` — (1) Pruebas de comportamiento del componente anfitrión, incluido render en servidor, modo estricto y conteo de contextos 3D activos.
        `infrastructure/runtime/spatial/runtime/` — (0) Carpeta agrupadora sin archivos propios; separa lo que toca el navegador y la lógica de decisión del resto.
          `infrastructure/runtime/spatial/runtime/browser/` — (0) Carpeta agrupadora sin archivos propios; junta lo que sólo funciona dentro de un navegador real.
            `infrastructure/runtime/spatial/runtime/browser/capability/` — (0) Carpeta agrupadora sin archivos propios; espacio para las pruebas de capacidad del dispositivo.
              `infrastructure/runtime/spatial/runtime/browser/capability/webgl2/` — (1) Crea un canvas temporal para averiguar si el navegador soporta WebGL2 de verdad, libera enseguida ese contexto y cachea el resultado.
                `infrastructure/runtime/spatial/runtime/browser/capability/webgl2/tests/` — (1) Prueba que la sonda acepte sólo WebGL2, suelte el contexto de prueba y recuerde el resultado.
            `infrastructure/runtime/spatial/runtime/browser/context-lease/` — (1) Pide y devuelve el permiso único de gráficos continuos del documento, de modo que nunca convivan una escena 3D y una animación de partículas consumiendo GPU al mismo tiempo; los que no consiguen el permiso quedan en cola por orden de llegada.
              `infrastructure/runtime/spatial/runtime/browser/context-lease/tests/` — (1) Prueba que se admita un solo dueño a la vez y que la cola de espera respete el orden de llegada.
          `infrastructure/runtime/spatial/runtime/resolution/` — (1) Es la política central: toma todas las señales (habilitado, hidratado, capacidad, estado del contexto, permiso, visibilidad, preferencia de movimiento reducido, tipo de dispositivo, puntero, energía, calidad pedida) y devuelve un modo final más el motivo de la decisión, leyendo cada campo de forma defensiva.
            `infrastructure/runtime/spatial/runtime/resolution/tests/` — (1) Prueba la tabla de decisiones de esa política y los presupuestos de calidad asociados.
      `infrastructure/runtime/tenant/` — (1 archivo) Aloja todo el sistema multiinquilino en tiempo de ejecución: quién es el inquilino actual, cuál es su configuración, de dónde se carga y cómo se expone a los componentes; su único archivo reexporta la fachada.
        `infrastructure/runtime/tenant/composition/` — (0) Carpeta agrupadora sin archivos propios; separa lo que depende de React.
          `infrastructure/runtime/tenant/composition/react/` — (0) Carpeta agrupadora sin archivos propios; junta el proveedor, el hook de marca y el hook de alta de inquilinos.
            `infrastructure/runtime/tenant/composition/react/authoring/` — (0) Carpeta agrupadora sin archivos propios; espacio para las herramientas de creación de inquilinos con interfaz de React.
              `infrastructure/runtime/tenant/composition/react/authoring/use-create-tenant/` — (1) Hook para flujos de alta y consola de administración: arma una configuración de inquilino a partir de datos mínimos e inyecta el CSS compilado del tema tal cual, de modo que la vista previa sea idéntica byte a byte a lo que el inquilino recibirá en producción. [SIN CONSUMIDOR] fuera de la fachada `infrastructure/runtime/tenant/facade/index.ts` y de su propio test; ningún componente, showroom ni script del repositorio lo llama.
                `infrastructure/runtime/tenant/composition/react/authoring/use-create-tenant/tests/` — (1) Prueba que el artefacto compilado se monte y se desmonte correctamente al usar ese hook.
            `infrastructure/runtime/tenant/composition/react/branding/` — (1) Hook de marca en dos pasos: primero resuelve de forma síncrona la identidad de la vertical o del inquilino, luego superpone la sesión y finalmente busca la configuración completa por API; hoy sólo la parte de identidad (nombre y logo) llega a pintarse, porque el resto de canales visuales lo bloquea la barrera de autoridad visual.
              `infrastructure/runtime/tenant/composition/react/branding/tests/` — (1) Prueba dónde está exactamente el límite entre lo que ese hook puede devolver y lo que la barrera visual rechaza.
            `infrastructure/runtime/tenant/composition/react/provider/` — (1) Es el `TenantProvider`: valida la configuración recibida, la congela y la publica por contexto de React, además de estampar los atributos de inquilino en la raíz del documento.
              `infrastructure/runtime/tenant/composition/react/provider/tests/` — (2) Prueba que la identidad del objeto de contexto sea única y que el atributo `data-tenant` de la raíz sea propiedad del proveedor y se restaure al desmontarse.
        `infrastructure/runtime/tenant/facade/` — (1) Único barril público del sistema de inquilinos: reúne proveedor, hooks, presets, validación, resolución de slug, almacenamiento, registro de inquilinos propios y el puente al compilador de CSS de inquilino, para que nadie tenga que entrar a las subcarpetas.
        `infrastructure/runtime/tenant/foundation/` — (0) Carpeta agrupadora sin archivos propios; junta las piezas puras de las que dependen los flujos de runtime.
          `infrastructure/runtime/tenant/foundation/configuration/` — (0) Carpeta agrupadora sin archivos propios; separa la configuración por defecto del registro de inquilinos conocidos.
            `infrastructure/runtime/tenant/foundation/configuration/defaults/` — (1) Guarda la configuración de inquilino de último recurso, deliberadamente sosa y sin marca, para que se note enseguida cuando no se resolvió ningún inquilino real.
            `infrastructure/runtime/tenant/foundation/configuration/registry/` — (1) Registro de los tres inquilinos propios que vienen con el design system (rottay, bithire, evnto) con su personalidad autorizada, resueltos sin latencia; los inquilinos clientes nunca se agregan acá.
          `infrastructure/runtime/tenant/foundation/context/` — (1) Hoja mínima que define el objeto de contexto de React del inquilino y el hook que lo lee lanzando error si falta el proveedor, para que componentes hoja y el enrutador de motores no arrastren toda la maquinaria del proveedor.
          `infrastructure/runtime/tenant/foundation/personality/` — (0) Carpeta agrupadora sin archivos propios; contiene los presets de personalidad.
            `infrastructure/runtime/tenant/foundation/personality/presets/` — (1) Traduce cuatro palabras clave (formal, neutral, playful, expressive) a un juego completo de tokens de personalidad, para que quien da de alta un inquilino no tenga que rellenar unos treinta campos a mano; un nombre desconocido degrada a neutral. NO duplica `infrastructure/runtime/personality/` (esa otra carpeta expone la línea base `DEFAULT_PERSONALITY`, los resolvedores de variables CSS y la personalidad de gráficos, es decir el piso de la cadena de fusión y sus lectores, no un catálogo de estilos con nombre para el alta de inquilinos); lo que sí comparten es que ambas escriben objetos `PersonalityTokens` completos a mano.
          `infrastructure/runtime/tenant/foundation/validation/` — (1) Guardas de esquema para cualquier payload de inquilino venga de donde venga: valida marca, plan, nombre de motor, idioma y exige que el slug sea kebab minúsculo canónico.
            `infrastructure/runtime/tenant/foundation/validation/tests/` — (1) Prueba esas guardas de identidad y de esquema.
        `infrastructure/runtime/tenant/runtime/` — (0) Carpeta agrupadora sin archivos propios; junta alta, resolución de identidad, almacenamiento y vista previa.
          `infrastructure/runtime/tenant/runtime/authoring/` — (0) Carpeta agrupadora sin archivos propios; espacio para las utilidades de creación de inquilinos sin React.
            `infrastructure/runtime/tenant/runtime/authoring/configuration/` — (1) Genera una configuración de inquilino completa a partir de lo mínimo (slug, nombre, color principal), derivando personalidad, densidad y ajustes de tokens.
              `infrastructure/runtime/tenant/runtime/authoring/configuration/tests/` — (1) Prueba la resolución de presets y la generación de la configuración completa.
          `infrastructure/runtime/tenant/runtime/preview-scope/` — (1) Primitivas compartidas para que cualquier vista previa de inquilino quede encerrada en su contenedor: el atributo de raíz de preview, el saneador de slug, el constructor de selector y una lista blanca de valores CSS, de modo que una vista previa nunca repinte el documento entero.
            `infrastructure/runtime/tenant/runtime/preview-scope/tests/` — (1) Prueba el saneado de slug, el selector generado y la lista blanca de valores.
          `infrastructure/runtime/tenant/runtime/resolution/` — (1) Responde "¿qué inquilino soy?" encadenando las estrategias según el entorno: en servidor la cabecera, en navegador el subdominio y después el dominio propio, y si todo falla un slug por defecto.
            `infrastructure/runtime/tenant/runtime/resolution/domain/` — (1) Estrategia de dominio propio: consulta un endpoint que la plataforma configura para traducir un hostname que no es de Rottay a un slug de inquilino, devolviendo nulo ante cualquier fallo para que la cadena siga.
            `infrastructure/runtime/tenant/runtime/resolution/header/` — (1) Estrategia de servidor: guarda las cabeceras de la petición en curso y lee de ellas `x-tenant-id`; es la más determinista y exige limpiar el estado al terminar la petición.
            `infrastructure/runtime/tenant/runtime/resolution/request/` — (1) Resolución de inquilino a partir del hostname pensada para el middleware de las apps, con dominios base configurables, subdominios reservados, búsqueda de dominio propio síncrona o asíncrona y un ayudante cacheado sobre Vercel Edge Config. [DUPLICA] parcialmente a `infrastructure/runtime/tenant/runtime/resolution/subdomain/` y `infrastructure/runtime/tenant/runtime/resolution/domain/`: reimplementa el recorte de subdominio y la búsqueda por dominio propio con su propio modelo de configuración, no pasa por `resolution/index.ts` y se exporta por separado en la fachada y en `entrypoints/server`.
            `infrastructure/runtime/tenant/runtime/resolution/subdomain/` — (1) Estrategia de subdominio: extrae el slug del primer segmento de los hostnames propios de Rottay (rottay.com, .io, .dev) e ignora los subdominios de sistema como www, app o api. No duplica a `header/` ni a `domain/`, que leen fuentes distintas; sí se solapa con la parte de subdominio de `infrastructure/runtime/tenant/runtime/resolution/request/`.
            `infrastructure/runtime/tenant/runtime/resolution/tests/` — (1) Prueba la cadena de resolución completa y cada estrategia por separado.
          `infrastructure/runtime/tenant/runtime/store/` — (1) Fachada de almacenamiento que responde "¿cuál es la configuración de este inquilino?" recorriendo en orden registro propio, caché en memoria, caché de localStorage, archivos estáticos, API remota y por último una configuración genérica segura.
            `infrastructure/runtime/tenant/runtime/store/remote/` — (1) Fuente remota: pide la configuración del inquilino a un endpoint que la app configura al arrancar y la valida contra el esquema antes de entregarla.
              `infrastructure/runtime/tenant/runtime/store/remote/tests/` — (1) Prueba esa búsqueda remota y su validación.
            `infrastructure/runtime/tenant/runtime/store/static/` — (0) Carpeta agrupadora sin archivos propios; contiene el cargador de archivos estáticos.
              `infrastructure/runtime/tenant/runtime/store/static/loader/` — (1) Fuente estática: lee `/.designsystem/tenants/<slug>/config.json`, útil para despliegues que publican los inquilinos como archivos versionados o para demos locales sin backend.
                `infrastructure/runtime/tenant/runtime/store/static/loader/tests/` — (1) Prueba ese cargador de archivos estáticos.
            `infrastructure/runtime/tenant/runtime/store/tests/` — (1) Prueba el orden completo de la cadena de resolución de la fachada de almacenamiento.
      `infrastructure/runtime/theming/` — (1 archivo) Raíz del sistema de temas en tiempo de ejecución: reexporta todo lo público de `facade/` para que el resto del paquete tenga una sola puerta de entrada al proveedor de tema, los hooks de tokens y la verificación de artefactos visuales del inquilino.
        `infrastructure/runtime/theming/composition/` — (0 archivos) Carpeta de agrupación sin archivos propios; sólo separa la capa que compone React (proveedores y hooks) de la capa de fundamentos y de la de presentación.
          `infrastructure/runtime/theming/composition/react/` — (0 archivos) Carpeta de agrupación sin archivos propios; junta las dos piezas de React del tema: el proveedor de contexto y los hooks de tokens.
            `infrastructure/runtime/theming/composition/react/provider/` — (1 archivo) Define `ThemeProvider`, `ThemeContext` y `useThemeContext`: guarda en contexto el inquilino activo y el modo de tema (claro/oscuro/personalizado) y reclama el atributo `data-theme` en el elemento raíz, sin pintar ni compilar ningún color del inquilino.
              `infrastructure/runtime/theming/composition/react/provider/tests/` — (3 archivos) Pruebas del proveedor: que devuelva el contexto correcto, que restaure exactamente los estilos en línea que había en `<html>` antes de escribir, y que un cambio de modo llegue de verdad a los valores calculados y no sólo al atributo.
            `infrastructure/runtime/theming/composition/react/provider/theme/` — (1 archivo) Define el hook `useTheme`, que lee el mismo contexto del proveedor y falla con un error claro si se usa fuera de él. [DUPLICA] `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/infrastructure/runtime/theming/composition/react/provider/` — el cuerpo de `useTheme` es idéntico al de `useThemeContext` (mismo `useContext`, mismo tipo de retorno) y sólo cambia el texto del error; además reexporta el alias `useThemeContext` por compatibilidad.
              `infrastructure/runtime/theming/composition/react/provider/theme/tests/` — (1 archivo) Pruebas del hook `useTheme`: que lance error fuera del proveedor y que devuelva el tema actual y su función de cambio cuando el contexto existe.
            `infrastructure/runtime/theming/composition/react/tokens/` — (1 archivo) Define `useTokens`, el hook que arma el objeto de tokens de diseño (colores, espaciados, tipografía, radios, sombras, superficie, movimiento) resolviendo por capas: valores por motor, luego vertical, luego perfil de producto y por último el artefacto compilado del inquilino.
              `infrastructure/runtime/theming/composition/react/tokens/sub-hooks/` — (1 archivo) Hooks finos (`useColorTokens`, `useSpacingTokens`, `useMotionTokens`, `useTypographyTokens`, `useCardTokens`, `useAccentTokens`) que devuelven una sola rebanada de `useTokens` para que un componente no se vuelva a renderizar cuando cambian tokens que no usa. [SIN CONSUMIDOR] fuera de dos barriles de reexport (`infrastructure/runtime/theming/facade/` y `infrastructure/runtime/facade/react-hooks/`) ningún archivo de `packages/core/src`, `packages/core/scripts` ni `packages/showroom/src` los llama.
              `infrastructure/runtime/theming/composition/react/tokens/tests/` — (1 archivo) Prueba el orden de precedencia de las capas de tokens (motor → vertical → perfil de producto → artefacto compilado) y que el proveedor rechace la forma antigua en la que el inquilino entregaba colores crudos sin artefacto verificado detrás.
        `infrastructure/runtime/theming/facade/` — (1 archivo) Único barril público del tema: reúne en un solo import el proveedor, los hooks de tema y de tokens, el puente de variables CSS y las funciones de admisión/verificación de artefactos del inquilino, ocultando deliberadamente la escritura de bajo nivel del libro mayor.
        `infrastructure/runtime/theming/foundation/` — (0 archivos) Carpeta de agrupación sin archivos propios; contiene lo que no depende de React: el contrato de capas de cascada, los valores por motor y la autoridad visual.
          `infrastructure/runtime/theming/foundation/cascade-layers/` — (1 archivo) Declara en TypeScript el orden exacto de las capas `@layer` que usan las hojas CSS del sistema, y deja escrito que la pintura del inquilino va fuera de toda capa (y por eso gana), para que el emisor de CSS en tiempo de ejecución se inserte en la posición correcta sin depender del orden de importación.
            `infrastructure/runtime/theming/foundation/cascade-layers/tests/` — (1 archivo) Compara ese orden declarado en TypeScript contra los archivos CSS de entrada reales y falla si alguno de los dos lados cambia sin el otro.
          `infrastructure/runtime/theming/foundation/color/` — (0 archivos) Carpeta COMPLETAMENTE VACÍA: no contiene ningún archivo ni en su nivel ni por debajo, sólo la subcarpeta `oklch/` también vacía. Es esqueleto muerto. [SIN CONSUMIDOR]
            `infrastructure/runtime/theming/foundation/color/oklch/` — (0 archivos) Carpeta COMPLETAMENTE VACÍA, sin ningún archivo. No hace nada. [SIN CONSUMIDOR] La implementación real de color OKLCH vive en `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/foundation/kernel/color/oklch/`; ésta es sólo el hueco que quedó, no una copia (no hay código que duplicar).
          `infrastructure/runtime/theming/foundation/engine-tokens/` — (1 archivo) Guarda los valores literales que diferencian visualmente a cada motor (classic, modern, rustic): radios, sombras, tratamiento de superficie, movimiento y factor de densidad, expuestos como `ENGINE_TOKENS` y `getEngineTokens()`. NO duplica `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/foundation/tokens/ts/`: aquél contiene espejos de cadenas `var(--ds-*)`, temas de marca y tokens por componente, mientras que aquí hay valores concretos (px, rgba) que sólo consume `useTokens` en JavaScript. Su único consumidor real es `infrastructure/runtime/theming/composition/react/tokens/`.
          `infrastructure/runtime/theming/foundation/visual-authority/` — (1 archivo) Fachada de compatibilidad, marcada como obsoleta, que reexporta junto lo de `foundation/admission/` y lo de `runtime/retention/`; existe para que los importadores viejos sigan funcionando mientras se prefiere importar de las dos capas directamente.
            `infrastructure/runtime/theming/foundation/visual-authority/foundation/` — (0 archivos) Carpeta de agrupación sin archivos propios; marca cuál de las dos capas es el piso (admisión) frente a la que se apoya sobre ella (retención).
              `infrastructure/runtime/theming/foundation/visual-authority/foundation/admission/` — (1 archivo) Decide quién manda sobre el aspecto visual: verifica que el artefacto de tema del inquilino coincida con su huella criptográfica, comprueba que el elemento montado en el documento sea ese artefacto, acuña y audita el recibo de emisión del servidor, y resuelve si la autoridad es el proveedor o el artefacto compilado.
            `infrastructure/runtime/theming/foundation/visual-authority/runtime/` — (0 archivos) Carpeta de agrupación sin archivos propios; contiene el comportamiento vivo que se apoya sobre la admisión.
              `infrastructure/runtime/theming/foundation/visual-authority/runtime/retention/` — (1 archivo) Vigila con `MutationObserver` que el artefacto ya admitido no sea borrado ni reescrito mientras la página vive, lleva un libro mayor por documento y ofrece un reclamo preparado para que el render siga siendo sólo de lectura.
            `infrastructure/runtime/theming/foundation/visual-authority/tests/` — (4 archivos) Pruebas de toda la autoridad visual: admisión y resolución de autoridad, prueba de montaje retenido, minteo/auditoría del recibo de emisión en servidor (incluidos intentos de una aplicación por pedir admisión sin haber producido los bytes) y el comportamiento general del módulo.
        `infrastructure/runtime/theming/presentation/` — (0 archivos) Carpeta de agrupación sin archivos propios; contiene lo que escribe efectivamente en el DOM.
          `infrastructure/runtime/theming/presentation/adapters/` — (0 archivos) Carpeta de agrupación sin archivos propios; separa los adaptadores hacia una tecnología de vista concreta.
            `infrastructure/runtime/theming/presentation/adapters/react/` — (0 archivos) Carpeta de agrupación sin archivos propios; agrupa los adaptadores específicos de React.
              `infrastructure/runtime/theming/presentation/adapters/react/css-variables-bridge/` — (1 archivo) Componente `SystemCssVariablesBridge`: vuelca a variables CSS con espacio de nombres (`--ds-personality-*`) los valores de personalidad que se resuelven en JavaScript, escribiendo una regla `:root` dentro de la capa `rottay-personality` (nunca en estilos en línea ni fuera de capa) para que animaciones, pseudo-elementos y CSS puro vean esos valores pero queden por debajo de la pintura del inquilino.
                `infrastructure/runtime/theming/presentation/adapters/react/css-variables-bridge/tests/` — (4 archivos) Pruebas del puente: en qué capa de cascada escribe, quién es dueño del nodo `<style>` singleton y cómo se limpia, que las variables que emite y las que puede publicar un inquilino sean conjuntos disjuntos, y la regresión de que ya no estampa estilos en línea en `<html>`.
      `infrastructure/runtime/verticals/` — (1 archivo) Raíz de los preajustes por vertical de producto (eventos, reclutamiento, administración): sólo reexporta `facade/`.
        `infrastructure/runtime/verticals/facade/` — (1 archivo) Barril de once líneas que reexporta los tipos `VerticalKey` y `VerticalPreset` desde los contratos y el registro `VERTICAL_REGISTRY` / `getVerticalPreset` desde `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/foundation/presets/verticals/`; no define nada propio y su único importador es el barril raíz `packages/core/src/index.ts`, porque todos los demás archivos importan el registro directamente de `foundation/presets/verticals/`.
## Mapa de `packages/core/src/ui/`

Repo: `/Users/daniel/Developer/Rottay/ui-design-system`
Fecha: 2026-08-18. Solo lectura, nada del repo fue modificado.

Totales medidos: **1737 carpetas**, **2268 archivos** bajo `ui/`.
Por tier: primitives 874 carpetas / 1313 archivos; patterns 597 / 664; structures 158 / 162; surfaces 107 / 128.

### Convención repetida (vale para casi todos los "owners")

Casi toda carpeta de componente repite la misma forma interna. No la describo una por una:

- `contracts/` — los tipos/props del componente. Nada renderiza.
- `engines/classic|modern|rustic/` — las tres pinturas físicas del mismo componente. `classic` envuelve Ant Design, `modern` es la piel propia Rottay, `rustic` es CSS plano. El `index.ts` del owner solo llama a `createEngineComponent()` y elige a cuál cargar según el engine activo.
- `engines/foundation/` — cuando aparece, es el código compartido entre las tres pinturas de ese componente.
- `runtime/` — hooks y máquinas de estado de ese componente (no pintan).
- `presentation/` — la parte que sí pinta cuando el owner separó cálculo de pintura.
- `foundation/` — utilidades puras del owner.
- `compound/` — subcomponentes con punto (`Card.Header`, `Avatar.Group`).
- `tests/` — pruebas del owner.
- `*.stories.tsx` — fichas de Storybook.

Los `index.ts` de grupo (`display/index.ts`, `data/index.ts`, etc.) son barriles: reexportan, no tienen lógica.

Marcas usadas:
- `[DUPLICA]` = otra carpeta resuelve lo mismo (digo cuál).
- `[SIN CONSUMIDOR]` = verificado con `grep -ra` sobre `packages/core/src` y `packages/showroom/src`: nadie la importa fuera de su propia carpeta (puede estar exportada al público del paquete, pero ningún código del repo la usa).

### Hallazgo previo importante

`patterns/commercial/` **ya no existe** en el árbol. El `CLAUDE.md` la declara como deuda de migración con 11 owners, pero hoy no hay ninguna carpeta llamada `commercial` bajo `packages/core/src` y `grep -ra "patterns/commercial"` sobre `ui/` no devuelve nada. Los componentes de vocabulario monocromo/marketing que vivían ahí quedaron reclasificados por lo que hacen y hoy están repartidos así (todos existen y todos tienen consumidor):

`display/CropMarks`, `display/TextureBackdrop`, `display/Typewriter`, `layout/AsciiFrame`, `layout/InvertSection`, `layout/SemanticSurface`, `patterns/data/mono-stat`, `patterns/feedback/terminal-block`, `patterns/visualization/ascii-diagram`, `patterns/commerce/pricing-table`, `structures/headers/section-frame`.

Tampoco existe `surface-composition/` ni un `composition/` como tier. Las dos únicas carpetas llamadas `composition/` del árbol están dentro de charts (`charts/runtime/theming/composition/react` y `charts/runtime/exporting/composition/react`) y son rol de dependencia, no taxonomía: contienen los hooks React que envuelven las funciones puras de ese runtime.

---

### `ui/` (raíz)

`ui/index.ts` — (1 archivo) barril que junta los cuatro tiers. El comentario aclara que `@rottay/design-system/ui/...` no es subpath público: la carpeta describe la arquitectura de fuente, no la API publicada.

---

### `ui/primitives/` — (1313 archivos) las piezas sueltas de UI: cada una es una hoja con tres pinturas por engine. Es el tier más grande del sistema.

`ui/primitives/display/` — (288) mostrar contenido ya resuelto: texto, imagen, datos, contenedores de lectura. Componentes: Avatar, Badge, Calendar, Callout, Card, Carousel, CodeBlock, CropMarks, Descriptions, Empty, Image, Kbd, List, MarkdownView, QRCode, Statistic, Table, Tag, TextureBackdrop, Timeline, Tooltip, Tree, Typewriter, Typography.
  - Los cuatro que no siguen el molde de tres engines son los del vocabulario monocromo: `CropMarks` (2 archivos, tildes de corte en las cuatro esquinas, puro adorno `aria-hidden`), `TextureBackdrop` (2, capa de textura CSS —grano, retícula, trama— detrás del contenido, sin color), `Typewriter` (2, revela texto letra por letra leyendo la cadencia de un canal CSS privado) y `CodeBlock`/`MarkdownView` (9 cada uno, implementación única sin engines).
  - `display/Table` (16) — tabla de documento embebida. Su propio comentario avisa: la pantalla operativa de colección es `PatternDataTable`, no esta.
  - `display/Empty` (11) — [DUPLICA] `patterns/feedback/empty-state`, `structures/feedback/surface-lifecycle/states` y `surfaces/presentation/pages/experience/empty-state`. Cuatro vocabularios de "no hay nada" en cuatro tiers.
  - `display/Timeline` (12), `display/Tree` (17), `display/Calendar` (14) — [DUPLICA] parcial de `patterns/visualization/timeline`, `patterns/visualization/tree-view` y `patterns/visualization/calendar-view`: mismo nombre, misma idea, el pattern agrega interacción y datos.
  - `display/Statistic` (14) — [DUPLICA] parcial de `patterns/data/mono-stat` (misma cifra animada, otro estilo) y de `structures/dashboard/data-terminal-card`.
  - `display/tests/` (2) — pruebas de contrato del grupo entero, en dos lotes.

`ui/primitives/inputs/` — (342) capturar datos del usuario. Componentes: AutoComplete, Button, Cascader, Checkbox, ColorPicker, DatePicker, Form, FormField, Input, InputNumber, Mentions, OTPInput, PasswordInput, Radio, Select, Slider, Switch, TagInput, Textarea, TimePicker, Toggle, Transfer, TreeSelect, Upload, VoiceInputButton.
  - `inputs/Switch` (13) vs `inputs/Toggle` (12) — [DUPLICA] los dos son el mismo interruptor booleano on/off con distinta piel.
  - `inputs/Form` (13) vs `inputs/FormField` (12) — FormField es el atajo que arma etiqueta + input + error + ayuda; Form es el contenedor con validación.
  - `inputs/Select` vs `inputs/AutoComplete` vs `inputs/TreeSelect` vs `inputs/Cascader` — cuatro desplegables de selección; se distinguen por la forma de los datos (plano, con búsqueda, árbol, cascada de niveles).
  - `inputs/VoiceInputButton` (4) — botón de micrófono, envoltura fina de `useVoiceInput`.
  - `inputs/tests/` (6) — contratos por lote (desplegables, campos, pickers), incluida una corrida contra engines reales.

`ui/primitives/layout/` — (166) repartir el espacio en la pantalla. Componentes: AsciiFrame, AspectRatio, Box, Collapse, Container, Divider, Flex, Grid, InvertSection, Layout, ScrollArea, SemanticSurface, Space, Splitter, Stack.
  - `layout/Box` / `Flex` / `Grid` / `Stack` / `Space` — la base: caja, fila flexible, retícula, apilado, separación uniforme. `Space` y `Stack` se pisan en parte: los dos existen solo para meter aire entre hijos.
  - `layout/SemanticSurface` (4) — pinta un rol de superficie gobernado (fondo/tinta) sin que el consumidor elija color. Es la capa autorizada para emitir DOM crudo.
  - `layout/InvertSection` (2) — corta una franja e invierte tinta/papel (negro pleno o blanco pleno) reasignando `--ds-surface-bg` / `--ds-surface-fg` localmente.
  - `layout/AsciiFrame` (2) — enmarca con caracteres de dibujo de caja, vocabulario monocromo.
  - `layout/Layout` (11) — [DUPLICA] estructura de página completa (header/sider/content); se solapa con `structures/shell/app-shell` y con `patterns/shell/page-shell`.
  - `layout/responsive/` — (11) visibilidad por breakpoint resuelta en CSS, sin JS. Subcarpetas: `show/` (3, muestra a partir de un breakpoint), `hide/` (1, oculta), `slot/` (5, elige qué contenido va en cada tamaño), `runtime/visibility/` (1, la media query compartida).

`ui/primitives/navigation/` — (163) moverse dentro del producto. Componentes: Affix, Anchor, BackTop, Breadcrumb, FloatButton, Link (publicado como NavLink), Menu, Pagination, Segmented, Stepper, Steps.
  - `navigation/Steps` (11) vs `navigation/Stepper` (17) — [DUPLICA] los dos dibujan un proceso por pasos numerados; Stepper además navega al hacer clic.
  - `navigation/Tabs` (18) — pestañas. Es el que más consume el tier de structures.
  - `navigation/examples/` (1) — un archivo de ejemplos de uso de Tabs/Breadcrumb/Pagination. No es producción.

`ui/primitives/feedback/` — (182) decirle al usuario qué pasó o que espere. Componentes: Alert, Drawer, Message, Modal, Notification, Progress, Rate, Result, Skeleton, Spinner, Toast.
  - `Message` (14) vs `Notification` (11) vs `Toast` (30) — [DUPLICA] tres APIs de aviso flotante global: Message es imperativa y mínima, Notification es imperativa con título+descripción+acciones, Toast es la familia declarativa. Resuelven lo mismo con tres vocabularios.
  - `Drawer` (16) — [DUPLICA] `overlay/Sheet` (12): panel que entra deslizando desde un borde. La diferencia declarada es que Sheet está pensado para táctil.
  - `Skeleton` (22) — huesos de carga con ocho sub-formas (Avatar, Text, Button, Card, ListItem, Table, Form, Paragraph).
  - `Spinner` (10) — girito de carga; comparte substrato con `primitives/foundation/loading-indicator`.

`ui/primitives/overlay/` — (126) capas flotantes por encima de la página. Componentes: AlertDialog, ConfirmDialog, ContextMenu, Dropdown, HoverCard, Popconfirm, Popover, Sheet, Tour, Watermark.
  - `AlertDialog` (11) vs `ConfirmDialog` (11) vs `Popconfirm` (12) — [DUPLICA] tres formas de preguntar "¿seguro?". AlertDialog usa slots de acción y no cierra al clicar afuera; ConfirmDialog usa callbacks; Popconfirm es la versión compacta pegada al botón.
  - `Popover` (12) vs `HoverCard` (10) vs `display/Tooltip` (17) — [DUPLICA] parcial: tres paneles flotantes anclados; Tooltip lleva texto plano, Popover contenido rico, HoverCard contenido rico solo al pasar el mouse.
  - `Tour` (14) — recorrido guiado con foco y máscara sobre elementos reales.
  - `Watermark` (10) — marca de agua repetida en canvas sobre el contenido.

`ui/primitives/foundation/` — (23) piezas mínimas compartidas por varias familias, no catálogo público de página.
  - `IconFrame/` (3) — el medallón de icono enmarcado que usan headers, tarjetas, filas y métricas.
  - `Meter/` (4) — la aguja escalar canónica: puntaje, capacidad, salud, señal.
  - `ResizeHandle/` (3) — el borde que se arrastra para redimensionar; único dueño de ese gesto.
  - `VisuallyHidden/` (4) — texto solo para lector de pantalla.
  - `calendar/` (1) — funciones y constantes de calendario compartidas, extraídas para no repetirlas en los tres engines.
  - `compose-refs/` (2) — combinar dos callback refs; nació dentro de Segmented y se subió a unidad compartida.
  - `loading-indicator/` (3) — el glifo de carga neutro que usan Spinner y otros primitives.
  - `scroll-reveal/` (2) — geometría para revelar algo dentro de su propio scrollport sin llamar a `scrollIntoView`.

`ui/primitives/runtime/` — (20) los motores de comportamiento compartidos. No pintan nada.
  - `runtime/collection/` (6) — `combobox/` (máquina de estado y ARIA del combo), `roving-focus/` (el foco que se mueve con flechas según APG), `typeahead/` (acumulador de tecleo para saltar a una opción). Los tres existen porque cada familia los reimplementaba a mano.
  - `runtime/overlay/` (14) — la infraestructura de todo lo flotante: `portal/` y `portal-scope/` (sacar el nodo del árbol y volver a estampar el scope de tema), `backdrop/` (el fondo oscurecido), `focus-management/` (trampa de foco e `inert` en los hermanos), `layer-stack/` (registro único que ordena los overlays abiertos), `positioning/` (motor de anclado con `anchor-name`), `top-layer-host/` (mantener el host del `<dialog>` nativo en la top layer), `dialog-attributes/`, `foundation/portal-theme/`.

`ui/primitives/facade/` — (1) fachada interna del tier: cuando un primitive necesita componer a otro de OTRA categoría, lo pide acá y recibe el componente ya conmutado por engine. Explícitamente no es un segundo barril y nadie fuera de `ui/primitives` debe importarlo.

`ui/primitives/tests/` — (1) prueba transversal del tier.

---

### `ui/patterns/` — (664 archivos) widgets de tarea reutilizables: resuelven un trabajo completo (una tabla operativa, un formulario por esquema, un tablero) componiendo primitives.

`ui/patterns/data/` — (152) mostrar y operar colecciones de datos.
  - `data-table/` (29) — la tabla operativa completa: barra, filtros de producto, edición en celda, agrupado, virtualizado, tarjetas en móvil. Es el owner más grande del tier. Su `runtime/` tiene `state/` (el hook `useDataTable`), `grouping/` (agrupar por columna y agregar), `inline-editing/` (qué celda se está editando) y `row-resolution/` (resolver valor y clave de fila). Su `presentation/table/mobile-cards/` es la caída a tarjetas en pantalla angosta.
  - `virtual-list/` (4) — lista larga recortada a las filas visibles. Usa los hooks de `patterns/runtime/virtualization`.
  - `grid-view/` (6) y `gallery-view/` (7) — [DUPLICA] entre sí: retícula CSS de tarjetas vs retícula CSS de medios. Los dos repiten el mismo `runtime/item-identity/` (resolver la clave del ítem); gallery agrega `keyboard-navigation/`.
  - `detail-panel/` (10) — panel maestro-detalle: lista a un lado, ficha al otro.
  - `file-manager/` (9) — navegador de archivos con carpetas.
  - `list-toolbar/` (11) — barra de dos filas sobre una lista (buscar, filtrar, acciones). [DUPLICA] `structures/workspace/table-toolbar` (una fila) y `structures/workspace/search-command-bar`.
  - `column-settings/` (8) — desplegable de columnas visibles, actualización en vivo. [DUPLICA] `structures/workspace/column-menu`, que hace lo mismo con borrador + botón Aplicar; el propio comentario de column-menu lista las diferencias. El símbolo `PatternColumnSettingsDropdown` no existe: el export es `PatternColumnSettings` con alias `ColumnSettingsDropdown`.
  - `saved-views/` (9) — barra horizontal de vistas guardadas. [DUPLICA] `structures/workspace/saved-views-menu`, el mismo concepto como desplegable; su comentario también lo reconoce.
  - `stats-grid/` (12) — retícula de tarjetas de métrica con sparkline y conteo animado. Su `foundation/layout/` resuelve el eje de columnas y `foundation/personality/` traduce la personalidad global a la familia. [DUPLICA] `structures/dashboard/stats-header`.
  - `record-facts/` (8) — anatomía de solo lectura para registros densos: una sola frontera de sección y ritmo interno, en vez de tarjetas anidadas. [SIN CONSUMIDOR] en `core`: solo su índice y fixtures del showroom.
  - `decision-comparison/` (10) — comparar dos sujetos hecho a hecho con tono semántico.
  - `decision-panorama/` (7) — panorama de hechos para decidir. CON CONSUMIDOR: lo importa y renderiza el fixture `brand-studio/runtime/tenant-theme-preview/fixtures/visual-excellence/index.tsx:46,354`.
  - `widget-board/` (15) — tablero de widgets movibles y redimensionables con catálogo. Su `runtime/adaptive/policy` y `/react` delegan en el solucionador de `patterns/runtime/adaptive-layout`. CON CONSUMIDOR: el fixture `visual-excellence/index.tsx:48,726` lo renderiza y el showroom tiene `WidgetBoardPreview` (`pattern-preview-fixtures.tsx:1227`).
  - `bulk-select-toggle/` (2) — botón para entrar y salir del modo selección múltiple. Sin engines. CON CONSUMIDOR: `patterns/data/tests/PatternsLongTailBatch.contract.test.tsx:6` lo importa y dos páginas del showroom lo renderizan.
  - `status-filter-pills/` (1) — fila de píldoras de filtro por estado. Sin engines. CON CONSUMIDOR: `structures/workspace/tests/WorkspaceChromeBatch.contract.test.tsx:20` lo importa y una torture-section del showroom lo renderiza.
  - `mono-stat/` (2) — una cifra monoespaciada que cuenta hacia arriba al entrar en pantalla; hecha para el muro de pruebas monocromo. CON CONSUMIDOR: tres tests de integración monochrome lo importan y las probes `config-b` y `kit-inventory` del showroom lo renderizan.
  - `tests/` (1) — contrato del lote de patterns de cola larga.

`ui/patterns/forms/` — (52) armar y filtrar formularios.
  - `form-builder/` (14) — convierte una definición de campos en primitives del DS, con validación. Su `runtime/responsive/` resuelve el layout una sola vez para los tres engines (en teléfono nunca queda retícula densa).
  - `filter-builder/` (10) — compositor de filtros anidados con AND/OR. `runtime/operators/` mezcla operadores propios con los por defecto; `runtime/tree/` son los guards del árbol de filtros.
  - `filter-panel/` (10) — panel de filtros configurable. [DUPLICA] `structures/workspace/field-filters-panel` (los mismos filtros como retícula de tarjetas) y en parte `filter-builder`.
  - `step-wizard/` (9) — formulario multipaso. `runtime/sticky-actions/` mantiene la barra de acciones pegada sin depender de `structures/workspace/action-dock`.
  - `invoice-template/` (7) — factura imprimible.
  - `tests/` (1) — contrato del grupo.

`ui/patterns/visualization/` — (186) dibujar datos.
  - `charts/` (141) — la familia D3 completa. Se divide en:
    - `families/` (21) — un archivo adaptador por tipo de gráfico: area, bar, bullet, calendar-heat-map, funnel, gantt, gauge, heat-map, histogram, line, network-graph, pie, radar, sankey, scatter, sparkline, tree-map, waterfall. Casi todos son "familia de compatibilidad": la geometría real vive en el chart-engine y acá solo queda el contrato público. `network-graph` y `sankey` conservan cuerpo imperativo D3 propio.
    - `runtime/chart-engine/` (68) — el motor: `foundation/` (gramática, especificación, proyección, renderers puros, acceso, interacción), `runtime/` (dimensiones, gramática, insight, interacción) y `presentation/react/` (los componentes React que montan esos cálculos).
    - `runtime/` resto (15) — `exporting/` (helpers puros de exportación + su `composition/react`), `theming/` (resolver variables CSS a hex para la matemática de color de D3 + su `composition/react`), `interaction/` (brush, estado de tooltip, viewport), `responsive/compact-mode`, `streaming/` (adaptador de datos en vivo que agrupa puntos y confirma por frame), `foundation/` (brush-selection, resolución de color CSS).
    - `presentation/` (4) — `scaffold/` (el marco común de todo gráfico: estados listo/cargando/vacío/error, título, subtítulo), `tooltip/` (globo HTML rico que reemplaza al `<title>` SVG), `crosshair/` (cruz y posición del puntero), `family-frame/` (puerta opcional de proyección semántica).
    - `contracts/` (2), `foundation/geometry/` y `foundation/palettes/` (paleta categórica de 10 colores heredada), `tests/` (27).
  - `calendar-view/` (8) — calendario mes/semana/día. [DUPLICA] parcial de `primitives/display/Calendar`.
  - `kanban-board/` (7) — tablero de columnas con tarjetas arrastrables.
  - `timeline/` (7) — línea de tiempo de eventos. [DUPLICA] parcial de `primitives/display/Timeline`.
  - `tree-view/` (11) — jerarquía en dos presentaciones (interactiva conmutada por engine y estática). [DUPLICA] parcial de `primitives/display/Tree`.
  - `map-view/` (8) — contenedor de mapa; es un placeholder, no trae proveedor de mapas.
  - `ascii-diagram/` (2) — diagrama de cajas en monoespaciado, con revelado tipo tecleo. Sin engines. CON CONSUMIDOR: tres tests monochrome lo importan y `kit-inventory/page.tsx:71` lo renderiza.
  - `tests/` (1).

`ui/patterns/communication/` — (43) conversación y avisos.
  - `notification-center/` (9) — bandeja de notificaciones con badge y desplegable; es pattern y no primitive porque coordina disparador, lista y estado.
  - `activity-log/` (9) — línea de tiempo de actividad.
  - `comment-thread/` (8) — hilo de comentarios anidados.
  - `live-feed/` (9) — feed de datos en tiempo real.
  - `assistant/` (3) — piezas de chat para IA: MessageBubble, AssistantStatusBadge, AssistantStatusIndicator, PreviewDiffCard, ConfirmActionCard. No existe `PatternAssistant`; se consume por piezas.
  - `presence/` (3) — quién está mirando: PresenceBar, indicador de tecleo, cursor en vivo. Solo el contrato visual; el WebSocket lo pone la app.
  - `tests/` (1).

`ui/patterns/workflow/` — (34) colas de trabajo y aprobación.
  - `approval-workflow/` (7) — cadena de aprobación multipaso.
  - `approval-inbox/` (7) — bandeja de aprobaciones agrupadas. Su propio comentario la marca como deprecada ("will be removed in a future major version"). [DUPLICA] `approval-workflow` y `surfaces/.../workspace/decision-inbox`.
  - `moderation-gallery/` (8) — galería de medios para moderar. Solo `modern` es real; classic y rustic son caída.
  - `operational-ledger/` (6) — libro denso de operaciones (tabla nativa).
  - `shift-matrix/` (5) — retícula rol x tiempo x evento con encabezados fijos.

`ui/patterns/navigation/` — (48) navegar y cambiar de contexto.
  - `command-palette/` (11) — paleta de comandos modal con búsqueda y teclado. `foundation/frecency/` puntúa por frecuencia+recencia (funciones puras); `runtime/application-commands/` traduce el registro de comandos a ítems; `runtime/argument-mode/` es la máquina de estado cuando un comando pide argumentos.
  - `workspace-switcher/` (10) — cambiar de workspace/tenant con badges y destinos recientes.
  - `locale-switcher/` (9) — cambiar idioma; `runtime/default-locales/` trae los cinco por defecto.
  - `environment-toggle/` (9) — cambiar entre entornos (dev/staging/prod).
  - `shortcuts-overlay/` (7) — overlay modal con la lista de atajos.
  - `tests/` (1).

`ui/patterns/shell/` — (31) marcos de página. Es donde más se pisa con `structures/shell/`.
  - `page-shell/` (10) — el layout estándar de página. [DUPLICA] `structures/shell/page-shell-surface` (que solo lo envuelve), `structures/shell/app-shell` y `primitives/layout/Layout`.
  - `cockpit-header/` (7) — header rico tipo cabina de mando.
  - `workbench-header/` (6) — header de "casa del rol". [DUPLICA] parcial de `cockpit-header` y de los siete headers de `structures/headers/`.
  - `feature-workspace-frame/` (7) — marco de ancho para un workspace de feature. [SIN CONSUMIDOR]: solo su propio `index.ts`.

`ui/patterns/customization/` — (38) que el tenant vea y ajuste su marca.
  - `brand-studio/` (23) — el editor acotado de BrandTheme con previsualización en vivo. `runtime/file-export/` serializa y proyecta el theme; `runtime/tenant-theme-preview/` es el motor de preview con `preview-scope/` (aislar el CSS), `contrast-adjustments/`, `pack-warnings/`, `report/` y `fixtures/` (cinco escenas de muestra: métricas, formulario, galería, colección, excelencia visual).
  - `tenant-preview/` (10) — superficie de preview de marca/personalidad conmutada por engine. `runtime/preview-css/` sanea y acota el CSS del preview.
  - `branding-preview-sandbox/` (2) — galería de primitives reales con una TenantAppearance propuesta aplicada en un scope aislado.
  - `token-inspector/` (2) — overlay de desarrollo (Ctrl+Shift+T) para ver los `--ds-*` resueltos de cualquier elemento; se elimina en producción. CON CONSUMIDOR: `patterns/tests/cross-capability.contract.test.tsx` lo importa y dos páginas del showroom lo renderizan.
  - [DUPLICA] los tres primeros resuelven "ver cómo queda la marca antes de guardar" con tres implementaciones distintas.

`ui/patterns/feedback/` — (15) qué mostrar cuando no hay nada o algo va lento.
  - `empty-state/` (7) — placeholder de vacío conmutado por engine. [DUPLICA] `primitives/display/Empty`, `structures/feedback/surface-lifecycle/states` y la surface `experience/empty-state`.
  - `adaptive-overlay/` (5) — el mismo contenido se muestra como modal, drawer o sheet según el tamaño de pantalla.
  - `terminal-block/` (2) — bloque tipo terminal que escribe línea por línea leyendo cadencias de canales CSS privados. CON CONSUMIDOR: los tests monochrome lo importan, `config-b` y `kit-inventory` lo renderizan y `ascii-diagram` lo referencia.

`ui/patterns/commerce/` — (9) `pricing-table/` (8): retícula de comparación de planes con filas de features y plan destacado.

`ui/patterns/identity/` — (10) `profile/user-profile-card/` (8): tarjeta de perfil de usuario. El nivel `profile/` solo agrupa.

`ui/patterns/foundation/` — (10) apoyo puro del tier, no renderiza producto.
  - `motion/transition/` (1) y `motion/collection-stagger/` (2) — vocabulario de transición y el escalonado al insertar ítems de colección.
  - `recipes/columns/` (2) — constructores tipados de `ColumnDef` (columna de texto, de acciones, etc.).
  - `header-actions/` (1) — vocabulario semántico compartido de acciones de header; TypeScript puro, sin React.
  - `engine-styles/modern/` (1) — estilos privados del engine modern compartidos por varios patterns.

`ui/patterns/runtime/` — (27) estado y comportamiento compartidos entre patterns. Nada pinta.
  - `virtualization/` (7) — `virtual-scroll/` (ventana de filas de alto fijo, cero dependencias), `variable-scroll/` (alto variable medido), `infinite-scroll/` (centinela con IntersectionObserver).
  - `adaptive-layout/` (4) — el ÚNICO solucionador determinista de colocación adaptativa; lo usan WidgetBoard y DashboardSurface. Separa `foundation/` (contratos), `runtime/` (el solver) y `presentation/react/`.
  - `cell-renderers/` (2) — funciones de render de celda reutilizables (avatar+nombre, monoespaciado, icono+texto, tags, score). Antes vivían en `patterns/data`; el nombre público sigue saliendo por ahí.
  - `filtering/panel-state/` (3), `forms/builder-state/` (2), `kanban/board-state/` (2) — el estado de cada uno de esos tres patterns, separado de su pintura.
  - `pulse/value-change/` (3) — el pulso visual cuando un valor cambia.
  - `recipes/variants/` (2) — helpers de composición de variantes en React.
  - `tests/` (1).

`ui/patterns/tooling/` — (2) `storybook/catalog/core/` y `/advanced`: dos archivos de historias que catalogan patterns. Solo herramienta.

`ui/patterns/facade/` — (1) igual que la de primitives: cuando un pattern compone a otro de otro grupo, lo pide acá y recibe el componente ya conmutado por engine. Grupo con grupo nunca se importan directo.

`ui/patterns/tests/` — (5) contratos transversales del tier.

---

### `ui/structures/` — (162 archivos) el chrome de la página: lo que rodea a un pattern. Casi todo es "engine-free" (compone primitives ya conmutados, no tiene tres pinturas propias); las excepciones que sí traen `engines/` son stats-header, mobile-header, bottom-tab-bar y action-dock.

`ui/structures/headers/` — (31) el encabezado de cada tipo de página. Siete owners:
  - `collection/` (2) — header hero para pantallas de colección.
  - `dashboard/` (4) — header de página de resumen.
  - `detail/` (4) — header de ficha con botón atrás, metadatos y riel de acciones.
  - `edit/` (2) y `form/` (2) — [DUPLICA] entre sí: header de edición y header de creación son el mismo hermano con distinto copy.
  - `header-surface/` (3) — chrome liviano de título/breadcrumb con pestañas opcionales. [DUPLICA] parcial de los cinco anteriores.
  - `mobile-header/` (9) — header compacto de móvil (acción izquierda, título centrado); trae tres engines.
  - `section-frame/` (2) — sección numerada y enmarcada monocroma (`[01] — TITULO` sobre una regla fina).
  - `tests/` (2).

`ui/structures/workspace/` — (39) los controles que rodean a una tabla o colección.
  - `table-toolbar/` (4) — barra de una fila sobre la tabla. [DUPLICA] `patterns/data/list-toolbar`.
  - `search-command-bar/` (1) — barra de búsqueda/comando de la pantalla de colección. [DUPLICA] parcial de `table-toolbar`.
  - `active-filters-bar/` (4) — riel con los filtros aplicados como tags removibles.
  - `field-filters-panel/` (4) — panel avanzado de filtros como retícula de tarjetas. [DUPLICA] `patterns/forms/filter-panel`.
  - `column-menu/` (2) — menú de columnas con borrador y Aplicar. [DUPLICA] `patterns/data/column-settings`.
  - `saved-views-menu/` (1) — vistas guardadas como desplegable con tres secciones. [DUPLICA] `patterns/data/saved-views`.
  - `scope-switcher/` (1) — tira de píldoras para cambiar de alcance de datos. [DUPLICA] parcial de `patterns/data/status-filter-pills`.
  - `view-mode-switcher/` (1) — control segmentado tabla/tarjetas/retícula/kanban/galería/calendario; el propio comentario dice que ES el primitive Segmented certificado.
  - `selection-preview-rail/` (4) — riel pegajoso de 380px a la derecha que previsualiza lo seleccionado.
  - `export-button/` (4) — botón con desplegable de exportar; `runtime/file-export/` genera CSV/JSON/portapapeles sin dependencias externas.
  - `connected-command-palette/` (2) — envoltura de `PatternCommandPalette` conectada al registro de comandos; es la integración canónica.
  - `action-dock/` (9) — barra flotante de acciones pegada abajo en móvil; trae tres engines.
  - `tests/` (1).

`ui/structures/record/` — (12) la anatomía de una ficha de registro.
  - `field/` (1) — una tarjeta de campo de solo lectura (etiqueta, valor, estados).
  - `field-grid/` (1) — la retícula CSS que ordena esas tarjetas; su única línea inline es `gridTemplateColumns`.
  - `summary-strip/` (1) — tira/retícula de resumen con tríos etiqueta/valor/ayuda en cinco variantes.
  - `panel/` (1) — el contenedor tipo tarjeta de las páginas de registro; deliberadamente sin comportamiento.
  - `action-bar/` (1) — el riel de acciones que cierra la ficha.
  - `edit-fields/` (2) — el chrome de edición en una sola superficie. Compañero de `field/`.
  - `form-sections/` (2) — acordeón/secciones plegables para organizar el formulario. [DUPLICA] parcial de `edit-fields/` y de `patterns/forms/form-builder`.
  - `tests/` (2).

`ui/structures/dashboard/` — (31) el chrome de una pantalla de métricas.
  - `stats-header/` (8) — tira de 3 a 5 tarjetas de métrica con conteo animado; trae tres engines. [DUPLICA] `patterns/data/stats-grid`.
  - `data-terminal-card/` (2) — tarjeta de métrica única, engine-free. [DUPLICA] parcial de `stats-header` y de `primitives/display/Statistic`.
  - `insights/` (17) — las variantes de insight de dashboard, partidas en `foundation/` (contratos + tokens), `runtime/variant/` y `presentation/` con dos familias agregadas: `activity/` (cuatro insights de actividad) y `metrics/` (cuatro insights de métrica).
  - `tests/` (3).

`ui/structures/feedback/` — (12) el estado de la pantalla entera.
  - `surface-lifecycle/` (6) — la familia canónica del ciclo de vida de una surface: `states/` (loading, empty, error, stale, offline), `use-surface-state/` (la máquina que deriva el estado desde data/loading/error) y `error-boundary/` (frontera de error por surface). El trío duplicado anterior (SurfaceLoadingState / SurfaceEmptyStateCard / SurfaceErrorStateCard) fue retirado sin alias.
  - `loading-overlay/` (3) — velo semitransparente que evita el salto de layout mientras recarga.
  - `capability-anatomy/` (2) — lista etiquetada de lo que una surface PUEDE hacer, independiente de los datos; explícitamente no es un estado del ciclo de vida.

`ui/structures/shell/` — (26) los marcos de aplicación.
  - `app-shell/` (2) — sidebar + header + contenido, el shell de aplicación del DS.
  - `workspace-shell/` (4) — shell atmosférico premium que envuelve las secciones de un workspace de colección en una superficie continua. Antes se publicaba desde `surfaces/workspace/`; se movió acá porque es chrome, no receta de página.
  - `page-shell-surface/` (2) — envoltura mínima alrededor de `PatternPageShell`. [DUPLICA] declarada: es un adaptador del pattern.
  - `navigation/sidebar-surface/` (3) — el shell de sidebar plegable.
  - `surface-chrome/` (3) — familia compuesta con las tres piezas chicas de chrome: SurfaceActionBar, SurfaceTabbedLabel, SurfaceSectionCard.
  - `bottom-tab-bar/` (9) — barra de pestañas fija abajo, estilo app móvil; trae tres engines.
  - `contracts/` (1) — el contrato del shell.
  - [DUPLICA] este grupo tiene cuatro marcos de página (`app-shell`, `workspace-shell`, `page-shell-surface`, `sidebar-surface`) que se solapan entre sí y con `patterns/shell/page-shell` y `primitives/layout/Layout`.

`ui/structures/foundation/chrome/` — (9) el apoyo compartido entre shells y surfaces. Bajó desde `surfaces/runtime` porque el chrome no puede depender de las surfaces.
  - `contracts/` (1) — las declaraciones de chrome de página (incluidos los 32 campos de override visual por perfil).
  - `runtime/access/` — resolución final de visibilidad de campos/acciones/pestañas; `runtime/errors/` — responder "¿esto fue un error?" ante un `error?: unknown`; `runtime/i18n/` — el helper de traducción que acota todo al namespace `components`; `runtime/profile-defaults/` — los defaults de surface derivados del product profile y de los tokens de personalidad, más el hook de overrides; `runtime/responsive/` — los helpers de móvil/escritorio para páginas partidas.

---

### `ui/surfaces/` — (128 archivos) recetas de pantalla completa: objetos de configuración que describen una página entera. Se ordena en tres capas de dependencia.

`ui/surfaces/foundation/` — (11) los contratos estables.
  - `contracts/` (4) — las interfaces de configuración de cada surface.
  - `contracts/adaptive/` (3) — declaraciones tipadas de postura por breakpoint, con `collection/` como el contrato del workspace de colección (modos de vista, kanban, calendario, retícula, galería, tarjetas, selección, riel de preview, edición en celda).
  - `common/` (7) — cinco archivos de historias del catálogo de surfaces más `story-helpers/` (decoradores y configuraciones de tenant) y `test-utils/` (render de prueba con fixture sin carga visual en runtime).

`ui/surfaces/runtime/` — (7) el comportamiento que consume esos contratos.
  - `collection-workspace/` (1) — el hook espina del workspace: modo de vista, ciclo de filtros, selección, vista guardada.
  - `adaptive-posture/` (1) — resuelve un `AdaptiveConfig` a la postura efectiva del breakpoint actual.
  - `builders/` (2) — los constructores tipados de configuración que quedaron (el de auth, principalmente).
  - `helpers/` (3) — acceso de presentación, adaptadores y normalización de datos.

`ui/surfaces/presentation/pages/` — (107) las páginas completas, en seis grupos.
  - `data/` (24) — pantallas de datos: `list/` (5, la página de lista con filtros y vistas tabla/tarjeta), `dashboard/` (4, retícula de KPIs y secciones), `detail/` (3, ficha de entidad), `compare/` (2, tabla comparativa lado a lado), `report/` (4, armador de reportes con plantillas), `search/` (2, página de búsqueda dedicada), `visualization/` (2, esqueleto de página de gráficos/mapas/líneas de tiempo), `tests/` (1).
  - `workspace/` (17) — `collection-workspace/` (9, la pantalla premium unificada de colección; incluye `render-dispatch/` que enruta a la vista elegida y `filter-dropdown/`), `command-center/` (3, tablero de entrada para gerentes: KPIs + acciones rápidas + actividad), `decision-inbox/` (2, cola de aprobación/revisión), `record-workbench/` (2, ficha con pestañas, registros relacionados y barra de acciones).
    - [DUPLICA] `workspace/collection-workspace` vs `data/list`: dos recetas de página para la misma pantalla de colección. La primera se declara "la única surface canónica de workspace para todas las pantallas de colección/lista/tabla", y la segunda sigue publicada.
    - [DUPLICA] `workspace/record-workbench` vs `data/detail`: el propio comentario dice que es "DetailSurface mejorado".
  - `admin/` (23) — páginas de administración: `settings/` (2, shell de ajustes con pestañas), `audit/` (3, visor de log de auditoría filtrable y exportable), `billing/` (4, plan, uso y facturación), `profile/` (4, cuenta del usuario), `team/` (2, roster de miembros), `integration/` (2, API keys y webhooks), `import-export/` (3, carga y descarga masiva), `file-browser/` (2, envuelve `PatternFileManager`).
  - `experience/` (23) — páginas de cara pública o de experiencia: `auth/` (2), `marketing/` (1, lienzo editorial pre-login), `pricing/` (2, envuelve `PatternPricingTable`), `chat/` (2, conversación para asistentes o soporte), `editor/` (2, lienzo de edición con toolbar), `media/` (2, navegador de medios con preview), `notification/` (3, centro de notificaciones con preferencias), `empty-state/` (2, la página entera de "todavía no hay nada"), `oauth-transition/` (6, la pantalla de transición del OAuth, la única del grupo con fachada e implementación por capas).
  - `forms/` (10) — `form/` (2, formulario de una página), `detail-form/` (2, edición con aside de resumen), `wizard/` (2, flujo guiado multipaso), `guided-draft-form/` (3, flujos de creación con borrador, recuperación y plantillas).
    - [DUPLICA] parcial: tres de los cuatro envuelven `PatternFormBuilder` (`forms/form`, `forms/wizard`, `forms/detail-form`) y se distinguen por el chrome (una página, partido, por pasos). `guided-draft-form` no referencia `FormBuilder` en ninguna línea: compone primitives directamente.
  - `operations/` (9) — `activity/` (2, envuelve `PatternActivityLog`), `kanban/` (2, envuelve `PatternKanbanBoard`), `scheduler/` (2, envuelve `PatternCalendarView`), `operational/` (2, tablero de operaciones en vivo con colas y feeds).
    - Estos cuatro son envoltorios finos: la surface aporta el chrome de `PageShellSurface` y el pattern hace el trabajo.

`ui/surfaces/tests/` — (2) contratos transversales del tier.

---

### Resumen de duplicaciones detectadas

1. **Chrome de colección partido entre dos tiers.** Cuatro pares hacen lo mismo con distinta piel: `patterns/data/list-toolbar` vs `structures/workspace/table-toolbar` (+`search-command-bar`); `patterns/data/column-settings` vs `structures/workspace/column-menu`; `patterns/data/saved-views` vs `structures/workspace/saved-views-menu`; `patterns/forms/filter-panel` vs `structures/workspace/field-filters-panel`. Los comentarios de las versiones de structures reconocen la duplicación por escrito.
2. **Dos recetas de página para la misma pantalla de colección**: `surfaces/.../data/list` y `surfaces/.../workspace/collection-workspace`, aunque la segunda se declara canónica. Lo mismo entre `data/detail` y `workspace/record-workbench`.
3. **Cuatro vocabularios de "vacío"** (`primitives/display/Empty`, `patterns/feedback/empty-state`, `structures/feedback/surface-lifecycle/states`, `surfaces/.../experience/empty-state`) y **tres APIs de aviso flotante** (`feedback/Message`, `feedback/Notification`, `feedback/Toast`).
4. **Seis marcos de página**: `primitives/layout/Layout`, `patterns/shell/page-shell`, `structures/shell/app-shell`, `structures/shell/workspace-shell`, `structures/shell/page-shell-surface`, `structures/shell/navigation/sidebar-surface`.
5. **Siete headers** en `structures/headers/` (`edit` y `form` son el mismo componente con otro copy) más dos headers en `patterns/shell/` (`cockpit-header`, `workbench-header`).
6. **Tres previsualizadores de marca**: `brand-studio`, `tenant-preview`, `branding-preview-sandbox`.
7. **Métricas por triplicado**: `primitives/display/Statistic`, `patterns/data/stats-grid`, `patterns/data/mono-stat`, `structures/dashboard/stats-header`, `structures/dashboard/data-terminal-card`.
8. **Pares primitive/pattern con el mismo nombre**: Timeline, Tree/TreeView, Calendar/CalendarView.
9. **Pares de controles equivalentes en primitives**: Switch/Toggle, Steps/Stepper, Drawer/Sheet, AlertDialog/ConfirmDialog/Popconfirm, Tooltip/Popover/HoverCard, Space/Stack, GridView/GalleryView.

### Owners sin ningún consumidor de código

Verificado con `grep -ra` sobre `packages/core/src` y `packages/showroom/src`. Todos están exportados al público del paquete, pero nada en el repo los usa:

- Solo su propio `index.ts`: `patterns/shell/feature-workspace-frame`, `patterns/data/widget-board`, `patterns/data/decision-panorama`.
- Solo el registro/navegación del showroom (metadatos, no render): `patterns/data/bulk-select-toggle`, `patterns/data/status-filter-pills`, `patterns/data/mono-stat`, `patterns/feedback/terminal-block`, `patterns/visualization/ascii-diagram`, `patterns/customization/token-inspector`.
- Solo índice más fixtures del showroom: `patterns/data/record-facts`.
- Marcado deprecado por su propio comentario: `patterns/workflow/approval-inbox`.
## Mapa de carpetas: graphics / entrypoints / tooling

Repo: `/Users/daniel/Developer/Rottay/ui-design-system`
Base: `packages/core/src/`
Fecha: 2026-08-18. Solo lectura, nada del repo fue modificado.

Convención de conteo: `(N)` = archivos propios de esa carpeta (sin contar
subcarpetas). Donde es útil agrego `total=M` = archivos incluyendo subcarpetas.

Totales: graphics 167 carpetas, entrypoints 118 carpetas, tooling 137 carpetas
(incluyendo las tres raíces) = **422 carpetas**.

---

#### packages/core/src/graphics/

`graphics/` — (0 archivos, total=432) raíz de los activos visuales no-componente:
iconos, marcas de terceros, pictogramas y el sistema de movimiento. No tiene
barrel propio; cada familia expone el suyo.

##### graphics/brand-marks/ (total=13)

`graphics/brand-marks/` — (1) familia de logotipos de terceros (OpenAI, GitHub,
Google, LinkedIn, AWS...). Su `index.ts` es el barrel público de la familia:
exporta `BrandMark`, `CloudServiceMark`, el catálogo cerrado y la procedencia
legal.
  `graphics/brand-marks/foundation/` — (0) capa de contratos, sin lógica.
    `graphics/brand-marks/foundation/catalog/` — (1) define el corpus cerrado y
    auditado: 11 nombres de marca, `CLOUD_PROVIDERS = ['aws']`, `MARK_VARIANTS`,
    los type-guards y los tipos de props. Es la única lista permitida.
  `graphics/brand-marks/presentation/` — (0) agrupador de los dos componentes React.
    `graphics/brand-marks/presentation/brand-mark/` — (1) el componente
    `BrandMark`: valida el nombre, resuelve variante y accesibilidad, y delega
    el dibujo al adaptador de @thesvg/react. Consulta el control de gobierno de
    activos gráficos antes de renderizar.
    `graphics/brand-marks/presentation/cloud-service-mark/` — (1) igual pero para
    marcas de servicios cloud (AWS y sus servicios), con variante óptica propia.
  `graphics/brand-marks/runtime/` — (0) agrupador de la maquinaria de resolución.
    `graphics/brand-marks/runtime/adapters/` — (0) frontera con el proveedor.
      `graphics/brand-marks/runtime/adapters/thesvg-react/` — (1) único punto del
      repo autorizado a importar `@thesvg/react`. Barrel del adaptador.
        `.../thesvg-react/brand/` — (1) mapea cada `BrandMarkName` al componente SVG
        del proveedor.
        `.../thesvg-react/cloud-service/` — (1) lo mismo para servicios cloud.
    `graphics/brand-marks/runtime/provenance/` — (1) registro auditable: qué
    paquete, qué versión, qué licencia y el aviso de marcas registradas.
    `graphics/brand-marks/runtime/resolution/` — (1) barrel de las tres reglas de
    resolución + `warnMarkOnce`.
      `.../resolution/accessibility/` — (1) decide si la marca sale como decorativa
      (`aria-hidden`) o etiquetada.
      `.../resolution/brand-variant/` — (1) elige variante (color / mono / etc.)
      según props y contexto.
      `.../resolution/cloud-optical-variant/` — (1) corrección óptica específica de
      las marcas cloud (tamaños que se ven distintos al mismo px).
  `graphics/brand-marks/tests/` — (1) `marks.test.tsx`, prueba de la familia completa.

##### graphics/icons/ (total=347 — la familia más grande de graphics)

`graphics/icons/` — (1) sistema de iconos. El `index.ts` es un **barrel de
compatibilidad**: exporta `createIcon`, el catálogo histórico completo, los tipos
base y sólo dos componentes legacy (`AlertIcon`, `LoaderIcon`).

  `graphics/icons/foundation/` — (1) tokens canónicos de tamaño de icono
  (`--ds-icon-{xs..2xl}-size`) en una fuente mínima para no arrastrar el catálogo
  de tokens completo dentro del runtime (evita ciclo de dependencias).
    `graphics/icons/foundation/contracts/` — (1) tipos compartidos del subsistema:
    `SvgIconProps`, `IconComponent`, `ICON_SIZE_MAP`, `IconRole`, `IconTone`,
    `IconState`, `IconMirroring`.
      `.../contracts/base/` — (1) `BaseIcon`: el wrapper SVG 24x24 con stroke,
      tamaño por token y accesibilidad (aria-hidden o aria-label + `<title>`).
      `.../contracts/provenance/` — (1) `ICON_PROVENANCE`: proveedor Phosphor
      2.1.10, licencia MIT, render local-ssr.
      `.../contracts/registry/` — (1) expone `ICON_NAMES` / `ICON_CORPUS` /
      `isIconName` derivados del corpus generado. Es el registro semántico canónico.
        `.../registry/policy/` — (1) mapea rol semántico a peso de glifo del
        proveedor (control→regular, feature→duotone, status→duotone...).
          `.../registry/policy/tests/` — (1) test de esa política.
        `.../registry/semantic/` — (1) tipos de `IconProps` de la fachada semántica
        (name, role, tone, state, size, mirroring).
    `graphics/icons/foundation/semantic/` — (0) agrupador del corpus gobernado.
      `.../semantic/adapters/` — (2) `phosphor-2.1.10.json` (el mapeo fijado
      id-semántico → módulo/export de Phosphor) y su JSON Schema. Es el contrato
      con el proveedor, no código.
      `.../semantic/corpus/` — (2) `manifest.json` (el corpus gobernado, editable a
      mano) y su schema.
        `.../semantic/corpus/generated/` — (1) salida de
        `scripts/generators/generate-semantic-icons/index.mjs`: `GENERATED_ICON_NAMES`, metadatos,
        y las listas por pack (FOUNDATION/BITHIRE/IDENTITY/INTELLIGENCE/OPERATIONS).
        Corpus version 6.
      `.../semantic/presets/` — (0) agrupador de presets por aplicación.
        `.../semantic/presets/bithire/` — (1) `manifest.json`: los 104 nombres que
        BitHire realmente usa, con `sourceInventory` apuntando al inventario del
        app. Es la *entrada* del generador. **[DUPLICA parcial]** con
        `graphics/icons/presentation/semantic/generated/presets/bithire/`, que es
        la *salida* — no es duplicación real (input vs output) pero el nombre de
        ruta idéntico en dos árboles invita a confundirlos.

  `graphics/icons/presentation/` — (0, total=325) todo lo que se renderiza.
    `graphics/icons/presentation/catalog/` — (1) barrel del catálogo de
    compatibilidad por categoría; envuelve glifos SSR de Phosphor con el adaptador
    interno para dar tamaño/peso/accesibilidad DS.
      `.../catalog/action/` — (1) iconos de acción (CRUD, portapapeles, power).
      `.../catalog/animated/` — (1) barrel de morphs de estado de icono.
        `.../catalog/animated/copy-to-check/` — (1) `CopyToCheck`: crossfade de copiar
        a check, opacidad+escala, sin salto de layout.
        `.../catalog/animated/hamburger-to-x/` — (1) `HamburgerToX`: hamburguesa que
        rota a X, sólo transform/opacity.
        `.../catalog/animated/tests/` — (1) test de los dos morphs.
      `.../catalog/communication/` — (1) mail, mensajería, notificaciones, teléfono.
      `.../catalog/compatibility/` — (1) cajón explícito para nombres legacy sueltos
      que no encajan en ninguna categoría (evita un `misc/`).
      `.../catalog/content/` — (1) archivos, carpetas, marcadores, imágenes.
      `.../catalog/data/` — (1) gráficos, búsqueda, filtros, bases de datos.
      `.../catalog/layout/` — (1) vistas, grids, calendarios, alineación.
      `.../catalog/media/` — (1) visibilidad, ratings, audio, play/pause.
      `.../catalog/navigation/` — (1) flechas, chevrons, menús.
      `.../catalog/status/` — (1) checks, alertas, indicadores de carga.
      `.../catalog/tests/` — (1) `phosphor-exact-supplier.test.ts`: prueba que el
      proveedor exacto no derive.
      `.../catalog/user/` — (1) personas, auth, seguridad.
    `graphics/icons/presentation/legacy/` — (1) barrel de 15 iconos SVG dibujados a
    mano sobre `BaseIcon`. **[DUPLICA] con `presentation/catalog/`**: el propio
    barrel de `graphics/icons/index.ts` documenta que 13 de los 15 "tienen
    equivalentes del catálogo con el mismo nombre" y por eso NO se re-exportan.
    Sólo `AlertIcon` y `LoaderIcon` salen al público.
      `.../legacy/AlertIcon/` — (1) triángulo de advertencia. Exportado.
      `.../legacy/LoaderIcon/` — (1) spinner de ocho radios. Exportado.
      `.../legacy/CameraIcon/`, `CheckIcon/`, `ChevronDownIcon/`, `ChevronLeftIcon/`,
      `ChevronRightIcon/`, `ChevronUpIcon/`, `EyeIcon/`, `EyeOffIcon/`, `InfoIcon/`,
      `SearchIcon/`, `UserIcon/`, `UsersIcon/`, `XIcon/` — (1 cada una, 13 carpetas)
      versiones a mano de iconos que ya existen en el catálogo Phosphor.
      **[SIN CONSUMIDOR]**: `grep -ra "legacy/<Nombre>"` sobre todo `src/` devuelve
      0 referencias para las 13. Son código muerto verificado.
    `graphics/icons/presentation/semantic-icon/` — (1) el componente `Icon`, la
    fachada semántica pública: recibe `name` (p.ej. `action.search`), resuelve
    contra el mapa generado y reporta telemetría de activos gráficos.
      `.../semantic-icon/tests/` — (1) test de la fachada.
    `graphics/icons/presentation/semantic/` — (0, total=291) el árbol generado.
      `.../semantic/generated/` — (1) barrel de lo generado (corpus + packs).
        `.../generated/facade-map/` — (1) el mapa exhaustivo nombre→componente que
        está detrás de `Icon`. Congelado, generado.
        `.../generated/packs/` — (6) los cinco packs tree-shakeables
        (`foundation`, `bithire`, `identity`, `intelligence`, `operations`) + barrel.
        `.../generated/presets/` — (0) agrupador de presets.
          `.../generated/presets/bithire/` — (1) `BitHireIconPreset`: fachada síncrona
          con sólo los roles que BitHire usa, para no cargar el registro completo.
        `.../generated/roles/` — (**282 archivos**) un componente por rol semántico
        gobernado. Es el 65% de todos los archivos de `graphics/`. Generado, no editar.

  `graphics/icons/runtime/` — (0, total=7) maquinaria, nada renderizable directo.
    `graphics/icons/runtime/adapters/` — (0) **CARPETA VACÍA**.
      `graphics/icons/runtime/adapters/phosphor-ssr/` — (0) **CARPETA VACÍA**, cero
      archivos. Resto de una relocalización. **[SIN CONSUMIDOR]** por definición.
    `graphics/icons/runtime/factory/` — (1) `createIcon`: envuelve cualquier SVG
    compatible con los defaults DS (tamaño md, currentColor, stroke por token,
    clase `rottay-icon`, aria-hidden).
      `.../factory/phosphor-compat/` — (1) adaptador interno que normaliza un glifo
      SSR de Phosphor al contrato `DSIconComponent`. Deliberadamente fuera de todo
      barrel público.
        `.../factory/phosphor-compat/tests/` — (1) su test.
      `.../factory/tests/` — (1) test de `createIcon`.
    `graphics/icons/runtime/semantic/` — (0) agrupador.
      `.../semantic/create-icon/` — (1) `createSemanticIcon`: la factory que produce
      cada uno de los 282 componentes de rol.
        `.../semantic/create-icon/tests/` — (1) su test.
      `.../semantic/generated/` — (0) agrupador de lo generado del runtime.
        `.../semantic/generated/phosphor-adapter/` — (1) `GENERATED_PHOSPHOR_PROVENANCE`
        con el fingerprint sha256 del manifiesto. Generado.

##### graphics/motion/ (total=65)

`graphics/motion/` — (1) sistema de movimiento. Su `index.ts` es el barrel público
de primitivas + efectos + hooks, y es **lo único de `graphics/` re-exportado por
`src/index.ts`** (línea 328: `export * from './graphics/motion'`).
  `graphics/motion/foundation/` — (1) capa base sin React, sólo tipos y helpers.
    `graphics/motion/foundation/contracts/` — (1) props de todos los componentes de
    movimiento, en tres categorías: entradas, efectos interactivos y decorativos.
    `graphics/motion/foundation/particles/` — (0) agrupador del campo de partículas.
      `.../particles/config/` — (1) límites duros del runtime de partículas
      (1 contexto canvas activo, 1200 partículas, DPR max 2) y resolución de color CSS.
        `.../particles/config/tests/` — (1) su test.
          `.../particles/config/tests/support/` — (1) soporte del test.
      `.../particles/eligibility/` — (1) decide si la política de movimiento del
      tenant permite ambient motion / loops continuos.
        `.../particles/eligibility/tests/` — (1) su test.
    `graphics/motion/foundation/timing/` — (1) helpers canónicos de tiempo; convierte
    el formato histórico en segundos al canónico en ms durante una minor.
      `.../timing/tests/` — (1) su test.
    `graphics/motion/foundation/transform/` — (1) compone el transform que genera
    Motion con un transform CSS del llamador sin pisarse. Consumido por fade-in,
    slide-in, scale-in y stagger-children.
  `graphics/motion/react/` — (1) todo lo que depende de React.
    `graphics/motion/react/presentation/` — (0) componentes.
      `.../presentation/effects/` — (1) barrel de efectos decorativos.
        `.../effects/aurora/` — (1) 2-4 manchas de color muy desenfocadas que derivan
        (aurora boreal ambiental).
        `.../effects/glass-card/` — (1) contenedor glassmorphism (backdrop-blur +
        fondo translúcido), themable por `--ds-glass-*`.
        `.../effects/glow-effect/` — (1) box-shadow pulsante alrededor del contenido.
        `.../effects/gradient-background/` — (1) gradiente lineal que panea via
        `background-position`.
        `.../effects/grid-pattern/` — (1) grilla de puntos SVG teselada como fondo.
        `.../effects/noise-texture/` — (1) grano de película procedural con
        `feTurbulence`, sin assets de imagen.
        `.../effects/particles/` — (1) `ParticleField`: frontera pública ligera que
        sólo carga el canvas cuando la política y el viewport lo permiten.
          `.../particles/runtime/` — (1) barrel del runtime interno.
            `.../particles/runtime/canvas/` — (1) la implementación canvas real, con
            presupuesto global y una sola RAF lease.
              `.../runtime/canvas/governance/` — (0) agrupador.
                `.../canvas/governance/animation-lease/` — (1) adquiere/libera la lease
                única del gobernador de gráficos continuos.
              `.../runtime/canvas/tests/` — (1) su test.
            `.../particles/runtime/foundation/` — (0) agrupador.
              `.../runtime/foundation/visibility/` — (1) gate de viewport propio, que no
              asume que `IntersectionObserver` exista.
            `.../particles/runtime/governance/` — (0) **CARPETA VACÍA**.
              `.../runtime/governance/animation-lease/` — (0) **CARPETA VACÍA**.
              **[DUPLICA]** con `runtime/canvas/governance/animation-lease/`, que sí
              tiene el archivo. Es la ruta vieja de la misma capacidad, dejada sin
              borrar tras la relocalización. **[SIN CONSUMIDOR]**.
          `.../effects/particles/tests/` — (1) su test.
        `.../effects/shimmer-text/` — (1) barrido de luz sobre texto con
        `background-clip: text`.
        `.../effects/spotlight/` — (1) gradiente radial que sigue al cursor.
      `.../presentation/primitives/` — (1) barrel de primitivas de transición.
        `.../primitives/count-up/` — (1) anima un número hasta su valor final; el
        output sin JS siempre es el valor final.
          `.../count-up/tests/` — (1) su test.
        `.../primitives/fade-in/` — (1) opacidad + desplazamiento opcional.
        `.../primitives/magnetic/` — (1) el contenido se atrae al cursor con física
        de resorte.
        `.../primitives/morph/` — (1) barrel de la familia Morph. **Reexporta
        `CopyToCheck` y `HamburgerToX` desde `graphics/icons/presentation/catalog/
        animated/`**, es decir movimiento importando de iconos: el dueño físico está
        en el árbol de iconos y la familia lógica en motion.
          `.../morph/transition/` — (1) el `Morph` genérico (layout/layoutId de Motion).
        `.../primitives/parallax/` — (1) translateY mapeado al progreso de scroll.
        `.../primitives/presence/` — (1) `Presence`: render-prop que mantiene montado
        el nodo hasta que su transición de salida CSS termina.
          `.../presence/tests/` — (1) su test.
        `.../primitives/scale-in/` — (1) entrada por escala + fade.
        `.../primitives/scroll-reveal/` — (1) reveal disparado por viewport con
        control de `threshold`/`rootMargin`.
        `.../primitives/slide-in/` — (1) como fade-in pero con recorrido mínimo de 24px.
        `.../primitives/stagger-children/` — (1) escalona la entrada de una lista.
        `.../primitives/text-reveal/` — (1) parte el texto en caracteres/palabras/
        líneas y las escalona (tipografía cinética).
    `graphics/motion/react/runtime/` — (1) barrel público de hooks de movimiento.
      `.../runtime/flip-layout/` — (1) `useFlipLayout`: FLIP transform-only vía Web
      Animations API, nunca toca una propiedad de layout.
        `.../flip-layout/tests/` — (1) su test.
      `.../runtime/foundation/` — (0) agrupador.
        `.../runtime/foundation/reduced-motion/` — (1) `useReducedMotion`, lee la única
        autoridad de motion del runtime.
      `.../runtime/in-view/` — (1) `useInView`, wrapper de IntersectionObserver.
      `.../runtime/motion-personality/` — (1) resuelve defaults de movimiento desde
      los tokens activos respetando reduced-motion.
      `.../runtime/mouse-position/` — (1) `useMousePosition` relativo a un elemento.
      `.../runtime/presence/` — (1) `usePresence`: contrato `data-state="open|closed"`;
      el CSS es dueño del visual, el hook sólo de cuándo React deja de renderizar.
        `.../presence/duration/` — (1) lee la ventana de salida del *computed style*,
        nunca de una constante JS.
          `.../presence/duration/tests/` — (1) su test.
            `.../duration/tests/fixtures/` — (1) fixture del test.
        `.../presence/tests/` — (1) su test.
      `.../runtime/reveal/` — (1) `useReveal`: autoridad única de entrada para las
      superficies monocromas — colapsa a instantáneo bajo reduced-motion y prohíbe
      loops.
        `.../reveal/tests/` — (1) su test.
      `.../runtime/scroll-progress/` — (1) `useScrollProgress`, valor 0..1.
      `.../runtime/smooth-counter/` — (1) `useSmoothCounter`, más liviano que `CountUp`.
        **[DUPLICA parcial]** con `presentation/primitives/count-up/`: mismo trabajo
        (animar un número), uno como hook con ease-out cuártico y el otro como
        componente con resorte. La diferencia está documentada a propósito.
      `.../runtime/tests/` — (1) `AnimationHooks.test.tsx`.
      `.../runtime/view-transition/` — (1) wrapper de la View Transitions API nativa.
        `.../view-transition/tests/` — (2) sus tests.
    `graphics/motion/react/tests/` — (2) `AnimationCatalog.test.tsx` y
    `MotionPrimitiveTiming.test.tsx`.

##### graphics/pictograms/ (total=7)

`graphics/pictograms/` — (1) ilustraciones explicativas grandes (no iconos):
`FeaturePictogram` con 8 nombres fijos (ai-assistant, analytics-insight,
candidate-evidence, empty-search, event-moment, secure-access,
team-collaboration, workflow-automation).
  `graphics/pictograms/foundation/` — (0) agrupador.
    `graphics/pictograms/foundation/catalog/` — (1) el corpus cerrado de 8 nombres,
    tipos de props y type-guards.
  `graphics/pictograms/presentation/` — (0) agrupador.
    `graphics/pictograms/presentation/feature-pictogram/` — (1) el componente;
    consulta el control de gobierno de activos gráficos antes de dibujar.
      `.../feature-pictogram/artwork/` — (1) el SVG a mano de cada uno de los 8.
  `graphics/pictograms/runtime/` — (0) agrupador.
    `graphics/pictograms/runtime/provenance/` — (1) procedencia por pictograma
    (arte propio).
    `graphics/pictograms/runtime/resolution/` — (1) resuelve tamaño (sm/md/lg/xl →
    32/48/64/96) y tono (brand/neutral/success/warning/danger).
  `graphics/pictograms/tests/` — (1) `FeaturePictogram.test.tsx`.

---

#### packages/core/src/entrypoints/

`entrypoints/` — (0, total=100) **no es una capa de arquitectura**: es la frontera
del paquete npm. Cada carpeta con `index.ts` es exactamente un subpath público de
`packages/core/package.json` → `exports`. Ningún archivo aquí tiene lógica: todos
son re-exports.

Cómo se construyen: los subpaths raíz (`./charts`, `./icons`, `./marks`, ...) están
listados a mano en `vite.config.ts` (líneas 54-79); los 77 subpaths de
`entrypoints/public/**` se generan desde `public-entrypoints.manifest.json`
(77 entries, exactamente los 77 archivos que hay bajo `entrypoints/public/`).
**Todos los subpaths listados abajo están efectivamente publicados** salvo donde
se indique.

##### entrypoints/charts/ (total=4)

`entrypoints/charts/` — (1) → subpath **`./charts`** (publicado, `dist/charts.js`).
Entrada del kernel de charts independiente de proveedor: `ChartFrame`,
`ChartImperativePlot`, `ChartMetricTrendView`.
  `entrypoints/charts/access/` — (1) → **`./charts/access`** (publicado,
  `dist/chart-access.js`). Compañero accesible de datos: `ChartDataAccess`,
  serialización CSV.
  `entrypoints/charts/renderers/` — (1) → **`./charts/renderers`** (publicado,
  `dist/chart-renderers.js`). Los renderers SVG/D3 (bar, heat-map, funnel, gauge...).
  `entrypoints/charts/spec/` — (1) → **`./charts/spec`** (publicado,
  `dist/chart-spec.js`). Contratos JSON server-safe: sin React, sin browser, sin D3.

##### entrypoints/eslint/ (total=1)

`entrypoints/eslint/` — (1) → **`./eslint`** (publicado, `dist/eslint.js`).
Reexporta el plugin de `tooling/eslint`. Node-only.

##### entrypoints/graphics/ (total=8)

`entrypoints/graphics/` — (0) agrupador; **no corresponde a ningún subpath** —
los subpaths caen un nivel más adentro y no llevan el prefijo `graphics/`.
  `entrypoints/graphics/effects/` — (1) → **`./effects`** (publicado). Kernel de
  gobierno de efectos expresivos, sin React (viene de `infrastructure/runtime/effects`).
  `entrypoints/graphics/marks/` — (1) → **`./marks`** (publicado). Reexporta entero
  `graphics/brand-marks`.
    `entrypoints/graphics/marks/brand/` — (1) → **`./marks/brand`** (publicado).
    Sólo marcas de empresa/producto. **[DUPLICA parcial]** con `./marks`: es el
    subconjunto acotado del mismo dueño, a propósito, para tree-shaking.
    `entrypoints/graphics/marks/cloud/` — (1) → **`./marks/cloud`** (publicado).
    Sólo marcas de servicios cloud. Misma relación de subconjunto.
  `entrypoints/graphics/motion/` — (1) → **`./motion`** (publicado). Ojo: **no**
  exporta `graphics/motion` (las primitivas), sino la *política* de movimiento
  desde `infrastructure/runtime/motion` (`MotionProvider`, `useMotionPolicy`,
  `resolveMotionRecipe`, `MOTION_DIAL_BOUNDS`). Las primitivas salen por la raíz `.`.
  `entrypoints/graphics/pictograms/` — (1) → **`./pictograms`** (publicado).
  Reexporta `graphics/pictograms` + el control de gobierno de activos gráficos.
  `entrypoints/graphics/spatial/` — (1) → **`./spatial`** (publicado). Host de ciclo
  de vida 3D opcional (`SpatialExperience`); el scene graph y Three quedan en el app.
    `entrypoints/graphics/spatial/spec/` — (1) → **`./spatial/spec`** (publicado).
    Política y contrato de módulo de escena server-safe, sin React/Three/R3F.

##### entrypoints/icons/ (total=9)

`entrypoints/icons/` — (1) → **`./icons`** (publicado, `dist/icons.js`). Exporta la
fachada `Icon` + **todo el catálogo histórico** (`export * from '../../graphics/icons'`).
  `entrypoints/icons/full/` — (1) → **`./icons/full`** (publicado). **[DUPLICA]** con
  `./icons`: exporta el mismo `Icon`, el mismo `ICON_CORPUS`/`ICON_NAMES`/`isIconName`,
  la misma `ICON_PROVENANCE` y los mismos tipos. La diferencia real es que `./icons`
  además arrastra el catálogo legacy y `./icons/full` además expone el control de
  activos gráficos.
  `entrypoints/icons/corpus/` — (1) → **`./icons/corpus`** (publicado). Sólo
  metadatos: nombres y semántica sin cargar proveedor ni React. Para tooling y editores.
  `entrypoints/icons/foundation/` — (1) → **`./icons/foundation`** (publicado). Pack
  semántico base (`FoundationIcon` + named imports).
  `entrypoints/icons/bithire/` — (1) → **`./icons/bithire`** (publicado). Pack
  vertical de reclutamiento, separado para que otros productos no lo paguen.
  `entrypoints/icons/identity/` — (1) → **`./icons/identity`** (publicado). Identidad,
  seguridad, acceso, compliance, privacidad.
  `entrypoints/icons/intelligence/` — (1) → **`./icons/intelligence`** (publicado).
  Analytics, datos, IA.
  `entrypoints/icons/operations/` — (1) → **`./icons/operations`** (publicado).
  Billing, comercio, workflow, operaciones.
  `entrypoints/icons/presets/` — (0) agrupador; **no es un subpath por sí mismo**.
    `entrypoints/icons/presets/bithire/` — (1) → **`./icons/presets/bithire`**
    (publicado). `BitHireIconPreset`, alias síncrono de `Icon` con sólo los roles
    que BitHire usa. Su comentario menciona "263 roles" mientras el corpus actual
    tiene 282 — la cifra del comentario está desactualizada.

  Nota: el mapa de `exports` también declara **`./icons/roles/*`** (wildcard hacia
  `dist/graphics/icons/presentation/semantic/generated/roles/*`). Ese subpath **no
  pasa por `entrypoints/`**: apunta directo al árbol generado de `graphics/`.

##### entrypoints/public/ (total=77)

`entrypoints/public/` — (0) los 77 subpaths granulares del paquete, uno por
archivo, cada uno generado/validado contra `public-entrypoints.manifest.json`
(que además fija presupuestos: `maxDirectSources`, `maxReachableModules`,
`maxSourceBytes`). Casi todos son una sola línea `export { X } from "../../ui/..."`.

  `entrypoints/public/contracts/` — (0) los 7 subpaths de sólo-tipos.
    `.../contracts/foundation/` — (1) → **`./contracts/foundation`** (publicado).
    `TenantConfig`, `TenantPlan`, `Tone`, `ProductProfileKey`, `VerticalManifest`.
    `.../contracts/i18n/` — (1) → **`./contracts/i18n`**. `SupportedLocale`, `TextDirection`.
    `.../contracts/patterns/` — (1) → **`./contracts/patterns`**. `ColumnDef`,
    `FilterDef`, `SortConfig`, `SavedView`, `DensityKey`...
    `.../contracts/primitives/` — (1) → **`./contracts/primitives`**. `ButtonVariant`,
    `BadgeVariant`, `AvatarSize`, `TooltipPlacement`...
    `.../contracts/runtime/` — (1) → **`./contracts/runtime`**. `RootAttributeSetClaim`,
    `VisualAuthorityDeclaration`.
    `.../contracts/structures/` — (1) → **`./contracts/structures`**. `DashboardAction`,
    `DashboardMetric`.
    `.../contracts/surfaces/` — (1) → **`./contracts/surfaces`**. `AdaptiveConfig`,
    `EntityAdapter`, `SurfacePermissionsConfig`, `CollectionWorkspaceProps`.

  `entrypoints/public/patterns/` — (0) 13 subpaths de patterns, todos publicados,
  todos `"use client"` + una línea:
    `adaptive-overlay/`, `charts/`, `command-palette/`, `data-table/`, `empty-state/`,
    `feature-workspace-frame/`, `kanban-board/`, `list-toolbar/`, `presence/`,
    `record-facts/`, `shortcuts-overlay/`, `stats-grid/`, `widget-board/` — (1 archivo
    cada una). `charts/` es el único con comentario largo: nombra al dueño
    `families` una sola vez en lugar de 18 re-exports, para que el set de familias
    sea un hecho único.
    `entrypoints/public/patterns/contracts/` — (0) **CARPETA VACÍA**. No hay subpath
    `./patterns/contracts`. **[SIN CONSUMIDOR]**.
    `entrypoints/public/patterns/runtime/` — (0) **CARPETA VACÍA**. Idem.

  `entrypoints/public/primitives/` — (0) 39 subpaths de primitivas, **todos
  publicados**, cada uno un archivo de una línea:
    `alert/`, `avatar/`, `badge/`, `box/`, `breadcrumb/`, `button/`, `card/`,
    `checkbox/`, `date-picker/`, `divider/`, `dropdown/`, `empty/`, `flex/`,
    `float-button/`, `grid/`, `image/`, `input/`, `input-number/`, `message/`,
    `modal/`, `progress/`, `radio/`, `responsive/`, `segmented/`, `select/`,
    `skeleton/`, `slider/`, `spinner/`, `stack/`, `steps/`, `switch/`, `table/`,
    `tabs/`, `tag/`, `textarea/`, `toast/`, `toggle/`, `tooltip/`, `typography/`.
    Excepciones de forma: `toast/` exporta 5 símbolos (Toast, ToastContainer,
    ToastProvider, toast, useToast) y `typography/` exporta 3 (Heading, Link, Text).
    `entrypoints/public/primitives/contracts/` — (0) **CARPETA VACÍA**. **[SIN CONSUMIDOR]**.
    `entrypoints/public/primitives/runtime/` — (0) **CARPETA VACÍA**. **[SIN CONSUMIDOR]**.

  `entrypoints/public/runtime/` — (0) 11 subpaths de runtime, todos publicados:
    `.../runtime/cross-tab-sync/` — (1) → `./runtime/cross-tab-sync`. `useCrossTabSync`.
    `.../runtime/forms/` — (1) → `./runtime/forms`. `useUnsavedChangesGuard`.
    `.../runtime/i18n/` — (1) → `./runtime/i18n`. `I18nProvider`, `useLocale`,
    `LOCALE_CONFIGS`.
    `.../runtime/motion/` — (1) → `./runtime/motion`. **[DUPLICA parcial]** con la
    raíz `.`: exporta 6 símbolos (`GridPattern`, `NoiseTexture`, `CountUp`, `FadeIn`,
    `ScaleIn`, `useInView`) que ya salen por `export * from './graphics/motion'` en
    `src/index.ts`. Es un subconjunto acotado deliberado, no una segunda fuente.
    Además convive con `./motion` (política), que es cosa distinta con nombre parecido.
    `.../runtime/navigation/` — (1) → `./runtime/navigation`. `NavigationLinkProvider`.
    `.../runtime/provider/` — (1) → `./runtime/provider`. `DesignSystemProvider`.
    `.../runtime/responsive/` — (1) → `./runtime/responsive`. `useBreakpoints`,
    `useResponsive`, `useMediaQuery`.
    `.../runtime/root-attributes/` — (1) → `./runtime/root-attributes`. Sin
    `"use client"`: `claimRootAttribute`, `claimRootAttributeSet`.
    `.../runtime/tenant/` — (1) → `./runtime/tenant`. `useTenant`, `getKnownTenantConfig`.
    `.../runtime/tenant-theme/` — (1) → `./runtime/tenant-theme`. Sólo
    `TENANT_THEME_COMPILER_VERSION`. Es el subpath más chico del paquete.
    `.../runtime/visual-authority/` — (1) → `./runtime/visual-authority`.
    `resolveVisualAuthority`.

  `entrypoints/public/structures/` — (0) 5 subpaths, todos publicados:
    `action-dock/`, `app-shell/`, `column-menu/`, `dashboard-header/`,
    `record-summary/` — (1 cada una).
    `entrypoints/public/structures/contracts/` — (0) **CARPETA VACÍA**. **[SIN CONSUMIDOR]**.
    `entrypoints/public/structures/runtime/` — (0) **CARPETA VACÍA**. **[SIN CONSUMIDOR]**.

  `entrypoints/public/surfaces/` — (0) 2 subpaths, ambos publicados:
    `collection-workspace/` — (1) `CollectionWorkspaceSurface`.
    `oauth-transition/` — (1) `OAuthTransitionScreen` + 4 helpers de config.
    `entrypoints/public/surfaces/contracts/` — (0) **CARPETA VACÍA**. **[SIN CONSUMIDOR]**.
    `entrypoints/public/surfaces/runtime/` — (0) **CARPETA VACÍA**. **[SIN CONSUMIDOR]**.

##### entrypoints/server/ (total=1)

`entrypoints/server/` — (1) → **`./server`** (publicado, `dist/server.js`). Lo único
que corre en Node/Edge/middleware: resolución de tenant por request
(`resolveRequestTenant`, `createEdgeConfigDomainLookup`), registro de tenants
conocidos, `toSupportedLocale`, y el manifiesto de font packs para emitir
`<link rel="preload">` en SSR. Sin React, sin `"use client"`.

---

#### packages/core/src/tooling/

`tooling/` — (0, total=137) instrumentos de desarrollo, gobierno y medición. Casi
nada de esto se publica en el tarball; el único subpath público es `./eslint`
(vía `entrypoints/eslint`).

##### tooling/declarations/ (total=1)

`tooling/declarations/` — (0) agrupador de declaraciones TypeScript ambientales.
  `tooling/declarations/css/` — (1) `index.d.ts` con `declare module '*.css'`, para
  que los módulos UI puedan importar su hoja co-locada como side effect bajo
  `moduleResolution: "bundler"`. Consumido por `tsconfig.tests.json` y por
  `scripts/structure/core-structure-audit/index.mjs`.

##### tooling/eslint/ (total=12)

`tooling/eslint/` — (1) el plugin de gobierno del DS. Barrel que reexporta
`configs`, `plugin`, `rules`.
  `tooling/eslint/foundation/` — (0) agrupador.
    `tooling/eslint/foundation/contracts/` — (1) tipos mínimos de la Rule API de
    ESLint escritos a mano, para no depender de `@typescript-eslint/utils`.
  `tooling/eslint/public/` — (0) agrupador.
    `tooling/eslint/public/plugin/` — (1) arma el objeto plugin y los presets
    (`configs.recommended`) que consumen los apps por flat config.
  `tooling/eslint/runtime/` — (0) agrupador.
    `tooling/eslint/runtime/rules/` — (1) barrel de las 6 reglas.
      `.../rules/no-db-in-components/` — (1) prohíbe importar drizzle-orm / clientes
      de DB / esquemas desde archivos de componentes o con `"use client"`.
      `.../rules/no-direct-lucide/` — (1) prohíbe `lucide-react` en runtime; los
      type-only imports y el catálogo de compatibilidad del DS están exentos.
        `.../no-direct-lucide/tests/` — (1) su test.
      `.../rules/no-hardcoded-colors/` — (1) detecta colores literales en props
      `style`, objetos de estilo y clases de color de Tailwind.
      `.../rules/no-motion-literals/` — (1) prohíbe `cubic-bezier(...)` y duraciones
      sub-segundo crudas **sólo en archivos `**/engines/modern*`**; classic y rustic
      quedan fuera a propósito.
      `.../rules/no-raw-html/` — (1) prohíbe elementos HTML crudos cuando existe una
      primitiva DS (div→Box, span→Text, button→Button...).
      `.../rules/no-size-type-outside-classic/` — (1) restringe el `SizeType`
      deprecado a rutas `engines/classic/`, el único puente con el vocabulario de
      tamaños de Ant Design.
        `.../no-size-type-outside-classic/tests/` — (1) su test.

##### tooling/examples/ (total=1)

`tooling/examples/` — (0) agrupador.
  `tooling/examples/i18n/` — (1) `index.tsx` con ejemplos ejecutables del subsistema
  i18n (setup, namespaces, interpolación, cambio de locale, formateo Intl).
  Documentación viva, explícitamente fuera del bundle de producción.
  **[SIN CONSUMIDOR] de código**: nadie lo importa; sólo aparece nombrado en
  `scripts/pack-inventory.baseline.json` (para excluirlo del tarball) y en
  `scripts/.../manifest/fanout-facts.test.mjs`.

##### tooling/lane-control/ (total=30)

`tooling/lane-control/` — (2: `index.mjs` + `README.md`) maquinaria del coordinador
para correr muchos agentes escritores en paralelo sobre un mismo árbol. Su razón de
ser textual: `writeRoot` existía en un JSON y en ningún ejecutable, o sea "carriles
provablemente disjuntos" era prosa. Expone 4 comandos.
  `tooling/lane-control/composition/` — (0) agrupador.
    `tooling/lane-control/composition/plan/` — (1) carga y resuelve el *lane plan*:
    la declaración de quién puede escribir dónde en un batch. Resolución en 3 capas;
    un carril sin fila y sin `writeRoot` explícito se rechaza.
      `.../plan/examples/` — (1) `plan.example.json`.
  `tooling/lane-control/foundation/` — (0) agrupador.
    `.../foundation/git/` — (1) la superficie git permitida, toda de sólo lectura y
    sin build. Captura exit codes directo (nunca por pipe) e incluye archivos
    untracked en el universo.
    `.../foundation/glob/` — (1) **no es una librería de globs**: reduce cada patrón
    a un TERRITORIO y los intersecta simbólicamente, devolviendo un path testigo.
    `.../foundation/report/` — (1) vocabulario único de exit codes: 0 limpio,
    1 encontró algo, 2 no pudo correr.
  `tooling/lane-control/integration/` — (0) agrupador.
    `.../integration/tests/` — (0) agrupador de drills.
      `.../tests/drills/` — (1) barrel de los ejercicios contra respuestas conocidas.
        `.../drills/containment/` — (1), `.../drills/intersection/` — (1),
        `.../drills/program-state/` — (1), `.../drills/tenant-reachability/` — (1),
        `.../drills/work-order/` — (1): un drill por comando.
      `.../tests/harness/` — (1) el arnés compartido de los drills.
  `tooling/lane-control/public/` — (0) los 4+1 comandos.
    `.../public/write-set-intersection/` — (1) DELIVERABLE 1: ¿pueden colisionar
    estos carriles? (antes del trabajo). 5 reglas computadas.
    `.../public/containment/` — (1) DELIVERABLE 2: ¿este carril se quedó adentro?
    (después del trabajo). Trata un rename como dos rutas.
    `.../public/work-order/` — (3: index.mjs, schema.json, synthetic-rows.json)
    DELIVERABLE 3: valida la orden de trabajo delegable contra la ley del README,
    no contra una copia parafraseada.
      `.../work-order/examples/` — (1) ejemplo.
    `.../public/program-state/` — (2: index.mjs + `state.intent.example.json`)
    DELIVERABLE 4: renderiza el checkpoint del README desde un intent + derivación,
    en vez de dejarlo como edición a mano.
    `.../public/tenant-reachability/` — (3: index.mjs, `accepted-constants.json`,
    `baseline.json`) el "trinquete converso": todo `--ds-*` que un artefacto vertical
    declare como literal resuelto, por encima de un piso de lecturas, debe ser
    alcanzable desde el documento del tenant o ser una constante aceptada por escrito.
  `tooling/lane-control/runtime/` — (0) agrupador de los lectores.
    `.../runtime/artifact-literals/` — (1) el lado "ES": qué declaran realmente los
    3 artefactos verticales compilados, y si cada declaración es fórmula (`var(`) o
    literal resuelto (pintura congelada).
    `.../runtime/ds-reads/` — (1) conteos de lectura internos de `--ds-*`. Todos son
    **pisos**, porque los 3 apps viven en otros repos y las lecturas interpoladas
    (`var(--ds-${role}-bg)`) son invisibles a un scan de texto.
    `.../runtime/ownership-rows/` — (1) una fila por familia, derivada de
    `family-inventory.json`; el `writeRoot` de una familia **es** su `sourceOwner`.
    `.../runtime/shared-files/` — (1) el conjunto de un-solo-dueño: archivos que a lo
    sumo un carril puede escribir (tema default, capa CSS base, registro de
    capacidades de tenant, fuentes TS de tokens, capa de tokens de componente, skin
    del modern engine).
    `.../runtime/tenant-reach/` — (1) el lado "DEBE SER": todo `--ds-*` que un tenant
    puede alcanzar por alguna de las tres rutas.

  **[SIN CONSUMIDOR] desde `package.json`**: ninguno de los scripts npm del paquete
  invoca `lane-control`. Se referencia desde `scripts/structure/core-structure-audit/index.test.mjs`,
  `scripts/lib/owner-nesting.mjs` y la documentación del programa modern-rescue; se
  corre a mano.

##### tooling/quality/ (total=8)

`tooling/quality/` — (0) agrupador de auditorías de calidad basadas en el bundle
compilado.
  `tooling/quality/no-loss/` — (1) resolvedor de cadenas `var()` sobre los bundles
  **shipped** (`styles/*.css`), para probar una migración de token en vez de
  argumentarla. Existe porque leer el source hizo perder que
  `--ds-input-md-height` es 40px en tres verticales y 36px en bithire.
  Consumido por `scripts/tokens-catalog.mjs` y tests de tokens.
    `.../no-loss/tests/` — (2) `no-loss-harness.test.ts` y
    `rhythm-adoption-census.test.ts`.
      `.../no-loss/tests/fixtures/` — (1) fixture.
  `tooling/quality/touch-target/` — (2: `index.ts` + `adjudications.json`) autoridad
  **única** de tamaño mínimo de área táctil. El censo por-ARCHIVO anterior fue
  retirado (una exención absolvía el archivo entero, incluidos controles agregados
  años después).
    `.../touch-target/discovery/` — (1) el único mecanismo: descubre interactividad
    por SELECTOR (PostCSS real, nunca regex) y por elemento JSX.
    `.../touch-target/tests/` — (1) su test.
  Consumido por el manifiesto de familias de modern-rescue.

##### tooling/resolution-probe/ (total=29)

`tooling/resolution-probe/` — (2: `index.mjs` + `README.md`) el instrumento que
mide **resolución**, no alcanzabilidad: qué pinta realmente el navegador. Fixtures
HTML estáticos + el CSS shipped + Chromium headless leyendo `getComputedStyle`.
Sin app, sin dev server, sin puerto.
  `tooling/resolution-probe/composition/` — (0) agrupador.
    `.../composition/diff/` — (1) compara dos artefactos; primero computa las
    diferencias de PROCEDENCIA y marca `comparable: false` si las hay.
    `.../composition/receipt/` — (1) recibos ligados al source (bytes del artefacto +
    digest del árbol). No valida: delega en el único validador que ya existe.
      `.../receipt/tests/` — (1) su test.
    `.../composition/run/` — (1) una corrida: bundles × scopes × fixtures → un
    artefacto difeable. Todo lo que podría hacer diferir dos árboles idénticos está
    fijado (viewport, color-scheme, reduced-motion, orden) o registrado.
      `.../run/tests/` — (1) su test.
  `tooling/resolution-probe/foundation/` — (0) agrupador.
    `.../foundation/causality/` — (1) tres fases `baseline → mutation → removal` con
    comparador de restauración **exacto** (13.6px vs 13.5999px es un hallazgo).
      `.../causality/tests/` — (1) su test.
    `.../foundation/guards/` — (2: index.mjs + `initial-values.json`) guardas que
    fallan-cerrado: "no se midió nada" produce output indistinguible del hallazgo
    más valioso ("el control no llega a nada"), así que ninguna advierte, todas
    fallan la corrida.
      `.../guards/tests/` — (1) su test.
    `.../foundation/negative-controls/` — (2: index.mjs + `vocabulary.json`) qué
    propiedades un control tiene PROHIBIDO mover. La lista se lee del manifiesto del
    programa, nunca de este archivo.
      `.../negative-controls/tests/` — (1) su test.
    `.../foundation/paths/` — (1) dónde está el arnés en disco, resuelto una sola vez.
    `.../foundation/roster/` — (3: index.mjs, `index.d.mts`, `fixtures.json`) el
    roster de fixtures; cada uno declara `requiresSelectors` y se valida contra el
    CSS, porque un fixture que dejó de matchear igual produce lecturas y la corrida
    parece verde.
      `.../roster/tests/` — (1) su test.
    `.../foundation/scope/` — (1) el vocabulario de atributos que un elemento debe
    llevar; derivado de la misma proyección que usan los apps
    (`resolveDocumentRootAttributes`), restatado porque el arnés corre sin build.
  `tooling/resolution-probe/public/` — (0) agrupador.
    `.../public/cli/` — (1) los tres comandos: `run`, `dial`, `diff`. `dial` sale
    con código distinto de cero si sus propios controles no se movieron.
    `.../public/drills/` — (1) el instrumento medido contra respuestas conocidas
    (movement, canary...).
      `.../drills/tests/` — (1) su test.
  `tooling/resolution-probe/runtime/` — (0) agrupador.
    `.../runtime/browser/` — (1) consigue Chromium sin agregar dependencia
    (resuelve el `@playwright/test` que ya tiene el showroom) y registra cuál binario
    respondió.
    `.../runtime/bundle/` — (1) decide qué CSS es autoritativo. Por defecto `fresh`:
    recompone el bundle en memoria desde `src/foundation/tokens/css/**`, porque
    `dist/*.css` está stale y un dist stale más un artefacto stale se dan la razón
    entre sí.
    `.../runtime/ingress/` — (1) los dos brazos de ingreso del tenant sobre UNA misma
    escena: `BrandTheme` estático (bloque sin capa) vs `TenantTheme` de DB (estilo
    inline en el documentElement). Son dos posiciones distintas de la cascada.
      `.../ingress/tests/` — (1) su test.
    `.../runtime/measure/` — (1) la medición: montar, leer, y para un `dial` leer de
    nuevo tras escribir la propiedad inline (la posición de máxima prioridad).

  **[SIN CONSUMIDOR] desde `package.json`**: igual que lane-control, ningún script
  npm lo invoca; se referencia desde `scripts/structure/core-structure-audit/index.mjs` y desde el
  manifiesto de modern-rescue.

##### tooling/testing/ (total=56)

`tooling/testing/` — (1) barrel interno de utilidades de test. **No hay subpath
`@rottay/design-system/testing`**: es sólo para las suites del propio repo.
Referenciado por 285 archivos de `src/` y `scripts/`.
  `tooling/testing/a11y/` — (1) dos niveles de chequeo de accesibilidad:
  `checkAccessibility` (validación ARIA sin dependencias) y
  `checkAccessibilityWithAxe` (axe-core, requiere devDependency en el consumidor).
  `tooling/testing/fixtures/` — (0) agrupador de datos de prueba.
    `.../fixtures/brand-themes/` — (0) agrupador de tenants de prueba.
      `.../brand-themes/divergence-sober/` — (1) fixture de prueba "sober": identidad
      técnica (grotesk/humanist, azul acero, cards con marco, sidebar de rail de
      iconos, densidad compacta). Nunca es un tenant de producto.
      `.../brand-themes/divergence-editorial/` — (1) su contraparte "editorial"
      (Fraunces/Newsreader, paleta ciruela, cards con subrayado, densidad amplia).
      El piso de píxeles cross-tenant se mide entre estos dos.
      `.../brand-themes/themanagementmiami/` — (1) fixture de migración/regresión de
      un tenant real; explícitamente fuera de `KNOWN_TENANTS` y de todo bundle.
      `.../brand-themes/torture/` — (1) dos BrandTheme hostiles: cada canal themable
      empujado lejos de rottay y bithire, para que cualquier componente que ignore
      el tema activo sea mecánicamente detectable.
    `.../fixtures/tenants/` — (4: index.ts + `default.css`, `rottay.css`,
    `bithire.css`) CSS de tenant como strings crudos para inyectar en tests.
      `.../tenants/quality-evidence/` — (2) los tres tenants tortura DS-Q001, que
      representan productos distintos y no swaps de paleta.
        `.../quality-evidence/tests/` — (1) su test.
      `.../tenants/tests/` — (1) su test.
  `tooling/testing/helpers/` — (1) barrel de helpers.
    `.../helpers/browser/` — (0) agrupador.
      `.../helpers/browser/match-media/` — (1) mock configurable de `matchMedia` que
      evalúa min-width/max-width, prefers-reduced-motion y la heurística táctil.
    `.../helpers/engine/` — (1) `renderWithEngine`, `renderWithAllEngines`,
    `describeEachEngine`, `STABLE_ENGINES` (excluye el experimental `custom`).
      `.../engine/mock-factory/` — (1) mock compartido de la factory de engines, para
      que cada test no duplique el `vi.mock()`.
      `.../engine/tenant/` — (1) helpers multi-tenant. Su cabecera documenta que los
      fixtures son **clientes sintéticos**: usar `rottay`/`bithire` hacía que
      `TenantProvider` lanzara `ReservedTenantIdentityError` antes de renderizar.
        `.../engine/tenant/css/` — (1) utilidades para leer variables CSS y estilos
        computados en test.
          `.../tenant/css/tests/` — (1) su test.
        `.../engine/tenant/tests/` — (1) su test.
      `.../engine/tests/` — (1) su test.
    `.../helpers/skin-reachability/` — (1) arnés que pregunta si un selector
    autorizado matchea un nodo que la familia realmente renderiza (p.ej. una regla
    que depende de un `data-part` que el componente no estampa).
  `tooling/testing/integration/` — (0) tests que cruzan varios dueños.
    `.../integration/capability-propagation/tests/` — (1) propagación de capacidades.
    `.../integration/fixture-visual-authority/tests/` — (1) autoridad visual de fixtures.
    `.../integration/graphics/asset-facades/tests/` — (1) fachadas de activos gráficos
    (marks/pictograms/icons).
    `.../integration/i18n/tests/` — (1) i18n.
    `.../integration/monochrome/` — (0) agrupador de la ley de superficies monocromas.
      `.../monochrome/bidi-determinism/tests/` — (1) determinismo bidireccional.
      `.../monochrome/cohort/tests/` — (1) cohorte.
      `.../monochrome/content-anatomy/tests/` — (1) anatomía de contenido.
      `.../monochrome/framing-anatomy/tests/` — (1) anatomía de encuadre.
      `.../monochrome/namespace/tests/` — (1) namespace.
      `.../monochrome/visual-remediation/tests/` — (1) remediación visual.
    `.../integration/theming-precedence/tests/` — (1) precedencia de theming.
  `tooling/testing/setup/` — (1) setup global de Vitest: extiende `expect`, timeout
  de 30s para engines lazy, polyfills de ResizeObserver / IntersectionObserver /
  matchMedia / Canvas, y limpieza de data-attributes entre tests. Referenciado por
  `vitest.config.ts`.
  `tooling/testing/system/` — (0) agrupador.
    `.../system/tests/` — (18) los tests de sistema del paquete: `engines.test.ts`,
    `theming.test.ts`, `tenant.test.ts`, `custom.test.ts`, `public-smoke.test.tsx`,
    `source-governance.test.ts`, `token-fidelity.test.ts`,
    `whitelabel-field-coverage.test.ts`, `premium-flagship-craft.contract.test.ts`,
    `engine-entrypoints.contract.test.ts`, smokes por tier, etc.
  `tooling/testing/tests/` — (2) `modern-bridge.contract.test.ts` y
  `public-api.contract.test.ts`: los contratos de la API pública.

---

### Resumen de hallazgos marcados

**[SIN CONSUMIDOR] verificado con `grep -ra`:**
- Los 13 iconos legacy no re-exportados (`CameraIcon`, `CheckIcon`, los 4
  `Chevron*`, `EyeIcon`, `EyeOffIcon`, `InfoIcon`, `SearchIcon`, `UserIcon`,
  `UsersIcon`, `XIcon`): 0 referencias cada uno en todo `src/`.
- `graphics/icons/runtime/adapters/` y `.../adapters/phosphor-ssr/`: vacías.
- `graphics/motion/react/presentation/effects/particles/runtime/governance/` y
  `.../governance/animation-lease/`: vacías.
- Las 8 carpetas vacías de `entrypoints/public/**/{contracts,runtime}`.
- `tooling/examples/i18n/`: nadie lo importa como código.
- `tooling/lane-control/` y `tooling/resolution-probe/`: ningún script npm del
  paquete los invoca.

**[DUPLICA]:**
- `graphics/icons/presentation/legacy/` vs `graphics/icons/presentation/catalog/`
  (13 de 15 iconos, documentado en el propio barrel).
- `.../particles/runtime/governance/animation-lease/` (vacía) vs
  `.../particles/runtime/canvas/governance/animation-lease/` (real).
- `entrypoints/icons/` (`./icons`) vs `entrypoints/icons/full/` (`./icons/full`):
  mismo `Icon`, mismo registro, misma procedencia, mismos tipos.
- `entrypoints/public/runtime/motion/` vs raíz `.`: 6 símbolos ya exportados por
  `src/index.ts`.
- Parciales deliberados (subconjuntos acotados, no defectos): `./marks/brand` y
  `./marks/cloud` frente a `./marks`; `useSmoothCounter` frente a `CountUp`;
  `foundation/semantic/presets/bithire` (input) frente a
  `presentation/semantic/generated/presets/bithire` (output).

**NO PUDE DETERMINAR:**
- Si las 8 carpetas vacías bajo `entrypoints/public/` son andamiaje planificado o
  residuo: no hay archivo, comentario ni entrada de manifiesto que lo diga.
- Si el comentario "263 roles" en `entrypoints/icons/presets/bithire/index.ts` es
  deuda de documentación o refiere a otro conteo; el corpus generado tiene 282
  archivos de rol y el preset declara `expectedCount: 104`.
## Mapa de `packages/core/` FUERA de `src/`

Repo: `/Users/daniel/Developer/Rottay/ui-design-system`
Fecha: 2026-08-18. Solo lectura; no se modificó nada del repo.
Excluidos por consigna: `dist/`, `node_modules/`, `coverage/`, `coverage-final/`,
`storybook-static/`, `test-artifacts/`.

Convenciones:

- `[DUPLICA]` = dos cosas hacen el mismo trabajo; se dice cuál es la otra.
- `[SIN CONSUMIDOR]` = nadie lo invoca (ni `ci-gates.manifest.mjs`, ni `package.json`,
  ni ningún glob de test, ni otro script por import/spawn).
- `[SOLO DRILL]` = el script de producción no está enchufado en ningún lado, pero su
  autotest hermano `*.test.mjs` sí corre por el glob `node --test scripts/*.test.mjs`.
  Es decir: se prueba el detector, nunca se ejecuta el detector.

---

### 0. Las cuatro vías de invocación que existen

Antes del árbol, porque todo lo demás se lee contra esto:

1. `scripts/ci-gates.manifest.mjs` — el inventario único de gates bloqueantes.
   `pnpm gates:ci` (`run-ci-gates.mjs`) lo recorre en orden, fail-fast. `pretest`
   y el job de CI lo llaman. Contiene 71 entradas.
2. `package.json` → 98 scripts npm, que referencian 62 rutas distintas de `scripts/`.
3. El glob de tests: `test:scripts` =
   `node --test scripts/quality-evidence/v2/*.test.mjs`
   `&& node --test scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs scripts/quality-evidence/programs/modern-rescue/manifest/generator.test.mjs`
   `&& node --test scripts/*.test.mjs` (NO recursivo)
   `&& node --test ../../scripts/effect-registry-audit.test.mjs`
   `&& vitest run --config scripts/vitest.scripts.config.ts` (patrón `scripts/**/*.vitest.test.ts`).
4. Import/spawn desde otro script (las librerías de `lib/` y algunos censos de raíz).

**Consecuencia medida:** el manifiesto de CI invoca `node scripts/X.mjs` DIRECTAMENTE
aunque `package.json` ya tenga un alias pnpm para ese mismo script. Hay al menos 11
alias que quedan sin usar por esa razón: `spacing-rhythm:check`, `channel-liveness:check`,
`size-axis:check`, `platform-identity:check`, `appboundary:check`, `wiring:check`,
`tokens:catalog:check`, `ownership:patterns:check`, `engine-audit:check`, `gat07:check`,
`parity:theme:check`. No es un bug, pero son dos inventarios de invocación en paralelo.

---

### 1. `packages/core/scripts/` — (632 archivos)

Reparto: 198 archivos sueltos en la raíz plana + `codemods/` (3) + `lib/` (30) +
`quality-evidence/` (401).

Los 198 de la raíz se descomponen en: **81 `.mjs` de producción**, **85 `.test.mjs`**,
**28 `.json`** (baselines/allowlists/registries/sellos), **1 `.md`**, **1 `.d.ts`**,
**1 `.config.ts`**, **1 `.vitest.test.ts`**.

#### 1.1 Las 9 familias funcionales de la raíz plana

Cada familia cubre los `.mjs` de producción. Los `.test.mjs` hermanos y los
`.json` de baseline pertenecen a la misma familia que su gate y no se re-listan
salvo cuando el hecho de que corran (o no) cambia el diagnóstico.

---

##### FAM-1 — Infraestructura del runner de gates — 3 miembros

Qué hace: define y ejecuta el inventario único de gates bloqueantes, y verifica
que los workflows de CI no apunten a scripts inexistentes.
Cómo se invoca: `package.json` (`gates:ci`, `wiring:check`) + `pretest` + CI.

- `scripts/ci-gates.manifest.mjs` — (363 líneas) el inventario; `blocking:false` obliga a
  declarar `excluded` con razón y dueño, así que "gate declarado que no puede bloquear"
  es irrepresentable.
- `scripts/run-ci-gates.mjs` — recorre el manifiesto en orden, fail-fast, e imprime cada exclusión.
- `scripts/workflow-script-wiring-gate.mjs` — primer gate del manifiesto: un workflow que
  referencia un script inexistente invalida todo lo de abajo.

---

##### FAM-2 — Fronteras arquitectónicas y propiedad del código — 14 miembros

Qué hace: hace ejecutables las leyes de `CLAUDE.md` sobre jerarquía de `src/`,
`folder/index.ts`, tiers primitives→patterns→structures→surfaces, subpaths públicos
y qué puede escribir una app consumidora.
Cómo se invoca: casi todos desde `ci-gates.manifest.mjs` (bloqueantes) y además con
alias en `package.json`.

- `application-boundary-gate.mjs` (+ `.test.mjs`, `.baseline.json`) — CI, bloqueante.
- `app-ds-boundary-gate.mjs` (+ `.test.mjs`, `.baseline.json`) — CI, bloqueante; alias `appboundary:check`.
- `app-ds-hook-contract-gate.mjs` (+ `.test.mjs`, `.baseline.json`) — CI (3 modos: `--check`,
  `--manifest-check`, `--manifest-write`); genera/valida `hooks-manifest.json` de la raíz del paquete.
- `app-root-writer-gate.mjs` (+ `.test.mjs`) — CI; qué app puede escribir `--ds-*` en su propia raíz.
- `structure/core-structure-audit/index.mjs` (+ `index.test.mjs`, `core-structure-audit.baseline.json`) — el ratchet decrease-only del árbol
  de `src/`; `structure:check`, `structure:report`, `lint:folders`.
- `structure/lint-folder-index/index.mjs` (+ `index.test.mjs`) — naming + `folder/index` + propiedad; `lint:folders`.
- `pattern-surface-ownership-gate.mjs` (+ `.test.mjs`, `.baseline.json`, `.allowlist.json`,
  `.README.md`) — CI; frontera patternvssurface.
- `taxonomy/taxonomy-parity-gate/index.mjs` (+ `index.test.mjs`) — CI; paridad entre taxonomía declarada e inventario real.
- `public-entrypoint-boundary-gate.mjs` (+ `.test.mjs`) — `public-entrypoints:check`.
- `cra-14-public-barrel-gate.mjs` — `cra14:check`. Sin autotest hermano.
- `portal-substrate-gate.mjs` (+ `.test.mjs`, `.allowlist.json`) — CI; un solo substrato de portal.
- `structure/import-binding-integrity-gate/index.mjs` (+ `index.test.mjs`) — CI, primero de la lista: import nombrado
  de un binding que el módulo destino nunca publica.
- `platform-identity-zero-gate.mjs` (+ `.test.mjs`) — CI; `platform` ya no es un vertical, cero residuos.
- `verticals/first-party-single-author-gate/index.mjs` (+ `index.test.mjs`) — CI; un solo autor por artefacto first-party.

---

##### FAM-3 — Canales de tenant, tokens y superficie de customización — 12 miembros

Qué hace: mide y ratchea la distancia entre un dial del tenant y el píxel: canales
declarados vs emitidos vs leídos, literales pinchados, prototokens, catálogos.
Cómo se invoca: mayormente `ci-gates.manifest.mjs`; tres no llegan a CI.

- `theme-channel-parity-gate.mjs` (+ `.test.mjs`, `.baseline.json`) — CI. **[DUPLICA parcial]**
  tiene DOS alias idénticos en `package.json`: `parity:theme:check` y `theme-parity:check`,
  mismo comando byte a byte.
- `tenant-channel-consumer-gate.mjs` (+ `.test.mjs`, `.baseline.json`, `.modern.baseline.json`) —
  CI en dos modos (`--check`, `--modern-check`); el ratchet de canal muerto.
- `channel-liveness-gate.mjs` (+ `.test.mjs`) — CI; productor canónico de `channel-liveness.json`.
- `channel-wiring-zero-delta-gate.mjs` (+ `.test.mjs`) — **[SOLO DRILL]** prueba que un canal
  recién cableado es zero-delta cuando está sin setear. Ni CI ni `package.json`.
- `literal-ownership-gate.mjs` (+ `.test.mjs`) — CI; alimenta `LITERAL-OWNERSHIP-MATRIX.json` de la raíz.
- `reads-adjudication-gate.mjs` — CI; toda lectura `--ds-*` no adjudicada tiene exactamente un dueño.
- `prototype-ledger-gate.mjs` (+ `.test.mjs`) — CI; todo `--_ds-proto-*` está gobernado o no existe.
- `red-inventory-gate.mjs` (+ `.test.mjs`, `red-inventory.json`) — CI; inventario sellado de rojos.
- `tokens-catalog.mjs` (+ `tokens-catalog-gate.test.mjs`) — CI (`--check`) y generador (`--write`).
- `controls-catalog.mjs` (+ `controls-catalog-gate.test.mjs`) — CI (`--check`); escribe
  `tokens/controls/README.md` con `--write`.
- `customization-surface-census.mjs` (+ `customization-surface-gate.test.mjs`,
  `customization-census-classifier.test.mjs`, `customization-dead-writers.baseline.json`) — CI en
  4 modos (`freshness`, `classification`, `capabilities`, `dead`); produce
  `customization-surface-report.json` (2,7 MB en la raíz del paquete).
- `tenant-reach-census.mjs` — **[SIN CONSUMIDOR]** "cuán lejos viaja de verdad la decisión de un
  tenant". No lo llama nada ni tiene autotest.

---

##### FAM-4 — Motor `modern`, skins y contabilidad de paint CSS — 18 miembros

Qué hace: es el corazón del programa Quiet Premium. Mide paint inline, paint SVG en
runtime, CSS embebido, clases DaisyUI residuales, capas CSS, y congela lo ganado
en ceilings decrease-only.
Cómo se invoca: mezcla. Cuatro están enchufados en CI, tres son librerías importadas,
cinco corren solo por su drill y tres no corren nunca.

- `engine-token-audit.mjs` (+ `.baseline.json` + 5 autotests: `.daisy`, `.effects`,
  `.exemptions`, `.motion-recipes`, `.runtime-svg.integration`) — CI, `--check`. El gate
  mecánico del carril; calcula su censo en tiempo de import (por eso los corpus viven en `lib/`).
- `engine-freeze-gate.mjs` (+ `.test.mjs`, `.baseline.json`) — CI.
- `anatomy-variant-gate.mjs` (+ `.test.mjs`) — CI.
- `size-axis-law-gate.mjs` (+ `.test.mjs`) — CI.
- `spacing-rhythm-contract-gate.mjs` (+ `.test.mjs`) — CI; sin baseline y sin lista de archivos,
  camina el corpus desde la fuente.
- `css-layer-paint-gate.mjs` (+ `.test.mjs`) — `csspaint:check` en `package.json`, no en el manifiesto de CI.
- `css-source-integrity-gate.mjs` — `csssource:check`; detecta residuo de parche y marcadores de conflicto en CSS.
- `container-query-gate.mjs` (+ `.test.mjs`, `.baseline.json`) — `containerquery:check` / `:seed`.
- `color-mix-argument-purity-gate.mjs` (+ `.test.mjs`) — **[SOLO DRILL]** todo argumento de
  `color-mix()` debe resolver a `<color>` bajo cualquier tenant.
- `modern-bundle-framework-gate.mjs` (+ `.test.mjs`) — **[SOLO DRILL]** el bundle modern no puede
  filtrar capas de Tailwind/DaisyUI fuera de `rottay-framework`.
- `chart-series-reserved-name-gate.mjs` (+ `.test.mjs`) — **[SOLO DRILL]** ley de la costura de
  paleta `--ds-chart-series-1..10`.
- `daisy-painted-classes.mjs` (+ `.test.mjs`) — genera y verifica `lib/daisy-painted-classes.json`
  desde el paquete DaisyUI instalado. No está en CI ni en `package.json`, pero `lib/daisy-class-consumer-counter.mjs` lo importa, así que sí tiene consumidor.
- `runtime-svg-paint-census.mjs` (+ `runtime-svg-paint-counter.test.mjs`) — CLI + librería;
  `engine-token-audit.mjs` importa su `collectSourceFiles`.
- `embedded-css-paint-census.mjs` (+ `embedded-css-paint-counter.test.mjs`) — CLI; solo lo
  ejecuta (spawn) el test de integración `engine-token-audit.runtime-svg.integration.test.mjs`.
- `canvas-sink-census.mjs` (+ `.test.mjs`) — manifiesto de sumideros canvas; lo importa
  `cra-15-runtime-hardening-gate.mjs`, así que corre vía `cra15:gate`.
- `skin-dead-part-audit.mjs` (+ `.test.mjs`) — dirección "selector de skin → ¿se estampa esa parte?";
  `engine-token-audit.mjs` importa `countDeadParts`.
- `skin-orphan-scope-audit.mjs` (+ `.baseline.json`) — **[SIN CONSUMIDOR]** la dirección OPUESTA a
  la anterior (clase de scope huérfana). No es duplicado: es el reverso deliberado. Pero nadie lo corre,
  y su baseline queda congelado.
- `skin-census.mjs` — **[SIN CONSUMIDOR]** censo de flota WO-SKIN-01 (paint inline por archivo de
  `src/ui`). Solo se lo menciona en `roadmap/` y en un comentario de `engine-token-audit.mjs`.

También en la familia (datos/autotests sueltos que corren por el glob y no tienen `.mjs`
de producción propio en la raíz): `inline-paint-recovery.test.mjs`,
`fleet-inline-paint-census.test.mjs`, `path-keyed-baseline-relocation.test.mjs`,
`no-decorative-accent-rails.test.mjs`, `daisy-projection-contract.test.mjs` (este último
sí está en el manifiesto de CI), `certified-data-css-producers.vitest.test.ts` (único
archivo que levanta el `vitest.scripts.config.ts`).

---

##### FAM-5 — Evidencia, claims e inventarios de paquete (GAT / CRA / KIMI) — 12 miembros

Qué hace: prueba que lo que la documentación y los manifiestos AFIRMAN coincide
exactamente con lo que la fuente hace. Es la familia de "un claim sin evidencia vale cero".
Cómo se invoca: mitad CI, mitad `package.json`, dos huérfanos.

- `gat-07-exact-proof.mjs` (+ `.test.mjs`, `gat-07-documentation-seal.json`,
  `gat-07-doc-claim-allowlist.json`, `gat-07-public-claim-floor.json`,
  `gat-07-stale-corpus.json`) — CI `--check`; `gat07:write` regenera el sello.
- `gat-09-full-claim-integrity.mjs` (+ `.test.mjs`, `gat-09-public-claim-evidence.json`) —
  `gat09:structural` / `gat09:gate`; NO está en el manifiesto de CI.
- `cra-11-adaptive-contract-census.mjs` (+ `.test.mjs`) — `cra11:generate|check|gate|test`; NO en CI.
- `cra-12-motion-governance.mjs` (+ `.test.mjs`, `.reanchor.test.mjs`, `.registry.json`) — CI
  (`--repositories ui-design-system`) + drill de reancla.
- `cra-15-runtime-hardening-gate.mjs` (+ `.test.mjs`) — `cra15:gate|write|gate:final`.
- `cra-17-packaging-license-gate.mjs` (+ `.test.mjs`) — CI (`cra17:licenses`); lee
  `provenance/graphics/pack-allowlist.json`.
- `cra-17-public-declaration-gate.mjs` (+ `.test.mjs`) — `cra17:declarations`.
- `cra-17-integral-gate.mjs` (+ `.test.mjs`, `cra-17-asset-entrypoints.test.mjs`) —
  **[SOLO DRILL] + [DUPLICA]** de `cra-17-packaging-license-gate.mjs` y
  `cra-17-public-declaration-gate.mjs`: los IMPORTA a los dos (`auditGraphicsPackaging`, etc.)
  y los reejecuta como un agregado. Los dos componentes sí corren por separado; el agregado no
  corre nunca.
- `kimi-preservation-manifest.mjs` (+ `kimi-preservation-gate.test.mjs`) — CI `--check`;
  genera `KIMI-CUSTOMIZATION-PRESERVATION-MANIFEST.json` (220 KB en la raíz).
- `kimi-worklist-gate.mjs` (+ `.test.mjs`) — CI `--check`; valida `KIMI-VISUAL-WORKLIST.json` (749 KB).
- `icon-embed-inventory-gate.mjs` (+ `.test.mjs`, `.baseline.json`) — `iconembed:check|write`.
- `pack-inventory-gate.mjs` (+ `.test.mjs`, `pack-inventory.baseline.json`,
  `pack-inventory.additions.json`, `pack-inventory.lucide-allowlist.json`) — `packinv:check|write`.

---

##### FAM-6 — Generadores de artefactos publicables — 6 miembros

Qué hace: producen los archivos que sí se empaquetan (CSS por vertical, fuentes,
iconos, contratos), o los que se comitean como snapshot.
Cómo se invoca: `package.json` (`build:*`, `lint:*`, `icons:*`, `contract:*`).

- `verticals/build-vertical-css/index.mjs` — escribe `styles/{index,modern,rottay,bithire,evnto}.css` y sus
  copias en `dist/`; `--check` falla si algún `styles/*.css` está stale. Es el ÚNICO generador de `styles/`.
- `verticals/build-vertical-artifacts/index.mjs` (+ `build-vertical-artifacts.apca-baseline.json`) — regenera
  `src/foundation/tokens/css/facade/artifacts/<slug>/index.css` desde la fuente autorizada; `lint:artifacts`.
- `builders/build-font-packs/index.mjs` — copia los font packs opt-in a `dist/fonts/` para que resuelvan los
  subpaths `./fonts/<id>.css`.
- `generators/generate-semantic-icons/index.mjs` (+ `index.test.mjs`) — `icons:generate|check`; corpus semántico de 282 nombres.
- `generate-supplier-contract.mjs` (+ `.test.mjs`) — `contract:generate|check` (este último SÍ en CI);
  produce `supplier-contract.json` (185 KB) que consume `consumer/ds-supplier-honesty.mjs`.
- `generators/generate-surface-capability-census/index.mjs` — **[SIN CONSUMIDOR]** CLI fino sobre
  `lib/surface-capability-census.mjs`. La librería sí se drilea (`surface-capability-census.test.mjs`),
  el CLI no lo llama nadie.

---

##### FAM-7 — Gates de frescura / staleness — 2 miembros

Qué hace: impedir que se publique o se evalúe contra artefactos viejos.

- `dist-freshness-gate.mjs` (+ `.test.mjs`) — `distfresh:check`, precondición de `prepack`;
  compara el hash de entrada de `lib/build-input-hash.mjs` contra el sello que dejó `builders/write-build-stamp/index.mjs`.
- `verticals/vertical-css-staleness.gate/index.mjs` — en CI (`node --test`, es un archivo de test disfrazado de gate)
  y en `package.json` como `gate:styles-css`.

---

##### FAM-8 — Codemods de migración — 3 miembros en la raíz

Qué hace: reescrituras deterministas one-shot sobre la fuente.
Cómo se invoca: dos de los tres, nadie.

- `codemod-motion-tokens.mjs` — **[SIN CONSUMIDOR]** WO-ENG-01: unifica la motion del motor modern
  sobre el canon `--ds-motion-*`. Solo aparece citado en `roadmap/registry.json`.
- `codemod-motion-durations.mjs` — **[SIN CONSUMIDOR]** WO-ENG-01 pase 2: tokeniza literales de
  duración de transition/animation. Ídem.
- `migrate-public-entrypoints.mjs` (+ `.test.mjs`) — `public-entrypoints:codemod`; reescribe imports
  contra `public-entrypoints.manifest.json`.

**[DUPLICA] de ubicación (no de código):** existe `scripts/codemods/` como carpeta dedicada a
codemods, y sin embargo estos tres viven planos en la raíz. Son audiencias distintas (los de
`codemods/` apuntan a apps consumidoras, estos a la fuente del propio DS) pero es un hogar partido.

---

##### FAM-9 — Auditorías de adopción en apps consumidoras — 3 miembros

Qué hace: correr fuera del paquete, sobre `app-bithire` / `app-evnto` / `app-platform`.

- `structure/audit-integration/index.mjs` — `lint:integration`; guardrail de integración del DS.
- `audit-vertical-compliance.mjs` — `lint:vertical`; chequeos de arquitectura world-class por vertical.
- `i18n/i18n-key-parity-gate/index.mjs` (+ `index.test.mjs`, `i18n-key-parity-gate.baseline.json`) — CI `--check`; paridad de claves i18n.

---

#### 1.2 Los 8 scripts de la raíz que no entran en ninguna familia

1. `scripts/builders/dev/index.mjs` — orquestador de desarrollo local: mantiene el bundle JS en watch y además
   refresca los artefactos CSS que el watch de Vite no toca. `pnpm dev`.
2. `scripts/analyze-bundle.mjs` — construye con Vite y mide cada entrypoint de `dist/`; 7 alias
   (`analyze`, `analyze:components`, `analyze:effects`, `analyze:chart-access`, ...), ninguno en CI.
3. `scripts/check-storybook-budget.mjs` — presupuesto de tamaño de `storybook-static/`;
   se ejecuta dentro de `build-storybook`.
4. `scripts/typecheck-tests-ratchet.mjs` — ratchet de cantidad de errores de `tsc` sobre los
   archivos de test, que ningún tsconfig de producción incluye. `typecheck:tests`, con
   `tsconfig.tests.json` / `tsconfig.tests.baseline.json` de la raíz del paquete.
5. `scripts/builders/write-build-stamp/index.mjs` — último paso de `build`: escribe el hash de entrada que
   después lee `dist-freshness-gate.mjs`.
6. `scripts/relocate-engine-token-baseline.mjs` — reubica SOLO las claves path-keyed de
   `engine-token-audit.baseline.json` usando el inventario de renames de Git; nunca cambia un valor,
   dry-run por defecto. `engine-audit:relocate-paths`.
7. `scripts/generators/generate-taxonomy/index.mjs` — camina `src/ui/` y emite `docs/TAXONOMY.generated.md`. `docs:taxonomy`.
8. `scripts/tenant-theme-canary-fixtures.mjs` — publica los especímenes canary de tenant-theme como
   artefacto consumible (`tenant-theme-canary-fixtures.json` + `.d.ts` en la raíz del paquete).
   `tenant-theme-fixtures:generate|check`.

Además, dos archivos de raíz que no son scripts: `scripts/tests-typecheck-ambient.d.ts`
(declaraciones ambient para el ratchet de typecheck) y `scripts/vitest.scripts.config.ts`
(config de Vitest cuyo `include` es `scripts/**/*.vitest.test.ts`, y hoy captura exactamente
un archivo: `certified-data-css-producers.vitest.test.ts`).

---

#### 1.3 `scripts/codemods/` — (3 archivos)

- `scripts/codemods/README.md` — (1) explica que estos codemods son opt-in para apps consumidoras
  que adoptan el vocabulario normalizado por WO-ARC-01, y lista las limitaciones de cada uno.
- `scripts/codemods/sizetype-to-size.mjs` — (1) reescribe el import type-only `SizeType` de
  `@rottay/design-system` al canónico `Size`. **[SIN CONSUMIDOR]** dentro de este paquete
  (es una herramienta para correr a mano en otro repo).
- `scripts/codemods/variant-tone-split.mjs` — (1) reescribe `variant="..."` a `tone="..."` en
  Badge/Tag/Callout/Avatar, solo para el subconjunto de valores que cada componente mapea a un Tone.
  **[SIN CONSUMIDOR]** por el mismo motivo.

---

#### 1.4 `scripts/lib/` — (30 archivos: 26 `.mjs` de librería, 3 `.test.mjs`, 1 `.json`)

Librerías compartidas. Regla implícita del árbol: una medición vive acá una sola vez y
todos los gates la importan, para que nunca haya dos censos del mismo hecho.

- `lib/build-input-hash.mjs` — hash de contenido de las entradas de `build`; base del gate de frescura de `dist/`.
- `lib/counter-presence-audit.mjs` — mitad inversa de los ratchets: detecta la clave de baseline
  que desapareció junto con su archivo o su colector.
- `lib/cra-11-adaptive-contract-census.mjs` — censo AST de factories `create*Config` adaptativas.
- `lib/daisy-class-consumer-counter.mjs` — cuenta archivos del motor modern que RENDERIZAN una clase DaisyUI.
- `lib/daisy-painted-classes.json` — el vocabulario de clases generado por `../daisy-painted-classes.mjs`.
- `lib/ds-hook-manifest.mjs` — deriva (no lista a mano) el manifiesto público de hooks de aplicación.
- `lib/effect-consumer-counter.mjs` — cuenta consumidores vivos de las familias de tokens de efecto premium.
- `lib/embedded-css-paint-counter.mjs` — cuenta propiedades de paint en CSS embebido (postcss + ts).
- `lib/engine-corpus.mjs` — define QUÉ archivos de `src/ui` audita un ratchet de motor; vive acá
  porque el audit computa todo al importarse y no se le puede preguntar su corpus.
- `lib/engine-token-governance.mjs` — clases de gobernanza compartidas entre el audit y su evidencia semántica.
- `lib/first-party-roster-source.mjs` (+ `.test.mjs`, drill en CI) — lee el roster de verticales
  first-party desde la FUENTE, no desde `dist/`.
- `lib/fleet-inline-paint-census.mjs` — censo de paint inline de flota; declara los archivos que
  el carril ARC-09 posee en exclusiva para no duplicarlos.
- `lib/gat-07-static-analysis.mjs` — análisis estático (postcss + typescript + sha256) que sostiene el sello GAT-07.
- `lib/inline-paint-counter.mjs` — el contador de paint inline (`style={{...}}`) de referencia.
- `lib/modern-framework-layer.mjs` (+ `.test.mjs`) — envuelve las capas generadas de Tailwind/DaisyUI
  bajo `rottay-framework` para que el token first-party gane por propiedad de capa.
- `lib/motion-recipe-consumer-counter.mjs` — cuenta llamadas reales (no re-exports ni menciones) a la costura de recetas de motion.
- `lib/owner-nesting.mjs` (+ `.test.mjs`, drill en CI) — detecta filas del family-inventory cuyo
  `sourceOwner` anida físicamente dentro del de otra fila.
- `lib/path-keyed-baseline-relocation.mjs` — la lógica pura de reubicación de contadores path-keyed
  (`arc09.inlinePaint.`, `fleet.inlinePaint.`, `runtimeSvgPaint.`, `embeddedCssPaint.`).
- `lib/root-public-resolver.mjs` (+ `.test.mjs`, drill en CI) — calcula desde la fuente qué exporta
  realmente `@rottay/design-system`; es lo único que un inventario incorrecto no puede falsear.
- `lib/runtime-svg-paint-counter.mjs` — cuenta paint SVG escrito en runtime (setters D3, `setAttribute`,
  atributos de presentación en JSX), canal invisible para un lexer de texto.
- `lib/script-source-comment-stripper.mjs` — quita comentarios vía AST de TypeScript
  (drilleado por `../script-source-comment-stripper.test.mjs`).
- `lib/skin-exemption-audit.mjs` — audita las exenciones de skin cruzando los tres contadores de paint.
- `lib/skin-files.mjs` — el ÚNICO walker de archivos de skin, extraído de `engine-token-audit.mjs`
  para poder importarlo sin ejecutar el censo.
- `lib/surface-capability-census.mjs` — censo determinista de registraciones de capacidad de surface.
- `lib/theme-channel-parity-graph.mjs` — grafo estático de canales de BrandTheme (declaración → emisión → lectura).
- `lib/zero-lock-policy.mjs` — política de baseline total y fail-closed para `engine-token-audit`.

---

#### 1.5 `scripts/quality-evidence/` — (401 archivos)

Tooling de evidencia de calidad. No se publica en el paquete (`files` de `package.json` no lo incluye).

- `quality-evidence/README.md` — (1) declara explícitamente que conviven DOS generaciones no
  intercambiables y que v1 es "historical baseline only".
- `quality-evidence/cli.mjs` — (1) **[DUPLICA]** de `quality-evidence/v2/cli.mjs`. CLI de la
  generación v1. Sigue enchufado en `package.json` como `quality-evidence:check`, pese a que el
  README dice que v1 no puede citarse como cobertura ni calidad del design system. Confirmado.
- `quality-evidence/registry.mjs` — (1) registro v1 de contratos de evidencia por componente (subconjunto de primitives).
- `quality-evidence/pairwise.mjs` — (1) construye la matriz de evidencia pairwise de v1.
- `quality-evidence/schema.mjs` — (1) validadores de esquema del registro y del scorecard v1.
- `quality-evidence/scorer.mjs` — (1) compone el score v1 (mezcla checks binarios con craft; es
  justamente lo que v2 separa).
- `quality-evidence/quality-evidence.schema.json` — (1) esquema JSON de v1.
- `quality-evidence/scorecard.example.json` — (1) scorecard de ejemplo de v1.
  (El drill de todo v1 es `scripts/quality-evidence-gate.test.mjs`, en la RAÍZ plana, y sí corre
  por el glob `scripts/*.test.mjs`: v1 no solo está enchufado, además está drilleado en CI.)

##### `quality-evidence/v2/` — (10 archivos) la generación vigente (WO-CRA-23)

- `v2/cli.mjs` — CLI actual; `quality-evidence:v2:inventory` y `quality-evidence:v2:round`.
- `v2/admission.mjs` — admisión de work-orders y validación del grafo de conflictos (un escritor por archivo).
- `v2/contracts.mjs` — carga los contratos del programa.
- `v2/craft-score.mjs` — el score sighted de 100 puntos; deliberadamente NUNCA ve un resultado de contrato.
- `v2/eligibility.mjs` — elegibilidad binaria; consume el score solo para compararlo con el umbral de la capa.
- `v2/inventory-correspondence.mjs` — correspondencia total inventario vs fuente vs exports públicos.
- `v2/ownership-overlap.mjs` — solapamiento de propiedad entre familias.
- `v2/receipts.mjs` — frescura de recibos contra digests de fuente.
- `v2/round-evidence.mjs` — política de evidencia mínima confiable por ronda (R0 es capture-free).
- `v2/drills.test.mjs` — (2478 líneas) los drills; corren en CI como gate propio (`quality-evidence-v2-drills`).

##### `quality-evidence/programs/modern-rescue/` — (~380 archivos) el programa WO-CRA-23

Raíz del programa (autoridad normativa, según `AGENTS.md` y `CLAUDE.md`):

- `README.md`, `program.json`, `customization-model.json`, `agent-orchestration.json` — los cuatro
  contratos canónicos del programa; `program.json` es el único lugar donde vive
  `denominators.visibleFamilies`.
- `family-inventory.json` — el inventario de familias (255 filas) del que sale el denominador.
- `evidence-contract.json`, `quality-rubric.json`, `rounds.json`, `checkpoint.intent.json`,
  `visual-craft-contract.json`, `tenant-art-direction.json` — contratos auxiliares de evidencia,
  rúbrica, rondas, intención de checkpoint, craft visual y dirección de arte por tenant.
- `program-check.mjs` (+ `.test.mjs`) — el gate de contrato del programa; bloqueante en CI, con su
  drill explícitamente listado porque ningún glob de `test:scripts` lo alcanzaba.
- `cascade-extract.mjs` — deriva las aristas canal→canal vivas parseando el CSS. **[SIN CONSUMIDOR]**
- `cascade-materialize.mjs` — emite `manifest/cascade/materialized/<controlId>.json` para cada control activo. **[SIN CONSUMIDOR]**
- `cascade-backlog.mjs` — el checklist del dueño: qué variable debe existir y en qué primitives. **[SIN CONSUMIDOR]**
- `cascade-probe.mjs` (776 líneas, en inglés) (+ `cascade-probe.test.mjs`, 855 líneas) —
  **[DUPLICA]** de `probe/cascade-probe.mjs`. Verificación de dos patas (simbólica + Chromium) para
  reescrituras byte-equivalentes. **[SIN CONSUMIDOR]**: ni CI, ni `package.json`, y su test no cae
  bajo ningún glob (los globs solo alcanzan `program-check.test.mjs` y `manifest/generator.test.mjs`).

Subcarpetas:

- `probe/` — (7) los módulos de la sonda de cascada: `leg1-symbolic.mjs`, `leg2-chromium.mjs`,
  `css-model.mjs`, `css-parse.mjs`, `value-eval.mjs` — que `../cascade-probe.mjs` importa
  directamente en sus líneas 76-84, o sea que son dependencia viva de la sonda de la raíz, no una
  copia. El único duplicado real es `probe/cascade-probe.mjs` (2729 líneas, español, monolito con
  solo builtins de node), que reimplementa entero lo que la raíz hace apoyándose en estos módulos.
  Su test `cascade-probe.test.mjs` (692 líneas) no lo alcanza ningún glob.
- `manifest/` — (356) el manifiesto segmentado de customización, canon del repo (20 controles ×
  255 familias). Detalle abajo.
- `phase-a/` — (1) `ledger-schema.json`, el esquema del ledger de la fase A.
- `KIMI-ANNOTATIONS/` — (0) carpeta vacía con un único subdirectorio `inbox/` también vacío;
  buzón de anotaciones de Kimi. **[SIN CONSUMIDOR]** hoy.

Dentro de `manifest/` (356 archivos):

- `manifest/generator.mjs` (+ `generator.test.mjs`) — genera el layout de archivos, los esqueletos
  y el índice; su drill es bloqueante en CI y el generador corre como gate
  `modern-rescue-customization-manifest-freshness`.
- `manifest/rules.mjs` — las reglas máquina del manifiesto (el generador solo hace layout).
- `manifest/schema.json`, `manifest/index.json` — esquema e índice del manifiesto.
- `manifest/controls/` — (20) un JSON por control de customización (`palette.seeds`,
  `typography.scale`, `spacing.rhythm`, `motion.dial`, `chrome.anatomy`, `token-overrides`, ...).
- `manifest/families/` — (255) un JSON por familia, agrupados en 5 subcarpetas que son exactamente
  las 5 capas lógicas del manifiesto: `primitive/`, `pattern/`, `structure/`, `surface/`, `chart/`.
- `manifest/groups/` — (3) agrupaciones transversales: `collection-card-anatomy.json`,
  `collection-view-mode.json`, `data-table-presentation.json`.
- `manifest/cascade/` — (64) el estado de la cascada: `root-catalog.json` + `roots/` (20),
  `materialized/` (20), `backlog/` (22) y `extracted/css-edges.json` (1). Es la salida de los tres
  `cascade-*.mjs` de la raíz del programa, que hoy no corren en ningún pipeline.
- `manifest/fanout-facts.mjs` (+ `.test.mjs`) — generador de hechos del fan-out de canales CSS.
  El `.test.mjs` **[SIN CONSUMIDOR]**: ningún glob lo alcanza.
- `manifest/mirror-parity.mjs` (+ `.test.mjs`) — hecho generado: paridad de espejo entre los tres
  temas first-party (rottay/bithire/evnto). Test **[SIN CONSUMIDOR]**.
- `manifest/root-checklist.mjs` (+ `.test.mjs`) — vista por raíz sobre los hechos de fan-out.
  Test **[SIN CONSUMIDOR]**.
- `manifest/generated/` — (3) las salidas de los tres anteriores: `fanout-facts.json`,
  `mirror-parity.json`, `root-checklists.json`.

---

### 2. `packages/core/styles/` — (6 archivos)

**Son ARTEFACTOS GENERADOS, no fuente.** Los seis los escribe
`scripts/verticals/build-vertical-css/index.mjs`; `node scripts/verticals/build-vertical-css/index.mjs --check` (parte de
`pnpm lint`) falla si alguno está stale. Se comitean a git pero NO se publican:
`files` de `package.json` no incluye `styles/`, y todos los exports `./styles/*` apuntan a `dist/`.

- `styles/index.css` — (129.081 líneas) bundle completo: tokens base + motor modern + TODOS los
  tenants. El propio header dice que las apps de producción no deben usarlo.
- `styles/rottay.css` — (126.218 líneas) bundle del vertical `rottay`; es el target del export
  `./styles/rottay` y también de `./styles/default`.
- `styles/platform.css` — (126.218 líneas) **[DUPLICA]** de `styles/rottay.css`: byte-idénticos
  (`cmp` sin diferencias). `platform` ya no existe como id de vertical — el roster en
  `src/foundation/tokens/ts/presentation/brand-themes/` solo tiene `bithire`, `evnto` y `rottay`,
  y hay un gate dedicado (`platform-identity-zero-gate.mjs`) que persigue justamente ese residuo.
  Ningún export de `package.json` lo referencia. Es un sobrante del rename.
  (Nota: el header de AMBOS archivos sigue diciendo "platform vertical bundle", así que el header
  de `rottay.css` está desactualizado respecto al slug que lo genera.)
- `styles/bithire.css` — (125.604 líneas) bundle del vertical bithire.
- `styles/evnto.css` — (123.905 líneas) bundle del vertical evnto.
- `styles/modern.css` — (954 líneas) bundle SOLO-motor: Tailwind v4.2.4 + DaisyUI envueltos en
  `@layer rottay-framework` por `scripts/lib/modern-framework-layer.mjs`, más el guard de
  reduced-motion. Es lo que se publica como `dist/modern-engine.css` (export `./styles/modern`).

---

### 3. `packages/core/tokens/` — (1 archivo)

**Artefacto generado.**

- `tokens/controls/README.md` — (1) el catálogo de la API de producto de customización, en tablas
  por tier (STANDARD 13 controles, más los tiers pro y expert). Generado por
  `scripts/controls-catalog.mjs --write` (`pnpm tokens:catalog:write` — ojo: el alias se llama
  `tokens:catalog:*` pero escribe acá), lleva su propio `digest:` y el encabezado dice "NO editar a
  mano". `scripts/controls-catalog.mjs --check` es gate bloqueante en CI, así que un README
  editado a mano rompe el build.

---

### 4. `packages/core/provenance/` — (10 archivos)

**Fuente escrita a mano** (licencias de terceros + allowlists). Dos subárboles por clase de activo.

- `provenance/effects/README.md` — (1) documenta la procedencia de los efectos premium portados.
- `provenance/effects/sources.json` — (1) el registro máquina de qué efecto vino de qué proyecto y
  bajo qué licencia. Lo lee `scripts/effect-registry-audit.mjs` de la RAÍZ DEL MONOREPO
  (`../../scripts/`), no un script de este paquete; corre en CI como gate `effects:provenance`.
- `provenance/effects/licenses/` — (5) los textos de licencia originales: `cult-ui-LICENSE.md`,
  `magicui-LICENSE.md`, `motion-primitives-LICENCE.md`, `react-bits-LICENSE.md`,
  `rottay-ui-design-system-LICENSE`.
- `provenance/graphics/licenses/` — (2) licencias de los suppliers de glifos y marcas:
  `phosphor-icons-react-LICENSE`, `thesvg-LICENSE`.
- `provenance/graphics/pack-allowlist.json` — (1) la allowlist de packs gráficos admitidos; la leen
  `scripts/cra-17-packaging-license-gate.mjs` (gate bloqueante `cra17:licenses`) y
  `scripts/cra-17-integral-gate.mjs`. `provenance/graphics/**` SÍ se publica (`files` lo incluye).

---

### 5. `packages/core/consumer/` — (1 archivo)

- `consumer/ds-supplier-honesty.mjs` — (1) el gate canónico del lado de la APP, no del DS: se
  publica en el paquete (`files` lo incluye explícitamente) para que `app-platform`, `app-bithire`
  y `app-evnto` verifiquen que no importan suppliers (Phosphor, Lucide, Ant icons) fuera del
  borde del adapter. Lleva un mapa `LEGACY_CONTRACTLESS_VERSIONS` con la última versión de cada app
  anterior al contrato. Lo alimenta `supplier-contract.json` (generado por
  `scripts/generate-supplier-contract.mjs`), y `scripts/pack-inventory-gate.test.mjs` lo drillea.
  Las copias comiteadas en los repos de app se verifican byte a byte contra esta.

---

### 6. `packages/core/docs/` — (158 archivos: 3 sueltos + 11 conjuntos)

Documentación local del paquete. Ojo: `CLAUDE.md` del monorepo dice que la documentación viva es
`/docs-engineering/`, así que casi todo esto es material de auditoría histórica, no autoridad.

Archivos sueltos:

- `docs/TAXONOMY.generated.md` — (1) generado por `scripts/generators/generate-taxonomy/index.mjs` (`docs:taxonomy`);
  lista todo tier y toda familia caminando `src/ui/`.
- `docs/TENANT_MODEL.md` — (1) el modelo de tenancy escrito a mano.
- `docs/structures-tier.md` — (1) nota sobre el tier `structures/`.

Los 11 conjuntos:

- `docs/audits/` — (21) auditorías fechadas del DS (`2026-04-11-full-ds-audit.md`,
  `2026-04-13-super-utilization-audit/`, `historical/`). Archivo histórico.
- `docs/galactic-integration-rubric/` — (20) rúbrica numerada 00–19 que puntúa la integración del DS
  motor por motor y tier por tier (runtime/tenancy, foundation, inputs, etc.), con scorecard ejecutivo.
- `docs/modern-customization-audit/` — (7) auditoría acotada de la customización del motor modern
  (pipeline de runtime, display/layout, inputs, navigation/feedback/overlay) más un plan de olas y
  un prompt para Claude.
- `docs/premium-final-audit/` — (21) auditoría "premium" de 120 puntos que cubre DS + `app-platform`
  (arquitectura, UX, visual), con veredicto ejecutivo.
- `docs/premium-styling-track/` — (9) el carril de trabajo de estilo premium: mapa de roles actual,
  glosario, taxonomía objetivo, modelo de customización, paridad de contrato premium y una plantilla
  de "stop" por hito.
- `docs/quality-reset-audit/` — (18) auditoría del reset de calidad, misma estructura de 120 puntos
  (dirección visual y marca, shell/layout/navegación, dashboard, ...).
- `docs/reference/` — (7) el único conjunto que es referencia de API y no auditoría: un README por
  área — `components/feedback`, `components/navigation`, `contracts`, `hooks/responsive`, `i18n`,
  `theming`, `tokens`. Es también el más flaco (2 de 6 categorías de componentes).
- `docs/rotate-execution-playbook/` — (15) playbook de ejecución "Rotate": definición de done,
  causas raíz, north star, reset del sistema visual, propiedad de shell/workspace, dashboard.
- `docs/rottay-design-platform-10-10/` — (23) el paquete de handoff más grande: runbooks de
  implementación, prompts de handoff y de siguiente ola, y las auditorías CODEX de 2026-07-23
  (base, K0-K1, ola 2).
- `docs/world-class-app-architecture/` — (13) la decisión de arquitectura de `src` para las apps:
  semántica de raíces, plantilla final, reglas de no-duplicación, `folder/index`, árbol objetivo de
  `app-platform`.
- `docs/world-class-refactor/` — (1) `00-wave-plan.md` solamente; conjunto abandonado a un archivo.

---

### 7. Índice de hallazgos

#### `[DUPLICA]`

1. `scripts/quality-evidence/cli.mjs` (v1) vs `scripts/quality-evidence/v2/cli.mjs` (v2) —
   **confirmado**. Ambos en `package.json` (`quality-evidence:check` vs `quality-evidence:v2:*`),
   v2 no importa nada de v1, y el `README.md` del propio directorio dice que v1 es "historical
   baseline only" y "may not be cited as coverage, quality or premium status". Además el drill de v1
   (`scripts/quality-evidence-gate.test.mjs`) sí corre en CI por el glob de la raíz.
2. `.../modern-rescue/cascade-probe.mjs` (776 líneas, inglés) vs
   `.../modern-rescue/probe/cascade-probe.mjs` (2729 líneas, español) — dos implementaciones
   independientes de la misma sonda de cascada de dos patas, con el mismo nombre de archivo, más sus
   dos tests separados (855 y 692 líneas). Ninguna de las dos la invoca nada. El duplicado es ese
   archivo, no la carpeta: los otros cinco módulos de `probe/` son dependencia de la sonda de la
   raíz (importados en sus líneas 76-84).
3. `styles/platform.css` vs `styles/rottay.css` — byte-idénticos; `platform` ya no es un vertical del
   roster y ningún export lo referencia.
4. `scripts/cra-17-integral-gate.mjs` importa y reejecuta `cra-17-packaging-license-gate.mjs` +
   `cra-17-public-declaration-gate.mjs`, que además corren por separado. El agregado no corre nunca.
5. `parity:theme:check` == `theme-parity:check` en `package.json` — dos nombres, comando idéntico.
6. Doble vía de invocación: `ci-gates.manifest.mjs` llama `node scripts/X.mjs` directo mientras
   `package.json` mantiene un alias pnpm del mismo script; >=11 alias quedan sin uso (listados en §0).
7. Hogar partido de codemods: `scripts/codemods/` (para apps consumidoras) vs
   `scripts/codemod-motion-*.mjs` plano en la raíz (para la fuente del DS).

**NO son duplicados** aunque lo parezcan: `skin-dead-part-audit.mjs` y `skin-orphan-scope-audit.mjs`
caminan direcciones opuestas a propósito (selector→estampado vs clase de scope huérfana); los
censos `runtime-svg-paint-census.mjs` / `embedded-css-paint-census.mjs` de la raíz son CLIs sobre
los contadores de `lib/`, que es donde vive la medición una sola vez.

#### `[SIN CONSUMIDOR]` (nadie los invoca, en ninguna vía)

- `scripts/tenant-reach-census.mjs`
- `scripts/skin-census.mjs`
- `scripts/skin-orphan-scope-audit.mjs` (+ su `.baseline.json` congelado)
- `scripts/generators/generate-surface-capability-census/index.mjs`
- `scripts/codemod-motion-tokens.mjs`
- `scripts/codemod-motion-durations.mjs`
- `scripts/codemods/sizetype-to-size.mjs` y `scripts/codemods/variant-tone-split.mjs`
  (por diseño: se corren a mano en el repo de la app)
- `.../modern-rescue/cascade-extract.mjs`, `cascade-materialize.mjs`, `cascade-backlog.mjs`,
  `cascade-probe.mjs` y `probe/cascade-probe.mjs` — el subsistema de cascada completo. Los otros
  cinco archivos de `probe/` SÍ tienen consumidor: los importa `cascade-probe.mjs` de la raíz
- Tests que ningún glob alcanza: `.../modern-rescue/cascade-probe.test.mjs`,
  `.../modern-rescue/probe/cascade-probe.test.mjs`, `.../manifest/fanout-facts.test.mjs`,
  `.../manifest/mirror-parity.test.mjs`, `.../manifest/root-checklist.test.mjs`
  (los globs de `test:scripts` solo llegan a `quality-evidence/v2/*.test.mjs`,
  `program-check.test.mjs`, `manifest/generator.test.mjs` y `scripts/*.test.mjs` no recursivo)
- `.../modern-rescue/KIMI-ANNOTATIONS/inbox/` — vacía

#### `[SOLO DRILL]` (el detector se prueba, pero nunca se ejecuta contra el árbol)

- `scripts/channel-wiring-zero-delta-gate.mjs`
- `scripts/color-mix-argument-purity-gate.mjs`
- `scripts/modern-bundle-framework-gate.mjs`
- `scripts/chart-series-reserved-name-gate.mjs`
- `scripts/cra-17-integral-gate.mjs`
- `scripts/embedded-css-paint-census.mjs` (solo lo spawnea un test de integración)

#### Otros

- `package.json` referencia `scripts/effect-registry-audit.mjs` y su test, pero ese script NO existe
  en `packages/core/scripts/`: vive en `../../scripts/` (raíz del monorepo). Ni `effects:provenance`
  ni `test:scripts` están rotos — las rutas apuntan hacia afuera del paquete — pero es el único caso
  en el que un gate bloqueante de CI de este paquete se resuelve fuera de él.
- `dist/` está desactualizado respecto a `src/`: `scripts/verticals/build-vertical-css/index.mjs` importa
  `../dist/foundation/tokens/ts/presentation/brand-themes/index.js` y ese archivo hoy no existe en
  `dist/`. Cualquier chequeo de staleness de `styles/` requiere reconstruir primero.
