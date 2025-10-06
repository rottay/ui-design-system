import { Card as AntCard } from 'antd';

// Re-export Card with all its subcomponents
export const Card = Object.assign(AntCard, {
  Grid: AntCard.Grid,
  Meta: AntCard.Meta,
});

// Export type separately
export type { CardProps } from 'antd';
