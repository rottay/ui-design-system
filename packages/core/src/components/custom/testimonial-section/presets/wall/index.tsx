/**
 * TestimonialSection - Wall Preset
 * Masonry-like wall of quotes with varying sizes using CSS columns
 */

import { createPreset, PresetContext } from '../../../factory';
import { createCardStyle } from '../../../helpers';
import type { TestimonialSectionProps } from '../../core';

export const WallTestimonialSection = createPreset<TestimonialSectionProps>({
  name: 'TestimonialSection.Wall',
  render: ({ primitives, props, tokens }: PresetContext<TestimonialSectionProps>) => {
    const { Box, Stack } = primitives;
    const { testimonials, title, description, className, style } = props;

    const renderStars = (rating?: number) => {
      if (!rating) return null;
      return (
        <Box style={{ display: 'flex', gap: '2px' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Box
              key={i}
              style={{
                color: i < rating ? tokens.colors.warningScale[500] : tokens.colors.neutral[300],
                fontSize: '14px',
              }}
            >
              ★
            </Box>
          ))}
        </Box>
      );
    };

    return (
      <Box
        className={className}
        style={{
          padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
          ...style,
        }}
      >
        <Stack direction="vertical" spacing="xl" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {(title || description) && (
            <Box style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
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

          {/* CSS columns for masonry effect */}
          <Box
            style={{
              columnCount: 3,
              columnGap: `${tokens.spacing[6]}px`,
            }}
          >
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                style={{
                  ...createCardStyle(tokens, {
                    elevation: 'sm',
                    padding: tokens.spacing[5],
                  }),
                  marginBottom: tokens.spacing[6],
                  breakInside: 'avoid',
                  display: 'inline-block',
                  width: '100%',
                }}
              >
                <Stack direction="vertical" spacing="sm">
                  {/* Quote mark */}
                  <Box
                    style={{
                      fontSize: '32px',
                      color: tokens.colors.primaryScale[200],
                      lineHeight: 1,
                      height: '24px',
                    }}
                  >
                    "
                  </Box>

                  {/* Quote text */}
                  <Box
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[700],
                      lineHeight: tokens.typography.lineHeight.relaxed,
                    }}
                  >
                    {testimonial.quote}
                  </Box>

                  {/* Rating */}
                  {testimonial.rating && (
                    <Box>{renderStars(testimonial.rating)}</Box>
                  )}

                  {/* Author info - compact */}
                  <Box style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center', marginTop: tokens.spacing[2], paddingTop: tokens.spacing[2], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                    {testimonial.avatar && (
                      <Box
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: tokens.borderRadius.full,
                          overflow: 'hidden',
                          backgroundColor: tokens.colors.neutral[200],
                        }}
                      >
                        {testimonial.avatar}
                      </Box>
                    )}

                    <Box>
                      <Box
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        {testimonial.author}
                      </Box>
                      {(testimonial.role || testimonial.company) && (
                        <Box
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                          }}
                        >
                          {[testimonial.role, testimonial.company].filter(Boolean).join(' at ')}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Stack>
              </div>
            ))}
          </Box>
        </Stack>
      </Box>
    );
  },
});
