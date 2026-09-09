'use client';

import {
  Badge,
  Box,
  DesignSystemProvider,
  Divider,
  Flex,
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

export interface IdentityStageProps {
  title: string;
  intent: string;
  mode: 'light' | 'dark';
  screen: string;
  digest: string;
  decisionCount: number;
  tenantConfig: TenantConfig;
  columns: IdentityStageOption[];
  modes: IdentityStageOption[];
  screens: IdentityStageOption[];
}

function OptionRow({ label, options }: { label: string; options: IdentityStageOption[] }) {
  return (
    <Flex align="center" gap={10} wrap>
      <Text size="xs" weight="semibold" variant="muted">
        {label}
      </Text>
      {options.map((option) => (
        <Link key={option.id} href={option.href}>
          <Text size="sm" weight={option.active ? 'semibold' : 'regular'}>
            {option.active ? `· ${option.label}` : option.label}
          </Text>
        </Link>
      ))}
    </Flex>
  );
}

export function IdentityStage(props: IdentityStageProps) {
  const { screen } = props;
  const shows = (name: string) => screen === 'all' || screen === name;

  return (
    <DesignSystemProvider
      forceEngine="modern"
      forceTheme={props.mode}
      tenantConfig={props.tenantConfig}
      locale="en"
    >
      <Box style={{ padding: 24 }}>
        <Stack spacing="lg" fullWidth>
          <Stack spacing="sm">
            <Flex align="center" gap={10} wrap>
              <Heading level={1}>{props.title}</Heading>
              <Badge variant="secondary">{props.mode}</Badge>
              <Badge variant="secondary">{props.decisionCount} decisions</Badge>
            </Flex>
            <Text size="sm" variant="muted">
              {props.intent}
            </Text>
            <Text size="xs" variant="muted">
              {props.digest}
            </Text>
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
