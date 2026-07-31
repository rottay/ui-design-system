/**
 * Modal Component Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal } from './';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Modal> = {
  title: 'Primitives/Feedback/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
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
    centered: {
      control: 'boolean',
    },
    closeOnOverlayClick: {
      control: 'boolean',
    },
    closeOnEscape: {
      control: 'boolean',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Modal>;

const ModalDemo = (props: any) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open Modal</button>
      <Modal {...props} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export const Default: Story = {
  render: () => (
    <ModalDemo title="Default Modal" size="md">
      <p>This is the modal content.</p>
      <p>You can put any content here.</p>
    </ModalDemo>
  ),
};

export const Sizes: Story = {
  render: () => {
    const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl' | 'full' | null>(null);
    return (
      <>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
            <button key={s} onClick={() => setSize(s)}>{s.toUpperCase()}</button>
          ))}
        </div>
        <Modal
          open={!!size}
          size={size || 'md'}
          title={`${size?.toUpperCase()} Modal`}
          onClose={() => setSize(null)}
        >
          <p>This is a {size} modal.</p>
        </Modal>
      </>
    );
  },
};

export const WithFooter: Story = {
  render: () => (
    <ModalDemo
      title="Modal with Footer"
      okText="Confirm"
      cancelText="Cancel"
      onOk={() => alert('OK clicked')}
      onCancel={() => alert('Cancel clicked')}
    >
      <p>This modal has OK and Cancel buttons.</p>
    </ModalDemo>
  ),
};

export const CustomFooter: Story = {
  render: () => (
    <ModalDemo
      title="Custom Footer"
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button>Custom Action 1</button>
          <button>Custom Action 2</button>
          <button style={{ backgroundColor: '#1890ff', color: 'white' }}>
            Custom Primary
          </button>
        </div>
      }
    >
      <p>This modal has a custom footer.</p>
    </ModalDemo>
  ),
};

export const NoFooter: Story = {
  render: () => (
    <ModalDemo title="No Footer" hideFooter>
      <p>This modal has no footer.</p>
      <p>Useful for simple informational dialogs.</p>
    </ModalDemo>
  ),
};

export const NotClosable: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>Open Modal</button>
        <Modal
          open={open}
          title="Not Closable"
          closable={false}
          closeOnOverlayClick={false}
          closeOnEscape={false}
          footer={<button onClick={() => setOpen(false)}>Close via Button</button>}
        >
          <p>This modal can only be closed via the button below.</p>
        </Modal>
      </>
    );
  },
};

export const ConfirmLoading: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleOk = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setOpen(false);
      }, 2000);
    };

    return (
      <>
        <button onClick={() => setOpen(true)}>Open Modal</button>
        <Modal
          open={open}
          title="Async Operation"
          confirmLoading={loading}
          onOk={handleOk}
          onClose={() => setOpen(false)}
        >
          <p>Click OK to simulate an async operation.</p>
        </Modal>
      </>
    );
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Modal trigger buttons across all 3 engines.
 * Click each button to open a modal rendered with that engine.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Modal rendered by Classic (Ant Design), Modern (Rottay native dialog), and Rustic (Vanilla CSS). Click each button to open the modal.',
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
              Open {engineName} Modal
            </button>
          )}
          props={{ engineName: 'classic' }}
          showDescriptions
        />
        <Modal
          open={!!engine}
          engine={engine || 'classic'}
          title={`${engine?.charAt(0).toUpperCase()}${engine?.slice(1)} Engine Modal`}
          onClose={() => setEngine(null)}
        >
          <p>This modal uses the {engine} engine.</p>
          <p>Click outside or press ESC to close.</p>
        </Modal>
      </>
    );
  },
};

/**
 * Matrix showing all sizes across all engines.
 */
export const VariantMatrix: Story = {
  name: '📊 Variant × Engine Matrix',
  parameters: {
    docs: {
      description: {
        story: 'Since Modal is an overlay component, use the CompareEngines story above to test different engines interactively.',
      },
    },
  },
  render: () => {
    const [config, setConfig] = useState<{ engine: 'classic' | 'modern' | 'rustic'; size: 'sm' | 'md' | 'lg' | 'xl' } | null>(null);
    const engines = ['classic', 'modern', 'rustic'] as const;
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;

    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: '120px repeat(3, 1fr)', gap: 16 }}>
          <div style={{ fontWeight: 600 }}>Size</div>
          {engines.map((e) => (
            <div key={e} style={{ textAlign: 'center', fontWeight: 600, textTransform: 'capitalize' }}>{e}</div>
          ))}
          {sizes.map((size) => (
            <>
              <div key={`label-${size}`} style={{ textTransform: 'uppercase' }}>{size}</div>
              {engines.map((engine) => (
                <button
                  key={`${engine}-${size}`}
                  onClick={() => setConfig({ engine, size })}
                  style={{ padding: '8px 12px' }}
                >
                  Open
                </button>
              ))}
            </>
          ))}
        </div>
        {config && (
          <Modal
            open={true}
            engine={config.engine}
            size={config.size}
            title={`${config.engine} - ${config.size}`}
            onClose={() => setConfig(null)}
          >
            <p>Engine: {config.engine}</p>
            <p>Size: {config.size}</p>
          </Modal>
        )}
      </>
    );
  },
};
