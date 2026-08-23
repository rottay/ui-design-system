# PRE_F4B Lote A — PLAN DE CORRECCION consolidado (Opus, READ-ONLY)

## VERDICT: READY_FOR_FABLE_CHALLENGE

Un solo tranche coherente, dentro de **A1–A12 sin ampliar paths**, que lleva
`unknownProvenance` a **exactamente `[]`** con receipt y negativo por clase.
Este documento **no escribio nada en el repo**: no hay writes, ni git mutante,
ni build, ni browser. Worktree sucio preservado, `staged 0`, HEAD
`9d5582dfdf1d02f1d7e8fd468720b1d829e50454`.

**El hallazgo que cambia el plan:** las 4 filas que el handoff declaro
*irreducibles por analisis estatico* **no lo son**. Las cuatro tienen
disposicion probada sin tocar `src/**` (§1.5). Por tanto `[] ` es alcanzable
dentro del write-set congelado, y el bloqueo actual es de trabajo pendiente, no
de imposibilidad.

## 0. Autoridades leidas completas y verificadas

| Autoridad | SHA-256 | Coincide |
|---|---|---|
| reauditoria A4–A9 | `05970a35b791b1e339300589a35c05107537f36a81b1a86cb7aef8a4cf12cc70` | si |
| addendum DT v3 | `7b704a260fe1cbe5b10902ef68dd381e511524f5aa0d18fb7008b0b5d3145295` | si |
| adjudicacion Fable v3 | `0dd58125dc55f55f1506eb3e9294b0f11e859c8a826ef204e1a997a397c812af` | si |
| ruling DT A4–A9 | `e86e1a5637a4b9c909ba6a7f70323451d94fe23bd74df00221bedfd1c77fb860` | si |
| (contexto) auditoria A4–A9 | `be993f9b3e22898d1d70b5a63b4cfeb9d8b4a3a1ff045e08d687c2c679d9dedb` | si |
| (contexto) handoff bloqueado | `e81ee0fe30e45951806f7cd930424393f27fa3074f01d4fdf67429f8ecf52611` | si |

Estado medido del artefacto que se corrige: A4 `2af8f6c9…`, A5 `7e977dfd…`,
A6 `5c957e0c…`, A7 `37d0b2e4…`, A8 `fa898fe0…`, A9 `1510376f…` — identicos a
los que la reauditoria cita.

---

## 1. Clasificacion causal de las 2 024 unknown

Medida re-parseando con el AST de TypeScript cada archivo que aporta filas
(sonda read-only `/private/tmp/unknown-classify2.mjs`, 525 archivos). **Ninguna
fila se suprime por heuristica**: la clase se decide por el binding real del
head de la expresion en el alcance del archivo.

| Clase | Filas | Origen ultimo | Disposicion |
|---|---:|---|---|
| **R — relay** | **1 083** | el head liga a un PARAMETRO/prop del componente | `proven-external-relay`: el sitio reenvia, no autora |
| **A — resolvable** | **696** | binding local (635) o import interno del paquete (61) | se resuelve: pasa a productor autorado o a `L` |
| **L — sin objeto** | **68** | la expresion no puede denotar un objeto (`undefined`, `null`, literal, `!x`) | fuera del universo por ley explicita |
| **E — head sin adjudicar** | **173** | heads que ninguna de las reglas anteriores liga | adjudicacion fila por fila; sin clase por defecto |
| **D — sumidero dinamico** | **4** | `setProperty` con nombre computado | §1.5, las cuatro con receipt |
| **Suma** | **2 024** | — | identidad exacta, cero residuo |

`1083 + 696 + 68 + 173 + 4 = 2024`. El gate debe **gatear esa identidad**: una
fila que no cae en ninguna clase es un fallo del clasificador, no un residuo.

### 1.1 Clase R — relay (1 083)

`<div style={style}>` donde `style` es prop del componente. El sitio **no
autora** ningun canal: reenvia el objeto que le pasa quien lo llama.

