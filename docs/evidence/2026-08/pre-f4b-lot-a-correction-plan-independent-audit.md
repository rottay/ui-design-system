# PRE_F4B Lote A — auditoría independiente del plan de corrección

Fecha: 2026-08-22  
Modo: **READ-ONLY**; sin cambios al repo, tmux ni ejecución de tests/gates/build/browser.  
Plan auditado: `/private/tmp/pre-f4b-lot-a-correction-plan-opus.md`  
SHA-256 verificado: `979b5187e2d97394a1000a66ba264363944709b620c16144b4eff716cbedc459`

Autoridades contrastadas:

- contrato v3: `636c5c395412ade4e1dd724c0091f09620c4129df6fd0760d50b7faf4b98ec13`;
- addendum v3: `7b704a260fe1cbe5b10902ef68dd381e511524f5aa0d18fb7008b0b5d3145295`;
- adjudicación Fable: `0dd58125dc55f55f1506eb3e9294b0f11e859c8a826ef204e1a997a397c812af`;
- reauditoría A4–A9: `05970a35b791b1e339300589a35c05107537f36a81b1a86cb7aef8a4cf12cc70`.

Preestado vivo confirmado:

| Path | SHA-256 |
|---|---|
| A4 `cascade-producers.mjs` | `2af8f6c9170d60baf2300df312a849a1ca33a9dba0d0dc243658cd94a7cc7ba6` |
| A5 `producers.json` | `7e977dfd0d8dc0a9bca0df7f4e9324d17360a5deecc4b7aad7dbcad645cdad0f` |
| A6 `cascade-producers.test.mjs` | `5c957e0c0747e15da9f581721258805bcc4d07da00579e2305c600c386cbc9af` |

## Veredicto

**REJECT / NEEDS_PLAN_CORRECTION.**

El plan tiene una trayectoria útil —clasificar cada residual con receipt, cerrar V3-3 por AST, sellar todas las entradas efectivas, volver falsable el conflicto y expresar precedencia sin winner—, pero todavía no autoriza implementación. Hay cinco defectos bloqueantes:

1. la taxonomía `1083+696+68+173+4` proviene de una sonda heurística, no del binding léxico que el propio plan exige;
2. `unknownProvenance → []` es un objetivo condicional, no una posibilidad ya demostrada; `E=173` queda expresamente sin resolver y varias exclusiones necesitan autoridad;
3. retirar `plane` del `producerSiteId` contradice el schema exacto del contrato y el fixture descrito no puede colisionar por su propio `ordinal`;
4. el schema de precedencia propuesto cambia la forma contractual sin addendum;
5. el plan afirma derivar fuentes de constantes “exportadas”, pero `CONSTANT_SOURCES` no está exportada; y el write-set dice cuatro paths aunque enumera exactamente tres.

Mientras no se corrijan esos puntos, el estado real sigue siendo **`SOURCE_READY_BLOCKED`** y Lote B no abre.

## 1. Taxonomía 1083 + 696 + 68 + 173 + 4

### Resultado: **REFUTADA como adjudicación exacta; aceptada sólo como hipótesis exploratoria**

Sí se reproduce la suma aritmética sobre las 2.024 filas y 525 archivos:

```text
814 name-pattern relay
+269 parameter seen somewhere in file
+635 local identifier seen somewhere in file
+61 internal import name
+68 syntactic no-object
+173 other head
+4 dynamic setProperty
=2024
```

Pero `/private/tmp/unknown-classify2.mjs` no hace la medición que el plan declara:

- líneas 17–36 construyen `params` y `localConst` **a nivel de archivo completo**, sin scope, shadowing ni vínculo con la función que contiene el sink;
- línea 42 clasifica como relay si el mismo nombre aparece como parámetro en cualquier parte del archivo;
- línea 46 adjudica otras 814 filas sólo por los nombres `props|rest|others|style`;
- línea 39 extrae el head con split textual, no con unwrap y resolución AST;
- líneas 43–45 adjudican imports/locales por presencia del nombre, sin seguir su declaración ni demostrar que alcanza el sink.

Por ello los cinco conteos no pueden pinnearse todavía. La suma es exhaustiva porque el script fuerza toda fila a un cajón, pero no demuestra la causalidad de esos cajones.

### Corrección exacta

A4 debe producir primero un clasificador fuente-vinculado, y A6 debe probarlo:

1. dar a cada residual un `unknownSiteId = sha256(plane|file|line|symbol|ordinal|form)` publicable y recomputable;
2. localizar el nodo por `line/ordinal`, no reconstruirlo desde los primeros 120 caracteres;
3. resolver el binding desde el scope del sink, con shadowing, aliases, destructuring y default initializers;
4. exigir partición uno-a-uno: todo `unknownSiteId` previo aparece exactamente una vez en `relaySites`, `resolvedProducers`, `nonObjectSites`, `dynamicDispositions` o sigue en `unknownProvenance`; duplicado/ausente falla;
5. publicar los conteos **resultantes**. No exigir por anticipado que sean 1083/696/68/173/4.

