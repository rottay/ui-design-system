/**
 * Box Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Box } from "./";
import { DesignSystemProvider } from "../../../../infrastructure/runtime/bootstrap";
import {
  EngineComparison as EngineComparisonHelper,
  VariantEngineMatrix,
} from "../../../../../.storybook/helpers";
import React from "react";

const meta: Meta<typeof Box> = {
  title: "Primitives/Layout/Box",
  component: Box,
  decorators: [
    (Story) => (
      <DesignSystemProvider>
        <Story />
      </DesignSystemProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: `
Box is a fundamental layout primitive that provides a styled container with configurable spacing,
borders, shadows, and other layout properties. It supports polymorphic rendering via the \`as\` prop,
allowing it to render as any HTML element.

### Features
- Polymorphic rendering with \`as\` prop
- Responsive padding and margin with shorthand props
- Dimension controls (width, height, min/max)
- Background and border styling
- Shadow and border radius presets
- Position and overflow controls
- Support for all three engines (Classic, Modern, Rustic)
        `,
      },
    },
  },
  argTypes: {
    as: {
      control: "select",
      options: [
        "div",
        "span",
        "section",
        "article",
        "aside",
        "main",
        "header",
        "footer",
        "nav",
      ],
      description: "HTML element to render as",
    },
    padding: {
      control: "select",
      options: ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"],
      description: "Padding on all sides",
    },
    margin: {
      control: "select",
      options: ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"],
      description: "Margin on all sides",
    },
    borderRadius: {
      control: "select",
      options: ["none", "xs", "sm", "md", "lg", "xl", "2xl", "full"],
      description: "Border radius preset",
    },
    shadow: {
      control: "select",
      options: ["none", "xs", "sm", "md", "lg", "xl", "2xl"],
      description: "Box shadow preset",
    },
    display: {
      control: "select",
      options: [
        "block",
        "inline",
        "inline-block",
        "flex",
        "inline-flex",
        "grid",
        "none",
      ],
      description: "CSS display property",
    },
    position: {
      control: "select",
      options: ["static", "relative", "absolute", "fixed", "sticky"],
      description: "CSS position property",
    },
    overflow: {
      control: "select",
      options: ["visible", "hidden", "scroll", "auto"],
      description: "Overflow behavior",
    },
    engine: {
      control: "select",
      options: ["classic", "modern", "rustic"],
      description: "Rendering engine to use",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Box>;

// Default story
export const Default: Story = {
  args: {
    children: "Default Box",
    padding: "md",
    background: "#f5f5f5",
    borderRadius: "md",
  },
};

// Padding variants
export const PaddingSizes: Story = {
  name: "Padding Sizes",
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "16px",
        flexWrap: "wrap",
        alignItems: "flex-start",
      }}
    >
      {(["none", "xs", "sm", "md", "lg", "xl", "2xl"] as const).map(
        (padding) => (
          <Box
            key={padding}
            padding={padding}
            background="#e0e7ff"
            borderRadius="md"
          >
            <div
              style={{
                background: "#6366f1",
                color: "white",
                padding: "4px 8px",
                borderRadius: "4px",
              }}
            >
              p={padding}
            </div>
          </Box>
        )
      )}
    </div>
  ),
};

// Margin variants
export const MarginSizes: Story = {
  name: "Margin Sizes",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {(["none", "xs", "sm", "md", "lg", "xl"] as const).map((margin) => (
        <Box
          key={margin}
          style={{ background: "#fef3c7", display: "inline-block" }}
        >
          <Box
            margin={margin}
            padding="sm"
            background="#fbbf24"
            borderRadius="md"
          >
            m={margin}
          </Box>
        </Box>
      ))}
    </div>
  ),
};

// Border radius variants
export const BorderRadiusSizes: Story = {
  name: "Border Radius",
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "16px",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {(["none", "xs", "sm", "md", "lg", "xl", "2xl", "full"] as const).map(
        (radius) => (
          <Box
            key={radius}
            padding="lg"
            background="#10b981"
            borderRadius={radius}
            width={radius === "full" ? "80px" : undefined}
            height={radius === "full" ? "80px" : undefined}
            display={radius === "full" ? "flex" : undefined}
            style={{
              color: "white",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {radius}
          </Box>
        )
      )}
    </div>
  ),
};

// Shadow variants
export const ShadowSizes: Story = {
  name: "Shadow Sizes",
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "24px",
        flexWrap: "wrap",
        padding: "24px",
      }}
    >
      {(["none", "xs", "sm", "md", "lg", "xl", "2xl"] as const).map(
        (shadow) => (
          <Box
            key={shadow}
            padding="lg"
            background="white"
            borderRadius="lg"
            shadow={shadow}
          >
            shadow={shadow}
          </Box>
        )
      )}
    </div>
  ),
};

// Polymorphic as prop
export const PolymorphicElements: Story = {
  name: "Polymorphic Elements",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Box as="div" padding="md" background="#fee2e2" borderRadius="md">
        as="div" (default)
      </Box>
      <Box as="section" padding="md" background="#fef3c7" borderRadius="md">
        as="section"
      </Box>
      <Box as="article" padding="md" background="#d1fae5" borderRadius="md">
        as="article"
      </Box>
      <Box as="aside" padding="md" background="#dbeafe" borderRadius="md">
        as="aside"
      </Box>
      <Box as="header" padding="md" background="#e0e7ff" borderRadius="md">
        as="header"
      </Box>
      <Box as="footer" padding="md" background="#fce7f3" borderRadius="md">
        as="footer"
      </Box>
      <Box as="nav" padding="md" background="#f3e8ff" borderRadius="md">
        as="nav"
      </Box>
    </div>
  ),
};

// Dimension controls
export const Dimensions: Story = {
  name: "Width & Height",
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "16px",
        flexWrap: "wrap",
        alignItems: "flex-start",
      }}
    >
      <Box
        width="150px"
        height="100px"
        background="#3b82f6"
        borderRadius="md"
        display="flex"
        style={{
          color: "white",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        150x100px
      </Box>
      <Box
        width="200px"
        height="150px"
        background="#8b5cf6"
        borderRadius="md"
        display="flex"
        style={{
          color: "white",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        200x150px
      </Box>
      <Box
        width="100%"
        maxWidth="300px"
        height="80px"
        background="#ec4899"
        borderRadius="md"
        display="flex"
        style={{
          color: "white",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        100% max 300px
      </Box>
    </div>
  ),
};

// Shorthand props
export const ShorthandProps: Story = {
  name: "Shorthand Props",
  render: () => (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
      <Box p="lg" bg="#fef3c7" rounded="lg">
        p, bg, rounded
      </Box>
      <Box px="xl" py="md" bg="#d1fae5" rounded="md">
        px, py
      </Box>
      <Box
        w="150px"
        h="80px"
        bg="#dbeafe"
        rounded="md"
        display="flex"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        w, h
      </Box>
      <Box m="md" p="md" bg="#fce7f3" rounded="md">
        m, p combined
      </Box>
    </div>
  ),
};

// Background variations
export const Backgrounds: Story = {
  name: "Background Styles",
  render: () => (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
      <Box
        padding="lg"
        background="#ef4444"
        borderRadius="md"
        style={{ color: "white" }}
      >
        Solid Color
      </Box>
      <Box
        padding="lg"
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        borderRadius="md"
        style={{ color: "white" }}
      >
        Gradient
      </Box>
      <Box
        padding="lg"
        backgroundColor="rgba(59, 130, 246, 0.5)"
        borderRadius="md"
      >
        Semi-transparent
      </Box>
      <Box
        padding="lg"
        borderRadius="md"
        border="2px dashed #9ca3af"
        background="transparent"
      >
        Transparent + Border
      </Box>
    </div>
  ),
};

// Border styles
export const BorderStyles: Story = {
  name: "Border Styles",
  render: () => (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
      <Box padding="lg" border="1px solid #e5e7eb" borderRadius="md">
        1px solid
      </Box>
      <Box padding="lg" border="2px solid #3b82f6" borderRadius="md">
        2px solid blue
      </Box>
      <Box padding="lg" border="2px dashed #10b981" borderRadius="md">
        2px dashed green
      </Box>
      <Box
        padding="lg"
        borderWidth="3px"
        borderColor="#f59e0b"
        borderStyle="double"
        borderRadius="md"
      >
        3px double orange
      </Box>
    </div>
  ),
};

// Position examples
export const Positioning: Story = {
  name: "Positioning",
  render: () => (
    <Box
      position="relative"
      width="100%"
      height="200px"
      background="#f3f4f6"
      borderRadius="lg"
      padding="md"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        padding="sm"
        background="#ef4444"
        borderRadius="md"
        style={{ color: "white" }}
      >
        Top Left
      </Box>
      <Box
        position="absolute"
        top={0}
        right={0}
        padding="sm"
        background="#3b82f6"
        borderRadius="md"
        style={{ color: "white" }}
      >
        Top Right
      </Box>
      <Box
        position="absolute"
        bottom={0}
        left={0}
        padding="sm"
        background="#10b981"
        borderRadius="md"
        style={{ color: "white" }}
      >
        Bottom Left
      </Box>
      <Box
        position="absolute"
        bottom={0}
        right={0}
        padding="sm"
        background="#8b5cf6"
        borderRadius="md"
        style={{ color: "white" }}
      >
        Bottom Right
      </Box>
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        padding="md"
        background="#f59e0b"
        borderRadius="md"
        style={{ color: "white" }}
      >
        Center
      </Box>
    </Box>
  ),
};

// Overflow examples
export const OverflowBehavior: Story = {
  name: "Overflow Behavior",
  render: () => (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
      <Box
        width="150px"
        height="80px"
        overflow="hidden"
        padding="md"
        background="#fee2e2"
        borderRadius="md"
      >
        <div style={{ width: "200px" }}>
          overflow="hidden" - This content is clipped when it overflows the
          container boundaries.
        </div>
      </Box>
      <Box
        width="150px"
        height="80px"
        overflow="scroll"
        padding="md"
        background="#fef3c7"
        borderRadius="md"
      >
        <div style={{ width: "200px", height: "200px" }}>
          overflow="scroll" - This content can be scrolled when it overflows the
          container boundaries.
        </div>
      </Box>
      <Box
        width="150px"
        height="80px"
        overflow="auto"
        padding="md"
        background="#d1fae5"
        borderRadius="md"
      >
        <div style={{ width: "200px", height: "200px" }}>
          overflow="auto" - Scrollbars appear only when needed.
        </div>
      </Box>
    </div>
  ),
};

// Display types
export const DisplayTypes: Story = {
  name: "Display Types",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Box display="block" padding="md" background="#fee2e2" borderRadius="md">
        display="block" - Takes full width
      </Box>
      <div>
        <Box
          display="inline-block"
          padding="md"
          background="#fef3c7"
          borderRadius="md"
          margin="xs"
        >
          inline-block 1
        </Box>
        <Box
          display="inline-block"
          padding="md"
          background="#fef3c7"
          borderRadius="md"
          margin="xs"
        >
          inline-block 2
        </Box>
      </div>
      <Box
        display="flex"
        padding="md"
        background="#d1fae5"
        borderRadius="md"
        style={{ gap: "8px" }}
      >
        <Box
          padding="sm"
          background="#10b981"
          borderRadius="md"
          style={{ color: "white" }}
        >
          Flex 1
        </Box>
        <Box
          padding="sm"
          background="#10b981"
          borderRadius="md"
          style={{ color: "white" }}
        >
          Flex 2
        </Box>
        <Box
          padding="sm"
          background="#10b981"
          borderRadius="md"
          style={{ color: "white" }}
        >
          Flex 3
        </Box>
      </Box>
    </div>
  ),
};

// Nested boxes
export const NestedBoxes: Story = {
  name: "Nested Boxes",
  render: () => (
    <Box padding="lg" background="#f3f4f6" borderRadius="lg">
      <Box
        padding="md"
        background="white"
        borderRadius="md"
        shadow="sm"
        margin="sm"
      >
        <Box padding="sm" background="#e0e7ff" borderRadius="md">
          Level 3 (deepest)
        </Box>
        Level 2
      </Box>
      Level 1 (outermost)
    </Box>
  ),
};

// ============================================================================
// Engine Comparison Stories
// ============================================================================

/**
 * Side-by-side comparison of Box across all 3 engines.
 */
