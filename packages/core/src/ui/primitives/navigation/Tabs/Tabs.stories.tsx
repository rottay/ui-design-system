/**
 * Tabs Stories
 * Colocated with component following approved architecture
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './';
import type { TabItem } from './contracts';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';
import { AiRecommendationIcon } from '../../../../graphics/icons/presentation/semantic/generated/roles/ai-recommendation';
import { DataReportIcon } from '../../../../graphics/icons/presentation/semantic/generated/roles/data-report';
import { StatusVerifiedIcon } from '../../../../graphics/icons/presentation/semantic/generated/roles/status-verified';
import { TimeScheduleIcon } from '../../../../graphics/icons/presentation/semantic/generated/roles/time-schedule';
import { EngineComparison as EngineComparisonHelper } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Tabs> = {
  title: 'Primitives/Navigation/Tabs',
  component: Tabs,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <Story />
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Tabs component for switching between different views or content sections.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['underline', 'contained', 'segmented', 'pills'],
      description: 'Bounded visual recipe (line/card remain compatibility aliases)',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of tabs',
    },
    centered: {
      control: 'boolean',
      description: 'Center the tabs',
    },
    overflow: {
      control: 'select',
      options: ['auto', 'scroll', 'menu', 'wrap'],
      description: 'How a constrained rail reveals additional destinations',
    },
    activationMode: {
      control: 'select',
      options: ['automatic', 'manual'],
      description: 'Whether keyboard focus also selects a destination',
    },
    indicator: {
      control: 'select',
      options: ['tab', 'label', 'none'],
      description: 'Underline measurement source',
    },
    panelVariant: {
      control: 'select',
      options: ['plain', 'contained'],
      description: 'Destination framing owned by Tabs',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const defaultItems: TabItem[] = [
  { key: '1', label: 'Tab 1', children: <p>Content of Tab 1</p> },
  { key: '2', label: 'Tab 2', children: <p>Content of Tab 2</p> },
  { key: '3', label: 'Tab 3', children: <p>Content of Tab 3</p> },
];

export const Default: Story = {
  args: {
    items: defaultItems,
    defaultActiveKey: '1',
  },
};

export const Types: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {(['underline', 'contained', 'segmented', 'pills'] as const).map((type) => (
        <div key={type}>
          <h4 style={{ margin: '0 0 8px 0', textTransform: 'capitalize' }}>{type}</h4>
          <Tabs items={defaultItems} type={type} defaultActiveKey="1" />
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size}>
          <h4 style={{ margin: '0 0 8px 0' }}>Size: {size}</h4>
          <Tabs items={defaultItems} size={size} defaultActiveKey="1" />
        </div>
      ))}
    </div>
  ),
};

export const Centered: Story = {
  args: {
    items: defaultItems,
    centered: true,
    defaultActiveKey: '1',
  },
};

export const Disabled: Story = {
  args: {
    items: [
      { key: '1', label: 'Tab 1', children: <p>Content of Tab 1</p> },
      { key: '2', label: 'Tab 2 (Disabled)', children: <p>Content of Tab 2</p>, disabled: true },
      { key: '3', label: 'Tab 3', children: <p>Content of Tab 3</p> },
    ],
    defaultActiveKey: '1',
  },
};

export const WithIcons: Story = {
  args: {
    items: [
      { key: 'home', label: 'Home', icon: <span>🏠</span>, children: <p>Home content</p> },
      { key: 'profile', label: 'Profile', icon: <span>👤</span>, children: <p>Profile content</p> },
      { key: 'settings', label: 'Settings', icon: <span>⚙️</span>, children: <p>Settings content</p> },
    ],
    defaultActiveKey: 'home',
  },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [activeKey, setActiveKey] = useState('1');

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => setActiveKey('1')} style={{ marginRight: 8 }}>
            Go to Tab 1
          </button>
          <button onClick={() => setActiveKey('2')} style={{ marginRight: 8 }}>
            Go to Tab 2
          </button>
          <button onClick={() => setActiveKey('3')}>Go to Tab 3</button>
        </div>
        <Tabs items={defaultItems} activeKey={activeKey} onChange={setActiveKey} />
      </div>
    );
  },
};

export const ManyTabs: Story = {
  args: {
    items: Array.from({ length: 10 }, (_, i) => ({
      key: String(i + 1),
      label: `Tab ${i + 1}`,
      children: <p>Content of Tab {i + 1}</p>,
    })),
    defaultActiveKey: '1',
    overflow: 'auto',
    accessibilityLabels: {
      previous: 'Previous views',
      next: 'Next views',
      more: 'More views',
    },
  },
};

export const CardWithContent: Story = {
  args: {
    type: 'card',
    items: [
      {
        key: 'overview',
        label: 'Overview',
        children: (
          <div style={{ padding: 16 }}>
            <h3>Overview</h3>
            <p>This is the overview section with detailed information about the product.</p>
          </div>
        ),
      },
      {
        key: 'features',
        label: 'Features',
        children: (
          <div style={{ padding: 16 }}>
            <h3>Features</h3>
            <ul>
              <li>Feature 1</li>
              <li>Feature 2</li>
              <li>Feature 3</li>
            </ul>
          </div>
        ),
      },
      {
        key: 'pricing',
        label: 'Pricing',
        children: (
          <div style={{ padding: 16 }}>
            <h3>Pricing</h3>
            <p>Starting at $9.99/month</p>
          </div>
        ),
      },
    ],
    defaultActiveKey: 'overview',
  },
};

const premiumItems: TabItem[] = [
  {
    key: 'overview',
    label: 'Overview',
    icon: <DataReportIcon decorative size="1em" />,
    badge: 12,
    children: (
      <div>
        <strong>Decision overview</strong>
        <p>Evidence, current momentum and the recommended next action stay visually grouped.</p>
      </div>
    ),
  },
  {
    key: 'intelligence',
    label: 'AI intelligence',
    icon: <AiRecommendationIcon decorative size="1em" />,
    badge: 'New',
    children: (
      <div>
        <strong>Three recommendations are ready</strong>
        <p>Each recommendation exposes its evidence and estimated token cost before execution.</p>
      </div>
    ),
  },
  {
    key: 'schedule',
    label: 'Interviews',
    icon: <TimeScheduleIcon decorative size="1em" />,
    badge: 4,
    children: (
      <div>
        <strong>Upcoming conversations</strong>
        <p>Two interviews are confirmed and one panel still needs an owner.</p>
      </div>
    ),
  },
  {
    key: 'verified',
    label: 'Compliance',
    icon: <StatusVerifiedIcon decorative size="1em" />,
    children: (
      <div>
        <strong>Consent verified</strong>
        <p>The profile is ready for the next permitted workflow.</p>
      </div>
    ),
  },
  {
    key: 'restricted',
    label: 'Restricted',
    disabled: true,
    badge: 2,
    children: <p>This destination is unavailable for the active role.</p>,
  },
];

/** Pass 2 evidence: every recipe, explicit anatomy and contained destination. */
export const PremiumRecipeGallery: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Pass 2 visual proof for recipe hierarchy, icon containers, badges, disabled state and tokenized panel material.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 28 }}>
      {(['underline', 'contained', 'segmented', 'pills'] as const).map((recipe) => (
        <section key={recipe} style={{ minWidth: 0 }}>
          <h3 style={{ margin: '0 0 10px', textTransform: 'capitalize' }}>{recipe}</h3>
          <Tabs
            engine="modern"
            items={premiumItems}
            type={recipe}
            defaultActiveKey="intelligence"
            panelVariant="contained"
            indicator={recipe === 'underline' ? 'label' : 'none'}
          />
        </section>
      ))}
    </div>
  ),
};

