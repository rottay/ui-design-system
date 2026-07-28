'use strict';
const fs=require('fs');
const B='/private/tmp/rottay-design-platform-independent-audit-round-3/';
const C=JSON.parse(fs.readFileSync(B+'classification.json','utf8'));

C.reachability.evidence = {
  method: 'Bounded greps over app source trees plus the DS runtime that stamps the root attribute. All paths absolute, read-only.',
  greps: [
    { scope: '/Users/daniel/Developer/Rottay/app-evnto/src (*.ts,*.tsx) for data-theme|dataTheme', hits: 7, decisive: [
      { fileLine: 'app-evnto/src/app/layout.tsx:79', text: 'data-theme={serverTheme} on <html>, plus className={serverTheme==="dark"?"dark":undefined}' },
      { fileLine: 'app-evnto/src/app/layout.tsx:89', text: 'pre-paint script setting data-theme from prefers-color-scheme -- rendered ONLY when configuredTheme==="auto"' },
      { fileLine: 'app-evnto/src/core/lib/tenancy/runtime-tenant-theme/ssr/index.ts:53-58', text: "configuredTheme = runtimeTheme ? (theme==='dark'||theme==='auto' ? theme : 'light') : 'base'; serverTheme='light'; if base -> 'base'; if dark -> 'dark'. runtimeTheme is null for bundled evnto (layout.tsx:71 skips getTenantBranding for bundled tenants), so serverTheme='base'." } ] },
    { scope: '/Users/daniel/Developer/Rottay/app-platform/src (*.ts,*.tsx) for data-theme|dataTheme', hits: 1, decisive: [
      { fileLine: 'app-platform/src/app/layout.tsx:100', text: 'pre-paint script READS localStorage "ds-theme-preference" and sets data-theme if present. <html> itself carries data-tenant only -- no data-theme, no theme class.' } ] },
    { scope: 'monorepo-wide (*.ts,*.tsx,*.js, excluding node_modules/dist/.next/build) for "ds-theme-preference"', hits: 4, decisive: [
      { fileLine: 'app-platform/src/app/layout.tsx:100', text: 'READ only' },
      { fileLine: 'app-evnto/tests/unit/theme-source/index.test.ts:354', text: 'localStorage.setItem in a UNIT TEST -- the only writer in the repo' },
      { fileLine: '.tmp/docs-bundle-fixture/src/app/layout.tsx:100 and .tmp/docs-bundle-production-fixture/src/app/layout.tsx:97', text: 'build fixtures, READ only' } ],
      conclusion: 'No production code path ever writes ds-theme-preference, so the app-platform boot script can never set data-theme from it.' },
    { scope: '/Users/daniel/Developer/Rottay/app-platform/src for setTheme|useTheme|ThemeToggle|toggleTheme', hits: 0, conclusion: 'app-platform ships no theme switcher.' },
    { scope: '/Users/daniel/Developer/Rottay/app-bithire/src for data-theme|dataTheme|forceTheme', hits: 2, decisive: [
      { fileLine: 'app-bithire/src/core/hooks/runtime-tenant-theme/index.ts:92', text: 'comment: "The DS remains responsible for resolving and stamping data-theme."' },
      { fileLine: 'app-bithire/src/app/layout.tsx:170', text: 'comment describing the single DS projection of root attributes' } ],
      conclusion: 'app-bithire writes no data-theme itself; it delegates to the DS projection. It therefore does NOT "pin data-theme=light" as the guardrails banner claims.' },
    { scope: 'DS runtime root-attribute writer', hits: null, decisive: [
      { fileLine: 'ui-design-system/packages/core/src/infrastructure/runtime/theming/composition/react/provider/index.tsx:1105-1135', text: "ThemeProvider layout effect: resolveTheme() returns 'dark'|'light'|'base' then claimRootAttribute(documentElement,'data-theme',resolved), claimRootClass(root,'dark',resolved==='dark'), color-scheme inline style. This is the ONLY runtime writer of data-theme in the DS." },
      { fileLine: 'ui-design-system/packages/core/src/infrastructure/runtime/bootstrap/facade/react/provider/index.tsx:639-644', text: "theme = forceTheme ?? explicitTenantTheme ?? appearance.general.palette.backgroundMode ?? config.theme ?? 'base'; explicitTenantTheme requires config.theme in {light,dark,auto}." },
      { fileLine: 'ui-design-system/packages/core/src/infrastructure/runtime/tenant/foundation/configuration/registry/index.ts:41,66,88', text: "Bundled registry configs: rottay theme:'base', bithire theme:'base', evnto theme:'base'. rottayBrandTheme declares no appearance.backgroundMode." },
      { fileLine: 'app-platform/src/core/providers/tenant-provider/index.tsx:85-95 and core/providers/dashboard-providers/index.tsx:191-205', text: 'DesignSystemProvider is mounted WITHOUT forceTheme; dsTenantConfig is undefined for bundled tenants (isBundledTenant), so the registry config is used.' } ],
      conclusion: "For every bundled first-party tenant the resolved theme is 'base', so the DS stamps data-theme=\"base\" -- neither light nor dark." },
    { scope: 'selector value space across all six snapshot files', hits: 23, conclusion: 'Only "light" and "dark" ever appear as data-theme values in a selector (8x data-theme="dark", 6x data-theme=\'dark\', 7x data-theme=\'light\', 2x data-theme="light"; 16x .dark, 7x .light). Therefore data-theme="base" satisfies exactly the selectors the modelled default state satisfies.' },
    { scope: 'ui-design-system/packages/showroom/src for forceTheme', hits: 20, decisive: [
      { fileLine: 'ui-design-system/packages/showroom/src/components/k1-lane-a/index.tsx:266', text: 'forceTheme="light" together with tenantConfig={...}' },
      { fileLine: 'ui-design-system/packages/showroom/src/app/probe/wl-canary/page.tsx:836', text: 'forceTheme={theme} with a tenant-config switcher' },
      { fileLine: 'ui-design-system/packages/showroom/src/components/K4LaneDProbe.tsx:315', text: 'forceTheme={ground} (light|dark) for BitHire ground truth' } ],
      conclusion: 'The showroom DOES reach light and dark for these tenants; the UNREACHABLE verdicts are scoped to the product shells.' } ],
};

