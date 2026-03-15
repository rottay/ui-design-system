'use client';

import React from 'react';
import { createPreset } from '../../../factory';
import type { ReviewListProps } from '../../core';
import {
  createBadgeStyle,
  createCardStyle,
  createHoverStyle,
  formatDistanceToNow,
} from '../../../helpers';

export default createPreset<ReviewListProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const { reviews, breakdown, onHelpful, className, style } = props;

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
  };

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const starSize = size === 'sm' ? '16px' : '20px';
    return (
      <Box style={{
        boxShadow: tokens.shadows.md, display: 'flex', gap: tokens.spacing[1] }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Box
            key={star}
            style={{
              fontSize: starSize,
              color: star <= rating ? tokens.colors.warningScale[500] : tokens.colors.neutral[300],
            }}
          >
            ★
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box className={className} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[8], ...style }}>
      {/* Rating Summary */}
      {breakdown && (
        <Box
          style={{
            padding: tokens.spacing[8],
            backgroundColor: tokens.colors.common.white,
            borderRadius: tokens.borderRadius.lg,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}
        >
          <Box style={{ display: 'flex', gap: tokens.spacing[8], alignItems: 'center', marginBottom: tokens.spacing[6] }}>
            <Box style={{ textAlign: 'center' }}>
              <Text
                style={{
                  fontSize: '48px',
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  lineHeight: '1',
                }}
              >
                {breakdown.average.toFixed(1)}
              </Text>
              {renderStars(Math.round(breakdown.average), 'lg')}
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600],
                  marginTop: tokens.spacing[1],
                }}
              >
                {breakdown.total} reviews
              </Text>
            </Box>

            {/* Distribution Bars */}
            <Box style={{ flex: 1 }}>
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = breakdown.distribution[rating - 1] || 0;
                const percentage = breakdown.total > 0 ? (count / breakdown.total) * 100 : 0;

                return (
                  <Box key={rating} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], marginBottom: tokens.spacing[2] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], width: '30px' }}>
                      {rating} ★
                    </Text>
                    <Box
                      style={{
                        flex: 1,
                        height: '8px',
                        backgroundColor: tokens.colors.neutral[100],
                        borderRadius: tokens.borderRadius.full,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: tokens.colors.warningScale[500],
                          transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                        }}
                      />
                    </Box>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], width: '40px', textAlign: 'right' }}>
                      {count}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      )}

      {/* Reviews */}
      <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
        {reviews.map((review) => (
          <Box
            key={review.id}
            style={{
              padding: tokens.spacing[6],
              backgroundColor: tokens.colors.common.white,
              borderRadius: tokens.borderRadius.lg,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}
          >
            <Box style={{ display: 'flex', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
              {/* Avatar */}
              {review.avatar ? (
                <Box
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: tokens.borderRadius.full,
                    backgroundImage: `url(${review.avatar})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <Box
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.primaryScale[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.primaryScale[600],
                    }}
                  >
                    {review.author.charAt(0).toUpperCase()}
                  </Text>
                </Box>
              )}

              <Box style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                  }}
                >
                  {review.author}
                </Text>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginTop: tokens.spacing[1] }}>
                  {renderStars(review.rating)}
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                    {formatDate(review.date)}
                  </Text>
                </Box>
              </Box>
            </Box>

            {review.title && (
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[2],
                }}
              >
                {review.title}
              </Text>
            )}

            <Text
              style={{
                fontSize: tokens.typography.fontSize.md,
                color: tokens.colors.neutral[700],
                lineHeight: tokens.typography.lineHeight.relaxed,
                marginBottom: tokens.spacing[4],
              }}
            >
              {review.content}
            </Text>

            {review.helpful !== undefined && (
              <Box
                as="button"
                onClick={() => onHelpful?.(review.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[700],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
                  e.currentTarget.style.transform = tokens.motion.transform;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = tokens.colors.common.white;
                  e.currentTarget.style.transform = 'none';
                }}
              >
                👍 Helpful ({review.helpful})
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
});
