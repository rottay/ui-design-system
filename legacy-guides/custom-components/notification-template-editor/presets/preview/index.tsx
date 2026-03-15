'use client';

/**
 * NotificationTemplateEditor - Preview Preset
 * Rendered template preview showing how notifications will appear
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { NotificationTemplateEditorProps } from '../../core';
import {
  getChannelColors,
  getChannelIcon,
  getChannelLabel,
  formatSentCount,
} from '../../core';

export const PreviewNotificationTemplateEditor = createPreset<NotificationTemplateEditorProps>({
  name: 'NotificationTemplateEditor.Preview',
  render: ({ primitives, props, tokens, engine }: PresetContext<NotificationTemplateEditorProps>) => {
    const { Box, Stack, Text } = primitives;
    const channelColors = getChannelColors(tokens);

    const {
      templates,
      onEditTemplate,
      onDuplicate,
      onPreview,
      selectedTemplateId,
      title = 'Template Preview',
      subtitle,
      loading,
      className,
      style,
    } = props;

    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(
      selectedTemplateId ?? (templates.length > 0 ? templates[0].id : null)
    );
    const activeTemplate = templates.find((t) => t.id === activeTemplateId);

    // Replace template variables with placeholder values for preview
    const renderPreviewBody = (body: string, variables: typeof activeTemplate extends undefined ? never : NonNullable<typeof activeTemplate>['variables']): string => {
      let rendered = body;
      variables.forEach((v) => {
        const placeholder = v.defaultValue ?? `[${v.name}]`;
        rendered = rendered.replace(new RegExp(`\\{\\{${v.name}\\}\\}`, 'g'), placeholder);
      });
      return rendered;
    };

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
        </Box>

        {loading ? (
          <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
            Loading...
          </Box>
        ) : (
          <Box style={{ display: 'flex', gap: tokens.spacing[4] }}>
            {/* Template selector tabs */}
            <Box style={{
              display: 'flex',
              flexDirection: 'column',
              gap: tokens.spacing[1],
              minWidth: '180px',
              flexShrink: 0,
            }}>
              {templates.map((template) => {
                const isActive = activeTemplateId === template.id;
                const cColors = channelColors[template.channel];

                return (
                  <div
                    key={template.id}
                    onClick={() => setActiveTemplateId(template.id)}
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      cursor: 'pointer',
                      backgroundColor: isActive ? tokens.colors.primaryScale[50] : 'transparent',
                      borderLeft: `3px solid ${isActive ? tokens.colors.primaryScale[500] : 'transparent'}`,
                      transition: `all ${tokens.motion.hover}`,
                      opacity: template.enabled ? 1 : 0.5,
                    }}
                  >
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                      color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                    }}>
                      {getChannelIcon(template.channel)} {template.name}
                    </Text>
                  </div>
                );
              })}
            </Box>

            {/* Preview area */}
            {activeTemplate ? (
              <Box style={{ flex: 1 }}>
                {/* Channel indicator */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                  <span style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: channelColors[activeTemplate.channel].color,
                    backgroundColor: channelColors[activeTemplate.channel].bgColor,
                    padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${channelColors[activeTemplate.channel].border}`,
                  }}>
                    {getChannelIcon(activeTemplate.channel)} {getChannelLabel(activeTemplate.channel)}
                  </span>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                    Sent {formatSentCount(activeTemplate.sentCount)} times
                  </Text>
                  {!activeTemplate.enabled && (
                    <span style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.warningScale[700],
                      backgroundColor: tokens.colors.warningScale[50],
                      padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.full,
                    }}>
                      Disabled
                    </span>
                  )}
                </Box>

                {/* Preview card */}
                <Box style={{
                  borderRadius: tokens.borderRadius.lg,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  overflow: 'hidden',
                  boxShadow: tokens.surface.useGlass ? tokens.shadows.md : 'none',
                }}>
                  {/* Subject header (for email) */}
                  {activeTemplate.subject && (
                    <Box style={{
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      backgroundColor: tokens.colors.neutral[50],
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    }}>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        marginBottom: tokens.spacing[1],
                      }}>
                        Subject
                      </Text>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                      }}>
                        {activeTemplate.subject}
                      </Text>
                    </Box>
                  )}

                  {/* Body preview */}
                  <Box style={{
                    padding: tokens.spacing[4],
                    backgroundColor: tokens.colors.common.white,
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[700],
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                    minHeight: '150px',
                  }}>
                    {renderPreviewBody(activeTemplate.body, activeTemplate.variables)}
                  </Box>
                </Box>

                {/* Variables used */}
                {activeTemplate.variables.length > 0 && (
                  <Box style={{ marginTop: tokens.spacing[4] }}>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[500],
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: tokens.spacing[2],
                    }}>
                      Template Variables
                    </Text>
                    <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[2] }}>
                      {activeTemplate.variables.map((v) => (
                        <span
                          key={v.name}
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontFamily: 'monospace',
                            color: tokens.colors.primaryScale[700],
                            backgroundColor: tokens.colors.primaryScale[50],
                            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.sm,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                          }}
                        >
                          {`{{${v.name}}}`}
                          {v.required && <span style={{ color: tokens.colors.errorScale[500], marginLeft: tokens.spacing[1] }}>*</span>}
                        </span>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Actions */}
                <Box style={{ display: 'flex', gap: tokens.spacing[2], marginTop: tokens.spacing[4] }}>
                  {onEditTemplate && (
                    <button
                      onClick={() => onEditTemplate(activeTemplate.id)}
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
                      }}
                    >
                      Edit Template
                    </button>
                  )}
                  {onDuplicate && (
                    <button
                      onClick={() => onDuplicate(activeTemplate.id)}
                      style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                        backgroundColor: tokens.colors.common.white,
                        color: tokens.colors.neutral[700],
                        fontSize: tokens.typography.fontSize.sm,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      Duplicate
                    </button>
                  )}
                </Box>
              </Box>
            ) : (
              <Box style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tokens.colors.neutral[400],
                fontSize: tokens.typography.fontSize.sm,
              }}>
                Select a template to preview
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  },
});
