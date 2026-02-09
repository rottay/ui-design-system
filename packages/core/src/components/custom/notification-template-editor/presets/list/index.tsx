'use client';

/**
 * NotificationTemplateEditor - List Preset
 * Template cards with stats overview
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { NotificationTemplateEditorProps } from '../../core';
import {
  getChannelColors,
  getChannelIcon,
  getChannelLabel,
  formatSentCount,
  formatRelativeDate,
} from '../../core';

export const ListNotificationTemplateEditor = createPreset<NotificationTemplateEditorProps>({
  name: 'NotificationTemplateEditor.List',
  render: ({ primitives, props, tokens, engine }: PresetContext<NotificationTemplateEditorProps>) => {
    const { Box, Stack, Text } = primitives;
    const channelColors = getChannelColors(tokens);

    const {
      templates,
      onCreateTemplate,
      onEditTemplate,
      onDeleteTemplate,
      onDuplicate,
      onToggle,
      onPreview,
      selectedTemplateId,
      title = 'Notification Templates',
      subtitle,
      loading,
      className,
      style,
    } = props;

    const [hoveredId, setHoveredId] = useState<string | null>(null);

    return (
      <Box
        className={className}
        style={{
          padding: tokens.spacing[5],
          backgroundColor: tokens.colors.common.white,
          borderRadius: tokens.borderRadius.lg,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          boxShadow: tokens.surface.useGlass ? tokens.shadows.sm : 'none',
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>
                {subtitle}
              </p>
            )}
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {templates.length} template{templates.length !== 1 ? 's' : ''}
            </Text>
            {onCreateTemplate && (
              <button
                onClick={onCreateTemplate}
                style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: 'none',
                  backgroundColor: tokens.colors.primaryScale[500],
                  color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                + New Template
              </button>
            )}
          </Box>
        </Box>

        {loading ? (
          <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
            Loading...
          </Box>
        ) : templates.length === 0 ? (
          <Box style={{
            textAlign: 'center',
            padding: tokens.spacing[8],
            border: `2px dashed ${tokens.colors.neutral[200]}`,
            borderRadius: tokens.borderRadius.lg,
            color: tokens.colors.neutral[400],
          }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm }}>No templates yet. Create your first notification template.</Text>
          </Box>
        ) : (
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: tokens.spacing[4],
          }}>
            {templates.map((template) => {
              const cColors = channelColors[template.channel];
              const isHovered = hoveredId === template.id;
              const isSelected = selectedTemplateId === template.id;

              return (
                <div
                  key={template.id}
                  onMouseEnter={() => setHoveredId(template.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    borderRadius: tokens.borderRadius.lg,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isSelected ? tokens.colors.primaryScale[400] : isHovered ? tokens.colors.neutral[300] : tokens.colors.neutral[200]}`,
                    backgroundColor: tokens.colors.common.white,
                    overflow: 'hidden',
                    transition: `all ${tokens.motion.hover}`,
                    opacity: template.enabled ? 1 : 0.7,
                    boxShadow: isHovered && tokens.surface.useGlass ? tokens.shadows.md : 'none',
                  }}
                >
                  {/* Card header */}
                  <Box style={{
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: tokens.typography.fontSize.lg }}>{getChannelIcon(template.channel)}</span>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[800],
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {template.name}
                        </Text>
                      </Box>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexShrink: 0 }}>
                      <span style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: cColors.color,
                        backgroundColor: cColors.bgColor,
                        padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.full,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${cColors.border}`,
                      }}>
                        {getChannelLabel(template.channel)}
                      </span>
                      {!template.enabled && (
                        <span style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                          backgroundColor: tokens.colors.neutral[100],
                          padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.full,
                        }}>
                          Off
                        </span>
                      )}
                    </Box>
                  </Box>

                  {/* Card body - template preview */}
                  <Box style={{
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    minHeight: '60px',
                  }}>
                    {template.subject && (
                      <Text style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[700],
                        marginBottom: tokens.spacing[1],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {template.subject}
                      </Text>
                    )}
                    <Text style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      lineHeight: 1.5,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {template.body}
                    </Text>
                  </Box>

                  {/* Stats row */}
                  <Box style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    backgroundColor: tokens.colors.neutral[50],
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[3],
                    borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                  }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      Sent: {formatSentCount(template.sentCount)}
                    </Text>
                    {template.variables.length > 0 && (
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        {template.variables.length} var{template.variables.length !== 1 ? 's' : ''}
                      </Text>
                    )}
                    {template.lastSentAt && (
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        Last: {formatRelativeDate(template.lastSentAt)}
                      </Text>
                    )}
                    <Box style={{ flex: 1 }} />
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                      {template.updatedAt.toLocaleDateString()}
                    </Text>
                  </Box>

                  {/* Actions */}
                  <Box style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                    display: 'flex',
                    gap: tokens.spacing[2],
                  }}>
                    {onEditTemplate && (
                      <button
                        onClick={() => onEditTemplate(template.id)}
                        style={{
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.sm,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                          backgroundColor: tokens.colors.common.white,
                          color: tokens.colors.neutral[600],
                          fontSize: tokens.typography.fontSize.xs,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        Edit
                      </button>
                    )}
                    {onPreview && (
                      <button
                        onClick={() => onPreview(template.id)}
                        style={{
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.sm,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                          backgroundColor: tokens.colors.common.white,
                          color: tokens.colors.neutral[600],
                          fontSize: tokens.typography.fontSize.xs,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        Preview
                      </button>
                    )}
                    {onDuplicate && (
                      <button
                        onClick={() => onDuplicate(template.id)}
                        style={{
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.sm,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                          backgroundColor: tokens.colors.common.white,
                          color: tokens.colors.neutral[600],
                          fontSize: tokens.typography.fontSize.xs,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        Duplicate
                      </button>
                    )}
                    <Box style={{ flex: 1 }} />
                    {onToggle && (
                      <div
                        onClick={() => onToggle(template.id)}
                        style={{
                          width: '32px',
                          height: '18px',
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: template.enabled ? tokens.colors.successScale[500] : tokens.colors.neutral[300],
                          position: 'relative',
                          cursor: 'pointer',
                          transition: `background-color ${tokens.motion.hover}`,
                          alignSelf: 'center',
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '2px',
                          left: template.enabled ? '16px' : '2px',
                          width: '14px',
                          height: '14px',
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.common.white,
                          transition: `left ${tokens.motion.hover}`,
                          boxShadow: tokens.shadows.sm,
                        }} />
                      </div>
                    )}
                    {onDeleteTemplate && (
                      <button
                        onClick={() => onDeleteTemplate(template.id)}
                        style={{
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.sm,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                          backgroundColor: 'transparent',
                          color: tokens.colors.errorScale[500],
                          fontSize: tokens.typography.fontSize.xs,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {'\u00D7'}
                      </button>
                    )}
                  </Box>
                </div>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