- **Prueba de origen (obligatoria, no por nombre):** el head resuelve, por
  alcance lexico AST, a un `ParameterDeclaration` de la funcion que encierra al
  sink — directo o via `ObjectBindingPattern`. La deteccion actual acierta 269
  por binding real y **814 por patron de nombre** (`style`/`props`/`rest`); el
  plan exige que las 1 083 pasen por el binding real y que el atajo por nombre
  se elimine. Un `const style = {...}` local NO es relay.
- **Receipt por fila:** `{ file, line, symbol, paramName, declaredAt, kind: "relay" }`.
- **Disposicion:** el sitio sale de `unknownProvenance` y entra en una coleccion
  propia `relaySites[]`, **no consumible como productor**. Los canales, si
  existen, se atribuyen en el literal del llamador, que es su propio sink en el
  mismo universo.
- **Cierre del universo:** los llamadores dentro de `packages/core/src` ya se
  escanean. Los llamadores fuera del paquete (apps) quedan fuera por la **ley de
  frontera de paquete**, declarada y digestada.
- **Negativo:** un sitio cuyo head liga a un `const` local con propiedades
  custom NO puede clasificarse relay; debe seguir siendo productor.
- **Negativo 2:** un componente que hace `style={{...style, '--ds-x': v}}`
  autora `--ds-x` **y** reenvia: produce fila de productor **y** relay.

### 1.2 Clase A — resolvable (696)

- **635 binding local**: member-access dentro de objetos locales
  (`resolvedStyle.style`, `styles.foo`, `baseStyles[x]`) y llamadas a factories
  locales (`getCellStyle(...)`). Se cierran extendiendo el walk backward con
  tres reglas: (i) `PropertyAccessExpression` sobre un object literal local
  resuelve a esa propiedad; (ii) `ElementAccessExpression` con clave literal
  idem; (iii) llamada a funcion declarada en el archivo resuelve por sus
  `return`.
- **61 import interno**: `import { panelCardStyle } from '../../foundation/...'`.
  Se cierran con **una sola salto** de resolucion de modulo dentro del paquete
  (resolver el especificador relativo a un archivo real y parsearlo).
- **Receipt:** el `readRefId`-equivalente del sitio mas la cadena de nodos AST
  recorrida (`resolutionPath: [{file, line, kind}]`).
- **Negativo:** un import que sale del paquete (`react`, `@phosphor-icons/...`)
  **no** se resuelve y permanece unknown; el salto es intra-paquete por ley.
- **Techo declarado:** un solo salto de import. Un segundo salto requiere ruling
  del DT; sin el, la fila queda unknown en vez de resolverse "un poco mas".

### 1.3 Clase L — sin objeto (68)

`style={undefined}`, `style={null}`, literales y expresiones booleanas negadas.

- **Ley explicita:** *una expresion que no puede denotar un object literal no
  autora ninguna custom property.* Se aplica solo a formas sintacticas cerradas:
  `undefined`, `null`, `true/false`, literales string/number, y operadores
  unarios sobre ellos.
- **Receipt:** `{ file, line, expressionKind: ts.SyntaxKind[...] }`.
- **Negativo:** un ternario cuyas ramas SI son objetos no cae en `L`; debe
  resolverse por ambas ramas (ya soportado) o quedar unknown.

### 1.4 Clase E — 173 sin adjudicar

**No reciben clase por defecto.** El plan las trata como el trabajo real que
queda: cada una se adjudica por su binding, y la que no ligue a nada conocido
**sigue siendo unknown y sigue bloqueando**. Se publica su tabla de heads para
que el DT vea el frente exacto. Prohibido un cajon "otros".

### 1.5 Clase D — los 4 sumideros dinamicos, con receipt

Contra lo que afirmo el handoff, **ninguno exige tocar `src/**`**:

