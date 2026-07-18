import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import type { TenantConfig } from '@/foundation/contracts';
import type {
  TenantThemeConfigIdentity,
  TenantThemeDocument,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme';

import { PatternBrandStudio } from '../../../index';
import { PREVIEW_SCOPE_ATTRIBUTE } from '../index';
import {
  DashboardMetricsPreviewFixture,
  FormDetailPreviewFixture,
  ListCollectionPreviewFixture,
  TenantThemePreviewGallery,
} from '../fixtures';

const TEST_TENANT: TenantConfig = {
  slug: 'preview-harness',
  name: 'Preview Harness',
  engine: 'rustic',
  theme: 'light',
  plan: 'enterprise',
  features: ['all'],
  branding: { companyName: 'Preview Harness' },
};

function Harness({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <DesignSystemProvider tenantConfig={TEST_TENANT} forceEngine="rustic" skipCssLoading>
      {children}
    </DesignSystemProvider>
  );
}

/** Product vocabulary the DS ownership law forbids in a generic preview fixture. */
const DOMAIN_VOCABULARY = /candidate|interview|recruiter|\btenant\b|venue|ticket|evnto|bithire/i;

const IDENTITY: TenantThemeConfigIdentity = {
  tenantId: 'tenant_preview',
  slug: 'preview-tenant',
  verticalKey: 'bithire',
  rowVersion: 1,
};

const VALID_DOCUMENT: TenantThemeDocument = {
  schemaVersion: 1,
  mode: 'simple',
  appearance: { palette: { primary: '#2F6B9A' } },
};

const INVALID_DOCUMENT = {
  schemaVersion: 1,
  mode: 'simple',
  appearance: { density: 'ultra' },
} as unknown as TenantThemeDocument;

describe('tenant-theme preview fixtures render without a product concept', () => {
  it('renders the list collection fixture', async () => {
    const { container } = render(
      <Harness>
        <ListCollectionPreviewFixture />
      </Harness>
    );
    expect(await screen.findByText('Records')).toBeInTheDocument();
    expect(screen.getByText('Alpha workspace')).toBeInTheDocument();
    expect(container.textContent ?? '').not.toMatch(DOMAIN_VOCABULARY);
  });

  it('renders the detail-edit form fixture', async () => {
    const { container } = render(
      <Harness>
        <FormDetailPreviewFixture />
      </Harness>
    );
    expect(await screen.findByText('Edit record')).toBeInTheDocument();
    expect(container.textContent ?? '').not.toMatch(DOMAIN_VOCABULARY);
  });

  it('renders the metrics + chart dashboard fixture', async () => {
    const { container } = render(
      <Harness>
        <DashboardMetricsPreviewFixture />
      </Harness>
    );
    expect(await screen.findByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Throughput')).toBeInTheDocument();
    expect(container.textContent ?? '').not.toMatch(DOMAIN_VOCABULARY);
  });

  it('renders the stacked gallery of all three fixtures', async () => {
    const { container } = render(
      <Harness>
        <TenantThemePreviewGallery />
      </Harness>
    );
    expect(await screen.findByText('Records')).toBeInTheDocument();
    expect(screen.getByText('Edit record')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(container.textContent ?? '').not.toMatch(DOMAIN_VOCABULARY);
  });
});

describe('PatternBrandStudio tenant-theme preview composition', () => {
  it('renders the galleries inside the sanitized CMP-02 preview scope for a valid document', async () => {
    const { container } = render(
      <Harness>
        <PatternBrandStudio
          value={{ id: 'p', name: 'Preview', palette: { primaryColor: '#2F6B9A' } }}
          tenantThemePreview={{
            document: VALID_DOCUMENT,
            identity: IDENTITY,
            galleries: () => <TenantThemePreviewGallery />,
          }}
        />
      </Harness>
    );

    await screen.findByText('Tenant theme live preview');

    const scope = container.querySelector(`[${PREVIEW_SCOPE_ATTRIBUTE}='preview-tenant']`);
    expect(scope).not.toBeNull();
    // The fixtures render inside that scope, so the theme re-skins them live.
    expect(within(scope as HTMLElement).getByText('Records')).toBeInTheDocument();

    // A scoped <style> block is injected and anchored to the preview root only.
    const styleText = Array.from(container.querySelectorAll('style'))
      .map((element) => element.textContent ?? '')
      .join('\n');
    expect(styleText).toContain(`[${PREVIEW_SCOPE_ATTRIBUTE}='preview-tenant']`);
  });

  it('surfaces inline issues and renders no preview scope for an invalid document', async () => {
    const { container } = render(
      <Harness>
        <PatternBrandStudio
          value={{ id: 'p', name: 'Preview', palette: { primaryColor: '#2F6B9A' } }}
          tenantThemePreview={{
            document: INVALID_DOCUMENT,
            identity: IDENTITY,
            galleries: () => <TenantThemePreviewGallery />,
          }}
        />
      </Harness>
    );

    await screen.findByText('Tenant theme live preview');
    expect(screen.getByText('Document not valid')).toBeInTheDocument();
    expect(
      container.querySelector(`[${PREVIEW_SCOPE_ATTRIBUTE}='preview-tenant']`)
    ).toBeNull();
  });
});
