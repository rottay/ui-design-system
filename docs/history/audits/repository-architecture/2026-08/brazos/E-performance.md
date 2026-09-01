# E — Performance, tamaño de artefactos y pipeline de entrega/publicación — 8 ópticas

Snapshot: 2026-08-28, working dir `/Users/daniel/Developer/Rottay/ui-design-system`. El árbol es compartido y vivo: durante esta medición `git rev-list --count origin/main..HEAD` pasó de 670 a 672 y los 3 archivos sin commitear que el contexto compartido señalaba como "trabajo ajeno en vuelo" fueron commiteados por otro agente entre dos de mis lecturas (`git status --short` pasó de 2 líneas `M` a vacío). No los toqué; los cito como evidencia de concurrencia, no como defecto propio.

## Puntaje por óptica

| # | Óptica | Puntaje 0-5 | Evidencia (1 línea) |
|---|---|---|---|
| 41 | Peso de los 4 bundles (~5.3-5.5MB) explicado | 1 | 35.4% del raw es comentario (`packages/core/styles/bithire.css`: 1,898,537/5,356,168 bytes); cero minificador en el repo |
| 42 | Uso real por página vs bundle | 1 | classic+rustic (engines que BitHire modern-only nunca renderiza) siguen embebidos incondicionalmente en `bithire.css`: 615 `.ant-` + 1999 `rustic` en el artefacto |
| 43 | `--ds-*` declarados vs leídos en el mismo bundle | 2 | 1024/3853 (26.6%) declarados en `:root` de `bithire.css` nunca se leen en `var()` dentro del mismo bundle |
| 44 | Estrategia de carga en apps (critical CSS, splitting, cache) | 2 | un solo `@import` en `globals.css`, cero splitting: `.next/dev` compila el import en un chunk único de 4.3MB atado al root layout |
| 45 | Fuentes (self-hosted, font-display, subsetting, carga bajo demanda) | 3 | self-hosted+swap+latin+variable OK; pero el único consumidor first-party (`app-bithire`) evita el mecanismo de subpath on-demand del DS para Fraunces y usa `next/font/google` en paralelo |
| 46 | JS: dist, sideEffects, tree-shaking, entrypoints | 4 | `sideEffects` bien acotado a CSS; cada engine de cada componente se carga con `import()` dinámico real (`Button/index.js`), pero `src/index.ts` aún tiene 15 `export *` que ARCHITECTURE.md §1.11 marca "no materializado" |
| 47 | Versionado/publicación (pines, symlinks, gates) | 0 | `app-bithire` 2.19.37 publicado desde un commit (`a037d3a3c`) que hoy no existe en ninguna rama; `app-platform` importa `dist/platform.css`, que el propio DS borró como "huérfano" en un commit (`dd3496343`) nunca pusheado |
| 48 | Commits sin push / higiene del repo | 0 | 672 commits (25 días, desde 2026-08-05) sólo en esta máquina; último push a `origin/main` fue 2026-08-03; `.git` = 426MB, `test-artifacts/` versionado = 98MB/881 archivos |

## Hallazgos (ordenados por severidad)

