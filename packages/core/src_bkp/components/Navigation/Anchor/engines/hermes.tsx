'use client';

/**
 * Hermes Anchor Engine
 *
 * DaisyUI implementation with scroll tracking.
 */

import { useState, useEffect, useCallback } from 'react';
import type { AnchorProps, AnchorLinkItem } from '../../../../types/components/anchor';
import { scrollToAnchor, getActiveAnchor, flattenItems } from '../../../../types/components/anchor';

/**
 * Hermes Anchor - DaisyUI implementation
 */
function HermesAnchor({
  items = [],
  className = '',
  style,
  onChange,
  onClick,
  offsetTop = 0,
  bounds = 5,
  direction = 'vertical',
}: AnchorProps) {
  const [activeHref, setActiveHref] = useState<string>('');

  // Handle scroll to update active anchor
  useEffect(() => {
    const handleScroll = () => {
      const active = getActiveAnchor(items, offsetTop, bounds);
      if (active !== activeHref) {
        setActiveHref(active);
        onChange?.(active);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [items, offsetTop, bounds, activeHref, onChange]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, item: AnchorLinkItem) => {
      e.preventDefault();
      onClick?.(e, { title: item.title, href: item.href });
      scrollToAnchor(item.href, offsetTop);
      setActiveHref(item.href);
      onChange?.(item.href);
    },
    [onClick, onChange, offsetTop]
  );

  const renderLink = (item: AnchorLinkItem, depth = 0) => {
    const isActive = activeHref === item.href;
    const linkClasses = [
      'block py-1 text-sm transition-colors',
      isActive ? 'text-primary font-medium' : 'text-base-content/70 hover:text-primary',
    ].filter(Boolean).join(' ');

    return (
      <div key={item.key || item.href} style={{ paddingLeft: depth > 0 ? `${depth * 12}px` : 0 }}>
        <a
          href={item.href}
          className={linkClasses}
          onClick={(e) => handleClick(e, item)}
        >
          {item.title}
        </a>
        {item.children?.map((child) => renderLink(child, depth + 1))}
      </div>
    );
  };

  const containerClasses = [
    direction === 'horizontal' ? 'flex flex-row gap-4' : 'flex flex-col gap-1',
    'border-l-2 border-base-300 pl-3',
    className,
  ].filter(Boolean).join(' ');

  return (
    <nav className={containerClasses} style={style}>
      {items.map((item) => renderLink(item))}
    </nav>
  );
}

HermesAnchor.displayName = 'HermesAnchor';

export default HermesAnchor;
