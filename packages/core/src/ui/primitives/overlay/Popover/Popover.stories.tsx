/**
 * Popover Stories
 * Colocated with component following approved architecture.
 *
 * @module Popover/stories
 * @description Storybook stories for the Popover component demonstrating
 * all features, variants, placements, and engine implementations.
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Popover } from './';
import { Badge } from '../../display/Badge';
import { Text } from '../../display/Typography';
import { Button } from '../../inputs/Button';
import { Stack } from '../../layout/Stack';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';
import { EngineComparison as EngineComparisonHelper } from '../../../../../.storybook/helpers';

/**
 * Popover component metadata for Storybook.
 * Configures controls, decorators, and documentation.
 */
const meta: Meta<typeof Popover> = {
  title: 'Primitives/Overlay/Popover',
  component: Popover,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <div style={{ padding: '150px', display: 'flex', justifyContent: 'center' }}>
          <Story />
        </div>
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
Popover component for displaying floating content with rich formatting.
Supports multiple placement positions, trigger types, and content configurations.

**Features:**
- 12 placement positions
- Multiple trigger types (hover, click, focus)
- Title and content sections
- Controlled and uncontrolled modes
- Configurable show/hide delays
- Arrow indicator support
- Three engine implementations (Classic, Modern, Rustic)
        `,
      },
    },
  },
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'top', 'topLeft', 'topRight',
        'bottom', 'bottomLeft', 'bottomRight',
        'left', 'leftTop', 'leftBottom',
        'right', 'rightTop', 'rightBottom',
      ],
      description: 'Position of the popover relative to the trigger element',
    },
    trigger: {
      control: 'select',
      options: ['hover', 'click', 'focus'],
      description: 'How the popover is triggered',
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine to use',
    },
    arrow: {
      control: 'boolean',
      description: 'Whether to show the arrow indicator',
    },
    recipe: {
      control: 'select',
      options: ['minimal', 'bordered', 'inverse', 'rich'],
      description: 'Coordinated material and density recipe in Modern',
    },
    touchBehavior: {
      control: 'select',
      options: ['toggle', 'none'],
      description: 'Touch fallback for a hover/focus-only popover',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Popover>;

/**
 * Default popover with basic configuration.
 */
export const Default: Story = {
  args: {
    content: 'This is the popover content',
    title: 'Popover Title',
    children: <button style={{ padding: '8px 16px', cursor: 'pointer' }}>Hover me</button>,
    placement: 'top',
  },
};

/**
 * Popover placements demonstration.
 */
export const Placements: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '80px', width: '500px' }}>
      {/* Top row */}
      <Popover content="Top Left" placement="topLeft">
        <button style={{ padding: '8px 16px', width: '100%' }}>TL</button>
      </Popover>
      <Popover content="Top" placement="top">
        <button style={{ padding: '8px 16px', width: '100%' }}>Top</button>
      </Popover>
      <Popover content="Top Right" placement="topRight">
        <button style={{ padding: '8px 16px', width: '100%' }}>TR</button>
      </Popover>

      {/* Middle row */}
      <Popover content="Left" placement="left">
        <button style={{ padding: '8px 16px', width: '100%' }}>Left</button>
      </Popover>
      <div />
      <Popover content="Right" placement="right">
        <button style={{ padding: '8px 16px', width: '100%' }}>Right</button>
      </Popover>

      {/* Bottom row */}
      <Popover content="Bottom Left" placement="bottomLeft">
        <button style={{ padding: '8px 16px', width: '100%' }}>BL</button>
      </Popover>
      <Popover content="Bottom" placement="bottom">
        <button style={{ padding: '8px 16px', width: '100%' }}>Bottom</button>
      </Popover>
      <Popover content="Bottom Right" placement="bottomRight">
        <button style={{ padding: '8px 16px', width: '100%' }}>BR</button>
      </Popover>
    </div>
  ),
};

/**
 * Trigger types demonstration.
 */
export const TriggerTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Popover content="Hover triggered" title="Hover" trigger="hover">
        <button style={{ padding: '8px 16px' }}>Hover</button>
      </Popover>
      <Popover content="Click triggered" title="Click" trigger="click">
        <button style={{ padding: '8px 16px' }}>Click</button>
      </Popover>
      <Popover content="Focus triggered" title="Focus" trigger="focus">
        <button style={{ padding: '8px 16px' }}>Focus (Tab)</button>
      </Popover>
    </div>
  ),
};

/**
 * With title demonstration.
 */
export const WithTitle: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Popover content="Content without title">
        <button style={{ padding: '8px 16px' }}>No Title</button>
      </Popover>
      <Popover content="Content with title" title="Popover Title">
        <button style={{ padding: '8px 16px' }}>With Title</button>
      </Popover>
    </div>
  ),
};

/**
 * Rich content demonstration.
 */
export const RichContent: Story = {
  render: () => (
    <Popover
      title="User Profile"
      content={
        <div style={{ minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1677ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              JD
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>John Doe</div>
              <div style={{ fontSize: '12px', color: '#666' }}>john@example.com</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ flex: 1, padding: '4px 8px', cursor: 'pointer' }}>Message</button>
            <button style={{ flex: 1, padding: '4px 8px', cursor: 'pointer' }}>Follow</button>
          </div>
        </div>
      }
    >
      <button style={{ padding: '8px 16px' }}>User Card</button>
    </Popover>
  ),
};

/**
 * Arrow options demonstration.
 */
export const ArrowOptions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Popover content="With arrow" title="Arrow" arrow={true}>
        <button style={{ padding: '8px 16px' }}>With Arrow</button>
      </Popover>
      <Popover content="Without arrow" title="No Arrow" arrow={false}>
        <button style={{ padding: '8px 16px' }}>No Arrow</button>
      </Popover>
    </div>
  ),
};

/**
 * Controlled mode demonstration.
 */
export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        <Popover
          content="Controlled popover content"
          title="Controlled"
          open={open}
          onOpenChange={setOpen}
          trigger="click"
        >
          <button style={{ padding: '8px 16px' }}>Click to toggle</button>
        </Popover>
        <button onClick={() => setOpen(!open)} style={{ padding: '4px 8px' }}>
          External Toggle: {open ? 'Close' : 'Open'}
        </button>
      </div>
    );
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Popover across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Popover rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Popover}
      props={{
        title: 'Popover Title',
        content: 'This is the popover content',
        children: <button style={{ padding: '8px 16px', cursor: 'pointer' }}>Hover me</button>,
      }}
      showDescriptions
    />
  ),
};

/**
 * Delay configuration demonstration.
 */
export const WithDelays: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Popover content="Instant" mouseEnterDelay={0} mouseLeaveDelay={0}>
        <button style={{ padding: '8px 16px' }}>Instant</button>
      </Popover>
      <Popover content="500ms show delay" mouseEnterDelay={500}>
        <button style={{ padding: '8px 16px' }}>500ms Show</button>
      </Popover>
      <Popover content="500ms hide delay" mouseLeaveDelay={500}>
        <button style={{ padding: '8px 16px' }}>500ms Hide</button>
      </Popover>
    </div>
  ),
};

/**
 * Adversarial material evidence. Every surface keeps the same anatomy; only
 * the bounded recipe changes coordinated paint, density and typography.
 */
export const PremiumRecipeMatrix: Story = {
  render: () => (
    <Stack direction="horizontal" spacing={112} wrap align="center">
      {(['minimal', 'bordered', 'inverse', 'rich'] as const).map((recipe, index) => (
        <Popover
          key={recipe}
          open
          trigger="click"
          placement="bottom"
          recipe={recipe}
          density={(['compact', 'comfortable', 'spacious'] as const)[index % 3]}
          title={`${recipe} decision context`}
          content={
            <Stack spacing="sm">
              <Text size="sm">
                Three verified signals support the recommended next action.
              </Text>
              <Stack direction="horizontal" spacing="xs" align="center">
                <Badge tone="primary">92 fit</Badge>
                <Text size="xs" color="subtle">Updated 2 min ago</Text>
              </Stack>
              {recipe === 'rich' ? (
                <Button size="sm" variant="outline">Review evidence</Button>
              ) : null}
            </Stack>
          }
        >
          <Button size="sm" variant="outline">{recipe}</Button>
        </Popover>
      ))}
    </Stack>
  ),
};

/**
 * RTL, long unbroken copy and viewport pressure evidence. The panel must flip,
 * wrap and preserve locale context without physical left/right assumptions.
 */
export const LocaleViewportAndLongCopy: Story = {
  render: () => (
    <Stack
      dir="rtl"
      lang="ar"
      spacing="md"
      style={{ inlineSize: 'min(17rem, calc(100vw - 2rem))' }}
    >
      <Popover
        open
        trigger="click"
        placement="bottomLeft"
        recipe="rich"
        maxWidth="min(24rem, calc(100dvi - 1rem))"
        title="سياق القرار"
        content={
          <Stack spacing="sm">
            <Text size="sm">
              راجع الأدلة الموثقة قبل نقل المرشح إلى المرحلة التالية؛ يمكن تعديل التوصية قبل تنفيذها.
            </Text>
            <Text size="xs" color="subtle">
              ExtremelyLongUnbrokenEvidenceIdentifier_2026_07_22_candidate_decision_context
            </Text>
            <Button size="sm">مراجعة الأدلة</Button>
          </Stack>
        }
      >
        <Button block variant="outline">فتح سياق القرار</Button>
      </Popover>
    </Stack>
  ),
};

/** Identical surface anatomy under two intentionally distant tenant systems. */
export const TenantLocaleContrast: Story = {
  render: () => (
    <Stack direction="horizontal" spacing={112} wrap align="center">
      <div
        lang="en"
        data-ds-root=""
        data-vertical="bithire"
        data-tenant="bithire"
        data-density="compact"
        style={{
          '--ds-popover-bordered-radius': '7px',
          '--ds-popover-bordered-shadow': '0 12px 30px rgba(20, 40, 59, .14)',
        } as React.CSSProperties}
      >
        <Popover open trigger="click" density="compact" placement="bottomLeft" title="Candidate evidence" content="Three verified signals are ready for review.">
          <Button variant="outline">BitHire decision</Button>
        </Popover>
      </div>
      <div
        dir="rtl"
        lang="ar"
        data-ds-root=""
        data-vertical="core"
        data-tenant="the-management"
        data-density="spacious"
        style={{
          '--ds-popover-bordered-radius': '20px',
          '--ds-popover-bordered-shadow': '0 22px 56px rgba(28, 28, 28, .18)',
        } as React.CSSProperties}
      >
        <Popover open trigger="click" density="spacious" placement="bottomLeft" title="سياق الإدارة" content="ثلاث إشارات موثقة جاهزة للمراجعة.">
          <Button variant="outline">فتح السياق</Button>
        </Popover>
      </div>
    </Stack>
  ),
};

/**
 * Nested interactive evidence for stack order, hoverable content, focus
 * transfer and top-most Escape dismissal. The inner panel is intentionally
 * aligned against the opposite edge to exercise diagonal collision craft.
 */
export const NestedInteractiveLayers: Story = {
  render: () => (
    <Popover
      open
      trigger="click"
      placement="bottomRight"
      recipe="rich"
      title="Candidate decision"
      content={
        <Stack spacing="sm">
          <Text size="sm">
            Evidence is complete; choose how to prepare the next conversation.
          </Text>
          <Popover
            open
            trigger="click"
            placement="rightTop"
            recipe="inverse"
            title="AI preparation"
            content={
              <Stack spacing="xs">
                <Badge tone="primary">850 tokens</Badge>
                <Text size="xs">Generates an editable interview brief.</Text>
                <Button size="sm">Prepare brief</Button>
              </Stack>
            }
          >
            <Button size="sm" variant="outline">Review AI action</Button>
          </Popover>
        </Stack>
      }
    >
      <Button variant="outline">Open nested decision context</Button>
    </Popover>
  ),
};
