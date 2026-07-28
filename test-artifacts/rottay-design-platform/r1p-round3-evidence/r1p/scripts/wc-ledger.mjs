import { readFileSync, writeFileSync } from 'node:fs';
const C = '/private/tmp/rottay-design-platform-independent-audit-round-3/r1p/closure';
const inv = JSON.parse(readFileSync(`${C}/wc-inv-bithire.json`, 'utf8'));
const byIdx = new Map(inv.regions.map((r) => [r.idx, r]));

const APP1 = 'app-bithire/src/styles/collection-preview-chrome.css';
const APP2 = 'app-bithire/src/styles/detail-editor-chrome.css';
const APP3 = 'app-bithire/src/styles/tenant-component-defaults.css';
const EXT = 'ui-design-system/.../artifacts/bithire/_source/extension.css';

const CASCADE_APP =
  'Extension section is unlayered and sits inside the artifact, which app globals.css imports at line 21 ' +
  'before every other app stylesheet. The drained file is imported immediately after that same line, so it ' +
  'occupies the identical document position; selectors are byte-identical (html[data-tenant="bithire"] kept), ' +
  'so specificity is unchanged. Same specificity + same document position = identical winner for every declaration.';

const D = [
  { idx: 4, dest: 'app-bithire', file: APP1, why: '@keyframes bithire-preview-enter; its only consumer is the preview-rail rule in region 7, which moves with it. No other definition of that name exists in DS or app (grep).', cascade: CASCADE_APP },
  { idx: 5, dest: 'app-bithire', file: APP1, why: 'BitHire collection/table composition: .bithire-data-table-card, .bithire-collection-polish, .bithire-collection-preview*, [data-bithire-preview-focused], plus live DS arms .ds-data-table-card/.ds-collection-enhanced (app-ts 12/1). Product composition, not generic Modern paint.', cascade: CASCADE_APP },
  { idx: 6, dest: 'app-bithire', file: APP1, why: '@supports/@media gating of the same .bithire-collection-polish family as region 5.', cascade: CASCADE_APP },
  { idx: 7, dest: 'app-bithire', file: APP1, why: 'Preview rail + .rt-collection-preview__* panel skin (113 app renders) + .rt-expanded-panel (18) + .bithire-preview-rail-close. Pure product composition.', cascade: CASCADE_APP },
  { idx: 9, dest: 'app-bithire', file: APP1, why: 'Decision-cockpit / lane variants of the same .rt-collection-preview panel + BitHire tooltip z-index policy ([role=tooltip], .rottay-tooltip, .ds-tooltip).', cascade: CASCADE_APP },
  { idx: 10, dest: 'app-bithire', file: APP1, why: 'prefers-reduced-motion zeroing for .rt-collection-preview* — app selectors, so it cannot stay under the governed reduced-motion exception (which is root-level only).', cascade: CASCADE_APP },
  { idx: 11, dest: 'app-bithire', file: APP1, why: 'Responsive layout for the same preview families + .ds-collection-enhanced rail. Feature media/layout.', cascade: CASCADE_APP },
  { idx: 12, dest: 'retired-dead', file: null, why: 'Frozen classic-engine tag vocabulary. app-bithire declares engine:"modern" statically (src/app/layout.tsx:181); antd is imported only under DS ui/**/engines/classic; app-bithire has 0 antd imports. Modern Tag emits "rottay-tag-shell rottay-tag-shell--modern", never bare .rottay-tag (bare is emitted only by Tag/engines/classic and Tag/engines/rustic). Neither arm can appear in a BitHire document.', cascade: 'Rule never matched in a BitHire render; removal cannot change any computed value.' },
  { idx: 13, dest: 'retired-dead', file: null, why: 'Same proof as region 12: .rottay-tag--* (classic/rustic only) + .ant-tag-* (antd, classic engine only).', cascade: 'Never matched; removal inert.' },
  { idx: 14, dest: 'retired-dead', file: null, why: 'Same proof: .ant-tag[style]:hover + .rottay-tag--clickable:hover.', cascade: 'Never matched; removal inert.' },
  { idx: 15, dest: 'app-bithire', file: APP3, partial: true, why: 'Split. .rottay-badge IS live under Modern (Badge/engines/modern/index.tsx:291,366 emit "rottay-badge rottay-badge--modern") -> app. .ant-badge-count / .ant-scroll-number are antd-only (classic engine) -> retired with the region-12 proof. All three arms carried the same single declaration, so dropping the dead arms is provably inert.', cascade: CASCADE_APP },
  { idx: 17, dest: 'app-bithire', file: APP3, why: '.ds-pattern-data-table td/th tabular numerals. The rule is scoped html[data-tenant="bithire"], i.e. one tenant, so it is not generic Modern paint; hoisting it into the Modern table skin would repaint evnto/rottay/platform - a silent visual change C6.9 forbids. Stays BitHire-owned, moves to the app.', cascade: CASCADE_APP },
  { idx: 18, dest: 'retired-dead', file: null, why: '.ant-tooltip .ant-tooltip-inner / .ant-tooltip-arrow::before. antd unreachable under engine:"modern" (region-12 proof). The canonical home for antd tooltip paint already exists and is unaffected: engines/classic/theme.css:624-637 declares the same properties at html[data-tenant] scope for every tenant.', cascade: 'Never matched under Modern; the classic engine keeps its own owner.' },
  { idx: 19, dest: 'DS-extension-kept', file: EXT, partial: true, why: 'Split. Rule 1 (--ds-motion-instant/calm/deliberate: 0ms at html[data-tenant="bithire"]) is exactly the root-level governed reduced-motion emission C6.4 still permits: no app selector, no engine selector, no !important, no descendant arm. KEPT. Rule 2 (.rottay-tag/.ant-tag { transition: none }) existed only to neutralise region 12, which is retired; both arms are dead by the region-12 proof. RETIRED.', cascade: 'Kept rule untouched in place. Retired rule never matched.' },
  { idx: 21, dest: 'split', file: APP3, partial: true, why: 'Split. Rules L3446-L3558 paint .btn-*, .ant-btn-*, .badge, .badge-*, .ds-badge, .ds-btn--*, .bithire-form-section__complete-pill, .bithire-form-required-pill. Token-exact grep over every .ts/.tsx in the DS (excluding tests) and in app-bithire returns ZERO emitters for all of them; Modern Badge emits .rottay-badge and Modern Tag .rottay-tag-shell--modern. RETIRED. The final rule (L3560-L3576, color on the surface family) is live: .ds-rich-card 9 / .ds-surface-card 1 / .ds-surface-panel 3 / .ds-surface-hero 3 / .rt-surface-card 3 / .rt-surface-hero 1 / .bithire-surface-card 4 app renders -> app.', cascade: CASCADE_APP },
  { idx: 22, dest: 'app-bithire', file: APP2, why: 'The [data-bithire-detail-*] inline-editor suite. 96 of its 97 rules already have a twin in app-bithire/src/styles/detail-chrome.css under :root[data-ds-root] (specificity 0,2,0) vs the extension (0,1,1) - the app twin already wins today. 139 declarations differ in value and 27 have no twin, so the extension copy is NOT redundant and is migrated verbatim rather than deleted.', cascade: CASCADE_APP + ' Additionally the app twin at :root[data-ds-root] outranks the moved rule on specificity, so its wins are order-independent and unchanged.' },
  { idx: 23, dest: 'app-bithire', file: APP2, why: '@keyframes rt-detail-floating-toggle-in. app-bithire/src/styles/detail-chrome.css:1446 already defines the same keyframe with identical steps; detail-chrome.css is imported after the drained file, so the app definition stays the last one - the same outcome as today.', cascade: 'Keyframes resolve by document order, not specificity. detail-chrome.css keeps loading after, so the winning @keyframes is the same one as before.' },
  { idx: 24, dest: 'app-bithire', file: APP2, why: 'Advanced-toggle + edit-footer of the same detail suite; 5/7 rules fully shadowed by the detail-chrome twin, 8 declarations differ.', cascade: CASCADE_APP },
  { idx: 25, dest: 'app-bithire', file: APP2, why: 'Responsive layout for the detail suite; 7/11 rules fully shadowed, 2 declarations differ, 2 missing.', cascade: CASCADE_APP },
  { idx: 26, dest: 'app-bithire', file: APP2, why: 'Dictation host/button + tags/workflow-card of the detail suite; 7/10 fully shadowed, 6 differ.', cascade: CASCADE_APP },
  { idx: 27, dest: 'app-bithire', file: APP2, why: '[data-bithire-detail-nav-item] active state; 4 declarations differ from the detail-chrome twin.', cascade: CASCADE_APP },
  { idx: 28, dest: 'app-bithire', file: APP2, why: 'Coverage panel of the detail suite; 5/13 fully shadowed, 13 differ, 6 missing.', cascade: CASCADE_APP },
];

