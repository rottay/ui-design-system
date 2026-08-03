'use client';

/**
 * @fileoverview Modern (token-driven) engine for the ModerationGallery pattern.
 * Renders an intrinsic media grid (`auto-fill`/`minmax`, skin-owned) of
 * moderation cards. Every card composes real DS primitives — Badge (status
 * overlay: governed icon + text label + tone, never colour alone), Checkbox
 * (bulk selection), Button (triage actions with governed icons and the
 * canonical `pending` busy channel) and Avatar (uploader initials) — never
 * recreations.
 *
 * ACTION OVERLAY LAW: the triage actions live in a governed overlay that is
 * ALWAYS in the DOM (keyboard-reachable at all times); the skin reveals it on
 * hover (fine pointers only), on `:focus-within`, and permanently on coarse
 * pointers. The bulk Reject path is destructive and therefore gated by the
 * composed ConfirmDialog primitive (top layer + focus trap included).
 *
 * ASYNC LAW: action callbacks keep their `void` contract, but when a consumer
 * returns a thenable (assignable in TS) the card holds its governed busy
 * state until it settles — no optimistic removal, no double-submit.
 *
 * COPY: all strings resolve through the optional `components` i18n channel
 * with a documented English floor.
 *
 * @example
 * <ModernModerationGallery
 *   items={[{ id: '1', thumbnailUrl: '/img/photo1.jpg', type: 'image',
 *     status: 'pending', uploadedBy: 'user42', uploadedAt: '2026-03-18T08:00:00Z' }]}
 *   selectable
 *   onApprove={(id) => approve(id)}
 *   onReject={(id) => reject(id)}
 *   onBulkAction={(action, ids) => moderate(action, ids)}
 * />
 */

