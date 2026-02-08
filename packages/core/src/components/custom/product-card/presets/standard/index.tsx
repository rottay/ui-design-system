'use client';

import { useState, useMemo } from 'react';
import { createPreset } from '../../../factory';
import { createCardStyle } from '../../../helpers';
import type { ProductCardProps } from '../../core';
import { PRODUCT_CARD_DEFAULTS } from '../../core';

export const StandardPreset = createPreset<ProductCardProps>((context) => {
  const { primitives, props, tokens, engine } = context;
  const isGlass = engine === 'modern' && !!tokens.glass;
  const { Box, Text, Button } = primitives;
  const {
    title,
    price,
    originalPrice,
    image,
    rating,
    reviewCount,
    badge,
    description,
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

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Text
          key={i}
          style={{
            transition: `all ${tokens.motion.hover}`,
            transform: isHovered && onClick ? tokens.motion.transform : 'none',
            color: i < rating ? tokens.colors.warningScale[500] : tokens.colors.neutral[300],
            fontSize: tokens.typography.fontSize.sm,
          }}
        >
          ★
        </Text>
      );
    }
    return stars;
  };

  return (
    <Box
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...cardStyle,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onClick={onClick}
    >
      {/* Image section */}
      <Box
        style={{
          width: '100%',
          aspectRatio: '4 / 3',
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
          <Text style={{ color: tokens.colors.neutral[400] }}>No Image</Text>
        )}

        {/* Badge overlay */}
        {badge && (
          <Box
            style={{
              position: 'absolute',
              top: tokens.spacing[2],
              left: tokens.spacing[2],
              padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
              backgroundColor:
                badge.toLowerCase() === 'sale'
                  ? tokens.colors.errorScale[500]
                  : tokens.colors.successScale[500],
              color: tokens.colors.common.white,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              textTransform: 'uppercase',
            }}
          >
            {badge}
          </Box>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: tokens.overlay?.heavy,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
              }}
            >
              Out of Stock
            </Text>
          </Box>
        )}
      </Box>

      {/* Content section */}
      <Box
        style={{
          padding: tokens.spacing[6],
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[2],
          flex: 1,
        }}
      >
        {/* Title */}
        <Text
          style={{
            fontSize: tokens.typography.fontSize.md,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[900],
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </Text>

        {/* Description */}
        {description && (
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[600],
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </Text>
        )}

        {/* Rating */}
        {rating !== undefined && (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
            }}
          >
            <Box style={{ display: 'flex', gap: '2px' }}>{renderStars(rating)}</Box>
            {reviewCount !== undefined && (
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}
              >
                ({reviewCount})
              </Text>
            )}
          </Box>
        )}

        {/* Price */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: tokens.spacing[2],
            marginTop: tokens.spacing[1],
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
            }}
          >
            {price}
          </Text>
          {originalPrice && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[400],
                textDecoration: 'line-through',
              }}
            >
              {originalPrice}
            </Text>
          )}
        </Box>

        {/* Add to cart button */}
        {onAddToCart && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            disabled={!inStock}
            style={{
              marginTop: tokens.spacing[2],
              width: '100%',
            }}
          >
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        )}
      </Box>
    </Box>
  );
});
