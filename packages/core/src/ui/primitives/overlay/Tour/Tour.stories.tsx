/**
 * Tour Stories
 * Colocated with component following approved architecture.
 *
 * @module Tour/stories
 * @description Storybook stories for the Tour component demonstrating
 * all features, variants, and engine implementations.
 */

import React, { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tour } from './';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

/**
 * Tour component metadata for Storybook.
 * Configures controls, decorators, and documentation.
 */
const meta: Meta<typeof Tour> = {
  title: 'Primitives/Overlay/Tour',
  component: Tour,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <div style={{ padding: '50px', minHeight: '400px' }}>
          <Story />
        </div>
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
Tour component for creating step-by-step guided tours through your application.
Supports targeting specific elements, custom styling, and navigation controls.

**Features:**
- Multi-step guided tours
- Element targeting with spotlight effect
- 13 placement positions (including center)
- Default and primary type variants
- Mask overlay with cutout
- Custom indicators and buttons
- Controlled and uncontrolled modes
- Three engine implementations (Classic, Modern, Rustic)
        `,
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['default', 'primary'],
      description: 'Visual type of the tour',
    },
    placement: {
      control: 'select',
      options: [
        'top', 'topLeft', 'topRight',
        'bottom', 'bottomLeft', 'bottomRight',
        'left', 'leftTop', 'leftBottom',
        'right', 'rightTop', 'rightBottom',
        'center',
      ],
      description: 'Default placement of the tour popover',
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine to use',
    },
    mask: {
      control: 'boolean',
      description: 'Whether to show the mask overlay',
    },
    arrow: {
      control: 'boolean',
      description: 'Whether to show the arrow indicator',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tour>;

const defaultSteps = [
  {
    title: 'Welcome',
    description: 'Welcome to our application! Let us show you around.',
  },
  {
    title: 'Features',
    description: 'Discover all the amazing features we have to offer.',
  },
  {
    title: 'Get Started',
    description: 'You are all set! Start exploring the application.',
  },
];

/**
 * Default tour with basic configuration.
 */
export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <button onClick={() => setOpen(true)} style={{ padding: '8px 16px' }}>
          Start Tour
        </button>
        <Tour
          steps={defaultSteps}
          open={open}
          onClose={() => setOpen(false)}
          onFinish={() => setOpen(false)}
        />
      </div>
    );
  },
};

/**
 * Tour with element targeting.
 */
export const WithTargets: Story = {
  render: () => {
    const ref1 = useRef<HTMLButtonElement>(null);
    const ref2 = useRef<HTMLDivElement>(null);
    const ref3 = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);

    const steps = [
      {
        title: 'Create Button',
        description: 'Click here to create a new item.',
        target: ref1,
      },
      {
        title: 'Dashboard',
        description: 'View your dashboard statistics here.',
        target: ref2,
      },
      {
        title: 'Search',
        description: 'Use the search bar to find items quickly.',
        target: ref3,
      },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button ref={ref1} style={{ padding: '8px 16px' }}>
            Create
          </button>
          <div
            ref={ref2}
            style={{
              padding: '16px 24px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
            }}
          >
            Dashboard Widget
          </div>
          <input
            ref={ref3}
            type="text"
            placeholder="Search..."
            style={{ padding: '8px', width: '200px' }}
          />
        </div>
        <button onClick={() => setOpen(true)} style={{ padding: '8px 16px', width: 'fit-content' }}>
          Start Tour
        </button>
        <Tour
          steps={steps}
          open={open}
          onClose={() => setOpen(false)}
          onFinish={() => setOpen(false)}
        />
      </div>
    );
  },
};

/**
 * Primary type tour demonstration.
 */
export const PrimaryType: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <button onClick={() => setOpen(true)} style={{ padding: '8px 16px' }}>
          Start Primary Tour
        </button>
        <Tour
          steps={defaultSteps}
          open={open}
          type="primary"
          onClose={() => setOpen(false)}
          onFinish={() => setOpen(false)}
        />
      </div>
    );
  },
};

/**
 * Tour with cover images.
 */
export const WithCovers: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const stepsWithCovers = [
      {
        title: 'Welcome',
        description: 'Welcome to our platform!',
        cover: (
          <div
            style={{
              height: '150px',
              backgroundColor: '#e6f7ff',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
            }}
          >
            👋
          </div>
        ),
      },
      {
        title: 'Explore',
        description: 'Discover new features and possibilities.',
        cover: (
          <div
            style={{
              height: '150px',
              backgroundColor: '#f6ffed',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
            }}
          >
            🔍
          </div>
        ),
      },
      {
        title: 'Success',
        description: 'You are ready to go!',
        cover: (
          <div
            style={{
              height: '150px',
              backgroundColor: '#fff7e6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
            }}
          >
            🎉
          </div>
        ),
      },
    ];

    return (
      <div>
        <button onClick={() => setOpen(true)} style={{ padding: '8px 16px' }}>
          Start Tour with Covers
        </button>
        <Tour
          steps={stepsWithCovers}
          open={open}
          onClose={() => setOpen(false)}
          onFinish={() => setOpen(false)}
        />
      </div>
    );
  },
};

/**
 * Tour without mask.
 */
export const WithoutMask: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <button onClick={() => setOpen(true)} style={{ padding: '8px 16px' }}>
          Start Tour (No Mask)
        </button>
        <Tour
          steps={defaultSteps}
          open={open}
          mask={false}
          onClose={() => setOpen(false)}
          onFinish={() => setOpen(false)}
        />
      </div>
    );
  },
};

/**
 * Custom indicators demonstration.
 */
export const CustomIndicators: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const customIndicators = (current: number, total: number) => (
      <div style={{ display: 'flex', gap: '8px' }}>
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            style={{
              width: i === current ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              backgroundColor: i === current ? '#1677ff' : '#d9d9d9',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>
    );

    return (
      <div>
        <button onClick={() => setOpen(true)} style={{ padding: '8px 16px' }}>
          Start Tour (Custom Indicators)
        </button>
        <Tour
          steps={defaultSteps}
          open={open}
          indicatorsRender={customIndicators}
          onClose={() => setOpen(false)}
          onFinish={() => setOpen(false)}
        />
      </div>
    );
  },
};

/**
 * Controlled tour demonstration.
 */
export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState(0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setOpen(true)} style={{ padding: '8px 16px' }}>
            Start Tour
          </button>
          <button onClick={() => setCurrent(0)} style={{ padding: '8px 16px' }}>
            Go to Step 1
          </button>
          <button onClick={() => setCurrent(1)} style={{ padding: '8px 16px' }}>
            Go to Step 2
          </button>
          <button onClick={() => setCurrent(2)} style={{ padding: '8px 16px' }}>
            Go to Step 3
          </button>
        </div>
        <p>Current step: {current + 1}</p>
        <Tour
          steps={defaultSteps}
          open={open}
          current={current}
          onChange={setCurrent}
          onClose={() => setOpen(false)}
          onFinish={() => setOpen(false)}
        />
      </div>
    );
  },
};

/**
 * Placements demonstration.
 */
export const Placements: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [placement, setPlacement] = useState<any>('bottom');

    const placements = [
      'top', 'topLeft', 'topRight',
      'bottom', 'bottomLeft', 'bottomRight',
      'left', 'leftTop', 'leftBottom',
      'right', 'rightTop', 'rightBottom',
      'center',
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {placements.map((p) => (
            <button
              key={p}
              onClick={() => {
                setPlacement(p);
                setOpen(true);
              }}
              style={{ padding: '4px 8px', fontSize: '12px' }}
            >
              {p}
            </button>
          ))}
        </div>
        <Tour
          steps={[{ title: `Placement: ${placement}`, description: 'This shows the placement option.' }]}
          open={open}
          placement={placement}
          onClose={() => setOpen(false)}
          onFinish={() => setOpen(false)}
        />
      </div>
    );
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Tour across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Tour rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState<string | null>(null);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {(['classic', 'modern', 'rustic'] as const).map((engine) => (
          <div key={engine}>
            <h4 style={{ margin: '0 0 8px 0', textTransform: 'capitalize' }}>{engine} Engine</h4>
            <button onClick={() => setOpen(engine)} style={{ padding: '8px 16px' }}>
              Start Tour
            </button>
            <Tour
              engine={engine}
              steps={[
                { title: `${engine} Tour`, description: `This tour uses the ${engine} engine.` },
                { title: 'Step 2', description: 'Second step of the tour.' },
              ]}
              open={open === engine}
              onClose={() => setOpen(null)}
              onFinish={() => setOpen(null)}
            />
          </div>
        ))}
      </div>
    );
  },
};

/**
 * Onboarding flow demonstration.
 */
export const OnboardingFlow: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const onboardingSteps = [
      {
        title: 'Welcome to Our App!',
        description: 'We are excited to have you here. Let us take a quick tour of the main features.',
        cover: (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '12px' }}>🚀</div>
            <div style={{ color: '#666' }}>Your journey starts here</div>
          </div>
        ),
      },
      {
        title: 'Navigation',
        description: 'Use the sidebar to navigate between different sections of the application.',
      },
      {
        title: 'Create Content',
        description: 'Click the "New" button to create new items, documents, or projects.',
      },
      {
        title: 'Settings',
        description: 'Customize your experience in the settings panel.',
      },
      {
        title: 'You are All Set!',
        description: 'Start exploring and create amazing things. Need help? Check our documentation.',
        cover: (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '12px' }}>🎉</div>
            <div style={{ color: '#666' }}>Ready to go!</div>
          </div>
        ),
      },
    ];

    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#1677ff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Start Onboarding
        </button>
        <Tour
          steps={onboardingSteps}
          open={open}
          type="primary"
          onClose={() => setOpen(false)}
          onFinish={() => {
            setOpen(false);
            alert('Onboarding complete! Welcome aboard!');
          }}
        />
      </div>
    );
  },
};
