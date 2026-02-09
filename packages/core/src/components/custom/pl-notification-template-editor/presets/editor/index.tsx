'use client';

/**
 * PlNotificationTemplateEditor - Editor Preset
 * Design notification templates with variables, conditions, and multi-channel preview
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createSurfaceStyle,
  createEmptyStateStyle,
  createSectionHeaderStyle,
} from '../../../helpers';
import type { PlNotificationTemplateEditorProps } from '../../core';

export const EditorPlNotificationTemplateEditor = createPreset<PlNotificationTemplateEditorProps>({
  name: 'PlNotificationTemplateEditor.Editor',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlNotificationTemplateEditorProps>) => {
    const { Box, Stack, Spinner } = primitives;
    const isModern = tokens.surface.useGlass;
    const { loading, className, style, ...rest } = props;

    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const containerStyle = useMemo(() => ({
      padding: tokens.spacing[6],
      backgroundColor: tokens.colors.neutral[50],
      minHeight: '100%',
      fontFamily: 'inherit',
    }), [tokens]);

    const headerStyle = useMemo(() => ({
      fontSize: tokens.typography.fontSize['2xl'],
      fontWeight: tokens.typography.fontWeight.bold,
      color: tokens.colors.neutral[900],
      margin: 0,
      lineHeight: tokens.typography.lineHeight.tight,
    }), [tokens]);

    const cardStyle = useMemo(() => createCardStyle(tokens, {
      elevation: 'sm',
      glass: isModern,
    }), [tokens, isModern]);

    const items = (rest as any).items ?? (rest as any).methods ?? (rest as any).sessions ?? (rest as any).metrics ?? [];

    if (loading) {
      return (
        <div className={className} style={{ ...containerStyle, display: 'flex', justifyContent: 'center', alignItems: 'center', ...style }}>
          <Spinner size="lg" />
        </div>
      );
    }

    return (
      <div className={className} style={{ ...containerStyle, ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[6] }}>
          <div>
            <h2 style={headerStyle}>Notification Template Editor</h2>
            <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: 0, marginTop: tokens.spacing[1] }}>
              Design notification templates with variables, conditions, and multi-channel preview
            </p>
          </div>
          {(rest as any).onCreate || (rest as any).onAdd || (rest as any).onConnect || (rest as any).onDeploy || (rest as any).onInitiate ? (
            <button
              onClick={(rest as any).onCreate ?? (rest as any).onAdd ?? (rest as any).onConnect ?? (rest as any).onDeploy ?? (rest as any).onInitiate}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                backgroundColor: tokens.colors.primaryScale[600],
                color: tokens.colors.common.white,
                border: 'none',
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                boxShadow: tokens.shadows.sm,
              }}
            >
              + New
            </button>
          ) : null}
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div style={{ ...createEmptyStateStyle(tokens), ...cardStyle, padding: `${tokens.spacing[12]}px ${tokens.spacing[6]}px` }}>
            <div style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[400], marginBottom: tokens.spacing[2] }}>
              No items found
            </div>
            <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
              Get started by creating your first item.
            </div>
          </div>
        ) : (
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' as const }}>
            {items.map((item: any, idx: number) => (
              <div
                key={item.id || idx}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => (rest as any).onItemClick?.(item.id) ?? (rest as any).onToggle?.(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
                  borderBottom: idx < items.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
                  backgroundColor: hoveredId === item.id ? tokens.colors.neutral[50] : tokens.colors.common.white,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.primaryScale[50],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: tokens.colors.primaryScale[600],
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.bold,
                  }}>
                    {(item.name || item.title || 'I').charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                      {item.name || item.title || item.event || 'Unnamed'}
                    </div>
                    <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      {item.description || item.type || item.email || item.address || item.planName || ''}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                  {item.status && (
                    <span style={{
                      ...createBadgeStyle(tokens, item.status === 'active' || item.status === 'connected' || item.status === 'completed' || item.status === 'delivered' || item.status === 'paid' || item.status === 'minted' || item.status === 'confirmed' ? 'success' : item.status === 'pending' || item.status === 'processing' || item.status === 'trialing' || item.status === 'in_transit' || item.status === 'retrying' ? 'warning' : item.status === 'inactive' || item.status === 'failed' || item.status === 'expired' || item.status === 'rejected' || item.status === 'down' || item.status === 'burned' || item.status === 'dropped' || item.status === 'cancelled' || item.status === 'revoked' ? 'error' : 'info'),
                    }}>
                      {item.status}
                    </span>
                  )}
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                    {item.createdAt || item.lastUsed || item.timestamp || item.lastActive || ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
});
