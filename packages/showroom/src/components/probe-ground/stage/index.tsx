'use client';

import { createContext, useContext, useMemo, type ComponentProps, type ReactNode } from 'react';
import { DesignSystemProvider, getKnownTenantConfig, type TenantConfig } from '@rottay/design-system';
import {
  emitTenantThemeArtifactForSsr,
  type MountedThemeStyleElement,
  type TenantThemeArtifact,
} from '@rottay/design-system/server';

type ProviderProps = ComponentProps<typeof DesignSystemProvider>;

/** What the client half proved against the server half; `null` for a code-owned vertical. */
export interface GroundProof {
  readonly bytesAgree: boolean | null;
  readonly digest: string | null;
}

const GroundProofContext = createContext<GroundProof>({ bytesAgree: null, digest: null });

export function useGroundProof(): GroundProof {
  return useContext(GroundProofContext);
}

export interface GroundStageProps {
  readonly vertical: Parameters<typeof getKnownTenantConfig>[0];
  readonly mode: 'light' | 'dark';
  readonly locale: ProviderProps['locale'];
  readonly viewport?: ProviderProps['ssrViewport'];
  /** `null` resolves the vertical's own registered config. */
  readonly tenantConfig: TenantConfig | null;
  /** The artifact the server mounted; `null` for a code-owned vertical. */
  readonly artifact: TenantThemeArtifact | null;
  /** Exactly what `mountTenantTheme` returned, emitted here and nowhere else. */
  readonly styleElements: readonly MountedThemeStyleElement[];
  readonly styleTestId?: string;
  readonly children?: ReactNode;
}

export function GroundStage({
  vertical,
  mode,
  locale,
  viewport,
  tenantConfig,
  artifact,
  styleElements,
  styleTestId,
  children,
}: GroundStageProps) {
  // Re-minted, not carried: a receipt is admitted by module-private identity, so the copy
  // that crossed the flight boundary would be refused.
  const emission = artifact
    ? emitTenantThemeArtifactForSsr(artifact, { slug: artifact.slug, verticalKey: artifact.verticalKey })
    : null;
  const bytesAgree = emission ? emission.css === styleElements[0]?.css : null;
  const digest = artifact?.digest ?? null;
  const proof = useMemo<GroundProof>(() => ({ bytesAgree, digest }), [bytesAgree, digest]);

  return (
    <>
      {/* Outside the provider: it resolves during its own render, before any child commits. */}
      {styleElements.map((element) => (
        <style
          key={element.id}
          {...element.attributes}
          data-testid={styleTestId}
          dangerouslySetInnerHTML={{ __html: element.css }}
        />
      ))}
      <DesignSystemProvider
        forceEngine="modern"
        forceTheme={mode}
        tenantConfig={tenantConfig ?? getKnownTenantConfig(vertical)}
        visualAuthority={
          artifact && emission
            ? { authority: 'compiled-artifact', artifact, ssrReceipt: emission.receipt }
            : undefined
        }
        locale={locale}
        {...(viewport ? { ssrViewport: viewport } : {})}
      >
        <GroundProofContext.Provider value={proof}>{children}</GroundProofContext.Provider>
      </DesignSystemProvider>
    </>
  );
}