/** Pass 2 adversarial proof: narrow rail, long translations, RTL and manual activation. */
export const InternationalizationOverflowAndRtl: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Adversarial layout proof: compact containers, long labels, explicit badges, RTL direction and localized overflow controls.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
      <section
        lang="en"
        data-ds-root=""
        data-vertical="bithire"
        data-tenant="bithire"
        data-density="compact"
        style={{ minWidth: 0 }}
      >
        <h3 style={{ margin: '0 0 10px' }}>Long English and German labels</h3>
        <Tabs
          engine="modern"
          type="contained"
          overflow="auto"
          activationMode="manual"
          panelVariant="contained"
          defaultActiveKey="decision"
          accessibilityLabels={{
            previous: 'Previous workspace view',
            next: 'Next workspace view',
            more: 'All workspace views',
            loading: 'loading',
          }}
          items={[
            { key: 'decision', label: 'Decision intelligence', badge: 18, children: 'Decision content' },
            { key: 'recommendations', label: 'AI recommendations awaiting review', badge: 3, loading: true, children: 'Recommendation content' },
            { key: 'documentation', label: 'Bewerbungsunterlagen und Nachweise', children: 'Document content' },
            { key: 'history', label: 'Complete activity history', badge: 128, children: 'History content' },
          ]}
        />
      </section>

      <section
        dir="rtl"
        lang="ar"
        data-ds-root=""
        data-vertical="core"
        data-tenant="the-management"
        data-density="spacious"
        style={{ minWidth: 0 }}
      >
        <h3 style={{ margin: '0 0 10px' }}>اتجاه من اليمين إلى اليسار</h3>
        <Tabs
          engine="modern"
          type="segmented"
          overflow="menu"
          panelVariant="contained"
          defaultActiveKey="overview"
          accessibilityLabels={{
            previous: 'علامات التبويب السابقة',
            next: 'علامات التبويب التالية',
            more: 'جميع علامات التبويب',
            loading: 'قيد التحميل',
          }}
          items={[
            { key: 'overview', label: 'نظرة عامة', badge: 8, children: 'محتوى النظرة العامة' },
            { key: 'evidence', label: 'الأدلة الموثقة', badge: 24, children: 'محتوى الأدلة' },
            { key: 'recommendations', label: 'توصيات الذكاء الاصطناعي', badge: 3, loading: true, children: 'محتوى التوصيات' },
            { key: 'history', label: 'السجل الكامل للنشاط', children: 'محتوى السجل' },
          ]}
        />
      </section>
    </div>
  ),
};

