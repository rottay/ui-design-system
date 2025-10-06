import type { Meta, StoryObj } from '@storybook/react';
import { RatingCard } from './RatingCard';
import { Space, Row, Col } from 'antd';
import { useState } from 'react';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';

const meta: Meta<typeof RatingCard> = {
  title: 'Feedback/Rate/RatingCard',
  component: RatingCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Tarjeta de calificación que combina estrellas, estadísticas y reseñas en un componente integrado.

## 📚 Recursos de Ant Design

- [📖 Documentación oficial de Ant Design](https://ant.design/components/rate)
- [🎨 API de Props](https://ant.design/components/rate#api)
- [💡 Ejemplos](https://ant.design/components/rate#examples)

## Cuándo usar

- Para mostrar calificaciones de productos o servicios
- Cuando necesitas un componente completo de rating con detalles
- Para páginas de reseñas o evaluaciones de usuarios
        `,
      },
    },
  },
  argTypes: {
    vertical: { control: 'boolean' },
    showCount: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof RatingCard>;

export const Basic: Story = {
  render: () => {
    const [value, setValue] = useState(3);

    return (
      <RatingCard
        title="Rate this product"
        description="Share your experience with other customers"
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const WithCount: Story = {
  render: () => {
    const [value, setValue] = useState(4.5);

    return (
      <RatingCard
        title="Customer Rating"
        description="Based on verified purchases"
        value={value}
        onChange={setValue}
        showCount
        count={1234}
        averageRating={4.5}
      />
    );
  },
};

export const VerticalLayout: Story = {
  render: () => {
    const [value, setValue] = useState(4);

    return (
      <RatingCard
        title="Product Quality"
        description="How would you rate the quality?"
        value={value}
        onChange={setValue}
        vertical
        showCount
        count={567}
        averageRating={4.2}
        style={{ width: 300 }}
      />
    );
  },
};

export const CustomCharacter: Story = {
  render: () => {
    const [value, setValue] = useState(3);

    return (
      <RatingCard
        title="Rate with Hearts"
        description="Show some love!"
        value={value}
        onChange={setValue}
        rateProps={{
          character: ({ index = 0 }) => {
            return index < value ? <HeartFilled /> : <HeartOutlined />;
          },
        }}
      />
    );
  },
};

export const ReadOnly: Story = {
  render: () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <RatingCard
        title="Excellent Product"
        description="Highly recommended by our customers"
        value={5}
        showCount
        count={2341}
        averageRating={4.9}
        rateProps={{ disabled: true }}
      />
      <RatingCard
        title="Good Service"
        description="Above average satisfaction"
        value={4}
        showCount
        count={876}
        averageRating={4.1}
        rateProps={{ disabled: true }}
      />
      <RatingCard
        title="Average Experience"
        description="Room for improvement"
        value={3}
        showCount
        count={234}
        averageRating={3.2}
        rateProps={{ disabled: true }}
      />
    </Space>
  ),
};

export const AllowHalf: Story = {
  render: () => {
    const [value, setValue] = useState(3.5);

    return (
      <RatingCard
        title="Detailed Rating"
        description="Rate with half stars for precision"
        value={value}
        onChange={setValue}
        showCount
        averageRating={value}
        rateProps={{ allowHalf: true }}
      />
    );
  },
};

export const CustomCount: Story = {
  render: () => {
    const [value, setValue] = useState(5);

    return (
      <RatingCard
        title="Rate out of 10"
        description="Provide a more detailed rating"
        value={value}
        onChange={setValue}
        showCount
        averageRating={value}
        count={123}
        rateProps={{ count: 10 }}
      />
    );
  },
};

export const MultipleRatings: Story = {
  render: () => {
    const [quality, setQuality] = useState(4);
    const [price, setPrice] = useState(3);
    const [service, setService] = useState(5);

    return (
      <Row gutter={16}>
        <Col span={8}>
          <RatingCard
            title="Quality"
            value={quality}
            onChange={setQuality}
            showCount
            averageRating={quality}
            count={234}
          />
        </Col>
        <Col span={8}>
          <RatingCard
            title="Price"
            value={price}
            onChange={setPrice}
            showCount
            averageRating={price}
            count={198}
          />
        </Col>
        <Col span={8}>
          <RatingCard
            title="Service"
            value={service}
            onChange={setService}
            showCount
            averageRating={service}
            count={312}
          />
        </Col>
      </Row>
    );
  },
};

export const WithCustomStyles: Story = {
  render: () => {
    const [value, setValue] = useState(4);

    return (
      <RatingCard
        title="Premium Rating"
        description="Exclusive customer feedback"
        value={value}
        onChange={setValue}
        showCount
        count={89}
        averageRating={4.8}
        bordered={false}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
        bodyStyle={{ padding: '24px' }}
        rateProps={{
          style: { fontSize: 24 },
        }}
      />
    );
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    const [ratings, setRatings] = useState({
      taste: 0,
      presentation: 0,
      service: 0,
      value: 0,
    });

    const handleRatingChange = (key: string, value: number) => {
      setRatings((prev) => ({ ...prev, [key]: value }));
    };

    const averageRating =
      Object.values(ratings).reduce((sum, val) => sum + val, 0) / 4;

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <RatingCard
          title="Overall Rating"
          description="Average of all ratings"
          value={averageRating}
          showCount
          averageRating={averageRating}
          rateProps={{ disabled: true, allowHalf: true }}
          style={{ background: '#f0f2f5' }}
        />
        <Row gutter={16}>
          <Col span={12}>
            <RatingCard
              title="Taste"
              value={ratings.taste}
              onChange={(val) => handleRatingChange('taste', val)}
            />
          </Col>
          <Col span={12}>
            <RatingCard
              title="Presentation"
              value={ratings.presentation}
              onChange={(val) => handleRatingChange('presentation', val)}
            />
          </Col>
          <Col span={12}>
            <RatingCard
              title="Service"
              value={ratings.service}
              onChange={(val) => handleRatingChange('service', val)}
            />
          </Col>
          <Col span={12}>
            <RatingCard
              title="Value"
              value={ratings.value}
              onChange={(val) => handleRatingChange('value', val)}
            />
          </Col>
        </Row>
      </Space>
    );
  },
};
