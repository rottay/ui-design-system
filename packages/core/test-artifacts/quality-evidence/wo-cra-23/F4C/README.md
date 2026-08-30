# F4C — canary visual de `palette.status-seeds` (Standard #14)

Este directorio guarda las corridas del canary visual del control
`palette.status-seeds`. Esta vacio a proposito: cada corrida escribe en una
subcarpeta propia por fase, y el harness solo escribe dentro del `output-dir`
que recibe.

```
F4C/
├── README.md          <- este archivo
├── phase-A/           <- linea base
│   ├── receipt.json
│   └── captures/A-<ground>-<captura>-<ancho>.png
├── phase-B/           <- cambio intended por la puerta DB
├── phase-C/           <- restore DB
├── phase-D/           <- cambio intended por la puerta static
└── phase-E/           <- restore static
```

El harness es
`packages/showroom/scripts/f4c-canary-capture.mjs`. No vive aqui porque no es
evidencia: es una herramienta viva del paquete que navega el lab del showroom.

---

## Que prueba el canary

Que el control Standard mueve **solo lo que debe** cuando se cambia el seed
`success`, y lo prueba con **tres evidencias por carrier**, no con una:

1. **Canal** — el valor de la custom property leida sobre el elemento carrier.
2. **Propiedad pintada** — `color`, `backgroundColor`, `backgroundImage`,
   los cuatro `border*Color`, `outlineColor`, `boxShadow`, `fill`, `stroke`.
3. **Pixel** — el sha256 del PNG de la captura completa.

El canal **nunca decide solo**. El contrato de customizacion termina en
`stable-dom-part -> observable-property` (`customization-model.json:67`), no en
"custom property presente": un canal heredado cambia aunque el selector
consumidor este roto. Por eso el veredicto `MOVED` exige al menos una
**propiedad pintada** movida.

Ademas, cada carrier positivo tiene que moverse **sin desbordarse**: geometria,
tipografia, motion y las dimensiones del nodo (`fontSize`, `borderRadius`,
`padding`, `animationName`, `rect.w`, `rect.h`, ...) deben quedarse quietas. Un
carrier que cambia de color y de tamano falla igual que uno que no cambia nada.

---

## Prerrequisito

Un servidor del showroom **ya corriendo**. El harness no levanta servidores, no
corre builds y no lanza tareas en segundo plano.

```bash
pnpm -C packages/showroom dev        # http://localhost:7001
```

Variables opcionales: `DS_REFERENCE_CAPTURE_PORT` (7001 por defecto) y
`DS_REFERENCE_CAPTURE_BASE_URL`
(`http://localhost:${PORT}/probe/ds-reference` por defecto).

Si nada escucha en el puerto, la corrida falla cerrado con ese mensaje en vez de
producir capturas vacias.

---

## La matriz

La matriz adjudicada tiene ocho capturas. La corrida de cierre habilita la
novena (`patterntimeline`, ver "El hueco del tier pattern" mas abajo), asi que
la forma certificada es:

Nueve capturas x dos grounds x tres anchos (390 / 768 / 1280) = **54 PNG por
fase**, con `--include patterntimeline`. Una corrida de ocho capturas (48 PNG)
sigue siendo valida como mecanica, pero no cierra el tier pattern como MOVER.

| captura | ruta | carrier(s) | tier |
|---|---|---|---|
| `alert` | `r2-behavior?only=alert` | Alert `tone="danger"` -> `data-tone="error"` | primitive |
| `result` | `r2-behavior?only=result` | Result `status="success"` (pozo del glifo) | primitive |
| `callout` | `r2-closure?only=callout-dismiss-focus` | Callout warning + info | primitive |
| `labels` | `display-labels` | Badge success/error/warning + Tag success/warning/danger | primitive |
| `cockpit` | `r3-evidence?only=cockpit-header-trail-and-posture` | pildoras de estado info + warning | pattern |
| `dashboard` | `r4-structures?only=dashboard-insights` | ActivityCompact `type="success"` (banda `modern`) | structure |
| `workbench` | `r6-surfaces?only=record-workbench` | RecordWorkbenchSurface `status.variant="success"` | surface |
| `feedback` | `feedback` | Spinner + Skeleton (negativos por ELEMENTO) + los 4 Alerts | primitive |
| `patterntimeline` | `r2-behavior?only=patterntimeline` | PatternTimeline `type="success"` (MOVER) + `type="error"` | pattern |

