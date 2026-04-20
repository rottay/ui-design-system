'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Flex, Stack, Text } from '@rottay/design-system';
import { SearchIcon } from '@rottay/design-system/icons';
import {
  primitives,
  patterns,
  structures,
  surfaces,
  charts,
  icons,
} from '@/data/registry';

/**
 * Unified search item with category metadata.
 */
interface SearchItem {
  name: string;
  description: string;
  href: string;
  category: string;
}

/**
 * Builds a flat list of all searchable items across registries.
 */
function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [];

  for (const p of primitives) {
    items.push({
      name: p.name,
      description: p.description,
      href: `/primitives/${p.slug}`,
      category: 'Primitives',
    });
  }

  for (const p of patterns) {
    items.push({
      name: p.name,
      description: p.description,
      href: `/patterns/${p.slug}`,
      category: 'Patterns',
    });
  }

  for (const s of structures) {
    items.push({
      name: s.name,
      description: s.description,
      href: `/structures/${s.slug}`,
      category: 'Structures',
    });
  }

  for (const s of surfaces) {
    items.push({
      name: s.name,
      description: s.description,
      href: `/surfaces/${s.slug}`,
      category: 'Surfaces',
    });
  }

  for (const c of charts) {
    items.push({
      name: c.name,
      description: c.description,
      href: `/patterns/charts/${c.slug}`,
      category: 'Charts',
    });
  }

  for (const i of icons) {
    items.push({
      name: i.name,
      description: `Icon: ${i.category}`,
      href: `/foundations/icons#${i.slug}`,
      category: 'Icons',
    });
  }

  return items;
}

/**
 * Highlights matching text by wrapping matches in bold spans.
 */
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) {
    return <>{text}</>;
  }

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} style={{ fontWeight: 700 }}>{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const searchIndex = useMemo(() => buildSearchIndex(), []);

  // Debounce the query
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 150);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Filter results
  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase();
    return searchIndex.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [debouncedQuery, searchIndex]);

  // Group results by category (max 5 per category)
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchItem[]> = {};
    for (const item of results) {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      if (groups[item.category].length < 5) {
        groups[item.category].push(item);
      }
    }
    return groups;
  }, [results]);

  // Flat list for keyboard navigation
  const flatResults = useMemo(() => {
    const flat: SearchItem[] = [];
    for (const category of Object.keys(groupedResults)) {
      flat.push(...groupedResults[category]);
    }
    return flat;
  }, [groupedResults]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setDebouncedQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [flatResults.length]);

  // Global keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (isOpen && e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Keyboard navigation within the overlay
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatResults[activeIndex]) {
          router.push(flatResults[activeIndex].href);
          onClose();
        }
      }
    },
    [flatResults, activeIndex, router, onClose]
  );

  if (!isOpen) return null;

  return (
    <Box
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 120,
      }}
    >
      {/* Backdrop */}
      <Box
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Modal */}
      <Box
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 560,
          margin: '0 16px',
          background: 'var(--ds-color-white)',
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
        }}
      >
        {/* Search input */}
        <Flex
          align="center"
          gap={12}
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--ds-color-neutral-200)',
          }}
        >
          <Box style={{ color: 'var(--ds-color-text-tertiary)', flexShrink: 0 }}>
            <SearchIcon size={18} />
          </Box>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search components, patterns, icons..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '0.9375rem',
              color: 'var(--ds-color-text-primary)',
              background: 'transparent',
              lineHeight: 1.5,
            }}
          />
          <Box
            style={{
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid var(--ds-color-neutral-300)',
              fontSize: '0.6875rem',
              color: 'var(--ds-color-text-tertiary)',
              flexShrink: 0,
            }}
          >
            ESC
          </Box>
        </Flex>

        {/* Results */}
        <Box
          style={{
            maxHeight: 400,
            overflow: 'auto',
            padding: debouncedQuery.trim() ? '8px' : 0,
          }}
        >
          {debouncedQuery.trim() && flatResults.length === 0 && (
            <Box style={{ padding: '24px 16px', textAlign: 'center' }}>
              <Text size="sm" color="muted">
                No results found for &quot;{debouncedQuery}&quot;
              </Text>
            </Box>
          )}

          {Object.entries(groupedResults).map(([category, items]) => (
            <Box key={category} style={{ marginBottom: 8 }}>
              <Box style={{ padding: '6px 8px' }}>
                <Text
                  size="xs"
                  weight="semibold"
                  style={{ color: 'var(--ds-color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}
                >
                  {category}
                </Text>
              </Box>
              <Stack spacing={2}>
                {items.map((item) => {
                  const globalIndex = flatResults.indexOf(item);
                  const isActive = globalIndex === activeIndex;
                  return (
                    <Box
                      key={item.href}
                      as="button"
                      onClick={() => {
                        router.push(item.href);
                        onClose();
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        background: isActive
                          ? 'var(--ds-color-primary-50)'
                          : 'transparent',
                        transition: 'background 100ms ease',
                      }}
                    >
                      <Text
                        size="sm"
                        weight="medium"
                        style={{
                          color: isActive
                            ? 'var(--ds-color-primary-700)'
                            : 'var(--ds-color-text-primary)',
                        }}
                      >
                        <HighlightText text={item.name} query={debouncedQuery} />
                      </Text>
                      <Text
                        size="xs"
                        style={{
                          color: 'var(--ds-color-text-tertiary)',
                          marginTop: 2,
                        }}
                      >
                        <HighlightText text={item.description} query={debouncedQuery} />
                      </Text>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          ))}

          {!debouncedQuery.trim() && (
            <Box style={{ padding: '24px 16px', textAlign: 'center' }}>
              <Text size="sm" color="muted">
                Type to search across all components
              </Text>
            </Box>
          )}
        </Box>

        {/* Footer hint */}
        {flatResults.length > 0 && (
          <Flex
            align="center"
            gap={16}
            style={{
              padding: '8px 16px',
              borderTop: '1px solid var(--ds-color-neutral-200)',
            }}
          >
            <Text size="xs" style={{ color: 'var(--ds-color-text-tertiary)' }}>
              {flatResults.length} result{flatResults.length !== 1 ? 's' : ''}
            </Text>
            <Flex align="center" gap={8}>
              <Text size="xs" style={{ color: 'var(--ds-color-text-tertiary)' }}>
                Navigate
              </Text>
              <Flex align="center" gap={4}>
                <Box
                  style={{
                    padding: '1px 5px',
                    borderRadius: 3,
                    border: '1px solid var(--ds-color-neutral-300)',
                    fontSize: '0.625rem',
                    color: 'var(--ds-color-text-tertiary)',
                  }}
                >
                  {'\u2191'}
                </Box>
                <Box
                  style={{
                    padding: '1px 5px',
                    borderRadius: 3,
                    border: '1px solid var(--ds-color-neutral-300)',
                    fontSize: '0.625rem',
                    color: 'var(--ds-color-text-tertiary)',
                  }}
                >
                  {'\u2193'}
                </Box>
              </Flex>
              <Text size="xs" style={{ color: 'var(--ds-color-text-tertiary)' }}>
                Select
              </Text>
              <Box
                style={{
                  padding: '1px 5px',
                  borderRadius: 3,
                  border: '1px solid var(--ds-color-neutral-300)',
                  fontSize: '0.625rem',
                  color: 'var(--ds-color-text-tertiary)',
                }}
              >
                {'\u23CE'}
              </Box>
            </Flex>
          </Flex>
        )}
      </Box>
    </Box>
  );
}