/**
 * Same anatomy, radically different visual outcomes through public channels.
 * This is evidence for white-label range rather than a product recommendation.
 */
export const TokenPersonalityProof: Story = {
  render: () => {
    const personalities: Array<{
      name: string;
      style: React.CSSProperties;
    }> = [
      {
        name: 'Editorial / flat',
        style: {
          '--ds-tabs-list-radius': '2px',
          '--ds-tabs-item-radius': '1px',
          '--ds-tabs-list-texture': 'none',
          '--ds-tabs-list-shadow': 'none',
          '--ds-tabs-item-font-family': 'Georgia, serif',
          '--ds-tabs-item-letter-spacing': '0.01em',
          '--ds-tabs-active-transform': 'none',
        } as React.CSSProperties,
      },
      {
        name: 'Technical / compact',
        style: {
          '--ds-tabs-list-radius': '6px',
          '--ds-tabs-item-radius': '4px',
          '--ds-tabs-md-height': '30px',
          '--ds-tabs-md-padding': '0 9px',
          '--ds-tabs-item-font-family': 'ui-monospace, monospace',
          '--ds-tabs-item-letter-spacing': '0.02em',
          '--ds-tabs-active-transform': 'none',
        } as React.CSSProperties,
      },
      {
        name: 'Human / soft',
        style: {
          '--ds-tabs-list-radius': '18px',
          '--ds-tabs-item-radius': '14px',
          '--ds-tabs-list-padding': '5px',
          '--ds-tabs-gap': '5px',
          '--ds-tabs-active-transform': 'translateY(-1px)',
          '--ds-tabs-panel-radius': '18px',
        } as React.CSSProperties,
      },
    ];

    return (
      <div style={{ display: 'grid', gap: 24 }}>
        {personalities.map((personality) => (
          <section key={personality.name} style={personality.style}>
            <h3 style={{ margin: '0 0 10px' }}>{personality.name}</h3>
            <Tabs
              engine="modern"
              type="contained"
              items={premiumItems.slice(0, 4)}
              defaultActiveKey="intelligence"
              panelVariant="contained"
            />
          </section>
        ))}
      </div>
    );
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Tabs across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Tabs rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Tabs}
      props={{
        items: defaultItems,
        defaultActiveKey: '1',
      }}
      showDescriptions
      direction="vertical"
    />
  ),
};
