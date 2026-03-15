'use client';

/**
 * FaqSection - TwoColumn Preset
 * Questions left, answers right for selected question, with optional category tabs
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
} from '../../../helpers';
import type { FaqSectionProps } from '../../core';

export const TwoColumnFaqSection = createPreset<FaqSectionProps>({
  name: 'FaqSection.TwoColumn',
  render: ({ primitives, props, tokens, engine }: PresetContext<FaqSectionProps>) => {
    const { Box, Stack } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const { items, categories, title, description, className, style } = props;
    const [selectedKey, setSelectedKey] = useState<string>(items[0]?.key || '');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const filteredItems = activeCategory
      ? items.filter((item) => item.category === activeCategory)
      : items;

    const selectedItem = filteredItems.find((item) => item.key === selectedKey) || filteredItems[0];

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

          {/* Category tabs */}
          {categories && categories.length > 0 && (
            <Box style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap', justifyContent: 'center' }}>
              <Box
                onClick={() => setActiveCategory(null)}
                style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.md,
                  cursor: 'pointer',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  backgroundColor: activeCategory === null ? tokens.colors.primaryScale[600] : tokens.colors.neutral[100],
                  color: activeCategory === null ? tokens.colors.common.white : tokens.colors.neutral[700],
                }}
              >
                All
              </Box>
              {categories.map((cat) => (
                <Box
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    borderRadius: tokens.borderRadius.md,
                    cursor: 'pointer',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    backgroundColor: activeCategory === cat.key ? tokens.colors.primaryScale[600] : tokens.colors.neutral[100],
                    color: activeCategory === cat.key ? tokens.colors.common.white : tokens.colors.neutral[700],
                  }}
                >
                  {cat.label}
                </Box>
              ))}
            </Box>
          )}

          {/* Two columns */}
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.5fr',
              gap: tokens.spacing[6],
              alignItems: 'start',
            }}
          >
            {/* Left: Questions list */}
            <Box
              style={{
                ...createCardStyle(tokens, {
                  glass: isGlass,
                  elevation: 'sm',
                  padding: tokens.spacing[4],
                }),
                maxHeight: '600px',
                overflowY: 'auto',
              }}
            >
              <Stack direction="vertical" spacing="xs">
                {filteredItems.map((item) => {
                  const isSelected = item.key === selectedKey;
                  return (
                    <Box
                      key={item.key}
                      onClick={() => setSelectedKey(item.key)}
                      style={{
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.md,
                        cursor: 'pointer',
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                        color: isSelected ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                        borderLeft: isSelected ? `3px solid ${tokens.colors.primaryScale[600]}` : '3px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
                          e.currentTarget.style.transform = tokens.motion.transform;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'none';
                        }
                      }}
                    >
                      {item.question}
                    </Box>
                  );
                })}
              </Stack>
            </Box>

            {/* Right: Answer */}
            {selectedItem && (
              <div
                style={{
                  ...createCardStyle(tokens, {
                    glass: isGlass,
                    elevation: 'sm',
                    padding: tokens.spacing[6],
                  }),
                }}
              >
                <Stack direction="vertical" spacing="md">
                  <Box
                    style={{
                      fontSize: tokens.typography.fontSize.xl,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    {selectedItem.question}
                  </Box>

                  <Box
                    style={{
                      fontSize: tokens.typography.fontSize.md,
                      color: tokens.colors.neutral[600],
                      lineHeight: tokens.typography.lineHeight.relaxed,
                    }}
                  >
                    {selectedItem.answer}
                  </Box>
                </Stack>
              </div>
            )}
          </Box>
        </Stack>
      </Box>
    );
  },
});
