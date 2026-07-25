"use client";

/**
 * @fileoverview Domain-free visual-excellence stress fixture.
 *
 * This fixture deliberately composes public Modern primitives and patterns in a
 * realistic decision workspace. It is not product code and owns no vertical
 * vocabulary. Its purpose is to expose weak hierarchy, paint, density, motion,
 * responsive, localization and theme-divergence behavior before applications
 * consume those components.
 */

import { useMemo, useState } from "react";

import { ActionSearchIcon } from "@/graphics/icons/presentation/semantic/generated/roles/action-search";
import { ActionEditIcon } from "@/graphics/icons/presentation/semantic/generated/roles/action-edit";
import { ActionOpenExternalIcon } from "@/graphics/icons/presentation/semantic/generated/roles/action-open-external";
import { AiRecommendationIcon } from "@/graphics/icons/presentation/semantic/generated/roles/ai-recommendation";
import { AiSparklesIcon } from "@/graphics/icons/presentation/semantic/generated/roles/ai-sparkles";
import { AnalyticsActivityIcon } from "@/graphics/icons/presentation/semantic/generated/roles/analytics-activity";
import { AnalyticsKpiIcon } from "@/graphics/icons/presentation/semantic/generated/roles/analytics-kpi";
import { AnalyticsCompareIcon } from "@/graphics/icons/presentation/semantic/generated/roles/analytics-compare";
import { BithireEvidenceIcon } from "@/graphics/icons/presentation/semantic/generated/roles/bithire-evidence";
import { BithirePipelineIcon } from "@/graphics/icons/presentation/semantic/generated/roles/bithire-pipeline";
import { CommunicationMessageIcon } from "@/graphics/icons/presentation/semantic/generated/roles/communication-message";
import { ComplianceEvidenceIcon } from "@/graphics/icons/presentation/semantic/generated/roles/compliance-evidence";
import { LocationPlaceIcon } from "@/graphics/icons/presentation/semantic/generated/roles/location-place";
import { NavigationBackIcon } from "@/graphics/icons/presentation/semantic/generated/roles/navigation-back";
import { NavigationSettingsIcon } from "@/graphics/icons/presentation/semantic/generated/roles/navigation-settings";
import { StatusVerifiedIcon } from "@/graphics/icons/presentation/semantic/generated/roles/status-verified";
import { StatusWarningIcon } from "@/graphics/icons/presentation/semantic/generated/roles/status-warning";
import { TimeScheduleIcon } from "@/graphics/icons/presentation/semantic/generated/roles/time-schedule";

import {
  Avatar,
  Badge,
  Box,
  Button,
  Heading,
  Progress,
  Stack,
  Tabs,
  Text,
} from "@/ui/primitives";
import {
  DecisionPanorama,
  DecisionComparison,
  WidgetBoard,
  type DecisionComparisonSubject,
  type WidgetBoardItem,
} from "@/ui/patterns/data";

const noop = (): void => undefined;

const CANDIDATE_PORTRAIT = new URL(
  "./assets/candidate-portrait.png",
  import.meta.url
).href;

const BOARD_LABELS = {
  context: "Role workspace",
  heading: "Decision cockpit",
  customize: "Customize workspace",
  done: "Finish editing",
  addWidget: "Add widget",
  reset: "Reset layout",
  emptyCatalog: "Every available widget is visible.",
  editHint:
    "Move, resize or remove widgets. Changes remain local to this preview.",
  readHint: "A role-aware workspace composed from reusable widgets.",
  move: "Move widget",
  resize: "Resize widget",
  remove: "Remove widget",
};

function MetricWidget({
  value,
  supporting,
  tone = "neutral",
}: {
  value: string;
  supporting: string;
  tone?: "neutral" | "positive" | "warning";
}): React.ReactElement {
  return (
    <Stack
      className="ds-visual-excellence__widget ds-visual-excellence__metric"
      spacing="sm"
      data-tone={tone}
    >
      <Heading level="h3" size="2xl" weight="bold">
        {value}
      </Heading>
      <Text
        size="xs"
        color={
          tone === "warning"
            ? "warning"
            : tone === "positive"
            ? "success"
            : "secondary"
        }
      >
        {supporting}
      </Text>
    </Stack>
  );
}