### H-E-1 · BLOQUEANTE · Cero minificación en los 4 bundles CSS de producción
- Qué: `packages/core/scripts/verticals/build-css/index.mjs` es un resolutor de `@import` que concatena texto — no hay ningún paso de minify (sin `cssnano`, `lightningcss`, `csso`, `clean-css` en `package.json`; `postcss` sólo se usa para `build:modern-css`, que procesa Tailwind sobre `modern.css`, no los bundles de vertical). El bundle shippeado conserva TODOS los comentarios doc-string fuente.
- Evidencia:
  - `packages/core/scripts/verticals/build-css/index.mjs:1-33` (encabezado: función `resolveImports` sólo inlinea, no minifica)
  - `grep -n "cssnano\|lightningcss\|csso\|clean-css" packages/core/package.json` → 0 resultados
  - Bytes de comentario: `python3 -c "import re; t=open('bithire.css').read(); print(sum(len(c) for c in re.findall(r'/\*.*?\*/', t, re.S)))"` → **1,898,537 / 5,356,168 = 35.4%**
  - Impacto en compresión real (`gzip -9 -c` / `brotli -q 11 -c`, medido con la misma flag en original y en una versión con comentarios+líneas en blanco quitados, escrita a `/tmp/bithire.stripped.css`):
    - raw: 5,356,168 → 3,433,363 (**-35.9%**)
    - gzip -9: 1,043,235 → 368,213 (**-64.7%**)
    - brotli -q11: 712,050 → 257,284 (**-63.9%**)
  - El prosa de los comentarios es alta entropía (texto natural único) y comprime mucho peor que el CSS repetitivo de declaraciones — por eso el ahorro gzip/brotli es proporcionalmente MAYOR que el ahorro en bytes crudos.
- Impacto en el objetivo del owner: "premium... sin espacios en blanco" — el artefacto que de hecho viaja al navegador (si no hay minificador downstream, ver H-E-2b) es 3-4x más pesado de lo necesario en la red y en el parseo del motor de CSS.
- Optimización concreta: agregar un paso `lightningcss --minify` (o `cssnano`) al final de `build-css/index.mjs`, generando **dos** artefactos: `styles/*.css` (legible, para diff/gates, como hoy) y `dist/*.css` (minificado, lo que de hecho se publica a npm — ya están separados por `files` en `package.json`). Esto no toca el compilador de temas ni el modelo de cascada; es puro post-proceso del artefacto ya generado.

### H-E-2 · ALTO · Los 3 engines (classic + rustic + modern) van incondicionalmente en CADA bundle de vertical, sin mecanismo de purga
- Qué: `src/foundation/tokens/css/facade/entrypoints/base.css:88-119` importa `engines/modern/skin/*` y `engines/rustic/skin/*` para cada familia (123 imports modern + 111 rustic, contados con `grep -c "engines/modern/skin"` / `"engines/rustic/skin"`), y `engines/index.css:24` importa `classic/theme.css` sin condición. `base.css` se importa desde CADA entrypoint de vertical (`bithire.css`, `evnto.css`, `rottay.css`), así que el bundle de una vertical que declara `engine:"modern"` igual embebe classic+rustic.
- Evidencia:
  - Fuente: modern 2,413,122 bytes / rustic 551,079 bytes / classic 76,624 bytes (`find ... -name '*.css' -exec cat {} + | wc -c` por engine) — rustic+classic = 627,703 bytes (~26% del tamaño fuente de modern).
  - Artefacto shippeado (`packages/core/styles/bithire.css`): `grep -c "\.ant-"` → 615; `grep -c "rustic"` → 1999; `grep -c "engine-rustic"` → 600.
  - Confirmación directa desde el propio consumidor: `app-bithire/src/styles/tenant-component-defaults.css:17-20` — "BitHire pins engine:\"modern\", so no `.ant-*` element exists in its document" (comentario del propio código, no interpretación mía).
  - Un scan por bloque de regla (selector con `rustic`/`.ant-` → bytes del bloque completo) da un piso de 4.77% + 1.23% = **6.00%** de bytes del artefacto atribuibles directamente a selectores de otro engine — piso, no techo, porque no captura `:root` de tokens ni comentarios de esas secciones.
- Impacto en el objetivo del owner: cada vertical que fija un engine (BitHire=modern) paga en cada carga de página el peso completo de dos engines que su documento nunca renderiza — contradice "sin espacios en blanco, premium" a nivel de red.
- Optimización concreta: el JS ya resuelve exactamente este problema con `import()` dinámico por engine (ver H-E-6/Lo que está bien) — replicar la idea en CSS generando `dist/{vertical}.{engine}.css` por combinación vertical×engine-pin (3 verticales × 3 engines = 9 artefactos, pero cada app sólo importa el suyo), en vez de un único bundle "todos los engines, todas las verticales".

