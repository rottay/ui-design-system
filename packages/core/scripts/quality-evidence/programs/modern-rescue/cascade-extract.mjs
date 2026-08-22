#!/usr/bin/env node
/**
 * cascade-extract.mjs — WO-CRA-23 cascade, generated half (extractor).
 *
 * Derives the LIVE channel->channel edges of the cascade by parsing the css
 * under packages/core/src/foundation/tokens/css (facade/artifacts EXCLUDED:
 * generated snapshots, never authority — CLAUDE.md).
 *
 * For every custom-property declaration `--X: <value>` it records:
 *   - every var(--Y) reference as an edge  Y -> X  (from -> to),
 *   - the derivation kind from the closed R4 vocabulary (DERIVATION_KINDS):
 *       calc-multiply | calc-divide | clamp | alias | identity |
 *       data-attr-select | table-lookup | color-mix | ramp-derive |
 *       contest-rank | literal-pin
 *   - nested fallback jumps  var(--A, var(--B, ...))  counted separately.
 *
 * Declarations WITHOUT any var() reference are literal pins (R4/R8: e.g.
 * --ds-radius-2xl/3xl/full never scale) and are listed apart, not as edges.
 *
 * clamp/table-lookup/ramp-derive are compiler-side mechanisms (TS tables);
 * css parsing legitimately yields few or none of them. css min()/max() map to
 * contest-rank and css clamp() to clamp.
 *
 * PLANES: exactly four, closed vocabulary — `css` (the only one scanned here),
 * `ts-compilers`, `ts-chrome-variables` and `tsx-inline-stamp`. See
 * PLANE_VOCABULARY below for the functional producer criterion, why the two TS
 * planes stay separate, and how the fourth plane was found.
 *
 * Output: manifest/cascade/extracted/css-edges.json  (generated: true)
 *
 * CLI CONTRACT (PRE_F4B lote A; contrato v3 sec 8.3 + addendum):
 *   node cascade-extract.mjs            -> --check  (DEFAULT, FAIL-CLOSED)
 *   node cascade-extract.mjs --check    -> recompute, byte-compare, exit 1 on diff, NEVER write
 *   node cascade-extract.mjs --write    -> write OUT
 *   any other flag                      -> exit 2 with usage
 * `buildEdges()` is PURE: it reads the css tree and returns the object.
 * Importing this module writes nothing (canonical main guard at the bottom).
 */