C.rootCauseFindings = {
  'rottay-compiled-block-is-a-dark-palette-emitted-under-a-light-selector': {
    severity: 'P0 -- structural',
    statement: "The rottay compiled BrandTheme block carries the DARK palette but is emitted under a [data-theme='light'] selector, so in the shipped app (data-theme=\"base\") it never applies at all, and in a light state it would paint dark values that only the extension's light block prevents.",
    evidence: {
      compiledSelector: C.verticals.rottay.compiledSelector,
      hardcodedIn: "ui-design-system/packages/core/src/infrastructure/compilers/runtime/tenant-css/artifact-renderer/index.ts:65 -- FIRST_PARTY_ARTIFACT_SPECS entry for rottay sets selector: \"html[data-tenant='rottay'][data-theme='light'], html[data-tenant='rottay'].light\", while the bithire and evnto entries use the plain \"html[data-tenant='<slug>']\".",
      valueProof: 'Of the 267 shared names, 180 compiled values are byte-identical (case-insensitive) to the extension DARK-default block value, versus only 46 identical to the extension LIGHT block value. Spot checks: --ds-sidebar-bg compiled(light)=#0D0D10 vs extension light=#F4F4F3; --ds-modal-bg compiled(light)=#1A1A1E vs extension light=#FFFFFF; --ds-button-primary-bg compiled(light)=#FFFFFF vs extension light=#0A0A0A (inverted pair); --ds-table-row-bg compiled(light)=#0C0C0E vs extension light=#FFFFFF.',
      registryIntent: "registry/index.ts comment for rottay: 'Professional dark IT/AI SaaS aesthetic / Monochrome dark, matte premium' -- confirming the authored BrandTheme is the dark palette.",
    },
    consequence: 'In the reachable (base) state the compiled artifact contributes nothing for these 267 names: the extension is the sole author (category F for every one of them). The 218 value contradictions sit in the unreachable light state (category D), where they are the extension correctly rescuing a mislabelled palette rather than a rogue override.',
  },
  'evnto-extension-drops-the-arabic-font-fallback': {
    severity: 'P1 -- i18n regression in the reachable state',
    statement: 'The evnto extension re-declares the two font-family tokens without the "Noto Sans Arabic" fallback that the compiled block emits, and wins in the shipped state.',
    names: ['--ds-font-family-base', '--ds-font-family-heading'],
    compiled: '\'Inter\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, "Noto Sans Arabic", sans-serif [evnto/index.css:130,132]',
    extension: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif [evnto/_source/extension.css:64,65]",
    consequence: 'Arabic text in evnto falls back to the generic sans-serif instead of the curated Arabic face. These are the ONLY two genuine value contradictions in evnto; the other 4 strict-textual differences are hex letter-case only.',
  },
  'bithire-color-scheme-self-contradiction': {
    severity: 'P2 -- inert today, hand-authored',
    statement: 'Inside the extension, the same selector list declares color-scheme twice with opposite values.',
    declarations: [
      { fileLine: 'bithire/_source/extension.css:376', selector: 'html[data-tenant="bithire"][data-theme="dark"], html[data-tenant="bithire"].dark', value: 'dark' },
      { fileLine: 'bithire/_source/extension.css:647', selector: 'html[data-tenant="bithire"][data-theme="dark"], html[data-tenant="bithire"].dark', value: 'light' } ],
    shippedArtifactCopies: ['bithire/index.css:1417 (dark)', 'bithire/index.css:1688 (light)'],
    category: 'D (contradiction confined to the unreachable dark state), flagged contradiction=true',
    winner: "line 647 ('light') wins by source order at equal specificity -- the CLEAR MODE GUARD deliberately re-lights the shell, so the second declaration is intentional, but the pair reads as a defect and only a comment 7 lines earlier explains it.",
    otherVerticals: 'NOT present in evnto (1 color-scheme declaration, value dark, contradictionCheck.sameSelectorConflicts=[]) and NOT present in rottay (2 declarations, dark for the default block and light for the light block, no same-selector conflict).',
  },
  'bithire-guardrails-banner-states-a-false-premise': {
    severity: 'P2 -- documentation defect',
    statement: 'The guardrails banner asserts "the app pins data-theme=\\"light\\" for bithire, so the light block always applies and the dark blocks never do". app-bithire pins nothing: it delegates root attributes to the DS, which resolves the bundled registry theme \'base\' and stamps data-theme="base".',
    fileLine: 'bithire/_source/extension.css:3391-3406 (banner), corroborated at app-bithire/src/core/hooks/runtime-tenant-theme/index.ts:92',
    consequence: 'The conclusion survives (the dark blocks are indeed never reached) but for a different reason, and there is no [data-theme=\'light\']-gated bithire block at all -- the guard is light-BY-NEGATION (:not([data-theme=dark]):not(.dark)). A maintainer trusting the banner would look for a pin that does not exist.',
  },
};

