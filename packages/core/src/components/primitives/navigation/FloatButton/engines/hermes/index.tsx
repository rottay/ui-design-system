'use client';

/**
 * FloatButton - Hermes Engine (DaisyUI/Tailwind)
 */
import React, { useState, useEffect } from 'react';
import type { FloatButtonProps, FloatButtonGroupProps, FloatButtonBackTopProps } from '../../types';
import { FLOAT_BUTTON_DEFAULTS } from '../../types';

export const FloatButton = React.forwardRef<HTMLButtonElement, FloatButtonProps>(
  (props, ref) => {
    const {
      icon,
      description,
      tooltip,
      type = FLOAT_BUTTON_DEFAULTS.type,
      shape = FLOAT_BUTTON_DEFAULTS.shape,
      onClick,
      href,
      target,
      badge,
      className = '',
      style,
      children,
    } = props;

    const baseClasses = `btn ${
      shape === 'circle' ? 'btn-circle' : 'rounded-lg'
    } ${type === 'primary' ? 'btn-primary' : 'btn-ghost bg-base-100'} shadow-lg`;

    const content = (
      <>
        {icon}
        {description && <span className="text-xs">{description}</span>}
        {children}
        {badge?.dot && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full" />
        )}
        {badge?.count && (
          <span className="absolute -top-2 -right-2 badge badge-error badge-sm">
            {badge.count > 99 ? '99+' : badge.count}
          </span>
        )}
      </>
    );

    const buttonElement = href ? (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        target={target}
        className={`${baseClasses} ${className}`}
        style={style}
        title={typeof tooltip === 'string' ? tooltip : undefined}
      >
        {content}
      </a>
    ) : (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={`${baseClasses} ${className}`}
        style={style}
        title={typeof tooltip === 'string' ? tooltip : undefined}
      >
        {content}
      </button>
    );

    return buttonElement;
  }
);
FloatButton.displayName = 'FloatButton.Hermes';

export const Group = React.forwardRef<HTMLDivElement, FloatButtonGroupProps>(
  (props, ref) => {
    const {
      trigger = 'click',
      open: controlledOpen,
      onOpenChange,
      icon,
      closeIcon,
      shape = FLOAT_BUTTON_DEFAULTS.shape,
      type = FLOAT_BUTTON_DEFAULTS.type,
      tooltip,
      children,
      className = '',
      style,
    } = props;

    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = controlledOpen ?? internalOpen;

    const handleToggle = () => {
      const newOpen = !isOpen;
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    };

    const handleMouseEnter = () => {
      if (trigger === 'hover') {
        if (controlledOpen === undefined) {
          setInternalOpen(true);
        }
        onOpenChange?.(true);
      }
    };

    const handleMouseLeave = () => {
      if (trigger === 'hover') {
        if (controlledOpen === undefined) {
          setInternalOpen(false);
        }
        onOpenChange?.(false);
      }
    };

    return (
      <div
        ref={ref}
        className={`fixed bottom-6 right-6 flex flex-col-reverse items-center gap-2 ${className}`}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          type="button"
          onClick={trigger === 'click' ? handleToggle : undefined}
          className={`btn ${shape === 'circle' ? 'btn-circle' : 'rounded-lg'} ${
            type === 'primary' ? 'btn-primary' : 'btn-ghost bg-base-100'
          } shadow-lg z-10`}
          title={typeof tooltip === 'string' ? tooltip : undefined}
        >
          {isOpen ? (closeIcon ?? '×') : icon}
        </button>
        <div
          className={`flex flex-col items-center gap-2 transition-all duration-200 ${
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          {children}
        </div>
      </div>
    );
  }
);
Group.displayName = 'FloatButton.Group.Hermes';

export const BackTop = React.forwardRef<HTMLButtonElement, FloatButtonBackTopProps>(
  (props, ref) => {
    const {
      visibilityHeight = FLOAT_BUTTON_DEFAULTS.visibilityHeight,
      target,
      onClick,
      icon,
      description,
      type = FLOAT_BUTTON_DEFAULTS.type,
      shape = FLOAT_BUTTON_DEFAULTS.shape,
      tooltip,
      className = '',
      style,
    } = props;

    const [visible, setVisible] = useState(false);

    useEffect(() => {
      const container = target?.() ?? window;

      const handleScroll = () => {
        const scrollTop = container === window
          ? window.scrollY
          : (container as HTMLElement).scrollTop;
        setVisible(scrollTop >= visibilityHeight);
      };

      container.addEventListener('scroll', handleScroll);
      handleScroll();

      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }, [target, visibilityHeight]);

    const scrollToTop = () => {
      const container = target?.() ?? window;
      if (container === window) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        (container as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
      }
      onClick?.();
    };

    if (!visible) return null;

    return (
      <button
        ref={ref}
        type="button"
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 btn ${
          shape === 'circle' ? 'btn-circle' : 'rounded-lg'
        } ${type === 'primary' ? 'btn-primary' : 'btn-ghost bg-base-100'} shadow-lg transition-opacity duration-200 ${className}`}
        style={style}
        title={typeof tooltip === 'string' ? tooltip : undefined}
      >
        {icon ?? '↑'}
        {description && <span className="text-xs">{description}</span>}
      </button>
    );
  }
);
BackTop.displayName = 'FloatButton.BackTop.Hermes';

export default FloatButton;