import {
  readdirSync,
  readFileSync,
  mkdirSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { join, dirname, relative } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { repoRoot as findRepoRoot } from '../../../lib/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
/** The manifest graduated out of the programme folder to the package root;
 *  the programme still owns it, so it is addressed as its own anchor. */
const MANIFEST = join(HERE, "../../../../manifest");
const REPO_ABS = findRepoRoot(HERE);
const CSS_ROOT = join(REPO_ABS, "packages/core/src/foundation/tokens/css");
const CSS_ROOT_REL = "packages/core/src/foundation/tokens/css";
const OUT = join(MANIFEST, "cascade/extracted/css-edges.json");

/**
 * The CLOSED plane vocabulary of the cascade evidence — four names, never two
 * and never three.
 *
 * FUNCTIONAL CRITERION (adjudicated 2026-08-18, after two auditors got it
 * wrong): a file is a PRODUCER of a governed `--ds-*` channel when the running
 * compilation emits that channel through it. The criterion is functional, not
 * postal: it does not matter which folder the file sits in, nor whether the
 * folder is named `compilers/`. Both compilers import
 * `foundation/css/chrome-variables` and emit its channels at runtime, so it
 * produces and therefore counts.
 *
 * WHY THREE PLANES AND NOT TWO. `ts-chrome-variables` enters BY NAME and is
 * NOT diluted inside `ts-compilers`, because the two TS planes are different
 * FIGURES and mixing them makes the aggregate unauditable by parts:
 *   - `ts-compilers`        = explicit writes `vars["--ds-X"] = <value>` in the
 *                             body of a compiler. One statement, one channel,
 *                             greppable literally.
 *   - `ts-chrome-variables` = a MAPPING TABLE whose VALUES are the channel
 *                             names. Most of them are computed
 *                             (`chromeVariableMap(prefix, fields)` kebab-cases
 *                             each field), so they never appear literally in
 *                             source and no grep for `"--ds-` can find them.
 * A single merged figure would hide that asymmetry behind one number.
 *
 * PHASE-3 DEBT, NOT A DISCOUNT: `chrome-variables` living under
 * `compilers/kernel/foundation/css/` instead of inside a compiler folder is
 * placement debt to be resolved in phase 3. Placement is never a reason to
 * discount a producer from the census.
 *
 * WHY A FOURTH PLANE (added 2026-08-18). The three planes above are all
 * "somebody writes a variables MAP". They miss a producer that writes no map
 * at all: a component that stamps the custom property directly on the element
 * it renders, through the JSX `style` attribute or `element.style.setProperty`.
 * That plane is `tsx-inline-stamp`. It is not a variant of `ts-compilers`: the
 * compilers emit a tenant/theme document into a root scope, whereas an inline
 * stamp is per-instance and per-element, computed from props at render time,
 * and it never passes through `compileTheme`. Measured below: it is the ONLY
 * producer of 153 governed channels, 48 of which the modern skin reads with no
 * fallback at all — i.e. without this plane they read as dead channels and
 * with it they are alive. See `discoveredBy` in COVERAGE.
 */
const PLANE_VOCABULARY = [
  "css",
  "ts-compilers",
  "ts-chrome-variables",
  "tsx-inline-stamp",
];

const PLANE_SCANNED = {
  plane: "css",
  root: CSS_ROOT_REL,
  note: "unico plano que ESTE escaner recorre. Todo alcance transitivo publicado por este artefacto sale de aqui y solo de aqui.",
};

const PLANES_NOT_SCANNED = [
  {
    plane: "ts-compilers",
    figure:
      'escritura explicita vars["--ds-X"] = <valor> en el cuerpo del compilador: una sentencia, un canal, greppable literalmente.',
    roots: [
      "packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts",
      "packages/core/src/infrastructure/compilers/kernel/runtime/appearance/index.ts",
      "packages/core/src/infrastructure/compilers/kernel/foundation/css/appearance-posture/index.ts",
      "packages/core/src/foundation/kernel/geometry/radius-dial/**",
    ],
    census: {
      explicitWriteOccurrences: 108,
      distinctChannels: 97,
      templatedWriteSites: 46,
      templatedWriteSitesPerFile: {
        "runtime/brand-theme/index.ts": 43,
        "runtime/appearance/index.ts": 3,
        "foundation/css/appearance-posture/index.ts": 0,
      },
      perFile: {
        "runtime/brand-theme/index.ts": 92,
        "runtime/appearance/index.ts": 6,
        "foundation/css/appearance-posture/index.ts": 10,
      },
      method:
        'conteo propio 2026-08-18 sobre las tres fuentes de produccion: ocurrencias de vars["--ds-X"] = 92 + 6 + 10 = 108; distintos = 97 (11 canales los escriben dos archivos: 6 compartidos brand-theme/appearance-posture, 4 brand-theme/appearance, con --ds-font-family-base, --ds-font-family-heading y --ds-radius-scale en los tres). Ademas 46 sitios de escritura templada vars[`...${...}...`] (43 brand-theme + 3 appearance) que se expanden en runtime y NO estan en los 97.',
      correctionOfPriorFigure:
        "la cifra 13 publicada en la primera pasada de este censo era un subconteo mio: la grep exigia que el template EMPEZARA por --ds-, asi que perdia las formas vars[`${prefix}-...`] y vars[`--ds-${scale}-...`]. El conteo correcto de sitios templados es 46. Se corrige aqui por la misma ley que corrige a los auditores: el numero vive al lado de su metodo.",
      enumeratedCensus: {
        distinctChannels: 552,
        literal: 183,
        interpolated: 378,
        method:
          "censo por ENUMERACION de fuente (no por grep) con tooling/lane-control/runtime/tenant-reach/index.mjs, el enumerador autoritativo del programa: literalTokens() da los 183 nombres literales y templateEmissions()+expandTemplate() expanden cada emision interpolada contra los agujeros declarados de su enumerador, dando 378 nombres mas. 183 + 378 = 552 distintos. Supera al censo por grep (97) porque la grep no puede ver un nombre que solo existe tras expandir el template.",
        supersedes:
          "distinctChannels 97 es el censo por GREP de escrituras literales; 552 es el censo por ENUMERACION. Los dos quedan escritos porque miden cosas distintas y la diferencia (455) ES el tamano de lo interpolado. Para cobertura se usa 552.",
      },
    },
    kindsUnreachableHere: ["ramp-derive", "table-lookup"],
    note: "cero en byKind NO significa inexistente; significa fuera de alcance de este escaner. El clamp/reject de compilador (TENANT_THEME_*_BOUNDS, envelopes verticales) tambien es TS-side y se declara autorado en los roots; el kind clamp de byKind cuenta SOLO la funcion css clamp(), que si se escanea. radius-dial NO es un plano propio: es una raiz de este plano, invocada por applyRadiusDial.",
  },
  {
    plane: "ts-chrome-variables",
    figure:
      "tabla de mapeo cuyos VALORES son los nombres de canal. La mayoria se computa en chromeVariableMap(prefijo, campos) kebab-caseando cada campo, asi que NO aparecen literalmente en el fuente y ninguna grep de literales --ds- los encuentra.",
    roots: [
      "packages/core/src/infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts",
    ],
    importedBy: [
      "packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts:80",
      "packages/core/src/infrastructure/compilers/kernel/runtime/appearance/index.ts:66",
    ],
    census: {
      distinctChannels: 1477,
      mappingTableValues: 477,
      chromeVariableMapTables: 28,
      derivedTableValues: 352,
      literalTableValues: 125,
      directWriteOccurrences: 1015,
      directWriteDistinctChannels: 1000,
      templatedWriteSites: 73,
      method:
        'conteo propio 2026-08-18 sobre chrome-variables/index.ts (3017 lineas): 28 llamadas chromeVariableMap<T>("--ds-prefijo-", [campos]) expandidas a 352 valores derivados; 125 canales literales como valor de mapa escrito a mano; 1015 ocurrencias de vars["--ds-X"] = 1000 canales distintos. Los tres conjuntos son disjuntos dos a dos, de ahi 352 + 125 + 1000 = 1477. Solape con ts-compilers: 1 canal (--ds-radius-button).',
      correctionOfPriorFigures:
        'las cifras 1174 y ~1154 que circularon NO son un plano cada una: ambas son greps del MISMO archivo. 1174 = ocurrencias de la cadena entrecomillada "--ds-*" en chrome-variables/index.ts; 1153 = las distintas de esa misma grep (1125 canales completos + 28 prefijos). Ninguna de las dos cuenta los 352 valores derivados, que no existen como literal.',
    },
    enumeratedCensus: {
      distinctChannels: 1671,
      literal: 1154,
      interpolated: 546,
      method:
        "mismo enumerador de fuente que ts-compilers (tenant-reach/index.mjs): literalTokens() da 1154 nombres literales y la expansion de los 73 sitios templados da 546 nombres mas. 1154 + 546 = 1671 distintos.",
      provenanceOfTheCirculatingFigure:
        "el 1154 literal es EXACTAMENTE la cifra ~1154 que circulaba: su origen es literalTokens(chrome-variables), no las escrituras del compilador. La atribucion original estaba mal aunque el numero estaba bien.",
      supersedes:
        "distinctChannels 1477 es el censo por GREP+expansion manual de chromeVariableMap; 1671 es el censo por ENUMERACION. Para cobertura se usa 1671.",
    },
    kindsUnreachableHere: ["ramp-derive", "table-lookup"],
    note: "cuenta como productor por criterio FUNCIONAL: los dos compiladores lo importan y emiten sus canales en runtime. Que viva bajo compilers/kernel/foundation/css/ en vez de dentro de una carpeta de compilador es DEUDA DE FASE 3 de ubicacion, no razon para descontarlo del censo.",
  },
  {
    plane: "tsx-inline-stamp",
    figure:
      "estampado DIRECTO de la custom property sobre el elemento que el componente renderiza: una clave de custom property en un objeto que termina en el atributo `style` de un JSX, o una llamada element.style.setProperty(). No hay mapa de variables, no hay documento de tema y no pasa por compileTheme: el valor se computa de props en tiempo de render y vive en el atributo style de esa instancia.",
    roots: [
      "packages/core/src/ui/**/*.tsx",
      "packages/core/src/infrastructure/runtime/**/*.ts(x)",
    ],
    membershipCriterion:
      "un canal pertenece a este plano SOLO si se asigna como propiedad de un objeto que llega a un `style` de JSX, o via element.style.setProperty(), o via un objeto de variables derramado dentro de un `style`. Se enumera por ENTIDAD (AST), no por forma de texto: se parte del sumidero (`style=` / setProperty) y se resuelve hacia atras la expresion — identificador, propiedad, llamada, useMemo/useCallback, re-export, mapa indexado — hasta el literal de objeto. Quedan FUERA por construccion: claves de interfaces y types, objetos que nunca llegan a un style, prosa en comentarios, cadenas en tests y nombres en JSON de evidencia.",
    census: {
      scannedFiles: 1740,
      excludedFiles: 1664,
      excludedBy:
        "tests/, *.test.*, *.spec.*, *.stories.*, fixtures/, __mocks__/, examples/, generated/",
      styleSinks: 3283,
      distinctCustomProperties: 236,
      distinctGovernedChannels: 183,
      distinctInternalSockets: 30,
      distinctForeignProperties: 23,
      foreignProperties: [
        "--_meter-ratio",
        "--affix-offset-bottom",
        "--affix-offset-top",
        "--affix-z-index",
        "--ant-primary-color",
        "--ant-rate-star-color",
        "--rh-accent",
        "--rh-accent-soft",
        "--rh-bg",
        "--rh-bg-alt",
        "--rh-glow",
        "--rh-glow-soft",
        "--rh-ink",
        "--rh-line",
        "--rh-line-strong",
        "--rh-muted",
        "--rh-panel",
        "--rh-panel-soft",
        "--rh-shadow",
        "--rottay-menu-inline-indent",
        "--rottay-menu-level",
        "--sparkline-length",
        "--step-delay",
      ],
      stampSites: 513,
      bySyntacticForm: {
        "'--ds-x': v": 480,
        "['--ds-x' as any]: v": 28,
        "setProperty('--ds-x', v)": 3,
        "[CONST]: v (CONST = const de cadena)": 1,
        "obj['--ds-x'] = v (objeto que luego va al style)": 1,
      },
      bySourceTree: {
        "ui/primitives": 209,
        "infrastructure/runtime": 128,
        "ui/patterns": 87,
        "ui/surfaces": 55,
        "ui/structures": 34,
      },
      callerPassthroughSpreads: 367,
      method:
        "enumeracion AST propia 2026-08-18 con el compilador de TypeScript 5.9.3 (ts.createSourceFile, ScriptKind.TSX). Se recorren los 1740 .ts/.tsx de produccion bajo packages/core/src, se localizan los 3283 sumideros `style={...}` mas cada element.style.setProperty(), y desde cada sumidero se resuelve la expresion hacia atras hasta literales de objeto, siguiendo identificadores, desestructuraciones, propiedades, llamadas a funcion local/importada, envoltorios useMemo/useCallback, alias `@/`, re-exports y mapas indexados por clave cerrada. Las claves de custom property de esos literales son el censo. Los 367 derrames tipo `...style` que resuelven a un PARAMETRO de funcion se clasifican como PASO DEL LLAMADOR, no como produccion: el nombre lo pone quien llama, fuera del paquete.",
      exclusionQuantified:
        "excluir tests/stories/fixtures no es un supuesto: medido. Corriendo el mismo enumerador SIN exclusiones el censo sube a 344 propiedades y 702 sitios, es decir 108 nombres que solo existen dentro de archivos de test/story/fixture (--cycle-a, --chart-nested, --ds-app-owned, ...). Ninguno es pintura de produccion. Esa es exactamente la contaminacion que un conteo por texto no puede separar.",
      retiredFigure:
        "la cifra 440 obtenida por grep sobre el patron `'--ds-x':` queda RETIRADA y no se reusa ni se deriva de ella. Razon dada por su autor: mezclaba claves de definiciones de tipo, Record<>, tests, documentacion y prosa, y produjo nombres truncados (--ds-badge-radiu) que prueban que el patron estaba mal. Verificacion propia del defecto estructural, no de la cifra: reconstruyendo un patron de esa forma sobre los 3404 .ts/.tsx hay 1680 ocurrencias, de las cuales 891 (53%) viven dentro de archivos de test o story. Un conteo por forma de texto no puede excluirlas; uno por entidad no las ve nunca.",
    },
    unenumerableRelays: {
      sites: 7,
      detail: [
        "ui/primitives/runtime/overlay/portal-scope/index.tsx:217 y ui/primitives/feedback/Modal/engines/modern/index.tsx:427 — `snapshot.variables` / `portalScope.variables`, construidos por readDsPortalVariables (ui/primitives/runtime/overlay/foundation/portal-theme/index.ts:11), que recorre el linaje del DOM y copia TODA custom property --ds-* resuelta.",
        "ui/primitives/display/Tooltip/engines/modern/index.tsx:401 y ui/primitives/overlay/Popover/engines/modern/index.tsx:328 — el mismo snapshot guardado en useState<DsPortalVariableStyle>.",
        "infrastructure/runtime/theming/presentation/adapters/react/css-variables-bridge/index.tsx:571 — setProperty(name, value) iterando Object.entries(declarations), es decir la salida ya compilada de ts-compilers/ts-chrome-variables.",
        "ui/patterns/visualization/charts/runtime/exporting/foundation/file/index.ts:205 y :208 — setProperty(prop, value) copiando estilo computado sobre un clon SVG de exportacion.",
      ],
      ruling:
        "los siete son RELEVOS con dominio abierto en runtime: reestampan nombres que ya existen, y por construccion no pueden ORIGINAR un nombre que ningun plano produzca (el portal copia del DOM ya pintado; el bridge copia el mapa compilado; el exportador copia estilo computado). Por eso el censo 183 se declara CERRADO para origen, y no como cota inferior al estilo de las 3 emisiones interpoladas sin enumerador de ts-compilers/ts-chrome-variables. La premisa unica sobre la que descansa ese cierre queda escrita aqui: un relevo no origina.",
    },
    adjudicatedNonStamps: {
      sites: 19,
      note:
        "sitios que el resolvedor no pudo cerrar solo y que se adjudicaron A MANO leyendo la fuente; ninguno estampa una custom property, asi que no son agujeros del censo:",
      detail: [
        "4 — ui/patterns/data/data-table/engines/rustic/index.tsx:429 `[side]: 0` con side: 'left'|'right'. Propiedad fisica.",
        "3 — layerProps.style en Select/AlertDialog/ConfirmDialog modern; useOverlayLayer devuelve style: { zIndex } (ui/primitives/runtime/overlay/layer-stack/index.ts:337). Sin custom properties.",
        "5 — Slider modern:509/551/579 y rustic:191, trackStyle[0]/handleStyle[0]/handleStyle[1]: escotillas de estilo del LLAMADOR (props), paso, no produccion.",
        "2 — ui/primitives/navigation/Affix/engines/rustic/index.tsx:334/345, state.fixedStyle/placeholderStyle: objetos locales (lineas 188-235) con cero ocurrencias de `--`.",
        "2 — Message rustic:132 `[placement]` y Mentions rustic:258 `[placement === 'top' ? 'bottom' : 'top']`: top/bottom, propiedades fisicas.",
        "1 — ui/primitives/runtime/overlay/positioning/index.tsx:432 setProperty('anchor-name', ...): propiedad CSS real, no custom property.",
        "1 — ui/primitives/overlay/Dropdown/engines/modern/index.tsx:328 useState<PopupPosition|null>: geometria, sin custom properties.",
        "1 — infrastructure/runtime/foundation/root-attributes/presentation/index.ts:101 claimRootStyleProperty(element, property, value): escritor generico con nombre en variable. CERRADO por enumeracion de call sites: el unico llamador de produccion es infrastructure/runtime/theming/composition/react/provider/index.tsx:211 con 'color-scheme'. Aporte medido: CERO canales. Un cero medido, no un supuesto.",
      ],
    },
    note: "plano NO recorrido por este escaner (que solo lee css). Se declara aqui con su censo y su metodo para que la cobertura sea auditable por partes, igual que los dos planos TS.",
  },
];

/**
 * COVERAGE — the aggregate the four planes exist to compute.
 *
 * The planes above are SUMMANDS. Publishing corrected summands without the
 * aggregate leaves the programme with no number at all, so the aggregate is
 * computed here, next to its method, and auditable by parts.
 *
 * THE DENOMINATOR IS THE FIRST THING THAT CAN BE WRONG. A single-line regex
 * that demands the value and the `;` on the same line silently drops every
 * multiline `--ds-X: calc(` declaration and every nested `var()` read. That
 * defect has already cost this programme 446 channels once; it is reproduced
 * and quantified below instead of being trusted.
 *
 * COMMENTS ARE NOT CODE. The scanner strips comments before parsing. A
 * line-oriented scanner that does not finds 10 names that exist only inside
 * comment prose (for example `--ds-color-` and `--ds-metric-card-`, which are
 * string-concat PREFIXES quoted in documentation, not channels). Those 10 are
 * correctly absent from the denominator.
 */
/**
 * AUTHORED CENSUS -- prosa autorada, NO un computo.
 *
 * Renombrado desde `COVERAGE` (contrato v3, A1). Cada cifra de abajo se
 * conto A MANO el 2026-08-18 y esta CONGELADA: ninguna ejecucion la
 * recalcula. Viaja junto a campos `stats.*` VIVOS, y hasta ahora el
 * esquema no distinguia unos de otros: un consumidor podia leer
 * `coverage.denominator.channels` como si describiera el arbol que
 * acababa de parsear. `measuredOn` e `isComputed:false` cierran eso.
 */
const AUTHORED_CENSUS = {
  measuredOn: "2026-08-18",
  isComputed: false,
  note:
    "prosa autorada congelada: ninguna ejecucion la recalcula. Vive junto a stats.* vivos y por eso lleva measuredOn e isComputed:false.",
  denominator: {
    channels: 4547,
    definition:
      "canales --ds-* DISTINTOS leidos por var() en el arbol de skin del motor modern: runtime/engines/modern/skin/ + presentation/components/skin/. Es el universo que la cascada tiene que gobernar; no incluye canales que solo se declaran y nadie lee.",
    scanned: {
      skinFiles: 280,
      cssFilesReachable: 469,
      distinctDeclaredAnywhere: 4142,
    },
    method:
      "parser propio 2026-08-18: se quitan comentarios /* */ primero, se cierran parentesis balanceados (una declaracion puede ocupar N lineas) y se recorre recursivamente el fallback de cada var(--a, var(--b, ...)) para no perder lecturas anidadas. Contado 2026-08-18 sobre el arbol de trabajo.",
    naiveScannerDelta: {
      lineOrientedEveryVar: 4111,
      lineOrientedCompleteDeclarationsOnly: 3589,
      robust: 4547,
      losesEveryVar: 446,
      losesCompleteDeclarationsOnly: 958,
      foundOnlyByNaive: 0,
      note:
        "el escaner linea-a-linea que acepta cualquier var() de la linea pierde 446 canales — EXACTAMENTE los 446 que el programa ya habia perdido una vez, lo que confirma el diagnostico. Si ademas exige valor y `;` en la misma linea pierde 958. El robusto contiene estrictamente al naive: cero canales aparecen solo con el naive.",
    },
    commentsAreNotCode: {
      namesSeenOnlyInsideComments: 10,
      examples: ["--ds-color-", "--ds-metric-card-", "--ds-signal-card-", "--ds-carousel-rtl-factor"],
      note:
        "un escaner que no quita comentarios los admitiria como canales; son prosa citada (prefijos de concatenacion, ejemplos de precedente). Quedan fuera del denominador a proposito.",
    },
    differsFromCirculating: {
      circulating: 4101,
      mine: 4547,
      note:
        "los porcentajes 49,5% y 60,3% que circulaban son 2031/4101 y 2472/4101, calculados contra el denominador viejo subcontado, en el mismo informe que ya demostraba que el correcto era 4547. No se reusan.",
    },
  },
  seeds: {
    cssRoots: 18,
    list: [
      "--ds-button-primary-bg",
      "--ds-color-error",
      "--ds-color-primary",
      "--ds-density-mode-factor",
      "--ds-edge-emphasis-width",
      "--ds-effect-intensity",
      "--ds-elevation-1",
      "--ds-experience-profile",
      "--ds-font-family-base",
      "--ds-font-family-heading",
      "--ds-icon-stroke-width",
      "--ds-motion-duration-scale",
      "--ds-radius-button",
      "--ds-radius-scale",
      "--ds-recipe-profile",
      "--ds-rhythm-scale",
      "--ds-sidebar-bg",
      "--ds-type-scale",
    ],
    method:
      "rootChannel de cada manifest/cascade/roots/*.json con canal no nulo. Quedan fuera chrome.anatomy (su raiz es el atributo data-anatomy-card, no un canal) y responsive.posture (channel: null por diseno, DATA NOT CSS).",
    sensitivity:
      "la cifra solo-css depende del sembrado y NO es comparable con un solo-css de otro informe que siembre otro conjunto. Raices candidatas fuera del manifiesto y su aporte marginal medido: --ds-color-neutral-900 +152, --ds-surface-fg +142, --ds-shadow-key-strength +81, --ds-shadow-ambient-strength +81, --ds-surface-bg +27, --ds-focus-ring-width +3, --ds-focus-ring-offset +2.",
  },
  planeSeeds: {
    tsCompilers: 552,
    tsChromeVariables: 1671,
    tsxInlineStamp: 183,
    overlap: 8,
    overlapChannels: [
      "--ds-button-primary-bg",
      "--ds-button-primary-bg-hover",
      "--ds-button-primary-border",
      "--ds-button-primary-color",
      "--ds-input-border-focus",
      "--ds-input-shadow-focus",
      "--ds-radius-button",
      "--ds-radius-scale",
    ],
    tsxInlineStampOverlap: {
      withTsCompilers: 0,
      withTsChromeVariables: 13,
      declaredInSomeCss: 27,
      exclusive: 153,
      insideDenominator: 138,
      exclusiveAndInsideDenominator: 113,
      exclusiveInsideDenominatorReadWithNoFallback: 48,
      note:
        "solape medido por NOMBRES contra los censos ya publicados de los otros planos y contra el conjunto de canales declarados en algun css. Los conjuntos 13 y 27 se intersectan en 10, por eso 183 - 153 = 30 y no 40. De los 153 exclusivos, 113 estan dentro del denominador; de esos 113, 48 los lee el skin modern SIN fallback en ningun sitio: sin este plano se leen como canales muertos, con el plano estan vivos. Los dos canales que el revisor cito a mano (--ds-overlay-modal-radius, --ds-tour-mask-color) estan entre esos 48.",
    },
    union: 2385,
    unionBeforeFourthPlane: 2215,
    unionDelta: 170,
    insideDenominator: {
      tsCompilers: 275,
      tsChromeVariables: 1178,
      tsxInlineStamp: 138,
      union: 1573,
      unionBeforeFourthPlane: 1446,
    },
    note:
      "el solape entre los dos planos TS es de 8 canales, no de 1. La cifra 1 que circulaba (--ds-radius-button) salia de comparar censos por grep; con censos por enumeracion aparecen 7 mas. La union se hace sobre nombres, no sumando planos: 552 + 1671 + 183 = 2406, pero la union real es 2385.",
  },
  reachability: {
    model:
      "punto fijo sobre el grafo de lecturas del arbol de skin: un canal ALCANZA si es semilla, o si su declaracion lee un canal que alcanza, o si (no estando declarado en ningun sitio) su fallback de lectura lee un canal que alcanza.",
    generous: "la arista de fallback cuenta siempre.",
    strict: "la arista de fallback cuenta solo cuando el canal no esta declarado en ningun lado — el caso en que el fallback es realmente lo que pinta.",
  },
  results: {
    generous: {
      cssOnly: { reached: 1490, of: 4547, pct: 32.8 },
      plusTsCompilers: { reached: 2438, of: 4547, pct: 53.6 },
      plusTsChromeVariables: { reached: 2344, of: 4547, pct: 51.6 },
      plusTsxInlineStamp: { reached: 1702, of: 4547, pct: 37.4 },
      union: { reached: 2997, of: 4547, pct: 65.9 },
      unionThreePlanes: { reached: 2894, of: 4547, pct: 63.6 },
    },
    strict: {
      cssOnly: { reached: 1177, of: 4547, pct: 25.9 },
      plusTsCompilers: { reached: 2156, of: 4547, pct: 47.4 },
      plusTsChromeVariables: { reached: 2167, of: 4547, pct: 47.7 },
      plusTsxInlineStamp: { reached: 1360, of: 4547, pct: 29.9 },
      union: { reached: 2869, of: 4547, pct: 63.1 },
      unionThreePlanes: { reached: 2764, of: 4547, pct: 60.8 },
    },
    marginalOverCss: {
      tsCompilersAlone: 948,
      tsChromeVariablesAlone: 854,
      tsxInlineStampAlone: 212,
      bothTsPlanesTogether: 1404,
      allThreeNonCssPlanesTogether: 1507,
      fourthPlaneMarginalOverTheOtherThree: 103,
      rescueOverlap: 398,
      noProducerInAnyPlane: 1550,
      noProducerInAnyPlaneBeforeFourthPlane: 1653,
      noProducerInAnyPlaneDelta: -103,
      strictNoProducerInAnyPlane: 1678,
      strictNoProducerInAnyPlaneBeforeFourthPlane: 1783,
      method:
        "mismo punto fijo, misma semilla css, mismo denominador 4547: lo unico que cambia es que la union de semillas incorpora los 183 canales del plano tsx-inline-stamp. La cifra que manda es noProducerInAnyPlane = 4547 - union(generous). BAJA de 1653 a 1550 (delta -103). Tenia que bajar o quedar igual: un plano nuevo solo puede sumar productores, nunca quitarlos. Si hubiera subido, la enumeracion estaria mal y habria que decirlo antes que la cifra.",
    },
    reading:
      "la historia que circulaba se invierte. Medido por enumeracion de fuente, ts-compilers aporta 552 canales y no 253, asi que ts-compilers SOLO (53,6%) supera a ts-chrome-variables SOLO (51,6%): el plano grande no es el que se creia. El cuarto plano, tsx-inline-stamp, es el mas chico de los tres no-css (37,4% solo, marginal 212 sobre css) pero NO es cero: aporta 103 canales que ningun otro plano produce, y 48 de ellos los lee el skin sin fallback, es decir se leian como muertos. El titular real sigue sin ser ningun porcentaje sino los 1550 canales de U sin productor en NINGUN plano — antes 1653.",
    discoveredBy: {
      when: "2026-08-18",
      how:
        "el plano no aparecio por revisar el vocabulario sino porque dos canales del skin modern parecian muertos y no lo estaban. Nadie los declara en css y el skin los lee sin fallback; el productor era un componente estampandolos en el atributo style de la instancia.",
      citedSites: [
        "src/ui/primitives/overlay/Tour/engines/modern/index.tsx:251 — style={{ ...style, ...portalScope.variables, zIndex, ['--ds-tour-mask-color' as any]: maskColor }}",
        "src/ui/primitives/feedback/Modal/engines/modern/index.tsx:499 — ['--ds-overlay-modal-radius' as any]: panelRadius",
      ],
      skinReadsWithNoFallback: [
        "foundation/tokens/css/runtime/engines/modern/skin/overlay-modal.css:184 — border-radius: var(--ds-overlay-modal-radius);",
        "foundation/tokens/css/runtime/engines/modern/skin/tour.css:93 — background-color: var(--ds-tour-mask-color);",
        "foundation/tokens/css/runtime/engines/modern/skin/tour.css:104 — box-shadow: 0 0 0 var(--ds-tour-spotlight-spread, 9999px) var(--ds-tour-mask-color);",
      ],
      correction:
        "COVERAGE decia 'exactamente tres planos, vocabulario cerrado'. Era falso, y falso de la peor manera: cerraba el vocabulario. El vocabulario ahora tiene cuatro nombres y la clausura vale solo hasta que otro canal vivo aparezca sin productor; el metodo para refutarla es el mismo que la refuto esta vez — buscar un canal leido sin fallback y sin declaracion, y seguir quien lo pinta.",
      retiredFigure: {
        value: 440,
        status: "RETIRADA — no se reusa ni se deriva de ella",
        obtainedBy: "grep sobre el patron de texto `'--ds-x':`",
        whyRetired:
          "mezclaba claves de definiciones de tipo, Record<>, tests, documentacion y prosa, y devolvia nombres truncados (--ds-badge-radiu). Un nombre truncado prueba que el patron corta por posicion y no por entidad.",
        reproduction:
          "no la pude reproducir: mi reconstruccion del patron sobre los 3404 .ts/.tsx da 782 nombres distintos en 1680 ocurrencias, con 0 truncados. La retiro por la razon estructural que dio su autor, no porque yo haya obtenido 440. El defecto si lo reproduje: 891 de esas 1680 ocurrencias (53%) viven dentro de archivos de test o story, contaminacion que un conteo por forma de texto no puede separar y que uno por entidad no ve nunca.",
        replacedBy:
          "censo por entidad del plano tsx-inline-stamp: 183 canales gobernados distintos en 513 sitios de estampado (ver PLANES_NOT_SCANNED[2].census).",
      },
      measuredZeroWouldHaveCounted:
        "si el plano hubiera resultado vacio o totalmente solapado, la conclusion publicable seria 'cuarto plano medido, aporte 0, noProducerInAnyPlane sin cambio' con el mismo detalle. No fue el caso: aporta 103.",
    },
  },
  lowerBounds: {
    unattributedEmitters: 3,
    detail: [
      "chrome-variables setLegacyButtonHoverBgAlias -> --ds-button-${prefix}-hover-bg",
      "brand-theme brandThemeToCssVariables -> --ds-chart-series-${index + 1}",
      "brand-theme brandThemeToCssVariables -> --ds-chart-category-${index + 1}",
    ],
    why:
      "el enumerador exige atribuir cada emision interpolada a un enumerador con agujeros declarados y falla ruidosamente (E0-unattributed-emitter) en vez de estrechar el conjunto en silencio. Estas 3 emisiones no tienen enumerador todavia, asi que sus nombres NO estan contados. Por eso 552, 1671, 2385 y las coberturas de esos planos son COTA INFERIOR: solo pueden subir.",
    tsxInlineStamp: {
      status: "CERRADO PARA ORIGEN, no cota inferior",
      unresolvedSites: 7,
      why:
        "los 7 sitios que el resolvedor no pudo cerrar tienen dominio abierto en runtime, pero los 7 son RELEVOS: el snapshot de portal copia custom properties ya resueltas del linaje del DOM (readDsPortalVariables), el bridge de css-variables reestampa el mapa ya compilado por los dos planos TS, y el exportador de charts copia estilo computado sobre un clon SVG. Un relevo no puede ORIGINAR un nombre que ningun plano produzca, asi que no pueden esconder canales sin productor. El listado esta en PLANES_NOT_SCANNED[2].unenumerableRelays.",
      singlePremise:
        "todo el cierre descansa en una sola premisa, escrita para que se pueda atacar: un relevo no origina. Si alguien encuentra un canal vivo cuyo unico productor es uno de esos 7 sitios, la premisa cae y 183 pasa a ser cota inferior.",
      measuredZeroHole:
        "claimRootStyleProperty (infrastructure/runtime/foundation/root-attributes/presentation/index.ts:101) es un escritor generico con el nombre en variable; se cerro enumerando sus call sites, no suponiendo. Unico llamador de produccion: 'color-scheme'. Aporte CERO canales — cero medido.",
      excludedFilesQuantified:
        "108 nombres de custom property existen SOLO dentro de tests/stories/fixtures (censo sin exclusiones: 344 propiedades / 702 sitios). No son pintura de produccion y quedan fuera a proposito; se cuentan aqui para que la exclusion sea auditable en vez de asumida.",
    },
    alsoLowerBound:
      "el denominador 4547 NO es cota inferior en el mismo sentido: es una medicion cerrada del arbol de skin. Si se ensancha el universo (otros arboles de lectura) cambia el denominador y hay que recalcular todo, no sumar.",
  },
  enumerabilityRuling: {
    question: "los sitios de escritura templada vars[`...${...}...`], son enumerables o genuinamente dinamicos?",
    answer: "ENUMERABLES, y el programa ya los enumera desde fuente.",
    how:
      "tooling/lane-control/runtime/tenant-reach/index.mjs expande cada template contra el dominio cerrado de su agujero. 12 enumeradores activos: button-variant 144, control-size 80, segmented-size 21, premium-card 301, chromeToVariables 10, deriveAppearanceColorRamps 77, appearanceToVariables 12, deriveTenantColorRamps 70, semanticSurfaceRolesToCssVariables 176, setTypeRampVariables 25, setSemanticTypographyVariables 63, tint-ramp 25.",
    residue:
      "3 emisiones sin enumerador (arriba). No son dinamicas por naturaleza — les falta el enumerador — pero hasta que lo tengan se declaran como cota inferior explicita, nunca se estiman.",
  },
};


const DERIVATION_KINDS = [
  "calc-multiply",
  "calc-divide",
  // `calc-offset` (ruling DT, PRE_F4B lote A / H1): a declaration whose value
  // has refs and a calc() with NEITHER `*` NOR `/`. It covers additive and
  // subtractive geometry (`calc(var(--ds-z-index-base) + 1)`) and paint
  // compositions that merely contain an additive calc. It exists because the
  // previous vocabulary had no row for that shape and the extractor answered
  // by DISCARDING the declaration: six heads left the substrate entirely, five
  // of them with zero inbound edges, which silently falsified `Declared` vs
  // `Undeclared` downstream. A vocabulary gap must widen the vocabulary or
  // fail loudly; it may never drop evidence.
  "calc-offset",
  "clamp",
  "alias",
  "identity",
  "data-attr-select",
  "table-lookup",
  "color-mix",
  "ramp-derive",
  "contest-rank",
  "literal-pin",
];

/* ==========================================================================
 * ENGINE SCOPE — path scope INTERSECT selector scope, as SETS
 *
 * The three engine trees ship in ONE bundle: `facade/entrypoints/base.css`
 * (and `styles.css`) import `runtime/engines/index.css`, which imports
 * classic/modern/rustic, plus the 157 agnostic skins. Engine selection is by
 * SELECTOR, not by bundle. So the path alone cannot say which engine a
 * declaration or a paint site belongs to: a file under
 * `presentation/components/skin/` is shared, but a block inside it guarded by
 * `.ds-engine-modern` or `.rottay-input--rustic` is not.
 *
 * `unknown` SUB-ACCREDITS and never expands to every engine. A row whose
 * selector names an engine through a shape the closed grammar does not cover
 * is inadmissible everywhere and is published in `unadjudicatedSelectors`.
 * A row whose recognised discriminators intersect to nothing is published in
 * `scopeContradictions`. Both lists must be empty to close PRE_F4B.
 * ========================================================================== */

const ENGINE_VOCABULARY = ["modern", "rustic", "classic"];

/**
 * The CLOSED grammar, seeded BY PATTERN FAMILY and never by a literal census
 * of the discriminators that happen to exist today. Three families, each with
 * live evidence in the tree.
 */
const SCOPE_GRAMMAR = {
  families: [
    {
      id: "engine-root-class",
      pattern: "\\.ds-engine-(modern|rustic|classic)\\b",
      evidence: "presentation/components/skin/data-table-interactions.css",
    },
    {
      id: "component-engine-modifier",
      pattern: "\\.[a-z][a-z0-9]*(?:-[a-z0-9]+)*--(modern|rustic|classic)\\b",
      evidence:
        "presentation/components/skin/search-command-bar.css (.rottay-input--rustic) y .ds-card--modern",
    },
    {
      id: "component-engine-suffix",
      pattern: "\\.[a-z][a-z0-9]*(?:-[a-z0-9]+)*-(modern|rustic|classic)\\b",
      evidence: ".rottay-scroll-area-classic / -rustic / -modern",
    },
  ],
  atRulePreludesExcluded: true,
  atRulePreludeNote:
    "un `@keyframes ds-button-pulse-modern` nombra una ANIMACION, no un engine: los nombres de at-rule son globales y el targeting ocurre donde la animacion se usa. Las preludes de at-rule se enmascaran antes de detectar discriminadores.",
  unknownLaw:
    "una palabra de engine en el selector que ninguna familia cubre produce `unknown`; `unknown` sub-acredita y JAMAS expande a todos los engines.",
};

const GRAMMAR_RES = SCOPE_GRAMMAR.families.map((f) => ({
  id: f.id,
  re: new RegExp(f.pattern, "g"),
}));
const ENGINE_WORD_RE = /\b(modern|rustic|classic)\b/g;

/** Mask at-rule preludes: `@x ...` until a token that starts a real selector. */
function maskAtRulePreludes(selector) {
  const parts = selector.split(/(\s+)/);
  let masking = false;
  return parts
    .map((tok) => {
      if (tok === "" || /^\s+$/.test(tok)) return tok;
      if (tok.startsWith("@")) {
        masking = true;
        return " ".repeat(tok.length);
      }
      if (masking) {
        if (/^[.#[:*]/.test(tok)) {
          masking = false;
          return tok;
        }
        return " ".repeat(tok.length);
      }
      return tok;
    })
    .join("");
}

/** Split a selector on TOP-LEVEL commas (not inside (), [] or quotes). */
function splitTopLevelCommas(selector) {
  const out = [];
  let depth = 0;
  let quote = null;
  let cur = "";
  for (let i = 0; i < selector.length; i++) {
    const c = selector[i];
    if (quote) {
      if (c === quote) quote = null;
      cur += c;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      cur += c;
      continue;
    }
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    else if (c === "," && depth === 0) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out;
}

const sortEngines = (list) =>
  ENGINE_VOCABULARY.filter((e) => list.includes(e));

/**
 * `selectorEngines` as a SET, plus the two failure modes kept apart.
 *
 * Within one comma-part, several discriminators are a DESCENDANT narrowing and
 * therefore INTERSECT (`.ds-engine-modern .x--rustic` reaches nothing). Across
 * comma-parts they are alternatives and therefore UNION.
 */
export function selectorEnginesOf(selector) {
  if (!selector) return { mode: "set", engines: [...ENGINE_VOCABULARY], parts: ["all"] };
  const masked = maskAtRulePreludes(selector);
  const parts = splitTopLevelCommas(masked);
  const union = new Set();
  const perPart = [];
  let unknown = false;
  for (const part of parts) {
    const covered = new Set();
    const found = new Set();
    for (const fam of GRAMMAR_RES) {
      fam.re.lastIndex = 0;
      let m;
      while ((m = fam.re.exec(part))) {
        found.add(m[1]);
        covered.add(m.index + m[0].lastIndexOf(m[1]));
      }
    }
    ENGINE_WORD_RE.lastIndex = 0;
    let w;
    let partUnknown = false;
    while ((w = ENGINE_WORD_RE.exec(part))) {
      if (!covered.has(w.index)) partUnknown = true;
    }
    if (partUnknown) {
      unknown = true;
      perPart.push("unknown");
      continue;
    }
    if (found.size === 0) {
      perPart.push("all");
      for (const e of ENGINE_VOCABULARY) union.add(e);
      continue;
    }
    const engines = found.size === 1 ? [...found] : [];
    perPart.push(engines.length ? sortEngines(engines) : "empty-intersection");
    for (const e of engines) union.add(e);
  }
  if (unknown) return { mode: "unknown", engines: [], parts: perPart };
  return { mode: "set", engines: sortEngines([...union]), parts: perPart };
}

/** The engines a PATH admits. Everything outside an engine tree is shared. */
export function pathEnginesOf(rel) {
  for (const engine of ENGINE_VOCABULARY) {
    if (rel.includes(`/runtime/engines/${engine}/`)) return [engine];
  }
  return [...ENGINE_VOCABULARY];
}

/** pathEngines INTERSECT selectorEngines, with both failure modes named. */
export function scopeOf(rel, selector) {
  const pathEngines = pathEnginesOf(rel);
  const sel = selectorEnginesOf(selector);
  if (sel.mode === "unknown") {
    return {
      pathEngines,
      selectorEngines: "unknown",
      effectiveEngines: [],
      status: "unadjudicated",
    };
  }
  const effectiveEngines = pathEngines.filter((e) => sel.engines.includes(e));
  return {
    pathEngines,
    selectorEngines: sel.engines,
    effectiveEngines,
    status: effectiveEngines.length === 0 ? "contradiction" : "ok",
  };
}

/* ---------- stable ids ---------- */
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

/**
 * The tuple a digest seals for one edge row, in a fixed field order.
 *
 * EXACT SERIALISATION: `JSON.stringify(rows.map(edgeSealTuple))` over the array
 * in its own emission order, each row as
 * `[from, to, kind, edgeClass, guardPrimary, file, line, scopeId, reason]`
 * with `null` for any field the row does not carry.
 */
export const edgeSealTuple = (edge) => [
  edge.from,
  edge.to,
  edge.kind ?? null,
  edge.edgeClass,
  edge.guardPrimary ?? null,
  edge.file,
  edge.line,
  edge.scopeId ?? null,
  edge.reason ?? null,
];

/** The sealed graph vocabulary: `--ds-*` governed, `--_ds-*` internal socket. */
export const isGraphRef = (name) =>
  typeof name === "string" && (name.startsWith("--ds-") || name.startsWith("--_ds-"));

/**
 * The canonical ref identity, materialised so B1 never has to reinvent it.
 *
 * EXACT SERIALISATION: sha256 over `${readSiteId}|${refIndex}` -- the read
 * site's hex digest, one literal pipe, and the decimal refIndex, with nothing
 * else and no trailing separator. `readRefInstanceId` adds the engine and
 * belongs to B1, because instancing a shared site per engine is B1's law.
 */
export const readRefIdOf = (readSiteId, refIndex) =>
  sha256(`${readSiteId}|${refIndex}`);
const readSiteIdOf = (scopeKey, file, line, column, property, occurrence) =>
  sha256(`${scopeKey}|${file}|${line}|${column}|${property}|${occurrence}`);

/* ---------- file walk (artifacts excluded, SORTED for determinism) ---------- */
function walk(dir, out = []) {
  const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0
  );
  for (const entry of entries) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.isFile() && entry.name.endsWith(".css")) out.push(p);
  }
  return out;
}

