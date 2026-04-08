"use client";

import { useEffect, useState } from "react";
import { Box, Text, Stack, Flex } from "@/components/primitives";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import type { MetricsProps, KeyMetric } from "../types";

function useCountUp(end: number, duration: number = 1200, delay: number = 0) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setHasStarted(true);
    }, delay);
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
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, hasStarted]);

  return count;
}

function MetricRow({ metric, index }: { metric: MetricsProps["metrics"][0]; index: number }) {
  const numericValue = parseInt(metric.value.replace(/[^0-9.-]/g, "")) || 0;
  const suffix = metric.value.replace(/[0-9.-]/g, "");
  const animatedValue = useCountUp(numericValue, 1000, index * 150);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      className="metric-row-v3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: "12px 14px",
        background: "var(--ds-color-bg-primary)",
        border: "1px solid var(--ds-color-border-secondary)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: isHovered ? 6 : 4,
          background: metric.positive
            ? "linear-gradient(180deg, var(--ds-color-primary), var(--ds-color-success))"
            : "linear-gradient(180deg, var(--ds-color-warning), var(--ds-color-error))",
          transition: "width 0.3s ease",
        }}
      />

      <Box
        className="row-shimmer"
        style={{
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
          pointerEvents: "none",
        }}
      />

      <Flex align="center" justify="between" style={{ position: "relative" }}>
        <Flex align="center" gap={14}>
          <Box
            className="metric-row-icon"
            style={{
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--ds-color-primary-100)",
              border: "2px solid var(--ds-color-primary-200)",
              position: "relative",
            }}
          >
            <metric.icon
              style={{
                width: 18,
                height: 18,
                color: "var(--ds-color-primary)",
              }}
            />
          </Box>

          <Stack spacing="xs">
            <Text
              size="sm"
              weight="medium"
              style={{ color: "var(--ds-color-text-primary)" }}
            >
              {metric.label}
            </Text>
            <Flex align="center" gap={6}>
              {metric.positive ? (
                <TrendingUp
                  className="trend-icon"
                  style={{ width: 12, height: 12, color: "var(--ds-color-success)" }}
                />
              ) : (
                <TrendingDown
                  className="trend-icon"
                  style={{ width: 12, height: 12, color: "var(--ds-color-error)" }}
                />
              )}
              <Text
                size="xs"
                weight="bold"
                style={{
                  color: metric.positive ? "var(--ds-color-success)" : "var(--ds-color-error)",
                  fontFamily: "monospace",
                }}
              >
                {metric.change}
              </Text>
            </Flex>
          </Stack>
        </Flex>

        <Box style={{ position: "relative" }}>
          <Text
            className="metric-row-value"
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "var(--ds-color-text-primary)",
              fontFamily: "monospace",
              letterSpacing: "-0.02em",
            }}
          >
            {animatedValue}{suffix}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

export function MetricsRows({ metrics }: MetricsProps) {
  return (
    <Box
      style={{
        height: 415,
        padding: "16px",
        background: "var(--ds-color-bg-secondary)",
        border: "1px solid var(--ds-color-border-secondary)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
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
          <Text weight="bold" style={{ color: "var(--ds-color-text-primary)" }}>
            Key Metrics
          </Text>
        </Flex>
        <Box
          className="live-badge-v3"
          style={{
            padding: "6px 12px",
            background: "var(--ds-color-success-100)",
            border: "1px solid var(--ds-color-success-200)",
          }}
        >
          <Flex align="center" gap={6}>
            <Box
              className="live-dot-v3"
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--ds-color-success)",
              }}
            />
            <Text
              size="xs"
              weight="bold"
              style={{ color: "var(--ds-color-success)", fontFamily: "monospace" }}
            >
              LIVE
            </Text>
          </Flex>
        </Box>
      </Flex>

      <Box
        style={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
        }}
        className="metrics-scroll"
      >
        <Stack spacing="sm">
          {metrics.map((metric: KeyMetric, i: number) => (
            <MetricRow key={metric.label} metric={metric} index={i} />
          ))}
        </Stack>
      </Box>

      <style>{`
        .metric-row-v3 {
          animation: rowSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .metric-row-v3:hover {
          border-color: var(--ds-color-primary-200);
          transform: translateX(6px);
          box-shadow: -4px 0 20px var(--ds-color-primary-100);
        }
        .metric-row-v3:hover .metric-row-value {
          color: var(--ds-color-primary);
        }
        .metric-row-v3:hover .row-shimmer {
          animation: shimmer 0.8s ease-in-out;
        }

        .live-dot-v3 {
          animation: dotGlow 1.5s ease-in-out infinite;
        }

        @keyframes rowSlideIn {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmer {
          from { left: -100%; }
          to { left: 100%; }
        }
        @keyframes dotGlow {
          0%, 100% { box-shadow: 0 0 4px var(--ds-color-success), 0 0 8px var(--ds-color-success); }
          50% { box-shadow: 0 0 8px var(--ds-color-success), 0 0 16px var(--ds-color-success); }
        }

        .metrics-scroll {
          scrollbar-width: thin;
          scrollbar-color: var(--ds-color-primary-200) transparent;
        }
        .metrics-scroll::-webkit-scrollbar { width: 4px; }
        .metrics-scroll::-webkit-scrollbar-track { background: transparent; }
        .metrics-scroll::-webkit-scrollbar-thumb { background: var(--ds-color-primary-200); border-radius: 2px; }
      `}</style>
    </Box>
  );
}
