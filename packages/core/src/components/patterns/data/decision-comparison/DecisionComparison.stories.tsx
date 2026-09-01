import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Avatar, Badge, Button, Flex, Stack, Text } from "../../../primitives";
import { RadarChart } from "../../visualization/charts";
import { createSurfaceStoryDecorator } from "../../../surfaces/foundation/common/story-helpers";
import { PatternDecisionComparison } from ".";

const meta: Meta<typeof PatternDecisionComparison> = {
  title: "Patterns/DecisionComparison",
  component: PatternDecisionComparison,
  decorators: [
    createSurfaceStoryDecorator({
      productProfile: "recruiting.operator",
      engine: "modern",
    }),
  ],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof PatternDecisionComparison>;

const radar = (values: number[]) => (
  <RadarChart
    data={[
      { axis: "Role fit", value: values[0] ?? 0 },
      { axis: "Delivery", value: values[1] ?? 0 },
      { axis: "Leadership", value: values[2] ?? 0 },
      { axis: "Momentum", value: values[3] ?? 0 },
      { axis: "Readiness", value: values[4] ?? 0 },
    ]}
    maxValue={10}
    height={208}
    showLabels={false}
    responsive
  />
);

const subjects = [
  {
    key: "lucia",
    avatar: <Avatar name="Lucía Fernández" size="md" />,
    title: "Lucía Fernández",
    subtitle: "Senior Product Designer · Buenos Aires",
    score: 92,
    scoreLabel: "/ 100 · 9 authorized sources",
    leading: true,
    badges: (
      <Flex gap={4} wrap="wrap">
        <Badge variant="primary" size="sm">Decision ready</Badge>
        <Badge variant="secondary" size="sm">Work auth verified</Badge>
      </Flex>
    ),
    visualization: radar([9, 9, 6, 8, 9]),
    facts: [
      { key: "fit", label: "Role fit", value: "9/10", tone: "info" as const },
      { key: "experience", label: "Experience depth", value: "8/10" },
      { key: "momentum", label: "Pipeline momentum", value: "9/10", tone: "positive" as const },
      { key: "risk", label: "Open risk", value: "Leadership", supporting: "Validate tomorrow", tone: "warning" as const },
    ],
    actions: <Button size="sm">Open full record</Button>,
    footnote: "Portfolio, scorecards and recent WhatsApp response are verified.",
  },
  {
    key: "marina",
    avatar: <Avatar name="Marina Costa" size="md" />,
    title: "Marina Costa with an intentionally long identity",
    subtitle: "Product systems lead · Montevideo",
    score: 86,
    scoreLabel: "/ 100 · 7 authorized sources",
    badges: (
      <Flex gap={4} wrap="wrap">
        <Badge variant="secondary" size="sm">Panel review</Badge>
      </Flex>
    ),
    visualization: radar([8, 8, 8, 6, 7]),
    facts: [
      { key: "fit", label: "Role fit", value: "8/10" },
      { key: "experience", label: "Experience depth", value: "9/10", tone: "info" as const },
      { key: "momentum", label: "Pipeline momentum", value: "6/10" },
      { key: "risk", label: "Open risk", value: "Availability", supporting: "Confirm notice period" },
    ],
    actions: <Button variant="secondary" size="sm">Open full record</Button>,
    footnote: "Leadership evidence is strong; response recency is weaker.",
  },
];

export const PremiumInstrument: Story = {
  args: {
    ariaLabel: "Candidate comparison",
    density: "comfortable",
    context: (
      <Stack spacing="xs">
        <Text weight="semibold">Candidate comparison</Text>
        <Text size="xs" color="muted">Senior Product Designer · active role</Text>
      </Stack>
    ),
    contextMeta: <Badge variant="secondary">2 of 4 selected</Badge>,
    toolbar: (
      <Flex gap={8} wrap="wrap">
        <Button variant="secondary" size="sm">Grid</Button>
        <Button size="sm">Add candidate</Button>
      </Flex>
    ),
    verdict: (
      <Stack spacing="xs">
        <Text weight="semibold">Lucía leads on verified delivery evidence.</Text>
        <Text size="xs" color="muted">No hidden ranking; every statement remains traceable.</Text>
      </Stack>
    ),
    subjects,
    insight: (
      <Flex justify="between" align="center" gap={12} wrap="wrap">
        <Stack spacing="xs">
          <Text weight="semibold">Best next comparison</Text>
          <Text size="xs" color="muted">Calibrate both candidates against the same leadership rubric.</Text>
        </Stack>
        <Badge variant="secondary">≈ 1.4k tokens</Badge>
      </Flex>
    ),
  },
};

export const NarrowAndRtl: Story = {
  args: {
    ...PremiumInstrument.args,
    ariaLabel: "مقارنة المرشحين",
    context: <Text weight="semibold">مقارنة المرشحين للقرار القادم</Text>,
    contextMeta: <Badge variant="secondary">٢ من ٤</Badge>,
    subjects: subjects.map((subject, index) => ({
      ...subject,
      title: index === 0 ? "ليلى العبدالله" : "مريم الخطيب",
      subtitle: "قيادة أنظمة المنتج · ملف موثّق",
    })),
    style: { maxWidth: 520, marginInline: "auto", direction: "rtl" },
  },
};
