/**
 * Upload Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Upload } from './';
import { DesignSystemProvider } from '../../../../bootstrap';
import { EngineComparison, VariantEngineMatrix } from '../../../../../.storybook/helpers';

const meta: Meta<typeof Upload> = {
  title: 'Primitives/Inputs/Upload',
  component: Upload,
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
Upload component for file selection and upload with support for drag-and-drop, file lists, and multiple engines.

## Engine Differences

| Feature | Classic | Modern | Rustic |
|---------|-------|--------|--------|
| Library | Ant Design | DaisyUI | Vanilla CSS |
| Dragger | Built-in | Custom | Custom |
| File List | Full | Limited | Full |
| Preview | Built-in | Custom | Custom |
`,
      },
    },
  },
  argTypes: {
    listType: {
      control: 'select',
      options: ['text', 'picture', 'picture-card', 'picture-circle'],
      description: 'Display type for the upload list',
    },
    accept: {
      control: 'text',
      description: 'Accepted file types (e.g., "image/*", ".pdf,.doc")',
    },
    multiple: {
      control: 'boolean',
      description: 'Allow multiple file selection',
    },
    maxCount: {
      control: 'number',
      description: 'Maximum number of files allowed',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the upload component',
    },
    showUploadList: {
      control: 'boolean',
      description: 'Show the list of uploaded files',
    },
    engine: {
      control: 'select',
      options: ['classic', 'modern', 'rustic'],
      description: 'Rendering engine to use',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Upload>;

export const Default: Story = {
  args: {
    children: (
      <button type="button" style={{ padding: '8px 16px', cursor: 'pointer' }}>
        Click to Upload
      </button>
    ),
  },
};

export const WithAccept: Story = {
  args: {
    accept: 'image/*',
    children: (
      <button type="button" style={{ padding: '8px 16px', cursor: 'pointer' }}>
        Upload Images Only
      </button>
    ),
  },
};

export const Multiple: Story = {
  args: {
    multiple: true,
    children: (
      <button type="button" style={{ padding: '8px 16px', cursor: 'pointer' }}>
        Upload Multiple Files
      </button>
    ),
  },
};

export const WithMaxCount: Story = {
  args: {
    multiple: true,
    maxCount: 3,
    children: (
      <button type="button" style={{ padding: '8px 16px', cursor: 'pointer' }}>
        Upload (Max 3 files)
      </button>
    ),
  },
};

export const ListTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['text', 'picture', 'picture-card', 'picture-circle'] as const).map((listType) => (
        <div key={listType}>
          <h4 style={{ margin: '0 0 8px 0', textTransform: 'capitalize' }}>{listType}</h4>
          <Upload listType={listType}>
            <button type="button" style={{ padding: '8px 16px', cursor: 'pointer' }}>
              Upload ({listType})
            </button>
          </Upload>
        </div>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: (
      <button type="button" style={{ padding: '8px 16px', cursor: 'not-allowed', opacity: 0.5 }}>
        Upload Disabled
      </button>
    ),
  },
};

export const Dragger: Story = {
  render: () => (
    <Upload.Dragger>
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: 48, margin: 0 }}>+</p>
        <p style={{ margin: '8px 0 0' }}>Click or drag file to this area to upload</p>
      </div>
    </Upload.Dragger>
  ),
};

export const DraggerWithHeight: Story = {
  render: () => (
    <Upload.Dragger height={300}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 48, margin: 0 }}>+</p>
        <p style={{ margin: '8px 0 0' }}>Drag and drop files here</p>
        <p style={{ margin: '4px 0 0', color: '#888' }}>Support for single or bulk upload</p>
      </div>
    </Upload.Dragger>
  ),
};

export const DraggerMultiple: Story = {
  render: () => (
    <Upload.Dragger multiple accept="image/*">
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 48, margin: 0 }}>+</p>
        <p style={{ margin: '8px 0 0' }}>Drop multiple images here</p>
      </div>
    </Upload.Dragger>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of the Upload component across all 3 engines.
 */
export const CompareEngines: Story = {
  name: '🔄 Engine Comparison',
  parameters: {
    docs: {
      description: {
        story: 'Compare the same Upload rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).',
      },
    },
  },
  render: () => (
    <EngineComparison
      component={Upload}
      props={{
        children: (
          <button type="button" style={{ padding: '8px 16px', cursor: 'pointer' }}>
            Click to Upload
          </button>
        ),
      }}
      showDescriptions
    />
  ),
};

/**
 * Matrix showing all list types across all engines.
 */
export const ListTypeMatrix: Story = {
  name: '📋 List Type × Engine Matrix',
  render: () => (
    <VariantEngineMatrix
      component={Upload}
      baseProps={{
        children: (
          <button type="button" style={{ padding: '8px 16px', cursor: 'pointer' }}>
            Upload
          </button>
        ),
      }}
      variantProp="listType"
      variants={['text', 'picture', 'picture-card']}
    />
  ),
};
