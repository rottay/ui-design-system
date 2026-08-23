# PRE_F4B — censo causal independiente de `unknownProvenance` (Sonnet, READ-ONLY)

Rol: Sonnet Max, mapper mecánico READ-ONLY. Este censo no escribió en el repo,
no corrió tests/build/browser, y no tocó git mutante. Toda medición se obtuvo
importando/leyendo módulos reales del repo y ejecutando una sonda standalone
bajo `/private/tmp/pre-f4b-unknown-census/` que reutiliza **verbatim** el
algoritmo de `scanTsxSource()` de `cascade-producers.mjs` (mismo walk de
archivos, misma detección de sinks, mismas condiciones de fallo) y le añade
**un clasificador causal por scope real** — cadena de ámbitos léxicos
(parámetros con destructuring, declaraciones locales con destructuring,
imports de módulo) — allí donde el original se detiene y emite una fila
`unresolved-*`. No se modificó el repo; la sonda es una copia en
`/private/tmp` con una sola adición funcional (el clasificador), verificada
byte a byte contra la salida real (ver §5).

## Insumos leídos

- `/private/tmp/pre-f4b-lot-a-unknown-provenance.md` (2049 líneas, 2024 filas).
- `packages/core/manifest/cascade/extracted/producers.json` (9,5 MB, `unknownProvenance.length === 2024`, las 2024 en plano `tsx-inline-stamp`, cero en otro plano).
- `packages/core/scripts/quality-evidence/programs/modern-rescue/cascade-producers.mjs` (1294 líneas, leído completo — es el algoritmo que este censo reproduce y extiende).
- `/private/tmp/pre-f4b-lot-a-a4a9-independent-reaudit.md` (contexto: reauditoría previa, veredicto `SOURCE_READY_BLOCKED` por estas mismas 2024 filas).

## Metodología, en una frase

