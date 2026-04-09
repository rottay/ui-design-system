/**
 * @fileoverview DataTerminalCard — page-structure-tier dashboard metric card
 * with four animated visual variants.
 *
 * @description
 * Engine-free chrome family for dashboard surfaces. Renders a single
 * metric card with a "Terminal / HUD / Circuit / Matrix" visual theme,
 * a trend indicator, an optional sparkline, and an optional href that
 * turns the whole card into a link via the DS navigation adapter.
 * Consumers compose multiple cards into a dashboard grid or drop a
 * single card into a widget slot.
 *
 * The component is framework-agnostic:
 *   - Navigation goes through `useNavigationLink()` from the DS runtime
 *     so consumers in Next.js, Remix, plain React, etc. all work as
 *     long as they mount the corresponding adapter provider (or fall
 *     back to the native `<a>` when no provider is mounted).
 *   - Focus state comes from `useDsFocusMode()` so apps that expose a
 *     focus-mode experience can mount `<FocusModeProvider>` and have
 *     the card dim/highlight appropriately.
 *
 * Contract cleanup (trend/progress/path shape normalization) is
 * planned for a later checkpoint; for now the public API is unchanged
 * from its original extraction shape.
 */
"use client";

import { useMemo, createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { Box, Text, Flex } from "@/components/primitives";
import { useNavigationLink } from "@/runtime/navigation";
import { useDsFocusMode } from "@/runtime/focus-mode";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Eye,
  Plus,
  BarChart3,
  Activity,
  type LucideIcon,
} from "lucide-react";

/**
 * Internal Link wrapper that resolves the consumer-supplied Link via the
 * NavigationLinkProvider context, falling back to a native `<a>` when no
 * provider is mounted. This keeps the DS pattern framework-agnostic
 * (mirrors the Wave 5.1 follow-up adapter pattern used by SurfaceReadField).
 */
function NavLinkAnchor({
  href,
  style,
  children,
}: {
  href: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const NavLink = useNavigationLink();
  if (NavLink) {
    return (
      <NavLink href={href} style={style}>
        {children}
      </NavLink>
    );
  }
  return (
    <a href={href} style={style}>
      {children}
    </a>
  );
}

export interface DataTerminalCardProps {
  label: string;
  value: number | string;
  change?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  path: string;
  progress?: number;
  subtitle?: string;
  hideOnFocus?: boolean;
  variant?: 1 | 2 | 3 | 4;
}

// Design System CSS Variables
const DS = {
  primary: "var(--ds-color-primary)",
  success: "var(--ds-color-success)",
  error: "var(--ds-color-error)",
  warning: "var(--ds-color-warning)",
  background: "var(--ds-color-background)",
  backgroundSubtle: "var(--ds-color-background-subtle)",
  border: "var(--ds-color-border)",
  borderSubtle: "var(--ds-color-border-subtle)",
  textPrimary: "var(--ds-color-text)",
  textSecondary: "var(--ds-color-text-secondary)",
  textMuted: "var(--ds-color-text-muted)",
  textSubtle: "var(--ds-color-text-subtle)",
};

// Context for consistent variant
const VariantContext = createContext<1 | 2 | 3 | 4 | null>(null);

function getPageVariant(): 1 | 2 | 3 | 4 {
  if (typeof window === "undefined") return 1;
  let seed = (window as unknown as { __cardVariantSeed?: number }).__cardVariantSeed;
  if (!seed) {
    seed = Math.floor(Math.random() * 4) + 1;
    (window as unknown as { __cardVariantSeed?: number }).__cardVariantSeed = seed;
  }
  return seed as 1 | 2 | 3 | 4;
}

export function DataTerminalCardProvider({ children, variant }: { children: ReactNode; variant?: 1 | 2 | 3 | 4 }) {
  const pageVariant = useMemo(() => variant ?? getPageVariant(), [variant]);
  return <VariantContext.Provider value={pageVariant}>{children}</VariantContext.Provider>;
}

// CSS Keyframes - enhanced with more "alive" animations
const keyframes = `
  @keyframes dtc-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes dtc-pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }
  @keyframes dtc-heartbeat {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.2); opacity: 1; }
  }
  @keyframes dtc-breathe {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }
  @keyframes dtc-scan {
    0% { transform: translateY(-100%); opacity: 0; }
    50% { opacity: 0.5; }
    100% { transform: translateY(300%); opacity: 0; }
  }
  @keyframes dtc-glow {
    0%, 100% { box-shadow: 0 0 2px currentColor; }
    50% { box-shadow: 0 0 8px currentColor, 0 0 12px currentColor; }
  }
  @keyframes dtc-slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(400%); }
  }
  @keyframes dtc-blink {
    0%, 90%, 100% { opacity: 1; }
    95% { opacity: 0.2; }
  }
  @keyframes dtc-live-pulse {
    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 currentColor; }
    50% { transform: scale(1.1); box-shadow: 0 0 0 4px transparent; }
  }
  @keyframes dtc-data-tick {
    0%, 100% { opacity: 0.6; }
    10% { opacity: 1; }
    20% { opacity: 0.6; }
  }
  @keyframes dtc-wave {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  @keyframes dtc-typing {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  @keyframes dtc-flow {
    0% { background-position: 0 0; }
    100% { background-position: 40px 40px; }
  }
  @keyframes dtc-number-glow {
    0%, 100% { text-shadow: 0 0 10px currentColor; }
    50% { text-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
  }
`;

if (typeof document !== "undefined") {
  const styleId = "data-terminal-card-keyframes-v4";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = keyframes;
    document.head.appendChild(style);
  }
}

