"use client";

import { useEffect, useState } from "react";
import { Box, Text, Stack, Flex } from "@/components/primitives";
import { Activity, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import type { MetricsProps, KeyMetric } from "../../types";

function useCountUp(end: number, duration: number = 1200, delay: number = 0) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHasStarted(true), delay); return () => clearTimeout(t); }, [delay]);
  useEffect(() => {
    if (!hasStarted) return;
    let startTime: number; let af: number;
    const animate = (ts: number) => { if (!startTime) startTime = ts; const p = Math.min((ts - startTime) / duration, 1); setCount(Math.floor((1 - Math.pow(1 - p, 4)) * end)); if (p < 1) af = requestAnimationFrame(animate); };
    af = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(af);
  }, [end, duration, hasStarted]);
  return count;
}

function MetricRow({ metric, index, maxValue }: { metric: MetricsProps["metrics"][0]; index: number; maxValue: number }) {
  const numericValue = parseInt(metric.value.replace(/[^0-9.-]/g, "")) || 0;
  const suffix = metric.value.replace(/[0-9.-]/g, "");
  const animatedValue = useCountUp(numericValue, 1000, index * 150);
  const [isHovered, setIsHovered] = useState(false);
  const percentage = Math.min((numericValue / maxValue) * 100, 100);

  return (
    <Box
      className="minimal-metric-row"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ padding: "16px 20px", background: "var(--ds-color-bg-primary)", border: "1px solid var(--ds-color-border-secondary)", position: "relative", overflow: "hidden", cursor: "pointer" }}
    >
      <Box style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: isHovered ? 4 : 3, background: metric.positive ? "linear-gradient(180deg, var(--ds-color-success), var(--ds-color-primary))" : "linear-gradient(180deg, var(--ds-color-warning), var(--ds-color-error))", transition: "width 0.2s ease" }} />

      <Flex align="center" gap={16} style={{ position: "relative" }}>
        <Box style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", background: metric.positive ? "var(--ds-color-success-100)" : "var(--ds-color-warning-100)", border: metric.positive ? "1px solid var(--ds-color-success-200)" : "1px solid var(--ds-color-warning-200)", flexShrink: 0, transition: "transform 0.3s ease", transform: isHovered ? "scale(1.05)" : "scale(1)" }}>
          <metric.icon style={{ width: 22, height: 22, color: metric.positive ? "var(--ds-color-success)" : "var(--ds-color-warning)" }} />
        </Box>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Flex align="center" justify="between" style={{ marginBottom: 8 }}>
            <Stack spacing="none">
              <Text size="sm" weight="medium" style={{ color: "var(--ds-color-text-primary)" }}>{metric.label}</Text>
              <Flex align="center" gap={6}>
                {metric.positive ? <TrendingUp style={{ width: 12, height: 12, color: "var(--ds-color-success)" }} /> : <TrendingDown style={{ width: 12, height: 12, color: "var(--ds-color-error)" }} />}
                <Text size="xs" style={{ color: metric.positive ? "var(--ds-color-success)" : "var(--ds-color-error)", fontFamily: "monospace" }}>{metric.change}</Text>
              </Flex>
            </Stack>
            <Text style={{ fontSize: 28, fontWeight: 800, color: isHovered ? "var(--ds-color-primary)" : "var(--ds-color-text-primary)", fontFamily: "monospace", letterSpacing: "-0.02em", transition: "color 0.2s ease" }}>{animatedValue}{suffix}</Text>
          </Flex>
          <Box style={{ height: 6, background: "var(--ds-color-bg-tertiary)", borderRadius: 3, position: "relative", overflow: "hidden" }}>
            <Box style={{ position: "absolute", top: 0, left: 0, height: "100%", width: percentage + "%", background: metric.positive ? "linear-gradient(90deg, var(--ds-color-success), var(--ds-color-primary))" : "linear-gradient(90deg, var(--ds-color-warning), var(--ds-color-error))", borderRadius: 3, transition: "background 0.3s ease" }} />
          </Box>
        </Box>

        <ChevronRight style={{ width: 16, height: 16, color: "var(--ds-color-primary)", opacity: isHovered ? 1 : 0, transform: isHovered ? "translateX(0)" : "translateX(-8px)", transition: "all 0.3s ease", flexShrink: 0 }} />
      </Flex>
    </Box>
  );
}

export function MetricsMinimal({ metrics }: MetricsProps) {
  const maxValue = Math.max(...metrics.map((m: KeyMetric) => parseInt(m.value.replace(/[^0-9.-]/g, "")) || 0), 1);

  return (
    <Box style={{ height: 415, padding: "16px", background: "var(--ds-color-bg-secondary)", border: "1px solid var(--ds-color-border-secondary)", position: "relative", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Flex align="center" justify="between" style={{ paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid var(--ds-color-border-secondary)", position: "relative" }}>
        <Flex align="center" gap={10}>
          <Box style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--ds-color-primary-100)", border: "1px solid var(--ds-color-primary-200)" }}>
            <Activity style={{ width: 16, height: 16, color: "var(--ds-color-primary)" }} />
          </Box>
          <Stack spacing="none">
            <Text weight="bold" style={{ color: "var(--ds-color-text-primary)" }}>Key Metrics</Text>
            <Text size="xs" style={{ color: "var(--ds-color-text-muted)", fontFamily: "monospace", fontSize: 9 }}>REAL-TIME DATA</Text>
          </Stack>
        </Flex>
        <Box style={{ padding: "6px 12px", background: "var(--ds-color-success-100)", border: "1px solid var(--ds-color-success-200)" }}>
          <Flex align="center" gap={6}>
            <Box className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ds-color-success)" }} />
            <Text size="xs" weight="bold" style={{ color: "var(--ds-color-success)", fontFamily: "monospace" }}>LIVE</Text>
          </Flex>
        </Box>
      </Flex>

      <Box style={{ flex: 1, overflowY: "auto", minHeight: 0 }} className="metrics-scroll">
        <Stack spacing="sm">
          {metrics.map((metric: KeyMetric, i: number) => <MetricRow key={metric.label} metric={metric} index={i} maxValue={maxValue} />)}
        </Stack>
      </Box>

      <style>{`
        .minimal-metric-row { animation: slideIn 0.4s ease-out both; transition: all 0.2s ease; }
        .minimal-metric-row:hover { background: var(--ds-color-primary-50); border-color: var(--ds-color-primary-200); transform: translateX(4px); }
        .live-dot { animation: glow 2s ease-in-out infinite; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 4px var(--ds-color-success), 0 0 8px var(--ds-color-success); } 50% { box-shadow: 0 0 8px var(--ds-color-success), 0 0 16px var(--ds-color-success); } }
        .metrics-scroll { scrollbar-width: thin; scrollbar-color: var(--ds-color-primary-200) transparent; }
        .metrics-scroll::-webkit-scrollbar { width: 4px; }
        .metrics-scroll::-webkit-scrollbar-track { background: transparent; }
        .metrics-scroll::-webkit-scrollbar-thumb { background: var(--ds-color-primary-200); border-radius: 2px; }
      `}</style>
    </Box>
  );
}
