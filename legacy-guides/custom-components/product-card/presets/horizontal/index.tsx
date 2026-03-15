'use client';

import { useState, useMemo } from 'react';
import { createPreset } from '../../../factory';
import { createCardStyle } from '../../../helpers';
import type { ProductCardProps } from '../../core';
import { PRODUCT_CARD_DEFAULTS } from '../../core';

export const HorizontalPreset = createPreset<ProductCardProps>((context) => {
  const { primitives, props, tokens, engine } = context;
  const isGlass = tokens.surface.useGlass && !!tokens.glass;
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
        flexDirection: 'row',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onClick={onClick}
    >
      {/* Image section */}
      <Box
        style={{
          width: '200px',
          minWidth: '200px',
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
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: tokens.spacing[4],
          }}
        >
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[1],
              flex: 1,
            }}
          >
            {/* Title */}
            <Text
              style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
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
          </Box>

          {/* Price and button */}
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: tokens.spacing[2],
              minWidth: '120px',
            }}
          >
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: tokens.spacing[1],
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

            {onAddToCart && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart();
                }}
                disabled={!inStock}
                style={{
                  width: '100%',
                }}
              >
                {inStock ? 'Add' : 'Unavailable'}
              </Button>
            )}
          </Box>
        </Box>

        {!inStock && (
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.errorScale[600],
              fontWeight: tokens.typography.fontWeight.medium,
            }}
          >
            Out of Stock
          </Text>
        )}
      </Box>
    </Box>
  );
});
