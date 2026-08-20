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
 * Usage: node cascade-extract.mjs [--write]   (default: write)
 */
import {
  readdirSync,
  readFileSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { join, dirname, relative } from "node:path";
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
const COVERAGE = {
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

/* ---------- file walk (artifacts excluded) ---------- */
function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.isFile() && entry.name.endsWith(".css")) out.push(p);
  }
  return out;
}
const files = walk(CSS_ROOT).filter(
  (f) => !relative(CSS_ROOT, f).startsWith(join("facade", "artifacts"))
);

/* ---------- comment strip, line numbers preserved ---------- */
function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
}

/* ---------- tiny rule scanner: declarations with selector context ----------
 * Tracks a selector stack on '{' / '}'. When, inside a block, the pending
 * text is a custom-property name and the next char is ':', reads the value
 * until ';' (or '}') at paren depth 0. Multi-line values are handled.
 */
function parseDeclarations(text) {
  const s = stripComments(text);
  const decls = [];
  const reads = []; // regular-property reads of governed channels (leaf sites)
  const selStack = [];
  let pending = "";
  let pendingStart = 0;
  let i = 0;
  const lineOf = (idx) => {
    let line = 1;
    for (let k = 0; k < idx; k++) if (s[k] === "\n") line++;
    return line;
  };
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
      const nameLine = lineOf(pendingStart + pending.indexOf("--"));
      const { value, end } = readValue(i + 1);
      decls.push({
        name,
        value,
        line: nameLine,
        selector: selStack.filter(Boolean).join(" "),
        endsAtBrace: s[end] === "}",
      });
      pending = "";
      pendingStart = end + 1;
      i = end; // continue from the terminator; '}' will pop the block
      continue;
    }
    if (
      c === ":" &&
      selStack.length > 0 &&
      /^\s*[a-zA-Z-][a-zA-Z0-9-]*\s*$/.test(pending) &&
      !pending.trim().startsWith("--")
    ) {
      const name = pending.trim();
      const { value, end } = readValue(i + 1);
      if (/var\(\s*--_?ds-/.test(value)) {
        reads.push({
          property: name,
          channels: parseVarRefs(value)
            .map((r) => r.name)
            .filter((n) => n.startsWith("--ds-") || n.startsWith("--_ds-")),
          line: lineOf(pendingStart),
          selector: selStack.filter(Boolean).join(" ").slice(0, 160),
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
    // split top-level comma
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
    return "UNCLASSIFIED_CALC"; // reported, never silently bucketed
  }
  if (/^var\([\s\S]*\)$/.test(v) && refs.length === 1) return "alias";
  return "identity"; // multi-ref shorthands and var()-in-composite values
}

/* ---------- run ---------- */
const edges = [];
const literalPins = [];
const leafReads = [];
const byKind = Object.fromEntries(DERIVATION_KINDS.map((k) => [k, 0]));
let unclassifiedCalc = 0;
const unclassifiedSamples = [];
let declarations = 0;
let declarationsWithVar = 0;
let nestedFallbacks = 0;

for (const file of files) {
  const rel = join(CSS_ROOT_REL, relative(CSS_ROOT, file));
  const text = readFileSync(file, "utf8");
  for (const { decls, reads: fileReads } of [parseDeclarations(text)]) {
    for (const r of fileReads) leafReads.push({ ...r, file: rel });
    for (const decl of decls) {
    declarations++;
    const refs = parseVarRefs(decl.value);
    const kind = classify(decl, refs);
    if (kind === "UNCLASSIFIED_CALC") {
      unclassifiedCalc++;
      if (unclassifiedSamples.length < 10)
        unclassifiedSamples.push({
          channel: decl.name,
          value: decl.value.slice(0, 120),
          file: rel,
          line: decl.line,
        });
      continue;
    }
    byKind[kind]++;
    if (kind === "literal-pin") {
      literalPins.push({
        channel: decl.name,
        value: decl.value,
        file: rel,
        line: decl.line,
      });
      continue;
    }
    declarationsWithVar++;
    // top-level refs are the direct hops; nested fallback refs are hops too
    // (X reads Y, and Y-unset reads Z) and are marked viaFallback.
    const emit = (ref, viaFallback) => {
      edges.push({
        from: ref.name,
        to: decl.name,
        kind,
        file: rel,
        line: decl.line,
        ...(decl.selector ? { selector: decl.selector.slice(0, 160) } : {}),
        ...(ref.fallback !== null && !viaFallback
          ? { fallback: ref.fallback.slice(0, 160) }
          : {}),
        ...(viaFallback ? { viaFallback: true } : {}),
      });
      if (ref.nested) nestedFallbacks++;
    };
    const walkRefs = (refList, viaFallback) => {
      for (const ref of refList) {
        emit(ref, viaFallback);
        if (ref.nested) walkRefs(parseVarRefs(ref.fallback), true);
      }
    };
    walkRefs(refs, false);
    }
  }
}

const output = {
  generated: true,
  generator: "cascade-extract.mjs",
  schemaVersion: 1,
  sourceRoot: CSS_ROOT_REL,
  excluded: ["facade/artifacts/** (generated snapshots, never authority)"],
  derivationKinds: DERIVATION_KINDS,
  stats: {
    files: files.length,
    declarations,
    declarationsWithVar,
    edges: edges.length,
    edgesViaFallback: edges.filter((e) => e.viaFallback).length,
    nestedFallbacks,
    literalPins: literalPins.length,
    leafReads: leafReads.length,
    unclassifiedCalc,
    byKind,
    // Counting units, so a zero or a diff is never read as absence:
    countUnit: {
      declarationsWithVar:
        "una por declaracion --X unica (file,linea) cuyo valor contiene var()",
      edges:
        "una arista por CADA referencia var() de primer nivel, mas una por cada referencia dentro de fallbacks (viaFallback: true)",
      nestedFallbacks:
        "referencias (de cualquier profundidad) cuyo fallback contiene a su vez var()",
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
    coverage: COVERAGE,
  },
  edges,
  literalPins,
  // Regular-property reads of governed channels (border-radius: var(--ds-x)):
  // the LEAF read sites. The channel graph above only sees channel-to-channel
  // hops; this is where a channel meets paint, and where a class-A socket
  // gets opened (cascade-backlog.mjs consumes this list).
  leafReads,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(output, null, 2) + "\n");

console.log(`files:                ${files.length}`);
console.log(`declarations:         ${declarations}`);
console.log(`with var():           ${declarationsWithVar}`);
console.log(`edges:                ${edges.length} (via fallback: ${output.stats.edgesViaFallback})`);
console.log(`nested fallbacks:     ${nestedFallbacks}`);
console.log(`literal pins:         ${literalPins.length}`);
console.log(`leaf reads:           ${leafReads.length}`);
console.log(`unclassified calc:    ${unclassifiedCalc}`);
console.log(`byKind: ${JSON.stringify(byKind)}`);
if (unclassifiedSamples.length) {
  console.log("unclassified samples:");
  for (const smp of unclassifiedSamples)
    console.log(`  ${smp.file}:${smp.line} ${smp.channel}: ${smp.value}`);
}
console.log(`wrote ${OUT}`);
