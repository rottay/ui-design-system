/**
 * F4C — harness de captura del canary visual de `palette.status-seeds`.
 *
 * QUE PRUEBA. El control Standard #14 mueve SOLO lo que debe: al cambiar el
 * seed `success`, los carriers success se mueven (canal + PROPIEDAD PINTADA +
 * pixel), los tonos hermanos (warning/error/info) no se mueven, los elementos
 * no-status (Spinner/Skeleton) no se mueven, la geometria/tipografia de los
 * propios carriers positivos no se mueve, y el restore vuelve byte-exacto.
 *
 * POR QUE ESTE HARNESS Y NO EL DE R1. `R1/receipts/capture-lab.mjs` es un
 * receipt congelado (su FINAL_SHA esta bajo freeze): no se importa ni se edita.
 * Este archivo reimplementa sus patrones probados —readiness estricta antes del
 * obturador, exclusion del dev-chrome, escritura atomica, identidad de servidor,
 * cuarentena de sobrantes— sin crear una arista de consumo hacia el arbol de
 * evidencia congelada.
 *
 * ===========================================================================
 * DEFECTOS QUE ESTE DISENO EVITA (revisiones ciegas Fable DEFECTS-8 / Codex
 * DEFECTS-5). Cada uno esta atado a un mecanismo concreto de este archivo.
 * ===========================================================================
 *
 *  1. FALLBACK SILENCIOSO DE `?only=`. `r2-behavior` sin un `only` valido
 *     renderiza Tabs (bithire/r2-behavior/page.tsx:104), `r2-closure` cae en
 *     image-fallback (:31), `r3-evidence` en live-feed (:29-31), y
 *     `r4-structures` / `r6-surfaces` devuelven 404 sin `only`
 *     (r4-structures/page.tsx:15, r6-surfaces/page.tsx:15). Una corrida por
 *     nombre de escena fotografia la familia equivocada y reporta "sin diff".
 *     REMEDIO: cada captura declara (a) el status HTTP esperado, (b) los
 *     testids/selectores que DEBEN existir con conteo, y (c) el testid del caso
 *     de FALLBACK que debe estar AUSENTE. Cualquiera de los tres falla cerrado.
 *
 *  2. EVIDENCIA SOLO-CANAL. El pipeline contractual termina en
 *     `stable-dom-part -> observable-property` (customization-model.json:67),
 *     no en "custom property presente": un canal heredado cambia aunque el
 *     consumidor este roto. REMEDIO: el veredicto MOVER exige >=1 delta en una
 *     PROPIEDAD PINTADA (color/background/border/box-shadow/fill/stroke) de un
 *     nodo real del carrier. Los canales se leen y se registran, pero NUNCA
 *     deciden solos. Ademas el valor de un canal `color-mix()` llega sin
 *     resolver desde `getPropertyValue`, asi que sirve para "se movio o no",
 *     no como color: el receipt lo dice explicitamente.
 *
 *  3. NEGATIVO FALSO A NIVEL ESCENA. La escena `feedback` contiene 4 Alerts,
 *     uno de ellos `type="success"` (sections/feedback/index.tsx:31-41), asi que
 *     su PNG SE MUEVE. REMEDIO: el control negativo es por ELEMENTO
 *     (Spinner/Skeleton, carriers HOLD dentro de una captura MOVER) y la
 *     expectativa de PNG se DERIVA de si la captura contiene algun carrier
 *     MOVER, en vez de asumirse.
 *
 *  4. AISLAMIENTO INTRA-CARRIER. Un carrier positivo puede moverse "de mas":
 *     geometria, tipografia o motion no deben cambiar cuando cambia un color.
 *     REMEDIO: cada nodo registra dos conjuntos disjuntos de propiedades
 *     (PAINT_PROPS y HOLD_PROPS); un MOVER exige delta en paint Y CERO delta en
 *     hold. La estructura tambien se ancla: el conjunto de nodos y el conteo de
 *     coincidencias deben ser identicos entre fases.
 *
 *  5. DIGEST DE COMPILACION LATERAL. Node importando `/server` puede dar verde
 *     mientras el dev server sirve otro modulo. REMEDIO: el digest se lee del
 *     ATRIBUTO `data-ds-tenant-theme-digest` del `<style>` SERVIDO en el DOM
 *     (visual-authority/foundation/admission/index.ts:586-592, escrito por
 *     ground/index.tsx:205-211). Nunca se recompila nada en Node.
 *
 *  6. BITHIRE NO TIENE ARTIFACT. Su ground es solo atributos: `emission` es
 *     null y no hay `<style>` de artifact (ground/index.tsx:82-95, 205). Su
 *     oraculo es el sha256 del CSS SERVIDO (hojas inline + hojas enlazadas,
 *     descargadas y hasheadas por bytes) mas el mapa de computed. El harness
 *     exige la AUSENCIA del elemento de artifact en bithire y su PRESENCIA
 *     unica en the-management: una inversion falla cerrado.
 *
 *  7. HERENCIA DB <- BASELINE VERTICAL. Los dos grounds estampan
 *     `data-vertical="bithire"` (ground/index.tsx:87 y :129), y el artifact de
 *     the-management es un DELTA que retira los canales iguales a la baseline.
 *     Por eso en la fase D (cambio static) el ground DB TAMBIEN se mueve.
 *     CORRECCION (AGED_EXPECTATION, 2026-08-30): la primera redaccion declaraba
 *     el `artifact.digest` INTACTO ("no cubre valores de baseline"). Falso por
 *     mecanismo: el digest cubre `variables` (admission/index.ts:341-362) y el
 *     delta del tenant RE-DECLARA los canales derivados resueltos del seed
 *     heredado (verificado offline: mutar `palette.successColor` del BrandTheme
 *     mueve 9 `--ds-color-success-*` dentro de `variables`, y el digest
 *     55a070.. -> 0caf3d..; el restore devuelve exactamente 55a070..). Un digest
 *     que NO se moviera mientras cambian los bytes del artifact seria un oraculo
 *     peor. REMEDIO: pre-declarado como paint TONE_RULE + digest DIFFERS; la
 *     prueba de exactitud vive en C/E (restore -> digest IDENTICAL a A).
 *
 *  8. PROPAGACION PARCIAL POR LITERAL NO DERIVADO. `--ds-color-success-bg` /
 *     `-border` / `-ink` NO estan en `declaredOutputs.channels` del control
 *     (manifest/controls/palette.status-seeds.json:24-94): son literales del
 *     BrandTheme. Badge soft (skin/badge.css:396) y el status-badge de
 *     RecordWorkbench (presentation/components/skin/record-workbench.css:95)
 *     los leen. REMEDIO: DECLARED_PARTIAL_PROPAGATION los nombra con cita; y la
 *     ley MOVER es ">=1 propiedad pintada se movio", no "todas", asi que un
 *     literal congelado no puede producir un rojo falso ni esconder un verde.
 *
 *  9. IGUALDAD BYTE IMPOSIBLE POR ANIMACION. Skeleton (skin/skeleton.css:48) y
 *     Spinner animan; Badge `pulse` tambien (skin/badge.css:543), apagado en
 *     :578-585. REMEDIO: `reducedMotion: 'reduce'` en el contexto,
 *     `document.fonts.ready` + doble rAF antes de cada obturador, viewport fijo
 *     y `fullPage: true`.
 *
 * 10. TRES NOMBRES PARA UN TENANT. Ruta `the-management`, LabTenant
 *     `themanagement` (ground/index.tsx:42) y slug/`data-tenant` `themanagement`
 *     (root-attributes/ssr/index.ts:90). REMEDIO: cada fila registra los tres, y
 *     el harness ASERTA el `data-tenant` estampado contra el esperado.
 *     `rowVersion` no viaja como atributo del DOM: se registra su ausencia y se
 *     deja constancia de que ESTA cubierto por el digest
 *     (admission/index.ts:348), asi que un bump de fila mueve el digest.
 *
 * ===========================================================================
 * MODOS
 * ===========================================================================
 *   node f4c-canary-capture.mjs <out-dir> --phase <A|B|C|D|E>
 *                               [--ground bithire|the-management] [--self-test]
 *   node f4c-canary-capture.mjs --compare <dirA> <dirB> [--drill <id>]
 *   node f4c-canary-capture.mjs <out-dir> --check
 *
 * El harness NO levanta servidores, NO corre builds y NO escribe una sola linea
 * fuera del `<out-dir>` recibido. Navega un server YA CORRIENDO
 * (`DS_REFERENCE_CAPTURE_PORT`, por defecto 7001).
 */

import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.DS_REFERENCE_CAPTURE_PORT || 7001);
const BASE =
  process.env.DS_REFERENCE_CAPTURE_BASE_URL || `http://localhost:${PORT}/probe/ds-reference`;

const SCHEMA_VERSION = 1;
const RECEIPT_NAME = 'receipt.json';
const SELF_TEST_RECEIPT_NAME = 'receipt.self-test.json';
const CAPTURES_SUBDIR = 'captures';

/** Anchos del canary. NO reusan la baseline R1 ([320,390,768,1440]); la fase A es autocontenida. */
const WIDTHS = [390, 768, 1280];
const VIEWPORT_HEIGHT = 900;

/** Segmento de ruta -> slug/`data-tenant` estampado. Los tres nombres, en un solo lugar. */
const GROUNDS = {
  bithire: {
    routeSegment: 'bithire',
    labTenant: 'bithire',
    dataTenant: 'bithire',
    /* ground/index.tsx:82-95 — emission null: NO hay <style> de artifact. */
    expectsArtifactStyle: false,
    arm: 'static-brand-theme',
    rendering:
      'provider por slug (resolucion async): server y primer render cliente coinciden en el LoadingScreen vacio',
  },
  'the-management': {
    routeSegment: 'the-management',
    labTenant: 'themanagement',
    dataTenant: 'themanagement',
    /* ground/index.tsx:119-123 + :205-211 — emitTenantThemeArtifactForSsr. */
    expectsArtifactStyle: true,
    arm: 'db-tenant-theme',
    rendering:
      'provider diferido al cliente (ClientOnly, ground/client-only.tsx): server y primer render cliente ' +
      'en vacio; stamp + <style> del artifact quedan SSR fuera del gate',
  },
};

/** Los dos grounds estampan el MISMO vertical (ground/index.tsx:87 y :129). */
const EXPECTED_ROOT_ATTRIBUTES = {
  'data-vertical': 'bithire',
  'data-engine': 'modern',
  'data-theme': 'light',
};

/** Atributos de prueba del artifact (visual-authority/.../admission/index.ts:32-37). */
const ARTIFACT_STYLE_SELECTOR = 'style[data-testid="lab-tenant-artifact-style"]';
const ARTIFACT_DIGEST_ATTRIBUTE = 'data-ds-tenant-theme-digest';
const ARTIFACT_SLUG_ATTRIBUTE = 'data-ds-tenant-theme-slug';
const ARTIFACT_VERTICAL_ATTRIBUTE = 'data-ds-tenant-theme-vertical';
const DIGEST_SHAPE = /^sha256-[0-9a-f]{64}$/;

/** Solo lo montan las paginas r2-*; F4C exige su ausencia en TODAS las capturas. */
const JUDGE_MODE_SELECTOR = '[data-testid="lab-judge-mode"]';

// ---------------------------------------------------------------------------
// Canales: la lista NO se copia a mano, se lee del manifest del control.
// ---------------------------------------------------------------------------

/**
 * `declaredOutputs.channels` del control (68 canales, manifest :24-94). Leerlo
 * del disco en vez de transcribirlo evita que esta herramienta y el manifest
 * puedan divergir en silencio; el sha256 del manifest viaja en el receipt.
 */
const CONTROL_MANIFEST_RELPATH = 'packages/core/manifest/controls/palette.status-seeds.json';

/**
 * Canales que los skins SI leen y que el control NO declara. No son salidas del
 * dial: son literales del BrandTheme (`successBgColor`/`successBorderColor`,
 * brand-themes/bithire/index.ts:3456-3458) o derivaciones de foundation. Se
 * leen y se registran para que la propagacion parcial quede MEDIDA, no supuesta.
 */
const UNDECLARED_CHANNELS_WATCHED = [
  '--ds-color-success-bg',
  '--ds-color-success-border',
  '--ds-color-success-ink',
  '--ds-color-alpha-success-10',
  '--ds-color-warning-bg',
  '--ds-color-error-bg',
  '--ds-color-info-bg',
];

