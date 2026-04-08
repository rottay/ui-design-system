"use client";

import { useState, useEffect, useCallback, type CSSProperties, type ReactNode } from "react";
import { Box, Text, Stack, Flex } from "@/components/primitives";
import { useNavigationLink } from "@/runtime/navigation";
import { Bell, Check, Plus, AlertCircle, Info, ChevronLeft, ChevronRight, ExternalLink, Briefcase, FileText, Users, Star, Zap, RefreshCw } from "lucide-react";
import type { ActivityProps, ActivityItem } from "../types";

function NavLinkAnchor({ href, style, children }: { href: string; style?: CSSProperties; children: ReactNode }) {
  const NavLink = useNavigationLink();
  if (NavLink) {
    return <NavLink href={href} style={style}>{children}</NavLink>;
  }
  return <a href={href} style={style}>{children}</a>;
}

const SUCCESS_ICONS = [Check, Briefcase, Star, Zap];
const PRIMARY_ICONS = [Plus, FileText, Users, Briefcase];
const INFO_ICONS = [Info, FileText, Briefcase];
const WARNING_ICONS = [AlertCircle, RefreshCw, FileText];
const ERROR_ICONS = [RefreshCw, AlertCircle];

const TYPE_CONFIG = {
  success: { icons: SUCCESS_ICONS, gradient: "linear-gradient(135deg, var(--ds-color-success), var(--ds-color-success-200))" },
  primary: { icons: PRIMARY_ICONS, gradient: "linear-gradient(135deg, var(--ds-color-primary), var(--ds-color-primary-200))" },
  info: { icons: INFO_ICONS, gradient: "linear-gradient(135deg, var(--ds-color-info), var(--ds-color-info-200))" },
  warning: { icons: WARNING_ICONS, gradient: "linear-gradient(135deg, var(--ds-color-warning), var(--ds-color-warning-200))" },
  error: { icons: ERROR_ICONS, gradient: "linear-gradient(135deg, var(--ds-color-error), var(--ds-color-error-200))" },
} as const;

const ROTATION_INTERVAL = 5000;

