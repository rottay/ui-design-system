/**
 * Path-segment admission through the public PatternFileManager export.
 *
 * Only Modern renders FileManagerPathSegment crumbs. A segment reaching a
 * frozen engine (forced per instance) or a custom component pack is refused by
 * name in development AND production; a string-only path keeps every route it
 * had. Each refusal is asserted with `onNavigate` never called and the
 * unsupported implementation never receiving the path. The per-instance cases
 * set the `engine` prop against a provider that declares a different engine,
 * so the prop alone decides the route.
 */
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';

import { PatternFileManager } from '..';
import type { FileManagerPathSegment, FileManagerProps } from '..';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import {
  clearCustomRegistry,
  registerCustomComponent,
} from '@/infrastructure/runtime/engines/selection/customization/component-registry';
import { TenantContext } from '@/infrastructure/runtime/tenant/composition/react/provider';
import type { TenantConfig } from '@/foundation/contracts/composition/tenants';

const SEGMENT_PATH: FileManagerPathSegment[] = [
  { id: 'fld_9f2', name: 'Documents' },
  { id: 'fld_a71', name: 'Reports' },
];

const baseProps: FileManagerProps = {
  files: [{ id: 'f1', name: 'q3.pdf', type: 'file', mimeType: 'application/pdf', size: 1024 }],
  folders: [{ id: 'fld_child', name: 'Drafts', type: 'folder' }],
};

const tenant: TenantConfig = {
  slug: 'acme',
  name: 'Acme',
  theme: 'light',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Acme' },
  componentPack: 'acme-pack',
};

const packReceived: FileManagerProps[] = [];

function AcmeFileManager(props: FileManagerProps) {
  packReceived.push(props);
  return <div data-testid="acme-file-manager">{(props.currentPath ?? []).join('/')}</div>;
}

function withTenantPack(defaultEngine: 'custom' | 'modern', children: React.ReactNode) {
  return (
    <EngineProvider defaultEngine={defaultEngine}>
      <TenantContext.Provider value={{ config: tenant, isLoading: false }}>{children}</TenantContext.Provider>
    </EngineProvider>
  );
}

function withCustomPack(children: React.ReactNode) {
  return withTenantPack('custom', children);
}

function withModernProviderAndPack(children: React.ReactNode) {
  return withTenantPack('modern', children);
}

function silenceReactErrors() {
  return vi.spyOn(console, 'error').mockImplementation(() => {});
}

const ENVIRONMENTS = ['development', 'production'] as const;

beforeEach(() => {
  clearCustomRegistry();
  registerCustomComponent('PatternFileManager', AcmeFileManager, 'acme-pack');
});

afterEach(() => {
  cleanup();
  clearCustomRegistry();
  packReceived.length = 0;
  vi.unstubAllEnvs();
});