### H-E-3 · ALTO · `dist/platform.css` borrado como "huérfano" en un commit nunca pusheado; `app-platform` sigue importándolo
- Qué: el commit `dd3496343` (2026-08-20) borra `packages/core/styles/platform.css` (126,219 líneas) y su propio mensaje documenta la deuda: *"app-platform/globals.css:14 importa dist/platform.css — fantasma ya roto hoy; lo toma el vertical app-platform"* — y termina con **"Sin push."** Hoy, 8 días después, sigue sin pushear.
- Evidencia:
  - `git show --stat dd3496343` → borra `packages/core/styles/platform.css` (126219 líneas), retira la expectativa del alias en `dependency-honesty`.
  - `git merge-base --is-ancestor dd3496343 origin/main` → NOT on origin/main.
  - `packages/core/package.json`: `grep -n "platform" package.json` → **0 resultados** (el export `./styles/platform` ya no existe localmente).
  - `app-platform/src/app/globals.css:14`: `@import '@rottay/design-system/dist/platform.css';` (sigue ahí).
  - Estado ACTUAL no roto sólo por casualidad de versiones: `app-platform/node_modules/@rottay/design-system` es una instalación real (no symlink) de **2.19.35**, y ESA copia publicada sí trae `dist/platform.css` y el export `./styles/platform` (`ls app-platform/node_modules/@rottay/design-system/dist/*.css` → incluye `platform.css`; `grep -n platform .../node_modules/@rottay/design-system/package.json` → líneas 147-165, 233).
- Impacto en el objetivo del owner: el momento en que alguien pushee y publique cualquier versión ≥ el commit que borra `platform.css` (o simplemente publique desde HEAD local), `app-platform` deja de compilar (`Module not found`) sin que exista ningún gate que lo detecte hoy, porque el propio DS ya marcó esto "resuelto por su lado".
- Optimización concreta: o bien (a) revertir el borrado hasta que `app-platform/globals.css:14` se actualice en el mismo cambio atómico (la deuda cruzada no debería quedar partida entre dos repos y dos commits), o (b) abrir ya el cambio en `app-platform` para dejar de importar `dist/platform.css` (probablemente migrar a `styles/rottay` o el bundle que corresponda) antes de pushear `dd3496343`.

### H-E-4 · BLOQUEANTE · `app-bithire` 2.19.37 publicado desde un commit que no existe en ninguna rama del repo fuente
- Qué: `app-bithire/package.json:168` fija `"@rottay/design-system": "2.19.37"`. El commit de release correspondiente (`a037d3a3c`, "chore(release): prepare design system 2.19.37", 2026-08-09) existe como objeto git suelto pero no es ancestro de `HEAD` ni de ninguna rama.
- Evidencia:
  - `git cat-file -t a037d3a3c` → `commit` (el objeto existe)
  - `git branch --contains a037d3a3c` → vacío
  - `git merge-base --is-ancestor a037d3a3c HEAD` → exit 1 (NOT ancestor)
- Impacto en el objetivo del owner: la versión que `app-bithire` corre en producción hoy no es reconstruible desde el código fuente actual del DS — no hay forma de auditar, re-buildear con un fix de seguridad, o hacer bisect sobre lo que realmente se publicó. Es el mismo patrón de "fix correcto varado bajo una versión publicada" ya documentado por el owner en otros ciclos.
- Optimización concreta: recuperar el commit (`git show a037d3a3c` para inspeccionar el árbol, y si el contenido coincide con lo publicado en el registry, crear una rama `release/2.19.37` que lo ancle) antes de que el reflog local lo pierda por garbage collection.

