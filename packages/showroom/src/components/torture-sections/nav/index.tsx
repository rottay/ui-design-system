'use client';

import {
  Box,
  Stack,
  Text,
  Button,
  Menu,
  FloatButton,
  Tabs,
  Steps,
  Stepper,
  Pagination,
  Segmented,
  BackTop,
  Breadcrumb,
  BottomTabBar,
  Anchor,
  MobileHeader,
  ActionDock,
  Affix,
  NavLink,
} from '@rottay/design-system';
import { Icon } from '@rottay/design-system/icons';

// Fixed fixtures for the WO-SKIN-04 checkpoint N navigation-family data-part
// probe (Menu, FloatButton, Tabs, Steps, Stepper, Pagination, Segmented,
// BackTop, Breadcrumb, BottomTabBar, Anchor, MobileHeader, ActionDock, Affix,
// Link). Every instance below is deterministic -- forced status/state props,
// never a live clock or real scroll position -- so the grid renders
// identically on every load. Rendered only behind `?nav=1` so no flagship
// capture sees it. This page is the visual-evidence half; the contract test
// renders its own fixtures directly through React Testing Library.
const NAV_MENU_ITEMS = [
  { key: 'home', label: 'Home', icon: <Icon name="navigation.home" decorative /> },
  { key: 'selected', label: 'Selected item' },
  { key: 'disabled', label: 'Disabled item', disabled: true },
  { key: 'danger', label: 'Danger item', danger: true },
  {
    key: 'submenu',
    label: 'Submenu',
    children: [
      { key: 'submenu-child-1', label: 'Child 1' },
      { key: 'submenu-child-2', label: 'Child 2' },
    ],
  },
  { key: 'divider-1', type: 'divider' as const },
  {
    key: 'group-1',
    type: 'group' as const,
    label: 'Group',
    children: [{ key: 'group-child-1', label: 'Group child' }],
  },
];

const NAV_STEPS_ITEMS = [
  { title: 'Finished', status: 'finish' as const },
  { title: 'In progress', status: 'process' as const },
  { title: 'Error', status: 'error' as const },
  { title: 'Waiting', status: 'wait' as const },
];

const NAV_TABS_ITEMS = [
  {
    key: 'tab-1',
    label: 'Overview',
    children: <Text size="xs">Overview content</Text>,
  },
  {
    key: 'tab-2',
    label: 'Activity 4',
    children: <Text size="xs">Activity content</Text>,
  },
  {
    key: 'tab-3',
    label: 'Settings',
    disabled: true,
    children: <Text size="xs">Settings content</Text>,
  },
];

const NAV_SEGMENTED_OPTIONS = [
  { label: 'List', value: 'list', icon: <Icon name="layout.list" decorative /> },
  { label: 'Grid', value: 'grid' },
  { label: 'Disabled', value: 'disabled', disabled: true },
];

const NAV_BREADCRUMB_ITEMS = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'docs', label: 'Docs', href: '/docs', icon: <Icon name="content.document" decorative /> },
  { key: 'current', label: 'Current Page' },
];

const NAV_BOTTOMTABBAR_ITEMS = [
  { key: 'home', label: 'Home', icon: <Icon name="navigation.home" decorative /> },
  { key: 'search', label: 'Search', icon: <Icon name="action.search" decorative /> },
  { key: 'profile', label: 'Profile', icon: <Icon name="navigation.profile" decorative />, badge: 3 },
];