// Utility function for progress color
function getProgressColor(progress: number): string {
  if (progress >= 80) return DS.success;
  if (progress >= 50) return DS.warning;
  return DS.error;
}

// Live indicator component
function LiveIndicator({ color = DS.success }: { color?: string }) {
  return (
    <Flex align="center" gap={6}>
      <Box
        style={{
          position: "relative",
          width: 6,
          height: 6,
        }}
      >
        <Box
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: color,
            animation: "dtc-live-pulse 2s ease-in-out infinite",
          }}
        />
        <Box
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: color,
          }}
        />
      </Box>
      <Text style={{ fontSize: 9, color: DS.textMuted, fontFamily: "monospace", letterSpacing: "0.05em" }}>
        LIVE
      </Text>
    </Flex>
  );
}

// Activity indicator - simulates data activity
// Heights are stable across renders to avoid impure Math.random() during render
const ACTIVITY_BAR_HEIGHTS = [12, 9, 15, 10, 14];

function ActivityIndicator() {
  return (
    <Flex align="center" gap={2}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Box
          key={i}
          style={{
            width: 2,
            height: ACTIVITY_BAR_HEIGHTS[i],
            background: DS.success,
            borderRadius: 1,
            animation: `dtc-data-tick 1s ease-in-out infinite ${i * 0.15}s`,
          }}
        />
      ))}
    </Flex>
  );
}

// Quick action button
function QuickAction({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <Box
      as="button"
      onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "5px 10px",
        background: "transparent",
        border: `1px solid ${DS.border}`,
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
    >
      <Icon style={{ width: 11, height: 11, color: DS.textMuted }} />
      <Text style={{ fontSize: 9, color: DS.textMuted, fontFamily: "monospace", letterSpacing: "0.05em" }}>{label}</Text>
    </Box>
  );
}

// Progress bar component
function ProgressBar({ progress, height = 4 }: { progress: number; height?: number }) {
  const color = getProgressColor(progress);
  return (
    <Box style={{ height, background: DS.border, borderRadius: height / 2, overflow: "hidden" }}>
      <Box
        style={{
          height: "100%",
          width: `${progress}%`,
          background: color,
          borderRadius: height / 2,
          transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Shimmer effect */}
        <Box
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
            animation: "dtc-wave 2s ease-in-out infinite",
          }}
        />
      </Box>
    </Box>
  );
}