/* ---------- comment strip, line numbers preserved ---------- */
function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
}

/* ---------- tiny rule scanner: declarations with selector context ----------
 * Tracks a selector stack on '{' / '}'. When, inside a block, the pending
 * text is a custom-property name and the next char is ':', reads the value
 * until ';' (or '}') at paren depth 0. Multi-line values are handled.
 *
 * PRE_F4B: reads now carry the RAW value plus line AND column, so a read site
 * has a stable identity and its var() references can be enumerated with
 * position. The selector is returned in FULL (truncation happens at emit
 * time only) because a 160-char cut can drop the very discriminator that
 * decides the engine scope.
 */
function parseDeclarations(text) {
  const s = stripComments(text);
  const decls = [];
  const reads = [];
  const selStack = [];
  let pending = "";
  let pendingStart = 0;
  let i = 0;
  const lineStarts = [0];
  for (let k = 0; k < s.length; k++) if (s[k] === "\n") lineStarts.push(k + 1);
  const lineOf = (idx) => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= idx) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
  const colOf = (idx) => idx - lineStarts[lineOf(idx) - 1] + 1;
  const readValue = (start) => {
    let j = start;
    let depth = 0;
    let value = "";
    while (j < s.length) {
      const v = s[j];
      if (v === "(") depth++;
      else if (v === ")") depth--;
      else if ((v === ";" && depth === 0) || (v === "}" && depth === 0)) break;
      value += v;
      j++;
    }
    return { value: value.trim(), end: j };
  };
  while (i < s.length) {
    const c = s[i];
    if (c === "{") {
      selStack.push(pending.trim());
      pending = "";
      pendingStart = i + 1;
      i++;
      continue;
    }
    if (c === "}") {
      selStack.pop();
      pending = "";
      pendingStart = i + 1;
      i++;
      continue;
    }
    if (
      c === ":" &&
      selStack.length > 0 &&
      /^\s*--[_A-Za-z0-9-]+\s*$/.test(pending)
    ) {
      const name = pending.trim();
      const nameIdx = pendingStart + pending.indexOf("--");
      const { value, end } = readValue(i + 1);
      decls.push({
        name,
        value,
        line: lineOf(nameIdx),
        column: colOf(nameIdx),
        selector: selStack.filter(Boolean).join(" "),
        endsAtBrace: s[end] === "}",
      });
      pending = "";
      pendingStart = end + 1;
      i = end;
      continue;
    }
    if (
      c === ":" &&
      selStack.length > 0 &&
      /^\s*[a-zA-Z-][a-zA-Z0-9-]*\s*$/.test(pending) &&
      !pending.trim().startsWith("--")
    ) {
      const name = pending.trim();
      const nameIdx =
        pendingStart + (pending.length - pending.trimStart().length);
      const { value, end } = readValue(i + 1);
      if (/var\(\s*--_?ds-/.test(value)) {
        reads.push({
          property: name,
          value,
          channels: parseVarRefs(value)
            .map((r) => r.name)
            .filter((n) => n.startsWith("--ds-") || n.startsWith("--_ds-")),
          line: lineOf(nameIdx),
          column: colOf(nameIdx),
          selector: selStack.filter(Boolean).join(" "),
        });
      }
      pending = "";
      pendingStart = end + 1;
      i = end;
      continue;
    }
    if (c === ";") {
      pending = "";
      pendingStart = i + 1;
      i++;
      continue;
    }
    if (pending === "") pendingStart = i;
    pending += c;
    i++;
  }
  return { decls, reads };
}

