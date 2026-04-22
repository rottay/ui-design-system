"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  Flex,
  Stack,
  Text,
  useTokens,
} from "@rottay/design-system";
import { SearchIcon } from "@rottay/design-system/icons";
import { RuntimeFingerprint } from "@/components/runtime/runtime-fingerprint";
import { ShowroomLink as Link } from "@/components/showroom-link";
import {
  useShowroom,
  useShowroomRuntime,
  type ShowroomEngine,
  type ShowroomTheme,
} from "@/components/showroom-context";
import {
  countSectionEntries,
  getSectionMeta,
  getRoutePresentation,
  type BreadcrumbItem,
} from "../config";
import { SearchOverlay } from "../search";
import { navigation, type NavItem, type NavSection } from "@/data/navigation";

const ENGINE_OPTIONS: Array<{ value: ShowroomEngine; label: string }> = [
  { value: "classic", label: "Classic" },
  { value: "modern", label: "Modern" },
  { value: "rustic", label: "Rustic" },
];

const TENANT_OPTIONS: Array<{ value: ShowroomTheme; label: string }> = [
  { value: "rottay", label: "Rottay" },
  { value: "bithire", label: "BitHire" },
  { value: "evnto", label: "Evnto" },
];

const SIDEBAR_BACKGROUND =
  "var(--showroom-shell-canvas, var(--ds-sidebar-bg, var(--ds-layout-sider-bg, var(--ds-color-bg-primary))))";
const SIDEBAR_BORDER =
  "var(--showroom-shell-border, var(--ds-sidebar-border, var(--ds-layout-sider-border, var(--ds-color-border-subtle))))";
const SIDEBAR_TEXT =
  "var(--showroom-shell-text, var(--ds-sidebar-text, var(--ds-color-text-primary)))";
const SIDEBAR_MUTED =
  "var(--showroom-shell-text-secondary, var(--ds-sidebar-text-muted, var(--ds-color-text-secondary)))";
const NAV_ITEM_ACTIVE_BG =
  "var(--showroom-shell-active-bg, var(--ds-sidebar-item-bg-active, color-mix(in srgb, var(--ds-color-primary, #ffffff) 10%, transparent)))";
const NAV_ITEM_HOVER_BG =
  "var(--showroom-shell-hover-bg, var(--ds-sidebar-item-bg-hover, color-mix(in srgb, var(--ds-color-primary, #ffffff) 5%, transparent)))";
const NAV_ITEM_ACTIVE_TEXT =
  "var(--showroom-shell-text, var(--ds-sidebar-item-color-active, var(--ds-color-text-primary)))";
const NAV_ITEM_TEXT =
  "var(--showroom-shell-text-secondary, var(--ds-sidebar-item-color, var(--ds-color-text-secondary)))";
const HEADER_BACKGROUND =
  "var(--showroom-shell-header-backdrop, var(--ds-layout-header-bg, color-mix(in srgb, var(--ds-color-bg-primary) 86%, transparent)))";
const HEADER_BORDER =
  "var(--showroom-shell-border-strong, var(--ds-layout-header-border, var(--ds-color-border-subtle)))";
const PAGE_BACKGROUND =
  "var(--showroom-shell-canvas, var(--ds-layout-bg, var(--ds-color-bg-primary, #0b0d12)))";
const STABLE_SIDEBAR_WIDTH = 424;
const SHELL_CONTENT_MAX_WIDTH = 1800;
const DOCUMENTED_ROUTE_COUNT = navigation.reduce(
  (count, section) => count + countSectionEntries(section),
  0
);

function isPathActive(pathname: string, path: string) {
  if (path === "/") {
    return pathname === "/";
  }

  return pathname === path || pathname.startsWith(`${path}/`);
}

function NavigationBranch({
  depth = 0,
  item,
  pathname,
}: {
  depth?: number;
  item: NavItem;
  pathname: string;
}) {
  const active = isPathActive(pathname, item.path);
  const itemLabel =
    typeof item.label === "string"
      ? item.label.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      : item.label;

  return (
    <Box
      style={{
        paddingLeft: depth > 0 ? 12 : 0,
        borderLeft:
          depth > 0
            ? `1px solid color-mix(in srgb, ${SIDEBAR_BORDER} 52%, transparent)`
            : "none",
      }}
    >
      <Link
        href={item.path}
        className="showroom-shell-nav-link"
        style={{ textDecoration: "none", display: "block" }}
      >
        <Box
          className="showroom-shell-nav-item"
          data-active={active ? "true" : "false"}
          style={{
            padding: depth === 0 ? "8px 10px" : "6px 8px",
            borderRadius: depth === 0 ? 15 : 11,
            border: active
              ? `1px solid color-mix(in srgb, var(--ds-color-primary, #ffffff) 24%, ${SIDEBAR_BORDER})`
              : "1px solid transparent",
            background: active
              ? `linear-gradient(135deg, ${NAV_ITEM_ACTIVE_BG} 0%, color-mix(in srgb, var(--ds-color-primary, #ffffff) 4%, var(--ds-color-bg-elevated, #ffffff)) 100%)`
              : "transparent",
            boxShadow: active
              ? "0 14px 30px color-mix(in srgb, var(--ds-color-primary, #ffffff) 12%, transparent)"
              : "none",
            transition:
              "background-color 160ms ease, border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease",
          }}
        >
          <Flex align="center" justify="between" gap={10}>
            <Flex align="center" gap={10} style={{ minWidth: 0, flex: 1 }}>
              <Box
                style={{
                  width: depth === 0 ? 7 : 5,
                  height: depth === 0 ? 7 : 5,
                  borderRadius: 999,
                  background: active
                    ? "var(--ds-color-primary)"
                    : `color-mix(in srgb, ${SIDEBAR_MUTED} 38%, transparent)`,
                  flexShrink: 0,
                }}
              />
              <Text
                size={depth === 0 ? "sm" : "xs"}
                style={{
                  display: "block",
                  color: active ? NAV_ITEM_ACTIVE_TEXT : NAV_ITEM_TEXT,
                  fontSize: depth === 0 ? "13.25px" : "12.25px",
                  fontWeight: active ? 650 : depth === 0 ? 560 : 525,
                  lineHeight: 1.3,
                }}
              >
                {itemLabel}
              </Text>
            </Flex>
            <Flex align="center" gap={8} style={{ flexShrink: 0 }}>
              {item.badge ? (
                <Badge variant={active ? "primary" : "secondary"}>{item.badge}</Badge>
              ) : null}
            </Flex>
          </Flex>
        </Box>
      </Link>

      {item.children && active ? (
        <Stack spacing="xs" style={{ marginTop: 8 }}>
          {item.children.map((child) => (
            <NavigationBranch
              key={child.path}
              depth={depth + 1}
              item={child}
              pathname={pathname}
            />
          ))}
        </Stack>
      ) : null}
    </Box>
  );
}

