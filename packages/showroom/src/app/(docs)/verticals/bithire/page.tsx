"use client";

import { useShowroomRuntime } from "@/components/showroom-context";
import { PipelineKanbanDemo } from "@/components/demos/bithire/pipeline-kanban";
import { RecruiterDashboardDemo } from "@/components/demos/bithire/recruiter-dashboard";
import { ScorecardDemo } from "@/components/demos/bithire/scorecard";
import { VerticalShowcaseShell, type VerticalCategoryCard } from "../vertical-showcase-shell";
import {
  BarChart3Icon,
  BriefcaseIcon,
  SettingsIcon,
  ShieldIcon,
  SparklesIcon,
  UsersIcon,
} from "@rottay/design-system/icons";

const BITHIRE_CATEGORIES: VerticalCategoryCard[] = [
  {
    title: "Pipeline",
    slug: "pipeline",
    description:
      "Stage movement, quick triage, and recruiter flow control.",
    demoCount: 4,
    icon: <BriefcaseIcon size={20} />,
    lens: "Candidate momentum and prioritization",
  },
  {
    title: "Interviews",
    slug: "interviews",
    description:
      "Calendars, scorecards, feedback, and interviewer workflows.",
    demoCount: 3,
    icon: <UsersIcon size={20} />,
    lens: "Signal capture and evaluation quality",
  },
  {
    title: "AI Agents",
    slug: "ai-agents",
    description:
      "Sourcing copilots, screeners, and matching intelligence.",
    demoCount: 3,
    icon: <SparklesIcon size={20} />,
    lens: "Explainable decision acceleration",
  },
  {
    title: "Positions",
    slug: "positions",
    description: "Role setup, approvals, and publishing readiness.",
    demoCount: 3,
    icon: <ShieldIcon size={20} />,
    lens: "Definition quality and approval hygiene",
  },
  {
    title: "Analytics",
    slug: "analytics",
    description: "Funnels, hiring velocity, fairness, and source performance.",
    demoCount: 4,
    icon: <BarChart3Icon size={20} />,
    lens: "Recruiting performance storytelling",
  },
  {
    title: "Teams",
    slug: "teams",
    description:
      "Recruiter/interviewer capacity, ownership, and workload balance.",
    demoCount: 3,
    icon: <UsersIcon size={20} />,
    lens: "Utilization and staffing coverage",
  },
  {
    title: "Workflows",
    slug: "workflows",
    description:
      "Automation rules, stage transitions, and notification logic.",
    demoCount: 3,
    icon: <SettingsIcon size={20} />,
    lens: "Operational scale without hidden glue",
  },
];

const BITHIRE_PROOF_POINTS = [
  {
    title: "Momentum over ornament",
    description:
      "BitHire should feel fast and directional without becoming visually noisy or losing contrast discipline.",
  },
  {
    title: "Insight woven into workflow",
    description:
      "Scores, analytics, and AI cues should support decisions without stopping the recruiter cold.",
  },
  {
    title: "Modern posture with discipline",
    description:
      "Rounded surfaces and energetic framing still need strong structure when the runtime goes darker or calmer.",
  },
];

export default function BitHirePage() {
  const runtime = useShowroomRuntime();
  const totalDemos = BITHIRE_CATEGORIES.reduce(
    (sum, category) => sum + category.demoCount,
    0
  );

  return (
    <VerticalShowcaseShell
      name="BitHire"
      slug="bithire"
      heroTitle="BitHire should feel like a premium recruiting product, not a generic dashboard wearing hiring labels."
      heroSummary="Recruiting workflows, pacing, and decision support stay intact here. What should shift is the rendering language, so the same hiring moments still feel native when the showroom tenant and engine controls move."
      runtimeSummary={`Active provider: ${runtime.tenantName}, ${runtime.engine}, ${runtime.productProfileLabel}. The surfaces below should still feel action-forward under the current runtime, even when Rottay introduces a darker shell.`}
      auditPoints={[
        "Low-friction candidate movement",
        "Charts and scores stay visible",
        "AI as copilot, not black box",
        "Expressive but dark-safe",
      ]}
      heroMetrics={[
        {
          label: "Coverage",
          value: `${totalDemos} demos`,
          detail: "Across pipeline, analytics, AI, and recruiting operations.",
        },
        {
          label: "Interaction bias",
          value: "Action-forward",
          detail: "Faster cues and clearer movement through candidate flow.",
        },
        {
          label: "Tone",
          value: "Confident energy",
          detail: "Premium, modern, and still grounded in clear hierarchy.",
        },
      ]}
      proofPoints={BITHIRE_PROOF_POINTS}
      leadDemo={{
        title: "Recruiter analytics",
        description:
          "A signal-rich recruiting cockpit that balances KPIs, funnel momentum, and action-ready insights.",
        badge: "Analytics",
        inspectionNotes: [
          "Whether analytics remain actionable instead of decorative.",
          "Whether action controls feel fast enough for recruiter flow.",
          "Whether AI and scoring cues support rather than replace judgment.",
        ],
        coverageNote:
          "Pipeline movement, scorecards, and analytics should all feel like one recruiter workspace.",
        viewportHeight: 840,
        children: <RecruiterDashboardDemo />,
      }}
      supportingDemos={[
        {
          title: "Pipeline management",
          description:
            "The spatial, stage-based view where candidate momentum and prioritization become visible.",
          badge: "Pipeline",
          inspectionNotes: [],
          coverageNote: "",
          viewportHeight: 700,
          children: <PipelineKanbanDemo />,
        },
        {
          title: "Interview signal",
          description:
            "Structured evaluation moments that turn conversations into defensible hiring decisions.",
          badge: "Scorecard",
          inspectionNotes: [],
          coverageNote: "",
          viewportHeight: 760,
          children: <ScorecardDemo />,
        },
      ]}
      categories={BITHIRE_CATEGORIES}
      categoryIntro="Use these cards to open focused recruiting lanes with deeper scenario inventory and component proof."
      accentTint="rgba(99, 102, 241, 0.18)"
      accentBorder="rgba(99, 102, 241, 0.3)"
    />
  );
}