Negativos mínimos adicionales a los del plan: parámetro con default object que autora `--ds-*`; local homónimo en otro scope; parámetro homónimo en otra función; alias destructurado; reassignment del parámetro antes del sink.

## 2. ¿Es realmente posible `unknownProvenance === []`?

### Resultado: **posible como meta, no demostrado por este plan**

El stop S-H del plan es correcto. Su promesa inicial (“lleva ... a exactamente `[]`”) no lo es:

- las 173 filas E no tienen adjudicación; el propio §1.4 dice que pueden seguir unknown;
- un solo salto de import puede dejar imports internos de segundo salto sin resolver;
- mover un passthrough a `relaySites[]` introduce una exclusión semántica nueva que contrato v3 no contiene; F-5 prohíbe vaciar por excepción manual;
- el write dinámico del personality bridge no es simplemente un sitio inerte: materializa en CSSOM las claves devueltas por `resolvePersonalityBridgeCssVariables(tokens)` y participa en precedencia. Debe enumerarse como productor/runtime relay con owner, canales y applicability, o una autoridad explícita debe excluirlo. Sacarlo del inventario de productores sin enumerar sus claves subcuenta una autoridad viva;
- para `claimRootStyleProperty`, el hecho del plan es incorrecto: existe un llamador productivo en `.../theming/composition/react/provider/index.tsx:211`, hoy con literal `color-scheme`. La conclusión medible puede ser “cero canales gobernados en callsites productivos del paquete”, pero el receipt debe citar ese llamador; no “no hay call site” ni “todos fuera del paquete”;
- los dos sinks de export SVG sí tienen evidencia fuerte como copiador de fidelidad (`@runtime-svg-paint-copy`), pero la exclusión debe exigir marcador + forma AST exacta + origen desde computed style, con negativo sin marcador.

### Corrección exacta

Reescribir el claim del plan así:

> “El tranche intenta reducir honestamente las 2.024 filas. `[]` sólo queda acreditado si la partición fuente-vinculada no deja residuo. Cualquier residuo conserva `SOURCE_READY_BLOCKED`; no se renombra ni se excluye para satisfacer el gate.”

Antes de implementar `relaySites[]`, emitir un ruling/addendum breve que autorice la frontera exacta y su schema. La ley debe distinguir:

- relay puro de parámetro, sin default autorado ni mutación;
- relay + autoría local (conserva productor y receipt relay);
- writer dinámico con dominio enumerable (conserva productor);
- copiador de fidelidad marcado (exclusión acreditada);
- API pública o import cuyo dominio no puede cerrarse (sigue unknown).

Para el personality bridge, resolver las claves del mapper importado y publicar su owner/contexto. Para root attributes, enumerar todos los callsites productivos internos y acreditar que el único actual escribe `color-scheme`, no `--ds-*`.

## 3. `producerSiteId` y conflicto real de ownership

### Resultado: **REFUTADO el cambio sin `plane`**

Contrato v3 fija dos veces la fórmula:

```text
producerSiteId = sha256(plane | file | line | symbol | occurrence)
```

A4 vivo la implementa en líneas 100–101. `plane` no es accidental: separa dos semánticas productivas que pueden observar el mismo archivo. Retirarlo es un cambio de contrato, no una corrección interna.

Además, el fixture de §4.3 no puede funcionar como está escrito. Dos statements distintos puestos en la misma línea siguen teniendo posiciones AST distintas. El compilador usa `emission.index` y el stamp usa `node.getStart(source)`; por tanto no comparten `ordinal`. “Ajustar” ambos a un mismo ordinal fabricaría la coordenada que se pretende probar.

### Corrección exacta

Conservar `plane` y la fórmula contractual. Hacer falsable el camino de build por una de estas dos formas equivalentes, sin cambiar el ID:

1. extraer en A4 un `materializeClaims(claims)` puro que sea exactamente el paso usado por `buildProducers()`, e inyectarle desde A6 dos claims con **la misma tupla completa** `(plane,file,line,symbol,ordinal)` y owners distintos; o
2. añadir a `buildProducers()` una opción de fixture `additionalClaims`/`claimFixture`, sólo usada por A6, que atraviese el mismo acumulador y materializador que el árbol real.

El positivo debe producir una fila `producerSites[].ownerConflict` y una fila `ownershipConflicts`; el negativo con un owner debe quedar vacío. El helper unitario se conserva, pero no es la única evidencia. El árbol real continúa con cero conflictos.

## 4. Precedencia por owner IDs

### Resultado: **dirección correcta, schema no autorizado**

Es correcto reemplazar el actual `order: [context names]` por IDs estables del tipo `<ownerId>@<producerSiteId>`, separar orden entre contextos de relación entre owners, no inventar `winner` y publicar `unordered`/`mutually-exclusive` cuando no hay evidencia.

Pero contrato v3 §5 fija una fila plana:

```json
{ "channel": "--ds-x", "executionContext": "...", "order": ["ownerA", "ownerB"], "evidence": "..." }
```

