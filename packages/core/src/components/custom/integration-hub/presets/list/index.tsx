'use client';

import React, { useState, useMemo } from 'react';
import { createPreset } from '../../../factory';
import type { IntegrationHubProps, Integration } from '../../core';

export const ListPreset = createPreset<IntegrationHubProps>((context) => {
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
          boxShadow: tokens.shadows.md,
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

      {/* List */}
      <Box
        style={{
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          borderRadius: tokens.borderRadius.lg,
          backgroundColor: tokens.colors.common.white,
          overflow: 'hidden',
        }}
      >
        {filteredIntegrations.map((integration: Integration, index: number) => (
          <Box
            key={integration.key}
            style={{
              padding: tokens.spacing[4],
              borderBottom:
                index < filteredIntegrations.length - 1
                  ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`
                  : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[4],
              cursor: onSelect ? 'pointer' : 'default',
              transition: `background-color ${tokens.motion.hover}`,
            }}
            onClick={() => onSelect?.(integration.key)}
            onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
              e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
              e.currentTarget.style.backgroundColor = tokens.colors.common.white;
            }}
          >
            {integration.icon && (
              <Box
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.neutral[100],
                  flexShrink: 0,
                }}
              >
                {integration.icon}
              </Box>
            )}

            <Box style={{ flex: 1, minWidth: 0 }}>
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
                    }}
                  >
                    ★
                  </span>
                )}
              </Text>
              {integration.description && (
                <Text
                                   style={{
                    color: tokens.colors.neutral[700],
                    fontSize: tokens.typography.fontSize.sm,
                  }}
                >
                  {integration.description}
                </Text>
              )}
            </Box>

            {integration.category && (
              <Text
                               style={{
                  padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                  backgroundColor: tokens.colors.neutral[100],
                  borderRadius: tokens.borderRadius.sm,
                  fontSize: tokens.typography.fontSize.xs,
                  flexShrink: 0,
                }}
              >
                {integration.category}
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
                style={{ fontSize: tokens.typography.fontSize.sm, flexShrink: 0 }}
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
                style={{ fontSize: tokens.typography.fontSize.sm, flexShrink: 0 }}
              >
                Install
              </Button>
            )}
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

ListPreset.displayName = 'IntegrationHubListPreset';
