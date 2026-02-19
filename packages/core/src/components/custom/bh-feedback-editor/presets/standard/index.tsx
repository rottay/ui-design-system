'use client';

/**
 * BhFeedbackEditor - Standard Preset
 * Feedback composer with decision context sidebar, template selector,
 * channel tabs, tone cards, variable chips, AI generation, rich textarea,
 * and live preview panel. Personality-driven, glass-aware, accessible.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createEmptyStateStyle,

  createDividerStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type {
  BhFeedbackEditorProps,
  FeedbackChannel,
  FeedbackTone,
  FeedbackTemplate,
} from '../../core';
import {
  getChannelConfig,
  getToneConfig,
  getTemplateCategoryConfig,
  getDecisionBadgeColors,
  substituteVariables,
  FEEDBACK_VARIABLES,
} from '../../core';
import type { DesignTokens } from '../../../../../types';
import {
  Mail, MessageSquare, Smartphone, Linkedin,
  Send, Sparkles, Eye, EyeOff, FileText,
  ChevronRight, ChevronDown, Check,
  Star, Quote, Loader2, Target, BookOpen,
} from 'lucide-react';

export const StandardBhFeedbackEditor = createPreset<BhFeedbackEditorProps>({
  name: 'BhFeedbackEditor.Standard',
  render: ({ primitives, props, tokens }: PresetContext<BhFeedbackEditorProps>) => {
    const { Box, Text } = primitives;
    const channelConfig = useMemo(() => getChannelConfig(tokens), [tokens]);
    const toneConfig = useMemo(() => getToneConfig(tokens), [tokens]);
    const categoryConfig = useMemo(() => getTemplateCategoryConfig(tokens), [tokens]);
    const personalityTypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);
    const cardHover = useMemo(() => createCardHoverStyles(tokens), [tokens]);
    const entranceAnim = useMemo(() => createEntranceAnimation(tokens, { index: 0 }), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens), [tokens]);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;

    const {
      context, templates: rawTemplates = [],
      selectedTemplate: selectedTemplateProp, onTemplateSelect,
      messageContent: messageContentProp, onMessageChange,
      subject: subjectProp, onSubjectChange,
      channel: channelProp, onChannelChange,
      tone: toneProp, onToneChange,
      isGenerating: isGeneratingProp, onGenerate,
      showPreview: showPreviewProp, onPreviewToggle,
      onSend, recipientPreview, className, style,
    } = props;

    const templates = Array.isArray(rawTemplates) ? rawTemplates : [];

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

    const decisionBadge = useMemo(() => getDecisionBadgeColors(tokens, context.decision), [tokens, context.decision]);

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

    const charCount = useMemo(() => messageContent.length, [messageContent]);
    const currentChannelConfig = useMemo(() => channelConfig[channel], [channelConfig, channel]);
    const isOverLimit = useMemo(() => currentChannelConfig.maxChars > 0 && charCount > currentChannelConfig.maxChars, [currentChannelConfig, charCount]);

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

    const handlePreviewToggle = useCallback(() => {
      setShowPreview(!showPreview);
    }, [showPreview, setShowPreview]);

    const handleSend = useCallback(() => {
      if (messageContent.trim()) {
        onSend?.();
      }
    }, [messageContent, onSend]);

    const channelIcons = useMemo<Record<FeedbackChannel, React.ReactNode>>(() => ({
      email: <Mail size={16} />,
      sms: <Smartphone size={16} />,
      whatsapp: <MessageSquare size={16} />,
      linkedin: <Linkedin size={16} />,
    }), []);

    const headerIconStyle = useMemo(
      () => createIconContainerStyle(tokens, { size: 40, color: tokens.colors.primaryScale[100] }),
      [tokens],
    );
    const entrance = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
    });

    const divider = useMemo(() => createDividerStyle(tokens), [tokens]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(tokens), [tokens]);


    return (
      <Box className={className} style={{
        display: 'flex', flexDirection: 'column' as const, width: '100%', height: '100%',
        backgroundColor: tokens.colors.neutral[50],
        ...entranceAnim.animate, transition: entranceAnim.transition,
        ...style,
      }}>
        {/* Header */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
          backgroundColor: tokens.colors.neutral[50],
          borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Box style={headerIconStyle}>
              <Text style={{
                fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.primaryScale[700],
              }}>
                {(context.candidateName || '').charAt(0).toUpperCase()}
              </Text>
            </Box>
            <Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <Text style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: personalityTypo.headingWeight,
                  color: tokens.colors.neutral[900],
                  letterSpacing: personalityTypo.headingLetterSpacing,
                }}>
                  {context.candidateName}
                </Text>
                <Box style={{
                  padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                  borderRadius: badgeRadius,
                  backgroundColor: decisionBadge.bgColor,
                  border: `1px solid ${decisionBadge.borderColor}`,
                }}>
                  <Text style={{
                    fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                    color: decisionBadge.color,
                  }}>
                    {context.decision}
                  </Text>
                </Box>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginTop: tokens.spacing[1] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                  {context.jobTitle}
                </Text>
                {recipientPreview && (
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
                    ({recipientPreview})
                  </Text>
                )}
              </Box>
            </Box>
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <Box
              role="button"
              tabIndex={0}
              aria-label={showPreview ? 'Hide preview' : 'Show preview'}
              aria-pressed={showPreview}
              onClick={handlePreviewToggle}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePreviewToggle(); } }}
              style={{
                display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.lg,
                border: `1px solid ${showPreview ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
                backgroundColor: showPreview ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                color: showPreview ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
              }}
            >
              {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium }}>
                {showPreview ? 'Hide Preview' : 'Preview'}
              </Text>
            </Box>
            <Box
              role="button"
              tabIndex={0}
              aria-label="Send feedback"
              aria-disabled={!messageContent.trim()}
              onClick={handleSend}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSend(); } }}
              style={{
                display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
                borderRadius: tokens.borderRadius.lg, border: 'none',
                backgroundColor: messageContent.trim() ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300],
                cursor: messageContent.trim() ? 'pointer' : 'not-allowed',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <Send size={14} color={tokens.colors.common.white} />
              <Text style={{
                fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.common.white,
              }}>
                Send
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left: Template Sidebar */}
          <Box style={{
            width: 280, flexShrink: 0,
            borderRight: `1px solid ${tokens.colors.neutral[100]}`,
            backgroundColor: tokens.colors.common.white,
            display: 'flex', flexDirection: 'column' as const, overflow: 'hidden',
          }}>
            {/* Decision Context Card */}
            <Box style={{
              padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
              borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
            }}>
              <Box style={{
                display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
                marginBottom: tokens.spacing[3],
              }}>
                <Target size={12} color={tokens.colors.neutral[400]} />
                <Text style={sectionHeaderStyle}>Decision Context</Text>
              </Box>

              {context.scoreHighlights.length > 0 && (
                <Box style={{ marginBottom: tokens.spacing[3] }}>
                  {context.scoreHighlights.map((h, i) => (
                    <Box key={i} style={{
                      ...animStyle(i),
                      display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginBottom: tokens.spacing[1],
                    }}>
                      <Star size={10} color={tokens.colors.warningScale[500]} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{h}</Text>
                    </Box>
                  ))}
                </Box>
              )}

              {context.keyEvidence.length > 0 && (
                <Box style={{ marginBottom: tokens.spacing[3] }}>
                  <Text style={{
                    fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1],
                  }}>
                    Evidence
                  </Text>
                  {context.keyEvidence.map((ev, i) => (
                    <Box key={i} style={{
                      ...animStyle(i),
                      display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[1],
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50],
                      marginBottom: tokens.spacing[1],
                    }}>
                      <Quote size={10} color={tokens.colors.neutral[400]} style={{ flexShrink: 0, marginTop: tokens.spacing[1] }} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{ev}</Text>
                    </Box>
                  ))}
                </Box>
              )}

              <Text style={{
                fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500],
                fontStyle: 'italic' as const,
              }}>
                {context.reasoning}
              </Text>
            </Box>

            {/* Templates Header */}
            <Box style={{
              display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
              padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
              borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
            }}>
              <FileText size={12} color={tokens.colors.neutral[400]} />
              <Text style={sectionHeaderStyle}>
                Templates ({templates.length})
              </Text>
            </Box>

            {/* Templates List */}
            <Box style={{ flex: 1, overflowY: 'auto' as const }}>
              {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => {
                const catConfig = categoryConfig[category as keyof typeof categoryConfig];
                const isExpanded = expandedCategory === category;

                return (
                  <Box key={category}>
                    <Box
                      role="button"
                      tabIndex={0}
                      aria-label={`${catConfig?.label ?? category} templates (${categoryTemplates.length})`}
                      aria-expanded={isExpanded}
                      onClick={() => setExpandedCategory(isExpanded ? null : category)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedCategory(isExpanded ? null : category); } }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
                        cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <Box style={{
                          padding: `0 ${tokens.spacing[2]}px`, borderRadius: badgeRadius,
                          backgroundColor: catConfig?.bgColor ?? tokens.colors.neutral[50],
                        }}>
                          <Text style={{
                            fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
                            color: catConfig?.color ?? tokens.colors.neutral[700],
                          }}>
                            {catConfig?.label ?? category}
                          </Text>
                        </Box>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                          ({categoryTemplates.length})
                        </Text>
                      </Box>
                      {isExpanded ? <ChevronDown size={12} color={tokens.colors.neutral[400]} /> : <ChevronRight size={12} color={tokens.colors.neutral[400]} />}
                    </Box>

                    {isExpanded && categoryTemplates.map((template, i) => {
                      const isSelected = template.id === selectedTemplateId;
                      const isHovered = template.id === hoveredTemplateId;
                      return (
                        <Box
                          key={template.id}
                          role="button"
                          tabIndex={0}
                          aria-label={`Apply template: ${template.name}`}
                          aria-selected={isSelected}
                          onClick={() => handleTemplateApply(template.id)}
                          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTemplateApply(template.id); } }}
                          onMouseEnter={() => setHoveredTemplateId(template.id)}
                          onMouseLeave={() => setHoveredTemplateId(null)}
                          style={{
                            ...animStyle(i),
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px ${tokens.spacing[2]}px ${tokens.spacing[7]}px`,
                            backgroundColor: isSelected ? tokens.colors.primaryScale[50] : isHovered ? tokens.colors.neutral[50] : 'transparent',
                            cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                            borderLeft: isSelected ? `3px solid ${tokens.colors.primaryScale[500]}` : '3px solid transparent',
                          }}
                        >
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text style={{
                              fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
                              color: isSelected ? tokens.colors.primaryScale[700] : tokens.colors.neutral[800],
                              whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis',
                            }}>
                              {template.name}
                            </Text>
                            {template.effectiveness !== undefined && (
                              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginTop: tokens.spacing[1] }}>
                                <Box style={{
                                  width: 60, height: 4, borderRadius: tokens.borderRadius.full,
                                  backgroundColor: tokens.colors.neutral[100], overflow: 'hidden' as const,
                                }}>
                                  <Box style={{
                                    width: `${template.effectiveness}%`, height: '100%',
                                    borderRadius: tokens.borderRadius.full,
                                    backgroundColor: template.effectiveness >= 70
                                      ? tokens.colors.successScale[500]
                                      : template.effectiveness >= 40
                                        ? tokens.colors.warningScale[500]
                                        : tokens.colors.errorScale[500],
                                    transition: `width ${tokens.motion.hover}`,
                                  }} />
                                </Box>
                                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                                  {template.effectiveness}%
                                </Text>
                              </Box>
                            )}
                          </Box>
                          {isSelected && <Check size={12} color={tokens.colors.primaryScale[500]} />}
                        </Box>
                      );
                    })}
                  </Box>
                );
              })}

              {templates.length === 0 && (
                <Box style={createEmptyStateStyle(tokens)}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                    No templates available
                  </Text>
                </Box>
              )}
            </Box>
          </Box>

          {/* Center: Editor */}
          <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden' }}>
            {/* Channel Tabs */}
            <Box role="tablist" aria-label="Communication channels" style={{
              display: 'flex',
              borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
              backgroundColor: tokens.colors.common.white,
            }}>
              {(['email', 'sms', 'whatsapp', 'linkedin'] as FeedbackChannel[]).map((ch, i) => {
                const config = channelConfig[ch];
                const isActive = channel === ch;
                return (
                  <Box
                    key={ch}
                    role="tab"
                    tabIndex={isActive ? 0 : -1}
                    aria-label={`${config.label} channel`}
                    aria-selected={isActive}
                    onClick={() => setChannel(ch)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setChannel(ch); } }}
                    style={{
                      ...animStyle(i),
                      display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      borderBottom: isActive ? `2px solid ${config.color}` : '2px solid transparent',
                      color: isActive ? config.color : tokens.colors.neutral[500],
                      cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    {channelIcons[ch]}
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                      color: 'inherit',
                    }}>
                      {config.label}
                    </Text>
                  </Box>
                );
              })}
            </Box>

            {/* Subject Line (email only) */}
            {currentChannelConfig.hasSubject && (
              <Box style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
                borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                backgroundColor: tokens.colors.common.white,
              }}>
                <input
                  type="text"
                  value={subject}
                  onChange={(e: any) => setSubject(e.target.value)}
                  placeholder="Subject line..."
                  aria-label="Email subject"
                  style={{
                    width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.lg,
                    border: `1px solid ${tokens.colors.neutral[200]}`,
                    fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900],
                    backgroundColor: tokens.colors.common.white, fontFamily: 'inherit', outline: 'none',
                    boxSizing: 'border-box' as const,
                  }}
                />
              </Box>
            )}

            {/* Tone Selector */}
            <Box style={{
              display: 'flex', gap: tokens.spacing[2],
              padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
              borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
              backgroundColor: tokens.colors.common.white, alignItems: 'center',
            }}>
              <Text style={{
                fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[500], marginRight: tokens.spacing[1],
              }}>
                Tone:
              </Text>
              {(['encouraging', 'neutral', 'professional'] as FeedbackTone[]).map((t, i) => {
                const config = toneConfig[t];
                const isActive = tone === t;
                return (
                  <Box
                    key={t}
                    role="button"
                    tabIndex={0}
                    aria-label={`Set tone to ${config.label}`}
                    aria-pressed={isActive}
                    onClick={() => setTone(t)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTone(t); } }}
                    style={{
                      ...animStyle(i),
                      display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-start',
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.lg,
                      border: `1px solid ${isActive ? config.borderColor : tokens.colors.neutral[200]}`,
                      backgroundColor: isActive ? config.bgColor : tokens.colors.common.white,
                      cursor: 'pointer', transition: `all ${tokens.motion.hover}`, flex: 1,
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                      {isActive && <Check size={10} color={config.color} />}
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                        color: isActive ? config.color : tokens.colors.neutral[700],
                      }}>
                        {config.label}
                      </Text>
                    </Box>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400],
                      marginTop: tokens.spacing[1], textAlign: 'left' as const,
                    }}>
                      {config.description}
                    </Text>
                  </Box>
                );
              })}
            </Box>

            {/* Variable Chips + AI Generate */}
            <Box style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
              borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
              backgroundColor: tokens.colors.common.white,
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], flexWrap: 'wrap' as const }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginRight: tokens.spacing[1] }}>
                  Insert:
                </Text>
                {FEEDBACK_VARIABLES.map((v, i) => (
                  <Box
                    key={v.key}
                    role="button"
                    tabIndex={0}
                    aria-label={`Insert variable ${v.label}`}
                    onClick={() => handleInsertVariable(v.key)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleInsertVariable(v.key); } }}
                    style={{
                      ...animStyle(i),
                      display: 'inline-flex', alignItems: 'center',
                      padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                      borderRadius: badgeRadius,
                      border: `1px solid ${tokens.colors.primaryScale[200]}`,
                      backgroundColor: tokens.colors.primaryScale[50],
                      cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <Text style={{
                      fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.primaryScale[600], fontFamily: 'monospace',
                    }}>
                      {v.label}
                    </Text>
                  </Box>
                ))}
              </Box>

              <Box
                role="button"
                tabIndex={0}
                aria-label={isGenerating ? 'Generating feedback...' : 'Generate feedback with AI'}
                aria-disabled={isGenerating}
                onClick={isGenerating ? undefined : handleGenerate}
                onKeyDown={(e: React.KeyboardEvent) => { if (!isGenerating && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); handleGenerate(); } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.lg,
                  border: `1px solid ${tokens.colors.secondaryScale?.[300] ?? tokens.colors.primaryScale[300]}`,
                  backgroundColor: tokens.colors.secondaryScale?.[50] ?? tokens.colors.primaryScale[50],
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  opacity: isGenerating ? 0.7 : 1, transition: `all ${tokens.motion.hover}`,
                }}
              >
                {isGenerating ? (
                  <Loader2 size={14} color={tokens.colors.secondaryScale?.[700] ?? tokens.colors.primaryScale[700]} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Sparkles size={14} color={tokens.colors.secondaryScale?.[700] ?? tokens.colors.primaryScale[700]} />
                )}
                <Text style={{
                  fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.secondaryScale?.[700] ?? tokens.colors.primaryScale[700],
                }}>
                  {isGenerating ? 'Generating...' : 'Generate Feedback'}
                </Text>
              </Box>
            </Box>

            {/* Textarea */}
            <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden' }}>
              <textarea
                value={messageContent}
                onChange={(e: any) => setMessageContent(e.target.value)}
                placeholder="Compose your feedback message here..."
                aria-label="Feedback message"
                style={{
                  flex: 1, padding: `${tokens.spacing[5]}px`,
                  border: 'none', fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white,
                  fontFamily: 'inherit', resize: 'none' as const, outline: 'none',
                  lineHeight: tokens.typography.lineHeight.relaxed,
                  boxSizing: 'border-box' as const,
                }}
              />

              {currentChannelConfig.maxChars > 0 && (
                <Box style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
                  borderTop: `1px solid ${tokens.colors.neutral[100]}`,
                  backgroundColor: tokens.colors.common.white,
                }}>
                  <Box style={{
                    flex: 1, height: 4, borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.neutral[100], marginRight: tokens.spacing[3],
                    overflow: 'hidden' as const,
                  }}>
                    <Box style={{
                      width: `${Math.min(100, (charCount / currentChannelConfig.maxChars) * 100)}%`,
                      height: '100%', borderRadius: tokens.borderRadius.full,
                      backgroundColor: isOverLimit
                        ? tokens.colors.errorScale[500]
                        : charCount > currentChannelConfig.maxChars * 0.8
                          ? tokens.colors.warningScale[500]
                          : tokens.colors.successScale[500],
                      transition: `all ${tokens.motion.hover}`,
                    }} />
                  </Box>
                  <Text style={{
                    fontSize: tokens.typography.fontSize.xs, whiteSpace: 'nowrap' as const,
                    color: isOverLimit ? tokens.colors.errorScale[600] : tokens.colors.neutral[500],
                    fontWeight: isOverLimit ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                  }}>
                    {charCount}/{currentChannelConfig.maxChars}
                  </Text>
                </Box>
              )}
            </Box>
          </Box>

          {/* Right: Preview Panel */}
          {showPreview && (
            <Box style={{
              width: 360, flexShrink: 0,
              borderLeft: `1px solid ${tokens.colors.neutral[100]}`,
              backgroundColor: tokens.colors.neutral[50],
              display: 'flex', flexDirection: 'column' as const, overflow: 'hidden',
            }}>
              <Box style={{
                display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
                borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                backgroundColor: tokens.colors.common.white,
              }}>
                <Eye size={14} color={tokens.colors.neutral[500]} />
                <Text style={{
                  fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[700],
                }}>
                  Preview ({channelConfig[channel].label})
                </Text>
              </Box>

              <Box style={{ flex: 1, overflowY: 'auto' as const, padding: `${tokens.spacing[5]}px` }}>
                <Box style={{
                  ...createCardStyle(tokens, { elevation: 'sm', padding: 0, glass: isGlass }),
                  borderRadius: tokens.borderRadius.lg,
                  padding: `${tokens.spacing[5]}px`,
                }}>
                  {/* Channel header */}
                  <Box style={{
                    display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                    marginBottom: tokens.spacing[4], paddingBottom: tokens.spacing[4],
                    borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                  }}>
                    <Box style={createIconContainerStyle(tokens, { size: 32, color: currentChannelConfig.bgColor })}>
                      {channelIcons[channel]}
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], flex: 1 }}>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                      }}>
                        {channel === 'email' ? 'Email Message' : channelConfig[channel].label + ' Message'}
                      </Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        To: {recipientPreview ?? context.candidateName}
                      </Text>
                    </Box>
                  </Box>

                  {/* Subject (email) */}
                  {channel === 'email' && subject && (
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900], marginBottom: tokens.spacing[3],
                    }}>
                      {substituteVariables(subject, context)}
                    </Text>
                  )}

                  {/* Message body */}
                  {previewContent ? (
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700],
                      lineHeight: tokens.typography.lineHeight.relaxed,
                      whiteSpace: 'pre-wrap' as const, wordBreak: 'break-word' as const,
                    }}>
                      {previewContent}
                    </Text>
                  ) : (
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400],
                      fontStyle: 'italic' as const,
                    }}>
                      Message preview will appear here...
                    </Text>
                  )}
                </Box>

                {/* Template hover preview */}
                {hoveredTemplate && hoveredTemplate.id !== selectedTemplateId && (
                  <Box style={{
                    ...createCardStyle(tokens, { elevation: 'sm', padding: 0, glass: isGlass }),
                    marginTop: tokens.spacing[3], padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    borderRadius: tokens.borderRadius.lg,
                    borderLeft: `3px solid ${tokens.colors.infoScale[400]}`,
                  }}>
                    <Box style={{
                      display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginBottom: tokens.spacing[2],
                    }}>
                      <BookOpen size={12} color={tokens.colors.infoScale[700]} />
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.infoScale[700],
                      }}>
                        Template Preview: {hoveredTemplate.name}
                      </Text>
                    </Box>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600],
                      lineHeight: tokens.typography.lineHeight.relaxed,
                      whiteSpace: 'pre-wrap' as const, maxHeight: 120, overflow: 'hidden' as const,
                    }}>
                      {substituteVariables(hoveredTemplate.content, context)}
                    </Text>
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
