# PRE_F4B — auditoría independiente del censo Sonnet de unknownProvenance

Fecha: 2026-08-22  
Modo: **READ-ONLY**; sin repo writes, tmux ni tests/gates/build/browser.  

Artefactos auditados:

- `/private/tmp/pre-f4b-unknown-sonnet-census.md` — SHA-256 verificado `4b0c3e5da33b44032a425cff5504c6d59fe4a567110aa47390d028eec4d1aab4`;
- `/private/tmp/pre-f4b-unknown-census-mapping.json` — SHA-256 verificado `2d148e8bffeb58e61b7846aa9a2dacf2498ee510874b784a7f8fa6ad5c481998`.

## Veredicto

**REJECT AS BINDING PREIMAGE.**

El censo es valioso como snapshot mecánico y sí prueba la identidad exacta de las 2.024 filas actuales. No prueba, en cambio, la taxonomía causal terminal que declara. El clasificador detiene el walk en el primer binding encontrado y el agregador lo convierte directamente en familia; no continúa hasta el origen del valor. El error no es marginal: **944 filas** rotuladas `localConstOrDestructureResolvable` llevan en el propio mapping `bindingDetail.kind=destructuredLocal` y `isSourceItselfAParamOrImport=directParam`. Son destructurings de un parámetro (`const { style } = props`), por lo que su frontera terminal es relay/prop, no “local resolvable”.

El mapping puede conservarse como **reconnaissance prestate** pinneada al A5 actual. No debe gobernar el plan v2 ni sus deltas hasta recomputar las familias con resolución recursiva terminal e identidad fuente estable.

## 1. Identidad de 2.024 filas

### Resultado: **ACCEPT para el snapshot actual**

Verificación independiente contra `manifest/cascade/extracted/producers.json` vivo:

```json
{
  "inventoryRows": 2024,
  "mappingRows": 2024,
  "indexMismatches": 0,
  "fullFieldMismatches": 0
}
```

La comparación completa de `plane,file,symbol,template,reason,detail` por índice dio cero discrepancias. También cierran:

- 525 archivos distintos;
- 6 razones: `833+635+389+153+10+4=2024`;
- índices 0..2023, todos únicos;
- 9 labels de familia presentes y suma aritmética 2024.

Esto acredita que no se perdió ninguna fila del artefacto vivo. No acredita que las familias sean causalmente correctas: la exhaustividad se obtiene porque `FAMILY_OF` obliga cada una de las 22 etiquetas intermedias a uno de nueve cajones.

### Límite de identidad

El informe llama “identidad estable” al índice del array. Es estable **sólo mientras los bytes y el orden del A5 actual permanezcan congelados**. Al corregir el scanner, una fila que desaparece o una nueva fila anterior desplaza todos los índices siguientes.

El mapping no conserva `ordinal/node.getStart`, aunque la sonda lo calcula; `contentId` tampoco es clave primaria: hay 1.936 hashes distintos para 2.024 filas y 154 filas en grupos duplicados. Además el JSON no sella el SHA de A4/A5, el `inputsDigest.srcTsx` ni los SHA de `classify.mjs`/`aggregate.mjs`.

Corrección exigida para una preimagen vinculante:

1. publicar `sourceInventorySha256=7e977dfd...`, `scannerSha256=2af8f6c9...`, `srcTsxDigest` y los SHA de ambas sondas;
2. conservar `ordinal` y emitir `preimageId = sha256(sourceInventorySha256|plane|file|line|ordinal|symbol|form|index)`;
3. mantener `index` sólo como posición del snapshot, no como identidad durable;
4. exigir 2.024 `preimageId` distintos y correspondencia uno-a-uno en el plan v2.

## 2. Claims de scope léxico

### Resultado: **PARTIAL; el primer salto es scope-aware, el origen terminal no**

La mejora frente a la sonda heurística anterior es real:

- sube por la cadena de ancestros del nodo;
- inspecciona parámetros directos y destructurados;
- inspecciona declaraciones en bloques ancestros;
- reconoce imports de módulo.

Pero hay cuatro brechas bloqueantes.

### 2.1 Destructuring local corta antes del origen — 944 filas mal domiciliadas

`resolveBindingKind()` devuelve `destructuredLocal` apenas encuentra `const {x}=source`. Calcula `isSourceItselfAParamOrImport`, pero el agregador ignora ese dato y mapea siempre `localDestructureResolvable → localConstOrDestructureResolvable`.

Medición directa del mapping:

```text
destructuredLocal total                         983
source = directParam                            944
source = non-identifier                         39
```

Por tanto, 944 de las 1.537 filas de la familia local tienen origen inmediato en un parámetro. Ejemplos ya presentes en el mapping:

- `brand-mark/index.tsx:87`, `style`, source `props`, `directParam`;
- `cloud-service-mark/index.tsx:77`, igual;
- numerosos motores con `const { style } = props`.

No se puede afirmar que 1.537 sean resolubles localmente ni que 80,3% del total no requiera autoridad nueva. La salvedad del texto admite que un salto posterior puede terminar en otra familia, pero el headline y el JSON sí los cuentan como familia final.

### 2.2 Local const no demuestra object ni cierre