export const CompareEngines: Story = {
  name: "🔄 Engine Comparison",
  parameters: {
    docs: {
      description: {
        story:
          "Compare the same Box rendered by Classic (Ant Design), Modern (DaisyUI), and Rustic (Vanilla CSS).",
      },
    },
  },
  render: () => (
    <EngineComparisonHelper
      component={Box}
      props={{
        children: "Box Content",
        padding: "md",
        background: "#dbeafe",
        borderRadius: "md",
      }}
      showDescriptions
    />
  ),
};

// Flex container example
export const FlexContainer: Story = {
  name: "Flex Container",
  render: () => (
    <Box
      display="flex"
      padding="lg"
      background="#f9fafb"
      borderRadius="lg"
      style={{ gap: "16px", flexWrap: "wrap" }}
    >
      <Box
        flex="1"
        padding="md"
        background="#3b82f6"
        borderRadius="md"
        style={{ color: "white", minWidth: "100px" }}
      >
        flex: 1
      </Box>
      <Box
        flex="2"
        padding="md"
        background="#8b5cf6"
        borderRadius="md"
        style={{ color: "white", minWidth: "100px" }}
      >
        flex: 2
      </Box>
      <Box
        flex="1"
        padding="md"
        background="#ec4899"
        borderRadius="md"
        style={{ color: "white", minWidth: "100px" }}
      >
        flex: 1
      </Box>
    </Box>
  ),
};

