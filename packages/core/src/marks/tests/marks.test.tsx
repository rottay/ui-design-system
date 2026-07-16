import React, { createRef } from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import openaiCatalog from 'thesvg/openai';
import anthropicCatalog from 'thesvg/anthropic';
import githubCatalog from 'thesvg/github';
import googleCatalog from 'thesvg/google';
import linkedinCatalog from 'thesvg/linkedin';
import instagramCatalog from 'thesvg/instagram';
import xCatalog from 'thesvg/x';
import chromeCatalog from 'thesvg/google-chrome';
import lambdaCatalog from 'thesvg/aws-aws-lambda';
import bedrockCatalog from 'thesvg/aws-amazon-bedrock';
import s3Catalog from 'thesvg/aws-amazon-simple-storage-service';
import rdsCatalog from 'thesvg/aws-amazon-rds';

import {
  BRAND_MARK_NAMES,
  BRAND_MARK_PROVENANCE,
  BRAND_MARK_VARIANTS,
  CLOUD_PROVIDERS,
  CLOUD_SERVICES,
  CLOUD_SERVICE_MARK_PROVENANCE,
  MARK_CATALOG_SOURCE,
  MARK_RENDERER_SOURCE,
  MARK_TRADEMARK_NOTICE,
  MARK_VARIANTS,
  BrandMark,
  CloudServiceMark,
  isBrandMarkName,
  isCloudProvider,
  isCloudService,
  type BrandMarkProps,
  type CloudServiceMarkProps,
} from '../index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const EXPECTED_BRANDS = [
  'openai',
  'anthropic',
  'github',
  'google',
  'linkedin',
  'instagram',
  'x',
  'chrome',
] as const;
const EXPECTED_SERVICES = ['lambda', 'bedrock', 's3', 'rds'] as const;

const RAW_CATALOG_BY_SLUG = {
  openai: openaiCatalog,
  anthropic: anthropicCatalog,
  github: githubCatalog,
  google: googleCatalog,
  linkedin: linkedinCatalog,
  instagram: instagramCatalog,
  x: xCatalog,
  'google-chrome': chromeCatalog,
  'aws-aws-lambda': lambdaCatalog,
  'aws-amazon-bedrock': bedrockCatalog,
  'aws-amazon-simple-storage-service': s3Catalog,
  'aws-amazon-rds': rdsCatalog,
} as const;

describe('mark corpus and SSR boundary', () => {
  it('publishes only the fixed brand and cloud corpora', () => {
    expect(BRAND_MARK_NAMES).toEqual(EXPECTED_BRANDS);
    expect(CLOUD_PROVIDERS).toEqual(['aws']);
    expect(CLOUD_SERVICES).toEqual(EXPECTED_SERVICES);
    expect(MARK_VARIANTS).toEqual(['color', 'mono', 'light', 'dark', 'wordmark']);
    expect(new Set(BRAND_MARK_NAMES).size).toBe(BRAND_MARK_NAMES.length);
    expect(new Set(CLOUD_SERVICES).size).toBe(CLOUD_SERVICES.length);
  });

  it('guards unknown persisted/runtime values fail-closed', () => {
    expect(isBrandMarkName('openai')).toBe(true);
    expect(isBrandMarkName('remote.svg')).toBe(false);
    expect(isCloudProvider('aws')).toBe(true);
    expect(isCloudProvider('gcp')).toBe(false);
    expect(isCloudService('bedrock')).toBe(true);
    expect(isCloudService('unknown')).toBe(false);
  });

  it('renders every registered asset through the server-safe local renderer', () => {
    const html = renderToStaticMarkup(
      <>
        {BRAND_MARK_NAMES.map((name) => <BrandMark key={name} name={name} decorative />)}
        {CLOUD_SERVICES.map((service) => (
          <CloudServiceMark key={service} provider="aws" service={service} decorative />
        ))}
      </>,
    );

    expect((html.match(/<svg/g) ?? [])).toHaveLength(12);
    for (const name of BRAND_MARK_NAMES) expect(html).toContain(`data-mark-name="${name}"`);
    for (const service of CLOUD_SERVICES) {
      expect(html).toContain(`data-mark-service="${service}"`);
    }
    expect(html).not.toMatch(/https?:\/\/[^"']+\.svg/i);
  });
});

describe('mark accessibility and hostile runtime input', () => {
  it('labels informative SVGs and hides explicitly decorative SVGs', () => {
    const { rerender } = render(<BrandMark name="openai" label="OpenAI" />);

    const labeled = screen.getByRole('img', { name: 'OpenAI' });
    expect(labeled).toHaveAttribute('aria-label', 'OpenAI');
    expect(labeled).not.toHaveAttribute('aria-hidden');
    expect(labeled).toHaveAttribute('focusable', 'false');

    rerender(<BrandMark name="openai" decorative />);
    const decorative = document.querySelector('svg');
    expect(decorative).toHaveAttribute('aria-hidden', 'true');
    expect(decorative).not.toHaveAttribute('role');
    expect(decorative).not.toHaveAttribute('aria-label');
    expect(decorative).toHaveAttribute('focusable', 'false');
  });

  it('fails closed for absent, blank, or contradictory accessibility intent', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const UnsafeBrandMark = BrandMark as React.ComponentType<Record<string, unknown>>;
    const { container, rerender } = render(<UnsafeBrandMark name="github" />);

    expect(container.querySelector('svg')).toBeNull();
    rerender(<UnsafeBrandMark name="github" label="   " />);
    expect(container.querySelector('svg')).toBeNull();
    rerender(<UnsafeBrandMark name="github" label="GitHub" decorative />);
    expect(container.querySelector('svg')).toBeNull();
    expect(warn).toHaveBeenCalled();
  });

  it('fails closed for unknown brand, provider, and service values', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const UnsafeBrandMark = BrandMark as React.ComponentType<Record<string, unknown>>;
    const UnsafeCloudMark = CloudServiceMark as React.ComponentType<Record<string, unknown>>;
    const { container, rerender } = render(<UnsafeBrandMark name="cdn-logo" decorative />);

    expect(container.querySelector('svg')).toBeNull();
    rerender(<UnsafeCloudMark provider="gcp" service="lambda" decorative />);
    expect(container.querySelector('svg')).toBeNull();
    rerender(<UnsafeCloudMark provider="aws" service="queue" decorative />);
    expect(container.querySelector('svg')).toBeNull();
    expect(warn).toHaveBeenCalled();
  });
});

