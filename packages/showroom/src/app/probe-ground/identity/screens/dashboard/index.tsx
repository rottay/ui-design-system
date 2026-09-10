'use client';

import {
  AppShell,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  LineChart,
  Menu,
  Progress,
  Stack,
  Tag,
  Text,
} from '@rottay/design-system';
import { Icon } from '@rottay/design-system/icons';

const METRICS = [
  { label: 'Open roles', value: '7', note: '3 close-ready' },
  { label: 'Live loops', value: '24', note: '2 need a panel' },
  { label: 'Median advance', value: '42h', note: '9h faster' },
  { label: 'Offer close rate', value: '81%', note: '+6 pts' },
];

const MOMENTUM = [
  { x: 'W1', y: 12 },
  { x: 'W2', y: 16 },
  { x: 'W3', y: 14 },
  { x: 'W4', y: 19 },
  { x: 'W5', y: 22 },
  { x: 'W6', y: 20 },
  { x: 'W7', y: 24 },
  { x: 'W8', y: 27 },
];

const UPCOMING = [
  { name: 'Ana Ruiz', slot: 'Today · 15:30', stage: 'Onsite', tone: 'primary' as const },
  { name: 'Marcus Bell', slot: 'Today · 17:00', stage: 'Debrief', tone: 'warning' as const },
  { name: 'Priya Nair', slot: 'Tomorrow · 09:00', stage: 'Exec loop', tone: 'secondary' as const },
];

const NAV_ITEMS = [
  {
    key: 'hiring',
    type: 'group' as const,
    label: 'Hiring',
    children: [
      { key: 'overview', label: 'Overview', icon: <Icon name="navigation.home" decorative /> },
      { key: 'candidates', label: 'Candidates', icon: <Icon name="entity.person" decorative /> },
      { key: 'roles', label: 'Roles', icon: <Icon name="content.document" decorative /> },
      { key: 'loops', label: 'Loops', icon: <Icon name="time.schedule" decorative /> },
    ],
  },
  {
    key: 'workspace',
    type: 'group' as const,
    label: 'Workspace',
    children: [
      { key: 'reports', label: 'Reports', icon: <Icon name="data.chart" decorative /> },
      { key: 'settings', label: 'Settings', icon: <Icon name="navigation.settings" decorative /> },
    ],
  },
];

