'use client';

/**
 * OutreachTable - Standard Preset
 * Pin/CRM-style outreach view with sidebar navigation,
 * stats bar, and contact table with status badges and steps.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { OutreachTableProps, Contact, ContactStatus } from '../../core';
import { getOutreachStatusConfig, getInitialsColors, getInitialsColor, getInitials } from '../../core';
import {
  Search,
  ChevronDown,
  Mail,
  AlertTriangle,
  Plus,
  Pause,
  Edit3,
  Download,
  Users,
  Inbox,
  Send,
  BarChart3,
  Settings,
  Zap,
  Bell,
  MailX,
  Clock,
  Eye,
  MessageSquare,
  CalendarCheck,
  XCircle,
  Archive,
} from 'lucide-react';
import {
  createBadgeStyle,
  createCardStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createSectionHeaderStyle,
} from '../../../helpers';

// ============================================================================
// Component
// ============================================================================

export const StandardOutreachTable = createPreset<OutreachTableProps & Record<string, unknown>>({
  name: 'OutreachTable.Standard',
  render: ({ primitives, props, tokens, engine }: PresetContext<OutreachTableProps>) => {
    const { Box, Flex, Text, Spinner } = primitives;

    const STATUS_CONFIG = getOutreachStatusConfig(tokens);
    const INITIALS_COLORS = getInitialsColors(tokens);

    const {
      contacts,
      filters,
      activeFilter: controlledActiveFilter,
      onFilterChange,
      stats,
      summaryStats,
      title = 'Outreach',
      onContactClick,
      onAddCandidates,
      onPauseOutreach,
      onEditOutreach,
      onExport,
      searchable = true,
      onSearch,
      selectable = true,
      selectedIds: controlledSelectedIds,
      onSelectionChange,
      navItems,
      activeNavKey: controlledActiveNavKey,
      onNavSelect,
      errorCount = 0,
      loading = false,
      emptyText = 'No contacts',
      editable = false,
      onContactEdit,
      className,
      style,
    } = props;

    // ========================================================================
    // Internal State
    // ========================================================================
    const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>([]);
    const [internalActiveFilter, setInternalActiveFilter] = useState('all');
    const [internalActiveNavKey, setInternalActiveNavKey] = useState('in-outreach');
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
    const [editingField, setEditingField] = useState<{ contactId: string; field: string } | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    const selectedIds = controlledSelectedIds ?? internalSelectedIds;
    const activeFilter = controlledActiveFilter ?? internalActiveFilter;
    const activeNavKey = controlledActiveNavKey ?? internalActiveNavKey;

    // ========================================================================
    // Handlers
    // ========================================================================
    const handleSelectionChange = useCallback((ids: string[]) => {
      if (!controlledSelectedIds) setInternalSelectedIds(ids);
      onSelectionChange?.(ids);
    }, [controlledSelectedIds, onSelectionChange]);

    const handleFilterChange = useCallback((key: string) => {
      if (!controlledActiveFilter) setInternalActiveFilter(key);
      onFilterChange?.(key);
    }, [controlledActiveFilter, onFilterChange]);

    const handleNavSelect = useCallback((key: string) => {
      if (!controlledActiveNavKey) setInternalActiveNavKey(key);
      onNavSelect?.(key);
    }, [controlledActiveNavKey, onNavSelect]);

    const handleSearch = useCallback((query: string) => {
      setSearchQuery(query);
      onSearch?.(query);
    }, [onSearch]);

    const toggleSelectAll = useCallback(() => {
      if (selectedIds.length === contacts.length) {
        handleSelectionChange([]);
      } else {
        handleSelectionChange(contacts.map((c) => c.id));
      }
    }, [contacts, selectedIds.length, handleSelectionChange]);

    const toggleSelectContact = useCallback((id: string) => {
      const newIds = selectedIds.includes(id)
        ? selectedIds.filter((sid) => sid !== id)
        : [...selectedIds, id];
      handleSelectionChange(newIds);
    }, [selectedIds, handleSelectionChange]);

    const startEditing = useCallback((contactId: string, field: string, currentValue: string) => {
      if (!editable) return;
      setEditingField({ contactId, field });
      setEditValue(currentValue);
    }, [editable]);

    const commitEdit = useCallback(() => {
      if (editingField) {
        onContactEdit?.(editingField.contactId, editingField.field, editValue);
        setEditingField(null);
        setEditValue('');
      }
    }, [editingField, editValue, onContactEdit]);

    const cancelEdit = useCallback(() => {
      setEditingField(null);
      setEditValue('');
    }, []);

    // ========================================================================
    // Filtered Data
    // ========================================================================
    const filteredContacts = useMemo(() => {
      let result = contacts;
      if (activeFilter && activeFilter !== 'all') {
        result = result.filter((c) => c.status === activeFilter);
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter((c) =>
          c.name.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q)
        );
      }
      return result;
    }, [contacts, activeFilter, searchQuery]);

    // ========================================================================
    // Default nav items
    // ========================================================================
    const defaultNavItems = navItems ?? [
      { key: 'sourcing', label: 'Sourcing', icon: <Users style={{ width: 16, height: 16 }} />, section: 'top' },
      { key: 'in-outreach', label: 'In Outreach', badge: 10, section: 'candidates' },
      { key: 'in-progress', label: 'In Progress', badge: 8, section: 'candidates' },
      { key: 'not-yet-contacted', label: 'Not Yet Contacted', badge: 3, section: 'candidates' },
      { key: 'messaged', label: 'Messaged', badge: 8, section: 'candidates' },
      { key: 'opened', label: 'Opened', badge: 7, section: 'candidates' },
      { key: 'replied', label: 'Replied', badge: 0, section: 'candidates' },
      { key: 'interested', label: 'Interested', badge: 0, section: 'candidates' },
      { key: 'scheduled', label: 'Scheduled', badge: 0, section: 'candidates' },
      { key: 'no-response', label: 'No Response', badge: 0, section: 'candidates' },
      { key: 'archived', label: 'Archived', badge: 0, section: 'candidates' },
      { key: 'inbox', label: 'Inbox', icon: <Inbox style={{ width: 16, height: 16 }} />, section: 'bottom-nav' },
      { key: 'outreach', label: 'Outreach', icon: <Send style={{ width: 16, height: 16 }} />, badge: 2, section: 'bottom-nav' },
      { key: 'reports', label: 'Reports', icon: <BarChart3 style={{ width: 16, height: 16 }} />, section: 'bottom-nav' },
      { key: 'job-settings', label: 'Job Settings', icon: <Settings style={{ width: 16, height: 16 }} />, section: 'settings' },
      { key: 'automation', label: 'Automation', icon: <Zap style={{ width: 16, height: 16 }} />, badge: '3/6', section: 'settings' },
    ];

    const candidateItems = defaultNavItems.filter((n) => n.section === 'candidates');
    const bottomNavItems = defaultNavItems.filter((n) => n.section === 'bottom-nav');
    const settingsItems = defaultNavItems.filter((n) => n.section === 'settings');

    // ========================================================================
    // Default stats
    // ========================================================================
    const defaultStats: Array<{ key: string; label: string; value: number | string; percentage?: string; icon?: React.ReactNode }> = stats ?? [
      { key: 'all', label: 'All In Sequence', value: 10 },
      { key: 'in-progress', label: 'In Progress', value: 8, icon: <Clock style={{ width: 14, height: 14 }} /> },
      { key: 'not-contacted', label: 'Not Yet Contacted', value: 3, icon: <AlertTriangle style={{ width: 14, height: 14, color: tokens.colors.warningScale[500] }} /> },
      { key: 'no-response', label: 'No Response', value: 0 },
    ];

    const defaultSummaryStats: Array<{ key: string; label: string; value: number | string; percentage?: string; icon?: React.ReactNode }> = summaryStats ?? [
      { key: 'messaged', label: 'Messaged', value: 8 },
      { key: 'opened', label: 'Opened', value: 7, percentage: '88%' },
      { key: 'replied', label: 'Replied', value: 0, percentage: '0%' },
      { key: 'interested', label: 'Interested', value: 0, percentage: '0%' },
      { key: 'scheduled', label: 'Scheduled', value: 0, percentage: '0%' },
    ];

    // ========================================================================
    // Render: Sidebar
    // ========================================================================
    const renderSidebar = () => (
      <Box
        style={{
          width: 240,
          minWidth: 240,
          backgroundColor: tokens.colors.neutral[900],
          color: tokens.colors.neutral[100],
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Job Selector */}
        <Box
          style={{
            padding: `${tokens.spacing[4]}px ${tokens.spacing[4]}px ${tokens.spacing[3]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[700]}`,
          }}
        >
          <Flex
            align="center"
            justify="between"
            style={{
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.neutral[800],
            }}
          >
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.common.white }}>
              Software engineer
            </Text>
            <ChevronDown style={{ width: 16, height: 16, color: tokens.colors.neutral[400] }} />
          </Flex>
        </Box>

        {/* Sourcing */}
        <Box style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px 0` }}>
          {defaultNavItems.filter((n) => n.section === 'top').map((item) => (
            <Box
              key={item.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                cursor: 'pointer',
                backgroundColor: activeNavKey === item.key ? tokens.colors.neutral[700] : 'transparent',
                color: activeNavKey === item.key ? tokens.colors.common.white : tokens.colors.neutral[400],
                fontSize: tokens.typography.fontSize.sm,
                transition: `all ${tokens.motion.hover}`,
              }}
              onClick={() => handleNavSelect(item.key)}
            >
              {item.icon}
              <Text style={{ color: 'inherit', fontSize: 'inherit' }}>{item.label}</Text>
            </Box>
          ))}
        </Box>

        {/* Candidates section */}
        <Box style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, flex: 1, overflowY: 'auto' }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[500],
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px`,
            }}
          >
            Candidates
          </Text>
          {candidateItems.map((item) => {
            const isActive = activeNavKey === item.key;
            return (
              <Box
                key={item.key}
                style={{
                  boxShadow: tokens.shadows.md,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  cursor: 'pointer',
                  backgroundColor: isActive ? tokens.colors.neutral[700] : 'transparent',
                  color: isActive ? tokens.colors.common.white : tokens.colors.neutral[400],
                  fontSize: tokens.typography.fontSize.sm,
                  transition: `all ${tokens.motion.hover}`,
                }}
                onClick={() => handleNavSelect(item.key)}
              >
                <Text style={{ color: 'inherit', fontSize: 'inherit' }}>{item.label}</Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: isActive ? tokens.colors.common.white : tokens.colors.neutral[500],
                    minWidth: 20,
                    textAlign: 'right',
                  }}
                >
                  {item.badge}
                </Text>
              </Box>
            );
          })}
        </Box>

        {/* Bottom Nav */}
        <Box
          style={{
            padding: `${tokens.spacing[2]}px`,
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[700]}`,
          }}
        >
          {bottomNavItems.map((item) => {
            const isActive = activeNavKey === item.key;
            return (
              <Box
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  cursor: 'pointer',
                  backgroundColor: isActive ? tokens.colors.neutral[700] : 'transparent',
                  color: isActive ? tokens.colors.common.white : tokens.colors.neutral[400],
                  fontSize: tokens.typography.fontSize.sm,
                  transition: `all ${tokens.motion.hover}`,
                }}
                onClick={() => handleNavSelect(item.key)}
              >
                <Flex align="center" gap={10}>
                  {item.icon}
                  <Text style={{ color: 'inherit', fontSize: 'inherit' }}>{item.label}</Text>
                </Flex>
                {item.badge !== undefined && Number(item.badge) > 0 && (
                  <Box
                    style={{
                      backgroundColor: tokens.colors.primaryScale[600],
                      color: tokens.colors.common.white,
                      borderRadius: tokens.borderRadius.full,
                      padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      lineHeight: tokens.typography.lineHeight.relaxed,
                    }}
                  >
                    {item.badge}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Settings */}
        <Box
          style={{
            padding: `${tokens.spacing[2]}px`,
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[700]}`,
          }}
        >
          {settingsItems.map((item) => (
            <Box
              key={item.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                cursor: 'pointer',
                backgroundColor: activeNavKey === item.key ? tokens.colors.neutral[700] : 'transparent',
                color: activeNavKey === item.key ? tokens.colors.common.white : tokens.colors.neutral[400],
                fontSize: tokens.typography.fontSize.sm,
                transition: `all ${tokens.motion.hover}`,
              }}
              onClick={() => handleNavSelect(item.key)}
            >
              <Flex align="center" gap={10}>
                {item.icon}
                <Text style={{ color: 'inherit', fontSize: 'inherit' }}>{item.label}</Text>
              </Flex>
              {item.badge !== undefined && (
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  {item.badge}
                </Text>
              )}
            </Box>
          ))}
        </Box>

        {/* User info */}
        <Box
          style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[700]}`,
          }}
        >
          <Flex align="center" justify="between">
            <Flex align="center" gap={10}>
              <Box
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.primaryScale[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.common.white,
                }}
              >
                SL
              </Box>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.common.white }}>
                Sam Lee
              </Text>
            </Flex>
            <Flex align="center" gap={tokens.spacing[2]}>
              <Bell style={{ width: 16, height: 16, color: tokens.colors.neutral[400], cursor: 'pointer' }} />
              <Settings style={{ width: 16, height: 16, color: tokens.colors.neutral[400], cursor: 'pointer' }} />
            </Flex>
          </Flex>
        </Box>
      </Box>
    );

    // ========================================================================
    // Render: Header Bar
    // ========================================================================
    const renderHeaderBar = () => (
      <Box
        style={{
          padding: `${tokens.spacing[3]}px ${tokens.spacing[6]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.common.white,
        }}
      >
        <Flex align="center" justify="between">
          {/* Left: Breadcrumb + Error */}
          <Flex align="center" gap={tokens.spacing[4]}>
            <Flex align="center" gap={tokens.spacing[2]}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                {title}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
                &middot;
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                All In Sequence
              </Text>
            </Flex>
            {errorCount > 0 && (
              <Flex
                align="center"
                gap={tokens.spacing[2]}
                style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.warningScale[50],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
                }}
              >
                <AlertTriangle style={{ width: 14, height: 14, color: tokens.colors.warningScale[600] }} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[600], fontWeight: tokens.typography.fontWeight.medium }}>
                  {errorCount} candidate{errorCount !== 1 ? 's' : ''} with errors
                </Text>
              </Flex>
            )}
          </Flex>

          {/* Right: Actions */}
          <Flex align="center" gap={tokens.spacing[2]}>
            {onPauseOutreach && (
              <Box
                onClick={onPauseOutreach}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600],
                  backgroundColor: tokens.colors.common.white,
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                <Pause style={{ width: 14, height: 14 }} />
                <span>Pause Outreach</span>
              </Box>
            )}
            {onEditOutreach && (
              <Box
                onClick={onEditOutreach}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600],
                  backgroundColor: tokens.colors.common.white,
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                <Edit3 style={{ width: 14, height: 14 }} />
                <span>Edit Outreach</span>
              </Box>
            )}
            {onAddCandidates && (
              <Box
                onClick={onAddCandidates}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.common.white,
                  backgroundColor: tokens.colors.primaryScale[600],
                  fontWeight: tokens.typography.fontWeight.medium,
                  border: 'none',
                }}
              >
                <Plus style={{ width: 14, height: 14 }} />
                <span>Add Candidates</span>
              </Box>
            )}
            {onExport && (
              <Box
                onClick={onExport}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600],
                  backgroundColor: tokens.colors.common.white,
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                <Download style={{ width: 14, height: 14 }} />
                <span>Export</span>
                <ChevronDown style={{ width: 12, height: 12 }} />
              </Box>
            )}
          </Flex>
        </Flex>
      </Box>
    );

    // ========================================================================
    // Render: Stats Bar
    // ========================================================================
    const renderStatsBar = () => (
      <Box
        style={{
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.common.white,
        }}
      >
        {/* Row 1 */}
        <Flex
          align="center"
          style={{
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            padding: `0 ${tokens.spacing[6]}px`,
          }}
        >
          {defaultStats.map((stat, i) => {
            const isActive = i === 0;
            return (
              <Box
                key={stat.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
                  cursor: 'pointer',
                  borderBottom: isActive ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[600]}` : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} transparent`,
                  color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                }}
                onClick={() => handleFilterChange(stat.key)}
              >
                {stat.icon}
                <Text style={{ fontWeight: tokens.typography.fontWeight.semibold, fontSize: tokens.typography.fontSize.sm, color: 'inherit' }}>
                  {stat.value}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: 'inherit' }}>
                  {stat.label}
                </Text>
              </Box>
            );
          })}
        </Flex>

        {/* Row 2 */}
        <Flex
          align="center"
          style={{ padding: `0 ${tokens.spacing[6]}px` }}
        >
          {defaultSummaryStats.map((stat) => (
            <Flex
              key={stat.key}
              align="center"
              gap={tokens.spacing[2]}
              style={{
                padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[600],
              }}
            >
              {stat.icon}
              <Text style={{ fontWeight: tokens.typography.fontWeight.semibold, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[800] }}>
                {stat.value}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                {stat.label}
              </Text>
              {stat.percentage && (
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                  {stat.percentage}
                </Text>
              )}
            </Flex>
          ))}
        </Flex>
      </Box>
    );

    // ========================================================================
    // Render: Contact Avatar
    // ========================================================================
    const renderAvatar = (contact: Contact) => {
      const initials = contact.initials || getInitials(contact.name);
      const bgColor = contact.initialsColor || getInitialsColor(contact.name, INITIALS_COLORS);

      if (contact.avatar) {
        return (
          <img
            src={contact.avatar}
            alt={contact.name}
            style={{
              width: 36,
              height: 36,
              borderRadius: tokens.borderRadius.full,
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
        );
      }

      return (
        <Box
          style={{
            width: 36,
            height: 36,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.common.white,
            flexShrink: 0,
          }}
        >
          {initials}
        </Box>
      );
    };

    // ========================================================================
    // Render: Status Badge
    // ========================================================================
    const renderStatusBadge = (status: ContactStatus) => {
      const config = STATUS_CONFIG[status];
      const isMissingEmail = status === 'missing-email';

      return (
        <Flex
          align="center"
          gap={tokens.spacing[2]}
          style={{
            padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: config.bgColor,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${config.borderColor}`,
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.medium,
            color: config.color,
            display: 'inline-flex',
            whiteSpace: 'nowrap',
          }}
        >
          {isMissingEmail ? (
            <MailX style={{ width: 12, height: 12 }} />
          ) : status === 'reaching-out' ? (
            <Send style={{ width: 12, height: 12 }} />
          ) : null}
          <span>{config.label}</span>
          <ChevronDown style={{ width: 10, height: 10, opacity: 0.6 }} />
        </Flex>
      );
    };

    // ========================================================================
    // Render: Step Fraction
    // ========================================================================
    const renderStep = (contact: Contact) => {
      if (!contact.step) return <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>--</Text>;
      return (
        <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
          {contact.step.current} / {contact.step.total}
        </Text>
      );
    };

    // ========================================================================
    // Render: Next Step
    // ========================================================================
    const renderNextStep = (contact: Contact) => {
      if (!contact.nextStep) return <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>--</Text>;
      const isToday = contact.nextStep.toLowerCase() === 'today';
      return (
        <Flex align="center" gap={tokens.spacing[2]}>
          <Mail style={{ width: 14, height: 14, color: isToday ? tokens.colors.primaryScale[600] : tokens.colors.neutral[400] }} />
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: isToday ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
              fontWeight: isToday ? tokens.typography.fontWeight.medium : tokens.typography.fontWeight.normal,
            }}
          >
            {contact.nextStep}
          </Text>
        </Flex>
      );
    };

    // ========================================================================
    // Render: Table
    // ========================================================================
    const renderTable = () => {
      if (loading) {
        return (
          <Flex align="center" justify="center" style={{ padding: `${tokens.spacing[12]}px ${tokens.spacing[6]}px` }}>
            <Spinner size="md" />
          </Flex>
        );
      }

      if (filteredContacts.length === 0) {
        return (
          <Flex align="center" justify="center" style={{ padding: `${tokens.spacing[12]}px ${tokens.spacing[6]}px` }}>
            <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
              {emptyText}
            </Text>
          </Flex>
        );
      }

      return (
        <Box style={{ overflow: 'auto', flex: 1 }}>
          {/* Search Bar */}
          {searchable && (
            <Box
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[6]}px`,
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                backgroundColor: tokens.colors.common.white,
              }}
            >
              <Box style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search
                  style={{
                    position: 'absolute',
                    left: tokens.spacing[3],
                    width: 16,
                    height: 16,
                    color: tokens.colors.neutral[400],
                    pointerEvents: 'none',
                    zIndex: 1,
                  }}
                />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  style={{
                    width: '100%',
                    maxWidth: 320,
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    borderRadius: tokens.borderRadius.md,
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[800],
                    outline: 'none',
                    backgroundColor: tokens.colors.neutral[50],
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

          {/* Table Header */}
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: selectable
                ? '44px 40px 1fr 160px 80px 140px 100px 120px'
                : '40px 1fr 160px 80px 140px 100px 120px',
              backgroundColor: tokens.colors.neutral[50],
              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              position: 'sticky',
              top: 0,
              zIndex: 2,
            }}
          >
            {selectable && (
              <Box
                style={{
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredContacts.length && filteredContacts.length > 0}
                  onChange={toggleSelectAll}
                  style={{ width: 15, height: 15, cursor: 'pointer', accentColor: tokens.colors.primaryScale[600] }}
                />
              </Box>
            )}
            <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[2]}px` }} />
            {[
              { label: 'Name', key: 'name' },
              { label: 'Status', key: 'status' },
              { label: 'Step', key: 'step' },
              { label: 'Next Step', key: 'nextStep' },
              { label: 'Date Added', key: 'dateAdded' },
              { label: 'Last Contact', key: 'lastContact' },
            ].map((col) => (
              <Box
                key={col.key}
                style={{
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.label}
                </Text>
              </Box>
            ))}
          </Box>

          {/* Table Body */}
          {filteredContacts.map((contact) => {
            const isSelected = selectedIds.includes(contact.id);
            const isHovered = hoveredRowId === contact.id;

            return (
              <Box
                key={contact.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: selectable
                    ? '44px 40px 1fr 160px 80px 140px 100px 120px'
                    : '40px 1fr 160px 80px 140px 100px 120px',
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                  backgroundColor: isSelected
                    ? tokens.colors.primaryScale[50]
                    : isHovered
                      ? tokens.colors.neutral[50]
                      : tokens.colors.common.white,
                  cursor: onContactClick ? 'pointer' : 'default',
                  transition: `all ${tokens.motion.hover}`,
                  transform: isHovered ? tokens.motion.transform : 'none',
                }}
                onMouseEnter={() => setHoveredRowId(contact.id)}
                onMouseLeave={() => setHoveredRowId(null)}
                onClick={() => onContactClick?.(contact)}
              >
                {/* Checkbox */}
                {selectable && (
                  <Box
                    style={{
                      padding: `${tokens.spacing[3]}px`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectContact(contact.id)}
                      style={{ width: 15, height: 15, cursor: 'pointer', accentColor: tokens.colors.primaryScale[600] }}
                    />
                  </Box>
                )}

                {/* Email icon */}
                <Box
                  style={{
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[2]}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Mail style={{ width: 16, height: 16, color: tokens.colors.neutral[400] }} />
                </Box>

                {/* Name + Company */}
                <Flex align="center" gap={10} style={{ padding: `${tokens.spacing[3]}px`, overflow: 'hidden' }}>
                  {renderAvatar(contact)}
                  <Box style={{ overflow: 'hidden', minWidth: 0, flex: 1 }}>
                    {editingField?.contactId === contact.id && editingField?.field === 'name' ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={(e) => {
                          commitEdit();
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '100%',
                          padding: '2px 6px',
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[600]}`,
                          borderRadius: tokens.borderRadius.sm,
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          outline: 'none',
                          backgroundColor: tokens.colors.common.white,
                          fontFamily: 'inherit',
                        }}
                      
                        onFocus={(e) => {
                          e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                          e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                        }}
                      />
                    ) : (
                      <span
                        onDoubleClick={(e: React.MouseEvent) => {
                          if (editable) {
                            e.stopPropagation();
                            startEditing(contact.id, 'name', contact.name);
                          }
                        }}
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[800],
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap' as const,
                          display: 'block',
                          cursor: editable ? 'text' : 'default',
                        }}
                      >
                        {contact.name}
                      </span>
                    )}
                    {contact.company && (
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {contact.company}
                      </Text>
                    )}
                  </Box>
                </Flex>

                {/* Status */}
                <Box style={{ padding: `${tokens.spacing[3]}px`, display: 'flex', alignItems: 'center' }}>
                  {renderStatusBadge(contact.status)}
                </Box>

                {/* Step */}
                <Box style={{ padding: `${tokens.spacing[3]}px`, display: 'flex', alignItems: 'center' }}>
                  {renderStep(contact)}
                </Box>

                {/* Next Step */}
                <Box style={{ padding: `${tokens.spacing[3]}px`, display: 'flex', alignItems: 'center' }}>
                  {renderNextStep(contact)}
                </Box>

                {/* Date Added */}
                <Box style={{ padding: `${tokens.spacing[3]}px`, display: 'flex', alignItems: 'center' }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                    {contact.dateAdded || '--'}
                  </Text>
                </Box>

                {/* Last Contact Date */}
                <Box style={{ padding: `${tokens.spacing[3]}px`, display: 'flex', alignItems: 'center' }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                    {contact.lastContactDate || '\u2014'}
                  </Text>
                </Box>
              </Box>
            );
          })}
        </Box>
      );
    };

    // ========================================================================
    // Main Render
    // ========================================================================
    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          height: '100%',
          minHeight: 600,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          borderRadius: tokens.borderRadius.lg,
          overflow: 'hidden',
          backgroundColor: tokens.colors.common.white,
          ...style,
        }}
      >
        {renderSidebar()}
        <Box
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          {renderHeaderBar()}
          {renderStatsBar()}
          {renderTable()}
        </Box>
      </Box>
    );
  },
});

export default StandardOutreachTable;
