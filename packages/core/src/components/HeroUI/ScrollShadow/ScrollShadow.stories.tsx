import type { Meta, StoryObj } from '@storybook/react';
import { ScrollShadow } from './ScrollShadow';

const meta: Meta<typeof ScrollShadow> = {
  title: 'HeroUI/ScrollShadow',
  component: ScrollShadow,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**ScrollShadow Component** - Visual feedback for scrollable content

Automatically displays shadows at the edges of scrollable containers to indicate there's more content available. Provides excellent UX by giving visual cues about scroll position without cluttering the interface.

### Features
- ✅ Automatic shadow detection based on scroll position
- ✅ Supports vertical, horizontal, or both directions
- ✅ 3 shadow sizes (sm, md, lg)
- ✅ Theme-aware shadow colors
- ✅ Optional scrollbar hiding
- ✅ Performance optimized with ResizeObserver
- ✅ Smooth transitions
- ✅ Manual visibility control

### Use Cases
- Search result dropdowns
- Data table containers
- Long content lists
- Command palettes
- Modal scrollable content
- Chat message lists
- Product galleries
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal', 'both'],
      description: 'Scroll orientation',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Shadow size',
    },
    hideScrollBar: {
      control: 'boolean',
      description: 'Hide the scrollbar',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ScrollShadow>;

// Mock content generator
const generateItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Item ${i + 1}`,
    description: `This is the description for item ${i + 1}`,
  }));

/**
 * Default vertical scrolling with medium shadow
 */
export const Default: Story = {
  render: () => (
    <ScrollShadow style={{ maxHeight: 300, width: 400 }}>
      <div style={{ padding: '16px' }}>
        {generateItems(20).map((item) => (
          <div
            key={item.id}
            style={{
              padding: '12px',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <div style={{ fontWeight: 500 }}>{item.title}</div>
            <div style={{ fontSize: '13px', color: '#666' }}>{item.description}</div>
          </div>
        ))}
      </div>
    </ScrollShadow>
  ),
};

/**
 * Different shadow sizes
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>Small</div>
        <ScrollShadow size="sm" style={{ maxHeight: 200, width: 200, border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <div style={{ padding: '12px' }}>
            {generateItems(10).map((item) => (
              <div key={item.id} style={{ padding: '8px', borderBottom: '1px solid #f5f5f5' }}>
                {item.title}
              </div>
            ))}
          </div>
        </ScrollShadow>
      </div>

      <div>
        <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>Medium</div>
        <ScrollShadow size="md" style={{ maxHeight: 200, width: 200, border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <div style={{ padding: '12px' }}>
            {generateItems(10).map((item) => (
              <div key={item.id} style={{ padding: '8px', borderBottom: '1px solid #f5f5f5' }}>
                {item.title}
              </div>
            ))}
          </div>
        </ScrollShadow>
      </div>

      <div>
        <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>Large</div>
        <ScrollShadow size="lg" style={{ maxHeight: 200, width: 200, border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <div style={{ padding: '12px' }}>
            {generateItems(10).map((item) => (
              <div key={item.id} style={{ padding: '8px', borderBottom: '1px solid #f5f5f5' }}>
                {item.title}
              </div>
            ))}
          </div>
        </ScrollShadow>
      </div>
    </div>
  ),
};

/**
 * Horizontal scrolling
 */
export const Horizontal: Story = {
  render: () => (
    <ScrollShadow
      orientation="horizontal"
      style={{
        maxWidth: 400,
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '16px',
      }}
    >
      <div style={{ display: 'flex', gap: '12px', minWidth: 'max-content' }}>
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            style={{
              width: 100,
              height: 100,
              background: `hsl(${i * 18}, 70%, 60%)`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              flexShrink: 0,
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </ScrollShadow>
  ),
};

/**
 * Both directions scrolling
 */
export const BothDirections: Story = {
  render: () => (
    <ScrollShadow
      orientation="both"
      style={{
        maxWidth: 400,
        maxHeight: 300,
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '16px',
      }}
    >
      <table style={{ minWidth: '800px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['ID', 'Name', 'Email', 'Role', 'Status', 'Date'].map((header) => (
              <th
                key={header}
                style={{
                  padding: '12px',
                  textAlign: 'left',
                  borderBottom: '2px solid #e0e0e0',
                  background: '#f9f9f9',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 20 }, (_, i) => (
            <tr key={i}>
              <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>{i + 1}</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>User {i + 1}</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>user{i + 1}@example.com</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>Developer</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>Active</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>2025-01-{String(i + 1).padStart(2, '0')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollShadow>
  ),
};

/**
 * Hidden scrollbar for cleaner look
 */
export const HiddenScrollbar: Story = {
  render: () => (
    <ScrollShadow
      hideScrollBar
      style={{
        maxHeight: 300,
        width: 400,
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
      }}
    >
      <div style={{ padding: '16px' }}>
        <h3 style={{ marginTop: 0 }}>No Scrollbar Visible</h3>
        <p>The scrollbar is hidden but scrolling still works. This creates a cleaner visual appearance.</p>
        {generateItems(15).map((item) => (
          <div
            key={item.id}
            style={{
              padding: '12px',
              borderBottom: '1px solid #f0f0f0',
              marginBottom: '8px',
            }}
          >
            <div style={{ fontWeight: 500 }}>{item.title}</div>
            <div style={{ fontSize: '13px', color: '#666' }}>{item.description}</div>
          </div>
        ))}
      </div>
    </ScrollShadow>
  ),
};

/**
 * Search results dropdown simulation
 */
export const SearchResultsDropdown: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <input
        type="text"
        placeholder="Search..."
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px 8px 0 0',
          fontSize: '14px',
        }}
      />
      <ScrollShadow
        style={{
          maxHeight: 300,
          border: '1px solid #e0e0e0',
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          background: 'white',
        }}
      >
        <div style={{ padding: '8px' }}>
          <div style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 600, color: '#666' }}>
            RECENT SEARCHES
          </div>
          {generateItems(5).map((item) => (
            <div
              key={item.id}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ fontWeight: 500 }}>{item.title}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>{item.description}</div>
            </div>
          ))}

          <div style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 600, color: '#666', marginTop: '8px' }}>
            ALL RESULTS
          </div>
          {generateItems(10).map((item) => (
            <div
              key={item.id}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ fontWeight: 500 }}>{item.title}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>{item.description}</div>
            </div>
          ))}
        </div>
      </ScrollShadow>
    </div>
  ),
};

/**
 * Card list with shadows
 */
export const CardList: Story = {
  render: () => (
    <ScrollShadow
      style={{
        maxHeight: 400,
        width: 400,
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '16px',
      }}
    >
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          style={{
            padding: '16px',
            marginBottom: '12px',
            background: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          <h4 style={{ margin: '0 0 8px 0' }}>Card Title {i + 1}</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
            This is some content for card {i + 1}. It demonstrates how ScrollShadow works with card layouts.
          </p>
        </div>
      ))}
    </ScrollShadow>
  ),
};

/**
 * Chat messages list
 */
export const ChatMessages: Story = {
  render: () => (
    <div
      style={{
        width: 400,
        background: '#f5f5f5',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '16px', background: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <h4 style={{ margin: 0 }}>Chat Messages</h4>
      </div>
      <ScrollShadow hideScrollBar style={{ maxHeight: 400, padding: '16px' }}>
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: i % 3 === 0 ? 'flex-end' : 'flex-start',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '12px',
                background: i % 3 === 0 ? '#1890ff' : 'white',
                color: i % 3 === 0 ? 'white' : 'black',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ fontSize: '13px' }}>
                Message {i + 1}: This is a sample chat message with some content.
              </div>
              <div
                style={{
                  fontSize: '11px',
                  marginTop: '4px',
                  opacity: 0.7,
                  textAlign: 'right',
                }}
              >
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </ScrollShadow>
      <div style={{ padding: '12px', background: 'white', borderTop: '1px solid #e0e0e0' }}>
        <input
          type="text"
          placeholder="Type a message..."
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #e0e0e0',
            borderRadius: '20px',
            fontSize: '14px',
          }}
        />
      </div>
    </div>
  ),
};

/**
 * Product gallery horizontal scroll
 */
export const ProductGallery: Story = {
  render: () => (
    <ScrollShadow
      orientation="horizontal"
      hideScrollBar
      style={{
        maxWidth: 500,
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '20px',
      }}
    >
      <div style={{ display: 'flex', gap: '16px', minWidth: 'max-content' }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            style={{
              width: 200,
              flexShrink: 0,
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              overflow: 'hidden',
              background: 'white',
            }}
          >
            <div
              style={{
                height: 150,
                background: `linear-gradient(135deg, hsl(${i * 36}, 70%, 60%), hsl(${i * 36 + 40}, 70%, 70%))`,
              }}
            />
            <div style={{ padding: '12px' }}>
              <div style={{ fontWeight: 500, marginBottom: '4px' }}>Product {i + 1}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>$99.99</div>
            </div>
          </div>
        ))}
      </div>
    </ScrollShadow>
  ),
};
