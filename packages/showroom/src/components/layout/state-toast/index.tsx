"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Flex, Text } from "@rottay/design-system";
import { CheckCircleIcon } from "@rottay/design-system/icons";
import { useShowroomRuntime } from "@/components/showroom-context";
import { ENGINE_OPTIONS, getPreviewOption, THEME_OPTIONS } from "../pickers";
import { shellBorder, shellBorderStrong, shellShadowStrong, shellSurface, shellSurfaceSubtle, shellText, shellTextTertiary } from "../tokens";


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
            as="div"
            color="inherit"
            wrap="auto"
            style={{
              fontSize: '0.75rem', fontWeight: 600, textAlign: 'inherit',
              color: shellTextTertiary,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
            }}
          >
            Preview Updated
          </Text>

          <Text as="div" color="inherit" wrap="auto" style={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'inherit', color: shellText, marginTop: 4 }}>
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
                    as="div"
                    color="inherit"
                    wrap="auto"
                    style={{ fontSize: '0.75rem', fontWeight: 600, textAlign: 'inherit', color: shellText }}
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
                    as="div"
                    color="inherit"
                    wrap="auto"
                    style={{ fontSize: '0.75rem', fontWeight: 600, textAlign: 'inherit', color: shellText }}
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
