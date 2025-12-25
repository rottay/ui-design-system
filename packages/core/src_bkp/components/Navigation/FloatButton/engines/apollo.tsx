'use client';

/**
 * Apollo FloatButton Engine
 *
 * Native HTML + Tailwind CSS implementation.
 */

import { useState, useCallback, useEffect } from 'react';
import type { FloatButtonProps, FloatButtonGroupProps, FloatButtonBackTopProps } from '../../../../types/components/floatbutton';
import { scrollToTop, getScrollTop } from '../../../../types/components/backtop';

/**
 * Apollo FloatButton - Native HTML + Tailwind implementation
 */
function ApolloFloatButton({
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
  const baseClasses = [
    'fixed right-6 bottom-6 z-50',
    'shadow-lg transition-all duration-200',
    'flex items-center justify-center gap-2',
    'hover:shadow-xl hover:scale-105 active:scale-95',
    shape === 'circle' ? 'rounded-full w-12 h-12' : 'rounded-lg px-4 py-3',
    type === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700'
      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200',
    className,
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {icon && <span className="text-lg">{icon}</span>}
      {description && shape !== 'circle' && <span className="text-sm font-medium">{description}</span>}
      {badge?.dot && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />}
      {badge?.count !== undefined && badge.count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {badge.count > 99 ? '99+' : badge.count}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} target={target} className={baseClasses} style={style} title={String(tooltip || '')}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={baseClasses} style={style} onClick={onClick} title={String(tooltip || '')}>
      {content}
    </button>
  );
}

ApolloFloatButton.displayName = 'ApolloFloatButton';

/**
 * Apollo FloatButton.Group
 */
function ApolloFloatButtonGroup({
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

  const mainBtnClasses = [
    'shadow-lg transition-all duration-200',
    'flex items-center justify-center',
    'hover:shadow-xl hover:scale-105 active:scale-95',
    shape === 'circle' ? 'rounded-full w-12 h-12' : 'rounded-lg px-4 py-3',
    type === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700'
      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={`fixed right-6 bottom-6 z-50 flex flex-col-reverse items-center gap-3 ${className}`}
      style={style}
      onMouseEnter={trigger === 'hover' ? toggle : undefined}
      onMouseLeave={trigger === 'hover' ? toggle : undefined}
    >
      {isOpen && (
        <div className="flex flex-col-reverse gap-2 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {children}
        </div>
      )}
      <button type="button" className={mainBtnClasses} onClick={trigger === 'click' ? toggle : undefined}>
        {isOpen && closeIcon ? closeIcon : icon}
      </button>
    </div>
  );
}

ApolloFloatButtonGroup.displayName = 'ApolloFloatButtonGroup';

/**
 * Apollo FloatButton.BackTop
 */
function ApolloFloatButtonBackTop({
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
    <ApolloFloatButton
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

ApolloFloatButtonBackTop.displayName = 'ApolloFloatButtonBackTop';

// Attach subcomponents
ApolloFloatButton.Group = ApolloFloatButtonGroup;
ApolloFloatButton.BackTop = ApolloFloatButtonBackTop;

export default ApolloFloatButton;
