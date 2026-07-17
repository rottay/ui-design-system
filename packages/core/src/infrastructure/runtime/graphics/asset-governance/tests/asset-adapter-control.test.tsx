import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BrandMark } from '@/graphics/brand-marks/presentation/brand-mark';
import { CloudServiceMark } from '@/graphics/brand-marks/presentation/cloud-service-mark';
import { resolveMarkRendererDefault } from '@/graphics/brand-marks/runtime/adapters/thesvg-react';
import { Icon } from '@/graphics/icons/presentation/semantic-icon';
import { FeaturePictogram } from '@/graphics/pictograms/presentation/feature-pictogram';
import {
  GRAPHIC_ASSET_PROVIDER_BY_CLASS,
  installGraphicAssetRuntimeControl,
  type GraphicAssetClass,
  type GraphicAssetProvider,
  type GraphicAssetTelemetryEvent,
} from '..';

const disposers: Array<() => void> = [];

function install(
  control: Parameters<typeof installGraphicAssetRuntimeControl>[0],
): void {
  disposers.push(installGraphicAssetRuntimeControl(control));
}

function AssetFixture(): React.ReactElement {
  return (
    <>
      <Icon name="action.add" decorative data-testid="semantic-icon" />
      <BrandMark name="google" decorative data-testid="brand-mark" />
      <CloudServiceMark
        provider="aws"
        service="lambda"
        decorative
        data-testid="cloud-service-mark"
      />
      <FeaturePictogram
        name="candidate-evidence"
        decorative
        data-testid="feature-pictogram"
      />
    </>
  );
}

function renderedClasses(): GraphicAssetClass[] {
  return [
    'semantic-icon',
    'brand-mark',
    'cloud-service-mark',
    'feature-pictogram',
  ].filter((assetClass) => screen.queryByTestId(assetClass) !== null) as GraphicAssetClass[];
}

afterEach(() => {
  cleanup();
  while (disposers.length > 0) disposers.pop()?.();
  vi.restoreAllMocks();
});

