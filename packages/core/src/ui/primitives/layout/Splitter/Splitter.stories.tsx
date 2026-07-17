/**
 * Splitter Stories
 * Colocated with component following approved architecture
 */

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Splitter } from './';
import { DesignSystemProvider } from '../../../../infrastructure/runtime/bootstrap';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Splitter> = {
  title: 'Primitives/Layout/Splitter',
  component: Splitter,
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
        component: 'Splitter component for creating resizable panel layouts with multi-engine support.',
      },
    },
  },
  argTypes: {
    layout: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Split direction',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Splitter>;

const panelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  backgroundColor: '#f5f5f5',
  border: '1px dashed #d9d9d9',
};

export const Default: Story = {
  render: () => (
    <div style={{ height: 300 }}>
      <Splitter layout="horizontal">
        <Splitter.Panel defaultSize={50}>
          <div style={panelStyle}>Panel 1</div>
        </Splitter.Panel>
        <Splitter.Panel defaultSize={50}>
          <div style={panelStyle}>Panel 2</div>
        </Splitter.Panel>
      </Splitter>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ height: 400 }}>
      <Splitter layout="vertical">
        <Splitter.Panel defaultSize={50}>
          <div style={panelStyle}>Top Panel</div>
        </Splitter.Panel>
        <Splitter.Panel defaultSize={50}>
          <div style={panelStyle}>Bottom Panel</div>
        </Splitter.Panel>
      </Splitter>
    </div>
  ),
};

export const ThreePanels: Story = {
  render: () => (
    <div style={{ height: 300 }}>
      <Splitter layout="horizontal">
        <Splitter.Panel defaultSize={25}>
          <div style={panelStyle}>Left</div>
        </Splitter.Panel>
        <Splitter.Panel defaultSize={50}>
          <div style={panelStyle}>Center</div>
        </Splitter.Panel>
        <Splitter.Panel defaultSize={25}>
          <div style={panelStyle}>Right</div>
        </Splitter.Panel>
      </Splitter>
    </div>
  ),
};

export const WithMinMax: Story = {
  render: () => (
    <div style={{ height: 300 }}>
      <Splitter layout="horizontal">
        <Splitter.Panel defaultSize={30} min={100} max={300}>
          <div style={panelStyle}>
            <div style={{ textAlign: 'center' }}>
              <div>Constrained Panel</div>
              <div style={{ fontSize: 12, color: '#666' }}>Min: 100px, Max: 300px</div>
            </div>
          </div>
        </Splitter.Panel>
        <Splitter.Panel>
          <div style={panelStyle}>Flexible Panel</div>
        </Splitter.Panel>
      </Splitter>
    </div>
  ),
};

export const Collapsible: Story = {
  render: () => (
    <div style={{ height: 300 }}>
      <Splitter layout="horizontal">
        <Splitter.Panel defaultSize={30} collapsible>
          <div style={{ ...panelStyle, backgroundColor: '#e6f7ff' }}>
            <div style={{ textAlign: 'center' }}>
              <div>Collapsible Panel</div>
              <div style={{ fontSize: 12, color: '#666' }}>Click gutter to collapse</div>
            </div>
          </div>
        </Splitter.Panel>
        <Splitter.Panel>
          <div style={panelStyle}>Main Content</div>
        </Splitter.Panel>
      </Splitter>
    </div>
  ),
};

export const Nested: Story = {
  render: () => (
    <div style={{ height: 400 }}>
      <Splitter layout="horizontal">
        <Splitter.Panel defaultSize={30}>
          <div style={{ ...panelStyle, backgroundColor: '#f6ffed' }}>Sidebar</div>
        </Splitter.Panel>
        <Splitter.Panel defaultSize={70}>
          <Splitter layout="vertical">
            <Splitter.Panel defaultSize={60}>
              <div style={{ ...panelStyle, backgroundColor: '#fff7e6' }}>Main Content</div>
            </Splitter.Panel>
            <Splitter.Panel defaultSize={40}>
              <div style={{ ...panelStyle, backgroundColor: '#f9f0ff' }}>Footer Panel</div>
            </Splitter.Panel>
          </Splitter>
        </Splitter.Panel>
      </Splitter>
    </div>
  ),
};

