'use client';

/**
 * BhCandidateOutreach - Composer Preset
 * Full multi-channel outreach composer with template library, A/B testing, scheduling, and personalization preview
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type { BhCandidateOutreachProps, OutreachChannel, OutreachTemplate, OutreachRecipient, ABVariant, ScheduleConfig } from '../../core';
import {
  getChannelColors,
  getMetricColors,
  getRecipientInitials,
  resolveVariables,
  extractVariables,
  getChannelLabel,
  getSmsCharacterLimit,
  getLinkedInCharacterLimit,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Mail,
  MessageSquare,
  Smartphone,
  Linkedin,
  X,
  Plus,
  ChevronDown,
  ChevronRight,
  Send,
  Clock,
  Users,
  Eye,
  BarChart3,
  Sparkles,
  Variable,
  Calendar,
  Zap,
  SplitSquareHorizontal,
  CheckCircle2,
  AlertCircle,
  Search,
  Star,
  FileText,
  ChevronUp,
} from 'lucide-react';

function getChannelIcon(channel: OutreachChannel, size: number) {
  switch (channel) {
    case 'email': return <Mail size={size} />;
    case 'sms': return <Smartphone size={size} />;
    case 'whatsapp': return <MessageSquare size={size} />;
    case 'linkedin': return <Linkedin size={size} />;
  }
}

export const ComposerBhCandidateOutreach = createPreset<BhCandidateOutreachProps>({
  name: 'BhCandidateOutreach.Composer',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhCandidateOutreachProps>) => {
    const { Box, Stack } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const channelColors = getChannelColors(tokens);
    const metricColors = getMetricColors(tokens);

    const {
      channel: controlledChannel,
      onChannelChange,
      recipients: controlledRecipients = [],
      onRecipientsChange,
      templates = [],
      selectedTemplate: controlledSelectedTemplate,
      onTemplateSelect,
      messageContent: controlledMessageContent,
      onMessageChange,
      subject: controlledSubject,
      onSubjectChange,
      scheduleConfig: controlledScheduleConfig,
      onScheduleChange,
      campaignMetrics,
      variants: controlledVariants,
      onVariantsChange,
      previewRecipient: controlledPreviewRecipient,
      onPreviewChange,
      onSend,
      loading,
      className,
      style,
    } = props;

    const [internalChannel, setInternalChannel] = useState<OutreachChannel>(controlledChannel ?? 'email');
    const [internalSelectedTemplate, setInternalSelectedTemplate] = useState<OutreachTemplate | null>(controlledSelectedTemplate ?? null);
    const [internalMessageContent, setInternalMessageContent] = useState(controlledMessageContent ?? '');
    const [internalSubject, setInternalSubject] = useState(controlledSubject ?? '');
    const [internalRecipients, setInternalRecipients] = useState<OutreachRecipient[]>(controlledRecipients);
    const [internalScheduleConfig, setInternalScheduleConfig] = useState<ScheduleConfig>(controlledScheduleConfig ?? { sendNow: true });
    const [internalVariants, setInternalVariants] = useState<ABVariant[]>(controlledVariants ?? []);
    const [internalPreviewRecipient, setInternalPreviewRecipient] = useState<OutreachRecipient | null>(controlledPreviewRecipient ?? null);

    const channel = controlledChannel ?? internalChannel;
    const selectedTemplate = controlledSelectedTemplate !== undefined ? controlledSelectedTemplate : internalSelectedTemplate;
    const messageContent = controlledMessageContent ?? internalMessageContent;
    const subject = controlledSubject ?? internalSubject;
    const recipients = controlledRecipients.length > 0 ? controlledRecipients : internalRecipients;
    const scheduleConfig = controlledScheduleConfig ?? internalScheduleConfig;
    const variants = controlledVariants ?? internalVariants;
    const previewRecipient = controlledPreviewRecipient !== undefined ? controlledPreviewRecipient : internalPreviewRecipient;

    const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
    const [templateSearch, setTemplateSearch] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [hoveredTemplate, setHoveredTemplate] = useState<OutreachTemplate | null>(null);
    const [showAbPanel, setShowAbPanel] = useState(false);
    const [showSchedulePanel, setShowSchedulePanel] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [activePanel, setActivePanel] = useState<'compose' | 'preview'>('compose');

    const handleChannelChange = (ch: OutreachChannel) => {
      setInternalChannel(ch);
      onChannelChange?.(ch);
    };

    const handleTemplateSelect = (template: OutreachTemplate) => {
      setInternalSelectedTemplate(template);
      setInternalMessageContent(template.content);
      onTemplateSelect?.(template);
      onMessageChange?.(template.content);
      setShowTemplateLibrary(false);
    };

    const handleMessageChange = (content: string) => {
      setInternalMessageContent(content);
      onMessageChange?.(content);
    };

    const handleSubjectChange = (val: string) => {
      setInternalSubject(val);
      onSubjectChange?.(val);
    };

    const handleRemoveRecipient = (id: string) => {
      const updated = recipients.filter((r) => r.id !== id);
      setInternalRecipients(updated);
      onRecipientsChange?.(updated);
    };

    const handleScheduleChange = (config: ScheduleConfig) => {
      setInternalScheduleConfig(config);
      onScheduleChange?.(config);
    };

    const handleVariantsChange = (updatedVariants: ABVariant[]) => {
      setInternalVariants(updatedVariants);
      onVariantsChange?.(updatedVariants);
    };

    const handlePreviewChange = (recipient: OutreachRecipient | null) => {
      setInternalPreviewRecipient(recipient);
      onPreviewChange?.(recipient);
    };

    const handleSend = () => {
      setShowConfirmModal(false);
      onSend?.();
    };

    const insertVariable = (variable: string) => {
      const insertion = `{${variable}}`;
      handleMessageChange(messageContent + insertion);
    };

    const templateCategories = useMemo(() => {
      const cats: Record<string, OutreachTemplate[]> = {};
      const filtered = templates.filter((t) => {
        if (!templateSearch) return true;
        const q = templateSearch.toLowerCase();
        return t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.content.toLowerCase().includes(q);
      });
      filtered.forEach((t) => {
        if (!cats[t.category]) cats[t.category] = [];
        cats[t.category].push(t);
      });
      return cats;
    }, [templates, templateSearch]);

    const detectedVariables = useMemo(() => extractVariables(messageContent), [messageContent]);

    const characterLimit = channel === 'sms' ? getSmsCharacterLimit() : channel === 'linkedin' ? getLinkedInCharacterLimit() : null;
    const isOverLimit = characterLimit !== null && messageContent.length > characterLimit;

    const channels: OutreachChannel[] = ['email', 'sms', 'whatsapp', 'linkedin'];
    const commonVariables = ['name', 'job_title', 'company', 'first_name', 'role'];

    const glassStyle = tokens.surface.useGlass && tokens.glass
      ? { backdropFilter: tokens.glass.blur, WebkitBackdropFilter: tokens.glass.blur, backgroundColor: tokens.glass.bg }
      : {};

    const surfaceStyle = useMemo(() => createSurfaceStyle(tokens, { elevation: 'md', glass: tokens.surface.useGlass }), [tokens, engine]);

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.common.white, ...surfaceStyle, ...style }}>
        {/* Header bar */}
        <Box style={{
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          ...glassStyle,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Send size={18} style={{ color: tokens.colors.primaryScale[600] }} />
            <h2 style={{
              margin: 0,
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
            }}>
              Outreach Composer
            </h2>
            {campaignMetrics && (
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                marginLeft: tokens.spacing[2],
              }}>
                {(['sent', 'opened', 'replied', 'bounced'] as const).map((key) => (
                  <Box key={key} style={{
                    ...createBadgeStyle(tokens, key === 'sent' ? 'primary' : key === 'opened' ? 'info' : key === 'replied' ? 'success' : 'error'),
                    gap: tokens.spacing[1],
                  }}>
                    <span style={{ fontWeight: tokens.typography.fontWeight.semibold }}>{campaignMetrics[key]}</span>
                    <span>{key}</span>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <button
              onClick={() => setShowSchedulePanel(!showSchedulePanel)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[700],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                fontFamily: 'inherit',
                ...createHoverStyle(tokens),
              }}
            >
              <Clock size={14} />
              Schedule
            </button>
            <button
              onClick={() => setShowAbPanel(!showAbPanel)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[700],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                fontFamily: 'inherit',
                ...createHoverStyle(tokens),
              }}
            >
              <SplitSquareHorizontal size={14} />
              A/B Test
            </button>
            <button
              onClick={() => {
                if (recipients.length > 0 && messageContent.trim()) {
                  setShowConfirmModal(true);
                }
              }}
              disabled={recipients.length === 0 || !messageContent.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: 'none',
                backgroundColor: recipients.length > 0 && messageContent.trim() ? tokens.colors.primaryScale[500] : tokens.colors.neutral[200],
                color: recipients.length > 0 && messageContent.trim() ? tokens.colors.common.white : tokens.colors.neutral[500],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                cursor: recipients.length > 0 && messageContent.trim() ? 'pointer' : 'default',
                fontFamily: 'inherit',
                ...createHoverStyle(tokens),
              }}
            >
              <Send size={14} />
              {scheduleConfig.sendNow ? 'Send Now' : 'Schedule'}
            </button>
          </Box>
        </Box>

        <Box style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left panel: Template library (collapsible) */}
          {showTemplateLibrary && (
            <Box style={{
              width: 280,
              borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
              ...glassStyle,
            }}>
              <Box style={{
                padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <Box style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                }}>
                  <FileText size={14} />
                  Templates
                </Box>
                <button
                  onClick={() => setShowTemplateLibrary(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    color: tokens.colors.neutral[500],
                    padding: tokens.spacing[1],
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              </Box>

              {/* Template search */}
              <Box style={{ padding: tokens.spacing[3] }}>
                <Box style={{ position: 'relative' }}>
                  <Search size={14} style={{
                    position: 'absolute',
                    left: tokens.spacing[2],
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: tokens.colors.neutral[400],
                  }} />
                  <input
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    placeholder="Search templates..."
                    style={{
                      width: '100%',
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px ${tokens.spacing[1]}px ${tokens.spacing[7]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      fontSize: tokens.typography.fontSize.sm,
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box' as const,
                      color: tokens.colors.neutral[800],
                      backgroundColor: tokens.colors.common.white,
                    }}
                  
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                      e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                    }}
                  />
                </Box>
              </Box>

              {/* Categorized templates */}
              <Box style={{ flex: 1, overflow: 'auto' }}>
                {Object.entries(templateCategories).map(([category, catTemplates]) => {
                  const isExpanded = expandedCategories[category] !== false;
                  return (
                    <Box key={category}>
                      <Box
                        onClick={() => setExpandedCategories((prev) => ({ ...prev, [category]: !isExpanded }))}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[500],
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.05em',
                        }}
                      >
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        {category} ({catTemplates.length})
                      </Box>
                      {isExpanded && catTemplates.map((template) => (
                        <Box
                          key={template.id}
                          onClick={() => handleTemplateSelect(template)}
                          onMouseEnter={() => setHoveredTemplate(template)}
                          onMouseLeave={() => setHoveredTemplate(null)}
                          style={{
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[6]}px`,
                            cursor: 'pointer',
                            backgroundColor: selectedTemplate?.id === template.id ? tokens.colors.primaryScale[50] : hoveredTemplate?.id === template.id ? tokens.colors.neutral[50] : 'transparent',
                            transform: hoveredTemplate ? tokens.motion.transform : 'none',
                            borderLeft: selectedTemplate?.id === template.id ? `3px solid ${tokens.colors.primaryScale[500]}` : '3px solid transparent',
                            ...createHoverStyle(tokens),
                          }}
                        >
                          <Box style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.neutral[800],
                            marginBottom: tokens.spacing[1],
                          }}>
                            {template.name}
                          </Box>
                          <Box style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {template.content.substring(0, 60)}...
                          </Box>
                          {template.effectiveness !== undefined && (
                            <Box style={{
                              marginTop: tokens.spacing[1],
                              display: 'flex',
                              alignItems: 'center',
                              gap: tokens.spacing[1],
                            }}>
                              <Star size={10} style={{ color: tokens.colors.warningScale[500] }} />
                              <Box style={{
                                flex: 1,
                                height: 4,
                                backgroundColor: tokens.colors.neutral[100],
                                borderRadius: tokens.borderRadius.full,
                                overflow: 'hidden',
                              }}>
                                <Box style={{
                                  width: `${template.effectiveness}%`,
                                  height: '100%',
                                  backgroundColor: template.effectiveness >= 70 ? tokens.colors.successScale[500] : template.effectiveness >= 40 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500],
                                  borderRadius: tokens.borderRadius.full,
                                }} />
                              </Box>
                              <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], minWidth: 28 }}>
                                {template.effectiveness}%
                              </Box>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  );
                })}
                {Object.keys(templateCategories).length === 0 && (
                  <Box style={{ padding: tokens.spacing[4], textAlign: 'center' as const, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                    {templateSearch ? 'No templates match your search' : 'No templates available'}
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Center panel: Compose area */}
          <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Recipients panel */}
            <Box style={{
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}>
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                marginBottom: tokens.spacing[2],
              }}>
                <Users size={14} style={{ color: tokens.colors.neutral[500] }} />
                <Box style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[700],
                }}>
                  Recipients ({recipients.length})
                </Box>
              </Box>
              <Box style={{
                display: 'flex',
                flexWrap: 'wrap' as const,
                gap: tokens.spacing[2],
                alignItems: 'center',
              }}>
                {recipients.map((recipient) => (
                  <Box key={recipient.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.neutral[100],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[700],
                  }}>
                    {recipient.avatar ? (
                      <img src={recipient.avatar} alt="" style={{
                        width: tokens.spacing[5],
                        height: tokens.spacing[5],
                        borderRadius: tokens.borderRadius.full,
                        objectFit: 'cover' as const,
                      }} />
                    ) : (
                      <Box style={{
                        width: tokens.spacing[5],
                        height: tokens.spacing[5],
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.primaryScale[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.primaryScale[700],
                        fontWeight: tokens.typography.fontWeight.semibold,
                      }}>
                        {getRecipientInitials(recipient.name)}
                      </Box>
                    )}
                    <span>{recipient.name}</span>
                    <button
                      onClick={() => handleRemoveRecipient(recipient.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        color: tokens.colors.neutral[400],
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        lineHeight: 1,
                      }}
                    >
                      <X size={12} />
                    </button>
                  </Box>
                ))}
                <button
                  onClick={() => onRecipientsChange?.(recipients)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    border: `${tokens.surface.borderWidth} dashed ${tokens.colors.neutral[300]}`,
                    backgroundColor: 'transparent',
                    color: tokens.colors.neutral[500],
                    fontSize: tokens.typography.fontSize.sm,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    fontFamily: 'inherit',
                  }}
                >
                  <Plus size={12} />
                  Add more
                </button>
              </Box>
            </Box>

            {/* Channel tabs */}
            <Box style={{
              display: 'flex',
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              padding: `0 ${tokens.spacing[4]}px`,
            }}>
              {channels.map((ch) => {
                const isActive = ch === channel;
                const colors = channelColors[ch];
                return (
                  <button
                    key={ch}
                    onClick={() => handleChannelChange(ch)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      border: 'none',
                      borderBottom: isActive ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${colors.color}` : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} transparent`,
                      backgroundColor: 'transparent',
                      color: isActive ? colors.color : tokens.colors.neutral[500],
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      ...createHoverStyle(tokens),
                    }}
                  >
                    {getChannelIcon(ch, 14)}
                    {getChannelLabel(ch)}
                  </button>
                );
              })}
              <Box style={{ flex: 1 }} />
              <button
                onClick={() => setShowTemplateLibrary(!showTemplateLibrary)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: tokens.colors.primaryScale[600],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  fontFamily: 'inherit',
                }}
              >
                <FileText size={14} />
                Templates
              </button>
            </Box>

            {/* Compose / Preview tabs */}
            <Box style={{
              display: 'flex',
              padding: `0 ${tokens.spacing[4]}px`,
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
              backgroundColor: tokens.colors.neutral[50],
            }}>
              {(['compose', 'preview'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActivePanel(tab)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    border: 'none',
                    borderBottom: activePanel === tab ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[500]}` : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} transparent`,
                    backgroundColor: 'transparent',
                    color: activePanel === tab ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: activePanel === tab ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    fontFamily: 'inherit',
                    textTransform: 'capitalize' as const,
                  }}
                >
                  {tab === 'compose' ? <Sparkles size={14} /> : <Eye size={14} />}
                  {tab}
                </button>
              ))}
            </Box>

            {/* Content area */}
            <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[4] }}>
              {loading ? (
                <Box style={{ textAlign: 'center' as const, padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>Loading...</Box>
              ) : activePanel === 'compose' ? (
                <Stack direction="vertical" spacing="md">
                  {/* Subject line (email only) */}
                  {channel === 'email' && (
                    <Box>
                      <label style={{
                        display: 'block',
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[700],
                        marginBottom: tokens.spacing[1],
                      }}>
                        Subject
                      </label>
                      <input
                        value={subject}
                        onChange={(e) => handleSubjectChange(e.target.value)}
                        placeholder="Enter email subject..."
                        style={{
                          width: '100%',
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                          borderRadius: tokens.borderRadius.md,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                          fontSize: tokens.typography.fontSize.sm,
                          fontFamily: 'inherit',
                          outline: 'none',
                          boxSizing: 'border-box' as const,
                          color: tokens.colors.neutral[800],
                          backgroundColor: tokens.colors.common.white,
                        }}
                      
                        onFocus={(e) => {
                          e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                          e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                        }}
                      />
                    </Box>
                  )}

                  {/* Variable insertion toolbar */}
                  <Box>
                    <Box style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      marginBottom: tokens.spacing[2],
                    }}>
                      <Variable size={14} style={{ color: tokens.colors.neutral[500] }} />
                      <Box style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[500],
                      }}>
                        Insert variable:
                      </Box>
                      {commonVariables.map((variable) => (
                        <button
                          key={variable}
                          onClick={() => insertVariable(variable)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.sm,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                            backgroundColor: tokens.colors.primaryScale[50],
                            color: tokens.colors.primaryScale[700],
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            gap: tokens.spacing[1],
                            ...createHoverStyle(tokens),
                          }}
                        >
                          {`{${variable}}`}
                        </button>
                      ))}
                    </Box>
                  </Box>

                  {/* Message composer textarea */}
                  <Box>
                    <textarea
                      value={messageContent}
                      onChange={(e) => handleMessageChange(e.target.value)}
                      placeholder={`Write your ${getChannelLabel(channel)} message...`}
                      style={{
                        width: '100%',
                        minHeight: 200,
                        padding: `${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isOverLimit ? tokens.colors.errorScale[300] : tokens.colors.neutral[200]}`,
                        fontSize: tokens.typography.fontSize.sm,
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxSizing: 'border-box' as const,
                        color: tokens.colors.neutral[800],
                        backgroundColor: tokens.colors.common.white,
                        resize: 'vertical' as const,
                        lineHeight: tokens.typography.lineHeight.relaxed,
                      }}
                    
                      onFocus={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                        e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                      }}
                    />
                    {/* Character count for SMS/LinkedIn */}
                    {characterLimit !== null && (
                      <Box style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginTop: tokens.spacing[1],
                      }}>
                        <Box style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: isOverLimit ? tokens.colors.errorScale[600] : tokens.colors.neutral[500],
                          fontWeight: isOverLimit ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                        }}>
                          {messageContent.length}/{characterLimit}
                        </Box>
                      </Box>
                    )}
                  </Box>

                  {/* Detected variables */}
                  {detectedVariables.length > 0 && (
                    <Box style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.infoScale[50],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.infoScale[200]}`,
                    }}>
                      <Box style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.infoScale[700],
                        marginBottom: tokens.spacing[1],
                      }}>
                        Detected variables ({detectedVariables.length})
                      </Box>
                      <Box style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' as const }}>
                        {detectedVariables.map((v) => (
                          <Box key={v} style={{
                            padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.sm,
                            backgroundColor: tokens.colors.infoScale[100],
                            color: tokens.colors.infoScale[700],
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                          }}>
                            {`{${v}}`}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Stack>
              ) : (
                /* Preview panel */
                <Box>
                  <Box style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    marginBottom: tokens.spacing[3],
                  }}>
                    <Eye size={14} style={{ color: tokens.colors.neutral[500] }} />
                    <Box style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[700],
                    }}>
                      Preview as:
                    </Box>
                    <Box style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' as const }}>
                      {recipients.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => handlePreviewChange(r)}
                          style={{
                            padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.full,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${previewRecipient?.id === r.id ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                            backgroundColor: previewRecipient?.id === r.id ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                            color: previewRecipient?.id === r.id ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                            fontSize: tokens.typography.fontSize.xs,
                            cursor: 'pointer',
                            transition: `all ${tokens.motion.hover}`,
                            fontFamily: 'inherit',
                            fontWeight: tokens.typography.fontWeight.medium,
                          }}
                        >
                          {r.name}
                        </button>
                      ))}
                    </Box>
                  </Box>

                  {/* Rendered preview */}
                  <Box style={{
                    ...createCardStyle(tokens, { glass: isGlass, elevation: 'sm' }),
                    padding: tokens.spacing[4],
                  }}>
                    {channel === 'email' && subject && (
                      <Box style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                        marginBottom: tokens.spacing[3],
                        paddingBottom: tokens.spacing[2],
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      }}>
                        {previewRecipient
                          ? resolveVariables(subject, {
                              name: previewRecipient.name,
                              first_name: previewRecipient.name.split(' ')[0] || previewRecipient.name,
                              job_title: 'Software Engineer',
                              company: 'Acme Inc',
                              role: 'Developer',
                            })
                          : subject}
                      </Box>
                    )}
                    <Box style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[700],
                      lineHeight: tokens.typography.lineHeight.relaxed,
                      whiteSpace: 'pre-wrap' as const,
                    }}>
                      {previewRecipient
                        ? resolveVariables(messageContent, {
                            name: previewRecipient.name,
                            first_name: previewRecipient.name.split(' ')[0] || previewRecipient.name,
                            job_title: 'Software Engineer',
                            company: 'Acme Inc',
                            role: 'Developer',
                          })
                        : messageContent || 'Write a message to see the preview here...'}
                    </Box>
                  </Box>

                  {recipients.length === 0 && (
                    <Box style={{
                      textAlign: 'center' as const,
                      padding: tokens.spacing[6],
                      color: tokens.colors.neutral[400],
                      fontSize: tokens.typography.fontSize.sm,
                    }}>
                      Add recipients to preview personalized messages
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>

          {/* Right panel: Schedule + A/B test */}
          {(showSchedulePanel || showAbPanel) && (
            <Box style={{
              width: 300,
              borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
              overflow: 'auto',
              ...glassStyle,
            }}>
              {/* Schedule panel */}
              {showSchedulePanel && (
                <Box style={{
                  padding: tokens.spacing[4],
                  borderBottom: showAbPanel ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` : 'none',
                }}>
                  <Box style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    marginBottom: tokens.spacing[3],
                  }}>
                    <Calendar size={14} style={{ color: tokens.colors.primaryScale[600] }} />
                    <Box style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}>
                      Schedule
                    </Box>
                  </Box>

                  {/* Send now toggle */}
                  <Box style={{ marginBottom: tokens.spacing[3] }}>
                    <Box style={{
                      display: 'flex',
                      gap: tokens.spacing[2],
                    }}>
                      {(['now', 'later'] as const).map((opt) => {
                        const isActive = opt === 'now' ? scheduleConfig.sendNow : !scheduleConfig.sendNow;
                        return (
                          <button
                            key={opt}
                            onClick={() => handleScheduleChange({ ...scheduleConfig, sendNow: opt === 'now' })}
                            style={{
                              flex: 1,
                              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                              borderRadius: tokens.borderRadius.md,
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isActive ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                              backgroundColor: isActive ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                              color: isActive ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                              cursor: 'pointer',
                              transition: `all ${tokens.motion.hover}`,
                              fontFamily: 'inherit',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: tokens.spacing[1],
                            }}
                          >
                            {opt === 'now' ? <Zap size={12} /> : <Clock size={12} />}
                            {opt === 'now' ? 'Send Now' : 'Schedule'}
                          </button>
                        );
                      })}
                    </Box>
                  </Box>

                  {/* Schedule date */}
                  {!scheduleConfig.sendNow && (
                    <Box style={{ marginBottom: tokens.spacing[3] }}>
                      <label style={{
                        display: 'block',
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[600],
                        marginBottom: tokens.spacing[1],
                      }}>
                        Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduleConfig.scheduledDate ?? ''}
                        onChange={(e) => handleScheduleChange({ ...scheduleConfig, scheduledDate: e.target.value })}
                        style={{
                          width: '100%',
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.md,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                          fontSize: tokens.typography.fontSize.sm,
                          fontFamily: 'inherit',
                          outline: 'none',
                          boxSizing: 'border-box' as const,
                          color: tokens.colors.neutral[800],
                          backgroundColor: tokens.colors.common.white,
                        }}
                      
                        onFocus={(e) => {
                          e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                          e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                        }}
                      />
                    </Box>
                  )}

                  {/* Batch settings */}
                  <Box style={{ marginBottom: tokens.spacing[2] }}>
                    <label style={{
                      display: 'block',
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[600],
                      marginBottom: tokens.spacing[1],
                    }}>
                      Batch size
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={scheduleConfig.batchSize ?? 50}
                      onChange={(e) => handleScheduleChange({ ...scheduleConfig, batchSize: Number(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        fontSize: tokens.typography.fontSize.sm,
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxSizing: 'border-box' as const,
                        color: tokens.colors.neutral[800],
                        backgroundColor: tokens.colors.common.white,
                      }}
                    
                      onFocus={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                        e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                      }}
                    />
                  </Box>

                  <Box>
                    <label style={{
                      display: 'block',
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[600],
                      marginBottom: tokens.spacing[1],
                    }}>
                      Rate limit (per hour)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={scheduleConfig.rateLimit ?? 100}
                      onChange={(e) => handleScheduleChange({ ...scheduleConfig, rateLimit: Number(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        fontSize: tokens.typography.fontSize.sm,
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxSizing: 'border-box' as const,
                        color: tokens.colors.neutral[800],
                        backgroundColor: tokens.colors.common.white,
                      }}
                    
                      onFocus={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                        e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                      }}
                    />
                  </Box>
                </Box>
              )}

              {/* A/B Testing panel */}
              {showAbPanel && (
                <Box style={{ padding: tokens.spacing[4] }}>
                  <Box style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: tokens.spacing[3],
                  }}>
                    <Box style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                    }}>
                      <SplitSquareHorizontal size={14} style={{ color: tokens.colors.primaryScale[600] }} />
                      <Box style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                      }}>
                        A/B Testing
                      </Box>
                    </Box>
                    <button
                      onClick={() => {
                        const newVariant: ABVariant = {
                          id: `variant-${Date.now()}`,
                          name: `Variant ${String.fromCharCode(65 + variants.length)}`,
                          content: '',
                          splitPercent: Math.floor(100 / (variants.length + 1)),
                        };
                        handleVariantsChange([...variants, newVariant]);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                        padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `${tokens.surface.borderWidth} dashed ${tokens.colors.neutral[300]}`,
                        backgroundColor: 'transparent',
                        color: tokens.colors.neutral[600],
                        fontSize: tokens.typography.fontSize.xs,
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                        fontFamily: 'inherit',
                      }}
                    >
                      <Plus size={12} />
                      Add
                    </button>
                  </Box>

                  <Stack direction="vertical" spacing="sm">
                    {variants.map((variant, idx) => (
                      <Box key={variant.id} style={{
                        ...createCardStyle(tokens, { glass: isGlass, elevation: 'sm' }),
                        padding: tokens.spacing[3],
                      }}>
                        <Box style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: tokens.spacing[2],
                        }}>
                          <Box style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[800],
                          }}>
                            {variant.name}
                          </Box>
                          <button
                            onClick={() => {
                              const updated = variants.filter((v) => v.id !== variant.id);
                              handleVariantsChange(updated);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              transition: `all ${tokens.motion.hover}`,
                              color: tokens.colors.neutral[400],
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <X size={12} />
                          </button>
                        </Box>

                        {/* Split percentage slider */}
                        <Box style={{ marginBottom: tokens.spacing[2] }}>
                          <Box style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: tokens.spacing[1],
                          }}>
                            <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                              Split
                            </Box>
                            <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[600] }}>
                              {variant.splitPercent}%
                            </Box>
                          </Box>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={variant.splitPercent}
                            onChange={(e) => {
                              const updated = variants.map((v) =>
                                v.id === variant.id ? { ...v, splitPercent: Number(e.target.value) } : v,
                              );
                              handleVariantsChange(updated);
                            }}
                            style={{ width: '100%', accentColor: tokens.colors.primaryScale[500] }}
                          />
                        </Box>

                        {/* Variant content */}
                        <textarea
                          value={variant.content}
                          onChange={(e) => {
                            const updated = variants.map((v) =>
                              v.id === variant.id ? { ...v, content: e.target.value } : v,
                            );
                            handleVariantsChange(updated);
                          }}
                          placeholder="Variant message content..."
                          style={{
                            width: '100%',
                            minHeight: 60,
                            padding: `${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.md,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                            fontSize: tokens.typography.fontSize.xs,
                            fontFamily: 'inherit',
                            outline: 'none',
                            boxSizing: 'border-box' as const,
                            color: tokens.colors.neutral[800],
                            backgroundColor: tokens.colors.common.white,
                            resize: 'vertical' as const,
                          }}
                        
                          onFocus={(e) => {
                            e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                            e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                          }}
                        />

                        {/* Variant metrics */}
                        {variant.metrics && (
                          <Box style={{
                            display: 'flex',
                            gap: tokens.spacing[2],
                            marginTop: tokens.spacing[2],
                            flexWrap: 'wrap' as const,
                          }}>
                            {(['sent', 'opened', 'replied'] as const).map((key) => (
                              <Box key={key} style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: metricColors[key].color,
                                backgroundColor: metricColors[key].bgColor,
                                padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`,
                                borderRadius: tokens.borderRadius.sm,
                              }}>
                                {variant.metrics![key]} {key}
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Stack>

                  {variants.length === 0 && (
                    <Box style={{
                      textAlign: 'center' as const,
                      padding: tokens.spacing[4],
                      color: tokens.colors.neutral[400],
                      fontSize: tokens.typography.fontSize.sm,
                    }}>
                      Add variants to test different message versions
                    </Box>
                  )}

                  {/* Winner criteria */}
                  {variants.length >= 2 && (
                    <Box style={{
                      marginTop: tokens.spacing[3],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.warningScale[50],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
                    }}>
                      <Box style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.warningScale[700],
                        marginBottom: tokens.spacing[1],
                      }}>
                        Winner criteria
                      </Box>
                      <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                        {(['Open rate', 'Reply rate', 'Click rate'] as const).map((criteria, i) => (
                          <Box key={criteria} style={{
                            padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.sm,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${i === 0 ? tokens.colors.warningScale[300] : tokens.colors.neutral[200]}`,
                            backgroundColor: i === 0 ? tokens.colors.warningScale[100] : tokens.colors.common.white,
                            color: i === 0 ? tokens.colors.warningScale[800] : tokens.colors.neutral[600],
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: i === 0 ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                            cursor: 'pointer',
                            transition: `all ${tokens.motion.hover}`,
                          }}>
                            {criteria}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Send confirmation modal */}
        {showConfirmModal && (
          <Box style={{
            position: 'fixed' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: tokens.overlay?.medium,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <Box style={{
              ...createCardStyle(tokens, { elevation: 'xl', glass: tokens.surface.useGlass }),
              padding: tokens.spacing[6],
              maxWidth: 420,
              width: '100%',
            }}>
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                marginBottom: tokens.spacing[4],
              }}>
                <Box style={{
                  width: tokens.spacing[8],
                  height: tokens.spacing[8],
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.primaryScale[50],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: tokens.colors.primaryScale[600],
                }}>
                  <Send size={18} />
                </Box>
                <Box>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                  }}>
                    Confirm Send
                  </Box>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[500],
                  }}>
                    Review your outreach details
                  </Box>
                </Box>
              </Box>

              {/* Summary */}
              <Stack direction="vertical" spacing="sm">
                <Box style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.neutral[50],
                }}>
                  <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>Channel</Box>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: channelColors[channel].color,
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                  }}>
                    {getChannelIcon(channel, 12)}
                    {getChannelLabel(channel)}
                  </Box>
                </Box>
                <Box style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.neutral[50],
                }}>
                  <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>Recipients</Box>
                  <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                    {recipients.length} candidates
                  </Box>
                </Box>
                <Box style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.neutral[50],
                }}>
                  <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>Delivery</Box>
                  <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                    {scheduleConfig.sendNow ? 'Immediately' : `Scheduled: ${scheduleConfig.scheduledDate ?? 'TBD'}`}
                  </Box>
                </Box>
                {variants.length > 0 && (
                  <Box style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.neutral[50],
                  }}>
                    <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>A/B Variants</Box>
                    <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                      {variants.length} variants
                    </Box>
                  </Box>
                )}
              </Stack>

              {/* Actions */}
              <Box style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: tokens.spacing[2],
                marginTop: tokens.spacing[4],
              }}>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    backgroundColor: tokens.colors.common.white,
                    color: tokens.colors.neutral[700],
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: 'none',
                    backgroundColor: tokens.colors.primaryScale[500],
                    color: tokens.colors.common.white,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    fontFamily: 'inherit',
                  }}
                >
                  <CheckCircle2 size={14} />
                  Confirm & Send
                </button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
