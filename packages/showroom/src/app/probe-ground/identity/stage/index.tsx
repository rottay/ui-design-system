'use client';

import {
  Badge,
  Box,
  DesignSystemProvider,
  Divider,
  Flex,
  getKnownTenantConfig,
  Heading,
  Link,
  Stack,
  Text,
  type TenantConfig,
} from '@rottay/design-system';

import { DashboardScreen } from '../screens/dashboard';
import { FormScreen } from '../screens/form';
import { ListScreen } from '../screens/list';
import { ModalScreen } from '../screens/modal';
import { PhoneScreen } from '../screens/phone';
import { RecordScreen } from '../screens/record';

export interface IdentityStageOption {
  id: string;
  label: string;
  href: string;
  active: boolean;
}

/** One row of the door's own unlit report, carried verbatim. */
export interface IdentityUnlitRow {
  id: string;
  tier: string;
  reason: string;
}

export interface IdentityStageProps {
  title: string;
  intent: string;
  mode: 'light' | 'dark';
  screen: string;
  digest: string;
  decisionCount: number;
  unlit: IdentityUnlitRow[];
  tenantConfig: TenantConfig | null;
  columns: IdentityStageOption[];
  modes: IdentityStageOption[];
  screens: IdentityStageOption[];
}

function OptionRow({ label, options }: { label: string; options: IdentityStageOption[] }) {
  return (
    <Flex align="center" gap={10} wrap="wrap">
      <Text size="xs" weight="semibold" color="muted">
        {label}
      </Text>
      {options.map((option) => (
        <Link key={option.id} href={option.href}>
          <Text size="sm" weight={option.active ? 'semibold' : 'normal'}>
            {option.active ? `· ${option.label}` : option.label}
          </Text>
        </Link>
      ))}
    </Flex>
  );
}

/**
 * What the mounted identity does NOT show. The rows are the admission door's
 * own `unlit` list, so the stage states the gap the intent line above it would
 * otherwise imply is rendered.
 */
function UnlitReport({ rows, decisionCount }: { rows: IdentityUnlitRow[]; decisionCount: number }) {
  if (rows.length === 0) return null;
  return (
    <Stack spacing="xs">
      <Text size="xs" weight="semibold" color="muted">
        Accepted but unlit — {rows.length} of {decisionCount} decisions move nothing on this
        render; the door reports them, the stage does not derive them
      </Text>
      <Flex gap={8} wrap="wrap">
        {rows.map((row) => (
          <Badge key={row.id} variant="secondary" size="sm">
            {`${row.id} · ${row.tier} · ${row.reason}`}
          </Badge>
        ))}
      </Flex>
    </Stack>
  );
}

export function IdentityStage(props: IdentityStageProps) {
  const { screen } = props;
  const shows = (name: string) => screen === 'all' || screen === name;
  const tenantConfig = props.tenantConfig ?? getKnownTenantConfig('bithire');

  return (
    <DesignSystemProvider
      forceEngine="modern"
      forceTheme={props.mode}
      tenantConfig={tenantConfig}
      locale="en"
    >
      {/* The showroom body pins its own ground and font. `data-ds-root` is the
          DS's own nested-surface boundary, so tenant typography wins here by
          declaration instead of inheriting the host's. */}
      <Box
        data-testid="identity-probe-stage"
        data-ds-root=""
        padding="lg"
        minHeight="100vh"
        background="var(--ds-color-bg)"
      >
        <Stack spacing="lg" fullWidth>
          <Stack spacing="sm">
            <Flex align="center" gap={10} wrap="wrap">
              <Heading level="h1">{props.title}</Heading>
              <Badge variant="secondary">{props.mode}</Badge>
              <Badge variant="secondary">{props.decisionCount} decisions</Badge>
            </Flex>
            <Text size="sm" color="muted">
              {props.intent}
            </Text>
            <Text size="xs" color="muted">
              {props.digest}
            </Text>
            <UnlitReport rows={props.unlit} decisionCount={props.decisionCount} />
            <OptionRow label="Candidate" options={props.columns} />
            <OptionRow label="Mode" options={props.modes} />
            <OptionRow label="Screen" options={props.screens} />
          </Stack>

          <Divider />

          {shows('list') ? <ListScreen /> : null}
          {shows('list') && shows('record') ? <Divider /> : null}
          {shows('record') ? <RecordScreen /> : null}
          {shows('record') && shows('form') ? <Divider /> : null}
          {shows('form') ? <FormScreen /> : null}
          {shows('form') && shows('dashboard') ? <Divider /> : null}
          {shows('dashboard') ? <DashboardScreen /> : null}
          {shows('dashboard') && shows('modal') ? <Divider /> : null}
          {shows('modal') ? <ModalScreen initialOpen={screen === 'modal'} /> : null}
          {shows('modal') && shows('phone') ? <Divider /> : null}
          {shows('phone') ? <PhoneScreen /> : null}
        </Stack>
      </Box>
    </DesignSystemProvider>
  );
}