/**
 * Propagacion parcial PRE-DECLARADA. Nada de esto decide pass/fail: la ley MOVER
 * es ">=1 propiedad pintada se movio". Existe para que un fondo que no sigue al
 * seed sea una observacion con cita, no un "diff inesperado" que dispare el stop
 * condition.
 */
const DECLARED_PARTIAL_PROPAGATION = [
  {
    carrier: 'badge-success',
    property: 'backgroundColor',
    channel: '--ds-color-success-bg',
    source: 'packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/badge.css:396',
    why: 'literal del BrandTheme, fuera de declaredOutputs; el fondo soft puede NO seguir al seed',
  },
  {
    carrier: 'workbench-status-success',
    property: 'backgroundColor',
    channel: '--ds-color-success-bg',
    source:
      'packages/core/src/foundation/tokens/css/presentation/components/skin/record-workbench.css:95',
    why: 'mismo literal; border-color y color SI leen --ds-color-success y son los que deben moverse',
  },
];

// ---------------------------------------------------------------------------
// Propiedades observadas. Dos conjuntos DISJUNTOS, con roles opuestos.
// ---------------------------------------------------------------------------

/** Un MOVER debe mover >=1 de estas. Un HOLD no debe mover ninguna. */
const PAINT_PROPS = [
  'color',
  'backgroundColor',
  'backgroundImage',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'outlineColor',
  'boxShadow',
  'fill',
  'stroke',
];

/** NADIE debe mover estas por un cambio de color: aislamiento intra-carrier (Codex Q2). */
const HOLD_PROPS = [
  'fontFamily',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'letterSpacing',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderTopStyle',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'gap',
  'display',
  'opacity',
  'animationName',
  'animationDuration',
];

/** Tope de nodos por coincidencia de carrier. Excederlo FALLA (nunca se trunca en silencio). */
const MAX_NODES_PER_MATCH = 80;

// ---------------------------------------------------------------------------
// Selectores de carrier. Cada uno verificado contra su fuente.
// ---------------------------------------------------------------------------

const alertRoot = (tone) =>
  `.rottay-alert-shell.rottay-alert-shell--modern[data-part="root"][data-tone="${tone}"]`;
const calloutRoot = (tone) =>
  `.rottay-callout-shell.rottay-callout-shell--modern[data-part="root"][data-tone="${tone}"]`;
const badgeRoot = (variant) => `.rottay-badge.rottay-badge--modern[data-variant="${variant}"]`;
const tagRoot = (variant) =>
  `.rottay-tag-shell.rottay-tag-shell--modern[data-part="root"][data-variant="${variant}"]`;
const cockpitStatus = (variant) =>
  `[data-lab-cockpit-header="settled"] .ds-pattern-cockpit-header.ds-engine-modern [data-part="status"][data-variant="${variant}"]`;

// ---------------------------------------------------------------------------
// La matriz. `readiness` y `carriers` llevan la cita archivo:linea donde se
// midio cada conteo — ningun numero magico sin fuente.
// ---------------------------------------------------------------------------

const SHOWROOM_SCENES = 'packages/showroom/src/app/probe/ds-reference';

const CAPTURES = [
  {
    id: 'alert',
    enabled: true,
    tier: 'primitive',
    familyId: 'primitive/feedback/alert',
    route: 'r2-behavior',
    only: 'alert',
    /* Fallback de r2-behavior sin `only` valido: 'tabs' (page.tsx:104), cuyo caso
       monta [data-testid="lab-tabs"] (sections/r2-behavior/index.tsx:767). */
    forbiddenSelectors: ['[data-testid="lab-tabs"]'],
    readiness: [
      {
        what: 'wrapper del caso alert',
        selector: '[data-testid="lab-alert"]',
        exact: 1,
        source: `${SHOWROOM_SCENES}/sections/r2-behavior/index.tsx:1056`,
      },
    ],
    carriers: [
      {
        id: 'alert-error',
        /* tone="danger" (sections/r2-behavior/index.tsx:660) se estampa como
           data-tone="error": TONE_TO_VARIANT.danger === 'error'
           (foundation/contracts/kernel/common/index.ts:143), consumido por
           alert/engines/modern/index.tsx:279,293. */
        tone: 'error',
        selector: alertRoot('error'),
        count: { exact: 1 },
        source: `${SHOWROOM_SCENES}/sections/r2-behavior/index.tsx:660`,
      },
    ],
  },
  {
    id: 'result',
    enabled: true,
    tier: 'primitive',
    familyId: 'primitive/feedback/result',
    route: 'r2-behavior',
    only: 'result',
    forbiddenSelectors: ['[data-testid="lab-tabs"]'],
    readiness: [
      {
        what: 'wrapper del caso result',
        selector: '[data-testid="lab-result"]',
        exact: 1,
        source: `${SHOWROOM_SCENES}/sections/r2-behavior/index.tsx:975`,
      },
    ],
    carriers: [
      {
        id: 'result-success-well',
        tone: 'success',
        /* El paint por tono NO vive en la raiz sino en el pozo del glifo
           (skin/result.css:86-93: border + background var(--ds-tint-success-8)
           + color var(--ds-color-success)). La raiz sola daria un falso HOLD. */
        selector:
          '.rottay-result--modern[data-tone="success"][data-part="root"] > [data-part="icon"] > [data-part="status-icon"]',
        count: { exact: 1 },
        source: `${SHOWROOM_SCENES}/sections/r2-behavior/index.tsx:976-980`,
      },
    ],
  },
  {
    id: 'callout',
    enabled: true,
    tier: 'primitive',
    familyId: 'primitive/display/callout',
    route: 'r2-closure',
    only: 'callout-dismiss-focus',
    /* Fallback de r2-closure: 'image-fallback' (page.tsx:31), testid
       lab-image-fallback (sections/r2-closure/index.tsx:607). */
    forbiddenSelectors: ['[data-testid="lab-image-fallback"]'],
    readiness: [
      {
        what: 'wrapper del caso callout',
        selector: '[data-testid="lab-callout-dismiss-focus"]',
        exact: 1,
        source: `${SHOWROOM_SCENES}/sections/r2-closure/index.tsx:693`,
      },
    ],
    carriers: [
      {
        id: 'callout-warning',
        tone: 'warning',
        selector: calloutRoot('warning'),
        count: { exact: 1 },
        source: `${SHOWROOM_SCENES}/sections/r2-closure/index.tsx:252`,
      },
      {
        id: 'callout-info',
        tone: 'info',
        selector: calloutRoot('info'),
        count: { exact: 1 },
        source: `${SHOWROOM_SCENES}/sections/r2-closure/index.tsx:264`,
      },
    ],
  },
  {
    id: 'labels',
    enabled: true,
    tier: 'primitive',
    familyId: 'primitive/display/badge+primitive/display/tag',
    route: 'display-labels',
    only: null,
    forbiddenSelectors: [],
    readiness: [
      {
        what: 'badge de referencia (ancla de escena)',
        selector: '[data-testid="lab-display-badge"]',
        exact: 1,
        source: `${SHOWROOM_SCENES}/sections/display-labels/index.tsx:75`,
      },
      {
        what: 'tag de referencia (ancla de escena)',
        selector: '[data-testid="lab-display-tag"]',
        exact: 1,
        source: `${SHOWROOM_SCENES}/sections/display-labels/index.tsx:100`,
      },
    ],
    carriers: [
      {
        id: 'badge-success',
        tone: 'success',
        selector: badgeRoot('success'),
        /* min:1 + igualdad de conteo entre fases: Badge tiene DOS ramas de
           render (badge/engines/modern/index.tsx:312 y :388) y no medi en vivo
           cual de las dos instancias success (display-labels:83 y :87) matchea
           la clase de raiz. El conteo real viaja en el receipt y su estabilidad
           entre fases se asevera. */
        count: { min: 1 },
        source: `${SHOWROOM_SCENES}/sections/display-labels/index.tsx:83,87`,
      },
      {
        id: 'badge-error',
        tone: 'error',
        selector: badgeRoot('error'),
        count: { min: 1 },
        source: `${SHOWROOM_SCENES}/sections/display-labels/index.tsx:88`,
      },
      {
        id: 'badge-warning',
        tone: 'warning',
        selector: badgeRoot('warning'),
        count: { min: 1 },
        source: `${SHOWROOM_SCENES}/sections/display-labels/index.tsx:89,93`,
      },
      {
        id: 'tag-success',
        tone: 'success',
        selector: tagRoot('success'),
        count: { exact: 1 },
        source: `${SHOWROOM_SCENES}/sections/display-labels/index.tsx:104`,
      },
      {
        id: 'tag-warning',
        tone: 'warning',
        selector: tagRoot('warning'),
        count: { exact: 1 },
        source: `${SHOWROOM_SCENES}/sections/display-labels/index.tsx:105`,
      },
      {
        id: 'tag-error',
        tone: 'error',
        /* tone="danger" -> data-variant="error" (kernel/common/index.ts:143,
           tag/engines/modern/index.tsx:172). */
        selector: tagRoot('error'),
        count: { exact: 1 },
        source: `${SHOWROOM_SCENES}/sections/display-labels/index.tsx:106`,
      },
    ],
  },
  {
    id: 'cockpit',
    enabled: true,
    tier: 'pattern',
    familyId: 'pattern/shell/cockpit-header',
    route: 'r3-evidence',
    only: 'cockpit-header-trail-and-posture',
    /* Fallback de r3-evidence: 'live-feed-shell-continuity' (page.tsx:29-31). */
    forbiddenSelectors: ['[data-testid="lab-live-feed-shell-continuity"]'],
    readiness: [
      {
        what: 'banda settled del cockpit header',
        selector: '[data-lab-cockpit-header="settled"]',
        exact: 1,
        source: `${SHOWROOM_SCENES}/sections/r3-evidence/index.tsx:1484`,
      },
    ],
    carriers: [
      {
        id: 'cockpit-info',
        tone: 'info',
        /* Acotado a la banda settled: la banda `loading` (:1480) renderiza el
           esqueleto y no las pildoras. skin/cockpit-header.css:209-213. */
        selector: cockpitStatus('info'),
        count: { min: 1 },
        source: `${SHOWROOM_SCENES}/sections/r3-evidence/index.tsx:1416`,
      },
      {
        id: 'cockpit-warning',
        tone: 'warning',
        selector: cockpitStatus('warning'),
        count: { min: 1 },
        source: `${SHOWROOM_SCENES}/sections/r3-evidence/index.tsx:1417`,
      },
    ],
  },
  {
    id: 'dashboard',
    enabled: true,
    tier: 'structure',
    familyId: 'structure/dashboard/dashboard-insights',
    route: 'r4-structures',
    only: 'dashboard-insights',
    /* r4-structures falla con 404 sin `only` valido (page.tsx:15): el status
       HTTP 200 ya es la prueba anti-fallback de esta ruta. */
    forbiddenSelectors: [],
    readiness: [
      {
        what: 'bloque ActivityCompact exportado (banda modern)',
        /* La escena r4-structures renderiza TODAS las engines
           (ENGINES=['modern','classic','rustic'], index.tsx:57, despachadas por
           banda en :155-161), asi que el wrapper data-export existe una vez POR
           engine. El canary mide la cascada modern: se acota a su banda. */
        selector: '[data-engine-band="modern"] [data-export="ActivityCompact"]',
        exact: 1,
        source: `${SHOWROOM_SCENES}/sections/r4-structures/index.tsx:134`,
      },
    ],
    carriers: [
      {
        id: 'activity-compact-success',
        tone: 'success',
        /* presentation/components/skin/activity-compact.css:166 y :171 leen
           --ds-color-success-100 / --ds-color-success / --ds-color-success-200:
           tres pasos DERIVADOS del seed, sin literal de por medio. Misma
           acotacion a la banda modern que el readiness de arriba. */
        selector:
          '[data-engine-band="modern"] [data-export="ActivityCompact"] .ds-activity-compact [data-part="item-icon-box"][data-type="success"]',
        count: { exact: 1 },
        source: `${SHOWROOM_SCENES}/sections/r4-structures/index.tsx:134`,
      },
    ],
  },
  {
    id: 'workbench',
    enabled: true,
    tier: 'surface',
    familyId: 'surface/workspace/record-workbench',
    route: 'r6-surfaces',
    only: 'record-workbench',
    /* r6-surfaces falla con 404 sin `only` valido (page.tsx:15). */
    forbiddenSelectors: [],
    readiness: [
      {
        what: 'raiz de la surface',
        selector: '.ds-surface.ds-record-workbench',
        exact: 1,
        source: `${SHOWROOM_SCENES}/sections/r6-surfaces/config-b.tsx:137-139`,
      },
    ],
    carriers: [
      {
        id: 'workbench-status-success',
        tone: 'success',
        /* surfaces/presentation/pages/workspace/record-workbench/index.tsx:292-297
           estampa la clase + data-part + data-variant; el paint por variante en
           presentation/components/skin/record-workbench.css:93-96. */
        selector:
          '.ds-surface.ds-record-workbench .ds-record-workbench__status-badge[data-part="status-badge"][data-variant="success"]',
        count: { exact: 1 },
        source: `${SHOWROOM_SCENES}/sections/r6-surfaces/config-b.tsx:142`,
      },
    ],
  },
  {
    id: 'feedback',
    enabled: true,
    tier: 'primitive',
    familyId: 'primitive/feedback/spinner+primitive/feedback/skeleton',
    route: 'feedback',
    only: null,
    forbiddenSelectors: [],
    /* Conteos EXACTOS medidos dos veces: contra la escena
       (sections/feedback/index.tsx:31,34,37,40,46,49,93 -> 7 alerts;
       :54,55,56,75 -> 4 spinners) y contra la lectura ya certificada del
       harness R1 (R1/receipts/capture-lab.mjs:182-186), que fija los mismos
       7 / 4 / >=4. */
    readiness: [
      {
        what: 'alerts (4 severidades + dismissable + sin icono + error RTL)',
        selector: '[role="alert"]',
        exact: 7,
        source: `${SHOWROOM_SCENES}/sections/feedback/index.tsx:31-93`,
      },
      {
        what: 'spinners',
        selector: '[role="status"][data-part="indicator"]',
        exact: 4,
        source: `${SHOWROOM_SCENES}/sections/feedback/index.tsx:54-75`,
      },
      {
        what: 'lineas de skeleton',
        selector: '[data-part="line"]',
        min: 4,
        source: `${SHOWROOM_SCENES}/sections/feedback/index.tsx:63-73`,
      },
    ],
    carriers: [
      {
        id: 'feedback-alert-success',
        tone: 'success',
        selector: alertRoot('success'),
        count: { exact: 1 },
        source: `${SHOWROOM_SCENES}/sections/feedback/index.tsx:34`,
      },
      {
        id: 'feedback-alert-warning',
        tone: 'warning',
        selector: alertRoot('warning'),
        count: { exact: 2 },
        source: `${SHOWROOM_SCENES}/sections/feedback/index.tsx:37,49`,
      },
      {
        id: 'feedback-alert-error',
        tone: 'error',
        selector: alertRoot('error'),
        count: { exact: 2 },
        source: `${SHOWROOM_SCENES}/sections/feedback/index.tsx:40,93`,
      },
      {
        id: 'feedback-alert-info',
        tone: 'info',
        selector: alertRoot('info'),
        count: { exact: 2 },
        source: `${SHOWROOM_SCENES}/sections/feedback/index.tsx:31,46`,
      },
      {
        id: 'feedback-spinner',
        /* Control negativo a nivel ELEMENTO. spinner.css:55-64,108,124 lee
           primary/border/text-secondary: ningun canal status. */
        tone: 'none',
        selector: '.rottay-spinner.rottay-spinner--modern [data-part="indicator"][role="status"]',
        count: { exact: 4 },
        source: `${SHOWROOM_SCENES}/sections/feedback/index.tsx:54-75`,
      },
      {
        id: 'feedback-skeleton',
        /* Segundo control negativo: skeleton no lee NINGUN canal de tono. */
        tone: 'none',
        selector: '.rottay-skeleton-wrapper.rottay-skeleton--modern [data-part="line"]',
        count: { min: 4 },
        source: `${SHOWROOM_SCENES}/sections/feedback/index.tsx:63-73`,
      },
    ],
  },
  {
    id: 'patterntimeline',
    /* DECLARADA Y DESACTIVADA. La matriz adjudicada tiene 8 filas y su unica
       fila de tier `pattern` (cockpit) es info/warning, es decir NON-MOVER: en
       las fases success el tier pattern queda representado solo como negativo.
       Esta fila es el MOVER de tier pattern disponible sin fabricar escena
       (PatternTimeline con un item type='success' y dos type='error', uno de
       ellos con `color` literal que NO debe seguir al seed:
       sections/r2-behavior/index.tsx:1630-1633). No se activa por cuenta propia
       porque cambiaria una matriz ya adjudicada; el receipt reporta el hueco en
       `tierCoverage` y el DT la habilita con --include patterntimeline.
       CAVEAT declarado: la escena usa `groupByDate` sobre fechas fijas; si una
       corrida de restore cruzara un limite de dia respecto de la baseline, un
       encabezado relativo podria romper la igualdad byte del PNG. */
    enabled: false,
    disabledReason:
      'fuera de la matriz adjudicada de 8 filas; disponible para cerrar el hueco de MOVER en tier pattern',
    tier: 'pattern',
    familyId: 'pattern/data/timeline',
    route: 'r2-behavior',
    only: 'patterntimeline',
    forbiddenSelectors: ['[data-testid="lab-tabs"]'],
    readiness: [
      {
        what: 'wrapper del caso patterntimeline',
        selector: '[data-testid="lab-patterntimeline"]',
        exact: 1,
        source: `${SHOWROOM_SCENES}/sections/r2-behavior/index.tsx:1625`,
      },
    ],
    carriers: [
      {
        id: 'timeline-success',
        tone: 'success',
        selector: '[data-testid="lab-patterntimeline"] [data-type="success"]',
        count: { min: 1 },
        source: `${SHOWROOM_SCENES}/sections/r2-behavior/index.tsx:1632`,
      },
      {
        id: 'timeline-error',
        tone: 'error',
        selector: '[data-testid="lab-patterntimeline"] [data-type="error"]',
        count: { min: 1 },
        source: `${SHOWROOM_SCENES}/sections/r2-behavior/index.tsx:1630-1631`,
      },
    ],
  },
];

