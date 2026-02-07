'use client';

/**
 * ApprovalWorkflow - Editor Preset
 * Full editor with approver management and outcome flow configuration
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { ApprovalWorkflowProps, Approver, ApprovalOutcome } from '../../core';
import { getOutcomeColors, getStatusCategoryColors, formatApproverDisplay } from '../../core';

export const EditorApprovalWorkflow = createPreset<ApprovalWorkflowProps>({
  name: 'ApprovalWorkflow.Editor',
  render: ({ primitives, props, tokens, engine }: PresetContext<ApprovalWorkflowProps>) => {
    const { Box } = primitives;
    const outcomeColors = getOutcomeColors(tokens);
    const categoryColors = getStatusCategoryColors(tokens);

    const {
      statuses,
      transitions,
      approvalRules,
      selectedStatusId,
      onStatusSelect,
      onApproverAdd,
      onApproverRemove,
      onOutcomeTransitionChange,
      onSave,
      onCancel,
      showTransitionLabels = true,
      title = 'Approvals',
      subtitle,
      learnMoreUrl,
      loading,
      className,
      style,
      onRuleReorder,
      onRuleCreate,
      onRuleDelete,
    } = props;

    const [addApproverInputs, setAddApproverInputs] = useState<Record<string, string>>({});
    const [collapsedRules, setCollapsedRules] = useState<Record<string, boolean>>({});
    const [draggedRuleId, setDraggedRuleId] = useState<string | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const currentRule = approvalRules.length > 0 ? approvalRules[0] : null;

    const toggleCollapsed = (ruleId: string) => {
      setCollapsedRules(prev => ({ ...prev, [ruleId]: !prev[ruleId] }));
    };

    const handleRuleDragStart = (e: React.DragEvent, ruleId: string) => {
      if (!onRuleReorder) return;
      setDraggedRuleId(ruleId);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', ruleId);
    };

    const handleRuleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverIndex(index);
    };

    const handleRuleDrop = (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      if (draggedRuleId && onRuleReorder) {
        onRuleReorder(draggedRuleId, targetIndex);
      }
      setDraggedRuleId(null);
      setDragOverIndex(null);
    };

    const handleRuleDragEnd = () => {
      setDraggedRuleId(null);
      setDragOverIndex(null);
    };

    const getTransitionById = (transitionId?: string) => {
      if (!transitionId) return null;
      return transitions.find(t => t.id === transitionId) ?? null;
    };

    const getStatusById = (statusId: string) => {
      return statuses.find(s => s.id === statusId) ?? null;
    };

    const handleAddApprover = (ruleId: string) => {
      const inputValue = addApproverInputs[ruleId] ?? '';
      if (!inputValue.trim()) return;
      const newApprover: Approver = {
        id: `approver-${Date.now()}`,
        name: inputValue.trim(),
      };
      onApproverAdd?.(ruleId, newApprover);
      setAddApproverInputs(prev => ({ ...prev, [ruleId]: '' }));
    };

    const handleInputKeyDown = (ruleId: string, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleAddApprover(ruleId);
      }
    };

    const selectedStatus = selectedStatusId ? getStatusById(selectedStatusId) : null;

    return (
      <Box className={className} style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: tokens.colors.common.white,
        borderRadius: tokens.borderRadius.lg,
        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        boxShadow: tokens.shadows.lg,
        maxWidth: 640,
        width: '100%',
        ...style,
      }}>
        {/* Header */}
        <Box style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}>
          <Box style={{ flex: 1 }}>
            <Box style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: subtitle ? tokens.spacing[1] : 0,
            }}>
              {title}
            </Box>
            {subtitle && (
              <Box style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                lineHeight: 1.5,
              }}>
                {subtitle}
                {learnMoreUrl && (
                  <a
                    href={learnMoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: tokens.colors.primaryScale[600],
                      textDecoration: 'none',
                      marginLeft: tokens.spacing[1],
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}
                  >
                    Learn more
                  </a>
                )}
              </Box>
            )}
          </Box>
          <button
            onClick={onCancel}
            style={{
              width: tokens.spacing[8],
              height: tokens.spacing[8],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              borderRadius: tokens.borderRadius.md,
              color: tokens.colors.neutral[400],
              fontSize: tokens.typography.fontSize.lg,
              fontFamily: 'inherit',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </Box>

        {loading ? (
          <Box style={{
            padding: tokens.spacing[10],
            textAlign: 'center',
            color: tokens.colors.neutral[400],
            fontSize: tokens.typography.fontSize.sm,
          }}>
            Loading...
          </Box>
        ) : (
          <Box style={{ padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`, display: 'flex', flexDirection: 'column', gap: tokens.spacing[6] }}>
            {/* Add Rule Button */}
            {onRuleCreate && (
              <Box style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <button
                  onClick={onRuleCreate}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `1px dashed ${tokens.colors.neutral[300]}`,
                    backgroundColor: 'transparent',
                    color: tokens.colors.primaryScale[600],
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  + Add approval rule
                </button>
              </Box>
            )}

            {/* Approval Rules */}
            {approvalRules.map((rule, ruleIndex) => {
              const isCollapsed = collapsedRules[rule.id] ?? false;
              const isDragging = draggedRuleId === rule.id;
              const isDraggedOver = dragOverIndex === ruleIndex && draggedRuleId !== rule.id;

              return (
              <div
                key={rule.id}
                draggable={!!onRuleReorder}
                onDragStart={(e) => handleRuleDragStart(e, rule.id)}
                onDragOver={(e) => handleRuleDragOver(e, ruleIndex)}
                onDrop={(e) => handleRuleDrop(e, ruleIndex)}
                onDragEnd={handleRuleDragEnd}
                style={{
                  display: 'flex', flexDirection: 'column', gap: tokens.spacing[5],
                  padding: tokens.spacing[4],
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.common.white,
                  opacity: isDragging ? 0.4 : 1,
                  borderTop: isDraggedOver ? `2px solid ${tokens.colors.primaryScale[500]}` : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                {/* Rule header with drag handle, label, collapse, delete */}
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  {onRuleReorder && (
                    <span style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[400],
                      cursor: 'grab',
                      userSelect: 'none',
                      flexShrink: 0,
                    }}>
                      ⠿
                    </span>
                  )}
                  <button
                    onClick={() => toggleCollapsed(rule.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: tokens.spacing[5], height: tokens.spacing[5],
                      border: 'none', borderRadius: tokens.borderRadius.sm,
                      backgroundColor: 'transparent', cursor: 'pointer',
                      color: tokens.colors.neutral[500], fontFamily: 'inherit',
                      fontSize: tokens.typography.fontSize.sm, padding: 0,
                      transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    ▼
                  </button>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[800],
                    flex: 1,
                  }}>
                    Rule {ruleIndex + 1}
                    <span style={{ fontWeight: tokens.typography.fontWeight.normal, color: tokens.colors.neutral[500], marginLeft: tokens.spacing[2] }}>
                      ({rule.approvers.length} approver{rule.approvers.length !== 1 ? 's' : ''})
                    </span>
                  </Box>
                  {onRuleDelete && (
                    <button
                      onClick={() => onRuleDelete(rule.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: tokens.spacing[6], height: tokens.spacing[6],
                        border: 'none', borderRadius: tokens.borderRadius.sm,
                        backgroundColor: 'transparent', cursor: 'pointer',
                        color: tokens.colors.neutral[400], fontFamily: 'inherit',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 4h8M5.5 4V3a1 1 0 011-1h1a1 1 0 011 1v1M6 6.5v3M8 6.5v3M4 4l.5 7a1 1 0 001 1h3a1 1 0 001-1L10 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                </Box>

                {!isCollapsed && (
                <>
                {/* Approvers Section */}
                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[700],
                  }}>
                    Select preset approvers
                  </Box>

                  {/* Approver chips */}
                  <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[2] }}>
                    {rule.approvers.map((approver) => (
                      <Box key={approver.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                        backgroundColor: tokens.colors.neutral[100],
                        borderRadius: tokens.borderRadius.full,
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                      }}>
                        {/* Avatar */}
                        {approver.avatar ? (
                          <img
                            src={approver.avatar}
                            alt={approver.name}
                            style={{
                              width: tokens.spacing[5],
                              height: tokens.spacing[5],
                              borderRadius: tokens.borderRadius.full,
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <Box style={{
                            width: tokens.spacing[5],
                            height: tokens.spacing[5],
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: tokens.colors.primaryScale[100],
                            color: tokens.colors.primaryScale[700],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.semibold,
                          }}>
                            {approver.name.charAt(0).toUpperCase()}
                          </Box>
                        )}
                        <span>{formatApproverDisplay(approver)}</span>
                        {/* Remove button */}
                        <button
                          onClick={() => onApproverRemove?.(rule.id, approver.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: tokens.spacing[4],
                            height: tokens.spacing[4],
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            color: tokens.colors.neutral[400],
                            borderRadius: tokens.borderRadius.full,
                            padding: 0,
                            fontFamily: 'inherit',
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </button>
                      </Box>
                    ))}
                  </Box>

                  {/* Add approver input */}
                  <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
                    <input
                      type="text"
                      placeholder="Add more people"
                      value={addApproverInputs[rule.id] ?? ''}
                      onChange={(e) => setAddApproverInputs(prev => ({ ...prev, [rule.id]: e.target.value }))}
                      onKeyDown={(e) => handleInputKeyDown(rule.id, e)}
                      style={{
                        flex: 1,
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[900],
                        backgroundColor: tokens.colors.common.white,
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                  </Box>

                  {/* Approver field selector */}
                  {rule.approverField !== undefined && (
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Box style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[500],
                        whiteSpace: 'nowrap',
                      }}>
                        Approver field:
                      </Box>
                      <select
                        value={rule.approverField}
                        onChange={() => {}}
                        style={{
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                          borderRadius: tokens.borderRadius.md,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[700],
                          backgroundColor: tokens.colors.common.white,
                          fontFamily: 'inherit',
                          cursor: 'pointer',
                        }}
                      >
                        <option value={rule.approverField}>{rule.approverField}</option>
                      </select>
                    </Box>
                  )}
                </Box>

                {/* Outcome Flow */}
                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
                  {/* Visual branching connector */}
                  <Box style={{
                    display: 'flex',
                    justifyContent: 'center',
                    position: 'relative',
                    paddingTop: tokens.spacing[2],
                  }}>
                    <svg width="100%" height="40" viewBox="0 0 400 40" preserveAspectRatio="xMidYMid meet" style={{ maxWidth: 400 }}>
                      <path d="M 200 0 L 200 15 L 100 15 L 100 40" fill="none" stroke={tokens.colors.neutral[300]} strokeWidth="2" />
                      <path d="M 200 0 L 200 15 L 300 15 L 300 40" fill="none" stroke={tokens.colors.neutral[300]} strokeWidth="2" />
                    </svg>
                  </Box>

                  {/* Outcome Cards */}
                  <Box style={{ display: 'flex', gap: tokens.spacing[4] }}>
                    {/* Approved Card */}
                    <Box style={{
                      flex: 1,
                      borderRadius: tokens.borderRadius.lg,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${outcomeColors.approved.border}`,
                      backgroundColor: outcomeColors.approved.bg,
                      padding: tokens.spacing[4],
                      display: 'flex',
                      flexDirection: 'column',
                      gap: tokens.spacing[3],
                    }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <Box style={{
                          width: tokens.spacing[6],
                          height: tokens.spacing[6],
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.successScale[100],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M11.5 3.5L5.5 10L2.5 7" stroke={outcomeColors.approved.icon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </Box>
                        <Box style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: outcomeColors.approved.color,
                        }}>
                          Approved
                        </Box>
                      </Box>

                      {/* Transition dropdown */}
                      {showTransitionLabels && (
                        <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                          <Box style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                          }}>
                            Move to
                          </Box>
                          <select
                            value={rule.outcomes.approved.transitionId ?? ''}
                            onChange={(e) => onOutcomeTransitionChange?.(rule.id, 'approved', e.target.value)}
                            style={{
                              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                              borderRadius: tokens.borderRadius.md,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${outcomeColors.approved.border}`,
                              fontSize: tokens.typography.fontSize.sm,
                              color: tokens.colors.neutral[700],
                              backgroundColor: tokens.colors.common.white,
                              fontFamily: 'inherit',
                              cursor: 'pointer',
                              width: '100%',
                            }}
                          >
                            <option value="">Select transition...</option>
                            {transitions.map((t) => {
                              const toStatus = getStatusById(t.toStatus);
                              const catColors = toStatus ? categoryColors[toStatus.category] : null;
                              return (
                                <option key={t.id} value={t.id}>
                                  {t.name}{toStatus ? ` → ${toStatus.name}` : ''}
                                </option>
                              );
                            })}
                          </select>
                          {/* Selected transition status badge */}
                          {(() => {
                            const selectedTransition = getTransitionById(rule.outcomes.approved.transitionId);
                            if (!selectedTransition) return null;
                            const toStatus = getStatusById(selectedTransition.toStatus);
                            if (!toStatus) return null;
                            const catColors = categoryColors[toStatus.category];
                            return (
                              <Box style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: tokens.spacing[1],
                                padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                                borderRadius: tokens.borderRadius.sm,
                                backgroundColor: catColors.bgColor,
                                fontSize: tokens.typography.fontSize.xs,
                                color: catColors.color,
                                alignSelf: 'flex-start',
                                marginTop: tokens.spacing[1],
                              }}>
                                <Box style={{
                                  width: tokens.spacing[2],
                                  height: tokens.spacing[2],
                                  borderRadius: tokens.borderRadius.full,
                                  backgroundColor: selectedTransition.statusBadgeColor ?? catColors.dotColor,
                                }} />
                                {toStatus.name}
                              </Box>
                            );
                          })()}
                        </Box>
                      )}
                    </Box>

                    {/* Declined Card */}
                    <Box style={{
                      flex: 1,
                      borderRadius: tokens.borderRadius.lg,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${outcomeColors.declined.border}`,
                      backgroundColor: outcomeColors.declined.bg,
                      padding: tokens.spacing[4],
                      display: 'flex',
                      flexDirection: 'column',
                      gap: tokens.spacing[3],
                    }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <Box style={{
                          width: tokens.spacing[6],
                          height: tokens.spacing[6],
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.errorScale[100],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke={outcomeColors.declined.icon} strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </Box>
                        <Box style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: outcomeColors.declined.color,
                        }}>
                          Declined
                        </Box>
                      </Box>

                      {/* Transition dropdown */}
                      {showTransitionLabels && (
                        <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                          <Box style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                          }}>
                            Move to
                          </Box>
                          <select
                            value={rule.outcomes.declined.transitionId ?? ''}
                            onChange={(e) => onOutcomeTransitionChange?.(rule.id, 'declined', e.target.value)}
                            style={{
                              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                              borderRadius: tokens.borderRadius.md,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${outcomeColors.declined.border}`,
                              fontSize: tokens.typography.fontSize.sm,
                              color: tokens.colors.neutral[700],
                              backgroundColor: tokens.colors.common.white,
                              fontFamily: 'inherit',
                              cursor: 'pointer',
                              width: '100%',
                            }}
                          >
                            <option value="">Select transition...</option>
                            {transitions.map((t) => {
                              const toStatus = getStatusById(t.toStatus);
                              return (
                                <option key={t.id} value={t.id}>
                                  {t.name}{toStatus ? ` → ${toStatus.name}` : ''}
                                </option>
                              );
                            })}
                          </select>
                          {/* Selected transition status badge */}
                          {(() => {
                            const selectedTransition = getTransitionById(rule.outcomes.declined.transitionId);
                            if (!selectedTransition) return null;
                            const toStatus = getStatusById(selectedTransition.toStatus);
                            if (!toStatus) return null;
                            const catColors = categoryColors[toStatus.category];
                            return (
                              <Box style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: tokens.spacing[1],
                                padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                                borderRadius: tokens.borderRadius.sm,
                                backgroundColor: catColors.bgColor,
                                fontSize: tokens.typography.fontSize.xs,
                                color: catColors.color,
                                alignSelf: 'flex-start',
                                marginTop: tokens.spacing[1],
                              }}>
                                <Box style={{
                                  width: tokens.spacing[2],
                                  height: tokens.spacing[2],
                                  borderRadius: tokens.borderRadius.full,
                                  backgroundColor: selectedTransition.statusBadgeColor ?? catColors.dotColor,
                                }} />
                                {toStatus.name}
                              </Box>
                            );
                          })()}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
                </>
                )}
              </div>
              );
            })}

            {/* Selected Status Properties Sidebar */}
            {selectedStatus && (
              <Box style={{
                borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                paddingTop: tokens.spacing[5],
                display: 'flex',
                flexDirection: 'column',
                gap: tokens.spacing[4],
              }}>
                <Box style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                }}>
                  Status Properties
                </Box>

                {/* Status name */}
                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[500],
                  }}>
                    Name
                  </Box>
                  <input
                    type="text"
                    value={selectedStatus.name}
                    readOnly
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[900],
                      backgroundColor: tokens.colors.neutral[50],
                      fontFamily: 'inherit',
                    }}
                  />
                </Box>

                {/* Category */}
                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[500],
                  }}>
                    Category
                  </Box>
                  <Box style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: categoryColors[selectedStatus.category].bgColor,
                    fontSize: tokens.typography.fontSize.sm,
                    color: categoryColors[selectedStatus.category].color,
                    alignSelf: 'flex-start',
                  }}>
                    <Box style={{
                      width: tokens.spacing[2],
                      height: tokens.spacing[2],
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: categoryColors[selectedStatus.category].dotColor,
                    }} />
                    {selectedStatus.category === 'todo' ? 'To Do' : selectedStatus.category === 'in-progress' ? 'In Progress' : 'Done'}
                  </Box>
                </Box>

                {/* Transitions from this status */}
                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[500],
                  }}>
                    Transitions from this status
                  </Box>
                  <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                    {transitions
                      .filter(t => t.fromStatus === selectedStatus.id)
                      .map((t) => {
                        const toStatus = getStatusById(t.toStatus);
                        const catColors = toStatus ? categoryColors[toStatus.category] : null;
                        return (
                          <Box key={t.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: tokens.spacing[2],
                            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.sm,
                            backgroundColor: tokens.colors.neutral[50],
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[600],
                          }}>
                            <span>{t.name}</span>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                              <path d="M2.5 6h7M7 3.5L9.5 6 7 8.5" stroke={tokens.colors.neutral[400]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {toStatus && catColors && (
                              <Box style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: tokens.spacing[1],
                                padding: `0 ${tokens.spacing[1]}px`,
                                borderRadius: tokens.borderRadius.sm,
                                backgroundColor: catColors.bgColor,
                                color: catColors.color,
                              }}>
                                <Box style={{
                                  width: tokens.spacing[1],
                                  height: tokens.spacing[1],
                                  borderRadius: tokens.borderRadius.full,
                                  backgroundColor: t.statusBadgeColor ?? catColors.dotColor,
                                }} />
                                {toStatus.name}
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                    {transitions.filter(t => t.fromStatus === selectedStatus.id).length === 0 && (
                      <Box style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[400],
                        fontStyle: 'italic',
                      }}>
                        No transitions from this status
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Footer */}
        <Box style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: tokens.spacing[3],
          padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
              backgroundColor: tokens.colors.common.white,
              color: tokens.colors.neutral[700],
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            style={{
              padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
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
            Save
          </button>
        </Box>
      </Box>
    );
  },
});
