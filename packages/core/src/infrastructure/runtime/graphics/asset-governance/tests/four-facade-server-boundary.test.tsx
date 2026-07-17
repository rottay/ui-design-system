import React, { act } from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { BrandMark } from '@/graphics/brand-marks/presentation/brand-mark';
import { CloudServiceMark } from '@/graphics/brand-marks/presentation/cloud-service-mark';
import { Icon } from '@/graphics/icons/presentation/semantic-icon';
import { FeaturePictogram } from '@/graphics/pictograms/presentation/feature-pictogram';

function FourFacadeFixture(): React.ReactElement {
  return (
    <section aria-label="Graphic assets">
      <Icon name="status.secure" label="Secure" data-testid="semantic-icon" />
      <BrandMark name="google" label="Google" data-testid="brand-mark" />
      <CloudServiceMark
        provider="aws"
        service="lambda"
        label="AWS Lambda"
        data-testid="cloud-service-mark"
      />
      <FeaturePictogram
        name="secure-access"
        label="Secure access"
        data-testid="feature-pictogram"
      />
    </section>
  );
}

describe('four-facade server boundary', () => {
  it('server-renders deterministic, class-separated accessible markup', () => {
    const first = renderToString(<FourFacadeFixture />);
    const second = renderToString(<FourFacadeFixture />);

    expect(second).toBe(first);
    expect((first.match(/<svg/g) ?? [])).toHaveLength(4);
    for (const assetClass of [
      'semantic-icon',
      'brand-mark',
      'cloud-service-mark',
      'feature-pictogram',
    ]) {
      expect(first).toContain(`data-asset-class="${assetClass}"`);
    }
    expect(first).toContain('aria-label="Secure"');
    expect(first).toContain('aria-label="Google"');
    expect(first).toContain('aria-label="AWS Lambda"');
    expect(first).toContain('aria-label="Secure access"');
  });

  it('hydrates all four server-rendered facades without replacement or warnings', async () => {
    const element = <FourFacadeFixture />;
    const host = document.createElement('div');
    host.innerHTML = renderToString(element);
    const serverMarkup = host.innerHTML;
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let root: Root | undefined;

    await act(async () => {
      root = hydrateRoot(host, element);
    });

    expect(host.innerHTML).toBe(serverMarkup);
    expect(host.querySelectorAll('svg')).toHaveLength(4);
    expect(
      consoleError.mock.calls.some((call) => /hydrat|mismatch/i.test(String(call[0]))),
    ).toBe(false);

    await act(async () => {
      root?.unmount();
    });
    consoleError.mockRestore();
  });

  it('keeps every facade owner RSC-compatible and free of client-only APIs', () => {
    const ownerPaths = [
      'src/graphics/icons/presentation/semantic-icon/index.tsx',
      'src/graphics/icons/runtime/semantic/create-icon/index.tsx',
      'src/graphics/brand-marks/presentation/brand-mark/index.tsx',
      'src/graphics/brand-marks/presentation/cloud-service-mark/index.tsx',
      'src/graphics/pictograms/presentation/feature-pictogram/index.tsx',
      'src/infrastructure/runtime/graphics/asset-governance/runtime/control/index.ts',
    ];

    for (const ownerPath of ownerPaths) {
      const source = readFileSync(resolve(process.cwd(), ownerPath), 'utf8');
      expect(source, ownerPath).not.toMatch(/^\s*['"]use client['"];?/m);
      expect(source, ownerPath).not.toMatch(/\buse(?:State|Effect|LayoutEffect|InsertionEffect)\b/);
      expect(source, ownerPath).not.toMatch(/\b(?:window|document|navigator|localStorage)\b/);
      expect(source, ownerPath).not.toMatch(/\bimport\s*\(/);
    }
  });
});