describe.each(ENVIRONMENTS)('%s', (environment) => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', environment);
  });

  it.each(['classic', 'rustic'] as const)(
    'refuses a segment path on the forced frozen %s engine inside the error boundary',
    async (engine) => {
      const onNavigate = vi.fn();
      const consoleError = silenceReactErrors();
      try {
        render(<PatternFileManager {...baseProps} engine={engine} currentPath={SEGMENT_PATH} onNavigate={onNavigate} />);

        const alert = await screen.findByRole('alert');
        expect(alert).toHaveTextContent(
          `PatternFileManager: the frozen "${engine}" engine renders string breadcrumb paths only`
        );
        expect(screen.queryByText('Documents')).toBeNull();
        expect(screen.queryByText('q3.pdf')).toBeNull();
        expect(onNavigate).not.toHaveBeenCalled();
      } finally {
        consoleError.mockRestore();
      }
    }
  );

  it('refuses a segment path before the pack renders when only the provider declares custom', () => {
    const onNavigate = vi.fn();
    const consoleError = silenceReactErrors();
    try {
      expect(() =>
        render(withCustomPack(<PatternFileManager {...baseProps} currentPath={SEGMENT_PATH} onNavigate={onNavigate} />))
      ).toThrow('PatternFileManager: the custom engine renders a registered component pack');
    } finally {
      consoleError.mockRestore();
    }
    expect(packReceived).toHaveLength(0);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('refuses a mixed path when the engine prop and the provider both select the custom pack', () => {
    const consoleError = silenceReactErrors();
    try {
      expect(() =>
        render(
          withCustomPack(
            <PatternFileManager {...baseProps} engine="custom" currentPath={['Workspace', SEGMENT_PATH[1]]} />
          )
        )
      ).toThrow('PatternFileManager: the custom engine');
    } finally {
      consoleError.mockRestore();
    }
    expect(packReceived).toHaveLength(0);
  });

  it('refuses a segment path when only the engine prop selects custom over a modern provider', () => {
    const onNavigate = vi.fn();
    const consoleError = silenceReactErrors();
    try {
      expect(() =>
        render(
          withModernProviderAndPack(
            <PatternFileManager {...baseProps} engine="custom" currentPath={SEGMENT_PATH} onNavigate={onNavigate} />
          )
        )
      ).toThrow('PatternFileManager: the custom engine renders a registered component pack');
    } finally {
      consoleError.mockRestore();
    }
    expect(packReceived).toHaveLength(0);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('hands a string-only path to the pack when only the engine prop selects custom', async () => {
    render(
      withModernProviderAndPack(
        <PatternFileManager {...baseProps} engine="custom" currentPath={['Workspace', 'Reports']} />
      )
    );

    expect(await screen.findByTestId('acme-file-manager')).toHaveTextContent('Workspace/Reports');
    expect(packReceived[0].currentPath).toEqual(['Workspace', 'Reports']);
  });

  it('renders a segment path on Modern when only the engine prop selects modern over a custom provider', async () => {
    const onNavigate = vi.fn();
    render(
      withCustomPack(
        <PatternFileManager {...baseProps} engine="modern" currentPath={SEGMENT_PATH} onNavigate={onNavigate} />
      )
    );

    const nav = await screen.findByRole('navigation');
    expect(screen.queryByRole('alert')).toBeNull();
    fireEvent.click(within(nav).getByRole('button', { name: 'Documents' }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith('fld_9f2');
    expect(packReceived).toHaveLength(0);
  });

  it('hands a string-only path unchanged to the pack when the provider declares custom', async () => {
    render(withCustomPack(<PatternFileManager {...baseProps} currentPath={['Workspace', 'Reports']} />));

    expect(await screen.findByTestId('acme-file-manager')).toHaveTextContent('Workspace/Reports');
    expect(packReceived[0].currentPath).toEqual(['Workspace', 'Reports']);
  });

  it('renders a segment path on Modern set by the engine prop alone and navigates to the supplied id', async () => {
    const onNavigate = vi.fn();
    render(<PatternFileManager {...baseProps} engine="modern" currentPath={SEGMENT_PATH} onNavigate={onNavigate} />);

    const nav = await screen.findByRole('navigation');
    fireEvent.click(within(nav).getByRole('button', { name: 'Documents' }));
    expect(onNavigate).toHaveBeenCalledWith('fld_9f2');
  });

  it('refuses an empty segment id on Modern inside the error boundary, never as Root', async () => {
    const onNavigate = vi.fn();
    const consoleError = silenceReactErrors();
    try {
      render(
        <PatternFileManager
          {...baseProps}
          engine="modern"
          currentPath={[{ id: '', name: 'Documents' }, SEGMENT_PATH[1]]}
          onNavigate={onNavigate}
        />
      );

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'PatternFileManager: currentPath[0] is a FileManagerPathSegment with an empty `id`'
      );
      expect(screen.queryByRole('navigation')).toBeNull();
      expect(onNavigate).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });
});
