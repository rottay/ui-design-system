import { useMemo } from 'react';
import { createPreset } from '../../../factory';
import { createCardStyle } from '../../../helpers';
import type { ComparisonTableProps } from '../../core';

export const CardsPreset = createPreset<ComparisonTableProps>((context) => {
  const { primitives, props, tokens, engine } = context;
  const isGlass = tokens.surface.useGlass && !!tokens.glass;
  const { Box, Text, Button } = primitives;
  const { plans, features, title, className, style } = props;

  const renderValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return (
        <Text
          style={{
            fontSize: tokens.typography.fontSize.lg,
            color: value ? tokens.colors.successScale[600] : tokens.colors.neutral[300],
          }}
        >
          {value ? '✓' : '×'}
        </Text>
      );
    }
    return (
      <Text
        style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[700],
        }}
      >
        {value}
      </Text>
    );
  };

  return (
    <Box
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[8],
        ...style,
      }}
    >
      {title && (
        <Text
          style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            textAlign: 'center',
          }}
        >
          {title}
        </Text>
      )}

      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: tokens.spacing[6],
        }}
      >
        {plans.map((plan) => {
          const cardStyle = useMemo(() => createCardStyle(tokens, {
            glass: isGlass,
            elevation: plan.popular ? 'md' : 'sm',
          }), [tokens]);

          return (
            <Box
              key={plan.key}
              style={{
                ...cardStyle,
                display: 'flex',
                flexDirection: 'column',
                gap: tokens.spacing[6],
                padding: tokens.spacing[8],
                position: 'relative',
                border: plan.popular
                  ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[500]}`
                  : cardStyle.border,
              }}
            >
              {plan.popular && (
                <Box
                  style={{
                    position: 'absolute',
                    top: tokens.spacing[4],
                    right: tokens.spacing[4],
                    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                    backgroundColor: tokens.colors.primaryScale[600],
                    color: tokens.colors.common.white,
                    borderRadius: tokens.borderRadius.full,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                  }}
                >
                  Popular
                </Box>
              )}

              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: tokens.spacing[2],
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xl,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                  }}
                >
                  {plan.name}
                </Text>
                {plan.description && (
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[600],
                    }}
                  >
                    {plan.description}
                  </Text>
                )}
                {plan.price && (
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: tokens.spacing[1],
                      marginTop: tokens.spacing[2],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize['3xl'],
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {plan.price}
                    </Text>
                    {plan.period && (
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[600],
                        }}
                      >
                        {plan.period}
                      </Text>
                    )}
                  </Box>
                )}
              </Box>

              {plan.cta && (
                <Button
                  onClick={plan.cta.onClick}
                  style={{
                    width: '100%',
                  }}
                >
                  {plan.cta.label}
                </Button>
              )}

              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: tokens.spacing[4],
                  paddingTop: tokens.spacing[6],
                  borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}
              >
                {features.map((feature) => (
                  <Box
                    key={feature.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: tokens.spacing[4],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                        flex: 1,
                      }}
                    >
                      {feature.name}
                    </Text>
                    {renderValue(feature.values[plan.key])}
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
});