Los grounds son `bithire` (brazo static, BrandTheme) y `the-management` (brazo
DB, TenantThemeDocument compilado por request).

**Los `?only=` son obligatorios.** Sin uno valido, `r2-behavior` renderiza Tabs,
`r2-closure` cae en `image-fallback`, `r3-evidence` cae en el live feed, y
`r4-structures` / `r6-surfaces` devuelven 404. El harness asevera el status 200,
la readiness exacta de la escena y la **ausencia** del testid del caso por
defecto de cada ruta: una corrida no puede fotografiar Tabs y reportar
"sin diff".

### El hueco del tier `pattern` — CERRADO en la corrida de cierre

En las fases con seed `success`, la fila `cockpit` es info/warning, es decir
**NON-MOVER**. La fila `patterntimeline` esta declarada en el harness como el
MOVER de tier pattern disponible sin fabricar escena, y el DT la habilito para
la corrida de cierre con `--include patterntimeline`: el tier pattern queda
cubierto como MOVER (timeline-success) y como HOLD (timeline-error, incluido el
item con `color` literal que NO debe seguir al seed). El receipt sigue
reportando `tierCoverage` sobre la matriz activa.

Nota de escena: `patterntimeline` usa `groupByDate` sobre fechas fijas; si una
corrida de restore cruzara un limite de dia respecto de la baseline, un
encabezado relativo podria romper la igualdad byte del PNG (caveat ya declarado
en el harness).

---

## Las cinco fases

`A` es la linea base. `B`/`C` recorren el brazo **DB**; `D`/`E` el brazo
**static**. El harness **no aplica ningun cambio**: captura, mide y compara. El
cambio intended y el restore los hace el operador entre fases.

### A — linea base

```bash
node packages/showroom/scripts/f4c-canary-capture.mjs \
  packages/core/test-artifacts/quality-evidence/wo-cra-23/F4C/phase-A --phase A
```

### B — cambio intended por la puerta DB **declarada**

El control entra por `appearance.general.palette.status.success`
(`manifest/controls/palette.status-seeds.json:20-22`), **no** por
`advanced.tokenOverrides`: el override raw tambien mueve pintura, pero certifica
la capa Expert de mayor precedencia que este dial vino justamente a reemplazar.

1. Editar el bloque `general.palette` de la fila DB en
   `packages/core/src/foundation/contracts/composition/tenants/themes/tenant-theme/fixtures/themanagement-db-row/index.ts`
   (hoy ese bloque declara explicitamente que el color de estado NO se toca, en
   su comentario de las lineas 73-75).
2. Regenerar el fixture publicado. El JSON que el lab importa es **build
   product**, no se edita a mano:
   `pnpm -C packages/core tenant-theme-fixtures:generate`.
3. Capturar con `--phase B`.

Expectativa: en `the-management` se mueven los carriers success, el digest del
artifact **cambia** y el CSS servido cambia. En `bithire` **nada** se mueve: un
cambio de fila DB no puede tocar el brazo static.

### C — restore DB

Revertir la edicion, volver a correr `tenant-theme-fixtures:generate`, capturar
con `--phase C`. Todo debe volver identico a A: PNG byte a byte, digest del DOM
y computed.

### D — cambio intended por la puerta static

El seed static es `palette.successColor` del BrandTheme de bithire, en
`packages/core/src/foundation/tokens/ts/presentation/brand-themes/bithire/index.ts`
(atencion: hay dos ocurrencias de `successColor` en ese archivo, `:334` y
`:3456`; la del BrandTheme de tenant es la segunda).