| # | Sitio | Origen ultimo (medido) | Disposicion |
|---|---|---|---|
| 1 | `infrastructure/runtime/foundation/root-attributes/presentation/index.ts:101` `claimRootStyleProperty` | `property` es **parametro**; en todo `src` **no hay call site de produccion** (solo su propio mensaje de error y `tests/`, excluidos por la ley de exclusion) | **R (relay) + frontera de paquete**: el dominio lo fijan consumidores fuera del paquete |
| 2 | `infrastructure/runtime/theming/.../css-variables-bridge/index.tsx:571` | `declarations: Readonly<Record<string,string>>` es **parametro** (`:171`), alimentado por `intent.declarations` (`:467`) = documento de tema compilado | **R (relay) del plano `ts-compilers`**, cuyo conjunto de canales ya esta enumerado |
| 3–4 | `ui/patterns/visualization/charts/runtime/exporting/foundation/file/index.ts:205,208` `inlineStyles` | copia **computed style** de un nodo vivo a un clon para exportar SVG; `prop` sale de iterar el computed style | **L por ley de copiador de fidelidad**: no autora canal, lo espeja |

El caso 3–4 **ya tiene autoridad en el arbol**: los marcadores
`@runtime-svg-paint-copy` existen en ese mismo archivo (`:111`, `:202`, `:225`) y
existe `scripts/engine/runtime-svg-paint-census/index.mjs`. La ley se ancla a
ese marcador, no se inventa. (Nota medida: ese censo **no** esta registrado como
gate id; el plan **no** lo registra — seria un path 13 y dispararia R-3.)

- **Negativo obligatorio:** un `setProperty` dinamico **sin** marcador y **sin**
  parametro que lo relaye debe seguir siendo unknown y bloquear.

---

## 2. Binding lexico y assignment exacto por AST para los tres owners V3-3

La reauditoria acepta los conjuntos vivos 7/10/10 y marca la brecha: asociacion
por **texto del identifier** y `thenStatement.getText().includes(...)`. Cierre:

### 2.1 `setLegacyButtonHoverBgAlias`
- Resolver el **binding lexico** del callee: subir la cadena de alcances desde
  cada `CallExpression` hasta el `FunctionDeclaration` objetivo. Una llamada
  cuyo identifier resuelva a un **parametro**, a un binding anidado o a un
  import distinto **no cuenta**.
- Exigir que el cuerpo de esa declaracion contenga el
  `ElementAccessExpression` de asignacion `vars[template] = …` cuyo template sea
  **el de la emision**, verificado por nodo y no por substring.
- **Negativos nuevos:** (a) parametro que shadowea el nombre; (b) binding
  anidado en un bloque interno; (c) import homonimo de otro modulo.

### 2.2 `CHART_SERIES_HUE_OFFSETS`
- Ya exige `VariableDeclaration` unica con `ArrayLiteralExpression`. Anadir:
  el simbolo debe estar **exportado** y ser el que consume `deriveChartSeriesPalette`
  por binding, no por nombre.
- **Negativo:** dos declaraciones del mismo nombre en el archivo ⇒ `null`.

### 2.3 guard de `chart-category`
- Sustituir `thenStatement.getText().includes("--ds-chart-category-")` por
  verificacion **por nodo**: dentro del `thenStatement` debe existir un
  `BinaryExpression` de asignacion cuyo `left` sea un
  `ElementAccessExpression` sobre `vars` con `argumentExpression` = el
  `TemplateExpression` de la emision.
- La cota `index < N` debe ligar al **mismo** identificador `index` que indexa
  el template, resuelto por alcance.
- **Negativos nuevos:** (a) un **comentario** dentro del `then` que mencione el
  canal; (b) un `then` que asigne **otro** canal; (c) `index` shadowed.

Ley transversal: **prohibido regex y prohibido name-only.** Toda adjudicacion
V3-3 devuelve, ademas del dominio, `bindingEvidence: {declaredAt, callSites[],
assignmentNode}` para que el postaudit la recompute.

---

## 3. `inputsDigest` completo, formula exacta y sensibilidad

La brecha medida: `srcCompilers` solo cubre los tres archivos del loop directo,
mientras la salida depende ademas del lector y de las fuentes de V3-3.

### 3.1 Conjunto efectivo (cerrado, derivado del codigo que corre)