function IntelligenceWidget(): React.ReactElement {
  return (
    <Stack
      className="ds-visual-excellence__widget ds-visual-excellence__intelligence"
      spacing="md"
    >
      <Text as="p" size="sm" color="secondary">
        Delivery quality, systems thinking and collaboration are verified. One
        leadership signal remains incomplete, while two active processes
        increase urgency.
      </Text>

      <Box className="ds-visual-excellence__evidence-row">
        <Badge tone="neutral" badgeStyle="outline">
          Portfolio · verified
        </Badge>
        <Badge tone="neutral" badgeStyle="outline">
          Review · 4 raters
        </Badge>
        <Badge tone="neutral" badgeStyle="outline">
          Conversation · 25 min
        </Badge>
      </Box>

      <Box className="ds-visual-excellence__recommendation">
        <Stack spacing="xs">
          <Text size="sm" weight="semibold">
            Recommended plan: close the leadership gap today
          </Text>
          <Text size="xs" color="muted">
            Three coordinated outputs · editable before execution · cited
            evidence
          </Text>
        </Stack>
        <Button variant="primary" size="md" icon={<AiSparklesIcon size={15} decorative />} onClick={noop}>
          Prepare plan · 1.6k tokens
        </Button>
      </Box>
    </Stack>
  );
}

function ReadinessWidget(): React.ReactElement {
  return (
    <Stack className="ds-visual-excellence__widget" spacing="md">
      <Progress percent={84} status="active" showInfo={false} />
      <Stack spacing="sm">
        <Box className="ds-visual-excellence__signal-row" data-state="verified">
          <Text size="sm" weight="semibold">
            Core evidence
          </Text>
          <span className="ds-visual-excellence__signal-state" data-tone="success">
            <StatusVerifiedIcon size={12} decorative /> Verified
          </span>
        </Box>
        <Box className="ds-visual-excellence__signal-row" data-state="verified">
          <Text size="sm" weight="semibold">
            Commercial alignment
          </Text>
          <span className="ds-visual-excellence__signal-state" data-tone="success">
            <StatusVerifiedIcon size={12} decorative /> In range
          </span>
        </Box>
        <Box className="ds-visual-excellence__signal-row" data-state="open">
          <Text size="sm" weight="semibold">
            Leadership evidence
          </Text>
          <span className="ds-visual-excellence__signal-state" data-tone="warning">
            <StatusWarningIcon size={12} decorative /> Open gap
          </span>
        </Box>
      </Stack>
    </Stack>
  );
}

function ActivityWidget(): React.ReactElement {
  return (
    <Stack className="ds-visual-excellence__widget" spacing="md">
      <Stack className="ds-visual-excellence__action-list" spacing="none">
        <Box className="ds-visual-excellence__action-row">
          <span className="ds-visual-excellence__action-icon" aria-hidden="true">
            <AnalyticsCompareIcon size={16} decorative />
          </span>
          <Stack spacing="xs">
            <Text size="sm" weight="semibold">
              Compare the strongest records
            </Text>
            <Text size="xs" color="muted">
              Aligned rubric · 27 evidence points · saves about 25 min
            </Text>
          </Stack>
          <Badge tone="primary" badgeStyle="soft">
            1.4k tokens
          </Badge>
        </Box>
        <Box className="ds-visual-excellence__action-row">
          <span className="ds-visual-excellence__action-icon" aria-hidden="true">
            <AnalyticsKpiIcon size={16} decorative />
          </span>
          <Stack spacing="xs">
            <Text size="sm" weight="semibold">
              Simulate decision acceptance
            </Text>
            <Text size="xs" color="muted">
              Three scenarios · visible assumptions · editable output
            </Text>
          </Stack>
          <Badge tone="primary" badgeStyle="soft">
            2.2k tokens
          </Badge>
        </Box>
        <Box className="ds-visual-excellence__action-row">
          <span className="ds-visual-excellence__action-icon" aria-hidden="true">
            <CommunicationMessageIcon size={16} decorative />
          </span>
          <Stack spacing="xs">
            <Text size="sm" weight="semibold">
              Draft a concise follow-up
            </Text>
            <Text size="xs" color="muted">
              Draft only · no automatic send · immediate value
            </Text>
          </Stack>
          <Badge tone="primary" badgeStyle="soft">
            320 tokens
          </Badge>
        </Box>
      </Stack>
    </Stack>
  );
}

