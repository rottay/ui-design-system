import { Badge, Box, Card, Flex, Stack, Text } from '@rottay/design-system';
import { CodeBlock } from '@/composition/components/playground';
import { ThemePreviewGridDeferred } from './theme-preview-grid-deferred';
import { FoundationTopRail } from '../foundation-top-rail';

const GRID_GAP = 16;
const CARD_PADDING = 20;
const RADIUS_LG = 16;

export default function ThemesPage() {
  return (
    <Stack spacing="lg" fullWidth>
      <FoundationTopRail
        backHref="/foundations"
        backLabel="Foundations"
        badge="Tenant layer"
        title="Themes"
        description="Themes apply tenant and vertical identity on top of the shared token contract, so the same UI can feel like Platform, BitHire, or Evnto without forking components."
        panels={[
          {
            title: 'Resolution order',
            body: 'Base tokens -> engine adjustments -> vertical baseline -> tenant BrandTheme.',
            tone: 'dark',
          },
          {
            title: 'Good use of themes',
            body: 'Brand signal, emphasis hierarchy, surface treatment, and motion tone.',
            tone: 'accent',
          },
          {
            title: 'Bad use of themes',
            body: 'Business rules, permission logic, workflow branching, or route-level product behavior.',
          },
        ]}
        links={[
          { label: 'Rottay' },
          { label: 'BitHire' },
          { label: 'Evnto' },
          { label: 'BrandTheme merge chain' },
        ]}
        stats={[
          { label: 'Themes', value: '3', detail: 'First-party brands in this showroom' },
          { label: 'Merge chain', value: '4 layers', detail: 'Base -> engine -> vertical -> tenant' },
          { label: 'Runtime model', value: 'No rebuild', detail: 'CSS variables resolve live' },
          { label: 'Overrides', value: '~140 vars', detail: 'Generic + component-specific knobs' },
        ]}
      />

      <Stack spacing="md" fullWidth>
        <Flex align="center" justify="between" style={{ flexWrap: 'wrap' }}>
          <Text as={"h2" as any} size="xl" weight="semibold">
            Tenant comparison
          </Text>
          <Badge variant="secondary">Same engine, all first-party tenants</Badge>
        </Flex>
        <Card
          style={{
            width: '100%',
            padding: CARD_PADDING,
            border: '1px solid var(--ds-color-border-secondary)',
            background:
              'linear-gradient(180deg, var(--ds-color-bg-secondary), var(--ds-color-bg-surface))',
          }}
        >
          <Stack spacing="md" fullWidth>
            <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
              <Box style={{ minWidth: 0, maxWidth: 760 }}>
                <Text as={"h3" as any} size="lg" weight="semibold">
                  Real side-by-side tenant previews
                </Text>
                <Text
                  size="sm"
                  style={{ marginTop: 6, color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}
                >
                  Each card below renders the same DS primitives under a different tenant preset.
                  Use this section to compare brand signal, surface chemistry, and action posture
                  without relying on showroom-local styling.
                </Text>
              </Box>
              <Flex gap={8} style={{ flexWrap: 'wrap' }}>
                <Badge variant="primary">Live providers</Badge>
                <Badge variant="secondary">Three tenant presets</Badge>
              </Flex>
            </Flex>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                gap: GRID_GAP,
              }}
            >
              {[
                {
                  title: 'Brand signal',
                  body: 'Primary emphasis, semantic bias, and accent energy should all move with the tenant.',
                },
                {
                  title: 'Surface chemistry',
                  body: 'Cards, neutrals, and contrast rhythm should shift without changing the component API.',
                },
                {
                  title: 'Operational posture',
                  body: 'The same controls should feel more enterprise, recruiting, or event-driven by runtime alone.',
                },
              ].map((item) => (
                <Box
                  key={item.title}
                  style={{
                    padding: GRID_GAP,
                    borderRadius: RADIUS_LG,
                    border: '1px solid var(--ds-color-border-secondary)',
                    background: 'var(--ds-color-bg-overlay)',
                  }}
                >
                  <Text size="sm" weight="semibold">
                    {item.title}
                  </Text>
                  <Text
                    size="xs"
                    style={{ marginTop: 6, color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}
                  >
                    {item.body}
                  </Text>
                </Box>
              ))}
            </Box>

            <ThemePreviewGridDeferred />
          </Stack>
        </Card>
      </Stack>

      <Card style={{ width: '100%', padding: CARD_PADDING }}>
        <Stack spacing="md" fullWidth>
          <Flex align="center" justify="between" style={{ flexWrap: 'wrap', gap: 12 }}>
            <Text as={"h2" as any} size="lg" weight="semibold">
              What themes should change
            </Text>
            <Badge variant="secondary">Scope guardrails</Badge>
          </Flex>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
              gap: GRID_GAP,
              alignItems: 'start',
            }}
          >
            <Box
              style={{
                padding: GRID_GAP,
                borderRadius: RADIUS_LG,
                border: '1px solid var(--ds-color-border-secondary)',
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.92))',
              }}
            >
              <Stack spacing={10}>
                <Text size="sm" weight="semibold">
                  Themes should shift brand, not behavior
                </Text>
                <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
                  Use them to move tone, emphasis, and surface chemistry. Keep product logic,
                  permissions, and routing outside the theme layer.
                </Text>
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 8,
                    marginTop: 4,
                  }}
                >
                  {[
                    'Palette',
                    'Surface chemistry',
                    'Motion tone',
                    'Component chrome',
                  ].map((item) => (
                    <Box
                      key={item}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 12,
                        background: 'var(--ds-color-bg-overlay)',
                        border: '1px solid var(--ds-color-border-secondary)',
                      }}
                    >
                      <Text size="xs" weight="semibold">
                        {item}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Stack>
            </Box>

            <Stack spacing={GRID_GAP}>
              {[
                {
                  title: 'Brand signal',
                  detail: 'Palette, emphasis moments, hero accents, semantic tone bias.',
                },
                {
                  title: 'Surface chemistry',
                  detail: 'Card styling, gradients, translucency, borders, and elevation flavor.',
                },
                {
                  title: 'Interaction details',
                  detail: 'Motion softness, focus treatment, and component-specific chrome variables.',
                },
              ].map((item) => (
                <Box
                  key={item.title}
                  style={{
                    padding: GRID_GAP,
                    borderRadius: RADIUS_LG,
                    border: '1px solid var(--ds-color-border-secondary)',
                    background: 'var(--ds-color-bg-overlay)',
                  }}
                >
                  <Text size="sm" weight="semibold">
                    {item.title}
                  </Text>
                  <Text
                    size="xs"
                    style={{ marginTop: 4, color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}
                  >
                    {item.detail}
                  </Text>
                </Box>
              ))}

              <Box
                style={{
                  padding: GRID_GAP,
                  borderRadius: RADIUS_LG,
                  border: '1px solid var(--ds-color-warning-border)',
                  background:
                    'linear-gradient(180deg, rgba(254,252,232,0.96), rgba(255,255,255,0.9))',
                }}
              >
                <Text size="sm" weight="semibold">
                  Not business logic
                </Text>
                <Text
                  size="xs"
                  style={{ marginTop: 4, color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}
                >
                  Themes should not encode product rules, permissions, or workflow branching.
                </Text>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Card>

      <CodeBlock
        title="Theme provider"
        language="tsx"
        code={`<DesignSystemProvider tenantSlug="bithire" forceEngine="modern">
  <DashboardSurface />
</DesignSystemProvider>

// Resolution:
// base tokens -> engine -> vertical baseline -> tenant BrandTheme`}
      />
    </Stack>
  );
}