/* guardrails analysis */
const j = JSON.parse(fs.readFileSync(B + 'bithire-overlap.json', 'utf8'));
const gNames = j.overlapRecords.filter(r => r.extensionDeclarations.some(d => d.sectionTitle === 'BITHIRE PRODUCTION GUARDRAILS (TOKEN REMAP)')).map(r => r.name);
const gCat = {}, gStrict = {};
for (const n of gNames) { const x = C.verticals.bithire.names[n]; gCat[x.final] = (gCat[x.final] || 0) + 1; gStrict[x.finalStrictTextual] = (gStrict[x.finalStrictTextual] || 0) + 1; }
C.guardrailsAnalysis = {
  section: 'BITHIRE PRODUCTION GUARDRAILS (TOKEN REMAP)', sharedNameCount: gNames.length,
  sampleInspected: gNames.length + ' of ' + gNames.length + ' (full section inspected in source, well above the 15 required)',
  finalCategories: gCat, strictTextualCategories: gStrict,
  whatItRemaps: 'It replaces the compiled block\'s baked literals with references to semantic BitHire/DS tokens (--ds-color-primary, --ds-control-*, --ds-surface-*, --ds-radius-*, --ds-premium-card-*). 34 of the 48 change the rendered value; 14 resolve to the identical paint and are pure indirection.',
  hVerdict: 'H-ELIGIBLE, NOT H. The section states a reason and a provenance work order but names no owner and sets no retirement condition. Per the rule, H is not assigned.',
  commentTextVerbatim: [
    'bithire/_source/extension.css:3391-3406 — "BITHIRE PRODUCTION GUARDRAILS (TOKEN REMAP) / Relocated verbatim from app-bithire src/app/globals.css region UX05-R01 (WO-UX-05 stage E). Plain tenant-root scope, appended after every other artifact block so these declarations win by source order over the compiled BrandTheme block above -- mirroring the app, where globals.css loaded after the artifact. The higher-specificity light/dark theme blocks earlier in this file keep their runtime winners for the var names they also declare, exactly as in production today (the app pins data-theme=\\"light\\" for bithire, so the light block always applies and the dark blocks never do). Deliberate exception to the verbatim copy: the two legacy \\"-text\\"-suffixed button ink aliases (primary/secondary) are NOT relocated. ..."',
    'bithire/_source/extension.css:3408-3415 — "BitHire production guardrails. / The imported DS package still contains platform fallback literals for generic tenants. Keep this app on semantic BitHire/DS tokens so controls stay readable in production bundles and button/pill text cannot disappear against light surfaces."',
  ],
  keywordScan: 'Scanned lines 3391-4010 for owner/retire/remove by/TODO/FIXME/expires/deadline/sunset/temporary/until/ticket. Only "WO-" matched (2 occurrences: WO-UX-05, region UX05-R01). No owner, no retirement condition.',
  missingForH: ['named owner (person or team)', 'retirement condition or date', 'a tracking item that closes the compatibility window'],
  names: gNames,
};

