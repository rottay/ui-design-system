'use client';

/**
 * Apollo Anchor Engine
 *
 * Native HTML + Tailwind CSS implementation.
 */

import { useState, useEffect, useCallback } from 'react';
import type { AnchorProps, AnchorLinkItem } from '../../../../types/components/anchor';
import { scrollToAnchor, getActiveAnchor } from '../../../../types/components/anchor';

/**
 * Apollo Anchor - Native HTML + Tailwind implementation
 */
function ApolloAnchor({
  items = [],
  className = '',
  style,
  onChange,
  onClick,
  offsetTop = 0,
  bounds = 5,
  direction = 'vertical',
  showInkInFixed = true,
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
      'relative block py-1.5 px-3 text-sm transition-all duration-200 rounded-md',
      isActive
        ? 'text-blue-600 font-medium bg-blue-50'
        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50',
      item.className,
    ].filter(Boolean).join(' ');

    return (
      <div key={item.key || item.href} style={{ paddingLeft: depth > 0 ? `${depth * 16}px` : 0 }}>
        <a
          href={item.href}
          className={linkClasses}
          onClick={(e) => handleClick(e, item)}
        >
          {showInkInFixed && isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-blue-600 rounded-full" />
          )}
          {item.title}
        </a>
        {item.children?.map((child) => renderLink(child, depth + 1))}
      </div>
    );
  };

  const containerClasses = [
    direction === 'horizontal' ? 'flex flex-row gap-2' : 'flex flex-col gap-0.5',
    'border-l-2 border-gray-200 pl-2',
    className,
  ].filter(Boolean).join(' ');

  return (
    <nav className={containerClasses} style={style}>
      {items.map((item) => renderLink(item))}
    </nav>
  );
}

ApolloAnchor.displayName = 'ApolloAnchor';

export default ApolloAnchor;