export function DashboardScreen() {
  return (
    <Stack spacing="md" fullWidth>
      <Stack spacing="none">
        <Heading level="h2">App shell</Heading>
        <Text size="sm" color="muted">
          AppShell is the DS&apos;s only reader of sidebar tone: the navigation ground is
          --ds-sidebar-bg, and the brand and footer lines take the tone&apos;s own ink,
          --ds-sidebar-text and --ds-sidebar-text-muted. The sidebar anatomy (panel /
          rail) and the layout anatomy (flat / floating) also land on this shell.
        </Text>
        <Text size="sm" color="muted">
          The footer line moves its ink but not its ground. The shell paints the footer
          with var(--ds-sidebar-footer-bg, var(--ds-sidebar-bg)), and the bithire artifact
          pins --ds-sidebar-footer-bg: #F8FBFF in its light block, so in light every
          column — including the two dark tones — paints its muted ink on the
          vertical&apos;s pale strip instead of on the tone&apos;s ground. On that ground
          the muted ink is under the DS&apos;s own 60 Lc body floor for all three
          candidates: APCA Lc 52.5 (editorial-quiet), 57.9 (product-dense), 45.3
          (warm-humanist); the baseline reads 63.6. In dark the artifact sets the footer
          ground to var(--ds-sidebar-bg) and the footer follows the nav. The pinned ground
          and the ungoverned muted ink are a vertical/DS defect routed to the family cuts,
          so this line is evidence about the ink channel only, not about the tone&apos;s
          ground and not about its contrast.
        </Text>
        <Text size="sm" color="muted">
          What the tone does NOT move here is the Menu, and not for one reason. The modern
          Menu panel never reads --ds-menu-bg at all: it paints a color-mix over
          --ds-card-bg in light and over --ds-surface-panel in dark, and no --ds-sidebar-*
          name is in that chain, so the panel ignores the tone because it never consults
          it, not because a declared name shadows it. The rows are pre-empted the other
          way: the default theme declares the --ds-menu-item-* names, and a declared name
          makes the --ds-sidebar-item-* fallback behind it inert, so those three tone
          channels never win. The group eyebrow is pre-empted the same way, by a declared
          --ds-sidebar-group-color. In light that leaves every candidate with the same
          white nav panel and the same row ink over its own ground; in dark the panel is
          the dark mix instead of white. Pre-emption is a DS finding routed to the family
          cuts, not a difference between these candidates.
        </Text>
        <Text size="sm" color="muted">
          Dark mode note: on this screen the selected navigation row is unreadable on the
          baseline and on all three candidates alike — #171717 ink on the #152336
          panel, APCA Lc 0.0. The default theme declares --ds-menu-item-color-active once,
          in :root; its html.dark block re-declares --ds-menu-item-color,
          --ds-menu-item-bg-hover and --ds-menu-item-bg-active but never
          --ds-menu-item-color-active, so the light value survives into dark and no
          artifact on this page overrides it. That is a DS default-theme defect routed to
          the family cuts, and it is identical on every column, so the dark render of this
          screen is not evidence about any candidate&apos;s navigation.
        </Text>
      </Stack>

      {/* A transform makes this Box the containing block for the shell's fixed
          navigation column, so the shell stays inside the probe's page flow. */}
      <Box transform="translate(0)" width="100%">
        <AppShell
          geometry={{
            sidebarWidth: 244,
            sidebarCollapsedWidth: 76,
            headerHeight: 60,
            sidebarHeaderHeight: 64,
          }}
          sidebar={{
            // The shell paints no ink on its own slots, so slot content reads the
            // tone's ink channels; without it a dark tone gets dark-on-dark text.
            logo: (
              <Box color="var(--ds-sidebar-text)">
                <Flex align="center" gap={8}>
                  <Avatar size="sm" name="BitHire" />
                  <Text size="sm" weight="semibold" color="inherit">
                    BitHire
                  </Text>
                </Flex>
              </Box>
            ),
            nav: <Menu mode="inline" items={NAV_ITEMS} defaultSelectedKeys={['overview']} />,
            footer: (
              <Box color="var(--ds-sidebar-text-muted)">
                <Text size="xs" color="inherit">
                  Talent pod · Q2 slate
                </Text>
              </Box>
            ),
          }}
          header={{
            left: (
              <Stack spacing="none">
                <Heading level="h3">Hiring overview</Heading>
                <Text size="xs" color="muted">
                  Q2 slate · platform and design pods
                </Text>
              </Stack>
            ),
            right: (
              <Flex align="center" gap={8}>
                <Badge variant="secondary">Q2</Badge>
                <Button variant="secondary">Export</Button>
              </Flex>
            ),
          }}
        >
          <Stack spacing="md" fullWidth>
            <Flex gap={12} wrap="wrap">
              {METRICS.map((metric) => (
                <Box key={metric.label} flex="1 1 180px">
                  <Card>
                    <Stack spacing="none">
                      <Text size="xs" color="muted">
                        {metric.label}
                      </Text>
                      <Text size="2xl" weight="bold">
                        {metric.value}
                      </Text>
                      <Badge variant="success" size="sm">
                        {metric.note}
                      </Badge>
                    </Stack>
                  </Card>
                </Box>
              ))}
            </Flex>

            <Card title="Candidate momentum">
              <Box height={220}>
                <LineChart
                  series={[{ name: 'Moved forward', data: MOMENTUM }]}
                  height={200}
                  curved
                  showDots
                  xAxisLabel="Week"
                  yAxisLabel="Candidates advanced"
                />
              </Box>
            </Card>

            <Card title="Next interviews">
              <Stack spacing="sm">
                {UPCOMING.map((row) => (
                  <Flex key={row.name} align="center" justify="between" gap={12}>
                    <Flex align="center" gap={10}>
                      <Avatar size="sm" name={row.name} />
                      <Stack spacing="none">
                        <Text size="sm" weight="semibold">
                          {row.name}
                        </Text>
                        <Text size="xs" color="muted">
                          {row.slot}
                        </Text>
                      </Stack>
                    </Flex>
                    <Tag variant={row.tone}>{row.stage}</Tag>
                  </Flex>
                ))}
                <Progress type="line" percent={68} status="normal" />
              </Stack>
            </Card>
          </Stack>
        </AppShell>
      </Box>
    </Stack>
  );
}