### H-E-5 · BLOQUEANTE · 672 commits (25 días de trabajo del programa completo) existen sólo en esta máquina
- Qué: `origin/main` está congelado en 2026-08-03 (`a97ddd7361`). Todo el trabajo de Modern Rescue / WO-CRA-23 desde 2026-08-05 hasta hoy (2026-08-28) — F1, F2, F3, F4A, F4B, censos, gates — vive exclusivamente en este disco local.
- Evidencia:
  - `git rev-list --count origin/main..HEAD` → 672 (676 al momento de escribir, sube en vivo)
  - `git log -1 --format="%ci" origin/main` → 2026-08-03 01:48:00
  - `git log origin/main..HEAD --format="%ci" | tail -1` → 2026-08-05 17:45:44 (commit local más viejo sin pushear)
  - `git rev-list --count HEAD..origin/main` → 0 (no hay divergencia real, sólo atraso — un push simple sin merge debería alcanzar)
- Impacto en el objetivo del owner: un solo fallo de disco, o un `git reset --hard`/`clean` mal dirigido (el mismo tipo de incidente que motivó las reglas FORBIDDEN de `CLAUDE.md`) borra 25 días de todo el programa de rediseño, sin red de contención remota.
- Optimización concreta: `git push origin HEAD:main` (o a una rama de respaldo si `main` requiere revisión) apenas se cierre la ventana de escritura concurrente de la flota actual; no requiere `force` porque no hay divergencia (`HEAD..origin/main` = 0).

### H-E-6 · MEDIO · `app-evnto` no consume su propio pin — symlink manual a la fuente local
- Qué: `app-evnto/package.json` fija `"@rottay/design-system": "2.19.29"`, pero `node_modules/@rottay/design-system` es un symlink manual a `packages/core` (fuente, no artefacto publicado).
- Evidencia:
  - `readlink app-evnto/node_modules/@rottay/design-system` → `/Users/daniel/Developer/Rottay/ui-design-system/packages/core`
  - Contraste con `app-platform`: `node_modules/@rottay/design-system` ahí es una instalación real (directorio, no symlink) de 2.19.35.
- Impacto en el objetivo del owner: cualquier prueba local en `app-evnto` corre contra el estado *actual* del working tree del DS (hoy: 676 commits adelante de lo pusheado, con cambios de otros agentes entrando y saliendo en vivo) — nunca contra 2.19.29 real. Un bug que sólo se manifiesta en 2.19.29 no se puede reproducir así, y un "funciona en evnto" no certifica que 2.19.29 funcione.
- Optimización concreta: si el symlink es deliberado para desarrollo (rápido de iterar), documentarlo como modo de desarrollo explícito (ya existe `useLocalDs`/`useLocalModules` en `next.config.ts` de `app-bithire` para esto — ver si `app-evnto` tiene el mismo flag y si está siempre-on por accidente) y correr CI/gates contra el pin real, no contra el symlink.

### H-E-7 · MEDIO · 26.6% de los `--ds-*` declarados en `:root` del bundle nunca se leen en el mismo bundle
- Qué: de 3853 nombres `--ds-*` declarados (`--foo:` ) en `packages/core/styles/bithire.css`, 1024 nunca aparecen dentro de un `var(--foo...)` en el mismo archivo.
- Evidencia (BSD `sed -E` no soporta `\s`; se corrigió a `[[:space:]]` — control positivo: `--ds-alert-radius` declarado en línea 2364, leído en 17892/21370, sale correctamente clasificado como "leído"):
  ```
  grep -oE -- '--ds-[a-zA-Z0-9_-]+[[:space:]]*:' bithire.css | sed -E 's/[[:space:]]*:$//' | sort -u   # 3853
  grep -oE -- 'var\(--ds-[a-zA-Z0-9_-]+' bithire.css | sed -E 's/^var\(//' | sort -u                  # 5550
  comm -23 declared read                                                                                # 1024
  ```
  (7088 es el total de apariciones ds-* en cualquier contexto — coincide con el número del contexto compartido, confirma metodología.)