```
cssEdges      = sha256(bytes de manifest/cascade/extracted/css-edges.json)
cascadeRoots  = D([ [name, sha256(bytes)] for name in sort(*.json de cascade/roots) ])
rootCatalog   = sha256(bytes de manifest/cascade/root-catalog.json)
artifacts     = D([ [theme, sha256(bytes)] for theme in sort(facade/artifacts/*/index.css) ])
srcTsx        = D([ [rel, sha256(bytes)] for rel in sort(archivos escaneados del plano tsx) ])
srcCompilers  = D([ [rel, sha256(bytes)] for rel in sort(READERS ∪ REACH_SOURCES ∪ CONSTANT_SOURCES ∪ V3_3_SOURCES) ])

donde D(x) = sha256(JSON.stringify(x))
```

`srcCompilers` debe cubrir, como minimo y por enumeracion del codigo que se
ejecuta:

- `src/tooling/lane-control/runtime/tenant-reach/index.mjs` — **el modulo lector**;
- `REACH_SOURCES`: `chrome-variables`, `appearance`, `brand-theme`, `tenant-theme`;
- `appearance-posture/index.ts` (loop directo);
- `CONSTANT_SOURCES`: `foundation/kernel/color/oklch/ramp/index.ts`;
- fuentes de V3-3: `foundation/kernel/color/oklch/chart-series/index.ts`.

Regla: **si `buildProducers()` lo lee, entra al digest.** El conjunto se deriva
de las constantes exportadas por el lector, no de una lista copiada a mano.

### 3.2 Pruebas de sensibilidad (una por autoridad)

Para **cada** archivo del conjunto: fixture que muta un byte y exige que
`inputsDigest.<clave>` **cambie**, y que las otras cinco claves **no** cambien.
El test actual (seis nombres + formato hex) se sustituye por esa matriz. Un
archivo que no mueva ningun digest es un archivo fuera del sello: fallo.

---

## 4. Fixture de build real con doble owner

### 4.1 Por que hoy no es producible

`producerSiteId = sha256(plane|file|line|symbol|ordinal)`. Como **`plane` entra
en la coordenada**, dos escaneres que miren el mismo punto del fuente producen
ids distintos y jamas colisionan. La ley "una coordenada, un owner" queda
inaplicable justo donde importaria.

### 4.2 Correccion

Sacar `plane` de la **coordenada** y conservarlo como **campo**:

```
producerSiteId = sha256(file|line|symbol|ordinal)      // plane NO participa
producerSites[i].plane = "css" | "ts-compilers" | ...  // sigue publicandose
```

Semanticamente correcto: un punto del fuente tiene un dueno, lo encuentre el
escaner que lo encuentre.

### 4.3 El camino productivo que ahora colisiona

Medido: el escaneo del plano `tsx-inline-stamp` recorre **`packages/core/src`
entero**, y las fuentes de compilador **viven dentro de `src`**. Un archivo de
compilador con un `element.style.setProperty('--ds-x', …)` es visto por los dos
planos. Fixture:

```
fixture/…/chrome-variables/index.ts
  linea N, dentro de `chromeToVariables`:
     vars[`--ds-fixture-${size}`] = v;       // claim del plano ts-chrome-variables
     el.style.setProperty('--ds-fixture-x', v);  // claim del plano tsx-inline-stamp
```

Ajustando el fixture para que ambos claims caigan en la **misma linea, mismo
simbolo y mismo ordinal**, `buildProducers()` publica **una** fila en
`producerSites` con `ownerConflict: [...]` y **una** fila en
`ownershipConflicts`.

### 4.4 Fail-closed exigido

- `ownershipConflicts.length > 0` ⇒ el inventario **no certifica**: mismo
  tratamiento que `unknownProvenance` no vacio.
- **Negativo:** el fixture sin la segunda autoridad debe dar `ownershipConflicts
  = []` — si diera conflicto siempre, el rojo no probaria nada.
- El helper `ownershipConflictsOf()` se conserva como unidad, **pero deja de ser
  la unica evidencia**.

---

## 5. Precedencia por owner ID, con relacion ordenada / no ordenada

Brecha medida: `order` lleva nombres de **contexto**, y hay **542 filas** con
varios owners y un unico contexto — es decir, filas que no expresan orden alguno
entre owners.

### 5.1 Schema corregido

