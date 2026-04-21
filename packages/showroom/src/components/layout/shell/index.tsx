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
  "var(--ds-sidebar-bg, var(--ds-layout-sider-bg, var(--ds-color-bg-primary)))";
const SIDEBAR_BORDER =
  "var(--ds-sidebar-border, var(--ds-layout-sider-border, var(--ds-color-border-subtle)))";
const SIDEBAR_TEXT = "var(--ds-sidebar-text, var(--ds-color-text-primary))";
const SIDEBAR_MUTED =
  "var(--ds-sidebar-text-muted, var(--ds-color-text-secondary))";
const NAV_ITEM_ACTIVE_BG =
  "var(--ds-sidebar-item-bg-active, color-mix(in srgb, var(--ds-color-primary, #ffffff) 10%, transparent))";
const NAV_ITEM_HOVER_BG =
  "var(--ds-sidebar-item-bg-hover, color-mix(in srgb, var(--ds-color-primary, #ffffff) 5%, transparent))";
const NAV_ITEM_ACTIVE_TEXT =
  "var(--ds-sidebar-item-color-active, var(--ds-color-text-primary))";
const NAV_ITEM_TEXT =
  "var(--ds-sidebar-item-color, var(--ds-color-text-secondary))";
const HEADER_BACKGROUND =
  "var(--ds-layout-header-bg, color-mix(in srgb, var(--ds-color-bg-primary) 86%, transparent))";
const HEADER_BORDER =
  "var(--ds-layout-header-border, var(--ds-color-border-subtle))";
const PAGE_BACKGROUND =
  "var(--ds-layout-bg, var(--ds-color-bg-primary, #0b0d12))";
