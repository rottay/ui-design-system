'use client';

/**
 * FaqSection - Accordion Preset
 * Single column with expandable FAQ items, optional search, active question has primary left border
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { FaqSectionProps } from '../../core';

export const AccordionFaqSection = createPreset<FaqSectionProps>({
  name: 'FaqSection.Accordion',
  render: ({ primitives, props, tokens }: PresetContext<FaqSectionProps>) => {
    const { Box, Stack, Input } = primitives;
    const { items, title, description, searchable, className, style } = props;
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    const toggleItem = (key: string) => {
      const newOpen = new Set(openItems);
      if (newOpen.has(key)) {
        newOpen.delete(key);
      } else {
        newOpen.add(key);
      }
      setOpenItems(newOpen);
    };

    const filteredItems = searchQuery
      ? items.filter(
          (item) =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : items;

    return (
      <Box
        className={className}
        style={{
          boxShadow: tokens.shadows.sm,
          padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
          ...style,
        }}
      >
        <Stack direction="vertical" spacing="xl" style={{ maxWidth: '800px', margin: '0 auto' }}>
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

          {searchable && (
            <Input
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(value) => setSearchQuery(value as string)}
              size="lg"
            />
          )}

          <Stack direction="vertical" spacing="sm">
            {filteredItems.map((item) => {
              const isOpen = openItems.has(item.key);
              return (
                <Box
                  key={item.key}
                  style={{
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    borderLeft: isOpen
                      ? `4px solid ${tokens.colors.primaryScale[600]}`
                      : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    borderRadius: tokens.borderRadius.md,
                    overflow: 'hidden',
                    backgroundColor: tokens.colors.common.white,
                  }}
                >
                  {/* Question */}
                  <Box
                    onClick={() => toggleItem(item.key)}
                    style={{
                      padding: tokens.spacing[4],
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = tokens.colors.common.white;
                    }}
                  >
                    <Box
                      style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                        flex: 1,
                      }}
                    >
                      {item.question}
                    </Box>

                    <Box
                      style={{
                        fontSize: '20px',
                        color: tokens.colors.neutral[400],
                        transition: `transform ${tokens.motion.hover}`,
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    >
                      ▼
                    </Box>
                  </Box>

                  {/* Answer - slides open */}
                  {isOpen && (
                    <Box
                      style={{
                        padding: `0 ${tokens.spacing[4]}px ${tokens.spacing[4]}px ${tokens.spacing[4]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[600],
                        lineHeight: tokens.typography.lineHeight.relaxed,
                        borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        paddingTop: tokens.spacing[4],
                      }}
                    >
                      {item.answer}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Stack>

          {filteredItems.length === 0 && (
            <Box
              style={{
                textAlign: 'center',
                padding: tokens.spacing[8],
                color: tokens.colors.neutral[400],
              }}
            >
              No FAQs found matching your search.
            </Box>
          )}
        </Stack>
      </Box>
    );
  },
});