function NavigationSection({
  pathname,
  section,
}: {
  pathname: string;
  section: NavSection;
}) {
  const active = pathname === `/${section.slug}` || pathname.startsWith(`/${section.slug}/`);
  const entryCount = countSectionEntries(section);
  const sectionMeta = getSectionMeta(section.slug);
  const SectionIcon = sectionMeta.icon;

  return (
    <Box
      className="showroom-shell-nav-section"
      data-active={active ? "true" : "false"}
      style={{
        padding: active ? 10 : "4px 2px 0",
        borderRadius: active ? 20 : 0,
        border: active
          ? `1px solid color-mix(in srgb, ${sectionMeta.accent} 32%, ${SIDEBAR_BORDER})`
          : "1px solid transparent",
        background: active
          ? `linear-gradient(180deg, color-mix(in srgb, ${sectionMeta.accent} 10%, var(--ds-sidebar-bg, var(--ds-color-bg-primary))) 0%, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 42%, var(--ds-sidebar-bg, var(--ds-color-bg-primary))) 100%)`
          : "transparent",
        boxShadow: active
          ? "var(--ds-shadow-sm, 0 12px 28px rgba(0, 0, 0, 0.1))"
          : "none",
        transition:
          "background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
      }}
    >
      <Flex align="start" justify="between" gap={12}>
        <Flex align="start" gap={12} style={{ minWidth: 0 }}>
          <Box
            style={{
              width: active ? 36 : 32,
              height: active ? 36 : 32,
              borderRadius: active ? 12 : 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: active
                ? `1px solid color-mix(in srgb, ${sectionMeta.accent} 24%, ${SIDEBAR_BORDER})`
                : `1px solid color-mix(in srgb, ${SIDEBAR_BORDER} 30%, transparent)`,
              background: active
                ? `color-mix(in srgb, ${sectionMeta.accent} 12%, transparent)`
                : "transparent",
              color: active
                ? sectionMeta.accent
                : `color-mix(in srgb, ${sectionMeta.accent} 72%, ${SIDEBAR_MUTED})`,
              flexShrink: 0,
              boxShadow: active
                ? "inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 52%, transparent)"
                : "none",
            }}
          >
            <SectionIcon size={16} />
          </Box>
          <Stack spacing="xs" style={{ minWidth: 0 }}>
            <Text
              size="xs"
              style={{
                display: "block",
                color: "var(--ds-sidebar-group-color, var(--ds-sidebar-text-muted))",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {section.label}
            </Text>
            <Text
              size="xs"
              style={{ display: "block", color: SIDEBAR_MUTED, lineHeight: 1.45 }}
            >
              {active ? "Current section" : `${entryCount} documented routes`}
            </Text>
          </Stack>
        </Flex>
        <Badge variant={active ? "primary" : "secondary"}>{entryCount}</Badge>
      </Flex>

      <Stack
        spacing="xs"
        fullWidth
        style={{
          marginTop: active ? 12 : 10,
          padding: active ? 6 : "10px 0 0",
          borderRadius: 18,
          background: active
            ? "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 26%, transparent) 0%, color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 18%, transparent) 100%)"
            : "transparent",
          border: active
            ? `1px solid color-mix(in srgb, ${SIDEBAR_BORDER} 42%, transparent)`
            : "none",
          borderTop: active
            ? "none"
            : `1px solid color-mix(in srgb, ${SIDEBAR_BORDER} 28%, transparent)`,
        }}
      >
        {section.children.map((item) => (
          <NavigationBranch key={item.path} item={item} pathname={pathname} />
        ))}
      </Stack>
    </Box>
  );
}

function SegmentedGroup<T extends string>({
  label,
  onSelect,
  options,
  value,
}: {
  label: string;
  onSelect: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  value: T;
}) {
  return (
    <Box
      style={{
        minWidth: 0,
      }}
    >
      <Flex
        align="center"
        justify="between"
        gap={8}
        style={{ marginBottom: 6, flexWrap: "wrap" }}
      >
        <Text
          size="xs"
          weight="semibold"
          style={{
            display: "block",
            color: "var(--ds-color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {label}
        </Text>
        <Text
          size="xs"
          style={{
            display: "block",
            color: "var(--ds-color-text-secondary)",
            lineHeight: 1.4,
          }}
        >
          {options.find((option) => option.value === value)?.label}
        </Text>
      </Flex>
      <Box
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          padding: 3,
          borderRadius: 14,
          background:
            "color-mix(in srgb, var(--ds-color-bg-primary) 78%, var(--ds-color-bg-elevated, #ffffff))",
          border: "1px solid var(--ds-color-border-subtle)",
        }}
      >
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <Box
              as="button"
              key={`${option.value}-${selected ? "selected" : "idle"}`}
              onClick={() => onSelect(option.value)}
              style={{
                appearance: "none",
                width: "auto",
                minWidth: 68,
                flex: "1 1 72px",
                minHeight: 34,
                padding: "6px 10px",
                borderRadius: 10,
                border: selected
                  ? "1px solid color-mix(in srgb, var(--ds-color-primary, #ffffff) 28%, var(--ds-color-border-subtle))"
                  : "1px solid transparent",
                background: selected
                  ? "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary, #ffffff) 18%, var(--ds-color-bg-elevated, #ffffff)) 0%, color-mix(in srgb, var(--ds-color-primary, #ffffff) 10%, var(--ds-color-bg-elevated, #ffffff)) 100%)"
                  : "transparent",
                color: selected
                  ? "var(--ds-color-text-primary)"
                  : "var(--ds-color-text-secondary)",
                fontSize: 12,
                fontWeight: selected ? 700 : 560,
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                textAlign: "center",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: selected
                  ? "0 10px 22px color-mix(in srgb, var(--ds-color-primary, #ffffff) 10%, transparent)"
                  : "none",
              }}
            >
              {option.label}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function SearchTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <Button variant="default" size="sm" onClick={onOpen}>
      <Flex align="center" gap={8}>
        <SearchIcon size={14} />
        <span>Search</span>
        <Box
          as="span"
          style={{
            padding: "2px 6px",
            borderRadius: 999,
            border: "1px solid var(--ds-color-border-subtle)",
            background:
              "color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 78%, transparent)",
          }}
        >
          <Text
            as={"span" as any}
            size="xs"
            weight="semibold"
            style={{ display: "block", color: "var(--ds-color-text-muted)" }}
          >
            K
          </Text>
        </Box>
      </Flex>
    </Button>
  );
}

function SidebarLaunchpad({
  onOpenSearch,
  pathname,
  runtimeLabel,
}: {
  onOpenSearch: () => void;
  pathname: string;
  runtimeLabel: string;
}) {
  const tokens = useTokens();
  const runtime = useShowroomRuntime();

  return (
    <Box
      style={{
        padding: 18,
        borderRadius: 24,
        border: `1px solid color-mix(in srgb, ${SIDEBAR_BORDER} 82%, transparent)`,
        background: [
          "radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--ds-color-primary, #ffffff) 12%, transparent) 0%, transparent 38%)",
          "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary, #ffffff) 7%, var(--ds-sidebar-bg, var(--ds-color-bg-primary))) 0%, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 40%, var(--ds-sidebar-bg, var(--ds-color-bg-primary))) 100%)",
        ].join(", "),
        boxShadow:
          "0 18px 40px color-mix(in srgb, var(--ds-color-shadow, rgba(0, 0, 0, 0.16)) 14%, transparent), inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 48%, transparent)",
      }}
    >
      <Stack spacing="sm" fullWidth>
        <Box
          style={{
            width: 44,
            height: 3,
            borderRadius: 999,
            background:
              'linear-gradient(90deg, var(--ds-color-primary, #ffffff) 0%, var(--ds-color-secondary, var(--ds-color-primary, #ffffff)) 100%)',
          }}
        />

        <Flex align="center" gap={12}>
          <Box
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              border: `1px solid color-mix(in srgb, ${SIDEBAR_BORDER} 74%, transparent)`,
              background:
                "color-mix(in srgb, var(--ds-color-primary, #ffffff) 14%, transparent)",
              color: SIDEBAR_TEXT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            DS
          </Box>
          <Box style={{ minWidth: 0 }}>
            <Text
              size="xs"
              weight="semibold"
              style={{
                display: "block",
                color: SIDEBAR_MUTED,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Premium Docs
            </Text>
            <Text
              as={"h1" as any}
              size="lg"
              weight="bold"
              style={{ display: "block", color: SIDEBAR_TEXT }}
            >
              Design System Showroom
            </Text>
          </Box>
        </Flex>

        <Text
          size="sm"
          style={{
            display: "block",
            color: SIDEBAR_MUTED,
            lineHeight: 1.55,
            maxWidth: "34ch",
          }}
        >
          Published-package documentation wired to the real DS runtime so the
          same routes reveal how tenant and engine reshape identical component
          contracts.
        </Text>

        <Flex gap={8} style={{ flexWrap: "wrap" }}>
          <Badge variant="primary">{runtimeLabel}</Badge>
          <Badge variant="secondary">Published package</Badge>
        </Flex>

        <Box
          style={{
            padding: 8,
            borderRadius: 18,
            border: `1px solid color-mix(in srgb, ${SIDEBAR_BORDER} 52%, transparent)`,
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 42%, transparent) 0%, color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 18%, transparent) 100%)",
            boxShadow:
              "inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 50%, transparent)",
          }}
        >
          <Box
            className="showroom-shell-launchpad-signals"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            }}
          >
            <Box
              className="showroom-shell-launchpad-signal"
              style={{
                minWidth: 0,
                padding: "2px 10px 4px 4px",
              }}
            >
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: "block",
                  color: SIDEBAR_MUTED,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Primary
              </Text>
              <Flex align="center" gap={8} style={{ marginTop: 8 }}>
                <Box
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    background: tokens.colors.primary,
                    border: `1px solid ${SIDEBAR_BORDER}`,
                    flexShrink: 0,
                  }}
                />
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    display: "block",
                    minWidth: 0,
                    color: SIDEBAR_TEXT,
                    fontFamily: "var(--font-geist-mono)",
                    wordBreak: "break-word",
                  }}
                >
                  {tokens.colors.primary}
                </Text>
              </Flex>
              <Text
                size="xs"
                style={{
                  display: "block",
                  marginTop: 6,
                  color: SIDEBAR_MUTED,
                  lineHeight: 1.4,
                }}
              >
                {runtime.tenantName}
              </Text>
            </Box>

            <Box
              className="showroom-shell-launchpad-signal"
              style={{
                minWidth: 0,
                padding: "2px 10px",
                borderLeft: `1px solid color-mix(in srgb, ${SIDEBAR_BORDER} 38%, transparent)`,
                borderRight: `1px solid color-mix(in srgb, ${SIDEBAR_BORDER} 38%, transparent)`,
              }}
            >
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: "block",
                  color: SIDEBAR_MUTED,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Radius
              </Text>
              <Flex align="center" gap={8} style={{ marginTop: 8 }}>
                <Box
                  style={{
                    width: 24,
                    height: 16,
                    borderRadius: tokens.borderRadius.lg,
                    background:
                      "linear-gradient(135deg, color-mix(in srgb, var(--ds-color-primary, #ffffff) 18%, transparent) 0%, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 78%, transparent) 100%)",
                    border: `1px solid ${SIDEBAR_BORDER}`,
                    flexShrink: 0,
                  }}
                />
                <Text
                  size="xs"
                  weight="semibold"
                  style={{
                    display: "block",
                    minWidth: 0,
                    color: SIDEBAR_TEXT,
                    fontFamily: "var(--font-geist-mono)",
                    wordBreak: "break-word",
                  }}
                >
                  {tokens.borderRadius.lg}
                </Text>
              </Flex>
              <Text
                size="xs"
                style={{
                  display: "block",
                  marginTop: 6,
                  color: SIDEBAR_MUTED,
                  lineHeight: 1.4,
                }}
              >
                Surface shape
              </Text>
            </Box>

            <Box
              className="showroom-shell-launchpad-signal"
              style={{
                minWidth: 0,
                padding: "2px 4px 4px 10px",
              }}
            >
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: "block",
                  color: SIDEBAR_MUTED,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Density
              </Text>
              <Text
                size="xs"
                weight="semibold"
                style={{
                  display: "block",
                  marginTop: 8,
                  color: SIDEBAR_TEXT,
                  lineHeight: 1.35,
                }}
              >
                {tokens.personality.card.paddingDensity}
              </Text>
              <Text
                size="xs"
                style={{
                  display: "block",
                  marginTop: 6,
                  color: SIDEBAR_MUTED,
                  lineHeight: 1.4,
                }}
              >
                {runtime.productProfileLabel}
              </Text>
            </Box>
          </Box>
        </Box>

        <Flex gap={8} style={{ flexWrap: "wrap", marginTop: 2 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Button variant={pathname === "/" ? "primary" : "default"} size="sm">
              Landing
            </Button>
          </Link>
          <Link href="/playground" style={{ textDecoration: "none" }}>
            <Button
              variant={pathname.startsWith("/playground") ? "primary" : "default"}
              size="sm"
            >
              Playground
            </Button>
          </Link>
          <SearchTrigger onOpen={onOpenSearch} />
        </Flex>
      </Stack>
    </Box>
  );
}

