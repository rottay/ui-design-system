'use client';

/* Monochrome probe fixtures, lane B: the six content + proof families
   (AsciiDiagram, TerminalBlock, TreeViewConnector, Typewriter, MonoStat,
   ProductWindow).

   `TreeViewConnector`, not `TreeView`: the tree-view family ships two
   presentations, and the engine-dispatched `PatternTreeView` owns a `TreeNode`
   of an entirely different shape. The static connector — the one this fixture
   photographs — is named for what it is.

   ProductWindow is showroom-local: it is the sanctioned color exception, which
   is a marketing-surface concern, so it never re-entered the DS. */

import type { ReactNode } from 'react';
import {
  AsciiDiagram,
  Box,
  Flex,
  InvertSection,
  MonoStat,
  TerminalBlock,
  TreeViewConnector,
  Typewriter,
  type DiagramEdge,
  type DiagramNode,
  type TerminalBlockLine,
  type TreeViewConnectorNode,
} from '@rottay/design-system';
import { ProductWindow } from '@/components/product-window';

// ascii-diagram fixture: a small, real request-flow architecture (emphasis on the gateway node, two edge labels, a bend route) — wide enoug...

const ARCHITECTURE_NODES: DiagramNode[] = [
  { id: 'client', label: 'CLIENT', col: 1, row: 0 },
  { id: 'gateway', label: 'API GATEWAY', col: 1, row: 1, emphasis: true },
  { id: 'auth', label: 'AUTH', col: 0, row: 2 },
  { id: 'core', label: 'CORE SERVICES', col: 1, row: 2 },
  { id: 'events', label: 'EVENTS', col: 2, row: 2 },
];

const ARCHITECTURE_EDGES: DiagramEdge[] = [
  { from: 'client', to: 'gateway' },
  { from: 'gateway', to: 'auth', label: 'verify' },
  { from: 'gateway', to: 'core' },
  { from: 'gateway', to: 'events', label: 'emit' },
];

// terminal-block fixture: a real, evergreen command (typechecking the package this fixture lives in) rather than a driftable test count.

const TYPECHECK_LINES: TerminalBlockLine[] = [
  { prompt: true, text: 'pnpm --filter @rottay/design-system typecheck' },
  { text: 'tsc --noEmit' },
  { text: 'no errors found' },
  { text: 'done in 4.1s' },
];

// tree-view fixture: the real folder shape this very family lives under (four nesting levels:
// tree-view/ > presentation/ > connector/ > contracts/) plus one linked leaf, so both the
// plain-text and anchor label paths render.
//
// The old fixture drew a `commercial/` tree. That folder no longer exists — the cohort was
// reclassified by role — so the tree drew a shape no reader could ever open.

const MODULE_TREE: TreeViewConnectorNode = {
  label: 'tree-view/',
  children: [
    { label: 'contracts/' },
    {
      label: 'engines/',
      children: [{ label: 'classic/' }, { label: 'modern/' }, { label: 'rustic/' }],
    },
    {
      label: 'presentation/',
      children: [
        { label: 'connector/', children: [{ label: 'contracts/' }] },
        { label: 'interactive/' },
      ],
    },
    { label: 'tests/' },
    { label: 'this family in the Showroom', href: '/patterns/visualization/tree-view' },
  ],
};

export function ConfigMonochromeBSurface({ only }: { only: string }): ReactNode {
  switch (only) {
    case 'ascii-diagram':
      return (
        <InvertSection surface="ink">
          <Box style={{ padding: '2rem' }}>
            <AsciiDiagram
              reveal="none"
              nodes={ARCHITECTURE_NODES}
              edges={ARCHITECTURE_EDGES}
              description="The client calls the API gateway, which verifies the request with auth, then routes to core services and emits domain events."
            />
          </Box>
        </InvertSection>
      );
    case 'terminal-block':
      return (
        <InvertSection surface="paper">
          <Box style={{ padding: '2rem' }}>
            <TerminalBlock
              streaming={false}
              title="pnpm --filter @rottay/design-system typecheck"
              lines={TYPECHECK_LINES}
            />
          </Box>
        </InvertSection>
      );
    case 'tree-view':
      return (
        <InvertSection surface="ink">
          <Box style={{ padding: '2rem' }}>
            <TreeViewConnector aria-label="Tree-view family module structure" data={MODULE_TREE} />
          </Box>
        </InvertSection>
      );
    case 'typewriter':
      return (
        <InvertSection surface="paper">
          <Box style={{ padding: '2rem' }}>
            <Typewriter
              as="p"
              mode="decode"
              text="Nine modules. Six hundred one use cases. Zero color literals."
            />
          </Box>
        </InvertSection>
      );
    case 'mono-stat':
      return (
        <InvertSection surface="ink">
          <Flex gap={48} wrap="wrap" style={{ padding: '2rem' }}>
            <MonoStat durationMs={0} value={9} label="domain modules" />
            <MonoStat durationMs={0} value={601} label="use cases documented" />
            <MonoStat durationMs={0} value={11} label="monochrome kit families" />
          </Flex>
        </InvertSection>
      );
    case 'product-window':
      return (
        <InvertSection surface="paper">
          <Box style={{ padding: '2rem' }}>
            <ProductWindow
              label="Analytics — live view"
              caption="The only color on the page: a live window into the product."
            >
              {/* The sanctioned color exception (spec section 1): a mock product screenshot
                  keeps its own real colors, unconstrained by the monochrome chrome around it. */}
              <div style={{ background: '#101828', color: '#ffffff', padding: '1.5rem' }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#94a3b8',
                  }}
                >
                  Weekly active tenants
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 600, marginTop: '0.5rem' }}>1,248</div>
                <div style={{ marginTop: '1rem', height: 6, borderRadius: 3, background: '#1e293b' }}>
                  <div style={{ width: '72%', height: '100%', borderRadius: 3, background: '#3b82f6' }} />
                </div>
              </div>
            </ProductWindow>
          </Box>
        </InvertSection>
      );
    default:
      return null;
  }
}

export const CONFIG_MONOCHROME_B_SLUGS = [
  'ascii-diagram',
  'terminal-block',
  'tree-view',
  'typewriter',
  'mono-stat',
  'product-window',
];