function EvidenceWidget(): React.ReactElement {
  return (
    <Stack className="ds-visual-excellence__widget" spacing="md">
      <Text size="sm" color="secondary">
        The oldest source was refreshed three days ago. Every inference links
        back to an authorized source and can be discarded before execution.
      </Text>
      <Stack className="ds-visual-excellence__source-list" spacing="none">
        <Box className="ds-visual-excellence__source-row">
          <span><StatusVerifiedIcon size={12} decorative /> Work samples</span>
          <Text size="xs" color="muted">3 days ago</Text>
        </Box>
        <Box className="ds-visual-excellence__source-row">
          <span><StatusVerifiedIcon size={12} decorative /> Structured review</span>
          <Text size="xs" color="muted">2 hours ago</Text>
        </Box>
        <Box className="ds-visual-excellence__source-row">
          <span><StatusVerifiedIcon size={12} decorative /> Conversation</span>
          <Text size="xs" color="muted">25 min ago</Text>
        </Box>
      </Stack>
      <Button variant="secondary" size="sm" icon={<ComplianceEvidenceIcon size={14} decorative />} onClick={noop}>
        Inspect provenance
      </Button>
    </Stack>
  );
}

function Journey(): React.ReactElement {
  const stages = [
    {
      eyebrow: "15 Jul",
      title: "Profile added",
      detail: "Context and work samples captured.",
      state: "done",
    },
    {
      eyebrow: "18 Jul",
      title: "Review complete",
      detail: "Eight high-signal observations.",
      state: "done",
    },
    {
      eyebrow: "Today",
      title: "Panel confirmed",
      detail: "Response received 25 minutes ago.",
      state: "current",
    },
    {
      eyebrow: "Next",
      title: "Decision",
      detail: "Resolve within the next 24 hours.",
      state: "next",
    },
  ];

  return (
    <section
      className="ds-visual-excellence__journey"
      aria-label="Recent journey"
    >
      <Box className="ds-visual-excellence__section-header">
        <Stack spacing="xs">
          <Heading level="h2" size="md">
            Recent journey
          </Heading>
          <Text size="xs" color="muted">
            The moments that changed the active decision.
          </Text>
        </Stack>
          <Button variant="secondary" size="sm" icon={<AnalyticsActivityIcon size={14} decorative />} onClick={noop}>
            Open activity
          </Button>
      </Box>
      <Box className="ds-visual-excellence__journey-grid">
        {stages.map((stage, index) => (
          <Box
            key={stage.title}
            className="ds-visual-excellence__journey-stage"
            data-state={stage.state}
          >
            <Box
              className="ds-visual-excellence__journey-index"
              aria-hidden="true"
            >
              {index + 1}
            </Box>
            <Stack spacing="xs">
              <Text size="xs" color="muted">
                {stage.eyebrow}
              </Text>
              <Text size="sm" weight="semibold">
                {stage.title}
              </Text>
              <Text size="xs" color="secondary">
                {stage.detail}
              </Text>
            </Stack>
          </Box>
        ))}
      </Box>
    </section>
  );
}

function SignalIcon({ children }: { children: React.ReactNode }): React.ReactElement {
  return <span className="ds-visual-excellence__signal-icon">{children}</span>;
}

