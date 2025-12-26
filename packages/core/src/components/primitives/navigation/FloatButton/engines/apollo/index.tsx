'use client';

/**
 * FloatButton - Apollo Engine (Vanilla HTML/CSS)
 */
import React, { useState, useEffect } from 'react';
import type { FloatButtonProps, FloatButtonGroupProps, FloatButtonBackTopProps } from '../../types';
import { FLOAT_BUTTON_DEFAULTS } from '../../types';

const styles = {
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.2s',
    position: 'relative',
  } as React.CSSProperties,
  buttonCircle: {
    width: 48,
    height: 48,
    borderRadius: '50%',
  } as React.CSSProperties,
  buttonSquare: {
    width: 48,
    height: 48,
    borderRadius: 8,
  } as React.CSSProperties,
  buttonDefault: {
    backgroundColor: '#fff',
    color: '#595959',
  } as React.CSSProperties,
  buttonPrimary: {
    backgroundColor: '#1890ff',
    color: '#fff',
  } as React.CSSProperties,
  buttonHover: {
    transform: 'scale(1.05)',
  } as React.CSSProperties,
  fixed: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 1000,
  } as React.CSSProperties,
  group: {
    display: 'flex',
    flexDirection: 'column-reverse',
    alignItems: 'center',
    gap: 8,
  } as React.CSSProperties,
  groupItems: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    transition: 'all 0.2s',
  } as React.CSSProperties,
  groupItemsHidden: {
    opacity: 0,
    transform: 'translateY(16px)',
    pointerEvents: 'none',
  } as React.CSSProperties,
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    padding: '0 4px',
    fontSize: 12,
    lineHeight: '18px',
    textAlign: 'center',
    backgroundColor: '#ff4d4f',
    color: '#fff',
    borderRadius: 9,
  } as React.CSSProperties,
  badgeDot: {
    width: 8,
    height: 8,
    padding: 0,
    minWidth: 8,
  } as React.CSSProperties,
  description: {
    fontSize: 12,
    marginTop: 2,
  } as React.CSSProperties,
};

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
      className,
      style,
      children,
    } = props;

    const [isHovered, setIsHovered] = useState(false);

    const buttonStyle = {
      ...styles.button,
      ...(shape === 'circle' ? styles.buttonCircle : styles.buttonSquare),
      ...(type === 'primary' ? styles.buttonPrimary : styles.buttonDefault),
      ...(isHovered ? styles.buttonHover : {}),
      ...style,
    };

    const content = (
      <>
        {icon}
        {description && <span style={styles.description}>{description}</span>}
        {children}
        {badge?.dot && (
          <span style={{ ...styles.badge, ...styles.badgeDot }} />
        )}
        {badge?.count && (
          <span style={styles.badge}>
            {badge.count > 99 ? '99+' : badge.count}
          </span>
        )}
      </>
    );

    const commonProps = {
      className,
      style: buttonStyle,
      title: typeof tooltip === 'string' ? tooltip : undefined,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    };

    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          {...commonProps}
        >
          {content}
        </a>
      );
    }

    return (
      <button ref={ref} type="button" onClick={onClick} {...commonProps}>
        {content}
      </button>
    );
  }
);
FloatButton.displayName = 'FloatButton.Apollo';

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
      className,
      style,
    } = props;

    const [internalOpen, setInternalOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
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
        className={className}
        style={{
          ...styles.fixed,
          ...styles.group,
          ...style,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          type="button"
          onClick={trigger === 'click' ? handleToggle : undefined}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          title={typeof tooltip === 'string' ? tooltip : undefined}
          style={{
            ...styles.button,
            ...(shape === 'circle' ? styles.buttonCircle : styles.buttonSquare),
            ...(type === 'primary' ? styles.buttonPrimary : styles.buttonDefault),
            ...(isHovered ? styles.buttonHover : {}),
            zIndex: 10,
          }}
        >
          {isOpen ? (closeIcon ?? '×') : icon}
        </button>
        <div
          style={{
            ...styles.groupItems,
            ...(isOpen ? {} : styles.groupItemsHidden),
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);
Group.displayName = 'FloatButton.Group.Apollo';

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
      className,
      style,
    } = props;

    const [visible, setVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={className}
        style={{
          ...styles.button,
          ...styles.fixed,
          ...(shape === 'circle' ? styles.buttonCircle : styles.buttonSquare),
          ...(type === 'primary' ? styles.buttonPrimary : styles.buttonDefault),
          ...(isHovered ? styles.buttonHover : {}),
          ...style,
        }}
        title={typeof tooltip === 'string' ? tooltip : undefined}
      >
        {icon ?? '↑'}
        {description && <span style={styles.description}>{description}</span>}
      </button>
    );
  }
);
BackTop.displayName = 'FloatButton.BackTop.Apollo';

export default FloatButton;
