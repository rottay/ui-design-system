/**
 * TestimonialSection - Cards Preset
 * Grid of testimonial cards with quote marks, star rating, author info
 */

import { createPreset, PresetContext } from '../../../factory';
import { createCardStyle } from '../../../helpers';
import type { TestimonialSectionProps } from '../../core';

export const CardsTestimonialSection = createPreset<TestimonialSectionProps>({
  name: 'TestimonialSection.Cards',
  render: ({ primitives, props, tokens, engine }: PresetContext<TestimonialSectionProps>) => {
    const { Box, Stack } = primitives;
    const isGlass = engine === 'modern' && !!tokens.glass;
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
                fontSize: tokens.typography.fontSize.md,
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
          backgroundColor: tokens.colors.neutral[50],
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

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: tokens.spacing[6],
            }}
          >
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                style={{
                  ...createCardStyle(tokens, {
                    glass: isGlass,
                    elevation: 'sm',
                    padding: tokens.spacing[6],
                  }),
                }}
              >
                <Stack direction="vertical" spacing="md">
                  {/* Quote mark */}
                  <Box
                    style={{
                      fontSize: '48px',
                      color: tokens.colors.primaryScale[200],
                      lineHeight: 1,
                      height: '36px',
                    }}
                  >
                    "
                  </Box>

                  {/* Quote text */}
                  <Box
                    style={{
                      fontSize: tokens.typography.fontSize.md,
                      color: tokens.colors.neutral[700],
                      lineHeight: tokens.typography.lineHeight.relaxed,
                      fontStyle: 'italic',
                    }}
                  >
                    {testimonial.quote}
                  </Box>

                  {/* Rating */}
                  {testimonial.rating && (
                    <Box>{renderStars(testimonial.rating)}</Box>
                  )}

                  {/* Author info */}
                  <Box style={{ display: 'flex', gap: tokens.spacing[3], alignItems: 'center', marginTop: tokens.spacing[2] }}>
                    {testimonial.avatar && (
                      <Box
                        style={{
                          width: '48px',
                          height: '48px',
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
                          fontSize: tokens.typography.fontSize.sm,
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