export function NavFbStates() {
  return (
    <Box
      data-testid="probe-nav"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        <Stack spacing="xs" data-testid="probe-nav-menu">
          <Text size="xs" color="secondary">
            Menu (items form)
          </Text>
          <Menu
            items={NAV_MENU_ITEMS}
            selectedKeys={['selected']}
            defaultOpenKeys={['submenu']}
            onSelect={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-menu-compound">
          <Text size="xs" color="secondary">
            Menu (compound form)
          </Text>
          <Menu selectedKeys={['compound-selected']} onSelect={() => undefined}>
            <Menu.Item itemKey="compound-home" icon={<Icon name="navigation.home" decorative />}>
              Home
            </Menu.Item>
            <Menu.Item itemKey="compound-selected">Selected item</Menu.Item>
            <Menu.Item itemKey="compound-disabled" disabled>
              Disabled item
            </Menu.Item>
            <Menu.Item itemKey="compound-danger" danger>
              Danger item
            </Menu.Item>
            <Menu.Divider />
            <Menu.SubMenu itemKey="compound-submenu" title="Submenu">
              <Menu.Item itemKey="compound-submenu-child">Child</Menu.Item>
            </Menu.SubMenu>
            <Menu.Group title="Group">
              <Menu.Item itemKey="compound-group-child">Group child</Menu.Item>
            </Menu.Group>
          </Menu>
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-floatbutton">
          <Text size="xs" color="secondary">
            FloatButton
          </Text>
          <Box style={{ display: 'flex', gap: 12, position: 'relative' }}>
            <FloatButton
              icon={<Icon name="communication.notification" label="Notifications" />}
              type="default"
              badge={{ count: 3 }}
              style={{ position: 'static' }}
            />
            <FloatButton
              icon={<Icon name="action.add" label="Create" />}
              type="primary"
              shape="circle"
              badge={{ dot: true }}
              style={{ position: 'static' }}
            />
          </Box>
          <FloatButton.Group
            trigger="click"
            icon={<Icon name="navigation.more" label="More actions" />}
            style={{ position: 'static' }}
          >
            <FloatButton icon={<Icon name="action.add" label="Create" />} style={{ position: 'static' }} />
          </FloatButton.Group>
          <FloatButton.BackTop visibilityHeight={0} style={{ position: 'static' }} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-tabs">
          <Text size="xs" color="secondary">
            Tabs
          </Text>
          <Tabs items={NAV_TABS_ITEMS} activeKey="tab-1" type="line" onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-steps">
          <Text size="xs" color="secondary">
            Steps
          </Text>
          <Steps items={NAV_STEPS_ITEMS} current={1} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-stepper">
          <Text size="xs" color="secondary">
            Stepper (items form)
          </Text>
          <Stepper items={NAV_STEPS_ITEMS} current={1} clickable onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-stepper-compound">
          <Text size="xs" color="secondary">
            Stepper (compound form)
          </Text>
          <Stepper current={0}>
            <Stepper.Step title="Account" status="finish" />
            <Stepper.Step title="Profile" status="process" />
            <Stepper.Step title="Error step" status="error" />
            <Stepper.Content stepIndex={0}>
              <Text size="xs">Account step content</Text>
            </Stepper.Content>
          </Stepper>
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-pagination">
          <Text size="xs" color="secondary">
            Pagination
          </Text>
          <Pagination current={1} total={100} pageSize={10} onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-segmented">
          <Text size="xs" color="secondary">
            Segmented
          </Text>
          <Segmented options={NAV_SEGMENTED_OPTIONS} value="list" onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-backtop">
          <Text size="xs" color="secondary">
            BackTop
          </Text>
          <BackTop visibilityHeight={0} style={{ position: 'static' }} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-breadcrumb">
          <Text size="xs" color="secondary">
            Breadcrumb (items form)
          </Text>
          <Breadcrumb items={NAV_BREADCRUMB_ITEMS} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-breadcrumb-compound">
          <Text size="xs" color="secondary">
            Breadcrumb (compound form)
          </Text>
          <Breadcrumb items={[]}>
            <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/docs" icon={<Icon name="content.document" decorative />}>
              Docs
            </Breadcrumb.Item>
            <Breadcrumb.Item>Current page</Breadcrumb.Item>
          </Breadcrumb>
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-bottomtabbar">
          <Text size="xs" color="secondary">
            BottomTabBar
          </Text>
          <Box style={{ position: 'relative', height: 64 }}>
            <BottomTabBar
              items={NAV_BOTTOMTABBAR_ITEMS}
              activeKey="home"
              onChange={() => undefined}
              style={{ position: 'static' }}
            />
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-anchor">
          <Text size="xs" color="secondary">
            Anchor
          </Text>
          <Anchor affix={false}>
            <Anchor.Link href="#nav-anchor-intro" title="Introduction" />
            <Anchor.Link href="#nav-anchor-features" title="Features">
              <Anchor.Link href="#nav-anchor-feature-1" title="Feature 1" />
            </Anchor.Link>
          </Anchor>
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-mobileheader">
          <Text size="xs" color="secondary">
            MobileHeader
          </Text>
          <Box style={{ position: 'relative' }}>
            <MobileHeader title="Order Details" onBack={() => undefined} style={{ position: 'static' }} />
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-actiondock">
          <Text size="xs" color="secondary">
            ActionDock
          </Text>
          <Box style={{ position: 'relative', height: 64 }}>
            <ActionDock position="bottom" style={{ position: 'static' }}>
              <Button variant="secondary" style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button variant="primary" style={{ flex: 1 }}>
                Save
              </Button>
            </ActionDock>
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-affix">
          <Text size="xs" color="secondary">
            Affix
          </Text>
          <Affix offsetTop={0}>
            <Box style={{ padding: 8, background: 'var(--ds-color-bg-primary)' }}>
              <Text size="xs">Affixed content</Text>
            </Box>
          </Affix>
        </Stack>

        <Stack spacing="xs" data-testid="probe-nav-link">
          <Text size="xs" color="secondary">
            Link
          </Text>
          <Stack spacing="xs">
            <NavLink href="/nav-link-default">Default link</NavLink>
            <NavLink href="/nav-link-primary" type="primary">
              Primary link
            </NavLink>
            <NavLink href="/nav-link-disabled" disabled>
              Disabled link
            </NavLink>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
