import React, { useState, useEffect } from 'react';
import { Input, Spin, Empty, theme } from 'antd';
import { Search, Clock } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { Kbd } from '../../components/HeroUI/Kbd';
import { ScrollShadow } from '../../components/HeroUI/ScrollShadow';
import type { SearchBarProps, SearchResult } from './types';

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  onSelect,
  results = [],
  recentSearches = [],
  loading = false,
  showShortcut = true,
  shortcutKey = 'K',
  maxResults = 8,
  className,
  style,
  autoFocus = false,
  allowClear = true,
}) => {
  const { token } = theme.useToken();
  const { template } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === shortcutKey.toLowerCase()) {
        e.preventDefault();
        setIsFocused(true);
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (showShortcut) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showShortcut, shortcutKey]);

  // Theme-specific container styles
  const getContainerStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'relative',
      width: '100%',
      maxWidth: 600,
    };

    return baseStyles;
  };

  // Theme-specific input styles
  const getInputStyles = (): React.CSSProperties => {
    switch (template) {
      case 'spotify':
        return {
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid transparent',
          borderRadius: 24,
          height: 40,
          color: '#FFFFFF',
          fontSize: 14,
        };
      case 'stripe':
        return {
          background: '#FFFFFF',
          border: `1px solid ${token.colorBorder}`,
          borderRadius: 6,
          height: 38,
          fontSize: 14,
        };
      case 'notion':
        return {
          background: 'rgba(242, 241, 238, 0.6)',
          border: '1px solid transparent',
          borderRadius: 3,
          height: 36,
          fontSize: 14,
        };
      case 'linear':
        return {
          background: 'rgba(0, 0, 0, 0.03)',
          border: `1px solid ${token.colorBorder}`,
          borderRadius: 8,
          height: 40,
          fontSize: 14,
        };
      case 'airbnb':
        return {
          background: '#FFFFFF',
          border: `1px solid ${token.colorBorder}`,
          borderRadius: 24,
          height: 48,
          fontSize: 14,
        };
      case 'slack':
        return {
          background: '#FFFFFF',
          border: `1px solid ${token.colorBorder}`,
          borderRadius: 6,
          height: 38,
          fontSize: 14,
        };
      case 'vercel':
        return {
          background: '#FFFFFF',
          border: `1px solid ${token.colorBorder}`,
          borderRadius: 8,
          height: 40,
          fontSize: 14,
        };
      default:
        return {
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorder}`,
          borderRadius: 8,
          height: 40,
        };
    }
  };

  // Theme-specific results panel styles
  const getResultsPanelStyles = (): React.CSSProperties => {
    switch (template) {
      case 'spotify':
        return {
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 8,
          background: '#282828',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          zIndex: 1000,
        };
      case 'stripe':
        return {
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 8,
          background: '#FFFFFF',
          borderRadius: 8,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
          border: `1px solid ${token.colorBorder}`,
          zIndex: 1000,
        };
      case 'notion':
        return {
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 4,
          background: '#FFFFFF',
          borderRadius: 3,
          boxShadow: 'rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.2) 0px 3px 6px, rgba(15, 15, 15, 0.4) 0px 9px 24px',
          zIndex: 1000,
        };
      case 'linear':
        return {
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 8,
          background: '#FFFFFF',
          borderRadius: 12,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          border: `1px solid ${token.colorBorder}`,
          zIndex: 1000,
        };
      default:
        return {
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 8,
          background: token.colorBgElevated,
          borderRadius: 8,
          boxShadow: token.boxShadow,
          zIndex: 1000,
        };
    }
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setIsOpen(value.length > 0 || recentSearches.length > 0);
    onSearch?.(value);
  };

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setSearchValue('');
    onSelect?.(result);
  };

  const displayResults = results.slice(0, maxResults);
  const showRecent = searchValue.length === 0 && recentSearches.length > 0;

  return (
    <div className={className} style={{ ...getContainerStyles(), ...style }}>
      <Input
        prefix={<Search size={18} style={{ color: token.colorTextSecondary }} />}
        suffix={
          showShortcut && !isFocused ? (
            <Kbd keys={['Ctrl', shortcutKey]} size="sm" />
          ) : null
        }
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => {
          setIsFocused(true);
          setIsOpen(true);
        }}
        onBlur={() => {
          setIsFocused(false);
          setTimeout(() => setIsOpen(false), 200);
        }}
        autoFocus={autoFocus}
        allowClear={allowClear}
        style={getInputStyles()}
      />

      {isOpen && (
        <div style={{ ...getResultsPanelStyles(), overflow: 'hidden' }}>
          <ScrollShadow style={{ maxHeight: 400 }}>
            {loading ? (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <Spin />
              </div>
            ) : showRecent ? (
              <div style={{ padding: 8 }}>
                <div
                  style={{
                    padding: '8px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: token.colorTextSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Recent Searches
                </div>
                {recentSearches.map((search, index) => (
                <div
                  key={index}
                  onClick={() => handleSearch(search)}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    borderRadius: template === 'notion' ? 3 : 6,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      template === 'spotify'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : token.controlItemBgHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Clock size={16} style={{ color: token.colorTextSecondary }} />
                  <span style={{ flex: 1, fontSize: 14 }}>{search}</span>
                </div>
              ))}
            </div>
          ) : displayResults.length > 0 ? (
            <div style={{ padding: 8 }}>
              {displayResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  style={{
                    padding: '12px',
                    cursor: 'pointer',
                    borderRadius: template === 'notion' ? 3 : 6,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      template === 'spotify'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : token.controlItemBgHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    {result.icon && (
                      <div style={{ color: token.colorTextSecondary, marginTop: 2 }}>
                        {result.icon}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                        {result.title}
                      </div>
                      {result.description && (
                        <div
                          style={{
                            fontSize: 13,
                            color: token.colorTextSecondary,
                            lineHeight: 1.4,
                          }}
                        >
                          {result.description}
                        </div>
                      )}
                      {result.category && (
                        <div
                          style={{
                            fontSize: 12,
                            color: token.colorPrimary,
                            marginTop: 4,
                          }}
                        >
                          {result.category}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchValue.length > 0 ? (
            <div style={{ padding: 32 }}>
              <Empty
                description="No results found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : null}
          </ScrollShadow>
        </div>
      )}
    </div>
  );
};

SearchBar.displayName = 'SearchBar';
