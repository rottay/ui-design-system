'use client';

/**
 * BhStandupView - Daily Preset
 * Daily standup view with recruiter cards showing yesterday/today/blockers,
 * timer display, candidate update badges, and add/edit entry form.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Clock,
  Users,
  Plus,
  Edit3,
  CheckCircle2,
  Target,
  AlertTriangle,
  User,
  X,
  Save,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createPersonalitySkeletonStyle,
  createEmptyStateStyle,
  getPersonalityTypography,
  createDividerStyle,
  ICON_SIZES,
} from '../../../helpers';
import type { BhStandupViewProps, StandupEntry } from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDuration(minutes?: number): string {
  if (!minutes) return '0:00';
  const m = Math.floor(minutes % 60);
  const h = Math.floor(minutes / 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}`;
  return `${m}m`;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SkeletonCard({ tokens }: { tokens: PresetContext['tokens'] }) {
  const skeletonStyle = createPersonalitySkeletonStyle(tokens);
  return (
    <div style={{ ...createCardStyle(tokens), padding: tokens.spacing[6] }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
        <div style={{ ...skeletonStyle, width: 40, height: 40, borderRadius: tokens.borderRadius.full }} />
        <div style={{ flex: 1 }}>
          <div style={{ ...skeletonStyle, width: '60%', height: 16, marginBottom: tokens.spacing[1] }} />
          <div style={{ ...skeletonStyle, width: '30%', height: 12 }} />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ marginBottom: tokens.spacing[2] }}>
          <div style={{ ...skeletonStyle, width: '40%', height: 14, marginBottom: tokens.spacing[1] }} />
          <div style={{ ...skeletonStyle, width: '90%', height: 12, marginBottom: tokens.spacing[1] }} />
          <div style={{ ...skeletonStyle, width: '75%', height: 12 }} />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section Renderer                                                   */
/* ------------------------------------------------------------------ */

