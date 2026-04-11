"use client";

import { useState } from "react";
import { Box, Text, Stack, Flex } from "@/components/primitives";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import { useSmoothCounter } from "@/motion/hooks";
import type { MetricsProps, KeyMetric } from "../../types";

function ChartRow({ metric, index, maxValue }: { metric: MetricsProps["metrics"][0]; index: number; maxValue: number }) {
  const numericValue = parseInt(metric.value.replace(/[^0-9.-]/g, "")) || 0;
  const suffix = metric.value.replace(/[0-9.-]/g, "");
  const animatedValue = Math.floor(useSmoothCounter(0, numericValue, 1000, index * 100));
  const [isHovered, setIsHovered] = useState(false);
  const percentage = Math.min((numericValue / maxValue) * 100, 100);

  return (
    <Box
      className="metric-chart-row-v3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ padding: "10px 12px", background: "var(--ds-color-bg-primary)", border: "1px solid var(--ds-color-border-secondary)", position: "relative", overflow: "hidden" }}
    >
      <Box style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: isHovered ? 4 : 3, background: metric.positive ? "linear-gradient(180deg, var(--ds-color-primary), var(--ds-color-success))" : "linear-gradient(180deg, var(--ds-color-warning), var(--ds-color-error))", transition: "width 0.2s ease" }} />

      <Flex align="center" justify="between" style={{ marginBottom: 8, position: "relative" }}>
        <Flex align="center" gap={10}>
          <Box style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--ds-color-primary-100)", border: "1px solid var(--ds-color-primary-200)", position: "relative" }}>
            <metric.icon style={{ width: 14, height: 14, color: "var(--ds-color-primary)" }} />
          </Box>
          <Stack spacing="none">
            <Text size="sm" weight="medium" style={{ color: "var(--ds-color-text-primary)", fontSize: 13 }}>{metric.label}</Text>
            <Flex align="center" gap={4}>
              {metric.positive ? <TrendingUp style={{ width: 10, height: 10, color: "var(--ds-color-success)" }} /> : <TrendingDown style={{ width: 10, height: 10, color: "var(--ds-color-error)" }} />}
              <Text size="xs" style={{ color: metric.positive ? "var(--ds-color-success)" : "var(--ds-color-error)", fontFamily: "monospace", fontSize: 9 }}>{metric.change}</Text>
            </Flex>
          </Stack>
        </Flex>
        <Text style={{ fontSize: 22, fontWeight: 800, color: isHovered ? "var(--ds-color-primary)" : "var(--ds-color-text-primary)", fontFamily: "monospace", letterSpacing: "-0.02em", transition: "color 0.2s ease" }}>{animatedValue}{suffix}</Text>
      </Flex>

      <Box style={{ height: 6, background: "var(--ds-color-bg-tertiary)", borderRadius: 3, position: "relative", overflow: "hidden" }}>
        <Box style={{ position: "absolute", top: 0, left: 0, height: "100%", width: percentage + "%", background: metric.positive ? "linear-gradient(90deg, var(--ds-color-primary), var(--ds-color-success))" : "linear-gradient(90deg, var(--ds-color-warning), var(--ds-color-error))", borderRadius: 3, transition: "background 0.3s ease" }} />
      </Box>

      <Flex justify="between" align="center" style={{ marginTop: 4 }}>
        <Text size="xs" style={{ color: "var(--ds-color-text-muted)", fontFamily: "monospace", fontSize: 9 }}>Progress</Text>
        <Text size="xs" weight="bold" style={{ color: metric.positive ? "var(--ds-color-success)" : "var(--ds-color-warning)", fontFamily: "monospace", fontSize: 9 }}>{Math.round(percentage)}%</Text>
      </Flex>
    </Box>
  );
}

export function MetricsChart({ metrics }: MetricsProps) {
  const maxValue = Math.max(...metrics.map((m: KeyMetric) => parseInt(m.value.replace(/[^0-9.-]/g, "")) || 0), 1);

  return (
    <Box style={{ height: 415, padding: "16px", background: "var(--ds-color-bg-secondary)", border: "1px solid var(--ds-color-border-secondary)", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <Flex align="center" justify="between" style={{ paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid var(--ds-color-border-secondary)", position: "relative" }}>
        <Flex align="center" gap={8}>
          <Box style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--ds-color-primary-100)", border: "1px solid var(--ds-color-primary-200)" }}>
            <Activity style={{ width: 14, height: 14, color: "var(--ds-color-primary)" }} />
          </Box>
          <Text weight="bold" size="sm" style={{ color: "var(--ds-color-text-primary)" }}>Performance</Text>
        </Flex>
        <Flex align="center" gap={4} style={{ padding: "4px 8px", background: "var(--ds-color-success-100)", border: "1px solid var(--ds-color-success-200)" }}>
          <Box className="live-dot-chart" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ds-color-success)" }} />
          <Text size="xs" weight="bold" style={{ color: "var(--ds-color-success)", fontFamily: "monospace", fontSize: 9 }}>LIVE</Text>
        </Flex>
      </Flex>

      <Box style={{ flex: 1, overflowY: "auto", minHeight: 0 }} className="metrics-scroll">
        <Stack spacing="sm">
          {metrics.map((metric: KeyMetric, i: number) => <ChartRow key={metric.label} metric={metric} index={i} maxValue={maxValue} />)}
        </Stack>
      </Box>

      <style>{`
        .metric-chart-row-v3 { animation: slideIn 0.4s ease-out both; transition: all 0.2s ease; }
        .metric-chart-row-v3:hover { background: var(--ds-color-primary-50); border-color: var(--ds-color-primary-200); transform: translateX(4px); }
        .live-dot-chart { animation: glow 2s ease-in-out infinite; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 3px var(--ds-color-success), 0 0 6px var(--ds-color-success); } 50% { box-shadow: 0 0 6px var(--ds-color-success), 0 0 12px var(--ds-color-success); } }
        .metrics-scroll { scrollbar-width: thin; scrollbar-color: var(--ds-color-primary-200) transparent; }
        .metrics-scroll::-webkit-scrollbar { width: 4px; }
        .metrics-scroll::-webkit-scrollbar-track { background: transparent; }
        .metrics-scroll::-webkit-scrollbar-thumb { background: var(--ds-color-primary-200); border-radius: 2px; }
      `}</style>
    </Box>
  );
}
