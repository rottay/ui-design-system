import type { CSSProperties, ReactNode } from 'react';
import { ShowroomLink as Link } from '@/composition/components/showroom-link';
import { Badge, Box, Flex, Stack, Text } from '@rottay/design-system';
import {
  primitiveCategories,
  primitives,
  primitivesByCategory,
} from '@/data/registry';
import type {
  PrimitiveCategory,
  PrimitiveEntry,
} from '@/data/registry';
import { CodeBlock, EngineComparison, PropTable } from '@/composition/components/playground';
import type { PropDefinition } from '@/composition/components/playground';
import {
  SHOWROOM_SURFACES,
  mixWithCanvas,
  mixWithSurface,
} from '@/composition/components/playground/surface-tokens';
import { LivePreview } from './live-preview';

const CATEGORY_GUIDANCE: Record<
  PrimitiveCategory,
  {
    promise: string;
    inspect: string[];
    useWhen: string[];
    pairsWith: string[];
    runtime: string;
  }
> = {
  display: {
    promise:
      'Display primitives should prove hierarchy, density control, and empty-state discipline.',
    inspect: ['readability', 'content hierarchy', 'fallback handling'],
    useWhen: ['presenting status', 'showing metadata', 'framing read-only content'],
    pairsWith: ['patterns', 'detail views', 'dashboard modules'],
    runtime: 'Content-first primitives that need to remain elegant under every engine and theme.',
  },
  inputs: {
    promise:
      'Input primitives should make capture, editing, and validation feel trustworthy at speed.',
    inspect: ['focus states', 'validation', 'keyboard ergonomics'],
    useWhen: ['capturing structured data', 'filtering collections', 'triggering actions'],
    pairsWith: ['form builders', 'toolbars', 'command surfaces'],
    runtime: 'Interactive controls that carry most of the UX friction if they are under-designed.',
  },
  feedback: {
    promise:
      'Feedback primitives should communicate risk, progress, and outcome without stealing attention.',
    inspect: ['severity mapping', 'timing', 'recovery affordances'],
    useWhen: ['showing system status', 'responding to async work', 'confirming user actions'],
    pairsWith: ['surfaces', 'multi-step flows', 'mutation-heavy pages'],
    runtime: 'These pieces define whether the system feels calm or chaotic under operational load.',
  },
  layout: {
    promise:
      'Layout primitives should create consistent rhythm and adaptability before product-specific styling appears.',
    inspect: ['spacing systems', 'alignment', 'responsive adaptation'],
    useWhen: ['assembling sections', 'creating page rhythm', 'defining responsive shells'],
    pairsWith: ['all tiers', 'surface recipes', 'content-heavy pages'],
    runtime: 'Foundational layout tools that make everything else look considered rather than improvised.',
  },
  navigation: {
    promise:
      'Navigation primitives should orient users immediately and keep mode switching predictable.',
    inspect: ['active states', 'context persistence', 'wayfinding'],
    useWhen: ['changing views', 'moving across hierarchy', 'supporting long-running tasks'],
    pairsWith: ['workspace structures', 'command surfaces', 'application shells'],
    runtime: 'These components carry the sense of place across the entire product.',
  },
  overlay: {
    promise:
      'Overlay primitives should interrupt cleanly, layer confidently, and leave clear escape routes.',
    inspect: ['anchoring', 'dismiss patterns', 'attention management'],
    useWhen: ['revealing extra context', 'confirming risk', 'supporting temporary flows'],
    pairsWith: ['actions', 'menus', 'guided onboarding'],
    runtime: 'Layered interaction is where the DS either feels premium or collapses into clutter.',
  },
};

const SPECIFIC_USAGE_SNIPPETS: Record<string, string> = {
  button: `<Button variant="primary" size="md">
  Create tenant
</Button>`,
  input: `<Input
  placeholder="Search users"
  value={query}
  onChange={(event) => setQuery(event.target.value)}
/>`,
  card: `<Card title="Revenue overview">
  <Text size="sm">This month is tracking 14% above target.</Text>
</Card>`,
  tabs: `<Tabs
  items={[
    { key: 'overview', label: 'Overview', children: <OverviewPanel /> },
    { key: 'activity', label: 'Activity', children: <ActivityPanel /> },
  ]}
/>`,
  modal: `<Modal open={isOpen} onCancel={closeModal} title="Archive project">
  <Text size="sm">Archived projects can be restored later.</Text>
</Modal>`,
  select: `<Select
  options={statusOptions}
  value={status}
  onChange={setStatus}
  placeholder="Choose a status"
/>`,
};