**El rebuild correcto no es "rebuild del showroom".** El showroom carga
`@rottay/design-system/styles.css`, que resuelve a `dist/styles.css`. La cadena
real es brand-theme TS -> `build:vertical-artifacts` -> `build:css` -> `dist`, y
las tres estan dentro de un solo comando:

```bash
pnpm -C packages/core build
```

(`packages/core/package.json:640` encadena `build:vertical-css`, que a su vez
corre `scripts/verticals/build-vertical-artifacts` y `scripts/verticals/build-css`.)

Expectativa, y esta es la parte que hay que leer despacio: **los dos grounds se
mueven**. Ambos estampan `data-vertical="bithire"` (`ground/index.tsx:87` y
`:129`) y el artifact de `the-management` es un **delta** que retira los canales
iguales a la baseline vertical. Asi que el ground DB hereda el cambio static.
**Correccion (AGED_EXPECTATION, 2026-08-30):** la primera redaccion declaraba el
`artifact.digest` intacto "porque el digest no cubre valores de baseline".
Falso por mecanismo: el digest cubre `variables`
(`admission/index.ts:341-362`) y el delta **re-declara** los canales derivados
resueltos del seed heredado — mutar `palette.successColor` mueve 9
`--ds-color-success-*` dentro de `variables` (medido offline compilando el
fixture contra ambos dists: digest `55a070..` -> `0caf3d..`, y el restore
devuelve exactamente `55a070..`). Un digest que no se moviera mientras cambian
los bytes del artifact seria un oraculo peor. Lo pre-declarado en
`PHASE_EXPECTATIONS.D` es por tanto `paint: TONE_RULE` + `artifactDigest:
DIFFERS`; la prueba de restore exacto vive en C y E (digest identico a A).

### E — restore static

Revertir el seed, volver a correr `pnpm -C packages/core build`, capturar con
`--phase E`. Todo identico a A en ambos grounds.

---

## Comparar fases

```bash
node packages/showroom/scripts/f4c-canary-capture.mjs \
  --compare .../F4C/phase-A .../F4C/phase-B
```

Imprime, por captura, un veredicto `MOVED` / `NOT_MOVED` / `ERROR` con las tres
evidencias, y sale con codigo distinto de cero si alguna asercion falla. El
comparador tambien exige que las dos corridas compartan el hash del harness, los
anchos y el sha256 del manifest del control: dos corridas incomparables no se
comparan en silencio.

### Verificacion sin navegar

```bash
node packages/showroom/scripts/f4c-canary-capture.mjs .../F4C/phase-A --check
```

Relee el receipt y re-hashea cada PNG en disco. Falla si un hash no coincide, si
falta un PNG declarado o si hay un PNG en disco que el receipt no declara.

### Drills negativos

El contrato de evidencia exige un drill que falle ante una violacion nombrada
(`evidence-contract.json:76`). Cada drill perturba una observacion y **espera
que el comparador falle**; sale 0 solo si fallo.

```bash
node packages/showroom/scripts/f4c-canary-capture.mjs \
  --compare .../phase-A .../phase-B --drill hold-becomes-mover
```

| drill | violacion que planta |
|---|---|
| `hold-becomes-mover` | un tono hermano se movio |
| `mover-becomes-frozen` | el carrier intended no se movio |
| `png-tamper` | el pixel contradice al computed |
| `count-drift` | la escena cambio de forma entre fases |
| `geometry-leak` | el carrier positivo se desbordo a geometria |

### Verificacion rapida de la mecanica

```bash
node .../f4c-canary-capture.mjs /tmp/f4c-self-test --phase A --self-test
```

Reduce la matriz a dos capturas (`result` + `feedback`) y escribe
`receipt.self-test.json` en vez de `receipt.json`, de modo que una corrida de
prueba nunca pueda confundirse con una fase certificada.