export const WithCallbacks: Story = {
  render: function CallbacksStory() {
    const [sizes, setSizes] = useState<number[]>([50, 50]);
    const [status, setStatus] = useState('idle');

    return (
      <div>
        <div style={{ marginBottom: 16, padding: 8, backgroundColor: '#f5f5f5' }}>
          <div>Status: {status}</div>
          <div>Sizes: {sizes.map((s) => `${s.toFixed(1)}%`).join(', ')}</div>
        </div>
        <div style={{ height: 300 }}>
          <Splitter
            layout="horizontal"
            onResizeStart={() => setStatus('resizing...')}
            onResize={(newSizes) => setSizes(newSizes)}
            onResizeEnd={(newSizes) => {
              setSizes(newSizes);
              setStatus('idle');
            }}
          >
            <Splitter.Panel defaultSize={50}>
              <div style={panelStyle}>Panel 1</div>
            </Splitter.Panel>
            <Splitter.Panel defaultSize={50}>
              <div style={panelStyle}>Panel 2</div>
            </Splitter.Panel>
          </Splitter>
        </div>
      </div>
    );
  },
};

export const IDELayout: Story = {
  render: () => (
    <div style={{ height: 500, border: '1px solid #d9d9d9' }}>
      <Splitter layout="horizontal">
        <Splitter.Panel defaultSize={20} min={150} collapsible>
          <div style={{ height: '100%', backgroundColor: '#252526', color: '#ccc', padding: 8 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Explorer</div>
            <div style={{ fontSize: 12 }}>src/</div>
            <div style={{ fontSize: 12, paddingLeft: 12 }}>components/</div>
            <div style={{ fontSize: 12, paddingLeft: 12 }}>pages/</div>
          </div>
        </Splitter.Panel>
        <Splitter.Panel defaultSize={60}>
          <Splitter layout="vertical">
            <Splitter.Panel defaultSize={70}>
              <div style={{ height: '100%', backgroundColor: '#1e1e1e', color: '#d4d4d4', padding: 8, fontFamily: 'monospace' }}>
                <div>// Editor</div>
                <div>const App = () =&gt; {'{'}</div>
                <div>  return &lt;div&gt;Hello&lt;/div&gt;;</div>
                <div>{'}'}</div>
              </div>
            </Splitter.Panel>
            <Splitter.Panel defaultSize={30} collapsible>
              <div style={{ height: '100%', backgroundColor: '#1e1e1e', color: '#d4d4d4', padding: 8 }}>
                <div style={{ borderBottom: '1px solid #3c3c3c', paddingBottom: 4, marginBottom: 8 }}>Terminal</div>
                <div style={{ fontFamily: 'monospace', fontSize: 12 }}>$ npm run dev</div>
              </div>
            </Splitter.Panel>
          </Splitter>
        </Splitter.Panel>
        <Splitter.Panel defaultSize={20} min={150} collapsible>
          <div style={{ height: '100%', backgroundColor: '#252526', color: '#ccc', padding: 8 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Properties</div>
            <div style={{ fontSize: 12 }}>Width: 100%</div>
            <div style={{ fontSize: 12 }}>Height: auto</div>
          </div>
        </Splitter.Panel>
      </Splitter>
    </div>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Splitter across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Splitter rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Splitter}
      props={{
        children: (
          <>
            <Splitter.Panel defaultSize={50}>
              <div style={panelStyle}>Panel 1</div>
            </Splitter.Panel>
            <Splitter.Panel defaultSize={50}>
              <div style={panelStyle}>Panel 2</div>
            </Splitter.Panel>
          </>
        ),
        layout: 'horizontal',
        style: { height: 200 },
      }}
      showDescriptions
      direction="vertical"
    />
  ),
};
