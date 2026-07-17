"use client";

import { ShowroomLink as Link } from "@/composition/components/showroom-link";
import { usePathname } from "next/navigation";
import { Box, Flex, Text } from "@/composition/components/showroom-ui";
import {
  ChevronRightIcon,
  MenuIcon,
  SearchIcon,
} from "@rottay/design-system/icons";
import { useShowroomRuntime } from "@/composition/components/showroom-context";
import { getRoutePresentation } from "../config";
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
const shellBorderFocus =
  "var(--showroom-shell-active-border, var(--ds-color-border-focus, rgba(255, 255, 255, 0.18)))";
const shellHeaderBackdrop =
  "var(--showroom-shell-header-backdrop, rgba(10, 11, 14, 0.78))";

interface HeaderProps {
  isMobile?: boolean;
  isNavigationOpen?: boolean;
  onNavigationToggle?: () => void;
  onSearchOpen?: () => void;
}

export function Header({
  isMobile = false,
  isNavigationOpen = false,
  onNavigationToggle,
  onSearchOpen,
}: HeaderProps) {
  const pathname = usePathname();
  const runtime = useShowroomRuntime();
  const presentation = getRoutePresentation(pathname);
  const activeTheme = getPreviewOption(THEME_OPTIONS, runtime.tenantSlug);
  const activeEngine = getPreviewOption(ENGINE_OPTIONS, runtime.engine);
  const SectionIcon = presentation.sectionMeta.icon;
  const sectionAccent =
    presentation.sectionSlug === "showroom"
      ? "var(--ds-color-primary, #ffffff)"
      : presentation.sectionMeta.accent;
  const runtimeBadges = [
    {
      accent: activeTheme.accent,
      label: runtime.tenantName,
    },
    {
      accent: activeEngine.accent,
      label: activeEngine.label,
    },
    {
      accent: sectionAccent,
      label: `${DOC_COUNTS.total} assets`,
    },
  ];

  return (
    <Box
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        borderBottom: `1px solid ${shellBorder}`,
        background: shellHeaderBackdrop,
        backdropFilter: "blur(18px) saturate(145%)",
        boxShadow: "0 1px 0 rgba(255, 255, 255, 0.03)",
      }}
    >
      <Box
        style={{
          display: "grid",
          gap: 12,
          padding: isMobile
            ? "12px"
            : "16px var(--showroom-shell-main-gutter) 18px",
        }}
      >
        <Box
          style={{
            width: isMobile
              ? "100%"
              : "min(100%, var(--showroom-shell-content-max))",
            margin: 0,
            minWidth: 0,
          }}
        >
          <Box
            style={{
              display: "grid",
              gap: isMobile ? 12 : 16,
              gridTemplateColumns: isMobile
                ? "1fr"
                : "minmax(0, 1fr) minmax(248px, 312px)",
              alignItems: "start",
            }}
          >
            <Flex align="start" style={{ gap: 12, minWidth: 0 }}>
              {isMobile ? (
                <Box
                  as="button"
                  {...({ type: "button" } as any)}
                  onClick={onNavigationToggle}
                  className="header-button"
                  aria-label={
                    isNavigationOpen ? "Close navigation" : "Open navigation"
                  }
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 16,
                    border: `1px solid ${shellBorder}`,
                    background: shellSurfaceStrong,
                    color: shellText,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <MenuIcon size={16} />
                </Box>
              ) : null}

              <Flex
                align="start"
                style={{
                  gap: 14,
                  minWidth: 0,
                  padding: isMobile ? "2px 0" : "4px 0",
                }}
              >
                <Flex
                  align="center"
                  justify="center"
                  style={{
                    width: isMobile ? 46 : 54,
                    height: isMobile ? 46 : 54,
                    borderRadius: isMobile ? 18 : 20,
                    border: `1px solid ${shellBorderStrong}`,
                    background:
                      "linear-gradient(180deg, var(--showroom-shell-surface-strong), var(--showroom-shell-surface-subtle))",
                    color: sectionAccent,
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.04)",
                    flexShrink: 0,
                  }}
                >
                  <SectionIcon size={isMobile ? 19 : 22} />
                </Flex>

                <Box style={{ minWidth: 0, maxWidth: isMobile ? "100%" : 980 }}>
                  <Flex
                    align="center"
                    style={{
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{
                        color: shellTextTertiary,
                        textTransform: "uppercase",
                        letterSpacing: "0.16em",
                      }}
                    >
                      {presentation.sectionMeta.eyebrow}
                    </Text>
                    <Box
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
                        {runtime.verticalLabel}
                      </Text>
                    </Box>
                  </Flex>

                  <Text
                    size={isMobile ? "lg" : "xl"}
                    weight="semibold"
                    style={{
                      color: shellText,
                      lineHeight: 1.08,
                      marginTop: 5,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {presentation.title}
                  </Text>

                  <Text
                    size={isMobile ? "sm" : "md"}
                    style={{
                      color: shellTextSecondary,
                      lineHeight: 1.55,
                      marginTop: 8,
                      maxWidth: isMobile ? "100%" : 860,
                      display: "-webkit-box",
                      WebkitLineClamp: isMobile ? 3 : 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {presentation.description}
                  </Text>

                  {presentation.breadcrumbs.length ? (
                    <Flex
                      align="center"
                      style={{
                        gap: 8,
                        marginTop: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      {presentation.breadcrumbs.map((crumb, index) => {
                        const isCurrent =
                          index === presentation.breadcrumbs.length - 1;

                        return (
                          <Flex key={crumb.href} align="center" gap={8}>
                            {index > 0 ? (
                              <Box style={{ color: shellTextTertiary }}>
                                <ChevronRightIcon size={12} />
                              </Box>
                            ) : null}
                            {isCurrent ? (
                              <Text
                                size="xs"
                                weight="semibold"
                                style={{
                                  color: shellText,
                                  letterSpacing: "0.02em",
                                }}
                              >
                                {crumb.label}
                              </Text>
                            ) : (
                              <Link
                                href={crumb.href}
                                className="header-link"
                                style={{
                                  textDecoration: "none",
                                }}
                              >
                                <Text
                                  size="xs"
                                  weight="medium"
                                  style={{
                                    color: shellTextSecondary,
                                    letterSpacing: "0.02em",
                                  }}
                                >
                                  {crumb.label}
                                </Text>
                              </Link>
                            )}
                          </Flex>
                        );
                      })}
                    </Flex>
                  ) : null}
                </Box>
              </Flex>
            </Flex>

            <Box
              style={{
                display: "grid",
                gap: 10,
                alignContent: "start",
                minWidth: 0,
              }}
            >
              <Box
                as="button"
                {...({ type: "button" } as any)}
                onClick={() => onSearchOpen?.()}
                className="header-button"
                style={{
                  width: "100%",
                  height: 46,
                  borderRadius: 16,
                  border: `1px solid ${shellBorder}`,
                  background: shellSurfaceStrong,
                  color: shellText,
                  cursor: "pointer",
                }}
              >
                <Flex
                  align="center"
                  justify="between"
                  style={{ height: "100%", padding: "0 14px" }}
                >
                  <Flex align="center" gap={10}>
                    <SearchIcon size={16} />
                    <Text size="sm" weight="semibold" style={{ color: "inherit" }}>
                      Search docs
                    </Text>
                  </Flex>

                  <Box
                    style={{
                      padding: "4px 8px",
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

              {!isMobile ? (
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    color: shellTextTertiary,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                  }}
                >
                  Runtime snapshot
                </Text>
              ) : null}

              <Flex
                align="center"
                style={{
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {runtimeBadges.map((item) => (
                  <Box
                    key={item.label}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "7px 10px",
                      borderRadius: 999,
                      border: `1px solid ${
                        isMobile ? shellBorder : shellBorderFocus
                      }`,
                      background: isMobile ? shellSurfaceStrong : shellSurface,
                    }}
                  >
                    <Box
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 999,
                        background: item.accent,
                        flexShrink: 0,
                      }}
                    />
                    <Text size="xs" weight="semibold" style={{ color: shellText }}>
                      {item.label}
                    </Text>
                  </Box>
                ))}
              </Flex>
            </Box>
          </Box>
        </Box>
      </Box>

      <style jsx>{`
        .header-button:hover,
        .header-link:hover {
          opacity: 0.94;
        }
      `}</style>
    </Box>
  );
}