- Impacto en el objetivo del owner: peso muerto medible y, más importante, superficie pública falsa — un token declarado en `:root` parece "vivo"/tocable por `token-overrides` (control Pro, 290 permitidos) aunque nada lo consuma; un tenant puede gastar uno de sus 200 overrides en un canal sin efecto.
- Optimización concreta: cruzar esta lista de 1024 contra el allowlist de 290 tokens Expert — cualquier intersección es un override "posible" que en realidad no pinta nada; debería salir del allowlist o recibir un consumidor.

### H-E-8 · MEDIO · Doble sistema de carga de fuentes: el subpath on-demand del DS existe pero su único consumidor first-party lo evita
- Qué: el DS expone font-packs opt-in por subpath (`@rottay/design-system/fonts/editorial-display.css`, doc en el propio archivo: *"NEVER imported by styles.css or any default bundle; an app imports it only for the packs its envelope enables"*). `app-bithire` no lo usa para Fraunces (`editorial-display`): en cambio, `src/app/layout.tsx:53-59` carga `Fraunces` vía `next/font/google` en paralelo, con su propia instancia (`preload: false`, fallback distinto).
- Evidencia:
  - `packages/core/src/foundation/tokens/css/foundation/typography/font-packs/editorial-display/index.css:1-12`
  - `app-bithire/src/app/layout.tsx:17-19,54-59` — importa `Fraunces` de `next/font/google`, variable `--ds-font-pack-editorial-display` (mismo nombre de canal que el DS usaría, pero servido por una fuente descargada/auto-hosteada por Next, con subsetting/hinting propios de Google Fonts, no el `.woff2` variable curado por el DS).
  - El bundle de BitHire sólo trae 3 de los ~6 font-packs del catálogo (`grep -c "@font-face" styles/bithire.css` → 4 @font-face = grotesk(1) + humanist(1) + plex-mono(2); editorial-display NO está).
- Impacto en el objetivo del owner: viola "una capacidad, un dueño" (F5 del roadmap) — hay dos implementaciones de "cargar la fuente editorial" que pueden divergir en métricas (line-height, x-height) sin que ningún gate lo note, y el mecanismo on-demand que el DS diseñó específicamente para esto nunca se ejerce en producción por su propio consumidor de referencia.
- Optimización concreta: migrar `layout.tsx` a `import '@rottay/design-system/fonts/editorial-display.css'` (ya expuesto en `exports`, línea 576-580 de `package.json`) y retirar el `next/font/google` para Fraunces, o si hay una razón deliberada (p.ej. optimización de Next para LCP), documentarla como excepción explícita.

