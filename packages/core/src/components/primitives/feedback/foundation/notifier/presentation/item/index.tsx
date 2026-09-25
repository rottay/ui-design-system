'use client';

/**
 * @fileoverview The notifier surface - Rottay Design System.
 *
 * One surface for every announcement role. It stamps role, tone, lifetime and
 * presence on the `ds-notifier` anatomy, decides its controls' interaction
 * state through the shared kernel, and leaves every visual decision to the
 * modern notifier skin.
 *
 * @module Notifier/Presentation/Item
 * @category Feedback
 * @package @rottay/design-system
 */

import React, { useCallback, useEffect } from 'react';
import { partAttributes } from '@/foundation/behavior/kernel/anatomy';
import { useInteractionState } from '@/foundation/behavior/runtime/interaction-state';
import { isComposingKey } from '@/foundation/behavior/runtime/submit-intent';
import { StatusInfoIcon } from '@/graphics/icons/semantic/generated/roles/status-info';
import { StatusSuccessIcon } from '@/graphics/icons/semantic/generated/roles/status-success';
import { StatusWarningIcon } from '@/graphics/icons/semantic/generated/roles/status-warning';
import { StatusErrorIcon } from '@/graphics/icons/semantic/generated/roles/status-error';
import { CommunicationNotificationIcon } from '@/graphics/icons/semantic/generated/roles/communication-notification';
import { ActionCloseIcon } from '@/graphics/icons/semantic/generated/roles/action-close';
import type { NotifierItemProps, NotifierRole, NotifierTone } from '../../contracts';
import { useNotifierCountdown } from '../../runtime/countdown';
import { useNotifierExit } from '../../runtime/exit';

const GLYPH_SIZE: Record<NotifierRole, number> = { toast: 20, notification: 20, message: 18 };

function toneGlyph(tone: NotifierTone, role: NotifierRole): React.ReactNode {
  const size = GLYPH_SIZE[role];
  switch (tone) {
    case 'success':
      return <StatusSuccessIcon decorative size={size} />;
    case 'error':
      return <StatusErrorIcon decorative size={size} />;
    case 'warning':
      return <StatusWarningIcon decorative size={size} />;
    case 'info':
      return <StatusInfoIcon decorative size={size} />;
    case 'loading':
      return <span data-part="spinner" />;
    default:
      return role === 'message' ? <StatusInfoIcon decorative size={size} /> : <CommunicationNotificationIcon decorative size={size} />;
  }
}

function NotifierControl({
  part,
  onClick,
  children,
  'aria-label': ariaLabel,
}: {
  part: 'action' | 'close-button';
  children?: React.ReactNode;
  'aria-label'?: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const interaction = useInteractionState();
  return (
    <button type="button" aria-label={ariaLabel} {...partAttributes(part, interaction.state)} {...interaction.handlers} onClick={onClick}>
      {children}
    </button>
  );
}

const INTERACTIVE_ORIGIN = 'button, a[href], input, select, textarea, [role="button"], [role="link"]';

export function NotifierItem({
  role,
  tone,
  title,
  description,
  children,
  icon,
  closable = true,
  closeIcon,
  closeLabel,
  action,
  actions,
  duration,
  showProgress = true,
  pauseOnHover = true,
  open = true,
  onDismiss,
  onExited,
  onActivate,
  dismissOnEscape = true,
  announce,
  live,
  radius,
  elevated = true,
  id,
  className,
  style,
  'data-testid': dataTestId,
  itemKey,
  revision,
}: NotifierItemProps): React.ReactElement {
  const exit = useNotifierExit<HTMLDivElement>(() => onExited?.());
  const { begin, cancel } = exit;

  const dismiss = useCallback(() => {
    if (exit.leaving) return;
    onDismiss?.();
    begin();
  }, [exit.leaving, onDismiss, begin]);

  useEffect(() => {
    if (open) cancel();
    else begin();
  }, [open, revision, begin, cancel]);

  const countdown = useNotifierCountdown({
    durationMs: duration,
    running: open && !exit.leaving,
    pauseOnHover,
    revision,
    onExpire: dismiss,
  });

  const clickable = onActivate !== undefined;
  const surface = useInteractionState();

  const handleActivate = (event: React.MouseEvent<HTMLDivElement>) => {
    const origin = event.target as HTMLElement | null;
    if (origin !== event.currentTarget && origin?.closest?.(INTERACTIVE_ORIGIN)) return;
    onActivate?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      if (closable && dismissOnEscape && !isComposingKey(event)) dismiss();
      return;
    }
    if (clickable && event.currentTarget === event.target && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onActivate?.();
    }
  };

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    countdown.handlers.onFocus?.();
    if (clickable && event.target === event.currentTarget) surface.handlers.onFocus(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    countdown.handlers.onBlur?.(event);
    if (clickable && event.target === event.currentTarget) surface.handlers.onBlur(event);
  };

  const glyph = icon === null ? null : (icon ?? toneGlyph(tone, role));
  const lifetime = duration > 0 && showProgress;

  return (
    <div
      ref={exit.ref}
      id={id}
      data-testid={dataTestId}
      data-notifier-key={itemKey}
      {...partAttributes('root', clickable ? surface.state : {})}
      data-variant={role}
      data-tone={tone}
      data-open={exit.leaving ? 'false' : 'true'}
      data-paused={countdown.paused ? 'true' : 'false'}
      data-clickable={clickable ? 'true' : undefined}
      data-radius={radius}
      data-elevated={elevated ? undefined : 'false'}
      data-has-title={title ? 'true' : 'false'}
      className={`ds-notifier ds-notifier--modern ${className ?? ''}`.trim()}
      style={
        lifetime ? ({ '--ds-notifier-lifetime': `${duration}ms`, ...style } as React.CSSProperties) : style
      }
      role={announce}
      aria-live={live}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? handleActivate : undefined}
      onPointerEnter={clickable ? surface.handlers.onPointerEnter : undefined}
      onPointerLeave={clickable ? surface.handlers.onPointerLeave : undefined}
      onPointerDown={clickable ? surface.handlers.onPointerDown : undefined}
      onPointerUp={clickable ? surface.handlers.onPointerUp : undefined}
      onMouseEnter={countdown.handlers.onMouseEnter}
      onMouseLeave={countdown.handlers.onMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onAnimationEnd={exit.onAnimationEnd}
    >
      <div data-part="layout">
        {glyph ? <span data-part="icon">{glyph}</span> : null}
        <div data-part="body">
          {title ? <div data-part="title">{title}</div> : null}
          {description ? <div data-part="description">{description}</div> : null}
          {children ? <div data-part="content">{children}</div> : null}
          {actions ? <div data-part="actions">{actions}</div> : null}
        </div>
        {action || closable ? (
          <div data-part="controls">
            {action ? (
              <NotifierControl
                part="action"
                onClick={() => {
                  action.onClick();
                  if (action.closeOnClick !== false) dismiss();
                }}
              >
                {action.label}
              </NotifierControl>
            ) : null}
            {closable ? (
              <NotifierControl
                part="close-button"
                aria-label={closeLabel}
                onClick={(event) => {
                  event.stopPropagation();
                  dismiss();
                }}
              >
                {closeIcon ?? <ActionCloseIcon decorative size={role === 'message' ? 14 : 16} />}
              </NotifierControl>
            ) : null}
          </div>
        ) : null}
      </div>
      {lifetime ? <span data-part="progress" aria-hidden="true" /> : null}
    </div>
  );
}

NotifierItem.displayName = 'NotifierItem';
