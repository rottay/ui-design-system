import type { Meta, StoryObj } from '@storybook/react';
import { Empty } from './Empty';

const meta: Meta<typeof Empty> = {
  title: 'Display/Empty',
  component: Empty,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Componente para mostrar estado vacío cuando no hay datos.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/empty)
- [🎨 API de Props](https://ant.design/components/empty#api)
- [💡 Ejemplos](https://ant.design/components/empty#examples)

## Cuándo usar

- Cuando una lista, tabla o contenedor no tiene datos para mostrar.
- Para mejorar la experiencia de usuario mostrando un estado vacío claro y amigable.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Empty>;

export const Basic: Story = {
  args: {},
};

export const WithDescription: Story = {
  args: {
    description: 'No Data',
  },
};

export const CustomDescription: Story = {
  args: {
    description: (
      <span>
        Customize <a href="#API">Description</a>
      </span>
    ),
  },
};

export const SimpleImage: Story = {
  args: {
    image: 'SIMPLE',
  },
};

export const CustomImage: Story = {
  args: {
    image: 'https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg',
    imageStyle: {
      height: 60,
    },
    description: 'Custom Empty Image',
  },
};

export const NoDescription: Story = {
  args: {
    description: false,
  },
};
