"use client";

import { ShowroomLink as Link } from "@/composition/components/showroom-link";
import { Box, Flex, Text } from "@/composition/components/showroom-ui";
import { ExternalLinkIcon } from "@rottay/design-system/icons";
import { useShowroomRuntime } from "@/composition/components/showroom-context";
import { DOC_COUNTS, ENGINE_OPTIONS, getPreviewOption } from "../runtime-options";

const FOOTER_LINKS = [
  { href: "/developers/getting-started", label: "Getting Started" },
  { href: "/playground/theme-builder", label: "Theme Builder" },
  { href: "https://github.com/rottay/design-system", label: "Repository" },
];

const shellBorder =
  "var(--showroom-shell-border, var(--ds-color-border, #1c1f26))";
const shellSurface =
  "var(--showroom-shell-surface, var(--ds-color-bg-secondary, #111214))";
const shellText =
  "var(--showroom-shell-text, var(--ds-color-text-primary, #f3f4f6))";
const shellTextSecondary =
  "var(--showroom-shell-text-secondary, var(--ds-color-text-secondary, #c0c4cc))";
const shellTextTertiary =
  "var(--showroom-shell-text-tertiary, var(--ds-color-text-muted, #848b98))";

export function Footer() {
  const runtime = useShowroomRuntime();
  const activeEngine = getPreviewOption(ENGINE_OPTIONS, runtime.engine);

  return (
    <Box
      style={{
        marginTop: 32,
        paddingTop: 20,
        borderTop: `1px solid ${shellBorder}`,
      }}
    >
      <Box
        style={{
          display: "grid",
          gap: 16,
          padding: 18,
          borderRadius: 24,
          border: `1px solid ${shellBorder}`,
          background:
            "linear-gradient(180deg, var(--showroom-shell-surface-strong), var(--showroom-shell-surface))",
        }}
      >
        <Flex
          align="start"
          justify="between"
          style={{
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <Box style={{ minWidth: 0, maxWidth: 720 }}>
            <Text
              size="xs"
              weight="semibold"
              style={{
                color: shellTextTertiary,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
              }}
            >
              Docs runtime
            </Text>
            <Text
              size="lg"
              weight="semibold"
              style={{ color: shellText, marginTop: 6 }}
            >
              Premium shell powered by live design-system tokens
            </Text>
            <Text
              size="sm"
              style={{
                color: shellTextSecondary,
                lineHeight: 1.55,
                marginTop: 8,
              }}
            >
              The same docs frame follows the active tenant and engine so token,
              component, and surface pages can be judged in the runtime they
              will actually ship with.
            </Text>
          </Box>

          <Box
            style={{
              padding: "7px 11px",
              borderRadius: 999,
              border: `1px solid ${shellBorder}`,
              background: shellSurface,
            }}
          >
            <Text size="xs" weight="semibold" style={{ color: shellText }}>
              {DOC_COUNTS.total} documented assets
            </Text>
          </Box>
        </Flex>

        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          {[
            { label: "Tenant", value: runtime.tenantName },
            { label: "Vertical", value: runtime.verticalLabel },
            { label: "Engine", value: activeEngine.label },
          ].map((item) => (
            <Box
              key={item.label}
              style={{
                padding: 14,
                borderRadius: 18,
                border: `1px solid ${shellBorder}`,
                background: shellSurface,
              }}
            >
              <Text size="xs" style={{ color: shellTextTertiary }}>
                {item.label}
              </Text>
              <Text
                size="sm"
                weight="semibold"
                style={{ color: shellText, marginTop: 6 }}
              >
                {item.value}
              </Text>
            </Box>
          ))}
        </Box>

        <Flex
          align="center"
          justify="between"
          style={{
            gap: 14,
            flexWrap: "wrap",
            paddingTop: 4,
          }}
        >
          <Flex align="center" gap={16} style={{ flexWrap: "wrap" }}>
            {FOOTER_LINKS.map((link) =>
              link.href.startsWith("http") ? (
                <Box
                  key={link.label}
                  as="a"
                  {...({
                    href: link.href,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  } as any)}
                  className="footer-link"
                  style={{
                    textDecoration: "none",
                    color: shellText,
                  }}
                >
                  <Flex align="center" gap={6}>
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{ color: "inherit" }}
                    >
                      {link.label}
                    </Text>
                    <ExternalLinkIcon size={11} />
                  </Flex>
                </Box>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="footer-link"
                  style={{
                    textDecoration: "none",
                    color: shellText,
                  }}
                >
                  <Text size="xs" weight="semibold" style={{ color: "inherit" }}>
                    {link.label}
                  </Text>
                </Link>
              )
            )}
          </Flex>

          <Text size="xs" style={{ color: shellTextTertiary }}>
            Showroom shell v0.3.0
          </Text>
        </Flex>
      </Box>

      <style jsx>{`
        .footer-link:hover {
          opacity: 0.92;
        }
      `}</style>
    </Box>
  );
}