const SELF_TEST_CAPTURE_IDS = ['result', 'feedback'];

// ---------------------------------------------------------------------------
// PHASE_EXPECTATIONS — la ley del canary, declarada, no inferida.
// ---------------------------------------------------------------------------

/**
 * `TONE_RULE`  : el carrier con tone === intendedSeed DEBE mover >=1 propiedad
 *                pintada y CERO propiedad de HOLD_PROPS; todo otro carrier no
 *                mueve nada. El PNG debe diferir si la captura tiene >=1 MOVER
 *                y ser identico si no tiene ninguno.
 * `HOLD_ALL`   : nada se mueve. Todo PNG byte-identico, todo computed identico.
 *
 * `artifactDigest` / `cssDigest`:
 *   IDENTICAL | DIFFERS | ABSENT (bithire no emite artifact nunca).
 */
const PHASE_EXPECTATIONS = {
  A: {
    role: 'baseline',
    comparedAgainst: null,
    intendedSeed: null,
    summary: 'linea base. No se compara contra nada; es el referente de B, C, D y E.',
  },
  B: {
    role: 'intent',
    arm: 'db-tenant-theme',
    intendedSeed: 'success',
    comparedAgainst: 'A',
    summary:
      'cambio intended del seed success por la puerta DB declarada del control ' +
      '(appearance.general.palette.status.success, manifest :20-22). El ground static ' +
      'debe quedar byte-identico: un cambio de fila no puede tocar el brazo static.',
    grounds: {
      'the-management': { paint: 'TONE_RULE', artifactDigest: 'DIFFERS', cssDigest: 'DIFFERS' },
      bithire: { paint: 'HOLD_ALL', artifactDigest: 'ABSENT', cssDigest: 'IDENTICAL' },
    },
  },
  C: {
    role: 'restore',
    arm: 'db-tenant-theme',
    intendedSeed: null,
    comparedAgainst: 'A',
    summary: 'restore DB. TODO igual a A: PNG byte-identico, digest del DOM y computed identicos.',
    grounds: {
      'the-management': { paint: 'HOLD_ALL', artifactDigest: 'IDENTICAL', cssDigest: 'IDENTICAL' },
      bithire: { paint: 'HOLD_ALL', artifactDigest: 'ABSENT', cssDigest: 'IDENTICAL' },
    },
  },
  D: {
    role: 'intent',
    arm: 'static-brand-theme',
    intendedSeed: 'success',
    comparedAgainst: 'A',
    summary:
      'cambio intended del seed success por la puerta static (palette.successColor) mas la cadena ' +
      'brand-theme TS -> build-vertical-artifacts -> build-css -> build de core -> dist. ' +
      'El ground DB TAMBIEN se mueve, PRE-DECLARADO: ambos grounds estampan data-vertical="bithire" ' +
      '(ground/index.tsx:87 y :129) y el artifact DB es un delta que retira los canales iguales a la ' +
      'baseline vertical. Su digest CAMBIA: cubre `variables`, y el delta re-declara los canales ' +
      'derivados resueltos del seed heredado (mutar successColor mueve 9 `--ds-color-success-*` dentro ' +
      'de variables, medido offline 2026-08-30). La exactitud del restore se prueba en C/E, no aqui.',
    grounds: {
      bithire: { paint: 'TONE_RULE', artifactDigest: 'ABSENT', cssDigest: 'DIFFERS' },
      'the-management': { paint: 'TONE_RULE', artifactDigest: 'DIFFERS', cssDigest: 'DIFFERS' },
    },
  },
  E: {
    role: 'restore',
    arm: 'static-brand-theme',
    intendedSeed: null,
    comparedAgainst: 'A',
    summary: 'restore static. TODO igual a A en ambos grounds.',
    grounds: {
      bithire: { paint: 'HOLD_ALL', artifactDigest: 'ABSENT', cssDigest: 'IDENTICAL' },
      'the-management': { paint: 'HOLD_ALL', artifactDigest: 'IDENTICAL', cssDigest: 'IDENTICAL' },
    },
  },
};

/** Perturbaciones nombradas del comparador: el drill negativo que exige evidence-contract.json:76. */
const DRILLS = {
  'hold-becomes-mover': 'inyecta un delta de color en el PRIMER carrier HOLD; el veredicto debe fallar',
  'mover-becomes-frozen': 'borra el delta del PRIMER carrier MOVER; el veredicto debe fallar',
  'png-tamper': 'altera el sha256 de un PNG registrado; el veredicto debe fallar',
  'count-drift': 'cambia el conteo de un carrier en la corrida B; el veredicto debe fallar',
  'geometry-leak': 'inyecta un delta de geometria en un carrier MOVER; el veredicto debe fallar',
};

// ---------------------------------------------------------------------------
// IO — autocontenido a proposito (no se importa nada del arbol congelado R1).
// ---------------------------------------------------------------------------

const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
const sha256Text = (text) => sha256(Buffer.from(text, 'utf8'));