// Stats item component for consistent layout
function StatItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Text style={{ fontSize: 9, color: DS.textSubtle, fontFamily: "monospace", letterSpacing: "0.08em", display: "block" }}>
        {label}
      </Text>
      <Box>{children}</Box>
    </Box>
  );
}

/**
 * VARIANT 1: Command - Terminal style
 */
function CommandCard({
  label, value, change, trend = "up", icon: Icon, path, progress = 0, subtitle,
}: Omit<DataTerminalCardProps, "variant" | "hideOnFocus">) {
  const isPositive = trend === "up";
  const trendColor = isPositive ? DS.success : DS.error;
  const progressColor = getProgressColor(progress);

  return (
    <NavLinkAnchor href={path} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      <Box
        style={{
          position: "relative",
          height: "100%",
          minHeight: 240,
          background: DS.background,
          border: `1px solid ${DS.border}`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "dtc-fade-in 0.4s ease-out",
        }}
      >
        {/* Terminal header */}
        <Box
          style={{
            padding: "8px 14px",
            background: DS.backgroundSubtle,
            borderBottom: `1px solid ${DS.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Flex align="center" gap={10}>
            <Flex gap={5}>
              <Box style={{ width: 10, height: 10, borderRadius: "50%", background: DS.error, opacity: 0.8 }} />
              <Box style={{ width: 10, height: 10, borderRadius: "50%", background: DS.warning, opacity: 0.8 }} />
              <Box style={{ width: 10, height: 10, borderRadius: "50%", background: DS.success, opacity: 0.8 }} />
            </Flex>
            <Text style={{ fontSize: 11, color: DS.textMuted, fontFamily: "monospace" }}>
              {label.toLowerCase().replace(/\s+/g, "_")}.sys
            </Text>
          </Flex>
          <Flex align="center" gap={8}>
            <ActivityIndicator />
            <Box style={{ width: 8, height: 8, background: progressColor, borderRadius: "50%", animation: "dtc-heartbeat 1.5s ease-in-out infinite" }} />
          </Flex>
        </Box>

        {/* Content */}
        <Box style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column" }}>
          {/* Command prompt header */}
          <Box style={{ paddingBottom: 12, borderBottom: `1px solid ${DS.border}`, marginBottom: 16 }}>
            <Flex align="center" gap={8}>
              <Text style={{ fontSize: 12, color: DS.success, fontFamily: "monospace" }}>$</Text>
              <Icon style={{ width: 14, height: 14, color: DS.textSecondary }} />
              <Text style={{ fontSize: 12, color: DS.textSecondary, fontFamily: "monospace", letterSpacing: "0.05em" }}>
                {label.toUpperCase()}
              </Text>
              <Box style={{ width: 8, height: 2, background: DS.textMuted, animation: "dtc-typing 1s step-end infinite" }} />
            </Flex>
          </Box>

          {/* Main value section */}
          <Box style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <Text
              style={{
                fontSize: 56,
                fontWeight: 900,
                color: DS.textPrimary,
                fontFamily: "monospace",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {typeof value === "number" ? value.toLocaleString() : value}
            </Text>
          </Box>

          {/* Stats grid - well segmented */}
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
              padding: "14px 0",
              borderTop: `1px solid ${DS.border}`,
              marginTop: 12,
            }}
          >
            <StatItem label="CHANGE">
              <Flex align="center" gap={4}>
                {isPositive ? <TrendingUp style={{ width: 14, height: 14, color: trendColor }} /> : <TrendingDown style={{ width: 14, height: 14, color: trendColor }} />}
                <Text style={{ fontSize: 14, fontWeight: 700, color: trendColor, fontFamily: "monospace" }}>{change || "--"}</Text>
              </Flex>
            </StatItem>
            <StatItem label="PERIOD">
              <Text style={{ fontSize: 12, color: DS.textSecondary, fontFamily: "monospace" }}>{subtitle || "This week"}</Text>
            </StatItem>
            <StatItem label="TARGET">
              <Text style={{ fontSize: 14, fontWeight: 700, color: progressColor, fontFamily: "monospace" }}>{progress}%</Text>
            </StatItem>
          </Box>

          {/* Progress bar section */}
          <Box style={{ paddingTop: 12 }}>
            <ProgressBar progress={progress} height={5} />
          </Box>
        </Box>

        {/* Actions footer */}
        <Box style={{ padding: "10px 14px", borderTop: `1px solid ${DS.border}`, background: DS.backgroundSubtle }}>
          <Flex gap={8}>
            <QuickAction icon={Eye} label="VIEW" />
            <QuickAction icon={Plus} label="ADD" />
            <QuickAction icon={BarChart3} label="STATS" />
          </Flex>
        </Box>
      </Box>
    </NavLinkAnchor>
  );
}

/**
 * VARIANT 2: HUD - Heads-up display
 */
function HUDCard({
  label, value, change, trend = "up", icon: Icon, path, progress = 0, subtitle,
}: Omit<DataTerminalCardProps, "variant" | "hideOnFocus">) {
  const isPositive = trend === "up";
  const trendColor = isPositive ? DS.success : DS.error;
  const progressColor = getProgressColor(progress);
  const statusLabel = progress >= 80 ? "OPTIMAL" : progress >= 50 ? "MODERATE" : "ATTENTION";

  return (
    <NavLinkAnchor href={path} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      <Box
        style={{
          position: "relative",
          height: "100%",
          minHeight: 240,
          background: DS.background,
          border: `1px solid ${DS.border}`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "dtc-fade-in 0.4s ease-out",
        }}
      >
        {/* Grid texture */}
        <Box
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(${DS.border} 1px, transparent 1px), linear-gradient(90deg, ${DS.border} 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
            opacity: 0.25,
            animation: "dtc-breathe 4s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />

        {/* Scan line */}
        <Box
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 50,
            background: `linear-gradient(180deg, transparent, ${DS.borderSubtle}, transparent)`,
            animation: "dtc-scan 5s linear infinite",
            pointerEvents: "none",
          }}
        />

        {/* Corner brackets */}
        <Box style={{ position: "absolute", top: 10, left: 10, width: 18, height: 18, borderTop: `2px solid ${DS.textMuted}`, borderLeft: `2px solid ${DS.textMuted}`, animation: "dtc-pulse 3s ease-in-out infinite" }} />
        <Box style={{ position: "absolute", top: 10, right: 10, width: 18, height: 18, borderTop: `2px solid ${DS.textMuted}`, borderRight: `2px solid ${DS.textMuted}`, animation: "dtc-pulse 3s ease-in-out infinite 0.5s" }} />
        <Box style={{ position: "absolute", bottom: 10, left: 10, width: 18, height: 18, borderBottom: `2px solid ${DS.textMuted}`, borderLeft: `2px solid ${DS.textMuted}`, animation: "dtc-pulse 3s ease-in-out infinite 1s" }} />
        <Box style={{ position: "absolute", bottom: 10, right: 10, width: 18, height: 18, borderBottom: `2px solid ${DS.textMuted}`, borderRight: `2px solid ${DS.textMuted}`, animation: "dtc-pulse 3s ease-in-out infinite 1.5s" }} />

        {/* Content */}
        <Box style={{ position: "relative", zIndex: 1, flex: 1, padding: 20, display: "flex", flexDirection: "column" }}>
          {/* Header section */}
          <Box style={{ paddingBottom: 14, borderBottom: `1px solid ${DS.border}` }}>
            <Flex align="start" justify="between">
              <Flex align="center" gap={12}>
                <Box style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${DS.border}`, background: DS.backgroundSubtle }}>
                  <Icon style={{ width: 18, height: 18, color: DS.textSecondary }} />
                </Box>
                <Box>
                  <Text style={{ fontSize: 9, color: DS.textSubtle, fontFamily: "monospace", letterSpacing: "0.15em", marginBottom: 4, display: "block" }}>
                    TRACKING
                  </Text>
                  <Text style={{ fontSize: 13, color: DS.textSecondary, fontFamily: "monospace", fontWeight: 700, display: "block" }}>
                    {label.toUpperCase()}
                  </Text>
                </Box>
              </Flex>
              <Box style={{ padding: "4px 10px", background: DS.backgroundSubtle, border: `1px solid ${progressColor}` }}>
                <Flex align="center" gap={6}>
                  <Box style={{ width: 6, height: 6, borderRadius: "50%", background: progressColor, animation: "dtc-heartbeat 1.5s ease-in-out infinite" }} />
                  <Text style={{ fontSize: 9, color: progressColor, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.05em" }}>
                    {statusLabel}
                  </Text>
                </Flex>
              </Box>
            </Flex>
          </Box>

          {/* Main value section */}
          <Box style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 0" }}>
            <Text
              style={{
                fontSize: 64,
                fontWeight: 900,
                color: DS.textPrimary,
                fontFamily: "monospace",
                lineHeight: 1,
              }}
            >
              {typeof value === "number" ? value.toLocaleString() : value}
            </Text>
            <Flex align="center" gap={12} style={{ marginTop: 16 }}>
              <Box style={{ padding: "6px 12px", background: DS.backgroundSubtle, border: `1px solid ${trendColor}` }}>
                <Flex align="center" gap={6}>
                  {isPositive ? <TrendingUp style={{ width: 14, height: 14, color: trendColor }} /> : <TrendingDown style={{ width: 14, height: 14, color: trendColor }} />}
                  <Text style={{ fontSize: 13, fontWeight: 700, color: trendColor, fontFamily: "monospace" }}>{change || "--"}</Text>
                </Flex>
              </Box>
              <Text style={{ fontSize: 12, color: DS.textSubtle, fontFamily: "monospace" }}>
                {subtitle || "this period"}
              </Text>
            </Flex>
          </Box>

          {/* Bottom stats section */}
          <Box style={{ padding: "14px 16px", background: DS.backgroundSubtle, border: `1px solid ${DS.border}` }}>
            <Flex align="center" justify="between">
              <Box>
                <Text style={{ fontSize: 9, color: DS.textSubtle, fontFamily: "monospace", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>
                  COMPLETION
                </Text>
                <Text style={{ fontSize: 18, color: progressColor, fontFamily: "monospace", fontWeight: 700, display: "block" }}>
                  {progress}%
                </Text>
              </Box>
              <Box style={{ flex: 1, maxWidth: 120, margin: "0 20px" }}>
                <ProgressBar progress={progress} height={6} />
              </Box>
              <Flex align="center" gap={8}>
                <Activity style={{ width: 14, height: 14, color: DS.success, animation: "dtc-pulse 1s ease-in-out infinite" }} />
                <Text style={{ fontSize: 11, color: DS.textMuted, fontFamily: "monospace", letterSpacing: "0.05em" }}>DETAILS</Text>
                <ArrowRight style={{ width: 12, height: 12, color: DS.textMuted }} />
              </Flex>
            </Flex>
          </Box>
        </Box>
      </Box>
    </NavLinkAnchor>
  );
}

/**
 * VARIANT 3: Circuit - Circuit board aesthetic
 */
function CircuitCard({
  label, value, change, trend = "up", icon: Icon, path, progress = 0, subtitle,
}: Omit<DataTerminalCardProps, "variant" | "hideOnFocus">) {
  const isPositive = trend === "up";
  const trendColor = isPositive ? DS.success : DS.error;
  const progressColor = getProgressColor(progress);

  return (
    <NavLinkAnchor href={path} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      <Box
        style={{
          position: "relative",
          height: "100%",
          minHeight: 240,
          background: DS.background,
          border: `1px solid ${DS.border}`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "dtc-fade-in 0.4s ease-out",
        }}
      >
        {/* Circuit pattern */}
        <Box
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              radial-gradient(circle at 8px 8px, ${DS.border} 2px, transparent 2px),
              linear-gradient(90deg, transparent 7px, ${DS.border} 7px, ${DS.border} 8px, transparent 8px),
              linear-gradient(transparent 7px, ${DS.border} 7px, ${DS.border} 8px, transparent 8px)
            `,
            backgroundSize: "32px 32px",
            opacity: 0.12,
            pointerEvents: "none",
          }}
        />

        {/* Data flow line */}
        <Box
          style={{
            position: "absolute",
            top: "40%",
            left: 0,
            width: 60,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${DS.success}, transparent)`,
            animation: "dtc-slide 4s linear infinite",
            pointerEvents: "none",
          }}
        />

        {/* Node indicators */}
        <Box style={{ position: "absolute", top: 12, left: 12, width: 10, height: 10, borderRadius: "50%", background: DS.backgroundSubtle, border: `2px solid ${DS.textMuted}`, animation: "dtc-pulse 2s ease-in-out infinite" }} />
        <Box style={{ position: "absolute", top: 12, right: 12, width: 10, height: 10, borderRadius: "50%", background: progressColor, animation: "dtc-heartbeat 1.5s ease-in-out infinite" }} />
        <Box style={{ position: "absolute", bottom: 12, left: 12, width: 10, height: 10, borderRadius: "50%", background: DS.backgroundSubtle, border: `2px solid ${DS.textMuted}`, animation: "dtc-pulse 2s ease-in-out infinite 1s" }} />
        <Box style={{ position: "absolute", bottom: 12, right: 12, width: 10, height: 10, borderRadius: "50%", background: DS.backgroundSubtle, border: `2px solid ${DS.textMuted}`, animation: "dtc-pulse 2s ease-in-out infinite 0.5s" }} />

        {/* Content */}
        <Box style={{ position: "relative", zIndex: 1, flex: 1, padding: 16, display: "flex", flexDirection: "column" }}>
          {/* Header section */}
          <Box style={{ paddingBottom: 12, borderBottom: `1px solid ${DS.border}` }}>
            <Flex align="center" justify="between">
              <Flex align="center" gap={10}>
                <Box style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${DS.border}`, background: DS.backgroundSubtle }}>
                  <Icon style={{ width: 14, height: 14, color: DS.textSecondary }} />
                </Box>
                <Box>
                  <Text style={{ fontSize: 9, color: DS.textSubtle, fontFamily: "monospace", letterSpacing: "0.1em", display: "block", marginBottom: 2 }}>
                    METRIC
                  </Text>
                  <Text style={{ fontSize: 12, color: DS.textSecondary, fontFamily: "monospace", fontWeight: 600, letterSpacing: "0.05em", display: "block" }}>
                    {label.toUpperCase()}
                  </Text>
                </Box>
              </Flex>
              <Flex align="center" gap={10}>
                <ActivityIndicator />
                <LiveIndicator color={progressColor} />
              </Flex>
            </Flex>
          </Box>

          {/* Main value section */}
          <Box style={{ flex: 1, display: "flex", alignItems: "center", padding: "16px 0" }}>
            <Text
              style={{
                fontSize: 56,
                fontWeight: 900,
                color: DS.textPrimary,
                fontFamily: "monospace",
                lineHeight: 1,
              }}
            >
              {typeof value === "number" ? value.toLocaleString() : value}
            </Text>
          </Box>

          {/* Stats grid section */}
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              padding: "12px 0",
              borderTop: `1px solid ${DS.border}`,
              borderBottom: `1px solid ${DS.border}`,
            }}
          >
            <StatItem label="CHANGE">
              <Flex align="center" gap={4}>
                {isPositive ? <TrendingUp style={{ width: 14, height: 14, color: trendColor }} /> : <TrendingDown style={{ width: 14, height: 14, color: trendColor }} />}
                <Text style={{ fontSize: 14, fontWeight: 700, color: trendColor, fontFamily: "monospace" }}>{change || "--"}</Text>
              </Flex>
            </StatItem>
            <StatItem label="PERIOD">
              <Text style={{ fontSize: 12, color: DS.textSecondary, fontFamily: "monospace" }}>{subtitle || "This week"}</Text>
            </StatItem>
            <StatItem label="TARGET">
              <Text style={{ fontSize: 14, fontWeight: 700, color: progressColor, fontFamily: "monospace" }}>{progress}%</Text>
            </StatItem>
          </Box>

          {/* Progress section */}
          <Box style={{ padding: "12px 0" }}>
            <ProgressBar progress={progress} height={5} />
          </Box>

          {/* Actions footer */}
          <Flex gap={8}>
            <QuickAction icon={Eye} label="VIEW" />
            <QuickAction icon={BarChart3} label="ANALYTICS" />
          </Flex>
        </Box>
      </Box>
    </NavLinkAnchor>
  );
}

/**
 * VARIANT 4: Matrix - Data grid with sectored stats
 */
function MatrixCard({
  label, value, change, trend = "up", icon: Icon, path, progress = 0, subtitle,
}: Omit<DataTerminalCardProps, "variant" | "hideOnFocus">) {
  const isPositive = trend === "up";
  const trendColor = isPositive ? DS.success : DS.error;
  const progressColor = getProgressColor(progress);

  return (
    <NavLinkAnchor href={path} style={{ textDecoration: "none", display: "block", height: "100%" }}>
      <Box
        style={{
          position: "relative",
          height: "100%",
          minHeight: 240,
          background: DS.background,
          border: `1px solid ${DS.border}`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "dtc-fade-in 0.4s ease-out",
        }}
      >
        {/* Dot matrix texture */}
        <Box
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(${DS.border} 1px, transparent 1px)`,
            backgroundSize: "12px 12px",
            opacity: 0.35,
            pointerEvents: "none",
            animation: "dtc-flow 40s linear infinite",
          }}
        />

        {/* Content */}
        <Box style={{ position: "relative", zIndex: 1, flex: 1, padding: 16, display: "flex", flexDirection: "column" }}>
          {/* Header section */}
          <Box style={{ paddingBottom: 12, borderBottom: `1px solid ${DS.border}` }}>
            <Flex align="center" justify="between">
              <Flex align="center" gap={10}>
                <Box style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: DS.backgroundSubtle, border: `1px solid ${DS.border}` }}>
                  <Icon style={{ width: 14, height: 14, color: DS.textSecondary }} />
                </Box>
                <Box>
                  <Text style={{ fontSize: 9, color: DS.textSubtle, fontFamily: "monospace", letterSpacing: "0.1em", display: "block", marginBottom: 2 }}>
                    DATA POINT
                  </Text>
                  <Text style={{ fontSize: 12, color: DS.textSecondary, fontFamily: "monospace", fontWeight: 600, letterSpacing: "0.05em", display: "block" }}>
                    {label.toUpperCase()}
                  </Text>
                </Box>
              </Flex>
              <LiveIndicator color={DS.success} />
            </Flex>
          </Box>

          {/* Main value section */}
          <Box style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0" }}>
            <Text
              style={{
                fontSize: 68,
                fontWeight: 900,
                color: DS.textPrimary,
                fontFamily: "monospace",
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              {typeof value === "number" ? value.toLocaleString() : value}
            </Text>
          </Box>

          {/* Stats grid section */}
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              padding: "12px 0",
              borderTop: `1px solid ${DS.border}`,
              borderBottom: `1px solid ${DS.border}`,
            }}
          >
            <StatItem label="CHANGE">
              <Flex align="center" gap={4}>
                {isPositive ? <TrendingUp style={{ width: 12, height: 12, color: trendColor }} /> : <TrendingDown style={{ width: 12, height: 12, color: trendColor }} />}
                <Text style={{ fontSize: 13, fontWeight: 700, color: trendColor, fontFamily: "monospace" }}>{change || "--"}</Text>
              </Flex>
            </StatItem>
            <StatItem label="PERIOD">
              <Text style={{ fontSize: 11, color: DS.textSecondary, fontFamily: "monospace" }}>{subtitle || "This week"}</Text>
            </StatItem>
            <StatItem label="TARGET">
              <Text style={{ fontSize: 13, fontWeight: 700, color: progressColor, fontFamily: "monospace" }}>{progress}%</Text>
            </StatItem>
          </Box>

          {/* Progress section */}
          <Box style={{ padding: "12px 0", borderBottom: `1px solid ${DS.border}` }}>
            <ProgressBar progress={progress} height={4} />
          </Box>

          {/* Footer section */}
          <Flex align="center" justify="between" style={{ paddingTop: 12 }}>
            <ActivityIndicator />
            <Flex align="center" gap={6}>
              <Text style={{ fontSize: 10, color: DS.textMuted, fontFamily: "monospace", letterSpacing: "0.05em" }}>VIEW DETAILS</Text>
              <ArrowRight style={{ width: 12, height: 12, color: DS.textMuted }} />
            </Flex>
          </Flex>
        </Box>
      </Box>
    </NavLinkAnchor>
  );
}

