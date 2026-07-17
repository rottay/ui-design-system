"use client";

import { useShowroomRuntime } from "@/composition/components/showroom-context";
import PlatformDashboardDemo from "@/composition/components/demos/platform/dashboard";
import PlatformTenantFormDemo from "@/composition/components/demos/platform/tenant-form";
import PlatformUserListDemo from "@/composition/components/demos/platform/user-list";
import { VerticalShowcaseShell, type VerticalCategoryCard } from "../vertical-showcase-shell";
import {
  BellIcon,
  Building2Icon,
  FlagIcon,
  LockIcon,
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
} from "@rottay/design-system/icons";

const PLATFORM_CATEGORIES: VerticalCategoryCard[] = [
  {
    title: "Identity",
    slug: "identity",
    description:
      "User directories, profiles, sessions, and account-state control.",
    demoCount: 4,
    icon: <UsersIcon size={20} />,
    lens: "Lifecycle control and operator trust",
  },
  {
    title: "Tenancy",
    slug: "tenancy",
    description:
      "Tenant setup, branding, billing, and lifecycle control.",
    demoCount: 3,
    icon: <Building2Icon size={20} />,
    lens: "Multi-tenant governance and brand integrity",
  },
  {
    title: "Permissions",
    slug: "permissions",
    description:
      "Role models, permission matrices, and policy authoring.",
    demoCount: 3,
    icon: <ShieldIcon size={20} />,
    lens: "Auditability and access confidence",
  },
  {
    title: "Auth",
    slug: "auth",
    description:
      "Sign-in, MFA, session posture, recovery, and API credentials.",
    demoCount: 4,
    icon: <LockIcon size={20} />,
    lens: "Entry trust and credential hygiene",
  },
  {
    title: "Features",
    slug: "features",
    description:
      "Flags, rollouts, experiments, and release governance.",
    demoCount: 3,
    icon: <FlagIcon size={20} />,
    lens: "Controlled release tooling",
  },
  {
    title: "Navigation",
    slug: "navigation",
    description:
      "Admin shells, breadcrumbs, search, and fast module switching.",
    demoCount: 3,
    icon: <SettingsIcon size={20} />,
    lens: "Orientation inside dense SaaS work",
  },
  {
    title: "Notifications",
    slug: "notifications",
    description:
      "Alert centers, toasts, banners, and admin messaging.",
    demoCount: 3,
    icon: <BellIcon size={20} />,
    lens: "Operational awareness and follow-up state",
  },
];

const PLATFORM_PROOF_POINTS = [
  {
    title: "Command over clutter",
    description:
      "Platform should separate alarms, rollout status, and deeper analysis immediately, even when the runtime flips to a darker or denser shell.",
  },
  {
    title: "Governance-first composition",
    description:
      "Permissions, identity, and tenancy should feel auditable before they feel decorative, regardless of tenant chrome.",
  },
  {
    title: "Operator continuity",
    description:
      "Dashboards, forms, and directories should read like one control plane under pressure instead of three unrelated demos.",
  },
];

export default function PlatformPage() {
  const runtime = useShowroomRuntime();
  const totalDemos = PLATFORM_CATEGORIES.reduce(
    (sum, category) => sum + category.demoCount,
    0
  );

  return (
    <VerticalShowcaseShell
      name="Platform"
      slug="platform"
      heroTitle="Platform should sell governance-grade product confidence while still adapting cleanly to the active tenant runtime."
      heroSummary="The workflow, hierarchy, and operational language stay platform-specific here. What should change is the rendering posture, not the control-plane logic: dense admin surfaces still need a visible split between command metrics, active risk, and deeper analysis when BitHire, Evnto, or dark-first Rottay is driving the DS."
      runtimeSummary={`Active provider: ${runtime.tenantName}, ${runtime.engine}, ${runtime.productProfileLabel}. The shell below should prove that structure and trust signals survive the switch.`}
      auditPoints={[
        "High information density",
        "Visible system status",
        "Governance-first polish",
        "Dark-first safe surfaces",
      ]}
      heroMetrics={[
        {
          label: "Coverage",
          value: `${totalDemos} demos`,
          detail: "Across 7 admin categories that need to feel like one control plane.",
        },
        {
          label: "Priority",
          value: "Governance",
          detail: "Permissions, identity, rollout risk, and tenant oversight stay above the fold.",
        },
        {
          label: "Interaction bias",
          value: "Compact confidence",
          detail: "Fast command reads first, then deliberate drill-down into analysis.",
        },
      ]}
      proofPoints={PLATFORM_PROOF_POINTS}
      leadDemo={{
        title: "Operations dashboard",
        description:
          "The KPI-heavy view that establishes trust and keeps operators oriented across tenants, uptime, security posture, launch risk, and rollout readiness.",
        badge: "Command center",
        inspectionNotes: [
          "Whether headline metrics, risk, and analysis are visibly separated under dense chrome.",
          "Whether supporting panels feel governed instead of ornamental.",
          "Whether status language looks credible for enterprise admin workflows.",
        ],
        coverageNote:
          "Identity, tenancy, and permissions should still feel native to one admin shell when the runtime switches.",
        viewportHeight: 960,
        children: <PlatformDashboardDemo />,
      }}
      supportingDemos={[
        {
          title: "Identity directory",
          description:
            "Dense user administration with search, status, access posture, and actionable context.",
          badge: "Identity",
          inspectionNotes: [],
          coverageNote: "",
          viewportHeight: 760,
          children: <PlatformUserListDemo />,
        },
        {
          title: "Tenant configuration",
          description:
            "Settings-heavy configuration flow with launch readiness, security guardrails, and brand governance.",
          badge: "Tenancy",
          inspectionNotes: [],
          coverageNote: "",
          viewportHeight: 760,
          children: <PlatformTenantFormDemo />,
        },
      ]}
      categories={PLATFORM_CATEGORIES}
      categoryIntro="Use these cards to open focused governance lanes with deeper scenario inventory and component proof."
      accentTint="rgba(59, 130, 246, 0.16)"
      accentBorder="rgba(59, 130, 246, 0.28)"
    />
  );
}