function Panorama(): React.ReactElement {
  return (
    <DecisionPanorama
      ariaLabel="Active decision panorama"
      contextLabel="Immediate context"
      contextFacts={[
        {
          key: "location",
          icon: <SignalIcon><LocationPlaceIcon size={15} decorative /></SignalIcon>,
          label: "Location",
          value: "Buenos Aires · GMT−3",
          supporting: "Remote or hybrid",
        },
        {
          key: "availability",
          icon: <SignalIcon><TimeScheduleIcon size={15} decorative /></SignalIcon>,
          label: "Availability",
          value: "Within 30 days",
          supporting: "Ready to coordinate this week",
        },
        {
          key: "range",
          icon: <SignalIcon><AnalyticsKpiIcon size={15} decorative /></SignalIcon>,
          label: "Expected range",
          value: "USD 62–68k",
          supporting: "Verified 12 days ago",
        },
        {
          key: "channel",
          icon: <SignalIcon><CommunicationMessageIcon size={15} decorative /></SignalIcon>,
          label: "Preferred channel",
          value: "Direct message",
          supporting: "86% response rate",
        },
      ]}
      identityEyebrow="Verified record"
      identityVisual={
        <Avatar
          name="Alex Morgan"
          initials="AM"
          src={CANDIDATE_PORTRAIT}
          alt="Alex Morgan"
          size="3xl"
          bordered
          ring
          status="online"
        />
      }
      title="Alex Morgan"
      subtitle="Product systems lead · Northstar"
      badges={
        <>
          <Badge tone="success" badgeStyle="soft">Available</Badge>
          <Badge tone="neutral" badgeStyle="outline">Work authorized</Badge>
          <Badge tone="primary" badgeStyle="soft">87% evidence</Badge>
        </>
      }
      decisionLabel="Active decision"
      decisionTitle="Product systems lead"
      decisionScore="92"
      decisionSummary="Five of six signals are verified. Range, working model and seniority are aligned."
      decisionProgress={
        <div className="ds-visual-excellence__stage-progress" aria-label="Four of five stages complete">
          <span data-state="done" />
          <span data-state="done" />
          <span data-state="current" />
          <span data-state="next" />
          <small>Panel review</small>
        </div>
      }
      decisionMeta={
        <div className="ds-visual-excellence__decision-meta">
          <strong>Next milestone · tomorrow</strong>
          <span>Brief prepared at 75% · one signal remains open</span>
        </div>
      }
      actions={
        <>
          <Button variant="primary" size="md" icon={<AiSparklesIcon size={15} decorative />} onClick={noop}>Prepare review · 850 tokens</Button>
          <Button variant="secondary" size="md" icon={<CommunicationMessageIcon size={15} decorative />} onClick={noop}>Contact</Button>
          <Button variant="secondary" size="md" icon={<TimeScheduleIcon size={15} decorative />} onClick={noop}>Schedule</Button>
          <Button variant="secondary" size="md" icon={<BithirePipelineIcon size={15} decorative />} onClick={noop}>Move stage</Button>
        </>
      }
    />
  );
}

function Comparison(): React.ReactElement {
  const subjects: DecisionComparisonSubject[] = [
    {
      key: "record-one",
      avatar: (
        <Avatar
          name="Alex Morgan"
          initials="AM"
          size="lg"
          ring
          status="online"
        />
      ),
      title: "Alex Morgan",
      subtitle: "Product systems lead",
      score: "92",
      scoreLabel: "Evidence-weighted fit",
      leading: true,
      badges: (
        <>
          <Badge tone="success" badgeStyle="soft">
            Leading
          </Badge>
          <Badge tone="neutral" badgeStyle="outline">
            9 sources
          </Badge>
        </>
      ),
      facts: [
        {
          key: "craft",
          label: "Product craft",
          value: "Strong",
          tone: "positive",
          supporting: "4 direct examples",
        },
        {
          key: "leadership",
          label: "Leadership",
          value: "Validate",
          tone: "warning",
          supporting: "1 open signal",
        },
        {
          key: "availability",
          label: "Availability",
          value: "30 days",
          tone: "neutral",
          supporting: "Confirmed recently",
        },
      ],
      actions: (
        <Button variant="primary" size="sm" icon={<StatusVerifiedIcon size={14} decorative />} onClick={noop}>
          Advance record
        </Button>
      ),
      footnote: "Best evidence density and strongest recent momentum.",
    },
    {
      key: "record-two",
      avatar: (
        <Avatar name="Jordan Lee" initials="JL" size="lg" status="away" />
      ),
      title: "Jordan Lee",
      subtitle: "Senior experience designer",
      score: "86",
      scoreLabel: "Evidence-weighted fit",
      badges: (
        <>
          <Badge tone="neutral" badgeStyle="soft">
            Close match
          </Badge>
          <Badge tone="neutral" badgeStyle="outline">
            7 sources
          </Badge>
        </>
      ),
      facts: [
        {
          key: "craft",
          label: "Product craft",
          value: "Strong",
          tone: "positive",
          supporting: "3 direct examples",
        },
        {
          key: "leadership",
          label: "Leadership",
          value: "Verified",
          tone: "positive",
          supporting: "2 team examples",
        },
        {
          key: "availability",
          label: "Availability",
          value: "45 days",
          tone: "warning",
          supporting: "May affect timing",
        },
      ],
      actions: (
        <Button variant="secondary" size="sm" icon={<ActionOpenExternalIcon size={14} decorative />} onClick={noop}>
          Open record
        </Button>
      ),
      footnote: "Balanced evidence with a longer availability window.",
    },
  ];

  return (
    <DecisionComparison
      ariaLabel="Decision comparison preview"
      context={<Text weight="semibold">Decision comparison</Text>}
      contextMeta={
        <Text size="xs" color="muted">
          Same rubric · normalized evidence
        </Text>
      }
      toolbar={
        <Button variant="secondary" size="sm" icon={<ActionEditIcon size={14} decorative />} onClick={noop}>
          Edit comparison
        </Button>
      }
      verdict={
        <Text size="sm">
          <strong>Recommendation:</strong> preserve momentum while validating
          one open signal.
        </Text>
      }
      subjects={subjects}
      insight={
        <Text size="sm">
          AI synthesis is advisory and cites only authorized sources.
        </Text>
      }
    />
  );
}

