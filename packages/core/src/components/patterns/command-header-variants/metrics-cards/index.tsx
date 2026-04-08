"use client";

import { useEffect, useState } from "react";
import { Box, Text, Stack, Flex, Grid } from "@/components/primitives";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import type { MetricsProps, KeyMetric } from "../types";

function useCountUp(end: number, duration: number = 1500, delay: number = 0) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => { setHasStarted(true); }, delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime: number;
    let animationFrame: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));
      if (progress < 1) { animationFrame = requestAnimationFrame(animate); }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, hasStarted]);

  return count;
}

function MetricCard({ metric, index }: { metric: MetricsProps["metrics"][0]; index: number }) {
  const numericValue = parseInt(metric.value.replace(/[^0-9.-]/g, "")) || 0;
  const suffix = metric.value.replace(/[0-9.-]/g, "");
  const animatedValue = useCountUp(numericValue, 1200, index * 200);

  return (
    <Box
      className="metric-card-v3"
      style={{
        position: "relative",
        padding: "10px 10px",
        background: "var(--ds-color-bg-primary)",
        border: "1px solid var(--ds-color-border-secondary)",
        overflow: "hidden",
      }}
    >
      <Box
        className="card-top-accent"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: metric.positive
            ? "linear-gradient(90deg, var(--ds-color-primary), var(--ds-color-success))"
            : "linear-gradient(90deg, var(--ds-color-warning), var(--ds-color-error))",
        }}
      />

      <Stack spacing="sm" align="center" style={{ position: "relative" }}>
        <Box
          className="metric-icon-container"
          style={{
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--ds-color-primary-100)",
            border: "2px solid var(--ds-color-primary-200)",
            position: "relative",
          }}
        >
          <metric.icon
            className="metric-icon"
            style={{ width: 14, height: 14, color: "var(--ds-color-primary)" }}
          />
        </Box>

        <Box style={{ position: "relative" }}>
          <Text
            className="metric-value-v3"
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "var(--ds-color-text-primary)",
              fontFamily: "monospace",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              position: "relative",
            }}
          >
            {animatedValue}{suffix}
          </Text>
        </Box>

        <Text
          className="metric-label"
          size="xs"
          style={{
            color: "var(--ds-color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontFamily: "monospace",
            fontSize: 10,
          }}
        >
          {metric.label}
        </Text>

        <Flex align="center" gap={8}>
          <Box
            className="change-badge"
            style={{
              padding: "4px 8px",
              background: metric.positive ? "var(--ds-color-success-100)" : "var(--ds-color-error-100)",
              border: metric.positive ? "1px solid var(--ds-color-success-200)" : "1px solid var(--ds-color-error-200)",
            }}
          >
            <Flex align="center" gap={6}>
              {metric.positive ? (
                <TrendingUp className="trend-icon" style={{ width: 10, height: 10, color: "var(--ds-color-success)" }} />
              ) : (
                <TrendingDown className="trend-icon" style={{ width: 10, height: 10, color: "var(--ds-color-error)" }} />
              )}
              <Text
                size="xs"
                weight="bold"
                style={{ color: metric.positive ? "var(--ds-color-success)" : "var(--ds-color-error)", fontFamily: "monospace" }}
              >
                {metric.change}
              </Text>
            </Flex>
          </Box>
        </Flex>

        <Box style={{ width: "100%", height: 4, background: "var(--ds-color-bg-tertiary)", borderRadius: 2, overflow: "hidden", marginTop: 4 }}>
          <Box
            className="mini-progress"
            style={{
              height: "100%",
              width: "75%",
              borderRadius: 2,
              background: metric.positive
                ? "linear-gradient(90deg, var(--ds-color-primary), var(--ds-color-success))"
                : "linear-gradient(90deg, var(--ds-color-warning), var(--ds-color-error))",
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
}

export function MetricsCards({ metrics }: MetricsProps) {
  return (
    <Box
      style={{
        height: 415,
        padding: "16px",
        background: "var(--ds-color-bg-secondary)",
        border: "1px solid var(--ds-color-border-secondary)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Flex
        align="center"
        justify="between"
        style={{
          paddingBottom: 12,
          marginBottom: 12,
          borderBottom: "1px solid var(--ds-color-border-secondary)",
          position: "relative",
        }}
      >
        <Flex align="center" gap={10}>
          <Box
            className="header-icon"
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--ds-color-primary-100)",
              border: "1px solid var(--ds-color-primary-200)",
            }}
          >
            <Activity style={{ width: 16, height: 16, color: "var(--ds-color-primary)" }} />
          </Box>
          <Text weight="bold" style={{ color: "var(--ds-color-text-primary)" }}>Key Metrics</Text>
        </Flex>
        <Box
          className="live-badge-v3"
          style={{ padding: "6px 12px", background: "var(--ds-color-success-100)", border: "1px solid var(--ds-color-success-200)" }}
        >
          <Flex align="center" gap={6}>
            <Box className="live-dot-v3" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ds-color-success)" }} />
            <Text size="xs" weight="bold" style={{ color: "var(--ds-color-success)", fontFamily: "monospace" }}>LIVE</Text>
          </Flex>
        </Box>
      </Flex>

      <Box style={{ flex: 1, overflowY: "auto", minHeight: 0 }} className="metrics-scroll">
        <Grid columns={3} gap={10} style={{ position: "relative" }}>
          {metrics.map((metric: KeyMetric, i: number) => (
            <MetricCard key={metric.label} metric={metric} index={i} />
          ))}
        </Grid>
      </Box>

      <style>{`
        .metric-card-v3 { animation: cardEnter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .metric-card-v3:hover { border-color: var(--ds-color-primary-300); transform: translateY(-6px) scale(1.02); box-shadow: 0 12px 32px var(--ds-color-primary-100); }
        .metric-card-v3:hover .metric-value-v3 { color: var(--ds-color-primary); }
        .live-dot-v3 { animation: dotGlow 1.5s ease-in-out infinite; }
        @keyframes cardEnter { from { opacity: 0; transform: translateY(30px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes dotGlow { 0%, 100% { box-shadow: 0 0 4px var(--ds-color-success), 0 0 8px var(--ds-color-success); } 50% { box-shadow: 0 0 8px var(--ds-color-success), 0 0 16px var(--ds-color-success); } }
        .metrics-scroll { scrollbar-width: thin; scrollbar-color: var(--ds-color-primary-200) transparent; }
        .metrics-scroll::-webkit-scrollbar { width: 4px; }
        .metrics-scroll::-webkit-scrollbar-track { background: transparent; }
        .metrics-scroll::-webkit-scrollbar-thumb { background: var(--ds-color-primary-200); border-radius: 2px; }
      `}</style>
    </Box>
  );
}
