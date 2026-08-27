# Roadmap de ejecución — 2026-08-19 (v3, post doble re-auditoría)

Plan final consolidado tras las dos re-auditorías independientes de Fable:
[`REAUDITORIA-FABLE-2026-08-19.md`](REAUDITORIA-FABLE-2026-08-19.md) (el
diagnóstico) y [`REAUDITORIA-FABLE-2-EJECUCION-2026-08-19.md`](REAUDITORIA-FABLE-2-EJECUCION-2026-08-19.md)
(la ejecución, con 5 asientos paralelos). La ley objetivo es
[`ARCHITECTURE.md`](ARCHITECTURE.md). Toda cifra aquí fue medida al menos dos
veces por asientos distintos.

**Veredicto de la segunda ronda:** el plan es ejecutable en su columna
vertebral; los errores eran "de presupuesto, de denominador y de terreno no
relevado — no de dirección". Esta versión integra el terreno.

---

## 0. Hechos del terreno que ningún documento registraba (medidos por Fable, verificados)

1. **`gat-07-exact-proof` está ROJO en HEAD hoy.** El sello (2026-07-18) lista
   123 archivos de maquinaria; el walk actual encuentra 626 trackeados + 5
   fantasmas. El criterio "gates:ci verde" parte de un piso rojo, y cada
   borrado mueve el artefacto → el resello (`gat07:write`) es una tarea propia,
   secuenciada DESPUÉS de los borrados de cada lote.
2. **Existe 2.19.37 publicado desde un commit colgante** (`a037d3a3c`, fuera de
   toda rama) y app-bithire lo clava e instala. Un bump patch/minor desde
   2.19.36 colisiona. Hay que reconciliar la versión antes de cualquier publish.
3. **app-evnto consume la FUENTE LOCAL viva** por symlink manual en
   `node_modules` (ignora su pin 2.19.29). El publish no es su punto de
   coordinación: cualquier retiro en fuente la rompe al instante. Regularizar
   ANTES de F5/F6 (link declarado o pin honesto — decisión del dueño).
4. **La migración de los 53 archivos `/commercial` de app-platform no tiene
   dueño en ningún roadmap.** La reclasificación ya ocurrió (2026-08-12) con
   destino incompleto: `ProductWindow` se fue al showroom (inalcanzable para
   apps) y ~14 tokens `--ds-commercial-*` fueron renombrados a `--ds-color-*` —
   fallo CSS silencioso que un codemod de especificador no cubre. Se crea el
   lote con dueño en F8 (ver §7).
5. **El PAT de GitHub en `.claude/settings.local.json` ya está en la historia
   de git.** Destrackear no basta: **rotación obligatoria incondicional**
   (acción del dueño, fuera del repo).

## 1. Regla de coordinación de releases (v3)

Todo retiro de API pública viaja en **una major (3.0.0)** con changeset y
codemods; ninguna app sube sin correrlos antes. El canal registry cierra bien
(pins exactos + registry privado + prepack gates). Ventanas residuales y su
cierre:

| Ventana | Cierre |
|---|---|
| evnto symlinkeada a fuente local | Regularizar el symlink ANTES de F5 (F0 lo declara; dueño decide cómo) |
| app-platform `USE_LOCAL_DS` + rebuild de dist | La migración /commercial (F8) precede a cualquier rebuild publicado; el modo local hoy está apagado |
| Publish accidental de patch | Changeset major en F0 + candado de CI extendido a pushes directos (hoy solo cubre PRs) |
| Colisión con 2.19.37 | Reconciliación de versión en F0 (merge del commit colgante o supersede explícito a 3.0.0) |
| `pnpm install` en evnto revierte el symlink | Misma regularización de la ventana 1 |

---

## 2. F0 — Piso honesto + gobernanza de versión

**Precondición:** worktree limpio (ya cumplida: commits `3f1eaad94` +
`763417966`).

1. **Versión:** reconciliar 2.19.37 (commit colgante) y crear el changeset
   **major** que declara lo ya retirado en fuente: `-./commercial`,
   `-./commercial.css`, `-./styles/platform`, los ~14 tokens
   `--ds-commercial-*` renombrados, la desaparición de `dist/platform.css` del
   wildcard `./dist/*.css`, y que `ProductWindow` no tiene sucesor en el
   paquete (pendiente decisión §8.3).
2. **Resello de gat-07** (`gat07:write` + commit) DESPUÉS de los borrados de
   este frente — el piso hoy está rojo y cada borrado lo vuelve a mover.
3. **Borrados de riesgo cero confirmado** (verificados 2-3 veces): 23 carpetas
   vacías de src (+8 del repo, con exclusión estándar son 31 — NO barrer
   `KIMI-ANNOTATIONS/inbox`: tiene propósito declarado en contrato vivo
   `tenant-art-direction.json:363`; documentar su recreación o dejarla); 17
   archivos de codemods de febrero; **13 iconos legacy + `LoaderIcon`** (0
   consumidores — cae ya; `AlertIcon` espera: app-platform readiness +
   showroom probe r2) con el recorte del barrel en el mismo commit; monolito
   `probe/cascade-probe.mjs` + test; 2 agentes `.claude/`; `audit-presets.mjs`
   + `audit-report.json`; `CANARY-MANIFEST.json` +
   `LITERAL-OWNERSHIP-MATRIX.json` (0 referencias; el segundo a docs/history/);
   14 alias duplicados (quedan `engine-audit:check`, `hooks:check`,
   `gat07:check`; actualizar en la misma sesión los 3 docs de docs-engineering
   que citan `tokens:catalog:check`, el README de quality-rubric que cita
   `gate:styles-css`, y anotar el recibo R0 en el changeset).
4. **Los 2 gates sin invocador — adjudicación corregida (no eran riesgo cero):**
   - `channel-wiring-zero-delta-gate.mjs` → **SE RETIRA con enmienda escrita**:
     la ley de lane-control lo declara verificación obligatoria de todo WO
     (`work-order/index.mjs:60,305` + drill + `wo-example.json` + README). La
     enmienda de esos 4 archivos va en el mismo lote. Razón de fondo: su
     doctrina (fallback = literal original byte-idéntico) **contradice la de
     F2** (fallback = `var(raíz)`); el choque queda adjudicado por escrito aquí.
   - `cra-17-integral-gate.mjs` → **SE CABLEA al manifiesto** (no se borra): es
     el instrumento de aceptación nombrado de WO-CRA-17, que sigue `todo`.
5. **Gates nuevos:** `--ds_` (canon de prefijos); exports→artefacto
   **post-build** (junto a `distfresh:check`/`packinv:check`; se declara por
   escrito que los canales lifecycle `prebuild`/`prepack`/`postbuild` son
   cableado legítimo junto al manifiesto); frescura de `root-catalog.json`
   (hoy no lo lee NADIE, ni siquiera un `--check`).
6. **Doc-rot del mismo día:** comentario obsoleto en `ci-gates.manifest.mjs:42-55`;
   byte NUL en `daisy-class-consumer-counter.mjs` — **es funcional** (separador
   de clave compuesta): convertir al escape `\0`, nunca eliminar; alias npm
   `:v2:seal` para `seal-round`; comentario en `pack-inventory-gate.mjs:4,61`.
7. **Regularización del symlink de evnto** (declaración; la acción es app-side).
8. **Limpieza de disco:** `coverage*/`, `showroom/.tmp/`, tarballs viejos.
9. **F0.13 — Adjudicación de los gates rojos restantes.** `gates:ci` es
   fail-fast y hoy muere antes de gat-07 (`channel-liveness-drill`: 6 canales
   `--ds-elevation-{0..5}` sin fila en `SEMANTIC_OWNER_RULES`). Quedan ~20
   gates rojos (handoff): 8 artefactos stale, 4 deuda real de canal (material
   de F2/F3 — esos se eximen por escrito o se mueven a su frente), 3 de forma.
   Cada rojo se adjudica: se arregla la ley, se regenera el artefacto, o se
   mueve el gate al frente que le corresponde con nota. Sin esto, el criterio
   de cierre es inalcanzable.

**Criterio de cierre:** `gates:ci` verde DESPUÉS del resello; `find src -type d
-empty` vacío (menos el inbox declarado); changeset major commiteado.

## 3. F0.5 — La ley `folder/index` en todo el repo

Correcciones de la segunda ronda integradas:

- **Fase 0 (helper de raíz):** dos predicados no ambiguos — `repoRoot` (findUp a
  `pnpm-workspace.yaml`) y `packageRoot` (findUp a `package.json` con
  `name: @rottay/design-system`) — porque ambos package.json comparten nombre y
  los consumidores necesitan las dos semánticas. Los 11 archivos fuera de
  `packages/core` (7 root scripts + 4 showroom) reciben el helper en su propio
  árbol o resolución propia: prohibido importar cruzado entre paquetes. El
  helper NO cubre los **536 imports relativos entre scripts** — ese es el coste
  real de Fase 1, contado ahora.
- **Fase 1 (movidas por familia):** los drills de lane-control sobreviven
  (aserciones por basename/glob). Ojo: la regex de changed-files de
  `ci.yml:55` nombra los scripts de raíz por ruta plana — tras agruparlos no
  falla, **deja de disparar jobs en silencio**: se actualiza en el lote.
  El re-sello de GAT-07 es **por-lote desde esta fase** (sella src, scripts,
  ci.yml y los dos package.json), no un paso de Fase 2.
- **Fase 2 (rename a index):** arreglar los drills que aserten sufijos, re-
  sellar, regenerar los **293** headers de procedencia de iconos.
- **Graduación del manifest (lote atómico):** censo correcto: **38
  referenciantes** (20 externos + 18 internos, contando los 9 joins de
  program-check invisibles al grep literal). `families/` se mueve intacto.
  Cirugía de `..` (generator 7→3; fanout/checklist/parity 5→1). Notas:
  (a) `generator.mjs` importa `customization-surface-census.mjs` (plano, lo
  muda Fase 1) y `v2/contracts.mjs` — **la graduación y Fase 1 están acopladas:
  el lote que corra segundo repuntéa lo del primero**; (b) 4 celdas autoradas
  (flex/grid/space/stack) llevan la ruta vieja en `sourceBindings` — edición a
  mano, no regeneración; (c) `checkpoint.intent.json` **no tiene productor** —
  se edita a mano (la frase "regenerar el checkpoint" era inexacta); (d) el
  criterio `git grep → 0` va con scope (`:!docs :!**/test-artifacts/**`) — la
  historia sellada no se reescribe; (e) extender los drills a los 4 tests del
  manifest que quedan fuera del glob `scripts/**`.
- **Raíz del repo: 16 entradas finales** (7 dirs + 9 archivos — el "14" era mi
  error de conteo; `.npmignore` entra al árbol §2.1 o se retira, se decide).
- **Core:** los 4 JSON publicados a `contracts/` (remapear `exports`/`files`;
  `ds-supplier-honesty.mjs` viaja byte-exact a las apps — se distribuye en la
  misma versión); `KIMI-*` al directorio del programa; censos vivos a su
  capacidad productora; docs de core a `docs/` con `history/` y `runtime/`.
- **Showroom:** agrupar `scripts/`; `vercel-ignore-build.sh` es probablemente
  inerte (`vercel.json:3` define `ignoreCommand` inline con precedencia) —
  verificar en dashboard antes de presupuestar cuidado.

## 4. F1 — Vocabulario cerrado gobernado (re-scoped)

- Los 2 enums vacíos: **el vocabulario YA EXISTE** en `cascade/roots/*.json`
  (`chrome.anatomy` 14 variantes, `profiles.expressive` 34, validado blocking
  por program-check). F1 es un **lift de esa autoridad a `controls/`**, no
  autoría nueva — prohibido reinventar vocabulario divergente.
- `internalChannels`: partición exacta de las 5.100 celdas — 1.462 ya migradas,
  **444 con material fuente** en `targetBinding`, **3.194 sin ninguno**
  (autoría nueva del 62,6 % — el plan ya no lo llama "migración"). Borrar
  `targetBinding` al final toca 4.267 celdas.
- Gobernar la exposición (26 tenant-dial / 27 internal-head / 10 gap): gate que
  lea `root-catalog.json` (frescura + lectura de `exposure`).
- `program-check` gana validación de enum no vacío (hoy no existe en ningún
  lado) + celda gobernada (hoy solo a medias en `rules.mjs:633`).

## 5. F2 — La cascada existe en fuente (ratchet corregido)

- Materializar las 12 raíces `por-crear` (tienen `channel: null` — incluye
  bautizarlas; es inerte para la pintura: nadie puede leer un nombre que no
  existe).
- **Ratchet nuevo** (obra nueva; no existe contador que clasifique por nombre):
  ancla en `engine-token-audit.baseline.json`, con dos reglas de construcción:
  (a) **las raíces/rampas quedan FUERA del denominador** (297 nombres que son
  destino de fallback no cuentan como deuda — si no, recablear bien puede subir
  el contador); (b) un fallback **funcional** que alcanza raíz
  (`var(--ds-x, color-mix(… var(--ds-raíz) …))`) SÍ cuenta como cableado —
  ARCHITECTURE §1.6 lo declara. Baseline real tras esas reglas: ~2.055 nombres.
- **Dependencia inversa F2 ← F4:** las **22 raíces con asignaciones asimétricas**
  (9 con un tema en cero, ej. `tier.overlay.bg` con evnto 0) se recablean
  DESPUÉS de asignar el valor del tema (trabajo de F4) o con cero-delta
  estricto — si no, cambia la pintura de ese tema antes de la armonización. El
  recableo se secuencia raíz por raíz: primero las 41 simétricas.
- Enchufar `fanout-facts` y `mirror-parity` al manifiesto con `--check`
  (frescura; la paridad real es F4). La red visual (462 PNG, job `visual` de
  CI) cubre el recableo.

**Enmienda de secuencia vinculante (dueño, 2026-08-20):** F2 se agota primero
en todo lo que sea demostrablemente seguro. El lote F2.4 que ya está abierto
**no se cancela ni se revierte** y puede continuar con todos los clusters que
demuestren cero-delta computado contra los artefactos de las tres verticales;
no se limita artificialmente al packet actual. «Misma pintura» significa
igualdad de propiedades computadas tras resolver la raíz; no alcanza una
sustitución textual plausible ni que el gate de frescura pase. Cada packet
debe declarar la raíz, los canales drenados, los tres resultados verticales,
el negativo y la restauración del artefacto.

Se siguen abriendo clusters F2 seguros hasta agotar ese conjunto. No se abre
un cluster si necesita inventar el valor de una raíz, si una
vertical no tiene asignación, si el cambio elimina una restitución que hoy
compensa una asimetría, o si el theme leaf todavía sombrea el control. Esos
casos quedan bloqueados por **F4A + F4B**. Por lo tanto, al cerrar el packet
F2 seguro exhaustivo, la secuencia operativa deja de ser `F2 → F3 → F4` y
pasa a ser:

```text
F2 seguro exhaustivo → F4A canon estructural → F4B calibración de los 20 controles
  → F2 diferido/asimétrico → F3 skins + craft → F4C art direction premium
  → F5 → F6 → F7 → F8 → F9 cierre de certificación
```

La razón es evitar que F3 traslade hardcodes a skins o que F2 cablee miles de
consumidores contra una autoridad de theme que F4 tendría que cambiar después.
La enmienda no cambia la arquitectura decidida: ordena sus dependencias y hace
explícitas dos puertas de aceptación que el plan anterior dejaba implícitas.

### Enmienda del owner — paridad profunda y normalización real de vertical themes (2026-08-26)

El cierre estructural anterior mediante placeholders no satisface por sí solo
el producto esperado. “Mismo roster” no significa solamente que una ausencia
esté comentada: los tres first-party themes deben resolver la misma superficie
semántica con igual profundidad contractual, preservando valores e identidad
visual diferentes.

Esta enmienda no interrumpe F2A. Es un criterio bloqueante de entrada y salida
para F3/F4C.

##### Contrato obligatorio

1. Rottay, BitHire y Evnto tendrán el mismo contrato tipado de seeds, con el
   mismo inventario, nombres, orden, documentación y unidades. Los valores
   serán propios de cada vertical.
2. La salida normalizada de los tres themes tendrá exactamente el mismo
   inventario de keypaths y canales requeridos. Se permite que un valor sea:
   - `AUTHORED_SEED`;
   - `DERIVED`;
   - `EXPLICIT_INHERIT`, citando su autoridad compartida;
   - `PRO_EXPERT`, dentro de la allowlist;
   - `OPTIONAL_DISABLED`, sólo para capabilities realmente opcionales.
3. `@domicile unassigned` es un estado transitorio de migración. El objetivo
   terminal es cero `unassigned` sobre la superficie semántica requerida.
   Un placeholder no cuenta como una vertical diseñada.
4. Las diferencias entre verticales deben vivir en seeds, variantes, recipes,
   anatomía, estados, responsive posture e invariantes justificadas; nunca en
   una repetición accidental de literales de hoja.
5. Una capacidad opcional puede no estar autorada, pero su disposition debe
   ser explícita y tipada. No se exige copiar capacidades inaplicables para
   fabricar simetría falsa.
6. La precedencia tenant-last ya adjudicada permanece intacta: ninguna
   decisión vertical puede volver a sombrear un canal público expuesto.

##### Ley de literales y derivación

- Un literal sólo es admisible en la definición superior de una seed,
  variante o invariante vertical justificada.
- Todo valor inferior debe derivarse mediante una raíz, alias, `var()`,
  `calc()`, `color-mix()` o función canónica del compiler.
- Un leaf no puede repetir un hex, `rgba`, gradiente, sombra, radio, tamaño,
  duración o mezcla que ya representa una decisión superior.
- Los aproximadamente 3.275 canales registrados como candidatos de colapso
  deben adjudicarse y cerrarse; registrarlos no equivale a normalizarlos.
- No se crea un segundo `foundation` dentro de `brand-themes`.
- Los CSS de `facade/artifacts` y `styles/*.css` siguen siendo generados:
  nunca se corrigen manualmente.

##### Gates obligatorios

F4C no puede cerrar hasta demostrar:

1. mismo schema de seeds para los tres themes;
2. `effectiveSurface.union == effectiveSurface.intersection` para todos los
   keypaths requeridos;
3. cero required keypaths silenciosos;
4. cero `unassigned` requeridos;
5. cero literales de hoja no allowlisted;
6. cero repeticiones literales que sombreen una seed o control;
7. cada literal superviviente clasificado como seed, invariante justificada
   o Pro/Expert allowlisted;
8. los 20 controles públicos mantienen canary, negativos y restore exacto;
9. static y DB producen la misma forma normalizada;
10. challenge técnico y visual independiente para Rottay, BitHire y Evnto,
    incluyendo light/dark, responsive, estados, contraste y tenant overrides.

La igualdad exigida es de contrato, profundidad y superficie resuelta; no de
valores ni de identidad visual. Cada vertical debe terminar deliberadamente
distinta y premium.

**Adjudicación DT — puerta de entrada de F3 bajo la enmienda (2026-08-27,
tras la revisión Codex que pescó que F3 se abrió sin esta escritura):** la
enmienda es puerta de ENTRADA y salida para F3/F4C. Para la entrada de F3
rigen como LEY DE TRABAJO la ley de literales/derivación y la precedencia
tenant-last: ningún lote de F3 puede transportar hardcodes, repetir un
literal de hoja que una decisión superior ya representa, ni crear un segundo
`foundation` — y el piloto en vuelo la cumple. Los 10 gates obligatorios son
de CIERRE de F4C (texto expreso de la enmienda: "F4C no puede cerrar hasta
demostrar"); exigir su existencia antes de F3 invertiría la cola vinculante.
Queda escrito que los diferidos de F2 (channel-liveness 49 hallazgos,
tenant-reachability 10/13, los 2 gates excluidos, la propagación mode-aware
de la decisión 18) NO están resueltos — están diferidos con dueño (F4C/F5) y
no condicionan la entrada de F3 porque son de la capa de contrato/validador,
no de la migración de pintura; si esta lectura es errada, el owner la corrige
y F3 se pausa. **Ningún segundo lote F3 se abre hasta que el piloto cierre
(postaudit Fable + commit + asiento)**, y el piloto no commitea hasta que la
repetición `13px`×3 quede centralizada o clasificada como UNA seed/invariante
(ley de literales; hallazgo Codex). Ley operativa F3 (Codex, adoptada): las
migraciones se acumulan en cohortes coherentes y la cadena derivada se
regenera UNA vez por cierre de lote. **Métrica corregida tras la revisión:**
60–62% (Codex) vs 63–65% (mi asiento anterior, que no descontaba el scope
nuevo de la enmienda) — se asienta **62%** ingeniería / ~43% comercial.

## 6. F3 — La pintura vive en las skins (posterior a F4A + F4B)

**Gate de entrada:** F4A cerrado, los 20 controles con F4B cerrado y los
clusters F2 asimétricos que esas decisiones desbloqueen ya recableados. F3 no
puede usarse para decidir la semántica de una raíz, reparar paridad de themes o
ocultar un control que no baja por ambos transportes. Su trabajo es trasladar
pintura ya gobernada y después elevar craft sobre una cascada estable.

- Clasificación medida del piloto v3 (2026-08-27; SUPERSEDE a la cifra
  histórica "17 dinámicas / 209 estáticas migrables"): el regex
  `var\(--ds-[a-z0-9-]*\$\{` mide **construcción de referencias, no deuda de
  pintura**. Universo medido: **97 ocurrencias de producción** = 37 residuo de
  migración ya hecha + 31 dinámicas legítimas por MECANISMO (resolver
  prop→canal; 17→31 al clasificar por mecanismo y no por archivo) + 11
  accesores públicos que no pintan + 7 indirección arquitectónica justificada
  (adjudicadas: NO se migran) + 4 dominio no cerrado + 2 infraestructura de
  compilador + 2 piloto verificado + 3 sin verificar en profundidad → la
  **superficie F3 genuina es de UN dígito** (ver asiento del piloto en §13).
  El progreso F3 se ancla en la superficie genuina medida, no en el pool del
  regex.
- Pasada de craft por familia contra raíces (Quiet Premium).
- ~~Cerrar deuda chart-series~~ → se mueve a F5 (depende de la absorción de
  `appearance/`, no de skins).

## 7. F4 — Themes canónicos, controles causales y art direction premium

F4 se divide en tres cierres distintos. «Theme espejo» describe **la misma
superficie semántica**, no valores iguales ni tres archivos copiados. La
estructura debe coincidir; la identidad de cada vertical debe seguir siendo
propia.

### F4A — Canon estructural de los tres themes

- **Diseñar el esquema de asignación de variantes** (no existe: el catálogo
  tiene conteos, no nombres/valores de variante; 37 de 63 raíces —27
  internal-head + 10 gap— no reciben variantes de ningún control). Esto es
  diseño, no solo ejecución.
- Rottay, BitHire y Evnto quedan con el mismo roster, orden, comentarios,
  keypaths y disposición de capability. Una ausencia debe ser una invariancia
  o gap escrita; nunca una omisión silenciosa ni un roster menor.
- Cada valor autorado se adjudica en uno de cuatro domicilios existentes:
  (a) seed/variante gobernada por un tenant-dial; (b) baseline o invariante
  vertical con razón; (c) internal-head derivado por una función/raíz citada;
  (d) Pro/Expert explícito y acotado. Si no entra en ninguno, no se conserva
  por costumbre: queda bloqueado hasta adjudicación o retiro.
- **Ley de hardcodes:** un literal es legítimo en el punto superior donde la
  vertical elige su seed, variante o invariante. Un leaf que reexpresa esa
  decisión debe derivar de la raíz/canal; no puede repetir un hex, sombra,
  tamaño o mezcla que sombree la personalización. Tampoco se crea un segundo
  `foundation` dentro de `brand-themes`: foundation, compiler y theme tienen
  un dueño cada uno.
- F4A reescribe los 3 themes como el roster mínimo de asignaciones gobernadas
  (estimación vigente: ~263) y registra los ~3.275 canales derivables como
  candidatos de colapso; **todavía no hace craft premium ni colapsa en masa**.
- **Salida F4A:** paridad estructural blocking, cero keypaths sin domicilio,
  cero leaf shadowing no justificado, mismo lowering y artefactos frescos. El
  valor visual puede seguir siendo el baseline previo; la forma ya no.

### F4B — Calibración causal de los 20 controles públicos

El cierre de vocabulario de F1 y el cableado de F2 no prueban que un dial del
usuario funcione. Antes de acreditar propagación mecánica, cada uno de los 13
controles Standard y 7 Pro debe cerrar un receipt con:

1. dominio y stops admitidos por la autoridad viva;
2. path de ingreso estático `BrandTheme` y path DB `TenantThemeDocument`;
3. normalización a un `Theme` total y entrada al mismo `compileTheme` — un
   segundo emisor es STOP;
4. salida normalizada equivalente para ambos transportes;
5. canary representativo que cambia una propiedad computada observable;
6. negativos que prueban qué propiedades/familias no deben cambiar;
7. input inválido fail-closed y límites efectivos cuando correspondan;
8. restauración exacta del default en salida normalizada, variables, atributos
   de raíz y propiedad computada.

Los controles cuyo terminal legítimo sea dato normalizado, no CSS, demuestran
ese terminal y no inventan una variable para «cumplir». Ninguna fila gana
`APPLICABLE`, `COMPUTED_VERIFIED` o equivalentes sólo porque existe un mapping,
un `targetBinding` o una ley escrita. **Salida F4B:** matriz de calibración
20/20, sin segundo lowering, con receipts reproducibles y challenge read-only.

Con F4A + F4B cerrados se retoma F2 exclusivamente para las raíces/colas que
estaban bloqueadas por asimetría. Recién cuando esas colas pasan sus pruebas de
delta y restore se abre F3.

### F4C — Art direction premium sobre controles estabilizados

- Después de F3, los tres themes reciben una iteración de diseño diferencial:
  Rottay, BitHire y Evnto deben comunicar su vertical, no ser recolores de una
  misma composición. El vocabulario es el estabilizado en F4A/F4B; una idea de
  diseño que requiere un eje nuevo vuelve a contrato y no se hardcodea en un
  leaf.
- El craft se expresa mediante seeds, variantes, roots, recetas, anatomía y
  estados gobernados. Classic/Rustic reciben sólo compatibilidad necesaria;
  la inversión de calidad se concentra en Modern.
- La aceptación requiere challenge visual y técnico independiente. Quien actúa
  como DT no se cuenta a la vez como auditor independiente. Se revisan light/
  dark cuando aplique, estados interactivos, contraste, densidad, tipografía,
  motion, superficies, navegación y coherencia entre familias.
- **Gates del lote:** `vertical-css-source-staleness`,
  `first-party-artifacts-source-staleness`, los 4 checks de
  `customization-surface-census` (incluido `dead-writers`),
  `theme-channel-parity --check`, regeneración de
  `generated/mirror-parity.json` + `fanout-facts.json`, canaries F4B intactos y
  revisión sighted de las tres verticales.
- **Revisión sighted de F4C absorbe (decisión del owner, 2026-08-26):** la
  evaluación sighted A/B light/dark de la delta visible de glass de BitHire
  producida por el Lote F″ de F2A (decisión 20.ii). La evidencia se produce en
  F″ igualmente (artefactos/escenas por Fable) y el control de contraste
  gobernado sigue siendo gate del lote; lo que se mueve es el MOMENTO de la
  lectura sighted, que vive acá y no frena F2A.
- **Salida F4C:** paridad estructural blocking, valores verticales premium,
  cero shadowing regresado y los artefactos generados como salida — nunca como
  fuente editada.

## 8. F5 — Una capacidad, un dueño (lotes completos)

- **Paso transversal por retiro** (ley CLAUDE.md: atómico): owner + entrypoint +
  **skin CSS propio** + **fila de familia del manifest** + showroom (registry,
  navigation, ruta, fixtures compartidos, probes, torture, arrays de prosa) +
  capturas (~9 PNG a borrar, ~8 a regenerar) + contract tests de lote. No hay
  roster genérico para structures/patterns — el checklist manda.
- **Chrome pairs (canónico por par, §0 de la ronda 1):** los 4 retirados tienen
  0 consumidores internos de producción, **pero apps sí**: `TableToolbar` (3
  archivos prod app-platform), `SavedViewsMenu` + `FieldFiltersPanel` (en
  `entity-table-workspace`, el corazón admin), `ColumnSettings` (re-exports en
  bithire/evnto). Codemods nuevos en F8 — ojo: `SavedViewsMenu` →
  `PatternSavedViewsBar` es **cambio de anatomía** (dropdown → barra), se trata
  como el caso Link: migración explícita, no rename silencioso.
- **record-workbench → DetailSurface:** confirmado sin gap de capacidades (las
  3 pantallas de compliance no usan related-records ni history); migración de
  modelo (props → funciones, `metadata` → `sidebar()`); el adapter vive en
  `pages/data/detail/index.tsx:59`; su import directo de rol de icono no migra.
- **`appearance/`:** el orden declarado cubre a los 2 consumidores TS; además
  hay que re-anclar **5 anclajes de tooling** (`audit-integration`,
  `chart-series-reserved-name-gate`, `ds-hook-manifest`, `v2/drills.test`,
  `lane-control/tenant-reach`) + **5 tests cross-unit**. Al absorberlo, el pin
  de chart-series vuelve a 1 (antes F3, ahora aquí).
- **Convergencias:** `mono-stat` sobre `useSmoothCounter` (ejecutable);
  `terminal-block` exige **extraer primero el sustrato de Typewriter** (hoy
  solo exporta componente); `grid-view`/`gallery-view` comparten
  `item-identity`; `command-center` borra interfaces+mappers PERO
  `StatItem`/`ActivityItem` son props de 3 pantallas de app-platform → codemod
  propio en F8; `PatternEmptyState` delega en `Empty`; `calendar-view`/
  `timeline` componen sus primitives.
- **`Callout`→`Alert` es absorción limpia** (las 2 citas son docstrings; mi
  nota de "deshacer dependencia" era un falso positivo — corregida).

## 9. F6 — Frontera pública honesta (coste completo)

- Retirar 75 subpaths granulares (los 2 con importador showroom — ambos desde
  `showroom-tenant/index.tsx` — migran primero). Gates a satisfacer:
  re-anclaje COMPLETO de `pack-inventory.baseline.json` (~6.381 paths de dist,
  no una línea), `core-structure-audit` (identidad decrease-only),
  `v2/inventory-correspondence`, `cra-14-public-barrel-gate`, `analyze-bundle`,
  y reescritura explícita de `public-entrypoints.manifest.json`. La maquinaria
  de `migrate-public-entrypoints.mjs` (condenada) puede servir de base para el
  codemod inverso — evaluar antes de borrarlo.
- Lista explícita de API en el barril raíz (15 `export *` + nombrados hoy).
- **Extirpación platform completa:** lo del plan + `residual-adjudication.json`
  (src, dato vivo), `docs/reference/tokens/README.md`, `docs/premium-styling-track/`,
  `styles/index.css:4`, y **el consumidor real: `app-platform/globals.css:14`
  importa `dist/platform.css`** — migrar a `styles/rottay` (byte-idéntico) en
  F8 antes de regenerar/publicar dist.

## 10. F7 — Higiene del repo

Sin cambios salvo: repuntear 7 scripts (no 8); evidencia `cra-16` huérfana
(decisión §11); v1 de quality-evidence fuera (el receipt R0 queda como
transcripción); plegado de `packages/core/ARCHITECTURE.md` (anexos →
`docs/runtime/`); correcciones de READMEs (263→282, platform→rottay, badge TS);
`CLAUDE.md` del monorepo padre sigue vencido (99 WOs) — fuera de este repo,
anotado.

## 11. F8 — Las apps entran al sistema

- **Precondición:** symlink de evnto regularizado (ventana 1, §1).
- **Codemods (100 % trabajo nuevo — no existen):** `Space`→`Stack` (**36**
  archivos), `ConfirmDialog`→`AlertDialog` (17), `Toggle`→`Switch` (8),
  `Link`→`TextLink` (3; fase 1: crear `TextLink` primero — no existe),
  `FloatButton` (1 archivo con 5 formas de uso), chrome pairs (4 codemods,
  uno con cambio de anatomía), `StatItem`/`ActivityItem` (3 pantallas),
  `AlertIcon` (2 sitios: platform readiness + showroom probe r2),
  `globals.css` → `styles/rottay`.
- **Lote `/commercial` (con dueño, nuevo):** migrar los 53 archivos de
  app-platform: especificadores → barril raíz + **renombre de ~14 tokens
  `--ds-commercial-*` → `--ds-color-*`** (fallo silencioso de CSS — verificación
  visual obligatoria) + decisión de `ProductWindow` (§12.3) + retiro del alias
  webpack + re-anclar `dependency-honesty.mjs` (que hoy EXIGE el alias) +
  `local-ds-boundary.test.mjs` de platform.
- **Ratchet vendor de iconos:** vive en `dependency-honesty` (modo apps, ya
  resuelve `../app-*`) + gate copiado en el CI de cada app (patrón
  `ds-supplier-honesty`). No es ejecutable desde el CI del DS.

## 11-bis. F9 — Cierre final familia × control

F1 hizo que cada celda tuviera ley; no la convirtió en evidencia. El estado
vigente al adoptar esta enmienda sigue siendo **255 familias × 20 controles =
5.100 celdas**, todas `UNKNOWN`, con cero `COMPUTED_VERIFIED` y cero
`SIGHTED_ACCEPTED`. Esa verdad se lee de `manifest/index.json`; **252 permanece
histórico y no reaparece**.

- F9 corre después de estabilizar F5/F6 y migrar F8. Si una absorción de F5
  cambia realmente el roster, el nuevo denominador se actualiza en un solo lote
  atómico en `family-inventory`, `program.json`, segmentos del manifest,
  generator/index y checks. Hasta que ese lote exista y pase, 255×20 sigue
  siendo la única verdad operativa.
- Se visita cada pareja familia/control y se adjudica exactamente como
  `APPLICABLE`, `INVARIANT_WITH_REASON` o `NOT_APPLICABLE_WITH_REASON`.
  `UNKNOWN` bloquea el cierre; ausencia nunca significa «no aplica».
- Las aplicables citan partes/estados/grupos de propiedad, channels y bindings;
  prueban deltas computados, negativos y restore. Las invariantes/no-aplicables
  llevan razón falsable y prueba de no-alcance.
- El mapping, `SOURCE_BOUND`, una fila vacía o una marca de adjudicación no son
  quality points. La promoción a `COMPUTED_VERIFIED` y `SIGHTED_ACCEPTED`
  conserva la escalera del programa y su autoridad de aceptación.
- **Criterio de cierre:** `UNKNOWN = 0`, ninguna familia sin review, receipts
  estático/DB y restore frescos, manifests/artefactos regenerados por su dueño,
  `program-check` y gates blocking verdes, auditoría independiente final y
  checkpoint de punto cero. Sólo entonces «Modern Rescue completo» es una
  afirmación permitida.

## 12. Decisiones del dueño

**Tomadas (2026-08-19):**

1. **Versión:** supersede explícito a **3.0.0** — todos los retiros de API
   pública viajan en una major; 2.19.37 queda como dead-end del registry
   (bithire pineado sigue funcionando hasta su fase vertical).
2. **`cra-17-integral-gate`:** **se cablea al manifiesto** como gate bloqueante
   (respeta el contrato de WO-CRA-17 sin enmienda).
3. **`channel-wiring-zero-delta-gate`:** **se retira con enmienda escrita** de
   los 4 archivos de lane-control que lo exigen (su doctrina contradice F2).
4. **Canales de cableado:** **se declaran legítimos por escrito** — el
   manifiesto + lifecycle hooks (prebuild/prepack/postbuild) + ci.yml son todos
   canales válidos; el gate de wiring los cuenta todos.

**Pendientes — adoptadas las recomendaciones del DT (dueño, 2026-08-19):**

5. **Symlink de evnto:** link declarado y documentado mientras dure la
   reconstrucción; pin honesto al publicar 3.0 (se trata en F5/F8).
6. **`ProductWindow`:** se decide en la fase de app-platform al reclasificar
   commercial; hoy no bloquea nada del DS.
7. **`map-view`:** **se retira** (un placeholder sin provider no es capacidad).
8. **Evidencia `cra-16`:** **se archiva** en test-artifacts con nota de
   "productor retirado" (F7).
9. **Las 10 raíces `gap`:** **backlog aceptado**; se abren diales solo cuando
   un tema los necesite.

**Tomadas (2026-08-20, enmienda de secuencia):**

10. **F2 seguro se termina de forma exhaustiva:** el F2.4 en vuelo no se
    revierte y puede encadenar todos los clusters con cero-delta computado en
    las tres verticales. Sólo el residuo que necesita una decisión de theme se
    difiere a F4A/F4B; no se inventa una asignación para declarar F2 cerrado.
11. **F4 se divide y se adelanta en parte:** F4A y F4B preceden a F3; las colas
    F2 asimétricas se cierran entre F4B y F3; F4C premium corre después de F3.
12. **F9 es obligatorio:** gobernado no significa certificado; el programa no
    cierra mientras `UNKNOWN` sea distinto de cero.
13. **Autoridad de agentes:** esta enmienda no permite que un mismo actor sea DT
    y auditor independiente. La identidad operativa vigente debe reconciliarse
    atómicamente en `AGENTS.md` y las autoridades/checkers de Modern Rescue;
    este Markdown no las sobreescribe por sí solo.

**Tomadas (2026-08-25, relevo Codex → DT Kimi K3):**

14. **F8 tiene alcance acotado:** sólo **BitHire** entra como vertical activo;
    app-platform/Rottay y Evnto quedan en **HOLD**. Esto NO reduce las 5100
    celdas de F9 ni permite declarar F8 globalmente completo: el cierre de F8
    se reporta como "F8-BitHire", nunca como F8 entero.

**Tomadas (2026-08-25/26, F4B-17B, formalizadas por el DT):**

15. **Opción 2 del STOP #1:** `--ds-surface-card` sale de `derivedChannels`
    (3→2). La superficie de atribución de calibración se alinea con la ley K
    ("and nothing wider"); el dominio público de 290 claves queda intacto —
    el canal sigue siendo autorable por tenants. **ENMIENDA (2026-08-26,
    cierre C5):** la formulación queda superseded por α1 — `--ds-surface-card`
    VUELVE a `derivedChannels`, que pasa a significar radio de impacto
    representativo real (3 seeds), y la superficie de calibración estrecha se
    muda al campo nuevo `calibrationChannels` (2 canales, subconjunto
    fail-closed drilleado). El INTENT se conserva entero: la sonda atribuye 2
    canales y el dominio público de 290 sigue intacto.
16. **Opción 3 del STOP #2:** `token-overrides` acepta **SOURCE_BOUND como
    techo permanente** de su clase (CSS-terminal + puerta estática sellada)
    bajo el instrumento actual, documentado — sin fabricar receipts contra la
    ley de equivalencia. La rama de veredicto single-arm para la clase
    sealed-door queda como candidato F5
    (`F5_INSTRUMENT_SEALED_DOOR_SINGLE_ARM_VERDICT`) con las dos condiciones
    de admisión de Fable.

**Tomadas (2026-08-26, relevo Kimi K3 ya en el asiento; formalizadas por el DT):**

17. **evnto dark `palette.textPageColor` = opción B: `#A8A898`** — el
    text-secondary dark propio de evnto (contraste 7.77:1). No se conserva el
    par accidental de 1.72:1 (opción A, espejo puro). Esto DESBLOQUEA el packet
    T0 (re-apriete del mirror theme-iso; la exclusión
    `TEXT_PAGE_COLOR_MODE_ASYMMETRY` es INTERIM hasta T0) y cambia el render de
    evnto dark: la tinta de página recibe scope dark autoral por primera vez.
    Domicilio: F2 asimétrico (packet T0 propio).
18. **El seed global del tenant impacta TODOS los modos, incluido el
    no-default, en los canales públicos expuestos.** La vertical es baseline,
    no invariante. La derivación será mode-aware con el piso APCA compartido;
    un override explícito del tenant para un modo específico prevalece sobre su
    seed global. Implementación: **F5**. Cierra la pregunta de producto abierta
    en la re-adjudicación M-1 de la clase `OPEN_VERTICAL_CASCADE_DEFECT`.

**Tomadas (2026-08-26, F2A-1, clase anti-puerta descubierta por el consenso Opus):**

19. **El dial público manda (opción A), con precisiones.** Ningún brand-theme
    puede anular silenciosamente un dial gobernado con un literal terminal.
    (i) `--ds-glass-blur`: aceptado que BitHire pase de 12px a 6.96px con su
    effectIntensity 0.58 — es el significado del dial. (ii)
    `--ds-input-md-font-size`: la identidad base de BitHire (13px @ escala 1)
    se PRESERVA pero expresada causalmente (seed/base 13px ×
    `--ds-type-scale`); prohibido copiar la referencia de Rottay (la llevaría
    a 14px). (iii) `--ds-input-md-line-height` / `--ds-input-md-icon-size`: NO
    se atribuyen automáticamente a `typography.scale` — primero se asigna el
    dueño correcto (tipografía / densidad / perfil de iconos / invariante
    vertical; paso DT pendiente) y después se calibra. (iv)
    `--ds-button-md-radius` queda intacto (ya conserva el factor).
    **Ley final:** una vertical puede decidir su seed o coeficiente propio,
    pero no puede congelar el resultado terminal de un control público sin una
    excepción explícita y visible. Ejecución: Lote F′ de F2A.

**Tomadas (2026-08-26, sobre el inventario medido de los 28 congelamientos pendientes):**

20. **Autorizado el Lote F″ sobre los 28 pendientes del dial-authority, con
    cuatro condiciones** (texto aprobado por el owner sobre la revisión Codex):
    (i) los 14 de `type-scale` y los 11 de `rhythm` se vuelven causales con
    **cero-delta a factor 1, por canal y por modo**, escalando
    **individualmente cada componente** (en paddings de dos/tres valores y
    `clamp()` no se multiplica la cadena como texto opaco; se conserva el
    comportamiento responsive y se prueba contra doble escalado);
    (ii) `glass-bg` y `glass-border` **conservan sus semillas cromáticas
    BitHire** multiplicadas en intensidad por el dial — aceptada la delta
    visible en baseline 0.58, con control de contraste gobernado en el lote;
    **la evaluación sighted A/B light/dark se domicilia en la revisión
    sighted de F4C** (decisión del owner, mismo día — F4C absorbe esa lectura;
    F″ produce la evidencia pero no se frena por ella) — y **prohibido** caer
    en los valores glass genéricos o introducir doble escalado; (iii) `badge-radius` queda
    como **excepción owner-visible** (primera entrada del registro
    `exceptions` del dial-authority-gate): un pill permanece `radius-full`,
    INVARIANT_WITH_REASON, con prueba negativa de que sigue siendo pill cuando
    `radius-scale` se mueve; (iv) nada de esto autoriza caer a los genéricos
    ni doble escalado.

**Regla de alcance vigente (del dueño, 2026-08-19):** el DS primero; las apps
después, vertical por vertical. Libertad para **publicar versiones**; **push
prohibido**. Las ventanas de rotura de apps (§1) dejan de bloquear la
ejecución y pasan a ser checklist de la fase de cada vertical. El DT trabaja
autónomo; **Fable audita cada hito antes de pasar al frente siguiente**; este
roadmap se mantiene al estado real (ver §13).

---

*Fuentes: DIAGNOSTICO, DEPURACION-SCRIPTS, CONFORMIDAD-SRC, REAUDITORIA-FABLE
×2. Todo número de este roadmap fue medido al menos dos veces o queda marcado
como heredado.*

---

## 13. Estado de ejecución (vivo — se actualiza con cada lote)

### Libro mayor único del DT — estado vigente 2026-08-21

**Este roadmap es desde ahora la única escribanía durable del programa.** Toda
medición, adjudicación, implementación, prueba, rechazo, aceptación, bloqueo y
siguiente paso se registra acá. El handoff externo queda deprecado como simple
puntero a este documento; no conserva estado paralelo. La regla de escritura es:

1. trabajo en curso se registra en esta sección con estado explícito
   `READ-ONLY`, `PENDIENTE`, `REJECT` o `ACCEPT_WITH_CORRECTIONS`;
2. sólo una implementación con pruebas causales seriales, inspección DT y
   postaudit Fable `ACCEPT` se registra como cierre `✅`;
3. `roadmap/registry.json` y `checkpoint.intent.json` se actualizan cuando el
   tranche correspondiente los gobierna; no se inventa progreso para hacerlos
   coincidir;
4. cada asiento conserva HEAD/preestado, write-set, hashes de memos, gates,
   stop conditions y próximo paso, para poder reanudar desde cero sin memoria
   de la sesión.

#### Autoridad y roles vigentes

- Repo: `/Users/daniel/Developer/Rottay/ui-design-system`.
- HEAD anclado al abrir este asiento:
  `9d5582dfdf1d02f1d7e8fd468720b1d829e50454`
  (`chore(modern-rescue): hand DT control back to Codex`).
- Preestado: worktree limpio; staged 0.
- Codex: DT y autoridad de adjudicación.
- Claude Opus: arquitectura e implementación de riesgo medio.
- Claude Sonnet Max: medición e implementación mecánica bajo brief cerrado.
- Fable 5: auditor formal estrictamente read-only.
- **Kimi K3 está fuera por varios días y no es gate, auditor, implementador ni
  dependencia**, por aclaración explícita más reciente del owner. Toda cláusula
  histórica `OPEN_KIMI`, `Kimi bloqueante`, `doble ACCEPT Fable+Kimi` o
  equivalente queda superseded. Las decisiones abiertas pasan a `OPEN_DT` y se
  resuelven por Codex con propuesta Opus y challenge Fable.

#### Cierres firmes que sostienen el frente actual

- F0/F0.5/F1/T-1 de transferencia: cerrados según sus asientos históricos.
- F2 seguro: cerrado; la cola asimétrica permanece detrás de F4B.
- `program-check.mjs`: `CONSTITUTION_READY` sobre el HEAD anclado.
- F4A está cerrado hasta F4A-13. No se reescriben sus asientos históricos; las
  correcciones nuevas se registran en la cadena 14/15/close de abajo.

#### F4A-14 / K4 — plano de raíces

K4 es una reparación documental del plano de raíces: 8 repairs contractuales,
3 no-op preservados y 5 ausencias preservadas. No materializa themes, no cambia
pintura y su write-set eventual exacto es:

1. `packages/core/manifest/cascade/root-catalog.json`;
2. `docs/f4a/roster-variantes.json`;
3. `docs/f4a/roster-variantes.md`.

Cadena read-only/preaudit:

- Opus v1 `/private/tmp/f4a-14a-opus-implementation-brief.md`, SHA
  `bb44393a163e1624b75b2d2fbab572b3c50dc71bfc4dd97526c15cf16fa14837`;
  Fable REJECT v1 `/private/tmp/f4a-14a-fable-preaudit.md`, SHA
  `50b307dedc89c751c9b77096d8a0a0dd5470258af76e985faa4c0203932adbd2`.
- Opus v2 SHA
  `99b31ed5fcd849fe008232a2097a971c5442ac5f70b66f184913b6801be00e76`;
  Fable REJECT v2 `/private/tmp/f4a-14a-v2-fable-reaudit.md`, SHA
  `adb815ef7f30dd2d3be5c860271424fd6dbb562ad9556f22a5051949f8e3e53b`.
- Opus v3 final `/private/tmp/f4a-14a-opus-implementation-brief-v3.md`, SHA
  `06ecaa76c0a54b018fa91ca5d1bc68326e83e0af8af49c7779361a9ec0622ff1`;
  Fable `ACCEPT` `/private/tmp/f4a-14a-v3-fable-reaudit.md`, SHA
  `22c39c6de36f75cd78e53f192f00106af249db033cd20a0e3f559d41cc0f5918`.

Verdad reproducida: 64 raíces suman `268 = 101 + 97 + 70`;
`tier.page.ink` explica drift `+5`; K4 resta 7 y debe dejar
`261 = 95 + 96 + 70`. Se preservan BitHire base+dark en raised/overlay
foreground, `effectIntensity=0.58`, declinaciones Rottay/Evnto y cero
materialización.

**K4 CERRADO — implementación y postaudit 100%.** Sonnet Max implementó el
write-set exacto de tres paths y emitió `SOURCE_READY` en
`/private/tmp/f4a-14a-reporte.md`, SHA
`20d748556bc9272cd74331701ee7138c1dde25000d1d3fb3bae971e5f407f088`.
Fable inspeccionó el diff completo, re-derivó la aritmética y dio `ACCEPT` en
`/private/tmp/f4a-k4-fable-postaudit.md`, SHA
`e81d965fd51643e6c2a05f0fbcdddc51b6312e793aa8fd91a23b7768472174f4`.
Resultado: 64 raíces; assignments `261 = 95 + 96 + 70`; estados de canal
`47 existe / 10 por-crear / 7 solo-artefacto`; exposure `26/28/10` intacto;
198 entries de roster, 16 reparadas dentro de las ocho raíces objetivo y 174
fuera byte-idénticas. `control.ratio.iconSize` queda explícitamente parcial y
su canal se adjudica en F4A-close; no se vende como cerrado. Cero cambio de
theme, valor, artefacto o pintura; staged 0 y `git diff --check` verde.

#### F4A-15 / K5 — Table, unión semántica y decisiones abiertas

Cadena de medición/adjudicación, toda read-only:

- Sonnet `/private/tmp/f4a-15-k5-sonnet-inventory.md`, SHA
  `5ea2c0eaef80e802730ae44f139d736565b1f2d51286d8d1adf6b7bd0c2bf2a2`.
- Opus v2 `/private/tmp/f4a-15-k5-opus-adjudication-v2.md`, SHA
  `3590a3234222bb74386e2dac4cfd945ee064ae82bf3f30629924c7686e3869a9`.
- Sonnet semantic map v2
  `/private/tmp/f4a-15-k5c-sonnet-semantic-map-v2.md`, SHA
  `fdf3ccc7a1831dce49636afde07d3d5c2f7c73f33bf9a38bc20caff58b3c9c4b`.
- Fable ratificación semántica
  `/private/tmp/f4a-15-k5c-v2-fable-ratification.md`, SHA
  `f0a972c08134c3c307435db15a86d498c4bd826708d8789ad574a2e622b6f967`,
  `ACCEPT`.
- Packet final Opus v1 fue rechazado por falsa colisión de write-sets:
  `/private/tmp/f4a-15-k5-final-packet-fable-preaudit.md`, SHA
  `44414513d85d4b3d0d34c177be330b26629a8c61abc0d8a29de1dca582d608ca`.
- Packet corregido Opus v2
  `/private/tmp/f4a-15-k5-final-decision-packet-opus-v2.md`, SHA
  `c29bf3fbfd5cdbf81b106d595c70c4572b2864549fdc52746aaf951f27a3ae15`;
  Fable `ACCEPT` en
  `/private/tmp/f4a-15-k5-final-packet-v2-fable-ratification.md`, SHA
  `d2554c9068836bd364e18d979c058ac8e416871d607bdff16220fbbb3cc3fe20`.

Verdades medidas:

- 40 hojas autoradas sin tag = 36 BitHire + 4 Evnto + 0 Rottay, todas en
  `CHROME.table`;
- K5a mínimo mecánico = 6 hojas BitHire y contador esperado `40→34`;
- unión léxica 37 y conjunto emissible 37 están en biyección 1:1;
- 34 ejes semánticos tras colapsar padding; gaps `46 = 16 + 0 + 30`;
- 132 canales consumidos por Modern: 34 emitidos+consumidos, 3 emitidos muertos
  y 98 consumer-only que no son automáticamente campos del theme;
- `anatomy` es un plano vivo de atributos, no un canal CSS desconectado;
- los tres números `34` del paquete son distintos: ejes semánticos, canales
  emitidos+consumidos y destino del contador K5a.

**K5 CERRADO — implementación, postaudit y sello 100%.**

Brief consolidado Opus `/private/tmp/f4a-k5-full-consolidated-opus-brief.md`,
SHA `7580e63289d7ef2ad3f01e69737ee790e32335d0d6ef8f9809ae2e51a675ace8`. El
preaudit Fable dio `REJECT` y corrigió 6 governors + `radius` + `cellFontSize`;
adenda DT `/private/tmp/f4a-k5-full-dt-corrections-v2.md`, SHA
`f38de26fa8fd20a14825de6ba8f3517a3421dc9de40c83eac0102e6f2336112a`; ratificación
Fable `/private/tmp/f4a-k5-full-fable-ratification.md`, SHA
`d4be41dfc06007a27170d4660e83285f2255bf8f5fe2872982f2c9c666c67b12`, `ACCEPT`.

SOURCE_READY Sonnet `/private/tmp/f4a-k5-full-sonnet-source-ready.md`, SHA
`e3d9adb415abe70e8488e6b295454dac17f4739d6b1f51bead08adb0b62b23e6`; postaudit
Fable `/private/tmp/f4a-k5-full-fable-postaudit.md`, SHA
`b4b401eae4fec10ac976845056f5c8fd6abde65063e2f93f0a66822ecf53a619`, `ACCEPT`.

57 docblocks: rottay 17 + bithire 36 + evnto 4; 7 `derived` + 50 `seed`; −1
family tag stale (rottay), `headerColor` rottay preservado; cero valores
tocados. `untaggedAuthoredLeaves` 40→0, `divergentSlots` quieto en 33,
`tagRegistry` 4099→4155. Una sola `Baja #14`. La clausura derivada dejó 11
diffs materiales de 12 productores porque `root-checklists.json` quedó
byte-idéntico honestamente (no proyecta líneas de `brand-themes`). R-1
reprodujo exacto: `1719/1706/12/1`, identidad nominal.

GAT-07 tuvo un primer intento con `STOP` correcto por el alias
`reproducibility.authorityDigest` (movimiento legítimo mal enumerado en el
brief); restore limpio. Adjudicación Opus
`/private/tmp/f4a-k5-gat07-authority-digest-opus.md`, SHA
`f9ae84efdeb5f9695fc4f30901b003c52e529a5cbe299cc50a64d9d797af7116`; Fable
`/private/tmp/f4a-k5-gat07-authority-digest-fable.md`, SHA
`6e2a800ae0956b3c34db5e6b53e8a178cde888408ea4359d4f341d20d7b6abf2`; reintento
SOURCE_READY `/private/tmp/f4a-k5-gat07-seal-sonnet-retry-source-ready.md`,
SHA `1427ebec193fc249c818d081eb3147b005a2d90435c09db13af006704e419471`;
postaudit Fable `/private/tmp/f4a-k5-gat07-seal-fable-postaudit.md`, SHA
`884d3cbf898ff00cbc25f29b42aaf52522675868eb694b9b268c3ae639ebd01b`, `ACCEPT`.
`gates:ci`: 89 blocking `PASS` + 2 excluded (`channel-liveness`,
`lane-control-drills`); `gat-07-exact-proof` en `PASS`; cero build, cero
browser. El nombre legado `KIMI-CUSTOMIZATION-PRESERVATION-MANIFEST.json` es un
artefacto histórico, no un actor de la cadena: Kimi sigue fuera de toda
decisión.

Deudas separadas pendientes, no reabren K5: placeholder K5c
`evnto × CHROME.table.border` (posterior al rediseño de `realKeypathParity`,
ver abajo); retirar `baseline` de `DOMICILES`; los tres canales muertos
(`filterRowBg`, `filterFocusShadow`, `loadingOverlayBg`); y el sidecar
`semantic-groups` + su gate como propuesta **posterior, no adjudicada**,
activable sólo si algún tema empieza a autorar `chrome.<familia>.anatomy`
(medido hoy: 0/0/0 en los tres temas). Pertenecen a F4A-close.

#### F4A-close — reconciliación read-only y correcciones vinculantes

- Inventario Sonnet `/private/tmp/f4a-close-sonnet-inventory.md`, SHA
  `d52f36ac4a086bc3f196255573c0d4203032b194bd09685c32a7d569998abd87`,
  `INVENTORY_READY`.
- Adjudicación Opus `/private/tmp/f4a-close-opus-adjudication.md`, SHA
  `9ab5229577259f5bc2df76f31522346f42a9dabb2a74c4ac0be438b8a6d15b2a`,
  `READY_FOR_FABLE_CHALLENGE`.
- Challenge Fable `/private/tmp/f4a-close-opus-fable-challenge.md`, SHA
  `e5375ae35be400a78abb492d3d94b6ad112d57989ca02f85fb0968cde2939845`,
  `ACCEPT_WITH_CORRECTIONS`.

Hallazgos aceptados:

1. `program-check.test.mjs` muta/renombra el manifest real mientras el gate lo
   corre concurrente con `manifest/generator/index.test.mjs`: P1 de carrera y
   P0 de `renameSync`; `try/finally` restaura asserts, no crash/SIGKILL.
2. `cra-12` planta en source real; se aísla separadamente con
   `--workspace-root` y copia de los dos sourceRoots completos (medidos
   ~46 MB/4264 archivos), conservando digest path-relativo+contenido.
3. `cascade-wiring-ratchet` trata cualquier fallback como raíz posicional, no
   consulta root-catalog y sus cuatro invariantes de forma son tautológicos.
   Caso vivo: `--ds-input-md-icon-size`. La reconstrucción queda PRE_F4B; F4A
   sólo deja una cerca honesta.
4. `realKeypathParity` no existe. La fórmula Opus
   `evaluatedUnion - evaluatedIntersection -> 0` queda **rechazada** por
   inalcanzable (`2559-342=2217` con exclusividad legítima); `1918/1823` queda
   prohibido sin derivación reproducible. Debe rediseñarse para certificar cero
   shadowing real sin castigar exclusividad adjudicada ni esconder placeholders.
5. `program.statusAuthority` es un pin literal, no una ruta resuelta. El bloque
   README stampado es el drift operativo severo y `program-state --check` no
   está cableado a CI.
6. Restore universal `git show HEAD:path > path` queda rechazado. Todos los
   tranches usan backup por contenido, prehash, existencia por path, restore por
   copia+rehash y diff completo del porcelain.
7. Denominador F4A-close = 14 salvo subsunción DT citada de la clase
   `evnto compone desde preset canónico`. Preparación honesta tras challenge:
   `14/14` medida, aproximadamente `7/14` diseñada, `0/14` implementada.

Correcciones Fable C-1…C-7 son vinculantes: rediseño de paridad; reapertura
explícita de T-0; autorización explícita para adelantar test-hygiene; clausura
completa del sandbox (`customization-surface-census`, AGENTS/CLAUDE, showroom y
~25 site-files); negativas que cubran ambos backups y crash determinista sólo
post-fix; clase Evnto faltante; postura de roots `por-crear`/`solo-artefacto`.
Las frases del memo Fable que aún tratan a Kimi como gate quedan superseded por
la orden más reciente del owner registrada arriba; las correcciones técnicas
permanecen válidas.

#### Resolución DT de secuencia

Resolución durable preparada en
`/private/tmp/f4a-pre-k4-dt-sequence-ruling.md`, SHA
`baa48c13d99db39c150c4eb2329d189e24e8bb34340a04a83b391549565c7bd2`.
El DT reabre expresamente la adjudicación histórica que enviaba authority/test
hygiene después de K4, porque no se certificará K4/K5 con evidencia dependiente
del timing ni con el punto de entrada humano publicando roles retirados.

Cola vinculante vigente. Los nombres `T-*` son **micro-tranches locales de
hardening pre-K4**; no son F0 ni reinician el roadmap:

1. **Hardening pre-K4 / authority-honesty (antes T-0)**: corregir
   intent/README, cablear `program-state --check`, canon esperado
   `89 blocking + 2 excluded`.
2. **T-1a**: sandbox de `program-check.test.mjs`, clausura derivada y negativas
   de mutación/crash; serialización sólo como cerca interina.
3. **T-1b**: sandbox `cra-12`, corpus completo relevante y baseline pair-aware.
4. **K4 — CERRADO**: brief v3, tres paths, tests seriales y postaudit Fable
   `ACCEPT`.
5. **K5 — CERRADO**: 57 docblocks (7 `derived` + 50 `seed`), `untaggedAuthoredLeaves`
   40→0, `divergentSlots` 33, `tagRegistry` 4155; postaudit Fable `ACCEPT`;
   GAT-07 sellado (reintento) con postaudit Fable `ACCEPT`; `gates:ci` 89
   blocking + 2 excluded.
6. Paridad real — **CERRADA**: `silentPairs` 53→0 sobre 7677 pares,
   `placeholderPairs` quieto en 3969, `tagRegistry` 4208; postaudit Fable
   `ACCEPT`.
7. **F4A-close — CERRADO 14/14 (2026-08-22)**: Lotes A (parser P2 + 52
   governors + cerca PRE_F4B), B (iconSize) y C (retiro de `baseline` de
   `DOMICILES`, la última obligación abierta), cada uno con postaudit
   Fable `ACCEPT`; arbitraje final Fable `F4A_KEEP_OPEN→CERRADO` con los
   ocho requisitos de su §4 resueltos. Ver asiento arriba.
8. `PRE_F4B` (inventario mecánico del gate cascade — `INVENTORY_READY`,
   diseño/implementación NO aceptados) → `F4B 20/20` (bloqueado hasta el
   gate falsable de cascade) → F2 asimétrico → F3 responsive/skins → F4C
   premium → F5 → F6 → F7 → F8 → F9 5100/5100.

#### Hardening pre-K4 / authority-honesty — SELLADO

Fable ratificó la secuencia completa con `ACCEPT` en
`/private/tmp/f4a-pre-k4-fable-sequence-ratification.md`, SHA
`e6a6ba3f60924d8ada3b9d740e43ed30c2d6083439bdb54b1c6149b5d521a263`.
Queda vinculante R-1: K4/K5 se comparan contra la baseline re-anclada después
de que T-1a y T-1b estén aceptados, supersediendo el literal histórico
`1717/13` sin editar sus briefs. También queda vinculante R-3: este lote deja
el canon en `89 blocking + 2 excluded`; si T-5 agrega otro gate debe
re-declararlo y arrastrar todos los contadores vivos.

El DT admitió el write-set exacto de cinco paths en
`/private/tmp/f4a-t0-dt-adjudication.md`, SHA
`0d9b57705609be63533e3ede44a3feaa10b396484790f66ea96a44711fe4d468`.
Opus implementó el lote y emitió `SOURCE_READY` en
`/private/tmp/f4a-pre-k4-hardening-opus-source-ready.md`, SHA
`291ff3e9c8e0cecc22e42dcd3a1194059337574a11cafc0ddef707193d27e94a`.
Fable inspeccionó el diff completo y dio `ACCEPT` final en
`/private/tmp/f4a-pre-k4-hardening-fable-postaudit.md`, SHA
`929870cd5ccfb1fb54fca8474e08733ca2e8a5c0b312b2688a61456f97232997`.

Resultado medido: `program-state --check` verde; `intentDigest`
`5a86b12ae6369bdd`; `renderDigest` `55b37c5b919255e4`; gate nuevo único en
índice 14; `91 total = 89 blocking + 2 excluded`; `validateManifest []`;
`gates:ci` completo bajo Node `v22.17.0` con `89 PASS / 0 FAIL / 2 excluded`.
La primera corrida bajo Node 25 falló honestamente en `gat-07-exact-proof`
porque CI pinea major 22; ese gate sólo lee `ci.yml` y `pnpm-lock.yaml`, fuera
del write-set. Ambas corridas quedaron preservadas. La negativa de edición
manual del bloque dispara P8 sola, no P7+P8: P8 conserva detección blocking y
Fable aceptó explícitamente la corrección. HEAD no se movió, staged sigue 0 y
no hubo commit.

#### T-1a / sandbox de `program-check.test.mjs` — SELLADO

Opus emitió brief read-only
`/private/tmp/f4a-pre-k4-t1a-opus-brief.md`, SHA
`53110c0573ec41e3c208028ad3b0e1046862f46e6f5872519376fe3a67465e02`,
con write-set corregido a un solo path. Fable lo preauditó con `ACCEPT` en
`/private/tmp/f4a-pre-k4-t1a-fable-preaudit.md`, SHA
`be99a11fe11c3bf3d94235659e7fa02ad69ff1aaa5e28f6be4bdb6b4cf23ab6e`.
Sonnet Max implementó el sandbox y emitió `SOURCE_READY` en
`/private/tmp/f4a-pre-k4-t1a-sonnet-source-ready.md`, SHA
`95d695f8190fd4ed4c2e70a59781403ce011609653559f2936b644f700344906`.
Fable inspeccionó el diff completo y dio `ACCEPT` final en
`/private/tmp/f4a-pre-k4-t1a-fable-postaudit.md`, SHA
`f5c3f1044f03261b40f271eceb1189df0e81acca856b52ba2f1403075a8cb851`.

Resultado: las 37 escrituras y tres pares de rename de la suite caen sólo en
un sandbox de clausura completa fuera del repo; imports y resolvers no vuelven
al árbol vivo; los dos symlinks de `node_modules` son read-only y el guard
rechaza write-through. Cohorte causal repetida tres veces, cinco SIGKILL,
manifest vivo `360/360` byte-idéntico y cero residuos. `test:scripts` midió
`1719 tests / 1705 pass / 13 fail / 1 skip`: las mismas 13 fallas nominales
preexistentes y dos tests verdes adicionales. `gates:ci` bajo Node 22 quedó
`89 blocking pass / 0 fail / 2 excluded`.

#### T-1b / sandbox del drill CRA-12 — SELLADO

Brief Opus
`/private/tmp/f4a-pre-k4-t1b-opus-brief.md`, SHA
`83df046539cc498ee129c7fd9fc48a11856488f9fc53e88f1ffa74e0be50ca7d`;
preaudit Fable `ACCEPT` en
`/private/tmp/f4a-pre-k4-t1b-fable-preaudit.md`, SHA
`1223e2cf83c90d447e6e558bbfb4e7b2499cb3b09115e161bfb2ddcf55076eee`.
Sonnet Max implementó el único path y emitió `SOURCE_READY` en
`/private/tmp/f4a-pre-k4-t1b-sonnet-source-ready.md`, SHA
`1a42e6fffc22b1a7dcb1b42c12cb5adbc088de905bb0da9b79ff996fc5c66e86`.
Fable atacó el diff real, cleanup, escapes y false-greens, y dio `ACCEPT`
final en `/private/tmp/f4a-pre-k4-t1b-fable-postaudit.md`, SHA
`df8f92c8ce08d48651596d9eaed55b2d4228bd4e04941feff4fb8fe7ed2f1ac9`.

Resultado: `cra-12-motion-governance.reanchor.test.mjs` copia el corpus
completo gobernado a un sandbox fuera del repo y la planta vive sólo allí.
Directo `6/6`, hermana `16/16`, cohorte con el walker `66/66` por tres
corridas y ambos `export-missing`/`export-unshipped` verdes sin alternancia.
`gates:ci` bajo Node 22: `89/89 blocking PASS`, `0 FAIL`, `2 excluded`.
El árbol vivo, registry y siete dirty preexistentes quedaron byte-idénticos;
staged 0, cero residuos y ningún commit.

La desviación de backup por `git show` fue aceptada por Fable como no material
en este caso limpio, pero queda escalada como ley V-1: desde el próximo tranche
el backup es `cp` del worktree verificado contra prehash y una tercera
reincidencia es `REJECT` procesal.

#### R-1 / baseline de pierna 1 — RE-ANCLADA

Asiento durable del DT:
`/private/tmp/f4a-pre-k4-r1-reanchor.md`, SHA
`09d8a180cd0ab34bbde5656ac77536f66c4c33c2d215c8130038cdeaf23c0c23`.
Después de ambos postaudits `ACCEPT`, Codex ejecutó dos `pnpm test:scripts`
oficiales, seriales, bajo Node `v22.17.0`. Ambas dieron exactamente
`1719 tests / 1706 pass / 12 fail / 1 skip`; el diff de nombres completos,
fallas y skips entre runs fue vacío. Logs:
`/private/tmp/f4a-r1-official-run-1.log` SHA
`9d931a1fa811b2c63bf23a3a70a0d3ef5a1e5fe3886eabe322cb461ddf19e007`
y `/private/tmp/f4a-r1-official-run-2.log` SHA
`e59903275b46a94b56dd2cf0709f3fb9cc22da633654c3fbe636e901c500c260`.

Los dos tests agregados quedan nombrados: `coordinator succession fails
closed` y `tenant art direction creative advisor retirement fails closed`,
ambos verdes. El único skip es `--modern reports the four states over the real
tree and keeps them internally consistent` porque `dist` no está construido.
Los 12 fallos nominales exactos viven en el asiento durable; ninguno es
`export-missing` ni `export-unshipped`, que quedaron verdes en ambas corridas.

R-1 supersede el literal histórico `1717/13` para aceptar K4/K5 sin editar
briefs ni asientos históricos. K4 y K5 están implementados y postauditados
`ACCEPT`; K5 reprodujo R-1 exacto (`1719/1706/12/1`, identidad nominal).

La paridad real (`realKeypathParity`) **CERRÓ**: nueva disposición
`@absent <hoja exacta>` + `@governor` en `variant-parity` (ruling DT + Fable
`ACCEPT_WITH_BINDING_CORRECTIONS`); 53 bloques escritos en los 3 temas
(rottay 19, bithire 1, evnto 33), incluido `evnto × CHROME.table.border`
como `declared-absent` — no placeholder. `silentPairs` 53→0 sobre 7677 pares
(tema,slot); `placeholderPairs` quieto en 3969; `tagRegistry` 4155→4208;
47/47 tests del productor verdes. R-1 reprodujo `1732/1719/12/1`: +13 tests
(los de este lote, todos verdes, cero regresión), los 12 fallos y el skip
idénticos a la referencia. `gates:ci` cerró 89 blocking + 2 excluded.
SOURCE_READY Sonnet
`/private/tmp/f4a-close-real-parity-sonnet-source-ready.md`, SHA
`9256c7688d8b6af488c1cdbf51ee8ae22251fc2f63b4754077d59bb6b8dbe73c`;
postaudit Fable `/private/tmp/f4a-close-real-parity-fable-postaudit.md`, SHA
`c1b081910ad347ad1d6cc02f659e71763186313d08df20fafab4ecc00e90b563`, `ACCEPT`
(un hallazgo P2 no bloqueante, ver abajo).

El sidecar `semantic-groups` sigue sin ancla en el repo y sin adjudicar
(Opus, `/private/tmp/f4a-close-semantic-groups-opus.md`, SHA
`9298efb4fbd690fdfc88722c57b2ea3929b46f0755bda902063bd73ad30f5cdc`,
`VERDICT: STOP`): el plano `attribute` no existe en el universo de
`authoredLeafPaths` porque `anatomy` no está autorado por ningún tema hoy
(0/0/0), así que el sidecar sólo se activaría si eso cambiara. Queda como
propuesta posterior sin adjudicar. El siguiente paso de F4A-close son las
deudas semánticas, el ratchet a cero, la cerca cascade y la auditoría final
(cola vinculante, ítem 6).

**P2 no bloqueante registrado (Fable, postaudit real-keypath-parity):** la
regex de continuación `nextIsText` en `manifest/variant-parity/index.mjs`
(línea ~192 a la fecha del postaudit) sigue siendo
`@(domicile|governor|placeholder)` sin `absent`. Efecto medido: un docblock
ordenado `@governor` antes que `@absent` se rechaza como `malformed:
"governor multilinea"` — fail-closed (rojo de más, nunca verde de menos),
mensaje engañoso nada más; impacto vivo hoy es cero (los 53 bloques usan la
forma canónica `@absent` primero). Arreglo mínimo para la próxima vez que se
toque este archivo: extender el patrón a
`@(domicile|governor|placeholder|absent)\b`, con un fixture de orden
invertido.

#### F4A / F4A-close — CERRADO 14/14 (2026-08-22, acto DT)

Arbitraje final Fable, `/private/tmp/f4a-final-conflict-fable.md`, SHA
`f3737fd8ee778b10001e1ac0a9a5314ee708bdf03e5a46ca1550437afdb7a425`:
veredicto `F4A_KEEP_OPEN` condicionado a un solo lote sustantivo (Lote C);
los otros tres conflictos abiertos (C-1a los tres canales, C-1c el
sidecar, C-3 la clase evnto/preset) quedaron adjudicados en el mismo
arbitraje, sin escritura. Ejecutados en orden, cada uno con SOURCE_READY
Sonnet + postaudit Fable:

- **Lote A** — parser P2 + 52 governors + cerca PRE_F4B + clausura
  derivada. SOURCE_READY Sonnet
  `/private/tmp/f4a-close-lot-a-sonnet-source-ready.md`, SHA
  `376864d0350661cedcffd8d91597baf6852e1fc243eeb7def4625e7eb43c8f24`.
  Postaudit final (sello GAT+CI) Fable
  `/private/tmp/f4a-close-lot-a-fable-final-postaudit.md`, SHA
  `fe593863a4ee9daaa73ec33950dba329f69f6d2817afcd898178a7e1b75f11c9`,
  `ACCEPT`. Cierra el parser (`nextIsText` acepta ahora `@absent`, con el
  fixture de orden invertido exacto que pedía el P2 anotado arriba en el
  asiento de paridad real — **esa deuda queda resuelta, no sólo
  documentada**), 52 docblocks de sólo texto (10 CHARTS + 18
  CHROME.accent `unassigned→seed`; 12 CHROME.statsGrid + 12
  OVERLAY.chrome.statsGrid gemelas confirmadas `seed`, cero valor
  tocado), la cerca ejecutable PRE_F4B (`rootsExcludedNote` + test
  consumido por `cascade-wiring-ratchet-drill`, sin fila de gate nueva) y
  la clausura derivada causal (`fanout-facts`/`root-checklist`
  byte-idénticos). `tagRegistry` queda quieto en 4208. GAT-07 resellado
  sobre este source, `gates:ci` 89+2.
- **Lote B** — iconSize: catálogo + generator + `manifest/index.json` +
  roster. SOURCE_READY Sonnet
  `/private/tmp/f4a-close-lot-b-sonnet-source-ready.md`, SHA
  `57161e5b7c86814c5e8bcf5a945758c0dae0c2ace0687cbf1dd7a97fbee40e86`.
  Postaudit Fable `/private/tmp/f4a-close-lot-b-fable-postaudit.md`, SHA
  `06a624a2bd79c9a3d582ed85cb0added96abc816596060886688fae9af032793`,
  `ACCEPT`. `control.ratio.iconSize.channel` pasa de `--ds-icon-md-size`
  (canal que ningún tema emite) a `--ds-input-md-icon-size` (declarado en
  `input.css:38`, emitido por rottay y bithire); `manifest/index.json`
  mueve sólo `inputsDigest`; los 275 JSON de `manifest/controls/**` +
  `manifest/families/**` byte-idénticos a HEAD; roster 198→198 entradas,
  retirada la cláusula "residuo abierto para F4A-close" en
  rottay/bithire.
- **Lote C** — retiro de `baseline` del vocabulario cerrado `DOMICILES`,
  la ÚNICA obligación implementable que mantenía `F4A_KEEP_OPEN`.
  SOURCE_READY Sonnet
  `/private/tmp/f4a-close-lot-c-sonnet-source-ready.md`, SHA
  `efce37aadebf3e2787ec8c5376040ace54cf33b98859d85793e202400d6a9eed`.
  Postaudit único Fable (sin GAT)
  `/private/tmp/f4a-close-lot-c-fable-postaudit.md`, SHA
  `1c5a9a865ae54cf131d208e4237668949e13fe3782660fe1cca14ea39bb5b3ed`,
  `.ready` (`verdict=ACCEPT`, `f4a_close=HABILITADO`). `DOMICILES` pasa a
  `['seed', 'derived', 'pro-expert', 'unassigned']` (una palabra
  retirada; el mensaje de fallo deriva sólo del `.join`); negativa nueva
  `@domicile baseline` ⇒ exactamente 1 failure con el mensaje exacto;
  `generated/variant-parity.json` cambia únicamente la línea `law`
  (:187). Write-set exacto 3 paths, ningún cuarto path material tocado
  (una anomalía de mtime en `root-catalog.json` fue adjudicada por Fable
  como byte-neutral: el drill `root-exposure-gate` planta y restaura en
  `finally`, hash antes==después de la propia corrida de `gates:ci`).

Con el `ACCEPT` de Lote C sobre la ÚLTIMA obligación abierta, **F4A y
F4A-close quedan CERRADOS, 14/14, por acto del DT**, respaldado por el
`ACCEPT` final de Fable (arbitraje §3/§4 + postaudit del Lote C, que
declara textualmente "F4A PUEDE CERRAR").

**Canon final** (medido en los tres lotes, quieto salvo lo declarado
arriba): `tagRegistry` **4208** · `ratchet.silentPairs` **0** ·
`ratchet.placeholderPairs` **3969** · `ratchet.declaredAbsentPairs`
**53** · `ratchet.untaggedAuthoredLeaves` **0** · `ratchet.divergentSlots`
**33** (informativo — placeholders que ningún tema autora; el cero real
de shadowing lo certifica el gate `realKeypathParity`, ya cerrado en el
asiento de paridad real, no esta cifra). R-1 (`pnpm test:scripts`, Node
22): **`1735/1722/12/1`** (+1 sobre la vara previa `1734/1721/12/1`,
exactamente la negativa nueva de Lote C), **mismo failure-set/hash
`4d6eda2d…`** que la vara anterior — cero regresión, cero re-ancla.
`gates:ci`: **89 blocking + 2 excluded** (`channel-liveness`,
`lane-control-drills`, dueño F2/F2-asimétrico) en los tres lotes.

**Los ocho requisitos del arbitraje (§4), resueltos uno por uno:**

1. `evnto × CHROME.table.border` queda **`@absent`** (paridad real, no
   placeholder) — resuelto antes del arbitraje; este asiento lo ratifica.
2. **Corrección de prosa K5**: los tres canales
   `filterRowBg`/`filterFocusShadow`/`loadingOverlayBg` — la descripción
   previa de "3 emitidos muertos" queda corregida. Medido en el
   arbitraje: **sin lector en el engine Modern, pero compatibility-vivos
   para rustic** (`--ds-table-filter-row-bg` 1 lector rustic;
   `--ds-table-filter-focus-shadow` 1 lector rustic;
   `--ds-table-loading-overlay-bg` 2 lectores rustic + 1 emisión default
   en `default.css:1723`). **No se retira ninguno de los tres.**
3. El sidecar `semantic-groups` queda ratificado tal cual estaba: la
   transferencia ya lleva condición falsable escrita (medido hoy **0/0/0**
   en los tres temas — activable sólo si algún tema empieza a autorar
   `chrome.<familia>.anatomy`); propuesta posterior, no adjudicada.
4. **C-6 / la clase "evnto compone desde preset canónico" — subsumida por
   F4A-12, cita explícita**: las **845 ausencias de evnto** reconciliadas
   una por una en F4A-12 son **todas piso** (medido por placeholder),
   **cero overlay/preset** — evnto no compone desde ningún preset. La
   clase queda disuelta por medición, no por definición.
5. **Obligación del digest `basedOnReportDigest` — cerrada por el
   mecanismo, no por re-anclaje manual**: el gate bloqueante de
   `tokens-catalog` valida fail-closed (`catalog/index.mjs:1186`:
   `recon.basedOnReportDigest !== reportDigest` ⇒ failure "reconciliation
   digest mismatch… regenerate both"), el drill `recon-digest` está
   testeado (`catalog-gate.test.mjs:103`) y el productor de regeneración
   `tokens:catalog:write` existe y corre. El digest no puede quedar
   huérfano en silencio; el re-anclaje manual por sí solo NO habría
   cumplido esta obligación.
6. `baseline` retirado de `DOMICILES` — Lote C, arriba.
7. R-1 nueva vara: `1735/1722/12/1` — canon, arriba.
8. Fase siguiente: **PRE_F4B**, con **F4B bloqueado hasta el gate
   falsable de cascade** — ver bloque siguiente.

**Dos residuos P2, no bloqueantes, registrados para drenar con causa
futura (NO editados en este asiento):**

- `GOVERNOR_CLASS.baseline: 'razon-falsable'` sigue en
  `manifest/variant-parity/index.mjs:149` — inerte: el mapa es
  reporta-no-bloquea y la clave es inalcanzable (el vocabulario cerrado
  falla antes de llegar a leerla); retirarlo habría sido un cuarto edit
  fuera del write-set autorizado de Lote C.
- `docs/f4a/esquema-asignacion.md:18` sigue enumerando la gramática con
  cinco domicilios (`seed | baseline | derived | pro-expert |
  unassigned`) — eco documental stale, superseded por este ledger. No se
  toca ese archivo en este asiento.

#### PRE_F4B — inventario mecánico del gate cascade (en curso, NO aceptado)

Inventario Sonnet, read-only, `/private/tmp/pre-f4b-sonnet-inventory.md`,
SHA `411f29a1fe4a66f63160db12d8c11a66c33b92d5d09f112cb7da578503ddd731`,
verdict `INVENTORY_READY`. **Es medición mecánica, no diseño ni
implementación aceptada** — ningún número de este bloque autoriza a abrir
F4B.

Medición central: `cascade-wiring-ratchet` trata como "raíz" cualquier
`--ds-X` que aparezca como target dentro del fallback de un
`var(--ds-Y, ...)` ajeno — noción **puramente posicional por nombre**,
sin acoplamiento mecánico con `manifest/cascade/root-catalog.json` (64
filas / 60 canales únicos; el script del ratchet no lo importa ni lo
referencia, cero apariciones verificado por lectura completa de sus 211
líneas). De los **768** nombres que hoy excluye del denominador como
"raíz":

- sólo **38** son un canal canónico real del catálogo;
- **730** (95,1%) son **raíces posicionales** — canales de componente
  ordinarios que otro canal usa como su propio fallback, sin ninguna
  cualidad arquitectónica de raíz. El caso ya adjudicado en el hallazgo 3
  del challenge Fable de F4A-close (`--ds-input-md-icon-size`, resuelto
  en Lote B arriba) es la punta de este conjunto de 730, no un caso
  aislado.

Sobre el grafo completo de reachability transitiva (5142 nodos, mismo
parser balanceado del ratchet, ningún parser nuevo): **1563** nodos
alcanzan una raíz canónica siguiendo 1+ saltos de fallback; 45 SON
canónicos; el resto se reparte en terminales legítimos (declarados, con o
sin fallback), terminales sin productor y **68 ciclos** que nunca tocan
una raíz canónica. **El gate actual no prueba ninguna de las dos
preguntas centrales — ni cuántas de sus 768 "raíces" son reales, ni si un
nombre alcanza alguna** — sólo cuenta cableado posicional. Ese es el gate
falsable de cascade que el arbitraje Fable (§4, punto 8) exige antes de
abrir F4B.

Este asiento NO adjudica diseño ni implementación. PRE_F4B queda con
inventario mecánico completo; el diseño del gate real y su implementación
son el siguiente paso, con dueño DT.

##### Checkpoint PRE_F4B — Lote A implementado y BLOQUEADO (2026-08-22)

**Supersedencia declarada.** Este checkpoint supersede, sin reescribirlo, el
cierre del asiento anterior ("el diseño del gate real y su implementación son
el siguiente paso") y la cláusula "diseño/implementación **NO aceptados**" de
la fila `PRE_F4B` de la tabla de progreso: el diseño v3 fue ratificado y el
Lote A está implementado y auditado. Lo que NO cambia: **PRE_F4B no cierra,
F4B sigue bloqueado y el Lote B no está autorizado.** El resto del asiento de
inventario mecánico se conserva íntegro como historia.

**1. Lote A A1–A12, implementado.** Write-set de doce paths, ejecutado por
Opus como único writer bajo Node 22. Diff material: **10 entradas nuevas**
sobre el prestate congelado — `porcelain 29 → 39` — que son exactamente
A1/A2/A10 (` M`) y A3–A9 (`??`); cero entradas retiradas, cero paths fuera de
A1–A12, cero `src/**`, roots, catálogo, `manifest/index.json`, materialized,
backlog, docs o GAT. **A12 (`scripts/ci/gates-manifest/index.mjs`) queda
byte-idéntico al prestate** (`3b7f906f…`): anexar los tres drills nuevos a su
`run[]` rompía `scripts/ci/runner/index.test.mjs:239`, que sella ese argv
exacto desde fuera del write-set, así que por ruling del DT los suites viajan
transitivamente por A11 y no nace gate id (R-3 intacto). **Las 31 autoridades
read-only quedan intactas** (catálogo, 20 roots, fanout-facts, tenant-reach,
5 fuentes de compilador, 3 artifacts), verificadas contra el freeze con cero
drift. HEAD `9d5582dfdf1d02f1d7e8fd468720b1d829e50454`, `staged 0`, antes y
después.

**2. Postaudit Fable: `ACCEPT_SOURCE_READY_BLOCKED`.** La instrumentación se
**conserva** — honesta, aislada y verificada byte-exacta, con los 12 paths
recomputados uno por uno y B1/B2/B3 intocados. Pero **PRE_F4B queda
abierto-bloqueado** en la rama F-5/S7 contratada: **F4B sigue bloqueado y el
Lote B NO está autorizado.**

**3. Evidencia del lote.** Suites: **A3 23 · A6 36 · A9 18 · A11 48**, cero
fallas. **R-1 `1817/1804/12/1`**, con el **mismo failure-set nominal de 12**
que la vara previa — identidad de conjunto verificada por Fable (diferencia
simétrica vacía contra el log canónico de Lote C) y cero fallas nuevas.
Aritmética F-7 exacta: `1735 − 10 + 10 + 23 + 36 + 18 + 5 = 1817`. Queda
abierta la condición **C-3**: el literal `4d6eda2d…` no se reproduce desde la
receta en prosa, así que el próximo SOURCE_READY publica el serializador
canónico o el DT re-ancla el canon; hasta entonces la vara se verifica por
identidad de conjunto más contadores. `gates:ci` **89 blocking + 2 excluded**,
verde. **El ratchet viejo sigue intacto en `2171/4374`** (corrido por el
postaudit sobre el árbol vivo): el aislamiento S2 queda probado, no reportado.

**4. Causa del bloqueo.** `producers.json` publica **2 024 filas de
`unknownProvenance` en 525 archivos** — cada una con `plane/file/symbol/
reason/template/detail`, identidad y no contador desnudo. La condición de
entrada del Lote B (F-5.1, `unknownProvenance == []`) **no se cumple**. Cuatro
ítems quedan además **PARCIALES**, brechas de garantía y no de honestidad:
**P0-3** (binding léxico AST en V3-3: el guard de chart-category aún se
verifica por substring del `then`), **P0-4** (`srcCompilers` sella sólo tres
archivos; faltan el módulo lector y cuatro fuentes efectivas — hoy el lote
está protegido por el freeze de `/tmp`, no por el artefacto), **P1-1** (el
doble owner sólo se produce desde el helper unitario, no desde
`buildProducers()`) y **P2** (`order` lleva nombres de contexto, no owner IDs).
El **plan de corrección Opus v1 fue RECHAZADO** por auditoría independiente
(cinco defectos bloqueantes: taxonomía heurística, `[]` no demostrado, retirar
`plane` contradice el schema, schema de precedencia sin addendum, y
`CONSTANT_SOURCES` no exportada). **Ningún writer queda liberado.**

**5. Censo Sonnet v1 — identidad ACEPTADA, clasificación RECHAZADA.** El censo
prueba la **identidad exacta de las 2 024 filas** (mismo orden, cero pérdida,
cero duplicado, índice 0..2023 como identidad estable) y esa mitad se acepta.
Su **taxonomía causal terminal se rechaza**: el clasificador detiene el walk
en el primer binding, de modo que **944 filas** rotuladas
`localConstOrDestructureResolvable` llevan en el propio mapping
`isSourceItselfAParamOrImport = directParam` — son destructurings de un
parámetro y su frontera terminal es relay/prop, no "local resolvable"; y
**3 llamadas** quedaron mal domiciliadas en la familia `undefined`
(`spreadOf:noBindingFound`), de modo que el conteo acreditable de `undefined`
literal es 58 y no 61. **Un censo v2 terminal-recursivo está EN CURSO.**
**Prohibido pinear los conteos de v1** — ni las nueve familias, ni el 1626
"sin autoridad nueva", ni el 244 de relay: lo único vinculante hoy es la
identidad de las 2 024 filas y la partición uno-a-uno contra sus índices.

**6. Decisiones DT ya firmes.** (a) **`plane` permanece dentro de
`producerSiteId`**: es la fórmula del contrato v3 y separa dos semánticas
productivas que pueden observar el mismo archivo; el conflicto de ownership se
vuelve falsable inyectando claims al materializador real, no cambiando la
coordenada. (b) El **write-set eventual mínimo es `A4/A5/A6`** — tres paths,
no cuatro: A7/A9 quedan fuera del tranche y A8 no se vuelve stale (cero
referencias a `extracted/producers.json`). (c) El **Lote B sólo abre con
`unknownProvenance == []` real y doble postaudit** (reauditoría independiente
A4–A9 más postaudit Fable del diff completo); mientras quede una sola fila, el
receipt es `SOURCE_READY_BLOCKED`, B2 no existe y el ratchet viejo sigue
siendo el gate de CI.

**7. BC-0 — `PAINT_DENOMINATOR`, deuda asentada (verbatim).** *Tranche propio
con build permitido; **prohibido pinear `3661` / `1918` / `1823`** sin
derivación reproducible.* Este asiento **no fija esas cifras y no las
reinterpreta**: el denominador de pintura y sus contadores se derivan
**únicamente del artefacto vivo y de su fórmula ejecutable**, y sólo entonces
se certifica pintura. La deuda venía arrastrándose en memos volátiles de
`/private/tmp` contra la doctrina de escribanía durable; queda asentada aquí y
sigue con dueño DT.

**8. Progreso de programa — sin cambio.** Sigue en **39–43% realizado /
57–61% pendiente**. Esta instrumentación **no suma certificación de F4B**: el
Lote A reconstruye el instrumento y su procedencia, no drena deuda ni acepta
un solo control. Por la regla de reporte vigente, producir memos e
instrumentación read-only no infla progreso.

**9. Memos de referencia (paths y SHA-256 completos).**

| Memo | Path | SHA-256 |
|---|---|---|
| SOURCE_READY del writer (`SOURCE_READY_BLOCKED`) | `/private/tmp/pre-f4b-lot-a-opus-source-ready.md` | `e81ee0fe30e45951806f7cd930424393f27fa3074f01d4fdf67429f8ecf52611` |
| Postaudit Fable Lote A (`ACCEPT_SOURCE_READY_BLOCKED`) | `/private/tmp/pre-f4b-lot-a-fable-postaudit.md` | `caa9c481e9e5f7adf7220625305da673a8f73ad22921b2847d36ce5f9ed46885` |
| Auditoría independiente del plan de corrección (`REJECT`) | `/private/tmp/pre-f4b-lot-a-correction-plan-independent-audit.md` | `092cd49ce47163e0a514de64fd19732bd7dde94187635de57e0ecb91086330cc` |
| Challenge Fable del plan (`ACCEPT_WITH_BINDING_CORRECTIONS`) | `/private/tmp/pre-f4b-lot-a-correction-plan-fable-challenge.md` | `37dcdf461f4ff7741cec8c04976f01113c6abd27f19e8565148e0ef204ef1a2d` |
| Censo causal Sonnet v1 (`CENSUS_READY`) | `/private/tmp/pre-f4b-unknown-sonnet-census.md` | `4b0c3e5da33b44032a425cff5504c6d59fe4a567110aa47390d028eec4d1aab4` |
| Auditoría del censo (identidad ACCEPT / clasificación REJECT) | `/private/tmp/pre-f4b-unknown-sonnet-census-independent-audit.md` | `43bef9bf9471016ff733255010f4028030f87fb0399dc3aff94526c00b9c1c5a` |
| Revisión Fable del censo (`ACCEPT` con C1–C6) | `/private/tmp/pre-f4b-unknown-sonnet-census-fable-review.md` | `97207ad3bfd9b9f4ae2037e5f15b2171790e593e201a3621bfb5b0efabfdc0e9` |
| Plan de corrección Opus v1 (rechazado) | `/private/tmp/pre-f4b-lot-a-correction-plan-opus.md` | `979b5187e2d97394a1000a66ba264363944709b620c16144b4eff716cbedc459` |
| Lista completa de las 2 024 unknown | `/private/tmp/pre-f4b-lot-a-unknown-provenance.md` | `f97642537049b03fc642f5a3ee2f0e2e750b7ee280f247f8cec8572d69f60f3f` |
| Diff completo del Lote A (prestate sucio → poststate) | `/private/tmp/pre-f4b-lot-a.diff` | `72b8002b1d788b2d24e40024f16fc07488c78a019884ed8518013b55bcc06186` |

**Cadena vigente para el siguiente tranche:** ruling DT sobre el plan corregido
→ freeze-r2 con fórmula de agregado ejecutable → writer (`A4/A5/A6`) →
reauditoría independiente A4–A9 → postaudit Fable del diff completo. Ningún
paso de esa cadena está autorizado por este checkpoint.

#### Progreso operativo, no certificación

| Hito | Avance vigente |
|---|---:|
| F0/F0.5/F1 + transferencia DT | 100% |
| F2 seguro | 100% |
| F4A estructural | 100% CERRADO (F4A-close 14/14, Lotes A/B/C, postaudit Fable `ACCEPT`) |
| Cobertura de hojas F4A | `2559/2559 y 0/7677 pares silenciosos; divergentSlots 33 sólo informativo` |
| Hardening pre-K4 / authority-honesty | 100%; `SOURCE_READY` + postaudit Fable `ACCEPT` |
| T-1a sandbox `program-check.test.mjs` | 100%; `SOURCE_READY` + postaudit Fable `ACCEPT` |
| T-1b sandbox `cra-12` | 100%; `SOURCE_READY` + postaudit Fable `ACCEPT` |
| R-1 baseline de pierna 1 | 100%; `1735/1722/12/1` vigente (Lote C), mismo failure-set/hash `4d6eda2d…` que la vara previa |
| K4 | 100%; implementación + postaudit Fable `ACCEPT` |
| K5 | 100% implementación + postaudit + GAT/CI |
| F4A-close | **14/14 CERRADO** (Lotes A/B/C; canon 4208/0/3969/53/0/divergent33 informativo; gates:ci 89+2) |
| T-1 sucesión DT Codex → Kimi K3 | 100% CONSUMADA (2026-08-23, 3.ª sucesión de la cadena; Fable `ACCEPT`) |
| C2 program-check verde | 100%; 24 fallos spacing.rhythm resueltos causalmente, ley intacta; `CONSTITUTION_READY`; Fable `ACCEPT` con follow-ups vinculantes (H1/H3) |
| C3 resello GAT-07 | 100%; hash `a24805069cf4…`; regla adoptada: resello obligatorio al cierre de cada packet F4B |
| C4 brecha PRE_F4B | 100% REGULARIZADA (doble postaudit Codex DEFECTS 5/5 + Fable REGULARIZA; T-11 anclado, T-12 narrativa, frescura producers.json; D1 aceptado con asiento) |
| PRE_F4B | CERRADO por regularización C4 (ver asiento C4); inventario mecánico `INVENTORY_READY` histórico |
| H-1 brazo estático con baseline | 100%; `base` del vertical publicado sólo en el brazo estático; preaudit Fable `ACCEPT` V1–V5; drills 47/47; los 20 receipts spacing/effect/radius invariantes |
| F4B | **20/20 controles ASENTADOS — FASE COMPLETA en su forma honesta (2026-08-26)** — 9 `COMPUTED_VERIFIED` (spacing.rhythm, surfaces.effect-intensity, shape.radius-scale, density.mode, responsive.posture, typography.scale, experience.profile, palette.seeds, surfaces.elevation-posture) + 10 `SOURCE_BOUND` (button-style, typography.pairing, sidebar-tone, motion.dial, typography.families, recipe-profile, profiles.expressive, profiles.icon, token-overrides, chrome.anatomy) + `chrome.families` paraguas BY_REFERENCE (`UNKNOWN` a propósito, `SURFACE_REVIEW_DEFERRED_TO_F5`). **0 `SIGHTED_ACCEPTED`.** Cero evidencia alcanzable pendiente: token-overrides cerró con techo estructural documentado (clase CSS-terminal + puerta sellada ⇒ sin camino a pass:true; candidato F5 `F5_INSTRUMENT_SEALED_DOOR_SINGLE_ARM_VERDICT` con 2 condiciones de admisión Fable). Lo que falta para que los SOURCE_BOUND suban (ratificación propertyGroup, calibración de celdas) es F4C/F5. 134 receipts bajo validador v2 (133 válidos; único stale declarado: compound-editorial, `SUPERSEDED_BY_LIVE_FENCE`). **C5 CERRADO (2026-08-26, commits `fd58f8ba4` gate-debt + `44b14f521` correctivo + docs-engineering `46960f2`):** α1 implementado (`derivedChannels` = radio de impacto de 3 seeds; `calibrationChannels` = superficie atribuible de 2, subconjunto fail-closed), cadena derivada re-emitida entera incluyendo el eslabón no enumerado (`producers.json`), gates:ci **89/89 blocking verdes** + 2 excluidos con owner, postaudit Fable ACCEPT (ver asiento de cierre C5) |
| F2 asimétrico | **FRENTE CERRADO (2026-08-26)** — las 34 raíces asimétricas con disposición escrita y ejecutada: F2A-0 `fb8ff25b6`/`bf21afec2` (censo) · F2A-1 ley de cinco clases adjudicada (preaudit Fable + consenso Opus que corrigió el instrumento) · Lote A `dfc39efcf` · Lote B `2509bdd3d` (T0 `#A8A898`, decisión 17) · Lotes F/F-2 `96b610162`/`fc1b8faf9` · re-medición `6f3fbe90c` · F′ `791f86be6` (ley 19 + gate dial-authority blocking) · F″ `9e57502af` (28 pendings, decisión 20) · anotaciones `0bd953dbc`. Postaudit Fable por lote, Codex en hitos. Pendientes a fases posteriores (ninguno bloquea el cierre): valor del line-height bithire (ruling de diseño del owner), micro-fix C-02 del clear-button de textarea, pregunta sighted del glass sobre backdrop oscuro (F4C), validador cascade-aware y override plano mode-aware (F5), cableado text-page de evnto (35/1/0), 2 gates excluidos que vuelven cuando sus enumeradores existan |
| F3 | **PILOTO v3 CERRADO (2026-08-27, `b2b2ad82c`)** — criterio de 3 términos probado punta a punta con cero-delta computado (1 sitio, `cell-renderers`); condición Codex del `13px`×3 resuelta por REMOCIÓN (no reproduce ninguna seed 12/14/16; idioma corpus bare ~50:1; fallback inalcanzable); cifras históricas de §6 corregidas (ver asiento §13); postaudit Fable DEFECTS-2 → ACCEPT condicionado cumplido. F4C/F5-F8 pendientes |
| F9 | 0/5100 celdas aceptadas |
| Programa completo | estimación prudente **62% realizado** (ingeniería; corregida a la baja tras la revisión Codex 2026-08-27: la enmienda de paridad profunda agregó scope que el 63–65% previo no descontaba); preparación comercial visible ~43%. Cerrar F4A/F4B **no certifica** F9: 0/5100 celdas aceptadas, gate y calibración de celdas propios, aún pendientes |

**Regla de reporte:** el porcentaje sólo cambia por implementación o aceptación
real; producir memos read-only no infla progreso.

**Enmienda de secuencia vigente (dueño, 2026-08-20).** El frente actual sigue
siendo F2.4 y su packet abierto no se cancela. F2 continúa packet por packet
hasta que no quede ningún cluster con cero-delta computado demostrable. Cerrado
ese conjunto seguro y auditado, el próximo frente es **F4A**, no F3; el residuo
F2 dependiente de theme queda explícitamente detrás de F4B. La cola vinculante es:
`F4A → PRE_F4B → F4B → F2 asimétrico → F3 → F4C → F5 → F6 → F7 → F8 → F9`.
**F4A cerró 14/14 el 2026-08-22** (ver asiento arriba); PRE_F4B tiene
inventario mecánico pero F4B permanece bloqueado hasta el gate falsable de
cascade.
**Enmienda de paridad profunda (dueño, 2026-08-26, asentada verbatim al inicio
de §6):** criterio bloqueante de entrada y salida para F3/F4C — mismo contrato
tipado de seeds, mismo inventario de keypaths en la salida normalizada, ley de
literales y derivación, y los 10 gates obligatorios de cierre F4C. No
interrumpe F2A.
F1 permanece correctamente «gobernado», pero no se reinterpretará como
certificación: el rollup `UNKNOWN` sólo baja con evidencia causal y F9 lo lleva
a cero.

**F4B — `spacing.rhythm` COMPUTED_VERIFIED (2026-08-23), 1/20.** Primer control
con evidencia causal de navegador. Base `6cfdcc1a9`. 8 escenarios
`primitive/layout/{flex,grid,stack,space}` x `{tight,airy}`, cada uno midiendo
**los dos ingress en una sola escena**: preset gap `15px -> 12.75px` (tight,
x0.85) y `15px -> 18px` (airy, x1.2), exactos y monótonos; el `numeric-gap`
contraparte quedó en `8px` en las 16 filas de brazo; `--ds-rhythm-scale`
`1 -> 0.85 / 1 -> 1.2` y `--ds-rhythm-effective-scale` con el mismo clamp en
ambos brazos; `restore.exact = true` y `negativeControls.held = true` en todos
los brazos; `ingressEquivalence` con 0 filas divergentes en los 8; ningún run
`harness-suspect`. Receipts R2 en
`packages/core/test-artifacts/quality-evidence/wo-cra-23/F4B/spacing-rhythm/`
(8 artifacts + 8 receipts), los 8 válidos contra
`scripts/quality-evidence/v2/receipts.mjs`.

Para llegar ahí hubo que reparar cuatro defectos reales del arnés, todos
encontrados por la propia corrida y ninguno enmascarado: (1) el brazo DB estaba
atado a `compileAppearanceVariables`, símbolo ausente de todo entrypoint
publicado y retirado del provider — el door productivo es
`compileTenantThemeConfig`, ahora cargado desde el subpath publicado
`@rottay/design-system/server`, con `RETIRED_DB_COMPILER_EXPORTS` que convierte
un rebind en throw de carga; (2) el fixture `button-modern-md` exigía
`[data-part='trigger']`, que `cb1e3645f` había rekeyed a `[data-variant]`, así
que **todas las lecturas de Button venían siendo retenidas** y
control-height/touch-target/icon-size quedaban sin medir en silencio; (3) el
restore inline dejaba un `style=""` vacío que el baseline no tenía, por lo que
el brazo DB no restauraba exacto; (4) el colector de freshness pasaba
`sourceBindings` crudos a un hasher de archivos (un directorio reventaba con
EISDIR y un locator `path:1371-1451` leía como archivo inexistente).

`disposition` de las cuatro celdas sigue `UNKNOWN` **no por falta de medición**
sino porque el `dispositionLaw` de `APPLICABLE` exige `staticSourceBindings` y
`dbSourceBindings` separados, forma que estas celdas no tienen. `SIGHTED_ACCEPTED`
no se reclama: no hay aceptación sighted. El eje `responsive-preset` no lo
cubren estos fixtures y queda sin medir. Deuda no bloqueante registrada:
`compileAppearanceVariables` sigue declarado en un `.d.ts` de `dist` sin existir
en el JS — divergencia tipo/runtime, ajena a este control.

**F4B — `surfaces.effect-intensity` COMPUTED_VERIFIED (2026-08-23), 2/20.**
Segundo control con evidencia causal de navegador; el asiento de `spacing.rhythm`
de arriba queda intacto. Base `56847146f`, worktree limpio, `staged=0`, sin
commit ni push. 6 escenarios `primitive/display/card` x `{rottay,bithire,evnto}`
x `{mate,sobrio}`, cada uno midiendo **los dos ingress en una sola escena** y en
los dos temas: 6 artifacts + 6 receipts (12 archivos) en
`packages/core/test-artifacts/quality-evidence/wo-cra-23/F4B/surfaces-effect-intensity/`,
los 6 receipts válidos contra `scripts/quality-evidence/v2/receipts.mjs`. Ningún
run `harness-suspect`; `ingressEquivalence` con 0 filas divergentes en los 6;
`restore.exact = true` y `negativeControls.held = true` en cada brazo de cada
escenario.

Números medidos. Canal directo `--ds-effect-intensity` sobre `token-readout`:
`1 -> 0` y `1 -> 0.6` en rottay y evnto, `0.58 -> 0` y `0.58 -> 0.6` en bithire
(su artifact compila ese piso, que es además el precedente que cita la ley de
`estandar`). Pintura sobre `card-modern-md/root`: el alfa del primer stop de
`background-image` va `0.024 -> 0` en `mate` y `0.024 -> 0.016` en `sobrio`, en
rottay y evnto, en ambos brazos y ambos temas, monótono (`0 < 0.016 < 0.024`).
La rampa autorada es `0.025 * effectIntensity`; Chromium serializa el alfa a 8
bits, así que `0.025` lee `0.024` y `0.015` lee `0.016` — la cuantización es del
navegador, se registra en vez de suavizarse.

Ingress: static `surfaces.effectIntensity` por `compileBrandTheme`; DB
`appearance.general.surfaces.effectIntensity` por `compileTenantThemeConfig`
desde el subpath publicado. Ningún segundo emitter, ningún compilador retirado.

Un defecto real del arnés, encontrado por la propia corrida y no enmascarado:
`buildIngressInput` escribía el **id** del stop en el path de ingress para
cualquier `domain.kind`. `spacing.rhythm` es `closed-enum`, donde el id ES el
valor que un tenant escribe, así que la otra forma nunca se había ejercitado.
Con un control `bounded` habría bajado `--ds-effect-intensity: mate`: la bajada
estática es `String(su.effectIntensity ?? 1)` sin guarda numérica, el nombre
llega literal al canal, y como `--ds-effect-intensity` es un `@property`
registrado con `syntax: '<number>'` e `initial-value: 1`, la declaración es
inválida a computed-value time y el navegador sustituye 1. **Todos los stops
habrían pintado el baseline y la corrida habría reportado como inerte un control
vivo**, con el brazo cargando igual un mapa no vacío, así que ninguna guarda
existente habría disparado. El arnés ahora deriva el valor escrito de
`domain.kind` y falla cerrado ante cualquier kind que no sepa escribir; hay
drill contrafáctico que maneja el `compileBrandTheme` compilado real y clava que
emite el literal `mate` (31 aserciones verdes en
`runtime/ingress/tests/index.test.mjs`).

Sobre `estandar` (1) no se simula paridad. `surfaces-effect-intensity-envelope.test.ts`
(20 aserciones verdes) prueba que el door DB lo **rechaza** en los tres
verticales con `invalid_value` en `$.appearance.surfaces.effectIntensity`, que el
techo mismo (`0.65/0.65/0.75`) **sí** se acepta — que es lo que separa un rechazo
de un clamp — y que el sobre es intervalo cerrado (`-0.1` y `1.5` también
rechazados). El door estático acepta 1 en los tres.

**Límites y deudas, ninguna disimulada.**
1. `estandar` no tiene corrida causal recibida, y la razón es del instrumento,
   no falta de medición: por contrato sólo es alcanzable por el door estático, y
   una corrida causal de un solo brazo reporta `ingressEquivalenceHeld=false`
   (dobla `comparable=false` en «no se sostuvo»), lo que fuerza `pass=false` y
   `exitCode 1`, y el validador rechaza exit no-cero salvo `negative-drill`.
   Forzar los dos brazos es imposible: el brazo DB lanza al bajar, que es
   justamente la conducta bajo prueba. Medido igual: un run estático de un brazo
   en bithire fue `harness-live` (`0.58 -> 1`, negativos sostenidos, restore
   exacto); rottay y evnto se rechazaron correctamente como `harness-suspect`
   por otra razón honesta — su baseline compilado **ya es 1**, así que ahí el
   stop es no-op y no hay movimiento que observar. Queda como
   `openContractQuestion` para adjudicación del DT; este packet **no** tocó esa
   semántica de veredicto: debilitar una regla de gate es decisión del dueño.
2. El keyline óptico intensity-scaled del card elevado **no responde al dial**.
   `card.css` declara `inset 0 1px 0 color-mix(... calc(72% * var(--ds-effect-intensity)) ...)`
   y su propio comentario dice que se disuelve en 0; medido, `box-shadow` es
   idéntico entre baseline y mutación en las 24 filas de brazo de los 6
   escenarios, en ambos temas y ambos doors. Registrado como medido-no-
   diagnosticado por ruling del dueño (no perseguirlo): el control queda probado
   vivo sobre el mismo elemento por una propiedad pintada independiente
   (`background-image`) y por la lectura directa del canal.
3. En bithire el dial llega al canal y **no pinta nada** en el card: su artifact
   declara plano `--ds-gradient-surface` como literal opaco de tres stops sin
   término de intensidad, mientras rottay y evnto heredan la definición escalada
   de `foundation/animations/premium.css`. Divergencia de autoría por tenant, no
   bajada rota: los dos doors coinciden también en bithire (0 filas divergentes).
4. **Responsive sin medir**: la sonda clava un viewport (1280x800, dpr 1).
5. Se midió **una** familia. 21 owners CSS de `runtime/engines/modern/skin` leen
   este canal; el `productiveConsumerWitness` declarado en el manifest
   (`overlay-modal.css`) no tiene fixture en el roster y **no** se midió. Por
   ruling del DT el canary primario es `card-modern-md/card.css` y el witness
   documental no se reemplazó. La afirmación a nivel control es sobre el canal y
   los dos doors, no sobre cada superficie que el canal decora.
6. `disposition` de la celda sigue `UNKNOWN` **no por falta de medición** sino
   porque `APPLICABLE` exige `staticSourceBindings`/`dbSourceBindings` separados
   más `states` y `stressCases`, forma que esta celda no tiene.
   `SIGHTED_ACCEPTED` **no se reclama**: no hay aceptación sighted.
7. `anatomy.propertyGroups` de `primitive/display/card` estaba vacío y bloqueaba
   `IMPLEMENTED`; se declaró **sólo** el grupo que esta calibración midió
   (`surface-decoration`), igual que el packet de `spacing.rhythm` pobló los
   cuatro layout. Taxonomía parcial declarada como tal, no inventada completa.
8. `program-check` pasa de **25 a 24** hallazgos: 0 nuevos, y se resuelve
   `manifest/index.json is stale`. Advertencia honesta: regenerar ese índice
   **también** absorbió cuatro filas que el packet 1/20 había dejado sin
   regenerar (`primitive/layout/{flex,grid,space,stack}`, de `SOURCE_BOUND`
   a `COMPUTED_VERIFIED`). No es trabajo de este packet y se nombra para que no
   viaje escondido. Los 24 restantes son los de `spacing.rhythm` heredados.
9. Rojo heredado fuera de alcance por ruling del dueño: el drill
   `composition/receipt` 11/12 (`producer may not be the sighted approver`)
   compara contra `SIGHTED_APPROVER = 'Codex (DT)'` pasando `'Codex'`. Ajeno a
   este edit-set.

Toolchain: los 6 escenarios se corrieron en Node **v22.17.0** (el pineado);
una corrida previa idéntica en v25.2.1 dio veredictos y conteos byte-iguales, lo
que sirve además de cruce de reproducibilidad. `tsc --noEmit` limpio.

**F4B — `shape.radius-scale` COMPUTED_VERIFIED (2026-08-23), 3/20.** Tercer
control con evidencia causal de navegador; los asientos de `spacing.rhythm` y
`surfaces.effect-intensity` quedan intactos. Base `5ce42e1b7`, `staged=0`, sin
commit ni push. 6 escenarios `primitive/display/card` x `{rottay,bithire,evnto}`
x `{sutil,amplio}`, cada uno midiendo **los dos ingress en una sola escena** y en
los dos temas: 6 artifacts + 6 receipts (12 archivos) en
`packages/core/test-artifacts/quality-evidence/wo-cra-23/F4B/shape-radius-scale/`.
Ningún run `harness-suspect`; `ingressEquivalence` con 0 filas divergentes en los
6; `restore.exact = true` y `negativeControls.held = true` en cada brazo.

**El door declarado estaba invertido, y ése es el hallazgo del packet.** El
control venía declarando `surfaces.borderRadius.*` como door estático. No era
sólo un wildcard que `buildIngressInput` no puede caminar: `borderRadius.{sm,md,lg,xl}`
baja a `--ds-radius-{step}-base`, y cuando hay escala viva `compileBrandTheme`
emite esa base como `calc(authored / scale)` **a propósito**, para que el
`calc(base * scale)` de `foundation/themes/default.css` reproduzca el valor
autorado. Es la vía de **compensación** — el anti-door — y apuntar ahí bajaba un
`--ds-radius-scale: 1` **constante** en los 4 stops y las 3 verticales. El guard
de bajada vacía **no** disparaba, porque el compilador emite ese canal como
default incondicional: la corrida habría reportado un control vivo como INERTE.
Preflight y prueba de mutación quedan como evidencia durable en el mismo
directorio (`preflight-ingress-refutation.{mjs,json}`, `drill-mutation-proof.{mjs,txt}`).

Corregido en la autoridad, no en el generado: `capabilities/index.ts`
`brandThemePath` -> `surfaces.radiusScale`, el campo que `BrandSurfaces` documenta
como *"Bounded multiplier for the canonical radius ramp"*. Regeneración con el
productor canónico (`manifest/generator/index.mjs --sync`): **21 archivos**, 19
controles cambian **exclusivamente** `semanticOwner.registryDigest`,
`shape.radius-scale` cambia además `ingress.staticBrandThemePath`, y
`manifest/index.json` sólo sus digests derivados. **Cero deltas semánticos y cero
deltas de familia** en la regeneración — condición de aceptación del DT, verificada
campo por campo.

Números medidos. Canal directo `--ds-radius-scale` sobre `token-readout`, en los
dos brazos y las 6 celdas: rottay y evnto `1 -> 0.9` y `1 -> 1.15`; bithire
`1.25 -> 0.9` y `1.25 -> 1.15`. Pintado en `card-modern-md/root`
(`border-top-left-radius` y `border-bottom-right-radius`, idénticos en ambos
brazos y ambos temas): rottay `14px -> 12.6px` y `14px -> 16.1px`; evnto
`18px -> 16.2px` y `18px -> 20.7px`; bithire `10px -> 7.2px` y `10px -> 9.2px`.

Notas honestas:

1. **bithire es el fork que el README de modern nombraba, y esta corrida lo midió.**
   Autora el par de compensación (`surfaces.borderRadius` junto a `radiusScale: 1.25`),
   así que su base compilada sale como `calc(10px / 1.25) = 8px` y el 10px pintado
   es esa base por su propio 1.25. El dial sigue **plenamente vivo** ahí
   (`8px * 0.9 = 7.2px`, `8px * 1.15 = 9.2px`), pero mueve desde 1.25 y no desde 1.
   Consecuencia práctica: su baseline está en el techo del dominio `{0.75,1.25}` y
   por encima del sobre tenant `{0.8,1.2}`, de modo que un tenant sólo puede
   **reducir** el radio de bithire, nunca aumentarlo.
2. **`suave` (1) no lleva receipt positivo, por diseño.** 1 ES la identidad de la
   rampa. Por el door DB ni siquiera es expresable en dos de tres verticales:
   `compileTenantThemeConfig` no emite `--ds-radius-scale` para rottay ni evnto
   (escribir el default del vertical es un no-op que el compilador elide) y el
   arnés rechaza el brazo como bajada vacía. bithire **sí** emite `"1"` porque su
   baseline es 1.25. Asimetría de los doors, no defecto.
3. **`recto` (0.75) no lleva receipt en ningún brazo, por diseño.** Está bajo el
   sobre tenant en las 3 verticales — el door DB lo **rechaza** con
   `Value exceeds the <vertical> envelope`, rechazo real y no clamp — y es un stop
   vertical-only. Forzar un receipt static-only publicaría una fila de paridad sin
   contraparte. El rechazo queda probado en el artifact de preflight.
4. **Negativo nuevo, y era obligatorio.** `border-fixed` empaqueta los cuatro
   `border-*-radius` junto con anchos y estilos, así que ligarlo aquí habría
   afirmado que el canal bajo prueba no debe moverse. Se agregó **una** entrada al
   vocabulario, `border-width-style-fixed` (misma entrada menos los cuatro
   longhands de radio), y es la que declara el control. `color`, `font-metrics`,
   `motion` y `control-height` se reutilizan sin cambios.
5. **Cerca de regresión focal.** Dos drills nuevos en
   `runtime/ingress/tests/index.test.mjs` fijan que el door siga siendo una ruta
   literal, que nunca vuelva a apuntar a `borderRadius`, y que los stops bajen
   valores **distintos** — esta última es la que atrapa el modo de fallo real, un
   lowering constante que igual satisface el guard de bajada vacía. Probadas por
   mutación contra el manifest de HEAD: ambas fallan sobre el anti-door y pasan
   sobre el corregido.
6. **`anatomy.propertyGroups` de `primitive/display/card`** gana `surface-radius`.
   No es una taxonomía inventada: el propio `propertyGroupsScopeNote` de la familia
   decía que `surface-decoration` es *"deliberately NOT the base fill, the border or
   the radius, which belong to groups a later calibration must name when it measures
   them"*. Ésta es esa calibración. El fill base y el trazo del borde siguen sin
   nombrar, así que la lista sigue siendo parcial por construcción.
7. **Vector false-inert todavía abierto, fuera de este packet.** `lowerStop` falla
   cerrado cuando un compilador no emite **ninguno** de los canales declarados, pero
   no cuando emite uno en un default constante. Cualquier control cuyo canal
   declarado tenga default incondicional puede cargar un brazo no vacío que no
   codifica stop alguno. Reportado, no arreglado.
8. **Los 6 receipts de `surfaces.effect-intensity` se reemitieron.** El repin de la
   autoridad los volvió stale por construcción: su superficie de frescura de 54
   archivos contiene tanto `capabilities/index.ts` como
   `manifest/controls/surfaces.effect-intensity.json`, así que ninguna variante de
   la Opción A los dejaba intactos. Se regeneraron los 6 escenarios (12 archivos)
   contra el árbol final y los 12 validan. **Ningún receipt cerrado queda stale.**
9. `program-check` se mantiene en **24** hallazgos: los mismos 24 de `spacing.rhythm`
   que ya existían en `5ce42e1b7`. **0 nuevos.** Verificado por diff del conjunto
   completo de fallos contra la línea base tomada antes de tocar nada.
10. `disposition` de la celda sigue `UNKNOWN` **no por falta de medición**, misma
    razón que el packet anterior; `SIGHTED_ACCEPTED` **no se reclama**.
11. **Sin medir**: divergencia responsive (un solo viewport), cualquier consumidor
    de `--ds-radius-scale` que no sea Card, y los pasos `sm/md/xl` y `full` de la
    rampa (resuelven en `token-readout` pero ningún fixture pintado los consume).

Toolchain de este packet: los 6 escenarios de `shape.radius-scale`, los 6
reemitidos de `surfaces.effect-intensity`, el build y los focales se corrieron
**sólo** en Node **v22.17.0** (el pineado). No se hizo cruce en otra versión, así
que este packet no reclama el contraste de reproducibilidad que el asiento
anterior sí tenía.

**F4B — `experience.profile` COMPUTED_VERIFIED (2026-08-23), 4/20.** Cuarto
control con evidencia causal de navegador; los asientos de `spacing.rhythm`,
`surfaces.effect-intensity` y `shape.radius-scale` quedan intactos. Base
`48fa4f20a`, `staged=0`, sin commit ni push. **4 escenarios positivos**
`primitive/display/card` x `{rottay,evnto}` x `{technical,editorial}`, cada uno
midiendo **los dos ingress en una sola escena** y en los dos temas: 4 artifacts +
4 receipts en
`packages/core/test-artifacts/quality-evidence/wo-cra-23/F4B/experience-profile/`.
Ningún run receipted `harness-suspect`; `ingressEquivalence` con 0 filas
divergentes en los 4; `restore.exact = true` y `negativeControls.held = true` en
cada brazo. **Se planificaron 5 positivos y se entregan 4**: el quinto
(`bithire` x `editorial`) no logró `static=DB` y por eso **no lleva receipt** —
ver nota 3. **24/24 receipts frescos, NO 25/25**; la diferencia es un hallazgo, no
una omisión.

**El instrumento no podía bajar este control, y ése es el primer hallazgo.**
`experience.profile` declara `domain.kind: "profile-id"`, e
`ingressValueForStop` sólo conocía `closed-enum` y `bounded`: `profile-id` estaba
nombrado en un **drill negativo existente** que exigía que fallara cerrado. El
preflight terminó en **STOP** con memo durable
(`PREFLIGHT-STOP-2026-08-23.md`, sha256 `f32379b2…`), y el DT autorizó el packet
expandido después de leerlo. Soporte agregado en
`runtime/ingress/index.mjs`: el id se escribe **verbatim** (sin trim, sin
normalizar, sin quitar `@version`) y falla cerrado en tres direcciones — id que no
sea string no vacío, `calibration.catalog` ausente o vacío, e id fuera de ese
catálogo. La clausura se lee del **REGISTRO** (`calibration.catalog`), nunca de
`domain.enumValues`, que para este kind está vacío por contrato: leerlo de ahí
convertiría "enumValues vacío" en "se puede escribir cualquier cosa". En el drill
negativo se removió **sólo** `'profile-id'`; `token-map`, `color-set`, `scale` y
`undefined` siguen rechazándose. 4 drills nuevos (bajada verbatim en los dos
doors, id fuera de catálogo, catálogo ausente/vacío, id no-string): **37/37**.

**Fixture: Card gana un `title` real.** `--ds-letter-spacing-heading` es el único
canal declarado con cadena pintada inequívoca y no-radial, y sólo existe en
`[data-part='title']`, que el fixture no renderizaba. El markup se obtuvo
**renderizando el `ModernCard` real** con `title="Card title"` y pegando la salida
de `renderToStaticMarkup`, así que el drift test lo cubre igual que al root
(**19/19**). Sin fixture id nuevo; `root` intacto.

Números medidos. Pintado en `card-modern-md/title` (`letter-spacing`, idéntico en
ambos brazos y ambos temas, **8 de 8 celdas**): rottay `-0.196875px -> 0.13125px`
(technical) y `-> normal` (editorial); evnto `-0.3px -> 0.15px` y `-> normal`.
Segundo testigo pintado en `card-modern-md/root` (`background-image` vía
`--ds-elevation-lift-strength`): **6 de 8 celdas** — el stop `technical` (lift 0)
mueve **sólo en dark**, porque en light el canal ya resuelve a 0 y el stop es un
**no-op verdadero** para ese eje. Canal directo `--ds-letter-spacing-heading`
sobre `token-readout`, ambos brazos, los 4 escenarios: rottay
`-0.015em -> 0.01em` (technical) y `-> 0` (editorial).

Notas honestas:

1. **`experience.profile` reaches Card, y eso refuta la razón que la celda traía.**
   El cell pasó de `MUST_NOT_REACH` a **`MUST_REACH`**. La razón vieja era una
   cadena `Idem` hacia *"nobody reads `--ds-experience-profile`"*, que confunde el
   **marcador de procedencia** del control con sus **canales declarados**: el
   marcador efectivamente no lo lee `card.css`, pero dos de los otros cuatro
   canales sí y pintan. De los 5 declarados, sólo 2 pintan en este fixture;
   `--ds-edge-standard-width` no (la variante `elevated` lee el hairline, y ambos
   stops emiten `1px` = baseline) y `--ds-material-canvas-texture` tampoco (es
   canal de `semantic-surface.css`, y sólo el stop editorial lo emite porque
   `motif:'none'` expande a `{}`).
2. **`bithire` x `technical` es `DESIGNED_NULL`, medido y NO receipted.**
   `brand-themes/bithire/index.ts:3190` ya declara
   `experienceProfile: "rottay/bithire-technical@1"`: un tenant de bithire que
   elige ese stop elige **el perfil que el vertical ya tiene**. Se retiene como
   `bithire-technical.DESIGNED-NULL.json`. No debe leerse como control inerte.
3. **`bithire` x `editorial` es una DIVERGENCIA static/DB real, reproducida dos
   veces, y por eso NO lleva receipt.** `harness-live`, restore exacto y negativos
   sostenidos, pero `ingressEquivalence: DIVERGES (3 filas)`. Dos causas distintas,
   ambas confirmadas en fuente. (a) **Sombreado por especificidad, sólo en dark:**
   el artifact de bithire declara `--ds-letter-spacing-heading` dos veces — a
   especificidad de tenant base (`artifacts/bithire/index.css:644`, `-0.025em`) y
   otra vez en un bloque dark cuyo selector lleva atributo/clase extra
   (`…[data-theme='dark'], ….dark`, `:1496`, `-0.01em`). El brazo estático aterriza
   detrás del selector **base**, así que el bloque dark de bithire le gana y el door
   estático queda **inerte en dark**; el door DB escribe inline en `documentElement`
   y siempre gana. Las mismas 2 filas aparecen en el stop technical, así que es
   propiedad de la cascada del vertical, no del stop. (b) **Asimetría de brazos, en
   light:** `--ds-material-canvas-texture` se mueve en estático y no en DB porque
   `compileTenantThemeConfig` emite sólo 3 de los 5 canales declarados para
   bithire/editorial — la expansión **pierde contra un canal que el baseline del
   vertical ya autora**, que es el `defaultBehavior` declarado del propio control.
   El lowering estático no tiene baseline contra el cual perder. Ninguna de las dos
   es defecto *de* `experience.profile`; ambas quedan como `knownDefects` con
   remediación y están **por encima** de un packet de un solo control.
4. **La instrucción B del DT se revirtió, con ruling explícito.** Agregar
   `--ds-table-header-{letter-spacing,text-transform}` a `derivedChannels` estaba
   ordenado para conseguir un direct-read control fixture. Medido: hace lo
   contrario. `directControlFixtureIds` exige que **UN target lea TODOS** los
   canales declarados, así que ensanchar el conjunto **quita** el fixture en vez de
   darlo; y esos dos canales eran la **única** fuente de divergencia static/DB en
   rottay y bithire, porque ambos verticales los **autoran** en su artifact
   (`* 0.75` y `* 0.8125`) mientras evnto no. Revertido: `capabilities/index.ts`
   queda **byte-idéntico a HEAD** y el repin de 20 manifests que el DT había
   preautorizado **no ocurrió**. El fixture se resolvió extendiendo `token-readout`
   con los 5 canales **ya declarados**.
5. **Rojo falso reproducible del guard `unhydrated-target`, arreglado a nivel
   fixture por ruling del DT.** `color remains fixed` es `every-measured-target`, así
   que inyecta `background-color` en el plan de **todos** los targets; en un div
   pelado ese longhand está legítimamente en su valor inicial, y el guard reportó
   como no hidratado a un `token-readout` cuyas custom properties demostrablemente
   se movieron. Lo mismo en `card-modern-md/title` en fase de mutación, porque el
   stop editorial lleva `letter-spacing` legítimamente a `normal`. Experimento de
   control que lo aísla: el mismo par de fixtures bajo los 8 negativos de
   `spacing.rhythm` da **0** guard failures. Arreglado declarando `border-top-style`
   en ambos targets — la capa base del DS lo pone en `solid`, es decidible, no
   inicial y no es canal de ningún control. **No se declaró ningún negativo falso
   para hacer pasar un guard.** El arreglo estructural (que una propiedad inyectada
   por un negativo `every-measured-target` no vuelva decidible a un target por sí
   sola) vive en `foundation/guards`, fuera de los paths autorizados: queda como
   deuda.
6. **Negativos: sólo `color remains fixed`, y es un piso deliberado.**
   `font metrics remain fixed` **no puede** declararse: `--ds-letter-spacing-heading`
   es canal declarado de este control y el testigo pintado principal, así que esa
   entrada afirmaría que el canal bajo prueba no debe moverse. `border-fixed` y
   `border-width-style-fixed` quedan fuera por la misma clase de razón (el eje edge
   posee `--ds-edge-standard-width`; el eje geometry mueve `radiusScale` como field
   default). `motion remains fixed` queda fuera porque es **cierto por stop, no por
   control**: `management-editorial` fija `{intensity 0.7, durationScale 1.1,
   ambient subtle}` como field default, así que declararlo control-wide sería falso
   sobre el control aunque el payload de 5 canales no cargue ningún canal de motion.
7. **`internalChannels` de la celda: `--ds-card-title-letter-spacing`, y el dueño lo
   decide el lector.** `components/card.css:133` lo declara como
   `var(--ds-letter-spacing-heading)` — es decir, el **productor** del socket lo
   resuelve directamente desde el canal declarado de este control — y la skin modern
   lo lee en `card.css:521` con ese mismo canal como fallback. Por eso el dueño es
   `experience.profile` y no `typography.scale`. Único dueño: verificado que ninguna
   otra celda lo reclama.
8. **`anatomy.propertyGroups` de Card NO se tocó, y eso deja un hueco nombrado.**
   La celda declara sólo `surface-decoration`, el único grupo que la anatomía de
   Card posee y que cubre una cadena que este control mueve (root
   `background-image`). El testigo **principal** — title `letter-spacing` — no tiene
   grupo type-metrics en Card, así que se evidencia por `computedProperties` e
   `internalChannels` en vez de por grupo. Agregar ese grupo es una edición de
   `anatomy`, dueño revisado aparte y fuera del alcance autorizado: registrado como
   deuda, no rodeado.
9. **Los 20 receipts previamente cerrados se reemitieron y validan.** Circularidad
   que conviene dejar escrita: `sourceFiles` de un receipt incluye los manifests de
   control y de familia, así que **toda edición de manifest stalea todo receipt que
   lo nombre**. El orden correcto — y el usado — es congelar source y manifests,
   `--sync`, rebuild, y **recién entonces** emitir en una sola pasada. Verificación
   final con `verifyReceipt` (+`loadProgramContracts`) y `artifactStillMatches`
   sobre el árbol congelado: **24/24 VALID+FRESH, 0 stale**. **Ningún receipt
   cerrado queda stale.**
10. `manifest --check` pasa de **36** hallazgos en `48fa4f20a` a **24**: se
    eliminaron los 12 de digest stale y **no se introdujo ninguno nuevo**; los 24
    restantes son los de `spacing.rhythm` que ya existían. Verificado por diff del
    conjunto completo contra la línea base de HEAD.
11. `disposition` de la celda sigue `UNKNOWN` **no por falta de medición**, misma
    razón que los packets anteriores; **`SIGHTED_ACCEPTED` no se reclama** y
    `nextAction` es `OBTAIN_CODEX_SIGHTED_ACCEPTANCE`.
12. **Deuda explícita: 254 de 255 celdas de familia de `experience.profile` siguen
    con la razón conflacionada `MUST_NOT_REACH`.** Sólo se readjudicó
    `primitive/display/card`, y sólo porque ahora tiene testigo pintado. **Este
    packet no es evidencia sobre las otras 254 en ninguna dirección**; cada una
    necesita su propio testigo, y un flip masivo repetiría el error original en
    sentido contrario.
13. **Sin medir**: divergencia responsive (un solo viewport), cualquier consumidor
    de los 5 canales que no sea Card, y los tres canales declarados que no pintan en
    este fixture.
14. **Dos defectos propios, encontrados revisando mi propio diff y corregidos**:
    `json.dump` había escapado los em-dash a `\uXXXX` en todo `fixtures.json`
    (re-serializado con `ensure_ascii=False`), y una nota seguía diciendo "seven
    declared channels" después de la reversión a cinco.

15. **`roundId` cronológico, corregido dentro del packet.** La primera reemisión de
    los 20 receipts previos se corrió con `--round-id R2` para todos, lo que bajó a R2
    los 6 de `shape.radius-scale` que estaban en **R3** y habría contradicho su propio
    asiento. Detectado comparando contra `48fa4f20a` antes de cerrar. Corregido por
    orden del DT: los 6 de `shape.radius-scale` reemitidos con **R3** (cierre previo
    restaurado) y los 4 de `experience.profile` con **R4** como cuarto packet;
    `spacing.rhythm` y `surfaces.effect-intensity` **no** se re-emitieron con
    roundId nuevo y quedan en **R2**; a nivel archivo ambos SÍ fueron reescritos
    dentro de `56fb593fd` (los 8 artifacts y 8 receipts de spacing-rhythm y los
    receipts de effect-intensity llevan `createdAt` 2026-08-23T10:12Z/10:49Z).
    Mismos escenarios, mismos binds, mismo árbol final. Revalidación posterior:
    **24/24 VALID+FRESH**. Ningún asiento anterior queda contradicho.

Toolchain de este packet: los 4 escenarios de `experience.profile`, los 2
artifacts no receipted, los 20 receipts reemitidos, los builds y los focales se
corrieron **sólo** en Node **v22.17.0** (el pineado; el `node` por defecto de la
máquina es v25.2.1 y el PATH se fijó en cada invocación). No se hizo cruce en otra
versión, así que este packet no reclama contraste de reproducibilidad.


#### Asiento de autoridad y auditoría — 2026-08-23 (estado vigente)

- HEAD al abrir este asiento: `56fb593fdc134cf17b5bc9842085e3ff2e798d26`; worktree limpio.
- **DT vivo: Codex.** No hubo sucesión DT el 2026-08-23. Existe un handoff
  PREPARADO a Kimi K3 (`/Users/daniel/Developer/Rottay/modern-rescue-kimi-dt-handoff-2026-08-23.md`,
  SHA `088ddd360676439719a203271a0ff2a067314f3ed0a2d434b33a89a81b84e665`) que
  NO tiene efecto de autoridad: la última orden explícita del owner fue dejar
  un prompt sin transferir ni operar la sesión, y la autorización posterior a
  Codex fue contactar a Kimi K3 únicamente para la re-auditoría. La sucesión
  sólo la consuma una orden explícita del owner; cuando ocurra, el packet de
  autoridad (AGENTS.md, CLAUDE.md, agent-orchestration.json, program-check.mjs,
  README del programa, tenant-art-direction.json, rounds.json,
  checkpoint.intent.json, fence SIGHTED_APPROVER) se ejecuta en UN packet con
  procedimiento T-1 y con la fecha real de esa orden.
- **Re-auditoría independiente Kimi K3 (owner override 2026-08-23, READ-ONLY):**
  veredicto `ACCEPT_WITH_CORRECTIONS`.
  Memo: `/private/tmp/modern-rescue-kimi3-independent-reaudit-2026-08-23.md`,
  SHA `2b87b306e2b4d372533dd314f35d8e6c165e027e806eab4b16fecf391791a518`.
  Prompt fresco: `/private/tmp/modern-rescue-kimi3-fresh-session-prompt-2026-08-23.md`,
  SHA `c328f4254c1509c1894885028c1bd85f5d170f1f84ade0fcee8f6590953fbd62`.
  Revisión Fable de sus correcciones:
  `/private/tmp/modern-rescue-fable-review-kimi-corrections-2026-08-23.md`
  (SHA registrado en su archivo `.ready`). Los tres persistidos en
  `docs/evidence/2026-08/` por este asiento.
- **Estado de gates en HEAD (medido, no heredado de memos):**
  `program-check.mjs` = `BLOCKED`, 24 fallos, todos celdas `spacing.rhythm` de
  `manifest/families/primitive/layout/{flex,grid,space,stack}.json`
  (mechanism null; internalChannels vacío; evidenceIds `R2:…` fuera del
  evidence root — los artifacts viven en
  `test-artifacts/quality-evidence/wo-cra-23/F4B/spacing-rhythm/`; evidenceKind
  sin computed-delta ni exact-restore). Heredado desde `56847146f` (25→24 en
  `5ce42e1b7`, 0 nuevos después). `gat07:check` = STALE: sello vigente
  `1c127bf0e` (2026-08-22) invalidado por la serie F4B (18 inputs sellados
  modificados desde el sello). Drill `composition/receipt` 11/12 (rojo
  heredado con ruling del dueño "fuera de alcance", asentado arriba en el
  packet de effect-intensity).
- **Regla vinculante nueva (C3):** cada packet F4B restante cierra con resello
  `gat07:write` como paso obligatorio, antes de su commit.
- **Correcciones que bloquean F4B 5/20 (orden):** C2 (program-check verde:
  corregir las celdas o enmendar la ley del gate UNA sola vez con asiento,
  unificando el vocabulary evidenceKind con los otros 3 controles), C3
  (resello gat-07), C4 (abajo). C2 y el refresh de `checkpoint.intent.json`
  (`currentWave` describe F4A como frente abierto; F4A cerró 2026-08-22) son
  contratos máquina: se ejecutan como packets T-A con program-check corrido
  antes y después, nunca como edits documentales.
- **Deudas con dueño (C6):** `OPEN_VERTICAL_CASCADE_DEFECT`
  (`manifest/controls/experience.profile.json:95`; bithire dark:
  `artifacts/bithire/index.css:644` vs `:1496`) queda `OPEN_DT` — crear packet
  propio: es propiedad del generador de artifacts verticales, no de
  `experience.profile`. `OPEN_ARM_ASYMMETRY` (`experience.profile.json:103`)
  queda `OPEN_OWNER` — decisión requerida antes de F2-asimétrico/F3.
  **SUPERSEDIDA la lectura de la clase (M-1, 2026-08-24 — ver su asiento
  abajo):** la doble declaración dark del artifact es SALIDA CORRECTA de
  `compileModeBlocks` (los compiladores coinciden en dark: el seed del
  tenant no entra al bloque de modo); lo que estaba mal era el INSTRUMENTO
  (brazo DB descartando `modeDeltas`). La clase se re-adjudica de "defecto
  del generador" a "brazo DB del instrumento (fase (a) de H-3) + pregunta
  de producto para el owner (¿debería el seed del tenant mover el modo
  no-default?)". El hecho medido (especificidad, líneas) sigue verdadero;
  lo refutado era la atribución.
- **OPEN_OWNER adicionales:** resolución del `stash@{0}` pre-programa (toda
  operación de stash está vetada sin orden explícita del owner); política de
  backup de los 519 commits locales sin push; reapertura (o no) del fence
  `SIGHTED_APPROVER` cuyo rojo tiene ruling previo del dueño.

##### Brecha de escribanía PRE_F4B→F4B (C4) — declarada, no regularizada

La condición vinculante de apertura del Lote B (asiento PRE_F4B, decisión 6c:
`unknownProvenance == []` real MÁS doble postaudit — reauditoría independiente
A4–A9 y postaudit Fable del diff completo) se cumplió sólo a medias. El drenado
2.024→0 existe: **15 commits** `8d2985638..6cfdcc1a9` (2026-08-22, inclusive),
todos con cuerpo vacío, que además tocaron **2 archivos de `packages/core/src/`**
fuera del write-set mínimo declarado A4/A5/A6
(`foundation/tokens/ts/runtime/personality/index.ts` y
`infrastructure/runtime/theming/presentation/adapters/react/css-variables-bridge/index.tsx`).
Ni esos commits, ni el ruling de apertura del Lote B, ni las dos auditorías
exigidas tienen asiento en este ledger, y no se hallaron memos de postaudit en
/tmp (sólo logs de corrida). **Remediación vinculante antes de F4B 5/20:** el
DT agenda la doble postaudit retroactiva del diff `8d2985638~1..6cfdcc1a9`
(incluidos los 2 archivos src) y asienta su resultado acá, o el owner dispensa
la condición explícitamente y la dispensa se asienta. Esta declaración no
inventa retroactivamente un ruling que no se registró.

##### T-1 — Sucesión DT Codex → Kimi K3 CONSUMADA (2026-08-23, acto del DT entrante)

**Supersedencia declarada.** La orden explícita del owner del 2026-08-23
(`docs/prompt-dt-fresh-session-2026-08-23.md`, ejecutada por la sesión fresca
del DT entrante) consuma la sucesión Codex → Kimi K3. Este asiento supersede,
sin reescribirlos: el literal "DT vivo: Codex. No hubo sucesión DT el
2026-08-23" del asiento de autoridad de esta misma fecha (escrito antes de la
orden), la fila "Codex: DT y autoridad de adjudicación" del bloque Autoridad
y roles vigentes, y toda cláusula viva que nombraba a Codex como DT. Codex
queda como consultor técnico read-only de baja frecuencia (sin gate, sin
asiento de auditoría, sin autoría). Exactamente un DT vivo antes, durante y
después: es la **tercera** sucesión de la cadena (2026-08-20 Codex→Kimi K3,
2026-08-21 Kimi K3→Codex, 2026-08-23 Codex→Kimi K3), y la regla DT ≠ auditor
(decisión 13) vincula a Kimi K3 desde ya.

**Baseline verificado una vez, no reconstruido:** HEAD `aaa96eef8` (commit
documental del owner con el prompt de sucesión; parent `78dce1f7a`, el HEAD
que la orden declaraba esperado), `main...origin/main [ahead 521]`, worktree
limpio, staged 0, sin push, `stash@{0}` intacto (owner-gated). Sesiones tmux:
f05-opus, f05-sonnet, fable-ejec y f05-kimi3-advisor vivas;
f05-codex-reviewer recreada con bypass de aprobaciones para la consulta
read-only de baja frecuencia.

**Write-set (13 paths, ejecutado por el DT entrante; no se delegó autoría de
autoridades):** `AGENTS.md`, `CLAUDE.md`, `agent-orchestration.json`,
`program-check.mjs`, `program-check.test.mjs`, `README.md` del programa
(sección Roles reescrita; bloque stampado re-renderizado por
`program-state --write`, nunca a mano), `tenant-art-direction.json`,
`rounds.json`, `program.json`, `quality-rubric.json`,
`visual-craft-contract.json`, `checkpoint.intent.json` (currentWave F4B,
blockedOn C2/C3/C4 + deudas con dueño) y este roadmap.

**Rulings DT del packet (decididos una vez):**

1. **Los nombres legacy NO migran.** Los enums `*_PENDING_CODEX_AUDIT` /
   `IMPLEMENTED_PENDING_CODEX_AUDIT`, el campo `codexDecision`, la clave
   `maximumFamiliesBetweenCodexCheckpoints` y el token de fórmula
   `codexSightedApproved` son nombres históricos, no designaciones de asiento
   (precedente K5: `KIMI-CUSTOMIZATION-PRESERVATION-MANIFEST.json`).
   Renombrarlos sería una migración de datos sobre evidencia sellada y
   tooling v2 sin ningún efecto de autoridad.
2. **El fence `SIGHTED_APPROVER` (`v2/receipts.mjs:7`) queda fuera del
   write-set.** Su rojo tiene ruling previo del dueño y su reapertura es
   `OPEN_OWNER`; la orden T-1 sólo permite tocar fences si el ruling vigente
   lo permite. `finalSightedAuthority` del rubric es contrato vivo
   checker-pinned y SÍ migró; el fence de receipts es una constante
   independiente y sigue owner-gated.
3. **`phase-a/ledger-schema.json` no se toca** (sellado; scope adjudicado
   `:!**/phase-a/**`).
4. **Las aceptaciones futuras nombran al rol, no al actor:** R1–R4 GO, R6
   ("Independent DT certification") y R7 entry/exit quedan en lenguaje de rol
   (`DT`), coherente con `customization-model.json#r7Execution.entryLaw`.

**Pruebas (Node v22.17.0, antes → después):** `program-check.mjs` BLOCKED con
el mismo conjunto de 24 fallos `spacing.rhythm` (4 familias × 6 clases) —
salida byte-idéntica a la baseline (0 nuevos, 0 resueltos; C2 sigue abierto y
es el próximo packet). `program-check.test.mjs`: 46/48 → 46/48 con identidad
de fallos preservada: test 1 = **46 errores** (los 24 heredados de
spacing.rhythm MÁS 22 sobre `card.json` que son artefacto estructural del
sandbox T-1a — `CLOSURE_MEMBERS` no incluye `packages/core/test-artifacts`,
así que dentro del sandbox ningún receipt F4B existe; deuda PREEXISTENTE
T-1a/F4B, invariante bajo T-1, con packet futuro propio: añadir
`test-artifacts` a `CLOSURE_MEMBERS`, NO hacerlo dentro de T-1) y test 47 =
A11 preexistente (`cascade-producers.test.mjs` N13/T-21, deuda PRE_F4B).
`program-state --write` re-renderizó el checkpoint (intent `150b10665e5919da`,
render `ab56c7f91a1b623e`); `program-state --check` sin violaciones.

**Postaudit Fable del diff T-1: `ACCEPT`.** Memo
`/private/tmp/t1-succession-fable-postaudit.md`, SHA-256
`7ed3a67f3a3e353eecbf443046c369c067628fde212f5d6966c8f637df4f3927`
(verdict en `.ready`: 6/6 puntos falsables atacados, ninguno refuta;
autorización de commit condicionada a completar estos placeholders — hecho).
Hallazgos no bloqueantes asentados: (1) la caracterización fina del test 1
(46 errores, arriba); (2) `SIGHTED_APPROVER` queda doblemente stale y sigue
owner-gated (al reabrirse: apuntar al asiento por rol o derivarla de
constante viva, no a otro nombre propio); (3) las sesiones tmux declaradas en
este asiento son declaración del DT, no hecho auditado.

##### C2 — `program-check` VERDE (`CONSTITUTION_READY`) por primera vez desde `56847146f` (2026-08-23)

Los 24 fallos heredados de `spacing.rhythm` (4 familias × 6 clases) se
resolvieron **causalmente**: la ley del gate NO se enmendó (cero diff en
`manifest/rules/**`, `program-check*`, `v2/**`) y ninguna celda se reancló a
otra evidencia. Writer: Claude Opus (único writer), SOURCE_READY
`/private/tmp/c2-spacing-rhythm-opus-source-ready.md`. Postaudit Fable:
**ACCEPT**, memo `/private/tmp/c2-spacing-rhythm-fable-postaudit.md`, SHA-256
`236d1ab34f390ee7db0e6f4d2a429526ea242e6a0a9d1d02c4a0bd55d34963ae`.

**Write-set (14 paths):** 4 celdas `spacing.rhythm`
(flex/grid/space/stack) — `mechanism: THEME_CONTROL`, 11 edges
`internalChannels` reales (subconjunto exacto de los `outputBindings`
preexistentes, `extra=[]`, ley de cardinalidad verificada: cero dueños en
disputa sobre las 255 familias), `evidenceIds` como rutas repo-relativas del
evidence root (la forma de los otros 3 controles); control manifest **+1
línea** (`calibration.evidenceKindLabellingRule`: tight→
`static-db-computed-parity`, airy→`exact-restore`; cada artifact prueba ambas
mitades — Fable muestreó 4/4); `manifest/index.json` regenerado por el
productor canónico (6 hojas digest, cero drift semántico); 8 receipts
**re-emitidos por el productor** (`writeEvidence`/`buildReceipt`, nunca a
mano): 3 campos cada uno (`evidenceKind`, `sourceDigest`, `createdAt`),
artifacts byte-idénticos a HEAD, `roundId` R2 preservado. `disposition`
sigue `UNKNOWN` y `unknownReason` íntegro en las 4 celdas (honesto: sin
aceptación sighted).

**Verificación DT de primera mano:** `program-check.mjs` =
`CONSTITUTION_READY` (corrida propia); validador v2 = 24/24 VALID (corrida
propia); Fable re-verificó por tres validadores: 24/24, 0 stale. Suite
constitucional tras el packet: test 1 pasa de 46 errores a **22** (los 24 de
spacing.rhythm resueltos; los 22 restantes son el artefacto sandbox
`CLOSURE_MEMBERS` sin `test-artifacts`, deuda T-1a/F4B ya asentada con packet
futuro propio).

**Obligaciones vinculantes del ACCEPT (F1/F2 del postaudit):**

1. **ROJO CONOCIDO declarado:** `resolution-probe` negative-controls test #20
   queda **19/20** (verde en HEAD analíticamente). Conflicto de leyes
   PREEXISTENTE: ese test exige `evidenceIds` de celda ⊆ listas del control
   en forma `R2:…` mientras `program-check` (constitucional, blocking) exige
   rutas resolubles bajo el evidence root; ambas son insatisfacibles a la vez
   y el packet obedeció la constitucional. No es gate-wired (`test:scripts`
   no cubre `src/tooling`). Evidencia: el memo Fable de este packet.
2. **FOLLOW-UP OBLIGATORIO** antes del próximo packet que toque
   `spacing.rhythm`: re-legislar **una sola vez** el test negative-controls
   (el test entra en su write-set), preservando la protección causal
   histórica («evidence is OUTPUT, never hashed as source binding») en la
   forma nueva; verificar en ese packet que el runner no hashea
   `evidenceIds` de celda (no asumirlo). Puede fusionarse con el de H1 en UN
   packet atómico.
3. **H1 (follow-up atómico):** 4 canales `--_ds-` reales
   (`--_ds-grid-column-gap`, `--_ds-grid-row-gap`,
   `--_ds-stack-divider-gap-block`, `--_ds-stack-divider-gap-inline`) sin
   declarar porque el cross-check inverso exige fila en `terminalReach` de
   `manifest/cascade/roots/spacing.rhythm.json` (fuera del write-set C2).
   Correspondencia a preservar 1:1: `terminalReach` 88 filas = 88 edges.
   Corrección de censo (F2): las listas `staticDbParityEvidenceIds`/
   `exactRestoreEvidenceIds` las leen el generador Y el test #20; el fix
   cosmético propuesto por el writer queda descartado en favor del follow-up
   legislativo. Observación (F3): criterio `fallbackAuthority` consistente
   al declarar esos 4 edges.
4. **H2/H4/H5:** correctos y asentados (`--ds-density-effective-scale` no
   reclamado — dueño `density.mode`; `SIGHTED_APPROVER` doblemente stale y
   owner-gated; rótulo de flex lista canales de stack — adjudicación DT
   pendiente, no urgente).

**C3 — resello GAT-07 ejecutado como paso obligatorio del cierre (regla
vigente desde T-1):** `gat07:write` + `--check-artifact` verdes — 2 corridas
deterministas idénticas, hash `a24805069cf45ee25cebde62e5feb635052dac3baa2260c996261467c636e6d4`,
3326 counters / 3226 exact zeros / 542 data-part entries. Artefactos:
`packages/core/test-artifacts/gates/gat-07/semantic-evidence.json` y
`semantic-hash.txt`. El sello `1c127bf0e` invalidado por la serie F4B queda
superseded por este. **Regla operativa adoptada:** el resello `gat07:write`
es paso obligatorio del cierre de TODO packet F4B, antes de su commit.

##### C4 — brecha PRE_F4B→F4B REGULARIZADA (2026-08-23)

La brecha declarada arriba queda cerrada por doble postaudit retroactiva más
fixes focales. La condición 6c queda **satisfecha en sustancia** (ver salvedad
de letra abajo); F4B 5/20 queda habilitado.

**Diff auditado:** `8d2985638~1..6cfdcc1a9` (15 commits, 2026-08-22/23), 9
archivos, +12.643/−2.105 — diffstat COMPLETO (lección NEW-1: no sub-declarar
alcance): `cascade-disposition.mjs` (nuevo, 1665), `cascade-governance.mjs`
(nuevo, 651), `cascade-producers.mjs` (+577), `cascade-producers.test.mjs`
(+3816), `cascade-public-surface.mjs` (nuevo, 572),
`cascade-cross-file-resolver.mjs` (nuevo, 3092),
`manifest/cascade/extracted/producers.json` (4156 líneas modificadas), y los
2 src fuera del write-set mínimo:
`src/foundation/tokens/ts/runtime/personality/index.ts`,
`src/infrastructure/runtime/theming/presentation/adapters/react/css-variables-bridge/index.tsx`.

**Doble postaudit retroactiva:**

- Reauditoría independiente A4–A9: Codex (consultor read-only, caveat de
  tenure declarado — fue DT cuando aterrizó la brecha; su memo no cuenta como
  asiento organizacionalmente independiente). Veredicto DEFECTS. Memo
  `/private/tmp/c4-a4a9-codex-reaudit.md`, SHA-256
  `5ad31219ba57866522444dd01e93ed891a649d09153db77fc990cfa64ccdbaf8`.
- Postaudit principal del diff completo: Fable 5. Veredicto **REGULARIZA** —
  el trabajo es real, correcto y re-derivable; nada que rehacer. Memo
  `/private/tmp/c4-full-diff-fable-postaudit.md`, SHA-256
  `645c634ef207b065717b222489ab477556e6756c7f71ca61808c0050d78458e4`.
  Reproducciones independientes + muestra semántica disjunta de la de Codex;
  los 5 hallazgos de Codex quedaron 5/5 CONFIRMED contra el árbol.
- **Condición 6c: satisfecha EN SUSTANCIA** (adjudicación Fable): todos los
  invariantes que la reauditoría debía establecer fueron verificados además
  por el asiento independiente. Si el owner exige la letra exacta (reauditor
  organizacionalmente independiente), una tercera pasada es posible; Fable no
  la recomienda por falta de valor marginal identificable. Queda ofrecido al
  owner; por defecto se toma la sustancia.
- Ambos memos entran en `docs/evidence/2026-08/` en el próximo lote
  documental (deuda de persistencia asentada).

**Verdad establecida:** `unknownProvenance == []` es real y re-derivable
(2024 = 69+627+534+728+66; `openBlocking 0`, `ownershipConflicts 0`,
`lotBOpen true`; sin contador pineado). Muestras semánticas disjuntas
(20 Codex + 4 Fable) concordantes con fuente.

**Adjudicación D1 (los 2 src):** el cambio (37 canales `--ds-*` → 37 sockets
`--_ds-personality-resolved-*`, biyección exacta con `personality.css`,
fórmulas byte-intactas, hold con re-derivación y guard de consenso
fail-closed, 23/23 tests focales verdes) es **la corrección de autoridad que
la doctrina exige** (el runtime no emite una capa visual que compita; los
canales los pinta la proyección estática), aterrizada **por canal indebido**
(dentro de una brecha declarada como instrumentación, fuera del write-set
mínimo, sin asiento). **Brecha de PROCESO, no de contenido: se acepta con
este asiento, sin reversión; los 2 src no se tocan.**

**Fixes focales ejecutados (packet C4-fix, writer Opus):**

1. **T-11 anclado** (`cascade-producers.test.mjs`): el test ahora pinea que
   los digests PUBLICADOS son el hash de la proyección productiva sobre las
   filas reales (`relayKinds` incluido — defecto lateral corregido), con
   guarda de vacuidad (534/728/66 filas) y dos negativas de granularidad
   (borrado masivo y alteración de UNA fila mueven el digest publicado).
   Sensibilidad probada por tríada: íntegro+nuevo=PASS, mutado+viejo=PASS
   (el defecto), mutado+nuevo=FAIL exactamente en el anclaje. La desviación
   (anclaje en vez de mutación productiva literal) quedó ACEPTADA en
   sustancia por Fable con fundamento verificado (digest local no
   exportado; `classifyCrossFileRows()` clava REPO_ABS). Observación
   registrada: el anclaje es un PIN — un cambio legítimo futuro de la
   proyección exige actualizar el test en lockstep; ese rojo futuro es
   diseño, no regresión.
2. **T-12 renombrado** con comentarios y banner T-FINAL-352 corregidos,
   CERO cambio de assertions (verificado mecánicamente: las 9 líneas
   `assert.` del diff son todas de T-11); advertencia legítima preservada y
   apuntando a la ley de implicación. Conteo: 209 antes, 209 después.
3. **Frescura:** `producers.json` re-derivado por el productor canónico
   (`--write`); leaf-diff completo = exactamente las 4 hojas de frescura
   (censo 1664→1665 + digest); filas, listas, receipts y stats intactos.

Verificación: `cascade-producers.test.mjs` **209/209** (PRE 207/2; N13 y
T-21 verdes, corridas propias del DT y de Fable); `--check` OK matches the
tree. Postaudit delta Fable: **ACCEPT**, memo
`/private/tmp/c4-fix-fable-postaudit.md`, SHA-256
`5b8af3d9cf04e46db0b3ba52c290b87c2b6ea43b9ef3def905c44b097f3bcdb2`.
Write-set contenido: los 2 src de D1 y el productor con 0 diff.

Con C2, C3 y C4 cerrados, **F4B 5/20 queda habilitado**. Disciplina
operativa adoptada (mandato Fable): stage siempre por paths explícitos; el
DT no escribe el ledger durante la corrida de aceptación de un writer.

##### H-1 + F4B-5 density.mode + degradación honesta de experience.profile (2026-08-23)

Packet consolidado en UN commit, exigido por la cadena de frescura del
instrumento: H-1 stalea los 30 receipts, y el gate sólo vuelve a verde con
todo re-emitido y re-medido contra el árbol final. Writer: Claude Opus
(único writer). SOURCE_READY
`/private/tmp/h1-density-experience-opus-source-ready.md`.

**H-1 — el brazo estático compila SOBRE el baseline del vertical.**
Defecto medido en F4B-5: `cli/index.mjs:581` llamaba `lowerStop` sin
`base`, compilando un BrandTheme monocampo inexpedible en producción; el
`?? 1` de la semilla disparaba y `--ds-density-scale` colapsaba a `1` en
bithire/evnto (rottay inmune por casualidad). Precisión asentada (Fable):
el compilador estaba bien; el instrumento le daba un theme que producción
no despacha. Fix: `base` del vertical publicado sólo en el brazo estático
(el DB resuelve su baseline dentro de `compileTenantThemeConfig` —
asimetría estructural). **Preaudit Fable: ACCEPT con 5 correcciones
vinculantes (V1–V5)**, memo
`/private/tmp/h1-base-arm-fable-preaudit.md`, SHA
`ac2cd7a1fffe0a8b4a5f855d517501a5a3ea5882b0cda522dc835ff1ba8f9cdf`:
prosa fechada en `INGRESS_ARMS` + README, `producedBy.input.baseline`
OBLIGATORIO (la verificación de arm falla sin él), drill 3 construido para
crecer (itera controles cerrados desde el manifest), cargador bajo la ley
de frescura de dist, guard anti-doble-aplicación al brazo DB. Cambio de
significado del instrumento, acto fechado: la puerta estática mide "el
stop compuesto sobre el theme autorado del vertical". Drills **47/47**;
los 20 receipts spacing/effect/radius quedan **invariantes** (drill 3 los
pinea; sus artifacts conservan bytes).

**F4B-5 — `density.mode` COMPUTED_VERIFIED, 5/20.** 6 escenarios
{rottay,bithire,evnto} × {compact,spacious}, ambos brazos sobre una escena,
ambos temas. Pin por canal: `--ds-density-mode-factor` 0.85/1.15 en AMBOS
brazos; el `--ds-density-scale` estático ya no colapsa (1 / 0.9 / 1.125).
Pintado en `space-modern-preset-gap/root`: 15→12.75 / 13.5→11.475 /
16.875→14.3438 (compact) y 15→17.25 / 13.5→15.525 / 16.875→19.4062
(spacious) — **estático = DB en los seis**, ratio idéntico 0.85/1.15 con
absolutos divergentes (multiplicador puro sobre escala estructural).
Rhythm aislado (cero declaraciones en los 3 artifacts + lectura en ambas
fases); gap numérico negativo intacto; restore exacto con asimetría
declarada (bithire parte de un `1` de ORIGEN PERFIL, asentado). Celda
`primitive/layout/space` COMPUTED_VERIFIED (mechanism THEME_CONTROL,
stableParts [root], propertyGroups [preset-and-exact-gap]); control con
listas particionadas desde el inicio, `measuredResult` honesto (UNA
familia medida; el canal tiene 71 lectores), `unmeasuredScope` con la ley
de `normal` (identidad, sin receipt — expresable, a diferencia de `suave`),
`negativeControlsScopeNote` (control-height/touch-target/font-metrics/
icon-size NO se declaran a nivel control: `menu.css:401`,
`Input/engines/modern/index.tsx:170`), `sourceBindings` ×9, y 2
`knownDefects` nuevos (vocabulario triple de density — deuda registrada
breaking, no de este packet; tensión intención-vs-mecanismo en bithire —
registrada como OPEN_DT para revisión de craft). Receipts nuevos R5 ×6.
**Adjudicación DT previa:** fix del anti-door `capabilities/index.ts:248`
→ `surfaces.density` (protocolo radius-scale: repin de 20 manifests, cero
drift semántico fuera del path).

**experience.profile — DEGRADADO honestamente (COMPUTED_VERIFIED →
IMPLEMENTED).** Su re-medición pintada bajo el instrumento corregido
**refuta, no renumera**: en los 6 casos el brazo estático queda INERTE
para `--ds-letter-spacing-heading` mientras el DB lo mueve. Dos causas
distintas: (a) rottay/evnto — el brazo compuesto emite exactamente el
valor que el artifact ya autora (el perfil pierde contra el campo autorado
dentro de `compileBrandTheme`, precedencia `brand-theme:758-773` —
producción-verdadero); (b) bithire — el artifact declara el canal dos
veces y el bloque dark de mayor especificidad gana
(`OPEN_VERTICAL_CASCADE_DEFECT`, ortogonal, ABIERTA). La asimetría es REAL
y general, no artefacto del instrumento ni rareza de bithire. Celda card →
IMPLEMENTED con `verificationNote` (refutación + causa doble + pregunta
owner-pendiente); control → IMPLEMENTED con `knownDefects[0]`
`ARM_ASYMMETRY_REAL_NOT_ARTIFACT` (`OPEN_OWNER`, con la prueba);
`measuredResult` preservado verbatim con `supersededStatus` (supersedida
la conclusión, no los números); 4 receipts re-emitidos SÓLO por frescura
(R4, artifacts byte-idénticos). **`OPEN_ARM_ASYMMETRY` queda como decisión
de PRODUCTO del owner** con prueba nueva; el censo de canales perfil ×
autorado vertical se corre con su respuesta. Las 6 mediciones nuevas
(advisory) persisten en `docs/evidence/2026-08/h1-experience-advisory/`
(10 archivos, INDEX actualizado, 10/10 MATCH).

**Re-emisiones y gates:** 30/30 re-emitidos (R2×14, R3×6, R4×4, R5×6;
**tres** campos movidos: `sourceDigest`, `createdAt` y `toolVersion` — la
huella H-1 del instrumento, corrección F2 del postaudit), validador v2
30/30 VALID+FRESH (corrida propia del DT); `manifest/index.json`
regenerado (2002→2006 hojas: **4 altas** = parts/groups de density y
**25 cambiadas** = los 7 declarados + los 18 digests de los controles
repineados — delta verdadero citado, corrección F1 del postaudit, cero
drift real);
`program-check.mjs` = **CONSTITUTION_READY** (corrida propia del DT);
`tsc --noEmit` limpio; build canónico post-H-1 verde. **Ley de
procedimiento adoptada:** copia previa obligatoria antes de re-medir
evidencia existente (sirvió: el runner sobrescribió los 4 artifacts de
experience y se restauraron byte-idénticos desde la copia).

**Consulta ejecutiva Codex (cierre de tanda de gobernanza), asentada:**
(1) frescura por dependencia semántica — reforma de una vez ANTES de F9
(kernel/guards compartidos invalidan todo; sólo el fixture/vocabulario/
adapter usado invalida su escenario; preaudit + drills + default
conservador); (2) fix estructural de `lowerStop` SÍ — debe cerrar antes
del próximo packet dependiente (el pin por canal queda como redundancia);
(3) responsive.posture por sonda DATA diferencial (adapter que exige delta
exacto en `normalizedAppearance`, igualdad total de variables CSS, prueba
el consumidor real, verifica restore y mutaciones) con guardia nueva +
preaudit Fable. Quedan en la cola con ese orden.

**Postaudit Fable del packet consolidado: `ACCEPT`** con 2 correcciones de
asiento no bloqueantes (F1: delta verdadero del índice 4 altas + 25
cambiadas — incorporado arriba; F2: `toolVersion` como tercer campo de
frescura — incorporado arriba). Memo
`/private/tmp/h1-density-experience-fable-postaudit.md`, SHA-256
`8021cffeeeb25e9926487ec2712e4088976335d67d025f754a549ffe6f19b440`.
Verificado por Fable: V1–V5 completas sin rebaje; density 6/6 pins con
valores físicos inspeccionados; degradación de experience honesta y
completa (measuredResult verbatim, refutación con doble causa sin fundir,
`nextAction: AWAIT_OWNER_DECISION_ON_PROFILE_VS_AUTHORED_PRECEDENCE`);
advisory 10/10 byte-idénticos; GAT-07 `ddec6036…` verificado; la
hipótesis de su propio preaudit (artefacto del instrumento) quedó refutada
por la medición — el flujo V2 funcionando. **F4B queda 5/20 honesto.**

##### H1/H3 — spacing.rhythm íntegro: legislación negative-controls + terminalReach 92=92 (2026-08-23)

Follow-ups vinculantes del ACCEPT C2, cerrados en UN packet atómico (writer
Opus; SOURCE_READY `/private/tmp/h1h3-spacing-opus-source-ready.md`):

1. **Test #20 re-legislado UNA vez** (`negative-controls/tests`): la forma
   nueva es "todo evidence id vive bajo el evidence root y resuelve a un
   receipt válido; las listas del control están particionadas por rol". La
   protección causal («evidence is OUTPUT, nunca un source binding
   hasheado») se preserva en su forma REAL: por RUTA, no por proxy de forma
   — `normaliseBoundPath` (`cli/index.mjs:429-432`) descarta todo path bajo
   el evidence root "however a manifest happens to spell an evidence id",
   así que el defecto histórico es hoy estructuralmente imposible
   (verificado en fuente + observación: 30 receipts, 0 rutas del root en
   `sourceFiles`). El drill muerde si los ids salen del root (inmediato) o
   si el guard del runner se rompe (en la siguiente re-emisión — latencia
   asimétrica asentada como hallazgo-nota Fable; opción barata NO
   vinculante: drillear `normaliseBoundPath` directo vía seam). 19/20 →
   **20/20**.
2. **terminalReach 92 = 92** (`cascade/roots/spacing.rhythm.json`, +4 filas
   `PRESCRIPCION` uniforme con las 88 previas) + **4 edges `--_ds-`**
   (`--_ds-grid-column-gap`, `--_ds-grid-row-gap`,
   `--_ds-stack-divider-gap-block`, `--_ds-stack-divider-gap-inline`) con
   fuente verificada línea por línea, `LIVE`, ∈ `outputBindings`
   preexistentes (cero canales inventados), `fallbackAuthority: null` con
   las dos razones distintas (grid lee sin fallback; stack = recomputación
   aritmética con guard `0px`, no cadena de valor — criterio F3). El 93.º
   edge (`--_ds-stack-gap-current`) es scratch-marked y el cross-check
   inverso lo saltea — el conteo ingenuo 93 no descuadra; censo Fable
   confirma 92 no-scratch = 92 filas.
3. **Listas del control particionadas** (defecto H3 cerrado): tight ×4 en
   `staticDbParityEvidenceIds`, airy ×4 en `exactRestoreEvidenceIds`,
   solape 0; celdas ⊆ set del control.

Verificación: `CONSTITUTION_READY` (corrida DT); test #20 20/20; validador
30/30 VALID+FRESH (re-emisión por frescura del contacto con manifests;
artifacts byte-idénticos; roundIds preservados). Postaudit Fable:
**ACCEPT**, memo `/private/tmp/h1h3-spacing-fable-postaudit.md`
(SHA en su `.ready`), con la nota de latencia asentada arriba.

##### H-2 — guard estructural de discriminación de stops (vector falso-INERTE cerrado) (2026-08-23)

El vector abierto desde `shape.radius-scale#knownDefects[1]` («`lowerStop`
falla cerrado cuando un compilador no emite NADA, pero no cuando emite un
default constante incondicional») queda **cerrado estructuralmente** por un
guard nuevo del instrumento, con preaudit Fable (ACCEPT, W-A…W-E) y la
recomendación Codex registrada. Writer: Opus. SOURCE_READY
`/private/tmp/h2-lowerstop-opus-source-ready.md`.

**Predicado (por brazo/escenario, adjudicado):** `K =
declaredOutputs.channels` (fuente normativa, W-D); FAIL «constant default
encodes no stop» ⟺ |W_ok|≥2 ∧ ningún canal de K discrimina (|valores|≥2
entre stops); FAIL «not decidable» ⟺ |W_ok|<2 (salvo excepción adjudicada
del mecanismo W-B: `calibration.stopDiscriminationException` con
`adjudicatedBy` obligatorio — la lista nace VACÍA y ningún manifest fue
tocado); PASS si ∃ canal discriminante. **∃, no ∀** — density sano da 1/2
(el scale es estructural, no el dial); el stop identidad sale gratis por
construcción (suave=1 convive con stops que discriminan; drill con doble
aserción que impide endurecer a ∀). W = todos los stops normalizados del
dominio: nadie elige su propio examen. Los excluidos viajan con razón
(identidad elidida, rechazo de envelope, domain.kind no soportado) en
`producedBy.stopDiscrimination`.

**W-C (la más filosa):** el guard usa EXACTAMENTE la misma tupla baseline
`{theme, source}` que el brazo del escenario — la firma exige la tupla y un
cross-check de digest por corrida prueba que coincide con
`armBaselineDigest`. La degradación silenciosa (wrapper como base → escala
bithire `1` en vez de `0.9` sin error) quedó reproducida y cerrada por dos
vías independientes.

**Límite honesto asentado en el README (W-A):** el guard prueba que el
brazo CODIFICA el stop, nunca que el stop PINTE — la vida por canal es de
`ingressEquivalence` + testigo pintado + expectativas por canal (caso vivo
citado: `experience.profile/static`, accesorio discrimina con principal
clavado por authored — inercia que encontró el testigo pintado y que
degradó ese control).

**Consecuencia elegida (W-E):** el guard es **blocking desde el aterrizaje**
y `typography.scale/static` queda bloqueado de inmediato en los tres
verticales (FAIL 0/1 medido: `--ds-type-scale` constante `1` — su
`staticBrandThemePath` es prosa no caminable Y su canal es semilla literal;
su packet futuro necesita LAS DOS cosas: keypath real en la autoridad —
mismo fix que density en `capabilities/index.ts` — y verificación de que el
stop sobreescribe la semilla). No tiene receipts: no invalida nada;
convierte una mentira silenciosa en una negativa explícita.

**Retrospectiva regenerada desde K normativo:** 30 PASS / 0 FAIL sobre el
catálogo receipted (spacing.rhythm 1/2, no 1/1 como decía el diseño — el
segundo canal declarado es constante; los veredictos no cambian, los
números ahora salen de la fuente de ley). **Los 30 receipts NO se
re-miden** (invariancia medida); se re-emiten sólo por frescura del
contacto con `ownedSourceFiles`, artifacts byte-idénticos, roundIds
preservados.

Verificación: 56/56 drills (47 H-1 intactos + 9 nuevos; corridas propias
del DT); `CONSTITUTION_READY`; validador 30/30; `tsc --noEmit` limpio.
Preaudit Fable: ACCEPT W-A…W-E, memo
`/private/tmp/h2-lowerstop-fable-preaudit.md`, SHA
`28a772ea654862b5c4f28f356b5e62a618f9e81555eb99e6a038871344ea5ab6`.
Postaudit Fable: **ACCEPT**, memo
`/private/tmp/h2-lowerstop-fable-postaudit.md` (SHA en su `.ready`) — el
guard real ejercitado por el auditor en sus cinco caras (sano PASS,
typography/static THROW vivo, y las tres negativas W-C tirando);
retrospectiva 30/30 coincidente entrada por entrada; sentinel `'\0absent'`
no colisionable verificado. Regla de proceso adoptada (segunda ocurrencia,
mandato Fable): **el asiento del ledger se escribe ANTES de despachar el
postaudit o DESPUÉS de recibirlo, nunca durante** — aplicada desde el
próximo packet.

##### F4B-6 — responsive.posture: primera instrumentación DATA del programa (2026-08-23)

`responsive.posture` queda calibrado como el primer control con terminal
DATA legítimo del programa, con instrumento hermano nuevo y evidencia R6 —
y con la honestidad de rango que la ley de hoy puede sostener: **control
`IMPLEMENTED`, celda `SOURCE_BOUND`**, por la brecha de vocabulario
asentada abajo (enmienda de ley aprobada como packet propio L-1).

**La sonda DATA (puro Node, sin Chromium — el instrumento más barato del
programa):** `composition/data-run/` con `buildDataCausalReport()`, 4
guards DATA nuevos (`data-absent`, `data-constant`, `data-bypass` con dos
capas NO confladas — write-time throw vs render-time fail-closed,
`data-restore` = `undefined` tras remoción, no igualdad), la ley
`data-not-decidable` (<2 testigos = FAIL; excepción sólo adjudicada en
`calibration`, X-D), `witnessesHeld` como pata del veredicto (un testigo
sin medir tira; correr sin verificar no cuenta), y bypass registrado
aunque no dispare. `propertyKind` gana `data-field` con discriminador
EXPLÍCITO (nunca inferencia por forma del nombre; drills de
no-contaminación bidireccional + rechazo cruzado, X-B). Límite verbatim en
el README (X-E): la sonda prueba que el dato LLEGA Y VARÍA, no que la
geometría resultante sea la correcta — la bondad del layout es aceptación
sighted.

**Puerta estática: medida y NO receiptada** (patrón bithire, artifact
`static-door.STRUCTURALLY-UNREACHABLE.json`): la puerta es inalcanzable en
el render de un vertical de primera parte por DOS mecanismos independientes
verificados (el strip `registry/index.ts:155-162` y el rechazo de plano
`:148-151` "Cannot project a non-code-owned tenant config"); viva como
código, alcanzable por config de caller (tenant-preview). Receiptarla
habría medido un camino que producción no toma (la clase de error que H-1
corrigió, sin canal CSS que la delatara).

**Escenarios (3 verticales × 3 stops, 3 receipts R6):** S1 — el campo
lowerea el stop pedido (3 valores distintos) con restore exacto a
`undefined` (0 filas diferentes); S2 — `resolveActiveResponsivePosture`
sobre el artifact real resuelve el pedido (default medido `balanced`);
S3 — 3 `spanBias` → 3 geometrías a misma entrada; predicción falsable
EXACTA: banda 200px invariante, onset ±120px (compact 759/959/`min`,
balanced 639/839/`preferred`, expansive 519/719/`max`); negativo del tier
con las DOS mitades (board constante Y escalera demostrablemente viva a
los mismos anchos); bypass con las dos capas asertadas por separado.
Igualdad-excepto-campo sobre la superficie CERRADA de 4 campos de
`.advanced`: 9 filas, hermanos idénticos.

**Censo (X-A, medido en disco):** 255/255 celdas `NO_CSS_CHANNEL` (251
`DIFFERENTIAL_COMPILE_AND_COMPUTED_FAMILY_BINDING` + 4 layout
`PROVE_NOT_CHANGE` en SOURCE_BOUND); el packet cierra UNA
(`pattern/data/widget-board`, consumidora directa de `spanBias`); **254
intactas**. `measuredResult` declara: una familia medida, tres
consumidoras conocidas sin medir.

**Brecha de la ley del owner (registrada, no inventada):**
`knownDefects OPEN_OWNER` — la simplificación móvil real de
DashboardSurface la gobierna una señal `isMobile` de viewport
(`dashboard/index.tsx:194,206`), no este control; el tier de WidgetBoard
está hardcodeado a 639/839 con fijación razonada en fuente (CSS-co-authored,
`:133-146`); la válvula hide/defer del solver sólo mira items `secondary` y
todos los contratos del dashboard son `priority:'primary'` (`:286`) — el
dial no alcanza ningún trigger de simplificación. El packet certifica el
control que EXISTE (`spanBias` + bucket).

**LADDER_VOCABULARY (OPEN_DT → packet L-1 aprobado):** la escalera exige 5
campos de forma CSS (`rules:937,946,994+426-430`) y un terminal DATA no
tiene ninguno por diseño; la única forma de forzar rango era fabricarlos —
**no se fabricaron**. El roadmap F4B §7 ya declara que un control con
terminal DATA "demuestran ese terminal y no inventan una variable para
cumplir": la ley superior sí contempla DATA; `manifest/rules` no. Ruling
DT: **enmendar la ley UNA sola vez** (rol `data-field-delta` + rama DATA:
`fieldPath` + `equalitySurface` + testigos conductuales), packet propio
con preaudit Fable. Segundo cliente del mismo packet (Fable F1): el drill
5 de H-2 quedó rojo (**ingress 55/56**, no 56/56 — ningún packet
intermedio puede citar 56/56) porque itera controles-con-receipts y el
guard CSS se niega a un terminal DATA; el fix lo excluye con razón escrita
o lo deriva al guard DATA. Regla de proceso adoptada (obligación Fable):
un packet que toque evidencia o manifests de un control corre TAMBIÉN las
suites del instrumento cuyo cerco itera desde el manifest. Precisión (F2):
`calibration.assessmentState` del MANIFEST DE CONTROL no lo valida ninguna
puerta (el de las SECCIONES de familia sí lo valida `rules:1071-1082,1112`)
— el rango se reclama sólo cuando la puerta lo sostiene.

**Gates:** 33/33 receipts VALID+FRESH (30 re-emitidos con superficie +1
`composition/data-run` — `nothing_dropped` verificado — + 3 R6 nuevos);
`CONSTITUTION_READY` (corridas propias del DT y de Fable); data-run drills
15/15; ingress drills **55/56** (causa asentada arriba); `tsc --noEmit`
limpio. Desviaciones del writer, TODAS aceptadas por Fable: export de
`dbTenantIdentity` (una definición, dos llamadores — la clase W-C),
`witnessesHeld`, bypass registrado, `manifestSourceFiles` en la frescura
DATA (probada en vivo), superficie +1.

**Postaudit Fable: ACCEPT**, memo
`/private/tmp/f4b-6-data-probe-fable-postaudit.md` (SHA en su `.ready`) —
con la corrección de su propio preaudit asentada (su Q4 asumía un cierre
COMPUTED_VERIFIED inexistente para un terminal DATA: density llegó a rango
3 porque PINTA; la diferencia es de vocabulario, no de evidencia).

##### L-1 — la escalera aprende terminales DATA (enmienda de ley, 2026-08-23)

`LADDER_VOCABULARY/data-terminal-controls` **CERRADO por enmienda de ley
UNA vez** (el mecanismo del precedente cabeza-nula, segunda aplicación).
`responsive.posture` queda **COMPUTED_VERIFIED honesto: F4B 6/20** (la
puerta sighted es el único paso restante de ese control). Writer: Opus.
Preaudit Fable: ACCEPT Y-1…Y-5. Postaudit Fable: **ACCEPT**, memo
`/private/tmp/l1-ladder-fable-postaudit.md` (SHA en su `.ready`), con
harness Y-1 reconstruido independientemente por el auditor y coincidente
al error exacto.

**La enmienda (bloques A–G en `manifest/rules/` + mirror en
`schema.json`):** rol `data-field-delta` en **clase propia** (una celda
CSS no puede comprar su pata de delta con un receipt sin browser);
selector **derivado de la raíz de cascada** (`channel: null` bajo la
conjunción head-empty — la única autoridad gateada; selecciona 1/20 hoy y
deja fuera a `profiles.icon`/`chrome.anatomy`, que PINTAN); **diente
inverso** (declarar `dataTerminal` con raíz de cabeza no nula es error);
conjunción IMPLEMENTED completa: `terminalReason` (el diente, hermano de
`headEmptyReason`), `fieldPath`, `equalitySurface` **que contiene el
campo** (duro: una superficie que lo excluye vuelve indemostrable la
igualdad-excepto-el-campo), `behaviouralWitnesses`, `mechanism` intacto,
**anti-fabricación** (`internalChannels`/`computedProperties` vacíos —
prohibido comprar el verde); CV rama DATA con restore por la **cadena
mecánica** (verdict.pass solo si restore.exact; exitCode espejo;
v2:139-140 rechaza exit≠0), no por reparto de roles; **techo duro de
`assessmentState`** (`validateControlAssessmentCeiling`, espejo de
`validateMaximumClaim` — un control no puede superar el rango que su
mejor celda sostiene; radio medido 1/20 y la única violación la cura la
propia enmienda; probado en vivo con mutación SIGHTED_ACCEPTED → FAIL y
restore byte-exacto). Precisión asentada (Y-4 + F2 anterior): generator
SÍ valida vocabulario y sourceBindings del control; rules valida
assessmentState de secciones de familia; lo que faltaba era el techo.

**Segundo cliente (Fable F1 de F4B-6, cerrado):** drill 5 de H-2 **RUTEA**
(no excluye) con contadores asertados (30 PASS CSS + 6 REFUSED DATA —
ninguna pata verde por vacía); drill 3 ruteado fuera del selector (su
hueco de traspaso silencioso sólo se abría al subir el control);
comentario del catch corregido (Y-2: razón real medida, código muerto
declarado, angostado como opción futura). Ingress drills **56/56** de
vuelta.

**Evidencia:** las 3 sondas R6 **re-CORRIDAS** (nunca re-etiquetadas) con
`--evidence-kind data-field-delta` (default nuevo del CLI, `causal`
intacto); artifacts byte-idénticos (sonda determinista) y receipts con el
kind nuevo emitido por corrida viva; 33/33 VALID+FRESH (30 re-emitidos
por frescura, unión nunca reemplazo, artifacts intactos).

**Invariancia Y-1 (re-medida en el árbol real por el writer Y por Fable
con harness propio independiente, coincidentes):** 5100 celdas graduadas
con ambos módulos, **1 veredicto cambiado** (la celda del terminal: 6
errores bajo la ley vieja, 0 bajo la nueva), **0 fuera del terminal**; el
drill (d) la vuelve aserción permanente.

**Deudas asentadas:** sub-declaración de `profiles.icon` (reach **118**) y
`chrome.anatomy` (reach **353**) — declaran `channels: []` y emiten
cabezas reales; queda **OPEN_DT** con estos números para que nadie la
"resuelva" por el selector equivocado (Y-3). Los 2 rojos preexistentes
(test 1 sandbox CLOSURE_MEMBERS + A11) quedan para packet de triage
aparte que arranca de la caracterización T-1 (Y-5). Suite constitucional:
46/48 idéntica, L-1 no agregó ni quitó ninguno.

**Gates:** generator 42/42; ingress 56/56; data-run 15/15;
CONSTITUTION_READY (corridas propias del DT y de Fable); `tsc --noEmit`
limpio. Desviaciones del writer, TODAS adjudicadas por Fable:
`CLOSED_BY_LAW_AMENDMENT` (descriptivo, campo libre), default condicional
de 2 líneas, drill (b) con 8 aserciones, especificador re-apuntado del
método `git show`, edición+restore del cableado del techo.

##### B-1 — OPCIÓN B del owner implementada: el tenant prevalece sobre el baseline vertical (2026-08-23)

La decisión de producto del owner (`OPEN_ARM_ASYMMETRY` → opción B) queda
implementada como **ley de precedencia vigente**: `override explícito del
tenant > perfil/config del tenant > theme del vertical > defaults del DS`,
sobre toda la superficie pública de customización, con invariantes
técnicos/accesibilidad protegidos, y **static ≡ DB exacto** bajo criterio
ejecutable escrito. `experience.profile` **vuelve a COMPUTED_VERIFIED** y
`OPEN_ARM_ASYMMETRY` **cierra con la ley nueva, no con excepción** —
`CLOSED_BY_B1_FOR_DECIDABLE_SCOPES`. Writer: Opus. Preaudit Fable: ACCEPT
Z-1…Z-6. Postaudit Fable: **ACCEPT**, memo
`/private/tmp/b1-option-b-fable-postaudit.md` (SHA en su `.ready`), con la
verificación conductual central corrida por el propio auditor con el
instrumento real.

**El defecto raíz (medido):** el brazo DB ya implementaba la opción B (el
perfil entra al patch del tenant y se resuelve sobre el baseline,
`tenant-theme/index.ts:1885-1893` + cadena `:1904-1948`); el estático se
salteaba esa ingestion. El fix: **el transporte estático gana la MISMA
ingestión** — `tenantPatch?: Partial<BrandTheme>` (ausente ⇒ identidad,
garantía de API), `mergeBrandThemeFloors` (merge profundo con guarda de
propiedad propia — exigida por el gate de grafo de módulos en el build
completo), `resolveTenantPosture` (`??` = override explícito > perfil del
tenant; **compuerta estructural**: el perfil aporta SSI la selección vino
de ESE patch; la selección del baseline NUNCA promueve — por eso bithire,
que selecciona su propio perfil Y autora los campos, no regresa), y el
assign final **después del último escritor autorado** dominando los pasos
5 y 7 a la vez. **Evolución de forma registrada como decisión** (Fable
obs. 1): diseño (no tocar el lowering) → ruling B2 (compuerta en pasos 5
Y 7) → **forma final (un solo sitio)**, mejor que ambas: una compuerta por
campo habría tenido que enumerar los canales de cada bloque autorado, y
habría perdido exactamente `--ds-letter-spacing-heading`.

**Historia del proceso (Fable: "el proceso funcionando"):** el packet se
bloqueó honestamente al medir — implementar el ítem 1 habría roto la ley
static≡DB (el canal vive en DOS vocabularios con valores distintos:
`headingTracking` del eje vs `headingLs` del pairing — signo opuesto en
technical; el DB emite el pairing, el eje nunca sobrevive en producción).
Rulings DT (`/private/tmp/b1-rulings-dt.md`): **canónico = PAIRING**
(`headingLs`); B3 (la nota `expansion:86-89` que documentaba la
divergencia como intencional) **DEROGADA por orden explícita del owner**,
re-escrita como "REPEALED (owner order, option B)" — el acid test
localizado no requirió cambio (la divergencia vivía en el comentario);
B4 (escritor del paso 3) retirado **por estructura** (`expansion:421`
deriva `typePairing` de `axes.type` incondicionalmente — muerto en todo
caso presente y futuro; `EXPERIENCE_PROFILES` son 2 perfiles, no 34);
criterio B1 = **valores computados sobre la cascada real** (estático =
tema compilado; DB = base del vertical + delta inline del tenant), con
ausentes resueltos por cascada, medido con el brazo pintado — escrito en
el manifest ANTES de medirse (Z-2).

**Medición:** estático MUEVE `--ds-letter-spacing-heading` en los 3
verticales (era 6/6 inerte); static ≡ DB en 22/22 lecturas de canal; 6
casos pintados light `equivalent: true`, 0 filas diferentes, harness-live
en los 6; la escalera completa del owner demostrada en un canal (bithire
`--ds-motion-intensity`: `0.55` vertical → `0.7` perfil tenant → `0.8`
override explícito). Receipts **R7 ×6** (technical→parity,
editorial→restore; digest por vertical — la trampa de F4B-6 reincidente
esquivada; nombres propios `.R7-light.json` junto al registro histórico
pre-H-1, que NO se sobrescribió por orden del manifest). **39/39**
receipts VALID+FRESH (33 re-emitidos por frescura del cambio de
compilador).

**Regresión cero, por tres vías:** 3 artifacts de producción
byte-idénticos (ausencia de patch ⇒ identidad); drill 1 bithire (sin
override: `-0.025em` y `0.55` intactos — el único vertical donde una
compuerta ingenua regresiona, por eso obligatorio Z-3); delta de suites
cero (33/1114 con y sin el cambio, método copia byte-exacta con sha
verificado). mP6 verde con su negativo intacto (Z-6).

**Residuo dark asentado contra `OPEN_VERTICAL_CASCADE_DEFECT`** (packet
propio del generador/cascada vertical — no de este control): causa
verificada (artifact bithire `:644` vs `:1496`, doble declaración con el
bloque dark de mayor especificidad) + **hueco de instrumento apuntado**:
la sonda no aplica `modeBlocks`, así que ese packet probablemente necesita
tocar el instrumento antes de medir su propio arreglo (la lección Z-1
propagada). Progreso medible del brazo pintado: 3 filas de divergencia
antes de B-1, 2 después (la de scope light cerró). El artifact
`bithire-editorial.RESIDUAL-DARK-SCOPE.json` queda medido SIN receipt
(patrón establecido); el receipt inválido fue borrado por el writer.

**Presupuestos de bytes (ruling DT):** 4 techos de entrypoint subidos a
los valores medidos exactos (+1087/+3409/+2813/+1732), con nota escrita y
el precedente A1 — incremento único para el fix del owner; los techos
siguen decrease-only desde el nuevo ancla y ya están condenados a morir en
F6. El gate de grafo de módulos (activado en el build completo, no en el
de medición) se resolvió recortando prosa (+4123→+3923), sin volver a
subir techos.

**Notas para el futuro (Fable obs. 2, asentadas):** los clamps sobre el
ganador quedan cubiertos por drill 4 ejecutable y por el camino
(expansión sanitiza); el override explícito del transporte estático es
first-party/bounded hoy — si algún día acepta input de tenant real, la
validación de rangos del patch merece su propia puerta.

**`motion.dial` queda `UNKNOWN` honesto** (limitación preexistente del
harness: `domain.kind: "scale"`; medido por compilador, no forzado).

##### T-2 — triage: frescura de producers.json + CLOSURE_MEMBERS; tablero 48/48 (2026-08-23)

Los **dos rojos preexistentes de la suite constitucional quedan cerrados**,
cada uno por su causa verdadera. `program-check.test.mjs` pasa de 46/48 a
**48/48 — completamente verde por primera vez en la historia del asiento**
(Fable: "el piso más limpio que este asiento ha auditado"). Writer: Opus.
Postaudit Fable: **ACCEPT**, memo `/private/tmp/t2-triage-fable-postaudit.md`
(SHA en su `.ready`), con análisis multiset independiente del auditor
coincidente al detalle.

1. **A11 (frescura de producers.json):** el inventario commiteado quedó
   stale por la serie F4B (58.195 hojas cambiadas, medición del writer —
   la clasificación es idéntica al diagnóstico Codex de 57.731; el número
   propio se reporta en vez del ajeno). Inspección ANTES de re-derivar:
   **todas menos 492 hojas son POSICIONALES** (deriva de ordinal/línea tras
   B-1 en `brand-theme/index.ts`); `producerSites` bajo (file, symbol,
   ownerId, plane) = multiset EXACTO (cero reclasificaciones);
   `channelEmissions` bajo identidad sin ordinal = multiset EXACTO. Stats
   invariantes byte a byte: unknown=0, openBlocking=0, conflicts=0,
   lotBOpen=true, cohortes 69/627/534/728/66, producerSites 4872,
   channelEmissions 10313, distinctChannels 4585. Cero filas unknown
   nuevas, cero conflictos de ownership (las condiciones de STOP no se
   dieron). Re-derivado por el productor canónico; `--check` OK;
   `cascade-producers.test.mjs` 209/209 (N13 y T-21 verdes — T-21 sólo
   dentro del packet).
2. **Test 1 (sandbox CLOSURE_MEMBERS):** el fix nombrado en T-1 (añadir
   `packages/core/test-artifacts`) resultó necesario pero NO suficiente —
   con los receipts presentes y sus fuentes ausentes, el error sólo cambió
   de forma (56 → 39 → 0). Las 5 entradas finales: `test-artifacts` + los 4
   build outputs nombrados UNO POR UNO (dist/build-stamp.json, server.js,
   brand-theme/index.js, index.js — 67M del árbol entero vs ~140K;
   dependencia legible; guard D-4 intacto). Aislamiento preservado: 48/48.

**Observación de cobertura asentada como OPEN_DT:**
`expressive-profiles/expansion/index.ts:151-155` escribe 5 canales `--ds-*`
gobernados en un literal y el archivo no aparece en NINGUNA lista del
inventario de productores (causa leída: el plano `ts-compilers` se asigna
POR NOMBRE a una lista cerrada, `:93`). ¿Frontera deliberada o hueco de
cobertura? — decisión posterior, con los datos del postaudit Fable §3.

**Estado del tablero tras T-2:** `program-check.test.mjs` 48/48;
`program-check.mjs` CONSTITUTION_READY; receipts 39/39 VALID+FRESH;
`cascade-producers --check` OK. Sin un solo rojo conocido fuera de las
deudas adjudicadas con dueño.

##### F4B-7 — typography.scale: cierre parcial honesto + clase DB_ARM_SCOPE_SHADOWING (2026-08-23)

El control **no cierra** — y esa es la adjudicación, no una falla: la mitad
de autoridad queda probada y commiteada, y el defecto que impide la
equivalencia queda registrado como CLASE con su packet propio (H-3).
Writer: Opus. Postaudit Fable: **ACCEPT**, memo
`/private/tmp/f4b-7-typography-fable-postaudit.md` (SHA en su `.ready`).

**Lo que SÍ cierra:** el fix de autoridad (`capabilities/index.ts:182`,
`'typography (ramp channels)'` → `'typography.scale'`, protocolo
density.mode, repin de 20 manifests). Guard H-2: static **FAIL 0/1 → PASS
1/1** en los 3 verticales (doble medición: el FAIL que Fable midió con
sonda propia en el preaudit H-2, el PASS que midió hoy con la misma
sonda). `--ds-type-scale` = 0.94/1.06 exactos en ambos brazos; T3
`{0.92,1.08}` verificado en fuente dentro de `{0.9,1.1}` sobre el piso
a11y `0.9`; ningún vertical autora el campo; `normal`=1 como ELIDE en DB
(patrón radius, medido); 3 artifacts de producción byte-idénticos (la
línea corrige una puerta que ningún lowering atravesaba).

**La clase nueva, `DB_ARM_SCOPE_SHADOWING` (registrada, no cerrada):** el
artifact del vertical declara canales en el scope
`:where([data-ds-root][data-vertical])`; una declaración en el ancestro
más cercano gana SIEMPRE sobre el valor heredado de un inline en `html` —
el brazo DB de la sonda (que modela la vía PREVIEW/provider-side) no puede
mover ningún canal que el artifact declare en ese scope (medido: 54/11/54
filas divergentes en rottay/bithire/evnto). **La vía productiva NO tiene
este defecto** (ley CLAUDE.md textual: producción compila en servidor y
embebe el artifact exacto con los valores resueltos del tenant; el
provider no emite una capa competidora). Es una limitación del MODELO del
brazo DB para toda la clase de canales que el artifact hornea en ese
scope. Instancia hermana registrada bajo `OPEN_VERTICAL_CASCADE_DEFECT`.
El control queda `UNKNOWN` con `knownDefects` + evidencia +
`nextAction: H3_DB_ARM_PRODUCTION_SERVING`; la celda de card y los 6
receipts R8 correctamente NO emitidos ("nombrarían una evidencia que no
existe").

**Drills 12/43/53 re-adjudicados como `AGED_EXPECTATION`** (sin debilitar):
12 — expectativa nueva sobre la forma B-1 (stop en `tenantPatch`, baseline
en `brandTheme`); 43 — inversión: la UNIFORMIDAD entre verticales ahora
prueba que el piso del tenant ganó (el renombre era obligatorio: dejar un
título que afirmaba divergencia habría sido el defecto D3 de C4 otra vez);
53 — la lección "veredicto POR BRAZO" se preserva por FIXTURE sintético
anti-door MÁS el pin del manifest real pasando 3/3 (mejora del writer
sobre el ruling, aceptada). Suite de ingress: 53/56 → **56/56**.

**Miss de proceso, asentado completo (TRES partes):** los drills 12/43
quedaron rojos desde B-1 y nadie corrió la suite de ingress — ni el writer
en B-1, ni el DT en su verificación, **ni el postaudit de Fable** (que
corrió brand-compiler y db-row-canary pero no la suite del instrumento
pese a su propio binding Z-1). Regla reforzada y vinculante para los tres
asientos: todo packet/postaudit cuyo write-set toque
`src/tooling/resolution-probe/**` corre la suite de ingress y la de
data-run, sin excepción.

**Cola:** H-3 (diseño → preaudit Fable → implementación) — el brazo DB de
la sonda sirve como producción (artifact compilado del tenant), cerrando
la clase para typography.scale y todo control cuyo canal el artifact
declare en el scope `[data-ds-root]` (incluida la lección ya apuntada: la
sonda tampoco aplica `modeBlocks`). Tras H-3, typography.scale re-corre y
emite sus receipts R8.

##### H-3/H-3a — la clase se refuta; el defecto real del instrumento se arregla; residuo a H3B (2026-08-24)

Cadena completa de corrección, con las tres partes del registro (writer,
DT, Fable): **la clase `DB_ARM_SCOPE_SHADOWING` no existe** — se supersede
por `DB_ARM_STALE_DEPENDENT_READ`, el defecto real del instrumento, ya
arreglado. `typography.scale` sigue `UNKNOWN` honesto con un residuo de
segundo orden a H3B. Writer: Opus. Preaudit Fable H-3: ACCEPT con AA-1…AA-5
(incluida la corrección simétrica del ledger: writer + DT + el endoso de
Fable). Postaudit Fable H-3a: **ACCEPT condicionado a F1** (satisfecha),
memo `/private/tmp/h3a-stale-read-fable-postaudit.md` (SHA en su `.ready`).

**La refutación (H-3 diseño, verificada por Fable con evidencia propia):**
la premisa heredada de F4B-7 era falsa por cuatro vías — la escena de la
sonda pone `data-tenant`, `data-ds-root` y `data-vertical` en `html` (no
hay descendiente); sólo hay 3 declaraciones del canal, todas en raíz;
**4 de los 6 controles cerrados declaran su canal en el scope culpado y
cerraron con equivalencia**; y una escena sintética prueba que inline y
bloque propagan idéntico. La anomalía sobreviviente, en su forma estrecha
verificada: mismos brazos moviendo el canal, y los dependientes calc
recomputan para uno y no para el otro.

**Fase (1) — la causa, medida (artifact durable
`test-artifacts/quality-evidence/wo-cra-23/H3/isolation.MEASURED-NOT-RECEIPTED.json`):**
las lecturas del brazo DB van **desfasadas exactamente UNA FASE** para las
propiedades dependientes (la custom property siempre al día; los
dependientes muestran la fase anterior). El flush existente + el settle
de 2 rAF no alcanzan con el roster completo — y el árbol ya documentaba
ese modo de falla en `measure/index.mjs`. Run 1 prueba que el mecanismo
CSS está sano (inline mueve todo a los valores exactos del brazo
estático, sin flush).

**El fix (`readUntilStable` + `invalidateStyle`, extraído drillable-sin-browser):**
leer, provocar invalidación explícita de estilo (poner/quitar atributo en
el documentElement — no `offsetHeight`, que fuerza layout pero no
re-derivación), y aceptar sólo tras **DOS lecturas consecutivas idénticas**
(una meseta intermedia no acepta), **tirando** si la página nunca se
asienta — "una página inestable es un hallazgo, no una medición". Drills
4/4: aceptación tras el segundo acuerdo con conteo de invalidaciones; el
negativo que TIRA sin devolver la última respuesta; la meseta explícita;
el presupuesto como techo.

**Invariancia obligatoria (medida, no asumida):** 36 escenarios CSS, 26.212
claves por intersección, **0 valores movidos, 0 patas de veredicto
cambiadas**; los 39 receipts sólo re-emitidos por frescura (artifacts
byte-idénticos). Nota de método honesta del writer: su primera comparación
dio 1556 movidas y era su error de conjunto (roster completo vs listas
acotadas); restringida a la intersección, 0.

**El residuo — 16 filas, NO staleness** (endureció la ley y no se movieron;
artifact durable F1
`H3/residual-divergence.MEASURED-NOT-RECEIPTED.json`): `card-modern-md/title`
DB **12.3375px** (0.94×1) vs estático **11.5972px** (0.94²); cuatro
`*-preset-gap/root` que DB no mueve. Opus correctamente NO lo atribuyó a
ningún mecanismo sin poder mostrarlo (tercera disciplina consecutiva:
F4B-7 §3, la clase, y ahora nombrar sin medir). `nextAction:
H3B_RESIDUAL_SECOND_ORDER_DIVERGENCE`. **Pista falsable registrada COMO
pista (Fable, no causa):** la raíz rem ya porta type-scale una vez ("todo
rem ya lleva type-scale; una rampa nombrada 16px vale 15px" — conocimiento
documentado del asiento auditor); una cadena rem-derivado × type-scale
aplicaría el factor dos veces cuando la raíz se re-deriva (artifact
completo servido) y una cuando no (inline que mueve la custom property
sin re-derivar la raíz). H3B la MIDE, no la asume.

**Fase (a) (serving productivo): EN PAUSA** — adoptarla como cura de
síntoma habría sido "verde por desaparición"; queda para decidirse por
fidelidad con el camino inline ya sano.

**Regla ampliada (Fable §6, vinculante para los tres asientos):** el
inventario de suites del instrumento — **TODAS las carpetas `tests/` bajo
`resolution-probe/`** — se corre completo en la verificación de cualquier
packet que toque el instrumento, no sólo ingress y data-run. Tercera
instancia del patrón: `composition/run/tests/index.test.mjs` está **ROJO
desde H-1** (su fixture arma un brazo estático sin baseline y muere en la
ley de provenance; el archivo predata `83c1a84f5`), sin que nadie la
corriera. Va a su packet propio (T-3), no tratada acá.

##### H3B/H3C — typography.scale CIERRA (F4B 7/20): la divergencia era la entrega, no la cascada (2026-08-24)

**La cadena causal más documentada del programa** (Fable), medida tramo
por tramo antes de diseñar el siguiente: F4B-7 (54/11/54 — la puerta
estática empieza a bajar el stop) → H-3a (27→16 — el atraso de fase,
curado) → endurecimiento (16→16 — nada: descarta staleness) → **H3C
(16→0 en las seis, light Y dark — el momento de la escritura)**.
`typography.scale` queda **COMPUTED_VERIFIED** (control + celda de card),
con **0 filas divergentes con el modelo de servido intacto** y los pins
que lo hacen probatorio (drill 1: posición `root-inline-style`
preservada — la fase (a) no entró por la puerta de atrás; drill 2:
baseline verbatim en las 3 fases).

**La causa raíz (aislada en H3B con artifact durable):** una escritura
inline aplicada a una página VIVA deja algunos elementos computados
contra la raíz vieja (root actualizado, descendiente con el calc sobre la
raíz vieja) — recalculo PARCIAL y ESTABLE, invisible para una ley de
estabilidad porque concuerda consigo mismo. La MISMA escritura instalada
ANTES del primer paint coincide exacto con el brazo estático. La forma
H3C: `deliverInlineOnFreshDocument({marker, ops})` — entrega fresca
navegando la fase como el brazo estático siempre navegó, con la posición
`root-inline-style` CONSERVADA y restore más fuerte (navegación sin el
marcador: nunca queda declaración inline). La ley de lectura de H-3a se
CONSERVA (correcta para el atraso que curó). El mecanismo del residuo
queda corroborado por el conocimiento documentado del auditor (la raíz
rem porta type-scale una vez — `default.css:607`).

**El cierre:** control `COMPUTED_VERIFIED` con `fixChain` completa,
`residualSignature` CONSERVADA (title 12.3375 = 0.94×1 vs 11.5972 =
0.94²; TRES preset-gap roots — el conteo de cuatro fue error propio
corregido desde H3B y asentado explícitamente: un residuo que desaparece
sin su acta no se distingue de uno nunca medido),
`DB_ARM_STALE_DEPENDENT_READ` → **CLOSED**, `productionReading`
honestamente ABIERTA (H3C arregló el CUÁNDO, no el QUÉ modela el brazo —
la fase (a) se decide por fidelidad, sin urgencia de cura). Celda de card
con taxonomía parcial declarada (parts/props = exactamente lo medido;
`line-height` ausente porque no se movió; `taxonomyPrecisionNote` para el
grupo impreciso). Negativos: tres a every-measured-target sostenidos, con
las dos ausencias deliberadas y medidas (font-metrics = lo que el control
mueve; control-height = la raíz rem deriva del dial, legítimo en ambos
brazos). 6 receipts nuevos con **`roundId: R7`** (ruling DT: NO se declara
R8 — `program-check.mjs:1647` pinea el set a exactamente R0..R7 e
inflarlo por packet es el modelo errado; la convención cronológica vive
en los asientos; los receipts se emiten por el productor canónico, nunca
a mano). **45/45 receipts VALID+FRESH.**

**Invariancia obligatoria:** 36 escenarios, 27.076 claves por
intersección, **0 valores movidos, 0 patas cambiadas, 0 claves
perdidas** (las +1.776 claves nuevas explicadas y medidas: vocabulario de
negativos y roster ganados después de esas rondas). Cero artifacts
previos tocados; los 39 re-emitidos sólo por frescura. **Forma canónica
adoptada (desviación 9 del writer, verificada por Fable):** la superficie
de frescura se RECALCULA, no se une — el receipt R7-light de experience
ganó `typography.scale.json` (+1: el binding nuevo de la celda de card
entró; la unión lo habría dejado fuera en silencio). Y `toolVersion` NO
se tocó en los 39 (los artifacts los produjo el instrumento viejo; decir
lo contrario mentiría sobre quién midió).

**Corrección de escribanía propia (desviación 1, asentada como modelo):**
el primer receipt `rottay-compacta` de la sesión previa estaba
`pass=false/harness-suspect` por un digest truncado a 16 hex y el resume
decía lo contrario — reportar la contradicción de un resume propio es la
escribanía en su mejor forma; curado por la re-corrida R7.

**El cuarto cerco envejecido es un HUECO VIVO (juicio Fable §5,
completo):** `v2/receipts.mjs:7` sigue `SIGHTED_APPROVER = 'Codex (DT)'`
por igualdad exacta, y desde la sucesión 2026-08-23 el aprobador vivo es
`Kimi K3 (DT)` — **la puerta valida hoy un receipt producido por el
aprobador real, el conflicto exacto que la regla existe para impedir. Un
guard de autoridad fail-open no es deuda cosmética.** (a) Censo
compensatorio corrido: los producers de todos los receipts son
`{claude-opus-5-f4b-lane}` — el hueco está ABIERTO, NO explotado; cero
violaciones ocurridas. (b) La premisa del ruling del owner del 08-22 ("la
constante era correcta entonces") ya no existe: Fable recomienda al owner
**autorizar YA el micro-packet** — una línea + drill: derivar el
aprobador de la autoridad VIVA (por rol o constante derivada del
rubric/constitución, jamás otro nombre propio — la forma que T-1 ya
prescribió) + actualizar el drill del fence. Cierra el cuarto cerco Y el
hueco de una vez. (c) **Control compensatorio vinculante desde ya:** cada
postaudit verifica el campo `producer` de todo receipt nuevo contra el
aprobador vivo (45/45 limpios en éste). (d) El writer hizo exactamente lo
correcto al no tocarlo (identidad del aprobador = adjudicación DT/owner).
**Queda OPEN_OWNER con la recomendación formal arriba.**

**Regla de suites confirmada en su forma ampliada:** las 9 suites del
instrumento corridas una por una por Fable (data-run 15/15, causality
17/17, guards 12/12, negative-controls 20/20, public/drills 18/18,
ingress 59/59, measure 7/7; las DOS rojas preexistentes confirmadas:
composition/run 0/1 — T-3 — y composition/receipt 11/12 — owner-gated).

Postaudit Fable: **ACCEPT**, memo
`/private/tmp/h3c-fresh-delivery-fable-postaudit.md` (SHA en su `.ready`).

##### T-3 — composition/run/tests re-legislada (tercer cerco envejecido cerrado) (2026-08-24)

La suite `composition/run/tests` (roja desde H-1 — su fixture armaba el
brazo estático con la forma pre-H-1 y moría en la ley de provenance antes
de correr un solo drill) pasa de **0/1 a 20/20**. Writer: Opus. Postaudit
Fable: **ACCEPT**, memo `/private/tmp/t3-run-tests-fable-postaudit.md`
(SHA en su `.ready`).

**Diagnóstico exacto:** lo envejecido era el FIXTURE, no las aserciones
(los 19 drills estaban sanos; ninguno llegaba a correr). Re-legislación:
el brazo se BAJA con `lowerStop` (baseline STAND-IN marcada como tal,
digest honesto de la bajada real — un 64-hex escrito a mano aseveraría el
hash de nada) y el brazo DB queda a mano a propósito (eximido por H-1 V5)
con `baseline: null` explícito — la forma que `lowerStop` realmente
produce. Sin drill de refusal duplicado (ya cubierta en ingress H-1 drill
8; la decisión quedó escrita en el archivo).

**Bonus que cierra un hueco real de H-1:** el drill nuevo — el ARTIFACT
nombra la baseline del brazo estático (source + digest 64-hex recomputado
vía `lowerStop`: same-hashea-igual, other-hashea-distinto, sin
reimplementar el hash). Antes de este packet, `input.baseline` sólo se
asertaba en ingress (verificado por grep en ambos árboles):
`buildCausalReport` podía dejar de propagar `provenance` y pasar todos
los drills de ingress dejando cada artifact irreconstruible. El mutante
plantado (reporte emite null para todos) deja 19/1 siendo éste el único
rojo — el cerco muerde.

**Ley de H-1 intacta y probada por dos asientos independientes:** 2
contrafácticos del writer (baselineSource null; base {}) tirando con el
mensaje exacto; Fable los reprodujo además en memoria. Tablero del
instrumento: **8/9 suites verdes**; la única roja es el fence
owner-gated. De las cuatro instancias del patrón de cerco envejecido
quedan cerradas tres (drills 12/43 en F4B-7, ésta en T-3); la única
abierta es el hueco vivo `SIGHTED_APPROVER` (juicio y recomendación al
owner asentados en H3C §5).

##### Fence SIGHTED_APPROVER — derivado de la autoridad viva; el hueco vivo CERRADO (2026-08-24)

La saga completa, cerrada **con la forma prescrita** (Fable): C2 la halló
como rojo heredado con ruling del dueño; T-1 la marcó doblemente stale y
prescribió la forma ("derivar del asiento por rol o constante derivada,
jamás otro nombre propio"); B-1 la marcó triple; H3C la elevó a hueco
vivo con censo compensatorio y recomendación al owner; T-3 la dejó como
el único rojo del tablero. **Autorización del owner registrada** ("Ahora
arreglá el fence SIGHTED_APPROVER: leelo contra agent-orchestration.json").
Writer: Opus. Postaudit Fable: **ACCEPT**, memo
`/private/tmp/sighted-approver-fable-postaudit.md`, SHA-256
`f856c7c43fda6e665c63e6d5119855dcf29e9f2578b137fc9ef44326091cea3c`.

**La forma (mejor de lo prescrito, dice el auditor):**
`v2/receipts.mjs` ya no tiene `SIGHTED_APPROVER = 'Codex (DT)'`. Exporta
`sightedApprovers(contracts)` — el conjunto prohibido se DERIVA por
corrida de las dos autoridades vivas
(`agent-orchestration.json#doubleAccept.coordinator` y
`quality-rubric.json#eligibility.finalSightedAuthority`; lo pineado son
las RUTAS, nunca los valores) — e `isSightedApprover(producer, contracts)`
normalizado por espacios y caja. **Falla cerrada e incondicional**: la
resolución TIRA si la autoridad no se puede leer, y corre incondicional en
`validateReceipt` — una autoridad ilegible enrojece TODOS los receipts en
vez de chequear nada en silencio (la inversión exacta del modo en que
fallaba la constante). Cero nombres propios funcionales en código (el
único hit es el comentario histórico que narra por qué repinear un nombre
reconstruye el defecto una sucesión más tarde). Si el owner mueve el
asiento, **el fence lo sigue sin tocar código**.

**El hueco vivo, cerrado y ejercitado por el propio auditor:** el
aprobador vivo RECHAZADO en sus dos formas y en disfraces
(`" kimi k3 "`, `"KIMI K3 (DT)"`); `Codex`, `Codex (DT)`, `Fable 5` y el
producer real `claude-opus-5-f4b-lane` pasan con premisas declaradas
(AGED_EXPECTATION honesto: si el asiento se mueve sobre alguno, el drill
enrojece diciendo que su premisa cayó). 7 drills (a–g) + el octavo que
ancla la derivación al contrato (no a un literal del test); 3 mutantes
detectados por los drills correctos (resolutor vacío sólo por g;
una-sola-autoridad por derivación+b+g; nombres re-pineados por f+g — el
que impide reconstruir el defecto borrado).

**Expansión del write-set por consumo (legítima y obligatoria):** la
constante tenía TRES consumidores, no uno — `manifest/rules/index.mjs:1166`
(la pata SIGHTED_ACCEPTED de la escalera) ahora deriva con la misma falla
cerrada, y el fixture del generador usa `STUB_SIGHTED_SEAT` derivando DEL
CONTRATO (la escalera sigue el contrato, no un nombre en fuente). Dejar
la constante viva junto a la función habría creado dos autoridades para
la misma regla.

**Adjudicación pendiente propia (asentada, no construida):** la clase
"el auditor produce la evidencia que audita" (`Fable 5` pasa el fence
porque no es el aprobador) — es OTRA segregación y merece su propia
decisión, fuera de este fence.

**Tablero tras el fix:** **9/9 suites del instrumento VERDES por primera
vez** (composition/receipt 17/17, rojo desde C2, cerrado; generator 42/42;
validador 45/45 — que además EJERCITA la derivación en vivo al ser
incondicional). Cuatro instancias del patrón de cerco envejecido, TODAS
cerradas. Ningún guard de autoridad del programa compara contra un nombre
que una sucesión pueda dejar mentiroso.

**Reincidencia cascade (asentada con la regla):** `cascade-producers
--check` volvió a rojo (207/209) porque F4B-7 tocó `capabilities/index.ts`
(.ts, dentro del censo srcTsx) — la clase T-2 reincidente. **Regla de
proceso adoptada (recomendación Fable, vinculante): todo packet que toque
`src/**/*.ts(x)` corre `cascade-producers --check` en su verificación**, o
el tablero de cascade oscila por goteo. Triage T-4 en curso con el molde
de T-2 (inspección ANTES de re-derivar).

##### T-4 — producers.json re-derivado; la clase T-2 medida y la regla refinada (2026-08-24)

El rojo de cascade-producers (207/209, señalado por el owner) queda
cerrado con el molde de T-2: **inspección ANTES de re-derivar**, y la
re-derivación salió exactamente como la fase 1 la predijo. Writer: Opus.
Postaudit Fable: **ACCEPT**, memo `/private/tmp/t4-rederive-fable-postaudit.md`
(SHA en su `.ready`).

**La deriva:** UNA hoja de las ~216k (`inputsDigest.srcTsx`), causada 100%
por `capabilities/index.ts` (el fix de autoridad de F4B-7), probada por
contrafáctico (rebobinar ese archivo reproduce el digest commiteado
exacto) y corroborada por Fable por vía independiente
(`git diff --name-only dee266528..HEAD` sobre `.ts/.tsx` de src da
exactamente un archivo). Stats invariantes byte a byte (unknown=0,
openBlocking=0, conflicts=0, lotBOpen=true, cohortes 69/627/534/728/66,
producerSites 4872, channelEmissions 10313, distinctChannels 4585, los 13
digests, el scannedFileList de 1727). Cero filas en cualquier colección,
cero STOPs. El diff final: una línea, escrita por el productor canónico,
con pureza probada (`serialize(buildProducers()) === disco`).

**Nota de proceso CORREGIDA (la conclusión que sobrevive al packet):**
`producers.json` NO digiere la superficie de receipts de F4B en absoluto
(grep propio: 0 menciones; sus entradas son exactamente seis:
cssEdges/cascadeRoots/rootCatalog/srcTsx/srcCompilers/artifacts; los
`digests.*Receipts` son los receipts del CLASIFICADOR de filas — colisión
de nombre ya anclada en C4-fix). Frecuencia medida sobre 20 commits: 14
tocaron receipts F4B SIN staleo; sólo los 4 que tocaron `.ts/.tsx`
escaneado estalearon. **Este rojo no es evidencia para la reforma de
frescura semántica** — construir ley sobre un diagnóstico equivocado era
el riesgo, y la fase 1 lo nombró. Tampoco se narrowea el digest a
"archivos que aportaron filas": el digest existe para atrapar lo que las
filas no expresan; narrowearlo convierte la frescura en tautología (Fable
coincide plenamente).

**Regla refinada (Fable §3, adoptada):** el disparador exacto es
`.ts/.tsx` bajo los roots escaneados FUERA de tests — packet que toque
`.ts/.tsx` de `packages/core/src` (fuera de tests) ⇒
`cascade-producers --check` en su verificación. (Detalle medido:
`tsxCandidates` toma `.ts` además de `.tsx`; el nombre `srcTsx` engaña.)

**Tablero tras T-4:** 209/209 cascade (N13 y T-21 verdes — el rojo era
transportado, no propio), 48/48 constitucional, 9/9 instrumento,
45/45 receipts, CONSTITUTION_READY. **Packet siguiente autorizado por el
owner:** el `--check` parlante — que nombre la hoja movida y su clase
(fila vs inputsDigest, y cuál entrada), la forma que la fase 1 ya
prototipó en su leaf-diff; habría convertido este triage en un minuto de
lectura.

##### T-5 — el `--check` parlante: cascade-producers nombra la hoja movida (2026-08-24)

Autorización del owner ×2: "Hacé el packet de diagnóstico: que --check
nombre la hoja movida" + **ruling §7.1** ("No guardes hashes por archivo —
cerrá el packet así"). Writer: Opus. Postaudit Fable: **ACCEPT**, memo
`/private/tmp/talking-check-fable-postaudit.md` (SHA en su `.ready`), con
la cadena verificada por el auditor (un commit entre el fence y HEAD).

**Lo que hace (aditivo puro, 525 líneas, 0 borrados):** el veredicto sigue
siendo la comparación de bytes (contrato de salida intacto: limpio 0,
divergencia 1, invocación mala 2 — verificado por Fable con escenarios
propios); el reporte agregado sólo lo explica. Forma: totales +
`[inputsDigest]` (entrada movida + qué cubre + pista de causa mecánica
cuando la hay: set escaneado cambiado → nombra archivos capados; set
intacto → declara "cambio de contenido, el inventario no guarda hash por
archivo" + el paso que sí lo nombra) + `[rows]` (colecciones con
`antes -> después (+altas -bajas ~cambiadas)` e identidades legibles
capadas con el resto CONTADO) + `[other]` con **ESCALATE primero** para
los campos STOP del programa (unknownProvenance, openBlocking,
ownershipConflicts, lotBOpen, blocking — si se mueven, el lector deja de
leer y escala) + el cuarto caso ("documentos idénticos: los bytes difieren
sólo en serialización"). El caso T-4 entero se responde ahora en 7 líneas,
siendo la más valiosa `[rows] no collection moved` — lo que separa
"frescura" de "cambio de censo" y costó el leaf-diff manual entero.

**Ruling §7.1 (owner):** NO se agregaron hashes por archivo al artefacto —
la atribución declara hasta donde llega la evidencia en vez de simularla
(artefacto byte-idéntico antes/después de la suite, sha verificado por
Fable). 8 drills TC-1..TC-8 + 3 mutantes detectados por sus drills;
217/217 (N13/T-21 intactos); pureza N13 preservada (el reporte no escribe
nada; bytes + mtime idénticos durante la corrida).

**Observaciones Fable registradas como deuda del próximo packet cascade:**
(P2) colisiones de identidad en 5 colecciones cerradas (los conteos +/-/~
pueden sub-contar por colapso de duplicados; los tamaños antes→después
siguen verdaderos; dos hilos separados: un desambiguador barato en
`identityOf`, y por qué `closedProducer` porta filas duplicadas
deep-equal); (P3) la línea de totales es posicional y puede sobredeclarar
(agregar "positional" o totales por identidad) + un JSDoc muerto
(`scannedSetDelta`) — cosméticos para el próximo toque.

##### F4B-8 — palette.seeds: capacidad LANDED, control abierto con las dos adjudicaciones (2026-08-24)

El control de mayor alcance del frente queda con su capacidad de harness
COMPLETA y su cierre diferido por causas de otros dueños — **el criterio
funcionando, no un fracaso del packet** (Fable). Writer: Opus. Preaudit
Fable: ACCEPT (W-A/W-B). Postaudit Fable: **ACCEPT**, memo
`/private/tmp/f4b-8-palette-seeds-fable-postaudit.md` (SHA en su `.ready`).

**Capacidad landed (8 drills, suite 67/67):** rama `color-set` (exige hex
con fail-closed — el seed inválido se vuelve gris y MUEVE: `rebeccapurple`
deriva rampa acromática distinta del seed válido, medido; la restricción
es del harness, no del producto, declarada en `knownDefects`); puerta
brace-set RESUELTA por el rol del stop (cero cambios de registro/esquema/
generador; `declaredPath` preservado; `assertArmsMatchManifest` de
igualdad exacta a PERTENENCIA con el no-miembro y el SET entero siguiendo
en falla); **W-A** — el stop de identidad resuelto contra el baseline del
propio brazo, fail-closed (sin baseline o baseline que autora otros
roles), y refusado en el brazo DB ("an identity stop is a static-arm
claim" — la primera identidad dependiente del vertical del programa).
`token-readout` 35→40 con los CINCO canales declarados (alias incluido —
el `every()` de `directControlFixtureIds` satisfecho). Un drill
preexistente re-legislado (AGED_EXPECTATION: color-set salió de la lista
de kinds no soportados; la ley del refuse intacta).

**Paso 0 APCA (corrido primero, 21 compiles):** `#DC2626` y `#4F46E5`
compilan 3/3; los 3 grounds TIRAN (text-primary Lc 0.0; text-muted/
disabled bajo piso) — **el suelo NO es escribible solo** (mover el ground
sin los foregrounds deja los foregrounds bajo el piso gobernado y el
brazo DB tira en compile-time); el rol `background` no se declara stop
(descalificado por medición, no por forma).

**Por qué no cierra (0/6 escenarios con equivalencia, 0 receipts, celda
no escrita):** dos causas de otros dueños, ambas medidas contra el
artifact durable (`F4B/palette-seeds/arm-divergence.MEASURED-NOT-RECEIPTED.json`):

1. **Especificidad del bloque de modo — SEGUNDA instancia medida de
   `OPEN_VERTICAL_CASCADE_DEFECT`:** bithire declara `--ds-color-primary`
   dos veces (`:323` bloque base `:13` y `:1371` bajo el mismo selector +
   `[data-theme='dark']`/`.dark` bloque `:1250`) — un atributo más, gana
   por especificidad sin importar el orden (7 filas dark en bithire, 4 en
   evnto, que también declara dos veces; rottay tiene la variante `.light`
   `:1211` porque su superficie es dark). Necesita el instrumento
   modeBlocks (M-1) antes de medir su arreglo.
2. **Desacuerdo de compiladores en button-bg (3 filas light en bithire):**
   el overlay DB de bithire trae `--ds-button-primary-bg:
   "var(--ds-color-primary)"` mientras el estático hornea `#3A6FB0`
   (`chrome.controls.buttonPrimary.bg`); en evnto el overlay OMITE el
   canal (diff-por-valores contra una base que ya trae el alias → cero
   filas light, reproducido por Fable).

**Correcciones de etapa de diseño (asentadas, y una también del auditor):**
rottay NO es DESIGNED_NULL con los dos brazos igualmente inertes — el
estático mueve 12 canales y el DB emite CERO para paleta (rechazado por
el guard "emitted none of the declared channels", comportamiento correcto;
inercia ESPECÍFICA de paleta: la misma puerta emite delta para density y
typography en rottay). La predicción P7 del preaudit (medida sólo del
brazo estático, con el DB declarado no-medido) quedó refutada y bien
asentada como `designStageCorrection`. Secondary/accent sin escenario
causal: los 5 canales declarados son de primary — ensanchar
`declaredOutputs.channels` es cambio de registro, **decisión pendiente
separada**. La identidad es ley del brazo estático solamente (en DB,
escribir el valor del vertical emite delta y hasta tira APCA).

**Cola que esto habilita:** M-1 (modeBlocks en la sonda) →
`OPEN_VERTICAL_CASCADE_DEFECT` (el defecto de especificidad del generador
de artifacts verticales) → palette.seeds re-corre casi solo (stops,
negativos, testigos y soporte ya escritos y drilleados). La re-emisión de
los 45 fue quirúrgica (sólo `sourceDigest`/`createdAt`; artifacts
intactos).

##### M-1 — modeBlocks en la sonda: el brazo estático ya escribe en todos los scopes del compilador (2026-08-24)

El instrumento deja de truncar el compilado a un mapa plano: `lowerStop`
conserva `compiled.modeBlocks` (extrayendo de cada bloque los mismos
canales declarados, con el censo en `producedBy.modeChannels`) y
`composeStaticArm` emite **1+n bloques** (base + uno por modo compilado no
vacío) con `themeModeSelector` **importado** del compilador, viajando bajo
el mismo gate de frescura de dist (componer con bloques sin gramática
TIRA). No se subió especificidad. El brazo DB queda intacto (sigue
descartando `modeDeltas` — es la fase (a) de H-3, packet aparte).
Writer: Opus. Preaudit Fable: ACCEPT con W-A/W-B/W-C. Postaudit Fable:
**ACCEPT con una condición de commit** (la mitad pendiente de W-B en los
tres carriers restantes — ejecutada en este commit), memo
`/private/tmp/m1-modeblocks-fable-postaudit.md` (SHA en su `.ready`).

**La corrección de atribución, verificada por Fable con evidencia propia
(y su propia autocorrección incluida):** los dos compiladores coinciden en
dark — el seed del tenant NO entra al bloque de modo (bithire: base mueve
22, bloque dark 0; y el compilador DB AÑADE `modeDeltas` de 0→29 vars
justamente para sostenerlo). El brazo estático ya acertaba por posición.
**El brazo DB era el que mentía** (descartaba `modeDeltas` y escribía
inline, ganándole al bloque de modo). **La clase
`OPEN_VERTICAL_CASCADE_DEFECT` se re-adjudica entera:** la doble
declaración dark del artifact es SALIDA CORRECTA de `compileModeBlocks`,
no un defecto del generador (el hecho medido — especificidad, líneas,
selectores — sigue verdadero; lo refutado era la atribución). Nuevo
reparto de dueños: **el brazo DB del instrumento** (fase (a) de H-3) +
**pregunta de producto para el owner** (¿debería el seed del tenant mover
el modo no-default bajo la opción B? — hoy el compilador lo impide
deliberadamente). La supersesión quedó ejecutada en los cuatro carriers:
`manifest/controls/palette.seeds.json#knownDefects[0]` (writer),
`checkpoint.intent.json#blockedOn` (DT), el asiento C6 de arriba (DT), y
el artifact durable (compañía de supersesión junto al original, NUNCA
editado — ley de snapshots inmutables).

**Invariancia (medida, y la predicción se afiló sola):** 42 escenarios
CSS (45 − 3 terminales DATA), 37.108 claves por intersección, **0
movidas, 0 patas cambiadas, 0 claves perdidas** — 36/42 incluyen dark.
Fable verificó que el cerco fue correcto y no laxo: los dos casos
exceptuados NO están en el conjunto de receipts (palette.seeds no tiene
receipts; los R7-light de experience son light-only y sus escenarios dark
son rottay/evnto — cuyas celdas de modo están vacías para ese control),
más el argumento por construcción (drill 3: `modeChannels` vacío para los
cerrados en los tres verticales; el bloque base es byte-idéntico al de
antes). W-A: la enumeración pre-registrada (24 filas) coincide EXACTA con
la tabla medida de Fable — incluidos los DOS canales de
experience/bithire/dark (`--ds-letter-spacing-heading` Y
`--ds-material-canvas-texture`). W-C: 45 receipts con typography incluido,
y `responsive.posture` contado como sexto cerrado (42 CSS + 3 DATA).

**Los 7 drills (74/74):** el brazo emite un bloque por scope que el
compilador escribe (2 bloques por vertical, verificado en los tres); las
DOS mitades (base lleva el stop `#DC2626`, modo lleva el valor propio del
vertical `#1e84e6` — sólo la segunda distingue extracción real de copia);
el cerco en código (los 5 cerrados × 3 verticales con `modeChannels`
vacío); un theme sin overlay da exactamente un bloque (y un bloque vacío
tampoco se emite); restore append-only byte-idéntico; gramática idéntica
a `themeModeSelector(...)` y componer sin ella TIRA; y **el negativo que
importa**: pasar `variables` como `modeVariables` pone el stop donde va
el valor del vertical — pisaría el overlay, el defecto opuesto y peor.

**Evidencia direccional para H-3 fase (a) (observación del writer,
reproducida por Fable):** en bithire la divergencia sigue 10 filas (el
overlay restata; el brazo estático lee lo mismo que el artifact). En
evnto APARECIÓ una quinta fila (`--ds-color-primary-500`): el estático
ahora la fija en el valor compilado `#6B6B6B` y el brazo DB la sigue
moviendo a `#CA0615` — **hacer fiel un brazo no reduce la divergencia:
expone la del otro** (la dirección correcta). Precisión Fable: ese
`#6B6B6B` es el gris LEGÍTIMO (la rampa dark deriva del seed dark propio
de evnto `#E8E8E0`), no la clase del anti-door — que nadie lo
pattern-matchee.

**Desviación declarada:** `public/cli/index.mjs` (+4 líneas — cableado
necesario del único call site productivo de `composeStaticArm`; verificada
por Fable como cableado, no lógica).

##### H-3 fase (a) — el brazo DB sirve los modeDeltas; la mitad oscura de la divergencia CERRADA (2026-08-24)

El acompañante del brazo DB para M-1: el brazo DB deja el inline y sirve
el compilado como stylesheet — bloque base + uno por `modeDelta`,
re-escopado a `tenantArmSelector(vertical)` componiendo desde los mapas
extraídos (NUNCA parseando `artifact.css`: su selector lleva un slug que
la escena no puede portar, medido). Los dos brazos comparten el mismo
compositor (`composeArmCss`), así que difieren en una sola cosa — el
compilador — y la equivalencia lo aísla en vez de confundirlo con la
posición. Restore hereda la ley del estático (append-only; removal
re-sirve el baseline byte-idéntico). Writer: Opus. Preaudit Fable: ACCEPT
con W-A/W-B/W-C. Postaudit Fable: **ACCEPT con una condición de commit**
(el puntero de supersesión del artifact durable — ejecutado en este
commit como addendum a la compañía ya existente), memo
`/private/tmp/h3a2-db-modeblocks-fable-postaudit.md` (SHA en su `.ready`).

**W-A (la fuente de la gramática, que estaba VACÍA):** el módulo dist de
tenant-theme no exporta `themeModeSelector` (la usa por dentro). Opción
(a) elegida: el brazo DB toma prestada la gramática de brand-theme — cero
cambio de compilador, su exportador la declara compartida ("Shared
explicit-mode selector grammar for static AND DB artifact renderers"),
misma gate de frescura, y el prestamista registrado en
`themeModeSelectorSource` por brazo. La negativa vive en `composeArmCss`
(TIRA si un brazo bajó bloques de modo sin gramática — ahí se distingue
"corrida con scopes sin gramática" de "fixture sin modos"; un throw al
cargar habría matado nueve drills de mecánica). Jamás deletreada en el
harness.

**La extracción que se olvidaba (la mitad DB que sobrevivió a M-1):**
`lowerStop` leía sólo `modeBlocks` (`{mode, cssVariables}`) y el
compilador DB devuelve `modeDeltas` (`{mode, variables}`) — ahora se leen
las dos formas, por nombre y por brazo, nunca `??` encadenado.

**Invariancia en DOS partes (el cerco del riesgo dominante):** 42
escenarios CSS, 37.108 claves por intersección — modo DEFAULT 18.952 con
**0 movidas** (bajar de inline a bloque podía apagar canales que se
movían por fuerza del inline; la condición STOP no disparó) y modo
NO-DEFAULT 18.156 con **0 movidas**. Conclusión comprada por esa corrida:
ningún canal de los seis controles cerrados dependía de la fuerza del
inline. 45/45 receipts tras la re-emisión (sólo frescura).

**La mitad oscura de la divergencia, CERRADA (superando la predicción):**
palette.seeds bithire 10→3 (las 7 filas dark DESAPARECIERON; las 3
restantes son la clase chrome light `--ds-button-primary-bg` hex horneado
vs alias — de la bajada de chrome, que esta fase declaró no tocar);
palette.seeds evnto 5→0 `pass=true`; `experience.profile` bithire dark 0
filas — **el residuo R7 que B-1 abrió está cerrado** (su re-cierre formal
es del packet del defecto). **W-C superada con mecánica verificada, no
suerte:** ni `--ds-material-canvas-texture` ni
`--ds-color-text-on-primary` se volvieron fila — Fable midió que en las
tres candidatas el valor dark con-stop es byte-idéntico al del baseline:
"un canal que ningún brazo MUEVE se lee idéntico en los dos; el silencio
mutuo ES coincidencia", nombrada como UNA clase en el manifest
(`predictedResidueThatDidNotMaterialise`) para que una aparición futura
se reconozca como esta clase y no como algo nuevo.

**Drills (84/84):** 10 nuevos (re-escopado sin `probe-tenant-`; extracción
por forma nombrada; los dos brazos con los mismos valores dark contra los
dos compiladores reales — y el valor dark NO es el stop: el overlay
gobierna su modo; restore append-only; H-1 baseline intacta; el camino
inline NO retirado con su acta escrita; un control sin delta da
exactamente un bloque y un delta vacío no emite regla vacía; el negativo
espejo — aplanar los deltas en la base pone el valor dark donde pintaría
en AMBOS modos — TIRA; la gramática con fuente registrada y compose sin
ella TIRA; y tu nota 1 Fable: ningún artifact lleva
`@media (prefers-color-scheme)` hoy, asertado) + **4 re-legislaciones**
AGED_EXPECTATION (W-B pedía 3; el writer encontró la cuarta — H3C drill 2
— y la vara de Fable quedó refinada: cuando un packet cambia un
TRANSPORTE, el barrido corre por los dos ejes, el nombre de la posición Y
las aserciones de conducta del transporte).

**El acta de la rama inline:** conservada con su razón escrita en el
código — la posición es real (el provider preview; borrarla convertiría
una pregunta de fidelidad abierta en respuesta silenciosa; el comando
`dial` la sigue usando por otro camino). **Sigue abierta y sin medir la
pregunta de si el provider preview puede expresar deltas de modo.**

**Lo que queda de palette.seeds:** las 3 filas light de chrome
(`--ds-button-primary-bg`) — ni instrumento ni cascada: es de la bajada
de chrome, con su clase propia. El defecto
`MODE_BLOCK_SPECIFICITY_OUTRANKS_THE_STATIC_ARM` pasó a `CLOSED` con
`resolvedBy: H-3 fase (a)`.

##### Packet del defecto — la clase chrome MEDIDA (es una bandera de provenance); residuo R7 CERRADO; palette.seeds abierto hacia B-2 (2026-08-24)

La medición que cambia la adjudicación, hecha primero como manda la
disciplina. Writer: Opus. Postaudit Fable: **ACCEPT**, memo
`/private/tmp/defect-chrome-palette-fable-postaudit.md` (SHA en su `.ready`).

**El experimento decisivo (reproducido exacto por Fable):** mismo
compilador, misma entrada, una sola variable —
`compileBrandTheme({brandTheme: bithire, tenantPatch: {palette:{primaryColor:'#DC2626'}}, tenantSlug: 'bithire'})`
→ `--ds-button-primary-bg = "#3A6FB0"`; la MISMA llamada +
`tenantAuthoredPaths: {'palette.primaryColor'}` →
`var(--ds-color-primary)`, **byte-idéntico al valor del brazo DB**. **La
bandera de provenance explica la divergencia entera.** Refutadas las
otras dos ramas: (a) defecto de compilador — un solo lowering
(`applyTenantSeedDerivations` definida una vez, dos call sites compartidos
por `compileBrandTheme`/`compileTheme` en el mismo archivo); (b)
divergencia de baseline — la misma fuente
(`FIRST_PARTY_THEMES.bithire = brandThemeToTheme(bithireBrandTheme)`).

**La clase (`CHROME_SEED_PROVENANCE_ASYMMETRY`):** brecha de fidelidad de
la sonda — el brazo DB tiene razón, el estático tiene razón sobre un
compile first-party, y la sonda modela algo intermedio (baja el patch de
tenant de B-1 SIN pasar la autoría). La ley del compilador citada y
verificada línea por línea: "a tenant that sets its primary colour and
nothing else must get a sidebar, a focus ring and a link colour that are
ITS brand, not the vertical's… **a BASELINE_LEAF cannot beat a
TENANT_DERIVED value**" + "Every static first-party compile takes this
path" + las 3 guardas (sin provenance no toca; un leaf del TENANT gana al
seed — `--ds-button-primary-bg` está en `SEED_SHADOWING_FIELDS`; un valor
que no hornea color propio se deja intacto — por eso rottay y evnto, que
usan alias, son UNAFFECTED con y sin bandera, verificado conductualmente
por Fable). **Dato para B-2 (medido por Fable):** la bandera mueve **7
canales** en bithire (button-bg, bg-hover, input-border/shadow-focus,
border-focus, link, link-hover) — la familia entera de derivación, y el
presupuesto de invariancia de B-2 va sobre ella, no sólo sobre las 3
filas visibles. La supersesión de `COMPILERS_DISAGREE_ON_BUTTON_PRIMARY_BG`
ejecutada de manual: finding original preservado, `SUPERSEDED` +
`supersededBy` + "it was WRONG rather than incomplete". El puntero del
artifact durable de F4B-8 existe como compañía con addendum
(`arm-divergence.SUPERSEDED-BY-M1.md`, desde M-1 — la forma sancionada
por la ley de snapshots inmutables).

**El residuo R7 de `experience.profile` bithire dark: CERRADO
formalmente.** Receipt R7 nuevo (`static-db-computed-parity`,
`primitive/display/card`, escenario
`experience.profile/editorial/bithire/static-and-db/light-and-dark`,
`pass=true`, `harness-live`, 0 filas divergentes, restore exacto,
negativos held) — validado 46/46 VALID+FRESH. En el manifest: la fila
DARK → `CLOSED` con `resolvedBy` (M-1 + H-3 fase (a)) y
`resolutionEvidence` al receipt. Y la fila LIGHT
(`--ds-material-canvas-texture`) →
`NOT_REPRODUCIBLE_UNDER_THE_FIXED_INSTRUMENT`: **la divergencia se fue,
el hecho de compilador que citaba NO** — el brazo DB sigue omitiendo 2 de
los 5 canales declarados en bithire/editorial (`--ds-edge-standard-width`
y `--ds-material-canvas-texture`, re-medido por Fable: `undefined` en
base y en delta dark). Dejó de ser divergencia por silencio-que-lee-
idéntico (la clase H-3(a)); **la omisión NO se declara resuelta** porque
un escenario futuro donde el estático sí lo mueva la levantaría de nuevo.

**`palette.seeds` NO cierra — y la razón es correcta.** bithire: 3 filas
light idénticas con los dos stops (del eje, no del color) — la clase
chrome de arriba, con remedio pendiente (B-2). evnto: 0 filas ×2,
`pass=true`. rottay: refutado por el guard, forma re-verificada bajo el
instrumento fijado (`stillTrueUnderTheFixedInstrument`). Cerrar con la
evidencia de un solo vertical afirmaría una equivalencia que hoy no
existe y que está por cambiar. `assessmentState: UNKNOWN` con
`nextAction: B-2`; celda de button no escrita; 0 receipts del control.

**Hallazgo de proceso asentado (Fable: real y la decisión correcta):**
**emitir un receipt no es sólo registrar una medición — ENLISTA al
control en un gate** (el drill H-2 "every control that carries receipts
passes, both arms", y palette.seeds no puede pasar en rottay: su brazo DB
baja cero testigos y la discriminación no es decidible por debajo de
dos). Los 2 receipts de evnto fueron emitidos y **RETIRADOS** (borrado
enumerado, sin comodines) y persistidos como
`evnto-{crimson,indigo}.MEASURED-NOT-RECEIPTED.json` (corridas completas,
`pass=true`, `harness-live`, restore exacto) — la evidencia que B-2 va a
citar. **La salida nombrada es una adjudicación del DT**:
`calibration.stopDiscriminationException {armId, reason, adjudicatedBy}`
— la evalúo como ruling aparte cuando el packet que la necesite llegue
(no es de este packet).

**Precisión de la re-emisión (Fable P3, asentada):** 28 receipts
re-emitidos por frescura real (sus superficies contenían los archivos
tocados) + 17 con sólo `createdAt` nuevo (legítimamente no stale —
cruce receipt por receipt, cero anomalías en ambas direcciones).

**Cola:** diseño B-2 (el brazo estático lleva la autoría del patch) →
preaudit → implementación → palette.seeds cierra.

**B-2 — EN VUELO (2026-08-24, DT Kimi K3): el brazo estático declara la
autoría del patch.** Remedio de la clase `CHROME_SEED_PROVENANCE_ASYMMETRY`.
Diseño de Opus completo (read-only; el memo vive en /private/tmp, lo durable
queda asentado acá): `lowerStop` pasa `tenantAuthoredPaths = {input.path}` —
el keypath exacto que el stop escribió, nombrado nunca inferido; NO
`collectPatchAuthoredPaths` (espacio equivocado: normaliza ThemePatch→BrandTheme
y el patch de la sonda ya está en espacio BrandTheme; su propio doc advierte
del modo de fallo). Fail-closed: sin `input.path`, conjunto vacío (= "no es un
tenant", la semántica que el compilador ya define). **Ningún compilador se
toca; el brazo DB no se toca.** **Invariancia derivable del vocabulario
cerrado** (`CONSULTED_PROVENANCE_FIELDS`, 20 paths, dos sitios de lectura del
compilador): de los 8 stops actuales sólo `palette.seeds` escribe un path
consultado (`palette.primaryColor`) → predicción falsable: los 42 escenarios
CSS receipteados no se mueven; una sola movida fuera de eso = provenance leída
en un tercer sitio = STOP. Cerco ya existente: valla mP6
(`provenance-acceptance.test.ts:815`). **Corrección de Opus al brief
(asentada):** declarar autoría mueve SIETE canales en los TRES verticales;
rottay/evnto quedan intactos en la carga del arm por el **filtro de canales
declarados** (sólo `--ds-button-primary-bg` está entre los 5 declarados de
palette.seeds), no por la guarda 3. **B-2 es necesario pero no suficiente:**
rottay sigue refutado por el guard → el ruling
`stopDiscriminationException` queda para el packet de cierre de palette.seeds
(posterior, mío).

**Ruling DT sobre el gate empírico (adjudicado una vez, documentado acá):**
la sonda no modela un llamador productivo específico — modela **la pata del
tenant** a través de cada transporte. Si NO existe vía productiva que compile
`baseline vertical + patch tenant` en estático, B-2 procede sin más (drill 2
protege la producción first-party: sin bandera, compilado byte-idéntico). Si
SÍ existe, esa vía es un **defecto de PRODUCTO** de la misma clase (sirve al
tenant un compile sin las derivaciones que su autoría manda) y se registra
como packet propio contra el llamador — **no bloquea B-2**: la sonda mide la
ley (opción B: el tenant prevalece sobre el baseline vertical), no replica el
defecto. Verificación empírica despachada a Opus; preaudit Fable se despacha
con el veredicto adjunto.

**OPEN_DT nuevo (directiva del owner tipeada en sesión Sonnet, 2026-08-24):
"fix the density.mode typeScale registry keypath".** Investigación DT previa
(read-only, sobre `14d4d50cd`): (a) los keypaths de registry de density.mode
están correctos y receipteados en ambas puertas
(`appearance.general.density` / `surfaces.density`) — el guard H-2 de
discriminación de stops habría atrapado una rotura viva; (b) `--ds-type-scale`
pertenece a typography.scale (`appearance.general.typography.scale` /
`typography.scale`), emitido incondicionalmente por el lowering de posture;
(c) no existe acople density↔typeScale en el árbol — el único punto de
contacto es la dependencia `density.posture` del efecto que re-lee
`--ds-type-scale` en `adaptive-layout/presentation/react/index.ts:156-158`;
(d) el registry de typography.scale (capabilities/index.ts:182-192) documenta
un defecto de keypath de esa familia **ya corregido** ("typography (ramp
channels)" prose → `typography.scale`). Hipótesis DT: línea stale de la era
de ese packet, o referencia a ese defecto ya cerrado. **Disposición:** packet
de verificación mecánica para Sonnet DESPUÉS del commit de B-2 (write-sets
colisionan en receipts): enumerar todo keypath que mencione density o
typeScale en capabilities/index.ts, schema tenant-theme, hooks-manifest y
brand-studio; verificar que cada uno resuelve a un campo real en ambas
puertas; reportar mismatches; tocar sólo con mismatch concreto. Si el owner
confirma un sitio específico, el packet se repunta ahí.

**Respuesta al owner sobre la directiva (2026-08-24, censo ejecutado):
CENSUS-CLEAN.** Sonnet corrió la enumeración mecánica exhaustiva (read-only,
HEAD `4609a0a82`): los 18 usos de density/typeScale en capabilities/index.ts y
todos los equivalentes en tenant-theme, hooks-manifest, brand-studio, ambos
manifests y migrate-v1 **resuelven a campos reales en su tipo destino**; cero
keypaths rotos; cero cruces funcionales density↔typeScale en toda la cadena
(documento → BrandTheme → posture → canal CSS → consumidor React);
`readTypeScale()` lee exactamente el canal que los compiladores emiten
(`--ds-type-scale`, mismo nombre y contrato). **No hay keypath que arreglar**:
la directiva queda respondida con censo completo — el defecto de esa familia
(`typography (ramp channels)` prose) ya había sido corregido en F4B-7 y el
propio código lo documenta. Único hallazgo tangencial: la divergencia de
vocabulario de 4 enumeraciones de density, ya adjudicada `OPEN_DT`
(VOCABULARY/density del manifest). El packet de verificación queda CERRADO
sin escrituras. Si el owner vio un sitio específico distinto, se reabre con
ese sitio.

**B-2 — preaudit Fable: ACCEPT con DOS correcciones vinculantes (W-A, W-B),
ambas adjudicadas e integradas al brief de implementación.**
- **W-A (doc del contrato):** `compileTheme.tenantAuthoredPaths`
  (`brand-theme/index.ts:2116-2121`) envejece en dos cláusulas tras B-2 —
  "collected from the patch (`collectPatchAuthoredPaths`)" (B-2 NOMBRA, no
  colecta) y "Supplied only for the tenant leg of a DB compile" (aparece un
  segundo proveedor). Se enmienda en el mismo packet con el patrón de cláusula
  envejecida M-1/H-3(a). Costos nombrados y aceptados: rebuild de `dist`
  (dist-freshness-gate) + re-derivación de `producers.json` + la re-emisión
  de 46 ya presupuestada.
- **W-B (identidad × autoría, MEDIDO por Fable):** el stop de identidad NO
  "no escribe nada" — desde F4B-8 RESUELVE el valor del baseline y LO ESCRIBE
  en `input.path`; declarar autoría ahí mueve 7 canales y rompe la
  byte-identidad de bithire (medido con y sin bandera). **RULING DT
  (adjudicado una vez): el stop de identidad NO declara autoría** — es un
  claim del brazo estático sobre lo que el vertical shipea, no un acto de
  autoría del tenant; coherente con la ley F4B-8 y con que el brazo DB ya lo
  refusa. Va escrito en el código con su razón + drill 7 (identidad +
  palette.seeds/primary sigue byte-idéntica).
- **Correcciones de cifra (asentadas):** `CONSULTED_PROVENANCE_FIELDS` = **19**
  paths, no 20 (5 palette + 5 buttonPrimary + 2 input + 7 sidebar).
  **`navigation.sidebar-tone` es el próximo intersector ya visible**: su
  puerta (`chrome.sidebar.*`) expande a los 7 paths consultados del sitio
  sidebar — el drill 6 lo atrapará cuando ese control se calibre; anotado
  acá para que no sea sorpresa (y su ingress path es wildcard no caminable:
  mismo balde de corrección que button-style/families/anatomy).
- El veredicto del gate (NO-EXISTE) sostuvo bajo los greps de refutación
  propios de Fable (un solo call site productivo de `resolveTheme(base,
  patch)`; cero `tenantAuthoredPaths` en los tres llamadores productivos de
  `compileBrandTheme`; ninguna app llama `compileBrandTheme`).

**OPEN_DT nuevo (vía latente, no viva — registrada del veredicto del gate):**
`applyHostileBrandTheme` (`brand-studio/index.tsx:357`, compile en `:1515`) y
el mecanismo genérico `emit` (`:1492-1499`): clonar `value`, mutar campos,
compilar SIN provenance. Hoy no es viva (su único montaje con baseline de
vertical es un fixture de tortura con `onChange` no-op; el patch lo escribe
el DS como sonda de contraste, no un tenant). El día que una app monte
`PatternBrandStudio` sembrado con la baseline de su vertical y cablee
`onChange` a estado, el segundo render compila `baseline + edición del
tenant` sin provenance — la rama de defecto de producto que el gate vino a
descartar. **Disposición:** packet propio sobre `buildSurfaceVariables`
cuando el frente de customización del studio esté en agenda (F3/F4C); no
bloquea B-2 ni F4B.

**B-2 — IMPLEMENTACIÓN COMPLETA (Opus, 2026-08-24) + verificación DT propia.
Pendiente: postaudit Fable y commit.** Los 7 drills verdes (suite ingress
91/0), la predicción §4 confirmada EXACTAMENTE en escena (bithire
crimson/indigo: 7 canales movidos en AMBOS brazos, 0 filas divergentes —
antes 3; `--ds-button-primary-bg = var(--ds-color-primary)` byte-idéntico
entre brazos; evnto 5/5 sin cambio por el filtro de canales declarados;
rottay sigue rechazado por el guard, misma forma), y el STOP que más
importaba: **cero movidas en los 43 escenarios CSS receipteados** (verificado
empíricamente re-bajándolos por el brazo estático, no sólo derivado; 46
receipts = 43 CSS + 3 DATA de responsive.posture sin brazo estático). Dos
artefactos NO receipteados difieren (`experience-profile/
bithire-editorial.DIVERGENCE.json` y `bithire-technical.DESIGNED-NULL.json`,
en `--ds-material-canvas-texture`): superseded por las corridas R7, cerrado
por experimento directo (autoría sobre experience.profile mueve 0 canales).
**Mi verificación DT (contra el árbol, no de palabra):** write-set 57 paths =
lo declarado + 1 desviación adjudicada; diff de `brand-theme/index.ts` =
sólo comentario (W-A); ingress 91/0; `program-check` CONSTITUTION_READY;
validador v2 **46/46 VALID**; los 46 receipts re-emitidos cambian EXACTAMENTE
`createdAt` + `sourceDigest` (chequeo campo por campo, 0 deriva de valores);
`producer = claude-opus-5-f4b-lane` pasa la valla de segregación viva (el
validador lee el aprobador desde las autoridades, nunca pineado).
**Adjudicaciones DT de este packet:** (a) **desviación
`manifest/index.json` ACEPTADA** — índice derivado de los manifests de
control, misma clase que `producers.json`; `program-check` lo exige. Nota de
orden asentada (Opus): el generador se niega a escribir con receipts stale →
secuencia obligada `re-emitir 46 → generar index.json → program-check`. Queda
como precedente: los índices derivados forzados por un gate se declaran, no
se omiten. (b) **W-A comprimida ACEPTADA**: el texto largo reventaba
`budget.maxSourceBytes` (pineado exactamente al valor actual en 5
entrypoints; headroom 0). La versión de 308 bytes conserva las dos
correcciones de Fable (conjunto NOMBRADO además de colectado + segundo
proveedor nombrado + "Absent = not a tenant"); el porqué largo vive en el
arm (`staticTenantAuthoredPaths`). **No subo el techo por un comentario** —
los presupuestos de bytes mueren en F6 de todos modos; si en F6 sobra
headroom, el texto largo puede volver. (c) **drill 7 fija la regla W-B
load-bearing**: identidad + flag mueve 7/7/5 canales si la rama se rompe.
**Deuda NUEVA registrada (no de B-2, probada preexistente por A/B con bytes
de HEAD):** 2 rojos en `tenant-theme/tests/provenance-acceptance.test.ts` —
`case B` (`--ds-sidebar-item-color-active`: esperado `undefined`, recibido
`#FFFFFF`) y `keeps the shipped first-party variable counts` (rottay 1192 vs
1191). Anterior a este packet; **muy probablemente la misma raíz que la
puerta DB de rottay inerte para paleta** — se investiga en el packet del
ruling rottay (siguiente). Suite fuera de los gates corridos: anotado para
el barrido de cobertura. **Lo único que bloquea palette.seeds ahora: el
ruling rottay** (`ROTTAY_DB_DOOR_INERT_FOR_PALETTE`) — medir por qué el brazo
DB emite 0 canales de paleta (¿política legítima o defecto de producto?) y
adjudicar la `stopDiscriminationException` o declarar el defecto.

**Preflight de los 12 controles restantes (Sonnet, 2026-08-24, read-only,
censo mecánico completo — 24 filas control×puerta).** Mecánica del walker
verificada en fuente: split SIEMPRE por `.`; `{a,b}` soportado sólo si el
diferenciador está en el ÚLTIMO segmento; `*` suelto NO expande (se camina
literal y rompe en silencio — el propio autor del walker lo advierte);
ninguna normalización. La sonda baja EXACTAMENTE 4 kinds (`closed-enum`,
`bounded`, `profile-id`, `color-set`); extrae sólo `--ds-*` (sin rama
`rootAttributes`). **HALLAZGO SISTÉMICO §2: la puerta DB de la sonda tiene
`mode: "simple"` HARDCODEADO** (`toCompilerInput`, ingress/index.mjs:930-951)
— nunca construye el envelope `{mode:"advanced", visualFoundation}`, así que
los 6 controles PRO (`chrome.anatomy`, `chrome.families`,
`profiles.expressive`, `profiles.icon`, `recipe-profile`, `token-overrides`,
todos bajo `visualFoundation.*`) son estructuralmente inalcanzables por la
puerta DB con UN solo hueco de harness, no seis bugs. La unión discriminada
simple/advanced es real y usada en producción (5 despachos en
tenant-theme/index.ts). **Buckets:** B (keypath roto, clase F4B-7 probada,
puerta DB ya lista): `shape.button-style` (prosa literal →
`surfaces.buttonStyle`), `surfaces.elevation-posture` (campo real equivocado
→ `surfaces.elevation`), `typography.pairing` (apunta al campo de OTRO
control → `typography.typePairing`; **riesgo de falso-verde cercado**: hoy
escribiría `"sober"` como font-family sin lanzar), `navigation.sidebar-tone`
(wildcard → `chrome.sidebar.tone`, que el compilador YA nombra como la
constante exportada `SIDEBAR_TONE_FIELD`; además el canal declarado
`--ds-sidebar-item-color` no es de los 6 que el tono mueve — corregir a uno
real). B+registry: `motion.dial` (sin `bounds` en el registry — con bounds
sube a `bounded` que la sonda YA baja; y static `motion.*` → brace-set de 3).
C (la sonda no baja kind/forma): `typography.families` (AMBOS keypaths
limpios; sólo falta la rama `font-stack` — la más barata de la cola),
`chrome.families` (chrome-map multi-campo), `token-overrides` (el destino
real vive FUERA de BrandTheme: parámetro hermano `verticalTokenOverrides`),
`chrome.anatomy` (triple bloqueo: brace-en-medio con sufijo compartido, kind
`enum` sin rama, y data-only sin rama `rootAttributes`), `profiles.expressive`
(kind `enum` + §2). D (instrumento equivocado): `profiles.icon` — DATA pura
consumida por hook React (`channels=[]`, `rootAttributes=[]`); tratamiento
terminal-DATA estilo responsive.posture, no CSS. Los 12 tienen
`normalizedStops: []` — cada packet incluye autorar sus stops. **Cola F4B
derivada de este censo (orden DT):** palette.seeds (en cierre) → los 4
bucket-B (button-style, elevation-posture, pairing, sidebar-tone) →
motion.dial → packet de instrumento (rama `mode:'advanced'` + rama
`font-stack`, preaudited) → PRO controls → anatomy/token-overrides/icon al
final (superficies de medición nuevas). Hallazgo de prevención asentado: el
registry debería IMPORTAR las constantes de keypath que el compilador ya
exporta (ej. `SIDEBAR_TONE_FIELD`) en vez de escribir strings a mano — el
bug de sidebar-tone no habría existido por construcción.

**Rottay palette MEDIDO (Opus, 2026-08-24, read-only, instrumental
reproducible en /private/tmp/rp/): el veredicto es INSTRUMENT-DEFECT — ni
política legítima ni defecto de producto.** `ROTTAY_DB_DOOR_INERT_FOR_PALETTE`
es **falso como está escrito**: para rottay/crimson, `compileTenantThemeConfig`
devuelve `variables = {}` **y** `modeDeltas = [{mode:'light', 19 variables}]`,
y esas 19 incluyen **2 de los 5 declarados** (`--ds-color-primary: #DC2626`,
`--ds-chart-series-1: #B33831`). La puerta NO es inerte: el guard que rechaza
lee sólo el mapa **base** y lanza **antes** de la extracción de mode-blocks
que H-3 fase (a) agregó 35 líneas más abajo (`ingress/index.mjs:1135-1141` vs
`:1170-1184`). Guard de la era pre-H-3, nunca ensanchado; y hay un SEGUNDO
guard de la misma clase (`assertVariables`, `:227-234`, usado por
`composeStaticArm`/`composeDbArm`). **El hop que diverge es migrateV1 y el
hecho de datos es UN booleano: `defaultMode`.** rottay es el único vertical
first-party con default oscuro; el v1 sin `backgroundMode` enruta el seed
top-level a `modes.light` (`migrate-v1/index.ts:396,404-418`) — en bithire/
evnto (default light) cae en el cuerpo. Los 5 canales, uno por uno: 2 se
mueven; `--ds-color-primary-500` inerte (rottay es el ÚNICO que autora
`palette.ramps.primary` en su cuerpo, y las rampas autoradas ganan a la
derivación); `--ds-button-primary-bg` estructuralmente ciego en rottay/evnto
(alias constante — testigo inválido ahí); `--ds-color-text-on-primary` inerte
en los 3 (hoja autorada). **APCA gobierna la puerta dark**: crimson/indigo
son inadmisibles en rottay-dark (Lc 32.2/23.2 contra el piso, guard
`validateCompiledThemeContrast` en compileTenantThemeConfig); seeds claros
(#FFD166, #A7F3D0, etc.) pasan con 19 vars / 2 declarados. La puerta dark NO
está cerrada por política — sólo esos dos stops. **Hallazgo colateral
incómodo (registrado, sin medir alcance):** el brazo static emite el par que
el brazo DB RECHAZA (`#DC2626` + `#0C0C0E`, mismo Lc 32.2) —
`compileBrandTheme` no tiene puerta de contraste; las puertas son asimétricas
en VALIDACIÓN, no sólo en scope. **Los 2 rojos preexistentes: NO comparten
raíz entre sí ni con esto, y ninguno es defecto de producto.** Rojo A
(`--ds-sidebar-item-color-active`): pin rancio de K1 (`33efc95c0` — rottay
pasó de literal `#FFFFFF` a alias `var(--ds-color-primary)`; la premisa del
test era igualdad contra literal). Rojo B (conteos): pin rancio de
`3393f70d4` (F4A-6/K3 autoró `--ds-color-text-page`): rottay 1191→**1192** Y
evnto 467→**468** (el segundo desfase escondido detrás del primero; bithire
1231 correcto). No stalean ningún receipt de palette.seeds (no están en
`sourceBindings` ni en `gates:ci`); sí enrojecen la suite unitaria completa.

**RULINGS DT (adjudicados una vez, acá):**
1. **Directiva del owner formalizada** ("arreglá los 2 rojos del test y
   ensanchá los guards"): packet R-1 (fix de los 2 rojos, 3 líneas, spec
   exacta de la medición) ANTES de R-2 (ensanche de guards + cierre), para
   medir el ensanche contra una suite limpia.
2. **Ensanche de guards (R-2):** el chequeo de vacuidad de `lowerStop` se
   mueve DESPUÉS de la extracción de `modeVariables` y se calcula sobre la
   UNIÓN `variables ∪ ⋃ modeVariables[mode]` (mensaje nombrando el scope);
   `assertVariables` acepta base vacío si `modeVariables` no lo está; drill
   positivo nuevo: "una bajada vacía en base y no-vacía en un mode block ES
   un brazo, no un hallazgo" con la forma medida de rottay/crimson. El drill
   negativo existente (doble sin `modeDeltas`) sigue verde.
3. **Paridad scope-matched (la decisión que la medición me dejó):** las dos
   puertas escriben scopes de modo distintos en un vertical de default
   oscuro (static → cuerpo = dark; DB sin backgroundMode → modes.light).
   Compararlas así mediría cosas distintas. **Ruling: el documento DB de la
   sonda declara `backgroundMode = defaultMode del vertical` SIEMPRE** — la
   intención tenant dominante es "mi marca en la apariencia default de mi
   producto"; en bithire/evnto no cambia nada (ya era light), en rottay el
   seed cae al cuerpo y la paridad se mide like-for-like. El caso
   "tenant que sólo marca su light" queda registrado como hecho de contrato,
   no como corrida de equivalencia. El `ingress` del manifest NO gana campo
   de scope: lo declara el escenario, uniformemente.
4. **Stops de palette.seeds en R-2:** crimson/indigo quedan EXCLUIDOS en
   rottay-dark con razón APCA escrita (la clase de exclusión legítima "el
   envelope rechaza el stop"); se autoran seeds claros admisibles
   (#FFD166 / #A7F3D0 o los que la medición de R-2 confirme) para la paridad
   rottay. H-2 queda DECIDIBLE en cada brazo (2 canales discriminan 2 stops).
5. **El finding del manifest se reescribe:** `ROTTAY_DB_DOOR_INERT_FOR_PALETTE`
   → `ROTTAY_DB_SEED_LANDS_IN_THE_NON_DEFAULT_MODE` (su `stillTrue...`
   re-verificó el GUARD, no la bajada). **NO corresponde
   `stopDiscriminationException`** — no hay nada que exceptuar: había un
   guard que medía media cosa. La salida nombrada queda sin uso y así queda
   asentado.
6. **Preguntas de producto para el owner (registradas, no bloquean F4B):**
   (a) ¿debería el transporte v1 enrutar un seed sin `backgroundMode` al
   modo default del vertical en vez de siempre a light? (hoy rottay-dark
   recibe el seed sólo en su overlay); (b) ¿debería `compileBrandTheme`
   tener una puerta de contraste como la de `compileTenantThemeConfig`?
   (la asimetría de validación entre puertas, sin medir alcance).

**R-1 — los 2 rojos preexistentes ARREGLADOS (Sonnet, 2026-08-24; directiva
del owner ejecutada).** Un solo archivo
(`tenant-theme/tests/provenance-acceptance.test.ts`), exactamente 3 líneas +
comentario: (A) el caso B aserta ahora el valor emitido
(`ABOVE_FLOOR_PAIR.itemColorActive`, identificador que el archivo ya tenía y
que usan las aserciones de bithire/evnto) en vez de `undefined`, con el
comentario reescrito a la verdad nueva (K1 `33efc95c0` recableó el leaf al
alias); (B) los dos pines de conteo: rottay 1191→**1192**, evnto 467→**468**
(el desfase de evnto estaba escondido detrás del throw de rottay).
**Verificación independiente de Sonnet (no tomada del memo):** conteos
recompilados desde `dist/` fresco = 1192/1231/468 exactos; atribución K1 y
F4A-6/K3 confirmadas por `git show`. **Verificación DT propia:** 2 rojos
antes, **22/22 verde** después, write-set de 1 archivo. Cero lógica de
producto tocada. **Commit `068e4c357`** (postaudit Fable ACCEPT; la fila ES
la conducta correcta: diff-de-valores, literal ≠ alias aunque hoy pinten
igual).

**R-2 — ensanche de guards de modo + rottay deja de ser un rechazo
(implementación Opus, 2026-08-24; preaudit ACCEPT con W-A/W-B/W-C).**
Instrumento: el chequeo de vacuidad de `lowerStop` baja DESPUÉS de la
extracción de `modeVariables` y se calcula sobre la UNIÓN `variables ∪ ⋃
modeVariables[mode]` (mensaje nombrando scopes); `assertVariables` acepta
base vacío si `modeVariables` no lo está; el ensanche es MONÓTONO (sólo
admite lo que antes rechazaba — todo brazo receipteado toma el camino
idéntico, cercado por drill 7). Scope-matched (W-A): `backgroundMode =
defaultMode del vertical`, leído del **BrandTheme publicado en dist**
(`<vertical>BrandTheme.appearance.defaultMode` vía `loadStaticBaselines()`),
fail-closed, nunca literal por vertical; `producedBy.input.modeScope` lo
nombra. 7 drills nuevos (suite 224/0 + roster 19/19). **6/6 corridas causales
verdes: rottay pasó de "corrida rechazada" a brazo equivalente con 0 filas
divergentes** (warm-sand y pale-mint, static=db, restore exact, negativos
held); bithire/evnto re-verificados sin cambio bajo el código R-2 (W-B).
**El STOP medido y su ruling:** bajo scope-matched el piso de contraste se
evalúa contra la tinta on-primary del modo default de cada vertical — casi
negra en rottay (dark), blanca en bithire/evnto (light) — así que rottay sólo
admite seeds claros y los otros dos sólo oscuros: **barrido de 216 seeds,
CERO comunes a los tres, conjuntos exactamente complementarios** (79
rottay-only, 122 bithire+evnto-only, 15 en ninguno, 0 mixtos). **RULING DT
(formaliza la directiva del owner "roster por vertical aprobado"): el roster
de stops es POR VERTICAL** — 2 admisibles por vertical de un set declarado de
4 + identity, cada exclusión publicada con su Lc (crimson/indigo en rottay:
32.2/23.2; warm-sand/pale-mint en bithire/evnto: −23.9/−16.1; el mensaje real
es el par de botón, citado textual en drill 5). El dominio declarado NO queda
recortado: `calibration.stopAdmissibilityByVertical` lo carga medido. H-2
DECIDIBLE en los 6 brazos (`--ds-color-primary` + `--ds-chart-series-1`
discriminan en todos). Los 3 declarados que no pueden testificar, asentados:
`-500` (rampas autoradas de rottay), button-bg (alias constante en
rottay/evnto), text-on-primary (hoja autorada en los 3). **Adjudicaciones DT
de las 3 desviaciones medidas:** (a) dist rebuild SÍ aplicaba (los `.mjs` de
la sonda son build inputs — mi brief estaba mal; rebuild con 0 archivos
trackeados movidos); (b) **el sello de scope se acota a documentos que YA
escriben nodo de paleta** — escribir `backgroundMode` en un documento sin
paleta MATERIALIZA uno con 10 keypaths fantasma-autorados (medido: 24/36
compilaciones DB receipteadas habrían cambiado de VALOR), asentado como
`NON_PALETTE_DOCUMENTS_MUST_NOT_MATERIALISE_A_PALETTE_NODE` (drill 4); la
regla sigue uniforme (nunca literal por vertical); (c) la evidencia de W-A
estaba mal (`FIRST_PARTY_THEMES.rottay.appearance.defaultMode` vale `"dark"`,
no `undefined`) pero la prescripción era correcta por la razón fuerte
(`FIRST_PARTY_THEMES` no se exporta del entrypoint publicado; deep import
rechazado — drill 3). `public/cli/index.mjs` entra al write-set declarado (21
líneas de cableado del defaultMode). W-C cumplida: el finding queda
SUPERSEDED con su texto histórico + `stillTrue...Correction` (re-verificó el
guard, no la bajada). `assertStopDiscrimination` NO se ensancha (correcto
bajo scope-matched; el vector latente "stops que vivan sólo en un mode block"
queda nombrado, inalcanzable hoy). Nota de vara de Fable (su §3, asentada por
honestidad estructural): su reproducción de F4B-8 compartía la ceguera del
guard (leyó sólo `variables`, nunca `modeDeltas`) — regla nueva de su vara:
enumerar TODAS las proyecciones de la salida al reproducir un compilador.
**Emisión (6 receipts R7 + celda + COMPUTED_VERIFIED) despachada; postaudit y
commit siguen.**

**R-2 — CIERRE (2026-08-24): postaudit Fable REJECT local → corrección focal
de 4 textos → ACCEPT final.** El REJECT fue exactamente la clase que este
programa existe para impedir: el manifest de cierre contradiciéndose a sí
mismo — `unmeasuredScope[0]` con texto de fase 1 contra los 6 evidence IDs
del mismo archivo; `r2CausalRuns` citando los artifacts borrados con la razón
obsoleta; `knownDefects[...].productHalf` y el comentario de
`verticalDefaultMode` portando la evidencia que el drill 3 del propio packet
había refutado ("the obvious place is empty... undefined (measured)" — falso:
vale `'dark'`; lo ausente es el EXPORT del entrypoint). Cuatro ediciones de
texto, cero lógica, y una nota de honestidad del implementador (su primera
versión del fix introdujo una falsedad NUEVA — "nothing is measured on either
arm" — detectada releyendo antes de correr: la clase de caza que vale). Tras
el fix: re-emisión de frescura de los 52 (un comentario stalea dist por hash
de insumos; rebuild con 0 trackeados movidos), 52/52 VALID,
CONSTITUTION_READY, 227/0, 22/22, 46 receipts viejos sólo frescura —
verificación DT propia. **ACCEPT de Fable: `palette.seeds` →
COMPUTED_VERIFIED. F4B pasa a 8/20.** El claim queda acotado por ley:
equivalencia para stops admisibles por vertical bajo `modeScope` explícito =
modo default; las puertas NO son simétricas en validación (static baja 5
testigos, DB 2 — la huella del piso APCA que una tiene y la otra no);
`disposition` de la celda queda UNKNOWN (SIGHTED no reclamado); las dos
preguntas de producto quedan obligatorias y abiertas (roadmap: decisiones de
producto del owner, abajo). Alerta de path del DT cerrada en el acto
(`--out` se resuelve contra cwd en ambos modos — 12 archivos con prefijo
duplicado, regenerados no movidos porque el JSON horneaba el path mentiroso;
árbol duplicado borrado enumerado). H-1 drill 3 enlistó el control al cerrar
y falló: medido `BASE_SENSITIVE_BY_DESIGN` (no regresión), entrada con la
razón medida. Desviación `program-check.test.mjs` (CLOSURE_MEMBERS +=
`packages/core/styles`, medida) aceptada: los 6 receipts son los primeros en
atar un family manifest y el sandbox del test los hasheaba 'MISSING'.

**Auditoría externa Codex (a pedido del owner, 2026-08-24) — adjudicada.**
Tomo 1, rechazo 1, el resto ya estaba adjudicado. **TOMO (y entra en R-2
antes del postaudit, ratificado por el owner):** el helper de exclusiones de
`lowerStop` (`ingress/index.mjs:1330`) captura CUALQUIER error y lo publica
como exclusión legítima — un `TypeError` accidental sería indistinguible de
"el envelope rechaza el stop". Se endurece en R-2: sólo las clases conocidas
(elisión de default del compilador, rechazo del envelope, throw APCA con su
mensaje, domain-kind no soportado) publican; cualquier otro error re-lanza
fail-closed; drill: un error inesperado TIRA y no se publica; los registros
de exclusión de las 6 corridas quedan asertados idénticos pre/post (son todos
de clase conocida). Los 6 receipts se sellan con el discriminador YA
endurecido. **Claim acotado (ley de escritura):** "equivalencia verificada
para stops admisibles por vertical, bajo `modeScope` explícito igual al modo
default" — nunca "las dos puertas son equivalentes". **Rechazado con
evidencia:** "mantener palette.seeds UNKNOWN" — el owner aprobó el roster;
F4B certifica la cadena causal medida, no la perfección del producto; las
preguntas de producto quedan asentadas con puntero, obligatorias y abiertas.
Ya adjudicados: gates rojos mid-packet (transitorio), `cli/index.mjs` (el
brief encargaba el document builder; 21 líneas de cableado, declarado), el
nextAction contradictorio (se resuelve en la emisión). Nota de método
asentada: cada packet de instrumento futuro justifica por qué no es runtime
(criterio del owner vía Codex).

**Decisiones de PRODUCTO del owner (2026-08-24, respondidas — registradas
como packets futuros obligatorios, NO de F4B):**
1. **Enrutado v1:** SÍ — un seed sin `backgroundMode` va al **modo
   efectivo/default del vertical**. Migración VERSIONADA: los documentos v1
   existentes que deban conservar `light` quedan explicitados como `light`;
   la semántica nueva usa el default vertical. (Hoy: un tenant rottay que
   sólo marca su paleta no ve su marca por defecto.)
2. **APCA compartido:** SÍ — ambas puertas comparten la misma política.
   Primero MEDIR los themes actuales (¿algún par autorado queda bajo el piso
   y rompería builds first-party?), después llevar la validación a UNA
   autoridad compartida, no duplicada.
3. **Contrato público opción B:** SÍ, dentro de F5 — `tenantPatch` como API
   real; CSS, `personality` y `tokenOverrides` derivados TODOS del mismo
   `effectiveTheme` (hoy CSS y los objetos públicos pueden representar dos
   estilos distintos).

**F4B-9 — shape.button-style: keypath corregido, control cerrado en
SOURCE_BOUND (2026-08-24, Sonnet; postaudit pendiente al asentar).** El fix es
la clase F4B-7 tercera vez probada: `brandThemePath` era prosa
(`chrome.controls.button* (radius channels)`) → `surfaces.buttonStyle`
(campo real, `brand-theme:786` + `themes:597`), con el comentario patrón y una
precisión nueva: este canal NO tiene seed incondicional, así que una corrida
por la puerta rota habría fallado RUIDOSO, no en silencio. El registryDigest
de los 20 manifests se re-derivó (mecánico, verificado digest-only campo por
campo). 4 receipts R7 (rottay+evnto × sharp/pill, paridad byte-exacta, restore
exact, H-2 decidable en ambos brazos). **El packet destapó DOS defectos de
producto reales, ambos OPEN_DT:** (1) `DECLARED_CHANNEL_DOES_NOT_PAINT` —
`--ds-radius-button` se emite y se mueve limpio, pero `button.css` NUNCA lo
lee: pinta vía `--ds-button-{xs..xl}-radius`, que el branch de buttonStyle no
escribe. El dial mueve un canal que nada pinta (medido en browser: 32 filas,
`border-top-left-radius` jamás se movió). El fix es compilador/CSS (packet
propio, F4C/vertical). (2) `CHANNEL_SHADOWED_BY_AUTHORED_CHROME_LEAF` — bithire
autora `chrome.controls.buttonGeometry.radius: '9px'` incondicionalmente y
`chromeToVariables` lo esparce DESPUÉS del branch de buttonStyle: el canal
queda fijo sin importar el stop → su brazo estático no puede discriminar (el
guard lanza exactamente eso); el brazo DB sí discrimina, pero un brazo solo
nunca pasa (`pass` exige ≥2 brazos por diseño). Pregunta de producto
registrada: ¿debería el dial del tenant ganarle a la hoja autorada de bithire?
(opción B dice sí; el arreglo es de orden/hoja, packet propio). **El control
cierra en SOURCE_BOUND, no COMPUTED_VERIFIED, por honestidad de la escalera:**
la celda de button no puede reclamar `computedProperties` con nada pintado
movido (el generador mismo rechazó COMPUTED_VERIFIED) — el compilador está
verificado en aislamiento, pero la escalera certifica consecuencia PINTADA.
`stopDiscriminationException` usada por primera vez en producción: **RATIFICADA
por el DT** (`adjudicatedBy: Kimi K3 (DT)` — propuesta por el ejecutor con el
hecho medido tres veces; es un hecho, no una decisión de diseño). `soft`:
medido no-discriminante en rottay/evnto (computa idéntico al fallback de
foundation — sin receipt, con ley escrita). Identity: NO declarado (ningún
vertical autora el field literal; `resolveIdentityValue` habría fallado
fail-closed — "an identity that has to be invented is not an identity").
Extensión de harness precedentada ×4 (una propiedad en token-readout).
Desviaciones adjudicadas: los 19 manifests digest-only + `producers.json`
digest-only (ripples mecánicos del registry edit) + `fixtures.json` (la
extensión) + `button.json` (celda, `unknownReason` + evidenceIds; `disposition`
y `verificationState` quedan UNKNOWN; NO se autoró `propertyGroups` — habría
sido falso). **Colateral: 12 rojos APCA preexistentes** (tenant-theme-compiler
×9, capability-reachability ×2, theme-iso ×2) con el mismo error
(`dark --ds-card-title-color Lc 10.8 against --ds-card-bg`) — investigación
separada DESPACHADA a Opus por directiva del owner (¿regresión real de a11y en
dark, o pins rancios clase R-1?; alta confianza de que es K1/F4A-6 llegando a
dist por primera vez).

**F4B-9 — CIERRE (2026-08-24): postaudit Fable REJECT local de secuencia →
corrección mecánica → ACCEPT final.** El REJECT no fue de contenido: mi propia
ratificación (15:31:42, el string `adjudicatedBy`) movió el digest del manifest
del control DESPUÉS de la secuencia de cierre (15:21:49) — los 4 receipts
nuevos lo llevan en `sourceFiles` y quedaron stale junto al índice (4/56
INVALID + program-check REFUSA; los 52 viejos intactos). Corrección: re-emisión
de los 4 (artifacts byte-idénticos antes/después, verificado) → index →
CONSTITUTION_READY → 56/56 VALID. **Lección de vara asentada (Fable): toda
edición de manifest posterior a la verificación — incluida la ratificación de
un string — re-corre `re-emitir → index → program-check → validar` ANTES de
despachar al auditor.** De ahora en más, mis ratificaciones van ANTES del
cierre de secuencia del implementador, o la secuencia se re-corre. ACCEPT
final de Fable: `shape.button-style` cierra en SOURCE_BOUND con sus dos
defectos OPEN_DT registrados. F4B sigue 8/20 COMPUTED_VERIFIED + 1
SOURCE_BOUND con evidencia sellada.

**APCA — los "12 rojos" MEDIDOS (Opus, 2026-08-24, A/B en copia aislada con
corrección de método declarada): NO son 12 APCA: son 10 + 2 de otra clase, y
la hipótesis inicial (K1) quedó REFUTADA.**
1. **Los 10 APCA (mismo par, mismo Lc 10.8: `dark --ds-card-title-color` /
   `--ds-card-body-color` contra `--ds-card-bg`) = REGRESIÓN-PRODUCTO real en
   dark mode. Atribución: `cf61da8bb` ("F2.4 ola 3 — H1+H2 drenados",
   2026-08-20)** — nadie lo había mirado. Su diff eliminó el overlay dark del
   card de bithire (`bg: "#151d2b"`) y recableó la base a
   `var(--ds-surface-card)`. **Fue cero-delta para el vertical solo y NO
   cero-delta para el tenant:** el overlay outrankeaba cualquier ground
   autorado por un tenant en dark (lo blindaba); sin él, el ground del tenant
   gobierna los dos modos → tinta clara sobre fondo claro → ilegible. El gate
   reporta correctamente. El write-set F4B-9 quedó EXONERADO por A/B.
2. **El espejo T0 (1) = REGRESIÓN-PRODUCTO de autoría incompleta, `3393f70d4`
   (F4A-6):** `textPageColor` se autoró en el cuerpo de los 3 (simétrico) y en
   el overlay de sólo 2 (rottay-light, bithire-dark; evnto-dark quedó como
   placeholder-comentario). Colisión de leyes: T0 (mismo conjunto exacto de
   keypaths en los 3 temas) vs la ley F4A-7 de placeholders (ausencia
   documentada como comentario). **Adjudicación DT:** T0 manda para claves de
   overlay que afectan render — se autoran los slots faltantes con el valor
   que la tinta del modo requiera (la medición de alcance pedida por el owner
   dice cuáles y con qué valor); la ley de placeholders queda para ausencias
   que NO cambian render.
3. **Los centinelas de schema (2) = PIN-RANCIO clase R-1, ya adjudicado en su
   día:** F4A-6 agregó `--ds-color-text-page` a `TENANT_THEME_REFERENCE_TOKENS`
   → los dos digests se movieron por construcción, y el propio commit eligió
   deliberadamente romper 9 tests; el re-anclaje nunca se hizo. Fix mecánico
   (Sonnet, micro-packet propio): los 2 pines nuevos ya medidos en dos builds
   + la nota de protocolo ("AMPLIACIÓN de un token de referencia, no
   narrowing").
**¿Por qué nadie los vio?** No es agujero de gates: las 3 suites NO están en
`gates:ci` pero SÍ en el `test:ci` de CI — y HEAD está **549 commits por
delante de origin/main, sin push nunca**. CI no vio este árbol. **Backlog
latente de rojos de CI**: se mide ahora con un `test:ci` local completo
(despachado, background). **Adjudicación DT:** `test:ci` completo local pasa
a ser gate de fase (al cerrar cada frente), para no descubrir el backlog el
día del push. **Quinta instancia de `ASYMMETRIC_VALIDATION_BETWEEN_DOORS`
confirmada:** la puerta estática compila el par exacto que la DB rechaza —
alimenta la medición de la decisión de producto #2 (piso APCA compartido).
**El fix del card (regresión 10×APCA) queda ordenado por el owner** ("medí si
rottay y evnto también perdieron el pin dark del card" — medición en curso):
dirección preferida = restituir el blindaje por modo (que el overlay dark
DECLARE el canal) en los verticales que la medición marque; las alternativas
(compiler deriva la tinta del ground; o aceptar el rojo como contrato y
arreglar fixtures) quedan registradas con sus costos en el memo.

**Estado de ejecución de la trenza APCA/E-1 (2026-08-24, tarde):**
- **Centinelas re-anclados: commit `86ef42fee`** (Sonnet; pines verificados
  contra los digests publicados en dist antes de escribir; nota de protocolo
  "AMPLIACIÓN, no narrowing"; postaudit Fable ACCEPT). Los 7 APCA de ese
  archivo quedan rojos por diseño: son de D-1.
- **E-1 diagnosticado (Opus): el defecto rottay/db de elevation es de ORDEN,
  no de pérdida.** Por la ruta DB la postura del tenant se resuelve DENTRO
  del theme → indistinguible de autoría vertical → la escalera autorada
  (`brand-theme:977-984`) la pisa; el piso de tenant (`:1080`) sólo dispara
  con `tenantPatch` y `compileTheme` no lo recibe. La estática sí lo pasa →
  el tenant gana. Causa raíz confirmada: sólo rottay autora
  `surfaces.elevations` con VALORES (bithire/evnto tienen las claves con
  `undefined`). Regla general falsable: muerde un campo de postura si y sólo
  si (a) sus canales tienen escritor autorado posterior, (b) migrateV1 no lo
  expande a esas hojas, (c) el vertical autora valores ahí — hoy sólo
  elevation × rottay. **Ruling DT: opción 1** (`compileTheme` acepta y
  reenvía `tenantPatch`; la llamada DB pasa `envelope.patch`) — arregla la
  causa (el tenant deja de ser indistinguible de autoría vertical: la ley
  opción B) con el cambio mínimo. Preaudit Fable ACCEPT con W-A (medir los
  mode-blocks de rottay bajo el fix + doc del parámetro + rebuild +
  producers.json nombrados) y W-B (el paso cross-espacio ThemePatch→BrandTheme
  nombrado en código con justificación y cerco). **Decisión de empaquetado:
  E-1 entra EN F4B-10** (write-sets disjuntos: Opus = compilador+tests;
  Sonnet = control+corridas) — evita el acople de `producers.json` (su
  re-derivación hornearía el edit del registry de Sonnet sin commitear en un
  commit ajeno) y cierra la historia completa en un commit. Defecto INVERSO
  registrado para motion.dial (no de E-1): `resolveTenantPosture` no
  desenvuelve `.value` en el brazo estático — una línea, entra en el packet
  de motion.dial.

**F4B-10 — las dos piezas del REJECT y las dos leyes que ganó (asentado en el
ACCEPT final de Fable):** (a) frescura rota por TERCERA instancia de la clase
(el `--sync` de la secuencia de cierre movió el `registryDigest` de los 20
manifests DESPUÉS de la re-emisión de los receipts que los atestaban: 8 de
spacing + 2 palette + 4 button-style + 6 density + 11 experience-profile —
Sonnet re-emitió los 61 con verificación por archivo, 61/61); (b) el docblock
W-B afirmaba un enforcement fail-closed inexistente — Opus encontró CUATRO
afirmaciones falsas (no una) y reescribió el párrafo completo a la verdad
(cerrar por clase, no por instancia: omisión por proyección + rechazo de
tipos + construcción; "must stop" drenado de fuente y dist). **LEY 1 (tercera
instancia en tres días — de lección a gate): toda escritura posterior a la
verificación re-corre la cadena entera (re-emitir → index → producers →
program-check → validador) ANTES de despachar al auditor; y la verificación
del DT es lo ÚLTIMO antes del despacho, nunca 30 minutos antes.** El gate
CI-2 la hace ejecutable. **LEY 2: el emisor de receipts verifica POR ARCHIVO
post-escritura** (la anomalía §3 de Sonnet — una re-emisión que se
auto-verificaba en memoria pero dejaba el digest viejo en disco en el primer
intento: quedó atrapada en la segunda pasada, causa raíz abierta y declarada;
no puede depender de la suerte del segundo intento). Agujero abierto
registrado: el `--check` del generador reportó limpio con receipts stale
encima — el validador v2 lo atrapó; la cadena CI-2 debe incluir el validador,
no sólo `--check`.
- **D-1 preaudit Fable: ACCEPT con W-A/W-B/W-C** (ley cero-delta re-legislada
  a la forma real de 3 partes; alias-en-overlay NO emite → los 4 literales
  llevan comentario anti-"modernización"; write-set completo: ~53 receipts
  por artifacts verticales + producers.json doble input + gate de artifacts).
  Implementación: DESPUÉS del commit de F4B-10 (acople producers.json).
- **Triage del backlog CI (77) despachado a Sonnet (read-only):** 18/77 ya
  son clase drenaje (D-1); ~59 a clasificar (PIN-RANCIO / FIXTURE /
  REGRESIÓN / FLAKE-INFRA).

**E-1 IMPLEMENTADO (Opus, 2026-08-24) — el piso del tenant llega por la puerta
DB; adjudicaciones DT:**
- **Fix:** `compileTheme` acepta y reenvía `tenantPatch` (con doc de contrato:
  quién lo pasa, por qué, `absent = identity`); la llamada DB pasa una
  **proyección exportada** `tenantPostureFloors(patch)` — desviación del
  ruling ACEPTADA: `envelope.patch` no asigna por tipos (ThemePatch hace
  opcionales las hojas que BrandTheme requiere; `tsc` lo rechazó dos veces),
  y un `as` habría sido el narrowing silencioso que el programa rechaza. La
  proyección cruza sólo los 6 paths escalares que el piso lee; `motion` NO
  se proyecta (envuelto — es el defecto inverso, packet de motion.dial;
  comportamiento preservado exactamente) y `expressive.*` tampoco (ya
  expandida arriba). Exportada a propósito: una autoridad, dos lectores
  (G1 de provenance-acceptance la importa — no hay copia privada). Reproduce
  la predicción EXACTA: rottay/flat y /elevated 0→3 vars cada uno (los
  valores del brazo estático); soft 0 (preset vacío, correcto).
- **Adjudicación (a) — la fila `typePairing=editorial|bithire`:** consecuencia
  CORRECTA del mismo fix (la selección tipográfica del tenant ahora gobierna
  los dos modos; el overlay dark de bithire sobrevivía sólo en dark — la
  misma clase de defecto, un modo más allá). Acotada: 1 fila, 1 vertical, 1
  canal, 1 bloque; las otras 27 filas del barrido idénticas. Opción B
  aplicada.
- **Adjudicación (b) — la escalera vs el tenant:** la ley vigente es opción
  B: la selección de postura del tenant PREVALECE sobre la escalera autorada
  en AMBAS puertas. El comentario "an authored ladder is the ceiling it
  states outright" (`brand-theme:978`) describe la precedencia pre-opción-B:
  queda VIEJO y se re-asienta en este packet (cláusula envejecida
  M-1/H-3(a)): las dos puertas ahora coinciden — el overlay light de rottay
  deja de emitir los 3 canales porque, con el piso aplicado en ambos, los
  valores coinciden (herencia, no duplicación).
- **Techo de bytes de subpath públicos: AUTORIZADO por el DT** (precedente
  B-1: incremento único al valor medido, sin aire, decrease-only desde el
  nuevo ancla, nota en `_note`). El fix cuesta ~98 B de código puro y el
  techo no lo absorbe (medido irreducible +90 B aun con el doc borrado).
  Anclas a los valores medidos finales tras el re-asiento del comentario.
- **Verificaciones:** tsc limpio; conteos 1192/1231/468 idénticos; suites de
  los 2 compiladores con baseline aislado: 30 rojos preexistentes, CERO
  regresiones; provenance-acceptance 23/23 (G1 actualizado + drill G3 nuevo);
  56/56 VALID; producers.json aditivo (2 digests, sin filas); program-check
  bloqueado sólo por el index.json de la lane de Sonnet (se limpia solo al
  cerrar ella).
- **Empaquetado confirmado:** todo esto commitea dentro de F4B-10.

**F4B-10 — surfaces.elevation-posture CIERRA COMPUTED_VERIFIED (2026-08-24;
Sonnet + Opus en packet fusionado; postaudit Fable: REJECT local de 2 piezas
→ correcciones focales → ACCEPT final; F4B pasa a 9/20).** El fix
de keypath (clase F4B-7, variante campo-real-equivocado:
`surfaces.shadows.*` → `surfaces.elevation`) + el fix E-1 del compilador
(packet fusionado) + **5 receipts R7 en las TRES verticales**: rottay×2
(flat/elevated — el brazo DB ya baja: 4 canales byte-idénticos al estático),
evnto×2, bithire×1 (elevated, `PASS_WITH_EXCEPTION` verificado EN el
artifact: `witnesses: ['elevated']`, `exception.armId: db-tenant-theme` con
mi ratificación pre-escrita). `soft`: no-op estructural confirmado en las 3
verticales y ambos brazos (`ELEVATION_PRESET.soft = {}` — sin receipt, con
ley). El brazo estático de bithire NO necesita excepción (flat es testigo
real no-excluido ahí — medido en corrida aislada). **COMPUTED_VERIFIED, no
SOURCE_BOUND:** acá SÍ pinta — `box-shadow` de card se mueve (del shadow de
3 capas del seed a `none` en flat, y a la escala en elevated), byte-idéntico
entre brazos; `card.css` lee el canal vía fallback de un salto
(`var(--ds-card-shadow, var(--ds-elevation-1))`), no un hermano
desconectado como button-style. Celda de card escrita con el mismo shape
que effect-intensity (`computedProperties: ["box-shadow"]`, disposition
UNKNOWN). **E-1 en el árbol, verificado por Sonnet antes de correr** (no
asumido: import directo de dist + corrida causal). Anclas de bytes
escritos por el DT (5 subpaths, exactos, holgura cero — "decrece-solo"
muerde desde el primer byte). `supplier-contract.json` regenerado (sólo
`tenantPostureFloors`, dos listas; la superficie pública del paquete NO se
ensancha). 61/61 VALID; CONSTITUTION_READY; probe 170/170;
provenance-acceptance 23/23 con el drill G3 de E-1. **Rojo A11 resuelto
(mecánico):** las 3 fallas de `cascade-producers.test.mjs` eran el re-seat de
comentarios de E-1 en `brand-theme/index.ts` DESPUÉS de la última
re-derivación de `producers.json` (line-shifts + site-hashes: byChannel
+0/−0, mismos símbolos, cero filas nuevas o perdidas — la clase "no
collection moved"). `--write` + 217/0 + 48/48 + `--check` OK, verificado por
el DT. Lección afilada (segunda vez en el día, misma raíz que el REJECT de
F4B-9): **toda edición tardía re-corre TODA la cadena de derivados antes de
cerrar** (receipts, index, producers, dist) — el cierre de un packet no
termina en el código, termina en la cadena verde.

**CI-1 — burn-down mecánico del backlog CI (2026-08-24; Sonnet; postaudit
Fable: ACCEPT del contenido con UNA corrección vinculante de secuencia).** 12
archivos de test: 26 pins re-anclados (cada uno verificado contra el árbol de
HOY + comentario de protocolo con el commit atribuido — nunca copiado del
triage) + 3 gaps de checker corregidos (normal-form: strip de comentarios de
bloque, los `@governor` intactos y los drills de mutación siguen rojos donde
deben; CodeBlock/MarkdownView: el `!important` dentro de
`@media (prefers-reduced-motion: reduce)` excluido del ban;
monochrome/namespace: `__tests__` a EXCLUDED_DIR_NAMES). Hallazgo de vara de
Sonnet (asentado): **el `for` con `expect().toBe()` corta en el primer rojo y
esconde los siguientes** — 4 archivos necesitaron re-pins adicionales al
triage por ese enmascaramiento; la respuesta correcta es medir el archivo
COMPLETO. `semantic-typography.test.ts` fue MOVIDO a la lane D-1 por
adjudicación DT (sus 3 digests son content-derived sobre los themes que D-1
editó en vuelo — pins content-derived + lanes paralelas = la clase frescura
un nivel abajo; D-1 los re-pinea al cerrar). La exclusión de theme-iso
(`TEXT_PAGE_COLOR_MODE_ASYMMETRY`) queda CON constante nombrada + comentario
de la forma medida completa (3 formas: rottay sólo-light, bithire sólo-dark,
evnto ninguno) — INTERIM, no ley: el packet T0 (tras la decisión A/B del
owner) re-aprieta el mirror. **La corrección de secuencia de Fable
(adjudicada, orden (i)):** CI-1 commitea SIN re-emisión — los 8 receipts de
spacing llevan en superficie el test de CI-1 Y los artifacts de D-1 sin
commitear; re-emitirlos ahora atestaría contenido ajeno no commiteado. Su
staleness queda ledgereada como deuda en tránsito y la salda D-1 al cerrar
(su W-C ya presupone la re-emisión total conducida por artifacts): una sola
pasada, un solo deudor efectivo, cero cruce. **Cuarta instancia de la clase
secuencia/frescura, primera INTER-lane — es el ejemplo canónico de la ley
CI-2.** Las 13 suites quedan verdes salvo 3 rojos ajenos declarados
(reduced-motion = WO de producto para el owner; W4-absent + negative-mutant
de theme-iso = D-1).

**D-1 — restitución de los 4 escudos de overlay F2.4 (2026-08-24; Opus;
postaudit Fable: ACCEPT — "el primer packet del programa que toca producto
cierra con las tres leyes ejecutadas al pie").** Los 4 literales restituidos
con su comentario anti-alias (W-B: un alias igual a la base NO emite en el
bloque de modo — así se drenó el escudo): bithire `cardComponent.bg #151d2b`
y `table.cellColor #e4e8ed` (dark), rottay `layout.siderBg #F4F4F3` (light),
evnto `layout.siderBg #0E0D0B` (dark). Ley cero-delta en sus 3 partes
verificadas: (i) cada literal == la resolución en cadena del alias de base en
ese modo (la del card a dos saltos); (ii) base byte-idéntica (1192/1231/468)
y mode blocks cero removed/changed — puros agregados; (iii) artifacts diff =
exactamente las 4 líneas en las DOS patas (facade/artifacts y styles/).
**El censo de throws APCA: 16 → 0, con 0 regresiones** (22 → 5 fallos en las
8 suites; 14 totalmente verdes). Techo de bytes respetado SIN tocar anclas
(comentarios comprimidos + retiro de 3 bloques `@placeholder` cuyo governor
declaraba la falsedad que D-1 refuta — neto −67 B; el retiro es el
presupuesto, no cosmético). T0: 4 → 4 asimetrías, card 3/3, siderBg 3/3.
Los 2 pines re-anclados (idiom A2-16); `semantic-typography` re-pineado contra
el árbol final (19/19, protocolo de Sonnet). **La cadena blocker→ruling→
re-emisión funcionó como proceso:** los 61 receipts stalearon (58 arrastran
un artifact vertical), Opus se negó a emitir desde una invocación no probada
(clase falso-verde — bien), el ruling DT resolvió por invariancia de
construcción (ningún stop receipteado escribe los 4 leaves restituidos —
cerca verificada control × keypath por Sonnet), y los 61 se re-atestaron
sobre artifacts existentes con verificación por archivo: 61/61 VALID,
CONSTITUTION_READY. **Registrados para después:** D-1b (el quinto escudo:
`rottay OVERLAY.chrome.sidebar.footerBg` + `OVERLAY.chrome.table.headerColor`,
drenados por `8f58229e3`); 2 defectos de font-pack DESENMASCARADOS por el
fix (capability-reachability Fraunces + capability-propagation:573 — eran
rojos antes, el throw los tapaba); 3 pins rancios más del backlog (~56
restantes tras CI-1+D-1: 18 clase drenaje cerrados + sentinel + los pins de
CI-1).

**F4B-11 — typography.pairing: el "apagado total" era ARTEFACTO DE MEDICIÓN
(diagnóstico Opus, 2026-08-24; pausa levantada, cierre en vuelo).** Sonnet
midió `typePairing` parcheado DENTRO del BrandTheme (la selección muere en
`:889/:891`, donde la familia literal del tema pisa la expansión — conducta
querida) y reportó apagado total en las 3 verticales. Con la forma REAL de la
sonda (wiring literal del CLI: `loadCompilerArms` + `loadStaticBaselines` +
`verticalDefaultMode` + `lowerStop`), el stop viaja como `tenantPatch` y el
piso escribe DESPUÉS (`:1094`, único escritor posterior a `:889`): **el
estático mueve los 2 canales en los 4 stops de las 3 verticales, 12/12**.
H-2 pasa en AMBOS brazos sin excepción (las colisiones intra-pairing
`technical.heading==sober.heading` / `technical.base==geometric.base` son
reales pero cada par de stops se distingue en al menos un canal), y la
paridad entre puertas es **24/24 byte-exacta**. La ley "an explicit family
still wins" cubre la familia explícita DEL TENANT contra la selección de
pairing DEL MISMO TENANT (el texto se declara DB-only; el commit que la
escribió, `cfd42c2df`, no tocó el compilador estático — la ruta no existía):
**no hay que acotar la ley ni tocar el compilador**. Confirmación colateral
valiosa: el brazo DB funciona POR E-1 — antes de E-1 la ruta DB tenía la
forma A (el tema resuelto lleva las literales del vertical + el typePairing
del tenant, y moría en `:889`); el piso que E-1 instaló es lo que lo salva.
**Lección de vara asentada:** medir SIEMPRE con la forma real de la sonda
(wiring copiado del CLI), nunca con una llamada armada a mano — un resultado
de instrumento reportado contra otra forma de llamada es un artefacto, y el
costo de la pausa es real. Corolario para briefs futuros: cuando un control
"mide cero" en un brazo, la primera pregunta es la forma de la llamada, no el
compilador.

**Cluster DesignSystemProvider — DIAGNOSTICADO (Opus, 2026-08-24): NO es P0
de producción; clase ENTORNO-TEST / fixtures rancios.** El provider NO está
roto: **falla cerrado a propósito** contra la barrera de autoridad
(`358ce9188`, 2026-08-14): un `tenantConfig` con pintura en runtime
(`brandTheme`, `personality`, `tokenOverrides`, `branding.*Color`,
`appearance`) SIN artifact compilado verificado y montado es rechazado →
renderiza `LoadingScreen` (que es `null` → body vacío). La conducta está
DOCUMENTADA en el árbol (`ui/surfaces/foundation/common/test-utils/index.tsx:14-32`)
y las suites de surfaces YA se migraron al patrón honesto ("las suites
aserten anatomía, no pintura de tenant; la que necesite pintura compilada
monta artifact verificado y declara `visualAuthority`"). **Los 4 archivos
del cluster son los que quedaron sin migrar** (les entregan pintura cruda
sin artifact). Severidad baja-media: el fallo tiene SEÑAL (throw en
development, `console.error` una vez fuera). Ninguna app de ESTE monorepo
monta el provider en runtime (las 21 menciones del showroom son literales
de código; la sonda no lo monta); las apps consumidoras (repos aparte)
quedaron fuera de la medición — registrado para F8. `SvgRenderers:711`
(radio no uniforme) es defecto de geometría aparte, registrado. **CI-3
(encolado): migrar los 4 archivos al patrón documentado** (Sonnet). **Dos
preguntas de producto registradas para F5:** (a) el predicado de la barrera
es por PRESENCIA en `brandTheme`/`appearance` pero por CONTENIDO en
`branding`/`tokenOverrides` — medido: si fuera por contenido en los cinco,
las 2 fallas de density desaparecen sin tocar el test y ninguna config con
pintura real queda admitida; (b) `LoadingScreen = null` convierte un error
de config de tenant en página en blanco (¿degradar al baseline del vertical
en vez de no montar?).

**CI-3 — los 4 archivos del cluster migrados (2026-08-24; Sonnet; postaudit
Fable: ACCEPT).** Tres migrados por la forma honesta: ChartPalette (expected
al scheme `default` — el alcanzable; propósito intacto: paleta uniforme
entre las 5 familias), SvgRenderers `:388` (`branding.primaryColor` retirado
— ninguna aserción lo lee; corrección a la lectura "load-bearing" del
diagnóstico, con evidencia), icon-profile-ssr-acid (vía
`IconExpressiveProfileContext` directo — el seam público real que la suite
existe para probar; los tenants con pintura completa quedaron SÓLO en el
describe de llamadas puras que nunca renderizan). `density-authority-equivalence`
queda ROJO INTENCIONALMENTE (clase D: el config con pintura es el sujeto;
arreglarlo exige el cambio de predicado — pregunta de producto F5) con su
comentario de protocolo. `SvgRenderers:711` (geometría) registrado aparte.
**Hallazgo nuevo de Sonnet (más allá del diagnóstico, verificado):**
`brandTheme` y `personality` se rechazan INCONDICIONALMENTE incluso con
`visualAuthority: compiled-artifact` declarado (`admission/index.ts:783-787`)
— el camino (b) no existe para esos dos; `appearance` sí puede coincidir con
el artifact y pasar. Refina la pregunta de producto (a) de F5: la asimetría
del predicado es aún más profunda de lo medido.

**D-1b — el quinto y sexto escudo restituidos (2026-08-24/25; Opus; postaudit
Fable: ACCEPT — "las seis hojas de la clase escudo-de-overlay quedan
restituidas").** rottay `OVERLAY.chrome.sidebar.footerBg #F4F4F3` (drenado
por `8f58229e3`; mi brief traía el literal al revés — `#0D0D10` era la BASE,
el overlay light llevaba `#F4F4F3`, coherente con rottay dark-default;
corregido por medición del implementador) y rottay
`OVERLAY.chrome.table.headerColor #6B6B6B` (drenado por `3393f70d4` — **otra
ola, F4A-6**, mismo mecanismo: la lección asentada es que **F4A-6 también
probó cero-delta del lado del vertical y también retiró un escudo del lado
del tenant — es un patrón de olas, no una ola**). Ley de 3 partes verificada
por hoja; T0 byte-idéntico; techo intacto (−161 B, pagado por el retiro de
2 `@placeholder` con la falsedad refutada, patrón D-1). **515 aserciones:
3 → 0 rojas, 0 regresiones.** Los 3 pines resueltos cada uno por su verdad:
2 re-anclados (idiom A2-16 + commit nombrado; la restitución NO los volvía
verdes — pinean literales de BASE, no de overlay); **pin 1 = RETIRO** (las 4
aserciones premium están adjudicadas muertas: SEV-DEAD-21 con test verde que
aserta el retiro + la top-line con OWNER_DECISION que prohíbe inventarla; el
invariante `--bithire-` conservado; el `it()` renombrado para no mentir);
semantic-typography rottay re-pineado con cross-check (los otros 2 verticales
intactos). **Adjudicación de secuencia (orden (i) de CI-1, segunda
aplicación):** D-1b commitea sus 7 archivos SIN la cadena derivada
(rebuild/producers/receipts) — deuda en tránsito declarada que salda
F4B-12 al cerrar (su secuencia ya incluye la re-emisión total; en su cierre
todo lo atestado está commiteado en D-1b o en F4B-12). Opus declinó
correctamente re-derivar `producers.json` con el registry de F4B-12 en
vuelo (habría horneado trabajo ajeno en su atestación — la clase que el
programa mata).

**F4B-12 — postaudit Fable: REJECT local (texto) + RULING DT de anchura:
ENSANCHAR a los 6 canales (2026-08-25).** La mecánica del packet estaba bien
(keypath `chrome.sidebar.tone` contra `SIDEBAR_TONE_FIELD`, canal
`--ds-sidebar-item-color-active`, drill fail-closed que parsea el fuente —
nunca import, por el ruling de capas; 9 corridas verdaderas para lo que
medían; la predicción B-2 de Fable cumplida: drill 6 disparó con la segunda
intersección real — la cerca funcionando como se diseñó). Lo que no cerró:
**la prosa declaraba 6 canales mientras los artifacts prueban 2 declarados**
(los otros 4 tone leaves nunca se movieron — el harness sólo aplica lo
declarado): la clase "medición correcta, prosa inventada al redactar el
asiento", por segunda vez en el programa (R-2/F4B-10). **RULING DT: (a)
ensanchar** — la autoridad del control ES la tabla cerrada de 6
(`SIDEBAR_TONE_LEAF_FIELDS`) y el objetivo del programa es controles que
gobiernan múltiples canales; declarar 2 de 6 sub-declara la superficie real.
El fixture ya lee los 7 (6 del tono + el vecino itemColor como medición
directa), el drill ya fija declarados ⊆ tabla: se re-corren los 9 escenarios
con los 6 declarados (evidencia causal REAL — no re-atestación) y el testigo
del vecino pasa a probar exactamente lo que dice (los 6 del tono se mueven,
el vecino no). Correcciones de texto asociadas: F2 (layout-sidebar.css SÍ
existe — es el skin de geometría; la evidencia correcta es que no produce
ninguno de los 6 canales del tono ni los 3 sockets fantasma), F3 (la tabla
de rangos colapsa NO porque los verticales no autoren leaves — los 3 autoran
los 6 tone leaves — sino porque `tenantAuthoredPaths` lleva SÓLO el path del
stop: ningún leaf es tenant-authored — la ley B-2), F4 ("imports" →
"parses"), F5 (62 → 72 re-stamps). Nota de vara de Fable asentada: un
chequeo mecánico de consistencia manifest-vs-receipts (canales declarados
vs glosas numéricas) atraparía la mitad de esta clase — entra en el diseño
de CI-2. Y atribución pendiente de verificar: `capability-propagation`
(rojo del backlog desde D-1) quedó verde con este registry en el árbol — si
el fix del wildcard es la causa, ese rojo se cierra con este packet.

**F4B-12 — navigation.sidebar-tone CIERRA SOURCE_BOUND (2026-08-25; Sonnet;
postaudit Fable: REJECT → REJECT 2 → REJECT 3 → ACCEPT final, los 3 de texto,
ninguno de mecánica).** Keypath corregido (`chrome.sidebar.*` wildcard roto
→ `chrome.sidebar.tone`, con drill que parsea `SIDEBAR_TONE_FIELD`/
`SIDEBAR_TONE_LEAF_FIELDS` del fuente del compilador y asierte igualdad —
nunca import, por el ruling de capas) y canal corregido
(`--ds-sidebar-item-color` → `--ds-sidebar-item-color-active`, el typo del
sufijo). **RULING DT de anchura: la declaración se ensancha a los 6 canales
reales del tono** (la tabla cerrada `SIDEBAR_TONE_LEAF_FIELDS` — el objetivo
del programa es controles que gobiernan múltiples canales; declarar 2 de 6
sub-declaraba la superficie real) y los 9 escenarios se RE-CORRIERON con
evidencia real: 9/9 limpias, H-2 ambos brazos sin excepción (los 3 tonos
pueblan los 6 canales — no hay preset vacío como elevation/soft), restore
exact, y **paridad por modo: 18/18 comparaciones byte-exactas, no-movers
incluidos** (2 benignos: `--ds-sidebar-text` en bithire-subtle y
`--ds-sidebar-bg` en evnto-subtle — la receta subtle resuelve al mismo valor
que el vertical ya autoraba: la clase bithire/sober, reportada con ley, no
negada). **La predicción B-2 de Fable cumplida:** drill 6 disparó con la
segunda intersección real (`navigation.sidebar-tone -> chrome.sidebar.tone`
— el sitio sidebar del compilador consulta exactamente ese field; la tabla
de rangos colapsa a tono-gana porque `tenantAuthoredPaths` lleva SÓLO el
path del stop — la ley B-2, no porque los verticales no autoren leaves: los
3 autoran los 6). El testigo del vecino (`itemColor`, medición directa no
declarada) prueba ahora la superficie real completa: los 6 del tono se
mueven, el vecino nunca. Ripples mecánicas declaradas: productores reales
corregidos en internalChannels (menu.css, app-shell.css — el productor
anterior era inexistente; `layout-sidebar.css` SÍ existe pero es el skin de
geometría y no produce ninguno de los 6 ni los 3 sockets fantasma) y 3
entradas PRESCRIPCION de cascade/roots retiradas (su terminalReach prohíbe
channels públicos estructuralmente). **Lección de vara (3 REJECTs de texto
en UN packet, todos la misma clase): mecánica correcta, prosa inventada al
redactar el asiento** — tercera instancia del programa (R-2, F4B-10, acá);
el chequeo mecánico manifest-vs-receipts (glosas numéricas contra conteos
reales de artifacts) va al diseño de CI-2 CON ESTE CASO como fixture, y la
nota de vara de Fable (su segundo REJECT no barrió el objeto entero;
certificado de lista cerrada del tercero) queda como forma de los deltas:
barrido total o no hay delta. capability-propagation verde con atribución
honesta (su mutator escribe directo, no via registry — NO es downstream del
fix; documentado así). Cierre en SOURCE_BOUND por la misma nota de anatomía
que F4B-11 (el bloqueo propertyGroups ya registrado como dependencia). Con
este commit, la deuda de cadena derivada que D-1b dejó declarada queda
saldada exactamente como la adjudicación de secuencia lo ordenó.

**El "hang" de program-check.test.mjs — DIAGNOSTICADO (Opus, 2026-08-25;
directiva del owner): NO SE CUELGA. Tarda 6m18s, y 5m43s son un `spawnSync`
mudo.** El punto del apagón no es el `await import()` del test 45 (pasa en
59 ms solo): es el drill A11 de transporte (`:1479`), que corre 3 suites por
`spawnSync` y cuyo costo entero es `cascade-producers.test.mjs` (217 tests,
334 s, re-derivando un inventario de 10 MB / 215.942 leaves). `spawnSync`
bloquea el hilo principal: el reporter no puede vaciar su salida y la última
línea visible es la del test 44 mientras el 45/46 ya pasaron detrás del
bloqueo — TODA la ilusión está en esa diferencia entre "dónde se detiene la
salida" y "dónde trabaja el proceso". Con cota de 30 min el archivo TERMINA
(378 s, 48 tests, 47/1). Todo nació en `c269fb348` (2026-08-22, PRE_F4B
Lote A: el inventario de 10 MB + la suite de 217 + el drill de transporte en
la misma entrega); "intermitente → siempre" es el momento en que las cotas
de los observadores bajaron de ~6,3 min. **Y el "hang" tapaba un rojo real**:
el drill falla cuando un carril vecino edita `.ts/.tsx` durante la corrida
(contención medida: los 2 rojos T-21/TC-7 se reproducen con un build en
vuelo; en ventana tranquila, 217/217). **RULING DT (packet CI-4, chico):**
(1) `timeout` + `maxBuffer` explícitos en el `spawnSync` (que un suite
trabado FALLE CON SU STDOUT en vez de parecer colgado — ataca el síntoma del
owner); (2) progreso por `stderr` por suite antes de cada spawn (los 5m43s
dejan de ser silencio); (4) el drill declara que exige árbol limpio y lo
DICE al fallar (la contención deja de leerse como defecto del inventario —
es el estado normal de un worktree con lanes). (3) derivar una vez a nivel
de módulo queda registrado para cuando se mida cuántos de los 217
re-derivan (sin medir, no se toca). CI-4 va a Sonnet tras F4B-12.

**CI-4 — el drill A11 endurecido (2026-08-25; Sonnet; postaudit Fable:
ACCEPT con validación de fuego real — su propia corrida ejercitó la rama de
FALLO y el diseño funcionó de punta a punta).** Un archivo
(`program-check.test.mjs`): (1) `timeout: 900_000` + `maxBuffer: 64MB` en el
`spawnSync` (15 min = 2,5× los 334 s medidos) — un suite trabado FALLA con
su stdout en vez de parecer colgado; (2) progreso `[a11] running/exited`
por suite — los 5m43s dejan de ser silencio (con la precisión honesta
medida: el runner SÍ captura stderr como comentario TAP pero lo vacía de
inmediato, que es lo que el objetivo necesitaba; el comentario de código
quedó corregido al mecanismo medido, no al asumido); (3) `CONTENTION_NOTE`
en ambos mensajes de aserción: el drill exige árbol quieto, y un rojo con
un carril escribiendo fuente es contención esperada, no defecto del
inventario (causa medida citada: T-21/TC-7 reproducibles con build en
vuelo; 217/217 en ventana tranquila). Verificado: 48/48 dos veces (~6 min
cada una, progreso visible), timeout greppeado, render sintético del
mensaje. El hallazgo de entorno que arrastraba el programa desde F4B-11 (6
corridas, 1 verde) queda cerrado con causa medida, síntoma corregido y
fallo que dice la verdad.

**F4B-13 — motion.dial CIERRA SOURCE_BOUND (2026-08-25; Sonnet; postaudit
Fable: REJECT local de 1 frase del docblock → ACCEPT final).** Keypath
corregido (`motion.*` wildcard roto → `motion.{intensity,durationScale,
ambient}`; ambient sin canal por diseño — "intentionally emits no CSS custom
property"). **El unwrap de motion en `tenantPostureFloors` completa E-1:**
la reaplicación-al-final del piso del tenant ahora cubre motion
(`patch.motion?.value ?? patch.motion` — cubre el patch envuelto de
migrateV1 y el no envuelto de la sonda), con cerco ESTRUCTURAL (unit test de
la proyección + mutación negativa + invariancia de las 3 verticales — la
corrección W-B de Fable: el flip conductual no existe, la selección del
tenant ya gana hoy contra motion autorado en base). **12/12 corridas
receipteadas** (4 stops × 3 verticales: intensity {0.3, 0.7} +
durationScale {0.85, 1.25}, todos dentro del envelope HARD gate 0..0.8 /
0.75..1.35), ambos brazos, paridad byte-exacta, restore exact, negativos
held. **Hallazgo nuevo:** evnto SÍ autora motion — vía
`EVNTO_CANONICAL_MOTION` (preset congelado, `intensity: 1.5` FUERA del techo
`MOTION_DIAL_BOUNDS.intensity` 0..1, contenido a `1` por el clamp del
compilador: la identity más informativa de las 3, muestra el mecanismo de
bounds conteniendo un valor autorado); y el segundo censo de identity sobre
los 3 controles ya cerrados salió limpio (el patrón `const X = {...};
field: X` no coló nada en button-style/elevation-posture/sidebar-tone). El
identity stop queda documentado como hecho compilado, NO receipteado (la
CLI exige ≥2 brazos para pass y identity es estático-solamente — precedente
`palette.seeds`'s `primary/identity`). `evidence` del registry corregida
(button.css → alert.css: el primero sólo lee canales derivados, el segundo
es el idioma de referencia citado por otros skins). Bounds forma 2 (stops
con valor propio dentro del rango de su campo; `domain.bounds` de
intensity representativo + nota de durationScale; la extensión de schema
por miembro registrada para después). El REJECT de Fable fue de vara fina:
el docblock atribuía a `resolveTenantPosture` un unwrap que no tiene (el
lector lee `patch.motion` AS-IS; por eso la proyección debe entregarle la
spec DESNUDA) — corregido con cita de línea. Cierre en SOURCE_BOUND por la
misma nota de anatomía (propertyGroups sin ratificar). 93/93 VALID,
CONSTITUTION_READY, probe 228/0, provenance 24/24, producers --check OK.

**FASE-A — la rama `mode:'advanced'` de la sonda construida (2026-08-25;
Opus; postaudit Fable: ACCEPT).** El bloqueo sistémico del preflight §2 se
cierra: la puerta DB de la sonda ya no hardcodea `mode:'simple'` — el modo
se decide por PREFIJO del `dbTenantThemePath` declarado
(`appearance.general.` → simple byte-idéntico; `visualFoundation.` →
`{mode:'advanced', visualFoundation}` + segundo argumento
`{verticalEnvelope}`; cualquier otro → `IngressSpaceError` NO publicable
como exclusión, re-lanza — el conjunto cerrado R-2 intacto). El envelope
sale del módulo publicado (`getTenantThemeVerticalEnvelope` vía
`loadCompilerArms`, mismo assertDistFresh), fail-closed en las dos
direcciones (cargar y usar). El record en provenance:
`compileOptions.{verticalEnvelope:{verticalKey, digest}}` — con la decisión
de que el digest se LEE del artifact (la ley B-2: las dos mitades no pueden
discrepar; `sha256Utf8` no está publicado y una segunda implementación sería
segunda autoridad). El sello de scope de R-2 queda con una sola extracción
de `general` y su condición palabra por palabra. **Invariancia del espacio
simple probada por tres vías: 36/36** (el compilerInput es idéntico al que
armaba la rama vieja; el compilador real da variables/modeDeltas/css
byte-idénticos con `{}` y sin segundo argumento; y ninguno de los 90
receipts simple + 3 data-field-delta del runner DATA — que no pasa por
`toCompilerInput` — recorre la rama nueva). **Censo asentado: la rama no
tiene consumidor vivo todavía** — los 7 controles advanced declaran 0 stops
o 0 canales (responsive.posture tiene 3 stops pero 0 canales CSS por ser
data-only): queda probada por drills (con manifest sintético declarado),
no por una corrida real — declarado, no insinuado. La re-emisión de los 93
por el mecanismo existente de Sonnet (re-atestación + verificación por
archivo; staleness = pura frescura de digest). Drills A1-A7 nuevos; el
negative drill viejo del throw genérico reemplazado por el tercer borde
nombrado. Suites 234/234, build EXIT=0, 0 trackeados movidos. Con esto, la
puerta DB de los 6 controles PRO (`visualFoundation.*`) queda
estructuralmente alcanzable — su calibración es la cola que sigue.

**FASE-B — la rama `font-stack` + la ley del brace-en-medio construidas
(2026-08-25; Opus; postaudit Fable: ACCEPT — "el instrumento queda con sus
dos fases cerradas").** La rama escribe el string del stack TAL CUAL (sin
trim ni normalización — trimear bajaría algo que la puerta DB nunca
aceptaría) y `isLowerableFontStack` **replica `isSafeFontFamily` paso por
paso y en el mismo orden** (longitud/trim → var() sólo font-pack → pack id
contra la lista cerrada de 6 → charset sobre el residuo): **coinciden 8/8
con el validador del producto en la puerta DB**; el brazo estático acepta
los 8 (la asimetría de validación queda registrada en su familia, alcance
honesto: autor de vertical / caller del compilador — no tenant). Las 3
constantes copiadas (no importadas — el harness corre en tests que no
cargan dist) y FENCEADAS contra las publicadas por drill (la deriva se pone
roja en vez de silenciosa). **La corrección vinculante de Fable, verificada
por Opus antes de escribirla y fenceada contra su reintroducción (drill
B4): la asimetría es de EMISIÓN, no de movimiento** — el estático EMITE el
heading sin moverlo (el literal del tema sobrevive el merge por-campo); la
DB no lo emite (delta puro); la paridad reclamable es base byte-idéntico en
ambos brazos con el heading declarado ciego por emisión. Y el hecho (1): el
canal emitido NO es el string escrito (el compilador inserta el fallback de
script) — la aserción es discriminación + contiene-la-familia-líder. **La
ley del brace-en-medio:** un brace-set cuyos miembros comparten TODOS el
último segmento es indiscriminable por construcción para cualquier rol →
throw que nombra la ley (no el síntoma), medido en las DOS rutas de
chrome.anatomy (estática y DB); NO publicable como exclusión (defecto de
manifest, no stop inadmisible): re-lanza y rompe la corrida; el conjunto
cerrado R-2 intacto. Invariancia probada por DOS vías independientes
(ningún control receipteado usa kind font-stack; ninguno de los 13 tiene
brace con sufijo compartido). Suites 240/240, build EXIT=0, 93/93 VALID por
re-atestación de Sonnet. Con esto, typography.families (el control más
barato de la cola: ambos keypaths limpios) queda desbloqueado para su
calibración — F4B-14 sigue.

**F2A-0 ✅ `fb8ff25b6` (Sonnet, medición mecánica; verificación DT propia;
postaudit Fable: ACCEPT con reproducción numérica por los comandos del propio
baseline).** Censo medido de las 34 asimétricas + los 6 ítems del residuo F2,
en `docs/f2a/medicion-f2a0/{data.json,baseline.md}`. Reproducen exacto:
Σassignments 261 = 95+96+70; 34 = 16 con-cero + 18 sin-cero; las 10 `por-crear`
inertes (0 declaraciones, 0 lectores ×3 temas); `--ds-color-primary` 6
declaraciones literales. **Dos cifras históricas mueren oficiales (Fable, nota
2):** el "11/16" de evnto (real: **16/16**) y el "42" de `tier.page.fg` (real
hoy: **13 canales + cabeza**, `#A0A0A5` en rottay; el árbol se movió desde
F4A-0 — quedan supersedidas por este packet, no re-citar). El "15" del "6+15"
de `--ds-color-primary` tampoco reproduce bajo 3 lecturas (§A.2 del baseline).
El par border/border-primary ya NO está invertido en evnto: los tres temas
declaran `--ds-color-border-primary: var(--ds-color-border)` en base (rottay
:343, bithire :273, evnto :114). **Hallazgo estructural (§A.3):** assignment
del catálogo ≠ declaración del artefacto (ej. `alpha.ladder`: assignments 2/0/0
con 0 declaraciones en los 3). **Material de clasificación para F2A-1 (medido
por raíz en data.json):** 7 raíces `por-crear` inertes (0d/0c en los 3 temas);
8 con declaraciones pero 0 consumidores; `tier.overlay.border` con consumidores
reales (2d/9-80c — caso compensación, análisis profundo); `effect.intensity`
1d/0c ×3 con assignments 0/1/0 (patrón default-compartido + override bithire).


defecto de integración del cierre F4B en corrección (2026-08-26; DT Kimi K3).**
Tras el cierre de F4B (`44c5883f9`) se abrió F2 asimétrico: el DT reprodujo el
censo contra `root-catalog.json` (16 raíces con tema en cero + 18 asimétricas
sin cero = 34; Σassignments 261 = 95+96+70 ✓; dato corregido: evnto está en
cero en las 16, no 11/16 como decía una cifra histórica) y despachó **F2A-0**
(Sonnet; medición mecánica de las 34 + los 6 ítems del residuo F2; write-set
`docs/f2a/medicion-f2a0/`; entrega con reporte + señal). El owner tomó las dos
decisiones pendientes (§12, 17 y 18): evnto dark `textPageColor = #A8A898`
(desbloquea T0 dentro de esta fase) y el seed del tenant teñirá todos los modos
(implementación F5; cierra la pregunta de producto de la clase
`OPEN_VERTICAL_CASCADE_DEFECT`). **C5 (ABIERTO):** una auditoría externa del
owner (Codex) encontró un defecto real de integración en el commit de cierre
F4B-17B — el comentario de `capabilities/index.ts:611` afirmó que
`derivedChannels` tenía UN SOLO consumidor (generator :278), falso en lo
material: también lo consumen `controls-catalog` (:147, digest de vista),
`tokens/catalog` (:940 ss., seeds EXACT del impact-map) y el census; los tres
gates (`controls-catalog`, `tokens-catalog`, `customization-surface-census`,
todos `[blocking]` en gates:ci) quedaron FAIL-stale en el commit de cierre y la
batería del DT no los incluía. Verificado por el DT contra el árbol, no de
palabra (los tres FAIL reproducidos). Triple falla asentada: comentario del
writer (grep-ceguera: la afirmación "único consumidor" se verificó sólo en
`src/`), scope del auditor (misma limitación), batería de cierre del DT
(subconjunto en vez de gates:ci). **Leyes nuevas (efectivas ya):** (i) la
batería de cierre de TODO packet incluye `gates:ci` completo o, como piso, los
gates de catálogo/census cuando el write-set toca contratos/registry/manifest;
(ii) toda afirmación de "único consumidor/lector" exige grep citado sobre
`src/` + `scripts/` + `manifest/`. Corrección: packet C5 propio (preaudit
Fable → Opus → re-emisión declarada → postaudit → commit separado); la
adjudicación DT sometida a preaudit es α1: restaurar `derivedChannels` a sus 3
seeds reales y mover la superficie de calibración a un campo propio — la
decisión 15 conserva su INTENT (superficie de calibración estrecha; dominio
público 290 intacto) y se enmendará su formulación al cerrar C5.

**HITO F3 — VEREDICTO CODEX RECIBIDO E INTEGRADO (2026-08-27; relay del owner en
terminal; la consulta empaquetada era `/private/tmp/codex-f3-hito-consulta.md`).**
**ACCEPT del cierre técnico de la migración F3** — los 4 lotes (piloto `b2b2ad82c`,
R-3, cohorte 2 `32fdd4583`, C-02/C-02b `a118d3772`+`b24baabe5`) verificados por el
consultor contra el árbol: cambio productivo neto **+156/−33 en 8 archivos
source/tests**; el resto del diffstat por commit fue ripple derivado. **Queda
PROHIBIDO reauditar o reabrir esos lotes.** Respuestas a las 3 preguntas del paquete:
(Q1) el flag `includeRoleMatrix` se acepta como solución LOCAL — **no es patrón
general**: si reaparece la necesidad de factorizar un productor certificado, la vía es
corregir el validador (packet de tooling), no otro flag; (Q2) la forma de cierre
vale — F3 migración técnica 100% de su superficie real medida; el eje craft NO se abre
como pasada masiva sino como **cohorte productiva acotada** (contrato abajo), y
**antes de escalar craft a muchas familias se implementa la puerta mínima ejecutable
de paridad profunda de los tres themes** (la ley escrita no basta; la puerta tiene que
existir y correr); (Q3) C-02b bien orientado — el `0.125rem` residual queda como
margen absoluto clasificado en el punto de definición (ya ejecutado así) y presence
correctamente descalificado. **Crítica de eficiencia adoptada como ley operativa:**
cada microcambio mueve ~150 derivados → los cambios compatibles se JUNTAN en cohortes
y la cadena derivada se regenera **una sola vez por cohorte**, nunca por microedición.
**Un solo DT:** la terminal Kimi saliente quedó cerrada en esta sesión (verificado por
proceso: único `kimi` vivo = ttys004); su autoridad no vuelve. **Contrato obligatorio
ANTES de todo write craft (ley del siguiente frente):** familia/vertical concreta;
estados y dispositivos cubiertos; objetivo visual medible; ley de literales;
tenant-last; prueba de responsive/reflow; aceptación Fable (pre/post); una única
regeneración final. Routing confirmado: Sonnet = inventario/mecánica, Opus =
diseño/implementación de riesgo, Fable = pre/postaudit, Codex = consulta por cadencia.
**Progreso adoptado (sin mover):** F3 migración técnica 100% de su superficie real;
craft 0%; F4C ~3–5% (contrato escrito); F5–F8 0%; F9 0/5100; total **62%** ingeniería
/ ~43% comercial. **Cola inmediata:** (a) packet line-height bithire por la vía
preservante — `--ds-input-md-line-height` 1.5385 como ratio seed sin unidad (identidad
exacta, cero delta; el redondeo a 1.5 sigue siendo decisión del owner, ejecutable
después como cambio de un solo valor); (b) diseño de la cohorte craft #1 bajo el
contrato de arriba; (c) puerta ejecutable de paridad profunda como prerequisito de
escala. **Sin bloqueo del owner ni de Codex: la ejecución continúa ya.**

**F3 — MINI-LOTE C-02b CERRADO + ADJUDICACIÓN presence (2026-08-27; commit
`b24baabe5`; writer Opus; postaudit Fable: ACCEPT, con veredicto sobre la desviación
de receipts y verificación de la adjudicación presence).** La clearance de
`textarea.css:91` deja el literal fijo `1.75rem` y **deriva de la geometría que
reserva**: `offset + action-size × density-scale + 0.125rem` como FALLBACK del canal
(tenant-last intacto — un tenant que autore `--ds-textarea-clear-clearance` manda).
Default **byte-idéntico** (0.375+1.25+0.125=1.75rem), extremos del clamp cerrados
(0.5→1.125≥1.0; 3→4.25≥4.125); el margen residual no escala a propósito (respiro
absoluto, clasificado en el sitio). La forma superior a la recomendación del ruling
C-02 (el co-escalado naíf rompía el piso: 0.875 < 1.0 a scale=0.5). **El offset ganó
su declaración-seed una sola vez** (antes: `0.375rem` duplicado como fallback en dos
inset; ahora: una seed en el scope compartido, tres lecturas bare — ley de literales
cumplida en su forma fuerte). **Corrección a la lista de cadena (adoptada):** una seed
CSS nueva stalea `hooks-manifest.json` — la cadena de cierre incluye `hooks:generate`
y el re-ancla del ledger reads-adjudication (la fila graduada sale por ley FASE K,
2607→2606). **Ratchet 2171→2169 escrito POR ORDEN DEL GATE** (decrease-only sigue al
árbol hacia abajo; razón completa en `rootsExcludedNote`; drill 10/10) — es registro
de mejora, no re-ancla de hallazgo. Re-pins de contadores cascade-producers con
aritmética (+1 la seed nueva: 4873/10312/4586) en 13 sitios; 217/217.
**Desviación con veredicto Fable:** el writer re-firmó 134/134 incluyendo el
superseded (contra el ruling 2 de C-02) — el lote PASA sin rehacer estado (inocuo,
idéntico al aceptado en cohorte 2, declarado); **canon reafirmado: 133+1-declarado; el
próximo lote usa el tool C5 o el skip explícito; una tercera ocurrencia será defecto,
no nota.** **Adjudicación DT — `presence` DESCALIFICA para F3 (verificada por Fable
contra fuente):** `presence/index.tsx:107` interpola dato de instancia
(`${ring * 2}px` — dominio abierto) y `:112` un ratio sin clasificar (`* -0.3`); sin
skin ni ancla. Migrar exige gobierno nuevo (skin + stamps + socket + clasificación del
ratio), no traslado de pintura gobernada. **Con esto la superficie F3 genuina medida
queda DRENADA por completo:** cell-renderers ✓ (piloto), Typography/runtime ✓
(cohorte 2), Skeleton/Button descalificado (exigía literales nuevos), presence
descalificado (gobierno nuevo). Números: barrido 91 PASS/2 SKIP/0 FAIL + gates:ci
91/91 de la auditora; ratchet 2169; receipts en el estado auditado; docs-engineering
`3db1c0d` (governance→operational del offset); GAT-07 `9dcb2b92…`. **Estado de F3:**
la migración de pintura agotó su superficie medida; lo que queda del frente es el eje
craft (§6, pasada Quiet Premium por familia) — su apertura como cohortes espera la
respuesta Codex del hito (consulta empaquetada 2026-08-27, relevo por el owner) y no
bloquea los pendientes del owner (line-height bithire: recomendación DT preservar
1.5385 como ratio seed). Porcentaje: **62%** ingeniería / ~43% comercial — la
superficie drenada era de un dígito; el movimiento de porcentaje llega con el eje
craft o con F4C, no con estas cohortes.

**F3 — MINI-LOTE C-02 CERRADO (2026-08-27; commit `a118d3772`; writer Sonnet;
postaudit Fable: ACCEPT con dos rulings).** El clear-button de
`skin/textarea.css:211-212` consumía `--ds-input-action-size`/`--ds-input-md-icon-size`
SIN el factor de densidad que sus gemelos cumplen (ley C-02: el icono se aprieta CON
el campo); el fix es la forma EXACTA de los gemelos (`calc(… *
var(--ds-density-effective-scale))`, cotejada carácter a carácter por la auditora),
en el idioma single-line del archivo. Default byte-idéntico (`calc(x·1)=x`);
compact/spacious escalan con el campo (la intención, no un freeze). **Ruling Fable 1
— la geometría de `:91` queda diferida con honestidad como C-02b:** la reserva de
clearance no co-escala; aritmética reproducida: botón 1.25rem + offset 0.375rem vs
reserva 1.75rem → margen 2px en default (pre-existente), solape desde scale>1.1,
overflow 2.375rem en el techo del clamp (3) — antes del fix el botón nunca escalaba y
el defecto lo enmascaraba. Co-escalar la clearance preserva el default por identidad
y cierra el extremo, pero cambia padding en densidades no-default = decisión de
diseño visible → entra por adjudicación, no de contrabando (queda en la cola §6 con
dueño). **Ruling Fable 2 — estado canónico de receipts: 133 frescos + 1
declared-stale** (`compound-editorial`, SUPERSEDED_BY_LIVE_FENCE, sin tocar): el tool
C5 lo salta a propósito y la validez de ese receipt la decide la cerca, no el digest;
la re-firma de la cohorte 2 (que lo incluyó) fue inocua pero no se repite. **Formato
canónico de asientos desde acá:** "receipts 133/134 válidos (re-firma quirúrgica
×133; 1 SUPERSEDED declarado, sin tocar)". **Defecto de proceso confesado:** el
writer regeneró censo+catalog pero salteó la cabeza de la cadena
(cascade-extract/consumability/producers) y los eslabones kimi/controls/freshness — su
memo decía "cadena una vez" y no era cierto; el barrido de cierre lo pescó (7 rojos)
y el DT recomponer la cadena entera en orden canónico antes del verde final. **La
batería de cierre volvió a probar su valor: el barrido completo desde gate 0 es lo
que atrapa una cadena medio-corrida.** Números: barrido 91 PASS/2 SKIP/0 FAIL +
gates:ci 91/91 de la auditora; focales Textarea 52/52, Input skin 7/7,
density-scale-parity 10/10; ratchet 2171; engine-token-audit 822 sin mover; censo:
`--ds-density-effective-scale` 319→321 lecturas css (exactamente el fix);
docs-engineering `f842cc3` (1 vista); GAT-07 resellado (`7fa7b09f…`). Próximo paso:
C-02b (adjudicación de la clearance) y la evaluación de `presence` (2 sitios, último
candidato sin verificar de la clasificación); después, revisión Codex de hito (van 4
lotes desde la última: piloto, R-3, cohorte 2, C-02 — la cadencia 3–4 lo marca).

**F3 — COHORTE 2 CERRADA (Typography/runtime; 2026-08-27; commit `32fdd4583`;
writer Opus en 3 vueltas; preaudit Fable del diseño: DEFECTS-2 de enunciado,
incorporados → ACCEPT; postaudit Fable del diff congelado: **ACCEPT**).** La
matriz de rol (las 7 propiedades `--ds-type-<role>-*`) sale del inline del
engine modern: la pinta el skin sobre `data-text-style` (ancla ya estampada por
spread en los 4 exports — `typographyDataAttributes`), así que hoy el inline
SOMBREABA al skin en cada render. **La forma final es el flag
`includeRoleMatrix` (default `true`) en el options-bag del resolver
compartido**, y la historia importa: el diseño aprobado era factorizar en dos
productores; al ejecutarlo, `engine-token-audit` enrojeció (modern=1, rustic=1
contra baseline 0) y el writer lo reportó como "deuda heredada" — **refutado
por medición DT** (worktree limpio a HEAD: gate verde; bisección: engines a
HEAD + sólo el runtime nuevo → rojo: la causa era la factorización, porque el
lexer certifica `zeroPaint` re-contando el cuerpo AISLADO de la función
(`inline-paint-counter:804-808`) y **un productor certificado no puede delegar**:
la delegación queda opaca y suma +1 fail-closed). El ruling DT "no flag" (7b)
quedó **revocado por esa evidencia**; la cirugía del lexer quedó descartada para
esta cohorte (su fail-closed es ley de diseño explícita; si el patrón
"factorizar productor certificado" se repite, la vía es un packet de tooling
con drills propios). El docblock del flag cita el mecanismo para que nadie lo
deshaga (verificado por la auditora). **Pruebas:** 43.200 combinaciones del
resolver byte-idénticas vs HEAD con el flag en default (classic/rustic intactos
por medición, no por argumento); 2.160 escenarios con `false` (brazos idénticos;
las 7 claves ausentes SALVO `fontFamily`/`fontSize` cuando los brazos
`family`/`fluid` las aportan — aserción falsable); red focal **7 suites/141**
(sin `--project unit` — la corrección del preaudit) verde antes/después y
re-corrida por la auditora; 3 tests re-expresados afirmando contrato (ancla +
NO-duplicación inline, fallan en las dos direcciones), no debilitados.
**Re-ancla S-8 del DT con razón escrita:** los ordinales pineados de las 8 filas
`resolveTypeRoleStyle` se movieron +177/+354/+531 bytes (el flag + comentario
por call-site; la auditora recompuso 173+4=177 exacto); identidades invariantes
(control contrafáctico intacto); cascade-producers 217/217 en limpio.
**Números:** `gates:ci` **91/91 blocking** en corrida limpia de la auditora
(más los 2 excluidos de siempre); ratchet cascade-wiring **2171→2171**;
receipts **134/134** frescos con `artifactSha256` intacto; GAT-07 resellado por
el DT (`dac4fb3d…`); reconciliation re-proyectada (cifras invariantes);
docs-engineering **sin commit** (vistas regeneradas byte-idénticas — el lote no
toca tokens); perímetro 148 declarado y verificado exacto (lección del piloto
consumada). **Deuda diferida con dueño:** la restricción de delegación del
lexer queda documentada en el docblock del flag; su relajación (si se quiere) es
packet de tooling propio. **Próximo paso (cola §6):** el micro-fix C-02 del
clear-button de `skin/textarea.css:211-212` (consume sin el factor de densidad
que sus gemelos cumplen) con mini-lote propio; y la evaluación de `presence`
(2 sitios, el último candidato sin verificar de la clasificación). Porcentaje
sin movimiento: **62%** ingeniería / ~43% comercial (la superficie F3 genuina
era de un dígito; van 2 de sus sitios drenados).

**R-3 (Codex §1.4) — las autoridades de status narran el presente
(2026-08-27; DT Kimi K3, packet de la línea authority; commit `eb39afd86`).**
El punto 1.4 de la revisión Codex del cierre F2A — el único no listado entre
los integrados por el DT saliente — queda verificado y regularizado:
`checkpoint.intent.json` y la sección generada del README decían "F4B 5/20"
(la era pre-cierre); ahora renderizan la era F3 por la vía canónica
(`program-state --write`; `allowedLiteral` nuevo: el ordinal "decisión 18"
colisiona con `derived.inventory.byLayer.chart`, razón escrita; --check verde).
En `roadmap/registry.json` el campo `notes` de WO-CRA-23 seguía describiendo a
Codex como DT (era 2026-08-21): el script canónico no tiene vía para reescribir
`notes` en un WO in-progress, así que la verdad corriente quedó asentada por
`progress --note` (entrada 19, timestamped) y la falta de un subcomando `note`
en `scripts/roadmap/status/index.mjs` queda nombrada como deuda con ese dueño —
la próxima sucesión no debe heredar la trampa. `roadmap:check` OK (100 WOs).
`claimedBy: claude-modern-rescue` se conserva (handle genérico del pool, no
afirmación de actor). Batería del packet: program-state --check + roadmap:check
verdes; ningún gate de producto afectado (docs/status solamente).

**F3 — PILOTO v3 CERRADO (2026-08-27; commit `b2b2ad82c`; DT Kimi K3 terminal 2
— sucesión consumada en `1b260cd0c` + `fc5ae8d37` + nota docs del owner
`ec824e477`; writer Opus; postaudit Fable: DEFECTS-2 con cláusula de ACCEPT
condicionado — ambas condiciones cumplidas: el perímetro se re-declara en este
asiento y la cifra del comentario se corrigió a forma robusta).** El piloto
prueba el criterio de 3 términos punta a punta con cero-delta medido. **Veredicto
de los dos frenos (queda escrito):** `presence` descalifica (no existe skin
propio y NO estampa `data-size`); `Skeleton/compound/Button` descalifica — su
hatch CONSERVA la interpolación en TS (`:201`/`:218`), así que migrar `height`
no sacaba ningún sitio del pool, y migrarlo de verdad exigía crear un skin
modern + literales de hoja nuevos, prohibidos por la ley de literales de la
enmienda. **Ejecutado: `cell-renderers` (1 sitio, el caso de libro):** el mismo
objeto estampaba `data-size` Y calculaba `fontSize` inline con el mismo valor;
el TS deja de pintarlo y el skin lo pinta sobre el atributo existente — cero
stamps nuevos, cero cambio de contrato. **Condición Codex de commit (el
`13px`×3) resuelta por REMOCIÓN, no por clasificación ni centralización:**
medido por el DT y reproducido por writer y auditor, el 13px no reproduce la
seed de NINGUNO de los tres canales que respaldaba (bases 0.75/0.875/1rem =
12/14/16px) — era un literal defensivo hand-picked, inalcanzable en toda
configuración soportada (la cascada foundation es dependencia dura del skin
layer) y minoritario en el corpus (el idioma bare domina ~50:1; la cifra exacta
depende del criterio de conteo — tres mediciones independientes dieron
317/469/454-497 — por eso el comentario shipped cita rango+razón y no cifra
pineada: ley de citas). Centralizar exigía mintear un socket para un valor sin
seed; clasificarlo canonizaba el hand-pick; la remoción deja CERO literales — la
forma más conforme con la ley de literales. **Números del cierre:** ratchet
cascade-wiring 2171→2171; engine-token-audit 822 pendientes sin mover; receipts
**134/134 frescos** por recomputación fuera de banda del auditor (población
completa, no muestreo; `artifactSha256` intacto ×134; el compound-editorial
recuperó frescura de digest por el re-firma — su retiro de `evidenceIds` sigue
vigente en `manifest/controls/typography.families.json`); barrido fail-continue
desde gate 0 sobre el árbol commiteado: **91 PASS / 2 SKIP / 0 FAIL**
(reproducido por el DT tras el reseal, y `gates:ci` 91 blocking verdes por la
auditora); suite focal `patterns/runtime` **47/47** (writer, DT y auditor);
drills tooling 90/90 y 217/217 — **nota Fable asentada: las suites de drills NO
son concurrencia-seguras entre sí (216/1 flaky bajo concurrencia, verde en
limpio ×2): no correr en paralelo.** **Efecto colateral medido:** la fila
fantasma `--ds-font-size-` (la lectura interpolada del TSX) muere en el censo —
página font 71→70 nombres; `--ds-font-size-sm`/`-md` ganan 1 lectura css cada
uno. **Trinca cross-repo cerrada:** vistas docs-engineering regeneradas y
commiteadas en su repo (`9f822e8`, SÓLO el subárbol
`engineering/design-system/tokens/`; el drift preexistente ajeno intacto),
reconciliation re-proyectada por digest computado (cifras 4669/266 invariantes,
precedente F″), GAT-07 resellado por el DT (`dfcb1723…`, 2 corridas
deterministas). **Lección de orden re-asentada (costó un barrido):** el reseal
GAT-07 y la re-proyección van DESPUÉS de la última regen del writer — se selló
antes del micro-fix de comentario y la regen lo rompió; la secuencia correcta
quedó verificada al cierre. **Precisión de método (Opus, adoptada):** un edit
de comentario en un skin NO restalea receipts por sí solo (el archivo no está en
sus `sourceFiles`); lo que los restalea es el rebuild que el edit obliga (los
bundles `styles/*` embeben el comentario). **Perímetro congelado re-declarado
(condición 1 de Fable):** HEAD base `ec824e477` (nota docs del owner,
verificada) + porcelain 153 = 149 del writer + 4 del cierre DT (2 artefactos
gat-07 + seal + reconciliation); ninguna tercera mano. **Diferidos sin cambio**
(channel-liveness 49 findings, tenant-reachability 10/13, 2 gates excluidos,
propagación mode-aware de la decisión 18 — todos con dueño F4C/F5 según la
adjudicación de la puerta de entrada). **Codex §1.4 queda como packet propio
inmediato** (registry.json y checkpoint.intent.json narran momentos previos a la
sucesión; su regularización no se mezcló con este commit). **Próximo paso:** ese
packet de regularización; después la cohorte `Typography/runtime` (7 sitios — el
residuo que SOMBREA al skin en cada render) con su prueba de cero-delta propia.
**Ningún segundo lote F3 se abrió antes de este cierre**, como manda la
adjudicación de la puerta. Porcentaje sin movimiento: **62%** ingeniería / ~43%
comercial (el piloto es prueba de método, no drenaje de superficie).

**C5 CERRADO + F2A-1 ADJUDICADO (2026-08-26; DT Kimi K3; commits `fd58f8ba4`
gate-debt, `44b14f521` correctivo C5, docs-engineering `46960f2`; preaudit α1
Fable DEFECTS-1 corregido; postaudit Fable del diff congelado ACCEPT con una
enmienda de ley aplicada — vía sancionada de subida en el baseline
variant-parity).** Secuencia ejecutada tras el reinicio del host (estado
preservado en `/private/tmp/modern-rescue-post-reboot-c5.patch` antes de tocar
nada): re-ratificación α1 de Fable contra el diff vivo (semántica exacta:
`derivedChannels` = radio de impacto real de 3 seeds; `calibrationChannels` =
subconjunto atribuible de 2, guarda fail-closed con drills W-A/W-B) → Opus
corrige el defecto 1 (cita de ley con criterio explícito: 8 lecturas de código
+ 5 prosa generada, reconciliación 13=8+5) → Sonnet re-emite la cadena en 3
olas (manifests, census, reconciliation, kimi-preservation, controls-catalog,
tokens-catalog — 341 vistas, receipts 133/134 quirúrgicos, `producers.json`)
→ 2 rebuilds de `dist` del DT (lección de orden asentada: **build primero,
reemisión después** — la pasada paralela obligó a re-firmar receipts dos
veces) → drills 28/28 → **gates:ci 89/89 blocking verdes** + 2 excluidos con
owner. **La ley nueva (i) se probó a sí misma:** la primera corrida completa
de `gates:ci` desde la sucesión DT peló seis capas de espejos stale latentes
(era F4B/sucesión), todos clasificados AGED_EXPECTATION/regeneración con
traza por nombre a commits asentados — ledger reads-adjudication (delta = 1
contador de F4B-14), reclasificación mono/display (gap 10→8, adjudicación DT),
2 drills envejecidos Codex→Kimi (ahora derivados del contrato vivo),
producers.json, trío freshness, variant-parity, cra-12 (anchor 47→43
removal-only + pin corpus 4329→4338 = 9 altas legítimas F4B). Ninguna lógica
de producto tocada. La cadena derivada de cierre quedó medida entera:
censo → reconciliation → kimi → controls → catalog → **producers** →
trío freshness → variant-parity → cra-12, y gates:ci la audita completa.
**F2A-1** cerrado en la misma ventana: ley de cinco clases con
ACCEPT-para-adjudicación de Fable (2 rojos de tabla corregidos en v2) +
adjudicación DT (Q1: gobernado ≠ exento; Q2: `type.leading` vive en la capa
base — 27 lectores reales — y sale del set; Q3/Q4: propuesta de deuda muerta
**refutada por el consenso Opus** con evidencia — el censo de F2A-0 medía
consumidores sólo dentro de los 3 artefactos; sobre la superficie real las 10
tienen lectores de producción) + decisión 19 del owner (§12) que resuelve la
clase anti-puerta. Ley de medición corregida y adoptada: el censo de
consumidores barre skins + components + TSX + contratos TS, excluyendo
artefactos compilados. Tabla final de las 34 medida raíz por raíz
(`/private/tmp` memos reproducibles: opus-f2a1-tabla-medida). Lotes
encolados: A (10 inertes, catálogo), B (T0 `#A8A898`), C (4 cascada), D (4
anotación), E (4 ramp.seed por dec.18/F5), F (2 deuda muerta + 1 condicional
con A/B renderizado), F′ (anti-puerta: glass.recipe 12→6.96 aceptado +
fontSize 13px causal, con re-medición de los 2 controles en bithire).
Pendiente del DT: asignación de dueño para lineHeight/iconSize (decisión 19,
punto iii).

**F2A-1 Lote F-2 commiteado (2026-08-26, `fc1b8faf9`; re-auditoría Fable
pedida por el owner tras la 2.ª revisión Codex: ACCEPT condicionado,
condición cumplida).** El cero-delta del Lote F era verdadero sobre una
escena y la escena no era todas: la ruta de override DB plano no estaba en la
superficie de prueba. Restaurada la partición por-modo de
`--ds-surface-overlay` en bithire (portadora real; el validador APCA no
resuelve cascada — medido); `raised-foreground` sigue removido (único
duplicado real). Ley general asentada: **una prueba de cero-delta acota su
propia escena; el veredicto de deuda muerta nombra las rutas no cubiertas.**
Correcciones Codex aplicadas: pin duro + separación (no la forma débil) y
Reversión #1 registrada como reversión (observación Fable pendiente: nombrar
la "reversión de remoción commiteada" como vía propia en la ley del baseline
variant-parity en su próxima edición). Re-pins con aritmética:
provenance-acceptance 1231−3+2−1=1229; producers 10310→10311. Gates nuevos
blocking: dial-authority + su drill (91→93 en el manifiesto). **Punto ciego
de batería cerrado:** el barrido de lotes corría sin los 330 s del suite
tooling-drills; la batería de cierre vuelve a ser completa desde el gate 0 +
la suite focal del subsistema tocado.

**F2A-1 Lote F″ commiteado (2026-08-26, `9e57502af`; postaudit Fable: ACCEPT
limpio — el primero sin defectos del frente, con su propia corrida de
gates:ci reproduciendo 91/91).** Decisión 20 ejecutada entera: los 28
pendings del dial-authority cerrados (27 correcciones causales con cero-delta
a factor 1 por canal/modo + la excepción owner-visible de badge-radius con
prueba negativa); `pending` 28→0, `exceptions` 1. Semillas bithire
conservadas (cromas glass × dial; table-cell rottay por referencia); la forma
es la del sistema (factor en el sitio de declaración). Enmienda del
`spacing-rhythm-contract` adjudicada por el DT: lectura de ritmo en artefacto
lícita SÓLO con el factor (la premisa vieja "los artefactos no autoran ritmo"
murió con la decisión 20); la mordida intacta, con el episodio de la v1 del
writer escrito como drill (e). **Hallazgo estructural con dueño (condición de
asiento Fable):** los rosters receipteados de F4B nunca cubrieron los canales
donde los diales estaban bloqueados — por eso ninguna anti-puerta apareció en
una evidencia; límite del diseño de rosters F4B, dueño F4C/F5. Evidencia A/B
del glass producida para F4C (`/private/tmp/f3-glass-ab-evidence.md`): el
control de contraste gobernado pasa; la composición worst-case sobre backdrop
oscuro cae a Lc 40.4 (modelo aritmético declarado) — la pregunta sighted de
F4C es la frecuencia real de vidrio-sobre-oscuro; salida candidata: alpha
mínimo en el seed bithire (no revertir la decisión 20).

**F2A-1 Lotes A y B commiteados (2026-08-26; `dfc39efcf` A, `2509bdd3d` B).**
A: las 10 inertes congeladas con evidencia de cero-ocurrencia reproducida por
Fable; `type.leading` fuera del set (vivo en la capa base) con su cita
preexistente corregida dos veces (línea y nombre). B (T0, decisión 17): evnto
dark gana `textPageColor #A8A898` (7.77:1 re-verificado), la exclusión
`TEXT_PAGE_COLOR_MODE_ASYMMETRY` **muere por su causa raíz** (`textPageColor`
entra a `DEFAULT_PALETTE_KEYS` — olvido de nacimiento F4A-6, encontrado por el
writer al no poder morir la exclusión con la sola autoría; theme-iso 36/36 sin
ella; artefactos fuera del dark de evnto byte-idénticos). Asimétricas 34→33.
**Cláusula de provenance (postaudit Fable):** los 42 receipts F4B que poseen
el artefacto de evnto conservan provenance pre-T0 en tres estratos (el snapshot
`modes.dark.palette` sin `textPageColor`; el digest de `dist#evntoBrandTheme`;
el sha256 de la hoja baseline dark) — una re-corrida futura diverge en BYTES
sólo en provenance, con veredictos invariantes (el canal nuevo no entra en
declaredOutputs/calibration de ningún control, 0/20, ni en rosters negativos
ni lecturas de fixture). Registrado acá para que esa divergencia futura no se
lea como defecto. Hallazgo estructural asentado: toda recompilación de
artefacto rota `dist/build-stamp.json`, presente en los `sourceFiles` de los
134 receipts ⇒ el re-firma quirúrgico es parte fija del costo de cualquier
lote que recompila. Hallazgo estructural asentado: toda recompilación de
artefacto rota `dist/build-stamp.json`, presente en los `sourceFiles` de los
134 receipts ⇒ el re-firma quirúrgico es parte fija del costo de cualquier
lote que recompila.

**F2A-1 Lote F commiteado (2026-08-26, `96b610162`; postaudit Fable ACCEPT
con 5 correcciones aplicadas — 2 propias + 3 de la revisión Codex de hito,
todas reproducidas de primera mano).** Deuda muerta confirmada y removida:
`tier.overlay.bg` (ambos modos, duplicado byte-idéntico) y `tier.raised.fg`
(dark idéntico; light equivalente por valor). **Cláusula de provenance (Fable):**
los receipts F4B de escena bithire conservan snapshots pre-remoción con los 4
campos retirados (`compilerInput.brandTheme.surfaceRoles.*`, digest de
`dist#bithireBrandTheme`, shas de hojas baseline bithire) — una re-corrida
futura reproduce veredictos, no bytes; la divergencia es provenance-only.
Asimétricas 33→31 (31 simétricas; `tier.overlay.fg` queda condicional-anotada:
su remoción exige A/B renderizado del fallback `inherit` de
`semantic-surface.css:223`). **Leyes operativas nuevas asentadas:** (i) la
batería de cierre de TODO lote es el barrido fail-continue de los 74 gates
(adiós a las listas a mano — dos gates se habían escapado por eso:
root-checklists y fanout-facts); (ii) el pin de contadores congelados del
suite producers se re-ancla con razón escrita cuando un tranche lo mueve
intencionalmente (10313→10310, −3 = las hojas removidas), nunca en silencio;
(iii) el comentario fuente que acompaña una remoción dice "equivalente por
valor en reposo + comportamiento bajo override", nunca "texto idéntico" si no
lo es. Codex (revisión de hito, 2026-08-26): dirección correcta; adoptadas
sus dos mejoras — el instrumento de consumidores se corrige UNA vez al censo
AST canónico (universo core+showroom nombrado) antes de C/D/E, y la decisión
19 sube a `customization-model.json` + gate ejecutable dentro del Lote F′.

**F4B-17B + CIERRE DE FASE F4B — token-overrides alcanza su techo
estructural documentado y la fase queda con TODA la evidencia que el
instrumento actual puede producir (2026-08-26; Sonnet; dos STOPs honestos;
dos rulings del owner formalizados; postaudit Fable: ACCEPT con ruling
expreso + dos condiciones de admisión para el candidato F5).** La secuencia:
**STOP #1** (hueco de completitud heredado de F4B-17: declaredOutputs
declaraba 3 canales, el fixture leía 2 → `every()` insatisfecho →
`no-controls` para cualquier stop). **Ruling opción 2** (owner; verificado
por el DT antes de formalizar: `derivedChannels` tiene UN consumidor — el
generator :278 — y declarar 3 con 2 calibrables violaba la ley K "and
nothing wider" que PACKET K acababa de fijar): `derivedChannels` 3→2 con el
comentario de ley; el dominio público de 290 claves intacto (un tenant puede
seguir autorando `--ds-surface-card`; lo que se estrecha es la superficie de
ATRIBUCIÓN de calibración). **STOP #2** (estructural, la clase descubierta):
con la ley K restaurada, los 6 escenarios alcanzan `controlLiveness:
harness-live` con el canal moviéndose, y los 6 mueren SÓLO en
`ingressEquivalenceHeld` — **un control CSS-terminal con puerta estática
STRUCTURALLY_UNREACHABLE no tiene camino a un receipt pass:true**: un solo
brazo → `comparable:false` ("a claim that was never tested is not a claim
that held", `composition/run/index.mjs:511-512`); dos brazos → el guard
anti-false-INERT rehúsa el brazo estático sellado (Fable lo REPRODUJO EN
VIVO en el postaudit). **Ruling opción 3** (owner; análisis DT coincidente):
la ley del instrumento es CORRECTA y no se dobla para fabricar un verde;
`assessmentState` queda **SOURCE_BOUND como techo permanente de esta clase
bajo el instrumento actual**, documentado en `structuralCeilingNote` (triple
bloqueo con líneas + la evidencia que SÍ tiene el control: drill 7 de PACKET
K end-to-end contra el compilador real, las mediciones F4B-17, el sello
censo+conducta, los 6 harness-live — como medición, no como receipt; los
receipts pass:false se borraron: un harness-suspect no es evidencia).
`nextAction` → **`F5_INSTRUMENT_SEALED_DOOR_SINGLE_ARM_VERDICT`**, con las
**DOS CONDICIONES DE ADMISIÓN de Fable que el candidato llevará escritas**:
(i) la rama sólo admite veredicto de un brazo cuando la inalcanzabilidad del
OTRO brazo esté probada por censo Y conducta con artifact sellado (la vara
F4B-17, no una declaración); (ii) la equivalencia no se EXIME — se REEMPLAZA
por una ley de un-brazo explícita (guards, restore, discriminación
mono-brazo), diseñada y preauditada. El fix de la cita P3 quedó honrado
(líneas 65/82, ruta completa, sobreviviendo la regeneración — condición §5
del postaudit PACKET K). Re-emisión del universo (124 CLI + 9 DATA manual;
133/134 con el compound declarado). Gates (corridas DT): validador 133/134 /
0 non-fresh, CONSTITUTION_READY, 5100 intacto, program-check.test 48/48
(449 s), producers.json re-derivado por el DT, GAT-07 resellado por el DT
(`c2042dec…`), suites 122/122 + 26/26, instrumento byte-quieto. **Commit:
`afcfb5718`.** **Con este cierre, F4B queda COMPLETA en su forma honesta:
20/20 controles asentados (9 COMPUTED_VERIFIED + 10 SOURCE_BOUND +
chrome.families paraguas BY_REFERENCE) y cero evidencia alcanzable
pendiente — lo que falta para que los SOURCE_BOUND suban (ratificación
propertyGroup, calibración de celdas) y lo que falta para la clase
sealed-door (rama de veredicto) son trabajo de F4C/F5, no de esta fase.**
El techo estructural queda como PRECEDENTE de clase (Fable: "el próximo
CSS-terminal con puerta sellada ya tiene su forma"). Rulings del owner
asentados como decisiones 15 y 16 de §12.

**PACKET K — el kind `map-entry` EXISTE, vive en vocabulario y queda
cerrado (2026-08-25; Opus; preaudit Fable: ACCEPT con corrección §3; postaudit
Fable: ACCEPT con tres rulings expresos).** El sexto kind del instrumento:
rama en `ingressValueForStop` que valida el VALOR contra
`calibration.entryCatalog` (tabla cerrada `MAP_ENTRY_VALUE_TYPES`: hex-color /
color / font-family / number con min-max / visual-value — cada restricción con
su razón medida escrita) y devuelve `stop.value`; el DÓNDE lo sigue resolviendo
`resolveIngressMember` (walker intacto). Throw terminal reparado a 6 kinds
(P2 de Fable desde FASE-B saldado VERBATIM). **Adjudicaciones DT tomadas una
vez:** **(3.1)** `capabilities/index.ts:593` gana el brace
`tokenOverrides.{--ds-color-error,--ds-color-bg-overlay}` con guarda de 18
líneas — sin él los stops no bajan (el generator deriva el ingress de
`documentPath`); costo marginal de frescura CERO medido (el registry ya estaba
en 134/134); motivo de R1 intacto (ningún control chrome nuevo, denominador
5100, ninguna línea chrome del registry tocada); precedente `palette` :94; el
estrechamiento 2-de-290 pagado en la guarda + `entryCatalogNote` (290/275/15/8
/267, cero rechazos de clave). **(3.2)** `map-entry` entra al vocabulario
gobernado (`DOMAIN_KINDS` + `vocabulary.domainKinds`, espejo 12/12 verificado
por Fable; `token-map`/`chrome-map` QUEDAN); el diseño enumeró 3 sitios de
kinds y eran 5 — Opus paró y reportó en vez de tocar fuera del write-set
(procedimiento ejemplar). **Rulings de Fable en el postaudit:** **(i)** la
letra "byte-quieto" de su §3 queda ENMENDADA a "sin cambios sustantivos —
exceptuado el ripple compartido de `registryDigest` que toda edición del
registry produce en los 20"; la imprecisión era de SU redacción, sin cargo a
la implementación; **(ii)** vara sobre el §5.3 de Opus: conclusión FALSA con
observaciones ciertas — la superficie de GAT-07 la define el WALK de
`src/**/*.ts(x)`, no las menciones literales; clase grep-ceguera nombrada y a
la lista de lecciones de vara (P2 de método al reporte; crédito a su instinto
de no resellar deuda ajena); **(iii)** el diferimiento del fix de la cita P3 a
F4B-17B queda ACEPTADO con condición de ledger (el brief de 17B ya la lleva
explícita). **Cadena de presupuesto asentada en orden letra→enmienda→pago:**
preaudit presupuestó 12 bajo R1-como-escrito; la enmienda 3.1 ensanchó el
ripple a 133; pagado con `identical: 133 | moved: 0`. **Cierre ejecutado:**
stops autorados (`#B4231F` / `#1E2833`, verificados dos vías: fuera de
`TEXT_CONTRAST_PAIRINGS` con control positivo, y por conducta en los 3
verticales con baseline `undefined`; asimetría real declarada 2/11/8 canales
— no defecto); 8 drills nuevos + 1 re-legislado; `assessmentState`/
`nextAction` NO tocados (la matriz receipteada es F4B-17B — fliparlos sin
receipts violaría el techo). Gates (corridas DT): suites 256/256 (re-corrí
122/122 + 26/26), re-emisión 133/133, integridad por archivo 134/134,
validador 133 válidos + 0 non-fresh + único inválido declarado,
CONSTITUTION_READY, 5100 intacto, program-check.test 48/48 (338 s),
producers.json re-derivado por el DT (causa: digest srcTsx por el edit
autorizado), GAT-07 resellado por el DT (`34fbb629…`, 2 corridas
deterministas). **Commit: `90e2bfce4`.** F4B queda a UN packet de su evidencia
causal completa: F4B-17B (Sonnet) corre la matriz, flipa el estado con
receipts, corrige la cita P3 y salda el nextAction.

**PACKET K fase 1 — el kind `map-entry` está DISEÑADO y acotado (2026-08-25;
Opus read-only; preaudit Fable despachado; DT: 5 rulings).** El diseño
(`/private/tmp/packetk-map-entry-design-opus.md`, copia limpia `-clean.md`)
mide que el kind es más chico de lo supuesto: pertenece a la familia que baja
`stop.value` (como `font-stack`/`color-set`); la forma `{id, role, value}` YA
existe (`motion.dial`) y `normalizedStops` no cambia de esquema; el brace-set
+ `role` existente resuelve el DÓNDE y el kind sólo valida el QUÉ contra un
catálogo cerrado por entrada. Leyes medidas que quedan como contrato del
diseño: **(a) ley del matcher** — `resolveIngressMember` compara contra el
ÚLTIMO segmento; un brace-set map-entry es admisible sólo si los últimos
segmentos de sus miembros son únicos entre sí (un rol compuesto
`'sidebar.bg'` selecciona 0; la recomendación previa de Sonnet queda refutada
por medición); **(b) el 267/23 de Fable se descompone 23 = 15 + 8**: 15
rechazos de TIPO del schema (4 font-family + 7 número + 4 visual-value, sanan
15/15 con el tipo correcto — NINGUNO es rechazo de clave) + 8 rechazos del
piso APCA en el compilador; el rechazo de clave es un tercer mecanismo
(`unknown_key`) que las 290 no producen por SER el allowlist; **(c) H-2
funciona tal cual** — el centinela `'absent'` modela la ausencia como valor y
el predicado EXISTS discrimina stops de canales distintos sin forma de
testigo propia; **(d) las dos puertas de chrome-map** miden paridad
byte-exacta donde ambas aceptan (`modal.bg`, `table.radius`) y divergencia de
CLASE conocida en los apareados por APCA (estático emite crudo / DB rechaza —
misma clase que `font-stack`); la envoltura `applyRadiusDial` es SIMÉTRICA en
ambas puertas (cerco por drill, no exclusión). **Rulings DT (formalizados,
el R1 nace de línea del owner en pane):** **R1 — alcance de fase 2:
`map-entry` SÓLO para `token-overrides`.** NO se crea control chrome narrower
nuevo, NO se toca `capabilities/index.ts`, el denominador queda 20×255=5100;
el control chrome narrower queda diferido a F5 junto con la revisión de
superficie del paraguas (la alternativa del diseño, adoptada). **R2 — el
catálogo vive en un campo NUEVO `calibration.entryCatalog`** (array de
`{role, valueType, channel}`); `calibration.catalog` queda intacto como
array-de-strings exclusivo de `profile-id`. **R3 — CERO clases nuevas** en
`STOP_EXCLUSION_CLASSES`: APCA → `GOVERNED_CONTRAST_FLOOR`; tipo equivocado →
`DOMAIN_KIND_NOT_LOWERED`; rol inexistente en el schema → `Error` llano con
`classifyStopExclusion` → null (defecto de manifest, misma forma que
brace-en-medio). **R4 — el throw terminal se actualiza a 6 kinds**,
reparando la omisión rancia de `font-stack` (registro de Fable desde
FASE-B). **R5 — taxonomía:** una línea en el generator mapea los
valueType-mapa a `'map-entry'`; `valueType` (dominio público) y `domain.kind`
(estrategia de bajada) siguen siendo campos distintos; el registry no cambia.
**Costo presupuestado de antemano (medido por Opus):** regenerar el manifest
de token-overrides re-stalea los 12 receipts de motion-dial que lo cargan en
sourceFiles → la re-emisión entra en el write-set de fase 2, no se descubre
al final. Pendientes declarados del diseño para fase 2: medir celdas/estado
del control antes de fijar `assessmentState` (techo mecánico, misma regla del
Packet 3) y la pregunta abierta del matcher (dos familias con el mismo campo
requerirían ensanchar `resolveIngressMember` — packet propio, fuera de
alcance).

**Ruling del owner para F8 asentado (2026-08-25; relevo vía auditoría Codex,
aceptado por el owner):** F8 entra con alcance acotado — sólo **BitHire** es
vertical activo; app-platform/Rottay y Evnto quedan en **HOLD**. NO reduce
las 5100 celdas de F9 ni habilita a declarar F8 global: los reportes dirán
"F8-BitHire", nunca "F8 completo". Asentado también como decisión 14 de §12.

**P0 — el cierre del paraguas dejó el índice stale (2026-08-25; detectado por
auditoría externa de Codex, verificado por el DT).** `bdaab012c` aplicó al
commitear la corrección P2 de una palabra (`enum`→`closed-enum`) sobre
`chrome.families.json` DESPUÉS de la última regeneración del índice →
`program-check.mjs` quedó BLOCKED ("manifest/index.json is stale").
Correctivo aplicado con el productor canónico
(`manifest/generator/index.mjs --write`): el único delta material es
`manifest/index.json` (2 hunks: `inputsDigest` + digest de chrome.families);
0 receipts citan `manifest/index.json` en sourceFiles (ninguno se re-stalea);
gates post-fix: generator `--check` OK + `CONSTITUTION_READY`. Postaudit
Fable: ACCEPT (los dos hunks exactos, 0 citas en receipts, ambos gates verdes
en SU corrida; nota de vara: quinta instancia de la clase secuencia/frescura,
la primera nacida de un commit del propio DT — CI-2 la hará roja pre-commit).
Commit correctivo separado: **`fd725246a`** (sólo `manifest/index.json`). **Lección de
secuencia asentada: TODA edición de un manifest — incluso de una palabra de
prosa — exige re-correr el generator ANTES del commit; el índice es derivado
y no perdona ni la última palabra.**

**LEY DE ADMISIÓN de `SUPERSEDED_BY_LIVE_FENCE` (DT, 2026-08-25, sobre la
evaluación vinculada de Fable en el postaudit de F4B-16 — escrita UNA vez,
vale para toda aplicación futura de la clase; CI-2 la hará gate ejecutable):**
la clase SÓLO aplica cuando se cumplen LAS DOS condiciones: **(1) el receipt
es in-re-verificable POR CONSTRUCCIÓN** — su productor ya no existe y no es
reconstruible, así que la frescura no es re-verificable (NUNCA aplica a un
receipt re-emitible; un receipt incómodo re-emitible se re-emite, no se
retira); **(2) la ley que el receipt medía tiene una cerca VIVA y bloqueante
igual o más fuerte que el receipt retirado, verificada por medición directa**
(leer la cerca y confirmar que cubre la misma escena — NUNCA una cerca más
débil que lo que retira). El archivo NUNCA se borra: se re-clasifica
(`supersededEvidence` con la clase, la cita de la cerca y la doble
verificación previa). La primera aplicación (compound-editorial de F4B-14,
fence `capability-propagation:573` + `e2-composed-pairing.test.ts`) cumple
ambas y quedó evaluada por Fable como "fortalece el programa".

**chrome.families — el último control de F4B cierra como PARAGUAS asentado
(2026-08-25; Sonnet; postaudit Fable: ACCEPT — "el paraguas es verdadero,
sus miembros están donde la nota dice, y UNKNOWN+nota es la forma honesta
bajo el vocabulario real del generador"; P2 de una palabra corregida al
commitear: el kind literal de sidebar-tone es `closed-enum`, no `enum`).**
El asiento declara lo que el control ES: el NOMBRE del espacio compartido
que `chromeToVariables` (un solo emisor, ~45 familias) y el schema DB
`chrome = object({...})` cubren — NO una unidad medible por sí misma. Su
`brandThemePath: 'chrome.*'` es un wildcard que el harness no resuelve
(misma clase que sidebar-tone antes de F4B-12) y NO hay un campo real al que
corregirlo (dominio heterogéneo: passthrough en la mayoría, postura derivada
en `tone`, enum cerrado en `.anatomy`, envoltura `applyRadiusDial` en todo
`-radius`). `assessmentState` queda `UNKNOWN` A PROPÓSITO — declarado
BY_REFERENCE por diseño (el vocabulario del generador no admite un estado
paraguas dedicado; no se extendió el schema). `nextAction`:
`SURFACE_REVIEW_DEFERRED_TO_F5` (la revisión de las ~250 celdas con el
scaffold ESCAPE_HATCH compartido — explícitamente F5). Miembros citados con
sus commits verificados: `navigation.sidebar-tone` (F4B-12) y
`chrome.anatomy` (Packet 3, `12d664e99`). El hueco del passthrough genérico
(las ~30 familias planas + las grandes escritas a mano) es exactamente lo
que el kind `map-entry` existe para cerrar (diseño de Opus en curso; hasta
que exista, este control no tiene miembro propio para esa porción — dicho
en la nota). Sin registry ni celdas tocadas; sin re-emisión (el manifest no
está en la superficie de frescura de ningún receipt — verificado).
**Con este asiento, los 20/20 controles de F4B quedan ASENTADOS: 19 con
medición completa (9 COMPUTED_VERIFIED + 10 SOURCE_BOUND) + chrome.families
como paraguas BY_REFERENCE; la única evidencia causal pendiente dentro del
perímetro es la matriz de token-overrides (F4B-17B), que espera el kind
`map-entry` — deuda adjudicada con su packet ya ordenado, no una
calibración olvidada.**

**PACKET 3 DATA — chrome.anatomy CIERRA SOURCE_BOUND y la serie DATA queda
completa (2026-08-25; Opus; postaudit Fable: ACCEPT — "la serie DATA cierra
completa (posture + icon + anatomy en una tabla), la reparación de la
colisión es causalmente honesta"; su barrido propio de los 134: 0
exitCode≠0, 0 sha mismatch).** El tercer control DATA: UNA fila keyed por
controlId con las 4 familias (los 10 valores no-default son globalmente
únicos entre los 4 vocabularios — la forma más chica que es honesta),
`fieldPath` al contenedor `chrome`, equalitySurface con siblings FUERA de
chrome (porque `chrome.cardComponent.bg` es un campo de COLOR real del mismo
contenedor: autorarlo dispararía APCA en dark — la nota P3 aplicada).
Witness = `tenantThemeAnatomyAttributes` (publicado por `/index`): el
proyector de producción, más fuerte que el dato normalizado. **La mitad C
medida: la puerta estática es `STRUCTURALLY_UNREACHABLE` GENUINA** (no la
clase RUNTIME_ONLY de profiles.icon): cero lectores de `anatomy` en el
compilador estático, CERO menciones en el provider (el contraste exacto con
icon), los callers del proyector consumen el ARTIFACT, y la conducta la
sella (compile del tema con `anatomy:'framed'` byte-idéntico al baseline).
El gap queda registrado: un tipo que promete una capacidad que su compilador
no implementa (misma clase honesta que F4B-17). **La ley del `default`
inerte:** el proyector saltea `variant === "default"` por construcción; los
4 stops default son no-testigos declarados como LEY ESCRITA y cercados por
drill (una familia en default proyecta `{}`; las cuatro a la vez también).
**Enums verificados contra el compilador** (card/table/sidebar/layout) y
drill de vocabulario que los asierta CONTRA él; 10 stops discriminantes × 3
verticales; las 4 familias conviven en un documento sin pisarse (drill).
**La colisión inter-lane y la reparación (adjudicación DT ejecutada):** 26
receipts dañados por el driver (exitCode 1 + sha inconsistente) fueron
RE-EMITIDOS correctos — NUNCA restaurados por git; el caso rottay-mate (el
artifact dañado tenía `negativeControlResolution` de OTRO control —
reconstrucción lossy) recuperó su bind del artifact sano de git HEAD por
`git show` SÓLO LECTURA con estampas HEAD≡worktree verificadas (legal bajo
la ley del owner: lectura, no restauración). Barrido final: 134/134 limpios,
133 frescos (sólo el compound histórico re-clasificado). Los 118 "moved" son
el crecimiento legítimo del fixture de F4B-17 (+2 tokens inertes; ningún
verdict cambió — verificado por el auditor en muestra propia). Los 9 DATA
re-corridos: posture e icon payload byte-idéntico (la fila de anatomy no
alteró los controles previos — la invariancia del drill 1 del Packet 1 se
cumple en toda la serie). El driver corregido vive en /tmp (fuera del
commit, declarado; reconstrucción adoptando el método de F4B-16 + snapshot
del par artifact+receipt + fail-fast ante arms stale + pre-flight de
dist-freshness). **Registrada la recomendación permanente de Fable (sube de
tono): promover el driver de re-emisión a `scripts/` con el ledger de
invocaciones es la mejora CI-2 más pagada del programa** — 4 drivers
nacidos en /tmp en esta serie; cada colisión futura la cobra. `manifest/
index.json` entra a este commit (rollup de ambos manifests nuevos —
declarado en el commit de F4B-17). Cadena: drills 24/24, suites 248/248,
validador 133/134, CONSTITUTION_READY, program-check.test 48/48,
dist-freshness OK, GAT-07 resellado (4353f4c6…). Cierre en SOURCE_BOUND por
el mismo techo mecánico de celdas que profiles.icon (251 UNKNOWN + 4
SOURCE_BOUND pre-existentes — la calibración de celdas es frente F4C/F5).

**F4B-17 — token-overrides CIERRA SOURCE_BOUND con la puerta DB medida
directa y el hueco de domain.kind adjudicado (2026-08-25; Sonnet; postaudit
Fable: ACCEPT — "la puerta estática está sellada con la evidencia más
fuerte de la clase (cero lectores, probado por censo Y por conducta), las
mediciones DB directas se reproducen calcadas, y la adjudicación del hueco
de kind es la forma honesta"; write-set exacto verificado. Registros para el
packet del kind: el mensaje del throw terminal enumera 4 kinds y quedó
rancio desde FASE-B — con el kind nuevo serán 6; de los 290
TENANT_THEME_OVERRIDE_TOKENS la puerta aceptó 267 y rechazó 23 con valor
uniforme — F4B-17B debe caracterizar el dominio de claves REAL antes de
elegir stops).** Primer control cuyo dominio es un mapa heterogéneo.
**Puerta estática `STRUCTURALLY_UNREACHABLE` con evidencia más fuerte que el
precedente:** `BrandTheme.tokenOverrides` (`themes/index.ts:3331`) está
declarado en el tipo pero tiene CERO lectores en todo `brand-theme/index.ts`
— no sólo inalcanzable como el slot de responsive.posture: SIN lector en
absoluto. El slot parecido que el compilador SÍ lee
(`BrandCompilerInput.verticalTokenOverrides`, `:3378`) es un parámetro
SEPARADO que carga el baseline estructural del vertical
(`TenantTokenOverrides`: surface/motion — tipo distinto, nunca el mapa crudo
`--ds-*`), suministrado por quien llama a `compileBrandTheme`, nunca por
`BrandTheme` — un stop escribiendo ahí mediría el actor equivocado (clase
H-1). Artifact asentado con la forma del precedente (question/answer/cases/
chain, `receipted: false`). **Mediciones directas DB (sin receipts causales
todavía — ver el hueco):** `--ds-color-error` mueve limpio en las 3
verticales (rottay mueve también `--ds-color-on-error`; bithire/evnto generan
una rampa de 11 pasos desde la MISMA entrada — asimetría real, no defecto:
rottay no tiene rama de generación de rampa para semánticos autorados);
`--ds-color-bg-overlay` limpio, un canal, sin cascada; ambos baselinean
`undefined` (sin riesgo default-coincidente); clave fuera del allowlist
RECHAZADA de plano (`TenantThemeValidationError`, documento completo);
allowlist exactamente 200; los 2 canales FUERA de `TEXT_CONTRAST_PAIRINGS`
(sin riesgo APCA para estos 2 — la preocupación P3 queda real para el
control completo: el allowlist SÍ contiene canales pareados).
`--ds-surface-card` medido y NO elegido (cascada a 8 canales incluyendo 10
series de chart — demasiado ancho para atribución de una entrada).
**ADJUDICACIÓN DT — el hueco de `domain.kind`:** `token-map` (y `chrome-map`)
no son kinds de `ingressValueForStop` (existen 5) → `DOMAIN_KIND_NOT_LOWERED`;
ningún dominio-mapa bajó nunca por el causal CLI. **Se EXTIENDE el
instrumento con un kind nuevo para dominios-mapa** (cubre token-map y
chrome-map — 2 controles, un diseño; Opus diseña, Fable preaudita, packet
propio tras el Packet 3; después F4B-17B corre la matriz causal de este
control con el kind nuevo). DESCARTADA la vía `color-set`: sería mentir el
dominio público (mapa heterogéneo de 200 entradas: colores, font-stacks,
números). `nextAction` honesto en el manifest:
`OBTAIN_DT_ADJUDICATION_ON_DOMAIN_KIND_GAP_THEN_RUN_CAUSAL_MATRIX` (la
adjudicación ya ocurrió; la matriz espera el kind). Celda en `alert.json`
(no `button.json`): `--ds-color-error`/`-on-error` son chrome de
alerta/peligro; SOURCE_BOUND; ESCAPE_HATCH intacto. fixtures.json extendido
con los 2 canales (esa edición staleó los 134 receipts — saldada por la
re-emisión total del Packet 3, que entra a SU commit). **Colisión
inter-lane del día (causa raíz: coordinación MÍA — prohibí simultaneidad
pero no declaré la ventana de cierre de Opus al otro lane):** la escritura
de fixtures.json de este packet cayó a mitad de la re-emisión de Opus →
131/134 corridas fallaron y el driver de Opus dañó 26 receipts (exitCode 1 +
sha inconsistente; artifacts intactos). Adjudicado: reparación por
re-emisión (NUNCA git restore; los 26 re-emitidos correctos, verificados
0 exitCode≠0 y 0 sha mismatch sobre 134); los dañados NO entraron a ningún
commit rotos. **LEY NUEVA (DT, 2026-08-25): TODA ventana de cierre o
re-emisión de un lane se le declara al otro lane ANTES de arrancar** — el
que no cierra queda en pausa de escrituras en `packages/core/**` durante la
ventana (análisis y redacción en /tmp libres). CI-2 la hará parte del gate
de secuencia.

**PACKET 2 DATA — profiles.icon CIERRA SOURCE_BOUND (2026-08-25; Opus;
postaudit Fable: ACCEPT — "la clase nueva la medí en sus cuatro patas;
`STRUCTURALLY_UNREACHABLE` habría sido FALSO"; corrección vinculante (i)
adoptada: sus 3 receipts re-stampeados en la misma pasada del commit,
atestando sólo contenido commiteado).** El segundo control DATA y el primero
con la parametrización del Packet 1 probando lo que prometía: una fila en
`DATA_TERMINAL_DESCRIPTORS` + las 2 líneas contiguas de inyección (desde
`/server`, no `/index` — el lector `resolveActiveIconExpressiveProfile` se
publica ahí) + manifest + 3 receipts `data-field-delta` (R6, la convención
de la serie). **Stops:** los 4 valores del enum (verificados contra el
mensaje del compilador, no contra memoria: `linear, strong-outline,
duotone, solid-active`), discriminación 4/4; baseline sin selección →
`undefined` (fail-closed honesto, removal-witness natural); sin
`bypass` y sin `failClosedDefault` (ausencias medidas: sin escalera que
bypassear, sin id por defecto). **RULING DT — la puerta estática se declara
con clase NUEVA `RUNTIME_ONLY_NO_ARTIFACT`** (STOP de Opus bien planteado;
el precedente no era análogo): inerte en TODO output compilado (CSS
byte-idéntico con y sin el eje; el artifact no lo lleva; el resolver
alimentado con el artifact da `undefined`) pero VIVA en producción — el
provider (`bootstrap/facade/react/provider/index.tsx:1137-1142`) pasa el
tema crudo al resolver y `BrandExpressiveAxisOverrides.icon` existe
declarado a propósito (`themes/index.ts:111`, "Declared vocabulary; carries
no v1 expansion rows (frontier axis)"). Para un control DATA, cuyo terminal
ES la lectura del consumidor, `STRUCTURALLY_UNREACHABLE` habría sido texto
falso. Fable lo midió en las cuatro patas y lo confirmó; la clase vive como
`staticDoorDisposition` del manifest sin tocar `STOP_EXCLUSION_CLASSES`.
**Ningún vertical autora el eje hoy** (medido del objeto publicado, no por
grep — el grep da falsos positivos de tokens de icono; bithire autora
experienceProfile y aun así el resolver da `undefined`: ningún perfil del
catálogo declara eje `icon`) — sin identity stop. **La ley
override-gana-por-eje** (`pick()` de `resolveExpressiveAxes`) asentada como
PREDICCIÓN y cercada por drill ejecutable (el override gana en los 4 stops
sobre un documento compuesto Y el perfil conserva lo no nombrado — sin esa
segunda mitad, tirar el perfil entero pasaría el cerco). **La opción
"evidencia runtime-only receipteable" queda REGISTRADA para F5, no
construida** (¿qué receipt lleva una medición sin artifact? — diseño de
evidencia, no de esta serie). **Cierre en SOURCE_BOUND, no
COMPUTED_VERIFIED, por ley mecánica (decisión DT):** `a control may not
outrank its own evidence` — 251 celdas UNKNOWN + 4 SOURCE_BOUND
pre-existentes (censo corregido por Fable: 4, no 0); calibrar las celdas de
icono es trabajo del frente de celdas (F4C/F5, mismo bucket que la
ratificación propertyGroup), registrado como dependencia. La evidencia DATA
está completa; el tope es mecánico y está asentado. Verificación: drills
3/3 con la invariancia de posture byte-idéntica, suites 245/245, los 3
receipts frescos tras el re-stamp de la pasada (puerta (i)), GAT-07
resellado.

**F4B-16 — profiles.expressive CIERRA SOURCE_BOUND (2026-08-25; Sonnet;
postaudit Fable: ACCEPT — "cierra con el último wildcard del registry
retirado, el cerco correcto para la unión role-blind, exclusiones honestas
medidas y re-medidas por mí"; P2 de una cláusula corregida al commitear;
`SUPERSEDED_BY_LIVE_FENCE` evaluada: FORTALECE, con su ley de admisión
escrita arriba y el fence fuerte `e2-composed-pairing.test.ts` citado en
ambas notas).** Los 6 ejes expresivos con vocabularios
por-miembro, y tres asientos de verdad que valen más que el control mismo.
**Registry:** (a) keypath corregido de `expressive.profiles.*` (wildcard
roto — el walker de ingress sólo entiende brace-SETS; un `*` solo escribía
la key literal nonsense) al brace-set de 6 miembros con últimos segmentos
distintos (la ley del brace de Fase B no muerde); (b) `enumValues` como
unión plana deduplicada de 28 valores (30 crudos; `flat` y `soft-depth`
comparten material y elevation) declarada explícitamente ROLE-BLIND y NO
autoridad — `enumValues.includes(stop.id)` nunca chequea a qué eje pertenece
un valor; el gate real fail-closed es `sanitizeExpressiveOverrides`, y la
forma per-member genuina queda como decisión de schema futura (tocaría el
instrumento); (c) `derivedChannels` corregidos por medición
(`--ds-type-label-text-transform` nunca se mueve — lo escribe OTRO overlay;
swap a `--ds-select-group-text-transform` por el no-movedor bithire-only de
table-header). **El cerco contra el falso testigo (drills H-2 10/11):** un
stop cross-axis (`flat` para geometry) pasa la unión ciega, el compilador
real lo descarta (canales byte-idénticos al baseline) Y
`assertStopDiscrimination` rechaza certificar con un solo stop; y el
catálogo declarado se compara `deepEqual` contra los 6 vocabularios reales
de dist/ (la desincronización silenciosa se pone roja). **Matriz causal
15/15** (6 ejes × las verticales que discriminan): type=editorial (swap
desde geometric — su `uppercase` coincide con el default incondicional de
`default.css:759`, medido), geometry=pill-accented, edge=outlined,
material=paper, elevation=dramatic, motif=contour. **Exclusión medida
nueva:** el arm DB de bithire da cero-diff genuino en 3 de 6 ejes (type,
material, motif — sin importar el valor, probado con dos valores en type);
excluido por combinación (rottay+evnto en esos 3), causa raíz NO trazada
(merge path específico de bithire en el compilador DB — fuera del
write-set). **DEUDA REGISTRADA: diagnóstico del merge path de bithire en el
arm DB** (¿por qué esos 3 ejes no se mueven?) — va a F5 o a un packet de
diagnóstico propio. **negativeControls:** `"border remains fixed"` eliminado
completo (la frase agrupa border-width/style Y border-radius, y DOS ejes
propios — edge y geometry — la mueven legítimamente; no existe frase más
angosta en el vocabulario cerrado; documentado en `negativeControlsScopeNote`).
**Nota P3 de Fable asentada:** el contenedor `visualFoundation.advanced` es
compartido y PODRÍA llevar un sibling de color; en la práctica ninguno de
los 8 stops puebla otro campo (verificado por `buildIngressInput` desde
`base = {}` y por compile directo de un documento mínimo). **ADJUDICACIÓN DT
— el receipt del caso compuesto de F4B-14 se retira con clase
SUPERSEDED_BY_LIVE_FENCE:** su productor ad-hoc (`/tmp/f4b14-compound-case.mjs`)
ya no existe (frescura no re-verificable por construcción); la ley que midió
(explicit family wins en el caso compuesto, ambas mitades, ambas puertas)
está cercada viva por `capability-propagation/index.test.ts:573` (BASE_DOC
:141-146, verde, verificado standalone 8/8 por el implementador antes de
aplicar el retiro); la medición quedó doblemente verificada en F4B-14
(ACCEPT Fable). El archivo queda en disco como registro histórico; las
referencias en `typography.families.json` y `typography.json` (familia)
pasaron a `supersededEvidence` con la clase y las citas. **Re-emisión total
con bug propio encontrado y auditado:** el selector de control-manifest por
primer archivo de `sourceFiles` (varios controles listan primero
`experience.profile.json`) → match exacto por `controlId`; 85 corridas "OK"
del primer pase auditadas 0 falsos-positivos silenciosos; 108/108 + 3/3
data-causal; la cascada final (su propio edit de `typography.json`
re-staleó 23) re-emitida junto con el R7-dark-closed: 24/24, re-emisión
como ÚLTIMO paso (la ley, otra vez). Cadena: validador v2 127/131 (los 4 =
3 icon del Packet 2 + compound histórico, todos declarados),
CONSTITUTION_READY, program-check.test 48/48, probe 245/245, provenance
24/24, css-staleness 5/5, producers --check OK. Cierre en SOURCE_BOUND por
la nota de anatomía (propertyGroups sin ratificar — dependencia registrada).

**PACKET 1 DATA — el runner DATA queda parametrizado por descriptor
(2026-08-25; Opus; postaudit Fable: ACCEPT — "la invariancia la probé con mis
propias manos: los 3 artifacts vivos se reproducen byte-idénticos bajo el
runner nuevo"; write-set exacto verificado).** Habilitador de instrumento
para los controles DATA (profiles.icon, chrome.anatomy), SIN controles.
`commandDataCausal` era responsive.posture con literales cableados; ahora una
tabla `DATA_TERMINAL_DESCRIPTORS` (Object.freeze) declara por control:
`document(stopId)`, `fieldPath`, `equalitySurface`, `witnesses`,
`failClosedDefault`, `bypass` (opcional — un `--bypass-id` sobre un control
sin bypass declarado es RECHAZADO: ausencia, no false). Desviación declarada
y aceptada: fueron SEIS literales, no cinco — `failClosedDefault` bajó al
descriptor por la razón que su propio comentario ya daba (no puede ser
constante). `buildDataCausalReport`, `writeEvidence` y el contrato de
evidencia: intactos. **Drill 1 (la guarda): los 3 artifacts vivos de
responsive.posture se reproducen BYTE-IDÉNTICOS con el runner parametrizado**
(rottay/bithire/evnto, payload y archivo entero), contra un `dist`
certificado por UN build limpio bajo la ley del lock; la invocación del
re-run se reconstruye DESDE el artifact (el bypass.requestedId no se
hardcodea — bug del propio drill encontrado y corregido por el
implementador). **Drill 2: un controlId sin descriptor TIRA nombrando el
control y la ley** ("refuses to guess; Declared: responsive.posture") — un
fallback correría el documento de un control bajo el id de otro. Write-set:
2 archivos (`public/cli/index.mjs` +157/-35,
`public/drills/tests/index.test.mjs` +122). **LEY NUEVA DEL PROGRAMA
(owner, 2026-08-25): `heavyBuildOrTest.maximum = 1` GLOBAL** — nació de un
incidente real: dos `pnpm build` concurrentes sobre el mismo `dist` dejaron
evidencia no certificable; se retiró y se re-corrió entera. El lock es
`/private/tmp/modern-rescue-heavy.lock` (una cosa pesada por toma; >30 min
tomado se escala al DT, no se borra); paralelizar análisis y writes
disjuntos sí, builds/tests pesados no. **Deuda transitoria declarada que
este commit carga (ley (i): el packet con re-emisión total cierra último y
salda todo):** `public/cli/index.mjs` está en `sourceFiles` de los 113
receipts → quedan stale en digest (los 112 hallazgos de frescura +
program-check.test `:180` rojo) hasta que F4B-16 re-emita; el rojo A11 de
program-check.test visto en la verificación era el drift del registry de
F4B-16 en vuelo (cascade: 1 leaf srcTsx, 0 colecciones — NO entra a este
commit). El rojo de `ingress` visto en las suites (`type-geometric` de
profiles.expressive) es trabajo de F4B-16 a mitad de camino (0 ocurrencias
en HEAD), probado dos veces; tampoco entra a este commit. Verificación DT:
drills 20/20, suites del probe 241/242 (único rojo = el ajeno probado),
program-check 119 hallazgos todos clasificados, program-check.test 46/48
(los 2 triagiados arriba), GAT-07 resellado (926b0ada…).

**F4B-15 — recipe-profile CIERRA SOURCE_BOUND (2026-08-25; Sonnet; fix del
instrumento ratificado por ruling DT; postaudit Fable: ACCEPT — "el primer
control del espacio advanced medido end-to-end; FASE-A queda viva en evidencia
real: el récord A6 (digest + verticalKey) está en los artifacts"; write-set
exacto verificado por el auditor, 106/106 re-stamps sólo frescura).** Fix del
registry clase false-INERT by PATH (la de F4B-7/12/13): `brandThemePath:
'recipeProfile'` nombraba un campo que no existe en BrandTheme (las dos
ocurrencias de `recipeProfile` en `themes/index.ts` son shapes de OUTPUT —
TenantAppearance/CompiledBrand) → `'recipes.profile'`
(`BrandRecipeSelection.profile`, el input que un stop escribe). **Witness
corregido por ruling DT:** el symbol anterior (`RecipeProfileProvider`)
implicaba que el canal CSS `--ds-recipe-profile` llega a producción; medido,
las DOS superficies quedan documentadas con sus alcances exactos — (a) el
canal CSS no tiene lector de producción (grep; el propio comentario del
compilador lo llama provenance de la selección, no paint); (b)
`RecipeProfileProvider` es consumidor real pero de
`resolvedRuntimeConfig.appearance?.recipeProfile` (la forma DB-normalizada),
que para las 3 verticales code-owned NUNCA llega
(`getCodeOwnedRuntimeConfig` destructura y descarta `appearance`;
`governedBehavior` no lleva `recipes`). No se inventó consumidor (ley D-1b).
**Stops:** el catálogo cerrado de 3 ids + 2 identity (rottay autora
`rottay/technical-sharp@1`; bithire autora `rottay/network-professional@1` —
el namespace nombra la provenance del REGISTRO, no qué vertical puede
seleccionarlo; evnto no autora `recipes`: gap explícito, sin identity stop).
Identity = hecho compilado, no receipteado (ley F4B-8: la CLI exige ≥2
brazos comparables). **Matriz causal 7/9, medida no anticipada:** las 2
combinaciones restantes (`technical-sharp`×rottay, `network-professional`×
bithire) son la identidad PROPIA de ese vertical — escribir el mismo valor
por el documento DB hace que el compilador ELIDA el canal por completo
(`StopExclusionError`, clase `COMPILER_ELIDES_VERTICAL_DEFAULT`,
publicable); el brazo estático muestra el mismo hecho como `moved=0`,
byte-idéntico al baseline. Clase más fuerte que bithire/sober de F4B-11
(ahí el brazo DB emitía sin mover; acá no emite). Documentado en
`coincidentalIdentityExclusionNote`. **`tenantPostureFloors` no proyecta
`recipes`:** la composición DB depende íntegra del `mergeDeep` genérico de
`resolveTheme`; suficiente por el argumento W-B (no hay ladder de vertical
que compita post-merge para una selección simple) — asimetría real contra
los campos con piso, nombrada en `recipesFloorAsymmetryNote`. **Fix del
instrumento (ruling DT, write-set ampliado a UN archivo):** `discriminate()`
en `runtime/ingress/tests/index.test.mjs` reenvía ahora
`verticalEnvelopeFor` del propio arm — la wiring que el CLI siempre hizo
(FASE-A). Hueco preexistente expuesto, no causado, por este packet:
recipe-profile es el PRIMER control receipteado con `dbTenantThemePath` en
`visualFoundation.*` (documento modo `advanced`), y el drill H-2 drill 5
(que auto-descubre controles receipteados) nunca había compilado en
`advanced`; el drill no cambió su ley ("H-2 may not invalidate receipted
work" exige lo mismo), el fix habilita la medición. 17 receipts re-emitidos
por frescura (el archivo de test está en `ownedSourceFiles` del instrumento),
cero cambios de VALOR en los 113. **Asiento de familia button.json:**
MUST_NOT_REACH re-confirmado (la receta rebindea RAÍCES, los componentes
leen sus sockets; grep cero lectores de `--ds-recipe-profile` en
tokens/css) → SOURCE_BOUND, mismo techo de anatomía (propertyGroups sin
ratificar — dependencia registrada). Cadena completa: 113/113 VALID,
CONSTITUTION_READY, program-check.test 48/48, probe 240/240 (drill 5 ok con
recipe-profile descubierto), provenance 24/24, css-staleness 5/5,
producers --check OK. Cierre en SOURCE_BOUND por la misma nota de anatomía.

**F4B-14 — STOP y RULING DT: el caso compuesto es un defecto real de
compilador, y E-2 entra EN F4B-14 (2026-08-25; escalado por el owner).**
Sonnet midió lo que el brief pedía verificar: la ley "explicit family wins"
se cumple en el caso AISLADO (la familia explícita del tenant gana limpio)
pero **es falsa en el caso COMPUESTO** (documento con `typePairing` Y
`fontFamilyHeading` a la vez — la forma realista conjunta de las dos
features): mutar la familia explícita no mueve nada, el canal compila a la
expansión del pairing en ambos — **el pairing gana sobre la familia
explícita del tenant**. Es un defecto de producción (un tenant que declara
un preset y además un override explícito ve su override pisado por el
preset), y es exactamente el rojo de `capability-propagation:573` ("does
not let one capability move another capability's exclusive channel") — que
NO se explica por ninguna adjudicación de precedencia (la precedencia
declarada es cierta sólo en el aislado). **Ruling DT (coincide con la
escalada del owner):** E-2 entra EN F4B-14 (el patrón E-1 dentro de F4B-10):
Opus diagnostica el sitio exacto → ruling → preaudit → fix del compilador
dentro del write-set (disjunto: compilador solamente) → Sonnet agrega las
corridas del caso compuesto (un documento con typePairing + familia
explícita, probando que la explícita gana en AMBOS brazos) → cierre. Los 12
receipts del caso aislado quedan como evidencia válida de lo que midieron
(nunca certificaron el compuesto — declarado en el manifest, cuya nota de
precedencia ya fue reescrita a la verdad medida por Sonnet). `assessmentState`
queda en SOURCE_BOUND hasta que el compuesto esté receipteado. La nota de
método que se repite y queda asentada: **el caso aislado y el compuesto son
dos escenarios distintos y ambos deben medirse** — la ley declarada en un
caso no se extiende al otro sin medición (la misma clase que la partición de
scope de palette.seeds).

**E-2 — el piso del tenant gana su segunda mitad (2026-08-25; Opus; preaudit
Fable ACCEPT con W-A/W-B; implementado y verificado en cadena completa).**
El sitio del defecto es el piso (`brand-theme:1093-1094`), no el puente ni
la resolución (probado por la tercera ruta: composed-in-theme sin patch
funciona — el mecanismo base está sano). **Atribución honesta asentada: la
mitad DB del defecto nació en E-1** (`bae71c705` — antes de E-1 la puerta DB
no pasaba `tenantPatch`, el piso no corría, y el literal era el último
escritor: la explícita ganaba; E-1 arregló elevation y extendió el defecto a
la puerta DB). **El fix:** después de `Object.assign(vars,
appearancePostureToVariables(tenantPosture))`, el piso re-aplica los
literales que el TENANT autoró, **cada campo con el trato idéntico al del
cuerpo** (familias con `withArabicSafeFallback`; mono/letterSpacing crudos;
lineHeight con `String(...)`) — el detalle que distingue corrección
invariante de regresión silenciosa, asertado (aislado byte-idéntico).
Gatillo: sólo lo que viaja en el patch → el literal de la VERTICAL no viaja
ahí y el pairing del tenant la sigue pisando (opción B y F4B-11 intactas,
con drill propio). **W-A:** la puerta DB pasa las familias por la PROYECCIÓN
(`tenantPostureFloors` proyecta además `fontFamilyBase`/`fontFamilyHeading`
— los dos que el schema v1 admite; sin ella el fix arreglaba sólo el
estático, la inversa exacta de la asimetría que E-1 creó); el docblock se
actualizó a la verdad nueva (lección F4B-13). **W-B medido:** el piso
también pisaba `letterSpacing.heading` (0.09em → 0) y `lineHeight.display`
(1.42 → 1.2 — nadie lo había medido; Opus lo midió antes de escribirlo);
van en el fix por el estático (el schema v1 los rechaza, así que ese
compuesto sólo existe ahí — asimetría asentada con mediciones). **El fence:
9/9** (compuesto en ambas puertas byte-exacto al literal con fallback;
`technical`+mono sin wrapper como el cuerpo; `editorial`+LS/LH sobreviviendo;
la preservación explícita de F4B-11; aislado idéntico pre/post; el overlay
re-corre las dos mitades). **`capability-propagation:573` VERDE** — el rojo
que motivó el packet. **Anclas escritos por el DT** (autorizados por el
owner; los 5 subpaths con comentarios: provider 2003638, typography 1705960,
skeleton 1707364, dashboard-header 2304283, collection-workspace 3552241 —
medidos con el medidor del gate, dos corridas deterministas; el piso
irreducible con CERO comentarios seguía 563 B por encima del ancla viejo, la
razón escrita; aterrizan con cero aire, decrease-only desde ahí).
`hooks-manifest.json` entra al write-set como consecuencia derivada probada
(+5 emisiones concretas del fix; el revert prueba que la causa es E-2 y no
el archivo ajeno en vuelo). Cadena: build EXIT=0, dist-freshness OK,
`[needs dist]` 240/240, provenance 24/24. Rojo preexistente registrado:
`capability-propagation:546` (pin rancio de F4B-13 — el set alcanzado creció
legítimamente con motion.dial; lo arregla Sonnet en el cierre fusionado).

**F4B-14 — typography.families CIERRA SOURCE_BOUND (2026-08-25; packet
fusionado Sonnet+Opus; postaudit Fable: ACCEPT — "la ley 'an explicit family
still wins' queda VERDADERA en sus dos mitades (cuerpo Y piso, ambas
puertas)").** La primera calibración sobre la rama `font-stack` de Fase B:
**12 receipts aislados** (4 stops × 3 verticales: base/heading con
comillas y sin — ambos válidos por `isSafeFontFamily`; discriminación +
contiene-la-familia-líder, nunca igualdad — el compilador inserta el
fallback de script) + **el caso compuesto receipteado** (editorial +
`'Zilla Slab'` explícita en UN documento: 13/13 comparaciones byte-exactas
al literal CON su cola Arabic-safe, en los 3 verticales y ambas puertas;
el control negativo prueba el scoping al campo realmente autorado —
`data-field-delta`, porque un stop del control no puede cargar dos campos a
la vez en su ingress path). Widening de declaredOutputs 2 → 4 (los 4 se
emiten realmente; el scaffold de familia ya esperaba los 4). mono/display
verificados por compilación directa fuera de banda (mono emite VERBATIM sin
cola Arabic-safe; display SÍ la lleva) — documentados static-only no
receipteados (el schema v1 los rechaza). **Corrección de cardinalidad
medida:** `internalChannels` queda scoped a los 2 canales que el control
posee en exclusiva (mono, display) — base/heading ya tienen semanticOwner
(typography.pairing; la ley es global por-channelId, no por-familia); la
superficie compartida vive correctamente en `targetBinding.sharedChannels`.
**Los 2 R-1:** pin `:546` (`motion.dial` entró al set alcanzado en F4B-13
sin actualizarlo — crecimiento legítimo con nota; suite 8/8) y la extensión
de `CLOSURE_MEMBERS` del sandbox de program-check.test (el receipt del
compuesto es el primero en citar `dist/.../brand-themes/index.js` como
sourceBinding — ausente de la lista cerrada: staleness de FRONTERA DE COPIA,
no de contenido; agregada con el formato "Measured, not guessed"). Cadena
completa: 106/106 VALID, CONSTITUTION_READY, program-check.test 48/48,
probe 240/0, provenance 24/24, producers --check OK, anclas exactos con
cero aire, build EXIT=0, tsc limpio. Cierre en SOURCE_BOUND por la misma
nota de anatomía (propertyGroups sin ratificar — dependencia ya registrada
para F4B 20/20).

**F4B-11 — typography.pairing CIERRA SOURCE_BOUND (2026-08-24; Sonnet;
postaudit Fable: ACCEPT — "el falso-verde más peligroso del censo quedó
cerrado con el keypath real").** Keypath corregido (el de OTRO control →
`typography.typePairing`). **11 receipts R7** (12 combinaciones menos
bithire/sober, no-mover genuino: los literales de bithire SON
`TYPE_PAIRINGS.sober` — misma clase que flat/elevation). Estático 12/12
moved; DB byte-exacto a `TYPE_PAIRINGS` (funciona POR E-1); H-2 ambos
brazos sin excepción; paridad 24/24; restore exact; negativos held (con el
ajuste metodológico documentado del control-height: el hitbox del botón
auto-dimensiona al glifo — re-atado a `card-modern-md/title`). **Cierre en
SOURCE_BOUND, no COMPUTED_VERIFIED, por LEY ESCRITA de la anatomía:**
`anatomy.sourceEvidence.propertyGroupCensusNote.status` de la familia
typography dice textual que `anatomy.propertyGroups` "stays blocked on the
propertyGroup vocabulary ratification" — fabricar los grupos saltándose la
nota es la clase de canal falso que el ownership check existe para bloquear
(button.json NO tiene esa nota: el bloqueo es POR FAMILIA; R-2 pudo autorar
`control-seeded-fill-and-edge` porque su anatomía no la cargaba). El canal
SÍ pinta; el techo es de vocabulario de programa. **Dependencia registrada
para F4B 20/20 COMPUTED_VERIFIED: la ratificación del vocabulario
propertyGroup** — sin ella, las 79 familias MUST_REACH con la nota no
pueden pasar de SOURCE_BOUND; entra en la planificación F4C/F5. A11 del
program-check test falló una vez en mi verificación (hijo anidado pesado
muriendo en Z-12) y NO se reprodujo en re-corrida (48/48): registrado como
flake-suspect del drill con hijos pesados, para el diseño de CI-2. Colateral
de proceso: el build-stamp ausente del árbol principal (build cortado) lo
encontró y reparó Sonnet antes de receiptear (`dist/build-stamp.json`
fresco; dist es gitignored).

**F0 — CERRADO (2026-08-19).** Criterio de cierre cumplido:
`ci-gates OK — 78 blocking gate(s) passed` (2 excluded visibles con razón y
dueño: channel-liveness y lane-control-drills, ambos esperan a F2); `find src -type d -empty` vacío salvo el inbox
declarado; changeset major commiteado. **Auditoría Fable del hito: APROBADO
("sustancialmente real", 0 bloqueantes)** — sus 5 hallazgos menores quedaron
integrados en el lote F0.14 (`14dee7dc3`): fix del wildcard de
exports-artifact, drills con violaciones plantadas reales, `wiring-coverage-gate`
nuevo (implementa la cuenta de los 3 canales de §1.10), lane-control drills
cableados como excluded visible (tenant-reachability, dueño F2), 7 scripts
adjudicados que faltaban por borrar, y la deuda doc barrida (§1.11 ya no
promete gates que ya existen, prosa de tokens-catalog, recibo R0 en el
changeset). Pendiente fuera de este repo: README de quality-rubric en
docs-engineering (cita `gate:styles-css`; su commit/push es de ese repo).

| Lote | Estado | Commit | Nota |
|---|---|---|---|
| F0.1 changeset major 3.0.0 | ✅ | `de9e71c3f` | `changeset status` valida el bump major |
| F0.2 borrados triviales repo | ✅ | `65bb266f7` | 24 archivos, 5.995 líneas; Sonnet + verificación mía |
| F0.3 carpetas vacías | ✅ | — (disco) | 23 src + 7 extra; queda solo el inbox declarado; structure:check verde |
| F0.4 iconos legacy | ✅ | `959028f90` | 14 carpetas + barrels recortados + re-seed packinv; typecheck 0 errores |
| F0.5 monolito probe | ✅ | `255a86762` | program-check CONSTITUTION_READY; 37/37 tests de la sonda raíz |
| F0.6 aliases | ✅ | `412473315` | 15 fuera; quedan 3 con invocador + `theme-parity:check` |
| F0.7 channel-wiring + enmienda lane-control | ✅ | `feb577197` | la ley de WO ahora lee el registro vivo del manifiesto (mejor que la spec) |
| F0.8 cra-17-integral al manifiesto | ✅ | `feb577197` | corre y pasa; 75 gates bloqueantes |
| F0.9 doc-rot | ✅ | `dc8082f8a` | NUL→`\0` (era funcional, verificado con aislamiento), `:v2:seal`, comentarios |
| F0.10 resello gat-07 | ✅ | `1750cdf46` | Node 22 + DOCS_ENGINEERING_ROOT; re-sello vigente al cierre de F0 |
| F0.11 gates nuevos | ✅ | `cd06b8dee` + `e7ea7c795` | 3 gates + drills 6/6 + wiring postbuild/prepack; root-catalog corregido |
| F0.12 declaración canales | ✅ | `675d2e3b3` | §1.10 ARCHITECTURE + wiring gate los cuenta |
| F0.13 gates rojos | ✅ | ver nota | adjudicados y commiteados: channel-liveness (regla `surfaces.elevation`), contract:check, hooks:check, tokens-catalog (vistas + reconciliación re-derivada), presupuestos de bytes (nota: mueren en F6), tenant-theme-fixtures (seguía mal el re-export), first-party-artifacts (regenerados tras build verde). Censo definitivo: 78 blocking + 2 excluded verdes sobre árbol estable |

**Notas de ejecución:**
- `pnpm build` de core quedó **verde de punta a punta** (prebuild 7 gates + tsc + vite + CSS + postbuild con `exports-artifact` nuevo).
- La regeneración de vistas de tokens escribe en `../docs-engineering` (repo hermano): su worktree tiene 344 cambios ajenos preexistentes — NO tocar; el commit/push de ese repo queda fuera de alcance (CI lo clona del remoto).
- El build por filtro (`pnpm --filter`) captura el paquete desempaquetado de `test-artifacts/release/2.19.29/` y falla ahí — usar `pnpm build` directo en `packages/core` hasta que F7 limpie ese árbol.
- Warnings APCA del build de artefactos (dark-mode colores 900, |Lc|=0) → material de craft para F4, no bloquean.

**Auditoría de hito:** al cerrar F0, Fable audita antes de abrir F0.5. ✅
Aprobado; hallazgos integrados en F0.14.

**F0.5 — CERRADO (2026-08-20).** La ley folder/index gobierna todo el repo:
scripts/ 100% `<familia>/<capability>/index.mjs` con el `scripts-tree-gate`
bloqueante (Paso D), manifest graduado a `packages/core/manifest/`, raíces de
paquete sin artefactos sueltos, `styles/platform.css` borrado, sellos frescos
y **gates:ci 80 blocking + 2 excluded verdes** en HEAD. Auditoría Fable del
frente: **APROBADO, 0 bloqueantes**; condiciones implementadas en `652cf285e`.
Paso C (renombres) y los H1/H2 del auditor abren F1. Detalle lote por lote
abajo. Fase 0 CERRADA (`5ab118884`): helper `repo-root`
(`lib/repo-root/index.mjs`, doble predicado, 5/5 drills, `b222ff311`) y
migración de las resoluciones manuales ejecutada por terminal Opus —
147 archivos usaban idiomas de auto-ubicación, **131 migrados**
(83 producción + 48 tests), 16 no migraban (solo alcanzan vecinos).
Cubre las 3 familias (`dirname(fileURLToPath)/..`, `import.meta.dirname`,
`new URL('..', import.meta.url)`). Suite: 1621 tests, mismas 23 fallas
preexistentes (conjunto idéntico); wiring-coverage OK; escaneo residual
independiente (Python, no grep): 0. Re-sello gat-07 en el mismo commit.
Verificado por el coordinador: diffs de gates sensibles, drills 23/23,
escaneo residual propio.

**Deudas nuevas que destapó la Fase 0** (anotadas para su lote):
- ~~**Bytes NUL en fuentes**~~ ✅ CERRADA (`1f3aa3012`):
  `color-mix-argument-purity-gate.mjs` y `red-inventory-gate.mjs` ya no
  tienen bytes crudos (escape `\0`, runtime idéntico, 28/28 tests); son
  visibles a grep. Queda pendiente SOLO el gate que prohíba bytes de
  control en fuentes — nace post-Fase 1, directamente en su familia.
- **Raíz de repo y showroom**: sus scripts siguen resolviendo raíz a mano
  (no pueden importar el helper sin cruzar paquetes). Se adjudican en la
  fase de raíces de F0.5. ▶ Lote de graduación folder/index de los 4
  capabilities de `scripts/` de raíz EN CURSO (terminal f05-sonnet,
  brief `/tmp/root-scripts-brief.md`).

**Lote raíces (parcial) — `39dd2ae6f`:** los 4 `.md` históricos
(`BACKLOG`, `DESIGN_SYSTEM_FINAL_REVIEW`, `DOCUMENTATION_ENHANCEMENT`,
`WAVE_4_PRIMITIVES`) movidos a `docs/history/` (LOTE 5(a) de
QUE-SE-QUEDA ejecutado); `.claude/settings.local.json` fuera del índice
(rotación del PAT = acción del dueño). Restan de raíz: `scripts/`
(graduación en curso), `test-artifacts/` (unificación §3, con F7).
`roadmap/` queda como está: las 2 fotos datadas (`icon-supplier-decision`,
`iconography-fleet-census`) NO son historia — son evidencia viva referenciada
por `cra-17-integral-gate` (bloqueante) y `craft.md`; verificado 2026-08-19.

**Fase 1 — Paso A (mapeo) CERRADO y ADJUDICADO (2026-08-19).** La terminal
Opus produjo `/tmp/f05-fase1-mapping.md`: 225 filas (78 prod + 86 tests + 31
sidecars + 30 lib), 12 clusters (C1–C12), 17 adjudicaciones (A1–A17), 7
anomalías (AN1–AN7) y checklist de fixups (F1–F10). Decisiones del
coordinador: A1(a) mover-con-basename (renombres anti-redundancia = Paso C,
lote propio posterior); A10 `ci/f0-honesty-gates/`; A11(a) toolchain se queda
(excepción escrita en §1.2, la hace el coordinador); A13 aprobadas
`lib/verticals/` y `lib/source/` (§2.9 lo actualiza el coordinador); A17(a)
permanente por ahora; AN3 aprobado — gate `structure/scripts-structure-gate/`
como Paso D, lo escribe el coordinador; AN4 resuelto por borrado (v1, abajo);
AN5 ya cerrado (`1f3aa3012`); AN1/AN2 → Fase 0-bis (brief
`/tmp/f05-fase0bis-brief.md`, 5 archivos + 4 cadenas, cuarto idioma
`fileURLToPath(new URL('.', …))`). Addendum cross-package verificado a mano:
`/tmp/f05-fase1-addendum.md` (root package.json, showroom package.json,
import real desde `cra-15-assemble.mjs`, `new URL` en spec de whitelabel).

**Retiro de quality-evidence v1 (U2 + §3):** borrados los 7 archivos + su
gate test, entrada `quality-evidence:check` fuera de package.json, README
reescrito v2-only, v2 verificado (inventory exit=0). **Commit PENDIENTE**:
quedó entrelazado en el árbol con el lote de scripts de raíz (f05-sonnet en
vuelo); se commitea inmediatamente después de ese lote, con re-sello.

**Incidente y regla nueva (2026-08-19):** un `git commit` pelado del
coordinador barrió las movidas staged del worker (las `git mv` quedan staged
por diseño). Se deshizo con `reset --soft` sin pérdida. **Reglas duras desde
ya:** (1) UN SOLO lote que toque el corpus del sello (scripts/, src/, ci.yml,
package.json de raíz, roadmap/registry.json) en vuelo a la vez — la
verificación §13 + commiteo mío entre lote y lote; (2) los commits del
coordinador usan `git commit -o -- <paths>` explícitos mientras un worker
tenga trabajo sin commitear en el árbol.

**Cola de F0.5 (orden estricto):**
1. ~~Lote scripts de raíz~~ ✅ `4a674d81c` (+ retiro v1 `6de85d530` con sello).
2. ~~Lote 0: wiring-coverage recursivo~~ ✅ `d3c431df0` + gates:ci 78 verdes.
   Incluye guarda anti-vacío y un-salto por profundidad real (el resolver con
   `resolve()` absolutizaba y flaggeó 3 huérfanos reales al probarlo —
   fail-path ejercido en vivo; fix a `posix.normalize`). 4 drills (13/13).
3. ~~Fase 0-bis~~ ✅ `f310d7d07` (Sonnet): cuarto idioma migrado en 4 scripts
   de producción + 4 cadenas en 3 tests. **`lint-folder-index` excluido a
   propósito** (decisión del coordinador): su self-test lo copia como archivo
   único a un tmpdir pelado — la portabilidad single-file es un invariante
   testeado; excepción declarada, sus 2 sitios se recalculan a mano en el
   lote C del Paso B (callout en el brief).
4. Paso B lotes A–I (Opus, brief `/tmp/f05-pasoB-brief.md` YA corregido con
   la auditoría de Fable): A i18n · B builders+generators+taxonomy ·
   C structure+verticals (SIN audit-vertical-compliance) · D boundaries ·
   E packaging+evidence (C2 atómico) · F ci · G tokens · H engine · I lib.

**Paso B — ritmo de verificación por lote (regla operativa, 2026-08-19):**
`gates:ci` completo NO corre por lote — corre al cierre de los lotes F, H, I y
al final del frente (mínimo de Fable), con el worker EN PAUSA entre lotes (una
corrida concurrente con el lote siguiente lee el árbol a medio mover: falso
rojo garantizado en gat-07 — verificado empíricamente dos veces). En los lotes
intermedios alcanza: batería del worker (3 piernas de suite + gates:ci:list +
wiring + gat07:check + greps) + mi verificación (expectativa exacta + gate del
lote corrido a mano) + re-sello mío al commitear. **Lote A ✅ `7346f6028`**
(calibración del patrón: 3 archivos, 23/23 estables idénticas, wiring 78 OK,
delta de sello = exactamente las 3 rutas del lote). **Lote B ✅ `9b1eeb16a`**
(9 de 11: builders/+generators/+taxonomy/; parada estructural correcta en
`generate-semantic-icons` — estampa su ruta en 293 generados byte-comparados;
va en lote B2 propio). Reglas nuevas que salieron del lote B: (1) puntero vivo
en fuente publicada = instrucción de ejecución → se actualiza (canónica desde
el caso `charts/index.ts`); (2) generadores que estampan su propia ruta:
constante se actualiza en el lote, el artefacto se regenera en lote propio al
cierre (TAXONOMY.generated.md con drift medido: 94→98 primitivas, 122→133
familias); (3) `distfresh:check` ya venía rojo (dist stale desde Fase 0) —
rebuild al cierre del frente, junto con la cadena de regeneración.
**Lote B2 ✅ `0f6790dd3`** (generate-semantic-icons a generators/; 293 iconos
regenerados con diff PROBADO header-only — 293+/293−, filtro exhaustivo vacío;
icons:check verde; la roja estable del test intacta). Deja **1 rojo nuevo de
suite, declarado**: `customization-surface-gate` stale (su inputsDigest cubre
los .ts de iconos). NO es de manifiesto (gates:ci sigue 78 verdes). Se cierra
en el **lote R (mío, DESPUÉS del lote G)**: la cadena C3 entera
(census → reconciliation → preservation manifest → tokens-catalog → vistas) en
un solo acto — antes de G sería doble trabajo porque los 4 owners se mueven en
G y los artefactos estampan la ruta del generador. Inventario de flakies: 2
(channel-liveness + skin-evidence, misma familia de carreras por fixtures en
src/ — el fix tmpdir es deuda post-Paso B).

**Lote C ✅ `37dd92d52`** (15 de 17: structure/ 9 + verticals/ 6).
`lint-folder-index` migró con su excepción declarada (2 sitios a mano +
self-test replantado a la profundidad nueva, 8/8). 4 referencias funcionales
no censadas arregladas — 2 fallaban EN SILENCIO (`filter(existsSync)` traga
rutas muertas; patrón añadido a las reglas duras del brief). Re-sello
red-inventory hecho por el coordinador con las 4 identities que el worker
computó (exactas, gate verde). Enmienda de punteros APROBADA y en el brief:
archivos de corpus hasheado (`src/foundation/tokens/css/**` fuera de
`facade/artifacts/`) NO se tocan en movidas — viajan con la re-derivación del
piso. Deuda nueva: `styles/platform.css` huérfano (sello sin productor —
adjudicar al cierre del frente). **ADJUDICADO (2026-08-19, coordinador): se
BORRA al cierre del frente.** Verificado: el productor actual
(`build-vertical-css`) genera el roster `{index,modern,rottay,bithire,evnto}`
— platform ya no es vertical (contradice platform-identity-zero); ningún
script de core lo sella ni lo referencia (el `dependency-honesty` de RAÍZ sí
espera el alias `dist/platform.css`, línea ~3210: se retira en el mismo
commit del borrado); `dist/platform.css` no existe; el único
"consumidor" es un import fantasma en `app-platform/globals.css:14`
(`@import '@rottay/design-system/dist/platform.css'` — 404 hoy; deuda del
vertical app-platform, fuera de alcance F0.5); la fila de PERFORMANCE_BUDGET
muere con los presupuestos en F6. 5,3 MB de bundle zombie.
**Lote C2 ✅ `27db84b0f`** — `platform-identity-zero-gate` a `verticals/` con
la exención estrecha del propio nombre (constante + lookahead; exime un NOMBRE,
no licencia archivos), dientes probados en dos planos (drill de 6 vecinos +
mutación real revertida), test de exclusión reescrito para no pasar por vacío.
`verticals/` completa 5/5; suite 1619 (el drill nuevo), 24 = 23 estables +
deuda C3.
**Lote C3 ✅ `9a7241252`** — sello `build-vertical-css` unificado en los 5
sitios (3 archivos) + 4 bundles regenerados con diff probado de 1 línea; bonus:
2 tests del resolution-probe pasaron a verde (la regeneración refrescó dist/;
el rebuild completo sigue en el lote R).
**Lote D ✅ `1b47d9fed`** — boundaries/ completa (28/28): 9 capabilities + 3
tests-ley con carpeta propia. 2 roturas reales no censadas arregladas (spawn
por basename; raíz a mano sin helper en un test). **`hooks-manifest.json`
regenerado en el commit** (1 línea, generatedBy): diferirlo dejaba un gate
BLOQUEANTE rojo (manifest-freshness) + 3 de suite — la recomendación del
worker era correcta porque esta regeneración NO cascada, a diferencia de la
C3.
**Lote E ✅ `8ecdbbb1a`** — `packaging/` (10) + `evidence/` (7) completas,
42/42; trinidad CRA-17 atómica (import cruzado resuelto dentro del commit).
**9 roturas no censadas** arregladas por Opus (auto-chequeo del license-gate
re-anclado al directorio —segundo gate que se atrapa solo—, floor sellado de
gat-07, `await import()` de cra-12, `new URL` como raíz a mano, spawn por
basename en generate-supplier-contract). Fix del coordinador al sellar:
`BASELINE_PATH`/`AUDIT_PATH` de gat-07 apuntaban dentro del capability —
corregidas a `'../..'` transitorio **hasta el lote H** (engine-token-audit se
mueve ahí; su F11 debe re-apuntarlas). Re-sello gat-07 con Node 22: write+check
verdes, hash determinista `66000795…a71e`. Suite: 1619 tests, 25 fallas =
23 estables + deuda C3 + **1 víctima nueva DETERMINISTA** de la carrera del
drill cra-12 (`hook-contract` MANIFEST_STALE; 60/60 aislado; misma deuda de
fixtures a tmpdir — cuando se arregle el drill caen las dos). lane-control
sin crecimiento (10/13). **Observación abierta para lote I:** `cra11:check`
sale 1 («stale census») con cifras nominales y su test verde — no está en el
manifiesto CI; Opus no lo verificó contra HEAD; la constante que lo explicaría
(`lib/cra-11-adaptive-contract-census.mjs:1375`, `generatedBy`) es del lote I.

**Nota de índice (procedimiento):** 14 renombres puros del lote F (ci/) se
commitearon por adelantado dentro de `dfcae623f` — error del coordinador:
`git commit` pelado con el índice del worker cargado. Sin daño (renombres
100%, el resto del lote cierra en su propio commit). **Regla dura nueva:**
los commits de docs del coordinador se hacen SIEMPRE con pathspec
(`git commit <path> -m …`) mientras un worker esté en vuelo.

**Lote F ✅ `4953e1c21`** — ci/ completa (14/14): runner, manifiesto, wiring,
workflow-wiring, red-inventory, analyze-bundle, budgets, ratchet, f0-honesty.
4 roturas no censadas arregladas por Opus (channel-liveness leía el manifiesto
plano — un archivo del lote G roto HOY; fixtures a profundidad vieja ×2; HERE
en f0-honesty). **`gates:ci` con worker en pausa: 78 blocking VERDES** — pero
necesitó re-sellar la cadena de artefactos derivados que la migración
repo-root de Fase 0 dejó stale: customization-surface-report (solo digest) →
tokens-catalog (341 vistas + digest en la reconciliation curada) →
reads-adjudication (solo digest; sets 2607=2607) → controls-catalog →
**gat-07 siempre ÚLTIMO** (`a3e50930…`). Regla operativa nueva: los re-sellos
de frescura van antes que gat-07 en cualquier cierre. Lección de fondo: las
"23 estables" de la suite escondían gates BLOQUEANTES rojos (el positivo de
customization-surface) — suite roja ≠ ignorable; en H/I el gates:ci de cierre
puede descubrir más de estos (no quedan artefactos pineados conocidos stale:
la cadena quedó completa).

**Lote G ✅ `1e4770463`** — tokens/ completa (32/32, 15 capabilities). 7
roturas no censadas arregladas (engine-freeze importaba del lote H; 2da
edición en quality-evidence declarada; self-spawn por basename ×4). Suite
**23/23 exactas, 0 nuevas, 0 ausentes** — el sello de F absorbió la deuda C3
y la víctima de la carrera cra-12 dejó de manifestarse. Coordinador: 4 sellos
`generatedBy` actualizados + cadena re-sellada en orden (census →
reconciliation → kimi-preservation → controls → tokens-catalog → gat-07
último `b0b87c61…`).
**Lote R ✅ `1156d1fb3`** (coordinador) — rebuild dist completo (salda H3 de
la auditoría Fable de F0: dist fresco tras los toques de src de F0.10/F0.13)
+ TAXONOMY re-derivado (98 prim/133 fam). Cadena C3 + distfresh + gat-07
verdes.
**Lote H ✅ `b554bdccc`** — engine/ completa (39/39, 12 capabilities + 8
tests-ley + baseline de 6 lectores reubicado con el audit). 9 clusters no
censados arreglados (imports cruzados engine↔engine que wiring-coverage
declaró huérfanos; vitest «no tests» silencioso recuperado; libs que importan
engine/). Constantes transitorias de E re-apuntadas (comentario borrado). C1
aplicado por idioma. Opus detectó y revirtió solo un reemplazo amplio (11
archivos restaurados). Coordinador: cadena tokens + **rebuild dist** (los
productores movidos invalidaban el stamp) + gat-07 último (`565eb6e7…`).
**gates:ci: 78 blocking VERDES**. Plano en scripts/: 1 producción
(audit-vertical-compliance, lote J) + 6 tests.

**Lote I ✅ `45e46d778` — PASO B COMPLETO.** lib/ en sus 10 subfamilias §2.9
(repo-root/ intacto). cra11:check **cerrado**: ya venía stale (drift real
79→74 campos adaptativos, predata el Paso B) → deuda de cierre con
regeneración sighted. 4to caso del patrón existsSync-traga-rutas-muertas
(build-input-hash autonombrado). gates:ci **78 blocking VERDES**. Del
inventario del Paso A (222 movibles): 221 movidos — queda 1 (lote J).

**Lote G2 ✅ `d0a1e8453`** (coordinador) — los 3 artefactos de raíz de
paquete re-alojados en sus capabilities dueñas (report → census, KIMI →
kimi-preservation, reconciliation → tokens-catalog por su `generatedBy`).
Lectores re-apuntados (HERE-relativo); 3 contratos modern-rescue editados con
autorización expresa (CONSTITUTION_READY). Sello gat-07 intacto (esos
artefactos no son input). **Raíz del paquete sin artefactos sueltos.**

**Cierre de deudas del frente:** cra-11 ✅ `9f066d38c` (regen sighted
79→74: salen 6 campos de las surfaces remediadas en el Modern Rescue, entra
adaptivePacking — evolución intencional de `a9264be14`/`dcadb8474`). Drill
cra-12 → **diferido con análisis afilado**: la inyección en el árbol real es
de diseño (el gate digiere el árbol entero; una copia parcial ahoga la señal);
el fix honesto es espejo completo vía `--workspace-root` o una exclusión de
nombres `__drill__` en la re-derivación del hooks-manifest — ambos tocan
artefactos sellados, y la carrera hoy NO se manifiesta (suite 23/23). No es
bloqueante; queda para F1 con su lote propio.
**Graduación del manifest ✅ `a739b988e`** — `packages/core/manifest/`
(families/ intacto, 356 movidos). Censo fresco: 23 externos + 17 internos (5
que el censo viejo no tenía — trio cascade-*, taxonomy-parity — habrían roto
en silencio). Cirugía `..` medida; 5100 paths de index.json byte-idénticos.
Los 3 artefactos stale en HEAD (fanout-facts, mirror-parity, root-checklists)
NO se regeneraron — su regen es de **F2** (su dueño natural). Adjudicaciones:
phase-a no se reescribe (1082 citas selladas; scope `:!**/phase-a/**`); hueco
de wiring-coverage y forma capability de manifest/ (9 planos) anotados para
F1/Paso C; zombi de 12h/100% CPU eliminado. gates:ci **80 VERDES** + sello
gat-07 (`a0f35f34…`).
**F1 §4 — plan de ejecución (coordinador, 2026-08-20).** Alcance medido
contra el árbol: solo 2 enums vacíos (`chrome.anatomy`, `profiles.expressive`)
— los otros 10 dominios sin `enumValues` son kinds no-enum legítimos (scale/
bounded/profile-id/…). Lotes:
- **F1.2** — vocabulario cerrado **SIN lift** (corregido por el worker con
  evidencia, adoptado por el coordinador): el ruling escrito
  `vocabularyDomicile` (customization-model.json) ya adjudicó el domicilio —
  `calibration.catalog` con su `*Law` hermana; el `domain` se regenera entero
  y el lift se auto-cancela. La condición de disparo del ruling NO se cumple
  (el consumidor runtime sigue satisfecho sin el registro). F1.2 es entonces:
  (a) **paridad `calibration.catalog` ↔ `cascade/roots` variants** por eje,
  bloqueante en program-check; (b) ley de forma: `kind enum/closed-enum ⇒
  enumValues no vacío O calibration.catalog presente`; (c) las 3 divergencias
  de datos resueltas contra runtime: `cardComponent`→`card` (la constante
  runtime dice card), `motif` se recorta a los 4 valores runtime (none,
  micro-grid, pinstripe, contour — los otros 3 no existen en fuente),
  `density` entra al catálogo (eje de ExpressiveAxes con 3 valores).
- **F1.3** — exposure gate: lee `cascade/root-catalog.json` (frescura +
  `exposure`): 26 tenant-dial / 27 internal-head / 10 gap gobernados.
- **F1.4** — `internalChannels`: primero las 444 con `targetBinding`
  (mecánico), después las 3.194 de autoría nueva por familia/tier (diseño).
- **F1.5** — `program-check`: validación de celda gobernada (rules:633 hoy a
  medias) + cierre con auditoría Fable del frente.
**F4A-1 — diseño del DT ASENTADO (2026-08-20).** Dos documentos:
`/tmp/f4a-1-adjudicaciones-definicionales.md` (las 5 definiciones que F4A-0
probó no-medibles: metadato = LISTA enumerada de 36, denominador de pintura
3.690; asignación = posición autorada EN FUENTE, el roster es output del
esquema no herencia del catálogo; 2 var() fantasma rastreadas no bloqueantes;
asimétricas = 16; tier.page.fg = 42) y `/tmp/f4a-1-esquema.md` (la decisión
central: **la asignación vive en la fuente como tags JSDoc de vocabulario
cerrado** — `@domicile` + `@governor` — que el harness parsea mecánicamente;
ni metadata paralela ni prosa libre; artefacto compilado byte-idéntico, mismo
export, mismo lowering, sin segunda foundation. Los 6 nudos adjudicados: K1
descongelar primary con valor sin cambiar; K2 `--ds-color-border` raíz
canónica del par, evnto invierte, R35 REDERIVED; K3 raíz NUEVA
`--ds-color-text-page` (VER K3-REVISADO abajo — la primera versión,
`--ds-color-text-secondary` #A0A0A5, quedó FALSADA por medición del worker:
ese canal ya existía con otro valor y 262 lectores), los 42 derivan en
F4A-6; K4
las 16 con valor = resolución de hoy; K5 tabla bithire baseline con razón,
no se unifica; 10 por-crear seed, materialización a F2-asimétrico/F4B). En
producción: roster borrador por worker (F4A-1c, ver estado abajo).
**K3-REVISADO (adjudicación DT, 2026-08-20, tarde).** La medición del worker
de roster falsó la premisa original: `--ds-color-text-secondary` YA EXISTE en
las tres fuentes (baja del campo autorado `textSecondaryColor`; rottay
#B0B0B5 base / #6B6B6B light) y lo leen **262 archivos** en `src/`. Derivar
los 42 de él repintaría (base #A0A0A5→#B0B0B5) o repintaría a sus lectores
(al revés): ambas violan cero-delta. Decisión: (1) text-secondary INTACTO —
raíz seed existente gobernada por `textSecondaryColor`, dial tenant en F4B;
(2) la tinta de página se autora como raíz NUEVA **`--ds-color-text-page`**
(nombre sin colisión, verificado por grep en `src/`): rottay #A0A0A5 (48
literales fuente; bithire/evnto tienen CERO ocurrencias de #A0A0A5 — su
posture la mide el roster, no se inventa), domicilio seed, exposición
tenant-dial como cabeza de la cadena de tinta de tiers
(page→base→raised→overlay), materialización REDERIVED en F4A-6; (3)
overlay.fg citaba "la cabeza K3": ese nombre ahora es text-page. Lección de
método asentada: toda "convención medida" se verifica con grep del nombre
exacto ANTES de asentarla. Universo del roster: 66 raíces por tema donde
text-page se autore (total falsable lo declara el roster regenerado).
**Reconciliación de identidad (decisión 13) EJECUTADA — commit
`85d0583b9`.** 16 archivos: AGENTS.md + contratos modern-rescue + v2
(SIGHTED_APPROVER='Kimi K3 (DT)'; la clave `codexSightedApproval` y los enums
`*_PENDING_CODEX_AUDIT` NO se renombran — romperían receipts) +
`manifest/generator/index.test.mjs` (el drill de conflicto producer=approver
ahora usa la constante SIGHTED_APPROVER — tracción con el seat, no nombre
duro; este archivo era un gate que el worker no corrió y yo lo reparé antes
del commit). Succession = cadena de 2 registros unbroken validada por
program-check; fence DT≠auditor como fallo cerrado. Verificado por mí contra
el árbol (no de palabra): CONSTITUTION_READY, 41/41 + 36/36 + drills 133/133,
gates:ci **87 blocking PASS** + 2 excluded re-adjudicados.
**F4A-3b ✅ (re-ejecutado sobre el harness arreglado; worker Opus; verificado
por el DT contra el árbol).** Canon de comentarios aplicado, **byte-idéntico
probado ida y vuelta** (revert→build→idéntico→re-aplicar→idéntico): **45
docblocks narrativos fuera, 114 del kit adentro, 37 tags** (32 seed + 5
pro-expert — son 5 y no 6 porque evnto no tiene `const MOTION`, el hallazgo de
F4A-2 otra vez consistente; **0 baseline, 0 @placeholder, 0 en el esqueleto**).
**`untaggedAuthoredLeaves` 3686→3029** (baseline bajado por el DT en este
commit, verificado contra el artefacto regenerado); `divergentSlots` **2268
clavado** (los tags no son posiciones; los placeholders de F4A-4 sí);
matriz 2613/345 y sourceSkeleton 1820/1503/397 intactos. Banners ya
canónicos (0 trabajo); orden alfabético NO-OP medido (0 consts movidos). La
excepción única de §3: `rottay CHROME.statsGrid` (`token-overrides` no es dial
de rottay en el roster) → nota de clase, adjudicación pendiente del DT. La
cadena arrastró `fanout-facts.json` (**990 citas file:line movidas por los
comentarios, CERO medición movida** — exactamente lo que un cambio de
comentarios debe producir; el worker lo regeneró y lo reportó en vez de
esconderlo, correcto). mirror-parity: **solo provenance**. docs-engineering:
**vacío** (`tokens:catalog:write` sin un solo diff — ningún valor ni conteo de
lectura cambió). Suite: el worker midió 1711/15 con las **2 forcing functions
diseñadas** (el pin del baseline + el test de F4A-2 que pineaba
`tagRegistry.count === 0`); ambas las resolví YO en este commit: (1) baseline
bajado 3686→3029; (2) ese test reescrito como **AGED_EXPECTATION** (ahora
valida vocabulario cerrado + failures vacíos sobre los 37 tags reales) → suite
de vuelta en **1711/13**. gat-07 **re-sellado por el DT**: digest
`fec98f592242…` (src/ cambió: comentarios entran al digest). Leyes: los 45
docblocks leídos uno por uno, **28 con ley real** → verbatim re-domiciliado en
`docs/f4a/leyes-fuentes-themes.md` (lo escribí yo, del verbatim del worker; la
referencia tema:línea es pre-edición; incluye la memoria de tranches
ROTTAY-T2/MASS-C3/EVNTO-TERMINAL-2/T1/K0.6 que F2 citaba).
**Lote drill→tmpdir ✅ `003b8f7ba` (worker Sonnet, verificado por el DT contra
el árbol).** La 14ª falla de la suite (carrera ENOENT del drill de
cascade-ratchet plantando en `src/`) queda erradicada: el walker compartido
(`lib/engine/skin-files`) gana una costura de raíz con default inerte (los
otros 2 consumidores intactos, 391 archivos igual) y el drill planta en
sandbox tmpdir — dientes probados por el worker en las dos direcciones (sin
planta no hay hallazgo; planta-no-vista tampoco) y gate verde con las cifras
del baseline (2171/4374/391). Suite: **1711/13 ×2 corridas idénticas por
nombre (worker) + mi propia corrida de la pierna 1 (1711/13, 0 ENOENT)** — la
baseline de suite queda **1711/13** (los +6 tests de F4A-2b). gates:ci: **88
blocking + 2 excluded verdes** en este commit. Deuda anotada (no tocada, con
su razón): `cra-12-motion-governance.reanchor.test.mjs:50` tiene la misma
forma de inyección-en-árbol-real PERO su comentario la justifica (el digest
auditado puede depender del árbol completo) — análisis propio cuando se
manifieste; hoy no es roja.
**F4A-13 ✅ (worker Opus; parada 19/19 correcta con DOS premisas falsas mías
medidas contra el árbol, adjudicadas y re-despachadas; verificado por el DT) —
capacidades + forma + residuos. EL FRENTE QUEDA CERRADO SALVO `CHROME.table`
(K5/F4A-15).** Mis premisas falsas, medidas por el worker: (a) mis 8 familias
contenían 67 de las 181 — el resto era **TYPOGRAPHY base huérfana (48)** (el
diseño de lotes la asignó a F4A-6, que hizo el nudo K3, no la familia), el
**esqueleto THEME.\* (26)** (taggeable desde mi fix de F4A-8 — el worker
verificó la línea 225) y **table (40)**, excluida por mi propio brief; (b) 28
de los 67 (CHARTS + CHROME.accent) no encajaban en ninguna de mis 3 categorías
sin inventar un ancla falsa (vocabulario de forma que no baja a canal y sin
capability que lo gobierne — `expressive` solo activa en bithire, medido).
**Adjudicaciones MÍAS**: CAPABILITIES.\* (24) `pro-expert` anclado a SU PROPIA
capability con el estado autorado medido (la hoja ES la declaración — verdadero
en los 3 temas); CHARTS+accent (28) `unassigned` + governor con la razón medida
(vocabulario de forma consumido como argumento; disposición final F4A-close) —
NO se inventó clase nueva; TYPOGRAPHY (48) kit estándar; THEME.\* (26)
`unassigned` + "el esqueleto cablea los planos, no autora pintura" (la ley
F4A-3b por hoja); table intacta para K5. **141 tags + 20 placeholders = 161
docblocks**; `untaggedAuthoredLeaves` 181→**40** (exactamente las de table — mi
predicción, clavada), `divergentSlots` 39→**33** con la nota medida escrita en
el test: el contador NO llega a 0 por esta vía (los 33 restantes son slots que
NINGÚN tema autora — un placeholder no puede darles posición; **el 0 real lo
certifica el gate `realKeypathParity` de F4A-close**, adjudicación A4), espejo
positionIntersection 2520→**2526**, universo 2559 e intersección 342 clavados,
tagRegistry 3938→**4099**. **Dos bugs del worker atrapados por sus propias
verificaciones** (índice sin normalizar `BrandTheme$ → THEME` como el parser;
prefijo de placeholder trepando por encima de la familia → el guard de
@placeholder contradictorio del harness lo rechazó con 4 failures — restauró a
HEAD y acotó: el instrumento hizo su trabajo). Byte-identidad ×3 builds reales.
Cadena completa verde; digest reconciliation `1ec7b2797c05` (NOVENA vez
huérfano). Batería ×2: rosters 1304/1304 enteros, mirror 44/44, variant 34/34
tras la Baja, root-exposure 13/13, pierna 1 MÍA **1717/13** por nombre (par
export-* pair-aware). gat-07 re-sellado por el DT: `8dc47e9bc302…`. gates:ci
**88+2 verdes**. **Siguiente lote: F4A-14 = K4** (las 16 asimétricas con valor
= resolución computada de hoy) y después **F4A-15 = K5** (tabla bithire =
baseline con razón, NO se unifica; cierra las 40 hojas de CHROME.table).
**F4A-12 ✅ (worker Opus; verificado por el DT contra el árbol) — el barrido
de las CHROME chicas (47 pares familia×tema, el lote más ancho).** **527 tags
+ 209 placeholders = 736 docblocks** cubriendo las 533 hojas pendientes (565
totales menos 32 ya taggeadas por K1/F4A-6/9/10/11, respetadas) y **845
ausencias** reconciliadas una por una (todas piso — medido por placeholder;
cero overlay/preset). Cero colapsos a padre: ninguna de las 36 familias usa la
forma multi-clave (medido). **Ciclo de vida: 15 de 15 retirados** (rottay
surface/premiumCard/backTop/liveFeed/skeleton/spinner + bithire
filterPill/badge/premiumCard/surface/signalCard/listingGrid/detail + evnto
premiumCard/cardComponent — todas enteras, medido familia por familia);
**queda UNO: `rottay table` (1/18 cubierta — va con K5 en F4A-15)**.
**Corrección del worker a mi brief, aceptada**: `statsGrid` NO tenía tag de
sección que retener (era una de las 6 parciales sin tag) — sus 13 hojas
llevaron la **nota de clase** en el governor (`token-overrides no es dial de
rottay en el roster — adjudicación pendiente en F4A-close`) y nada quedó
retenido. **La aritmética honesta otra vez**: `untaggedAuthoredLeaves`
499→**181** (−318, no −324: los 6 de diferencia son los booleanos de forma
`CHROME.card.hoverTint`/`showBorder` ×3 temas en METADATA_EXCLUSION — nunca
contaron en el denominador de pintura; tras el lote quedan **0** hojas sin
cubrir en las 36 familias). `divergentSlots` 172→**39** (−133, espejo con
positionIntersection 2387→**2520** — sexta vez la misma ley; la superficie de
ausencia parcial casi agotada), universo **2559** e intersección **342**
clavados, tagRegistry 3217→**3938** (+721 = 527+209−15). **Baja #12 del
baseline, bajada por MÍ.** Byte-identidad ×3 builds reales. **Aviso §8 del
worker adjudicado por el DT**: el cierre del frente faltaba por 6226 B en
`runtime/tenant` → **7 techos con 1,5× de aire** (tenant 1050000→**1100000**,
column-menu 2550000→**2600000**, toast 1750000→**1800000**, presence
1800000→**1850000**, motion 1700000→**1750000**, tag/badge 1600000→**1650000**)
— proyección 39285 B para las 181 hojas restantes a 217 B/hoja medidos; los
subpath mueren en F6. Cadena completa verde; digest reconciliation
`8b566000cfaf` (OCTAVA vez huérfano). Batería ×2: rosters 1304/1304 enteros,
mirror 44/44, variant 34/34 tras la Baja, root-exposure 13/13, pierna 1 MÍA
**1717/13** por nombre (par export-* pair-aware). gat-07 re-sellado por el DT:
`363f99b7a859…`. gates:ci **88+2 verdes**. **Siguiente lote: F4A-13**
(capacidades + forma + residuos: MOTION/RECIPES/EXPRESSIVE/CAPABILITIES/CHARTS/
accent/toolbar/OVERLAY.typography — las 181 hojas restantes).
**F4A-11 ✅ (worker Opus; verificado por el DT contra el árbol) —
navegación/estructura (14 familias chrome chicas y heterogéneas).** **337 tags
+ 171 placeholders = 508 docblocks** cubriendo las 337 hojas pendientes (345
hojas totales menos 8 ya taggeadas por K1/F4A-6, respetadas) — **cero
agrupaciones: ningún subárbol resultó uniforme, medido, así que cada hoja
pendiente recibió su tag propio** — y 339 ausencias reconciliadas (todas piso,
medido por placeholder; cero preset/overlay). **Ciclo de vida: 9 de 9
gap-medido retirados** (rottay popover/modal/tabs/drawer/dropdown/notification
+ bithire shell/modal/tabs) al quedar sus familias ENTERAS hoja por hoja; los
16 restantes intactos (verificado por mí: 7/7/2); `statsGrid` no tocada (es de
F4A-12 con su excepción). **La lectura honesta del contador, medida por el
worker en vez de supuesta:** `untaggedAuthoredLeaves` baja **−64** (563→**499**)
y no −337: solo 64 de las 345 hojas estaban SIN CUBRIR en HEAD (36/19/9); las
otras 281 ya estaban cubiertas por los tags de familia que este lote retira —
el frente cambia DE QUÉ están cubiertas (de afirmación no probada a tag de hoja
medido), que no se ve en el contador. `divergentSlots` 271→**172** (−99, espejo
con positionIntersection 2288→**2387** — quinta vez la misma ley; el worker
anotó que la superficie se agota), universo **2559** e intersección **342**
clavados, tagRegistry 2718→**3217** (+499 = 337+171−9). **Baja #11 del
baseline, bajada por MÍ.** Byte-identidad ×3 builds reales. Cadena completa
verde; digest reconciliation `10d253c69a57` (SÉPTIMA vez huérfano). Batería ×2:
rosters 1304/1304 enteros sin moverse, mirror 44/44, variant 34/34 tras la
Baja, root-exposure 13/13, pierna 1 MÍA **1717/13** por nombre. gat-07
re-sellado por el DT: `2454accb7c20…`. gates:ci **88+2 verdes**. **Siguiente
lote: F4A-12** (barrido de TODAS las CHROME chicas restantes — tarjetas/datos
sin table; el lote más ancho en familias; si el worker proyecta demasiado, se
parte 12a/12b — decisión del DT al despachar).
**F4A-10 ✅ (worker Opus; parada 18/18 correcta y adjudicada; verificado por el
DT contra el árbol) — OVERLAY.chrome SOLA, el lote más grande del frente.**
**636 tags + 436 placeholders = 1072 docblocks** cubriendo las 831 hojas
reales (premisa corregida por el worker y verificada: **507/293/31**, no
571/293/34 del mapa — los 64+3 colapsados por K1/F4A-6/K2 trazan a
adjudicaciones nombradas; `solo-arbol` = 0 en los 3, no apareció ninguna hoja)
y **1299 ausencias** reconciliadas una por una (117 con contraparte en el
CHROME base / 319 piso / 0 preset — medido, no asumido). Cero tags sin línea
resuelta (esta familia no tiene la forma multi-clave de F4A-9 — medido).
**Ciclo de vida confirmado: 0 gap-medido dentro de `const OVERLAY`** (los 25
restantes viven en el CHROME base y se retiran en F4A-11/12). **Parada 18/18:
techo de bytes otra vez** — exceso de 3174 B en `collection-workspace`; mi
subida de 4 techos en F4A-9 promovió a los siguientes. **Adjudicación MÍA de
una vez: los 17 techos dimensionados para el FRENTE COMPLETO** (proyección
325017 B para las 1394 hojas restantes a 233 B/hoja medidos en este lote +
25% de aire; la tasa sube porque el renglón caro son los placeholders y crecen
con la disparidad de la familia — proyectar con la tasa vieja habría repetido
el error). Verifiqué los 17 techos viejos contra el manifiesto: 17/17. Con
eso **el frente restante YA ENTRA**: holgura medida +87557 B para F4A-11..15
(margen mínimo 218823 en runtime/tenant). **Contadores medidos y verificados
por mí contra el artefacto:** `untaggedAuthoredLeaves` 1394→**563** (−831
exacto = 507+293+31), `divergentSlots` 958→**271** (−687, espejo con
positionIntersection 1601→**2288**, re-anclado medido por el worker — cuarta
vez la misma ley), universo **2559** e intersección autorada **342**
clavados, tagRegistry 1646→**2718** (+1072). **Baja #10 del baseline, bajada
por MÍ.** Byte-identidad ×3 builds reales. Cadena completa verde; digest
reconciliation `cee2453dc5f0` (SEXTA vez huérfano — la automatización es deuda
escrita de F4A-close). Batería ×2 (worker + DT): rosters 1304/1304 enteros sin
moverse, mirror 44/44, variant 34/34 tras la Baja, root-exposure 13/13, pierna
1 MÍA **1717/13** por nombre (par export-* pair-aware). gat-07 re-sellado por
el DT: `b15a9a2ab6c1…`. gates:ci **88+2 verdes**. **Siguiente lote: F4A-11**
(navegación/estructura — 14 familias chicas de afinidad chrome; ahí se retiran
los primeros tags gap-medido del CHROME base al quedar probadas hoja por hoja).
**F4A-9 ✅ (worker Opus; verificado por el DT contra el árbol) — CHROME.controls
SOLA (la 2ª familia más grande; el lote más grande del frente).** **584 tags +
295 placeholders = 879 docblocks** cubriendo las 772 hojas pendientes (384
rottay + 295 bithire + 93 evnto; las 18 ya taggeadas por K1/F4A-6 respetadas —
doble docblock = alcance ambiguo) y 550 ausencias reconciliadas una por una
(piso 294 / contraparte 1; el spread de preset NO aplica en chrome — medido, no
asumido). **La trampa de forma a escala, resuelta honesta**: 85 hojas apiñadas
en línea compartida (los controles de botón) — 10 padres de clase única con el
tag exacto + **5 padres de governor mixto con el desglose medido en una línea**
(`mixta medida en linea compartida: N por X; M por Y — …`), cero reformateo; si
hubiera habido DOMICILIOS mixtos en una línea habría parado (el domicilio es de
valor único) — no fue el caso, medido. **Contadores medidos y verificados por
mí contra el artefacto:** `untaggedAuthoredLeaves` 2166→**1394** (−772 exacto),
`divergentSlots` 1414→**958** (−456, espejo con positionIntersection
1145→**1601**, re-anclado medido por el worker — tercera vez la misma ley),
universo **2559** e intersección autorada **342** clavados, tagRegistry
767→**1646** (+879). **Baja #9 del baseline, bajada por MÍ.** Byte-identidad
×3 builds reales (hash conjunto idéntico en ida y vuelta, con verificación de
QUE los 7 pasos corrieron — la lección de su propio casi-falso-verde de F4A-7).
Cadena completa verde; digest reconciliation `9ca6aa1bcb50` (QUINTA vez
huérfano — la automatización ya es deuda escrita de F4A-close). **Aviso del
worker (§8) adjudicado por el DT DE UNA VEZ**: la proyección del resto del
frente es ~271 KB (1394 hojas × 194 B medidos en este lote — la tasa subió
porque controls tiene mucha superficie de ausencia parcial) → techos subidos
con aire para que F4A-10 no arranque parada: `primitives/tag`
1350000→**1550000**, `badge` 1350000→**1550000**, `skeleton`
1450000→**1650000**, `typography` 1450000→**1650000** (bytes de hoy verificados
por mí contra el gate: 4/4 exactos; `_note` fechada; los subpath mueren en F6).
Batería ×2 (worker + DT): rosters 1304/1304 enteros sin moverse, mirror 44/44,
variant 34/34 tras la Baja, root-exposure 13/13, pierna 1 MÍA **1717/13** por
nombre (par export-* pair-aware). gat-07 re-sellado por el DT:
`dcb640f08086…`. gates:ci **88+2 verdes**. **Siguiente lote: F4A-10**
(OVERLAY.chrome, la familia más grande — SOLA; los techos ya tienen aire).
**F4A-8 ✅ (worker Opus + cierre con DOS ediciones del DT; verificado por el DT
contra el árbol).** Tags por hoja de **SURFACES + THEME**: **96 tags** por
subárbol uniforme maximal (rottay 20/30, bithire 75/94, evnto 1/2) + **59
placeholders cubriendo 189 ausencias** con TRES mecanismos medidos (19 evnto
aportadas por el preset congelado `EVNTO_CANONICAL_SURFACES` via spread —
escribirles "lo resuelve el piso" habría sido FALSO; precedente: el placeholder
de MOTION ya usa esa fórmula). **Desviación de premisa medida y aceptada:**
evnto SURFACES autora **2 hojas, no 21** (el mapa cuenta evaluado, el léxico
autorado — la ley de las dos unidades otra vez). Trampa de forma atrapada por
la verificación previa del worker: `gradients` en una línea colapsó a UN tag
con la división medida declarada (cero reformateo — el lote es solo
comentarios). **Parada 17/17 correcta y luego AUTO-CORREGIDA por el worker:**
su "adaptive-overlay al ras" era falso positivo de método (tamaño ≠ alcance —
ese entrypoint no toca las fuentes de tema; medido con gate antes/después:
18 entrypoints crecen +24849, adaptive-overlay clavado). **Adjudicación MÍA
que queda en pie**: los techos se subieron para el FRENTE (proyección 264 KB
restante: divider/typography/badge/tag/card/presence/skeleton/motion/toast
reventaban en uno o dos lotes) — **13 techos se quedan;
`./patterns/adaptive-overlay` se REVIRTIÓ a 338697** (nunca alcanza estas
fuentes: ruido de gobierno que se limpia solo). **Fix del parser MÍO, en dos actos** (instrumento gobernado = pieza
del DT): (1) `pathIndex` exigía `^const` y el esqueleto es `export const
…BrandTheme = {` → ninguna hoja THEME.* podía recibir tag; (2) con la raíz
abierta, la coherencia F4A-2b detectó la ruta fantasma `THEME.surfaces` en
evnto (`surfaces: { ...EVNTO_CANONICAL_SURFACES, ...SURFACES }`) — segunda
edición MÍA: la composición por spread inline CABLEA, no autora, y ya no anota
ruta (la llave sigue contando para el nivel; `malas` medidas: 0 en los 3).
Radio cero medido por el worker (contadores idénticos), por mí (ningún drill
usa `export const` en fixtures — grep), y por la coherencia misma. Con el fix, los 3 tags
`THEME.appearance.defaultMode` entraron (kit estándar; adjudicación MÍA: NO es
metadato inerte — selecciona el bloque emitido; METADATA_EXCLUSION lo
escondería del denominador de pintura y eso sí sería falso).
**Contadores medidos y verificados por mí:** `untaggedAuthoredLeaves`
2295→**2166** (−126 SURFACES exactas − 3 THEME tras el fix), `divergentSlots`
1519→**1414** (−105, espejo con positionIntersection 1040→**1145**, re-anclado
medido por el worker), universo **2559** e intersección **342** clavados,
tagRegistry 609→**767** (+155 del worker + 3 míos). **Baja #8 del baseline,
bajada por MÍ.** Byte-identidad probada ×3 builds reales por el worker + 1 mío
tras mis ediciones. Cadena completa verde; digest reconciliation
`75835e120733` (CUARTA vez huérfano — la automatización queda escrita como
deuda de F4A-close). Batería: rosters 1304/1304 enteros sin moverse, mirror
44/44, root-exposure 13/13, pierna 1 MÍA **1717/13 por nombre** (par export-*
pair-aware). gat-07 re-sellado por el DT: `bb6b0bb1cf88…`. gates:ci **88+2 verdes**.
**Siguiente lote: F4A-9** (CHROME.controls, la 2ª más grande — SOLA).
**F4A-7 ✅ (worker Opus; parada 16/16 correcta y adjudicada; verificado por el
DT contra el árbol).** Tags por hoja de **OVERLAY.palette + OVERLAY.surfaces**
en los 3 temas: **240 docblocks** (por subárbol uniforme maximal, NUNCA a
nivel familia — el tag sobre `OVERLAY.palette.ramps` cubre 80 hojas y es
falsable: las 80 medidas literales y con `control: null`; no es la herencia
que F4A-3c retiró) + **90 placeholders de hoja cubriendo 272 ausencias** con
la razón MEDIDA por mecanismo (14 con contraparte en el plano base / 76 sin
contraparte en ningún plano — escribir una sola razón habría mentido en 76).
Clasificación hoja por hoja MEDIDA (var/color-mix → derived con raíz real;
atribuido en el mapa → seed + dial; sin atribución → seed + `dial en F4B (sin
control atribuido)`, la fórmula del roster). Las 2 `textPageColor` ya tenían
tag de K3 — excluidas (doble docblock = alcance ambiguo). **Ciclo de vida de
los tags "gap medido" estrenado**: `rottay OVERLAY.surfaces` (15/15) y `evnto
OVERLAY.palette` (104/104) quedaron probadas hoja por hoja y sus tags de
sección de F4A-3c se RETIRARON (los otros 25 intactos hasta su lote).
Corrección de premisa del worker verificada: rottay OVERLAY.palette mide
**159** (no 160 del mapa histórico: −borderPrimaryColor K2, −linkHoverColor
K1, +textPageColor K3 — cada delta traza a una adjudicación nombrada). Trampa
de vocabulario asentada: el mapa nombra `modes.light.palette.*` y el léxico
`OVERLAY.palette.*` — intersección literal CERO, se cruza por cola de ruta.
**Contadores medidos y verificados por mí contra el artefacto:**
`untaggedAuthoredLeaves` 2655→**2295** (−360 = 158+121+80+1; las 2 familias
con tag de sección no bajan dos veces), `divergentSlots` 1669→**1519** (−150
por los 90 placeholders; `positionIntersection` 890→**1040** espejo exacto,
re-anclado medido por el worker con la razón escrita en el test), universo
**2559** e intersección autorada **342** CLAVADOS (el lote no agrega hojas),
tagRegistry 281→**609** (+328 = 240 tags − 2 retirados + 90 placeholders).
**Baja #7 del baseline, bajada por MÍ.** **Parada 16/16: techo de bytes** —
las 3 fuentes +48642 B por 330 docblocks reventaron `./runtime/provider`
(+37231) y `./patterns/charts` (+6530) y `prebuild` cortaba antes de `tsc`
(build que nunca corría = byte-identidad NO probada; el worker casi come un
falso verde y lo detectó revisando QUÉ pasos corrieron, no el resultado).
**Adjudicación MÍA: (A) sola** — techos subidos con aire de una vez
(provider 1350925→**1900000**, charts 1821262→**2350000**, `_note` fechada:
el frente proyecta ~medio MB de comentarios en 8…15; los subpath mueren en
F6); (B) descartada (no resolvía provider y re-introducía tags de familia).
Byte-identidad probada con TRES builds reales (ida y vuelta). Cadena completa
verde; digest de reconciliation re-anclado a `5524ba2086ff` (TERCERA vez
huérfano tras un lote de fuentes — candidato a automatizarse, anotado);
reads-ledger 2607/2607; root-catalog 64 OK; root-exposure 26/28/10 OK.
Batería: rosters 1304/1304 ENTEROS (sin moverse: cero valores), mirror 44/44,
root-exposure 13/13, pierna 1 MÍA **1717/13 por nombre** (diff vacío contra
las 13 conocidas). gat-07 re-sellado por el DT: `bfa9b8724a27…`. gates:ci:
**88 blocking + 2 excluded verdes**. Lección operativa del DT asentada en el
prompt §2: verificar input VACÍO antes de pegar briefs (dos contaminaciones
de residuo, una con alcance falso — aclarada al instante). **La deuda cra-12
SE MANIFESTÓ (estaba anotada "análisis propio cuando se manifieste"):
`cra-12-motion-governance.reanchor.test.mjs` planta
`src/foundation/tokens/css/__cra12-reanchor-drill.css` en el árbol REAL durante
la suite, y `deriveHookManifest` lee ese árbol — si la derivación de uno de
los dos drills export-* cae dentro de la ventana de la planta, le llega
MANIFEST_STALE de regalo y el test queda rojo.** Prueba de raza y no de lote:
la derivación es determinista y coincide con el disco en árbol quieto (medido
por mí), y la pierna 1 DEL WORKER sobre el mismo árbol dio el resultado viejo.
Efecto: el par export-missing/export-unshipped es UN slot rojo decidido por la
carrera (estable como export-missing desde F4A-5; rotó a export-unshipped en
mi corrida post-F4A-7 por los timings nuevos). Las 13 conocidas quedan 13 con
el par como slot único (baseline de nombres pair-aware). **Deuda para
F4A-close (test-hygiene): aislar la planta del read-set del manifest**
(exclusión `__cra12-*` o scope fuera de styleRoots — decisión de implementación
de ese momento). gates:ci no se afecta: el GATE no planta nada; la carrera vive
solo en la suite concurrente. **Siguiente lote: F4A-8** (SURFACES + THEME,
mismo molde).
**F4A-3c ✅ (worker Opus; verificado por el DT contra el árbol) — el paquete
corrector post-auditoría Codex.** (a) **Los 27 docblocks de familia quedaron
ESTRECHADOS**: `@domicile unassigned` + `@governor gap medido: gobierno
parcial — <control> alcanza N de N+M canales de la familia (M sin control;
mapa-familia-canales, criterio estricto 2026-08-21); la prueba por hoja
aterriza en su lote F4A-7…15`. Censo verificado por mí: 14/10/3 = 27
escritos, 0 tags `seed`+`dial:` a nivel sección restantes; los tags de HOJA
(que citan la raíz del recableo — la prueba misma) intactos (resta exacta
22→8 / 17→7 / 10→7). **Desviación deliberada del worker a mi plantilla,
ACEPTADA**: mi "N de M" era aritméticamente "N alcanzados / M sin control"
(total = N+M); escribir "1 de 37" para tabs habría plantado una falsedad
(total real 38) en el lote que existe para retirar falsedades — escribió el
total verdadero conservando mis dos números medidos, y lo reportó con la
prueba (skeleton 2/1 y shell 22/21 tienen N>M, imposible bajo mi letra).
(b) **Mapa republicado con criterio estricto declarado**: `strictClass` en
las 115 familias + regla escrita en `method` + conteos `{limpia-estricta: 0,
gobierno-parcial: 33, mixta: 29, sin-control: 53}`; la medición histórica
quedó BYTE-IDÉNTICA (probado por mí: deepEqual true sin las columnas nuevas);
el .md conserva la lectura débil anotada como superada. (c) Métricas
CLAVADAS como mandó el diseño: divergentSlots 1669, untaggedAuthoredLeaves
2655, tagRegistry 281 — el corrimiento de domicilios ocurrió conservando el
total (seed 54→27, unassigned 152→179). (d) **Byte-identidad probada**: build
exit 0 y los 4 árboles compilados vacíos en git status; mirror-parity.json se
regeneró SOLO por huellas de fuente (6 diffs de provenance, cero métricas —
las líneas ni se movieron). Techo de bytes 423167/900000. Batería verde en
DOS corridas independientes (worker + DT): rosters 1304/1304 ENTEROS (ley del
erratum), mirror-parity 44/44, variant-parity 34/34, root-exposure 13/13,
pierna 1 mía 1717/13 por nombre. gat-07 re-sellado por el DT: `1c42b078f711…`
(invariante al censo — no digiere esos contadores; verificado con doble corrida
determinista).
**Lección de cadena, segunda captura** (primera: F4A-6): el censo censa
FUENTES y los comentarios cuentan — los 27 docblocks dejaron
`customization-surface-report.json` stale y el pin `positive: the full check
passes on the real tree` lo marcó en MI pierna 1 (la prueba de byte-identidad
del worker cubrió los árboles COMPILADOS; el censo de fuentes es otro eje).
Re-corrí la cadena completa yo (cifras clavadas: universo 7303, dead 266,
catalog 341 vistas, kimi 80+266, controls 13+7, fanout sin-clasificar 0,
variant-parity 2559/1669) y re-anclé el digest de reconciliation a
`1b1d21bf6388` (= sha256 real del censo — SEGUNDA vez que este digest queda
huérfano tras un lote de fuentes: no lo escribe ningún productor; queda
anotado como candidato a automatizarse).
**Deuda nombrada (reportada por el worker, adjudicación MÍA):** 6 familias
con gobierno parcial medido nunca tuvieron tag de sección (sidebar ×3,
statsGrid, tooltip, evnto surface) — NO se tocan: ninguna afirmación falsa
que retirar; sus hojas siguen en untaggedAuthoredLeaves y su prueba por hoja
aterriza en F4A-7…15 como todas. **Siguiente lote: F4A-7** por
`/tmp/f4a-lotes-7-13.md`.
**K1 ✅ (lote PROPIO del DT en su parte semántica + cierre mecánico por worker
Opus tras el recordatorio de delegación del dueño; verificado por el DT contra
el árbol, nunca de palabra).** Descongelado `--ds-color-primary` (el esquema
§4-K1 mandaba: literal EN la raíz, valor sin cambiar, raíz dialeable).
**Adjudicaciones nuevas del DT, con evidencia:** (1) **el mecanismo es PISO
LITERAL** — la vía paramétrica del diente (a) quedó falsada por medición (el
paso 500 ≠ literal de marca en 5 de 6 celdas: rottay 500=#A0A0A5/#6B6B6B,
bithire #376BAB en base, evnto #6B6B6B); por la ley del instrumento ("piso
LITERAL, AUSENTE o tema paramétrico = rootPinned"), `default.css:156` pasó de
`var(--ds-color-primary-500)` a `#171717` (su resolución de hoy; cero-delta
global — los 3 temas pisan la raíz). Negativo NOMBRADO: en el tema default la
raíz ya no sigue al paso 500 si se edita la rampa a mano; la derivación
semilla→rampa→primario vive en el control `palette.seeds` (declara ambos
canales como salidas), no en el piso. (2) **`--ds-button-primary-bg`**: rottay
y evnto recableados a `var(--ds-color-primary)` (idéntico en los 2 scopes,
medido) → paramétrico, sale de rootFrozen; **bithire INTACTO** (dark
`#1a7fe0` ≠ `#1e84e6` — intención divergente o near-dup, lo decide
F4B/F2-asimétrico; y mass-c3 no tiene mecanismo REDERIVED: tocar solo el base
rompía los pins firmados). Deuda nombrada. (3) **la marca dialeable YA
EXISTÍA** (root-catalog `ramp.seed.primary` = tenant-dial + palette.seeds — mi
respuesta de F4A-5 se verificó, no se escribió nada). (4) **REDERIVED
autorizado** name-only: T1 +3, T2 +9, T3 +14 (26 canales con colisión);
pre-imágenes y pins intactos — **0 líneas sha256 en los diffs**, probado por
mecánica de diff, no por lectura. **Recableo: 30 rottay + 2 evnto + 0 bithire
con razón** (sus 15 ya eran var; los 3 base-only cambiarían en dark → fuera
por cero-delta estricto). Medición reproducida por el DT dos veces (30/0/2).
rottay: 30 recables + 30 colapsos de overlay + 29 docblocks de hoja
(`@domicile derived / @governor deriva de: --ds-color-primary (semilla de
marca, K1)`); evnto: 2 recables + 2 colapsos (sitios multi-clave inline, sin
docblock — convención F4A-6: `color:` sí, `text:` no). **CERO-DELTA probado
por resolución de cascada contra HEAD: 0 diffs de resolución en los 3
artefactos (1212/1235/470 canales × 2 scopes) NI en el piso (1046 canales);
32 diffs de forma, exactos.** mirror-parity medido post-K1: rootFrozen
**[2,4,2]** (quedan color-error + sidebar-bg, y button-primary-bg solo en
bithire), readerEdges **[7,18,7]**, rootPinned [9,11,8] con la partición
11/15/10 INTACTA (K1 movió clases sin ensanchar alcance), severs [49,99,14]
clavados, reDerives [94,149,54] clavados, severedTotal 51/103/16, y el
trinquete `blockedUpstream` **24 → 4 por decrecimiento PURO** (subconjunto
estricto: salieron los 20 que colgaban de primary — el sexteto de F2.4
incluido —; los 4 supervivientes cuelgan de causas ajenas). **La congelación
murió: la raíz reclasificó a rootPinned floor-literal en los 3 temas, y su
dial ya alcanza a los 135 lectores vía el control.** Parada del worker 15/15
correcta: el **diente (a)** quedó huérfano de sujeto (K1 descongeló al
testigo) — adjudicación MÍA: re-sujetado a bithire `--ds-button-primary-bg`,
la única raíz congelada con lector bloqueado hoy (las 5 asertas siguen
mordiendo: 4→3, 103→102, 18→17, 2→1, bloqueados→0, verificadas por el worker
antes de escribir; nota de mantenimiento: se re-sujeta cuando esa raíz se
descongele; si la clase se vacía, sujeto sintético). Corrección de prosa del
worker aceptada: la caída real del trinquete bithire era 15→2 (13 de 15 por
primary), no 13→2. **ERRATUM F4A-6 confirmado mecánicamente** (`git show
HEAD:` líneas 1853/1865): el pin de vocabulario select de T2 ya medía
`chained`=9 en HEAD con el pin en 7 — nadie corrió T2 entero tras K3; K1
heredó 2 de los 3 deltas y su re-anclaje (chained 10, admitted 4, ∩ []→3 con
razón reescrita) cierra el erratum. Re-anclajes del worker, todos medidos del
artefacto: T2 light 135→126 y omitidos 13→22, T3 lightLeaves 164→150 e
idénticos 26→40 (con la cadena 4→+4→+18→+14=40 escrita y un título stale de
TRES olas corregido), mirror-parity pins completos + testigo del pin + la
coordenada del diente (b) 506→513 (las 7 líneas del comentario K1 del piso —
coordenada que corre, no ley que cambia). Cadena completa en el orden fijado:
universo censo 7303, reconciliation digest `066ccd97db34` (= sha256 real del
censo, verificado por el DT), catalog 341 vistas, fanout sin clasificar 0,
**reads-ledger 2607/2607 sin re-anclaje** (hooks-manifest no se movió),
root-catalog 64 raíces OK, root-exposure 26/28/10 OK. **Baja #6 del baseline,
bajada por MÍ**: divergentSlots 1694→**1669** (universo 2586→**2559** por las
32 restituciones colapsadas, 27 exclusivas; positionIntersection 892→**890**;
la ley universo−positionIntersection cierra: −27−(−2)=−25) y
untaggedAuthoredLeaves 2712→**2655** (−55 rottay + −2 evnto; tagRegistry
252→**281** por los 29 docblocks; 4 de las 32 colapsadas tenían tag:
1393→1338 rottay, 198→196 evnto — aritmética exacta contra HEAD). gat-07
**re-sellado por el DT**: `7ac1f9c2e5d1…`. Suite pierna 1, MI corrida: **1717/13** por
nombre (las 14 previas = 13 conocidas + el pin del baseline que bajé).
**Siguiente lote: F4A-3c** (paquete corrector post-Codex, diseño mío en
§"auditoría Codex", ejecución Opus) y después F4A-7…15 por
`/tmp/f4a-lotes-7-13.md`.
**AUDITORÍA CODEX ad hoc (2026-08-21, pedida por el dueño sobre HEAD
`3af69a654`) + verificación MÍA claim por claim contra el árbol.**
Veredicto: la dirección es correcta (F4A-5/6 van bien; NO se revierten) con
**UNA desviación semántica bloqueante confirmada** + 2 doc-drift + 1 brecha
de gate. (a) **BLOQUEANTE — la clasificación "33 limpias" no prueba lo que
los tags de familia afirman.** Recomputé `mapa-familia-canales.json`: el
criterio del mapa (un solo control ENTRE LOS ATRIBUIDOS) da 33/29/53 ✓
idéntico al .md; el criterio estricto (un solo control + CERO canales con
`control:null` + cero hojas sin atribuir) da **0 limpias** — las 33 cargan
nulos TODAS (rottay modal 1/14, tabs 1/37, sidebar 34 hojas/36 nulos;
bithire badge 1/57, tabs 1/54; evnto OVERLAY.palette 3/115). Los 27 tags de
familia mapeados (`@governor dial: X` a nivel sección) afirman gobierno
probado para una fracción mínima de las hojas; el harness valida sintaxis y
cobertura, no gobierno real. La adjudicación débil fue MÍA (línea ~1173:
"tags de familia SOLO donde limpios" con el criterio del mapa) y el mapa.md
nunca declaró que "limpia" cargaba nulos. Los tags de HOJA de F4A-5/6/K1 son
otra clase (citan la raíz del recableo, que ES la prueba) — intactos.
(b) **registry/checkpoint stale** — `roadmap/registry.json` (declarado
`statusAuthority` en program.json) dice "Codex remains the final machine and
sighted auditor and local committer" y 252 familias (son 255);
`checkpoint.intent.json` habla de spacing.rhythm y carriles retirados;
program-check no mira coherencia temporal. (c) **roster stale (menor)** —
`tier.page.fg` decía "materializa F4A-6" en futuro estando aterrizado.
(d) **brecha de gate (diseño)** — `@placeholder` da posición por prefijo
(variant-parity:437, adjudicación F4A-4 deliberada) y puede bajar
`divergentSlots` sin keypath real; la salida contractual (§"Salida F4A":
paridad estructural real, cero shadowing) exige un **gate final de paridad
sobre keypaths evaluados reales**, separado de placeholders — se escribe en
F4A-close (queda en su definición). Los contadores 1694/2712/5100/0
SIGHTED_ACCEPTED son foto de mitad de frente, no desviación. **Corrección:
entra `F4A-3c` a la cola vinculante (después de K1, antes de F4A-7…15)** —
reclasificación con criterio estricto declarado, estrechamiento o retiro de
los 27 tags de familia (el vocabulario `governanceScope: parcial` ya existe
en root-catalog), updates de roster/registry/checkpoint, y spec del gate de
paridad real. Diseño mío (DT), ejecución de Opus; la auditoría Fable de F4A
recibe el informe Codex como insumo. **ERRATUM F4A-6 (detectado por la
batería de K1):** el pin de vocabulario select de T2 quedó ROJO en HEAD —
`chained` era 9 (no 7 pineados) desde que K3 recableó `clearColorHover`/
`tagColor`, y `admitted` 3 (no 1): nadie corrió T2 ENTERO tras los recableos
(6b verificó hashes contra `git show` + censo T3, no las aserciones de
vocabulario). **Ley: tras tocar fuente de tema, los 3 rosters firmados se
corren ENTEROS (vitest de los 3 archivos), no por nombre ni solo hashes.**
**F4A-6 ✅ (worker Opus + cierre F4A-6b con DOS adjudicaciones mías;
verificado por el DT contra el árbol).** K3 ejecutado: **raíz NUEVA
`--ds-color-text-page` autorada** (rootId `tier.page.ink`, campo tipado
`palette.textPageColor`, lowering nuevo en el compilador — colisión verificada
por grep antes de escribir): rottay `#A0A0A5` base/`#6B6B6B` light, bithire
`#53697E` base/`#9aacbf` dark, evnto `#3d3d3d` base **SIN dark** (mis rulings,
conservados). **35 canales de tinta recableados** en rottay a
`var(--ds-color-text-page)` (con restitución de overlay colapsada); **7
intactos** por el filtro (a) de F2 (coincidencia de valor ≠ derivación: las
raíces rivales y sus rampas); **8 hojas ajenas enumeradas y dispuestas con
razón** (su canal no está entre los 42 medidos). **Cero-delta 136/136** por
resolución de cascada (42 canales × 3 temas × 2 scopes contra HEAD);
restauración ida y vuelta ✓; los 4 sitios multi-clave hechos a mano con el
cuidado correcto (`color:` sí, `text:` no — mismo valor, canales distintos);
0 rutas incoherentes (su propio drill de F4A-2b lo detectó y lo removió).
La cadena arrastró `hooks-manifest.json` (+3 líneas, el gate pidió
`hooks:generate`) y `manifest/index.json` (`generator --sync`; 36/36 y
CONSTITUTION_READY) — **reportado, no escondido**. Negativo nombrado:
`surface.declares` +1 en los tres (una raíz autorada ES un canal más —
esperada-móvil); severs rottay 50→**49** (mejora), reDerives 93→**94**.
Contadores (verificados por mí contra el artefacto): universo 2612→**2586**,
hojas 1819/1502/396 → **1786/1504/397**, intersección autorada **344
intacta**, `divergentSlots` 1720→**1694**, `untaggedAuthoredLeaves`
2772→**2712**, `tagRegistry` 216→**252**, failures 0. **Baja #5 del baseline,
bajada por MÍ.** gat-07 **re-sellado por el DT**: `145083775613…` (el sello
final; hubo uno intermedio, `1b6fe22df0fd…`, que quedó viejo al curar el
ledger de reads — ver abajo).
**Las dos paradas del worker (14/14 correctas), adjudicadas:** (a) la
exposición de la raíz queda **`internal-head` hasta F4B** — es lo que hacen
sus cinco hermanas de tinta `tier.*.fg` y no viola la invariante viva (las 26
tenant-dial existen TODAS con control); F4B la reclasifica cuando el dial
aterrice (el worker corrigió por medición: `channelStatus` es
`solo-artefacto`, no `existe` — la frescura mandó); root-exposure-gate **exit
0** con los conteos re-anclados (26/28/10). (b) **REDERIVED T1/T2/T3
AUTORIZADO por mí y ejecutado**: patrón R35 roster por roster, **22 hashes
firmados IDÉNTICOS vs HEAD, probado mecánicamente contra `git show`** (el
censo de T3 movió 182→164 porque los 18 canales quedaron idénticos entre
modos — el overlay dejó de restatearlos, exacto); `rottay-t1-mass-drain`
548/548. **Y la parada que me tocó a MÍ: `validateTenantThemeDocument`
rechazaba `var(--ds-color-text-page)` como unsafe_value (9 tests rojos)** —
el worker falsó su propia hipótesis (allowlist ≠ exposure: medido, no la usó)
y presentó (A) agregar a la allowlist / (B) re-anclar los 9 = bendecir la
regresión (uno es el censo de la superficie de rechazo, creció de 5 a 7).
**Adjudicación mía: (A)** — `--ds-color-text-page` entró a
`TENANT_THEME_REFERENCE_TOKENS` (raíz autorada por el frente con valor
gobernado; la identidad static=DB no se angosta para que quepa el trabajo;
además F4B la lleva a tenant-dial con consumidores DB). Los 9 volvieron
verdes (19/19 en los archivos de la puerta, corridos por mí). Suite pierna 1,
MI corrida: **1717/13, fallas por nombre idénticas a las 13 conocidas, cero
nuevas** (con una lección mía que la suite detectó: mi línea de la allowlist
dejó el censo stale DESPUÉS de la cadena del worker — el pin "the full check
passes" lo marcó; re-regeneré la cadena completa yo, sin saltarme
fanout-facts ni reconciliation esta vez). Y una segunda lección que me
detectó **gates:ci** ya corriendo para el commit: el ledger
`reads-adjudication.json` quedó con `basedOnManifestDigest` viejo tras el
`hooks:generate` del worker — verifiqué cobertura exacta en ambas direcciones
(2607/2607 rows, cero sin fila, cero sobrantes; `--ds-color-text-page` NO es
hook fenced, correcto) y lo re-anclé yo a `302fe9aa3122e453` (sha256 del
hooks-manifest vigente), con gat-07 sellado otra vez y pierna 1 en tercera
corrida (1717/13 idéntico, diff de nombres vacío). La cadena completa queda
FIJADA: censo → reconciliation → kimi → controls → catalog → fanout-facts →
mirror-parity → variant-parity → **reads-ledger** → gat-07 (siempre último).
**Siguiente lote: K1 propio** (descongelar
`--ds-color-primary`: 32 canales CHROME + `--ds-button-primary-bg` rootFrozen
él mismo + filas REDERIVED; la marca dialeable vive en root-catalog —
adjudicado en F4A-5) y después F4A-7…15 por `/tmp/f4a-lotes-7-13.md`.
**F4A-5b ✅ (worker Opus; verificado por el DT contra el árbol; incluye un
defecto semántico que encontré en verificación y corregí YO en el cierre).**
PALETTE etiquetada: **91 docblocks nuevos = 29 tags + 62 placeholders de
hoja**, las 254 hojas PALETTE cubiertas y las 208 ausencias parciales tapadas
(0/102/106 por tema, reconciliadas contra el roster — **cero desfases**: las
ausencias de PALETTE son de hoja, no de raíz, el plano que el roster no ve).
Contadores medidos y verificados por mí contra el artefacto regenerado:
`untaggedAuthoredLeaves` 3026→**2772** (−254 = exactamente 154+52+48, las
hojas PALETTE de los tres temas, ni una más); `divergentSlots` 1826→**1720**
(−106: un slot deja de divergir solo cuando los TRES lo tienen — manda el que
faltaba en dos); `tagRegistry` 127→218; `positionIntersection` 786→**892**
(pin re-anclado por el worker, leído del artefacto); intersección autorada 344
y universo 2612 **intactos**; failures [] y orphanPlaceholders [].
**Byte-idéntico probado ida y vuelta ×3 builds** (los artefactos ni aparecen
en el change set — la prueba de que el lote es de comentarios);
docs-engineering: **cero diffs** (lo correcto para un lote de comentarios).
**El defecto que corregí yo (4 docblocks)**: en rottay y bithire,
`onPrimaryColor` quedó taggeada "derived de --ds-color-border" (falso — la
cubría la herencia seed del const; borré el docblock erróneo) y `borderColor`
quedó circular ("derived de sí misma" — re-etiquetada a su forma del roster:
`seed`, "raiz autora del par border, K2"). evnto limpio (verificado). Tras la
corrección: `tagRegistry` 216, `--check` verde (2612/892/1720/2772), 34/34
drills corridos por mí, build exit 0 con los artefactos sin mover (mis
ediciones son comentarios). Cadena regenerada por mí tras la corrección —
con una lección mía que la suite detectó: mi primera pasada se salteó
fanout-facts y reconciliation, y la suite lo marcó (1717/15: ORACULO de
determinismo + el pin del catálogo); regenerados ambos, `tokens-catalog
--check OK` (deadWriters 266=266). Baseline **Baja #4, bajada por MÍ**
(1720/2772). gat-07 **re-sellado por el DT**: digest `f9adf7318e83…`.
Suite pierna 1, MI corrida: **1717/13, fallas por nombre idénticas a las 13
conocidas, cero nuevas**. **Decisión que el worker me devolvió, adjudicada**: el kit §1 y el parser se contradecían (la
línea de invariante después de los tags rompe el parseo — la lee como governor
multilínea); el worker la puso ANTES y la fuente quedó así. **Adjudicación:
el kit se corrige para seguir la fuente** (esquema §3 en este commit) — el
harness quedó sellado con 34 drills en F4A-2/2b y no se toca. **Siguiente
lote: F4A-6** (K3: raíz NUEVA `--ds-color-text-page` + los canales de tinta —
borrador en `/tmp/f4a-6-brief.md`).
**F4A-5 ✅ = K2+H3 (worker Opus; verificado por el DT contra el árbol; incluye
PARADA CORRECTA 12/12).** El par border canonizado en los 3 temas: rottay y
bithire derivan `borderPrimaryColor` a `var(--ds-color-border)`; **evnto
invierte completo** — el literal se muda a la raíz en cuerpo Y overlay oscuro
(detalle que la medición obligó y mi brief no describía: hoy `--ds-color-border`
solo se declaraba en base como var, y en oscuro resolvía `#2E2C24` a través de
él; sin esa mitad la inversión habría movido pintura). H3: `--ds-card-border[-color]`
de evnto a la raíz; los color-mix subtle/tertiary re-atados a la canónica.
**Cero-delta 36/36 por resolución de cascada, reproducido por mí** con el
resolver del worker (6 canales × 3 temas × 2 scopes, HEAD vs árbol).
**R35 — patrón REDERIVED por MODO**: la primera versión de la tabla (por tema)
dejó 2 hashes rojos (R35-light, E25-dark: la pre-imagen del overlay era otro
byte que la del cuerpo, y los 6 hashes firmaron los dos); con la tabla por
modo **72/72 verde y los seis sha256 intactos carácter por carácter** —
verificado por MI corrida del test, no de palabra. Negativo nombrado (leído
del artefacto): severs evnto 15→**14** (mejora: `--ds-card-border` pasa de
sever a re-derive), reDerives 53→54, identicalValue 156→**157** (el case
`#d4e0ea`/`#D4E0EA` dejó de separar rottay de bithire), occurrenceTrap y
multiDeclaration bajan, sourceSkeleton 1820/1503/397 → **1819/1502/396**,
universo 2613→**2612**, intersección autorada 345→**344**,
positionIntersection 787→**786** (re-anclajes del worker leídos del artefacto,
con comentario en el test; el universo pierde 1 slot porque
`OVERLAY.palette.borderPrimaryColor` colapsó en los 3 temas). Ratchet:
`divergentSlots` **1826 sin mover** (K2 no agrega placeholders; la baja de
slot compensa la posición ganada — explicado en el reading del baseline);
`untaggedAuthoredLeaves` 3029→**3026** (**Baja #3, baseline bajado por MÍ** —
la ley del archivo: se baja en el mismo commit). Restauración ida y vuelta del
worker ✓ (revert→build→byte-idéntico→re-aplicar→el diff exacto vuelve).
Byte-negativo −71 en las 3 fuentes: por eso entró bajo un techo con aire 0.
**Parada del worker (12/12 correctas): la Parte 1 (tags PALETTE +
placeholders de hoja) proyecta +46.138 bytes contra el techo re-anclado al
valor exacto (aire: 0)** — y extrapolado: el frente entero proyecta ~medio MB
de comentarios de gobierno sobre ese subpath. Adjudicación mía: `maxSourceBytes`
→ **900000 con aire de una vez** (re-anclar exacto garantiza el choque del
lote siguiente — chocó dos veces; los comentarios no llegan al bundle; el
subpath muere en F6). **K1 quedó FUERA con razón medida, aceptada**: los 32
canales computacionalmente idénticos son de CHROME (no de PALETTE — el lote
era la familia), `--ds-button-primary-bg` es él mismo rootFrozen en rottay
(recablearlo cambia su clase = adjudicación, no mecánica), y casi seguro
chocan con los rosters de drenaje T2/T3 (cada uno pide su fila REDERIVED) →
**lote propio**, y su pregunta abierta queda respondida: la marca "dialeable"
se escribe en **root-catalog (exposure tenant-dial)** — se diseña en ese brief.
Cadena regenerada completa y consistente (fanout-facts +3 readers, censo con
inputsDigest nuevo, KIMI/reconciliation con el digest nuevo, controls README).
docs-engineering: solo contadores. Suite: el worker midió 1717/14 donde la +1
era el pin del baseline (mío, cerrado con la Baja #3); **MI corrida de la
pierna 1: 1717/13, fallas por nombre IDÉNTICAS a las 13 conocidas, cero
nuevas** (nota operativa mía: la pierna 1 es `node --test scripts/**+manifest/**`
— la primera del encadenamiento de `test:scripts`, roadmap línea ~1491; mi
primera corrida la hice contra el proyecto vitest `unit` por error, 63 fallas
en 13854 tests = otra cosa entera, sin escribir en el árbol, descartada).
gat-07 **re-sellado por el DT**: digest `b8b343eb2e59d048…` — idéntico al
computado por el worker (confirmación cruzada). Corrección doc asentada en el
mismo commit B: esquema §4-K3 y parte3 §4 citaban `--ds-color-text-secondary`
(falsada) → **`--ds-color-text-page`**. **Siguiente lote: F4A-5b** (tags por
hoja de PALETTE ×3 + placeholders de hoja de las ausencias parciales 0/102/106
— la Parte 1 del brief F4A-5, con aire de techo; brief ya escrito en
`/tmp/f4a-5b-brief.md`); después F4A-6 (K3, raíz NUEVA `--ds-color-text-page`).
**F4A-4 ✅ (worker Opus; verificado por el DT contra el árbol; incluye PARADA
CORRECTA 11/11).** Roster por placeholders aplicado **byte-idéntico** (son
comentarios: el artefacto compilado salió idéntico en la prueba ida y
vuelta): **90 placeholders del kit** — rottay **13** cubriendo 161 slots /
bithire **27**→196 / evnto **50**→573 (los 34/17/10 del plan quedaron
desactualizados: manda el roster commiteado de F4A-1). **`divergentSlots`
2268→1826** (baseline bajado por el DT en este commit, verificado contra el
artefacto regenerado con `--check`: 2613 slots / 787 con posición / 1826
divergentes / 3029 sin tag / 127 tags leídos); `untaggedAuthoredLeaves` **3029
clavado**; `tagRegistry` 37→**127** (32 seed · 5 pro-expert · 90
placeholder/unassigned); matriz 2613/345 y sourceSkeleton intactos. El harness
ganó **cobertura por prefijo** (`@placeholder P` da posición `placeholder` a
todo slot del universo igual a `P` o bajo `P.`) con 5 drills nuevos
(sub-árbol, sobre-autoría FAIL citando la hoja, hoja exacta, huérfano
reportado en `orphanPlaceholders`, dos-placeholder) → **34/34 corridos por
mí**. Mis 3 ediciones al harness en este commit: intersección autorada
explícita **345** y `positionIntersection` **787** (dejan de derivarse del
universo), y los exclusivos pasan a contarse sobre hojas AUTORADAS (ancla
**1061/788/2** restaurada). **Parada del worker (correcta, 11/11):** los 90
docblocks del kit sumaron ~15,6 KB de fuente (rottay +2.259 / bithire +4.741
/ evnto +8.593; ~121 bytes por placeholder) y el subpath techo del manifest
de entrypoints quedó por encima — **los comentarios cuentan como bytes de
fuente** aunque el compilado sea byte-idéntico. Adjudicación mía:
`maxSourceBytes` **387391→398278** con `_note` fechada 2026-08-20 (el subpath
muere en F6; la alternativa de una forma más corta de placeholder queda
anotada y descartada — el kit fijo es contrato de F4A-1). Cadena regenerada:
variant-parity + mirror-parity (**solo provenance**) + fanout-facts (**990
citas file:line movidas, CERO medición**) + censo + kimi + controls README +
catalog **re-derivado por el DT** (digest `cffd2d272b…`, deadWriters 266=266,
2 campos movidos verificados por diff — la 14ª falla de la suite era el
catálogo stale y se cerró así). Hallazgos de clase del reporte: `evnto
MOTION` es **delegación, no gap** (su esqueleto escribe los canales; el
placeholder corresponde); `evnto THEME.surfaces` es ausencia léxica **sin
placeholder**; tercera aparición de la clase "evnto compone desde preset
canónico" → anotada para F4A-close. Las **ausencias parciales** (632 rottay
en 18 familias / 914 bithire en 17 / 1643 evnto en 14) son exactamente el
trabajo de F4A-5…15. Build verde (exports-artifact-gate 325 targets — el
techo ya no bloquea). Suite: **1717/13**. gat-07 **re-sellado por el DT**:
digest `2d5ad3e9760f…`. La excepción `rottay CHROME.statsGrid` sigue
pendiente → adjudicación a más tardar en F4A-close.
**F4A-3b — PARADA CORRECTA (10/10): el consumo encontró un bug en el harness
(mío, sellado en F4A-2).** `pathIndex` solo bajaba la pila si la línea
EMPEZABA con `}`; el corpus cierra con contenido+llave en la misma línea →
**594 rutas incoherentes en rottay (31%), 63 evnto, 0 bithire** (bithire se
salvaba por casualidad: cierra todo en línea propia). Confirmado por mí contra
el árbol, no de palabra: reproduje la firma exacta (` rottay:2188` →
`CHROME.controls.buttonPrimary.…alert` en vez de `CHROME.alert`). Latente
porque con 0 tags el índice nunca se consultaba, y los 22 drills pasaban con
fixtures de forma linda. **Si 3b taggeaba, el harness mentía en verde** — la
parada evitó un progreso falso. Bonus del reporte 3b (vale para el re-run):
clases 33/29/53 reproducidas desde el mapa commiteado; join control→roster
32/33 cierra (excepción: `rottay CHROME.statsGrid` con `token-overrides` —
llevaría nota de clase, no tag); banners canónicos confirmados; generadores
escritos y probados en `/tmp/f4a-3b/` (el lote se re-ejecuta tal cual); 28 de
51 docblocks cargan ley real → su verbatim completo viene en el reporte del
re-run y yo escribo `docs/f4a/leyes-fuentes-themes.md` en ese commit
(adjudicación: la memoria de tranches — ROTTAY-T2, MASS C3, EVNTO TERMINAL-2,
T1, K0.6 — pide docs/f4a/, no la fuente).
**F4A-2b ✅ `6c549af78` (worker Opus, verificado por mí contra el árbol).**
Eran TRES bugs: (a) la pila no bajaba en cierres con contenido; (b) `opens` se
anotaba con la pila ya cerrada de fin de línea (ahora se anota en el `:` de la
clave); (c) los `//` entraban como clave (`blankComments` solo limpia `/* */`)
→ rutas `PALETTE.// Semantic`. Fix: nivel por conteo de llaves carácter a
carácter, string-aware, `//` corta la línea; docstring reescrito con las formas
del corpus que provocan cada caso (ley: el comentario dice lo que el código
hace AHORA). 6 drills nuevos (**28/28**, corridos por mí): el del cierre-inline
probado en las DOS direcciones (viejo falla / nuevo pasa, salida pegada en su
reporte), llaves dentro de strings, `//` con dos puntos, e integración: **0/0/0
rutas incoherentes** sobre las 3 fuentes reales + anclas de familia 54/39/18
(evnto 18 y no 19 porque no tiene `const MOTION` — el hallazgo de F4A-2,
consistente). **Artefacto byte-idéntico** (--check verde sin regenerar: la
matriz no consulta el índice y hoy hay 0 tags). **Desvío declarado y
atribuido**: suite 1705/13 → 1711/14 — la 14ª es la carrera PREEXISTENTE del
drill de cascade-wiring-ratchet plantando en `src/` (el worker probó la
atribución: restaura→13, reaplica→14, los dos archivos solos 73/73). Es la
deuda declarada post-Paso B (fixtures a tmpdir): se paga en lote propio
(Sonnet, en vuelo al escribir esto); NO se acepta como baseline nueva.
Lección de método (del worker, adoptada): el fixture debe tener la forma fea
del corpus real, y todo lexer se cruza contra una verdad independiente antes
de cerrar el lote.
**F4A-3 — PARADA CORRECTA del worker (9/9) + split adjudicado: 3a → 3b.** El
brief original asumía que el roster proyecta sobre familias de fuente. Medido:
**67 familias, solo 3 con match nominal a raíz del roster y las 3 falsos
amigos; 64 sin proyección (82% de las hojas)**. Tag-por-familia hubiera sido
promediar (prohibido); tag-por-hoja = ~3.062 docblocks (no es el kit). El
worker citó la parte 3 §1 contra mi brief — correctamente: la parada ya estaba
contenida en mi propia adjudicación. Adjudicación DT: la cola no se reordena;
F4A-3 se divide EN SITIO: **3a** (el plano que falta, read-only) → **3b** (el
canon de comentarios, ahora con insumo real). Bonus verificado de la parada:
banners ya canónicos (0 trabajo), orden alfabético de consts NO-OP medido (0
movimientos — cada sección tiene exactamente un const de decisión), residuo
esqueleto 35 hojas `THEME.*`. **Nota para el dueño:** existe un `stash@{0}`
(WIP de otra época, rutas `src/tokens/`/`src/tenancy/` que ya no existen) —
ni el worker ni yo lo tocamos; dropearlo o no es llamada del dueño.
**F4A-3a ✅ (worker Opus, read-only, verificado por el DT contra el JSON — NO
de palabra).** El plano medido: `docs/f4a/mapa-familia-canales.{json,md}`.
Método **sonda por hoja** (mutar 1 hoja con centinela, recompilar, diff de
canales cambiados/agregados/quitados): **3.726 compilaciones, ~19 ms, 0
errores**. Anclas: léxicas 1820/1503/397 EXACTAS; partición evaluada
1811/1493/422 exacta. **Hallazgo estructural: son TRES planos, no dos** —
canal→control EXISTE (root-checklists atribuye a los 20 diales); canal→raíz-
de-cascada NO existe en ningún artefacto (intersección 16 rootIds × 66 raíces
= VACÍA; la columna queda declarada, no rellenada). Clases medidas
(recomputadas por mí desde el JSON crudo, idénticas al .md): **33 limpias**
(640 hojas) / **29 mixtas** (2.706) / **53 sin control** (380); las mixtas
están ENTRELAZADAS (24/29; mediana 3,5 tiradas/grupo; rottay CHROME.controls:
4 grupos en 80 tiradas) → tag-por-sub-bloque NO alcanza. 149 hojas sin canal:
8 son metadato A.1; **141 son decisiones autoradas reales** (vocabulario de
forma, enums charts, prosa/estado capability, física motion) hoy invisibles
para gates de canal. Auto-correcciones del worker verificadas en el JSON:
`CHROME.card` emite CERO canales (5 hojas de vocabulario de forma; la que
emite es `cardComponent`, 29 hojas / 38 canales, 30 sin control). **Mi
adjudicación para 3b (registrada acá, brief aparte):** tags de familia SOLO
donde limpios (las 33, domicilio via control→dial del roster) + secciones de
capability (`pro-expert` anclado a la capability activa del tema); las mixtas
entrelazadas NO llevan tag de domicilio en 3b (sería mentira uniforme) — sus
tags por hoja/grupo aterrizan EN su lote de reescritura (F4A-5…15), donde la
re-autoría los hace verdaderos en el mismo commit; las 53 sin-control quedan
con nota de clase (no tag) y su disposición final es adjudicación de
F4A-close, ya enumeradas por el mapa (no silenciosas). El esqueleto `THEME.*`
(35 hojas) no se taggea: cablea, no autora — docblock del kit sin tags.
**CORRECCIÓN 2026-08-21 (auditoría Codex, verificada por mí):** el criterio
"limpia" de arriba cuenta un solo control ENTRE LOS ATRIBUIDOS e ignora los
canales `control:null`; con criterio estricto (cero nulos) las limpias son
**0, no 33**. Los 27 tags de familia escritos bajo esta adjudicación afirman
gobierno probado sobre hojas sin atribución medida — se estrechan o retiran
en **F4A-3c** (cola vinculante, después de K1). Detalle en §13 (asiento de la
auditoría).
**F4A-2 ✅ `e6364e90b` (worker Opus, verificado por el DT contra el árbol, NO de
palabra) — harness `variant-parity` blocking: 87→88 gates.** Productor hermano
de mirror-parity (sub-decisión DT registrada): solo IMPORTA de él
(`authoredLeafPaths`, `TENANTS`, `provenanceOf`, `blankComments` — cero walks
nuevos); parser puramente léxico sobre las 3 fuentes (nunca dist/ ni el
artefacto: corre sin build — él el canon de fuente, mirror el espejo de
salida). **Anclas reproducidas EXACTAS**: 1820/1503/397, unión 2613,
intersección 345, **divergentSlots 2268**, exclusivos 1061/788/2, metadato 36
→ denominador 3690. Artefacto `manifest/generated/variant-parity.json` (5
secciones, tagRegistry hoy vacío y correcto) + baseline AUTORADO
`variant-parity.baseline.json` (2268 / 3686, ley decrease-only escrita, se
edita a mano con revisión del DT). **Dientes verificados por mí con mutaciones
reales sobre el árbol**: baseline 2267 → FAIL (GREW); 9999 → FAIL con la
instrucción de bajarlo; 1 byte al artefacto → FAIL frescura; restaurado →
PASS. 22 drills verdes (corpus en memoria, nunca src/): vocabulario, forma,
placeholder (baja la divergencia del fixture + contradictorio), scope ambiguo,
ratchet en las dos direcciones, frescura, anti-vacío, determinismo + las
anclas contra el corpus REAL. Suite 1683→**1705/13** (los 22 nuevos, 0 delta
por nombre). **Desvío del brief adjudicado por el DT — ACEPTADO:** la lista de
metadato queda en **36** (el universo de A.1 no se baja) con 2 entradas de
evnto marcadas `via: EVNTO_CANONICAL_MOTION` — evnto no autora su motion,
delega en el preset (`experience-baselines/evnto/index.ts:35`); la guarda
anti-rename se bifurca (34 exigen hoja léxica, 2 exigen la referencia al
preset) y las dos ramas están drilladas. `untaggedAuthoredLeaves` inicial =
**3686** (unidad LÉXICA; no confundir con 3690 evaluada — trampa prevista en
el brief, documentada en el baseline). gat-07 SIN MOVER (`9374cb75…`),
mirror-parity intacto, scripts-tree-gate M1 verde. gates:ci: **88 blocking +
2 excluded verdes** en este commit.
**F4A-1 ✅ CERRADO (2026-08-20, tarde).** Roster final `docs/f4a/roster-variantes.json`
(schemaVersion 3; copia duradera de `/tmp/f4a-1c-roster-draft.json` — los
insumos de F4A viven en `docs/f4a/`, ver su README): **66 raíces × 3 temas = 198 entradas**,
universo limpio (fila agregada retirada), **BLOCKED 0 · MISSING-CITATION 0**.
Descomposición: 63 raíces catálogo + color.border (autora #2, fuera del eje de
tiers) + text-secondary (seed existente, intacta) + text-page (NUEVA). Por
domicilio: seed 85 / derived 33 / baseline 0 / unassigned 80; baseline y
pro-expert son 0 A NIVEL RAÍZ por diseño (viven a nivel hoja/familia: K5 se
etiqueta en F4A-15; pro-expert se ancla al roster CAPABILITIES). Posture medido
por tema con `compileBrandTheme` sobre FUENTE (no artefacto) — el roster YA NO
es idéntico ×3. **Medición del punto 4 (page.fg por tema, verificada por mí):**
los TRES temas autoran su literal propio (caso a — ninguno deriva hoy):
rottay `#A0A0A5` base / `#6B6B6B` light; bithire `#53697E` base / `#9aacbf`
dark; evnto `#3d3d3d` base SIN dark. Dos rulings míos sobre lo medido: (1)
**bithire se autora con text-page aunque ya era cero-delta contra
text-secondary** — uniformidad del canon (misma raíz, misma semántica en los 3)
y, sobre todo, independencia de diales: atarlo a text-secondary acoplaría la
tinta de página al dial de tinta secundaria en F4B, un acoplamiento que hoy no
existe; (2) **evnto autora text-page SOLO en base** (sin dark) — su
`sidebar.itemColor` no tiene scope dark y text-secondary sí (#A8A898): atarlos
le daría una tinta en oscuro que hoy no tiene (no cero-delta). Corrección de
conteo registrada: `#A0A0A5` son 50 OCURRENCIAS en fuente rottay (yo cité 48
líneas), 42 canales tier.page.fg + 8 en hojas ajenas — el packet F4A-6 enumera
exacto. Verificado contra el JSON por mí, no de palabra.
**F4A-0 ✅ (worker Opus, read-only, `/tmp/f4a-0-baseline.md` + datos en
`/tmp/f4a-0/`).** Cero escrituras en el repo. **7 predicciones falsifican
EXACTO**: hojas evaluadas 3.726 = 3.738 − 12 (el −12 son exactamente los 12
recables de F2, al canal); sourceSkeleton 1820/1503/397; unión 2.613,
intersección 345; exclusivos 1061/788/2; hex literales 1134/468/188; las 37
internal-head+gap sin `governedBy`; las 10 por-crear inertes (0 declaraciones,
0 lectores). Matriz CHROME completa: 54 familias × 34 subfamilias — el
hallazgo es la asimetría de cobertura (`cardComponent`: 29/36/**4** hojas;
evnto no es más simple, está vacío). **5 NO falsifican — y las 5 son
adjudicaciones de F4A-1, no re-mediciones:** (A.1) las 45 hojas de metadato
del catálogo nunca fueron enumeradas → el denominador 3.693 no es
reproducible (la regla se adjudica y se enumera, no se hereda); (A.2)
"asignación" como la define el catálogo no replica (263 vs 159 re-medidas,
95 divergencias en las dos direcciones — "tomar posición sobre una raíz" ≠
"declarar su canal cabeza"; F4A-1 define qué es una asignación); (A.3) 2
referencias `var()` fantasma en rottay y evnto, inatribuibles; (A.4) raíces
con un tema en cero: son **16**, no 9 — y 14 de las 16 son derivationDebt;
(A.5) `tier.page.fg`: **42** canales, no 43. Nudos medidos hoy: par border
(3 temas, 3 relaciones distintas); tier.page.fg (3 destinos rivales con el
mismo valor); `--ds-color-primary` congelada en los 3 con **135 lectores
arrastrados** (la palanca más grande del frente); H4 bien excluido de W3 (no
era cero-delta contra tier.control.bg — confirmado).
**F4A — plan de ejecución ADOPTADO (coordinador, 2026-08-20; plan completo
medido contra el árbol por subagente plan).** Fases: **F4A-0** medición
pre-rewrite (worker, read-only: reproduce el walk evaluado sobre el árbol de
hoy — denominador ~3693 ±12 recables F2, 263 asignaciones, sourceSkeleton
1820/1503/397 con ∩345, matriz familia×subfamilia completa, exclusivos por
tema); **F4A-1** esquema de asignación de variantes + adjudicación escrita de
los 6 nudos (**MÍO, el DT — lote de diseño irreemplazable**: 63 raíces × 3
temas a 4 domicilios, registro de los 3.275 candidatos de colapso SIN
colapsar, orden/comentario/placeholder canónicos, nudos: par border,
tier.page.fg, descongelar-primary, 22 asimétricas, H4, domicilios de las 10
por-crear); **F4A-2** harness de paridad estructural blocking (worker;
87→88 gates, ratchet decrease-only desde ~2.268 slots divergentes a
tolerancia cero al cierre); **F4A-3** canon de comentarios (byte-idéntico);
**F4A-4** alineación de roster por placeholders (byte-idéntico: evnto +34,
bithire +17, rottay +10); **F4A-5…15** reescritas por familia ejecutando el
esquema (K1/K2→5 palette, K3→6 typography, K4→14 asimétricas, K5→15 tabla
bithire; REDERIVED para firmados); **F4A-3c** (enmendada 2026-08-21 tras
auditoría Codex): reclasificación del mapa con criterio estricto declarado,
estrechamiento/retiro de los 27 tags de familia no probados, updates de
roster/registry/checkpoint; **F4A-close** mío: ratchet a tolerancia
cero + **gate de paridad real sobre keypaths evaluados, separado de la
cobertura por placeholders** (brecha señalada por Codex: `@placeholder` da
posición sin materializar keypath) + gates:ci final + **auditoría Fable del
frente**. Restricciones duras
registradas: F4A-0 antes que todo; F4A-1 antes que cualquier reescritura;
F4A-2 antes que F4A-4+; la cadena censo→reconciliation→kimi→controls→catalog
con gat-07 ÚLTIMO mío en cada lote; suite 1683/13 por nombre; lane-control
10/13 no crece; docs-engineering solo contadores. Riesgos con mitigación en
el plan (dead-writers 266 decrease-only, firmados T1/T2/T3/c3/evnto-t2/R35,
deriva de contadores mirror-parity, red visual 462 PNG primera corrida con
peso = F4A, denominador stale si alguien cita 263/3275 sin F4A-0).
**Veredicto de cierre Fable: CIERRE ACEPTADO, cero discrepancias**
(`/tmp/fable-f2-cierre-verdict.md` — verificación corta sobre `4606444d5`:
ola 3 diffs exactos + negativo a nivel de campo, mass-c3 135/135 standalone,
gat-07 `9374cb75` recomputado OK, deuda channel-liveness idéntica re-medida
por el auditor, gates:ci propio 87 verdes con los textos nuevos visibles).
**F2 CERRADO con conformidad del auditor; F4A procede.**
**F2 — CERRADO (2026-08-20) tras veredicto Fable + condiciones implementadas.**
Auditoría del frente (`/tmp/fable-frente-f2-verdict.md`, primera mano:
gates:ci propio 87 verdes, restauración del packet W2 ejecutada por el
auditor ida y vuelta byte-idéntica, ratchet mutado en las dos direcciones y
restaurado, suite 1683/13 = subconjunto estricto de la baseline histórica de
25, sha256 firmados T2/T3 idénticos pre/post frente): **los 4 lotes
APROBADOS**; la declaración "F2-seguro AGOTADO" fue **devuelta con hallazgos**
y así se resolvió:
- **H1+H2 ejecutados en la ola 3 `cf61da8bb`**: evnto
  `--ds-layout-sider-bg`→`--ds-sidebar-bg` (gemelo literal de W2) y bithire
  `--ds-card-bg`→`--ds-surface-card` (paridad computada sin ciclo; el propio
  tema ya ata ese patrón en otra sección). Con W3 el frente recablea 12
  canales, todos con cero-delta computado + restauración probada.
- **Residuo COMPLETO y domiciliado** (las 4 colas del auditor integradas):
  par border/border-primary (hermanos; R35 firmado digiere valor crudo),
  H3 evnto `--ds-card-border[-color]` (mismo nudo del par), H4 bithire
  `--ds-table-bg`/`--ds-table-row-bg`→tier.control.bg (atribución semántica no
  pre-adjudicada), `tier.page.fg` (43 canales #A0A0A5), descongelar
  `--ds-color-primary` (6+15), las 22 asimétricas → **todo F4A/F4B o
  F2-asimétrico**; las 10 raíces `por-crear` (0 declaraciones, 0 lectores,
  adjudicación B) → **materialización re-domiciliada a F2-asimétrico/F4B**
  cuando nazcan valores/consumidores; ratchet 2171 → F3 (plano skins).
- **Universo re-enunciado con honestidad** (corrección del auditor): el
  universo del frente fue "canales literales del artefacto con paridad
  computada contra una raíz derivationDebt", NO "los 150 severos" — el
  conteo real es 164 (50+99+15) y W2 drenó fuera de severs
  (`--ds-layout-sider-bg` nunca estuvo ahí; lo que se movió fue
  rootFrozen.readerEdges).
- **Excluded re-adjudicados en este cierre** (P1 del auditor, condición de
  aceptación): channel-liveness y lane-control-drills pasan de dueño "F2
  cascade front" (frente hoy cerrado — una exclusión con dueño muerto es el
  anti-patrón que la ley de exclusión visible prohíbe) a "F4A/F4B +
  F2-asimétrico" con trackedSince 2026-08-20 y razón por clase de fila. El
  retorno a blocking sigue siendo "findings drained, not re-baselined".
  Prueba empírica: los 12 recables del frente drenaron CERO hallazgos de
  channel-liveness (medido por el auditor a los 10 y re-verificado por el
  coordinador a los 12, censo idéntico) — la deuda nunca fue drenable por
  el conjunto seguro.
- **Red visual (462 PNG)**: la cobertura del recableo fue byte/computada
  (más fuerte que screenshot para cero-delta); el job `visual` no se
  ejercitó durante F2.4 — corre en el próximo push de CI, y su primera
  corrida real con peso es la de F4A (reescritura de themes).
- **Template de packet corregido** (adoptado en W3): `sourceSkeleton.*` se
  enumera como sección esperada-móvil (el negativo sigue falsable) y el
  permiso de role shape se declara como compromiso a futuro ("cero-delta hoy
  → sigue a la raíz mañana").
**gates:ci final del frente: 87 blocking + 2 excluded (re-adjudicados) verdes
en este commit.** Próximo frente según la enmienda: **F4A**.
**Enmienda de secuencia del dueño (2026-08-20) — ADOPTADA y registrada.**
Reescribe §6/§7/§11-bis/§12 del roadmap: la cola vinculante pasa a ser
`F2 seguro exhaustivo → F4A canon estructural → F4B calibración 20 controles →
F2 asimétrico → F3 skins+craft → F4C premium → F5 → F6 → F7 → F8 → F9`
(F9 nuevo: cierre de certificación familia×control, UNKNOWN=0 sobre 255×20).
Compatibilidad con F2.4 en vuelo: el packet no se cancela; los requisitos
nuevos de declaración (raíz, canales, 3 verticales, negativo, restauración del
artefacto) ya están en el brief de la ola 2. Mis adjudicaciones W1 quedan
consistentes con la enmienda: `tier.page.fg` y descongelar-primary son
decisiones de theme → esperan F4A/F4B; W1 midió que el conjunto seguro se
agota con la ola 2.
**Verificación independiente de la enmienda (agente explore, 2026-08-20):
8/8 afirmaciones VERIFICADAS contra el árbol** — 13 Standard + 7 Pro
(controls/README + manifest `activePublicControls: 20`); 255×20=5.100 celdas
todas UNKNOWN y 252 histórico (manifest rollups + family-inventory);
**263 asignaciones y 3.275 canales derivables EXACTOS** (root-catalog.json,
Σassignments/Σcollapses); 37 de 63 raíces sin `governedBy` (27 internal-head +
10 gap); 606 vs 625 (gates-manifest:441); `BrandTheme`/`TenantThemeDocument`/
`compileTheme` existen y **no hay segundo emisor hoy** ("un segundo emisor es
STOP" es exigible desde ya); 462 PNG + job `visual` (ci.yml:387). Cero
contradicciones duras; única deriva: el rótulo genérico "F4" en notas
pre-enmienda (líneas 188, 192, 535, 886-888, 900, 959). **Regla de lectura
adoptada: todo "F4" genérico anterior a la enmienda se lee como F4A/F4B (o
F4C cuando el contexto es craft premium), sin reescribir el log histórico.**
**F2.4-batch W2 ✅ `a7929df5a` + F2-SEGURO AGOTADO (declaración del
coordinador).** 1 de 2 canales ejecutado: `--ds-layout-sider-bg`→
`--ds-sidebar-bg` (rottay). Declaración de packet completa (enmienda del
dueño): rottay 3 líneas exactas (l.626 sustitución, l.1627 colapso), bithire y
evnto byte-idénticos; negativo nombrado y medido (surface/cascadePresence/
valueParity-common/identical/divergent/severs/severedTotal/floorCorpus
IDÉNTICOS); restauración probada (revert→rebuild→byte-idéntico ×3). Se
movieron solo los campos del permiso enmendado: identicalRoleShape 291→290,
divergentRoleShape 140→141 (entra exactamente `--ds-layout-sider-bg`),
occurrenceTrap 1938→1937, multiDeclaration 727→726, readerEdges 31→32 (la
raíz sigue congelada, patrón del piloto). Bonus gobernanza:
`navigation.sidebar-tone` gana su 6.º consumidor alcanzable — el leaf que
esquivaba la perilla ahora la obedece. Suite 1683/13 por nombre ×2;
mirror-parity 44/44; lane-control 10/13 sin crecer; re-sello gat-07
(`cd6ba2a8…`). Huella docs-engineering: 1 contador (`sidebar.md`).
**El canal 2 (`--ds-color-border-primary`→`--ds-color-border`) se bloqueó y
revirtió:** enrojecía `brand-authored-residue-retirement` (R35 firmado —
el hash digiere valor CRUDO, no resuelto) y tres evidencias dicen que el par
border/border-primary son HERMANOS, no padre-hijo: el piso los declara en
paralelo desde el mismo ancestro, divergen en otro scope del piso, y evnto
los ata AL REVÉS (`--ds-color-border: var(--ds-color-border-primary)`). No
hay raíz única en las tres verticales = la condición de bloqueo de la
enmienda en su forma real. **Adjudicación del coordinador: ADOPTADA — el par
va a F4A/F4B (autoría de vocabulario), como `tier.page.fg`.** Aislamiento:
con el canal 1 fuera, el test firmado vuelve a 72/72.
**Corrección del worker sobre W1 (aceptada):** el rojo intermitente de
`brand-authored-residue-retirement` en la ola 1 pudo ser este mecanismo
asomando, no contaminación cruzada — queda registrado como mecanismo, no
como ruido.
**F2-seguro queda EXHAUSTO:** piloto (sexteto) + W1 (3 canales) + W2 (1
canal) = 10 canales recableados, todos con cero-delta computado; el barrido
de las 41 derivationDebt + los 150 severos no deja ningún candidato
inequívoco. Residuo declarado y domiciliado: par border/border-primary,
`tier.page.fg` (43 canales), descongelar `--ds-color-primary` (6+15), las 22
asimétricas → todos F4A/F4B o la fase F2-asimétrico posterior. Ratchet 2171
sin mover (plano skins, F3). Próximo paso: auditoría Fable del frente F2
completo, y si aprueba, F4A según la enmienda de secuencia.
**F2.4-batch W1 ✅ `8f58229e3`** — 2 raíces / 3 canales recableados
(`tier.base.fg`→`--ds-color-text-primary` en bithire ×2 — raíz VIVA, no
congelada; `tier.page.bg`→`--ds-sidebar-bg` en rottay ×1). Cero-delta probado:
surface/valueParity/cascadePresence IDÉNTICAS; severance sin mover (solo
readerEdges 30→31, mismo patrón del piloto); evnto byte-idéntico; diff del
artefacto = 6 líneas exactas; suite 1683/13 estable por nombre; mirror-parity
44/44; re-sello gat-07 (`91970333…`). Sin rosters T2/T3 (no hizo falta
REDERIVED). **Medición que ordena el frente: dentro de los 150 severos quedan
CERO candidatos inequívocos** — bajar `severs` más allá de 50/99/15 ya no es
mecánico, es decisión semántica. Filtros medidos: (a) coincidencia de valor ≠
derivación (5 raíces: `none`, `12px`, ratios — cero-delta hoy, delta garantizado
mañana); (b) colisión semántica `tier.page.fg`; (c) comunes a los 3 temas
(mueven role shape); (d) las ya conocidas del piloto.
**Adjudicaciones del coordinador (W1 → ola 2):**
(1) `valueParity.identicalRoleShape/divergentRoleShape` **ENTRA al permiso**
"colapso de restitución redundante" — es censo de forma de scope, no pintura.
Desbloquea `--ds-color-border-primary`→`--ds-color-border` y
`--ds-layout-sider-bg`→`--ds-sidebar-bg` (rottay, comunes a los 3 temas) para la
ola 2. (2) `tier.page.fg` (43 canales `#A0A0A5`, 4 destinos posibles, la
correcta —tinta secundaria— NO es raíz del catálogo): **NO se recablea en F2**;
promover una tinta secundaria a raíz es autoría de vocabulario = **F4**.
(3) Descongelar `--ds-color-primary` en rottay (libera 6+15 canales): **F4**
(valor de tema), anotado en las notas de F4, no se toca en F2.
**Nota operativa (cierre W1):** el worker regeneró 4 de los 5 eslabones de la
cadena y se saltó `controls` — gates:ci lo pescó rojo (controls-catalog STALE).
El coordinador regeneró la vista (`tokens/controls/README.md`, digest
dc813e5d→OK), gat-07 no se inmutó (el README no alimenta la prueba) y la huella
en docs-engineering siguió siendo solo los 3 contadores del worker. Lección:
la cadena completa es censo→reconciliation→kimi→**controls**→catalog y gates:ci
es quien la audita — ya quedó explícita en el brief de la ola 2.
**F2.4-piloto ✅ `14262d45c`** — sexteto recableado, cero-delta probado
contra el artefacto (12 líneas exactas; bithire/evnto intactos; mirror-parity
solo a la baja en lo permitido). Patrón REDERIVED preservó los rosters sin
tocar hashes firmados. Enseñanzas para el batch (registradas): descongelar
`--ds-color-primary` en rottay libera 21 canales (es decisión de F4 — tema);
el ratchet no baja con trabajo de tema (otro plano); cero-delta estricto por
literal es raro (20/150) — el criterio operativo del batch es "misma pintura
computada tras resolver la raiz" con revisión sighted por lote.
**F2.4 — correcciones del piloto (parada medida del worker, adoptadas):**
(a) el conjunto batch es `derivationDebt` (41) — mi lectura "simetría de modos"
era otro eje; la intersección segura (4 raíces) no tiene trabajo recableable
(spring = args de física, no pintura; 2 solo-artefacto; motion.duration ya
deriva). (b) **cero-delta redefinido**: la pintura COMPUTADA no cambia (contra
el artefacto compilado, loop tsc→artifacts→mirror-parity); el colapso de
restituciones redundantes cuenta como mejora permitida. (c) rosters T2/T3:
re-anclaje permitido cuando el valor computado no cambia (cambia la forma,
no el drenaje). (d) piloto = el sexteto de `ramp.seed.primary` en rottay — el
único cluster con cero-delta demostrable (el piso ya los deriva).
**F2.3 (en dos pasos)
Estado final: **`b57b8022d`** — 87 gates verdes, suite **1683/13** (la más
honesta del programa: quedan los rojos adjudicados y nada que grite sin
querer). Re-anchor ejecutado con disciplina total (pines desde el artefacto,
dientes por mutación, guarda HISTORICOS viva con nota).
 — regen + cableo del trío stale:** los 3 artefactos de
`manifest/generated/` regenerados y enchufados blocking (87 gates). Delta por
clase revisado: fanout-facts (1 canal entra: `--_ds-chart-legend-swatch-size`;
17 con solo números de línea); root-checklists (summary byte-idéntico; 43/41
canales ganan atribución a las 2 familias que F1.4b cableó — la prueba de que
llegó); mirror-parity (**la paridad mejoró sola**: intersectionPctOfSmallest
85,8→91,9%, sameRoleTwice a 0 en ambos temas — el stale SUBESTIMABA).
Adjudicación sighted del coordinador: re-anclar los pines del control a los
valores medidos del artefacto (la suite baja de 22 a 16 honesta).
**F2.2 ✅ `2d08292a1`** — `cascade-wiring-ratchet` bloqueante (84 gates):
deuda medida por nombre = **2.171** (denominador 4.374; 768 destinos excluidos
por la regla a como está escrita; 2.203 cableados por la regla b). Falla en
las dos direcciones. Adjudicación: regla (a) como está escrita; la variante
estrecha (319 destinos → deuda 2.618) queda documentada no adoptada.
**F2.1 ✅ `0de3acab6`** — las 12 raíces bautizadas (channel: null = 0). La
declaración en CSS quedó fuera por adjudicación **B** (el worker midió que
declarar sin lector = dead writer; el ratchet lo prohíbe por ley): **la
declaración viaja con F2.4** — cada canal nace con su primer consumidor.
Doctrina: "bautizar tampoco es declarar".
**F2.1 bautismo — tabla aprobada con adjudicaciones (coordinador):** 2
ADOPCIONES (state.delta.hover → `--ds-state-hover-shift` y state.delta.disabled
→ `--ds-state-disabled-opacity` — ya existían; el catálogo buscó otros nombres)
+ 10 bautismos nuevos siguiendo las convenciones medidas. Decisiones:
control.ratio.padding = trío (`-label` 0.42 cabeza / `-value` 0.35 / `-block`
0.20 — la fuente ya razona el split); alpha.ladder = `--ds-alpha-<pp>`;
tier.accent.bg queda gap tras bautizarla (el snapshot no se mueve). Propuesta
completa en /tmp/f2-1-bautismo.md (medida contra el árbol).
**F2 — plan de ejecución (coordinador, 2026-08-20).** Lotes:
- **F2.1** — materializar las 12 raíces `por-crear` (bautismo con nombre
  derivado de la nota `derivation` de cada raíz + convenciones `--ds-state-*`/
  `interaction-wash`; inerte para la pintura). En dos pasos: tabla de nombres
  propuesta por el worker → mi aprobación → ejecución (declaración en CSS
  autorado + channelStatus flips + re-sello/rebuild de la cadena).
  `tier.accent.bg` (el gap con channel:null) entra acá.
- **F2.2** — ratchet corregido: gate nuevo anclado en token-audit baseline con
  las 2 reglas (raíces/rampas fuera del denominador; fallback funcional que
  alcanza raíz SÍ cuenta). Baseline real ~2.055.
- **F2.3** — regen + cableo del trío stale (fanout-facts, mirror-parity,
  root-checklists) con --check al manifiesto — salda la deuda de la graduación.
- **F2.4** — recableo raíz por raíz: primero las 41 simétricas con cero-delta
  estricto; las 22 asimétricas esperan a F4 (o cero-delta estricto). La red
  visual (462 PNG) cubre. Pendientes heredados: cra-15 browser evidence (vía
  showroom), 2 sockets huérfanos del chrome chart.
**Auditoría Fable de F1: APROBADO, 0 bloqueantes** (11 mutaciones con
restauración byte-exacta; todos los números duros recomputados). Las 7
correcciones aplicadas en `03ef51b54` (ADMISSION universal 10 raíces/74
variantes, cascade/ al digest, status cerrado, spawn del runner + 2 rojos
re-adjudicados, FORMA dura, piso fail-closed, prosa). **F1 — CERRADO
(2026-08-20).** gates:ci 82+2 verdes en HEAD. Baseline de suite: **1674/22**
(bajó de 24: los 2 rojos escondidos del runner quedaron re-adjudicados).
Anotado para F2: raíces con dominio no enumerado quedan fuera de ADMISSION
con nota (si una pasa a enum, entra sola); los 7 rojos estables sin forma
sellada siguen comparándose por nombre.
**F1.5 ✅ `0f7aeadae`** — celda gobernada bloqueante en program-check
(6 drills, 7 mutaciones, 2 sobre el árbol real; piso anti-vacuo leído del
denominador del índice). Cierra la brecha de rules:633 desde afuera. Con esto
**F1 queda completo de ejecutor** — resta la auditoría Fable del frente.
**F1.4c ✅ (adjudicación del coordinador, medida):** las 5.100 celdas
quedaron 100% gobernadas — 1.472 con filas + 3.628 con ley escrita, **0
peladas**. `targetBinding` **NO se borra** (corrección al §4: el plan decía
"borrar al final"; medido el árbol, es el portador de la ley por celda —
status + prescripciones son adjudicaciones, no andamio). Los 629
uncoveredByDesign son adjudicaciones escritas con puntero a fase 3 — quedan
como están, visibles.
**F1.4b structure+final ✅ `a43ad6550` + `c45e96d69` — F1.4b COMPLETO:**
10 celdas migradas con fila (6 piloto + 4 pattern) + **354 marcas** unificadas
(marca = celda adjudicada). El trabajo real fue ~2% de las candidatas; el
resto eran adjudicaciones escritas esperando lectura (FAM-CHART3, Grupo A,
dedup Grupo B, FAM-20). Adjudicación nueva del coordinador: `semanticOwner` =
el control que la evidencia declara `ownedBy` (en el caso coincidente, el de
la celda) — la ley de cardinalidad lo exigió en primitive. Anotado para F2/
fase 3: `--_ds-page-rule-style` y `--_ds-page-panel-radius` tienen 4+2 familias
consumidoras declaradas y 0 declarantes en CSS; y 7 celdas de structure/record
citan el canal público donde el dueño declara el privado (evidencia con nombre
equivocado, sin veredicto cambiado).
**F1.4b-chart ✅ (sin cambios — `0` filas, verificado contra el árbol).** La
clase ya estaba resuelta por dos adjudicaciones escritas: FAM-CHART3 (54
celdas, premisa "cero lecturas" re-medida y cierta) y Grupo A (36,
chart-foundation.css sin dueño deliberado). Se resta del plan: quedan ~354 en
4 clases. Adjudicaciones del coordinador: (a) `channelId` = **el socket** (el
piloto manda; mi nota anterior era un residuo); (b) la marca
`migratedToInternalChannels` pasa a significar "celda adjudicada" — se unifica
en el lote structure; (c) 2 sockets huérfanos del chrome chart
(legend-tracking, legend-text-transform: leídos, nunca declarados) anotados
para F2/fase 3.
**F1.4 — descomposición medida (coordinador, contra el árbol):** las 5.100
celdas = 1.462 migradas + 449 MUST_REACH (444 con bindings + 1 vacío) + 629
uncoveredByDesign + 2.424 MUST_NOT_REACH + 255×3 (ESCAPE_HATCH/
OVERLAY_OF_ROOTS/NO_CSS_CHANNEL — leyes, no huecos). Ejecución:
- **F1.4a-piloto (mío):** una familia (chart/basic/area-chart) autorada a mano
  como ejemplar — el mapeo binding→fila internalChannels NO es mecánico
  (channelId = el canal gobernado al que debe resolver el socket, no el socket;
  eso es juicio por fila).
- **F1.4b (worker):** réplica del patrón por clases de familia (primitive
  1.532, pattern 787, surface 523, structure 454, chart 342), program-check de
  red, en lotes con commit por clase.
- **F1.4c:** los 629 uncoveredByDesign (prescripciones "fase 3 decide") se
  adjudican con la puerta que F1.5 abre; `targetBinding` solo se borra cuando
  cada celda tiene su ley re-expresada (nunca en masa — las 3.189 con status
  son adjudicaciones, no deuda).
**F1.3 ✅ `5c260b3a0`** — `root-exposure-gate` bloqueante (82 gates en CI).
La exposición de las 63 raíces queda gobernada: 26 tenant-dial con `governedBy`
real, 27 internal-head protegidas de ganar perilla en silencio, 10 gap
decrease-only con adjudicación escrita obligatoria (la nota debe NOMBRAR el
control — ejercitado por 2 gaps vivos). Hallazgo de diseño: `declaredOutputs`
es `representativeOnly` — el vínculo es `governedBy`, no la lista. Anotado
para F2: `tier.accent.bg` es el único gap con `channel: null`.
**F1.2 — la saga completa (2 paradas del worker, ambas correctas).** La
primera versión (lift) se auto-cancelaba: `domain` se regenera entero y solo
`calibration`/`retiredAliases` sobreviven al `--sync`; y contradecía el ruling
escrito `vocabularyDomicile`. La segunda (mis citas de fuente) salía al revés
al leer las líneas: la constante dice `cardComponent`; `catalogLaw` ya había
adjudicado motif (admitido ≠ expandido) y density (dueño: `density.mode`).
**Adjudicaciones finales del coordinador:** (1) alias `card`↔`cardComponent`
declarado UNA vez en la ley de paridad, nada se renombra; (2) motif 7 y
density fuera del catalog: sostenido, cero cambios de datos; (3) paridad en
versión IMPLICATIVA (todo valor que un root emite está admitido por un dueño
gobernado) con el alias + la regla cross-owner density→density.mode.
Entregado ya (2b): la validación FORMA en program-check (kind enum ⇒
enumValues no vacío O catalog presente), 3 drills probados por MUTACIÓN
(25/25). En vuelo (2c): la paridad implicativa. Lección de método para todos
los briefs futuros: citar líneas de fuente solo verificadas en el acto.
**Paso C2 ✅ `fd24be870`** — 16 sidecars a la forma de ley
`<capability>.<sufijo>` (lectura medida contra el gate); baseline **20→4**
(solo los 4 artefactos con nombre propio, razón re-escrita). Deuda anotada:
packinv:check (no CI) rojo por crecimiento de dist preexistente → F7.
**Paso C3 ✅ `8ab678dc1` + `82b800f94`** — manifest/ en forma capability (5
capabilities + 7 owners de datos, cero sueltos) y el scripts-tree-gate lo
cubre (M1): el doble hueco declarado por Fable (H8) queda cerrado. Con esto
**el Paso C queda COMPLETO** y la worklist cerrada de §13 ejecutada entera.
**Paso C1 ✅ `7df088fdf`** — los 13 renombres de capabilities ejecutados
con la maquinaria path-keyed (nunca a mano); baseline del scripts-tree-gate
**29→20** (decrease-only en acción). Cero sellos rotos (ninguno vivía en las
carpetas tocadas). gates:ci **80 VERDES**. Nota operativa: editar un
comentario en cualquier `.ts` de src/ dispara la cadena del censo (inputsDigest)
— vale para todos los lotes de F1+.
**F1 — arranque (lote heredado del cierre F0.5).** H2 ✅: los drills del
scripts-tree-gate ahora plantan archivos reales en un sandbox tmpdir (8 drills
de detección en disco + los de reporte). H1 ✅: R5 extendido a subfamilias de
lib/ (3 casos vivos adjudicados en baseline). **Worklist CERRADA de Paso C**
(Fable: que el alcance no viva solo en la memoria del mapeo): (a) 6 prefijos
de familia: ci-gates.manifest, engine-freeze-gate, engine-token-audit,
i18n-key-parity-gate, taxonomy-parity-gate, tokens-catalog; (b) 3 prefijos de
subfamilia lib/: build-input-hash, engine-corpus, engine-token-governance;
(c) 4 infijos con juicio de producto: run-ci-gates, cra-17-packaging-license-gate,
build-vertical-css, vertical-css-staleness.gate; (d) los 19 sidecars R3 con
nombre histórico → forma corta; (e) forma capability de packages/core/manifest/
(9 .mjs planos). Ejecución con la maquinaria path-keyed, nunca a mano.
**Auditoría Fable del frente F0.5: APROBADO, 0 bloqueantes**
(`/tmp/fable-frente-f05-verdict.md` — verificación de primera mano: gates:ci
propio, sha256 de la cadena computados a mano, 3 corridas de suite 24/24
idénticas al baseline). Condiciones del cierre implementadas en `652cf285e`:
H3 (worklist KIMI a su capability + exención exact-path con drill),
H4 (spacing.rhythm + registry measure fields; leg2-chromium anotado),
H6 (invariante de lint-folder-index en el archivo). H1+H2 = **primer lote de
F1** junto con Paso C; H5 (continue silencioso cross-repo) a F7.
**F0.5 — CERRADO (2026-08-20).** gates:ci final: 80 blocking + 2 excluded
visibles (dueño F2).
**Deuda nueva descubierta en el cierre (NO del frente):** (a) el
`dependency-honesty` de raíz en modos `static`/`check` reporta un unresolved
runtime module edge en `recipes/profiles/index.ts:76` — preexistente a F0.5
(último toque `26299ebff`), adjudicar en F1; (b) la evidencia browser de
cra-15 quedó stale desde el lote F (edit inerte de 9 bytes en
`registry/index.ts`) — cra-15 no está en el manifiesto CI por decisión
documentada; su re-sello corre por la vía de showroom en F1.
**Paso D ✅ `f4d20e30d`** (coordinador) — `scripts-tree-gate` bloqueante:
la ley §1.2/§2.9 sobre scripts/ es mecánica (R1–R6 + A1, baseline
decrease-only de 25 desviaciones adjudicadas con razón, 12/12 tests con 6
drills). **gates:ci: 80 blocking VERDES.** Paso C (acortamiento de nombres
pre-regla) DIFERIDO a F1 — el baseline del gate ya lo exige.
**Lote J ✅ `ece0c92ca`** (coordinador) — `audit-vertical-compliance` a
`structure/`: **scripts/ queda 100% folder/index** (0 producción suelta, 2
excepciones toolchain A11). Hermanos editados sin commitear (Fable H3) —
app-bithire:46, app-evnto:16, app-platform:58 los revisa su dueño. wiring
78/78, re-sello gat-07 (`211d64b6…`).

**Paso B — arranque confirmado y lote A habilitado (2026-08-19).** La
confirmación de Opus verificó todo contra el árbol (no de palabra) y midió la
baseline del Paso B: **1618 tests / 24 fallas = 23 estables + 1 flaky**
(channel-liveness: carrera entre el fixture de `cra-12-motion-governance.
reanchor.test.mjs` que escribe en `src/` y la enumeración CSS del gate;
aislado da 85/85). Adjudicaciones del coordinador sobre sus 7 hallazgos:
(3.1) la flaky se reporta APARTE; el fix real (fixture del drill a tmpdir) es
**deuda nueva post-Paso B**; (3.2) el worker corre `gat07:check` por lote y
reporta — el re-sello sigue siendo mío al commitear; (3.3) la atribución de
idiomas de Fable en F11-H estaba INVERTIDA — se sigue el árbol
(gat-07:58 es HERE-relativo, literal-ownership:37 es ROOT-relativo);
(3.4) 4 referencias vivas más integradas: `work-order/schema.json:158` (F),
`wiring-coverage-gate.mjs:41` ya sabía — se actualiza en F, docs internos del
paquete (B/C/H) con la regla "solo instrucciones de ejecución, no citas
narrativas"; (3.5) receipts sellados bajo test-artifacts/ se pudren sin
romperse — los adjudica F7; (3.6) lote J = 1 archivo. Baselines extra que
capturó: `lane-control-drills` (10/13 rojos fijos: E0-unattributed-emitter,
TOTALITY, PLANT/POSITIVE CONTROL, union 606 vs 625) y `gat07:check` verde
(4e75fec8). Nota operativa: `test:scripts` encadena 3 piernas con `&&` — con
la pierna 1 roja las otras no corren; el worker las corre por separado por
lote.

**Deuda anotada (no bloquea):** `packages/core/docs/TAXONOMY.generated.md` y
`test-artifacts/craft/cra-17/bundle-retention.json` estaban desactualizados
respecto al árbol ANTES de la 0-bis (la regeneración queda para el cierre de
F0.5 o F1, cuando el árbol deje de moverse).
5. Lote J (coordinador): `audit-vertical-compliance` a `structure/` + edición
   de `lint:vertical` en los 3 repos hermanos (SIN commitear allá — las revisa
   el dueño). Diferido por Fable H3 (cross-repo no atómico).
6. Paso C (renombres, opcional) y Paso D (scripts-structure-gate, mío; nace
   DESPUÉS del Paso C o con las excepciones A1/A2 escritas — Fable H10).
7. Graduación del manifest (censo: 32 lit + 7 calc + 15 solo-programa).
8. gates:ci final + auditoría Fable del frente.

**Auditoría Fable del mapeo (previa a Paso B): PROCEDER CON CORRECCIONES**
(`/tmp/fable-mapeo-verdict.md`). 5 bloqueantes, todos integrados al brief:
H1 Lote 0 (ya existía como `d3c431df0` — Fable auditó durante su ejecución);
H2 6+ consumidores en `src/tooling/` no censados → fixup F11 por lote +
lane-control-drills comparado contra su baseline roja en E/F/G/H; H3 tres
repos hermanos invocan `audit-vertical-compliance` → lote J diferido; H4
`dependency-honesty` de raíz importa `cra-17-public-declaration-gate` → lote E;
H5 test de `effect-registry-audit` de raíz rompe dos veces en lote F →
verificación ahora es `pnpm test:scripts` + grep residual desde la RAÍZ del
repo y por basename. Menores integrados: H7 constantes repo-relativas por
lote, H8 pareja pineada de analyze-bundle en lote F, H9 letra de F3 desfasada
(el árbol manda), H10 enmiendas de ley ya commiteadas (`7419d0758`,
`7c6e3bfcc`). Rechazada: smoke `import()` de scripts sin test (son CLIs con
efectos al importar; la ejecución real la cubre gates:ci + build).