import React, { useCallback, useState } from 'react';
import type { ModerationGalleryProps, ModerationItem, ModerationBulkAction } from '../../contracts';
import ModernButton from '../../../../../primitives/inputs/Button/engines/modern';
import ModernCheckbox from '../../../../../primitives/inputs/Checkbox/engines/modern';
import ModernBadge from '../../../../../primitives/display/Badge/engines/modern';
import ModernAvatar from '../../../../../primitives/display/Avatar/engines/modern';
import ModernConfirmDialog from '../../../../../primitives/overlay/ConfirmDialog/engines/modern';
import { ModernEmptyState } from '../../../../facade';
import { VisuallyHidden } from '../../../../../primitives/foundation/VisuallyHidden';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { ActionConfirmIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-confirm';
import { ActionCloseIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-close';
import { ActionPlayIcon } from '@/graphics/icons/presentation/semantic/generated/roles/action-play';
import { StatusPendingIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-pending';
import { StatusSuccessIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-success';
import { StatusErrorIcon } from '@/graphics/icons/presentation/semantic/generated/roles/status-error';

/** Moderation status → shared approval recipe (tone + icon + label). */
const STATUS_TONE: Record<ModerationItem['status'], 'neutral' | 'success' | 'danger'> = {
  pending: 'neutral',
  approved: 'success',
  rejected: 'danger',
};

const STATUS_ICON: Record<ModerationItem['status'], React.ReactNode> = {
  pending: <StatusPendingIcon decorative size={12} />,
  approved: <StatusSuccessIcon decorative size={12} />,
  rejected: <StatusErrorIcon decorative size={12} />,
};

const STATUS_FLOOR: Record<ModerationItem['status'], string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

/** Runtime thenable guard: `void` callbacks pass straight through. */
function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    value != null &&
    typeof (value as PromiseLike<unknown>).then === 'function'
  );
}

/**
 * A single moderation card: media thumbnail with status badge, media-type
 * indicator, selection checkbox and the governed actions overlay; footer with
 * uploader identity, relative upload time and tabular engagement.
 */
function ModerationCard({
  item,
  selectable,
  selected,
  pendingAction,
  anyPending,
  onToggle,
  onApprove,
  onReject,
  t,
}: {
  item: ModerationItem;
  selectable: boolean;
  selected: boolean;
  pendingAction: 'approve' | 'reject' | null;
  anyPending: boolean;
  onToggle: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  t: (key: string, floor: string, params?: Record<string, string | number>) => string;
}) {
  const uploaded = (() => {
    const diffMin = Math.floor((Date.now() - new Date(item.uploadedAt).getTime()) / 60_000);
    if (diffMin < 1) return t('moderationGallery.uploaded.justNow', 'just now');
    if (diffMin < 60) {
      return t('moderationGallery.uploaded.minutesAgo', `${diffMin}m ago`, { count: diffMin });
    }
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return t('moderationGallery.uploaded.hoursAgo', `${diffHr}h ago`, { count: diffHr });
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return t('moderationGallery.uploaded.daysAgo', `${diffDay}d ago`, { count: diffDay });
    return new Date(item.uploadedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  })();

  return (
    <div
      data-part="card"
      data-status={item.status}
      data-selected={selected || undefined}
      role="listitem"
    >
      <div data-part="card-media">
        <img
          data-part="card-thumbnail"
          src={item.thumbnailUrl}
          alt={t('moderationGallery.mediaAlt', `Media by ${item.uploadedBy}`, { uploader: item.uploadedBy })}
          loading="lazy"
        />

        {/* Media type indicator: governed icon + sr label (never chrome-only). */}
        {item.type === 'video' && (
          <span data-part="card-type" data-type="video">
            <ActionPlayIcon decorative size={12} data-part="card-type-icon" />
            <VisuallyHidden>{t('moderationGallery.type.video', 'Video')}</VisuallyHidden>
          </span>
        )}

        {/* Status overlay: shared approval recipe. */}
        <span data-part="card-status">
          <ModernBadge
            kind="pill"
            size="sm"
            tone={STATUS_TONE[item.status]}
            icon={STATUS_ICON[item.status]}
            data-part="card-status-badge"
            data-status={item.status}
            content={t(`moderationGallery.status.${item.status}`, STATUS_FLOOR[item.status])}
          />
        </span>

        {selectable && (
          <span data-part="card-select">
            <ModernCheckbox
              checked={selected}
              onChange={() => onToggle(item.id)}
              aria-label={t('moderationGallery.selectItem', `Select media by ${item.uploadedBy}`, { uploader: item.uploadedBy })}
            />
          </span>
        )}

        {/* Governed actions overlay (always in the DOM; the skin owns the
            reveal). Approve hides once approved, reject once rejected. */}
        {(onApprove || onReject) && (
          <div data-part="card-actions">
            {onApprove && item.status !== 'approved' && (
              <ModernButton
                variant="ghost"
                size="sm"
                data-part="card-action-button"
                data-action="approve"
                icon={<ActionConfirmIcon decorative size={14} />}
                pending={pendingAction === 'approve'}
                pendingLabel={t('moderationGallery.approving', 'Approving…')}
                disabled={anyPending && pendingAction !== 'approve'}
                aria-label={t('moderationGallery.approveItem', `Approve media by ${item.uploadedBy}`, { uploader: item.uploadedBy })}
                onClick={() => onApprove(item.id)}
              >
                {t('moderationGallery.approve', 'Approve')}
              </ModernButton>
            )}
            {onReject && item.status !== 'rejected' && (
              <ModernButton
                variant="ghost"
                size="sm"
                data-part="card-action-button"
                data-action="reject"
                icon={<ActionCloseIcon decorative size={14} />}
                pending={pendingAction === 'reject'}
                pendingLabel={t('moderationGallery.rejecting', 'Rejecting…')}
                disabled={anyPending && pendingAction !== 'reject'}
                aria-label={t('moderationGallery.rejectItem', `Reject media by ${item.uploadedBy}`, { uploader: item.uploadedBy })}
                onClick={() => onReject(item.id)}
              >
                {t('moderationGallery.reject', 'Reject')}
              </ModernButton>
            )}
          </div>
        )}
      </div>

      <div data-part="card-footer">
        <span data-part="card-uploader">
          <ModernAvatar name={item.uploadedBy} size="xs" data-part="card-avatar" />
          <span data-part="card-uploader-name">{item.uploadedBy}</span>
        </span>
        <span data-part="card-meta">
          <span data-part="card-uploaded-at">{uploaded}</span>
          {item.engagement != null && (
            <span data-part="card-engagement">
              {t('moderationGallery.views', `${item.engagement.toLocaleString()} views`, { count: item.engagement })}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

/**
 * Modern engine for the ModerationGallery pattern (see the module docblock).
 *
 * @param props - {@link ModerationGalleryProps}
 * @returns An intrinsic media grid with status overlays and bulk triage.
 */
export default function ModernModerationGallery(props: ModerationGalleryProps) {
  const translation = useOptionalTranslation('components');
  const t = (key: string, floor: string, params?: Record<string, string | number>): string =>
    translation?.tOr(key, floor, params) ?? floor;

  const {
    items,
    onApprove,
    onReject,
    onBulkAction,
    selectable = false,
    emptyMessage,
    loading,
    className,
    style,
  } = props;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  /** Per-card async action in flight (held until a returned thenable settles). */
  const [pendingItem, setPendingItem] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);
  const [bulkPending, setBulkPending] = useState(false);
  /** Destructive bulk reject is gated by the composed ConfirmDialog. */
  const [confirmBulkReject, setConfirmBulkReject] = useState(false);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /** Runs a card action, holding the governed busy state while it settles. */
  const runItemAction = useCallback(
    (id: string, action: 'approve' | 'reject', callback: ((id: string) => void) | undefined) => {
      if (!callback || pendingItem) return;
      const result: unknown = callback(id);
      if (isThenable(result)) {
        setPendingItem({ id, action });
        Promise.resolve(result).finally(() => setPendingItem(null));
      }
    },
    [pendingItem]
  );

  /** Runs a bulk action, clearing the selection once it settles. */
  const runBulkAction = useCallback(
    (action: ModerationBulkAction) => {
      if (!onBulkAction || bulkPending || selectedIds.size === 0) return;
      const ids = Array.from(selectedIds);
      const result: unknown = onBulkAction(action, ids);
      if (isThenable(result)) {
        setBulkPending(true);
        Promise.resolve(result).finally(() => {
          setBulkPending(false);
          setSelectedIds(new Set());
        });
      } else {
        setSelectedIds(new Set());
      }
    },
    [onBulkAction, bulkPending, selectedIds]
  );

  const rootClassName = ['ds-pattern-moderation-gallery', 'ds-engine-modern', className]
    .filter(Boolean)
    .join(' ');

  /* Skeleton keeps the intrinsic grid footprint (square media cells). */
  if (loading) {
    return (
      <div className={rootClassName} data-part="root" data-loading="true" style={style}>
        <div data-part="skeleton-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`skel-${i}`} data-part="skeleton-card">
              <div data-part="skeleton-media" />
              <div data-part="skeleton-footer">
                <div data-part="skeleton-line" data-width="half" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={rootClassName} data-part="root" data-loading="false" style={style}>
        <div data-part="empty">
          <ModernEmptyState
            title={emptyMessage ?? t('moderationGallery.empty', 'No media items to review')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={rootClassName} data-part="root" data-loading="false" style={style}>
      {/* Bulk toolbar appears only while a selection exists. Reject is the
          destructive path: it arms the composed ConfirmDialog instead of
          firing the callback directly. */}
      {selectable && selectedIds.size > 0 && onBulkAction && (
        <div
          data-part="bulk-toolbar"
          role="region"
          aria-label={t('moderationGallery.bulkRegion', 'Bulk actions')}
        >
          <span data-part="bulk-count" aria-live="polite">
            {t('moderationGallery.selectedCount', `${selectedIds.size} selected`, { count: selectedIds.size })}
          </span>
          <ModernButton
            variant="primary"
            size="sm"
            data-part="bulk-approve-button"
            icon={<ActionConfirmIcon decorative size={14} />}
            pending={bulkPending}
            pendingLabel={t('moderationGallery.approving', 'Approving…')}
            onClick={() => runBulkAction('approve')}
          >
            {t('moderationGallery.approveAll', 'Approve all')}
          </ModernButton>
          <ModernButton
            variant="ghost"
            size="sm"
            danger
            data-part="bulk-reject-button"
            icon={<ActionCloseIcon decorative size={14} />}
            disabled={bulkPending}
            onClick={() => setConfirmBulkReject(true)}
          >
            {t('moderationGallery.rejectAll', 'Reject all')}
          </ModernButton>
          <ModernButton
            variant="ghost"
            size="sm"
            data-part="bulk-clear-button"
            disabled={bulkPending}
            onClick={() => setSelectedIds(new Set())}
          >
            {t('moderationGallery.clear', 'Clear')}
          </ModernButton>
        </div>
      )}

      <div data-part="grid" role="list">
        {items.map((item) => (
          <ModerationCard
            key={item.id}
            item={item}
            selectable={selectable}
            selected={selectedIds.has(item.id)}
            pendingAction={pendingItem?.id === item.id ? pendingItem.action : null}
            anyPending={pendingItem !== null || bulkPending}
            onToggle={toggleSelection}
            onApprove={onApprove ? (id) => runItemAction(id, 'approve', onApprove) : undefined}
            onReject={onReject ? (id) => runItemAction(id, 'reject', onReject) : undefined}
            t={t}
          />
        ))}
      </div>

      {confirmBulkReject && (
        <ModernConfirmDialog
          open
          variant="danger"
          title={t('moderationGallery.confirmRejectTitle', 'Reject selected media')}
          description={t(
            'moderationGallery.confirmRejectDescription',
            `Reject ${selectedIds.size} selected item(s)? This marks them as rejected.`,
            { count: selectedIds.size }
          )}
          confirmLabel={t('moderationGallery.rejectAll', 'Reject all')}
          cancelLabel={t('moderationGallery.cancel', 'Cancel')}
          onConfirm={() => {
            setConfirmBulkReject(false);
            runBulkAction('reject');
          }}
          onCancel={() => setConfirmBulkReject(false)}
        />
      )}
    </div>
  );
}
