/**
 * Modal Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from '../';
import { DesignSystemProvider } from '../../../../../core/providers/root';
import React, { useState } from 'react';
import { EngineComparison as EngineComparisonHelper, VariantEngineMatrix } from '../../../../../../.storybook/helpers';

const meta: Meta<typeof Modal> = {
  title: 'Primitives/Overlay/Modal',
  component: Modal,
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
        component: `
Modal is a dialog component that appears on top of the main content, requiring user interaction before they can return to the main view.

### Features
- Multiple sizes (xs to 5xl, plus full screen)
- Customizable header, body, and footer
- Backdrop with optional blur effect
- Close on backdrop click or ESC key
- Focus trap for accessibility
- Scroll lock on body
- Portal rendering
- Support for all three engines (Titan, Hermes, Apollo)
        `,
      },
    },
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the modal is visible',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', 'full'],
      description: 'Size of the modal',
    },
    placement: {
      control: 'select',
      options: ['center', 'top', 'bottom'],
      description: 'Vertical placement of the modal',
    },
    closable: {
      control: 'boolean',
      description: 'Show close button',
    },
    closeOnBackdropClick: {
      control: 'boolean',
      description: 'Close when clicking backdrop',
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Close when pressing ESC key',
    },
    showBackdrop: {
      control: 'boolean',
      description: 'Show backdrop overlay',
    },
    blurBackdrop: {
      control: 'boolean',
      description: 'Apply blur effect to backdrop',
    },
    fullScreen: {
      control: 'boolean',
      description: 'Full screen modal',
    },
    divider: {
      control: 'boolean',
      description: 'Show dividers between header/body/footer',
    },
    engine: {
      control: 'select',
      options: ['titan', 'hermes', 'apollo'],
      description: 'Rendering engine to use',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Modal>;

// Interactive wrapper for controlled modals
const ModalDemo = (props: React.ComponentProps<typeof Modal> & { buttonText?: string }) => {
  const [open, setOpen] = useState(false);
  const { buttonText = 'Open Modal', ...modalProps } = props;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        {buttonText}
      </button>
      <Modal
        {...modalProps}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

// Default story
export const Default: Story = {
  render: () => (
    <ModalDemo
      title="Default Modal"
      description="This is a simple modal dialog with default settings."
    >
      <p style={{ margin: 0 }}>
        Modal content goes here. You can put any content inside the modal body.
      </p>
    </ModalDemo>
  ),
};

// Size variants
export const SizeVariants: Story = {
  name: 'Size Variants',
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((size) => (
        <ModalDemo
          key={size}
          title={`${size.toUpperCase()} Modal`}
          size={size}
          buttonText={`Size: ${size}`}
        >
          <p>This modal uses size="{size}"</p>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Modals automatically adapt their width based on the size prop.
          </p>
        </ModalDemo>
      ))}
    </div>
  ),
};

// Placement variants
export const PlacementVariants: Story = {
  name: 'Placement Variants',
  render: () => (
    <div style={{ display: 'flex', gap: '12px' }}>
      {(['center', 'top', 'bottom'] as const).map((placement) => (
        <ModalDemo
          key={placement}
          title={`${placement.charAt(0).toUpperCase() + placement.slice(1)} Placement`}
          placement={placement}
          buttonText={`Placement: ${placement}`}
        >
          <p>This modal is positioned at the {placement} of the viewport.</p>
        </ModalDemo>
      ))}
    </div>
  ),
};

// With footer
export const WithFooter: Story = {
  name: 'With Footer',
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Open Modal with Footer
        </button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Confirm Action"
          description="Are you sure you want to proceed with this action?"
          footer={
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Confirmed!');
                  setOpen(false);
                }}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Confirm
              </button>
            </div>
          }
        >
          <p style={{ margin: 0 }}>
            This modal has a footer with action buttons. Click Cancel to close or Confirm to proceed.
          </p>
        </Modal>
      </>
    );
  },
};

// With dividers
export const WithDividers: Story = {
  name: 'With Dividers',
  render: () => (
    <ModalDemo
      title="Modal with Dividers"
      divider
      footer={
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>
            Cancel
          </button>
          <button style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Save
          </button>
        </div>
      }
    >
      <p>This modal shows dividers between header, body, and footer sections.</p>
      <p style={{ color: '#6b7280', fontSize: '14px' }}>
        The divider prop adds visual separation between sections.
      </p>
    </ModalDemo>
  ),
};

// Blur backdrop
export const BlurBackdrop: Story = {
  name: 'Blur Backdrop',
  render: () => (
    <div>
      <div style={{ padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', marginBottom: '16px' }}>
        <h3 style={{ color: 'white', margin: 0 }}>Background Content</h3>
        <p style={{ color: 'rgba(255,255,255,0.8)', margin: '8px 0 0' }}>
          Open the modal to see the blur effect on the backdrop.
        </p>
      </div>
      <ModalDemo
        title="Blur Backdrop Modal"
        blurBackdrop
        buttonText="Open with Blur"
      >
        <p>The backdrop behind this modal has a blur effect applied.</p>
      </ModalDemo>
    </div>
  ),
};

// Full screen
export const FullScreen: Story = {
  name: 'Full Screen',
  render: () => (
    <ModalDemo
      title="Full Screen Modal"
      fullScreen
      buttonText="Open Fullscreen"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Done
          </button>
        </div>
      }
    >
      <div style={{ padding: '20px' }}>
        <h2>Full Screen Content</h2>
        <p>This modal takes up the entire viewport.</p>
        <p style={{ color: '#6b7280' }}>
          Full screen modals are useful for immersive experiences or complex forms.
        </p>
      </div>
    </ModalDemo>
  ),
};

// Non-closable
export const NonClosable: Story = {
  name: 'Non-Closable (No Backdrop Close)',
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Open Required Modal
        </button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Required Action"
          closable={false}
          closeOnBackdropClick={false}
          closeOnEscape={false}
          footer={
            <button
              onClick={() => setOpen(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              I Understand
            </button>
          }
        >
          <p>This modal requires user action to close. You cannot:</p>
          <ul style={{ color: '#6b7280' }}>
            <li>Click the backdrop to close</li>
            <li>Press ESC to close</li>
            <li>Use the X button (it's hidden)</li>
          </ul>
        </Modal>
      </>
    );
  },
};

// Scrollable content
export const ScrollableContent: Story = {
  name: 'Scrollable Content',
  render: () => (
    <ModalDemo
      title="Terms of Service"
      size="md"
      footer={
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>
            Decline
          </button>
          <button style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Accept
          </button>
        </div>
      }
    >
      <div style={{ maxHeight: '300px', overflow: 'auto' }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <p key={i} style={{ margin: '0 0 16px 0' }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        ))}
      </div>
    </ModalDemo>
  ),
};

// Form modal
export const FormModal: Story = {
  name: 'Form Modal',
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Add New User
        </button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Create User"
          description="Fill in the information below to create a new user account."
          size="md"
          footer={
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setOpen(false)}
                style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('User created!');
                  setOpen(false);
                }}
                style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Create User
              </button>
            </div>
          }
        >
          <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Email</label>
              <input
                type="email"
                placeholder="john@example.com"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Role</label>
              <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                <option>Admin</option>
                <option>Editor</option>
                <option>Viewer</option>
              </select>
            </div>
          </form>
        </Modal>
      </>
    );
  },
};

// Nested modals
export const NestedModals: Story = {
  name: 'Nested Modals',
  render: () => {
    const [outerOpen, setOuterOpen] = useState(false);
    const [innerOpen, setInnerOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setOuterOpen(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Open First Modal
        </button>
        <Modal
          open={outerOpen}
          onClose={() => setOuterOpen(false)}
          title="First Modal"
          size="lg"
        >
          <p>This is the first modal. Click the button below to open another modal on top.</p>
          <button
            onClick={() => setInnerOpen(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '12px',
            }}
          >
            Open Second Modal
          </button>
          <Modal
            open={innerOpen}
            onClose={() => setInnerOpen(false)}
            title="Second Modal"
            size="sm"
          >
            <p>This is a nested modal!</p>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Close this modal to return to the first one.
            </p>
          </Modal>
        </Modal>
      </>
    );
  },
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Modal across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Modal rendered by Titan (Ant Design), Hermes (DaisyUI), and Apollo (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: '12px' }}>
      {(['titan', 'hermes', 'apollo'] as const).map((engine) => (
        <ModalDemo
          key={engine}
          engine={engine}
          title={`${engine.charAt(0).toUpperCase() + engine.slice(1)} Engine`}
          buttonText={engine.charAt(0).toUpperCase() + engine.slice(1)}
        >
          <p>This modal is rendered using the {engine} engine.</p>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Each engine provides the same functionality with different underlying implementations.
          </p>
        </ModalDemo>
      ))}
    </div>
  ),
};

// Compound components
export const CompoundComponents: Story = {
  name: 'Compound Components',
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Open Compound Modal
        </button>
        <Modal open={open} onClose={() => setOpen(false)}>
          <Modal.Header>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
              }}>
                AI
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>Custom Header</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Using compound components</div>
              </div>
            </div>
          </Modal.Header>
          <Modal.Body>
            <p style={{ margin: 0 }}>
              This modal uses Modal.Header, Modal.Body, and Modal.Footer compound components
              for maximum flexibility in structuring content.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', width: '100%' }}>
              <button style={{ padding: '8px 16px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                Learn More
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setOpen(false)}
                  style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setOpen(false)}
                  style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Continue
                </button>
              </div>
            </div>
          </Modal.Footer>
        </Modal>
      </>
    );
  },
};
