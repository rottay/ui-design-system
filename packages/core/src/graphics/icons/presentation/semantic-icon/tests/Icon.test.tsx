import React, { createRef } from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BriefcaseIcon } from '@phosphor-icons/react/dist/ssr/Briefcase';
import { CompassIcon } from '@phosphor-icons/react/dist/ssr/Compass';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { FingerprintIcon } from '@phosphor-icons/react/dist/ssr/Fingerprint';
import { HandshakeIcon } from '@phosphor-icons/react/dist/ssr/Handshake';
import { KeyIcon } from '@phosphor-icons/react/dist/ssr/Key';
import { LockIcon } from '@phosphor-icons/react/dist/ssr/Lock';
import { MailboxIcon } from '@phosphor-icons/react/dist/ssr/Mailbox';
import { PulseIcon } from '@phosphor-icons/react/dist/ssr/Pulse';
import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

import { ICON_CORPUS, ICON_NAMES, isIconName } from '../../../foundation/contracts/registry';
import type { IconName } from '../../../foundation/contracts/registry';
import { ICON_PROVENANCE } from '../../../foundation/contracts/provenance';
import type { IconProps } from '../../../foundation/contracts/registry/semantic';
import {
  GENERATED_ICON_CORPUS_VERSION,
  GENERATED_ICON_NAMES,
  getGeneratedIconMetadata,
  type GeneratedIconName,
} from '../../../foundation/semantic/corpus/generated';
import { Icon } from '..';

afterEach(() => {
  vi.restoreAllMocks();
});

function svgChildren(markup: string): string {
  return markup.replace(/^<svg[^>]*>|<\/svg>$/g, '');
}

describe('semantic Icon corpus', () => {
  it('publishes the exact generated corpus as the canonical truth', () => {
    const manifest = JSON.parse(
      readFileSync(
        resolve(
          process.cwd(),
          'src/graphics/icons/foundation/semantic/corpus/manifest.json',
        ),
        'utf8',
      ),
    ) as {
      expectedCounts: { global: number };
      entries: ReadonlyArray<{ status: string }>;
    };
    // The manifest is the governed corpus. Assert it agrees with itself
    // before using it to check the generated output, so a hand-edited
    // expectedCounts.global can't silently mask a missing or extra entry.
    expect(manifest.entries).toHaveLength(manifest.expectedCounts.global);
    const manifestStableCount = manifest.entries.filter(
      (entry) => entry.status === 'stable',
    ).length;
    const manifestCandidateCount = manifest.entries.filter(
      (entry) => entry.status === 'candidate',
    ).length;

    expect(ICON_NAMES).toBe(GENERATED_ICON_NAMES);
    expect(ICON_NAMES).toHaveLength(manifest.expectedCounts.global);
    expect(new Set(ICON_NAMES)).toHaveProperty('size', manifest.expectedCounts.global);
    expect(ICON_CORPUS.map(({ name }) => name)).toEqual(GENERATED_ICON_NAMES);
    expect(ICON_CORPUS).toHaveLength(manifest.expectedCounts.global);
    expect(ICON_CORPUS.filter(({ status }) => status === 'stable')).toHaveLength(
      manifestStableCount,
    );
    expect(ICON_CORPUS.filter(({ status }) => status === 'candidate')).toHaveLength(
      manifestCandidateCount,
    );

    for (const entry of ICON_CORPUS) {
      const metadata = getGeneratedIconMetadata(entry.name);
      expect(entry.id).toBe(metadata.id);
      expect(entry.name).toBe(metadata.id);
      expect(entry.role).toBe(metadata.defaultRole);
      expect(entry.status).toBe(metadata.status);
      expect(entry.autoMirror).toBe(metadata.autoMirror);
    }
  });

  it('uses maturity as metadata without narrowing IconName validity', () => {
    expectTypeOf<IconName>().toEqualTypeOf<GeneratedIconName>();
    const candidateProps = {
      name: 'security.alert',
      decorative: true,
    } satisfies IconProps;
    const candidate = ICON_CORPUS.find(({ name }) => name === candidateProps.name);

    expect(candidate?.status).toBe('candidate');
    expect(isIconName(candidateProps.name)).toBe(true);
  });

  it('guards unknown runtime names fail-closed', () => {
    expect(isIconName('bithire.evidence')).toBe(true);
    expect(isIconName('security.alert')).toBe(true);
    expect(isIconName('lucide.Search')).toBe(false);
    expect(isIconName(null)).toBe(false);
  });

  it('server-renders every canonical name without a null adapter', () => {
    for (const name of ICON_NAMES) {
      const html = renderToStaticMarkup(<Icon name={name} decorative />);
      expect(html, name).toContain('<svg');
      expect(html).toContain(`data-icon-name="${name}"`);
    }
  });

  it('maps the v2 additions to their pinned Phosphor SSR glyphs', () => {
    const cases = [
      ['navigation.route', CompassIcon, 'regular'],
      ['bithire.job', BriefcaseIcon, 'duotone'],
      ['bithire.offer', HandshakeIcon, 'duotone'],
    ] as const;

    for (const [name, Glyph, weight] of cases) {
      const semantic = renderToStaticMarkup(<Icon name={name} decorative />);
      const supplier = renderToStaticMarkup(<Glyph weight={weight} />);
      expect(svgChildren(semantic)).toBe(svgChildren(supplier));
    }
  });

  it('maps every v3 addition to its exact pinned Phosphor SSR glyph and role weight', () => {
    const cases = [
      ['action.reveal', EyeIcon, 'regular'],
      ['action.conceal', EyeSlashIcon, 'regular'],
      ['auth.password', LockIcon, 'regular'],
      ['auth.passkey', FingerprintIcon, 'regular'],
      ['auth.sso', KeyIcon, 'regular'],
      ['communication.inbox', MailboxIcon, 'regular'],
      ['status.live', PulseIcon, 'duotone'],
    ] as const;

    for (const [name, Glyph, weight] of cases) {
      const semantic = renderToStaticMarkup(<Icon name={name} decorative />);
      const supplier = renderToStaticMarkup(<Glyph weight={weight} />);
      expect(svgChildren(semantic), name).toBe(svgChildren(supplier));
    }
  });

  it('records pinned supplier provenance without exposing supplier props', () => {
    expect(ICON_PROVENANCE).toEqual({
      corpusVersion: GENERATED_ICON_CORPUS_VERSION,
      supplier: 'Phosphor Icons',
      packageName: '@phosphor-icons/react',
      packageVersion: '2.1.10',
      license: 'MIT',
      rendering: 'local-ssr',
    });
  });
});

