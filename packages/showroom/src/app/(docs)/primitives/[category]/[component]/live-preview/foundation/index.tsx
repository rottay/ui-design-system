'use client';

import {
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  AsciiFrame,
  Badge,
  Box,
  CodeBlock,
  CropMarks,
  Flex,
  IconFrame,
  InvertSection,
  Kbd,
  LoadingIndicator,
  MarkdownView,
  Meter,
  NavLink,
  ResizeHandle,
  SemanticSurface,
  Stack,
  Text,
  TextureBackdrop,
  Typewriter,
  VisuallyHidden,
} from '@rottay/design-system';
import { SHOWROOM_SURFACES } from '@/components/playground/tokens/surfaces';

// ---------------------------------------------------------------------------
// Foundation previews
//
// These are shared substrates, so the honest thing to show is the part doing
// its own job -- not a component that happens to embed it.
// ---------------------------------------------------------------------------

function ResizeHandlePreview() {
  const [split, setSplit] = useState(58);
  const railRef = useRef<HTMLDivElement | null>(null);

  const clamp = (next: number) => Math.min(80, Math.max(20, next));

  return (
    <Stack spacing="sm" style={{ width: '100%' }}>
      <Box
        ref={railRef}
        style={{
          display: 'flex',
          width: '100%',
          height: 120,
          borderRadius: 12,
          overflow: 'hidden',
          border: `1px solid ${SHOWROOM_SURFACES.border}`,
        }}
      >
        <Box
          style={{
            flex: `0 0 ${split}%`,
            display: 'grid',
            placeItems: 'center',
            background: SHOWROOM_SURFACES.subtle,
          }}
        >
          <Text size="xs">{Math.round(split)}%</Text>
        </Box>
        {/* The primitive carries semantics and keyboard operation only; the
            geometry, cursor and paint below are the owner's job by contract. */}
        <ResizeHandle
          orientation="vertical"
          arrows="position"
          label="Resize panels"
          min={20}
          max={80}
          value={Math.round(split)}
          valueText={`${Math.round(split)}%`}
          keyShortcuts="ArrowLeft ArrowRight Home End"
          onAdjust={(intent) => {
            setSplit((current) => {
              if (intent === 'minimize') return 20;
              if (intent === 'maximize') return 80;
              return clamp(current + (intent === 'increase' ? 4 : -4));
            });
          }}
          onPointerDown={(event) => {
            const rail = railRef.current;
            if (!rail) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            const bounds = rail.getBoundingClientRect();
            const move = (moveEvent: PointerEvent) => {
              setSplit(clamp(((moveEvent.clientX - bounds.left) / bounds.width) * 100));
            };
            const stop = () => {
              window.removeEventListener('pointermove', move);
              window.removeEventListener('pointerup', stop);
            };
            window.addEventListener('pointermove', move);
            window.addEventListener('pointerup', stop);
          }}
          style={{
            width: 10,
            cursor: 'col-resize',
            background: SHOWROOM_SURFACES.border,
            touchAction: 'none',
          }}
          anatomy={{ 'data-part': 'gutter', 'data-orientation': 'vertical' }}
        />
        <Box
          style={{
            flex: '1 1 auto',
            display: 'grid',
            placeItems: 'center',
            background: SHOWROOM_SURFACES.surface,
          }}
        >
          <Text size="xs">{Math.round(100 - split)}%</Text>
        </Box>
      </Box>
      <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
        Drag the gutter, or focus it and use the arrow keys, Home and End.
      </Text>
    </Stack>
  );
}

function VisuallyHiddenPreview() {
  return (
    <Stack spacing="sm" style={{ width: '100%' }}>
      {/* Nothing here is a mock of the primitive: the skip link really is
          clipped until it takes keyboard focus, and the status line really is
          announced without occupying layout. */}
      {/* NavLink, not Anchor: in this DS `Anchor` is the scroll-spy navigation
          component, so the real in-page link primitive is NavLink. */}
      <VisuallyHidden as="span" focusable>
        <NavLink href="#preview-main">Skip to content</NavLink>
      </VisuallyHidden>
      <Flex align="center" gap={6} wrap="wrap">
        <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
          Press
        </Text>
        <Kbd>Tab</Kbd>
        <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
          — a skip link that is invisible right now becomes visible above this
          line, because it was rendered as focusable.
        </Text>
      </Flex>
      <Box id="preview-main">
        <Flex align="center" gap={8}>
          <Badge variant="success">Synced</Badge>
          <VisuallyHidden>
            Last sync finished 4 minutes ago with no conflicts.
          </VisuallyHidden>
          <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
            The badge above also carries a screen-reader-only sentence that takes
            no visual space at all.
          </Text>
        </Flex>
      </Box>
    </Stack>
  );
}

