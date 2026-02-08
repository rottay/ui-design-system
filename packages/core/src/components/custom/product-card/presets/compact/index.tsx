'use client';

import { useState, useMemo} from 'react';
import { createPreset } from '../../../factory';
import { createCardStyle } from '../../../helpers';
import type { ProductCardProps } from '../../core';
import { PRODUCT_CARD_DEFAULTS } from '../../core';

export const CompactPreset = createPreset<ProductCardProps>((context) => {
  const { primitives, props, tokens, engine } = context;
  const isGlass = engine === 'modern' && !!tokens.glass;
  const { Box, Text, Button } = primitives;
  const {
    title,
    price,
    originalPrice,
    image,
    rating,
    badge,
    onAddToCart,
    onClick,
    inStock = PRODUCT_CARD_DEFAULTS.inStock,
    className,
    style,
  } = props;
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = useMemo(() => createCardStyle(tokens, {
    glass: isGlass,
    interactive: !!onClick,
  }), [tokens, onClick]);

  return (
    <Box
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transition: `all ${tokens.motion.hover}`,
        transform: isHovered && onClick ? tokens.motion.transform : 'none',
        ...cardStyle,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        maxWidth: '200px',
        ...style,
      }}
      onClick={onClick}
    >
      {/* Image section */}
      <Box
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          backgroundColor: tokens.colors.neutral[100],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {image ? (
          typeof image === 'string' ? (
            <img
              src={image}
              alt={title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            image
          )
        ) : (
          <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.xs }}>No Image</Text>
        )}

        {badge && (
          <Box
            style={{
              position: 'absolute',
              top: tokens.spacing[1],
              left: tokens.spacing[1],
              padding: `2px ${tokens.spacing[1]}`,
              backgroundColor:
                badge.toLowerCase() === 'sale'
                  ? tokens.colors.errorScale[500]
                  : tokens.colors.successScale[500],
              color: tokens.colors.common.white,
              borderRadius: tokens.borderRadius.sm,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
            }}
          >
            {badge}
          </Box>
        )}
      </Box>

      {/* Content section */}
      <Box
        style={{
          padding: tokens.spacing[2],
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[1],
        }}
      >
        {/* Title */}
        <Text
          style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            color: tokens.colors.neutral[900],
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </Text>

        {/* Rating */}
        {rating !== undefined && (
          <Box
            style={{
              display: 'flex',
              gap: '1px',
            }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Text
                key={i}
                style={{
                  color: i < rating ? tokens.colors.warningScale[500] : tokens.colors.neutral[300],
                  fontSize: tokens.typography.fontSize.xs,
                }}
              >
                ★
              </Text>
            ))}
          </Box>
        )}

        {/* Price */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: tokens.spacing[1],
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
            }}
          >
            {price}
          </Text>
          {originalPrice && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
                textDecoration: 'line-through',
              }}
            >
              {originalPrice}
            </Text>
          )}
        </Box>

        {/* Quick add button */}
        {onAddToCart && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            disabled={!inStock}
            style={{
              marginTop: tokens.spacing[1],
              width: '100%',
              fontSize: tokens.typography.fontSize.xs,
              padding: tokens.spacing[1],
            }}
          >
            +
          </Button>
        )}
      </Box>
    </Box>
  );
});
