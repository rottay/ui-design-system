/**
 * Drawer Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Drawer } from '../';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../../.storybook/helpers';

const meta: Meta<typeof Drawer> = {
  title: 'Primitives/Feedback/Drawer',
  component: Drawer,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    placement: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
    },
    closable: {
      control: 'boolean',
    },
    mask: {
      control: 'boolean',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Drawer>;

const DrawerDemo = (props: any) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open Drawer</button>
      <Drawer {...props} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export const Default: Story = {
  render: () => (
    <DrawerDemo title="Default Drawer" size="md">
      <p>This is the drawer content.</p>
      <p>Click outside or press ESC to close.</p>
    </DrawerDemo>
  ),
};

export const Placements: Story = {
  render: () => {
    const [placement, setPlacement] = useState<'left' | 'right' | 'top' | 'bottom' | null>(null);
    return (
      <>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['left', 'right', 'top', 'bottom'] as const).map((p) => (
            <button key={p} onClick={() => setPlacement(p)} style={{ textTransform: 'capitalize' }}>
              {p}
            </button>
          ))}
        </div>
        <Drawer
          open={!!placement}
          placement={placement || 'right'}
          title={`${placement} Drawer`}
          onClose={() => setPlacement(null)}
        >
          <p>This drawer slides in from the {placement}.</p>
        </Drawer>
      </>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl' | null>(null);
    return (
      <>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
            <button key={s} onClick={() => setSize(s)}>{s.toUpperCase()}</button>
          ))}
        </div>
        <Drawer
          open={!!size}
          size={size || 'md'}
          title={`${size?.toUpperCase()} Drawer`}
          onClose={() => setSize(null)}
        >
          <p>This is a {size} drawer.</p>
        </Drawer>
      </>
    );
  },
};

export const WithFooter: Story = {
  render: () => (
    <DrawerDemo
      title="Drawer with Footer"
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button>Cancel</button>
          <button style={{ backgroundColor: '#1890ff', color: 'white' }}>Submit</button>
        </div>
      }
    >
      <p>This drawer has a custom footer with action buttons.</p>
    </DrawerDemo>
  ),
};

export const NoMask: Story = {
  render: () => (
    <DrawerDemo title="No Overlay" mask={false}>
      <p>This drawer has no overlay/mask behind it.</p>
    </DrawerDemo>
  ),
};

export const NotClosable: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>Open Drawer</button>
        <Drawer
          open={open}
          title="Not Closable"
          closable={false}
          closeOnOverlayClick={false}
          closeOnEscape={false}
          footer={<button onClick={() => setOpen(false)}>Close via Button</button>}
        >
          <p>This drawer can only be closed via the button.</p>
        </Drawer>
      </>
    );
  },
};

export const FormDrawer: Story = {
  render: () => (
    <DrawerDemo
      title="Edit Profile"
      size="md"
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button>Cancel</button>
          <button style={{ backgroundColor: '#1890ff', color: 'white' }}>Save</button>
        </div>
      }
    >
      <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label>
          Name
          <input type="text" style={{ width: '100%', marginTop: 4 }} />
        </label>
        <label>
          Email
          <input type="email" style={{ width: '100%', marginTop: 4 }} />
        </label>
        <label>
          Bio
          <textarea style={{ width: '100%', marginTop: 4 }} rows={4} />
        </label>
      </form>
    </DrawerDemo>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Drawer trigger buttons across all 3 engines.
 * Click each button to open a drawer rendered with that engine.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Drawer rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS). Click each button to open the drawer.',
      },
    },
  },
  render: () => {
    const [engine, setEngine] = useState<'classic' | 'modern' | 'rustic' | null>(null);
    return (
      <>
        <EngineComparisonHelper
          component={({ engineName }: { engineName: 'classic' | 'modern' | 'rustic' }) => (
            <button onClick={() => setEngine(engineName)} style={{ padding: '8px 16px' }}>
              Open {engineName} Drawer
            </button>
          )}
          props={{ engineName: 'classic' }}
          showDescriptions
        />
        <Drawer
          open={!!engine}
          engine={engine || 'classic'}
          title={`${engine?.charAt(0).toUpperCase()}${engine?.slice(1)} Engine Drawer`}
          onClose={() => setEngine(null)}
        >
          <p>This drawer uses the {engine} engine.</p>
          <p>Click outside or press ESC to close.</p>
        </Drawer>
      </>
    );
  },
};

/**
 * Matrix showing all placements across all engines.
 */
export const VariantMatrix: Story = {
  name: '📊 Variant × Engine Matrix',
  parameters: {
    docs: {
      description: {
        story: 'Since Drawer is an overlay component, use the CompareEngines story above to test different engines interactively.',
      },
    },
  },
  render: () => {
    const [config, setConfig] = useState<{ engine: 'classic' | 'modern' | 'rustic'; placement: 'left' | 'right' | 'top' | 'bottom' } | null>(null);
    const engines = ['classic', 'modern', 'rustic'] as const;
    const placements = ['left', 'right', 'top', 'bottom'] as const;

    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: '120px repeat(3, 1fr)', gap: 16 }}>
          <div style={{ fontWeight: 600 }}>Placement</div>
          {engines.map((e) => (
            <div key={e} style={{ textAlign: 'center', fontWeight: 600, textTransform: 'capitalize' }}>{e}</div>
          ))}
          {placements.map((placement) => (
            <>
              <div key={`label-${placement}`} style={{ textTransform: 'capitalize' }}>{placement}</div>
              {engines.map((engine) => (
                <button
                  key={`${engine}-${placement}`}
                  onClick={() => setConfig({ engine, placement })}
                  style={{ padding: '8px 12px' }}
                >
                  Open
                </button>
              ))}
            </>
          ))}
        </div>
        {config && (
          <Drawer
            open={true}
            engine={config.engine}
            placement={config.placement}
            title={`${config.engine} - ${config.placement}`}
            onClose={() => setConfig(null)}
          >
            <p>Engine: {config.engine}</p>
            <p>Placement: {config.placement}</p>
          </Drawer>
        )}
      </>
    );
  },
};