function OverviewWorkspace(): React.ReactElement {
  const items = useMemo<WidgetBoardItem[]>(
    () => [
      {
        id: "intelligence",
        accessibleTitle: "Decision intelligence",
        title: "The evidence is strong. Delaying the next step is now the largest risk.",
        header: {
          eyebrow: "Decision intelligence",
          icon: <AiRecommendationIcon size={18} decorative />,
          accessory: (
            <Badge tone="success" badgeStyle="soft" icon={<StatusVerifiedIcon size={12} decorative />}>
              High confidence · 9 sources
            </Badge>
          ),
        },
        content: <IntelligenceWidget />,
        size: "lg",
        order: 0,
        visible: true,
      },
      {
        id: "readiness",
        accessibleTitle: "Readiness",
        title: "Decision-ready",
        header: {
          eyebrow: "Readiness",
          icon: <AnalyticsKpiIcon size={18} decorative />,
          accessory: <Badge tone="success" badgeStyle="soft">84%</Badge>,
        },
        content: <ReadinessWidget />,
        size: "md",
        order: 1,
        visible: true,
      },
      {
        id: "records",
        accessibleTitle: "Active records",
        title: "Active records",
        header: {
          eyebrow: "Live metric",
          icon: <AnalyticsActivityIcon size={17} decorative />,
        },
        content: (
          <MetricWidget
            value="24"
            supporting="↑ 18% in the last 30 days"
            tone="positive"
          />
        ),
        size: "sm",
        order: 2,
        visible: true,
      },
      {
        id: "cycle",
        accessibleTitle: "Decision cycle",
        title: "Decision cycle",
        header: {
          eyebrow: "Velocity",
          icon: <TimeScheduleIcon size={17} decorative />,
        },
        content: (
          <MetricWidget
            value="4.2 days"
            supporting="1.3 days faster than baseline"
            tone="positive"
          />
        ),
        size: "sm",
        order: 3,
        visible: true,
      },
      {
        id: "risk",
        accessibleTitle: "Open risk",
        title: "Open risk",
        header: {
          eyebrow: "Attention",
          icon: <StatusWarningIcon size={17} decorative />,
        },
        content: (
          <MetricWidget
            value="1 signal"
            supporting="Leadership evidence needs review"
            tone="warning"
          />
        ),
        size: "sm",
        order: 4,
        visible: true,
      },
      {
        id: "impact",
        accessibleTitle: "Automation impact",
        title: "Assisted impact",
        header: {
          eyebrow: "Efficiency",
          icon: <AiRecommendationIcon size={17} decorative />,
        },
        content: (
          <MetricWidget
            value="6.8 hours"
            supporting="Saved across this decision cycle"
            tone="positive"
          />
        ),
        size: "sm",
        order: 5,
        visible: true,
      },
      {
        id: "actions",
        accessibleTitle: "Next best actions",
        title: "Three ways to create momentum",
        header: {
          eyebrow: "Next best actions",
          icon: <AiSparklesIcon size={18} decorative />,
          accessory: <Badge tone="primary" badgeStyle="soft">Cost preview</Badge>,
        },
        content: <ActivityWidget />,
        size: "lg",
        order: 6,
        visible: true,
      },
      {
        id: "evidence",
        accessibleTitle: "Evidence health",
        title: "Fresh and traceable",
        header: {
          eyebrow: "Evidence health",
          icon: <BithireEvidenceIcon size={18} decorative />,
          accessory: <Badge tone="success" badgeStyle="soft">9 of 10</Badge>,
        },
        content: <EvidenceWidget />,
        size: "md",
        order: 7,
        visible: true,
      },
    ],
    []
  );

  return (
    <Stack spacing="lg" fullWidth>
      <Panorama />
      <Journey />
      <WidgetBoard items={items} labels={BOARD_LABELS} editable />
      <Comparison />
    </Stack>
  );
}