```jsonc
{
  "channel": "--ds-x",
  "contexts": [
    { "executionContext": "stylesheet cascade",
      "owners": ["css-declaration@<producerSiteId>", …],
      "relation": "unordered",            // o "ordered"
      "evidence": "…" },
    { "executionContext": "render-time inline style attribute",
      "owners": ["tsx-stamp:containerStyle@<id>", "tsx-stamp:customBgStyle@<id>"],
      "relation": "mutually-exclusive",
      "evidence": "…" }
  ],
  "crossContextOrder": ["stylesheet cascade", "compileTheme document", "render-time inline style attribute"],
  "crossContextEvidence": "ley de la cascada CSS: …"
}
```

- `owners` lleva **IDs**, no etiquetas: `<ownerId>@<producerSiteId>`.
- `relation` es de vocabulario cerrado: `ordered` | `unordered` |
  `mutually-exclusive`. **`ordered` solo con evidencia real**; en su ausencia
  `unordered`, jamas un winner inventado.
- El orden **entre** contextos (la ley de la cascada) se separa en
  `crossContextOrder`: es lo unico demostrable hoy.

### 5.2 Negativos

- (a) dos owners en el mismo contexto sin evidencia de orden ⇒ `relation` debe
  ser `unordered`/`mutually-exclusive`; emitir `ordered` falla el test.
- (b) **contradiccion**: si dos filas afirman ordenes incompatibles para el
  mismo par de owners ⇒ fallo duro.
- (c) ninguna fila puede contener `winner`.

---

## 6. Read/write set minimo, comandos, deltas, stops y criterio de `[]`

### 6.1 Write-set — **4 paths**, todos ya autorizados

| # | Path | Cambio |
|---|---|---|
| A4 | `cascade-producers.mjs` | §1 (clases R/A/L/E/D + `relaySites[]` + identidad de suma), §2 (binding AST), §3 (digest), §4.2 (coordenada sin plane), §5.1 (schema) |
| A5 | `manifest/cascade/extracted/producers.json` | regenerar |
| A6 | `cascade-producers.test.mjs` | negativos de §1.1–§1.5, §2, §3.2, §4.3–§4.4, §5.2 |
| A7/A9 | `cascade-consumability.{mjs,test.mjs}` | **sin cambios** — la reauditoria los cierra |

**A1/A2/A3/A8/A10/A11/A12 no se tocan.** Cero paths nuevos. Cero `src/**`.

### 6.2 Read-set (autoridades, solo lectura)

`css-edges.json`, `cascade/roots/*.json`, `root-catalog.json`, los 3 artifacts,
`tenant-reach/index.mjs`, `REACH_SOURCES ∪ CONSTANT_SOURCES`,
`chart-series/index.ts`, y el arbol `packages/core/src` para el plano TSX.

### 6.3 Comandos

```bash
export PATH=/Users/daniel/.nvm/versions/node/v22.17.0/bin:$PATH
cd packages/core
node scripts/quality-evidence/programs/modern-rescue/cascade-producers.mjs --write
node scripts/quality-evidence/programs/modern-rescue/cascade-producers.mjs --write   # determinismo x2
node scripts/quality-evidence/programs/modern-rescue/cascade-producers.mjs --check   # pureza mtime+bytes
node --test scripts/quality-evidence/programs/modern-rescue/cascade-producers.test.mjs
node --test scripts/quality-evidence/programs/modern-rescue/cascade-consumability.test.mjs
node --test scripts/quality-evidence/programs/modern-rescue/cascade-extract.test.mjs
node --test scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs
node scripts/quality-evidence/programs/modern-rescue/program-check.mjs
node scripts/engine/cascade-wiring-ratchet/index.mjs      # debe seguir 2171/4374
pnpm test:scripts && pnpm gates:ci
```

### 6.4 Deltas esperados (falsables)

