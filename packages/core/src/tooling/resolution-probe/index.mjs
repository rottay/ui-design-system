/**
 * @fileoverview resolution-probe — what the browser actually paints.
 *
 * Every other measuring instrument in this repository measures REACHABILITY:
 * does a chain connect a tenant's decision to a CSS property. This one measures
 * RESOLUTION: what value the browser puts on that property. A channel can be
 * perfectly connected and paint the wrong colour; a dial can score as connected
 * and move nothing. Every defect this programme cares about lives in that gap.
 *
 * It runs on static HTML fixtures, the shipped CSS, and a headless browser
 * reading `getComputedStyle`. No app, no dev server, no framework, no port.
 *
 * This module re-exports the library surface so a caller has one import site.
 * The command is `public/cli/index.mjs`; see `README.md` for invocations.
 */
export { CORE_ROOT, DIST, fromCoreRoot, SRC_CSS, STYLES } from './foundation/paths/index.mjs';
export { declaredProperties, FIXTURE_IDS, FIXTURES, getFixtures, ROSTER_NOTE, validateFixture } from './foundation/roster/index.mjs';
export { ENGINES, rootAttributes, rootAttributesToHtml, rootClassNames, scopeId, THEMES, VERTICAL_KEYS, VERTICALS } from './foundation/scope/index.mjs';
export { BUNDLE_MODES, firstDifferingLine, resolveBundle, sha256 } from './runtime/bundle/index.mjs';
export { launchBrowser, resolvePlaywright } from './runtime/browser/index.mjs';
export { measureScope, readDialWitness, VIEWPORT } from './runtime/measure/index.mjs';
export { ARTIFACT_VERSION, runProbe, serialiseArtifact } from './composition/run/index.mjs';
export { diffArtifacts } from './composition/diff/index.mjs';
