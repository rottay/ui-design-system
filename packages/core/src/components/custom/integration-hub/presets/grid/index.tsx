'use client';

import React, { useState, useMemo } from 'react';
import { createPreset } from '../../../factory';
import type { IntegrationHubProps, Integration } from '../../core';

export const GridPreset = createPreset<IntegrationHubProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text, Button, Input } = primitives;
  const {
    integrations,
    categories = [],
    onInstall,
    onUninstall,
    onSelect,
    searchable = true,
    className,
    style,
  } = props;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredIntegrations = useMemo(() => {
    return integrations.filter((integration: Integration) => {
      const matchesSearch =
        !searchQuery ||
        integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory || integration.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [integrations, searchQuery, selectedCategory]);

  return (
    <Box className={className} style={style}>
      {/* Header */}
      <Box
        style={{
          marginBottom: tokens.spacing[6],
          display: 'flex',
          gap: tokens.spacing[4],
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {searchable && (
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(value: string | number) => setSearchQuery(value as string)}
            style={{ flex: 1, minWidth: '240px' }}
          />
        )}
        {categories.length > 0 && (
          <Box style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' }}>
            <Button
              variant={selectedCategory === null ? 'primary' : 'secondary'}
              onClick={() => setSelectedCategory(null)}
              style={{ fontSize: tokens.typography.fontSize.sm }}
            >
              All
            </Button>
            {categories.map((category: { key: string; label: string }) => (
              <Button
                key={category.key}
                variant={selectedCategory === category.key ? 'primary' : 'secondary'}
                onClick={() => setSelectedCategory(category.key)}
                style={{ fontSize: tokens.typography.fontSize.sm }}
              >
                {category.label}
              </Button>
            ))}
          </Box>
        )}
      </Box>

      {/* Integration Grid */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: tokens.spacing[6],
        }}
      >
        {filteredIntegrations.map((integration: Integration) => (
          <Box
            key={integration.key}
            style={{
              padding: tokens.spacing[6],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              borderRadius: tokens.borderRadius.lg,
              backgroundColor: tokens.colors.common.white,
              cursor: onSelect ? 'pointer' : 'default',
              transition: `all ${tokens.motion.hover}`,
            }}
            onClick={() => onSelect?.(integration.key)}
            onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
              e.currentTarget.style.borderColor = tokens.colors.primaryScale[300];
              e.currentTarget.style.boxShadow = `0 4px 12px ${tokens.colors.neutral[200]}`;
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
              e.currentTarget.style.borderColor = tokens.colors.neutral[200];
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Icon & Header */}
            <Box style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
              {integration.icon && (
                <Box
                  style={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.neutral[100],
                  }}
                >
                  {integration.icon}
                </Box>
              )}
              <Box style={{ flex: 1 }}>
                <Text

                  style={{
                    fontWeight: tokens.typography.fontWeight.semibold,
                    marginBottom: tokens.spacing[1],
                  }}
                >
                  {integration.name}
                  {integration.popular && (
                    <span
                      style={{
                        marginLeft: tokens.spacing[2],
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.warningScale[700],
                        fontWeight: tokens.typography.fontWeight.medium,
                      }}
                    >
                      ★ Popular
                    </span>
                  )}
                </Text>
                {integration.category && (
                  <Text
                                       style={{
                      color: tokens.colors.neutral[600],
                      fontSize: tokens.typography.fontSize.xs,
                    }}
                  >
                    {integration.category}
                  </Text>
                )}
              </Box>
            </Box>

            {/* Description */}
            {integration.description && (
              <Text
                               style={{
                  color: tokens.colors.neutral[700],
                  marginBottom: tokens.spacing[4],
                  lineHeight: tokens.typography.lineHeight.relaxed,
                }}
              >
                {integration.description}
              </Text>
            )}

            {/* Footer */}
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {integration.author && (
                <Text style={{ color: tokens.colors.neutral[600] }}>
                  by {integration.author}
                </Text>
              )}
              {integration.installed ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    onUninstall?.(integration.key);
                  }}
                  style={{ fontSize: tokens.typography.fontSize.sm }}
                >
                  Uninstall
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    onInstall?.(integration.key);
                  }}
                  style={{ fontSize: tokens.typography.fontSize.sm }}
                >
                  Install
                </Button>
              )}
            </Box>
          </Box>
        ))}
      </Box>

      {filteredIntegrations.length === 0 && (
        <Box
          style={{
            textAlign: 'center',
            padding: tokens.spacing[8],
            color: tokens.colors.neutral[600],
          }}
        >
          <Text>No integrations found</Text>
        </Box>
      )}
    </Box>
  );
});

GridPreset.displayName = 'IntegrationHubGridPreset';
