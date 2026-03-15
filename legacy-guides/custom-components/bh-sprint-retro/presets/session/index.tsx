'use client';

/**
 * BhSprintRetro - Session Preset
 * Interactive retrospective session with 4-column layout (Went Well, To Improve,
 * Action Items, Kudos), sticky-note cards, voting, and action items checklist.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  ThumbsUp,
  Timer,
  CheckCircle2,
  Circle,
  User,
  EyeOff,
  Eye,
  Star,
  AlertTriangle,
  Lightbulb,
  Heart,
  X,
  Send,
  Calendar,
  ChevronDown,
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
import type { BhSprintRetroProps, RetroCategory, RetroItem, RetroAction } from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getCategoryConfig(name: RetroCategory['name'], tokens: PresetContext['tokens']) {
  switch (name) {
    case 'went_well':
      return {
        label: 'Went Well',
        icon: Star,
        bgColor: tokens.colors.successScale[50],
        borderColor: tokens.colors.successScale[300],
        headerColor: tokens.colors.successScale[700],
        cardBg: tokens.colors.successScale[50],
      };
    case 'to_improve':
      return {
        label: 'To Improve',
        icon: AlertTriangle,
        bgColor: tokens.colors.warningScale[50],
        borderColor: tokens.colors.warningScale[300],
        headerColor: tokens.colors.warningScale[700],
        cardBg: tokens.colors.warningScale[50],
      };
    case 'action_items':
      return {
        label: 'Action Items',
        icon: Lightbulb,
        bgColor: tokens.colors.primaryScale[50],
        borderColor: tokens.colors.primaryScale[300],
        headerColor: tokens.colors.primaryScale[700],
        cardBg: tokens.colors.primaryScale[50],
      };
    case 'kudos':
      return {
        label: 'Kudos',
        icon: Heart,
        bgColor: tokens.colors.infoScale[50],
        borderColor: tokens.colors.infoScale[300],
        headerColor: tokens.colors.infoScale[700],
        cardBg: tokens.colors.infoScale[50],
      };
  }
}

function formatTimer(seconds?: number): string {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ------------------------------------------------------------------ */
/*  Sticky Note Card                                                   */
/* ------------------------------------------------------------------ */

