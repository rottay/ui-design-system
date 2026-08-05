'use client';

import { Box, Collapse, Divider, Layout, Splitter, Stack, Text } from '@rottay/design-system';

// Fixed fixtures for the WO-SKIN-05 checkpoint L layout-family data-part
// probe (Box, Layout, Collapse, Divider, Splitter). Every instance below is
// deterministic -- forced controlled props, never a live drag or toggle --
// so the grid renders identically on every load. Rendered only behind
// `?layout=1` so no flagship capture sees it. This page is the
// visual-evidence half; the contract test renders its own fixtures directly
// through React Testing Library.
//
// Layout.Sider is shown TWICE (collapsed=false and collapsed=true, both
// controlled) so the P-76-adjacent data-collapsed state is photographed in
// both positions without any interaction. The outer Layout's own
// `min-h-screen` Tailwind class is overridden via the `style` prop it
// already merges last -- the same "style={{ position: 'static' }}"
// torture-page idiom already used above for FloatButton/BackTop/
// MobileHeader/ActionDock/Affix, not a change to the component itself.
export function LayoutStates() {
  return (
    <Box
      data-testid="probe-layout"
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
        <Stack spacing="xs" data-testid="probe-layout-box">
          <Text size="xs" color="secondary">
            Box
          </Text>
          <Box style={{ padding: 12, border: '1px dashed var(--ds-color-border)' }}>
            <Text size="xs">Plain style-injection Box</Text>
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-layout-layout">
          <Text size="xs" color="secondary">
            Layout (Sider expanded / Sider collapsed / Header / Content / Footer)
          </Text>
          <Layout
            hasSider
            style={{
              minHeight: 220,
              border: '1px solid var(--ds-color-border)',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <Layout.Sider theme="dark" collapsible collapsed={false} width={140} style={{ minHeight: 220 }}>
              <Text size="xs" style={{ padding: 8, display: 'block' }}>
                Nav (expanded)
              </Text>
            </Layout.Sider>
            <Layout.Sider theme="light" collapsible collapsed width={80} style={{ minHeight: 220 }}>
              <Text size="xs" style={{ padding: 8, display: 'block' }}>
                Nav
              </Text>
            </Layout.Sider>
            <Layout style={{ minHeight: 220 }}>
              <Layout.Header height={48}>
                <Text size="xs">Header</Text>
              </Layout.Header>
              <Layout.Content>
                <Text size="xs">Content</Text>
              </Layout.Content>
              <Layout.Footer>
                <Text size="xs">Footer</Text>
              </Layout.Footer>
            </Layout>
          </Layout>
        </Stack>

        <Stack spacing="xs" data-testid="probe-layout-collapse">
          <Text size="xs" color="secondary">
            Collapse (expanded / collapsed / disabled)
          </Text>
          <Collapse defaultActiveKey={['open']}>
            <Collapse.Panel header="Open panel" panelKey="open">
              <Text size="xs">Expanded content</Text>
            </Collapse.Panel>
            <Collapse.Panel header="Closed panel" panelKey="closed">
              <Text size="xs">Collapsed content</Text>
            </Collapse.Panel>
            <Collapse.Panel header="Disabled panel" panelKey="disabled" disabled>
              <Text size="xs">Disabled content</Text>
            </Collapse.Panel>
          </Collapse>
        </Stack>

        <Stack spacing="xs" data-testid="probe-layout-divider">
          <Text size="xs" color="secondary">
            Divider (horizontal/vertical x plain/with-text)
          </Text>
          <Stack spacing="sm">
            <Divider />
            <Divider>With text</Divider>
          </Stack>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 48,
              gap: 12,
            }}
          >
            <Text size="xs">Left</Text>
            <Divider orientation="vertical" />
            <Text size="xs">Mid</Text>
            <Divider orientation="vertical">Tag</Divider>
            <Text size="xs">Right</Text>
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-layout-splitter">
          <Text size="xs" color="secondary">
            Splitter (horizontal / vertical, at rest)
          </Text>
          <Box
            style={{
              height: 100,
              border: '1px solid var(--ds-color-border)',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <Splitter layout="horizontal">
              <Splitter.Panel defaultSize={40}>
                <Text size="xs" style={{ padding: 8, display: 'block' }}>
                  Left
                </Text>
              </Splitter.Panel>
              <Splitter.Panel>
                <Text size="xs" style={{ padding: 8, display: 'block' }}>
                  Right
                </Text>
              </Splitter.Panel>
            </Splitter>
          </Box>
          <Box
            style={{
              height: 100,
              border: '1px solid var(--ds-color-border)',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <Splitter layout="vertical">
              <Splitter.Panel defaultSize={40}>
                <Text size="xs" style={{ padding: 8, display: 'block' }}>
                  Top
                </Text>
              </Splitter.Panel>
              <Splitter.Panel>
                <Text size="xs" style={{ padding: 8, display: 'block' }}>
                  Bottom
                </Text>
              </Splitter.Panel>
            </Splitter>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