const SPECIFIC_PROPS: Record<string, PropDefinition[]> = {
  button: [
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'default' | 'ghost'",
      defaultValue: "'default'",
      required: false,
      description: 'Controls emphasis and visual intent for the action.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      defaultValue: "'md'",
      required: false,
      description: 'Adjusts touch target, typography, and spacing.',
    },
    {
      name: 'loading',
      type: 'boolean',
      defaultValue: 'false',
      required: false,
      description: 'Replaces the label with a pending treatment while work is in flight.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description: 'Visible button label or content.',
    },
  ],
  input: [
    {
      name: 'value',
      type: 'string',
      required: false,
      description: 'Controlled value for the field.',
    },
    {
      name: 'placeholder',
      type: 'string',
      required: false,
      description: 'Hint text shown before entry begins.',
    },
    {
      name: 'onChange',
      type: '(event) => void',
      required: false,
      description: 'Called when the user edits the value.',
    },
    {
      name: 'status',
      type: "'default' | 'error' | 'warning' | 'success'",
      defaultValue: "'default'",
      required: false,
      description: 'Applies validation styling and supporting color.',
    },
  ],
  card: [
    {
      name: 'title',
      type: 'ReactNode',
      required: false,
      description: 'Optional header content displayed above the body.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description: 'Primary content rendered inside the card container.',
    },
    {
      name: 'hoverable',
      type: 'boolean',
      defaultValue: 'false',
      required: false,
      description: 'Enables hover elevation and interactive affordances.',
    },
  ],
  tabs: [
    {
      name: 'items',
      type: 'Array<{ key: string; label: ReactNode; children: ReactNode }>',
      required: true,
      description: 'Tab definitions with labels and rendered panels.',
    },
    {
      name: 'activeKey',
      type: 'string',
      required: false,
      description: 'Controlled active tab key.',
    },
    {
      name: 'onChange',
      type: '(key: string) => void',
      required: false,
      description: 'Called when the active tab changes.',
    },
  ],
};

const PRIMITIVE_PREVIEW_NOTES = [
  'Compare hierarchy, spacing, and interaction feedback before any page-level styling.',
  'The rendered primitive should carry the engine and tenant differences by itself.',
  'If it only looks right inside local wrapper chrome, the primitive or preview needs more work.',
];

const PRIMITIVE_USAGE_NOTES = [
  'Import directly from the design system package and keep composition simple first.',
  'Use category-appropriate props before creating wrapper APIs that hide the base contract.',
  'Escalate to patterns or surfaces only when workflow logic clearly outweighs local UI concerns.',
];

function getCategoryLabel(slug: string): string {
  const category = primitiveCategories.find((item) => item.slug === slug);
  return category?.label ?? slug;
}

function getUsageSnippet(entry: PrimitiveEntry): string {
  const specific = SPECIFIC_USAGE_SNIPPETS[entry.slug];
  if (specific) {
    return specific;
  }

  switch (entry.category) {
    case 'display':
      return `<${entry.name}>
  <Text size="sm">Display your content with a stable, token-aware container.</Text>
</${entry.name}>`;
    case 'inputs':
      return `<${entry.name}
  aria-label="${entry.name}"
  placeholder="Start typing"
/>`;
    case 'feedback':
      return `<${entry.name}
  title="Changes saved"
  description="Your update was applied successfully."
/>`;
    case 'layout':
      return `<${entry.name} gap={16}>
  <Box>Primary content</Box>
  <Box>Supporting content</Box>
</${entry.name}>`;
    case 'navigation':
      return `<${entry.name}
  items={navigationItems}
  value={activeView}
  onChange={setActiveView}
/>`;
    case 'overlay':
      return `<${entry.name}
  open={isOpen}
  onOpenChange={setIsOpen}
>
  <Button>Open</Button>
</${entry.name}>`;
    default:
      return `<${entry.name} />`;
  }
}