function SidebarNavigator({ pathname }: { pathname: string }) {
  return (
    <Box
      style={{
        minHeight: 0,
        padding: 14,
        borderRadius: 22,
        border: `1px solid color-mix(in srgb, ${SIDEBAR_BORDER} 60%, transparent)`,
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 42%, var(--ds-sidebar-bg, var(--ds-color-bg-primary))) 0%, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 18%, var(--ds-sidebar-bg, var(--ds-color-bg-primary))) 100%)",
        boxShadow:
          "0 12px 30px color-mix(in srgb, var(--ds-color-shadow, rgba(0, 0, 0, 0.12)) 6%, transparent), inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 52%, transparent)",
      }}
    >
      <Stack spacing="sm" fullWidth style={{ minHeight: 0 }}>
        <Flex align="start" justify="between" gap={12} style={{ flexWrap: "wrap" }}>
          <Box style={{ minWidth: 0 }}>
            <Text
              size="xs"
              weight="semibold"
              style={{
                display: "block",
                color: SIDEBAR_MUTED,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Navigator
            </Text>
            <Text
              size="sm"
              weight="semibold"
              style={{ display: "block", marginTop: 4, color: SIDEBAR_TEXT }}
            >
              Library map
            </Text>
          </Box>
          <Flex gap={8} style={{ flexWrap: "wrap" }}>
            <Badge variant="secondary">{navigation.length} sections</Badge>
            <Badge variant="secondary">{DOCUMENTED_ROUTE_COUNT} routes</Badge>
          </Flex>
        </Flex>

        <Text
          size="xs"
          style={{ display: "block", color: SIDEBAR_MUTED, lineHeight: 1.5 }}
        >
          Foundations first, then primitives, patterns, structures, and surfaces.
          Keep this rail legible enough to scan without hunting.
        </Text>

        <Box className="showroom-shell-nav-scroll">
          <Stack spacing="sm" fullWidth>
            {navigation.map((section) => (
              <NavigationSection
                key={section.slug}
                pathname={pathname}
                section={section}
              />
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

function SidebarFooter() {
  return (
    <Box
      style={{
        padding: 16,
        borderRadius: 20,
        border: `1px solid color-mix(in srgb, ${SIDEBAR_BORDER} 56%, transparent)`,
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 32%, var(--ds-sidebar-bg, var(--ds-color-bg-primary))) 0%, color-mix(in srgb, var(--ds-color-primary, #ffffff) 4%, var(--ds-sidebar-bg, var(--ds-color-bg-primary))) 100%)",
        boxShadow:
          "inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 44%, transparent)",
      }}
    >
      <Stack spacing="sm" fullWidth>
        <Flex align="center" justify="between" gap={10} style={{ flexWrap: "wrap" }}>
          <Box>
            <Text
              size="xs"
              weight="semibold"
              style={{
                display: "block",
                color: SIDEBAR_MUTED,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Runtime fingerprint
            </Text>
            <Text
              size="xs"
              style={{
                display: "block",
                marginTop: 4,
                color: SIDEBAR_MUTED,
                lineHeight: 1.5,
              }}
            >
              Token readout from the active provider chain.
            </Text>
          </Box>
          <Badge variant="secondary">Live DS</Badge>
        </Flex>

        <RuntimeFingerprint compact itemLimit={5} showHeader={false} />
      </Stack>
    </Box>
  );
}

function BreadcrumbTrail({ items }: { items: BreadcrumbItem[] }) {
  if (!items.length) {
    return <Badge variant="secondary">Showroom</Badge>;
  }

  return (
    <Flex gap={8} style={{ flexWrap: "wrap" }}>
      {items.map((item, index) => (
        <Badge
          key={`${item.href}-${index}`}
          variant={index === items.length - 1 ? "primary" : "secondary"}
        >
          {item.label}
        </Badge>
      ))}
    </Flex>
  );
}

export function ShowroomShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const tokens = useTokens();
  const runtime = useShowroomRuntime();
  const { engine, setEngine, tenantSlug, setTenantSlug } = useShowroom();
  const [searchOpen, setSearchOpen] = useState(false);

  const route = useMemo(() => getRoutePresentation(pathname), [pathname]);
  const SectionIcon = route.sectionMeta.icon;
  const sidebarWidth = STABLE_SIDEBAR_WIDTH;
  const desktopGutter = tokens.spacing[2];

  const shellBackdrop = useMemo(
    () =>
      [
        `radial-gradient(circle at 90% 2%, color-mix(in srgb, ${tokens.colors.primary} 20%, transparent) 0%, transparent 32%)`,
        `radial-gradient(circle at 8% 0%, color-mix(in srgb, ${tokens.colors.secondary} 18%, transparent) 0%, transparent 30%)`,
        `radial-gradient(circle at 50% 100%, color-mix(in srgb, ${tokens.colors.info} 12%, transparent) 0%, transparent 26%)`,
        "repeating-linear-gradient(0deg, var(--ds-shell-grid-line, transparent) 0 1px, transparent 1px var(--ds-shell-grid-size, 0px))",
        "repeating-linear-gradient(90deg, var(--ds-shell-grid-line, transparent) 0 1px, transparent 1px var(--ds-shell-grid-size, 0px))",
        `linear-gradient(180deg, color-mix(in srgb, ${PAGE_BACKGROUND} 96%, ${tokens.colors.primary} 4%) 0%, var(--ds-color-bg-secondary) 56%, color-mix(in srgb, ${PAGE_BACKGROUND} 96%, ${tokens.colors.secondary} 4%) 100%)`,
      ].join(", "),
    [tokens.colors.info, tokens.colors.primary, tokens.colors.secondary]
  );

  const breadcrumbItems =
    route.breadcrumbs.length > 0
      ? route.breadcrumbs
      : [{ href: "/", label: "Showroom" }];
  const principleSignals = [
    {
      label: "Palette",
      value: tokens.colors.primary,
      detail: runtime.tenantName,
      swatch: tokens.colors.primary,
    },
    {
      label: "Chrome",
      value:
        ENGINE_OPTIONS.find((option) => option.value === engine)?.label ?? engine,
      detail: "renderer posture",
    },
    {
      label: "Radius",
      value: tokens.borderRadius.lg,
      detail: "surface shape",
    },
    {
      label: "Density",
      value: tokens.personality.card.paddingDensity,
      detail: runtime.productProfileLabel,
    },
  ] as const;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: shellBackdrop,
        color: "var(--ds-color-text-primary)",
        ["--showroom-sidebar-width" as string]: `${sidebarWidth}px`,
        ["--showroom-shell-canvas" as string]: `color-mix(in srgb, var(--ds-color-bg-secondary, var(--ds-color-bg-primary, #ffffff)) 94%, ${tokens.colors.primary} 6%)`,
        ["--showroom-shell-surface" as string]: `color-mix(in srgb, var(--ds-color-bg-elevated, var(--ds-color-bg-primary, #ffffff)) 88%, ${tokens.colors.primary} 12%)`,
        ["--showroom-shell-surface-strong" as string]: `color-mix(in srgb, var(--ds-color-bg-elevated, var(--ds-color-bg-primary, #ffffff)) 92%, ${tokens.colors.secondary} 8%)`,
        ["--showroom-shell-surface-subtle" as string]: `color-mix(in srgb, var(--ds-color-bg-elevated, var(--ds-color-bg-primary, #ffffff)) 82%, ${tokens.colors.secondary} 18%)`,
        ["--showroom-shell-border" as string]: `color-mix(in srgb, var(--ds-color-border-subtle, var(--ds-color-border, rgba(148, 163, 184, 0.22))) 84%, ${tokens.colors.primary} 16%)`,
        ["--showroom-shell-border-strong" as string]: `color-mix(in srgb, var(--ds-color-border, rgba(148, 163, 184, 0.32)) 78%, ${tokens.colors.secondary} 22%)`,
        ["--showroom-shell-text" as string]: "var(--ds-color-text-primary, #101418)",
        ["--showroom-shell-text-secondary" as string]:
          "var(--ds-color-text-secondary, #5b6677)",
        ["--showroom-shell-text-tertiary" as string]:
          "var(--ds-color-text-muted, #7d8797)",
        ["--showroom-shell-active-bg" as string]:
          `color-mix(in srgb, ${tokens.colors.primary} 12%, var(--showroom-shell-surface-subtle))`,
        ["--showroom-shell-hover-bg" as string]:
          `color-mix(in srgb, ${tokens.colors.primary} 8%, var(--showroom-shell-surface))`,
        ["--showroom-shell-active-border" as string]:
          `color-mix(in srgb, ${tokens.colors.primary} 24%, var(--showroom-shell-border-strong))`,
        ["--showroom-shell-header-backdrop" as string]:
          "color-mix(in srgb, var(--showroom-shell-canvas) 84%, transparent)",
        ["--showroom-shell-overlay" as string]:
          `color-mix(in srgb, ${tokens.colors.primary} 10%, rgba(15, 23, 42, 0.24))`,
        ["--showroom-shell-shadow" as string]:
          "0 16px 36px color-mix(in srgb, var(--ds-color-shadow, rgba(15, 23, 42, 0.12)) 14%, transparent)",
        ["--showroom-shell-shadow-strong" as string]:
          "0 28px 72px color-mix(in srgb, var(--ds-color-shadow, rgba(15, 23, 42, 0.16)) 20%, transparent)",
      }}
    >
      <Box className="showroom-shell-grid">
        <Box
          as="aside"
          className="showroom-shell-sidebar"
          style={{
            padding: `${tokens.spacing[5]}px ${tokens.spacing[4]}px`,
            paddingBottom: `${tokens.spacing[6]}px`,
            borderRight: `1px solid ${SIDEBAR_BORDER}`,
            background: `linear-gradient(180deg, color-mix(in srgb, ${tokens.colors.primary} 4%, ${SIDEBAR_BACKGROUND}) 0%, color-mix(in srgb, ${tokens.colors.secondary} 5%, ${SIDEBAR_BACKGROUND}) 100%)`,
            color: SIDEBAR_TEXT,
            boxShadow:
              "inset -1px 0 0 color-mix(in srgb, var(--ds-color-border-subtle) 76%, transparent)",
          }}
        >
          <Box
            className="showroom-shell-sidebar-frame"
            style={{
              gap: tokens.spacing[3],
              minHeight: "100%",
            }}
          >
            <SidebarLaunchpad
              onOpenSearch={() => setSearchOpen(true)}
              pathname={pathname}
              runtimeLabel={`${runtime.tenantName} / ${runtime.engine}`}
            />

            <SidebarNavigator pathname={pathname} />

            <Box className="showroom-shell-sidebar-footer-wrap">
              <SidebarFooter />
            </Box>
          </Box>
        </Box>

        <Box className="showroom-shell-main" style={{ minWidth: 0 }}>
          <Box
            as="header"
            className="showroom-shell-header"
            style={{
              position: "sticky",
              top: 0,
              zIndex: 20,
              padding: `${tokens.spacing[2]}px ${desktopGutter}px ${tokens.spacing[1]}px`,
              borderBottom: `1px solid ${HEADER_BORDER}`,
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--showroom-shell-canvas) 94%, transparent) 0%, color-mix(in srgb, var(--showroom-shell-canvas) 88%, transparent) 72%, color-mix(in srgb, var(--showroom-shell-canvas) 70%, transparent) 100%)",
              backdropFilter: "blur(18px)",
            }}
          >
            <Box
              className="showroom-shell-header-surface"
              style={{
                width: "100%",
                maxWidth: SHELL_CONTENT_MAX_WIDTH,
                margin: "0 auto",
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.lg,
                border: "1px solid color-mix(in srgb, var(--showroom-shell-border-strong) 76%, transparent)",
                background:
                  "linear-gradient(180deg, color-mix(in srgb, var(--showroom-shell-surface-subtle) 78%, transparent) 0%, color-mix(in srgb, var(--showroom-shell-surface) 92%, transparent) 100%)",
                boxShadow:
                  "var(--showroom-shell-shadow), inset 0 -1px 0 color-mix(in srgb, var(--showroom-shell-border) 68%, transparent)",
              }}
            >
              <Box
                className="showroom-shell-header-stack"
                style={{
                  display: "grid",
                  gap: tokens.spacing[1],
                }}
              >
                <Box className="showroom-shell-header-meta-grid">
                  <Box
                    style={{
                      minWidth: 0,
                      padding: "2px 0 0",
                      display: "grid",
                      gap: 4,
                    }}
                  >
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{
                        display: "block",
                        color: "var(--ds-color-text-muted)",
                        lineHeight: 1.35,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Published DS package · {route.sectionMeta.eyebrow} · {runtime.tenantName} /{" "}
                      {runtime.engine}
                    </Text>
                    <Text
                      size="xs"
                      style={{
                        display: "block",
                        color: "var(--ds-color-text-muted)",
                        lineHeight: 1.35,
                      }}
                    >
                      Shared route metadata for the active runtime, kept inline so the shell reads
                      like a thin header band.
                    </Text>
                  </Box>

                  <Box
                    className="showroom-shell-principle-grid"
                    style={{
                      minWidth: 0,
                    }}
                  >
                    {principleSignals.map((item) => (
                      <Box
                        className="showroom-shell-principle-pill"
                        key={item.label}
                        style={{
                          minWidth: 0,
                          padding: "10px 12px",
                          borderRadius: 18,
                          border: "1px solid var(--showroom-shell-border)",
                          background:
                            "linear-gradient(180deg, color-mix(in srgb, var(--showroom-shell-surface-subtle) 82%, transparent) 0%, color-mix(in srgb, var(--showroom-shell-surface) 88%, transparent) 100%)",
                        }}
                      >
                        <Flex align="center" gap={8} style={{ minWidth: 0 }}>
                          <Box
                            style={{
                              width: 9,
                              height: 9,
                              borderRadius: 999,
                              flexShrink: 0,
                              border: "1px solid var(--showroom-shell-border)",
                              background:
                                ("swatch" in item ? item.swatch : undefined) ??
                                "color-mix(in srgb, var(--ds-color-primary, #ffffff) 16%, transparent)",
                            }}
                          />
                          <Text
                            size="xs"
                            weight="semibold"
                            style={{
                              display: "block",
                              color: "var(--ds-color-text-muted)",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                            }}
                          >
                            {item.label}
                          </Text>
                        </Flex>
                        <Text
                          size="xs"
                          weight="semibold"
                          style={{
                            display: "block",
                            marginTop: 6,
                            color: "var(--ds-color-text-primary)",
                            overflowWrap: "anywhere",
                            fontSize: "12px",
                            lineHeight: 1.3,
                            fontFamily:
                              item.label === "Palette" || item.label === "Radius"
                                ? "var(--font-geist-mono)"
                                : undefined,
                          }}
                        >
                          {item.value}
                        </Text>
                        <Text
                          size="xs"
                          style={{
                            display: "block",
                            marginTop: 4,
                            color: "var(--ds-color-text-muted)",
                            fontSize: "10px",
                            lineHeight: 1.35,
                          }}
                        >
                          {item.detail}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box className="showroom-shell-hero-grid">
                  <Box
                    style={{
                      minWidth: 0,
                      padding: "0",
                    }}
                  >
                    <Flex align="start" gap={12} style={{ minWidth: 0 }}>
                      <Box
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: tokens.borderRadius.lg,
                          border: "1px solid var(--showroom-shell-border)",
                          background:
                            "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary, #ffffff) 14%, var(--showroom-shell-surface-subtle)) 0%, color-mix(in srgb, var(--ds-color-primary, #ffffff) 7%, var(--showroom-shell-surface)) 100%)",
                          color: "var(--ds-color-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow:
                            "0 6px 16px color-mix(in srgb, var(--ds-color-primary, #ffffff) 8%, transparent)",
                        }}
                      >
                        <SectionIcon size={18} />
                      </Box>

                      <Stack spacing="xs" style={{ minWidth: 0, flex: 1, gap: 4 }}>
                        <BreadcrumbTrail items={breadcrumbItems} />
                        <Box
                          className="showroom-shell-route-head"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "minmax(0, 1fr) auto",
                            alignItems: "start",
                            gap: 8,
                            paddingTop: 4,
                            paddingBottom: 6,
                            borderBottom:
                              "1px solid color-mix(in srgb, var(--showroom-shell-border) 82%, transparent)",
                          }}
                        >
                          <Text
                            as={"h2" as any}
                            size="xl"
                            weight="bold"
                            style={{
                              display: "block",
                              color: "var(--ds-color-text-primary)",
                              fontSize: "clamp(1.32rem, 1.1rem + 0.62vw, 1.8rem)",
                              lineHeight: 0.98,
                            }}
                          >
                            {route.title}
                          </Text>

                          <Flex
                            className="showroom-shell-route-pills"
                          gap={6}
                          style={{
                            flexWrap: "wrap",
                            justifyContent: "flex-end",
                            alignItems: "center",
                          }}
                        >
                            <Box
                              style={{
                                padding: "4px 8px",
                                borderRadius: 999,
                                border: "1px solid var(--showroom-shell-border)",
                                background:
                                  "linear-gradient(180deg, color-mix(in srgb, var(--showroom-shell-surface-subtle) 84%, transparent) 0%, color-mix(in srgb, var(--showroom-shell-surface) 88%, transparent) 100%)",
                              }}
                            >
                              <Text
                                size="xs"
                                style={{
                                  display: "block",
                                  color: "var(--ds-color-text-muted)",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.07em",
                                  fontSize: "10px",
                                }}
                              >
                                Active profile
                              </Text>
                              <Text
                                size="xs"
                                weight="semibold"
                                style={{
                                  display: "block",
                                  marginTop: 2,
                                  color: "var(--ds-color-text-primary)",
                                  fontSize: "11px",
                                }}
                              >
                                {runtime.productProfileLabel}
                              </Text>
                            </Box>

                            <Box
                              style={{
                                padding: "4px 8px",
                                borderRadius: 999,
                                border: "1px solid var(--showroom-shell-border)",
                                background:
                                  "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-secondary, #ffffff) 10%, var(--showroom-shell-surface-subtle)) 0%, color-mix(in srgb, var(--showroom-shell-surface) 90%, transparent) 100%)",
                              }}
                            >
                              <Text
                                size="xs"
                                style={{
                                  display: "block",
                                  color: "var(--ds-color-text-muted)",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.07em",
                                  fontSize: "10px",
                                }}
                              >
                                Runtime posture
                              </Text>
                              <Text
                                size="xs"
                                weight="semibold"
                                style={{
                                  display: "block",
                                  marginTop: 2,
                                  color: "var(--ds-color-text-primary)",
                                  fontSize: "11px",
                                }}
                              >
                                {runtime.tenantName} / {runtime.engine}
                              </Text>
                            </Box>
                          </Flex>
                        </Box>
                        <Text
                          size="sm"
                          style={{
                            display: "block",
                            color: "var(--ds-color-text-secondary)",
                            maxWidth: "50ch",
                            lineHeight: 1.45,
                          }}
                        >
                          {route.description}
                        </Text>
                      </Stack>
                    </Flex>
                  </Box>

                  <Box className="showroom-shell-control-stack" style={{ minWidth: 0 }}>
                    <Box
                      style={{
                        padding: "10px 12px",
                        borderRadius: tokens.borderRadius.lg,
                        border: "1px solid var(--showroom-shell-border)",
                        background:
                          "linear-gradient(135deg, color-mix(in srgb, var(--ds-color-primary, #ffffff) 10%, var(--showroom-shell-surface-subtle)) 0%, color-mix(in srgb, var(--ds-color-secondary, #ffffff) 8%, var(--showroom-shell-surface)) 100%)",
                      }}
                    >
                      <Text
                        size="xs"
                        weight="semibold"
                        style={{
                          display: "block",
                          color: "var(--ds-color-text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Runtime controls
                      </Text>

                      <Box
                        className="showroom-shell-toolbar-grid"
                        style={{ minWidth: 0, marginTop: 10 }}
                      >
                        <SegmentedGroup
                          label="Tenant"
                          options={TENANT_OPTIONS}
                          value={tenantSlug}
                          onSelect={setTenantSlug}
                        />
                        <SegmentedGroup
                          label="Engine"
                          options={ENGINE_OPTIONS}
                          value={engine}
                          onSelect={setEngine}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box
            as="main"
            style={{
              padding: `${tokens.spacing[3]}px ${desktopGutter}px ${tokens.spacing[5]}px`,
              minWidth: 0,
            }}
          >
            <Box
              style={{
                width: "100%",
                maxWidth: SHELL_CONTENT_MAX_WIDTH,
                margin: "0 auto",
                minWidth: 0,
                containerType: "inline-size",
                containerName: "showroom-content",
              }}
            >
              {children}
            </Box>
          </Box>
        </Box>
      </Box>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <style>{`
        .showroom-shell-grid {
          display: grid;
          grid-template-columns: var(--showroom-sidebar-width) minmax(0, 1fr);
          min-height: 100vh;
        }

        .showroom-shell-sidebar {
          position: sticky;
          top: 0;
          align-self: start;
          box-sizing: border-box;
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          scrollbar-gutter: stable;
        }

        .showroom-shell-main {
          min-width: 0;
        }

        .showroom-shell-sidebar-frame {
          display: flex;
          flex-direction: column;
          min-height: 100%;
        }

        .showroom-shell-sidebar-footer-wrap {
          margin-top: auto;
        }

        .showroom-shell-nav-scroll {
          min-height: 0;
          overflow: visible;
          margin-right: 0;
          padding-right: 0;
        }

        .showroom-shell-nav-link {
          display: block;
        }

        .showroom-shell-nav-link:hover .showroom-shell-nav-item[data-active="false"],
        .showroom-shell-nav-link:focus-visible .showroom-shell-nav-item[data-active="false"] {
          background:
            linear-gradient(
              180deg,
              ${NAV_ITEM_HOVER_BG} 0%,
              color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 28%, transparent) 100%
            );
          border-color: color-mix(in srgb, ${SIDEBAR_BORDER} 56%, transparent);
          transform: translateX(2px);
        }

        .showroom-shell-nav-link:focus-visible {
          outline: none;
        }

        .showroom-shell-header-meta-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(240px, 0.82fr);
          gap: 8px;
          align-items: start;
        }

        .showroom-shell-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.72fr) minmax(250px, 312px);
          gap: 14px;
          align-items: start;
        }

        .showroom-shell-principle-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(132px, 1fr));
          gap: 8px;
          min-width: 0;
        }

        .showroom-shell-principle-pill {
          min-height: 78px;
          align-content: start;
        }

        .showroom-shell-control-stack {
          display: grid;
          gap: 12px;
          align-content: start;
        }

        .showroom-shell-context-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 10px;
        }

        .showroom-shell-toolbar-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }

        .showroom-shell-route-pills {
          min-width: 0;
        }

        .showroom-shell-launchpad-signal {
          min-width: 0;
        }

        @media (max-width: 1560px) {
          .showroom-shell-header-meta-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .showroom-shell-principle-grid {
            justify-content: start !important;
          }
        }

        @media (max-width: 1440px) {
          .showroom-shell-hero-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .showroom-shell-route-head {
            grid-template-columns: minmax(0, 1fr);
          }

          .showroom-shell-route-pills {
            justify-content: flex-start !important;
          }
        }

        @media (max-width: 960px) {
          .showroom-shell-principle-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .showroom-shell-principle-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 1360px) {
          .showroom-shell-toolbar-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 1280px) {
          .showroom-shell-launchpad-signals {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          .showroom-shell-launchpad-signal {
            padding: 4px 2px !important;
            border: none !important;
            border-top: 1px solid color-mix(in srgb, ${SIDEBAR_BORDER} 30%, transparent);
          }

          .showroom-shell-launchpad-signal:first-child {
            border-top: none !important;
            padding-top: 0 !important;
          }
        }

        @media (max-width: 1240px) {
          .showroom-shell-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .showroom-shell-sidebar {
            position: relative;
            height: auto;
            border-right: none;
            border-bottom: 1px solid var(--ds-color-border-subtle);
            overflow: visible;
          }

          .showroom-shell-sidebar-frame {
            min-height: 0 !important;
          }

          .showroom-shell-nav-scroll {
            overflow: visible;
            margin-right: 0;
            padding-right: 0;
          }
        }

        @media (max-width: 760px) {
          .showroom-shell-header {
            padding: 16px 16px 10px;
          }

          .showroom-shell-header-surface {
            padding: 10px 12px 8px;
          }

          .showroom-shell-hero-grid {
            gap: 12px;
          }

          .showroom-shell-toolbar-grid {
            gap: 8px;
          }

          .showroom-shell-context-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }
      `}</style>
    </Box>
  );
}
