import React, { Suspense } from 'react';
import { describe, expect, it, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

import { mockMatchMedia } from '@tests/support/browser/match-media';
import { DesignSystemProvider } from '../../../../../infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '../../../../../foundation/contracts';
import type { ColumnDef } from '../../../../../foundation/contracts/runtime/components/patterns/core';
import { PatternDataTable } from '..';

type Engine = 'modern' | 'classic' | 'rustic';

interface Row {
  id: string;
  name: string;
  email: string;
}

const rows: Row[] = [
  { id: '1', name: 'Alice', email: 'alice@test.com' },
  { id: '2', name: 'Bob', email: 'bob@test.com' },
];

const columns: ColumnDef<Row>[] = [
  { key: 'name', header: 'Name', accessorKey: 'name', responsive: { phone: 'primary' } },
  { key: 'email', header: 'Email', accessorKey: 'email' },
];

const TEST_TENANT_CONFIG: TenantConfig = {
  slug: 'attribute-order-test',
  name: 'Attribute Order Test',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: ['testing'],
  branding: {
    companyName: 'Attribute Order Test',
  },
};

const SCENES = [
  {
    name: 'phone cards',
    width: 390,
    props: { density: 'compact', className: 'product-mobile-table', style: { backgroundColor: 'rgb(1, 2, 3)' } },
    classes: ['ds-data-table__mobile-root', 'ds-data-table__record-cards', 'ds-data-table__mobile-card-primary'],
  },
  {
    name: 'phone list',
    width: 390,
    props: { adapt: { phone: { presentation: 'list' } } },
    classes: ['ds-data-table__mobile-root', 'ds-data-table__record-list'],
  },
  {
    name: 'desktop toolbar',
    width: 1280,
    props: { toolbar: <span>Toolbar</span> },
    classes: ['ds-data-table__toolbar-stack'],
  },
] as const;

afterEach(() => {
  cleanup();
});

async function renderScene(engine: Engine, scene: (typeof SCENES)[number]) {
  mockMatchMedia(scene.width);
  const view = render(
    <DesignSystemProvider
      tenantConfig={TEST_TENANT_CONFIG}
      forceEngine={engine}
      engineVisual={firstPartyEngineVisual('rottay', engine)}
      skipCssLoading
    >
      <Suspense fallback={<div>Loading...</div>}>
        <PatternDataTable<Row> engine={engine} data={rows} rowKey="id" columns={columns} {...scene.props} />
      </Suspense>
    </DesignSystemProvider>
  );
  await screen.findAllByText('Alice', undefined, { timeout: 5000 });
  if (scene.name === 'desktop toolbar') await screen.findByText('Toolbar');
  return view;
}

function stackElements(container: HTMLElement, className: string) {
  const elements = Array.from(container.querySelectorAll(`.${className}`));
  expect(elements.length, `${className} renders`).toBeGreaterThan(0);
  return elements;
}

describe('PatternDataTable phone and toolbar Stack attributes', () => {
  for (const scene of SCENES) {
    it(`renders the Modern Stack root part first on the ${scene.name}`, async () => {
      const { container } = await renderScene('modern', scene);
      for (const className of scene.classes) {
        for (const element of stackElements(container, className)) {
          expect(element.getAttributeNames()[0], className).toBe('data-part');
          expect(element).toHaveAttribute('data-part', 'root');
          expect(element).toHaveAttribute('data-component', 'stack');
        }
      }
    });

    for (const engine of ['classic', 'rustic'] as const) {
      it(`renders no caller part on the ${engine} ${scene.name}`, async () => {
        const { container } = await renderScene(engine, scene);
        for (const className of scene.classes) {
          for (const element of stackElements(container, className)) {
            expect(element, className).not.toHaveAttribute('data-part');
          }
        }
      });
    }
  }

  it('keeps the caller className, density and style on the phone root', async () => {
    const { container } = await renderScene('modern', SCENES[0]);
    const [root] = stackElements(container, 'ds-data-table__mobile-root');
    expect(root).toHaveClass('product-mobile-table');
    expect(root).toHaveAttribute('data-density', 'compact');
    expect((root as HTMLElement).style.backgroundColor).toBe('rgb(1, 2, 3)');
  });
});
