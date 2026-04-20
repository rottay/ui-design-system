'use client';

import Link from 'next/link';
import { Box, Flex, Stack, Text, Card, Badge } from '@rottay/design-system';
import { useTokens } from '@rottay/design-system';

interface PrimitiveCategory {
  title: string;
  description: string;
  href: string;
  componentCount: number;
  components: string[];
}

const PRIMITIVE_CATEGORIES: PrimitiveCategory[] = [
  {
    title: 'Display',
    description: 'Visual presentation components for showing data, media, and structured content.',
    href: '/primitives/display',
    componentCount: 20,
    components: [
      'Avatar', 'Badge', 'Calendar', 'Callout', 'Card', 'Carousel',
      'Descriptions', 'Empty', 'Image', 'Kbd', 'List', 'QRCode',
      'Statistic', 'Table', 'Tag', 'Timeline', 'Tooltip', 'Tree',
      'Typography',
    ],
  },
  {
    title: 'Inputs',
    description: 'Form controls and interactive elements for capturing user input.',
    href: '/primitives/inputs',
    componentCount: 26,
    components: [
      'AutoComplete', 'Button', 'Cascader', 'Checkbox', 'ColorPicker',
      'DatePicker', 'Form', 'FormField', 'Input', 'InputNumber',
      'Mentions', 'OTPInput', 'PasswordInput', 'Radio', 'Select',
      'Slider', 'Switch', 'TagInput', 'Textarea', 'TimePicker',
      'Toggle', 'Transfer', 'TreeSelect', 'Upload', 'VoiceInputButton',
    ],
  },
  {
    title: 'Feedback',
    description: 'Components for communicating status, progress, and user notifications.',
    href: '/primitives/feedback',
    componentCount: 12,
    components: [
      'Alert', 'Drawer', 'Message', 'Modal', 'Notification',
      'Progress', 'Rate', 'Result', 'Skeleton', 'Spinner',
      'Toast',
    ],
  },
  {
    title: 'Layout',
    description: 'Structural components for arranging content, managing space, and responsive design.',
    href: '/primitives/layout',
    componentCount: 17,
    components: [
      'AspectRatio', 'Box', 'Collapse', 'Container', 'Divider',
      'Flex', 'Grid', 'Hide', 'Layout', 'ResponsiveSlot',
      'ScrollArea', 'Show', 'Space', 'Splitter', 'Stack',
    ],
  },
  {
    title: 'Navigation',
    description: 'Components for moving between views, pages, and hierarchical content.',
    href: '/primitives/navigation',
    componentCount: 18,
    components: [
      'ActionDock', 'Affix', 'Anchor', 'BackTop', 'BottomTabBar',
      'Breadcrumb', 'FloatButton', 'Link', 'Menu', 'MobileHeader',
      'Pagination', 'Segmented', 'Stepper', 'Steps', 'Tabs',
    ],
  },
  {
    title: 'Overlay',
    description: 'Components that render above the page content in portals or layers.',
    href: '/primitives/overlay',
    componentCount: 13,
    components: [
      'AdaptiveOverlay', 'AlertDialog', 'ConfirmDialog', 'ContextMenu',
      'Dropdown', 'HoverCard', 'Modal', 'Popconfirm', 'Popover',
      'Sheet', 'Tour', 'Watermark',
    ],
  },
];

export default function PrimitivesPage() {
  const tokens = useTokens();
  const totalComponents = PRIMITIVE_CATEGORIES.reduce((sum, cat) => sum + cat.componentCount, 0);

  return (
    <Stack spacing="lg">
      {/* Page header */}
      <Box>
        <Flex align="center" gap={8}>
          <Text as={"h1" as any} size="2xl" weight="bold">
            Primitives
          </Text>
          <Badge variant="primary">{totalComponents} components</Badge>
        </Flex>
        <Box style={{ marginTop: tokens.spacing[2] }}>
          <Text size="md" style={{ color: "var(--ds-color-text-secondary)" }}>
            Primitives are the smallest reusable UI building blocks. Each
            primitive has engine-specific implementations (Classic, Modern,
            Rustic) selected at runtime via createEngineComponent(). They solve
            local UI behavior and styling, not page-level tasks.
          </Text>
        </Box>
      </Box>

      {/* Category cards */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: tokens.spacing[5],
        }}
      >
        {PRIMITIVE_CATEGORIES.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            style={{ textDecoration: 'none' }}
          >
            <Card
              hoverable
              style={{
                height: '100%',
                cursor: 'pointer',
                transition: 'box-shadow 200ms ease, transform 200ms ease',
              }}
            >
              <Stack spacing="md">
                <Flex align="center" justify="between">
                  <Text as={"h3" as any} size="lg" weight="semibold">
                    {cat.title}
                  </Text>
                  <Badge>{cat.componentCount} components</Badge>
                </Flex>

                <Text size="sm" style={{ color: "var(--ds-color-text-secondary)" }}>
                  {cat.description}
                </Text>

                {/* Component list */}
                <Flex gap={4} style={{ flexWrap: 'wrap' }}>
                  {cat.components.slice(0, 8).map((name) => (
                    <Box
                      key={name}
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: 'var(--ds-color-neutral-100)',
                        fontSize: '0.75rem',
                        color: 'var(--ds-color-text-secondary)',
                        fontFamily: 'var(--font-geist-mono)',
                      }}
                    >
                      {name}
                    </Box>
                  ))}
                  {cat.components.length > 8 && (
                    <Box
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: 'var(--ds-color-primary-50)',
                        fontSize: '0.75rem',
                        color: 'var(--ds-color-primary-600)',
                        fontWeight: 500,
                      }}
                    >
                      +{cat.components.length - 8} more
                    </Box>
                  )}
                </Flex>
              </Stack>
            </Card>
          </Link>
        ))}
      </Box>

      {/* Mental model */}
      <Card>
        <Stack spacing="md">
          <Text as={"h3" as any} size="lg" weight="semibold">
            What Makes a Primitive?
          </Text>
          <Text size="sm" style={{ color: "var(--ds-color-text-secondary)" }}>
            A primitive is a leaf component with an engine switch. It is the
            smallest reusable UI piece -- a brick. If the piece is not a leaf
            component, or if it solves a repeatable task involving multiple
            components, it belongs in Patterns instead.
          </Text>
          <Flex gap={tokens.spacing[5]} style={{ flexWrap: 'wrap' }}>
            {[
              { label: 'Engine-switched', detail: '4 implementations per primitive' },
              { label: 'Self-contained', detail: 'No knowledge of page layout' },
              { label: 'Token-aware', detail: 'Uses CSS variables for theming' },
              { label: 'Composable', detail: 'Building blocks for patterns' },
            ].map((item) => (
              <Box key={item.label} style={{ flex: '1 1 200px' }}>
                <Text size="sm" weight="semibold">{item.label}</Text>
                <Text size="xs" style={{ color: "var(--ds-color-text-muted)" }}>{item.detail}</Text>
              </Box>
            ))}
          </Flex>
        </Stack>
      </Card>
    </Stack>
  );
}
