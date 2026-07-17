'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Flex,
  Stack,
  Text,
  Button,
  Spinner,
  Skeleton,
  Toast,
  useDeferredPending,
} from '@rottay/design-system';
import { TenantPaletteSurface, surfaceLabelFor, type SurfaceTenant } from '@/composition/components/state-gallery';

// ---------------------------------------------------------------------------
// Instant-feel choreography evidence surface (WO-CRA-02)
//
// Proves the async-state law on a real tenant palette:
//   - useDeferredPending → no busy indicator under ~150ms, a Spinner past it,
//     a Skeleton past the longer threshold
//   - Button `pending` posture → label/spinner swap with NO width jump
//   - Toast.Undo → countdown ring + Undo action, reduced-motion safe
// One tenant per load (html-anchored palette); capture ?tenant=rottay (dark) and
// ?tenant=bithire (light), plus one pass under emulated prefers-reduced-motion.
// ---------------------------------------------------------------------------

const TENANTS: SurfaceTenant[] = ['rottay', 'bithire', 'evnto'];

function sanitizeTenant(raw: string | null): SurfaceTenant {
  return raw && (TENANTS as string[]).includes(raw) ? (raw as SurfaceTenant) : 'rottay';
}

const MUTED = 'var(--ds-color-text-muted)';
const SECONDARY = 'var(--ds-color-text-secondary)';

function SectionShell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack spacing="sm" fullWidth>
      <Text
        size="xs"
        weight="semibold"
        style={{
          display: 'block',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: SECONDARY,
        }}
      >
        {label}
      </Text>
      <Box
        style={{
          borderRadius: 16,
          border: '1px solid var(--ds-color-border)',
          background: 'var(--ds-color-bg-elevated)',
          padding: 24,
        }}
      >
        {children}
      </Box>
    </Stack>
  );
}

function ReferenceTile({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box
      style={{
        flex: 1,
        minWidth: 180,
        minHeight: 132,
        borderRadius: 12,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-primary)',
        padding: 16,
      }}
    >
      <Text
        size="xs"
        weight="semibold"
        style={{ display: 'block', marginBottom: 12, color: MUTED }}
      >
        {title}
      </Text>
      {children}
    </Box>
  );
}

// --- Async-state law: live region driven by useDeferredPending ---------------

