'use client';

/**
 * Anchor - Hermes Engine (DaisyUI/Tailwind)
 */
import React, { useState, useEffect, createContext, useContext, useCallback, Children, isValidElement } from 'react';
import type { AnchorProps, AnchorLinkProps } from '../../types';
import { ANCHOR_DEFAULTS } from '../../types';

interface AnchorContextValue {
  activeKey: string;
  onClick?: (e: React.MouseEvent, link: { title: React.ReactNode; href: string }) => void;
  direction: 'vertical' | 'horizontal';
}

const AnchorContext = createContext<AnchorContextValue | null>(null);

export const Link = React.forwardRef<HTMLAnchorElement, AnchorLinkProps>(
  (props, ref) => {
    const { href, title, target, children, className = '', style } = props;

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
      <div className={context?.direction === 'horizontal' ? 'inline-block' : ''}>
        <a
          ref={ref}
          href={href}
          target={target}
          onClick={handleClick}
          className={`block py-1 px-3 text-sm transition-colors ${
            isActive
              ? 'text-primary border-l-2 border-primary font-medium'
              : 'text-base-content/70 hover:text-primary border-l-2 border-transparent'
          } ${className}`}
          style={style}
        >
          {title}
        </a>
        {children && (
          <div className="ml-4">
            {children}
          </div>
        )}
      </div>
    );
  }
);
Link.displayName = 'Anchor.Link.Hermes';

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
      className = '',
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
          className={`${affix ? 'sticky top-0' : ''} ${
            direction === 'horizontal' ? 'flex gap-2' : ''
          } ${className}`}
          style={{ top: affix ? offsetTop : undefined, ...style }}
        >
          {children}
        </div>
      </AnchorContext.Provider>
    );
  }
);
Anchor.displayName = 'Anchor.Hermes';

export default Anchor;