describe('graphic asset adapter controls', () => {
  it('keeps all four asset classes enabled by default', () => {
    render(<AssetFixture />);

    expect(renderedClasses()).toEqual([
      'semantic-icon',
      'brand-mark',
      'cloud-service-mark',
      'feature-pictogram',
    ]);
    for (const assetClass of renderedClasses()) {
      expect(screen.getByTestId(assetClass)).toHaveAttribute('data-asset-class', assetClass);
    }
  });

  it.each([
    'semantic-icon',
    'brand-mark',
    'cloud-service-mark',
    'feature-pictogram',
  ] as const)('disables only the %s class', (disabledClass) => {
    install({ disabledClasses: [disabledClass] });
    render(<AssetFixture />);

    expect(screen.queryByTestId(disabledClass)).toBeNull();
    expect(renderedClasses()).toEqual(
      [
        'semantic-icon',
        'brand-mark',
        'cloud-service-mark',
        'feature-pictogram',
      ].filter((assetClass) => assetClass !== disabledClass),
    );
  });

  it.each([
    ['functional-icons', ['brand-mark', 'cloud-service-mark', 'feature-pictogram']],
    ['catalog-marks', ['semantic-icon', 'feature-pictogram']],
    ['product-pictograms', ['semantic-icon', 'brand-mark', 'cloud-service-mark']],
  ] as const)(
    'disables provider %s without conflating its asset classes',
    (disabledProvider, expectedClasses) => {
      install({ disabledProviders: [disabledProvider] });
      render(<AssetFixture />);

      expect(renderedClasses()).toEqual(expectedClasses);
    },
  );

  it('composes and disposes independently owned class and provider switches', () => {
    const releaseBrand = installGraphicAssetRuntimeControl({ disabledClasses: ['brand-mark'] });
    const releaseIcons = installGraphicAssetRuntimeControl({
      disabledProviders: ['functional-icons'],
    });
    disposers.push(releaseBrand, releaseIcons);

    const view = render(<AssetFixture />);
    expect(renderedClasses()).toEqual(['cloud-service-mark', 'feature-pictogram']);

    releaseBrand();
    view.rerender(<AssetFixture />);
    expect(renderedClasses()).toEqual([
      'brand-mark',
      'cloud-service-mark',
      'feature-pictogram',
    ]);

    releaseIcons();
    view.rerender(<AssetFixture />);
    expect(renderedClasses()).toEqual([
      'semantic-icon',
      'brand-mark',
      'cloud-service-mark',
      'feature-pictogram',
    ]);
  });

  it('keeps unrelated class fallbacks alive while another adapter is disabled', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    install({ disabledClasses: ['semantic-icon'] });
    const UnsafeBrandMark = BrandMark as React.ComponentType<Record<string, unknown>>;
    render(
      <>
        <Icon name="action.add" decorative data-testid="semantic-icon" />
        <UnsafeBrandMark
          name="google"
          variant="not-a-variant"
          decorative
          data-testid="brand-fallback"
        />
        <CloudServiceMark
          provider="aws"
          service="lambda"
          size={25}
          decorative
          data-testid="cloud-fallback"
        />
      </>,
    );

    expect(screen.queryByTestId('semantic-icon')).toBeNull();
    expect(screen.getByTestId('brand-fallback')).toHaveAttribute('data-mark-variant', 'color');
    expect(screen.getByTestId('brand-fallback')).toHaveAttribute(
      'data-mark-source-variant',
      'default',
    );
    expect(screen.getByTestId('cloud-fallback')).toHaveAttribute('data-mark-variant', '32');
  });

  it('emits bounded diagnostics with exact class/provider identity', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const events: GraphicAssetTelemetryEvent[] = [];
    install({ onTelemetry: () => { throw new Error('broken sink'); } });
    install({
      disabledClasses: ['brand-mark'],
      onTelemetry: (event) => events.push(event),
    });

    const UnsafeIcon = Icon as React.ComponentType<Record<string, unknown>>;
    const UnsafePictogram = FeaturePictogram as React.ComponentType<Record<string, unknown>>;
    const UnsafeCloud = CloudServiceMark as React.ComponentType<Record<string, unknown>>;
    render(
      <>
        <BrandMark name="google" decorative />
        <UnsafeIcon name="remote.icon" decorative />
        <UnsafePictogram name="candidate-evidence" size={16} decorative />
        <UnsafeCloud provider="gcp" service="lambda" decorative />
      </>,
    );

    expect(events).toEqual([
      {
        code: 'adapter-disabled',
        assetClass: 'brand-mark',
        provider: 'catalog-marks',
        assetKey: 'google',
        outcome: 'dropped',
        disableScope: 'class',
      },
      {
        code: 'unmapped-name',
        assetClass: 'semantic-icon',
        provider: 'functional-icons',
        assetKey: 'remote.icon',
        outcome: 'dropped',
      },
      {
        code: 'invalid-optical-input',
        assetClass: 'feature-pictogram',
        provider: 'product-pictograms',
        assetKey: 'candidate-evidence',
        outcome: 'dropped',
      },
      {
        code: 'unmapped-name',
        assetClass: 'cloud-service-mark',
        provider: 'catalog-marks',
        assetKey: 'gcp:lambda',
        outcome: 'dropped',
      },
    ]);
    expect(events.every(Object.isFrozen)).toBe(true);
  });

  it('publishes one exhaustive, supplier-neutral class-to-provider projection', () => {
    expect(GRAPHIC_ASSET_PROVIDER_BY_CLASS).toEqual({
      'semantic-icon': 'functional-icons',
      'brand-mark': 'catalog-marks',
      'cloud-service-mark': 'catalog-marks',
      'feature-pictogram': 'product-pictograms',
    } satisfies Record<GraphicAssetClass, GraphicAssetProvider>);
  });

  it('normalizes the mark renderer default for both ESM and CJS package shapes', () => {
    const Renderer = React.forwardRef<SVGSVGElement>(function Renderer(_props, ref) {
      return <svg ref={ref} />;
    });

    expect(resolveMarkRendererDefault(Renderer)).toBe(Renderer);
    expect(resolveMarkRendererDefault({ default: Renderer })).toBe(Renderer);
  });
});