/* G analysis */
C.gAnalysis = {
  sharedNames: { count: 0, list: [], note: 'No shared (overlapping) custom-property name carries domain semantics. Every shared name is generic UI vocabulary (color, surface, button, input, card, table, sidebar, modal, breadcrumb, filter-pill, tab, shell-grid, workspace-shell, listing-grid, command-glow) and passes the promote-to-DS test.' },
  borderlineReviewed: ['--ds-command-glow', '--ds-listing-grid-min-card-width', '--ds-workspace-shell-bg/-border/-overlay/-shadow', '--ds-filter-pill-* (9)', '--ds-breadcrumb-* (7)', '--ds-shell-grid-line/-size'],
  borderlineVerdict: 'Product-surface vocabulary, not domain vocabulary: a second product could consume all of these without knowing what a candidate, ticket, or event is. Not G.',
  outsideTheOverlapSet: {
    note: 'Domain-semantic tokens DO exist in these files, but only in the extension-ONLY set, so they fall outside the overlap classification. Reporting them because they are a genuine G-class finding: domain vocabulary living under the shared --ds-* namespace.',
    bithire: { count: 12, list: ['--ds-candidate-hired', '--ds-candidate-hired-text', '--ds-candidate-interview', '--ds-candidate-interview-text', '--ds-candidate-new', '--ds-candidate-new-text', '--ds-candidate-offer', '--ds-candidate-offer-text', '--ds-candidate-rejected', '--ds-candidate-rejected-text', '--ds-candidate-screening', '--ds-candidate-screening-text'] },
    evnto: { count: 21, list: ['--ds-event-cancelled', '--ds-event-cancelled-text', '--ds-event-draft', '--ds-event-draft-text', '--ds-event-ended', '--ds-event-ended-text', '--ds-event-live', '--ds-event-live-text', '--ds-event-published', '--ds-event-published-text', '--ds-evnto-accent-primary', '--ds-evnto-accent-secondary', '--ds-evnto-highlight', '--ds-ticket-available', '--ds-ticket-available-text', '--ds-ticket-pending', '--ds-ticket-pending-text', '--ds-ticket-reserved', '--ds-ticket-reserved-text', '--ds-ticket-sold', '--ds-ticket-sold-text'] },
    rottay: { count: 0, list: [] },
  },
};

/* UNKNOWN list */
const unknowns = {};
for (const [v, d] of Object.entries(C.verticals)) {
  const rows = [];
  for (const n of Object.values(d.names)) {
    for (const s of ['default', 'light', 'dark']) {
      const p = n.perState[s];
      if (p.equality && p.equality.equal === null) rows.push({ name: n.name, state: s, reachable: p.reachable, mode: p.equality.mode, compiled: p.compiledValue, extension: p.extensionValue, detail: p.equality.detail, compiledFileLine: p.compiledFileLine, extensionFileLine: p.extensionFileLine });
    }
  }
  unknowns[v] = { count: rows.length, reachableCount: rows.filter(r => r.reachable).length, rows };
}
C.unknownList = { note: 'resolvedEquality could not be decided: the value is a color-mix()/calc() expression, or one-level var() resolution lands on another var()/expression. These are never converted to a pass -- they stay category B (contradiction) with resolvedEquality UNKNOWN.', perVertical: unknowns };

C.recomputeGuide = {
  scripts: ['scripts/classify/selector-lib.js (selector state-matching + specificity)', 'scripts/classify/resolve.js (effective root map from the shipped index.css via postcss 8.5.10 + one-level var resolution)', 'scripts/classify/classify2.js (the classifier; writes this file)', 'scripts/classify/finalize.js (adds evidence/analysis sections)'],
  howToRecount: 'verticals.<v>.finalCategoryCounts is a tally of verticals.<v>.names[*].final. verticals.<v>.perStateResultCounts.<state> is a tally of names[*].perState.<state>.result. Every name carries compiled.fileLine, every extensionDeclarations[] entry carries fileLine, and each perState entry carries the decisive extensionFileLine plus the equality verdict used.',
};

fs.writeFileSync(B + 'classification.json', JSON.stringify(C, null, 1));
console.log('FINALIZED classification.json ' + (fs.statSync(B + 'classification.json').size / 1048576).toFixed(2) + ' MB');
for (const [v, d] of Object.entries(C.verticals)) console.log(' ' + v + ' final=' + JSON.stringify(d.finalCategoryCounts) + ' strict=' + JSON.stringify(d.finalCategoryCountsStrictTextual) + ' unknown=' + C.unknownList.perVertical[v].count + ' (reachable ' + C.unknownList.perVertical[v].reachableCount + ')');
