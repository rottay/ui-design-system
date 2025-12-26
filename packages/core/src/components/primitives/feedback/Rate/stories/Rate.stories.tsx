/**
 * Rate Component Stories
 * Comprehensive Storybook stories for the Rate component
 * @module Rate/Stories
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Rate } from '../';
import { DesignSystemProvider } from '../../../../../system/providers/root';

const meta: Meta<typeof Rate> = {
  title: 'Primitives/Feedback/Rate',
  component: Rate,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <Story />
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Rate component for star ratings with support for half stars, custom characters, and multiple engines.',
      },
    },
  },
  argTypes: {
    value: {
      control: { type: 'number', min: 0, max: 10, step: 0.5 },
      description: 'Current rating value (controlled)',
    },
    defaultValue: {
      control: { type: 'number', min: 0, max: 10, step: 0.5 },
      description: 'Default rating value (uncontrolled)',
    },
    count: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Number of stars',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the stars',
    },
    allowHalf: {
      control: 'boolean',
      description: 'Allow half star selection',
    },
    allowClear: {
      control: 'boolean',
      description: 'Allow clearing the rating',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the rating',
    },
    readOnly: {
      control: 'boolean',
      description: 'Make the rating read-only',
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
      description: 'Rendering engine to use',
    },
    activeColor: {
      control: 'color',
      description: 'Color for active/filled stars',
    },
    inactiveColor: {
      control: 'color',
      description: 'Color for inactive/empty stars',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Rate>;

// ============================================================================
// Basic Stories
// ============================================================================

export const Default: Story = {
  args: {
    defaultValue: 3,
    count: 5,
    size: 'md',
  },
};

export const WithValue: Story = {
  args: {
    value: 4,
    count: 5,
  },
};

export const Empty: Story = {
  args: {
    defaultValue: 0,
    count: 5,
  },
};

export const FullRating: Story = {
  args: {
    defaultValue: 5,
    count: 5,
  },
};

// ============================================================================
// Controlled Component
// ============================================================================

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState(3);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Rate value={value} onChange={setValue} />
        <div style={{ fontSize: 14, color: '#666' }}>
          Current value: <strong>{value}</strong>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setValue(0)}>Clear</button>
          <button onClick={() => setValue(2.5)}>Set 2.5</button>
          <button onClick={() => setValue(5)}>Set 5</button>
        </div>
      </div>
    );
  },
};

// ============================================================================
// Size Variants
// ============================================================================

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ width: 40, fontSize: 12, color: '#888' }}>{size}</span>
          <Rate size={size} defaultValue={3} />
        </div>
      ))}
    </div>
  ),
};

// ============================================================================
// Half Stars
// ============================================================================

export const HalfStars: Story = {
  args: {
    allowHalf: true,
    defaultValue: 2.5,
  },
};

export const HalfStarsControlled: Story = {
  render: () => {
    const [value, setValue] = useState(3.5);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Rate allowHalf value={value} onChange={setValue} />
        <div style={{ fontSize: 14, color: '#666' }}>
          Current value: <strong>{value}</strong>
        </div>
      </div>
    );
  },
};

// ============================================================================
// Count Variants
// ============================================================================

export const CustomCount: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ width: 80, fontSize: 12, color: '#888' }}>3 stars</span>
        <Rate count={3} defaultValue={2} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ width: 80, fontSize: 12, color: '#888' }}>5 stars</span>
        <Rate count={5} defaultValue={3} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ width: 80, fontSize: 12, color: '#888' }}>10 stars</span>
        <Rate count={10} defaultValue={7} />
      </div>
    </div>
  ),
};

// ============================================================================
// States
// ============================================================================

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 3,
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: 4,
  },
};

export const AllowClearFalse: Story = {
  args: {
    allowClear: false,
    defaultValue: 3,
  },
  parameters: {
    docs: {
      description: {
        story: 'When allowClear is false, clicking on the same star will not clear the rating.',
      },
    },
  },
};

// ============================================================================
// Custom Colors
// ============================================================================

export const CustomColors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ width: 80, fontSize: 12, color: '#888' }}>Default</span>
        <Rate defaultValue={3} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ width: 80, fontSize: 12, color: '#888' }}>Red</span>
        <Rate defaultValue={3} activeColor="#ef4444" inactiveColor="#fecaca" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ width: 80, fontSize: 12, color: '#888' }}>Blue</span>
        <Rate defaultValue={3} activeColor="#3b82f6" inactiveColor="#bfdbfe" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ width: 80, fontSize: 12, color: '#888' }}>Green</span>
        <Rate defaultValue={3} activeColor="#22c55e" inactiveColor="#bbf7d0" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ width: 80, fontSize: 12, color: '#888' }}>Purple</span>
        <Rate defaultValue={3} activeColor="#a855f7" inactiveColor="#e9d5ff" />
      </div>
    </div>
  ),
};

// ============================================================================
// Custom Character
// ============================================================================

export const CustomCharacter: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h4 style={{ marginBottom: 8, fontSize: 14 }}>Heart Icon</h4>
        <Rate
          defaultValue={3}
          character={
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '100%', height: '100%' }}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          }
          activeColor="#ec4899"
          inactiveColor="#f9a8d4"
        />
      </div>
      <div>
        <h4 style={{ marginBottom: 8, fontSize: 14 }}>Emoji</h4>
        <Rate defaultValue={3} character="$" size="lg" />
      </div>
      <div>
        <h4 style={{ marginBottom: 8, fontSize: 14 }}>Letters (A-E)</h4>
        <Rate
          defaultValue={3}
          character={({ index }) => ['A', 'B', 'C', 'D', 'E'][index]}
          size="lg"
        />
      </div>
      <div>
        <h4 style={{ marginBottom: 8, fontSize: 14 }}>Numbers</h4>
        <Rate
          defaultValue={3}
          character={({ index }) => index + 1}
          size="lg"
        />
      </div>
    </div>
  ),
};

// ============================================================================
// Tooltips
// ============================================================================

export const WithTooltips: Story = {
  args: {
    defaultValue: 3,
    tooltips: ['Terrible', 'Bad', 'Normal', 'Good', 'Excellent'],
  },
};

export const CustomTooltips: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    const tooltips = ['1 star', '2 stars', '3 stars', '4 stars', '5 stars'];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Rate
          tooltips={tooltips}
          value={value}
          onChange={setValue}
        />
        <div style={{ fontSize: 14, color: '#666' }}>
          {value ? tooltips[value - 1] : 'No rating'}
        </div>
      </div>
    );
  },
};

// ============================================================================
// Callbacks
// ============================================================================

export const WithCallbacks: Story = {
  render: () => {
    const [value, setValue] = useState(3);
    const [hoverValue, setHoverValue] = useState(0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Rate
          value={value}
          onChange={(val) => {
            setValue(val);
            console.log('onChange:', val);
          }}
          onHoverChange={(val) => {
            setHoverValue(val);
            console.log('onHoverChange:', val);
          }}
        />
        <div style={{ fontSize: 14, color: '#666' }}>
          <div>Current value: <strong>{value}</strong></div>
          <div>Hover value: <strong>{hoverValue || '-'}</strong></div>
        </div>
      </div>
    );
  },
};

// ============================================================================
// Engine Comparison
// ============================================================================

export const EngineComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <div key={engine}>
          <h4 style={{ margin: '0 0 12px 0', textTransform: 'capitalize', fontSize: 14 }}>
            {engine} Engine
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Rate engine={engine} defaultValue={3} />
            <Rate engine={engine} defaultValue={2.5} allowHalf />
            <Rate engine={engine} defaultValue={4} disabled />
          </div>
        </div>
      ))}
    </div>
  ),
};

// ============================================================================
// Real World Examples
// ============================================================================

export const ProductReview: Story = {
  render: () => {
    const [rating, setRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    return (
      <div style={{
        maxWidth: 400,
        padding: 24,
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        backgroundColor: '#fff',
      }}>
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>Rate this product</h3>
        <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
          How would you rate your experience?
        </p>
        <Rate
          value={rating}
          onChange={setRating}
          size="lg"
          tooltips={['Terrible', 'Poor', 'Average', 'Good', 'Excellent']}
        />
        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => setSubmitted(true)}
            disabled={rating === 0}
            style={{
              padding: '8px 16px',
              backgroundColor: rating === 0 ? '#e5e7eb' : '#3b82f6',
              color: rating === 0 ? '#9ca3af' : '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: rating === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Submit Review
          </button>
        </div>
        {submitted && (
          <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f0fdf4', borderRadius: 4 }}>
            Thank you for rating {rating} star{rating !== 1 ? 's' : ''}!
          </div>
        )}
      </div>
    );
  },
};

export const FeedbackForm: Story = {
  render: () => {
    const categories = [
      { label: 'Quality', value: 4 },
      { label: 'Value for Money', value: 3.5 },
      { label: 'Shipping', value: 5 },
      { label: 'Customer Service', value: 4.5 },
    ];

    return (
      <div style={{
        maxWidth: 400,
        padding: 24,
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        backgroundColor: '#fff',
      }}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Customer Feedback</h3>
        {categories.map((category) => (
          <div
            key={category.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 14 }}>{category.label}</span>
            <Rate
              defaultValue={category.value}
              allowHalf
              size="sm"
              readOnly
            />
          </div>
        ))}
        <div style={{
          marginTop: 16,
          paddingTop: 16,
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontWeight: 600 }}>Overall</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Rate defaultValue={4.25} allowHalf readOnly />
            <span style={{ fontSize: 14, color: '#666' }}>4.25</span>
          </div>
        </div>
      </div>
    );
  },
};

export const DifficultySelector: Story = {
  render: () => {
    const [difficulty, setDifficulty] = useState(2);
    const labels = ['Very Easy', 'Easy', 'Medium', 'Hard', 'Expert'];
    const colors = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'];

    return (
      <div style={{ maxWidth: 300 }}>
        <h4 style={{ marginBottom: 12 }}>Select Difficulty</h4>
        <Rate
          count={5}
          value={difficulty}
          onChange={setDifficulty}
          size="lg"
          activeColor={colors[difficulty - 1]}
          character={
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '100%', height: '100%' }}>
              <circle cx="12" cy="12" r="10" />
            </svg>
          }
        />
        <div style={{
          marginTop: 12,
          padding: 8,
          backgroundColor: colors[difficulty - 1] + '20',
          borderRadius: 4,
          textAlign: 'center',
          fontWeight: 600,
          color: colors[difficulty - 1],
        }}>
          {labels[difficulty - 1]}
        </div>
      </div>
    );
  },
};

// ============================================================================
// Accessibility
// ============================================================================

export const KeyboardNavigation: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
        Use arrow keys to navigate, Enter/Space to select, Home/End for min/max.
      </p>
      <Rate defaultValue={3} />
    </div>
  ),
};

export const RTLSupport: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h4 style={{ marginBottom: 8, fontSize: 14 }}>LTR (Default)</h4>
        <Rate defaultValue={3} direction="ltr" />
      </div>
      <div>
        <h4 style={{ marginBottom: 8, fontSize: 14 }}>RTL</h4>
        <Rate defaultValue={3} direction="rtl" />
      </div>
    </div>
  ),
};