const STABLE_SIDEBAR_WIDTH = 428;
const SHELL_CONTENT_MAX_WIDTH = 1680;
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
        paddingLeft: depth > 0 ? 10 : 0,
        borderLeft:
          depth > 0
            ? `1px solid color-mix(in srgb, ${SIDEBAR_BORDER} 76%, transparent)`
            : "none",
      }}
    >
      <Link href={item.path} style={{ textDecoration: "none" }}>
        <Box
          style={{
            padding:
              depth === 0
                ? "10px 12px"
                : "8px 10px",
            borderRadius: depth === 0 ? 16 : 12,
            border: active
              ? `1px solid color-mix(in srgb, var(--ds-color-primary, #ffffff) 24%, ${SIDEBAR_BORDER})`
              : `1px solid color-mix(in srgb, ${SIDEBAR_BORDER} 52%, transparent)`,
            background: active
              ? `linear-gradient(135deg, ${NAV_ITEM_ACTIVE_BG} 0%, color-mix(in srgb, var(--ds-color-primary, #ffffff) 4%, var(--ds-color-bg-elevated, #ffffff)) 100%)`
              : depth === 0
                ? "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 68%, transparent) 0%, color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 44%, transparent) 100%)"
                : "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 40%, transparent) 0%, color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 28%, transparent) 100%)",
            boxShadow: active
              ? "0 14px 30px color-mix(in srgb, var(--ds-color-primary, #ffffff) 12%, transparent)"
              : "inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 56%, transparent)",
            transition:
              "background-color 160ms ease, border-color 160ms ease, transform 160ms ease",
          }}
        >
          <Flex align="center" justify="between" gap={10}>
            <Flex align="center" gap={10} style={{ minWidth: 0, flex: 1 }}>
              <Box
                style={{
                  width: depth === 0 ? 8 : 6,
                  height: depth === 0 ? 8 : 6,
                  borderRadius: 999,
                  background: active
                    ? "var(--ds-color-primary)"
                    : `color-mix(in srgb, ${SIDEBAR_MUTED} 48%, transparent)`,
                  flexShrink: 0,
                }}
              />
              <Text
                size={depth === 0 ? "sm" : "xs"}
                style={{
                  display: "block",
                  color: active ? NAV_ITEM_ACTIVE_TEXT : NAV_ITEM_TEXT,
                  fontSize: depth === 0 ? "13.5px" : "12.5px",
                  fontWeight: active ? 650 : depth === 0 ? 560 : 520,
                  lineHeight: 1.35,
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
      style={{
        padding: 12,
        borderRadius: 22,
        border: active
          ? `1px solid color-mix(in srgb, ${sectionMeta.accent} 32%, ${SIDEBAR_BORDER})`
          : `1px solid color-mix(in srgb, ${SIDEBAR_BORDER} 72%, transparent)`,
        background: active
          ? `linear-gradient(180deg, color-mix(in srgb, ${sectionMeta.accent} 10%, var(--ds-sidebar-bg, var(--ds-color-bg-primary))) 0%, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 42%, var(--ds-sidebar-bg, var(--ds-color-bg-primary))) 100%)`
          : "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 48%, var(--ds-sidebar-bg, var(--ds-color-bg-primary))) 0%, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 24%, var(--ds-sidebar-bg, var(--ds-color-bg-primary))) 100%)",
        boxShadow: active
          ? "var(--ds-shadow-sm, 0 12px 28px rgba(0, 0, 0, 0.1))"
          : "inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 58%, transparent)",
      }}
    >
      <Flex align="start" justify="between" gap={12}>
        <Flex align="start" gap={12} style={{ minWidth: 0 }}>
          <Box
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid color-mix(in srgb, ${sectionMeta.accent} 24%, ${SIDEBAR_BORDER})`,
              background: `color-mix(in srgb, ${sectionMeta.accent} 12%, transparent)`,
              color: sectionMeta.accent,
              flexShrink: 0,
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
          marginTop: 12,
          padding: 6,
          borderRadius: 18,
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 26%, transparent) 0%, color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 18%, transparent) 100%)",
          border: `1px solid color-mix(in srgb, ${SIDEBAR_BORDER} 42%, transparent)`,
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
          display: "grid",
          gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
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
                width: "100%",
                minWidth: 0,
                minHeight: 34,
                padding: "6px 8px",
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
        padding: 22,
        borderRadius: 26,
        border: `1px solid ${SIDEBAR_BORDER}`,
        background: [
          "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary, #ffffff) 9%, var(--ds-sidebar-bg, var(--ds-color-bg-primary))) 0%, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 52%, var(--ds-sidebar-bg, var(--ds-color-bg-primary))) 100%)",
        ].join(", "),
        boxShadow: "var(--ds-shadow-lg, 0 24px 56px rgba(0, 0, 0, 0.2))",
      }}
    >
      <Stack spacing="sm" fullWidth>
        <Box
          style={{
            width: 64,
            height: 4,
            borderRadius: 999,
            background:
              'linear-gradient(90deg, var(--ds-color-primary, #ffffff) 0%, var(--ds-color-secondary, var(--ds-color-primary, #ffffff)) 100%)',
          }}
        />

        <Flex align="center" gap={12}>
          <Box
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              border: `1px solid ${SIDEBAR_BORDER}`,
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
          style={{ display: "block", color: SIDEBAR_MUTED, lineHeight: 1.65 }}
        >
          Published-package documentation wired to the real DS runtime so the
          same routes reveal how tenant and engine reshape identical component
          contracts.
        </Text>

        <Flex gap={8} style={{ flexWrap: "wrap" }}>
          <Badge variant="primary">{runtimeLabel}</Badge>
          <Badge variant="secondary">Real runtime</Badge>
          <Badge variant="secondary">No fake skin</Badge>
        </Flex>

        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(108px, 1fr))",
            gap: 8,
          }}
        >
          <Box
            style={{
              minWidth: 0,
              padding: 12,
              borderRadius: 16,
              border: `1px solid ${SIDEBAR_BORDER}`,
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 52%, transparent) 0%, color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 30%, transparent) 100%)",
              boxShadow:
                "inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 56%, transparent)",
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
                  width: 14,
                  height: 14,
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
          </Box>

          <Box
            style={{
              minWidth: 0,
              padding: 12,
              borderRadius: 16,
              border: `1px solid ${SIDEBAR_BORDER}`,
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 52%, transparent) 0%, color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 30%, transparent) 100%)",
              boxShadow:
                "inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 56%, transparent)",
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
                  width: 28,
                  height: 18,
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
          </Box>

          <Box
            style={{
              minWidth: 0,
              padding: 12,
              borderRadius: 16,
              border: `1px solid ${SIDEBAR_BORDER}`,
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 52%, transparent) 0%, color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 30%, transparent) 100%)",
              boxShadow:
                "inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 56%, transparent)",
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
                marginTop: 5,
                color: SIDEBAR_MUTED,
                lineHeight: 1.45,
              }}
            >
              {runtime.productProfileLabel}
            </Text>
          </Box>
        </Box>

        <Flex gap={10} style={{ flexWrap: "wrap", marginTop: 4 }}>
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
        padding: 16,
        borderRadius: 24,
        border: `1px solid ${SIDEBAR_BORDER}`,
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 62%, var(--ds-sidebar-bg, var(--ds-color-bg-primary))) 0%, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 34%, var(--ds-sidebar-bg, var(--ds-color-bg-primary))) 100%)",
        boxShadow:
          "var(--ds-shadow-sm, 0 12px 28px rgba(0, 0, 0, 0.08)), inset 0 1px 0 color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 58%, transparent)",
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
          style={{ display: "block", color: SIDEBAR_MUTED, lineHeight: 1.55 }}
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
        padding: 18,
        borderRadius: 22,
        border: `1px solid ${SIDEBAR_BORDER}`,
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary, #ffffff) 7%, var(--ds-sidebar-bg, var(--ds-color-bg-primary))) 0%, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 45%, var(--ds-sidebar-bg, var(--ds-color-bg-primary))) 100%)",
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
              minHeight: `calc(100vh - ${(tokens.spacing[5] + tokens.spacing[6]) * 2}px)`,
            }}
          >
            <SidebarLaunchpad
              onOpenSearch={() => setSearchOpen(true)}
              pathname={pathname}
              runtimeLabel={`${runtime.tenantName} / ${runtime.engine}`}
            />

            <SidebarNavigator pathname={pathname} />

            <SidebarFooter />
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
              padding: `${tokens.spacing[3]}px ${desktopGutter}px ${tokens.spacing[2]}px`,
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-primary) 98%, transparent) 0%, color-mix(in srgb, var(--ds-color-bg-primary) 92%, transparent) 72%, color-mix(in srgb, var(--ds-color-bg-primary) 68%, transparent) 100%)",
              backdropFilter: "blur(18px)",
            }}
          >
            <Box
              className="showroom-shell-header-surface"
              style={{
                width: "100%",
                maxWidth: SHELL_CONTENT_MAX_WIDTH,
                margin: "0 auto",
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.xl,
                border: "1px solid color-mix(in srgb, var(--ds-color-border-subtle) 88%, transparent)",
                background:
                  "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 82%, transparent) 0%, color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 88%, transparent) 100%)",
                boxShadow:
                  "0 14px 34px color-mix(in srgb, var(--ds-color-shadow, rgba(0, 0, 0, 0.12)) 18%, transparent), inset 0 -1px 0 color-mix(in srgb, var(--ds-color-border-subtle) 78%, transparent)",
              }}
            >
              <Box
                className="showroom-shell-header-stack"
                style={{
                  display: "grid",
                  gap: tokens.spacing[2],
                }}
              >
                <Box className="showroom-shell-header-meta-grid">
                  <Box
                    style={{
                      minWidth: 0,
                      padding: `${tokens.spacing[1]}px 0`,
                      display: "grid",
                      gap: 6,
                    }}
                  >
                    <Flex align="center" gap={6} style={{ flexWrap: "wrap" }}>
                      <Badge variant="secondary">Published DS package</Badge>
                      <Badge variant="secondary">{route.sectionMeta.eyebrow}</Badge>
                      <Badge variant="secondary">
                        {runtime.tenantName} / {runtime.engine}
                      </Badge>
                    </Flex>
                    <Text
                      size="xs"
                      style={{
                        display: "block",
                        color: "var(--ds-color-text-muted)",
                        lineHeight: 1.4,
                      }}
                    >
                      Shared route metadata for the active runtime, kept inline so the
                      shell reads like a thin header band instead of a hero card.
                    </Text>
                  </Box>

                  <Flex
                    align="center"
                    justify="end"
                    gap={8}
                    style={{ flexWrap: "wrap", minWidth: 0 }}
                  >
                    {principleSignals.map((item) => (
                      <Box
                        key={item.label}
                        style={{
                          minWidth: 0,
                          padding: "8px 10px",
                          borderRadius: 999,
                          border: "1px solid var(--ds-color-border-subtle)",
                          background:
                            "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 80%, transparent) 0%, color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 74%, transparent) 100%)",
                        }}
                      >
                        <Flex align="center" gap={8} style={{ minWidth: 0 }}>
                          <Box
                            style={{
                              width: 9,
                              height: 9,
                              borderRadius: 999,
                              flexShrink: 0,
                              border: "1px solid var(--ds-color-border-subtle)",
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
                          <Text
                            size="xs"
                            weight="semibold"
                            style={{
                              display: "block",
                              color: "var(--ds-color-text-primary)",
                              overflowWrap: "anywhere",
                              fontFamily:
                                item.label === "Palette" || item.label === "Radius"
                                  ? "var(--font-geist-mono)"
                                  : undefined,
                            }}
                          >
                            {item.value}
                          </Text>
                        </Flex>
                      </Box>
                    ))}
                  </Flex>
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
                          width: 38,
                          height: 38,
                          borderRadius: tokens.borderRadius.lg,
                          border: "1px solid var(--ds-color-border-subtle)",
                          background:
                            "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-primary, #ffffff) 12%, var(--ds-color-bg-elevated)) 0%, color-mix(in srgb, var(--ds-color-primary, #ffffff) 6%, var(--ds-color-bg-primary)) 100%)",
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
                        <Flex gap={6} style={{ flexWrap: "wrap", marginBottom: 2 }}>
                          <Badge variant="secondary">{runtime.productProfileLabel}</Badge>
                          <Badge variant="secondary">{runtime.verticalLabel}</Badge>
                        </Flex>
                        <BreadcrumbTrail items={breadcrumbItems} />
                        <Text
                          as={"h2" as any}
                          size="xl"
                          weight="bold"
                          style={{
                            display: "block",
                            color: "var(--ds-color-text-primary)",
                            fontSize: "clamp(1.28rem, 1.08rem + 0.55vw, 1.72rem)",
                            lineHeight: 1,
                          }}
                        >
                          {route.title}
                        </Text>
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

                        <Flex gap={6} style={{ flexWrap: "wrap", marginTop: 2 }}>
                          <Box
                            style={{
                              padding: "5px 8px",
                              borderRadius: 999,
                              border: "1px solid var(--ds-color-border-subtle)",
                              background:
                                "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-bg-elevated, #ffffff) 72%, transparent) 0%, color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 76%, transparent) 100%)",
                            }}
                          >
                            <Text
                              size="xs"
                              style={{
                                display: "block",
                                color: "var(--ds-color-text-muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.07em",
                                fontSize: "10.5px",
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
                                fontSize: "11.5px",
                              }}
                            >
                              {runtime.productProfileLabel}
                            </Text>
                          </Box>

                          <Box
                            style={{
                              padding: "5px 8px",
                              borderRadius: 999,
                              border: "1px solid var(--ds-color-border-subtle)",
                              background:
                                "linear-gradient(180deg, color-mix(in srgb, var(--ds-color-secondary, #ffffff) 8%, var(--ds-color-bg-elevated, #ffffff)) 0%, color-mix(in srgb, var(--ds-color-bg-primary, #ffffff) 78%, transparent) 100%)",
                            }}
                          >
                            <Text
                              size="xs"
                              style={{
                                display: "block",
                                color: "var(--ds-color-text-muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.07em",
                                fontSize: "10.5px",
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
                                fontSize: "11.5px",
                              }}
                            >
                              {runtime.tenantName} / {runtime.engine}
                            </Text>
                          </Box>
                        </Flex>
                      </Stack>
                    </Flex>
                  </Box>

                  <Box className="showroom-shell-control-stack" style={{ minWidth: 0 }}>
                    <Box
                      style={{
                        padding: tokens.spacing[2],
                        borderRadius: tokens.borderRadius.xl,
                        border: "1px solid var(--ds-color-border-subtle)",
                        background:
                          "linear-gradient(135deg, color-mix(in srgb, var(--ds-color-primary, #ffffff) 8%, var(--ds-color-bg-elevated, #ffffff)) 0%, color-mix(in srgb, var(--ds-color-secondary, #ffffff) 7%, var(--ds-color-bg-primary, #ffffff)) 100%)",
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
                        style={{ minWidth: 0, marginTop: tokens.spacing[2] }}
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
          max-height: 100vh;
          overflow: hidden;
        }

        .showroom-shell-main {
          min-width: 0;
        }

        .showroom-shell-sidebar-frame {
          display: grid;
          grid-template-rows: auto minmax(0, 1fr) auto;
        }

        .showroom-shell-nav-scroll {
          min-height: 0;
          overflow: auto;
          margin-right: -4px;
          padding-right: 4px;
        }

        .showroom-shell-header-meta-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.3fr) minmax(280px, 0.9fr);
          gap: 10px;
          align-items: start;
        }

        .showroom-shell-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.55fr) minmax(300px, 404px);
          gap: 18px;
          align-items: start;
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

        @media (max-width: 1480px) {
          .showroom-shell-header-meta-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .showroom-shell-hero-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 1360px) {
          .showroom-shell-toolbar-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 1240px) {
          .showroom-shell-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .showroom-shell-sidebar {
            position: relative;
            max-height: none;
            border-right: none;
            border-bottom: 1px solid var(--ds-color-border-subtle);
            overflow: visible;
          }

          .showroom-shell-sidebar-frame {
            grid-template-rows: auto;
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
            padding: 16px 16px 0;
          }

          .showroom-shell-header-surface {
            padding: 10px 0 8px;
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
