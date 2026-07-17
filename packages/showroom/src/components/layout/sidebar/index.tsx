"use client";

import { useEffect, useMemo, useState } from "react";
import { ShowroomLink as Link } from "@/components/showroom-link";
import { usePathname } from "next/navigation";
import { Box, Flex, Text } from "@/components/showroom-ui";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  HomeIcon,
  SearchIcon,
  XIcon,
} from "@rottay/design-system/icons";
import { navigation, type NavItem } from "@/data/navigation";
import {
  useShowroom,
  useShowroomRuntime,
} from "@/components/showroom-context";
import {
  countSectionEntries,
  getRoutePresentation,
  getSectionMeta,
  getSectionOverviewPath,
  isPathActive,
} from "../config";
import {
  DOC_COUNTS,
  ENGINE_OPTIONS,
  getPreviewOption,
  THEME_OPTIONS,
} from "../runtime-options";

const shellBorder =
  "var(--showroom-shell-border, var(--ds-color-border, #1c1f26))";
const shellBorderStrong =
  "var(--showroom-shell-border-strong, var(--ds-color-border-secondary, #2b3038))";
const shellSurface =
  "var(--showroom-shell-surface, var(--ds-color-bg-secondary, #111214))";
const shellSurfaceStrong =
  "var(--showroom-shell-surface-strong, var(--ds-color-bg-tertiary, #15171b))";
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
const desktopSidebarWidth =
  "var(--showroom-shell-sidebar-width, clamp(420px, 24vw, 456px))";
const mobileSidebarWidth = "min(440px, calc(100vw - 20px))";

function getPreviewPillStyles(isSelected: boolean) {
  return {
    borderRadius: 999,
    border: isSelected
      ? `1px solid ${shellActiveBorder}`
      : `1px solid ${shellBorder}`,
    background: isSelected ? shellActiveBg : shellSurfaceStrong,
    color: shellText,
    cursor: "pointer",
  } as const;
}

interface SidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onSearchOpen?: () => void;
}

interface NavNodeProps {
  activePath: string;
  item: NavItem;
  level?: number;
  onNavigate?: () => void;
}

