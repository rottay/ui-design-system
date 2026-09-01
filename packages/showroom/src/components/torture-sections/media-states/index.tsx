'use client';

import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Carousel,
  Empty,
  Image,
  Kbd,
  QRCode,
  Stack,
  Tag,
  Text,
} from '@rottay/design-system';
import { Icon } from '@rottay/design-system/icons';

// Fixed fixtures for the WO-SKIN-05 checkpoint D1 surfaces+media data-part
// probe (Card, Image, Carousel, QRCode, Avatar, Badge, Tag, Kbd, Empty).
// Every instance below is deterministic: forced variant/status/size props, a
// `src=""` Image permanently pinned in its `loading` status (per the HTML
// spec an empty `src` queues no request, so neither load nor error ever
// fires), and a syntactically invalid data-URI Image pinned in `error`
// (decode failure is synchronous -- no network, no flake). Rendered only
// behind `?mediaStates=1` so no flagship capture sees it. This page is the
// visual-evidence half; the contract test renders its own fixtures directly
// through React Testing Library.
//
// The Avatar row is the D1.1 mandatory baseline (P-75): xs/md/xl sizes are
// photographed as-is, unfixed, so the shipped 40x40 clip (xl gets cropped)
// and halo (xs shows the container's tint around a too-small child) are both
// captured before anyone touches that component.
const MEDIA_STATE_VALID_IMG =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjNGY0NmU1Ii8+PC9zdmc+';
const MEDIA_STATE_BROKEN_IMG = 'data:image/png;base64,not-a-real-image';

export function MediaStates() {
  return (
    <Box
      data-testid="probe-media-states"
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
        <Stack spacing="xs" data-testid="probe-media-states-card">
          <Text size="xs" color="secondary">
            Card
          </Text>
          <Stack spacing="sm">
            <Card variant="elevated" title="Elevated" description="Rest state" />
            <Card
              variant="outlined"
              title="Outlined"
              hoverable
              divider
              actions={[
                <Button key="a" size="xs">
                  Action
                </Button>,
              ]}
            />
            <Card variant="filled" colorVariant="success" title="Toned" clickable onClick={() => undefined} />
            <Card variant="ghost" loading title="Loading" />
            <Card.Header
              title="Header title"
              subtitle="Header subtitle"
              divider
              avatar={<Avatar size="sm" name="AB" />}
              extra={<Button size="xs">Extra</Button>}
            />
            <Card.Body padding="sm">Body content</Card.Body>
            <Card.Footer
              divider
              align="space-between"
              actions={[
                <Button key="f" size="xs">
                  Save
                </Button>,
              ]}
            />
            <Card.Image
              src={MEDIA_STATE_VALID_IMG}
              alt="Cover"
              height={64}
              overlay={<Badge variant="success" content="New" />}
              gradient
            />
          </Stack>
        </Stack>

        <Stack spacing="xs" data-testid="probe-media-states-image">
          <Text size="xs" color="secondary">
            Image (loaded / loading / error)
          </Text>
          <Box style={{ display: 'flex', gap: 8 }}>
            <Image src={MEDIA_STATE_VALID_IMG} alt="Loaded" width={64} height={64} bordered shadow />
            <Image src="" alt="Loading" width={64} height={64} />
            <Image src={MEDIA_STATE_BROKEN_IMG} alt="Errored" width={64} height={64} />
            <Image
              src={MEDIA_STATE_VALID_IMG}
              alt="Zoomable"
              width={64}
              height={64}
              zoomable
              hoverOverlay={<Text size="xs">View</Text>}
            />
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-media-states-carousel">
          <Text size="xs" color="secondary">
            Carousel
          </Text>
          <Box style={{ position: 'relative', height: 120 }}>
            <Carousel arrows dots>
              <div
                style={{
                  background: 'var(--ds-color-primary)',
                  width: '100%',
                  height: '100%',
                }}
              />
              <div
                style={{
                  background: 'var(--ds-color-secondary)',
                  width: '100%',
                  height: '100%',
                }}
              />
              <div
                style={{
                  background: 'var(--ds-color-success)',
                  width: '100%',
                  height: '100%',
                }}
              />
            </Carousel>
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-media-states-qrcode">
          <Text size="xs" color="secondary">
            QRCode (active / loading / expired / scanned)
          </Text>
          <Box style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <QRCode value="https://rottay.com" size={72} bordered />
            <QRCode value="https://rottay.com" size={72} status="loading" />
            <QRCode value="https://rottay.com" size={72} status="expired" onRefresh={() => undefined} />
            <QRCode value="https://rottay.com" size={72} status="scanned" />
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-media-states-avatar">
          <Text size="xs" color="secondary">
            Avatar (xs / md / xl -- P-75 clip/halo baseline, unfixed)
          </Text>
          <Box style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Avatar size="xs" name="AB" />
            <Avatar size="md" name="CD" />
            <Avatar size="xl" name="EF" />
            <Avatar size="md" name="GH" status="online" bordered />
            <Avatar.Badge status="busy">
              <Avatar size="md" name="IJ" />
            </Avatar.Badge>
            <Avatar.Group max={2}>
              <Avatar name="A1" />
              <Avatar name="A2" />
              <Avatar name="A3" />
            </Avatar.Group>
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-media-states-badge">
          <Text size="xs" color="secondary">
            Badge
          </Text>
          <Box
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <Badge variant="primary" content="Solid" badgeStyle="solid" />
            <Badge variant="success" content="Soft" badgeStyle="soft" />
            <Badge variant="warning" content="Outline" badgeStyle="outline" bordered />
            <Badge variant="error" dot />
            <Badge tone="info" content="Closable" closable onClose={() => undefined} />
            <Badge variant="primary" count={5}>
              <Box
                style={{
                  width: 32,
                  height: 32,
                  background: 'var(--ds-surface-panel)',
                  borderRadius: 6,
                }}
              />
            </Badge>
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-media-states-tag">
          <Text size="xs" color="secondary">
            Tag
          </Text>
          <Box style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Tag variant="default">Default</Tag>
            <Tag variant="primary" outlined>
              Outlined
            </Tag>
            <Tag variant="success" bordered>
              Bordered
            </Tag>
            <Tag variant="warning" closable onClose={() => undefined}>
              Closable
            </Tag>
            <Tag variant="error" clickable onClick={() => undefined} icon={<Icon name="entity.tag" decorative />}>
              Clickable
            </Tag>
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-media-states-kbd">
          <Text size="xs" color="secondary">
            Kbd
          </Text>
          <Box style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Kbd size="sm">Shift</Kbd>
            <Kbd size="md">Ctrl</Kbd>
            <Kbd size="lg">Enter</Kbd>
          </Box>
        </Stack>

        <Stack spacing="xs" data-testid="probe-media-states-empty">
          <Text size="xs" color="secondary">
            Empty
          </Text>
          <Box style={{ display: 'flex', gap: 16 }}>
            <Empty description="No records" image="default">
              <Button size="xs">Create</Button>
            </Empty>
            <Empty description="Nothing to show" image="simple" />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