function AsyncRegionProbe() {
  const [isPending, setIsPending] = useState(false);
  const [resolvedLabel, setResolvedLabel] = useState<string | null>(null);
  const { showSpinner, showSkeleton } = useDeferredPending(isPending);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const run = useCallback((label: string, latency: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setResolvedLabel(null);
    setIsPending(true);
    timerRef.current = setTimeout(() => {
      setIsPending(false);
      setResolvedLabel(label);
    }, latency);
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return (
    <Stack spacing="md">
      <Flex gap={10} wrap="wrap">
        <Button size="sm" variant="secondary" onClick={() => run('fast · 120ms', 120)}>
          Fast · 120ms
        </Button>
        <Button size="sm" variant="secondary" onClick={() => run('medium · 320ms', 320)}>
          Medium · 320ms
        </Button>
        <Button size="sm" variant="secondary" onClick={() => run('long · 900ms', 900)}>
          Long · 900ms
        </Button>
      </Flex>

      <Box
        style={{
          minHeight: 132,
          borderRadius: 12,
          border: '1px solid var(--ds-color-border)',
          background: 'var(--ds-color-bg-primary)',
          padding: 16,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {showSkeleton ? (
          <Box style={{ width: '100%' }}>
            <Skeleton active title paragraph={{ rows: 3 }} />
          </Box>
        ) : showSpinner ? (
          <Flex align="center" gap={10}>
            <Spinner size="sm" />
            <Text size="sm" style={{ color: SECONDARY }}>
              Working…
            </Text>
          </Flex>
        ) : resolvedLabel ? (
          <Text size="sm" style={{ color: 'var(--ds-color-text-primary)' }}>
            Resolved: {resolvedLabel}
          </Text>
        ) : (
          <Text size="sm" style={{ color: MUTED }}>
            Idle — run a mutation. A wait under 150ms stays silent here.
          </Text>
        )}
      </Box>
    </Stack>
  );
}

// --- Button pending posture --------------------------------------------------

function PendingButtonProbe() {
  const [pending, setPending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trigger = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPending(true);
    timerRef.current = setTimeout(() => setPending(false), 1400);
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return (
    <Stack spacing="md">
      <Flex gap={16} align="center" wrap="wrap">
        <Button variant="primary" pending={pending} pendingLabel="Saving" onClick={trigger}>
          Save changes
        </Button>
        <Text size="xs" style={{ color: MUTED }}>
          Click → width-stable label/spinner swap
        </Text>
      </Flex>

      <Stack spacing="xs">
        <Text size="xs" weight="semibold" style={{ display: 'block', color: MUTED }}>
          Idle vs pending — identical width
        </Text>
        <Flex gap={16} align="center" wrap="wrap">
          <Button variant="primary">Save changes</Button>
          <Button variant="primary" pending pendingLabel="Saving">
            Save changes
          </Button>
        </Flex>
      </Stack>
    </Stack>
  );
}

// --- Undo-window Toast -------------------------------------------------------

function UndoProbe() {
  const [showUndo, setShowUndo] = useState(true);
  const [status, setStatus] = useState('One row removed');

  return (
    <Stack spacing="md">
      <Flex gap={12} align="center" wrap="wrap">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setStatus('One row removed');
            setShowUndo(true);
          }}
        >
          Delete row
        </Button>
        <Text size="sm" style={{ color: SECONDARY }}>
          {status}
        </Text>
      </Flex>

      {showUndo && (
        <Box>
          <Toast.Undo
            title="Row deleted"
            description="Undo before the window closes."
            duration={6000}
            countdown="ring"
            onUndo={() => {
              setStatus('Restored');
              setShowUndo(false);
            }}
            onClose={() => setShowUndo(false)}
          />
        </Box>
      )}
    </Stack>
  );
}

function EvidenceContent() {
  const searchParams = useSearchParams();
  const tenant = useMemo(() => sanitizeTenant(searchParams.get('tenant')), [searchParams]);

  return (
    <TenantPaletteSurface tenant={tenant}>
      <Box style={{ minHeight: '100vh', padding: 24, background: 'var(--ds-color-bg-primary)' }}>
        <Box style={{ maxWidth: 960, margin: '0 auto' }}>
          <Stack spacing="lg" fullWidth>
            <Text
              size="xs"
              weight="semibold"
              style={{
                display: 'block',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: MUTED,
              }}
            >
              Instant-feel choreography · {tenant} · {surfaceLabelFor(tenant)}
            </Text>

            <SectionShell label="Async-state law · reference states">
              <Flex gap={16} align="stretch" wrap="wrap">
                <ReferenceTile title="< 150ms — silent">
                  <Text size="sm" style={{ color: 'var(--ds-color-text-primary)' }}>
                    Resolved instantly
                  </Text>
                  <Text size="xs" style={{ display: 'block', marginTop: 8, color: MUTED }}>
                    No spinner is shown for a sub-perceptual wait.
                  </Text>
                </ReferenceTile>
                <ReferenceTile title="≥ 150ms — spinner">
                  <Flex align="center" gap={10}>
                    <Spinner size="sm" />
                    <Text size="sm" style={{ color: SECONDARY }}>
                      Working…
                    </Text>
                  </Flex>
                </ReferenceTile>
                <ReferenceTile title="≥ 500ms — skeleton">
                  <Skeleton active paragraph={{ rows: 2 }} />
                </ReferenceTile>
              </Flex>
            </SectionShell>

            <SectionShell label="Async-state law · live timing">
              <AsyncRegionProbe />
            </SectionShell>

            <SectionShell label="Button pending posture">
              <PendingButtonProbe />
            </SectionShell>

            <SectionShell label="Undo-window toast">
              <UndoProbe />
            </SectionShell>
          </Stack>
        </Box>
      </Box>
    </TenantPaletteSurface>
  );
}

export default function CraftCra02EvidencePage() {
  return (
    <Suspense fallback={null}>
      <EvidenceContent />
    </Suspense>
  );
}