const KEEP = [0, 1, 2, 3, 8, 16, 20];
const entries = [];
for (const k of KEEP) {
  const r = byIdx.get(k);
  entries.push({ region: r.key, idx: k, kind: r.kind, destination: 'DS-extension-kept', file: EXT,
    selectors: r.rules.map((x) => x.selector), rules: r.ruleCount, declarations: r.declCount, important: r.important,
    rationale: 'Root-level semantic capability gap: html[data-tenant="bithire"] custom properties only, owner+retire declared. This is the exception class C6.4 still permits.', cascade: 'Untouched, in place.' });
}
for (const d of D) {
  const r = byIdx.get(d.idx);
  entries.push({ region: r.key, idx: d.idx, kind: r.kind, destination: d.dest, file: d.file, partial: d.partial ?? false,
    selectors: r.rules.map((x) => x.selector), rules: r.ruleCount, declarations: r.declCount, important: r.important,
    appSelectorTokens: r.appTokens, engineSelectorTokens: r.engineTokens,
    rationale: d.why, cascade: d.cascade });
}
const totals = {};
for (const e of entries) {
  const k = e.destination;
  totals[k] ??= { regions: 0, rules: 0, declarations: 0, important: 0 };
  totals[k].regions += 1; totals[k].rules += e.rules; totals[k].declarations += e.declarations; totals[k].important += e.important;
}
writeFileSync(`${C}/phase3-ledger.json`, JSON.stringify({ vertical: 'bithire', generated: new Date().toISOString(), totals, entries }, null, 2));
console.log(JSON.stringify(totals, null, 2));
