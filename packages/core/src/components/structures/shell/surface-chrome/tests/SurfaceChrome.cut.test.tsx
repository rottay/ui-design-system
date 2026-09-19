/**
 * WO-FAM-11 sub-lot C — the `surface-chrome` cut.
 *
 * The family's three BLOCKING inline paints were one span's flex row; its two
 * consumed-not-stamped parts were the Card's own `root` and `body`, painted by
 * name but never named by this family. Both are asserted at the source, plus
 * the executable accessibility floor the gate requires.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { surfaceChromeChromeDeriver } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/chrome/surface-chrome';

vi.mock('@/components/primitives', () => ({
  Button: ({ children, ...rest }: any) => <button type="button" {...rest}>{children}</button>,
  Card: Object.assign(
    ({ children, ...rest }: any) => <section {...rest}>{children}</section>,
    { Body: ({ children, ...rest }: any) => <div {...rest}>{children}</div> },
  ),
  Flex: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
  Heading: ({ children, ...rest }: any) => <h2 {...rest}>{children}</h2>,
  Stack: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
  Text: ({ children, ...rest }: any) => <span {...rest}>{children}</span>,
}));

const SOURCE = readFileSync(
  resolve(process.cwd(), 'src/components/structures/shell/surface-chrome/index.tsx'),
  'utf8',
);

const SKIN = readFileSync(
  resolve(
    process.cwd(),
    'src/foundation/tokens/css/presentation/components/skin/surface-section-card/index.css',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

describe('SurfaceChrome — the FAM-11 cut', () => {
  it('states the tab label as anatomy, and its row as paint', async () => {
    const { SurfaceTabbedLabel } = await import('..');
    const { container } = render(<SurfaceTabbedLabel view={{ label: 'Open', badge: 4 }} />);

    expect(container.querySelector('[data-part="tab-label"]')).not.toBeNull();
    expect(container.querySelector('[style]')).toBeNull();
    expect(SKIN).toContain(".ds-section-card__tab-label[data-part='tab-label']");
    expect(SKIN).toContain('display: inline-flex;');
  });

  it('names the two parts its skin paints but the Card renders', async () => {
    const { SurfaceSectionCard } = await import('..');
    const { container } = render(
      <SurfaceSectionCard title="Section">body</SurfaceSectionCard>,
    );

    // Before: the skin selected `[data-part='root']` and `[data-part='body']`
    // and this family stamped neither, so the two names were painted by an
    // owner that never claimed them.
    expect(container.querySelector('[data-part="root"]')).not.toBeNull();
    expect(container.querySelector('[data-part="body"]')).not.toBeNull();
    expect(SOURCE).toContain('data-part="root"');
    expect(SOURCE).toContain('data-part="body"');
  });

  it('keeps the section heading operable for assistive technology', async () => {
    const { SurfaceSectionCard } = await import('..');
    render(
      <SurfaceSectionCard title="Billing" titleHeadingLevel={3} description="Plans and invoices">
        body
      </SurfaceSectionCard>,
    );

    // The section is announced as a heading at the level the caller chose, so
    // a screen-reader rotor can reach it; the description is not a heading.
    const heading = screen.getByRole('heading', { name: 'Billing' });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText('Plans and invoices').tagName).not.toMatch(/^H[1-6]$/);
  });

  it('produces its own namespace and routes the shared tile group', () => {
    expect([...surfaceChromeChromeDeriver.produces].sort()).toEqual([
      '--ds-section-card-eyebrow-tracking',
      '--ds-section-card-header-min-height',
      '--ds-section-card-icon-size',
      '--ds-section-card-tab-label-gap',
    ]);
    // Read here, owned by the workspace-card group that `cockpit-header`,
    // `workbench-header` and `page-shell` read with the same fallbacks.
    expect(SKIN).toContain('--ds-workspace-card-icon-bg,');
    expect(surfaceChromeChromeDeriver.produces).not.toContain('--ds-workspace-card-icon-bg');
  });
});
