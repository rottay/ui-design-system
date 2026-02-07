'use client';

/**
 * EmailSequence - Builder Preset
 * Full editor with contact sidebar + step chain builder
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import { createSurfaceStyle } from '../../../helpers';
import type { EmailSequenceProps } from '../../core';
import {
  getSequenceStatusColors,
  getStepStatusColors,
  getContactSendStatusColors,
  getDelayConnectorStyles,
  getContactInitials,
  getToolbarActionLabel,
  getToolbarActionTitle,
  formatDelayDisplay,
} from '../../core';

export const BuilderEmailSequence = createPreset<EmailSequenceProps>({
  name: 'EmailSequence.Builder',
  render: ({ primitives, props, tokens, engine }: PresetContext<EmailSequenceProps>) => {
    const { Box, Stack } = primitives;
    const sequenceStatusColors = getSequenceStatusColors(tokens);
    const stepStatusColors = getStepStatusColors(tokens);
    const contactStatusColors = getContactSendStatusColors(tokens);
    const delayStyles = getDelayConnectorStyles(tokens);

    const {
      title = 'Email Sequence',
      status = 'draft',
      isSaved = true,
      steps = [],
      contacts = [],
      activeStepId: controlledActiveStepId,
      onActiveStepChange,
      selectedContactId: controlledSelectedContactId,
      onSelectedContactChange,
      searchQuery: controlledSearchQuery,
      onSearchQueryChange,
      toolbarActions = [],
      onToolbarAction,
      onStepChange,
      onStepAdd,
      onStepRemove,
      onSend,
      onEditDraft,
      loading,
      className,
      style,
    } = props;

    const [internalActiveStepId, setInternalActiveStepId] = useState<string | undefined>(
      controlledActiveStepId ?? steps[0]?.id,
    );
    const [internalSelectedContactId, setInternalSelectedContactId] = useState<string | undefined>(
      controlledSelectedContactId,
    );
    const [internalSearchQuery, setInternalSearchQuery] = useState('');

    const activeStepId = controlledActiveStepId ?? internalActiveStepId;
    const selectedContactId = controlledSelectedContactId ?? internalSelectedContactId;
    const searchQuery = controlledSearchQuery ?? internalSearchQuery;

    const handleActiveStepChange = (stepId: string) => {
      setInternalActiveStepId(stepId);
      onActiveStepChange?.(stepId);
    };

    const handleSelectedContactChange = (contactId: string) => {
      setInternalSelectedContactId(contactId);
      onSelectedContactChange?.(contactId);
    };

    const handleSearchQueryChange = (query: string) => {
      setInternalSearchQuery(query);
      onSearchQueryChange?.(query);
    };

    const filteredContacts = contacts.filter((contact) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        contact.name.toLowerCase().includes(q) ||
        contact.email.toLowerCase().includes(q) ||
        (contact.company?.toLowerCase().includes(q) ?? false)
      );
    });

    const sendableContacts = contacts.filter(
      (c) => c.sendStatus === 'pending' || c.sendStatus === 'failed',
    );

    const statusStyle = sequenceStatusColors[status];

    const statusLabels: Record<string, string> = {
      draft: 'Draft',
      'in-review': 'In Review',
      active: 'Active',
      paused: 'Paused',
      completed: 'Completed',
      archived: 'Archived',
    };

    return (
      <Box className={className} style={{ display: 'flex', height: '100%', backgroundColor: tokens.colors.common.white, ...style }}>
        {/* Contact sidebar */}
        <Box style={{ width: 300, borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          {/* Sidebar header */}
          <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
            <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], marginBottom: tokens.spacing[2] }}>
              Contacts ({contacts.length})
            </Box>
            <input
              value={searchQuery}
              onChange={(e) => handleSearchQueryChange(e.target.value)}
              placeholder="Search contacts..."
              style={{
                width: '100%',
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                fontSize: tokens.typography.fontSize.sm,
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
                color: tokens.colors.neutral[800],
                backgroundColor: tokens.colors.common.white,
              }}
            />
          </Box>

          {/* Contact list */}
          <Box style={{ flex: 1, overflow: 'auto' }}>
            <Stack direction="vertical" spacing="none">
              {filteredContacts.map((contact) => {
                const isSelected = contact.id === selectedContactId;
                const sendColors = contactStatusColors[contact.sendStatus];

                return (
                  <Box
                    key={contact.id}
                    onClick={() => handleSelectedContactChange(contact.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[3],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                      cursor: 'pointer',
                      backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                      borderLeft: isSelected ? `3px solid ${tokens.colors.primaryScale[500]}` : '3px solid transparent',
                    }}
                  >
                    {/* Avatar */}
                    <Box style={{ position: 'relative', flexShrink: 0 }}>
                      {contact.avatar ? (
                        <img src={contact.avatar} alt="" style={{ width: tokens.spacing[8], height: tokens.spacing[8], borderRadius: tokens.borderRadius.full, objectFit: 'cover' }} />
                      ) : contact.companyLogo ? (
                        <img src={contact.companyLogo} alt="" style={{ width: tokens.spacing[8], height: tokens.spacing[8], borderRadius: tokens.borderRadius.full, objectFit: 'cover' }} />
                      ) : (
                        <Box style={{
                          width: tokens.spacing[8],
                          height: tokens.spacing[8],
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.neutral[200],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[600],
                          fontWeight: tokens.typography.fontWeight.semibold,
                        }}>
                          {getContactInitials(contact.name)}
                        </Box>
                      )}
                      {/* Status dot */}
                      <Box style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: tokens.spacing[2],
                        height: tokens.spacing[2],
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: sendColors.color,
                        border: `2px solid ${tokens.colors.common.white}`,
                      }} />
                    </Box>

                    {/* Contact info */}
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Box style={{
                        fontWeight: tokens.typography.fontWeight.semibold,
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[900],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {contact.name}
                      </Box>
                      <Box style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {contact.email}
                      </Box>
                      {contact.company && (
                        <Box style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[400],
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginTop: tokens.spacing[0],
                        }}>
                          {contact.company}
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
              {filteredContacts.length === 0 && (
                <Box style={{ padding: tokens.spacing[4], textAlign: 'center', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                  {searchQuery ? 'No contacts match your search' : 'No contacts added'}
                </Box>
              )}
            </Stack>
          </Box>
        </Box>

        {/* Main builder panel */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <Box style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                {title}
              </h2>
              {/* Status badge */}
              <span style={{
                padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.sm,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: statusStyle.color,
                backgroundColor: statusStyle.bgColor,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusStyle.border}`,
              }}>
                {statusLabels[status] ?? status}
              </span>
              {/* Saved indicator */}
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                color: isSaved ? tokens.colors.successScale[600] : tokens.colors.warningScale[600],
              }}>
                {isSaved ? 'Saved' : 'Unsaved changes'}
              </span>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <button
                onClick={onEditDraft}
                style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.neutral[700],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Edit draft
              </button>
              <button
                onClick={() => onSend?.(sendableContacts.map((c) => c.id))}
                disabled={sendableContacts.length === 0}
                style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: 'none',
                  backgroundColor: sendableContacts.length > 0 ? tokens.colors.primaryScale[500] : tokens.colors.neutral[200],
                  color: sendableContacts.length > 0 ? tokens.colors.common.white : tokens.colors.neutral[500],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  cursor: sendableContacts.length > 0 ? 'pointer' : 'default',
                  fontFamily: 'inherit',
                }}
              >
                Send ({sendableContacts.length})
              </button>
            </Box>
          </Box>

          {/* Scrollable step chain */}
          <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[4] }}>
            {loading ? (
              <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>Loading...</Box>
            ) : (
              <Stack direction="vertical" spacing="none">
                {steps.map((step, index) => {
                  const isActive = step.id === activeStepId;
                  const sColors = stepStatusColors[step.status];

                  return (
                    <Box key={step.id}>
                      {/* Delay connector (before step, except first) */}
                      {index > 0 && step.delay && (
                        <Box style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: `${tokens.spacing[1]}px 0`,
                        }}>
                          <Box style={{
                            width: 0,
                            height: tokens.spacing[5],
                            borderLeft: delayStyles.line.borderLeft,
                          }} />
                          <Box style={{
                            padding: `${tokens.spacing[0]}px ${tokens.spacing[3]}px`,
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: delayStyles.pill.bgColor,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${delayStyles.pill.border}`,
                            color: delayStyles.pill.color,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            whiteSpace: 'nowrap',
                          }}>
                            Wait {formatDelayDisplay(step.delay)}
                          </Box>
                          <Box style={{
                            width: 0,
                            height: tokens.spacing[5],
                            borderLeft: delayStyles.line.borderLeft,
                          }} />
                        </Box>
                      )}
                      {/* Connector line without delay */}
                      {index > 0 && !step.delay && (
                        <Box style={{
                          display: 'flex',
                          justifyContent: 'center',
                          padding: `${tokens.spacing[1]}px 0`,
                        }}>
                          <Box style={{
                            width: 0,
                            height: tokens.spacing[6],
                            borderLeft: delayStyles.line.borderLeft,
                          }} />
                        </Box>
                      )}

                      {/* Step card */}
                      <Box
                        onClick={() => handleActiveStepChange(step.id)}
                        style={{
                          borderRadius: tokens.borderRadius.md,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isActive ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                          backgroundColor: tokens.colors.common.white,
                          boxShadow: isActive ? `0 0 0 1px ${tokens.colors.primaryScale[200]}` : 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {/* Step header */}
                        <Box style={{
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: tokens.colors.neutral[50],
                          borderRadius: `${tokens.borderRadius.md} ${tokens.borderRadius.md} 0 0`,
                        }}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                            <Box style={{
                              width: tokens.spacing[6],
                              height: tokens.spacing[6],
                              borderRadius: tokens.borderRadius.full,
                              backgroundColor: isActive ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300],
                              color: tokens.colors.common.white,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.bold,
                              flexShrink: 0,
                            }}>
                              {step.order}
                            </Box>
                            <span style={{
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.neutral[800],
                            }}>
                              Step {step.order}
                            </span>
                          </Box>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                            <span style={{
                              padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.sm,
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: sColors.color,
                              backgroundColor: sColors.bgColor,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${sColors.border}`,
                              textTransform: 'capitalize',
                            }}>
                              {step.status}
                            </span>
                            {onStepRemove && (
                              <button
                                onClick={(e) => { e.stopPropagation(); onStepRemove(step.id); }}
                                style={{
                                  border: 'none',
                                  backgroundColor: 'transparent',
                                  color: tokens.colors.neutral[400],
                                  cursor: 'pointer',
                                  fontFamily: 'inherit',
                                  fontSize: tokens.typography.fontSize.sm,
                                  padding: tokens.spacing[0],
                                  lineHeight: 1,
                                }}
                                title="Remove step"
                              >
                                \u2715
                              </button>
                            )}
                          </Box>
                        </Box>

                        {/* Step fields */}
                        <Box style={{ padding: tokens.spacing[3] }}>
                          {/* From field */}
                          {step.from && (
                            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], width: tokens.spacing[8], flexShrink: 0 }}>From</span>
                              <input
                                value={step.from.value}
                                onChange={(e) => onStepChange?.(step.id, 'from', { ...step.from, value: e.target.value })}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  flex: 1,
                                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                                  borderRadius: tokens.borderRadius.sm,
                                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                                  fontSize: tokens.typography.fontSize.sm,
                                  fontFamily: 'inherit',
                                  outline: 'none',
                                  color: tokens.colors.neutral[800],
                                  backgroundColor: tokens.colors.common.white,
                                }}
                              />
                            </Box>
                          )}

                          {/* To field */}
                          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], width: tokens.spacing[8], flexShrink: 0 }}>To</span>
                            <input
                              value={step.to?.map((r) => r.value).join(', ') ?? ''}
                              onChange={(e) => onStepChange?.(step.id, 'to', [{ value: e.target.value }])}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="Recipients..."
                              style={{
                                flex: 1,
                                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                                borderRadius: tokens.borderRadius.sm,
                                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                                fontSize: tokens.typography.fontSize.sm,
                                fontFamily: 'inherit',
                                outline: 'none',
                                color: tokens.colors.neutral[800],
                                backgroundColor: tokens.colors.common.white,
                              }}
                            />
                          </Box>

                          {/* Cc field */}
                          {step.cc !== undefined && (
                            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], width: tokens.spacing[8], flexShrink: 0 }}>Cc</span>
                              <input
                                value={step.cc?.map((r) => r.value).join(', ') ?? ''}
                                onChange={(e) => onStepChange?.(step.id, 'cc', [{ value: e.target.value }])}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  flex: 1,
                                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                                  borderRadius: tokens.borderRadius.sm,
                                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                                  fontSize: tokens.typography.fontSize.sm,
                                  fontFamily: 'inherit',
                                  outline: 'none',
                                  color: tokens.colors.neutral[800],
                                  backgroundColor: tokens.colors.common.white,
                                }}
                              />
                            </Box>
                          )}

                          {/* Bcc field */}
                          {step.bcc !== undefined && (
                            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], width: tokens.spacing[8], flexShrink: 0 }}>Bcc</span>
                              <input
                                value={step.bcc?.map((r) => r.value).join(', ') ?? ''}
                                onChange={(e) => onStepChange?.(step.id, 'bcc', [{ value: e.target.value }])}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  flex: 1,
                                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                                  borderRadius: tokens.borderRadius.sm,
                                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                                  fontSize: tokens.typography.fontSize.sm,
                                  fontFamily: 'inherit',
                                  outline: 'none',
                                  color: tokens.colors.neutral[800],
                                  backgroundColor: tokens.colors.common.white,
                                }}
                              />
                            </Box>
                          )}

                          {/* Subject */}
                          <Box style={{ marginBottom: tokens.spacing[2] }}>
                            <input
                              value={step.subject}
                              onChange={(e) => onStepChange?.(step.id, 'subject', e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="Subject line..."
                              style={{
                                width: '100%',
                                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                                borderRadius: tokens.borderRadius.sm,
                                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                                fontSize: tokens.typography.fontSize.sm,
                                fontFamily: 'inherit',
                                fontWeight: tokens.typography.fontWeight.semibold,
                                outline: 'none',
                                boxSizing: 'border-box',
                                color: tokens.colors.neutral[900],
                                backgroundColor: tokens.colors.common.white,
                              }}
                            />
                          </Box>

                          {/* Toolbar */}
                          {toolbarActions.length > 0 && isActive && (
                            <Box style={{
                              display: 'flex',
                              gap: tokens.spacing[0],
                              marginBottom: tokens.spacing[2],
                              padding: `${tokens.spacing[1]}px 0`,
                              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                            }}>
                              {toolbarActions.map((action) => (
                                <button
                                  key={action}
                                  onClick={(e) => { e.stopPropagation(); onToolbarAction?.(action, step.id); }}
                                  title={getToolbarActionTitle(action)}
                                  style={{
                                    width: tokens.spacing[7],
                                    height: tokens.spacing[7],
                                    border: 'none',
                                    borderRadius: tokens.borderRadius.sm,
                                    backgroundColor: 'transparent',
                                    color: tokens.colors.neutral[500],
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    fontSize: tokens.typography.fontSize.xs,
                                    fontWeight: tokens.typography.fontWeight.semibold,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {getToolbarActionLabel(action)}
                                </button>
                              ))}
                            </Box>
                          )}

                          {/* Body textarea */}
                          <textarea
                            value={step.body}
                            onChange={(e) => onStepChange?.(step.id, 'body', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Write your email body..."
                            rows={isActive ? 6 : 3}
                            style={{
                              width: '100%',
                              padding: tokens.spacing[2],
                              borderRadius: tokens.borderRadius.sm,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                              fontSize: tokens.typography.fontSize.sm,
                              fontFamily: 'inherit',
                              lineHeight: tokens.typography.lineHeight.relaxed,
                              outline: 'none',
                              resize: 'vertical',
                              boxSizing: 'border-box',
                              color: tokens.colors.neutral[800],
                              backgroundColor: tokens.colors.common.white,
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  );
                })}

                {/* Add step button */}
                <Box style={{ display: 'flex', justifyContent: 'center', padding: `${tokens.spacing[3]}px 0` }}>
                  {steps.length > 0 && (
                    <Box style={{
                      width: 0,
                      height: tokens.spacing[5],
                      borderLeft: delayStyles.line.borderLeft,
                      marginBottom: tokens.spacing[2],
                    }} />
                  )}
                </Box>
                <Box style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    onClick={onStepAdd}
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `2px dashed ${tokens.colors.neutral[300]}`,
                      backgroundColor: 'transparent',
                      color: tokens.colors.neutral[500],
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                    }}
                  >
                    + Add step
                  </button>
                </Box>
              </Stack>
            )}
          </Box>
        </Box>
      </Box>
    );
  },
});
