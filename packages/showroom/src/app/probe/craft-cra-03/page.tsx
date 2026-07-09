'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Flex,
  Stack,
  Text,
  Button,
  Tooltip,
  PatternGalleryView,
  ShortcutProvider,
  ConnectedCommandPalette,
} from '@rottay/design-system';
import { TenantPaletteSurface, surfaceLabelFor, type SurfaceTenant } from '@/components/state-gallery';

// ---------------------------------------------------------------------------
// Keyboard-first interaction model evidence surface (WO-CRA-03)
//
// Proves, on a real tenant palette:
//   - Roving tabindex across PatternGalleryView cards (Tab enters the group
//     once; arrows move within it; the focus ring must be VISIBLE)
//   - Opt-in j/k/x/enter collection shortcuts, scoped to this gallery only
//     (never global -- see hooks/shortcuts ShortcutDefinition.scope)
//   - A Tooltip rendering a bound shortcut hint (`shortcut` prop)
//   - The "Keyboard shortcuts" cheatsheet, reachable from the command
//     palette ("?" or via the palette's own search)
// One tenant per load (html-anchored palette); capture ?tenant=rottay (dark)
// and ?tenant=bithire (light).
// ---------------------------------------------------------------------------

const TENANTS: SurfaceTenant[] = ['rottay', 'bithire', 'evnto'];

function sanitizeTenant(raw: string | null): SurfaceTenant {
  return raw && (TENANTS as string[]).includes(raw) ? (raw as SurfaceTenant) : 'rottay';
}

const MUTED = 'var(--ds-color-text-muted)';
const SECONDARY = 'var(--ds-color-text-secondary)';

function SectionShell({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Stack spacing="sm" fullWidth>
      <Stack spacing="xs">
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
        {hint && (
          <Text size="xs" style={{ display: 'block', color: MUTED }}>
            {hint}
          </Text>
        )}
      </Stack>
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

// --- Roving tabindex + opt-in j/k/x/enter, on a real PatternGalleryView -----

interface DemoPhoto {
  id: string;
  url: string;
  title: string;
}

const DEMO_PHOTOS: DemoPhoto[] = [
  { id: 'card-1', url: '', title: 'Card one' },
  { id: 'card-2', url: '', title: 'Card two' },
  { id: 'card-3', url: '', title: 'Card three' },
  { id: 'card-4', url: '', title: 'Card four' },
];

function GalleryKeyboardProbe() {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [lastOpened, setLastOpened] = useState<string | null>(null);

  return (
    <Stack spacing="md">
      <Text size="sm" style={{ color: SECONDARY }}>
        Click a card, then use Tab (enters the group once), Arrow keys (move within
        it), <code>j</code>/<code>k</code> (next/previous, opt-in), <code>x</code>{' '}
        (toggle selection), and <code>Enter</code> (open). The focus ring must stay
        visible at every step.
      </Text>
      <PatternGalleryView<DemoPhoto>
        data={DEMO_PHOTOS}
        imageField="url"
        captionField="title"
        rowKey="id"
        columns={4}
        minColumnWidth={140}
        aspectRatio="4/3"
        selectable
        selectedKeys={selectedKeys}
        onSelectionChange={(keys) => setSelectedKeys(keys)}
        onItemClick={(item) => setLastOpened(item.title)}
        collectionShortcuts
      />
      <Flex gap={16} wrap="wrap">
        <Text size="xs" style={{ color: MUTED }}>
          Selected: {selectedKeys.length ? selectedKeys.join(', ') : 'none'}
        </Text>
        <Text size="xs" style={{ color: MUTED }}>
          Last opened: {lastOpened ?? 'none'}
        </Text>
      </Flex>
    </Stack>
  );
}

// --- Tooltip shortcut hint ---------------------------------------------------

function TooltipShortcutProbe() {
  const [visible, setVisible] = useState(true);

  return (
    <Stack spacing="md">
      <Text size="sm" style={{ color: SECONDARY }}>
        The Tooltip primitive's new <code>shortcut</code> prop renders formatted key
        chips (via <code>formatShortcutKey</code>) alongside the content. Shown open by
        default for capture.
      </Text>
      <Flex gap={16} align="center">
        <Tooltip content="Open command palette" shortcut="mod+k" visible={visible} placement="bottom">
          <Button variant="secondary" onClick={() => setVisible((v) => !v)}>
            Hover or focus me
          </Button>
        </Tooltip>
      </Flex>
    </Stack>
  );
}

// --- Palette-opened cheatsheet ------------------------------------------------

function CommandPaletteProbe() {
  return (
    <ShortcutProvider>
      <Stack spacing="md">
        <Text size="sm" style={{ color: SECONDARY }}>
          Press <code>?</code> (or open the palette with <code>Cmd/Ctrl+K</code> and
          search "keyboard shortcuts") to open the cheatsheet, populated from every
          registered command AND scoped shortcut on this page -- including the
          gallery's j/k/x/enter above.
        </Text>
        <ConnectedCommandPalette />
      </Stack>
    </ShortcutProvider>
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
              Keyboard-first interaction model · {tenant} · {surfaceLabelFor(tenant)}
            </Text>

            <SectionShell
              label="Roving tabindex + opt-in j/k/x/enter"
              hint="PatternGalleryView with collectionShortcuts enabled"
            >
              <GalleryKeyboardProbe />
            </SectionShell>

            <SectionShell label="Tooltip shortcut hint" hint="Tooltip content + shortcut prop">
              <TooltipShortcutProbe />
            </SectionShell>

            <SectionShell
              label="Cheatsheet reachable from the palette"
              hint="ConnectedCommandPalette -- press ? or Cmd/Ctrl+K"
            >
              <CommandPaletteProbe />
            </SectionShell>
          </Stack>
        </Box>
      </Box>
    </TenantPaletteSurface>
  );
}

export default function CraftCra03EvidencePage() {
  return (
    <Suspense fallback={null}>
      <EvidenceContent />
    </Suspense>
  );
}