function atomicWriteJSON(filePath, data) {
  const dir = path.dirname(filePath);
  mkdirSync(dir, { recursive: true });
  const tmpPath = path.join(dir, `.${path.basename(filePath)}.tmp-${randomUUID()}`);
  const json = `${JSON.stringify(data, null, 2)}\n`;
  const fd = openSync(tmpPath, 'w');
  try {
    writeFileSync(fd, json);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  renameSync(tmpPath, filePath);
  return filePath;
}

/**
 * Raiz del repo por ascenso con verificacion de nombre en cada escalon: un
 * movimiento fisico futuro de este archivo falla RUIDOSAMENTE aqui en vez de
 * resolver en silencio al arbol equivocado.
 */
function deriveRepoRoot(fromDir) {
  const expected = ['scripts', 'showroom', 'packages'];
  let cursor = fromDir;
  if (path.basename(cursor) !== expected[0]) {
    throw new Error(
      `deriveRepoRoot: se esperaba que esta herramienta viviera bajo "${expected[0]}", ` +
        `se encontro "${path.basename(cursor)}" en ${cursor}.`,
    );
  }
  for (let i = 1; i < expected.length; i += 1) {
    cursor = path.dirname(cursor);
    if (path.basename(cursor) !== expected[i]) {
      throw new Error(
        `deriveRepoRoot: se esperaba el ancestro #${i} "${expected[i]}", se encontro ` +
          `"${path.basename(cursor)}" en ${cursor}. No se adivina una raiz.`,
      );
    }
  }
  const repoRoot = path.dirname(cursor);
  if (!existsSync(path.join(repoRoot, 'pnpm-workspace.yaml'))) {
    throw new Error(
      `deriveRepoRoot: se llego a ${repoRoot} pero no hay pnpm-workspace.yaml. Se rechaza una raiz no verificada.`,
    );
  }
  return repoRoot;
}

async function resolvePlaywrightChromium(repoRoot) {
  const showroomPkgJson = path.join(repoRoot, 'packages', 'showroom', 'package.json');
  if (!existsSync(showroomPkgJson)) {
    throw new Error(`resolvePlaywrightChromium: no hay package.json en ${showroomPkgJson}`);
  }
  const { createRequire } = await import('node:module');
  const { pathToFileURL } = await import('node:url');
  const showroomRequire = createRequire(showroomPkgJson);

  let pkgJsonPath;
  try {
    pkgJsonPath = showroomRequire.resolve('@playwright/test/package.json');
  } catch (error) {
    throw new Error(
      `resolvePlaywrightChromium: no se pudo resolver "@playwright/test" desde ${showroomPkgJson} ` +
        `(esta declarado como devDependency en packages/showroom/package.json:37). Error: ${error.message}`,
    );
  }
  const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
  const pkgDir = path.dirname(pkgJsonPath);
  const exportsRoot = pkg.exports?.['.'];
  const candidates = [];
  if (typeof exportsRoot === 'string') candidates.push(path.join(pkgDir, exportsRoot));
  else if (exportsRoot && typeof exportsRoot === 'object') {
    for (const key of ['import', 'module', 'default']) {
      const rel = typeof exportsRoot[key] === 'string' ? exportsRoot[key] : exportsRoot[key]?.default;
      if (rel) candidates.push(path.join(pkgDir, rel));
    }
  }
  try {
    candidates.push(showroomRequire.resolve('@playwright/test'));
  } catch {
    /* ya reportado arriba si tambien falla */
  }

  const attempted = [];
  for (const candidate of candidates) {
    if (!existsSync(candidate)) {
      attempted.push({ path: candidate, error: 'no existe' });
      continue;
    }
    try {
      const mod = await import(pathToFileURL(candidate).href);
      if (mod.chromium) {
        return { chromium: mod.chromium, resolvedFrom: candidate, version: pkg.version ?? null };
      }
      attempted.push({ path: candidate, error: 'el modulo no exporta "chromium"' });
    } catch (error) {
      attempted.push({ path: candidate, error: error.message });
    }
  }
  throw new Error(
    `resolvePlaywrightChromium: sin export "chromium". Intentos: ${JSON.stringify(attempted, null, 2)}`,
  );
}

function getPortProcessIdentity(port) {
  let pids;
  try {
    const out = execFileSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'], {
      encoding: 'utf8',
      timeout: 5000,
    });
    pids = out.split('\n').map((s) => s.trim()).filter(Boolean);
  } catch (error) {
    return { found: false, reason: `lsof fallo o no esta disponible: ${error.message}` };
  }
  if (pids.length === 0) return { found: false, reason: `nada escucha en TCP:${port}` };
  const pid = pids[0];
  const identity = { found: true, pid, allListeningPids: pids, port };
  for (const [field, flag] of [['lstart', 'lstart='], ['command', 'command=']]) {
    try {
      identity[field] = execFileSync('ps', ['-o', flag, '-p', pid], {
        encoding: 'utf8',
        timeout: 5000,
      }).trim();
    } catch (error) {
      identity[field] = null;
      identity[`${field}Error`] = error.message;
    }
  }
  return identity;
}

function compareServerIdentity(before, after) {
  const reasons = [];
  if (before.found !== after.found) {
    reasons.push(`presencia del server cambio (antes=${before.found}, despues=${after.found})`);
  } else if (before.found && after.found) {
    if (before.pid !== after.pid) reasons.push(`PID cambio (${before.pid} -> ${after.pid})`);
    if (before.lstart && after.lstart && before.lstart !== after.lstart) {
      reasons.push(`hora de arranque cambio ("${before.lstart}" -> "${after.lstart}")`);
    }
  }
  return { stable: reasons.length === 0, reasons };
}

function gitHead(repoRoot) {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
      cwd: repoRoot,
      encoding: 'utf8',
      timeout: 5000,
    }).trim();
  } catch (error) {
    return `unavailable: ${error.message}`;
  }
}

function gitDirty(repoRoot) {
  try {
    const out = execFileSync('git', ['status', '--porcelain'], {
      cwd: repoRoot,
      encoding: 'utf8',
      timeout: 15000,
    });
    return out.trim().length > 0;
  } catch {
    return null;
  }
}

function quarantineStaleLeftovers(outDir, expectedFilenames) {
  if (!existsSync(outDir)) return { quarantined: [], preRemovedExpected: [], quarantineDir: null };
  const expected = new Set(expectedFilenames);
  const quarantined = [];
  const preRemovedExpected = [];
  let quarantineDir = null;
  for (const name of readdirSync(outDir)) {
    if (name.startsWith('.stale-')) continue;
    const full = path.join(outDir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) continue;
    if (expected.has(name)) {
      unlinkSync(full);
      preRemovedExpected.push(name);
    } else {
      if (!quarantineDir) {
        quarantineDir = path.join(outDir, `.stale-${Date.now()}`);
        mkdirSync(quarantineDir, { recursive: true });
      }
      renameSync(full, path.join(quarantineDir, name));
      quarantined.push(name);
    }
  }
  return { quarantined, preRemovedExpected, quarantineDir };
}

function redactAbsolutePaths(value, replacements) {
  const sorted = [...replacements]
    .filter(([needle]) => typeof needle === 'string' && needle.length > 0)
    .sort((a, b) => b[0].length - a[0].length);
  const redactString = (input) => {
    let out = input;
    for (const [needle, replacement] of sorted) out = out.split(needle).join(replacement);
    return out;
  };
  const walk = (input) => {
    if (typeof input === 'string') return redactString(input);
    if (Array.isArray(input)) return input.map(walk);
    if (input && typeof input === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(input)) out[k] = walk(v);
      return out;
    }
    return input;
  };
  return walk(value);
}

// ---------------------------------------------------------------------------
// Instrumentacion de pagina
// ---------------------------------------------------------------------------

async function gotoWithRetry(page, url) {
  let response;
  let navErr;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      // 10 min: en dev server una ruta fría compila minutos (medido 7min en
      // r4-structures); el retry no rescata un goto que muere a los 120s.
      response = await page.goto(url, { waitUntil: 'networkidle', timeout: 600000 });
      navErr = undefined;
      break;
    } catch (error) {
      navErr = error;
      await page.waitForTimeout(3000);
    }
  }
  if (navErr) throw navErr;
  return response;
}

/** Excluye el indicador de dev-tools de Next (vive en un shadow root abierto). */
async function excludeDevChrome(page) {
  return page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (!portal || !portal.shadowRoot) return { portalPresent: false, excluded: false };
    let style = portal.shadowRoot.querySelector('style[data-f4c-exclude]');
    if (!style) {
      style = document.createElement('style');
      style.setAttribute('data-f4c-exclude', 'true');
      style.textContent = '#devtools-indicator{display:none !important;}';
      portal.shadowRoot.appendChild(style);
    }
    return { portalPresent: true, excluded: true };
  });
}

async function assertNoDevOverlay(page, label) {
  const visible = await page.evaluate(() => {
    const portal = document.querySelector('nextjs-portal');
    if (!portal || !portal.shadowRoot) return [];
    const found = [];
    for (const el of portal.shadowRoot.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.01) continue;
      if (cs.position !== 'fixed' && cs.position !== 'absolute') continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      found.push(`${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}`);
    }
    return found;
  });
  if (visible.length > 0) {
    throw new Error(
      `DEV OVERLAY para ${label} — sigue visible tras la exclusion: ${visible.join(', ')}.`,
    );
  }
}

async function visibleCount(page, selector) {
  return page.evaluate((sel) => {
    let n = 0;
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.01) n += 1;
    }
    return n;
  }, selector);
}

/**
 * Readiness estricta. Un selector que ve 0 elementos, o un conteo distinto del
 * exacto declarado, TERMINA la captura: nunca se reporta "sin diff" sobre la
 * escena equivocada.
 */
async function awaitReady(page, capture, label) {
  const deadline = Date.now() + 30000;
  const seen = {};
  for (;;) {
    let allMet = true;
    for (const check of capture.readiness) {
      const n = await visibleCount(page, check.selector);
      seen[check.what] = n;
      const ok = check.exact !== undefined ? n === check.exact : n >= (check.min ?? 1);
      if (!ok) allMet = false;
    }
    if (allMet) return seen;
    if (Date.now() > deadline) {
      const missing = capture.readiness
        .filter((c) =>
          c.exact !== undefined ? (seen[c.what] ?? 0) !== c.exact : (seen[c.what] ?? 0) < (c.min ?? 1),
        )
        .map(
          (c) =>
            `${c.what}: vi ${seen[c.what] ?? 0}, necesito ${
              c.exact !== undefined ? `exactamente ${c.exact}` : `>=${c.min ?? 1}`
            } (fuente: ${c.source})`,
        )
        .join('; ');
      throw new Error(`READINESS para ${label} — ${missing}. Me niego a fotografiar la escena equivocada.`);
    }
    await page.waitForTimeout(250);
  }
}

/** Prueba anti-fallback: el caso por defecto de la ruta NO puede estar en pantalla. */
async function assertNoFallbackScene(page, capture, label) {
  for (const selector of capture.forbiddenSelectors) {
    const n = await page.evaluate((sel) => document.querySelectorAll(sel).length, selector);
    if (n > 0) {
      throw new Error(
        `FALLBACK para ${label} — el selector del caso por defecto "${selector}" tiene ${n} ` +
          `coincidencias: la ruta ignoro "?only=${capture.only}" y renderizo otra familia.`,
      );
    }
  }
  const judged = await page.evaluate((sel) => document.querySelectorAll(sel).length, JUDGE_MODE_SELECTOR);
  if (judged > 0) {
    throw new Error(
      `JUDGE MODE para ${label} — ${JUDGE_MODE_SELECTOR} presente. F4C mide pintura real, no una transformada de juicio.`,
    );
  }
}

/** El ground estampado debe ser el pedido: ruta y documento no pueden divergir. */
async function assertGroundStamp(page, ground, label) {
  const stamped = await page.evaluate(() => {
    const r = document.documentElement;
    const out = {};
    for (const name of ['data-tenant', 'data-vertical', 'data-engine', 'data-theme', 'data-ds-root', 'lang', 'dir']) {
      out[name] = r.getAttribute(name);
    }
    return out;
  });
  const expected = { 'data-tenant': ground.dataTenant, ...EXPECTED_ROOT_ATTRIBUTES };
  for (const [name, want] of Object.entries(expected)) {
    if (stamped[name] !== want) {
      throw new Error(
        `GROUND STAMP para ${label} — ${name} es "${stamped[name]}", se esperaba "${want}".`,
      );
    }
  }
  return stamped;
}

/**
 * Digest LEIDO DEL DOM SERVIDO, jamas de una compilacion lateral en Node.
 * Tambien asevera la cardinalidad correcta por ground: bithire NO emite
 * artifact (ground/index.tsx:205), the-management emite exactamente uno.
 */
async function readArtifactIdentity(page, ground, label) {
  const found = await page.evaluate(
    ({ selector, digestAttr, slugAttr, verticalAttr }) => {
      const nodes = Array.from(document.querySelectorAll(selector));
      return nodes.map((node) => ({
        digest: node.getAttribute(digestAttr),
        slug: node.getAttribute(slugAttr),
        vertical: node.getAttribute(verticalAttr),
        elementId: node.getAttribute('id'),
        /* rowVersion NO viaja como atributo del DOM. Se registra su ausencia:
           esta CUBIERTO por el digest (admission/index.ts:348), asi que un bump
           de fila mueve el digest aunque el payload no cambie. */
        rowVersionAttribute: node.getAttribute('data-ds-tenant-theme-row-version'),
        cssBytes: (node.textContent ?? '').length,
      }));
    },
    {
      selector: ARTIFACT_STYLE_SELECTOR,
      digestAttr: ARTIFACT_DIGEST_ATTRIBUTE,
      slugAttr: ARTIFACT_SLUG_ATTRIBUTE,
      verticalAttr: ARTIFACT_VERTICAL_ATTRIBUTE,
    },
  );

  if (!ground.expectsArtifactStyle) {
    if (found.length !== 0) {
      throw new Error(
        `ARTIFACT para ${label} — el ground "${ground.routeSegment}" no debe emitir artifact CSS ` +
          `(ground/index.tsx:82-95) y se encontraron ${found.length} elementos.`,
      );
    }
    return {
      present: false,
      digest: null,
      slug: null,
      vertical: null,
      rowVersionAttribute: null,
      rowVersionNote:
        'ground static: sin artifact y sin rowVersion. Su oraculo es cssDigest (sha256 del CSS servido).',
    };
  }

  if (found.length !== 1) {
    throw new Error(
      `ARTIFACT para ${label} — se esperaba exactamente 1 ${ARTIFACT_STYLE_SELECTOR}, se hallaron ${found.length}.`,
    );
  }
  const one = found[0];
  if (!one.digest || !DIGEST_SHAPE.test(one.digest)) {
    throw new Error(`ARTIFACT para ${label} — digest con forma invalida: ${JSON.stringify(one.digest)}`);
  }
  if (one.slug !== ground.dataTenant) {
    throw new Error(
      `ARTIFACT para ${label} — slug del artifact "${one.slug}" != data-tenant esperado "${ground.dataTenant}".`,
    );
  }
  return {
    present: true,
    digest: one.digest,
    slug: one.slug,
    vertical: one.vertical,
    elementId: one.elementId,
    cssBytes: one.cssBytes,
    rowVersionAttribute: one.rowVersionAttribute,
    rowVersionNote:
      one.rowVersionAttribute === null
        ? 'rowVersion NO se expone en el DOM; queda cubierto por el digest (admission/index.ts:348).'
        : 'rowVersion expuesto en el DOM y registrado.',
  };
}