describe('brand variant and cloud optical resolution', () => {
  it('publishes a complete fallback matrix and never passes an invalid source variant', () => {
    for (const name of BRAND_MARK_NAMES) {
      expect(Object.keys(BRAND_MARK_VARIANTS[name])).toEqual(MARK_VARIANTS);
      const provenance = BRAND_MARK_PROVENANCE[name];
      const raw = RAW_CATALOG_BY_SLUG[provenance.slug as keyof typeof RAW_CATALOG_BY_SLUG];

      for (const requested of MARK_VARIANTS) {
        const { unmount } = render(
          <BrandMark
            name={name}
            variant={requested}
            data-testid={`${name}-${requested}-exhaustive`}
            decorative
          />,
        );
        const sourceVariant = screen
          .getByTestId(`${name}-${requested}-exhaustive`)
          .getAttribute('data-mark-source-variant');

        expect(Object.keys(raw.variants), `${name}:${requested}`).toContain(sourceVariant);
        unmount();
      }
    }

    const cases = [
      ['openai', 'mono', 'light', 'light'],
      ['linkedin', 'dark', 'color', 'default'],
      ['instagram', 'light', 'mono', 'mono'],
      ['x', 'wordmark', 'mono', 'mono'],
      ['chrome', 'dark', 'mono', 'mono'],
      ['github', 'wordmark', 'wordmark', 'wordmark'],
      ['google', 'color', 'color', 'default'],
      ['google', 'mono', 'mono', 'mono'],
      ['google', 'light', 'mono', 'mono'],
      ['google', 'dark', 'mono', 'mono'],
      ['google', 'wordmark', 'wordmark', 'wordmark'],
    ] as const;

    for (const [name, requested, resolvedVariant, sourceVariant] of cases) {
      const { unmount } = render(
        <BrandMark
          name={name}
          variant={requested}
          data-testid={`${name}-${requested}`}
          decorative
        />,
      );
      const mark = screen.getByTestId(`${name}-${requested}`);
      expect(mark).toHaveAttribute('data-mark-variant', resolvedVariant);
      expect(mark).toHaveAttribute('data-mark-source-variant', sourceVariant);
      unmount();
    }
  });

  it('falls back safely for a hostile public variant', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const UnsafeBrandMark = BrandMark as React.ComponentType<Record<string, unknown>>;
    render(<UnsafeBrandMark name="anthropic" variant="remote" decorative data-testid="mark" />);

    expect(screen.getByTestId('mark')).toHaveAttribute('data-mark-variant', 'color');
    expect(screen.getByTestId('mark')).toHaveAttribute('data-mark-source-variant', 'default');
    expect(warn).toHaveBeenCalled();
  });

  it('maps visual size to the actual AWS 24/40/64/80 optical canvases', () => {
    const { rerender } = render(
      <CloudServiceMark provider="aws" service="lambda" size={24} data-testid="cloud" decorative />,
    );

    expect(screen.getByTestId('cloud')).toHaveAttribute('data-mark-variant', '16');
    rerender(
      <CloudServiceMark provider="aws" service="lambda" size={25} data-testid="cloud" decorative />,
    );
    expect(screen.getByTestId('cloud')).toHaveAttribute('data-mark-variant', '32');
    rerender(
      <CloudServiceMark provider="aws" service="lambda" size={41} data-testid="cloud" decorative />,
    );
    expect(screen.getByTestId('cloud')).toHaveAttribute('data-mark-variant', 'default');
    rerender(
      <CloudServiceMark provider="aws" service="lambda" size={65} data-testid="cloud" decorative />,
    );
    expect(screen.getByTestId('cloud')).toHaveAttribute('data-mark-variant', '64');
    rerender(
      <CloudServiceMark provider="aws" service="lambda" size="xl" data-testid="cloud" decorative />,
    );
    expect(screen.getByTestId('cloud')).toHaveAttribute('data-mark-variant', '32');
  });

  it('forwards refs and lets width/height override the size token', () => {
    const brandRef = createRef<SVGSVGElement>();
    const cloudRef = createRef<SVGSVGElement>();
    render(
      <>
        <BrandMark
          ref={brandRef}
          name="linkedin"
          size="lg"
          width={96}
          height="2rem"
          decorative
        />
        <CloudServiceMark ref={cloudRef} provider="aws" service="s3" size="sm" decorative />
      </>,
    );

    expect(brandRef.current).toBeInstanceOf(SVGSVGElement);
    expect(brandRef.current).toHaveAttribute('width', '96');
    expect(brandRef.current).toHaveAttribute('height', '2rem');
    expect(cloudRef.current).toBeInstanceOf(SVGSVGElement);
    expect(cloudRef.current).toHaveAttribute(
      'width',
      'var(--ds-mark-sm-size, var(--ds-icon-sm-size, 1rem))',
    );
  });
});

