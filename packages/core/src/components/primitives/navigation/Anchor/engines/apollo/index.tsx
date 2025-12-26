'use client';

/**
 * Anchor - Apollo Engine (Vanilla HTML/CSS)
 */
import React, { useState, useEffect, createContext, useContext, useCallback, Children, isValidElement } from 'react';
import type { AnchorProps, AnchorLinkProps } from '../../types';
import { ANCHOR_DEFAULTS } from '../../types';

const styles = {
  container: {
    position: 'relative',
  } as React.CSSProperties,
  containerAffix: {
    position: 'sticky',
  } as React.CSSProperties,
  containerHorizontal: {
    display: 'flex',
    gap: 8,
  } as React.CSSProperties,
  link: {
    display: 'block',
    padding: '4px 12px',
    fontSize: 14,
    textDecoration: 'none',
    color: '#595959',
    borderLeft: '2px solid transparent',
    transition: 'color 0.2s, border-color 0.2s',
  } as React.CSSProperties,
  linkActive: {
    color: '#1890ff',
    borderLeftColor: '#1890ff',
    fontWeight: 500,
  } as React.CSSProperties,
  linkHover: {
    color: '#1890ff',
  } as React.CSSProperties,
  nested: {
    marginLeft: 16,
  } as React.CSSProperties,
};

interface AnchorContextValue {
  activeKey: string;
  onClick?: (e: React.MouseEvent, link: { title: React.ReactNode; href: string }) => void;
  direction: 'vertical' | 'horizontal';
}

const AnchorContext = createContext<AnchorContextValue | null>(null);

export const Link = React.forwardRef<HTMLAnchorElement, AnchorLinkProps>(
  (props, ref) => {
    const { href, title, target, children, className, style } = props;
    const [isHovered, setIsHovered] = useState(false);

    const context = useContext(AnchorContext);
    const isActive = context?.activeKey === href;

    const handleClick = (e: React.MouseEvent) => {
      context?.onClick?.(e, { title, href });

      if (!e.defaultPrevented) {
        e.preventDefault();
        const element = document.querySelector(href);
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    return (
      <div style={context?.direction === 'horizontal' ? { display: 'inline-block' } : undefined}>
        <a
          ref={ref}
          href={href}
          target={target}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={className}
          style={{
            ...styles.link,
            ...(isActive ? styles.linkActive : {}),
            ...(isHovered && !isActive ? styles.linkHover : {}),
            ...style,
          }}
        >
          {title}
        </a>
        {children && <div style={styles.nested}>{children}</div>}
      </div>
    );
  }
);
Link.displayName = 'Anchor.Link.Apollo';

export const Anchor = React.forwardRef<HTMLDivElement, AnchorProps>(
  (props, ref) => {
    const {
      getContainer,
      activeKey: controlledActiveKey,
      offsetTop = ANCHOR_DEFAULTS.offsetTop,
      bounds = ANCHOR_DEFAULTS.bounds,
      onChange,
      onClick,
      direction = ANCHOR_DEFAULTS.direction,
      affix = ANCHOR_DEFAULTS.affix,
      children,
      className,
      style,
    } = props;

    const [internalActiveKey, setInternalActiveKey] = useState('');
    const activeKey = controlledActiveKey ?? internalActiveKey;

    const getAnchors = useCallback((): string[] => {
      const anchors: string[] = [];
      const traverse = (nodes: React.ReactNode) => {
        Children.forEach(nodes, (child) => {
          if (isValidElement(child) && child.props.href) {
            anchors.push(child.props.href);
            if (child.props.children) {
              traverse(child.props.children);
            }
          }
        });
      };
      traverse(children);
      return anchors;
    }, [children]);

    useEffect(() => {
      const container = getContainer?.() ?? window;
      const anchors = getAnchors();

      const handleScroll = () => {
        const scrollTop = container === window
          ? window.scrollY
          : (container as HTMLElement).scrollTop;

        let currentAnchor = '';
        for (const anchor of anchors) {
          const element = document.querySelector(anchor);
          if (element) {
            const rect = element.getBoundingClientRect();
            const top = container === window
              ? rect.top + scrollTop
              : rect.top + (container as HTMLElement).scrollTop;

            if (scrollTop >= top - offsetTop - bounds) {
              currentAnchor = anchor;
            }
          }
        }

        if (currentAnchor !== internalActiveKey) {
          setInternalActiveKey(currentAnchor);
          onChange?.(currentAnchor);
        }
      };

      container.addEventListener('scroll', handleScroll);
      handleScroll();

      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }, [getContainer, getAnchors, offsetTop, bounds, onChange, internalActiveKey]);

    return (
      <AnchorContext.Provider value={{ activeKey, onClick, direction }}>
        <div
          ref={ref}
          className={className}
          style={{
            ...styles.container,
            ...(affix ? { ...styles.containerAffix, top: offsetTop } : {}),
            ...(direction === 'horizontal' ? styles.containerHorizontal : {}),
            ...style,
          }}
        >
          {children}
        </div>
      </AnchorContext.Provider>
    );
  }
);
Anchor.displayName = 'Anchor.Apollo';

export default Anchor;