function EntrySection({
  title,
  icon: Icon,
  items,
  tokens,
  accentColor,
  bgColor,
}: {
  title: string;
  icon: typeof CheckCircle2;
  items: string[];
  tokens: PresetContext['tokens'];
  accentColor: string;
  bgColor?: string;
}) {
  const typography = getPersonalityTypography(tokens);

  if (!items.length) return null;

  return (
    <div
      style={{
        marginBottom: tokens.spacing[4],
        padding: tokens.spacing[2],
        borderRadius: tokens.borderRadius.md,
        backgroundColor: bgColor ?? 'transparent',
        borderLeft: `3px solid ${accentColor}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[1],
          marginBottom: tokens.spacing[1],
          ...typography.label,
          color: accentColor,
        }}
      >
        <Icon size={ICON_SIZES.label} />
        <span>{title}</span>
      </div>
      <ul
        style={{
          margin: 0,
          paddingLeft: tokens.spacing[6],
          listStyleType: 'disc',
        }}
      >
        {items.map((item, idx) => (
          <li
            key={idx}
            style={{
              ...typography.body,
              color: tokens.colors.neutral[500],
              marginBottom: tokens.spacing[0],
              lineHeight: 1.5,
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Entry Card                                                         */
/* ------------------------------------------------------------------ */

function StandupEntryCard({
  entry,
  tokens,
  index,
  isCurrentUser,
  onEditEntry,
}: {
  entry: StandupEntry;
  tokens: PresetContext['tokens'];
  index: number;
  isCurrentUser: boolean;
  onEditEntry?: BhStandupViewProps['onEditEntry'];
}) {
  const typography = getPersonalityTypography(tokens);
  const entrance = createEntranceAnimation(tokens);
  const staggerMs = createStaggerDelay(tokens, index);

  return (
    <div
      style={{
        ...createCardStyle(tokens),
        padding: tokens.spacing[6],
        transition: entrance.transition,
        transitionDelay: `${staggerMs}ms`,
      }}
    >
      {/* Header: Avatar + Name + Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: tokens.spacing[4],
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
          {entry.avatarUrl ? (
            <img
              src={entry.avatarUrl}
              alt={entry.recruiterName}
              style={{
                width: 40,
                height: 40,
                borderRadius: tokens.borderRadius.full,
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                ...createIconContainerStyle(tokens, { size: 40 }),
                borderRadius: tokens.borderRadius.full,
              }}
            >
              <User size={ICON_SIZES.section} />
            </div>
          )}
          <div>
            <div style={{ ...typography.subtitle, color: tokens.colors.neutral[900] }}>
              {entry.recruiterName}
              {isCurrentUser && (
                <span
                  style={{
                    ...typography.caption,
                    color: tokens.colors.primaryScale[600],
                    marginLeft: tokens.spacing[1],
                  }}
                >
                  (You)
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
          {entry.candidateUpdates != null && entry.candidateUpdates > 0 && (
            <span
              style={{
                ...createBadgeStyle(tokens, 'primary'),
                ...typography.caption,
              }}
            >
              {entry.candidateUpdates} candidate{entry.candidateUpdates !== 1 ? 's' : ''} updated
            </span>
          )}
          {isCurrentUser && onEditEntry && (
            <button
              onClick={() => onEditEntry(entry.recruiterId, entry)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[0],
                padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`,
                border: `1px solid ${tokens.colors.neutral[200]}`,
                borderRadius: tokens.borderRadius.sm,
                background: 'transparent',
                cursor: 'pointer',
                color: tokens.colors.neutral[500],
                ...typography.caption,
              }}
            >
              <Edit3 size={ICON_SIZES.inline} />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Sections */}
      <EntrySection
        title="Yesterday"
        icon={CheckCircle2}
        items={entry.yesterday}
        tokens={tokens}
        accentColor={tokens.colors.successScale[600]}
      />

      <EntrySection
        title="Today"
        icon={Target}
        items={entry.today}
        tokens={tokens}
        accentColor={tokens.colors.primaryScale[600]}
      />

      <EntrySection
        title="Blockers"
        icon={AlertTriangle}
        items={entry.blockers}
        tokens={tokens}
        accentColor={tokens.colors.warningScale[600]}
        bgColor={tokens.colors.warningScale[50]}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add Entry Form                                                     */
/* ------------------------------------------------------------------ */

function AddEntryForm({
  tokens,
  onAddEntry,
  onClose,
}: {
  tokens: PresetContext['tokens'];
  onAddEntry: BhStandupViewProps['onAddEntry'];
  onClose: () => void;
}) {
  const typography = getPersonalityTypography(tokens);
  const [yesterday, setYesterday] = useState('');
  const [today, setToday] = useState('');
  const [blockers, setBlockers] = useState('');
  const [candidateUpdates, setCandidateUpdates] = useState('');

  const handleSubmit = useCallback(() => {
    if (!onAddEntry) return;
    onAddEntry({
      yesterday: yesterday.split('\n').filter(Boolean),
      today: today.split('\n').filter(Boolean),
      blockers: blockers.split('\n').filter(Boolean),
      candidateUpdates: candidateUpdates ? parseInt(candidateUpdates, 10) : undefined,
    });
    onClose();
  }, [onAddEntry, yesterday, today, blockers, candidateUpdates, onClose]);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: tokens.spacing[2],
    border: `1px solid ${tokens.colors.neutral[200]}`,
    borderRadius: tokens.borderRadius.md,
    ...typography.body,
    color: tokens.colors.neutral[900],
    backgroundColor: tokens.colors.common.white,
    resize: 'vertical' as const,
    minHeight: 60,
    outline: 'none',
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    ...typography.label,
    color: tokens.colors.neutral[900],
    marginBottom: tokens.spacing[0],
    display: 'block',
  };

  return (
    <div style={{ ...createCardStyle(tokens), padding: tokens.spacing[6] }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: tokens.spacing[4],
        }}
      >
        <div style={{ ...typography.subtitle, color: tokens.colors.neutral[900] }}>Add Your Update</div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: tokens.colors.neutral[500],
            padding: tokens.spacing[0],
          }}
        >
          <X size={ICON_SIZES.section} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
        <div>
          <label style={labelStyle}>Yesterday (one per line)</label>
          <textarea
            value={yesterday}
            onChange={(e) => setYesterday(e.target.value)}
            placeholder="What did you accomplish yesterday?"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Today (one per line)</label>
          <textarea
            value={today}
            onChange={(e) => setToday(e.target.value)}
            placeholder="What will you work on today?"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Blockers (one per line)</label>
          <textarea
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
            placeholder="Any blockers or impediments?"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Candidate Updates Count</label>
          <input
            type="number"
            value={candidateUpdates}
            onChange={(e) => setCandidateUpdates(e.target.value)}
            placeholder="0"
            min="0"
            style={{ ...inputStyle, minHeight: 'auto' }}
          />
        </div>
        <div style={{ display: 'flex', gap: tokens.spacing[2], justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              border: `1px solid ${tokens.colors.neutral[200]}`,
              borderRadius: tokens.borderRadius.md,
              background: 'transparent',
              cursor: 'pointer',
              ...typography.body,
              color: tokens.colors.neutral[500],
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              border: 'none',
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.primaryScale[600],
              color: tokens.colors.common.white,
              cursor: 'pointer',
              ...typography.body,
              fontWeight: tokens.typography.fontWeight.semibold,
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
            }}
          >
            <Save size={ICON_SIZES.label} />
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const DailyBhStandupView = createPreset<BhStandupViewProps>(
  'DailyBhStandupView',
  ({ props, tokens }) => {
    const {
      data,
      loading = false,
      onAddEntry,
      onEditEntry,
      currentUserId,
      className,
      style,
    } = props;

    const [showForm, setShowForm] = useState(false);
    const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

    const typography = getPersonalityTypography(tokens);
    const entries = data?.entries ?? [];

    const toggleEntry = useCallback((id: string) => {
      setExpandedEntries((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }, []);

    // ================================================================
    // LOADING
    // ================================================================

    if (loading) {
      return (
        <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], ...style }}>
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} tokens={tokens} />
          ))}
        </div>
      );
    }

    // ================================================================
    // EMPTY STATE
    // ================================================================

    if (!data || entries.length === 0) {
      return (
        <div className={className} style={{ ...style }}>
          <div style={createEmptyStateStyle(tokens)}>
            <div style={{ marginBottom: tokens.spacing[2], color: tokens.colors.neutral[400] }}>
              <Users size={ICON_SIZES.hero} />
            </div>
            <div style={{ ...typography.subtitle, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>No Standup Entries</div>
            <div style={{ ...typography.caption, color: tokens.colors.neutral[400] }}>
              No one has shared their update yet. Be the first to add your standup entry.
            </div>
            {onAddEntry && (
              <button
                onClick={() => setShowForm(true)}
                style={{
                  marginTop: tokens.spacing[4],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[6]}px`,
                  border: 'none',
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.primaryScale[600],
                  color: tokens.colors.common.white,
                  cursor: 'pointer',
                  ...typography.body,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                }}
              >
                <Plus size={ICON_SIZES.label} />
                Add Your Update
              </button>
            )}
          </div>
          {showForm && (
            <div style={{ marginTop: tokens.spacing[4] }}>
              <AddEntryForm tokens={tokens} onAddEntry={onAddEntry} onClose={() => setShowForm(false)} />
            </div>
          )}
        </div>
      );
    }

    // ================================================================
    // MAIN RENDER
    // ================================================================

    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], ...style }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: tokens.spacing[2],
          }}
        >
          <div>
            <div style={{ ...typography.title, color: tokens.colors.neutral[900] }}>
              {data.sprintName}
            </div>
            <div style={{ ...typography.caption, color: tokens.colors.neutral[500], marginTop: tokens.spacing[0] }}>
              {formatDate(data.date)}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
            {/* Duration */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                ...typography.body,
                color: tokens.colors.neutral[500],
              }}
            >
              <Clock size={ICON_SIZES.label} />
              <span>{formatDuration(data.duration)}</span>
            </div>

            {/* Attendees */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                ...typography.body,
                color: tokens.colors.neutral[500],
              }}
            >
              <Users size={ICON_SIZES.label} />
              <span>{data.attendees} attendees</span>
            </div>

            {/* Add Entry Button */}
            {onAddEntry && (
              <button
                onClick={() => setShowForm(!showForm)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  border: 'none',
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.primaryScale[600],
                  color: tokens.colors.common.white,
                  cursor: 'pointer',
                  ...typography.body,
                  fontWeight: tokens.typography.fontWeight.semibold,
                }}
              >
                <Plus size={ICON_SIZES.label} />
                Add Update
              </button>
            )}
          </div>
        </div>

        <div style={createDividerStyle(tokens)} />

        {/* Add Entry Form */}
        {showForm && onAddEntry && (
          <AddEntryForm tokens={tokens} onAddEntry={onAddEntry} onClose={() => setShowForm(false)} />
        )}

        {/* Entries */}
        {entries.map((entry, idx) => (
          <StandupEntryCard
            key={entry.recruiterId}
            entry={entry}
            tokens={tokens}
            index={idx}
            isCurrentUser={currentUserId === entry.recruiterId}
            onEditEntry={onEditEntry}
          />
        ))}
      </div>
    );
  }
);