---

## Determinismo

La igualdad byte A<->C/E no es gratis y no se asume:

- `reducedMotion: 'reduce'` en el contexto del browser. Skeleton
  (`skin/skeleton.css:48`), Spinner (`skin/spinner.css:73`) y el `pulse` del
  Badge (`skin/badge.css:543`, apagado en `:578-585`) animan; sin esto la
  igualdad byte falla **sin que exista regresion alguna**.
- `document.fonts.ready` + doble `requestAnimationFrame` antes de cada obturador.
- Viewport fijo por ancho, `fullPage: true`.
- Identidad del proceso servidor (`lsof` + `ps -o lstart=`) tomada antes y
  despues; si el server se reinicio a mitad de corrida, la corrida se invalida.
- El receipt registra `git rev-parse --short HEAD` y si el arbol estaba sucio.

---

## Nomenclatura del tenant DB

Tres nombres para la misma cosa, y el receipt registra los tres por fila:

| que | valor |
|---|---|
| segmento de ruta | `the-management` |
| `LabTenant` interno | `themanagement` (`ground/index.tsx:42`) |
| slug / `data-tenant` estampado | `themanagement` (`root-attributes/ssr/index.ts:90`) |

Un cuarto nombre que **no** es este: `themanagementmiami` es otro fixture, de
BrandTheme.

`rowVersion` no viaja como atributo del DOM. El receipt registra su ausencia y
deja constancia de que **esta cubierto por el digest**
(`visual-authority/.../admission/index.ts:348`): un bump de fila mueve el
digest aunque el payload no cambie, asi que el restore tiene que restaurarlo
tambien.

---

## Propagacion parcial pre-declarada

`--ds-color-success-bg`, `-border` e `-ink` **no** estan en
`declaredOutputs.channels` del control: son literales del BrandTheme, no
derivaciones del seed. Badge soft (`skin/badge.css:396`) y el status-badge de
RecordWorkbench (`presentation/components/skin/record-workbench.css:95`) los
leen, asi que un fondo verde puede sobrevivir bajo un tono rotado.

Esto esta declarado en `DECLARED_PARTIAL_PROPAGATION` dentro del harness y viaja
en el receipt. **No decide pass/fail**: la ley MOVER es ">=1 propiedad pintada se
movio", no "todas", asi que un literal congelado no puede producir ni un rojo
falso ni un verde falso. El harness tambien lee esos canales no declarados y los
registra, para que la propagacion parcial quede **medida**, no supuesta.

---

## Alcance declarado

- **Modo claro unicamente.** El control declara "No dark twin"
  (`manifest/controls/palette.status-seeds.json:99`) y el lab fuerza
  `themeMode: 'light'` en ambos grounds. El modo oscuro esta fuera de alcance.
- **Sin modo juez.** `?judge=` solo lo montan las paginas `r2-*`; F4C asevera la
  **ausencia** de `[data-testid="lab-judge-mode"]` en todas las capturas: mide
  pintura real, no una transformada de juicio.
- **El oraculo de CSS servido** (sha256 de las hojas inline mas los bytes de las
  hojas enlazadas) es el unico oraculo del ground static, que deliberadamente no
  tiene digest de artifact (`ground/index.tsx:184`, `:205`). Contra un servidor
  de desarrollo, una recompilacion de HMR puede mover ese digest sin que se mueva
  el diseno; el receipt guarda la lista hoja por hoja para que un rojo asi sea
  diagnosticable en vez de opaco.

---

## Incidentes resueltos durante la primera ejecucion (2026-08-30)

La primera fase A real salio 24/54 con 30 fallos de readiness. Dos defectos
reales, cada uno con su correccion minima:

