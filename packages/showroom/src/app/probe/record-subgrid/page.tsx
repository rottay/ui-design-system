'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Stack, Text, Descriptions } from '@rottay/design-system';
import { TortureSurface, type TortureFixture, type ProbeEngine } from '@/components/torture-surface';

// ---------------------------------------------------------------------------
// Subgrid record alignment probe (W6-D)
//
// Two adjacent vertical Descriptions "sections" whose label lengths differ
// wildly: "Identity" carries short labels (ID / Name / Role), "Compliance"
// carries one very long label ("Data processing agreement reference
// identifier") beside short ones (Status / Owner). The W6-D skin declares the
// shared 2-track grid on [data-part='rows'] and re-exposes it to each row via
// `grid-template-columns: subgrid` under @supports, so every value column
// aligns to the widest label WITHIN a section -- Compliance's short-label
// values jump right to line up under the long DPA label's value column, the
// visible signature of the subgrid upgrade over the old fixed one-third split.
// The row stays a padded/bordered box, which is why subgrid (not
// display:contents) is required. Query params:
//   ?engine=modern|rustic    which engine renders (default modern)
//   ?fixture=rottay|bithire  which palette/ground owns the page (rottay = dark,
//                            bithire = light); default rottay
// ---------------------------------------------------------------------------

const ENGINES: ProbeEngine[] = ['modern', 'rustic'];
const FIXTURES: TortureFixture[] = ['rottay', 'bithire'];

function sanitizeEngine(raw: string | null): ProbeEngine {
  return raw && (ENGINES as string[]).includes(raw) ? (raw as ProbeEngine) : 'modern';
}

function sanitizeFixture(raw: string | null): TortureFixture {
  return raw === 'bithire' ? 'bithire' : 'rottay';
}

function ProbeContent() {
  const searchParams = useSearchParams();

  const engine = useMemo(() => sanitizeEngine(searchParams.get('engine')), [searchParams]);
  const fixture = useMemo(() => sanitizeFixture(searchParams.get('fixture')), [searchParams]);

  return (
    <TortureSurface fixture={fixture} engine={engine}>
      <Box style={{ minHeight: '100vh', padding: 24, background: 'var(--ds-color-bg-primary)' }}>
        <Box data-testid="probe-record-subgrid" style={{ maxWidth: 560, margin: '0 auto' }}>
          <Stack spacing="lg" fullWidth>
            <Text
              size="xs"
              weight="semibold"
              style={{
                display: 'block',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--ds-color-text-muted)',
              }}
            >
              Subgrid record alignment · {engine} · {fixture}
            </Text>

            <Descriptions engine={engine} layout="vertical" title="Identity" bordered colon={false}>
              <Descriptions.Item label="ID">CAND-4821</Descriptions.Item>
              <Descriptions.Item label="Name">Ada Lovelace</Descriptions.Item>
              <Descriptions.Item label="Role">Staff Engineer</Descriptions.Item>
            </Descriptions>

            <Descriptions engine={engine} layout="vertical" title="Compliance" bordered colon={false}>
              <Descriptions.Item label="Status">Cleared</Descriptions.Item>
              <Descriptions.Item label="Data processing agreement reference identifier">
                DPA-2026-000148-EU
              </Descriptions.Item>
              <Descriptions.Item label="Owner">Governance</Descriptions.Item>
            </Descriptions>
          </Stack>
        </Box>
      </Box>
    </TortureSurface>
  );
}

export default function RecordSubgridProbePage() {
  return (
    <Suspense fallback={null}>
      <ProbeContent />
    </Suspense>
  );
}
