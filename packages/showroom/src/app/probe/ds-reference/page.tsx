/**
 * DS reference lab — index.
 *
 * R1 scope.referenceLab makes `/probe/ds-reference` the only canvas for the
 * canaries. This page is a LINK MATRIX and nothing else: no selectors, no
 * iframes, no scene rendering. Evidence comes from the per-tenant routes at
 * real viewports, so the index must not become a capture surface that could be
 * mistaken for one.
 *
 * WHAT CHANGED AND WHY. The previous version of this file imported
 * `@/components/torture-sections/registry` and embedded
 * `/probe/whitelabel-torture/scenes/*` in a pair of iframes. Three problems,
 * each disqualifying on its own:
 *
 *   1. The evidence did not come from the declared canvas. It came from a
 *      different probe route that no R1 lane owns and this round may not change.
 *   2. That import is a consumption edge into an unowned tree; the lab lane's
 *      declared read set does not cover it.
 *   3. The torture furniture names the tenant on canvas ("Whitelabel torture —
 *      bithire"). Any capture containing that string cannot serve as evidence
 *      for the three-second RECOGNITION test, which is precisely what R1 asks
 *      the lab to prove.
 *
 * The torture harness itself is untouched. This lab simply stops pointing at it.
 */

import Link from 'next/link';

const SCENES = [
  { slug: 'control', label: 'Control — Button + Segmented' },
  { slug: 'field', label: 'Field — Input + Select + FormField' },
  { slug: 'overlay', label: 'Overlay — Popover + Dropdown (contextual layer)' },
  { slug: 'overlay-blocking', label: 'Overlay — Modal + Drawer (blocking layer, combined)' },
  { slug: 'overlay-drawer', label: 'Overlay — Drawer (isolated chamber, unoccluded)' },
  { slug: 'feedback', label: 'Feedback — Alert + Skeleton + Spinner' },
  { slug: 'display-labels', label: 'Display — Avatar + Badge + Tag + Kbd + Tooltip' },
  { slug: 'display-surfaces', label: 'Display — Card + Callout + Empty + Descriptions + Statistic' },
  { slug: 'display-collections', label: 'Display — Table + List + Tree + Timeline + Calendar' },
  { slug: 'display-content', label: 'Display — Typography + MarkdownView + CodeBlock + Image + Carousel + QRCode' },
] as const;

const GROUNDS = [
  { slug: 'bithire', label: 'Ground A', source: 'static BrandTheme' },
  { slug: 'the-management', label: 'Ground B', source: 'published DB document' },
] as const;

export default function DesignSystemReferenceLabIndex() {
  return (
    <main style={{ padding: 32, fontFamily: 'ui-sans-serif, system-ui', lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 18, margin: '0 0 4px' }}>Rottay DS reference lab</h1>
      <p style={{ margin: '0 0 24px', opacity: 0.6, fontSize: 13 }}>
        One hardcoded DS tree under two tenant grounds. No product routes, APIs, fixtures or
        application CSS. Captures are taken from the per-tenant routes below at real viewports.
      </p>

      <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px 16px 6px 0', opacity: 0.5, fontWeight: 500 }}>Scene</th>
            {GROUNDS.map((g) => (
              <th key={g.slug} style={{ textAlign: 'left', padding: '6px 16px 6px 0', opacity: 0.5, fontWeight: 500 }}>
                {g.label}
                <span style={{ display: 'block', fontSize: 11, opacity: 0.7 }}>{g.source}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SCENES.map((scene) => (
            <tr key={scene.slug}>
              <td style={{ padding: '6px 16px 6px 0' }}>{scene.label}</td>
              {GROUNDS.map((ground) => (
                <td key={ground.slug} style={{ padding: '6px 16px 6px 0' }}>
                  <Link href={`/probe/ds-reference/${ground.slug}/${scene.slug}`}>open</Link>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: 24, fontSize: 12, opacity: 0.55, maxWidth: 640 }}>
        The ground labels are deliberately neutral. Tenant identity lives in the URL and in the
        capture receipt, never on canvas — a caption naming the tenant would hand the judge the
        answer to the recognition test.
      </p>

      <h2 style={{ fontSize: 14, margin: '32px 0 4px' }}>Locale axis — BitHire ground only</h2>
      <p style={{ margin: '0 0 12px', opacity: 0.6, fontSize: 13, maxWidth: 640 }}>
        Sibling route segments, not a query param: locale is static per segment (see{' '}
        <code>ground/index.tsx</code>, <code>LabLocale</code>), same reasoning as the tenant
        split above. <code>ar</code> stamps <code>dir=&quot;rtl&quot;</code> on{' '}
        <code>documentElement</code> before hydration — a complete right-to-left document, not a
        wrapper div. Wired for three of the six scenes so far (control, field, feedback).
      </p>
      <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px 16px 6px 0', opacity: 0.5, fontWeight: 500 }}>Scene</th>
            <th style={{ textAlign: 'left', padding: '6px 16px 6px 0', opacity: 0.5, fontWeight: 500 }}>es</th>
            <th style={{ textAlign: 'left', padding: '6px 16px 6px 0', opacity: 0.5, fontWeight: 500 }}>
              ar (RTL)
            </th>
          </tr>
        </thead>
        <tbody>
          {(['control', 'field', 'feedback'] as const).map((scene) => (
            <tr key={scene}>
              <td style={{ padding: '6px 16px 6px 0' }}>{scene}</td>
              <td style={{ padding: '6px 16px 6px 0' }}>
                <Link href={`/probe/ds-reference/bithire-es/${scene}`}>open</Link>
              </td>
              <td style={{ padding: '6px 16px 6px 0' }}>
                <Link href={`/probe/ds-reference/bithire-ar/${scene}`}>open</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
