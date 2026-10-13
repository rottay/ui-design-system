'use client';

import type { ReactNode } from 'react';
import {
  AspectRatio,
  Badge,
  Box,
  Button,
  Collapse,
  Container,
  Divider,
  Flex,
  Grid,
  Hide,
  Layout,
  ResponsiveSlot,
  ScrollArea,
  Show,
  Space,
  Splitter,
  Stack,
  Text,
} from '@rottay/design-system';
import { SurfaceBlock } from '../frames';

export const LAYOUT_PREVIEWS: Record<string, ReactNode> = {
  // -- Layout --
  'aspect-ratio': (
    <AspectRatio ratio={16 / 9} maxWidth={300}>
      <Box
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 14,
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--ds-color-primary) 18%, white) 0%, color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-color-bg-container)) 100%)',
        }}
      >
        <Text size="sm" weight="semibold">
          16:9 media slot
        </Text>
      </Box>
    </AspectRatio>
  ),
  'box': (
    <Box
      style={{
        padding: 16,
        border: '1px solid var(--ds-color-border)',
        borderRadius: 8,
      }}
    >
      <Text size="sm">Box content</Text>
    </Box>
  ),
  'collapse': (
    <Collapse defaultActiveKey="1" style={{ width: 320 }}>
      <Collapse.Panel header="Tenant permissions" panelKey="1">
        <Text size="sm">Role changes apply immediately across all routes.</Text>
      </Collapse.Panel>
      <Collapse.Panel header="Escalation rules" panelKey="2">
        <Text size="sm">Secondary approvers inherit workspace defaults.</Text>
      </Collapse.Panel>
    </Collapse>
  ),
  'container': (
    <Container
      maxWidth="sm"
      padding="md"
      style={{
        border: '1px solid var(--ds-color-border)',
        borderRadius: 16,
        background: 'var(--ds-color-bg-container)',
      }}
    >
      <Stack spacing="sm">
        <Text size="sm" weight="semibold">
          Centered content container
        </Text>
        <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
          Width, padding, and centering come from the DS primitive.
        </Text>
      </Stack>
    </Container>
  ),
  'divider': (
    <Stack spacing="sm" style={{ width: 260 }}>
      <Text size="sm">Content above</Text>
      <Divider />
      <Text size="sm">Content below</Text>
    </Stack>
  ),
  'flex': (
    <Flex gap={8}>
      <Box
        style={{
          padding: 8,
          background: 'var(--ds-color-primary-100, #e8e0ff)',
          borderRadius: 4,
        }}
      >
        <Text size="sm">A</Text>
      </Box>
      <Box
        style={{
          padding: 8,
          background: 'var(--ds-color-primary-100, #e8e0ff)',
          borderRadius: 4,
        }}
      >
        <Text size="sm">B</Text>
      </Box>
      <Box
        style={{
          padding: 8,
          background: 'var(--ds-color-primary-100, #e8e0ff)',
          borderRadius: 4,
        }}
      >
        <Text size="sm">C</Text>
      </Box>
    </Flex>
  ),
  'grid': (
    <Grid columns={3} gap="sm">
      <Box
        style={{
          padding: 16,
          background: 'var(--ds-color-primary-100, #e8e0ff)',
          borderRadius: 4,
          textAlign: 'center',
        }}
      >
        <Text size="sm">1</Text>
      </Box>
      <Box
        style={{
          padding: 16,
          background: 'var(--ds-color-primary-100, #e8e0ff)',
          borderRadius: 4,
          textAlign: 'center',
        }}
      >
        <Text size="sm">2</Text>
      </Box>
      <Box
        style={{
          padding: 16,
          background: 'var(--ds-color-primary-100, #e8e0ff)',
          borderRadius: 4,
          textAlign: 'center',
        }}
      >
        <Text size="sm">3</Text>
      </Box>
    </Grid>
  ),
  'hide': (
    <Stack spacing="sm" style={{ maxWidth: 320 }}>
      <Hide on="desktop">
        <Badge variant="warning">This badge disappears on desktop</Badge>
      </Hide>
      <Show on="desktop">
        <Badge variant="success">Desktop keeps the alternate content visible</Badge>
      </Show>
      <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
        The preview is intentionally viewport-sensitive because the primitive is.
      </Text>
    </Stack>
  ),
  'layout': (
    <Layout
      hasSider
      style={{
        width: 360,
        minHeight: 188,
        overflow: 'hidden',
        borderRadius: 18,
        border: '1px solid var(--ds-color-border)',
      }}
    >
      <Layout.Sider
        width={92}
        style={{
          padding: 16,
          background: 'var(--ds-color-bg-secondary)',
        }}
      >
        <Stack spacing="sm">
          <Text size="xs" weight="semibold">
            Sider
          </Text>
          <Text size="xs">Nav</Text>
          <Text size="xs">Queues</Text>
        </Stack>
      </Layout.Sider>
      <Layout>
        <Layout.Header
          height={52}
          style={{
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid var(--ds-color-border)',
            background: 'var(--ds-color-bg-container)',
          }}
        >
          <Text size="sm" weight="semibold">
            Header
          </Text>
        </Layout.Header>
        <Layout.Content
          style={{
            padding: 16,
            background: 'var(--ds-color-bg-primary)',
          }}
        >
          <Text size="sm">Content panel</Text>
        </Layout.Content>
        <Layout.Footer
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--ds-color-border)',
            background: 'var(--ds-color-bg-container)',
          }}
        >
          <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
            Footer
          </Text>
        </Layout.Footer>
      </Layout>
    </Layout>
  ),
  'responsive-slot': (
    <Stack spacing="sm" style={{ maxWidth: 320 }}>
      <ResponsiveSlot
        phone={<Badge variant="warning">Phone slot</Badge>}
        tablet={<Badge variant="secondary">Tablet slot</Badge>}
        desktop={<Badge variant="success">Desktop slot</Badge>}
      />
      <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
        The rendered node changes with the current viewport breakpoint.
      </Text>
    </Stack>
  ),
  'scroll-area': (
    <ScrollArea maxHeight={152} style={{ width: 320, paddingRight: 6 }}>
      <Stack spacing="sm">
        {Array.from({ length: 7 }).map((_, index) => (
          <SurfaceBlock key={index}>
            <Text size="sm">Scrollable card {index + 1}</Text>
          </SurfaceBlock>
        ))}
      </Stack>
    </ScrollArea>
  ),
  'show': (
    <Stack spacing="sm" style={{ maxWidth: 320 }}>
      <Show on="desktop">
        <Badge variant="success">Desktop content visible</Badge>
      </Show>
      <Show below="tablet">
        <Badge variant="warning">Phone and tablet content visible</Badge>
      </Show>
      <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
        Resize the viewport to verify the breakpoint contract.
      </Text>
    </Stack>
  ),
  'space': (
    <Space size="md" wrap>
      <Button size="sm" variant="default">Approve</Button>
      <Button size="sm" variant="primary">Publish</Button>
      <Button size="sm" variant="ghost">Archive</Button>
    </Space>
  ),
  'splitter': (
    <Splitter
      layout="horizontal"
      style={{
        width: 340,
        height: 172,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid var(--ds-color-border)',
      }}
    >
      <Splitter.Panel defaultSize={34} min={96}>
        <Box
          style={{
            height: '100%',
            padding: 14,
            background: 'var(--ds-color-bg-secondary)',
          }}
        >
          <Text size="sm" weight="semibold">
            Filters
          </Text>
        </Box>
      </Splitter.Panel>
      <Splitter.Panel defaultSize={66}>
        <Box
          style={{
            height: '100%',
            padding: 14,
            background: 'var(--ds-color-bg-container)',
          }}
        >
          <Text size="sm" weight="semibold">
            Results
          </Text>
        </Box>
      </Splitter.Panel>
    </Splitter>
  ),
  'stack': (
    <Stack spacing="sm">
      <Box
        style={{
          padding: 8,
          background: 'var(--ds-color-primary-100, #e8e0ff)',
          borderRadius: 4,
        }}
      >
        <Text size="sm">Item 1</Text>
      </Box>
      <Box
        style={{
          padding: 8,
          background: 'var(--ds-color-primary-100, #e8e0ff)',
          borderRadius: 4,
        }}
      >
        <Text size="sm">Item 2</Text>
      </Box>
      <Box
        style={{
          padding: 8,
          background: 'var(--ds-color-primary-100, #e8e0ff)',
          borderRadius: 4,
        }}
      >
        <Text size="sm">Item 3</Text>
      </Box>
    </Stack>
  ),
};
