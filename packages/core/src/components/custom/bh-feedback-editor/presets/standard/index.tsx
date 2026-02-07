'use client';

/**
 * BhFeedbackEditor - Standard Preset
 * Complete feedback composer with decision context, template selector,
 * AI draft generator, rich text editor with variable chips,
 * channel selector, tone selector, and live preview panel.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createSurfaceStyle, createBadgeStyle, createHoverStyle, getHoverTransform } from '../../../helpers';
import type {
  BhFeedbackEditorProps,
  FeedbackChannel,
  FeedbackTone,
  FeedbackTemplate,
  DecisionContext,
} from '../../core';
import {
  BH_FEEDBACK_EDITOR_DEFAULTS,
  getChannelConfig,
  getToneConfig,
  getTemplateCategoryConfig,
  getDecisionBadgeColors,
  substituteVariables,
  FEEDBACK_VARIABLES,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Mail,
  MessageSquare,
  Smartphone,
  Linkedin,
  Send,
  Sparkles,
  Eye,
  EyeOff,
  FileText,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Star,
  BarChart3,
  Award,
  Quote,
  Loader2,
  Plus,
  Hash,
  Type,
  Target,
  Clipboard,
  Heart,
  Briefcase,
  Shield,
  Lightbulb,
  BookOpen,
} from 'lucide-react';

// ─── Standard Preset ────────────────────────────────────────────────────────────

export const StandardBhFeedbackEditor = createPreset<BhFeedbackEditorProps>({
  name: 'BhFeedbackEditor.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhFeedbackEditorProps>) => {
    const { Box } = primitives;
    const channelConfig = getChannelConfig(tokens);
    const toneConfig = getToneConfig(tokens);
    const categoryConfig = getTemplateCategoryConfig(tokens);
    const hoverStyle = createHoverStyle(tokens);
    const cardStyle = createCardStyle(tokens, { elevation: 'sm', glass: engine !== 'classic' });

    const {
      context,
      templates = [],
      selectedTemplate: selectedTemplateProp,
      onTemplateSelect,
      messageContent: messageContentProp,
      onMessageChange,
      subject: subjectProp,
      onSubjectChange,
      channel: channelProp,
      onChannelChange,
      tone: toneProp,
      onToneChange,
      isGenerating: isGeneratingProp,
      onGenerate,
      showPreview: showPreviewProp,
      onPreviewToggle,
      onSend,
      recipientPreview,
      className,
      style,
    } = props;

    // ─── Internal state ──────────────────────────────────────────────────
    const [internalSelectedTemplate, setInternalSelectedTemplate] = useState<string | null>(null);
    const [internalMessage, setInternalMessage] = useState('');
    const [internalSubject, setInternalSubject] = useState('');
    const [internalChannel, setInternalChannel] = useState<FeedbackChannel>('email');
    const [internalTone, setInternalTone] = useState<FeedbackTone>('professional');
    const [internalIsGenerating, setInternalIsGenerating] = useState(false);
    const [internalShowPreview, setInternalShowPreview] = useState(false);
    const [hoveredTemplateId, setHoveredTemplateId] = useState<string | null>(null);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    const selectedTemplateId = selectedTemplateProp ?? internalSelectedTemplate;
    const setSelectedTemplateId = onTemplateSelect ?? setInternalSelectedTemplate;
    const messageContent = messageContentProp ?? internalMessage;
    const setMessageContent = onMessageChange ?? setInternalMessage;
    const subject = subjectProp ?? internalSubject;
    const setSubject = onSubjectChange ?? setInternalSubject;
    const channel = channelProp ?? internalChannel;
    const setChannel = onChannelChange ?? setInternalChannel;
    const tone = toneProp ?? internalTone;
    const setTone = onToneChange ?? setInternalTone;
    const isGenerating = isGeneratingProp ?? internalIsGenerating;
    const showPreview = showPreviewProp ?? internalShowPreview;
    const setShowPreview = onPreviewToggle ?? setInternalShowPreview;

    const decisionBadge = getDecisionBadgeColors(tokens, context.decision);

    const selectedTemplate = useMemo(
      () => templates.find((t) => t.id === selectedTemplateId) ?? null,
      [templates, selectedTemplateId],
    );

    const hoveredTemplate = useMemo(
      () => templates.find((t) => t.id === hoveredTemplateId) ?? null,
      [templates, hoveredTemplateId],
    );

    const groupedTemplates = useMemo(() => {
      const groups: Record<string, FeedbackTemplate[]> = {};
      templates.forEach((t) => {
        if (!groups[t.category]) groups[t.category] = [];
        groups[t.category].push(t);
      });
      return groups;
    }, [templates]);

    const previewContent = useMemo(
      () => substituteVariables(messageContent, context),
      [messageContent, context],
    );

    const charCount = messageContent.length;
    const currentChannelConfig = channelConfig[channel];
    const isOverLimit = currentChannelConfig.maxChars > 0 && charCount > currentChannelConfig.maxChars;

    const handleTemplateApply = useCallback(
      (templateId: string) => {
        const template = templates.find((t) => t.id === templateId);
        if (template) {
          setSelectedTemplateId(templateId);
          setMessageContent(template.content);
        }
      },
      [templates, setSelectedTemplateId, setMessageContent],
    );

    const handleInsertVariable = useCallback(
      (varKey: string) => {
        setMessageContent(messageContent + `{${varKey}}`);
      },
      [messageContent, setMessageContent],
    );

    const handleGenerate = useCallback(() => {
      if (onGenerate) {
        onGenerate();
      } else {
        setInternalIsGenerating(true);
        setTimeout(() => setInternalIsGenerating(false), 2000);
      }
    }, [onGenerate]);

    const channelIcons: Record<FeedbackChannel, React.ReactNode> = {
      email: <Mail size={16} />,
      sms: <Smartphone size={16} />,
      whatsapp: <MessageSquare size={16} />,
      linkedin: <Linkedin size={16} />,
    };

    const surfaceStyle = createSurfaceStyle(tokens, { elevation: 'lg', glass: engine !== 'classic' });

    return (
      <Box className={className} style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: tokens.colors.neutral[50],
        fontFamily: 'inherit',
        ...style,
      }}>
        {/* ─── Candidate Header ────────────────────────────────────────── */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
          backgroundColor: tokens.colors.common.white,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          ...createSurfaceStyle(tokens, { elevation: 'sm' }),
          borderRadius: 0,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Box style={{
              width: tokens.spacing[10],
              height: tokens.spacing[10],
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.primaryScale[100],
              color: tokens.colors.primaryScale[700],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.bold,
              flexShrink: 0,
            }}>
              {context.candidateName.charAt(0).toUpperCase()}
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' }}>
              <Box style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}>
                {context.candidateName}
                <Box style={{
                  padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: decisionBadge.bgColor,
                  color: decisionBadge.color,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${decisionBadge.borderColor}`,
                }}>
                  {context.decision}
                </Box>
              </Box>
              <Box style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
              }}>
                {context.jobTitle}
                {recipientPreview && (
                  <span style={{ marginLeft: tokens.spacing[2], color: tokens.colors.neutral[400] }}>
                    ({recipientPreview})
                  </span>
                )}
              </Box>
            </Box>
          </Box>

          {/* Preview Toggle + Send */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <button
              onClick={() => setShowPreview(!showPreview)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${showPreview ? tokens.colors.primaryScale[300] : tokens.colors.neutral[300]}`,
                backgroundColor: showPreview ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                color: showPreview ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                fontFamily: 'inherit',
                ...hoverStyle,
              }}
            >
              {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPreview ? 'Hide Preview' : 'Preview'}
            </button>
            <button
              onClick={onSend}
              disabled={!messageContent.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
                borderRadius: tokens.borderRadius.md,
                border: 'none',
                backgroundColor: messageContent.trim() ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300],
                color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                cursor: messageContent.trim() ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                ...hoverStyle,
              }}
            >
              <Send size={14} />
              Send
            </button>
          </Box>
        </Box>

        {/* ─── Main Content ────────────────────────────────────────────── */}
        <Box style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
        }}>
          {/* ─── Left: Template Sidebar ─────────────────────────────────── */}
          <Box style={{
            width: 280,
            flexShrink: 0,
            borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Decision Context Card */}
            <Box style={{
              padding: tokens.spacing[4],
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}>
              <Box style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[500],
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: tokens.spacing[2],
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
              }}>
                <Target size={12} />
                Decision Context
              </Box>
              {/* Score highlights */}
              {context.scoreHighlights.length > 0 && (
                <Box style={{ marginBottom: tokens.spacing[2] }}>
                  {context.scoreHighlights.map((h, i) => (
                    <Box key={i} style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[600],
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      marginBottom: 2,
                    }}>
                      <Star size={10} color={tokens.colors.warningScale[500]} />
                      {h}
                    </Box>
                  ))}
                </Box>
              )}
              {/* Key evidence */}
              {context.keyEvidence.length > 0 && (
                <Box style={{ marginBottom: tokens.spacing[2] }}>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[500],
                    marginBottom: tokens.spacing[1],
                  }}>
                    Evidence
                  </Box>
                  {context.keyEvidence.map((ev, i) => (
                    <Box key={i} style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[600],
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.sm,
                      backgroundColor: tokens.colors.neutral[50],
                      marginBottom: 2,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: tokens.spacing[1],
                    }}>
                      <Quote size={10} color={tokens.colors.neutral[400]} style={{ flexShrink: 0, marginTop: 2 }} />
                      {ev}
                    </Box>
                  ))}
                </Box>
              )}
              {/* Reasoning */}
              <Box style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                fontStyle: 'italic',
              }}>
                {context.reasoning}
              </Box>
            </Box>

            {/* Templates list */}
            <Box style={{
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[500],
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
            }}>
              <FileText size={12} />
              Templates ({templates.length})
            </Box>
            <Box style={{ flex: 1, overflowY: 'auto' }}>
              {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => {
                const catConfig = categoryConfig[category as keyof typeof categoryConfig];
                const isExpanded = expandedCategory === category;

                return (
                  <Box key={category}>
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : category)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        ...hoverStyle,
                      }}
                    >
                      <Box style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                      }}>
                        <Box style={{
                          padding: `0 ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.sm,
                          backgroundColor: catConfig?.bgColor ?? tokens.colors.neutral[50],
                          color: catConfig?.color ?? tokens.colors.neutral[700],
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                        }}>
                          {catConfig?.label ?? category}
                        </Box>
                        <Box style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[400],
                        }}>
                          ({categoryTemplates.length})
                        </Box>
                      </Box>
                      {isExpanded ? <ChevronDown size={12} color={tokens.colors.neutral[400]} /> : <ChevronRight size={12} color={tokens.colors.neutral[400]} />}
                    </button>

                    {isExpanded && categoryTemplates.map((template) => {
                      const isSelected = template.id === selectedTemplateId;
                      const isHovered = template.id === hoveredTemplateId;
                      return (
                        <div
                          key={template.id}
                          onClick={() => handleTemplateApply(template.id)}
                          onMouseEnter={() => setHoveredTemplateId(template.id)}
                          onMouseLeave={() => setHoveredTemplateId(null)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px ${tokens.spacing[2]}px ${tokens.spacing[6]}px`,
                            backgroundColor: isSelected
                              ? tokens.colors.primaryScale[50]
                              : isHovered
                                ? tokens.colors.neutral[50]
                                : 'transparent',
                            cursor: 'pointer',
                            borderLeft: isSelected ? `2px solid ${tokens.colors.primaryScale[500]}` : '2px solid transparent',
                            ...hoverStyle,
                          }}
                        >
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Box style={{
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: isSelected ? tokens.colors.primaryScale[700] : tokens.colors.neutral[800],
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}>
                              {template.name}
                            </Box>
                            {/* Effectiveness bar */}
                            {template.effectiveness !== undefined && (
                              <Box style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: tokens.spacing[1],
                                marginTop: 2,
                              }}>
                                <Box style={{
                                  width: 60,
                                  height: 4,
                                  borderRadius: tokens.borderRadius.full,
                                  backgroundColor: tokens.colors.neutral[200],
                                  overflow: 'hidden',
                                }}>
                                  <Box style={{
                                    width: `${template.effectiveness}%`,
                                    height: '100%',
                                    borderRadius: tokens.borderRadius.full,
                                    backgroundColor: template.effectiveness >= 70
                                      ? tokens.colors.successScale[500]
                                      : template.effectiveness >= 40
                                        ? tokens.colors.warningScale[500]
                                        : tokens.colors.errorScale[500],
                                  }} />
                                </Box>
                                <Box style={{
                                  fontSize: 9,
                                  color: tokens.colors.neutral[400],
                                }}>
                                  {template.effectiveness}%
                                </Box>
                              </Box>
                            )}
                          </Box>
                          {isSelected && <Check size={12} color={tokens.colors.primaryScale[500]} />}
                        </div>
                      );
                    })}
                  </Box>
                );
              })}

              {templates.length === 0 && (
                <Box style={{
                  padding: tokens.spacing[6],
                  textAlign: 'center',
                  color: tokens.colors.neutral[400],
                  fontSize: tokens.typography.fontSize.xs,
                }}>
                  No templates available
                </Box>
              )}
            </Box>
          </Box>

          {/* ─── Center: Editor ─────────────────────────────────────────── */}
          <Box style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Channel tabs */}
            <Box style={{
              display: 'flex',
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
            }}>
              {(['email', 'sms', 'whatsapp', 'linkedin'] as FeedbackChannel[]).map((ch) => {
                const config = channelConfig[ch];
                const isActive = channel === ch;
                return (
                  <button
                    key={ch}
                    onClick={() => setChannel(ch)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      border: 'none',
                      borderBottom: isActive ? `2px solid ${config.color}` : '2px solid transparent',
                      backgroundColor: 'transparent',
                      color: isActive ? config.color : tokens.colors.neutral[500],
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      ...hoverStyle,
                    }}
                  >
                    {channelIcons[ch]}
                    {config.label}
                  </button>
                );
              })}
            </Box>

            {/* Subject line (email only) */}
            {currentChannelConfig.hasSubject && (
              <Box style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
              }}>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject line..."
                  style={{
                    width: '100%',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[900],
                    backgroundColor: tokens.colors.common.white,
                    fontFamily: 'inherit',
                    outline: 'none',
                  }}
                />
              </Box>
            )}

            {/* Tone selector */}
            <Box style={{
              display: 'flex',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
            }}>
              <Box style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[500],
                display: 'flex',
                alignItems: 'center',
                marginRight: tokens.spacing[1],
              }}>
                Tone:
              </Box>
              {(['encouraging', 'neutral', 'professional'] as FeedbackTone[]).map((t) => {
                const config = toneConfig[t];
                const isActive = tone === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `2px solid ${isActive ? config.borderColor : tokens.colors.neutral[200]}`,
                      backgroundColor: isActive ? config.bgColor : tokens.colors.common.white,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      flex: 1,
                      ...hoverStyle,
                    }}
                  >
                    <Box style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: isActive ? config.color : tokens.colors.neutral[700],
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                    }}>
                      {isActive && <Check size={10} />}
                      {config.label}
                    </Box>
                    <Box style={{
                      fontSize: 10,
                      color: tokens.colors.neutral[400],
                      marginTop: 2,
                      textAlign: 'left',
                    }}>
                      {config.description}
                    </Box>
                  </button>
                );
              })}
            </Box>

            {/* Variable insertion toolbar + AI generate button */}
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
            }}>
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                flexWrap: 'wrap',
              }}>
                <Box style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                  marginRight: tokens.spacing[1],
                }}>
                  Insert:
                </Box>
                {FEEDBACK_VARIABLES.map((v) => (
                  <button
                    key={v.key}
                    onClick={() => handleInsertVariable(v.key)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                      backgroundColor: tokens.colors.primaryScale[50],
                      color: tokens.colors.primaryScale[600],
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                      fontFamily: 'monospace',
                      ...hoverStyle,
                    }}
                  >
                    {v.label}
                  </button>
                ))}
              </Box>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.secondaryScale?.[300] ?? tokens.colors.primaryScale[300]}`,
                  backgroundColor: tokens.colors.secondaryScale?.[50] ?? tokens.colors.primaryScale[50],
                  color: tokens.colors.secondaryScale?.[700] ?? tokens.colors.primaryScale[700],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  opacity: isGenerating ? 0.7 : 1,
                  ...hoverStyle,
                }}
              >
                {isGenerating ? (
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Sparkles size={14} />
                )}
                {isGenerating ? 'Generating...' : 'Generate Feedback'}
              </button>
            </Box>

            {/* Textarea */}
            <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Compose your feedback message here..."
                style={{
                  flex: 1,
                  padding: tokens.spacing[4],
                  border: 'none',
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[900],
                  backgroundColor: tokens.colors.common.white,
                  fontFamily: 'inherit',
                  resize: 'none',
                  outline: 'none',
                  lineHeight: 1.6,
                }}
              />
              {/* Character count bar (for SMS) */}
              {currentChannelConfig.maxChars > 0 && (
                <Box style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.common.white,
                }}>
                  <Box style={{
                    flex: 1,
                    height: 4,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.neutral[200],
                    marginRight: tokens.spacing[3],
                  }}>
                    <Box style={{
                      width: `${Math.min(100, (charCount / currentChannelConfig.maxChars) * 100)}%`,
                      height: '100%',
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: isOverLimit
                        ? tokens.colors.errorScale[500]
                        : charCount > currentChannelConfig.maxChars * 0.8
                          ? tokens.colors.warningScale[500]
                          : tokens.colors.successScale[500],
                      transition: `all ${tokens.motion.hover}`,
                    }} />
                  </Box>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: isOverLimit ? tokens.colors.errorScale[600] : tokens.colors.neutral[500],
                    fontWeight: isOverLimit ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                    whiteSpace: 'nowrap',
                  }}>
                    {charCount}/{currentChannelConfig.maxChars}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          {/* ─── Right: Preview Panel ───────────────────────────────────── */}
          {showPreview && (
            <Box style={{
              width: 360,
              flexShrink: 0,
              borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.neutral[50],
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}>
              <Box style={{
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[700],
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}>
                <Eye size={14} />
                Preview ({channelConfig[channel].label})
              </Box>
              <Box style={{ flex: 1, overflowY: 'auto', padding: tokens.spacing[4] }}>
                {/* Simulated message container */}
                <Box style={{
                  ...cardStyle,
                  padding: tokens.spacing[4],
                }}>
                  {/* Channel header */}
                  <Box style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    marginBottom: tokens.spacing[3],
                    paddingBottom: tokens.spacing[3],
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                  }}>
                    <Box style={{
                      width: tokens.spacing[8],
                      height: tokens.spacing[8],
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: currentChannelConfig.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: currentChannelConfig.color,
                    }}>
                      {channelIcons[channel]}
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Box style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                      }}>
                        {channel === 'email' ? 'Email Message' : channelConfig[channel].label + ' Message'}
                      </Box>
                      <Box style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}>
                        To: {recipientPreview ?? context.candidateName}
                      </Box>
                    </Box>
                  </Box>

                  {/* Subject (email) */}
                  {channel === 'email' && subject && (
                    <Box style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                      marginBottom: tokens.spacing[3],
                    }}>
                      {substituteVariables(subject, context)}
                    </Box>
                  )}

                  {/* Rendered message */}
                  <Box style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[700],
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {previewContent || (
                      <span style={{ color: tokens.colors.neutral[400], fontStyle: 'italic' }}>
                        Message preview will appear here...
                      </span>
                    )}
                  </Box>
                </Box>

                {/* Template hover preview */}
                {hoveredTemplate && hoveredTemplate.id !== selectedTemplateId && (
                  <Box style={{
                    ...cardStyle,
                    marginTop: tokens.spacing[3],
                    padding: tokens.spacing[3],
                    borderLeft: `3px solid ${tokens.colors.infoScale[400]}`,
                  }}>
                    <Box style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.infoScale[700],
                      marginBottom: tokens.spacing[2],
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                    }}>
                      <BookOpen size={12} />
                      Template Preview: {hoveredTemplate.name}
                    </Box>
                    <Box style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[600],
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      maxHeight: 120,
                      overflow: 'hidden',
                    }}>
                      {substituteVariables(hoveredTemplate.content, context)}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