/**
 * Main DataTerminalCard component
 */
export function DataTerminalCard({
  label, value, change, trend = "up", icon, path, progress = 0, subtitle, hideOnFocus = true, variant: propVariant,
}: DataTerminalCardProps) {
  const isFocusMode = useDsFocusMode();
  const shouldHide = hideOnFocus && isFocusMode;
  const contextVariant = useContext(VariantContext);

  const variant = useMemo(() => {
    if (propVariant) return propVariant;
    if (contextVariant) return contextVariant;
    return getPageVariant();
  }, [propVariant, contextVariant]);

  if (shouldHide) return null;

  const props = { label, value, change, trend, icon, path, progress, subtitle };

  switch (variant) {
    case 1: return <CommandCard {...props} />;
    case 2: return <HUDCard {...props} />;
    case 3: return <CircuitCard {...props} />;
    case 4: default: return <MatrixCard {...props} />;
  }
}

/**
 * DataTerminalStat - Smaller stat variant
 */
export function DataTerminalStat({
  label, value, change, trend = "up", icon: Icon, progress = 0,
}: Omit<DataTerminalCardProps, "path">) {
  const isPositive = trend === "up";
  const trendColor = isPositive ? DS.success : DS.error;

  return (
    <Box
      style={{
        position: "relative",
        padding: 14,
        background: DS.background,
        border: `1px solid ${DS.border}`,
        height: "100%",
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box style={{ position: "absolute", top: 0, left: 0, width: 10, height: 10, borderTop: `2px solid ${DS.textMuted}`, borderLeft: `2px solid ${DS.textMuted}` }} />
      <Box style={{ position: "absolute", top: 0, right: 0, width: 10, height: 10, borderTop: `2px solid ${DS.textMuted}`, borderRight: `2px solid ${DS.textMuted}` }} />

      <Flex align="center" gap={6} style={{ marginBottom: 6 }}>
        <Icon style={{ width: 12, height: 12, color: DS.textSecondary }} />
        <Text style={{ fontSize: 9, fontWeight: 600, color: DS.textSecondary, fontFamily: "monospace", letterSpacing: "0.1em" }}>{label.toUpperCase()}</Text>
      </Flex>

      <Box style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <Flex align="baseline" gap={6}>
          <Text style={{ fontSize: 28, fontWeight: 800, color: DS.textPrimary, fontFamily: "monospace", lineHeight: 1 }}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </Text>
          <Flex align="center" gap={3}>
            {isPositive ? <TrendingUp style={{ width: 10, height: 10, color: trendColor }} /> : <TrendingDown style={{ width: 10, height: 10, color: trendColor }} />}
            <Text style={{ fontSize: 11, fontWeight: 700, color: trendColor, fontFamily: "monospace" }}>{change || "--"}</Text>
          </Flex>
        </Flex>
      </Box>

      <ProgressBar progress={progress} height={3} />
    </Box>
  );
}