function getPlaceholderProps(entry: PrimitiveEntry): PropDefinition[] {
  const specific = SPECIFIC_PROPS[entry.slug];
  if (specific) {
    return [
      ...specific,
      {
        name: 'className',
        type: 'string',
        required: false,
        description: 'Additional class names for product-specific extension points.',
      },
      {
        name: 'style',
        type: 'CSSProperties',
        required: false,
        description: 'Inline overrides for advanced composition or one-off layout tweaks.',
      },
    ];
  }

  const categoryProps: Record<PrimitiveCategory, PropDefinition[]> = {
    display: [
      {
        name: 'children',
        type: 'ReactNode',
        required: false,
        description: `Content rendered inside ${entry.name}.`,
      },
      {
        name: 'variant',
        type: 'string',
        required: false,
        description: 'Visual variant or treatment supported by the component.',
      },
      {
        name: 'emptyState',
        type: 'ReactNode',
        required: false,
        description: 'Fallback content when there is nothing meaningful to render.',
      },
    ],
    inputs: [
      {
        name: 'value',
        type: 'unknown',
        required: false,
        description: 'Controlled value for the input or selected item.',
      },
      {
        name: 'defaultValue',
        type: 'unknown',
        required: false,
        description: 'Initial uncontrolled value.',
      },
      {
        name: 'onChange',
        type: '(value) => void',
        required: false,
        description: 'Called whenever user input changes.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        defaultValue: 'false',
        required: false,
        description: 'Disables interaction and applies muted styling.',
      },
    ],
    feedback: [
      {
        name: 'status',
        type: 'string',
        required: false,
        description: 'Severity or state token that drives iconography and color.',
      },
      {
        name: 'message',
        type: 'ReactNode',
        required: false,
        description: 'Primary content presented to the user.',
      },
      {
        name: 'closable',
        type: 'boolean',
        defaultValue: 'false',
        required: false,
        description: 'Allows the user to dismiss the feedback element.',
      },
    ],
    layout: [
      {
        name: 'children',
        type: 'ReactNode',
        required: true,
        description: 'Layout children arranged by the component.',
      },
      {
        name: 'gap',
        type: 'number | string',
        required: false,
        description: 'Spacing between child elements.',
      },
      {
        name: 'align',
        type: 'string',
        required: false,
        description: 'Cross-axis alignment for layout primitives that support it.',
      },
    ],
    navigation: [
      {
        name: 'items',
        type: 'Array<NavigationItem>',
        required: false,
        description: 'Collection of routes, tabs, or actions to navigate between.',
      },
      {
        name: 'value',
        type: 'string',
        required: false,
        description: 'Controlled active key or selection.',
      },
      {
        name: 'onChange',
        type: '(value: string) => void',
        required: false,
        description: 'Invoked when the active route or mode changes.',
      },
    ],
    overlay: [
      {
        name: 'open',
        type: 'boolean',
        required: false,
        description: 'Controls whether the overlay is visible.',
      },
      {
        name: 'onOpenChange',
        type: '(open: boolean) => void',
        required: false,
        description: 'Notifies when the overlay opens or closes.',
      },
      {
        name: 'trigger',
        type: 'ReactNode',
        required: false,
        description: 'Element that anchors or launches the overlay.',
      },
    ],
  };

  return [
    ...categoryProps[entry.category],
    {
      name: 'className',
      type: 'string',
      required: false,
      description: 'Additional CSS class names.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      required: false,
      description: 'Inline style overrides.',
    },
  ];
}

function MetaCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Box
      style={{
        minWidth: 0,
        padding: 16,
        borderRadius: 18,
        border: `1px solid ${SHOWROOM_SURFACES.border}`,
        background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithSurface(
          'var(--ds-color-primary, #60a5fa)',
          7,
          SHOWROOM_SURFACES.subtle,
        )} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minHeight: 132,
      }}
    >
      <Text
        size="xs"
        weight="semibold"
        style={{
          display: 'block',
          color: SHOWROOM_SURFACES.textTertiary,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </Text>
      <Box style={{ paddingTop: 10, borderTop: `1px solid ${SHOWROOM_SURFACES.border}` }}>
        <Text
          size="sm"
          weight="semibold"
          style={{
            display: 'block',
            color: SHOWROOM_SURFACES.text,
            lineHeight: 1.15,
            overflowWrap: 'anywhere',
          }}
        >
          {value}
        </Text>
        <Text
          size="xs"
          style={{
            display: 'block',
            marginTop: 6,
            color: SHOWROOM_SURFACES.textSecondary,
            lineHeight: 1.5,
            overflowWrap: 'anywhere',
          }}
        >
          {detail}
        </Text>
      </Box>
    </Box>
  );
}

