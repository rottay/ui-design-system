'use client';

/**
 * Hermes FloatButton Engine
 *
 * DaisyUI implementation with unified FloatButtonProps.
 */

import { useState, useCallback, useEffect } from 'react';
import type { FloatButtonProps, FloatButtonGroupProps, FloatButtonBackTopProps } from '../../../../types/components/floatbutton';
import { scrollToTop, getScrollTop } from '../../../../types/components/backtop';

/**
 * Hermes FloatButton - DaisyUI implementation
 */
function HermesFloatButton({
  icon,
  description,
  tooltip,
  className = '',
  style,
  onClick,
  type = 'default',
  shape = 'circle',
  badge,
  href,
  target,
}: FloatButtonProps) {
  const typeClasses = type === 'primary' ? 'btn-primary' : 'btn-neutral';
  const shapeClasses = shape === 'circle' ? 'btn-circle' : 'rounded-lg';
  const btnClasses = `btn ${typeClasses} ${shapeClasses} shadow-lg fixed right-6 bottom-6 z-50 ${className}`;

  const content = (
    <>
      {icon}
      {description && shape !== 'circle' && <span>{description}</span>}
      {badge?.dot && <span className="absolute top-0 right-0 w-3 h-3 bg-error rounded-full" />}
      {badge?.count !== undefined && badge.count > 0 && (
        <span className="absolute -top-1 -right-1 badge badge-error badge-sm">{badge.count > 99 ? '99+' : badge.count}</span>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} target={target} className={btnClasses} style={style} title={String(tooltip || '')}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={btnClasses} style={style} onClick={onClick} title={String(tooltip || '')}>
      {content}
    </button>
  );
}

HermesFloatButton.displayName = 'HermesFloatButton';

/**
 * Hermes FloatButton.Group
 */
function HermesFloatButtonGroup({
  trigger = 'click',
  open: controlledOpen,
  onOpenChange,
  icon,
  closeIcon,
  type = 'default',
  shape = 'circle',
  className = '',
  style,
  children,
}: FloatButtonGroupProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;

  const toggle = useCallback(() => {
    const newOpen = !isOpen;
    setInternalOpen(newOpen);
    onOpenChange?.(newOpen);
  }, [isOpen, onOpenChange]);

  const typeClasses = type === 'primary' ? 'btn-primary' : 'btn-neutral';
  const shapeClasses = shape === 'circle' ? 'btn-circle' : 'rounded-lg';

  return (
    <div
      className={`fixed right-6 bottom-6 z-50 flex flex-col-reverse items-center gap-3 ${className}`}
      style={style}
      onMouseEnter={trigger === 'hover' ? toggle : undefined}
      onMouseLeave={trigger === 'hover' ? toggle : undefined}
    >
      {isOpen && <div className="flex flex-col-reverse gap-2 mb-2">{children}</div>}
      <button
        type="button"
        className={`btn ${typeClasses} ${shapeClasses} shadow-lg`}
        onClick={trigger === 'click' ? toggle : undefined}
      >
        {isOpen && closeIcon ? closeIcon : icon}
      </button>
    </div>
  );
}

HermesFloatButtonGroup.displayName = 'HermesFloatButtonGroup';

/**
 * Hermes FloatButton.BackTop
 */
function HermesFloatButtonBackTop({
  visibilityHeight = 400,
  target,
  duration = 450,
  icon,
  className = '',
  style,
  onClick,
  ...props
}: FloatButtonBackTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const scrollTarget = target?.() ?? window;
    const handleScroll = () => setVisible(getScrollTop(scrollTarget) > visibilityHeight);
    scrollTarget.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => scrollTarget.removeEventListener('scroll', handleScroll);
  }, [visibilityHeight, target]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    scrollToTop(target?.() ?? window, duration);
    onClick?.(e);
  }, [target, duration, onClick]);

  if (!visible) return null;

  return (
    <HermesFloatButton
      icon={icon ?? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      )}
      className={className}
      style={style}
      onClick={handleClick}
      {...props}
    />
  );
}

HermesFloatButtonBackTop.displayName = 'HermesFloatButtonBackTop';

// Attach subcomponents
HermesFloatButton.Group = HermesFloatButtonGroup;
HermesFloatButton.BackTop = HermesFloatButtonBackTop;

export default HermesFloatButton;
