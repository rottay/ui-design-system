"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { Box, Text, Stack, Flex } from "@/components/primitives";
import { useNavigationLink } from "@/runtime/navigation";
import { Bell, Check, Plus, AlertCircle, Info, ChevronRight, ExternalLink, Briefcase, FileText, Users, Star, Zap, RefreshCw } from "lucide-react";
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

function CompactItem({ item, index }: { item: ActivityProps["items"][0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const config = TYPE_CONFIG[item.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.info;
  const IconComponent = config.icons[index % config.icons.length];

  return (
    <Box className="activity-compact-item-v3" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} style={{ padding: "10px 14px", background: "var(--ds-color-bg-primary)", border: "1px solid var(--ds-color-border-secondary)", position: "relative", overflow: "hidden", cursor: "pointer" }}>
      <Box style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: isHovered ? 5 : 3, background: config.gradient, transition: "width 0.3s ease" }} />
      <Flex align="center" gap={12} style={{ position: "relative", paddingLeft: 4 }}>
        <Box style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--ds-color-" + item.type + "-100)", border: "1px solid var(--ds-color-" + item.type + "-200)", flexShrink: 0, position: "relative", transition: "transform 0.3s ease", transform: isHovered ? "scale(1.1)" : "scale(1)" }}>
          <IconComponent style={{ width: 12, height: 12, color: "var(--ds-color-" + item.type + ")" }} />
        </Box>
        <Stack spacing="none" style={{ flex: 1, minWidth: 0 }}>
          <Text size="xs" style={{ color: "var(--ds-color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 500 }}>{item.text}</Text>
          <Flex align="center" gap={4}>
            <Box style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--ds-color-" + item.type + ")" }} />
            <Text size="xs" style={{ color: "var(--ds-color-text-muted)", fontFamily: "monospace", fontSize: 9 }}>{item.time} ago</Text>
          </Flex>
        </Stack>
        <ChevronRight style={{ width: 12, height: 12, color: "var(--ds-color-" + item.type + ")", opacity: isHovered ? 1 : 0, transform: isHovered ? "translateX(0)" : "translateX(-6px)", transition: "all 0.3s ease" }} />
      </Flex>
    </Box>
  );
}

export function ActivityCompact({ items, schedule = [] }: ActivityProps) {
  return (
    <Box style={{ height: 415, padding: "16px", background: "var(--ds-color-bg-secondary)", border: "1px solid var(--ds-color-border-secondary)", position: "relative", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Flex align="center" justify="between" style={{ paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid var(--ds-color-border-secondary)", position: "relative" }}>
        <Flex align="center" gap={10}>
          <Box style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--ds-color-primary-100)", border: "1px solid var(--ds-color-primary-200)", position: "relative" }}>
            <Bell style={{ width: 14, height: 14, color: "var(--ds-color-primary)" }} />
            <Box style={{ position: "absolute", top: -4, right: -4, width: 14, height: 14, borderRadius: "50%", background: "var(--ds-color-error)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--ds-color-bg-secondary)" }}>
              <Text style={{ fontSize: 8, color: "white", fontWeight: 700 }}>{items.length}</Text>
            </Box>
          </Box>
          <Stack spacing="none">
            <Text weight="bold" style={{ color: "var(--ds-color-text-primary)" }}>Recent Activity</Text>
            <Text size="xs" style={{ color: "var(--ds-color-text-muted)", fontFamily: "monospace", fontSize: 9 }}>{items.length} UPDATES</Text>
          </Stack>
        </Flex>
        <NavLinkAnchor href="/activity" style={{ textDecoration: "none" }}>
          <Flex align="center" gap={4} className="view-all-link" style={{ padding: "6px 10px", background: "var(--ds-color-primary-100)", border: "1px solid var(--ds-color-primary-200)", transition: "all 0.2s ease" }}>
            <Text size="xs" weight="medium" style={{ color: "var(--ds-color-primary)" }}>View all</Text>
            <ExternalLink style={{ width: 10, height: 10, color: "var(--ds-color-primary)" }} />
          </Flex>
        </NavLinkAnchor>
      </Flex>
      <Box style={{ flex: 1, overflowY: "auto", minHeight: 0 }} className="activity-scroll">
        <Stack spacing="sm">
          {items.map((item: ActivityItem, i: number) => <CompactItem key={i} item={item} index={i} />)}
        </Stack>
      </Box>
      <style>{`
        .activity-compact-item-v3 { animation: slideInRight 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .activity-compact-item-v3:hover { background: var(--ds-color-primary-50); border-color: var(--ds-color-primary-200); transform: translateX(6px); box-shadow: -4px 0 16px var(--ds-color-primary-100); }
        .view-all-link:hover { background: var(--ds-color-primary-200); transform: translateX(2px); }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        .activity-scroll { scrollbar-width: thin; scrollbar-color: var(--ds-color-primary-200) transparent; }
        .activity-scroll::-webkit-scrollbar { width: 4px; }
        .activity-scroll::-webkit-scrollbar-track { background: transparent; }
        .activity-scroll::-webkit-scrollbar-thumb { background: var(--ds-color-primary-200); border-radius: 2px; }
      `}</style>
    </Box>
  );
}