Encontrar `const x = initializer` prueba un binding, no que el initializer llegue a un object literal. Por ejemplo, el mapping rotula local resolvable un `useMemo(() => resolveMotionTransformStyle(style), ...)`; resolverlo requiere seguir la llamada/import y el parámetro `style`. La familia debe representar el **terminal** del resolution path, no el primer nombre local.

### 2.3 Función local se detecta por nombre global de archivo

`isLocalFunctionDeclared(source,name)` recorre el archivo completo y acepta cualquier declaración homónima, sin resolver el callee desde el scope del uso. No prueba shadowing, declaración visible ni que el return sea object. `callToLocalFunctionResolvable=78` es por tanto una lista de candidatos, no 78 resoluciones acreditadas.

### 2.4 Locals como sobreaproximación

El propio código acepta todas las declaraciones hermanas del bloque, antes o después del uso, e ignora TDZ. También sólo recorre un nivel de binding pattern para declaraciones locales. Puede servir para discovery, no para adjudicación fail-closed.

### Corrección exacta

Para cada row, el clasificador debe emitir una cadena:

```jsonc
{
  "preimageId": "...",
  "resolutionPath": [
    {"kind":"destructuredLocal","declaredAt":"...","source":"props"},
    {"kind":"directParam","declaredAt":"..."}
  ],
  "terminalFamily": "paramOrPropsExternalRelay"
}
```

Debe continuar recursivamente por destructuring, const initializer, callee y member root hasta llegar a object literal, no-object literal, parámetro, import, dominio computado, dynamic sink o residual desconocido. Shadowing y visibilidad se resuelven desde el uso; una declaración posterior no se admite sin evidencia semántica.

## 3. Las nueve familias

### Resultado: **REFUTADAS como partición causal final**

Los conteos publicados son:

```text
1537 localConstOrDestructureResolvable
 244 paramOrPropsExternalRelay
  78 callToLocalFunctionResolvable
  61 undefinedLiteralFalsePositive
  60 importedBindingCrossFileRelay
  19 computedMemberKeyNeedsDomainEnumeration
  11 spreadOfConditionalNotYetWalked
  10 nonObjectBranchFalsePositive
   4 setPropertyDynamicChannelName
=2024
```

La suma es correcta; la domiciliación no.

Hallazgo adicional falsable: la familia `undefinedLiteralFalsePositive=61` contiene tres filas cuyo `rootName` **no es** `undefined`:

- `getContainerPosition`;
- `resolveInputPadding`;
- `projectGeometry`.

Son spreads de calls (`spreadOf:noBindingFound`) que `FAMILY_OF` envía indiscriminadamente a “undefined”. Por tanto incluso una familia supuestamente literal contiene tres llamadas no adjudicadas. El conteo acreditable de `undefined` literal hoy es 58, más tres spreads que deben reclasificarse tras resolver sus callees.

Las 10 ramas no-object y las 11 condiciones son buenos candidatos mecánicos, pero requieren negativos y recorrido real antes de fijar conteos. Los 19 computed members sólo acreditan índice dinámico: no acreditan aún un dominio cerrado.

### Dynamic setProperty

La separación 1+1+2 es útil, con dos ajustes:

- `claimRootStyleProperty`: correcto enumerar el único caller productivo interno actual con `color-scheme`, dando cero `--ds-*`; el receipt debe mantener esa cita.
- personality bridge: no basta llamarlo relay y descartarlo. Es un writer CSSOM que materializa las claves de `resolvePersonalityBridgeCssVariables(tokens)` y participa en precedencia. Debe enumerar ese dominio y conservar producer site/owner/contexto, o requerir ruling explícito.
- los dos copies SVG pueden excluirse sólo mediante la marca `@runtime-svg-paint-copy` + forma AST/origen computed-style exactos y negativo sin marca.

## 4. ¿Sirve como preimagen vinculante para plan v2?

### Resultado: **NO todavía**

Sí sirve para:

- congelar que el A5 actual tiene exactamente 2.024 filas;
- localizar cada fila por índice dentro de ese snapshot;
- priorizar trabajo y construir fixtures;
- demostrar que el primer censo heurístico era insuficiente.

No sirve aún para:

- pinnear los nueve conteos como deltas esperados;
- afirmar que 1.626 filas se cierran sin autoridad;
- afirmar que sólo 244 son relay;
- autorizar `unknownProvenance → []`;
- eliminar filas según la familia actual;
- comparar el output post-fix por índice.

Para volverlo vinculante, plan v2 debe consumir una revisión que incluya:

1. resolución terminal recursiva y `resolutionPath` por fila;
2. re-domiciliación de las 944 destructuradas desde parámetros;
3. reclasificación de las tres calls hoy puestas en `undefined`;
4. binding léxico real para las 78 functions;
5. `preimageId` con ordinal y SHA del snapshot;
6. residual explícito: toda cadena que no termine de forma demostrable sigue unknown y bloquea;
7. ruling para props relay, cross-file depth, personality bridge y computed domains.

Los conteos finales pueden conservar nueve familias, pero deben recomputarse; no se presume que coincidan con los actuales.

## Resultado final

**REJECT / CENSUS_IDENTITY_ACCEPTED_CLASSIFICATION_REJECTED.**

La evidencia no autoriza writer ni plan v2 vinculante. Presérvese el mapping como snapshot exploratorio, corríjase el walk hasta origen terminal y sométase de nuevo a auditoría. `SOURCE_READY_BLOCKED` permanece sin cambios.