/* ---------- var() reference parsing (recursive, top-level refs) ---------- */
function parseVarRefs(value) {
  const refs = [];
  let i = 0;
  while (i < value.length) {
    const hit = value.indexOf("var(", i);
    if (hit === -1) break;
    let j = hit + 4;
    let depth = 1;
    while (j < value.length && depth > 0) {
      if (value[j] === "(") depth++;
      else if (value[j] === ")") depth--;
      j++;
    }
    const inner = value.slice(hit + 4, j - 1);
    let d = 0;
    let comma = -1;
    for (let k = 0; k < inner.length; k++) {
      if (inner[k] === "(") d++;
      else if (inner[k] === ")") d--;
      else if (inner[k] === "," && d === 0) {
        comma = k;
        break;
      }
    }
    const name = (comma === -1 ? inner : inner.slice(0, comma)).trim();
    const fallback = comma === -1 ? null : inner.slice(comma + 1).trim();
    refs.push({
      name,
      fallback,
      nested: fallback !== null && /var\(/.test(fallback),
    });
    i = j;
  }
  return refs;
}

/**
 * Enumerate EVERY var() reference of a value in textual order -- top level and
 * nested inside fallbacks -- each with its position in the tree.
 *
 * `role`   primary = the reference CSS evaluates first; fallback = an
 *          alternative that only runs when its parent is missing.
 * `terminal` none = bare reference (no fallback at all);
 *          literal = the fallback has no var() (paint ends in a literal);
 *          var = the fallback contains another reference.
 * `governed` marks a `--ds-*` channel. `--_ds-*` internal sockets are graph
 *          refs (transitable nodes) but NEVER governed refs: they stay out of
 *          D1, D2, buckets and rollup.
 */
export function enumerateRefs(value) {
  const out = [];
  const walkRefs = (text, depth, parentRefIndex, role) => {
    for (const ref of parseVarRefs(text)) {
      const refIndex = out.length;
      out.push({
        refIndex,
        channel: ref.name,
        depth,
        role,
        parentRefIndex,
        terminal:
          ref.fallback === null ? "none" : ref.nested ? "var" : "literal",
        governed: ref.name.startsWith("--ds-"),
        internalSocket: ref.name.startsWith("--_ds-"),
      });
      if (ref.nested) walkRefs(ref.fallback, depth + 1, refIndex, "fallback");
    }
  };
  walkRefs(value, 0, null, "primary");
  return out;
}

/* ---------- kind classification (closed R4 vocabulary) ---------- */
function classify(decl, refs) {
  const v = decl.value.trim();
  if (refs.length === 0) return "literal-pin";
  if (/\[data-/.test(decl.selector)) return "data-attr-select";
  if (/color-mix\(/.test(v)) return "color-mix";
  if (/clamp\(/.test(v)) return "clamp";
  if (/(?:^|[^a-z-])(?:min|max)\(/.test(v)) return "contest-rank";
  if (/calc\(/.test(v)) {
    if (v.includes("/")) return "calc-divide";
    if (v.includes("*")) return "calc-multiply";
    return "calc-offset";
  }
  if (/^var\([\s\S]*\)$/.test(v) && refs.length === 1) return "alias";
  return "identity";
}

/* ==========================================================================
 * buildEdges() -- PURE. Reads the css tree, returns the artifact object.
 *
 * FALLBACK TOPOLOGY, NORMALISED (contrato v3 sec 3.2). For
 *
 *     --ds-x: var(--ds-y, var(--ds-root));
 *
 * the stored edges are
 *
 *     { from: y,    to: x, edgeClass: 'decl',          guardPrimary: null }
 *     { from: root, to: y, edgeClass: 'decl-fallback', guardPrimary: y    }
 *
 * and the reverse traversal is x -> y -> root. The shortcut `root -> x` --
 * which the schemaVersion 1 extractor emitted as `{from: root, to: x,
 * viaFallback: true}` -- is FORBIDDEN: it hides whether `y` has a producer,
 * which is exactly the predicate STRICT admission turns on.
 *
 * At a paint site `prop: var(A, var(B))` the same normalisation yields the
 * new `leaf-fallback` class: `{ from: B, to: A, guardPrimary: A }`.
 * ========================================================================== */
export function buildEdges({ cssRoot = CSS_ROOT, cssRootRel = CSS_ROOT_REL } = {}) {
  const files = walk(cssRoot).filter(
    (f) => !relative(cssRoot, f).startsWith(join("facade", "artifacts"))
  );

  const edges = [];
  const foreignEdges = [];
  const literalPins = [];
  const leafReads = [];
  const readSites = [];
  const unadjudicatedSelectors = [];
  const scopeContradictions = [];
  const byKind = Object.fromEntries(DERIVATION_KINDS.map((k) => [k, 0]));
  let unclassifiedCalc = 0;
  const unclassifiedSamples = [];
  let declarations = 0;
  let declarationsWithVar = 0;
  let nestedFallbacks = 0;
  let readRefs = 0;
  let governedReadRefs = 0;
  let internalSocketReadRefs = 0;

  const noteScope = (scope, where) => {
    if (scope.status === "unadjudicated") unadjudicatedSelectors.push(where);
    else if (scope.status === "contradiction") scopeContradictions.push(where);
  };

  /**
   * Scope combinations are INTERNED. The three engine sets repeated on every
   * one of the ~28k rows would be pure duplication; the table publishes the
   * whole scope vocabulary in one auditable place and each row carries its
   * `scopeId`. Lossless: `scopeTable[row.scopeId]` restores the triple.
   */
  const scopeTable = [];
  const scopeIndex = new Map();
  const internScope = (scope) => {
    const sel = scope.selectorEngines === "unknown"
      ? "unknown"
      : scope.selectorEngines.join("+");
    const key = `${scope.pathEngines.join("+")}|${sel}|${scope.effectiveEngines.join("+")}|${scope.status}`;
    if (scopeIndex.has(key)) return scopeIndex.get(key);
    const id = scopeTable.length;
    scopeTable.push({
      scopeId: id,
      pathEngines: scope.pathEngines,
      selectorEngines: scope.selectorEngines,
      effectiveEngines: scope.effectiveEngines,
      status: scope.status,
    });
    scopeIndex.set(key, id);
    return id;
  };

  for (const file of files) {
    const rel = join(cssRootRel, relative(cssRoot, file));
    const text = readFileSync(file, "utf8");
    const { decls, reads } = parseDeclarations(text);

    const siteOccurrenceOf = new Map();
    for (const r of reads) {
      const scope = scopeOf(rel, r.selector);
      const key = `${r.line}|${r.property}`;
      const occurrence = (siteOccurrenceOf.get(key) ?? 0) + 1;
      siteOccurrenceOf.set(key, occurrence);
      const scopeKey = scope.effectiveEngines.join("+") || scope.status;
      const readSiteId = readSiteIdOf(
        scopeKey,
        rel,
        r.line,
        r.column,
        r.property,
        occurrence
      );
      const refs = enumerateRefs(r.value)
        .filter((ref) => ref.governed || ref.internalSocket)
        .map((ref) => ({ readRefId: readRefIdOf(readSiteId, ref.refIndex), ...ref }));
      noteScope(scope, {
        readSiteId,
        file: rel,
        line: r.line,
        property: r.property,
        selector: r.selector.slice(0, 160),
        pathEngines: scope.pathEngines,
        selectorEngines: scope.selectorEngines,
      });
      readRefs += refs.length;
      for (const ref of refs) {
        if (ref.governed) governedReadRefs++;
        else internalSocketReadRefs++;
      }
      readSites.push({
        readSiteId,
        file: rel,
        line: r.line,
        column: r.column,
        property: r.property,
        siteOccurrence: occurrence,
        scopeId: internScope(scope),
        ...(r.selector ? { selector: r.selector.slice(0, 160) } : {}),
        refs,
      });
      // leaf-fallback edges: B -> A, guarded by the PARENT PRIMARY.
      for (const ref of refs) {
        if (ref.parentRefIndex === null) continue;
        const parent = refs.find((p) => p.refIndex === ref.parentRefIndex);
        if (!parent) continue;
        edges.push({
          from: ref.channel,
          to: parent.channel,
          edgeClass: "leaf-fallback",
          guardPrimary: parent.channel,
          depth: ref.depth,
          file: rel,
          line: r.line,
          property: r.property,
          readSiteId,
          scopeId: internScope(scope),
          ...(r.selector ? { selector: r.selector.slice(0, 160) } : {}),
        });
      }
      // schemaVersion 1 shape, preserved byte-for-byte in FIELDS so the two
      // non-gate downstream consumers keep the input they were written for.
      leafReads.push({
        property: r.property,
        channels: r.channels,
        line: r.line,
        selector: r.selector.slice(0, 160),
        file: rel,
      });
    }

    for (const decl of decls) {
      declarations++;
      const refs = parseVarRefs(decl.value);
      const kind = classify(decl, refs);
      if (!DERIVATION_KINDS.includes(kind)) {
        // A shape outside the closed vocabulary is a HARD FAILURE, never a
        // silent drop: the artifact does not get written at all.
        throw new Error(
          `cascade-extract: unadjudicated derivation shape at ${rel}:${decl.line}\n` +
            `  head:  ${decl.name}\n` +
            `  value: ${decl.value}\n` +
            "  widen DERIVATION_KINDS with a DT ruling; never discard a declaration that has refs.",
        );
      }
      byKind[kind]++;
      // Scope is computed and interned BEFORE branching on the kind: a literal
      // pin is a DECLARATION, and F1 decides literalTerminalDeclared against
      // literalTerminalUndeclared inside the ref's ADMISSIBLE PARTITION. A pin
      // without scope makes that question unanswerable downstream.
      const scope = scopeOf(rel, decl.selector);
      noteScope(scope, {
        file: rel,
        line: decl.line,
        channel: decl.name,
        selector: decl.selector.slice(0, 160),
        pathEngines: scope.pathEngines,
        selectorEngines: scope.selectorEngines,
      });
      const declScopeId = internScope(scope);
      if (kind === "literal-pin") {
        literalPins.push({
          channel: decl.name,
          value: decl.value,
          file: rel,
          line: decl.line,
          scopeId: declScopeId,
        });
        continue;
      }
      declarationsWithVar++;
      const enumerated = enumerateRefs(decl.value);
      for (const ref of enumerated) {
        if (ref.terminal === "var") nestedFallbacks++;
        const isPrimary = ref.parentRefIndex === null;
        const parent = isPrimary
          ? null
          : enumerated.find((p) => p.refIndex === ref.parentRefIndex);
        const to = isPrimary ? decl.name : parent.channel;
        const row = {
          from: ref.channel,
          to,
          kind,
          edgeClass: isPrimary ? "decl" : "decl-fallback",
          guardPrimary: isPrimary ? null : parent.channel,
          depth: ref.depth,
          file: rel,
          line: decl.line,
          ...(decl.selector ? { selector: decl.selector.slice(0, 160) } : {}),
          scopeId: declScopeId,
          ...(isPrimary ? {} : { viaFallback: true }),
        };
        // `edges[]` is the NORMATIVE graph and its vocabulary is sealed:
        // `graphRef` is `--ds-*` or `--_ds-*`. A relation with a foreign
        // endpoint (`--rh-*`, `--ant-*`, an Ant Design variable) is real and is
        // NOT deleted -- it is kept in `foreignEdges[]`, a DIAGNOSTIC
        // collection that B1 must not consume. Widening `graphRef` silently to
        // fit them would break the sealed definition; dropping them would burn
        // evidence.
        const fromGraph = isGraphRef(ref.channel);
        const toGraph = isGraphRef(to);
        if (fromGraph && toGraph) {
          edges.push(row);
        } else {
          foreignEdges.push({
            ...row,
            reason: !fromGraph && !toGraph
              ? "foreign-both"
              : fromGraph
                ? "foreign-head"
                : "foreign-source",
          });
        }
      }
    }
  }

  return {
    generated: true,
    generator: "cascade-extract.mjs",
    schemaVersion: 2,
    sourceRoot: cssRootRel,
    excluded: ["facade/artifacts/** (generated snapshots, never authority)"],
    derivationKinds: DERIVATION_KINDS,
    engineVocabulary: ENGINE_VOCABULARY,
    scopeGrammar: SCOPE_GRAMMAR,
    scopeTable,
    refVocabulary: {
      graphRef:
        "toda referencia --ds-* o --_ds-*; participa en aristas, caminos y witnesses.",
      governedRef:
        "graphRef cuyo channel empieza --ds-; se instancia y clasifica. D1/D2 se cuentan SOLO sobre estos.",
      internalSocket:
        "--_ds-*; nodo intermedio transitable del grafo, JAMAS en D1, D2, cubetas ni rollup.",
    },
    foreignEdgeLaw:
      "edges[] esta CERRADO al vocabulario graphRef (--ds-*, --_ds-*) en AMBOS extremos. Toda relacion con un extremo extranjero (--rh-*, --ant-*, variables de terceros) se conserva en foreignEdges[]: coleccion DIAGNOSTICA, no consumible por el gate, con file/line/scopeId/kind/endpoints/reason y digest propio. Ni se ensancha graphRef ni se borra evidencia.",
    edgeClasses: {
      decl: "la declaracion de D lee S en primer nivel => S -> D",
      "decl-fallback":
        "alternativa dentro del valor de una declaracion => B -> A, guardPrimary A. Sin atajo al head.",
      "leaf-fallback":
        "alternativa dentro de un sitio de pintura => B -> A, guardPrimary A. Clase nueva de schemaVersion 2.",
    },
    stats: {
      files: files.length,
      declarations,
      declarationsWithVar,
      edges: edges.length,
      foreignEdges: foreignEdges.length,
      edgesByClass: {
        decl: edges.filter((e) => e.edgeClass === "decl").length,
        "decl-fallback": edges.filter((e) => e.edgeClass === "decl-fallback")
          .length,
        "leaf-fallback": edges.filter((e) => e.edgeClass === "leaf-fallback")
          .length,
      },
      edgesViaFallback: edges.filter((e) => e.viaFallback).length,
      nestedFallbacks,
      literalPins: literalPins.length,
      leafReads: leafReads.length,
      readSites: readSites.length,
      readRefs,
      governedReadRefs,
      internalSocketReadRefs,
      unclassifiedCalc,
      unclassifiedSamples,
      byKind,
      foreignEdgesByReason: foreignEdges.reduce((acc, e) => {
        acc[e.reason] = (acc[e.reason] ?? 0) + 1;
        return acc;
      }, {}),
      scope: {
        unadjudicatedSelectors: unadjudicatedSelectors.length,
        scopeContradictions: scopeContradictions.length,
        scopeTableSize: scopeTable.length,
        readSitesByEffectiveEngines: readSites.reduce((acc, site) => {
          const key =
            scopeTable[site.scopeId].effectiveEngines.join("+") || "(empty)";
          acc[key] = (acc[key] ?? 0) + 1;
          return acc;
        }, {}),
      },
      // Counting units, so a zero or a diff is never read as absence:
      countUnit: {
        declarationsWithVar:
          "una por declaracion --X unica (file,linea) cuyo valor contiene var()",
        edges:
          "una arista por CADA referencia var(): las de primer nivel apuntan al head declarado (decl), las anidadas apuntan a SU REFERENCIA PADRE (decl-fallback / leaf-fallback), nunca al head. Cambio de schemaVersion 2: la v1 apuntaba las anidadas al head, que es el atajo prohibido por el contrato.",
        byKind:
          "una por DECLARACION clasificada, no por arista. Una declaracion con varios var() emite mas de una arista con el mismo kind: por eso byKind['data-attr-select'] y el conteo de filas de edges con ese kind son cifras distintas y ambas reales.",
        nestedFallbacks:
          "referencias (de cualquier profundidad) cuyo fallback contiene a su vez var()",
        readSites:
          "una por declaracion de PROPIEDAD DE PINTURA con al menos un var(--ds-*|--_ds-*). No incluye declaraciones de custom property: esas son aristas.",
        readRefs:
          "una por referencia var() dentro de un read site, incluidas las anidadas. governedReadRefs son las --ds-*; internalSocketReadRefs las --_ds-*.",
      },
      // The TS planes are NOT scanned. ramp-derive and table-lookup live in
      // compiler tables (radius-dial/index.ts:69-79 applyRadiusDial, call-site
      // chrome-variables:3014; appearance-posture/index.ts:47-53
      // BUTTON_STYLE_RADIUS) and are declared AUTHORED in
      // cascade/roots/<controlId>.json with ruta:linea. A 0 in those kinds
      // means plane-not-scanned, never absence. Machine-readable:
      planeVocabulary: PLANE_VOCABULARY,
      planeScanned: PLANE_SCANNED,
      planesNotScanned: PLANES_NOT_SCANNED,
    },
    authoredCensus: AUTHORED_CENSUS,
    digests: {
      // FULL-EVIDENCE SEAL. An earlier form hashed endpoints, class, file and
      // line only, which left `scopeId` and `kind` unsealed: moving a relation
      // to a different admissible partition, or reclassifying its derivation
      // kind, changed the evidence while the digest stayed put. A digest that
      // cannot move when the evidence moves is not a seal. Both collections
      // carry the identical defect class, so both are sealed the same way, in
      // the deterministic order of the array itself.
      edges: sha256(JSON.stringify(edges.map(edgeSealTuple))),
      foreignEdges: sha256(JSON.stringify(foreignEdges.map(edgeSealTuple))),
      readSites: sha256(JSON.stringify(readSites.map((site) => site.readSiteId))),
      literalPins: sha256(JSON.stringify(literalPins.map((pin) => [pin.channel, pin.file, pin.line, pin.scopeId]))),
    },
    edges,
    foreignEdges,
    literalPins,
    leafReads,
    readSites,
    unadjudicatedSelectors,
    scopeContradictions,
  };
}

/**
 * Stable serialisation. The ONLY shape written to disk.
 *
 * Record arrays are emitted ONE ROW PER LINE (compact JSON per row) instead of
 * fully indented: a 466-file scan produces ~28k rows, and full indentation
 * tripled the artifact for no information. One row per line keeps a diff
 * readable line-by-line, which fully-compact JSON would not.
 */
const ROW_ARRAYS = new Set([
  "scopeTable",
  "edges",
  "foreignEdges",
  "literalPins",
  "leafReads",
  "readSites",
  "unadjudicatedSelectors",
  "scopeContradictions",
]);

export function serialize(output) {
  const keys = Object.keys(output);
  const lines = ["{"];
  keys.forEach((key, index) => {
    const comma = index === keys.length - 1 ? "" : ",";
    if (ROW_ARRAYS.has(key)) {
      const rows = output[key];
      if (rows.length === 0) {
        lines.push(`  ${JSON.stringify(key)}: []${comma}`);
        return;
      }
      lines.push(`  ${JSON.stringify(key)}: [`);
      rows.forEach((row, rowIndex) => {
        lines.push(
          `    ${JSON.stringify(row)}${rowIndex === rows.length - 1 ? "" : ","}`
        );
      });
      lines.push(`  ]${comma}`);
      return;
    }
    const body = JSON.stringify(output[key], null, 2)
      .split("\n")
      .map((line, lineIndex) => (lineIndex === 0 ? line : `  ${line}`))
      .join("\n");
    lines.push(`  ${JSON.stringify(key)}: ${body}${comma}`);
  });
  lines.push("}");
  return lines.join("\n") + "\n";
}

export const OUT_PATH = OUT;

/* ---------- CLI ---------- */
function usage(stream) {
  stream.write(
    "usage: node cascade-extract.mjs [--check|--write]\n" +
      "  --check  (default) recompute and byte-compare against the committed artifact; never writes\n" +
      "  --write  regenerate the artifact\n"
  );
}

function main(argv) {
  const mode = argv.length === 0 ? "--check" : argv[0];
  if (argv.length > 1 || (mode !== "--check" && mode !== "--write")) {
    usage(process.stderr);
    process.exit(2);
  }
  const text = serialize(buildEdges());
  if (mode === "--check") {
    let onDisk = null;
    try {
      onDisk = readFileSync(OUT, "utf8");
    } catch {
      console.error(`cascade-extract --check FAILED: ${OUT} does not exist`);
      process.exit(1);
    }
    if (onDisk !== text) {
      console.error(
        "cascade-extract --check FAILED: the committed artifact is not what the tree produces.\n" +
          "  run: node cascade-extract.mjs --write"
      );
      process.exit(1);
    }
    console.log(`cascade-extract --check OK -- ${OUT} matches the tree`);
    return;
  }
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, text);
  const out = buildEdges();
  console.log(`files:                ${out.stats.files}`);
  console.log(`declarations:         ${out.stats.declarations}`);
  console.log(`with var():           ${out.stats.declarationsWithVar}`);
  console.log(
    `edges:                ${out.stats.edges} (decl ${out.stats.edgesByClass.decl}, decl-fallback ${out.stats.edgesByClass["decl-fallback"]}, leaf-fallback ${out.stats.edgesByClass["leaf-fallback"]})`
  );
  console.log(`nested fallbacks:     ${out.stats.nestedFallbacks}`);
  console.log(`literal pins:         ${out.stats.literalPins}`);
  console.log(`leaf reads:           ${out.stats.leafReads}`);
  console.log(
    `read sites:           ${out.stats.readSites} (governed refs ${out.stats.governedReadRefs}, internal sockets ${out.stats.internalSocketReadRefs})`
  );
  console.log(`unclassified calc:    ${out.stats.unclassifiedCalc}`);
  console.log(
    `scope:                unadjudicated ${out.stats.scope.unadjudicatedSelectors}, contradictions ${out.stats.scope.scopeContradictions}`
  );
  console.log(`byKind: ${JSON.stringify(out.stats.byKind)}`);
  console.log(`wrote ${OUT}`);
}

const isMain =
  process.argv[1] &&
  realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (isMain) main(process.argv.slice(2));