// Real-world card example
export const CardExample: Story = {
  name: "Card Example",
  render: () => (
    <Box
      width="320px"
      background="white"
      borderRadius="xl"
      shadow="lg"
      overflow="hidden"
    >
      <Box
        height="180px"
        background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      />
      <Box padding="lg">
        <Box
          as="h3"
          style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 600 }}
        >
          Beautiful Card
        </Box>
        <Box
          as="p"
          style={{ margin: "0 0 16px 0", color: "#6b7280", fontSize: "14px" }}
        >
          This is an example of how Box can be used to create card-like
          components with gradients, shadows, and proper spacing.
        </Box>
        <Box
          as="button"
          padding="sm"
          px="lg"
          background="#6366f1"
          borderRadius="md"
          style={{
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          Learn More
        </Box>
      </Box>
    </Box>
  ),
};

// Interactive hover state
export const InteractiveBox: Story = {
  name: "Interactive Box",
  render: () => (
    <Box
      padding="lg"
      background="white"
      borderRadius="lg"
      shadow="md"
      cursor="pointer"
      transition="all 0.2s ease-in-out"
      style={{
        maxWidth: "300px",
      }}
      className="interactive-box"
    >
      <style>{`
        .interactive-box:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
      <Box as="h4" style={{ margin: "0 0 8px 0" }}>
        Hover me!
      </Box>
      <Box as="p" style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
        This box has a hover animation. Try hovering over it to see the lift
        effect.
      </Box>
    </Box>
  ),
};

/** Modern contract stress: logical spacing, constrained overflow and long copy. */
export const ModernLogicalResponsiveStress: Story = {
  name: "Modern · logical responsive stress",
  render: () => (
    <Box
      engine="modern"
      as="section"
      role="region"
      aria-label="Responsive decision summary"
      paddingInline={{ xs: "md", lg: "xl" }}
      paddingBlock={{ xs: "sm", lg: "lg" }}
      maxWidth={{ xs: "100%", lg: "72rem" }}
      overflow="clip"
      rounded="xl"
      shadow="sm"
      motion="resize"
      style={{
        marginInline: "auto",
        border: "1px solid var(--ds-color-border-subtle)",
        background: "var(--ds-surface-card)",
        color: "var(--ds-color-text-primary)",
      }}
    >
      <Box as="strong">Decision workspace</Box>
      <Box as="p" marginBlockStart="sm" marginBlockEnd="none">
        Long localized content remains inside its surface, respects the writing
        mode, and changes rhythm without relying on generated utility classes.
      </Box>
    </Box>
  ),
};
