import React, { act } from 'react';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { beforeAll, describe, expect, it, vi } from 'vitest';

interface PackedFacades {
  readonly Icon: React.ElementType;
  readonly BrandMark: React.ElementType;
  readonly CloudServiceMark: React.ElementType;
  readonly FeaturePictogram: React.ElementType;
}

const packageRoot = process.cwd();
const require = createRequire(import.meta.url);

async function importPackedEntry(fileName: string): Promise<Record<string, unknown>> {
  const url = pathToFileURL(resolve(packageRoot, 'dist', fileName)).href;
  return import(/* @vite-ignore */ url) as Promise<Record<string, unknown>>;
}

async function loadEsmFacades(): Promise<PackedFacades> {
  const [icons, brand, cloud, pictograms] = await Promise.all([
    importPackedEntry('icons-full.js'),
    importPackedEntry('marks-brand.js'),
    importPackedEntry('marks-cloud.js'),
    importPackedEntry('pictograms.js'),
  ]);
  return {
    Icon: icons.Icon as React.ElementType,
    BrandMark: brand.BrandMark as React.ElementType,
    CloudServiceMark: cloud.CloudServiceMark as React.ElementType,
    FeaturePictogram: pictograms.FeaturePictogram as React.ElementType,
  };
}

function loadCjsFacades(): PackedFacades {
  const icons = require(resolve(packageRoot, 'dist/icons-full.cjs')) as Record<string, unknown>;
  const brand = require(resolve(packageRoot, 'dist/marks-brand.cjs')) as Record<string, unknown>;
  const cloud = require(resolve(packageRoot, 'dist/marks-cloud.cjs')) as Record<string, unknown>;
  const pictograms = require(resolve(packageRoot, 'dist/pictograms.cjs')) as Record<string, unknown>;
  return {
    Icon: icons.Icon as React.ElementType,
    BrandMark: brand.BrandMark as React.ElementType,
    CloudServiceMark: cloud.CloudServiceMark as React.ElementType,
    FeaturePictogram: pictograms.FeaturePictogram as React.ElementType,
  };
}

function Fixture({ facades }: { facades: PackedFacades }): React.ReactElement {
  const { Icon, BrandMark, CloudServiceMark, FeaturePictogram } = facades;
  return (
    <>
      <Icon name="status.secure" label="Secure" />
      <BrandMark name="google" label="Google" />
      <CloudServiceMark provider="aws" service="lambda" label="AWS Lambda" />
      <FeaturePictogram name="secure-access" label="Secure access" />
    </>
  );
}

describe('packed four-facade certification', () => {
  let esmFacades: PackedFacades;

  beforeAll(async () => {
    esmFacades = await loadEsmFacades();
  });

  it('resolves every facade through an explicit ESM/CJS/types package export', () => {
    const manifest = JSON.parse(
      readFileSync(resolve(packageRoot, 'package.json'), 'utf8'),
    ) as {
      exports: Record<string, { types?: string; import?: string; require?: string }>;
    };

    expect(manifest.exports['./icons/full']).toEqual({
      types: './dist/icons-full.d.ts',
      import: './dist/icons-full.js',
      require: './dist/icons-full.cjs',
    });
    expect(manifest.exports['./marks/brand']).toEqual({
      types: './dist/marks-brand.d.ts',
      import: './dist/marks-brand.js',
      require: './dist/marks-brand.cjs',
    });
    expect(manifest.exports['./marks/cloud']).toEqual({
      types: './dist/marks-cloud.d.ts',
      import: './dist/marks-cloud.js',
      require: './dist/marks-cloud.cjs',
    });
    expect(manifest.exports['./pictograms']).toEqual({
      types: './dist/pictograms.d.ts',
      import: './dist/pictograms.js',
      require: './dist/pictograms.cjs',
    });
  });

  it('server-renders identical class-separated output from packed ESM and CJS', () => {
    const esm = renderToString(<Fixture facades={esmFacades} />);
    const cjs = renderToString(<Fixture facades={loadCjsFacades()} />);

    expect(cjs).toBe(esm);
    expect((esm.match(/<svg/g) ?? [])).toHaveLength(4);
    for (const assetClass of [
      'semantic-icon',
      'brand-mark',
      'cloud-service-mark',
      'feature-pictogram',
    ]) {
      expect(esm).toContain(`data-asset-class="${assetClass}"`);
    }
  });

  it('hydrates the exact packed ESM facades without replacement or mismatch', async () => {
    const element = <Fixture facades={esmFacades} />;
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

  it('imports and resolves all four packed facades under the React server condition', () => {
    const script = [
      "const [icons, brand, cloud, pictograms] = await Promise.all([",
      "  import('./dist/icons-full.js'),",
      "  import('./dist/marks-brand.js'),",
      "  import('./dist/marks-cloud.js'),",
      "  import('./dist/pictograms.js'),",
      ']);',
      'const cases = [',
      "  [icons.Icon, { name: 'action.add', decorative: true }],",
      "  [brand.BrandMark, { name: 'google', decorative: true }],",
      "  [cloud.CloudServiceMark, { provider: 'aws', service: 'lambda', decorative: true }],",
      "  [pictograms.FeaturePictogram, { name: 'secure-access', decorative: true }],",
      '];',
      'for (const [Component, props] of cases) {',
      "  if (typeof Component?.render !== 'function' || Component.render(props, null) == null) {",
      "    throw new Error('packed facade is not callable in the React server condition');",
      '  }',
      '}',
      "process.stdout.write('4/4');",
    ].join('\n');

    const result = execFileSync(
      process.execPath,
      ['--conditions=react-server', '--input-type=module', '--eval', script],
      { cwd: packageRoot, encoding: 'utf8' },
    );

    expect(result).toBe('4/4');
  });
});
