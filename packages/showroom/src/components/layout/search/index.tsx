"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShowroomLink as Link } from "@/components/showroom-link";
import { useRouter } from "next/navigation";
import { Box, Flex, Stack, Text } from "@/components/showroom-ui";
import {
  ArrowUpRightIcon,
  SearchIcon,
  SparklesIcon,
} from "@rottay/design-system/icons";
import { applyShowroomRuntimeQuery } from "@/components/showroom-runtime-query";
import { useShowroom } from "@/components/showroom-context";
import {
  countSectionEntries,
  getRoutePresentation,
} from "../config";
import { POPULAR_PATHS, SEARCHABLE_RECORDS } from "../search-data";

const shellBorder =
  "var(--showroom-shell-border, var(--ds-color-border, #1c1f26))";
const shellBorderStrong =
  "var(--showroom-shell-border-strong, var(--ds-color-border-secondary, #2b3038))";
const shellSurface =
  "var(--showroom-shell-surface, var(--ds-color-bg-secondary, #111214))";
const shellSurfaceSubtle =
  "var(--showroom-shell-surface-subtle, var(--ds-color-bg-elevated, #1a1c21))";
const shellText =
  "var(--showroom-shell-text, var(--ds-color-text-primary, #f3f4f6))";
const shellTextSecondary =
  "var(--showroom-shell-text-secondary, var(--ds-color-text-secondary, #c0c4cc))";
const shellTextTertiary =
  "var(--showroom-shell-text-tertiary, var(--ds-color-text-muted, #848b98))";
const shellActiveBg =
  "var(--showroom-shell-active-bg, color-mix(in srgb, var(--ds-color-primary, #ffffff) 9%, transparent))";
const shellActiveBorder =
  "var(--showroom-shell-active-border, var(--ds-color-border-focus, rgba(255, 255, 255, 0.18)))";
const shellShadowStrong =
  "var(--showroom-shell-shadow-strong, 0 28px 72px rgba(0, 0, 0, 0.38))";

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) {
    return <>{text}</>;
  }

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <span key={`${part}-${index}`} style={{ fontWeight: 700 }}>
            {part}
          </span>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )}
    </>
  );
}