El objeto anidado `{contexts:[...], crossContextOrder:[...]}` del plan lo sustituye sin addendum. Un plan no puede autoenmendar su autoridad.

### Corrección exacta

O bien mantener el schema plano, una fila por `(channel, executionContext)`, o emitir un addendum que autorice exactamente:

```jsonc
{
  "channel": "--ds-x",
  "executionContext": "render-time inline style attribute",
  "owners": ["owner@site", "owner@site"],
  "relation": "ordered|unordered|mutually-exclusive",
  "order": ["owner@site", "owner@site"],
  "evidence": "..."
}
```

`order` sólo se llena para `ordered`; los otros estados conservan la lista de owners y no simulan orden. El orden cross-context puede publicarse en filas separadas o en un campo autorizado por el addendum. Deben existir negativos para orden contradictorio, `ordered` sin evidencia y cualquier campo `winner`.

## 5. `inputsDigest`

### Resultado: **conjunto conceptual correcto; mecanismo descrito parcialmente imposible**

La fórmula de seis claves y la cobertura mínima de ocho archivos únicos es correcta:

1. el lector `tenant-reach/index.mjs`;
2. cuatro `REACH_SOURCES` (`chrome-variables`, `appearance`, `brand-theme`, `tenant-theme`);
3. `appearance-posture/index.ts`;
4. `ramp/index.ts`;
5. `chart-series/index.ts`.

También es correcto deduplicar, ordenar por path, digestar `[path,sha(bytes)]` y probar sensibilidad por autoridad en un árbol temporal sin tocar el repo.

La frase “se deriva de las constantes exportadas por el lector” es falsa: `REACH_SOURCES` sí se exporta, pero `CONSTANT_SOURCES` es `const` privado en `tenant-reach/index.mjs:240`. Exportarlo ampliaría el write-set a `src/**`, prohibido por S-G.

### Corrección exacta

Sin tocar `src/**`, A4 debe:

- importar `REACH_SOURCES`;
- incluir el propio módulo lector;
- extraer `CONSTANT_SOURCES` del AST del lector mediante una gramática cerrada (array literal de strings e identificadores que resuelven a las cuatro constantes exportadas), fallando si cambia de forma;
- unir `APPEARANCE_POSTURE` y las fuentes V3-3 leídas directamente;
- deduplicar y ordenar antes del hash.

A6 debe mutar un byte de cada miembro en **fixtures temporales**, comprobar que sólo `srcCompilers` cambia y añadir un negativo donde una nueva fuente efectiva no sellada haga fallar la totality check. Las otras cinco claves y sus fórmulas quedan intactas.

## 6. Write-set mínimo exacto

### Resultado: **tres paths, no cuatro**

El plan enumera:

1. A4 `cascade-producers.mjs`;
2. A5 `manifest/cascade/extracted/producers.json` (regenerado);
3. A6 `cascade-producers.test.mjs`.

A7 y A9 se declaran “sin cambios”. Por tanto el write-set repo mínimo es exactamente **3 paths**. A7/A8/A9 no necesitan cambiar para esta corrección porque el fence de consumabilidad no valida el schema de productores.

Si se adopta `relaySites[]` o la nueva forma de precedencia, se necesita primero un ruling/addendum de autoridad, pero eso no convierte mágicamente el write-set repo en cuatro paths. Si el addendum exigiera cambiar otra ruta del repo, debe declararse explícitamente y pasar el stop de ampliación; no está autorizado por este plan.

## 7. Qué partes pueden conservarse

- La corrección AST de V3-3 va en la dirección correcta: binding léxico, assignment exacto y negativos de comentario/otro canal/shadowing.
- La matriz de sensibilidad de digests es necesaria.
- `unknownProvenance != [] ⇒ SOURCE_READY_BLOCKED` y B no arranca debe conservarse verbatim.
- `ownershipConflicts != []` debe seguir siendo fallo duro.
- Nunca publicar `winner` y no inventar orden es correcto.
- A7/A9 permanecen fuera del tranche.

## Brief ejecutable corregido

1. **Ruling primero:** autorizar taxonomía fuente-vinculada/`relaySites` y schema exacto de precedencia, o mantener el schema v3 actual.
2. **A4:** conservar `producerSiteId(plane,...)`; añadir `unknownSiteId` y clasificador por binding real; enumerar los dynamic writers en vez de borrarlos; excluir sólo copiadores acreditados; cerrar V3-3 por AST; sellar las ocho entradas efectivas con extracción AST fail-closed; materializar precedencia con owner-site IDs.
3. **A6:** negativos por scope/default/reassignment/import, dynamic writer/copy, V3-3, sensibilidad de cada input, conflicto real mediante claims inyectados al mismo materializador, precedencia contradictoria.
4. **A5:** regenerar únicamente desde A4; publicar partición/receipts e identidad uno-a-uno.
5. **Gate semántico:** si queda una fila unknown, entregar receipt `SOURCE_READY_BLOCKED`; sólo `[]` real permite postaudit y apertura de B.

Hasta que el plan incorpore estas correcciones, **no liberar writer**.