function StickyNoteCard({
  item,
  tokens,
  categoryName,
  config,
  index,
  onVoteItem,
}: {
  item: RetroItem;
  tokens: PresetContext['tokens'];
  categoryName: RetroCategory['name'];
  config: ReturnType<typeof getCategoryConfig>;
  index: number;
  onVoteItem?: BhSprintRetroProps['onVoteItem'];
}) {
  const typography = getPersonalityTypography(tokens);

  return (
    <div
      style={{
        padding: tokens.spacing[2],
        borderRadius: tokens.borderRadius.md,
        backgroundColor: config.cardBg,
        border: `1px solid ${config.borderColor}`,
        transition: createEntranceAnimation(tokens).transition,
        transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
      }}
    >
      {/* Text */}
      <div
        style={{
          ...typography.body,
          color: tokens.colors.neutral[900],
          lineHeight: 1.5,
          marginBottom: tokens.spacing[2],
          wordBreak: 'break-word',
        }}
      >
        {item.text}
      </div>

      {/* Footer: Author + Votes */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[0],
            ...typography.caption,
            color: tokens.colors.neutral[500],
          }}
        >
          {item.isAnonymous ? (
            <>
              <EyeOff size={ICON_SIZES.inline} />
              <span>Anonymous</span>
            </>
          ) : (
            <>
              <User size={ICON_SIZES.inline} />
              <span>{item.authorName}</span>
            </>
          )}
        </div>

        <button
          onClick={() => onVoteItem?.(item.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[0],
            padding: `2px ${tokens.spacing[1]}px`,
            border: `1px solid ${config.borderColor}`,
            borderRadius: tokens.borderRadius.sm,
            background: tokens.colors.common.white,
            cursor: 'pointer',
            ...typography.caption,
            color: config.headerColor,
            fontWeight: tokens.typography.fontWeight.semibold,
          }}
        >
          <ThumbsUp size={ICON_SIZES.inline} />
          {item.votes}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add Card Form                                                      */
/* ------------------------------------------------------------------ */

function AddCardForm({
  tokens,
  categoryName,
  config,
  onAddItem,
  onClose,
}: {
  tokens: PresetContext['tokens'];
  categoryName: RetroCategory['name'];
  config: ReturnType<typeof getCategoryConfig>;
  onAddItem: BhSprintRetroProps['onAddItem'];
  onClose: () => void;
}) {
  const typography = getPersonalityTypography(tokens);
  const [text, setText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = useCallback(() => {
    if (!onAddItem || !text.trim()) return;
    onAddItem(categoryName, text.trim(), isAnonymous);
    setText('');
    onClose();
  }, [onAddItem, categoryName, text, isAnonymous, onClose]);

  return (
    <div
      style={{
        padding: tokens.spacing[2],
        borderRadius: tokens.borderRadius.md,
        backgroundColor: config.cardBg,
        border: `1px dashed ${config.borderColor}`,
      }}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your item..."
        style={{
          width: '100%',
          padding: tokens.spacing[1],
          border: `1px solid ${config.borderColor}`,
          borderRadius: tokens.borderRadius.sm,
          ...typography.body,
          color: tokens.colors.neutral[900],
          backgroundColor: tokens.colors.common.white,
          resize: 'vertical',
          minHeight: 50,
          outline: 'none',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: tokens.spacing[1] }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[0],
            cursor: 'pointer',
            ...typography.caption,
            color: tokens.colors.neutral[500],
          }}
        >
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            style={{ margin: 0 }}
          />
          <EyeOff size={ICON_SIZES.inline} />
          Anonymous
        </label>

        <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
          <button
            onClick={onClose}
            style={{
              padding: `2px ${tokens.spacing[1]}px`,
              border: `1px solid ${tokens.colors.neutral[200]}`,
              borderRadius: tokens.borderRadius.sm,
              background: 'transparent',
              cursor: 'pointer',
              ...typography.caption,
              color: tokens.colors.neutral[500],
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            style={{
              padding: `2px ${tokens.spacing[1]}px`,
              border: 'none',
              borderRadius: tokens.borderRadius.sm,
              backgroundColor: text.trim() ? config.headerColor : tokens.colors.neutral[200],
              color: tokens.colors.common.white,
              cursor: text.trim() ? 'pointer' : 'not-allowed',
              ...typography.caption,
              fontWeight: tokens.typography.fontWeight.semibold,
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[0],
            }}
          >
            <Send size={ICON_SIZES.inline} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Category Column                                                    */
/* ------------------------------------------------------------------ */

function CategoryColumn({
  category,
  tokens,
  onAddItem,
  onVoteItem,
}: {
  category: RetroCategory;
  tokens: PresetContext['tokens'];
  onAddItem?: BhSprintRetroProps['onAddItem'];
  onVoteItem?: BhSprintRetroProps['onVoteItem'];
}) {
  const typography = getPersonalityTypography(tokens);
  const config = getCategoryConfig(category.name, tokens);
  const CategoryIcon = config.icon;
  const [showForm, setShowForm] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: tokens.borderRadius.md,
        border: `1px solid ${config.borderColor}`,
        backgroundColor: config.bgColor,
        overflow: 'hidden',
        minHeight: 200,
      }}
    >
      {/* Column Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
          borderBottom: `1px solid ${config.borderColor}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            ...typography.subtitle,
            color: config.headerColor,
            fontSize: 13,
          }}
        >
          <CategoryIcon size={ICON_SIZES.label} />
          {config.label}
          <span
            style={{
              ...typography.caption,
              color: tokens.colors.neutral[500],
              fontWeight: tokens.typography.fontWeight.normal,
            }}
          >
            ({category.items.length})
          </span>
        </div>

        {onAddItem && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              border: `1px solid ${config.borderColor}`,
              borderRadius: tokens.borderRadius.sm,
              background: tokens.colors.common.white,
              cursor: 'pointer',
              color: config.headerColor,
            }}
          >
            <Plus size={ICON_SIZES.inline} />
          </button>
        )}
      </div>

      {/* Cards */}
      <div
        style={{
          flex: 1,
          padding: tokens.spacing[2],
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.spacing[2],
          overflowY: 'auto',
        }}
      >
        {showForm && onAddItem && (
          <AddCardForm
            tokens={tokens}
            categoryName={category.name}
            config={config}
            onAddItem={onAddItem}
            onClose={() => setShowForm(false)}
          />
        )}

        {category.items.map((item, idx) => (
          <StickyNoteCard
            key={item.id}
            item={item}
            tokens={tokens}
            categoryName={category.name}
            config={config}
            index={idx}
            onVoteItem={onVoteItem}
          />
        ))}

        {category.items.length === 0 && !showForm && (
          <div
            style={{
              ...typography.caption,
              color: tokens.colors.neutral[500],
              textAlign: 'center',
              padding: tokens.spacing[6],
            }}
          >
            No items yet
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Action Items Checklist                                             */
/* ------------------------------------------------------------------ */

function ActionItemsSection({
  actions,
  tokens,
  onToggleAction,
}: {
  actions: RetroAction[];
  tokens: PresetContext['tokens'];
  onToggleAction?: BhSprintRetroProps['onToggleAction'];
}) {
  const typography = getPersonalityTypography(tokens);

  if (!actions.length) return null;

  return (
    <div style={{ ...createCardStyle(tokens), padding: tokens.spacing[6] }}>
      <div style={{ ...createPersonalitySectionHeaderStyle(tokens), marginBottom: tokens.spacing[4] }}>
        Action Items ({actions.length})
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
        {actions.map((action, idx) => (
          <div
            key={action.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: tokens.spacing[2],
              borderRadius: tokens.borderRadius.md,
              border: `1px solid ${tokens.colors.neutral[200]}`,
              backgroundColor: action.completed ? tokens.colors.successScale[50] : tokens.colors.common.white,
              transition: createEntranceAnimation(tokens).transition,
              transitionDelay: `${createStaggerDelay(tokens, idx)}ms`,
            }}
          >
            <button
              onClick={() => onToggleAction?.(action.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: action.completed ? tokens.colors.successScale[600] : tokens.colors.neutral[500],
                flexShrink: 0,
              }}
            >
              {action.completed ? (
                <CheckCircle2 size={ICON_SIZES.section} />
              ) : (
                <Circle size={ICON_SIZES.section} />
              )}
            </button>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  ...typography.body,
                  color: action.completed ? tokens.colors.neutral[500] : tokens.colors.neutral[900],
                  textDecoration: action.completed ? 'line-through' : 'none',
                }}
              >
                {action.text}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  marginTop: 2,
                  ...typography.caption,
                  color: tokens.colors.neutral[500],
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[0] }}>
                  <User size={ICON_SIZES.inline} />
                  {action.assigneeName}
                </span>
                {action.dueDate && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[0] }}>
                    <Calendar size={ICON_SIZES.inline} />
                    {action.dueDate}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function RetroSkeleton({ tokens }: { tokens: PresetContext['tokens'] }) {
  const s = createPersonalitySkeletonStyle(tokens);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4] }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ ...createCardStyle(tokens), padding: tokens.spacing[4] }}>
          <div style={{ ...s, width: '60%', height: 16, marginBottom: tokens.spacing[4] }} />
          {[1, 2, 3].map((j) => (
            <div key={j} style={{ ...s, width: '100%', height: 60, marginBottom: tokens.spacing[2], borderRadius: tokens.borderRadius.md }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const SessionBhSprintRetro = createPreset<BhSprintRetroProps>(
  'SessionBhSprintRetro',
  ({ props, tokens }) => {
    const {
      data,
      loading = false,
      onAddItem,
      onVoteItem,
      onToggleAction,
      currentUserId,
      className,
      style,
    } = props;

    const typography = getPersonalityTypography(tokens);

    // ================================================================
    // LOADING
    // ================================================================

    if (loading) {
      return (
        <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], ...style }}>
          <RetroSkeleton tokens={tokens} />
        </div>
      );
    }

    // ================================================================
    // EMPTY STATE
    // ================================================================

    if (!data) {
      return (
        <div className={className} style={{ ...style }}>
          <div style={createEmptyStateStyle(tokens)}>
            <div style={{ marginBottom: tokens.spacing[2], color: tokens.colors.neutral[400] }}>
              <Lightbulb size={ICON_SIZES.hero} />
            </div>
            <div style={{ ...typography.subtitle, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>No Retro Session</div>
            <div style={{ ...typography.caption, color: tokens.colors.neutral[400] }}>
              Start a retrospective session to reflect on the sprint and identify improvements.
            </div>
          </div>
        </div>
      );
    }

    const categories = data.categories ?? [];
    const actionItems = data.actionItems ?? [];

    // Default category order
    const orderedCategories = useMemo(() => {
      const order: RetroCategory['name'][] = ['went_well', 'to_improve', 'action_items', 'kudos'];
      const map = new Map(categories.map((c) => [c.name, c]));
      return order
        .map((name) => map.get(name))
        .filter((c): c is RetroCategory => c != null);
    }, [categories]);

    // ================================================================
    // MAIN RENDER
    // ================================================================

    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[6], ...style }}>
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
              Sprint Retrospective
            </div>
          </div>

          {data.timer != null && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.primaryScale[50],
                border: `1px solid ${tokens.colors.primaryScale[200]}`,
              }}
            >
              <Timer size={ICON_SIZES.label} style={{ color: tokens.colors.primaryScale[600] }} />
              <span
                style={{
                  ...typography.body,
                  color: tokens.colors.primaryScale[700],
                  fontWeight: tokens.typography.fontWeight.semibold,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatTimer(data.timer)}
              </span>
            </div>
          )}
        </div>

        <div style={createDividerStyle(tokens)} />

        {/* 4-Column Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: tokens.spacing[4],
          }}
        >
          {orderedCategories.map((category) => (
            <CategoryColumn
              key={category.name}
              category={category}
              tokens={tokens}
              onAddItem={onAddItem}
              onVoteItem={onVoteItem}
            />
          ))}
        </div>

        {/* Action Items Section */}
        <ActionItemsSection actions={actionItems} tokens={tokens} onToggleAction={onToggleAction} />
      </div>
    );
  }
);