Copié `scanTsxSource()` verbatim, verifiqué que mi copia reproduce el **mismo
conteo, el mismo orden y las mismas 2024 filas** que el árbol ya publicó, y
sólo entonces até a cada fila una clasificación de POR QUÉ el ámbito léxico
real no la resuelve — información que el algoritmo original calcula pero
nunca conserva (su catch-all dice literalmente *"import, parameter or prop
passthrough"* sin decir cuál de los tres).

---

## 0. Prueba de identidad (antes de clasificar nada)

Comando:
```
node /private/tmp/pre-f4b-unknown-census/classify.mjs
```

| Verificación | Resultado |
|---|---:|
| Total de filas de mi re-escaneo | **2024** |
| `scannedFiles` (mío) vs `producers.json.tsxInlineStamp.measuredCensus.scannedFiles` | 1727 = 1727 ✅ |
| `excludedFiles` (mío) vs medido | 1664 = 1664 ✅ |
| Comparación **fila a fila, en orden**, de `(file, symbol, reason, template, línea)` contra `producers.json.unknownProvenance[i]`, para `i` de 0 a 2023 | **0 discrepancias en las 2024** ✅ |
| Archivos distintos con ≥1 fila (mío) vs `"Total: 2024 filas en 525 archivos"` del .md publicado | 525 = 525 ✅ |

Con las 2024 filas verificadas byte a byte en el mismo orden, el **índice del
array (0..2023) es la identidad estable** de este censo: no hay pérdida
(2024 entran, 2024 salen) ni ambigüedad de correspondencia con el artefacto
publicado. Ver §5 para el mapping completo.

---

## 1. Counts exactos

### 1.1 Por razón actual (idéntico al artefacto — control, no hallazgo)

| Razón (`reason` de `cascade-producers.mjs`) | Filas |
|---|---:|
| `unresolved-identifier` | 833 |
| `unresolved-spread` | 635 |
| `unresolved-member-access` | 389 |
| `unresolved-call` | 153 |
| `unresolved-expression` | 10 |
| `unresolved-dynamic-setProperty` | 4 |
| **Suma** | **2024** |

### 1.2 Por clase causal (taxonomía de este censo, 9 familias disjuntas)

Cada fila cae en **exactamente una** familia — verificado por suma:
`sumFamilies === 2024` (`/private/tmp/pre-f4b-unknown-census-mapping.json →
sumChecks.sumFamiliesEquals2024: true`).

| Familia | Filas | % | ¿Necesita autoridad nueva? |
|---|---:|---:|---|
| `localConstOrDestructureResolvable` | **1537** | 75,9% | No — extensión AST acotada, mismo archivo |
| `paramOrPropsExternalRelay` | **244** | 12,1% | Sí — decisión de disposición (relay real) |
| `callToLocalFunctionResolvable` | **78** | 3,9% | No — extensión AST acotada, mismo archivo |
| `undefinedLiteralFalsePositive` | **61** | 3,0% | No — el catch-all confunde `undefined`/`{...undefined}` con "no ligado" |
| `importedBindingCrossFileRelay` | **60** | 3,0% | Parcial — algoritmo existe, requiere decisión de límite de escaneo (cross-file) |
| `computedMemberKeyNeedsDomainEnumeration` | **19** | 0,9% | Parcial — mismo patrón que V3-3 (enumeración por sitio de llamada) |
| `spreadOfConditionalNotYetWalked` | **11** | 0,5% | No — extensión AST acotada (reusar recursión ya existente) |
| `nonObjectBranchFalsePositive` | **10** | 0,5% | No — falso positivo algorítmico puro |
| `setPropertyDynamicChannelName` | **4** | 0,2% | Depende del sitio — ver §3.9, individual |
| **Suma** | **2024** | **100%** | |

**Lectura honesta del titular**: de las 2024 filas, **1537 + 78 + 11 = 1626
(80,3%)** son resolubles con extensiones de AST acotadas al mismo archivo,
sin ninguna autoridad nueva — el algoritmo ya sabe cómo seguir un
`useMemo`/`useCallback`, sólo le faltan tres generalizaciones simétricas
(destructuring, property-lookup, llamada a función local). **61 (3,0%) son
falsos positivos** del propio catch-all (no hay nada que resolver: son
`undefined`/branches no-objeto). Sólo **244 + 60 + 19 + 4 = 327 (16,2%)**
tocan una frontera real que exige una decisión del DT — y de esas, ver §3.9,
al menos 1 de las 4 de `setProperty` dinámico resulta acotable hoy mismo por
análisis de sitios de llamada, contra lo que el propio artefacto la etiquetó
como "IRREDUCIBLE".

### 1.3 Por engine/path

| Engine | Filas | % |
|---|---:|---:|
| `rustic` | **975** | 48,2% |
| `modern` | **433** | 21,4% |
| `agnostic` (sin segmento `/engines/<x>/`) | **338** | 16,7% |
| `classic` | **278** | 13,7% |
| **Suma** | **2024** | **100%** |

Rustic concentra casi la mitad de las filas — coherente con que es el motor
con más patrones de objeto-de-estilo local (`s.container`, `styles.x`) en vez
de canales CSS.

### 1.4 Familia × engine (cruce completo)

| Familia | agnostic | classic | modern | rustic |
|---|---:|---:|---:|---:|
| `localConstOrDestructureResolvable` | 106 | 230 | 340 | 861 |
| `paramOrPropsExternalRelay` | 185 | 21 | 29 | 9 |
| `undefinedLiteralFalsePositive` | 29 | 3 | 21 | 8 |
| `setPropertyDynamicChannelName` | 4 | 0 | 0 | 0 |
| `callToLocalFunctionResolvable` | 5 | 3 | 8 | 62 |
| `computedMemberKeyNeedsDomainEnumeration` | 2 | 2 | 4 | 11 |
| `importedBindingCrossFileRelay` | 5 | 16 | 27 | 12 |
| `spreadOfConditionalNotYetWalked` | 0 | 0 | 3 | 8 |
| `nonObjectBranchFalsePositive` | 2 | 3 | 1 | 4 |

Nota: `paramOrPropsExternalRelay` es la ÚNICA familia dominada por `agnostic`
(185/244 = 75,8%) — coherente con que la mayoría de las props-relay genuinas
viven en componentes de icono/gráfico compartidos entre motores
(`graphics/icons/**`, `graphics/motion/**`), no en los árboles
`engines/{modern,rustic,classic}/`.

### 1.5 Patrón AST dominante (nombre de la clase causal fina, 22 valores)

| Clase causal fina | Filas |
|---|---:|
| `localDestructureResolvable` | 617 |
| `spreadOf:localDestructureResolvable` | 342 |
| `memberChainRoot:localConstMissedByOriginal` | 334 |
| `spreadOf:localConstMissedByOriginal` | 180 |
| `paramOrPropsExternalRelay` | 151 |
| `spreadOf:paramOrPropsExternalRelay` | 79 |
| `callToLocalFunctionResolvable` | 78 |
| `noBindingFound` (= `undefined`) | 58 |
| `callOn:localConstMissedByOriginal` | 40 |
| `callOn:importedBindingUnresolved` | 31 |
| `spreadOf:importedBindingUnresolved` | 20 |
| `memberChainRoot:localDestructureResolvable` | 20 |
| `computedMemberKey:localConstMissedByOriginal` | 18 |
| `memberChainRoot:paramOrPropsExternalRelay` | 14 |
| `spreadOfNonIdentifierChain` | 11 |
| `unhandledForm:expression` | 10 |
| `importedBindingUnresolved` | 7 |
| `setPropertyDynamicChannelName` | 4 |
| `callOn:localDestructureResolvable` | 4 |
| `spreadOf:noBindingFound` | 3 |
| `memberChainRoot:importedBindingUnresolved` | 2 |
| `computedMemberKey:importedBindingUnresolved` | 1 |
| **Suma** | **2024** |

---

## 2. Archivos y símbolos dominantes

### 2.1 Top 15 archivos por número de filas

| Filas | Archivo |
|---:|---|
| 68 | `ui/primitives/display/Table/engines/rustic/index.tsx` |
| 52 | `ui/patterns/data/data-table/engines/rustic/index.tsx` |
| 37 | `ui/patterns/data/detail-panel/engines/rustic/index.tsx` |
| 34 | `ui/patterns/workflow/approval-workflow/engines/rustic/index.tsx` |
| 30 | `ui/patterns/forms/form-builder/engines/rustic/index.tsx` |
| 29 | `ui/patterns/forms/step-wizard/engines/rustic/index.tsx` |
| 28 | `ui/primitives/navigation/FloatButton/engines/rustic/index.tsx` |
| 24 | `ui/primitives/display/Calendar/engines/rustic/index.tsx` |
| 24 | `ui/primitives/display/Typography/engines/classic/index.tsx` |
| 24 | `ui/primitives/display/Typography/engines/modern/index.tsx` |
| 24 | `ui/primitives/layout/Collapse/engines/rustic/index.tsx` |
| 23 | `ui/primitives/inputs/Form/engines/rustic/index.tsx` |
| 22 | `ui/primitives/layout/Layout/engines/rustic/index.tsx` |
| 21 | `ui/patterns/visualization/timeline/engines/rustic/index.tsx` |
| 21 | `ui/primitives/display/Statistic/engines/rustic/index.tsx` |

525 archivos distintos en total tienen ≥1 fila; la mediana está muy por
debajo de estos picos (la mayoría de los 525 tiene 1-3 filas).

### 2.2 Top 15 nombres de identificador raíz (`rootName`)

| Ocurrencias | Nombre |
|---:|---|
| 1050 | `style` |
| 224 | `styles` |
| 139 | `s` |
| 58 | `undefined` |
| 44 | `baseStyles` |
| 24 | `positionStyle` |
| 24 | `resolveTypographyCraftStyle` |
| 20 | `overlayStyle` |
| 19 | `itemProps` |
| 19 | `sharedStyles` |
| 14 | `STYLES` |
| 10 | `surfaceStyle` |
| 10 | `panelCardStyle` |
| 10 | `overlayMotion` |
| 8 | `valueStyle` |

`style`/`styles`/`s` por sí solos son el 60,8% de todas las raíces
nombradas — el patrón dominante en TODO el censo es "objeto de estilo local o
prop, referenciado por un nombre corto y genérico", no una diversidad grande
de formas distintas.

---

## 3. Por cada familia: algoritmo mínimo, o prueba de que exige disposición

### 3.1 `localConstOrDestructureResolvable` (1537 filas) — NO exige autoridad nueva

**Causa raíz medida**: el identificador/raíz de la cadena SÍ está ligado en
el mismo archivo, pero de una de dos formas que el algoritmo actual
(`collectBindings`, `resolveObjects`) nunca intenta:

1. **Destructuring que el flat-map original excluye por construcción**
   (`collectBindings` exige `ts.isIdentifier(node.name)`, lo que descarta
   TODO `const { x } = expr` / `const [x] = expr`). 979 de las 1537.
2. **Member-access/spread/call cuyo objeto raíz SÍ es un `const X = value`
   plano que el flat-map habría encontrado — pero `resolveObjects` da por
   perdido cualquier `PropertyAccessExpression`/`ElementAccessExpression`
   ANTES de intentar mirar el objeto que lee** (`if (ts.isElementAccess... ||
   ts.isPropertyAccess...) { noteUnresolved(...); return found; }` — sin
   ninguna llamada recursiva). 572 de las 1537.

**Algoritmo mínimo**:
- Extender `collectBindings` para indexar también patrones de destructuring,
  mapeando cada nombre hoja → `{sourceExpr, key}`.
- Extender `resolveObjects` para que, ante un `PropertyAccessExpression`
  (clave literal), resuelva primero el objeto (`resolveObjects(node.expression,
  ...)`) y busque la propiedad de nombre `key` en los object literals
  resultantes, en vez de rendirse de inmediato.
- Componer ambas extensiones recursivamente (mismo límite de profundidad 6 ya
  existente).

**Salvedad honesta**: resolver la RAÍZ no garantiza que la CADENA completa
termine en un literal — puede volver a bottom-out en otra de las 8 familias
(p. ej. un destructuring cuya fuente es a su vez una prop, ver el witness de
`arrowStyle`/`placement` en §4). La extensión cierra el primer salto medido
aquí; los saltos siguientes se re-clasifican con el mismo algoritmo aplicado
recursivamente, no con una autoridad nueva.

### 3.2 `paramOrPropsExternalRelay` (244 filas) — SÍ exige disposición explícita

**Causa raíz medida**: el identificador es, verificado por resolución de
ámbito real (no textual), un **parámetro** (directo o destructurado) de la
función/componente que contiene el sink `style={...}`. El valor llega del
LLAMADOR, en tiempo de render — no hay nada que un analizador de UN SOLO
ARCHIVO pueda mirar para saberlo.

**Por qué esto NO es automáticamente seguro** (instrucción explícita del
encargo): que el valor sea "externo" no significa "vacío". Un llamador real
en el árbol de render puede pasar un objeto `style` que SÍ contiene un
`--ds-*` gobernado — de hecho el propio censo ya prueba stamps reales que
llegan por esta misma vía en otros componentes. Tratar estas 244 filas como
"seguro ignorar" sería exactamente el falso-verde que
`cascade-producers.mjs` declara prohibido en su propio comentario de cabecera
(§ "FAIL-CLOSED, AND WHY UNDER-COUNTING IS NOT SAFE").

**Algoritmo mínimo**: no existe uno de un solo archivo. Las dos rutas reales:
(a) trazar el árbol de JSX que renderiza cada uno de estos componentes en
TODO `src/`, encontrar qué se pasa como `style`/prop relevante en cada sitio
de uso — combinatoriamente grande y sólo parcialmente decidible (spreads,
loops, HOCs pueden ocultar el valor real); o (b) una regla ratificada por el
DT que declare este límite (un solo archivo, backward-only) como la frontera
DEFINITIVA del plano `tsx-inline-stamp`, y que reclasifique estas 244 como un
código cerrado propio (p. ej. `producer-boundary:props-relay`) — que sigue
bloqueando el preflight igual que hoy, pero ya no bajo el rótulo genérico
"no bound", sino con la razón real y auditable.

### 3.3 `callToLocalFunctionResolvable` (78 filas) — NO exige autoridad nueva

**Causa raíz medida**: la llamada (`avatarStyle(24)`, `s.skeleton(...)`) tiene
un callee que es un `const X = (args) => ({...})` declarado en el MISMO
archivo — el algoritmo ya inline-a exactamente esta forma para
`useMemo`/`useCallback` y para arrow/function EXPRESSIONS usadas como callee
directo, pero nunca para una llamada NOMBRADA a una función local.

**Algoritmo mínimo**: en la rama `ts.isCallExpression(node)` de
`resolveObjects`, además del chequeo `use[A-Z]`, comprobar si `callee` es un
`Identifier` presente en `localBindings` cuyo valor es
`ArrowFunction`/`FunctionExpression`; si lo es, resolver su cuerpo igual que
ya se hace para el argumento de `useMemo`. Cero autoridad nueva, mismo patrón
ya aceptado en el código.

### 3.4 `undefinedLiteralFalsePositive` (61 filas) — falso positivo, no autoridad

**Causa raíz medida, verificada contra fuente en 2 archivos distintos**: el
identificador es literalmente la palabra reservada `undefined`, casi siempre
en el patrón `style={cond ? {...} : undefined}` (58 filas) o
`{...(cond ? obj : undefined)}` (3 filas, `spreadOf:noBindingFound`). `{...
undefined}` es JS válido y no aporta propiedades — no hay nada que resolver.

**Algoritmo mínimo**: en la rama identificador de `resolveObjects`, ANTES de
consultar `localBindings`, comprobar `node.text === 'undefined'` (y, por
simetría, tratar el `NullKeyword` igual en la rama de expresión genérica) y
devolver `[]` sin emitir fila. Una línea.

### 3.5 `importedBindingCrossFileRelay` (60 filas) — algoritmo existe, límite requiere ruling

**Causa raíz medida**: el identificador/callee es un import nombrado
(`panelCardStyle` de `'../../../../foundation/engine-styles/modern'`,
`PLACEMENT_MAP` de `'../../contracts'`) — resuelto con evidencia AST real
(`ImportDeclaration` con especificador y módulo citados en `bindingDetail`).

**Algoritmo mínimo**: seguir el `moduleSpecifier` (resolución relativa
estándar, ya disponible sin type-checker), parsear el archivo destino con el
MISMO escáner, y aplicar el mismo `resolveObjects`/lookup-por-propiedad sobre
el export nombrado. Es estático y determinista de punta a punta. Lo que SÍ
requiere ruling: el propio criterio de membresía del plano
(`tsxInlineStamp.membershipCriterion`) dice hoy "backward resolution... EN
ESTE ARCHIVO" — ampliar a multi-archivo es un cambio de alcance del escáner,
no sólo más código, y necesita que el DT decida el límite de profundidad
entre archivos (¿1 salto? ¿n saltos con detección de ciclos?).

### 3.6 `computedMemberKeyNeedsDomainEnumeration` (19 filas) — patrón ya aceptado (V3-3)

**Causa raíz medida**: el objeto raíz SÍ resuelve a un literal
(`DENSITY_STYLES = { compact: {...}, comfortable: {...}, ... }`), pero la
clave de acceso es una variable (`DENSITY_STYLES[resolvedDensity]`), no un
literal.

**Algoritmo mínimo**: exactamente el patrón que `adjudicateDeclarationOwner()`
ya usa para `setLegacyButtonHoverBgAlias` — enumerar, por sitio de
declaración/llamada, el dominio cerrado de valores posibles de la variable de
índice (vía el checker de tipos si el parámetro tiene un tipo unión de
literales, o vía enumeración de argumentos literales en los call-sites que
alimentan esa variable), y por cada valor del dominio emitir una rama. No es
irreducible: es la MISMA técnica ya ratificada por el DT en V3-3, aplicada a
un sitio distinto.

### 3.7 `spreadOfConditionalNotYetWalked` (11 filas) — NO exige autoridad nueva

**Causa raíz medida**: el spread objetivo es él mismo un ternario/binario de
dos cadenas (`...(fullscreen ? styles.containerFullscreen :
styles.containerCompact)`), no un identificador simple — mi `chainRoot()` (y
el `resolveObjects` original) sólo pela `PropertyAccess`/`ElementAccess`/
`Call`/paréntesis, nunca `ConditionalExpression`/`BinaryExpression`, en el
punto de entrada de un spread.

**Algoritmo mínimo**: en el manejo de `SpreadAssignment`, antes de resolver
`property.expression` como si fuera siempre una cadena de acceso simple,
aplicar la MISMA recursión condicional/binaria que YA existe para valores de
propiedad normales (`ts.isConditionalExpression`/`ts.isBinaryExpression` en
`resolveObjects`) al expression del spread. Reutilización directa de código
ya existente, una rama nueva.

### 3.8 `nonObjectBranchFalsePositive` (10 filas) — falso positivo puro, no autoridad

**Causa raíz medida, las 10 inspeccionadas individualmente**: todas son la
rama de un `&&`/ternario cuyo valor es PROVADAMENTE no-objeto por su propio
tipo de nodo AST — `StringLiteral` (`'default'`, `'xs'`, `'xl'`, `'vertical'`),
`NullKeyword` (×3), `PrefixUnaryExpression` de negación booleana
(`!sizeIsResponsive`, `!textStyle`, ×2). El patrón real es
`cond && {...}` o `cond ? 'literal' : {...}` — la rama booleana/string NUNCA
fue candidata a portar propiedades; es la GUARDA, no el valor.

**Algoritmo mínimo**: antes de caer en el catch-all
`noteUnresolved(node, "expression", ...)`, comprobar si `node.kind` pertenece
al conjunto {`StringLiteral`, `NumericLiteral`,
`NoSubstitutionTemplateLiteral`, `TrueKeyword`, `FalseKeyword`,
`NullKeyword`, `PrefixUnaryExpression`} y, de ser así, devolver `[]` sin
emitir fila. Cero autoridad; es una corrección de forma del propio
clasificador.

### 3.9 `setPropertyDynamicChannelName` (4 filas) — evaluadas UNA POR UNA, no en bloque

El artefacto publicado las etiqueta en bloque "IRREDUCIBLE por análisis
estático". Verificado independientemente, **eso es cierto para 3 y
optimista-hasta-falso para la cuarta**:

1. **`root-attributes/presentation/index.ts:101`, función interna `apply` de
   `claimRootStyleProperty(element, property, value)`.** El nombre dinámico es
   el PARÁMETRO `property` de la función exportada. Grep de TODOS los sitios
   de llamada de `claimRootStyleProperty` en `src/` (no en tests): **un solo
   llamador de producción**, `theming/.../provider/index.tsx:211`, con el
   literal `'color-scheme'` — que **no** es un canal `--ds-*` gobernado.
   **Resultado medido: dominio cerrado, un valor, cero canales gobernados en
   producción hoy.** Misma técnica que V3-3 (enumeración de argumentos
   literales en los sitios de llamada), aplicable HOY sin nueva autoridad —
   contradice la etiqueta "irreducible" para este sitio específico.
2. **`css-variables-bridge/index.tsx:571`, `writePersonalityDeclarations`**:
   `for (const [name, value] of Object.entries(declarations)) rule.style.setProperty(name, value)`.
   `declarations` es un parámetro tipado como mapa ya compilado — este sitio
   es un RELEVO que reestampa un mapa que YA fue enumerado por otro plano
   (`ts-compilers`/`ts-chrome-variables`), no un origen nuevo. Genuinamente
   irreducible EN ESTE archivo, pero su dominio real está acotado por la
   enumeración que YA existe aguas arriba — requiere una disposición que lo
   marque como relevo, no como origen, para no contarlo dos veces ni dejarlo
   huérfano.
3-4. **`charts/runtime/exporting/foundation/file/index.ts:205,208`,
   `inlineStyles`**: copia estilo COMPUTADO de un elemento DOM ya renderizado
   sobre un clon SVG de exportación. `prop` recorre las claves de un
   `CSSStyleDeclaration` real en tiempo de ejecución — no hay AST que lo
   cierre; es runtime por naturaleza, no por omisión de código. Irreducible
   sin cambiar la estrategia de exportación (p. ej. limitar la copia a una
   allowlist fija de propiedades, que ya existe parcialmente para SVG
   presentation attributes unas líneas antes de este mismo sitio).

**Conclusión de esta familia**: 1 de 4 se cierra hoy con la misma técnica ya
ratificada por el DT (dominio cerrado, cero canales); 1 de 4 es un relevo
cuyo dominio real vive en otro plano ya enumerado; 2 de 4 son runtime
genuino. Ninguna de las 4 necesita quedarse bajo el rótulo uniforme
"irreducible" sin más — cada una necesita su propia disposición, y una de
ellas ya tiene evidencia suficiente para cerrarse.

---

## 4. Witnesses (2–3 por familia, con file:line:symbol:expresión)

**`localConstOrDestructureResolvable`**
- `packages/core/src/graphics/motion/react/presentation/primitives/fade-in/index.tsx:180` — símbolo `FadeIn`, expr `resolvedStyle.style`, raíz `resolvedStyle` es `const resolvedStyle = useMemo(() => resolveMotionTransformStyle(style), [style])` (localConst nunca intentado por el original).
- `packages/core/src/ui/primitives/display/Tooltip/engines/rustic/index.tsx:216` — símbolo `arrowStyle`, expr `placement.startsWith("top")`, raíz `placement` viene de `const { placement, ... } = props` (destructuring local nunca indexado por el original).
- `packages/core/src/ui/patterns/data/data-table/engines/rustic/index.tsx:406` — símbolo `densityTh`, expr `DENSITY_STYLES[resolvedDensity].th` (root `DENSITY_STYLES` sí es un object-literal local — ver también §3.6, esta misma fila entra en `computedMemberKey` por el índice dinámico).

**`paramOrPropsExternalRelay`**
- `packages/core/src/graphics/icons/foundation/contracts/base/index.tsx:52` — símbolo `BaseIcon`, expr `style`, parámetro `{ size = 'md', color = 'currentColor', title, decorative, ..., style }` de `BaseIcon`.
- `packages/core/src/graphics/icons/presentation/catalog/animated/copy-to-check/index.tsx:69` — símbolo `CopyToCheck`, expr `...style`, parámetro `{ copied, size = 16, className, style }: CopyToCheckProps`.

**`callToLocalFunctionResolvable`**
- `packages/core/src/ui/patterns/communication/activity-log/engines/rustic/index.tsx:198` — símbolo `RusticActivityLog`, expr `avatarStyle(24)`, `avatarStyle` = `(size: number): CSSProperties => ({ width: size, height: size, ... })` local.
- `packages/core/src/ui/patterns/communication/comment-thread/engines/rustic/index.tsx:140` — símbolo `CommentNode`, expr `avatarStyle(32)`, mismo patrón, archivo distinto.

**`undefinedLiteralFalsePositive`**
- `packages/core/src/graphics/motion/react/presentation/effects/grid-pattern/index.tsx:85` — expr `style={shouldAnimate ? { animation: ... } : undefined}`.
- `packages/core/src/ui/patterns/communication/assistant/index.tsx:277,279` — símbolo `StreamingText`, expr `style={fontFamily ? { fontFamily } : undefined}` (×2, dos usos JSX del mismo patrón).

**`importedBindingCrossFileRelay`**
- `packages/core/src/ui/patterns/forms/invoice-template/engines/modern/index.tsx:142` — expr `panelCardStyle`, import nombrado de `../../../../foundation/engine-styles/modern`.
- `packages/core/src/ui/primitives/display/Tooltip/engines/rustic/index.tsx:172` — expr `PLACEMENT_MAP.top`, import nombrado de `../../contracts`.
- `packages/core/src/ui/patterns/data/list-toolbar/engines/classic/index.tsx:621` — expr `searchInputStyle({ height: 38 })`, import nombrado de `../../foundation/tokens`.

**`computedMemberKeyNeedsDomainEnumeration`**
- `packages/core/src/ui/patterns/data/data-table/engines/rustic/index.tsx:406-407` — símbolos `densityTh`/`densityTd`, expr `DENSITY_STYLES[resolvedDensity].th` / `.td`, objeto local con claves `compact`/`comfortable`/… (dominio de `resolvedDensity`).

**`spreadOfConditionalNotYetWalked`**
- `packages/core/src/ui/primitives/display/Calendar/engines/rustic/index.tsx:242` — expr `...(fullscreen ? styles.containerFullscreen : styles.containerCompact)`.
- `packages/core/src/ui/primitives/inputs/Slider/engines/modern/index.tsx:509,551` — expr `...(Array.isArray(trackStyle) ? trackStyle[0] : trackStyle)` / análoga para `handleStyle`.

**`nonObjectBranchFalsePositive`**
- `packages/core/src/ui/primitives/display/Card/engines/classic/index.tsx:158` — símbolo `hasColorVariant`, expr `'default'` (rama string de un ternario).
- `packages/core/src/ui/primitives/display/Typography/engines/rustic/index.tsx:167` — símbolo `headingStyle`, expr `!sizeIsResponsive` (guarda booleana de un `&&`).

**`setPropertyDynamicChannelName`**
- `packages/core/src/infrastructure/runtime/foundation/root-attributes/presentation/index.ts:101` — función `apply`/`claimRootStyleProperty`, único llamador de producción en `theming/.../provider/index.tsx:211` con literal `'color-scheme'`.
- `packages/core/src/infrastructure/runtime/theming/presentation/adapters/react/css-variables-bridge/index.tsx:571` — función `writePersonalityDeclarations`, `rule.style.setProperty(name, value)` sobre `Object.entries(declarations)`.
- `packages/core/src/ui/patterns/visualization/charts/runtime/exporting/foundation/file/index.ts:205,208` — función `inlineStyles`, copia de `CSSStyleDeclaration` computado sobre un clon SVG.

---

## 5. Mapping machine-readable (identidad estable, cero pérdidas/duplicados)

Archivo: **`/private/tmp/pre-f4b-unknown-census-mapping.json`** (1,83 MB).

Estructura:
```jsonc
{
  "totalRows": 2024,
  "identityCheck": { "mismatches": 0, "distinctFilesInMyRescan": 525, ... },
  "sumChecks": { "sumFamilies": 2024, "sumFamiliesEquals2024": true, ... },
  "byFamily": { ... }, "byReason": { ... }, "byEngine": { ... }, "byCausal": { ... },
  "familyByEngine": { ... }, "familyByReason": { ... },
  "topFiles": [[path, count], ...],
  "mapping": [
    {
      "index": 0,                         // identidad estable, 0..2023, orden = producers.json.unknownProvenance
      "plane": "tsx-inline-stamp",
      "file": "...", "line": 87, "symbol": "BrandMark",
      "reason": "unresolved-identifier", "template": "style", "detail": "...",
      "engine": "agnostic",
      "causalClass": "paramOrPropsExternalRelay",   // 22 valores finos
      "family": "paramOrPropsExternalRelay",        // 9 familias, esta tabla §1.2
      "rootName": "style",
      "bindingDetail": { "kind": "destructuredParam", "ownerFunction": "BrandMark", ... },
      "hasComputedIndex": false,
      "contentId": "<sha256(plane|file|symbol|template|reason|detail)>"
    },
    ...
  ]
}
```

**Identidad**: `index` (0..2023) es la clave primaria — verificada §0,
correspondencia 1:1 en orden con `producers.json.unknownProvenance`, cero
pérdida y cero duplicado por construcción de un array. `contentId` es una
clave SECUNDARIA (hash de contenido) que se ofrece para detectar filas
indistinguibles por texto: **1936 valores de `contentId` distintos entre las
2024 filas — 154 filas comparten `contentId` con al menos otra** (88 grupos).
Verificado que esto NO es una duplicación espuria: el motivo real es que un
binding local compartido (p. ej. `const gridStyle = useMemo(...)`) se
referencia desde MÁS DE UN sitio `style={gridStyle}` en el mismo componente,
y cada referencia dispara una re-resolución independiente del MISMO binding
subyacente, generando una fila con `detail` idéntico por cada uso. Witness:
`packages/core/src/ui/patterns/data/grid-view/presentation/grid/index.tsx:259`
(2 filas de contenido idéntico, `unresolved-identifier | style`).

Reproducible:
```bash
node /private/tmp/pre-f4b-unknown-census/classify.mjs   # produce rescan-raw.json
node /private/tmp/pre-f4b-unknown-census/aggregate.mjs  # produce el mapping final + todas las tablas de este informe
```

---

## 6. Stops

Condiciones de parada verificadas explícitamente, las tres limpias:

| Condición de STOP | Resultado | ¿Dispara? |
|---|---|---|
| Alguna fila sin clasificar | `rows.filter(r => !r.causalClass).length === 0` | No |
| Conteo total ≠ 2024 | `mapping.length === 2024`, `sumFamilies === 2024`, `sumReasons === 2024` | No |
| Identidad no preservada (orden/correspondencia con el artefacto publicado) | 0 discrepancias en la comparación fila-a-fila de las 2024 contra `producers.json.unknownProvenance` | No |

**Ningún STOP se dispara.** El censo cubre las 2024 filas, ninguna queda
fuera de la taxonomía, y la identidad con el artefacto publicado está
verificada byte a byte, no asumida.

Nota de alcance, no un STOP: este censo **no implementa** ninguno de los
algoritmos descritos en §3 — describe el algoritmo mínimo o la ausencia de
uno, con evidencia, para que Opus diseñe el fix con el mapa completo. No se
propuso ningún write, no se tocó `cascade-producers.mjs`, y no se autoriza
Lote B.

---

## Verdict

**CENSUS_READY**

2024/2024 filas clasificadas en 9 familias disjuntas y exhaustivas
(verificado por suma), reconciliadas contra las 6 razones publicadas y contra
las 2024 filas del artefacto real, en el mismo orden, sin pérdida ni
duplicado (índice 0..2023 como identidad estable). Hallazgo central: **80,3%
de las filas (1626) no requieren ninguna autoridad nueva** — son extensiones
de AST acotadas al mismo archivo, tres de ellas (`undefined`,
branches-no-objeto, spread-de-condicional) directamente falsos positivos del
propio clasificador. **16,2% (327 filas)** sí tocan una frontera real
(props-relay, cross-file import, índice dinámico, nombre de canal dinámico)
y **cada una de esas 4 sub-familias queda evaluada individualmente**, sin
asumir "external relay = seguro" ni "fuera del universo = omitible" — de
hecho, 1 de los 4 sitios de `setProperty` dinámico que el artefacto marcó en
bloque como "irreducible" se cierra hoy mismo con la misma técnica de
enumeración por sitio de llamada que el propio programa ya ratificó en
V3-3.