describe('semantic Icon accessibility and rendering', () => {
  it('renders a label as title and accessible SVG name', () => {
    render(<Icon name="action.add" label="Add candidate" />);

    const icon = screen.getByRole('img', { name: 'Add candidate' });
    expect(icon).toHaveAttribute('aria-label', 'Add candidate');
    expect(icon).not.toHaveAttribute('aria-hidden');
    expect(icon).toHaveAttribute('focusable', 'false');
    expect(icon.querySelector('title')).toHaveTextContent('Add candidate');
  });

  it('keeps explicitly decorative icons out of the accessibility tree', () => {
    const { container } = render(<Icon name="ai.sparkles" decorative />);
    const icon = container.querySelector('svg');

    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).not.toHaveAttribute('role');
    expect(icon).not.toHaveAttribute('aria-label');
    expect(icon?.querySelector('title')).toBeNull();
  });

  it('fails closed for hostile JavaScript that omits or contradicts accessibility intent', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const UnsafeIcon = Icon as React.ComponentType<Record<string, unknown>>;
    const { container, rerender } = render(<UnsafeIcon name="action.edit" />);

    expect(container.querySelector('svg')).toBeNull();
    rerender(<UnsafeIcon name="action.edit" label="Edit" decorative />);
    expect(container.querySelector('svg')).toBeNull();
    expect(warn).toHaveBeenCalled();
  });

  it('fails closed and warns in development for an unknown name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const UnsafeIcon = Icon as React.ComponentType<Record<string, unknown>>;
    const { container } = render(<UnsafeIcon name="hostile.remote-glyph" decorative />);

    expect(container.querySelector('svg')).toBeNull();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Unknown semantic icon "hostile.remote-glyph"'),
    );
  });

  it('is deterministic in server markup and emits role img only for labels', () => {
    const labeled = renderToString(<Icon name="status.secure" label="Secure" />);
    const decorative = renderToString(<Icon name="status.secure" decorative />);

    expect(labeled).toContain('role="img"');
    expect(labeled).toContain('aria-label="Secure"');
    expect(labeled).toContain('<title>Secure</title>');
    expect(decorative).not.toContain('role="img"');
    expect(decorative).toContain('aria-hidden="true"');
  });

  it('forwards the SVG ref and resolves size tokens', () => {
    const ref = createRef<SVGSVGElement>();
    render(<Icon ref={ref} name="data.gauge" size="xl" decorative />);

    expect(ref.current).toBeInstanceOf(SVGSVGElement);
    expect(ref.current).toHaveAttribute('width', 'var(--ds-icon-xl-size, 2rem)');
    expect(ref.current).toHaveAttribute('height', 'var(--ds-icon-xl-size, 2rem)');
  });

  it('forwards an explicit local color without requiring an inline style map', () => {
    const { container } = render(
      <Icon name="status.error" color="var(--ds-color-error)" decorative />,
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.innerHTML).toContain('var(--ds-color-error)');
  });

  it('publishes resolved role, state, tone, and internal finish as data attributes', () => {
    render(
      <Icon
        name="ai.reasoning"
        role="feature"
        state="active"
        tone="primary"
        data-testid="reasoning-icon"
        decorative
      />,
    );

    expect(screen.getByTestId('reasoning-icon')).toHaveAttribute('data-icon-role', 'feature');
    expect(screen.getByTestId('reasoning-icon')).toHaveAttribute('data-icon-state', 'active');
    expect(screen.getByTestId('reasoning-icon')).toHaveAttribute('data-icon-tone', 'primary');
    expect(screen.getByTestId('reasoning-icon')).toHaveAttribute('data-icon-weight', 'fill');
  });

  it('marks logical directional icons for CSS RTL mirroring without document inspection', () => {
    const { rerender } = render(
      <Icon name="navigation.forward" data-testid="direction" decorative />,
    );
    const icon = screen.getByTestId('direction');

    expect(icon).toHaveAttribute('data-icon-mirrored', 'auto');
    expect(icon).not.toHaveAttribute('transform');

    rerender(<Icon name="navigation.forward" mirrored data-testid="direction" decorative />);
    expect(screen.getByTestId('direction')).toHaveAttribute('data-icon-mirrored', 'true');
    expect(screen.getByTestId('direction')).toHaveAttribute('transform', 'scale(-1, 1)');

    rerender(<Icon name="status.success" mirrored="auto" data-testid="direction" decorative />);
    expect(screen.getByTestId('direction')).toHaveAttribute('data-icon-mirrored', 'false');
    expect(screen.getByTestId('direction')).not.toHaveAttribute('transform');
  });

  it('keeps public props free of supplier types and CSS carries accessibility fallbacks', () => {
    const publicTypes = readFileSync(
      resolve(process.cwd(), 'src/graphics/icons/foundation/contracts/registry/semantic/index.ts'),
      'utf8',
    );
    const publicBarrel = readFileSync(
      resolve(process.cwd(), 'src/entrypoints/icons/index.ts'),
      'utf8',
    );
    const iconCss = readFileSync(
      resolve(process.cwd(), 'src/foundation/tokens/css/presentation/components/semantic-icon.css'),
      'utf8',
    );
    const cssEntrypoints = [
      'src/foundation/tokens/css/facade/entrypoints/styles.css',
      'src/foundation/tokens/css/facade/entrypoints/base.css',
      'src/foundation/tokens/css/presentation/components/index.css',
    ].map((path) => readFileSync(resolve(process.cwd(), path), 'utf8'));

    expect(publicTypes).not.toMatch(/phosphor|IconWeight|Lucide/i);
    expect(publicBarrel).not.toContain("from './adapters'");
    expect(iconCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(iconCss).toContain('@media (forced-colors: active)');
    expect(iconCss).toContain("[data-icon-mirrored='auto']:dir(rtl)");
    expect(iconCss).toContain("[data-icon-name='status.loading']");
    for (const entrypoint of cssEntrypoints) {
      expect(entrypoint).toContain('semantic-icon.css');
    }

    const labeled: IconProps = { name: 'communication.message', label: 'Message' };
    const decorative: IconProps = { name: 'communication.voice', decorative: true };
    expect(labeled.label).toBe('Message');
    expect(decorative.decorative).toBe(true);
  });
});