function scoreRecord(
  record: (typeof SEARCHABLE_RECORDS)[number],
  query: string
) {
  const q = query.toLowerCase();
  const haystack = [
    record.item.label,
    record.description,
    record.item.path,
    record.section.label,
    ...record.parents.map((parent) => parent.label),
  ]
    .join(" ")
    .toLowerCase();

  const label = record.item.label.toLowerCase();

  let score = 0;
  if (label === q) score += 120;
  if (label.startsWith(q)) score += 80;
  if (record.item.path.toLowerCase().includes(q)) score += 40;
  if (haystack.includes(q)) score += 20;
  if (record.kind === "entry") score += 8;
  return score;
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const { engine, tenantSlug } = useShowroom();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const buildRuntimeHref = useCallback(
    (href: string) =>
      applyShowroomRuntimeQuery(href, tenantSlug, engine, {
        replaceExisting: true,
      }),
    [engine, tenantSlug]
  );

  useEffect(() => {
    if (!isOpen) return;
    setQuery("");
    setDebouncedQuery("");
    setActiveIndex(0);
    setTimeout(() => inputRef.current?.focus(), 40);
  }, [isOpen]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), 120);
    return () => clearTimeout(timeout);
  }, [query]);

  const quickLinks = useMemo(
    () =>
      POPULAR_PATHS.map((path) => {
        const presentation = getRoutePresentation(path);
        const record = SEARCHABLE_RECORDS.find(
          (entry) => entry.item.path === path
        );

        return {
          description: presentation.description,
          href: path,
          label: presentation.title,
          metric: record
            ? `${countSectionEntries(record.section)} entries`
            : "Open page",
        };
      }),
    []
  );

  const groupedResults = useMemo(() => {
    if (!debouncedQuery.trim()) return [];

    const ranked = SEARCHABLE_RECORDS.map((record) => ({
      record,
      score: scoreRecord(record, debouncedQuery),
    }))
      .filter((entry) => entry.score > 0)
      .sort(
        (left, right) =>
          right.score - left.score ||
          left.record.item.label.localeCompare(right.record.item.label)
      )
      .slice(0, 36);

    const groups = new Map<string, { title: string; records: typeof ranked }>();

    for (const entry of ranked) {
      const title = entry.record.section.label;
      const current = groups.get(title);
      if (current) {
        current.records.push(entry);
      } else {
        groups.set(title, { title, records: [entry] });
      }
    }

    return Array.from(groups.values());
  }, [debouncedQuery]);

  const flatResults = useMemo(
    () =>
      groupedResults.flatMap((group) =>
        group.records.map((entry) => entry.record)
      ),
    [groupedResults]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [flatResults.length]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (isOpen) {
          onClose();
        }
      }

      if (isOpen && event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleKeyboardNavigation = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!flatResults.length) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((current) =>
          Math.min(current + 1, flatResults.length - 1)
        );
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((current) => Math.max(current - 1, 0));
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const target = flatResults[activeIndex];
        if (target) {
          router.push(buildRuntimeHref(target.item.path));
          onClose();
        }
      }
    },
    [activeIndex, buildRuntimeHref, flatResults, onClose, router]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <Box
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "72px 16px 24px",
      }}
    >
      <Box
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--showroom-shell-overlay, rgba(15, 23, 42, 0.42))",
        }}
      />

      <Box
        style={{
          position: "relative",
          width: "min(100%, 860px)",
          borderRadius: 24,
          border: `1px solid ${shellBorderStrong}`,
          background: shellSurface,
          boxShadow: shellShadowStrong,
          overflow: "hidden",
        }}
      >
        <Flex
          align="center"
          gap={14}
          style={{
            padding: "18px 20px 16px",
            borderBottom: `1px solid ${shellBorder}`,
          }}
        >
          <Box
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background: shellSurfaceSubtle,
              border: `1px solid ${shellBorder}`,
              color: "var(--ds-color-primary, #335cff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <SearchIcon size={18} />
          </Box>

          <Box style={{ flex: 1, minWidth: 0 }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyboardNavigation}
              placeholder="Search routes, components, charts, themes..."
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                background: "transparent",
                color: shellText,
                fontSize: "1rem",
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            />
            <Text
              size="xs"
              style={{
                color: shellTextSecondary,
                marginTop: 4,
              }}
            >
              Route-aware search across the extracted showroom experience.
            </Text>
          </Box>

          <Box
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              border: `1px solid ${shellBorderStrong}`,
              background: shellSurfaceSubtle,
              color: shellTextTertiary,
              fontSize: "0.72rem",
              fontWeight: 600,
              lineHeight: 1.2,
              flexShrink: 0,
            }}
          >
            ESC
          </Box>
        </Flex>

        <Box
          style={{
            maxHeight: 560,
            overflow: "auto",
            padding: debouncedQuery.trim() ? "14px 14px 18px" : "18px",
          }}
        >
          {!debouncedQuery.trim() ? (
            <Stack spacing={14}>
              <Flex align="center" gap={10}>
                <SparklesIcon size={16} />
                <Text size="sm" weight="semibold" style={{ color: shellText }}>
                  Popular jumps
                </Text>
              </Flex>

              <Box
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="search-link"
                    style={{ textDecoration: "none" }}
                  >
                    <Box
                      style={{
                        height: "100%",
                        borderRadius: 18,
                        border: `1px solid ${shellBorder}`,
                        background: shellSurfaceSubtle,
                        padding: "15px 16px",
                      }}
                    >
                      <Flex align="center" justify="between" gap={12}>
                        <Text
                          size="sm"
                          weight="semibold"
                          style={{ color: shellText }}
                        >
                          {link.label}
                        </Text>
                        <ArrowUpRightIcon size={14} />
                      </Flex>

                      <Text
                        size="sm"
                        style={{
                          color: shellTextSecondary,
                          lineHeight: 1.6,
                          marginTop: 8,
                        }}
                      >
                        {link.description}
                      </Text>

                      <Text
                        size="xs"
                        weight="semibold"
                        style={{
                          color: shellTextTertiary,
                          marginTop: 12,
                          textTransform: "uppercase",
                          letterSpacing: "0.12em",
                        }}
                      >
                        {link.metric}
                      </Text>
                    </Box>
                  </Link>
                ))}
              </Box>
            </Stack>
          ) : groupedResults.length ? (
            <Stack spacing={16}>
              {groupedResults.map((group) => (
                <Box key={group.title}>
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      color: shellTextTertiary,
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                      marginBottom: 10,
                    }}
                  >
                    {group.title}
                  </Text>

                  <Stack spacing={8}>
                    {group.records.map(({ record }) => {
                      const index = flatResults.findIndex(
                        (entry) => entry.item.path === record.item.path
                      );
                      const isActive = index === activeIndex;

                      return (
                        <Box
                          key={record.item.path}
                          as="button"
                          {...({ type: "button" } as any)}
                          className="search-result"
                          onClick={() => {
                            router.push(buildRuntimeHref(record.item.path));
                            onClose();
                          }}
                          style={{
                            width: "100%",
                            borderRadius: 16,
                            border: isActive
                              ? `1px solid ${shellActiveBorder}`
                              : `1px solid ${shellBorder}`,
                            background: isActive ? shellActiveBg : shellSurface,
                            textAlign: "left",
                            cursor: "pointer",
                            padding: "13px 14px",
                          }}
                        >
                          <Flex align="start" justify="between" gap={12}>
                            <Box style={{ minWidth: 0 }}>
                              <Text
                                size="sm"
                                weight="semibold"
                                style={{ color: shellText }}
                              >
                                <HighlightText
                                  text={record.item.label}
                                  query={debouncedQuery}
                                />
                              </Text>
                              <Text
                                size="xs"
                                style={{
                                  color: shellTextSecondary,
                                  lineHeight: 1.55,
                                  marginTop: 4,
                                }}
                              >
                                <HighlightText
                                  text={record.description}
                                  query={debouncedQuery}
                                />
                              </Text>
                            </Box>

                            <Text
                              size="xs"
                              weight="medium"
                              style={{
                                color: shellTextTertiary,
                                flexShrink: 0,
                              }}
                            >
                              {record.item.path}
                            </Text>
                          </Flex>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : (
            <Box
              style={{
                borderRadius: 18,
                border: `1px solid ${shellBorder}`,
                background: shellSurfaceSubtle,
                padding: "26px 20px",
                textAlign: "center",
              }}
            >
              <Text size="sm" weight="semibold" style={{ color: shellText }}>
                No results found
              </Text>
              <Text
                size="xs"
                style={{
                  color: shellTextSecondary,
                  lineHeight: 1.6,
                  marginTop: 6,
                }}
              >
                Try a route family, component name, chart type, or tenant theme.
              </Text>
            </Box>
          )}
        </Box>

        {flatResults.length ? (
          <Flex
            align="center"
            justify="between"
            style={{
              gap: 12,
              padding: "12px 18px",
              borderTop: `1px solid ${shellBorder}`,
              background: shellSurfaceSubtle,
              flexWrap: "wrap",
            }}
          >
            <Text size="xs" style={{ color: shellTextTertiary }}>
              {flatResults.length} ranked matches
            </Text>
            <Text size="xs" style={{ color: shellTextTertiary }}>
              Navigate with ↑ ↓ and open with Enter
            </Text>
          </Flex>
        ) : null}
      </Box>

      <style jsx>{`
        .search-link:hover,
        .search-result:hover {
          opacity: 0.94;
        }
      `}</style>
    </Box>
  );
}