export const FOUNDATION_PREVIEWS: Record<string, ReactNode> = {
  // -- Foundation --
  'icon-frame': (
    <Flex gap={12} wrap="wrap" align="center">
      <IconFrame icon="action.search" label="Search" variant="subtle" tone="neutral" />
      <IconFrame icon="status.success" label="Passing" variant="filled" tone="success" />
      <IconFrame icon="status.warning" label="Needs review" variant="outline" tone="warning" shape="square" />
      <IconFrame icon="analytics.dashboard" label="Reports" variant="glass" tone="primary" size="lg" />
      <IconFrame icon="action.refresh" decorative loading />
    </Flex>
  ),
  'loading-indicator': (
    <Flex gap={20} wrap="wrap" align="center">
      <LoadingIndicator size="sm" />
      <LoadingIndicator size="md" label="Loading" />
      <LoadingIndicator size="lg" statusLabel="Fetching the next page" />
    </Flex>
  ),
  meter: (
    <Stack spacing="md" style={{ width: '100%', maxWidth: 320 }}>
      <Meter label="Storage used" value={72} format="percent" low={60} high={85} optimum={0} />
      <Meter label="Signal quality" value={4.4} min={0} max={5} format="score" variant="compact" />
      <Meter label="Capacity" value={38} variant="ring" tone="info" />
    </Stack>
  ),
  'resize-handle': <ResizeHandlePreview />,
  'visually-hidden': <VisuallyHiddenPreview />,
  'code-block': (
    <CodeBlock
      title="surface-config.ts"
      language="typescript"
      showLineNumbers
      highlightLines={[3]}
      copyLabel="Copy"
      copiedLabel="Copied"
      code={`export const listConfig = {
  columns,
  pageSize: 25,
  onRowClick: openRecord,
};`}
    />
  ),
  'crop-marks': (
    <CropMarks>
      <Box style={{ padding: 20, minWidth: 200 }}>
        <Stack spacing="xs">
          <Text size="sm" weight="semibold">
            Framed zone
          </Text>
          <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
            The ticks mark the trim edge; they never draw a full border.
          </Text>
        </Stack>
      </Box>
    </CropMarks>
  ),
  'markdown-view': (
    <MarkdownView
      source={`## Release notes

The parser is a **bounded** CommonMark subset, so no parser ships to the page.

- inline \`code\` stays inline
- [links](https://rottay.com) pass through the scheme allowlist

> Anything outside the subset renders as plain text.`}
    />
  ),
  'texture-backdrop': (
    <Flex gap={12} wrap="wrap">
      {(['grain', 'dots', 'hatch', 'graph'] as const).map((pattern) => (
        <TextureBackdrop key={pattern} pattern={pattern}>
          <Box style={{ width: 120, height: 88, display: 'grid', placeItems: 'center' }}>
            <Text size="xs">{pattern}</Text>
          </Box>
        </TextureBackdrop>
      ))}
    </Flex>
  ),
  typewriter: (
    <Stack spacing="sm">
      <Typewriter text="Reveals one character at a time." mode="type" />
      <Typewriter text="Decodes from noise into the final string." mode="decode" />
    </Stack>
  ),
  'ascii-frame': (
    <Stack spacing="md" style={{ width: '100%' }}>
      <AsciiFrame label="SINGLE">
        <Text size="sm">Corner-and-rule framing for ordinary content.</Text>
      </AsciiFrame>
      <AsciiFrame variant="double" label="DOUBLE">
        <Text size="sm">Double rules are reserved for the highest emphasis.</Text>
      </AsciiFrame>
    </Stack>
  ),
  'invert-section': (
    // Two sections, not one: the primitive is the boundary between them, so a
    // single section would show a colored band and prove nothing.
    <Box style={{ width: '100%', borderRadius: 12, overflow: 'hidden' }}>
      <InvertSection surface="paper">
        <Box style={{ padding: 20 }}>
          <Text size="sm" weight="semibold">
            Paper
          </Text>
          <Text size="xs">Full-white surface, dark foreground.</Text>
        </Box>
      </InvertSection>
      <InvertSection surface="ink">
        <Box style={{ padding: 20 }}>
          <Text size="sm" weight="semibold">
            Ink
          </Text>
          <Text size="xs">Full-black surface, light foreground.</Text>
        </Box>
      </InvertSection>
    </Box>
  ),
  'semantic-surface': (
    <Flex gap={12} wrap="wrap">
      {(['panel', 'card', 'inset', 'raised'] as const).map((surfaceRole) => (
        <SemanticSurface key={surfaceRole} surfaceRole={surfaceRole}>
          <Box style={{ padding: 14, minWidth: 108 }}>
            <Text size="xs">{surfaceRole}</Text>
          </Box>
        </SemanticSurface>
      ))}
      {/* `as="button"` carries the real button behavior; `interactive` only
          paints hover/pressed. The label is a span, so nothing invalid nests
          inside the button element. */}
      <SemanticSurface
        surfaceRole="control"
        interactive
        as="button"
        style={{ padding: 14, minWidth: 108, textAlign: 'left' }}
      >
        <Text size="xs">control, interactive</Text>
      </SemanticSurface>
      <SemanticSurface surfaceRole="card" selected emphasis="strong">
        <Box style={{ padding: 14, minWidth: 108 }}>
          <Text size="xs">card, selected</Text>
        </Box>
      </SemanticSurface>
    </Flex>
  ),
};
