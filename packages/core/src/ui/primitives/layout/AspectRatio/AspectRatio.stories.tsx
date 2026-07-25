/**
 * AspectRatio Stories
 * Colocated with component following approved architecture
 */

import type { Meta, StoryObj } from "@storybook/react";
import type { CSSProperties } from "react";
import { AspectRatio } from "./";
import { DesignSystemProvider } from "../../../../infrastructure/runtime/bootstrap";
import { EngineComparison } from "../../../../../.storybook/helpers";

const meta: Meta<typeof AspectRatio> = {
  title: "Primitives/Layout/AspectRatio",
  component: AspectRatio,
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
A container that maintains a consistent aspect ratio for its content.

## Engine Differences

| Feature | Classic | Modern | Rustic |
|---------|---------|--------|--------|
| Technique | padding-bottom | aspect-ratio CSS | padding-bottom |
| Browser Support | All | Modern | All |
`,
      },
    },
  },
  argTypes: {
    ratio: {
      control: "number",
      description: "Width-to-height ratio (e.g., 16/9 = 1.778)",
    },
    maxWidth: {
      control: "text",
    },
    engine: {
      control: "select",
      options: ["classic", "modern", "rustic"],
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AspectRatio>;

const PlaceholderContent = ({ label }: { label: string }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "var(--ds-color-primary-100, #e6f7ff)",
      border: "2px dashed var(--ds-color-primary-300, #91d5ff)",
      borderRadius: "8px",
      color: "var(--ds-color-primary-600, #096dd9)",
      fontWeight: 600,
    }}
  >
    {label}
  </div>
);

export const Default: Story = {
  args: { maxWidth: "400px" },
  render: (args) => (
    <AspectRatio {...args}>
      <PlaceholderContent label="16:9" />
    </AspectRatio>
  ),
};

export const Ratios: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        maxWidth: 300,
      }}
    >
      <AspectRatio ratio={1}>
        <PlaceholderContent label="1:1 Square" />
      </AspectRatio>
      <AspectRatio ratio={4 / 3}>
        <PlaceholderContent label="4:3" />
      </AspectRatio>
      <AspectRatio ratio={16 / 9}>
        <PlaceholderContent label="16:9" />
      </AspectRatio>
      <AspectRatio ratio={21 / 9}>
        <PlaceholderContent label="21:9 Ultra Wide" />
      </AspectRatio>
    </div>
  ),
};

/** Responsive media frame with all visual finish delegated to tenant tokens. */
export const TokenizedModernFrame: Story = {
  name: "Modern contract — tokenized media frame",
  render: () => (
    <div
      style={
        {
          "--ds-aspect-ratio-background": "var(--ds-color-surface-subtle)",
          "--ds-aspect-ratio-border": "1px solid var(--ds-color-border-subtle)",
          "--ds-aspect-ratio-radius": "var(--ds-radius-xl)",
          "--ds-aspect-ratio-shadow": "var(--ds-shadow-sm)",
          inlineSize: "min(100%, 42rem)",
        } as CSSProperties
      }
    >
      <AspectRatio
        engine="modern"
        ratio={16 / 9}
        role="img"
        aria-label="Candidate introduction preview"
      >
        <PlaceholderContent label="Responsive 16:9 candidate preview" />
      </AspectRatio>
    </div>
  ),
};

export const CompareEngines: Story = {
  name: "Engine Comparison",
  render: () => (
    <EngineComparison
      component={AspectRatio}
      props={{
        ratio: 16 / 9,
        maxWidth: "300px",
        children: <PlaceholderContent label="16:9" />,
      }}
      showDescriptions
    />
  ),
};