| Magnitud | Ahora | Esperado |
|---|---:|---|
| `unknownProvenance` | 2 024 | **0** |
| `relaySites[]` | no existe | ~1 083 + los 2 relays de §1.5 |
| filas clase `L` fuera de universo | 0 | ~68 + 2 |
| productores nuevos por clase A | 0 | ≤ 696 (los que resuelvan a objeto real) |
| clase E adjudicada | 0 | 173, **una por una** |
| `ownershipConflicts` (arbol real) | 0 | **0**, y **≥1** en el fixture |
| `inputsDigest.srcCompilers` cobertura | 3 archivos | ≥ 8 archivos enumerados del lector |
| `precedenceMetadata` con owners-por-contexto | 0 | todas |
| R-1 | 1817/1804/12/1 | sube por los tests nuevos; **fingerprint `4d6eda2d…` inalterado, 12 fallas, 1 skip** |
| `gates:ci` | 89+2 verde | identico |
| ratchet viejo | 2171/4374 | identico |

### 6.5 Stops

- **S-A** una fila que no cae en R/A/L/E/D ⇒ la identidad de suma falla ⇒ STOP.
- **S-B** una clase `L` o de frontera aplicada sin su receipt por fila ⇒ STOP.
- **S-C** el fixture de doble owner **no** produce conflicto ⇒ la ley sigue sin
  ser falsable ⇒ STOP.
- **S-D** un digest de §3.2 que no se mueve al mutar su archivo ⇒ STOP.
- **S-E** el fingerprint de R-1 deja de ser `4d6eda2dfbcaad2108b7341cad319160fcf47e7c048d59621170d55cf222cf5a`, o el failure-set deja de ser 12+1 ⇒ STOP.
- **S-F** el ratchet viejo se mueve de `2171/4374` ⇒ STOP.
- **S-G** haria falta tocar `src/**`, un gate id o un path 13 ⇒ STOP y ruling DT.
- **S-H** tras el mejor esfuerzo queda una sola fila unknown ⇒ **`SOURCE_READY_BLOCKED`**, B no arranca.

### 6.6 Restores

Backups por contenido en `/private/tmp/pre-f4b-lot-a-backup-r2/` con prehash
sha256 de A4/A5/A6 **antes** del primer write, congelado de `git status
--porcelain`, y restore por **copia + rehash**. Prohibido `git
show/checkout/restore/reset`. Re-verificacion de las **31 autoridades read-only**
antes y despues.

### 6.7 Criterio para que `unknownProvenance` sea exactamente `[]`

Se cumple cuando, sobre el arbol real y a la vez:

1. `unknownProvenance.length === 0`;
2. `|R| + |A-resueltas| + |L| + |E-adjudicadas| + |D| == 2024`, con la identidad
   gateada y publicada — **ninguna fila desaparecida sin receipt**;
3. cada `relaySites[]` lleva `paramName` + `declaredAt` por binding lexico, no
   por nombre;
4. cada fila `L` lleva su `expressionKind`, y cada frontera su ley citada;
5. las 173 de clase E estan adjudicadas **una por una**, sin cajon por defecto;
6. los 4 sumideros dinamicos llevan la disposicion de §1.5 con su cita en fuente;
7. `ownershipConflicts === []` en el arbol real **y** el fixture produce ≥1;
8. los seis `inputsDigest` con su matriz de sensibilidad verde;
9. R-1 con fingerprint canonico y `gates:ci` 89+2;
10. postaudit independiente sobre el diff completo.

Mientras cualquiera falle: **`SOURCE_READY_BLOCKED`**, B no arranca, B2 no
existe, y el ratchet viejo sigue siendo el gate de CI.

---

## 7. Lo que este plan NO hace

No autoriza ni implementa el Lote B. No toca roadmap, manifests historicos,
themes, fuente productiva, builds/generated ni browser. No registra gate ids
(incluido `runtime-svg-paint-census`, que existe pero no esta gateado: hacerlo
seria path 13 y R-3). No re-ancla contadores. **BC-0 sigue siendo del DT.**

## Verdict

**READY_FOR_FABLE_CHALLENGE** — las cinco clases suman exacto, cada una con
receipt y negativo; las 4 filas que se creian irreducibles tienen disposicion
probada sin tocar `src/**`; el doble owner pasa a ser producible por el camino
productivo con una correccion de coordenada; y el criterio de `[]` es
falsificable punto por punto. Write-set: **4 paths ya autorizados**.
