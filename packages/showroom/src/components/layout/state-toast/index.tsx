"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Flex, Text } from "@/components/showroom-ui";
import { CheckCircleIcon } from "@rottay/design-system/icons";
import { useShowroomRuntime } from "@/components/showroom-context";
import {
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
const shellSurfaceSubtle =
  "var(--showroom-shell-surface-subtle, var(--ds-color-bg-elevated, #1a1c21))";
const shellText =
  "var(--showroom-shell-text, var(--ds-color-text-primary, #f3f4f6))";
const shellTextTertiary =
  "var(--showroom-shell-text-tertiary, var(--ds-color-text-muted, #848b98))";
const shellShadowStrong =
  "var(--showroom-shell-shadow-strong, 0 28px 72px rgba(0, 0, 0, 0.38))";

interface ToastState {
  engine?: string;
  theme?: string;
}

export function StateToast() {
  const runtime = useShowroomRuntime();
  const [visible, setVisible] = useState(false);
  const [toastState, setToastState] = useState<ToastState>({});
  const isInitialMount = useRef(true);
  const prevEngine = useRef(runtime.engine);
  const prevTheme = useRef(runtime.tenantSlug);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeTheme = getPreviewOption(THEME_OPTIONS, runtime.tenantSlug);
  const activeEngine = getPreviewOption(ENGINE_OPTIONS, runtime.engine);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const nextToastState: ToastState = {};

    if (runtime.engine !== prevEngine.current) {
      nextToastState.engine = getPreviewOption(
        ENGINE_OPTIONS,
        runtime.engine
      ).label;
    }

    if (runtime.tenantSlug !== prevTheme.current) {
      nextToastState.theme = getPreviewOption(
        THEME_OPTIONS,
        runtime.tenantSlug
      ).label;
    }

    prevEngine.current = runtime.engine;
    prevTheme.current = runtime.tenantSlug;

    if (!nextToastState.engine && !nextToastState.theme) {
      return;
    }

    setToastState(nextToastState);
    setVisible(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => setVisible(false), 2600);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [runtime.engine, runtime.tenantSlug]);

  if (!visible && !toastState.engine && !toastState.theme) {
    return null;
  }

  return (
    <Box
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 120,
        width: "min(300px, calc(100vw - 24px))",
        padding: "10px 12px",
        borderRadius: 16,
        border: `1px solid ${shellBorderStrong}`,
        background: shellSurface,
        boxShadow: shellShadowStrong,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 220ms ease, transform 220ms ease",
        pointerEvents: "none",
      }}
    >
      <Flex align="start" gap={12}>
        <Flex
          align="center"
          justify="center"
          style={{
            width: 30,
            height: 30,
            borderRadius: 10,
            border: `1px solid ${shellBorder}`,
            background: shellSurfaceSubtle,
            color: activeTheme.accent,
            flexShrink: 0,
          }}
        >
          <CheckCircleIcon size={16} />
        </Flex>

        <Box style={{ minWidth: 0 }}>
          <Text
            size="xs"
            weight="semibold"
            style={{
              color: shellTextTertiary,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
            }}
          >
            Preview Updated
          </Text>

          <Text size="sm" weight="semibold" style={{ color: shellText, marginTop: 4 }}>
            Runtime switched
          </Text>

          <Flex style={{ gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            {toastState.theme ? (
              <Box
                style={{
                  padding: "5px 8px",
                  borderRadius: 999,
                  border: `1px solid ${shellBorder}`,
                  background: shellSurfaceSubtle,
                }}
              >
                <Flex align="center" gap={6}>
                  <Box
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      background: activeTheme.accent,
                      flexShrink: 0,
                    }}
                  />
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{ color: shellText }}
                  >
                    {toastState.theme}
                  </Text>
                </Flex>
              </Box>
            ) : null}

            {toastState.engine ? (
              <Box
                style={{
                  padding: "5px 8px",
                  borderRadius: 999,
                  border: `1px solid ${shellBorder}`,
                  background: shellSurfaceSubtle,
                }}
              >
                <Flex align="center" gap={6}>
                  <Box
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      background: activeEngine.accent,
                      flexShrink: 0,
                    }}
                  />
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{ color: shellText }}
                  >
                    {toastState.engine}
                  </Text>
                </Flex>
              </Box>
            ) : null}
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}