export function ActivityTicker({ items, schedule: _schedule = [], viewAllHref, viewAllLabel = "View all" }: ActivityProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const goToNext = useCallback(() => {
    if (items.length <= 1) return;
    setDirection("next");
    setIsAnimating(true);
    setTimeout(() => { setCurrentIndex((prev) => (prev + 1) % items.length); setIsAnimating(false); }, 300);
  }, [items.length]);

  const goToPrev = useCallback(() => {
    if (items.length <= 1) return;
    setDirection("prev");
    setIsAnimating(true);
    setTimeout(() => { setCurrentIndex((prev) => (prev - 1 + items.length) % items.length); setIsAnimating(false); }, 300);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(goToNext, ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, [items.length, goToNext]);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];
  const config = TYPE_CONFIG[currentItem.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.info;
  const IconComponent = config.icons[currentIndex % config.icons.length];

  return (
    <Box style={{ height: 415, padding: "16px", background: "var(--ds-color-bg-secondary)", border: "1px solid var(--ds-color-border-secondary)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <Flex align="center" justify="between" style={{ paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid var(--ds-color-border-secondary)", position: "relative" }}>
        <Flex align="center" gap={10}>
          <Box style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, var(--ds-color-primary-100), var(--ds-color-secondary-100))", border: "1px solid var(--ds-color-primary-200)", position: "relative" }}>
            <Bell style={{ width: 16, height: 16, color: "var(--ds-color-primary)" }} />
            <Box style={{ position: "absolute", top: -4, right: -4, width: 14, height: 14, borderRadius: "50%", background: "var(--ds-color-error)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--ds-color-bg-secondary)" }}>
              <Text style={{ fontSize: 8, color: "white", fontWeight: 700 }}>{items.length}</Text>
            </Box>
          </Box>
          <Stack spacing="none">
            <Text weight="bold" style={{ color: "var(--ds-color-text-primary)" }}>Live Updates</Text>
            <Flex align="center" gap={4}>
              <Box className="live-indicator" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ds-color-success)" }} />
              <Text size="xs" style={{ color: "var(--ds-color-success)", fontFamily: "monospace", fontSize: 9 }}>STREAMING</Text>
            </Flex>
          </Stack>
        </Flex>
        {viewAllHref ? (
          <NavLinkAnchor href={viewAllHref} style={{ textDecoration: "none" }}>
            <Flex align="center" gap={4} className="view-all-link" style={{ padding: "6px 10px", background: "var(--ds-color-primary-100)", border: "1px solid var(--ds-color-primary-200)", transition: "all 0.2s ease" }}>
              <Text size="xs" weight="medium" style={{ color: "var(--ds-color-primary)" }}>{viewAllLabel}</Text>
              <ExternalLink style={{ width: 10, height: 10, color: "var(--ds-color-primary)" }} />
            </Flex>
          </NavLinkAnchor>
        ) : null}
      </Flex>

      <Box style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box className="ticker-container" style={{ flex: 1, padding: "20px", background: "linear-gradient(180deg, var(--ds-color-bg-primary) 0%, var(--ds-color-neutral-50) 100%)", border: "1px solid var(--ds-color-border-secondary)", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          <Box className={"ticker-content-v3 " + (isAnimating ? (direction === "next" ? "ticker-out-left" : "ticker-out-right") : "ticker-in")} style={{ textAlign: "center" }}>
            <Flex align="center" justify="center" style={{ marginBottom: 16 }}>
              <Box style={{ width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--ds-color-" + currentItem.type + "-100)", border: "2px solid var(--ds-color-" + currentItem.type + ")", position: "relative" }}>
                <IconComponent style={{ width: 24, height: 24, color: "var(--ds-color-" + currentItem.type + ")" }} />
              </Box>
            </Flex>
            <Text size="sm" weight="semibold" style={{ color: "var(--ds-color-text-primary)", marginBottom: 10, lineHeight: 1.6, fontSize: 15 }}>{currentItem.text}</Text>
            <Flex align="center" justify="center" gap={8}>
              <Box style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ds-color-" + currentItem.type + ")" }} />
              <Text size="xs" style={{ color: "var(--ds-color-text-muted)", fontFamily: "monospace", fontSize: 11 }}>{currentItem.time} ago</Text>
            </Flex>
          </Box>

          {items.length > 1 && (
            <Flex align="center" justify="center" gap={16} style={{ marginTop: 24 }}>
              <Box onClick={goToPrev} className="nav-button" style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--ds-color-bg-secondary)", border: "1px solid var(--ds-color-border-secondary)", cursor: "pointer", position: "relative" }}>
                <ChevronLeft style={{ width: 16, height: 16, color: "var(--ds-color-text-muted)" }} />
              </Box>
              <Flex align="center" gap={8}>
                {items.map((item: ActivityItem, i: number) => (
                  <Box key={i} onClick={() => { if (i !== currentIndex) { setDirection(i > currentIndex ? "next" : "prev"); setIsAnimating(true); setTimeout(() => { setCurrentIndex(i); setIsAnimating(false); }, 300); } }} className="ticker-dot" style={{ width: i === currentIndex ? 24 : 10, height: 10, background: i === currentIndex ? (TYPE_CONFIG[item.type as keyof typeof TYPE_CONFIG]?.gradient || "var(--ds-color-" + item.type + ")") : "var(--ds-color-neutral-200)", cursor: "pointer", transition: "all 0.3s ease", position: "relative" }} />
                ))}
              </Flex>
              <Text size="xs" style={{ color: "var(--ds-color-text-muted)", fontFamily: "monospace", fontSize: 10 }}>{currentIndex + 1}/{items.length}</Text>
              <Box onClick={goToNext} className="nav-button" style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--ds-color-bg-secondary)", border: "1px solid var(--ds-color-border-secondary)", cursor: "pointer", position: "relative" }}>
                <ChevronRight style={{ width: 16, height: 16, color: "var(--ds-color-text-muted)" }} />
              </Box>
            </Flex>
          )}

          {items.length > 1 && (
            <Box style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "var(--ds-color-bg-tertiary)", overflow: "hidden" }}>
              <Box className="ticker-progress" key={currentIndex} style={{ height: "100%", background: config.gradient }} />
            </Box>
          )}
        </Box>
      </Box>

      <style>{`
        .ticker-content-v3 { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .ticker-in { opacity: 1; transform: translateX(0) scale(1); }
        .ticker-out-left { opacity: 0; transform: translateX(-40px) scale(0.95); }
        .ticker-out-right { opacity: 0; transform: translateX(40px) scale(0.95); }
        .live-indicator { animation: liveGlow 1.5s ease-in-out infinite; }
        .nav-button { transition: all 0.3s ease; }
        .nav-button:hover { background: var(--ds-color-primary-100); border-color: var(--ds-color-primary-200); transform: scale(1.1); box-shadow: 0 4px 12px var(--ds-color-primary-100); }
        .ticker-dot { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .ticker-dot:hover { transform: scale(1.2); }
        .ticker-progress { animation: progressFill 5s linear; }
        .view-all-link:hover { background: var(--ds-color-primary-200); transform: translateX(2px); }
        @keyframes liveGlow { 0%, 100% { box-shadow: 0 0 4px var(--ds-color-success), 0 0 8px var(--ds-color-success); opacity: 1; } 50% { box-shadow: 0 0 8px var(--ds-color-success), 0 0 16px var(--ds-color-success); opacity: 0.6; } }
        @keyframes progressFill { from { width: 0%; } to { width: 100%; } }
      `}</style>
    </Box>
  );
}
