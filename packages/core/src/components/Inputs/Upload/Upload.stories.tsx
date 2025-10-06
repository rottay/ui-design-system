import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Upload } from './Upload';
import { Button } from 'antd';
import { UploadOutlined, InboxOutlined, PlusOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const meta: Meta<typeof Upload> = {
  title: 'Inputs/Upload',
  component: Upload,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente para cargar archivos mediante selección o arrastre.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/upload)
- [🎨 API de Props](https://ant.design/components/upload#api)
- [💡 Ejemplos](https://ant.design/components/upload#examples)

## Cuándo usar

- Para permitir a los usuarios cargar documentos, imágenes, o archivos
- Cuando necesitas validación de tipo y tamaño de archivo
- Para mostrar el progreso y estado de carga de archivos
        `,
      },
    },
  },
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    multiple: {
      control: 'boolean',
    },
    listType: {
      control: 'select',
      options: ['text', 'picture', 'picture-card'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Upload>;

const props: UploadProps = {
  name: 'file',
  action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
  headers: {
    authorization: 'authorization-text',
  },
  onChange(info) {
    if (info.file.status === 'done') {
      console.log(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      console.log(`${info.file.name} file upload failed.`);
    }
  },
};

export const Basic: Story = {
  render: () => (
    <Upload {...props}>
      <Button icon={<UploadOutlined />}>Click to Upload</Button>
    </Upload>
  ),
};

export const Dragger: Story = {
  render: () => (
    <Upload.Dragger {...props}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined style={{ fontSize: '48px', color: '#1677ff' }} />
      </p>
      <p className="ant-upload-text">Click or drag file to this area to upload</p>
      <p className="ant-upload-hint">
        Support for a single or bulk upload. Strictly prohibited from uploading company data or
        other banned files.
      </p>
    </Upload.Dragger>
  ),
};

export const Avatar: Story = {
  render: () => {
    const uploadButton = (
      <button style={{ border: 0, background: 'none' }} type="button">
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>Upload</div>
      </button>
    );

    return (
      <Upload
        {...props}
        listType="picture-circle"
        maxCount={1}
      >
        {uploadButton}
      </Upload>
    );
  },
};

export const PictureCard: Story = {
  render: () => {
    const [fileList, setFileList] = useState([]);

    const onChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
      setFileList(newFileList as any);
    };

    const uploadButton = (
      <button style={{ border: 0, background: 'none' }} type="button">
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>Upload</div>
      </button>
    );

    return (
      <Upload
        action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
        listType="picture-card"
        fileList={fileList}
        onChange={onChange}
      >
        {fileList.length >= 8 ? null : uploadButton}
      </Upload>
    );
  },
};

export const FileList: Story = {
  render: () => {
    const defaultFileList = [
      {
        uid: '1',
        name: 'xxx.png',
        status: 'done' as const,
        url: 'http://www.baidu.com/xxx.png',
      },
      {
        uid: '2',
        name: 'yyy.png',
        status: 'done' as const,
        url: 'http://www.baidu.com/yyy.png',
      },
      {
        uid: '3',
        name: 'zzz.png',
        status: 'error' as const,
      },
    ];

    return (
      <Upload {...props} defaultFileList={defaultFileList}>
        <Button icon={<UploadOutlined />}>Upload</Button>
      </Upload>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <Upload {...props} disabled>
      <Button icon={<UploadOutlined />} disabled>
        Disabled Upload
      </Button>
    </Upload>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Upload {...props} multiple>
      <Button icon={<UploadOutlined />}>Upload Multiple Files</Button>
    </Upload>
  ),
};

export const Directory: Story = {
  render: () => (
    <Upload {...props} directory>
      <Button icon={<UploadOutlined />}>Upload Directory</Button>
    </Upload>
  ),
};

export const CustomRequest: Story = {
  render: () => {
    const customRequest = ({ onSuccess }: any) => {
      setTimeout(() => {
        onSuccess('ok');
      }, 0);
    };

    return (
      <Upload customRequest={customRequest}>
        <Button icon={<UploadOutlined />}>Custom Request Upload</Button>
      </Upload>
    );
  },
};