1. **El ground DB no hidrataba (todas las filas de `the-management` en 0).**
   Cadena causal demostrada: `LabGround` acuña el receipt SSR del artifact en la
   instancia de modulo RSC (`emitTenantThemeArtifactForSsr`), pero el provider
   renderiza en servidor dentro de la SEGUNDA instancia del modulo (la capa SSR
   de componentes cliente), cuyo `MINTED_SSR_RECEIPTS` nunca vio esa acuñacion;
   la auditoria del receipt falla cerrado
   (`visual-authority/foundation/admission/index.ts:606-607`,
   `blocked("unprovable-ssr-mount")`) y el server pinta el `LoadingScreen`
   (vacio: `provider/index.tsx:276`). En el browser el mismo provider toma la
   via del DOM montado, verifica el `<style>` embebido y renderiza la escena en
   el PRIMER render cliente: servidor vacio vs cliente escena = mismatch de
   hidratacion; la regeneracion que dispara React replaya el `<style>` del RSC y
   lo hace coexistir transitoriamente con el SSR, y la guarda de retencion
   revoca el artifact ("expected exactly one mounted artifact element, found
   2"). **Correccion (lab, sin tocar core):** el provider del ground DB se
   difiere al cliente con `ground/client-only.tsx` — servidor y primer render
   cliente coinciden en vacio, el provider monta contra un documento ya
   estampado y con el artifact embebido, y ninguna guarda se debilita
   (ReservedTenantIdentityError y la verificacion de montaje intactas). El
   brazo static no lo necesita: la resolucion por slug es asincrona y ambos
   lados coinciden en el LoadingScreen vacio.
2. **`dashboard` media 3 bandas de engine.** La escena `r4-structures`
   renderiza `ENGINES = ['modern','classic','rustic']`
   (`sections/r4-structures/index.tsx:57,155-161`), asi que
   `[data-export="ActivityCompact"]` aparecia 3 veces contra el `exact: 1`
   declarado. **Correccion (harness):** readiness y carrier de `dashboard`
   acotados a `[data-engine-band="modern"]`, coherente con el resto de la
   matriz (todos los carriers son modern-scoped).

Ademas, la auditoria read-only del harness (pre-cierre) levanto tres defectos
del comparador, remediados en el mismo lote:

- **DEFECT-1 (alta):** `compareRuns` no rechazaba corridas degradadas ni
  exigia cobertura de ambos grounds. Ahora exige `pass===true` y
  `runMode==='full'` en ambos receipts, y al menos una fila por ground
  declarado en `PHASE_EXPECTATIONS`.
- **DEFECT-2 (media):** `--check` daba verde sobre una corrida crashed/parcial
  si los PNG presentes hasheaban bien. Ahora exige `pass===true` del receipt.
- **DEFECT-3 (media):** los drills salian 0 sobre un par ya roto (verde vacio,
  sin causalidad). Ahora el modo `--drill` exige primero que la comparacion
  limpia pase, y solo entonces la perturbacion debe hacerla fallar.

Queda como nota (baja, no bloqueante): un drill sin objetivo en la fase
(p.ej. `mover-becomes-frozen` sobre A->C) termina en excepcion cruda, que es
fail-closed y roja como debe; solo falta un mensaje de uso mas amable.

3. **Flake de asentamiento del cockpit (instrumentacion, no producto).** La
   primera corrida B de la serie final salio 53/54: `cockpit-info` midio 0
   pildoras porque la banda `settled` aparecio un render antes que sus partes.
   La corrida fallo cerrado (pass=false, jamas presentada como evidencia) y el
   reintento salio 54/54. **Correccion (harness):** la lectura de cardinalidad
   del carrier se reintenta por una ventana acotada (250 ms x 20) antes de
   fallar; si el conteo no converge, la captura sigue fallando. Documentado a
   pedido de la auditoria Codex; Fable lo revisa en el cierre.

4. **Expectativa del digest de D corregida (AGED_EXPECTATION).** La ley
   original declaraba `artifactDigest: IDENTICAL` para D/the-management
   ("el digest no cubre valores de baseline"). Falso por mecanismo: el digest
   cubre `variables` y el delta del tenant re-declara los canales derivados
   resueltos del seed heredado; mutar `palette.successColor` del BrandTheme
   mueve 9 `--ds-color-success-*` dentro de `variables` (verificado offline:
   digest `55a070eb…` -> `0caf3d29…`, y el restore devuelve exactamente
   `55a070eb…`). Un digest que no se moviera mientras cambian los bytes del
   artifact seria un oraculo peor. La expectativa corregida es `DIFFERS`; la
   prueba de exactitud del restore sigue en C/E (digest IDENTICAL a A).

5. **E/labels/the-management/1280: flake de posicionamiento del tooltip forzado
   (RESUELTO por re-captura, no por adjudicacion — leccion de la auditoria
   Fable real).** En la serie con harness `08b70aef…`, A->E salio con UNA fila
   roja: el PNG de `labels|the-management|1280` difiria en 160 px con delta max
   219/255 (el borde oscuro del tooltip forzado-visible de
   `sections/display-labels/index.tsx:174` desplazado unos px en x). Mi primera
   lectura ("frontera de sesion / orden de llegada de la fuente") era FALSA y
   la auditoria Fable la refuto con evidencia: D (corrida en un servidor
   fresco) tenia el tooltip donde A, y una re-captura E2 (mismo servidor que E,
   2.5 min) salio byte-identica a A. Mecanismo real: carrera de posicionamiento
   del tooltip por lanzamiento de browser (mide su ancla antes de que asienten
   las metricas de fuente), reproducible solo a veces. Leccion procesal que
   queda escrita: cuando el instrumento dice `pass=false` y una corrida limpia
   es barata, se RE-CAPTURA; no se adjudica una excepcion sobre un rojo del
   comparador. La estabilizacion de la escena (tooltip forzado que mida su
   ancla tras fonts.ready) queda como deuda del lab.

6. **Nota de reporte (cosmetica, no de veredicto):** la linea de log "ruido de
   rasterizado medido y dentro de tolerancia" del comparador se imprimia cuando
   el diff era MEDIDO, tambien en filas que fallaban por exceder la tolerancia
   (la fila del incidente 5 imprimio la nota con delta 219 y FAIL).
   Corregido en la edicion final del harness: la linea ahora dice "dentro" o
   "FUERA" segun el veredicto de la tolerancia (pngNoise.justified viaja en el
   veredicto).

7. **Notas del revisor Sonnet-asiento (serie previa, no bloqueantes):**
   (OBS-1) el self-hash del harness es la unica trazabilidad entre series
   mientras el archivo sea untracked — se resuelve al commitear este lote;
   (OBS-2) `--compare` contra un directorio cuyos PNGs estan rotando muere con
   ENOENT crudo en `pixelDiffStats` — fail-closed, misma clase que la nota de
   drills sin objetivo; (OBS-3) citas de linea del scout COH-1 quedaron atras
   tras crecer el harness — cosmeticas, los nombres van junto a las lineas.

---

## Resultado de la corrida de cierre (2026-08-30, harness e7fd30c4…)

La serie de cierre corre bajo UN solo hash de harness (`e7fd30c4…`, la edicion
que incorpora las remediaciones de la auditoria Fable real: atribuciones
honestas, fuentes del ground pineadas en `sourceFiles`, `groundRendering` por
fila, y la linea de ruido que distingue dentro/FUERA de tolerancia). Las dos
series previas (hashes anteriores) se descartaron enteras: el self-hash es la
regla. Matriz de cierre: 9 escenas (con `patterntimeline` habilitada por el DT)
x 2 grounds x 3 anchos = **54 PNG por fase**.

Digests del artifact the-management por fase (leidos del DOM servido):
A = C = E = `sha256-55a070eb…`; B = `sha256-675ad7b1…` (puerta DB);
D = `sha256-0caf3d29…` (herencia static, expectativa corregida — incidente 4).

| fase | capturas | chequeo | comparacion | resultado |
|---|---|---|---|---|
| A baseline | 54/54 | `--check` 0 fallos | — | valida |
| B (DB: `status.success=#2F7A3D` en la fila, fixture regenerado) | 54/54 | 0 fallos | A→B **PASS** | the-management: MOVERs success con 0 deltas hold, hermanos HOLD, digest+css DIFFERS; bithire: HOLD_ALL byte-exacto (0 filas de ruido) |
| C (restore DB) | 54/54 | 0 fallos | A→C **PASS** | todo identico a A salvo 1 fila de ruido medido: workbench/bithire/390, 8 px Δ1 |
| D (static: `palette.successColor=#7C3AED` + `pnpm -C packages/core build`) | 54/54 | 0 fallos | A→D **PASS** | ambos grounds: TONE_RULE; the-management digest DIFFERS; bithire sin artifact (ABSENT); 0 filas de ruido |
| E (restore static + rebuild) | 54/54 | 0 fallos | A→E **PASS** | todo identico a A salvo 2 filas de ruido medido: dashboard/bithire/768 (155 px Δ2) y workbench/bithire/390 (8 px Δ1) |

Drills sobre A→B (par verde): los 5 muerden (`hold-becomes-mover`,
`mover-becomes-frozen`, `png-tamper`, `count-drift`, `geometry-leak`; exit 0 =
el comparador falla como debe). Sobre A→E los aplicables muerden tambien:
`hold-becomes-mover`, `png-tamper` (que ahora SI prueba: la limpia pasa) y
`count-drift`. `mover-becomes-frozen`/`geometry-leak` no tienen MOVER en una
fase restore: terminan rojas por excepcion controlada, como declara la nota de
drills sin objetivo. Logs: `compare-logs/{A-B,A-C,A-D,A-E}.log`,
`drill-{…}.log` (A→B) y `drill-AE-{…}.log` (A→E).

La fila `labels/the-management/1280` de la serie previa (flake del tooltip,
incidente 5) quedo **resuelta por re-captura**: en esta serie el PNG es
byte-identico al de A, como la auditoria Fable demostro que debia ser.

**Declaracion del cierre:** CAUSAL PASS; STATIC/DB PATH CERTIFIED; RESTORE
CERTIFIED; **AESTHETIC NOT_ACCEPTED** (el owner rechazo la estetica de las
capturas; este lote no afirma calidad visual).

**Propagacion parcial (no silenciada):** `--ds-color-success-bg`, `-border`,
`-ink` y los `--ds-color-alpha-success-*` NO siguen al seed en este cierre — son
literales del BrandTheme / foundation fuera de `declaredOutputs`. Medidos en
cada receipt (`channelsRead.undeclaredWatched`). F4C cierra como canary ACOTADO
de `palette.status-seeds`; la coherencia del skin completo (tints derivados del
seed) es exactamente el lote COH- 1 que se abre a continuacion.

**Deuda registrada (no bloqueante):**
- `ssrReceipt` por identidad WeakSet es inalcanzable en la topologia RSC->cliente
  (revision arquitectonica ejecutada por subagente Kimi K3, condiciones (i)-(iv)
  en `scouts/f4c-model-honesty-and-prior-reviews.md` y en el comentario de
  `ground/client-only.tsx`; ratificado por la auditoria Fable real,
  adjudicacion (a)): la admision SSR por receipt queda ejercida solo por tests
  de una instancia; el producto pineado (app-bithire 2.19.37) no porta aun este
  contrato. Latente, no viva.
- Tooltip forzado-visible del lab: posicion no determinista entre lanzamientos
  del browser (incidente 5). Candidato a estabilizacion de escena fuera de este
  lote.
- 49 findings de channel-liveness reportados en notas del programa son 48
  (medido dos veces por scouts independientes): correccion de glosa numerica,
  sin efecto en este lote.
