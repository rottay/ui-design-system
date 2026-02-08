'use client';

/**
 * TestimonialSection - Carousel Preset
 * Single testimonial displayed at a time with prev/next buttons, larger quote text
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import { createCardStyle } from '../../../helpers';
import type { TestimonialSectionProps } from '../../core';

export const CarouselTestimonialSection = createPreset<TestimonialSectionProps>({
  name: 'TestimonialSection.Carousel',
  render: ({ primitives, props, tokens, engine }: PresetContext<TestimonialSectionProps>) => {
    const { Box, Stack, Button } = primitives;
    const isGlass = engine === 'modern' && !!tokens.glass;
    const { testimonials, title, description, className, style } = props;
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentTestimonial = testimonials[currentIndex];

    const handlePrev = () => {
      setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    };

    const handleNext = () => {
      setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    };

    const renderStars = (rating?: number) => {
      if (!rating) return null;
      return (
        <Box style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Box
              key={i}
              style={{
                color: i < rating ? tokens.colors.warningScale[500] : tokens.colors.neutral[300],
                fontSize: tokens.typography.fontSize['2xl'],
              }}
            >
              ★
            </Box>
          ))}
        </Box>
      );
    };

    if (!currentTestimonial) return null;

    return (
      <Box
        className={className}
        style={{
          padding: `${tokens.spacing[10]}px ${tokens.spacing[4]}px`,
          backgroundColor: tokens.colors.neutral[50],
          ...style,
        }}
      >
        <Stack direction="vertical" spacing="xl" style={{ maxWidth: '900px', margin: '0 auto' }}>
          {(title || description) && (
            <Box style={{ textAlign: 'center' }}>
              {title && (
                <Box
                  style={{
                    fontSize: tokens.typography.fontSize['3xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  {title}
                </Box>
              )}
              {description && (
                <Box
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    color: tokens.colors.neutral[600],
                    lineHeight: tokens.typography.lineHeight.relaxed,
                  }}
                >
                  {description}
                </Box>
              )}
            </Box>
          )}

          <div
            style={{
              ...createCardStyle(tokens, {
                glass: isGlass,
                elevation: 'md',
                padding: tokens.spacing[8],
              }),
            }}
          >
            <Stack direction="vertical" spacing="lg" style={{ textAlign: 'center' }}>
              {/* Quote mark */}
              <Box
                style={{
                  fontSize: '72px',
                  color: tokens.colors.primaryScale[200],
                  lineHeight: 1,
                  height: '48px',
                }}
              >
                "
              </Box>

              {/* Quote text - larger */}
              <Box
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  color: tokens.colors.neutral[700],
                  lineHeight: tokens.typography.lineHeight.relaxed,
                  fontStyle: 'italic',
                }}
              >
                {currentTestimonial.quote}
              </Box>

              {/* Rating */}
              {currentTestimonial.rating && (
                <Box>{renderStars(currentTestimonial.rating)}</Box>
              )}

              {/* Author info */}
              <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: tokens.spacing[2], marginTop: tokens.spacing[4] }}>
                {currentTestimonial.avatar && (
                  <Box
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: tokens.borderRadius.full,
                      overflow: 'hidden',
                      backgroundColor: tokens.colors.neutral[200],
                    }}
                  >
                    {currentTestimonial.avatar}
                  </Box>
                )}

                <Box>
                  <Box
                    style={{
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    {currentTestimonial.author}
                  </Box>
                  {(currentTestimonial.role || currentTestimonial.company) && (
                    <Box
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      {[currentTestimonial.role, currentTestimonial.company].filter(Boolean).join(' at ')}
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Navigation */}
              <Box style={{ display: 'flex', gap: tokens.spacing[3], justifyContent: 'center', marginTop: tokens.spacing[4] }}>
                <Button onClick={handlePrev} variant="default">
                  ← Previous
                </Button>
                <Box
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: `0 ${tokens.spacing[4]}px`,
                    color: tokens.colors.neutral[500],
                    fontSize: tokens.typography.fontSize.sm,
                  }}
                >
                  {currentIndex + 1} of {testimonials.length}
                </Box>
                <Button onClick={handleNext} variant="default">
                  Next →
                </Button>
              </Box>
            </Stack>
          </div>
        </Stack>
      </Box>
    );
  },
});
