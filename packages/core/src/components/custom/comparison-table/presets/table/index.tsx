'use client';

import { createPreset } from '../../../factory';
import type { ComparisonTableProps } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createSectionHeaderStyle,
} from '../../../helpers';

export const TablePreset = createPreset<ComparisonTableProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text, Button } = primitives;
  const { plans, features, title, className, style } = props;

  const groupedFeatures: Record<string, typeof features> = {};
  features.forEach((feature) => {
    const category = feature.category || 'Features';
    if (!groupedFeatures[category]) {
      groupedFeatures[category] = [];
    }
    groupedFeatures[category].push(feature);
  });

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
        boxShadow: tokens.shadows.sm,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[6],
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
          overflowX: 'auto',
        }}
      >
        <Box
          style={{
            display: 'table',
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '800px',
          }}
        >
          {/* Header */}
          <Box
            style={{
              display: 'table-header-group',
              position: 'sticky',
              top: 0,
              backgroundColor: tokens.colors.common.white,
              zIndex: 10,
            }}
          >
            <Box
              style={{
                display: 'table-row',
              }}
            >
              <Box
                style={{
                  display: 'table-cell',
                  padding: tokens.spacing[6],
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  verticalAlign: 'bottom',
                  width: '30%',
                }}
              />
              {plans.map((plan) => (
                <Box
                  key={plan.key}
                  style={{
                    display: 'table-cell',
                    padding: tokens.spacing[6],
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    backgroundColor: plan.popular
                      ? tokens.colors.primaryScale[50]
                      : tokens.colors.common.white,
                    verticalAlign: 'bottom',
                    position: 'relative',
                  }}
                >
                  {plan.popular && (
                    <Box
                      style={{
                        position: 'absolute',
                        top: tokens.spacing[2],
                        right: tokens.spacing[2],
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
                        fontSize: tokens.typography.fontSize.lg,
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
                        }}
                      >
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize['2xl'],
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
                    {plan.cta && (
                      <Button
                        onClick={plan.cta.onClick}
                        style={{
                          marginTop: tokens.spacing[2],
                        }}
                      >
                        {plan.cta.label}
                      </Button>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Features */}
          <Box
            style={{
              display: 'table-row-group',
            }}
          >
            {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
              <Box key={category}>
                <Box
                  style={{
                    display: 'table-row',
                  }}
                >
                  <Box
                    style={{
                      display: 'table-cell',
                      padding: tokens.spacing[4],
                      backgroundColor: tokens.colors.neutral[50],
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {category}
                    </Text>
                  </Box>
                </Box>
                {categoryFeatures.map((feature) => (
                  <Box
                    key={feature.key}
                    style={{
                      display: 'table-row',
                    }}
                  >
                    <Box
                      style={{
                        display: 'table-cell',
                        padding: tokens.spacing[4],
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        verticalAlign: 'middle',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        {feature.name}
                      </Text>
                    </Box>
                    {plans.map((plan) => (
                      <Box
                        key={plan.key}
                        style={{
                          display: 'table-cell',
                          padding: tokens.spacing[4],
                          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                          backgroundColor: plan.popular
                            ? tokens.colors.primaryScale[50]
                            : tokens.colors.common.white,
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        {renderValue(feature.values[plan.key])}
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
});
