'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  DesignSystemProvider,
  Modal,
  Stack,
  Text,
  useResponsive,
  type TenantConfig,
} from '@rottay/design-system';
import {
  emitTenantThemeArtifactForSsr,
  type MountedThemeStyleElement,
  type TenantThemeArtifact,
} from '@rottay/design-system/server';

export interface FirstPaintStageProps {
  artifact: TenantThemeArtifact;
  /** Exactly what `mountTenantTheme` returned, emitted here and nowhere else. */
  styleElements: readonly MountedThemeStyleElement[];
  tenantConfig: TenantConfig;
  digest: string;
  withModal: boolean;
}

/**
 * The viewport tier the runtime published, as a DOM fact.
 *
 * `hasResolvedViewport` is reported beside it on purpose: a desktop tier that
 * only appears once the browser has answered matchMedia is a post-hydration
 * correction, not a first paint, and the two are indistinguishable from the
 * tier alone.
 */
function ViewportWitness() {
  const { deviceClass, hasResolvedViewport } = useResponsive();
  return (
    <output
      data-testid="fp-device-class"
      data-device-class={deviceClass}
      data-resolved={hasResolvedViewport ? 'true' : 'false'}
    >
      {deviceClass}
    </output>
  );
}

/**
 * A box whose geometry is a function of the published tier, and of nothing
 * else — no media query, no container query, no effect.
 *
 * That is what makes it a detector rather than a decoration: if the server had
 * published the mobile-first baseline, this element would paint at one width
 * and then jump to the other the moment the browser's real snapshot arrived.
 */
function LayoutSentinel() {
  const { isDesktop } = useResponsive();
  return (
    <div
      data-testid="fp-sentinel"
      data-width-source={isDesktop ? 'desktop' : 'narrow'}
      style={{ width: isDesktop ? 480 : 240, height: 64, background: 'var(--ds-color-primary)' }}
    />
  );
}

/** `false` in the served bytes, `true` only after a commit. */
function HydrationWitness() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return (
    <output data-testid="fp-hydrated" data-hydrated={hydrated ? 'true' : 'false'}>
      {hydrated ? 'hydrated' : 'server'}
    </output>
  );
}

export function FirstPaintStage({
  artifact,
  styleElements,
  tenantConfig,
  digest,
  withModal,
}: FirstPaintStageProps) {
  // The receipt is re-minted here rather than carried from the page: it is
  // provenance admitted by module-private identity, and the copy that crosses
  // the flight boundary is a different object in a different module realm.
  const emission = emitTenantThemeArtifactForSsr(artifact, {
    slug: artifact.slug,
    verticalKey: artifact.verticalKey,
  });

  return (
    <>
      {/* Outside the provider on purpose: the provider resolves during its own
          render, so an artifact mounted as a child is invisible to the proof
          that admits it. */}
      {styleElements.map((element) => (
        <style
          key={element.id}
          {...element.attributes}
          data-testid="fp-artifact-style"
          dangerouslySetInnerHTML={{ __html: element.css }}
        />
      ))}
      <DesignSystemProvider
        forceEngine="modern"
        forceTheme="light"
        tenantConfig={tenantConfig}
        visualAuthority={{
          authority: 'compiled-artifact',
          artifact,
          ssrReceipt: emission.receipt,
        }}
        locale="en"
        // The same tier the mount projected. The attribute is for CSS; the
        // runtime takes the hint as a prop, because a value read back off
        // <html> is undefined on a server and defined during hydration.
        ssrViewport="desktop"
      >
        <Box data-testid="fp-stage" data-ds-root="" padding="lg">
          <Stack spacing="sm">
            <Text size="xs" color="muted">{digest}</Text>
            <ViewportWitness />
            <HydrationWitness />
            <LayoutSentinel />
          </Stack>
        </Box>
        {withModal ? (
          <Modal open adaptiveFullscreen title="First paint" onClose={() => undefined}>
            <Text size="sm">The posture of this dialog is the F-20 witness.</Text>
          </Modal>
        ) : null}
      </DesignSystemProvider>
    </>
  );
}