describe('mark provenance and supplier boundary', () => {
  it('keeps the public snapshot synchronized with the pinned raw catalog', () => {
    const records = [
      ...Object.values(BRAND_MARK_PROVENANCE),
      ...Object.values(CLOUD_SERVICE_MARK_PROVENANCE),
    ];

    expect(records).toHaveLength(12);
    for (const record of records) {
      const raw = RAW_CATALOG_BY_SLUG[record.slug as keyof typeof RAW_CATALOG_BY_SLUG];
      expect(raw, record.slug).toBeDefined();
      expect({
        slug: record.slug,
        title: record.title,
        license: record.license,
        url: record.url,
      }).toEqual({
        slug: raw.slug,
        title: raw.title,
        license: raw.license,
        url: raw.url,
      });
      expect(record.catalog).toBe(MARK_CATALOG_SOURCE);
      expect(record.renderer).toBe(MARK_RENDERER_SOURCE);
      expect(record.trademarkNotice).toBe(MARK_TRADEMARK_NOTICE);
      expect(record.trademarkNotice).toMatch(/do not grant trademark permission/i);
      expect(Object.isFrozen(record)).toBe(true);
    }
    expect(MARK_CATALOG_SOURCE).toEqual({ packageName: 'thesvg', version: '3.2.6' });
    expect(MARK_RENDERER_SOURCE).toEqual({
      packageName: '@thesvg/react',
      version: '3.2.7',
    });
    expect(BRAND_MARK_PROVENANCE.google).toMatchObject({
      kind: 'brand',
      name: 'google',
      slug: 'google',
      title: 'Google',
      license: 'CC0-1.0',
      url: 'https://www.google.com/',
    });
  });

  it('keeps vendor types and unsafe/raw rendering out of the public API', () => {
    const publicSources = [
      'src/mark-entry.ts',
      'src/marks/index.ts',
      'src/marks/types.ts',
    ].map((path) => readFileSync(resolve(process.cwd(), path), 'utf8')).join('\n');
    const adapter = readFileSync(
      resolve(process.cwd(), 'src/marks/adapters/thesvg-react.tsx'),
      'utf8',
    );
    const imports = [...adapter.matchAll(/from ['"](@thesvg\/react[^'"]*)['"]/g)].map(
      (match) => match[1],
    );

    expect(publicSources).not.toMatch(/@thesvg|OpenaiVariant|AwsAmazon/i);
    expect(imports).toHaveLength(12);
    expect(imports.every((path) => path.startsWith('@thesvg/react/'))).toBe(true);
    expect(imports).not.toContain('@thesvg/react');
    expect(adapter).not.toMatch(/dangerouslySetInnerHTML|<svg[\s>]|https?:\/\/|from ['"]thesvg/i);

    const labeled: BrandMarkProps = { name: 'anthropic', label: 'Anthropic' };
    const decorative: CloudServiceMarkProps = {
      provider: 'aws',
      service: 'bedrock',
      decorative: true,
    };
    expect(labeled.label).toBe('Anthropic');
    expect(decorative.decorative).toBe(true);
  });

  it('ships the minimal forced-colors CSS through all three CSS entrypoints', () => {
    const markCss = readFileSync(
      resolve(process.cwd(), 'src/tokens/css/components/mark.css'),
      'utf8',
    );
    const cssEntrypoints = [
      'src/tokens/css/entrypoints/styles.css',
      'src/tokens/css/foundation/base.css',
      'src/tokens/css/components/index.css',
    ].map((path) => readFileSync(resolve(process.cwd(), path), 'utf8'));

    expect(markCss).toContain('@media (forced-colors: active)');
    expect(markCss).toContain("[data-mark-kind='cloud-service']");
    expect(markCss).toContain("[data-mark-variant='mono']");
    expect(markCss).toContain('forced-color-adjust: none');
    expect(markCss).toContain('forced-color-adjust: auto');
    expect(markCss).not.toMatch(/:dir\(|scaleX\(|animation|transition/);
    for (const entrypoint of cssEntrypoints) expect(entrypoint).toContain('mark.css');
  });
});
