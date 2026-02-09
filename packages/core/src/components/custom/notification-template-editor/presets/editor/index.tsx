'use client';

/**
 * NotificationTemplateEditor - Editor Preset
 * Form-style editor with variable insertion and template editing
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { NotificationTemplateEditorProps, NotificationTemplate } from '../../core';
import {
  getChannelColors,
  getChannelIcon,
  getChannelLabel,
  formatRelativeDate,
} from '../../core';

export const EditorNotificationTemplateEditor = createPreset<NotificationTemplateEditorProps>({
  name: 'NotificationTemplateEditor.Editor',
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

    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(
      selectedTemplateId ?? (templates.length > 0 ? templates[0].id : null)
    );
    const activeTemplate = templates.find((t) => t.id === activeTemplateId);

    return (
      <Box
        className={className}
        style={{
          backgroundColor: tokens.colors.common.white,
          borderRadius: tokens.borderRadius.lg,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          boxShadow: tokens.surface.useGlass ? tokens.shadows.sm : 'none',
          display: 'flex',
          height: '100%',
          minHeight: '500px',
          overflow: 'hidden',
          ...style,
        }}
      >
        {/* Template list sidebar */}
        <Box style={{
          width: '260px',
          borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}>
          {/* Sidebar header */}
          <Box style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
              {title}
            </Text>
            {subtitle && (
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
                {subtitle}
              </Text>
            )}
          </Box>

          {/* Template list */}
          <Box style={{ flex: 1, overflowY: 'auto', padding: tokens.spacing[2] }}>
            {loading ? (
              <Box style={{ textAlign: 'center', padding: tokens.spacing[4], color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                Loading...
              </Box>
            ) : (
              <Stack direction="vertical" spacing="xs">
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
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isActive ? tokens.colors.primaryScale[200] : 'transparent'}`,
                        transition: `all ${tokens.motion.hover}`,
                        opacity: template.enabled ? 1 : 0.5,
                      }}
                    >
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <span style={{ fontSize: tokens.typography.fontSize.md }}>{getChannelIcon(template.channel)}</span>
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                            color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[700],
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {template.name}
                          </Text>
                          <span style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: cColors.color,
                            backgroundColor: cColors.bgColor,
                            padding: `0 ${tokens.spacing[1]}px`,
                            borderRadius: tokens.borderRadius.sm,
                          }}>
                            {getChannelLabel(template.channel)}
                          </span>
                        </Box>
                      </Box>
                    </div>
                  );
                })}
              </Stack>
            )}
          </Box>

          {/* Add template button */}
          {onCreateTemplate && (
            <Box style={{ padding: tokens.spacing[2], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
              <button
                onClick={onCreateTemplate}
                style={{
                  width: '100%',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} dashed ${tokens.colors.neutral[300]}`,
                  backgroundColor: 'transparent',
                  color: tokens.colors.neutral[500],
                  fontSize: tokens.typography.fontSize.sm,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                + New Template
              </button>
            </Box>
          )}
        </Box>

        {/* Editor panel */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeTemplate ? (
            <>
              {/* Editor header */}
              <Box style={{
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                    {activeTemplate.name}
                  </Text>
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
                </Box>
                <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
                  {onToggle && (
                    <div
                      onClick={() => onToggle(activeTemplate.id)}
                      style={{
                        width: '36px',
                        height: '20px',
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: activeTemplate.enabled ? tokens.colors.successScale[500] : tokens.colors.neutral[300],
                        position: 'relative',
                        cursor: 'pointer',
                        transition: `background-color ${tokens.motion.hover}`,
                        alignSelf: 'center',
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '2px',
                        left: activeTemplate.enabled ? '18px' : '2px',
                        width: '16px',
                        height: '16px',
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.common.white,
                        transition: `left ${tokens.motion.hover}`,
                        boxShadow: tokens.shadows.sm,
                      }} />
                    </div>
                  )}
                  {onPreview && (
                    <button
                      onClick={() => onPreview(activeTemplate.id)}
                      style={{
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                        backgroundColor: tokens.colors.common.white,
                        color: tokens.colors.neutral[700],
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
                      onClick={() => onDuplicate(activeTemplate.id)}
                      style={{
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                        backgroundColor: tokens.colors.common.white,
                        color: tokens.colors.neutral[700],
                        fontSize: tokens.typography.fontSize.xs,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      Duplicate
                    </button>
                  )}
                  {onEditTemplate && (
                    <button
                      onClick={() => onEditTemplate(activeTemplate.id)}
                      style={{
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: 'none',
                        backgroundColor: tokens.colors.primaryScale[500],
                        color: tokens.colors.common.white,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      Edit
                    </button>
                  )}
                </Box>
              </Box>

              {/* Editor content */}
              <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[4] }}>
                <Stack direction="vertical" spacing="lg">
                  {/* Subject (if applicable) */}
                  {activeTemplate.subject !== undefined && (
                    <Box>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[500],
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: tokens.spacing[2],
                      }}>
                        Subject
                      </Text>
                      <Box style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        backgroundColor: tokens.colors.neutral[50],
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[800],
                      }}>
                        {activeTemplate.subject}
                      </Box>
                    </Box>
                  )}

                  {/* Body */}
                  <Box>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[500],
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: tokens.spacing[2],
                    }}>
                      Body
                    </Text>
                    <Box style={{
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: tokens.colors.neutral[50],
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[800],
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      minHeight: '120px',
                    }}>
                      {activeTemplate.body}
                    </Box>
                  </Box>

                  {/* Variables */}
                  {activeTemplate.variables.length > 0 && (
                    <Box>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[500],
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: tokens.spacing[2],
                      }}>
                        Variables ({activeTemplate.variables.length})
                      </Text>
                      <Box style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: tokens.spacing[2],
                      }}>
                        {activeTemplate.variables.map((variable) => (
                          <Box
                            key={variable.name}
                            style={{
                              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                              borderRadius: tokens.borderRadius.md,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                              backgroundColor: tokens.colors.common.white,
                            }}
                          >
                            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                              <span style={{
                                fontFamily: 'monospace',
                                fontSize: tokens.typography.fontSize.sm,
                                fontWeight: tokens.typography.fontWeight.semibold,
                                color: tokens.colors.primaryScale[600],
                              }}>
                                {`{{${variable.name}}}`}
                              </span>
                              {variable.required && (
                                <span style={{
                                  fontSize: tokens.typography.fontSize.xs,
                                  color: tokens.colors.errorScale[500],
                                  fontWeight: tokens.typography.fontWeight.bold,
                                }}>
                                  *
                                </span>
                              )}
                            </Box>
                            <Box style={{ display: 'flex', gap: tokens.spacing[2], marginTop: tokens.spacing[1] }}>
                              <span style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.neutral[500],
                                backgroundColor: tokens.colors.neutral[100],
                                padding: `0 ${tokens.spacing[1]}px`,
                                borderRadius: tokens.borderRadius.sm,
                              }}>
                                {variable.type}
                              </span>
                              {variable.defaultValue && (
                                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                                  default: {variable.defaultValue}
                                </span>
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Metadata */}
                  <Box style={{
                    display: 'flex',
                    gap: tokens.spacing[4],
                    paddingTop: tokens.spacing[3],
                    borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                      Created: {activeTemplate.createdAt.toLocaleDateString()}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                      Updated: {activeTemplate.updatedAt.toLocaleDateString()}
                    </Text>
                    {activeTemplate.lastSentAt && (
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        Last sent: {formatRelativeDate(activeTemplate.lastSentAt)}
                      </Text>
                    )}
                  </Box>
                </Stack>
              </Box>
            </>
          ) : (
            <Box style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: tokens.colors.neutral[400],
              fontSize: tokens.typography.fontSize.sm,
            }}>
              Select a template to edit
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