### H-E-9 · MEDIO · `typography.pairing` es un control tenant "Standard" pero los `@font-face` están horneados estáticamente por vertical
- Qué: `typography.pairing` (control #1 Standard, `tokens/controls/README.md:18`) es seleccionable por un tenant vía DB (`TenantThemeDocument`), pero los únicos `@font-face` que existen en el bundle de una vertical son los que esa vertical decidió importar en build-time (3 para BitHire). Si un tenant DB elige un pairing que apunta a un font-pack fuera de ese set horneado (p.ej. "editorial" en un tenant corriendo sobre el bundle de BitHire sin el fix de H-E-8), el canal `--ds-font-pack-editorial-display` resuelve (la variable existe) pero sin ningún `@font-face` que la respalde → fallback silencioso a fuente de sistema, sin error, sin gate.
- Evidencia: mismo hallazgo de fondo que H-E-8, más el comentario explícito en `packages/core/src/foundation/tokens/css/facade/entrypoints/bithire.css` (encabezado): *"BitHire is a first-party vertical, so its authored typography ships with the vertical bundle. Customer tenants still override semantic font channels through their compiled DB theme without importing app-owned CSS."* — es decir, el propio código documenta que el tenant DB puede pedir un canal que el bundle no respalda.
- Impacto en el objetivo del owner: rompe silenciosamente el contrato "dos tenants deben verse totalmente distintos" para el eje tipográfico específicamente — dependiendo de la fuente que la vertical decidió empaquetar, no de lo que el tenant configuró.
- Optimización concreta: o bien el compilador de `TenantThemeDocument` valida en tiempo de guardado que `typography.pairing` esté dentro del set de font-packs que la vertical activa realmente embebe (fail closed, coherente con el resto del sistema de allowlists), o el bundle de cada vertical primerapartista embebe TODOS los font-packs del catálogo (aceptando el peso) en vez de un subconjunto elegido a mano.

### H-E-10 · BAJO · 98MB de evidencia visual (881 archivos) commiteados directo a git
- Qué: `packages/core/artifacts/quality/` (881 archivos rastreados, 98MB) no está en `.gitignore` y se commitea como parte del flujo normal de gates (`gat-07` re-sella capturas en cada corrida).
- Evidencia:
  - `git ls-files packages/core/artifacts/quality | wc -l` → 881; `du -sh packages/core/artifacts/quality` → 98M
  - `git check-ignore -v packages/core/artifacts/quality` → sin match (no ignorado)
  - Screenshots individuales de 700KB-2.5MB cada uno bajo `packages/showroom/e2e/visual/__screenshots__/**` y `packages/core/artifacts/quality/programs/modern-rescue/**`
  - `.git` total: 426MB (`du -sh .git`)
- Impacto en el objetivo del owner: no afecta el bundle shippeado a npm (`files` en `package.json` no incluye `test-artifacts`), pero cada re-sello de gate añade un blob binario nuevo a la historia que nunca se puede podar sin reescribir historia (prohibido por las reglas de git del repo) — `.git` sólo crece.
- Optimización concreta: mover la evidencia binaria a un artifact store externo (o Git LFS) y commitear sólo el hash/manifest de referencia; mantener en git únicamente el JSON de aserciones (`semantic-evidence.json`, `semantic-hash.txt`), que ya son los que gatean.

### H-E-11 · BAJO · Barrel raíz aún con 15 `export *` en fuente; el dist limpio es efecto del bundler, no de la fuente saneada
- Qué: `docs/ARCHITECTURE.md:363` exige "The explicit root-barrel API list (§1.9) replaces `export *` aggregation", pero §1.11 la lista explícitamente como "target law not yet materialized". `src/index.ts` (333 líneas) tiene 15 `export *` mezclados con exports nombrados explícitos.
- Evidencia:
  - `grep -c "export \*" packages/core/src/index.ts` → 15
  - `grep -c "export \*" packages/core/dist/index.js` → 0 (el bundler — tsup/rollup — resuelve los `export *` a reexports concretos al compilar; no es evidencia de que la fuente esté saneada)
  - `docs/ARCHITECTURE.md:359-364` (§1.11)
- Impacto en el objetivo del owner: riesgo bajo para tree-shaking real (rollup puede seguir shakeando a través de `export *` estático), pero sí es deuda de gobernanza de superficie pública tal como el propio documento la reconoce — no es un hallazgo nuevo, es confirmación de que sigue abierta.
- Optimización concreta: ninguna nueva — ya está en el roadmap (§1.11); sólo señalo que el conteo en `dist/` no debe usarse como evidencia de cierre en un futuro gate.

### H-E-12 · BAJO/INFO · Duplicación exacta de reglas no es un driver de peso; los `@keyframes` sí tienen colisiones de nombre
- Qué: parseo de bloques hoja (selector `{ declaraciones }`, normalizadas y ordenadas) sobre `bithire.css`: 13,016 reglas no-keyframe, sólo 10 combos exactamente duplicados (~1KB) — la duplicación NO explica el peso del bundle. Dentro de `@keyframes`, sí hay colisión de nombre: `pulse` definido 6 veces, `ds-spin` 3 veces, `rottay-timeline-pulse` 2 veces (357 nombres únicos de 365 bloques `@keyframes` totales).
- Evidencia: script ad-hoc `python3 /private/tmp/.../scratchpad/dup_rules2.py bithire.css` (bracket-matching sobre selectores no-keyframe, excluye pasos `from/to/N%` para no contaminar con la repetición estructural de keyframes) → 10 combos duplicados de 13,004 únicos.
  `grep -oE '@keyframes[[:space:]]+[a-zA-Z0-9_-]+' bithire.css | sort | uniq -c | sort -rn` → `pulse` x6, `ds-spin` x3, `rottay-timeline-pulse` x2.
- Impacto en el objetivo del owner: bajo — no es un problema de peso real, pero 6 `@keyframes pulse` distintos (probablemente idénticos o casi) es una señal de que el mismo micro-patrón de animación se reimplementó en vez de reusarse.
- Optimización concreta: no priorizar; si se toca `@keyframes`, consolidar los 3 nombres colisionados en una única definición importada.

## Lo que está bien (breve, con evidencia)

- **Code-splitting real por engine en JS**: `dist/ui/primitives/inputs/Button/index.js` usa `createEngineComponent("Button", { classic: () => import(...), modern: () => import(...), rustic: () => import(...) })` — `import()` dinámico de verdad, así que un bundler (webpack/Turbopack) puede dejar sin pedir nunca los chunks de `classic`/`rustic` si el engine activo es siempre `modern`. Esto es exactamente el patrón que el CSS (H-E-2) todavía no tiene.
- **`sideEffects` correctamente acotado**: `package.json:12-15` limita side effects a `*.css`/`dist/**/*.css` — el JS es tree-shakeable por diseño.
- **Fuentes**: self-hosted (`.woff2` locales, no Google Fonts CDN directo), `font-display: swap` en las 4 declaraciones del bundle de BitHire, subset `latin`, y dos de los tres packs usan fuentes variables (`400 700`/`400 600` en un solo archivo) en vez de un archivo por peso.
- **Un solo punto de import del DS por app**: `app-bithire/src/app/globals.css` importa el bundle una sola vez; las 3 hojas "drenadas" (`tenant-component-defaults.css` etc.) están verificadas sin duplicar selectores que sigan vivos en `bithire.css` (control positivo: `html[data-tenant="bithire"] .rottay-badge { font-variant-numeric... }` no aparece en el bundle DS).
- **No hay pipeline de CI que facture sorpresas**: cero GitHub Actions de publish/release (coherente con el resto del monorepo, 100% Hetzner) — no es una fuga de costo, aunque tampoco hay gate automático de publicación (ver H-E-4/H-E-5).
- **`exports` granular**: 121 subpaths declarados en `package.json`, con `optimizePackageImports` ya configurado en `app-bithire/next.config.ts:274-281` para transformar imports de barrel en imports directos.

## Preguntas que no pude cerrar (y qué haría falta)

- **¿El bundle que de hecho llega al navegador en producción va minificado por Next/Turbopack aunque el artefacto del DS no lo esté?** Next.js normalmente minifica CSS en `next build`, pero no hay ningún `.next` de producción en el repo (`app-bithire/.next` sólo tiene `dev/`, sin minificar, y con dos copias casi idénticas de 4.3MB del bundle global — `[root-of-the-server]__*.css` y `src_app_globals_css_*.css` — que podrían ser duplicación real de HMR en dev o un artefacto normal de Turbopack; no se puede diferenciar sin correr `next build`, prohibido por las reglas del brazo). Haría falta un `next build` real (fuera de mi alcance de sólo-lectura) para medir el byte final servido.
- **¿Qué Cache-Control real sirve el CDN/host de producción?** No hay `vercel.json`/config de headers custom para `_next/static/*`; asumo el default inmutable de Next/Vercel pero no verifiqué contra un despliegue real.
- **¿El pin roto de `app-platform` (H-E-3) ya tiene un WO abierto del lado de `app-platform`?** No revisé `app-platform/roadmap/` (fuera de alcance de este cluster); el commit `dd3496343` lo asigna explícitamente a "el vertical app-platform" pero no cité evidencia de que exista un work order correspondiente ahí.