/** Public fixture consumed by Brand Studio, Storybook and visual-regression harnesses. */
export function VisualExcellencePreviewFixture(): React.ReactElement {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <main
      className="ds-visual-excellence"
      data-part="visual-excellence-fixture"
    >
      <header className="ds-visual-excellence__command-bar">
        <Box className="ds-visual-excellence__command-context">
          <Button variant="secondary" size="sm" icon={<NavigationBackIcon size={14} decorative />} onClick={noop}>Records</Button>
          <span aria-hidden="true" />
          <Text size="sm" weight="semibold">34 of 158</Text>
        </Box>
        <button className="ds-visual-excellence__command-search" type="button">
          <ActionSearchIcon size={15} decorative />
          <span>Ask intelligence about this record…</span>
          <kbd>⌘ K</kbd>
        </button>
        <Box className="ds-visual-excellence__command-account">
          <Badge tone="primary" badgeStyle="soft">48.2k tokens</Badge>
          <Avatar name="Dara Finch" initials="DF" size="sm" tone="primary" />
        </Box>
      </header>

      <Box className="ds-visual-excellence__signal-strip">
        <span><i data-tone="success" /> Review confirmed · tomorrow 10:30</span>
        <span><strong>Prefers direct message</strong> · replied 25 min ago</span>
        <span><i data-tone="warning" /> Momentum risk · two active processes</span>
        <Button variant="secondary" size="sm" icon={<AiRecommendationIcon size={14} decorative />} onClick={noop}>Retain momentum · 620 tokens</Button>
      </Box>

      <Tabs
        className="ds-visual-excellence__tabs"
        type="card"
        size="md"
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "overview",
            label: "Overview",
            icon: <AnalyticsKpiIcon size={14} decorative />,
            children: <OverviewWorkspace />,
          },
          {
            key: "activity",
            label: "Activity",
            icon: <AnalyticsActivityIcon size={14} decorative />,
            children: (
              <Box className="ds-visual-excellence__placeholder">
                <Text color="muted">
                  Activity state exercises the same shell without losing
                  navigation context.
                </Text>
              </Box>
            ),
          },
          {
            key: "evidence",
            label: "Evidence",
            icon: <BithireEvidenceIcon size={14} decorative />,
            children: (
              <Box className="ds-visual-excellence__placeholder">
                <Text color="muted">
                  Evidence content is intentionally compact and traceable.
                </Text>
              </Box>
            ),
          },
          {
            key: "configuration",
            label: "Settings",
            icon: <NavigationSettingsIcon size={14} decorative />,
            children: (
              <Box className="ds-visual-excellence__placeholder">
                <Text color="muted">
                  Long labels must scroll or wrap without colliding.
                </Text>
              </Box>
            ),
          },
        ]}
      />
    </main>
  );
}