function NavNode({ activePath, item, level = 0, onNavigate }: NavNodeProps) {
  const [manuallyOpen, setManuallyOpen] = useState(false);
  const isActive = isPathActive(activePath, item.path);
  const isOpen = item.children?.length ? manuallyOpen || isActive : false;
  const metadataTone = isActive ? shellText : shellTextSecondary;

  useEffect(() => {
    if (isActive) {
      setManuallyOpen(true);
    }
  }, [isActive]);

  if (!item.children?.length) {
    return (
      <Link
        href={item.path}
        className="sidebar-link"
        onClick={onNavigate}
        style={{
          textDecoration: "none",
        }}
      >
        <Flex
          align="center"
          justify="between"
          style={{
            gap: 10,
            padding: "8px 12px",
            paddingLeft: 14 + level * 16,
            borderRadius: 14,
            background: isActive ? shellActiveBg : "transparent",
            border: isActive
              ? `1px solid ${shellActiveBorder}`
              : "1px solid transparent",
            transition:
              "background 180ms ease, border-color 180ms ease, opacity 180ms ease",
          }}
        >
          <Flex align="center" gap={10} style={{ minWidth: 0 }}>
            <Box
              style={{
                width: 6,
                height: 6,
                borderRadius: "999px",
                background: isActive
                  ? "var(--ds-color-primary, #ffffff)"
                  : "var(--ds-color-neutral-400, #5b6170)",
                flexShrink: 0,
              }}
            />
            <Text
              size="sm"
              weight={isActive ? "semibold" : "medium"}
              style={{
                color: metadataTone,
                lineHeight: 1.3,
              }}
            >
              {item.label}
            </Text>
          </Flex>

          {item.badge ? (
            <Box
              style={{
                padding: "2px 7px",
                borderRadius: 999,
                background: shellSurfaceSubtle,
                color: shellTextTertiary,
                fontSize: "0.68rem",
                fontWeight: 600,
                lineHeight: 1.2,
                flexShrink: 0,
              }}
            >
              {item.badge}
            </Box>
          ) : null}
        </Flex>
      </Link>
    );
  }

  return (
    <Box>
      <Flex
        align="center"
        style={{
          gap: 8,
          padding: "4px 0",
        }}
      >
        <Link
          href={item.path}
          className="sidebar-link"
          onClick={onNavigate}
          style={{
            textDecoration: "none",
            flex: 1,
          }}
        >
          <Flex
            align="center"
            justify="between"
            style={{
              gap: 10,
              padding: "8px 12px",
              paddingLeft: 14 + level * 16,
              borderRadius: 14,
              background: isActive ? shellActiveBg : "transparent",
              border: isActive
                ? `1px solid ${shellActiveBorder}`
                : "1px solid transparent",
              transition:
                "background 180ms ease, border-color 180ms ease, opacity 180ms ease",
            }}
          >
            <Flex align="center" gap={10} style={{ minWidth: 0 }}>
              <Box
                style={{
                  width: 6,
                  height: 6,
                borderRadius: "999px",
                background: isActive
                    ? "var(--ds-color-primary, #ffffff)"
                    : "var(--ds-color-neutral-400, #5b6170)",
                  flexShrink: 0,
                }}
              />
              <Box style={{ minWidth: 0 }}>
                <Text
                  size="sm"
                  weight={isActive ? "semibold" : "medium"}
                  style={{
                    color: metadataTone,
                    lineHeight: 1.3,
                  }}
                >
                  {item.label}
                </Text>
              </Box>
            </Flex>

            <Box
              style={{
                padding: "2px 7px",
                borderRadius: 999,
                background: shellSurfaceSubtle,
                color: shellTextTertiary,
                fontSize: "0.68rem",
                fontWeight: 600,
                lineHeight: 1.2,
                flexShrink: 0,
              }}
            >
              {item.children.length}
            </Box>
          </Flex>
        </Link>

        <Box
          as="button"
          {...({ type: "button" } as any)}
          aria-label={
            isOpen ? `Collapse ${item.label}` : `Expand ${item.label}`
          }
          onClick={() => setManuallyOpen((current) => !current)}
          className="sidebar-toggle"
          style={{
            width: 32,
            height: 32,
            borderRadius: 12,
            border: `1px solid ${shellBorder}`,
            background: shellSurfaceSubtle,
            color: shellTextTertiary,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {isOpen ? (
            <ChevronDownIcon size={14} />
          ) : (
            <ChevronRightIcon size={14} />
          )}
        </Box>
      </Flex>

      {isOpen ? (
        <Box style={{ display: "grid", gap: 2, paddingTop: 2 }}>
          {item.children.map((child) => (
            <NavNode
              key={child.path}
              activePath={activePath}
              item={child}
              level={level + 1}
              onNavigate={onNavigate}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  );
}

export function Sidebar({
  isMobile = false,
  isOpen = true,
  onClose,
  onSearchOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const { engine, setEngine, tenantSlug, setTenantSlug } = useShowroom();
  const runtime = useShowroomRuntime();
  const presentation = useMemo(
    () => getRoutePresentation(pathname),
    [pathname]
  );
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const activeTheme = getPreviewOption(THEME_OPTIONS, tenantSlug);
  const activeEngine = getPreviewOption(ENGINE_OPTIONS, engine);

  useEffect(() => {
    if (presentation.activeRecord?.section.slug) {
      setExpandedSections((current) => ({
        ...current,
        [presentation.activeRecord.section.slug]: true,
      }));
    }
  }, [presentation.activeRecord?.section.slug]);

  if (!isOpen && isMobile) {
    return null;
  }

  return (
    <>
      {isMobile ? (
        <Box
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--showroom-shell-overlay, rgba(15, 23, 42, 0.42))",
            zIndex: 70,
          }}
        />
      ) : null}

      <Box
        className="showroom-sidebar"
        style={{
          position: isMobile ? "fixed" : "sticky",
          top: 0,
          left: 0,
          zIndex: isMobile ? 80 : 20,
          width: isMobile ? mobileSidebarWidth : desktopSidebarWidth,
          minWidth: isMobile ? mobileSidebarWidth : desktopSidebarWidth,
          height: "100vh",
          background:
            "linear-gradient(180deg, var(--showroom-shell-surface), var(--showroom-shell-surface-strong))",
          borderRight: `1px solid ${shellBorder}`,
          boxShadow: isMobile ? shellShadowStrong : "none",
          display: "flex",
          flexDirection: "column",
          transform: isMobile ? "translateX(0)" : "none",
        }}
      >
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
          }}
        >
          <Box
            style={{
              padding: isMobile ? "14px 14px 12px" : "16px 16px 14px",
              borderBottom: `1px solid ${shellBorder}`,
            }}
          >
            <Flex align="start" justify="between" style={{ gap: 12 }}>
              <Flex align="start" gap={12}>
                <Box
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 16,
                    border: `1px solid ${shellBorderStrong}`,
                    background:
                      "linear-gradient(180deg, var(--showroom-shell-surface-strong), var(--showroom-shell-surface-subtle))",
                    color: activeTheme.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                  >
                    <Text
                      size="sm"
                      weight="bold"
                      style={{
                        color: "inherit",
                        letterSpacing: "0.18em",
                      }}
                    >
                      DS
                  </Text>
                </Box>

                <Box style={{ minWidth: 0 }}>
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      color: shellTextTertiary,
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                    }}
                  >
                    Design system docs
                  </Text>
                  <Text
                    size="md"
                    weight="semibold"
                    style={{
                      color: shellText,
                      lineHeight: 1.1,
                      marginTop: 3,
                    }}
                  >
                    Showroom
                  </Text>
                  <Text
                    size="xs"
                    style={{
                      color: shellTextSecondary,
                      lineHeight: 1.45,
                      marginTop: 4,
                    }}
                  >
                    Runtime-aware docs for tokens, components, recipes, and
                    product screens.
                  </Text>
                  <Flex
                    align="center"
                    style={{ gap: 8, marginTop: 10, flexWrap: "wrap" }}
                  >
                    {[
                      runtime.verticalLabel,
                      activeEngine.label,
                      `${DOC_COUNTS.total} assets`,
                    ].map((label) => (
                      <Box
                        key={label}
                        style={{
                          padding: "4px 8px",
                          borderRadius: 999,
                          border: `1px solid ${shellBorder}`,
                          background: shellSurfaceStrong,
                        }}
                      >
                        <Text
                          size="xs"
                          weight="semibold"
                          style={{ color: shellTextSecondary }}
                        >
                          {label}
                        </Text>
                      </Box>
                    ))}
                  </Flex>
                </Box>
              </Flex>

              {isMobile ? (
                <Box
                  as="button"
                  {...({ type: "button" } as any)}
                  onClick={onClose}
                  className="sidebar-toggle"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    border: `1px solid ${shellBorder}`,
                    background: shellSurfaceSubtle,
                    color: shellText,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <XIcon size={15} />
                </Box>
              ) : null}
            </Flex>

            <Flex style={{ gap: 8, marginTop: 12 }}>
              <Link
                href="/"
                onClick={onClose}
                className="shell-home-link"
                style={{
                  flex: 1,
                  textDecoration: "none",
                }}
              >
                <Flex
                  align="center"
                  justify="center"
                  gap={8}
                  style={{
                    height: 40,
                    borderRadius: 14,
                    border: `1px solid ${shellBorder}`,
                    background: shellSurfaceStrong,
                    color: shellText,
                  }}
                >
                  <HomeIcon size={14} />
                  <Text size="sm" weight="medium" style={{ color: "inherit" }}>
                    Landing
                  </Text>
                </Flex>
              </Link>

              <Box
                as="button"
                {...({ type: "button" } as any)}
                onClick={onSearchOpen}
                className="shell-search-trigger"
                style={{
                  flex: 1,
                  height: 40,
                  borderRadius: 14,
                  border: `1px solid ${shellBorder}`,
                  background: shellSurfaceStrong,
                  color: shellText,
                  cursor: "pointer",
                }}
              >
                <Flex
                  align="center"
                  justify="between"
                  style={{ padding: "0 14px" }}
                >
                  <Flex align="center" gap={9}>
                    <SearchIcon size={14} />
                    <Text
                      size="sm"
                      weight="medium"
                      style={{ color: "inherit" }}
                    >
                      Search
                    </Text>
                  </Flex>
                  <Box
                    style={{
                      padding: "2px 7px",
                      borderRadius: 999,
                      border: `1px solid ${shellBorderStrong}`,
                      background: shellSurfaceSubtle,
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    Cmd K
                  </Box>
                </Flex>
              </Box>
            </Flex>

            <Box
              style={{
                marginTop: 12,
                borderRadius: 18,
                border: `1px solid ${shellBorder}`,
                background:
                  "linear-gradient(180deg, var(--showroom-shell-surface-strong), var(--showroom-shell-surface-subtle))",
                padding: 14,
              }}
            >
              <Flex align="start" justify="between" style={{ gap: 12 }}>
                <Box style={{ minWidth: 0 }}>
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      color: shellTextTertiary,
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                    }}
                  >
                    Runtime studio
                  </Text>
                  <Text
                    size="sm"
                    weight="semibold"
                    style={{
                      color: shellText,
                      marginTop: 4,
                    }}
                  >
                    {runtime.verticalLabel} on {activeEngine.label}
                  </Text>
                  <Text
                    size="xs"
                    style={{
                      color: shellTextSecondary,
                      marginTop: 4,
                    }}
                  >
                    {runtime.tenantName} tenant · {runtime.productProfileLabel}
                  </Text>
                </Box>

                <Box
                  style={{
                    padding: "5px 9px",
                    borderRadius: 999,
                    border: `1px solid ${shellBorder}`,
                    background: shellSurface,
                  }}
                >
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{ color: shellTextSecondary }}
                  >
                    {presentation.sectionMeta.eyebrow}
                  </Text>
                </Box>
              </Flex>

              <Box
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 16,
                  border: `1px solid ${shellBorder}`,
                  background: shellSurface,
                }}
              >
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    color: shellTextTertiary,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                  }}
                >
                  Now viewing
                </Text>
                <Text
                  size="sm"
                  weight="semibold"
                  style={{ color: shellText, marginTop: 5 }}
                >
                  {presentation.title}
                </Text>
                <Text
                  size="xs"
                  style={{
                    color: shellTextSecondary,
                    lineHeight: 1.45,
                    marginTop: 6,
                  }}
                >
                  {presentation.description}
                </Text>
              </Box>

              <Box style={{ display: "grid", gap: 10, marginTop: 12 }}>
                <Box>
                  <Text
                    size="xs"
                    weight="medium"
                    style={{ color: shellTextTertiary }}
                  >
                    Tenant
                  </Text>
                  <Flex style={{ gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    {THEME_OPTIONS.map((theme) => {
                      const isSelected = theme.key === tenantSlug;
                      return (
                        <Box
                          key={theme.key}
                          as="button"
                          {...({ type: "button" } as any)}
                          onClick={() => setTenantSlug(theme.key)}
                          className="preview-pill"
                          style={getPreviewPillStyles(isSelected)}
                        >
                          <Flex
                            align="center"
                            gap={8}
                            style={{ padding: "6px 10px" }}
                          >
                            <Box
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 999,
                                background: theme.accent,
                                flexShrink: 0,
                              }}
                            />
                            <Text
                              size="xs"
                              weight={isSelected ? "semibold" : "medium"}
                              style={{ color: "inherit" }}
                            >
                              {theme.label}
                            </Text>
                          </Flex>
                        </Box>
                      );
                    })}
                  </Flex>
                  <Text
                    size="xs"
                    style={{
                      color: shellTextSecondary,
                      lineHeight: 1.45,
                      marginTop: 8,
                    }}
                  >
                    {activeTheme.hint}
                  </Text>
                </Box>

                <Box>
                  <Text
                    size="xs"
                    weight="medium"
                    style={{ color: shellTextTertiary }}
                  >
                    Engine
                  </Text>
                  <Flex style={{ gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    {ENGINE_OPTIONS.map((option) => {
                      const isSelected = option.key === engine;
                      return (
                        <Box
                          key={option.key}
                          as="button"
                          {...({ type: "button" } as any)}
                          onClick={() => setEngine(option.key)}
                          className="preview-pill"
                          style={getPreviewPillStyles(isSelected)}
                        >
                          <Flex
                            align="center"
                            gap={8}
                            style={{ padding: "6px 10px" }}
                          >
                            <Box
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 999,
                                background: option.accent,
                                flexShrink: 0,
                              }}
                            />
                            <Text
                              size="xs"
                              weight={isSelected ? "semibold" : "medium"}
                              style={{ color: "inherit" }}
                            >
                              {option.label}
                            </Text>
                          </Flex>
                        </Box>
                      );
                    })}
                  </Flex>
                  <Text
                    size="xs"
                    style={{
                      color: shellTextSecondary,
                      lineHeight: 1.45,
                      marginTop: 8,
                    }}
                  >
                    {activeEngine.hint}
                  </Text>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "auto",
              padding: isMobile ? "12px 10px 14px" : "12px 12px 16px",
              display: "grid",
              gap: 8,
            }}
          >
            {navigation.map((section) => {
              const meta = getSectionMeta(section.slug);
              const overviewPath = getSectionOverviewPath(section);
              const sectionIsActive = presentation.sectionSlug === section.slug;
              const isExpanded =
                expandedSections[section.slug] ?? sectionIsActive;
              const Icon = meta.icon;

              return (
                <Box
                  key={section.slug}
                  style={{
                    borderRadius: 18,
                    border: sectionIsActive
                      ? `1px solid ${shellActiveBorder}`
                      : `1px solid ${shellBorder}`,
                    background: sectionIsActive ? shellActiveBg : shellSurfaceStrong,
                    overflow: "hidden",
                  }}
                >
                  <Box style={{ padding: "10px" }}>
                    <Flex align="center" justify="between" style={{ gap: 10 }}>
                      <Link
                        href={overviewPath}
                        onClick={onClose}
                        className="sidebar-link"
                        style={{
                          flex: 1,
                          textDecoration: "none",
                        }}
                      >
                        <Flex align="center" gap={10}>
                          <Flex
                            align="center"
                            justify="center"
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 10,
                              border: `1px solid ${
                                sectionIsActive
                                  ? shellActiveBorder
                                  : shellBorder
                              }`,
                              background: sectionIsActive
                                ? shellSurface
                                : shellSurfaceSubtle,
                              color: meta.accent,
                              flexShrink: 0,
                            }}
                          >
                            <Icon size={15} />
                          </Flex>

                          <Box style={{ minWidth: 0 }}>
                            <Flex
                              align="center"
                              gap={8}
                              style={{ flexWrap: "wrap" }}
                            >
                              <Text
                                size="sm"
                                weight="semibold"
                                style={{
                                  color: shellText,
                                  lineHeight: 1.2,
                                }}
                              >
                                {section.label}
                              </Text>
                              <Box
                                style={{
                                  padding: "2px 7px",
                                  borderRadius: 999,
                                  background: shellSurfaceSubtle,
                                  color: shellTextTertiary,
                                  fontSize: "0.68rem",
                                  fontWeight: 600,
                                  lineHeight: 1.2,
                                }}
                              >
                                {countSectionEntries(section)}
                              </Box>
                            </Flex>
                            {sectionIsActive ? (
                              <Text
                                size="xs"
                                style={{
                                  color: shellTextSecondary,
                                  lineHeight: 1.4,
                                  marginTop: 3,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {meta.description}
                              </Text>
                            ) : null}
                          </Box>
                        </Flex>
                      </Link>

                      <Box
                        as="button"
                        {...({ type: "button" } as any)}
                        onClick={() =>
                          setExpandedSections((current) => ({
                            ...current,
                            [section.slug]: !isExpanded,
                          }))
                        }
                        className="sidebar-toggle"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 12,
                          border: `1px solid ${shellBorder}`,
                          background: shellSurfaceSubtle,
                          color: shellText,
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        {isExpanded ? (
                          <ChevronDownIcon size={15} />
                        ) : (
                          <ChevronRightIcon size={15} />
                        )}
                      </Box>
                    </Flex>

                    {isExpanded ? (
                      <Box style={{ display: "grid", gap: 2, marginTop: 6 }}>
                        {section.children.map((item) => (
                          <NavNode
                            key={item.path}
                            activePath={pathname}
                            item={item}
                            onNavigate={onClose}
                          />
                        ))}
                      </Box>
                    ) : null}
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Box
            style={{
              padding: isMobile ? "12px 14px 14px" : "14px 16px 16px",
              borderTop: `1px solid ${shellBorder}`,
              background: shellSurfaceStrong,
            }}
          >
            <Flex align="center" justify="between" style={{ gap: 12 }}>
              <Box>
                <Text
                  size="xs"
                  weight="semibold"
                  style={{ color: shellTextTertiary }}
                >
                  Library footprint
                </Text>
                <Text
                  size="sm"
                  weight="semibold"
                  style={{
                    color: shellText,
                    marginTop: 4,
                  }}
                >
                  {DOC_COUNTS.total} documented assets
                </Text>
              </Box>

              <Link
                href="/developers/getting-started"
                onClick={onClose}
                className="sidebar-link shell-inline-link"
                style={{
                  textDecoration: "none",
                  color: shellText,
                }}
              >
                <Flex align="center" gap={6}>
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{ color: "inherit" }}
                  >
                    Docs
                  </Text>
                  <ExternalLinkIcon size={12} />
                </Flex>
              </Link>
            </Flex>

            <Box
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 12,
              }}
            >
              {[
                `${DOC_COUNTS.primitives} primitives`,
                `${DOC_COUNTS.patterns} patterns`,
                `${DOC_COUNTS.structures} structures`,
                `${DOC_COUNTS.surfaces} surfaces`,
              ].map((label) => (
                <Box
                  key={label}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: `1px solid ${shellBorder}`,
                    background: shellSurface,
                  }}
                >
                  <Text
                    size="xs"
                    weight="medium"
                    style={{ color: shellTextSecondary }}
                  >
                    {label}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      <style jsx>{`
        .showroom-sidebar :global(::-webkit-scrollbar) {
          width: 8px;
        }

        .showroom-sidebar :global(::-webkit-scrollbar-thumb) {
          background: rgba(255, 255, 255, 0.14);
          border-radius: 999px;
          border: 1px solid transparent;
          background-clip: padding-box;
        }

        .sidebar-link:hover,
        .shell-home-link:hover,
        .shell-search-trigger:hover,
        .shell-inline-link:hover {
          opacity: 0.92;
        }

        .sidebar-toggle:hover,
        .preview-pill:hover {
          opacity: 0.92;
          border-color: ${shellBorderStrong};
        }
      `}</style>
    </>
  );
}
