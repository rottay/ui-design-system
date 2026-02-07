'use client';

import React from 'react';
import { createPreset } from '../../../factory';
import type { ReviewListProps } from '../../core';
import { formatDistanceToNow } from '../../../helpers';

export default createPreset<ReviewListProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const { reviews, onHelpful, className, style } = props;

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
  };

  const renderStars = (rating: number) => {
    return (
      <Box style={{
        boxShadow: tokens.shadows.md, display: 'flex', gap: tokens.spacing[1] }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Box
            key={star}
            style={{
              fontSize: '14px',
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
    <Box className={className} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], ...style }}>
      {reviews.map((review) => (
        <Box
          key={review.id}
          style={{
            padding: tokens.spacing[4],
            backgroundColor: tokens.colors.common.white,
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}
        >
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                }}
              >
                {review.author}
              </Text>
              {renderStars(review.rating)}
            </Box>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
              {formatDate(review.date)}
            </Text>
          </Box>

          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[700],
              lineHeight: tokens.typography.lineHeight.normal,
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
                marginTop: tokens.spacing[2],
                padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                border: 'none',
                borderRadius: tokens.borderRadius.sm,
                backgroundColor: 'transparent',
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[600],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = tokens.colors.primaryScale[600];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = tokens.colors.neutral[600];
              }}
            >
              👍 {review.helpful}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
});
