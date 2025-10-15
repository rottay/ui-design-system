import React from 'react';
import type { DaisyCardProps } from './types';

/**
 * DaisyUI Card Component
 *
 * A flexible card component using DaisyUI classes.
 *
 * @example
 * ```tsx
 * <DaisyCard
 *   title="Card Title"
 *   description="Card description"
 *   image="https://example.com/image.jpg"
 *   shadow
 *   actions={<button className="btn btn-primary">Action</button>}
 * >
 *   Card content here
 * </DaisyCard>
 * ```
 */
export const DaisyCard: React.FC<DaisyCardProps> = ({
  title,
  description,
  image,
  imagePosition = 'top',
  variant = 'normal',
  shadow = false,
  glass = false,
  actions,
  children,
  className = '',
}) => {
  const classes = [
    'card',
    shadow ? 'shadow-xl' : '',
    variant === 'bordered' ? 'card-bordered' : '',
    variant === 'compact' ? 'card-compact' : '',
    variant === 'side' ? 'card-side' : '',
    glass ? 'glass' : 'bg-base-100',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderImage = () => {
    if (!image) return null;

    return (
      <figure className={imagePosition === 'bottom' ? 'order-2' : ''}>
        <img src={image} alt={title || 'Card image'} />
      </figure>
    );
  };

  return (
    <div className={classes}>
      {imagePosition !== 'bottom' && renderImage()}

      <div className="card-body">
        {title && <h2 className="card-title">{title}</h2>}
        {description && <p>{description}</p>}
        {children}
        {actions && <div className="card-actions justify-end">{actions}</div>}
      </div>

      {imagePosition === 'bottom' && renderImage()}
    </div>
  );
};

DaisyCard.displayName = 'DaisyCard';