function ReferencePanel({
  children,
  style,
  subtle = false,
}: {
  children: ReactNode;
  style?: CSSProperties;
  subtle?: boolean;
}) {
  return (
    <Box
      style={{
        padding: 20,
        borderRadius: 22,
        border: `1px solid ${SHOWROOM_SURFACES.border}`,
        background: subtle
          ? `linear-gradient(180deg, ${SHOWROOM_SURFACES.subtle} 0%, ${mixWithCanvas(
              'var(--ds-color-primary, #60a5fa)',
              6,
            )} 100%)`
          : `linear-gradient(180deg, ${SHOWROOM_SURFACES.surface} 0%, ${mixWithSurface(
              'var(--ds-color-primary, #60a5fa)',
              6,
              SHOWROOM_SURFACES.surface,
            )} 100%)`,
        boxShadow: `0 16px 36px ${mixWithCanvas('var(--ds-color-shadow, rgba(15, 23, 42, 0.16))', 12)}`,
        color: SHOWROOM_SURFACES.text,
        ...style,
      }}
    >
      {children}
    </Box>
  );
}

function GuidanceCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <Box
      style={{
        height: '100%',
        padding: 16,
        borderRadius: 18,
        border: `1px solid ${SHOWROOM_SURFACES.border}`,
        background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.subtle} 0%, ${mixWithCanvas(
          'var(--ds-color-primary, #60a5fa)',
          5,
        )} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minHeight: 128,
      }}
    >
      <Stack spacing="sm">
        <Text
          size="xs"
          weight="semibold"
          style={{
            display: 'block',
            color: SHOWROOM_SURFACES.textTertiary,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {title}
        </Text>
        <Box style={{ paddingTop: 4 }}>
          <Stack spacing="xs">
            {items.map((item) => (
              <Box
                key={item}
                style={{
                  padding: '9px 12px',
                  borderRadius: 12,
                  border: `1px solid ${SHOWROOM_SURFACES.border}`,
                  background: SHOWROOM_SURFACES.surface,
                }}
              >
                <Text
                  size="sm"
                  style={{
                    display: 'block',
                    color: SHOWROOM_SURFACES.textSecondary,
                    lineHeight: 1.5,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {item}
                </Text>
              </Box>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

function SectionAsideCard({
  label,
  title,
  detail,
  footer,
}: {
  label: string;
  title: string;
  detail: string;
  footer?: string;
}) {
  return (
    <Box
      style={{
        height: '100%',
        padding: 16,
        borderRadius: 20,
        border: `1px solid ${SHOWROOM_SURFACES.borderStrong}`,
        background: `linear-gradient(180deg, ${mixWithSurface(
          'var(--ds-color-primary, #60a5fa)',
          8,
          SHOWROOM_SURFACES.subtle,
        )} 0%, ${SHOWROOM_SURFACES.surface} 100%)`,
        boxShadow: SHOWROOM_SURFACES.shadow,
      }}
    >
      <Stack spacing="sm">
        <Text
          size="xs"
          weight="semibold"
          style={{
            display: 'block',
            color: SHOWROOM_SURFACES.textTertiary,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {label}
        </Text>
        <Text
          size="md"
          weight="semibold"
          style={{
            display: 'block',
            color: SHOWROOM_SURFACES.text,
            lineHeight: 1.35,
            overflowWrap: 'anywhere',
          }}
        >
          {title}
        </Text>
        <Text
          size="sm"
          style={{
            display: 'block',
            color: SHOWROOM_SURFACES.textSecondary,
            lineHeight: 1.6,
            overflowWrap: 'anywhere',
          }}
        >
          {detail}
        </Text>
        {footer ? (
          <Box
            style={{
              marginTop: 2,
              paddingTop: 12,
              borderTop: `1px solid ${SHOWROOM_SURFACES.border}`,
            }}
          >
            <Text
              size="xs"
              style={{
                display: 'block',
                color: SHOWROOM_SURFACES.textTertiary,
                lineHeight: 1.5,
              }}
            >
              {footer}
            </Text>
          </Box>
        ) : null}
      </Stack>
    </Box>
  );
}

function CodeFrame({
  label,
  title,
  detail,
  children,
}: {
  label: string;
  title: string;
  detail: string;
  children: ReactNode;
}) {
  return (
    <Box
      className="primitive-code-frame"
      style={{
        padding: 14,
        borderRadius: 24,
        border: `1px solid ${SHOWROOM_SURFACES.border}`,
        background: `linear-gradient(180deg, ${mixWithCanvas(
          'var(--ds-color-primary, #60a5fa)',
          4,
        )} 0%, ${SHOWROOM_SURFACES.surface} 100%)`,
        boxShadow: `inset 0 1px 0 color-mix(in srgb, white 10%, transparent)`,
      }}
    >
      <Stack spacing="sm">
        <Box style={{ padding: '2px 4px 0' }}>
          <Text
            size="xs"
            weight="semibold"
            style={{
              display: 'block',
              color: SHOWROOM_SURFACES.textTertiary,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {label}
          </Text>
          <Text
            size="sm"
            weight="semibold"
            style={{
              display: 'block',
              marginTop: 6,
              color: SHOWROOM_SURFACES.text,
              lineHeight: 1.35,
            }}
          >
            {title}
          </Text>
          <Text
            size="xs"
            style={{
              display: 'block',
              marginTop: 6,
              color: SHOWROOM_SURFACES.textSecondary,
              lineHeight: 1.55,
            }}
          >
            {detail}
          </Text>
        </Box>
        {children}
      </Stack>
    </Box>
  );
}

function RelatedPrimitiveCard({
  sibling,
  categoryLabel,
}: {
  sibling: PrimitiveEntry;
  categoryLabel: string;
}) {
  return (
    <Box
      className="primitive-related-card"
      style={{
        height: '100%',
        padding: 16,
        borderRadius: 20,
        border: `1px solid ${SHOWROOM_SURFACES.border}`,
        background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.subtle} 0%, ${mixWithCanvas(
          'var(--ds-color-primary, #60a5fa)',
          5,
        )} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minHeight: 156,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
      }}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <Flex align="center" justify="between" gap={10} style={{ flexWrap: 'wrap' }}>
          <Text
            size="xs"
            weight="semibold"
            style={{
              display: 'block',
              color: SHOWROOM_SURFACES.textTertiary,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Also in {categoryLabel}
          </Text>
          <Text size="xs" style={{ color: SHOWROOM_SURFACES.textTertiary }}>
            {sibling.engines.length} engines
          </Text>
        </Flex>
        <Text
          size="md"
          weight="semibold"
          style={{
            display: 'block',
            color: SHOWROOM_SURFACES.text,
            lineHeight: 1.3,
            overflowWrap: 'anywhere',
          }}
        >
          {sibling.name}
        </Text>
        <Text
          size="sm"
          style={{
            display: 'block',
            color: SHOWROOM_SURFACES.textSecondary,
            lineHeight: 1.6,
            overflowWrap: 'anywhere',
          }}
        >
          {sibling.description}
        </Text>
      </Box>

      <Flex
        align="center"
        justify="between"
        gap={10}
        style={{
          paddingTop: 12,
          borderTop: `1px solid ${SHOWROOM_SURFACES.border}`,
          flexWrap: 'wrap',
        }}
      >
        <Text size="xs" style={{ color: SHOWROOM_SURFACES.textSecondary }}>
          Peer primitive within the same category set.
        </Text>
        <Text
          size="xs"
          weight="semibold"
          style={{
            display: 'block',
            color: SHOWROOM_SURFACES.text,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Open detail
        </Text>
      </Flex>
    </Box>
  );
}

export function generateStaticParams() {
  return primitives.map((primitive) => ({
    category: primitive.category,
    component: primitive.slug,
  }));
}

export default async function PrimitiveComponentPage({
  params,
}: {
  params: Promise<{ category: string; component: string }>;
}) {
  const { category, component } = await params;
  const categoryKey = category as PrimitiveCategory;
  const categoryLabel = getCategoryLabel(category);

  const entry = (primitivesByCategory[categoryKey] ?? []).find(
    (primitive) => primitive.slug === component,
  );

  if (!entry) {
    return (
      <ReferencePanel
        style={{
          padding: 28,
          border: '1px dashed var(--ds-color-border, #d1d5db)',
        }}
      >
        <Stack spacing="md">
          <Text as={"h1" as any} size="2xl" weight="bold">
            Component not found
          </Text>
          <Text size="md" style={{ color: 'var(--ds-color-text-secondary)' }}>
            No component matches &quot;{component}&quot; in {categoryLabel}.
          </Text>
          <Link
            href={`/primitives/${category}`}
            style={{
              color: 'var(--ds-color-primary)',
              textDecoration: 'none',
            }}
          >
            Back to {categoryLabel}
          </Link>
        </Stack>
      </ReferencePanel>
    );
  }

  const guidance = CATEGORY_GUIDANCE[entry.category];
  const importStatement = `import { ${entry.name} } from '@rottay/design-system';`;
  const usageSnippet = getUsageSnippet(entry);
  const placeholderProps = getPlaceholderProps(entry);
  const requiredPropsCount = placeholderProps.filter((prop) => prop.required).length;
  const optionalPropsCount = placeholderProps.length - requiredPropsCount;
  const siblingEntries = (primitivesByCategory[categoryKey] ?? [])
    .filter((primitive) => primitive.slug !== entry.slug)
    .slice(0, 4);

  return (
    <Stack spacing="lg" fullWidth>
      <ReferencePanel>
        <Stack spacing="md">
          <Box
            className="primitive-component-header-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.35fr) minmax(280px, 0.95fr)',
              gap: 16,
              alignItems: 'start',
            }}
          >
            <Stack spacing="sm">
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: 'block',
                  color: 'var(--ds-color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Reference summary
              </Text>
              <Text
                size="lg"
                weight="semibold"
                style={{
                  display: 'block',
                  color: 'var(--ds-color-text-primary)',
                  lineHeight: 1.45,
                }}
              >
                {entry.description}
              </Text>
              <Text
                size="sm"
                style={{
                  display: 'block',
                  color: 'var(--ds-color-text-secondary)',
                  lineHeight: 1.6,
                  maxWidth: '62ch',
                }}
              >
                {guidance.promise}
              </Text>

              <Box
                style={{
                  padding: '14px 16px',
                  borderRadius: 18,
                  border: `1px solid ${SHOWROOM_SURFACES.border}`,
                  background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.subtle} 0%, ${mixWithCanvas(
                    'var(--ds-color-primary, #60a5fa)',
                    4,
                  )} 100%)`,
                }}
              >
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    display: 'block',
                    color: 'var(--ds-color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  How to read this page
                </Text>
                <Text
                  size="sm"
                  style={{
                    display: 'block',
                    marginTop: 8,
                    color: 'var(--ds-color-text-secondary)',
                    lineHeight: 1.55,
                  }}
                >
                  Use the showroom switchers in the sidebar to change engine and tenant, then
                  judge this primitive in the live preview before styling around it locally.
                </Text>
              </Box>
            </Stack>

            <Box
              style={{
                display: 'grid',
                gap: 10,
              }}
            >
              <Box
                style={{
                  padding: 12,
                  borderRadius: 16,
                  border: `1px solid ${SHOWROOM_SURFACES.border}`,
                  background: SHOWROOM_SURFACES.subtle,
                }}
              >
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    display: 'block',
                    color: SHOWROOM_SURFACES.textTertiary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  At a glance
                </Text>
                <Text
                  size="sm"
                  style={{
                    display: 'block',
                    marginTop: 8,
                    color: 'var(--ds-color-text-secondary)',
                    lineHeight: 1.55,
                  }}
                >
                  The meta cards below are the quickest read on how this primitive behaves across
                  the current runtime.
                </Text>
              </Box>

              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: 12,
                }}
              >
                <MetaCard
                  label="Tier"
                  value="Primitive"
                  detail="The lowest reusable UI contract."
                />
                <MetaCard label="Category" value={categoryLabel} detail={guidance.runtime} />
                <MetaCard
                  label="Best paired with"
                  value={guidance.pairsWith[0]}
                  detail="Escalate to patterns or surfaces when workflow logic starts dominating."
                />
              </Box>
            </Box>
          </Box>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 12,
            }}
          >
            <GuidanceCard title="Use it when" items={guidance.useWhen} />
            <GuidanceCard title="Review checklist" items={guidance.inspect} />
            <GuidanceCard title="Common pairings" items={guidance.pairsWith} />
          </Box>
        </Stack>
      </ReferencePanel>

      <ReferencePanel>
        <Stack spacing="md">
          <Flex align="center" justify="between" gap={12} style={{ flexWrap: 'wrap' }}>
            <Box>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: 'block',
                  color: 'var(--ds-color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Live preview
              </Text>
              <Text as={"h2" as any} size="lg" weight="semibold" style={{ display: 'block' }}>
                Compare the same primitive across engines
              </Text>
            </Box>
            <Flex gap={8} style={{ flexWrap: 'wrap' }}>
              <Badge variant="secondary">Sidebar controls drive this</Badge>
              <Badge variant="secondary">{entry.name}</Badge>
            </Flex>
          </Flex>

          <Text
            size="sm"
            style={{
              display: 'block',
              color: 'var(--ds-color-text-secondary)',
              lineHeight: 1.55,
            }}
          >
            This is the primary runtime verification surface for the component. Engine and tenant
            changes should land in the rendered DS primitive itself, not in showroom-local wrapper
            styling.
          </Text>

          <GuidanceCard title="Preview heuristics" items={PRIMITIVE_PREVIEW_NOTES} />

          <EngineComparison>
            <LivePreview slug={component} />
          </EngineComparison>
        </Stack>
      </ReferencePanel>

      <ReferencePanel subtle>
        <Stack spacing="md">
          <Box
            className="primitive-detail-section-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)',
              gap: 16,
              alignItems: 'start',
            }}
          >
            <Box>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: 'block',
                  color: 'var(--ds-color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Consumption
              </Text>
              <Text as={"h2" as any} size="lg" weight="semibold" style={{ display: 'block' }}>
                Import and usage
              </Text>
              <Text
                size="sm"
                style={{
                  display: 'block',
                  marginTop: 6,
                  color: 'var(--ds-color-text-secondary)',
                  lineHeight: 1.55,
                }}
              >
                Keep the primitive contract visible. These snippets are meant to help teams consume
                the base component before they wrap or escalate it.
              </Text>
              <Link
                href={`/primitives/${category}`}
                style={{ display: 'inline-block', marginTop: 12, textDecoration: 'none' }}
              >
                <Text size="sm" weight="semibold" style={{ color: 'var(--ds-color-primary)' }}>
                  Browse all {categoryLabel}
                </Text>
              </Link>
            </Box>
            <SectionAsideCard
              label="Adoption posture"
              title={`Start with ${entry.name}, not a wrapper`}
              detail={`Import directly from the design system package, verify the base behavior across ${entry.engines.length} engines here, and only wrap when workflow logic starts repeating.`}
              footer="The primitive should stay legible before any page-specific chrome is layered on top."
            />
          </Box>

          <Box
            className="primitive-detail-section-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 0.85fr)',
              gap: 16,
              alignItems: 'stretch',
            }}
          >
            <GuidanceCard title="Usage notes" items={PRIMITIVE_USAGE_NOTES} />
            <SectionAsideCard
              label="Published entrypoint"
              title="@rottay/design-system"
              detail={`Use the shared package surface as the default import path for ${entry.name}. It keeps adoption readable and future extraction work straightforward.`}
              footer={`Base tier: ${categoryLabel}`}
            />
          </Box>

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 20,
              alignItems: 'start',
            }}
          >
            <CodeFrame
              label="Entrypoint"
              title="Keep imports direct"
              detail="Reach for the published DS export first so teams can read the contract at a glance."
            >
              <CodeBlock code={importStatement} language="tsx" title="Import" />
            </CodeFrame>
            <CodeFrame
              label="Baseline example"
              title={`Start with ${entry.name}`}
              detail="Use the smallest valid composition first, then layer in product-specific wrappers only when the workflow truly needs them."
            >
              <CodeBlock code={usageSnippet} language="tsx" title="Usage" />
            </CodeFrame>
          </Box>
        </Stack>
      </ReferencePanel>

      <ReferencePanel>
        <Stack spacing="md">
          <Box
            className="primitive-detail-section-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)',
              gap: 16,
              alignItems: 'start',
            }}
          >
            <Box>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: 'block',
                  color: 'var(--ds-color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                API surface
              </Text>
              <Text as={"h2" as any} size="lg" weight="semibold" style={{ display: 'block' }}>
                Props
              </Text>
              <Text
                size="sm"
                style={{
                  display: 'block',
                  marginTop: 6,
                  color: 'var(--ds-color-text-secondary)',
                  lineHeight: 1.55,
                }}
              >
                Curated reference for fast browsing. Verify edge-case props against the source until
                this table is extracted directly from the DS.
              </Text>
            </Box>
            <SectionAsideCard
              label="Reference scan"
              title={`${placeholderProps.length} documented props`}
              detail={`${requiredPropsCount} required and ${optionalPropsCount} optional rows are listed here so teams can review the contract without digging through source immediately.`}
              footer="Confirm uncommon edge cases against the component implementation until this table is extracted automatically."
            />
          </Box>
          <Box
            style={{
              padding: 14,
              borderRadius: 26,
              border: `1px solid ${SHOWROOM_SURFACES.border}`,
              background: `linear-gradient(180deg, ${mixWithCanvas(
                'var(--ds-color-primary, #60a5fa)',
                4,
              )} 0%, ${SHOWROOM_SURFACES.surface} 100%)`,
            }}
          >
            <Box style={{ padding: '0 4px 14px' }}>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: 'block',
                  color: SHOWROOM_SURFACES.textTertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Reference discipline
              </Text>
              <Text
                size="sm"
                style={{
                  display: 'block',
                  marginTop: 8,
                  color: SHOWROOM_SURFACES.textSecondary,
                  lineHeight: 1.55,
                }}
              >
                The table below is tuned for quick scanning in docs. For unusual composition or
                engine-specific behavior, treat the DS source as the final authority.
              </Text>
            </Box>
            <PropTable title={`${entry.name} props`} props={placeholderProps} />
          </Box>
        </Stack>
      </ReferencePanel>

      {siblingEntries.length ? (
        <ReferencePanel subtle>
          <Stack spacing="md">
            <Box
              className="primitive-detail-section-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)',
                gap: 16,
                alignItems: 'start',
              }}
            >
              <Box>
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    display: 'block',
                    color: 'var(--ds-color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Related components
                </Text>
                <Text as={"h2" as any} size="lg" weight="semibold" style={{ display: 'block' }}>
                  Continue within {categoryLabel}
                </Text>
                <Text
                  size="sm"
                  style={{
                    display: 'block',
                    marginTop: 6,
                    color: 'var(--ds-color-text-secondary)',
                    lineHeight: 1.55,
                    maxWidth: '58ch',
                  }}
                >
                  If {entry.name} is close but not quite right, scan nearby primitives in the same
                  tier before jumping to a heavier surface or pattern abstraction.
                </Text>
                <Link
                  href={`/primitives/${category}`}
                  style={{ display: 'inline-block', marginTop: 12, textDecoration: 'none' }}
                >
                  <Text size="sm" weight="semibold" style={{ color: 'var(--ds-color-primary)' }}>
                    Browse all {categoryLabel}
                  </Text>
                </Link>
              </Box>
              <SectionAsideCard
                label="Next move"
                title={`Stay within ${categoryLabel} first`}
                detail="Category siblings usually solve adjacent states while preserving the same primitive contract level and runtime expectations."
                footer="Escalate to patterns or surfaces only when the interaction model itself changes."
              />
            </Box>

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 12,
              }}
            >
              {siblingEntries.map((sibling) => (
                <Link
                  key={sibling.slug}
                  href={`/primitives/${category}/${sibling.slug}`}
                  className="primitive-related-link"
                  style={{ display: 'block', height: '100%', textDecoration: 'none' }}
                >
                  <RelatedPrimitiveCard sibling={sibling} categoryLabel={categoryLabel} />
                </Link>
              ))}
            </Box>
          </Stack>
        </ReferencePanel>
      ) : null}

      <style>{`
        @media (max-width: 1540px) {
          .primitive-component-header-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 1180px) {
          .primitive-detail-section-grid {
            grid-template-columns: 1fr;
          }
        }

        .primitive-related-link:focus-visible {
          outline: none;
        }

        .primitive-related-link:hover .primitive-related-card,
        .primitive-related-link:focus-visible .primitive-related-card {
          transform: translateY(-3px);
          border-color: ${SHOWROOM_SURFACES.borderStrong};
          box-shadow: 0 20px 44px ${mixWithCanvas(
            'var(--ds-color-shadow, rgba(15, 23, 42, 0.16))',
            14,
          )};
        }
      `}</style>
    </Stack>
  );
}