/**
 * Oraculo de CSS servido: hojas inline por texto y hojas enlazadas por bytes
 * descargados. Es el unico oraculo del ground static (que no tiene digest) y el
 * segundo del ground DB. La cache por URL evita bajar el bundle una vez por
 * captura.
 */
async function readCssDigest(page, cssCache) {
  const sheets = await page.evaluate(() => {
    const out = [];
    for (const sheet of Array.from(document.styleSheets)) {
      const node = sheet.ownerNode;
      if (!node) {
        out.push({ kind: 'unknown', key: 'no-owner-node' });
        continue;
      }
      if (node.tagName === 'STYLE') {
        out.push({
          kind: 'inline',
          key: node.getAttribute('data-testid') || node.getAttribute('id') || 'anon',
          text: node.textContent ?? '',
        });
      } else {
        /* `node.href` es la URL YA RESUELTA por el navegador contra la URL de la
           pagina; `getAttribute('href')` es el texto crudo y resolverlo despues
           en Node contra BASE resolveria mal cualquier href relativo. */
        out.push({ kind: 'link', key: node.href || sheet.href || '' });
      }
    }
    return out;
  });

  const entries = [];
  for (const sheet of sheets) {
    if (sheet.kind === 'inline') {
      entries.push({ kind: 'inline', key: sheet.key, bytes: sheet.text.length, sha256: sha256Text(sheet.text) });
      continue;
    }
    if (sheet.kind !== 'link' || !sheet.key) {
      entries.push({ kind: sheet.kind, key: sheet.key ?? null, bytes: null, sha256: null });
      continue;
    }
    const url = new URL(sheet.key).toString();
    if (!cssCache.has(url)) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`CSS ORACLE — ${url} respondio ${response.status}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      cssCache.set(url, { bytes: buffer.length, sha256: sha256(buffer) });
    }
    const cached = cssCache.get(url);
    entries.push({ kind: 'link', key: new URL(url).pathname, bytes: cached.bytes, sha256: cached.sha256 });
  }

  const combined = createHash('sha256');
  for (const entry of entries) combined.update(`${entry.kind}::${entry.key}::${entry.sha256 ?? 'null'}`);
  return { combined: combined.digest('hex'), sheets: entries };
}

/**
 * Lectura de un carrier: cada coincidencia aporta su raiz mas TODO descendiente
 * con `data-part` (enumeracion estructural, no una lista adivinada), en orden de
 * documento. Cada nodo trae sus propiedades PINTADAS y sus propiedades que deben
 * QUEDARSE QUIETAS, como dos conjuntos disjuntos.
 */
async function readCarrier(page, carrier, channels, label) {
  const readOnce = () =>
    page.evaluate(
      ({ selector, paintProps, holdProps, channelNames, maxNodes }) => {
      const isVisible = (el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.01;
      };
      const readNode = (el, key) => {
        const cs = getComputedStyle(el);
        const paint = {};
        for (const prop of paintProps) paint[prop] = cs[prop];
        const hold = {};
        for (const prop of holdProps) hold[prop] = cs[prop];
        const r = el.getBoundingClientRect();
        return {
          key,
          tag: el.tagName.toLowerCase(),
          part: el.getAttribute('data-part'),
          visible: isVisible(el),
          rect: {
            x: Math.round(r.x * 100) / 100,
            y: Math.round(r.y * 100) / 100,
            w: Math.round(r.width * 100) / 100,
            h: Math.round(r.height * 100) / 100,
          },
          paint,
          hold,
        };
      };

      const matches = Array.from(document.querySelectorAll(selector));
      const nodes = [];
      let overflow = false;
      matches.forEach((match, matchIndex) => {
        const subtree = [match, ...Array.from(match.querySelectorAll('[data-part]'))];
        if (subtree.length > maxNodes) overflow = true;
        subtree.slice(0, maxNodes).forEach((el, nodeIndex) => {
          nodes.push(readNode(el, `m${matchIndex}/n${nodeIndex}:${el.tagName.toLowerCase()}[${el.getAttribute('data-part') ?? '-'}]`));
        });
      });

      /* Canales leidos SOBRE el elemento carrier (no en :root): asi se mide lo
         que el consumidor realmente hereda. Un color-mix() llega sin resolver;
         sirve para "se movio o no", no como color. */
      const channels = {};
      if (matches.length > 0) {
        const cs = getComputedStyle(matches[0]);
        for (const name of channelNames) channels[name] = cs.getPropertyValue(name).trim();
      }

      return {
        count: matches.length,
        visibleCount: matches.filter(isVisible).length,
        overflow,
        nodes,
        channels,
      };
      },
      {
        selector: carrier.selector,
        paintProps: PAINT_PROPS,
        holdProps: HOLD_PROPS,
        channelNames: channels,
        maxNodes: MAX_NODES_PER_MATCH,
      },
    );

  /* La cardinalidad se relee por una ventana acotada antes de fallar: una
     escena puede asentar su contenedor un render antes que sus partes (flake
     real: cockpit-info aparecio un tick despues de la banda `settled` en la
     primera corrida B de la serie final, 2026-08-30). La espera absorbe SOLO
     carreras de asentamiento: si el conteo no converge, falla igual. */
  const want = carrier.count;
  const countOk = (result) =>
    want.exact !== undefined ? result.count === want.exact : result.count >= (want.min ?? 1);
  const deadline = Date.now() + 5000;
  let result = await readOnce();
  while (!countOk(result) && Date.now() < deadline) {
    await page.waitForTimeout(250);
    result = await readOnce();
  }

  if (result.overflow) {
    throw new Error(
      `CARRIER ${carrier.id} en ${label} — un subarbol excede ${MAX_NODES_PER_MATCH} nodos con data-part. ` +
        'Se rechaza truncar en silencio: acota el selector del carrier.',
    );
  }
  const ok = countOk(result);
  if (!ok) {
    throw new Error(
      `CARRIER ${carrier.id} en ${label} — "${carrier.selector}" dio ${result.count} coincidencias, ` +
        `se esperaba ${want.exact !== undefined ? `exactamente ${want.exact}` : `>=${want.min ?? 1}`} ` +
        `(fuente: ${carrier.source}).`,
    );
  }
  if (result.visibleCount < 1) {
    throw new Error(
      `CARRIER ${carrier.id} en ${label} — ${result.count} coincidencias pero NINGUNA visible. ` +
        'Un carrier invisible no prueba pintura.',
    );
  }
  return result;
}

async function settleAndShoot(page, outPath) {
  await page.evaluate(() => document.fonts?.ready);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.screenshot({ path: outPath, fullPage: true });
}

function buildUrl(ground, capture) {
  const base = `${BASE}/${ground.routeSegment}/${capture.route}`;
  return capture.only ? `${base}?only=${encodeURIComponent(capture.only)}` : base;
}

async function captureOne(browser, { ground, capture, width, outPath, channels, cssCache }) {
  const label = `${capture.id}/${ground.routeSegment}/${width}`;
  const page = await browser.newPage({
    viewport: { width, height: VIEWPORT_HEIGHT },
    /* Obligatorio para la igualdad byte A<->C/E: skeleton, spinner y el pulse
       del badge animan (skeleton.css:48, badge.css:543). */
    reducedMotion: 'reduce',
  });
  try {
    const url = buildUrl(ground, capture);
    const response = await gotoWithRetry(page, url);
    const status = response ? response.status() : null;
    if (status !== 200) {
      throw new Error(
        `HTTP para ${label} — ${url} respondio ${status}. Las rutas r4/r6 devuelven 404 sin un "?only=" valido.`,
      );
    }
    await excludeDevChrome(page);
    await page.evaluate(() => document.fonts?.ready);

    const readiness = await awaitReady(page, capture, label);
    await assertNoFallbackScene(page, capture, label);
    const rootStamp = await assertGroundStamp(page, ground, label);
    const artifact = await readArtifactIdentity(page, ground, label);
    const css = await readCssDigest(page, cssCache);

    const carriers = {};
    for (const carrier of capture.carriers) {
      carriers[carrier.id] = {
        tone: carrier.tone,
        selector: carrier.selector,
        source: carrier.source,
        ...(await readCarrier(page, carrier, channels, label)),
      };
    }

    await excludeDevChrome(page);
    await assertNoDevOverlay(page, label);
    await settleAndShoot(page, outPath);

    return {
      label,
      captureId: capture.id,
      tier: capture.tier,
      familyId: capture.familyId,
      groundRouteSegment: ground.routeSegment,
      groundLabTenant: ground.labTenant,
      groundDataTenant: ground.dataTenant,
      groundArm: ground.arm,
      groundRendering: ground.rendering,
      width,
      url,
      httpStatus: status,
      rootStamp,
      readiness,
      artifact,
      cssDigest: css.combined,
      cssSheets: css.sheets,
      carriers,
      /* Campos de contrato por fila (evidence-contract.json:59-75). */
      artifactPath: path.join(CAPTURES_SUBDIR, path.basename(outPath)),
      artifactSha256: sha256(readFileSync(outPath)),
    };
  } finally {
    await page.close();
  }
}

// ---------------------------------------------------------------------------
// Comparador de fases
// ---------------------------------------------------------------------------

const rowKey = (row) => `${row.captureId}|${row.groundRouteSegment}|${row.width}`;

function diffNodeMaps(rowA, rowB, carrierId) {
  const a = rowA.carriers[carrierId];
  const b = rowB.carriers[carrierId];
  const paintDeltas = [];
  const holdDeltas = [];
  const structural = [];

  if (!a || !b) {
    structural.push(`el carrier "${carrierId}" existe en solo una de las dos corridas`);
    return { paintDeltas, holdDeltas, structural, channelDeltas: [] };
  }
  if (a.count !== b.count) {
    structural.push(`conteo de "${carrierId}": ${a.count} -> ${b.count}`);
  }
  const mapA = new Map(a.nodes.map((n) => [n.key, n]));
  const mapB = new Map(b.nodes.map((n) => [n.key, n]));
  for (const key of mapA.keys()) if (!mapB.has(key)) structural.push(`nodo ausente en B: ${carrierId}/${key}`);
  for (const key of mapB.keys()) if (!mapA.has(key)) structural.push(`nodo nuevo en B: ${carrierId}/${key}`);

  for (const [key, nodeA] of mapA) {
    const nodeB = mapB.get(key);
    if (!nodeB) continue;
    for (const prop of PAINT_PROPS) {
      if (nodeA.paint[prop] !== nodeB.paint[prop]) {
        paintDeltas.push({ node: key, property: prop, a: nodeA.paint[prop], b: nodeB.paint[prop] });
      }
    }
    for (const prop of HOLD_PROPS) {
      if (nodeA.hold[prop] !== nodeB.hold[prop]) {
        holdDeltas.push({ node: key, property: prop, a: nodeA.hold[prop], b: nodeB.hold[prop] });
      }
    }
    /* Ancho y alto: un cambio de color no puede reflowear. x/y quedan solo como
       diagnostico porque dependen de hermanos ajenos al carrier. */
    for (const dim of ['w', 'h']) {
      if (nodeA.rect[dim] !== nodeB.rect[dim]) {
        holdDeltas.push({ node: key, property: `rect.${dim}`, a: nodeA.rect[dim], b: nodeB.rect[dim] });
      }
    }
  }

  const channelDeltas = [];
  for (const name of Object.keys(a.channels ?? {})) {
    if ((a.channels ?? {})[name] !== (b.channels ?? {})[name]) {
      channelDeltas.push({ channel: name, a: a.channels[name], b: b.channels[name] });
    }
  }
  return { paintDeltas, holdDeltas, structural, channelDeltas };
}

function applyDrill(drill, rowsA, rowsB, verdictInputs, byRow) {
  if (!drill) return null;
  if (!DRILLS[drill]) {
    throw new Error(`--drill desconocido "${drill}". Conocidos: ${Object.keys(DRILLS).join(', ')}`);
  }
  if (verdictInputs.length === 0) {
    throw new Error(`drill ${drill}: el par comparado no tiene ningun carrier al que apuntar`);
  }
  const first = (predicate) => verdictInputs.find(predicate);

  if (drill === 'hold-becomes-mover') {
    const target = first((v) => v.expectation === 'HOLD');
    if (!target) throw new Error('drill hold-becomes-mover: no hay ningun carrier HOLD en el par comparado');
    const node = rowsB.get(target.rowKey).carriers[target.carrierId].nodes[0];
    node.paint.color = `${node.paint.color} /*drill*/`;
    return { drill, injectedInto: `${target.rowKey}::${target.carrierId}` };
  }
  if (drill === 'mover-becomes-frozen') {
    const target = first((v) => v.expectation === 'MOVE');
    if (!target) throw new Error('drill mover-becomes-frozen: no hay ningun carrier MOVER en el par comparado');
    const carrierB = rowsB.get(target.rowKey).carriers[target.carrierId];
    const carrierA = rowsA.get(target.rowKey).carriers[target.carrierId];
    carrierB.nodes = JSON.parse(JSON.stringify(carrierA.nodes));
    carrierB.channels = JSON.parse(JSON.stringify(carrierA.channels));
    return { drill, frozen: `${target.rowKey}::${target.carrierId}` };
  }
  if (drill === 'png-tamper') {
    /* Tiene que morder en la direccion correcta. En una fila con MOVER el PNG
       YA difiere, asi que ensuciarlo mas no prueba nada: alli se IGUALA al de A
       (violacion "PNG identico con un carrier MOVER"). En una fila sin ningun
       MOVER se hace lo contrario. Elegir mal aqui es exactamente el drill
       decorativo que el contrato prohibe. */
    const holdOnlyKey = [...byRow.entries()].find(([, inputs]) =>
      inputs.every((i) => i.expectation === 'HOLD'),
    )?.[0];
    if (holdOnlyKey) {
      const row = rowsB.get(holdOnlyKey);
      row.artifactSha256 = sha256Text(`${row.artifactSha256}-drill`);
      return { drill, tampered: holdOnlyKey, direction: 'un PNG que debia quedar identico ahora difiere' };
    }
    const moverKey = [...byRow.entries()].find(([, inputs]) =>
      inputs.some((i) => i.expectation === 'MOVE'),
    )?.[0];
    if (!moverKey) throw new Error('drill png-tamper: no hay ninguna fila a la que apuntar');
    rowsB.get(moverKey).artifactSha256 = rowsA.get(moverKey).artifactSha256;
    return { drill, tampered: moverKey, direction: 'un PNG que debia cambiar ahora es identico' };
  }
  if (drill === 'count-drift') {
    const target = verdictInputs[0];
    rowsB.get(target.rowKey).carriers[target.carrierId].count += 1;
    return { drill, drifted: `${target.rowKey}::${target.carrierId}` };
  }
  if (drill === 'geometry-leak') {
    const target = first((v) => v.expectation === 'MOVE');
    if (!target) throw new Error('drill geometry-leak: no hay ningun carrier MOVER en el par comparado');
    const node = rowsB.get(target.rowKey).carriers[target.carrierId].nodes[0];
    node.hold.fontSize = `${node.hold.fontSize} /*drill*/`;
    return { drill, leaked: `${target.rowKey}::${target.carrierId}` };
  }
  return null;
}

/**
 * Ruido de rasterizado declarado (observado en A<->C el 2026-08-30): el
 * antialiasing de hairlines y de la scrollbar overlay varia 1-2 LSB entre
 * lanzamientos independientes del browser, aun con computed map identico.
 * NUNCA absuelve un diff de diseno: exige pocos pixels Y delta chico. Un diff
 * de CERO pixels con hash distinto tampoco se absuelve: eso es metadata del
 * receipt tocada (el drill png-tamper muerde exactamente ahi), no ruido.
 */
const PNG_NOISE_TOLERANCE = {
  maxPixelsRatio: 0.0002 /* 0.02% de los pixels de la pagina */,
  maxChannelDelta: 2 /* por canal RGB */,
};

/**
 * Diff pixel a pixel de dos PNGs via canvas del browser (decodificacion nativa,
 * sin parsers a mano). Devuelve { pixels, maxDelta, totalPixels } o
 * { sizeMismatch: true }.
 */
async function pixelDiffStats(pathA, pathB, getBrowser) {
  const page = await (await getBrowser()).newPage();
  try {
    return await page.evaluate(
      async ({ a, b }) => {
        const load = (src) =>
          new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('no se pudo decodificar un PNG'));
            img.src = src;
          });
        const [imgA, imgB] = await Promise.all([load(a), load(b)]);
        if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
          return {
            sizeMismatch: true,
            widthA: imgA.width,
            widthB: imgB.width,
            heightA: imgA.height,
            heightB: imgB.height,
          };
        }
        const canvas = document.createElement('canvas');
        canvas.width = imgA.width;
        canvas.height = imgA.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(imgA, 0, 0);
        const dataA = ctx.getImageData( 0, 0, canvas.width, canvas.height).data;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imgB, 0, 0);
        const dataB = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let pixels = 0;
        let maxDelta = 0;
        for (let i = 0; i < dataA.length; i += 4) {
          const d = Math.max(
            Math.abs(dataA[i] - dataB[i]),
            Math.abs(dataA[i +  1] - dataB[i + 1]),
            Math.abs(dataA[i + 2] - dataB[i + 2]),
          );
          if (d >  0) {
            pixels += 1;
            if (d > maxDelta) maxDelta = d;
          }
        }
        return { sizeMismatch: false, pixels, maxDelta, totalPixels: canvas.width * canvas.height };
      },
      {
        a: `data:image/png;base64,${readFileSync(pathA).toString('base64')}`,
        b: `data:image/png;base64,${readFileSync(pathB).toString('base64')}`,
      },
    );
  } finally {
    await page.close();
  }
}

/**
 * Una corrida es certificable solo si CADA campo lo prueba por separado.
 * Confiar en el `pass` agregado dejaria pasar un receipt stale o adulterado:
 * crashed, drift del server, conteos plan/captura y modo se recomputan aqui de
 * forma independiente, y se exige coherencia con el `pass` declarado (auditoria
 * Codex F4C, 2026-08-30). Usado por `--check` y por el comparador.
 */
function certifiableRunFailures(receipt, label) {
  const out = [];
  if (receipt.crashed !== false) out.push(`${label}: crashed=${receipt.crashed}`);
  if ((receipt.failures ?? []).length !== 0) {
    out.push(`${label}: ${(receipt.failures ?? []).length} fallos de captura declarados`);
  }
  if (receipt.serverDrift?.stable !== true) {
    out.push(`${label}: serverDrift.stable=${receipt.serverDrift?.stable}`);
  }
  if (receipt.capturedRows !== receipt.plannedRows) {
    out.push(`${label}: capturadas ${receipt.capturedRows}/${receipt.plannedRows}`);
  }
  if ((receipt.rows ?? []).length !== receipt.capturedRows) {
    out.push(`${label}: rows.length=${(receipt.rows ?? []).length} != capturedRows=${receipt.capturedRows}`);
  }
  if (receipt.runMode !== 'full') {
    out.push(`${label}: runMode=${JSON.stringify(receipt.runMode)} no es 'full'`);
  }
  const recomputedPass = out.length === 0;
  if ((receipt.pass === true) !== recomputedPass) {
    out.push(
      `${label}: pass declarado (${receipt.pass}) no coincide con la recomputacion por campos (${recomputedPass})`,
    );
  }
  return out;
}

async function compareRuns(receiptA, receiptB, { drill = null, dirA = null, dirB = null, getBrowser = null } = {}) {
  const phaseB = receiptB.phase;
  const spec = PHASE_EXPECTATIONS[phaseB];
  const failures = [];

  if (!spec) failures.push(`fase desconocida en la corrida B: "${phaseB}"`);
  if (spec && spec.role === 'baseline') {
    throw new Error(
      `la fase ${phaseB} es la linea base: no se compara contra nada. Pasa una corrida B/C/D/E como segundo directorio.`,
    );
  }
  if (spec && spec.comparedAgainst && receiptA.phase !== spec.comparedAgainst) {
    failures.push(
      `la fase ${phaseB} se compara contra ${spec.comparedAgainst}, pero la corrida A declara fase "${receiptA.phase}"`,
    );
  }
  if (receiptA.harnessSelfSha256 !== receiptB.harnessSelfSha256) {
    failures.push('el harness cambio entre las dos corridas: los resultados no son comparables');
  }
  if (receiptA.widths.join(',') !== receiptB.widths.join(',')) {
    failures.push('las dos corridas usaron anchos distintos');
  }
  if (receiptA.controlManifestSha256 !== receiptB.controlManifestSha256) {
    failures.push('el manifest del control cambio entre corridas: la lista de canales no es la misma');
  }

  /* Una corrida degradada NO es comparable: cada campo del receipt debe
     recomputar certificable de forma independiente (agregado `pass`:
     scouts/f4c-harness-audit.md DEFECT-1, auditoria ejecutada por Kimi K3;
     recomputacion por campos: hallazgo Codex via mandato del owner
     2026-08-30). */
  for (const [label, receipt] of [['A', receiptA], ['B', receiptB]]) {
    failures.push(...certifiableRunFailures(receipt, `la corrida ${label}`));
  }
  /* Todo ground con expectativa declarada debe tener filas en AMBAS corridas:
     capturar solo el brazo static dejaria la puerta intended de B/D sin
     evidencia y daria verde igual (mismo DEFECT-1). */
  if (spec?.grounds) {
    for (const groundId of Object.keys(spec.grounds)) {
      if (!(receiptA.rows ?? []).some((r) => r.groundRouteSegment === groundId)) {
        failures.push(`la corrida A no tiene ninguna fila del ground "${groundId}"`);
      }
      if (!(receiptB.rows ?? []).some((r) => r.groundRouteSegment === groundId)) {
        failures.push(`la corrida B no tiene ninguna fila del ground "${groundId}"`);
      }
    }
  }

  const rowsA = new Map(receiptA.rows.map((r) => [rowKey(r), JSON.parse(JSON.stringify(r))]));
  const rowsB = new Map(receiptB.rows.map((r) => [rowKey(r), JSON.parse(JSON.stringify(r))]));
  for (const key of rowsA.keys()) if (!rowsB.has(key)) failures.push(`fila ausente en la corrida B: ${key}`);
  for (const key of rowsB.keys()) if (!rowsA.has(key)) failures.push(`fila nueva en la corrida B: ${key}`);

  /* Inventario de expectativas por carrier ANTES de aplicar cualquier drill, para
     que el drill pueda apuntar a un objetivo real. */
  const verdictInputs = [];
  for (const [key, rowB] of rowsB) {
    if (!rowsA.has(key)) continue;
    const groundSpec = spec?.grounds?.[rowB.groundRouteSegment];
    if (!groundSpec) {
      failures.push(`la fase ${phaseB} no declara expectativa para el ground "${rowB.groundRouteSegment}"`);
      continue;
    }
    for (const carrierId of Object.keys(rowB.carriers)) {
      const tone = rowB.carriers[carrierId].tone;
      const expectation =
        groundSpec.paint === 'TONE_RULE' && tone === spec.intendedSeed ? 'MOVE' : 'HOLD';
      verdictInputs.push({ rowKey: key, carrierId, tone, expectation, groundSpec });
    }
  }

  const byRow = new Map();
  for (const input of verdictInputs) {
    if (!byRow.has(input.rowKey)) byRow.set(input.rowKey, []);
    byRow.get(input.rowKey).push(input);
  }

  const drillApplied = applyDrill(drill, rowsA, rowsB, verdictInputs, byRow);

  /* El veredicto se calcula POR FILA, ya con los datos perturbados si hubo drill. */
  const captureVerdicts = [];
  for (const [key, inputs] of byRow) {
    const rowA = rowsA.get(key);
    const rowB = rowsB.get(key);
    const groundSpec = inputs[0].groundSpec;
    const rowFailures = [];
    const carrierVerdicts = [];

    for (const input of inputs) {
      const diff = diffNodeMaps(rowA, rowB, input.carrierId);
      const moved = diff.paintDeltas.length > 0;
      let verdict;
      if (diff.structural.length > 0) {
        verdict = 'ERROR';
        rowFailures.push(`[${input.carrierId}] estructura: ${diff.structural.join('; ')}`);
      } else if (input.expectation === 'MOVE') {
        if (!moved) {
          verdict = 'ERROR';
          rowFailures.push(
            `[${input.carrierId}] se esperaba MOVER (tone=${input.tone}) y ninguna propiedad pintada cambio. ` +
              `Canales movidos: ${diff.channelDeltas.length}. Un canal sin pintura NO cuenta como llegada.`,
          );
        } else if (diff.holdDeltas.length > 0) {
          verdict = 'ERROR';
          rowFailures.push(
            `[${input.carrierId}] movio pintura pero TAMBIEN movio geometria/tipografia/motion: ` +
              `${diff.holdDeltas.map((d) => `${d.node}.${d.property}`).slice(0, 6).join(', ')}`,
          );
        } else {
          verdict = 'MOVED';
        }
      } else {
        if (moved || diff.holdDeltas.length > 0) {
          verdict = 'ERROR';
          rowFailures.push(
            `[${input.carrierId}] se esperaba NO MOVER (tone=${input.tone}) y cambio: ` +
              `${[...diff.paintDeltas, ...diff.holdDeltas].map((d) => `${d.node}.${d.property}`).slice(0, 6).join(', ')}`,
          );
        } else {
          verdict = 'NOT_MOVED';
        }
      }
      carrierVerdicts.push({
        carrierId: input.carrierId,
        tone: input.tone,
        expectation: input.expectation,
        verdict,
        paintDeltas: diff.paintDeltas,
        holdDeltas: diff.holdDeltas,
        channelDeltas: diff.channelDeltas,
        structural: diff.structural,
      });
    }

    /* Evidencia 3: el pixel. La expectativa se DERIVA de si la fila contiene
       algun MOVER, en vez de suponer que una escena entera se congela. */
    const expectsPixelChange = inputs.some((i) => i.expectation === 'MOVE');
    const pngChanged = rowA.artifactSha256 !== rowB.artifactSha256;
    let pngNoise = null;
    if (expectsPixelChange && !pngChanged) {
      rowFailures.push('el PNG es byte-identico pese a contener un carrier MOVER');
    }
    if (!expectsPixelChange && pngChanged) {
      /* Ruido de rasterizado (PNG_NOISE_TOLERANCE): con el computed map
         identico, un diff minusculo de <=2 LSB concentrado en hairlines es
         jitter de antialiasing entre lanzamientos del browser, no un cambio de
         diseno. Se MIDE contra los archivos y se registra en el veredicto;
         jamas absuelve un diff mayor, ni un par de archivos identicos con hash
         distinto (metadata tocada: el drill png-tamper muerde ahi). */
      let justified = false;
      if (dirA && dirB && getBrowser) {
        const stats = await pixelDiffStats(
          path.join(dirA, rowA.artifactPath),
          path.join(dirB, rowB.artifactPath),
          getBrowser,
        );
        justified =
          !stats.sizeMismatch &&
          stats.pixels > 0 &&
          stats.pixels <= Math.ceil(stats.totalPixels * PNG_NOISE_TOLERANCE.maxPixelsRatio) &&
          stats.maxDelta <= PNG_NOISE_TOLERANCE.maxChannelDelta;
        pngNoise = { ...stats, justified };
      }
      if (!justified) {
        rowFailures.push('el PNG cambio pese a que ningun carrier de esta captura debia moverse');
      }
  }

    /* Digest del artifact leido del DOM. */
    const wantArtifact = groundSpec.artifactDigest;
    const digestA = rowA.artifact?.digest ?? null;
    const digestB = rowB.artifact?.digest ?? null;
    if (wantArtifact === 'ABSENT') {
      if (rowA.artifact?.present || rowB.artifact?.present) {
        rowFailures.push('se esperaba ausencia de artifact en este ground y hay uno presente');
      }
    } else if (wantArtifact === 'IDENTICAL' && digestA !== digestB) {
      rowFailures.push(`el digest del artifact debia quedar identico y cambio (${digestA} -> ${digestB})`);
    } else if (wantArtifact === 'DIFFERS' && digestA === digestB) {
      rowFailures.push(`el digest del artifact debia cambiar y quedo igual (${digestA})`);
    }

    /* Oraculo de CSS servido. */
    const wantCss = groundSpec.cssDigest;
    if (wantCss === 'IDENTICAL' && rowA.cssDigest !== rowB.cssDigest) {
      rowFailures.push(`el CSS servido debia quedar identico y cambio (${rowA.cssDigest} -> ${rowB.cssDigest})`);
    }
    if (wantCss === 'DIFFERS' && rowA.cssDigest === rowB.cssDigest) {
      rowFailures.push(`el CSS servido debia cambiar y quedo igual (${rowA.cssDigest})`);
    }

    captureVerdicts.push({
      rowKey: key,
      captureId: rowB.captureId,
      tier: rowB.tier,
      ground: rowB.groundRouteSegment,
      width: rowB.width,
      verdict: rowFailures.length === 0 ? (expectsPixelChange ? 'MOVED' : 'NOT_MOVED') : 'ERROR',
      expectsPixelChange,
      pngChanged,
      pngNoise,
      pngA: rowA.artifactSha256,
      pngB: rowB.artifactSha256,
      artifactDigest: { expected: wantArtifact, a: digestA, b: digestB },
      cssDigest: { expected: wantCss, a: rowA.cssDigest, b: rowB.cssDigest },
      carriers: carrierVerdicts,
      failures: rowFailures,
  });
    failures.push(...rowFailures.map((f) => `${key} :: ${f}`));
  }

  return {
    phaseA: receiptA.phase,
    phaseB,
    expectation: spec ?? null,
    drill: drillApplied,
    captures: captureVerdicts,
    failures,
    pass: failures.length === 0,
  };
}

// ---------------------------------------------------------------------------
// Modos
// ---------------------------------------------------------------------------

function readReceipt(dir) {
  for (const name of [RECEIPT_NAME, SELF_TEST_RECEIPT_NAME]) {
    const candidate = path.join(dir, name);
    if (existsSync(candidate)) return { receipt: JSON.parse(readFileSync(candidate, 'utf8')), path: candidate };
  }
  throw new Error(`no hay ${RECEIPT_NAME} ni ${SELF_TEST_RECEIPT_NAME} en ${dir}`);
}

/** Re-valida un output-dir contra sus propios PNGs, sin navegar. */
function runCheck(outDir) {
  const { receipt, path: receiptPath } = readReceipt(outDir);
  const failures = [];
  if (receipt.schemaVersion !== SCHEMA_VERSION) {
    failures.push(`schemaVersion ${receipt.schemaVersion} != ${SCHEMA_VERSION}`);
  }
  /* El check re-valida evidencia CERTIFICABLE por campos independientes: una
     corrida crashed, parcial o con drift no lo es aunque cada PNG presente
     hashee bien, y un receipt con `pass` adulterado a mano tampoco
     (scouts/f4c-harness-audit.md DEFECT-2, auditoria ejecutada por Kimi K3;
     hallazgo Codex via mandato del owner 2026-08-30: no confiar en el
     agregado). */
  failures.push(...certifiableRunFailures(receipt, 'la corrida'));
  const seen = new Set();
  for (const row of receipt.rows) {
    const full = path.join(outDir, row.artifactPath);
    if (!existsSync(full)) {
      failures.push(`falta el PNG declarado: ${row.artifactPath}`);
      continue;
    }
    seen.add(path.basename(full));
    const actual = sha256(readFileSync(full));
    if (actual !== row.artifactSha256) {
      failures.push(`sha256 no coincide para ${row.artifactPath}: receipt=${row.artifactSha256} disco=${actual}`);
    }
  }
  const capturesDir = path.join(outDir, CAPTURES_SUBDIR);
  if (existsSync(capturesDir)) {
    for (const name of readdirSync(capturesDir)) {
      if (name.startsWith('.')) continue;
      if (!seen.has(name)) failures.push(`PNG en disco no declarado por el receipt: ${name}`);
    }
  }
  process.stdout.write(`check: ${receiptPath}\n`);
  process.stdout.write(`filas ${receipt.rows.length}, fallos ${failures.length}\n`);
  for (const f of failures) process.stdout.write(`  FAIL: ${f}\n`);
  process.exitCode = failures.length === 0 ? 0 : 1;
}

async function runCompare(dirA, dirB, drill) {
  const { receipt: receiptA } = readReceipt(dirA);
  const { receipt: receiptB } = readReceipt(dirB);

  /* El diff de pixels necesita un browser (decodificacion nativa por canvas).
     Se crea perezoso: una comparacion limpia nunca lo levanta. */
  let lazyBrowser = null;
  const getBrowser = async () => {
    if (!lazyBrowser) {
      const playwright = await resolvePlaywrightChromium(deriveRepoRoot(HERE));
      lazyBrowser = await playwright.chromium.launch();
    }
    return lazyBrowser;
  };
  const printResult = (result) => {
    process.stdout.write(`comparacion ${result.phaseA} -> ${result.phaseB}\n`);
    for (const capture of result.captures) {
      process.stdout.write(
        `  ${capture.verdict.padEnd(9)} ${capture.captureId}/${capture.ground}/${capture.width} ` +
          `(png ${capture.pngChanged ? 'cambio' : 'igual'}, esperado ${capture.expectsPixelChange ? 'cambio' : 'igual'})\n`,
      );
      if (capture.pngNoise && !capture.pngNoise.sizeMismatch) {
        const ratio = ((capture.pngNoise.pixels / capture.pngNoise.totalPixels) * 100).toFixed(4);
        process.stdout.write(
          `      · ruido de rasterizado medido y ${capture.pngNoise.justified ? 'dentro' : 'FUERA'} de tolerancia: ` +
            `${capture.pngNoise.pixels} px (${ratio}%), delta max ${capture.pngNoise.maxDelta}/255\n`,
        );
      }
      for (const carrier of capture.carriers) {
        process.stdout.write(
          `      - ${carrier.carrierId} tone=${carrier.tone} esperado=${carrier.expectation} -> ${carrier.verdict} ` +
            `(paint ${carrier.paintDeltas.length}, hold ${carrier.holdDeltas.length}, canal ${carrier.channelDeltas.length})\n`,
        );
      }
    }
    for (const f of result.failures) process.stdout.write(`  FAIL: ${f}\n`);
  };

  try {
    if (drill) {
      /* Causalidad del drill: la perturbacion solo prueba algo si la comparacion
         LIMPIA pasa. Un "drill verde" sobre un par que ya fallaba por motivos
         ajenos no demuestra que el comparador muerda: cualquier fallo habria
         dado el mismo exit 0 (scouts/f4c-harness-audit.md DEFECT-3, auditoria
         ejecutada por Kimi K3). */
      const clean = await compareRuns(receiptA, receiptB, { drill: null, dirA, dirB, getBrowser });
      if (!clean.pass) {
        process.stdout.write(
          `drill "${drill}": la comparacion limpia YA falla; el drill no puede probar nada.\n`,
        );
        for (const f of clean.failures) process.stdout.write(`  FAIL(limpio): ${f}\n`);
        process.exitCode = 1;
        return;
      }
      const drilled = await compareRuns(receiptA, receiptB, { drill, dirA, dirB, getBrowser });
      const drillWorked = !drilled.pass;
      process.stdout.write(
        `drill "${drill}" (${DRILLS[drill]}): comparacion limpia verde; con la perturbacion el comparador ` +
          `${drillWorked ? 'FALLO como debe' : 'NO fallo'}\n`,
      );
      for (const f of drilled.failures) process.stdout.write(`  FAIL(inducido): ${f}\n`);
      process.exitCode = drillWorked ? 0 : 1;
      return;
    }

    const result = await compareRuns(receiptA, receiptB, { drill: null, dirA, dirB, getBrowser });
    printResult(result);
    process.stdout.write(`pass=${result.pass}\n`);
    process.exitCode = result.pass ? 0 : 1;
  } finally {
    await lazyBrowser?.close();
  }
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { positional: [], flags: {} };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      args.positional.push(token);
      continue;
    }
    const name = token.slice(2);
    if (['self-test', 'check'].includes(name)) {
      args.flags[name] = true;
      continue;
    }
    if (name === 'compare') {
      args.flags.compare = [argv[i + 1], argv[i + 2]];
      i += 2;
      continue;
    }
    args.flags[name] = argv[i + 1];
    i += 1;
  }
  return args;
}

function selectCaptures({ selfTest, include }) {
  const extra = new Set((include ?? '').split(',').map((s) => s.trim()).filter(Boolean));
  for (const id of extra) {
    if (!CAPTURES.some((c) => c.id === id)) {
      throw new Error(`--include nombra una captura inexistente: "${id}"`);
    }
  }
  const active = CAPTURES.filter((c) => c.enabled || extra.has(c.id));
  if (!selfTest) return active;
  return active.filter((c) => SELF_TEST_CAPTURE_IDS.includes(c.id));
}

async function runCapture(args) {
  const startedAt = new Date().toISOString();
  const outDir = args.positional[0];
  const phase = args.flags.phase;
  const selfTest = Boolean(args.flags['self-test']);

  if (!outDir) throw new Error('uso: f4c-canary-capture.mjs <output-dir> --phase <A|B|C|D|E> [--ground g] [--self-test]');
  if (!phase || !PHASE_EXPECTATIONS[phase]) {
    throw new Error(`--phase es obligatorio y debe ser uno de ${Object.keys(PHASE_EXPECTATIONS).join('|')}`);
  }
  const groundFilter = args.flags.ground;
  if (groundFilter && !GROUNDS[groundFilter]) {
    throw new Error(`--ground debe ser uno de ${Object.keys(GROUNDS).join('|')}`);
  }

  const repoRoot = deriveRepoRoot(HERE);
  const selfSha = sha256(readFileSync(fileURLToPath(import.meta.url)));

  const controlManifestPath = path.join(repoRoot, CONTROL_MANIFEST_RELPATH);
  if (!existsSync(controlManifestPath)) {
    throw new Error(`no se encuentra el manifest del control en ${CONTROL_MANIFEST_RELPATH}`);
  }
  const controlManifestRaw = readFileSync(controlManifestPath);
  const controlManifest = JSON.parse(controlManifestRaw.toString('utf8'));
  const declaredChannels = controlManifest?.declaredOutputs?.channels;
  if (!Array.isArray(declaredChannels) || declaredChannels.length === 0) {
    throw new Error(`${CONTROL_MANIFEST_RELPATH} no declara declaredOutputs.channels`);
  }
  const channels = [...declaredChannels, ...UNDECLARED_CHANNELS_WATCHED];

  /* `matrixCaptures` es la matriz activa completa; `captures` es lo que ESTA
     corrida ejecuta. La cobertura por tier se reporta sobre la matriz, no sobre
     la muestra, para que un --self-test no pueda inventar un hueco ni taparlo. */
  const matrixCaptures = selectCaptures({ selfTest: false, include: args.flags.include });
  const captures = selectCaptures({ selfTest, include: args.flags.include });
  const grounds = groundFilter ? [GROUNDS[groundFilter]] : Object.values(GROUNDS);

  const plan = [];
  for (const capture of captures) {
    for (const ground of grounds) {
      for (const width of WIDTHS) {
        plan.push({
          capture,
          ground,
          width,
          outName: `${phase}-${ground.routeSegment}-${capture.id}-${width}.png`,
        });
      }
    }
  }
  const names = plan.map((p) => p.outName);
  const duplicates = names.filter((n, i) => names.indexOf(n) !== i);
  if (duplicates.length > 0) {
    throw new Error(`colision de nombres de salida: ${[...new Set(duplicates)].join(', ')}`);
  }

  const acc = {
    rows: [],
    failures: [],
    crashed: false,
    crashMessage: null,
  };

  let browser;
  let playwright = null;
  let serverBefore = null;
  let serverAfter = null;
  let hygiene = null;

  try {
    playwright = await resolvePlaywrightChromium(repoRoot);
    serverBefore = getPortProcessIdentity(PORT);
    if (!serverBefore.found) {
      throw new Error(
        `no hay ningun server escuchando en TCP:${PORT}. Este harness NO levanta servers: ` +
          `arranca el showroom antes (pnpm -C packages/showroom dev) o pasa DS_REFERENCE_CAPTURE_PORT.`,
      );
    }

    const capturesDir = path.join(outDir, CAPTURES_SUBDIR);
    mkdirSync(capturesDir, { recursive: true });
    hygiene = quarantineStaleLeftovers(capturesDir, names);

    const cssCache = new Map();
    browser = await playwright.chromium.launch();

    for (const entry of plan) {
      const outPath = path.join(capturesDir, entry.outName);
      try {
        acc.rows.push(
          await captureOne(browser, {
            ground: entry.ground,
            capture: entry.capture,
            width: entry.width,
            outPath,
            channels,
            cssCache,
          }),
        );
      } catch (error) {
        acc.failures.push(
          `[${entry.capture.id}/${entry.ground.routeSegment}/${entry.width}] ${String(error.message ?? error)}`,
        );
      }
    }

    serverAfter = getPortProcessIdentity(PORT);
  } catch (error) {
    acc.crashed = true;
    acc.crashMessage = error?.stack || String(error);
  } finally {
    try {
      await browser?.close();
    } catch {
      /* ya cerrado */
    }
  }

  const serverDrift =
    serverBefore && serverAfter
      ? compareServerIdentity(serverBefore, serverAfter)
      : { stable: false, reasons: ['no se pudo tomar la identidad del server en ambos extremos'] };

  const activeTiers = [...new Set(matrixCaptures.map((c) => c.tier))].sort();
  const moverTiers = [
    ...new Set(
      matrixCaptures
        .filter((c) => c.carriers.some((carrier) => carrier.tone === 'success'))
        .map((c) => c.tier),
    ),
  ].sort();

  const pass =
    !acc.crashed && acc.failures.length === 0 && serverDrift.stable && acc.rows.length === plan.length;

  const receipt = {
    schemaVersion: SCHEMA_VERSION,
    receiptId: `wo-cra-23-F4C-canary-${phase}${selfTest ? '-self-test' : ''}`,
    roundId: 'F4C',
    controlId: 'palette.status-seeds',
    scenarioId: `phase-${phase}`,
    evidenceKind: 'visual-canary-capture-run',
    phase,
    phaseExpectation: PHASE_EXPECTATIONS[phase],
    runMode: selfTest ? 'self-test (matriz reducida; verificacion de mecanica, NO certificacion)' : 'full',
    law:
      'Cada captura asevera, ANTES del obturador: status HTTP 200, readiness exacta por escena, ausencia del ' +
      'caso de fallback de la ruta, ausencia del modo juez, el ground estampado esperado, y la cardinalidad ' +
      'correcta del artifact CSS por ground. El veredicto MOVER exige delta en una PROPIEDAD PINTADA (un canal ' +
      'movido no basta) mas cero delta en geometria/tipografia/motion; el veredicto NO-MOVER exige cero delta ' +
      'en ambos conjuntos. El pixel es la tercera evidencia y su expectativa se deriva de la composicion de ' +
      'carriers de la captura, no se supone por escena.',
    startedAt,
    finishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    commandOrTool: `node packages/showroom/scripts/f4c-canary-capture.mjs ${process.argv.slice(2).join(' ')}`,
    toolVersion: {
      node: process.version,
      playwright: playwright?.version ?? null,
      playwrightResolvedFrom: playwright?.resolvedFrom ?? null,
    },
    producer: `f4c-canary-capture.mjs@${selfSha.slice(0, 12)}`,
    harnessSelfSha256: selfSha,
    git: { head: gitHead(repoRoot), dirty: gitDirty(repoRoot) },
    baseUrl: BASE,
    port: PORT,
    outDir,
    widths: WIDTHS,
    viewportHeight: VIEWPORT_HEIGHT,
    determinism: {
      reducedMotion: 'reduce',
      settle: 'document.fonts.ready + doble requestAnimationFrame antes de cada obturador',
      screenshot: 'fullPage: true, viewport fijo por ancho',
      why:
        'skeleton.css:48 y spinner.css:73 animan y badge.css:543 pulsa (apagado en :578-585): sin reducedMotion ' +
        'la igualdad byte A<->C/E es imposible sin que exista regresion alguna.',
    },
    sourceFiles: [
      { path: CONTROL_MANIFEST_RELPATH, sha256: sha256(controlManifestRaw) },
      { path: 'packages/showroom/scripts/f4c-canary-capture.mjs', sha256: selfSha },
      /* Las fuentes del ground del lab tambien pineadas: sin ellas la serie no
         puede probar por receipt que el ground fue constante (Fable DEFECT-5,
         auditoria real de cierre 2026-08-30). */
      ...['ground/index.tsx', 'ground/client-only.tsx', 'ground/stamp.ts'].map((rel) => {
        const relPath = `packages/showroom/src/app/probe/ds-reference/${rel}`;
        return { path: relPath, sha256: sha256(readFileSync(path.join(repoRoot, relPath))) };
      }),
    ],
    sourceDigest: sha256Text(`${sha256(controlManifestRaw)}::${selfSha}`),
    controlManifestSha256: sha256(controlManifestRaw),
    controlIngress: controlManifest.ingress ?? null,
    channelsRead: {
      declaredByControl: declaredChannels,
      undeclaredWatched: UNDECLARED_CHANNELS_WATCHED,
      note:
        'los canales se leen sobre el ELEMENTO carrier, no en :root. Un valor color-mix() llega sin resolver ' +
        'desde getPropertyValue: sirve para decidir "se movio o no", nunca como color. La evidencia que decide ' +
        'es la propiedad pintada.',
    },
    declaredPartialPropagation: DECLARED_PARTIAL_PROPAGATION,
    negativeDrill: {
      available: DRILLS,
      howToRun: 'node f4c-canary-capture.mjs --compare <dirA> <dirB> --drill <id> (exit 0 solo si el comparador falla)',
    },
    tierCoverage: {
      measuredOver: 'la matriz activa completa, no la muestra que corrio esta invocacion',
      matrixCaptureIds: matrixCaptures.map((c) => c.id),
      executedCaptureIds: captures.map((c) => c.id),
      activeTiers,
      tiersWithAMover: moverTiers,
      gap:
        moverTiers.includes('pattern')
          ? null
          : 'el tier pattern esta representado solo como NON-MOVER (cockpit info/warning). La fila ' +
            '`patterntimeline` esta declarada y desactivada en CAPTURES; habilitala con ' +
            '--include patterntimeline si el DT quiere un MOVER de tier pattern.',
    },
    serverIdentity: { before: serverBefore, after: serverAfter },
    serverDrift,
    outputHygiene: hygiene,
    plannedRows: plan.length,
    capturedRows: acc.rows.length,
    rows: acc.rows,
    failures: acc.failures,
    crashed: acc.crashed,
    crashMessage: acc.crashMessage,
    pass,
  };

  const receiptPath = path.join(outDir, selfTest ? SELF_TEST_RECEIPT_NAME : RECEIPT_NAME);
  const redacted = redactAbsolutePaths(receipt, [
    [repoRoot, '<repo-root>'],
    [os.homedir(), '<home>'],
  ]);
  try {
    mkdirSync(outDir, { recursive: true });
    atomicWriteJSON(receiptPath, redacted);
  } catch (writeError) {
    process.stderr.write(`[f4c] NO SE PUDO ESCRIBIR EL RECEIPT en ${receiptPath}: ${writeError.message}\n`);
    process.stderr.write(`${JSON.stringify(redacted, null, 2)}\n`);
  }

  process.stdout.write(`receipt: ${receiptPath}\n`);
  process.stdout.write(
    `fase ${phase}: capturadas ${acc.rows.length}/${plan.length}, fallos ${acc.failures.length}, ` +
      `server-estable=${serverDrift.stable}, crash=${acc.crashed}\n`,
  );
  for (const f of acc.failures) process.stdout.write(`  FAIL: ${f}\n`);
  if (acc.crashed) process.stdout.write(`  CRASH: ${acc.crashMessage}\n`);
  for (const r of serverDrift.reasons) process.stdout.write(`  DRIFT: ${r}\n`);

  process.exitCode = pass ? 0 : 1;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.flags.compare) {
    const [dirA, dirB] = args.flags.compare;
    if (!dirA || !dirB) throw new Error('uso: --compare <dirA> <dirB> [--drill <id>]');
    await runCompare(dirA, dirB, args.flags.drill ?? null);
    return;
  }
  if (args.flags.check) {
    const outDir = args.positional[0];
    if (!outDir) throw new Error('uso: f4c-canary-capture.mjs <output-dir> --check');
    runCheck(outDir);
    return;
  }
  await runCapture(args);
}

await main();
