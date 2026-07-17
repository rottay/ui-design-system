"use client";

import { useShowroomRuntime } from "@/components/showroom-context";
import { EventDashboardDemo } from "@/components/demos/evnto/event-dashboard";
import { TicketBuilderDemo } from "@/components/demos/evnto/ticket-builder";
import { VenueLayoutDemo } from "@/components/demos/evnto/venue-layout";
import { VerticalShowcaseShell, type VerticalCategoryCard } from "../vertical-showcase-shell";
import {
  ActivityIcon,
  BarChart3Icon,
  Building2Icon,
  CalendarIcon,
  SettingsIcon,
  StarIcon,
  UsersIcon,
  ZapIcon,
} from "@rottay/design-system/icons";

const EVNTO_CATEGORIES: VerticalCategoryCard[] = [
  {
    title: "Event Management",
    slug: "event-management",
    description:
      "Event setup, scheduling, programming, and recurrence.",
    demoCount: 4,
    icon: <CalendarIcon size={20} />,
    lens: "Programming the event itself",
  },
  {
    title: "Venue",
    slug: "venue",
    description:
      "Venue profiles, floor plans, capacity, and availability.",
    demoCount: 3,
    icon: <Building2Icon size={20} />,
    lens: "Spatial planning and capacity control",
  },
  {
    title: "Ticketing",
    slug: "ticketing",
    description:
      "Ticket tiers, pricing rules, promo logic, and launch readiness.",
    demoCount: 4,
    icon: <StarIcon size={20} />,
    lens: "Monetization and launch readiness",
  },
  {
    title: "Operations",
    slug: "operations",
    description:
      "Checklists, vendor coordination, and day-of timeline control.",
    demoCount: 3,
    icon: <SettingsIcon size={20} />,
    lens: "Showtime reliability and execution",
  },
  {
    title: "Staff",
    slug: "staff",
    description:
      "Staff scheduling, roles, shifts, and live check-in.",
    demoCount: 3,
    icon: <UsersIcon size={20} />,
    lens: "Ground-team orchestration",
  },
  {
    title: "Finance",
    slug: "finance",
    description:
      "Revenue, expenses, settlements, and event economics.",
    demoCount: 3,
    icon: <BarChart3Icon size={20} />,
    lens: "Commercial clarity and reconciliation",
  },
  {
    title: "Engagement",
    slug: "engagement",
    description:
      "Polls, social surfaces, feedback loops, and attendee energy.",
    demoCount: 3,
    icon: <ZapIcon size={20} />,
    lens: "Audience momentum and participation",
  },
  {
    title: "Analytics",
    slug: "analytics",
    description:
      "Attendance, revenue, and engagement hindsight.",
    demoCount: 4,
    icon: <ActivityIcon size={20} />,
    lens: "Operational and commercial hindsight",
  },
];

const EVNTO_PROOF_POINTS = [
  {
    title: "Atmosphere with discipline",
    description:
      "Evnto should feel expressive and premium without losing operational clarity under any runtime.",
  },
  {
    title: "Revenue and operations together",
    description:
      "Ticketing, venue, and finance moments need to feel connected instead of siloed or demo-like.",
  },
  {
    title: "Live-event confidence",
    description:
      "The UI has to stay legible when timing, capacity, and people pressure all spike, including in dark-first Rottay.",
  },
];

export default function EvntoPage() {
  const runtime = useShowroomRuntime();
  const totalDemos = EVNTO_CATEGORIES.reduce(
    (sum, category) => sum + category.demoCount,
    0
  );

  return (
    <VerticalShowcaseShell
      name="Evnto"
      slug="evnto"
      heroTitle="Evnto should feel like a polished event platform with commercial energy, not a gallery of isolated venue widgets."
      heroSummary="Venue, ticketing, and live-operations semantics stay intact here. What should change is the rendering language, so the same event surfaces remain premium, legible, and commercially credible when the showroom runtime changes."
      runtimeSummary={`Active provider: ${runtime.tenantName}, ${runtime.engine}, ${runtime.productProfileLabel}. The shell below should prove that atmosphere survives without relying on light-page assumptions.`}
      auditPoints={[
        "Spectacle only where it frames",
        "Live-event pressure stays readable",
        "Commercial tone with operational readiness",
        "Premium in dark or light",
      ]}
      heroMetrics={[
        {
          label: "Coverage",
          value: `${totalDemos} demos`,
          detail: "Across 8 event workflows that need to feel like one product system.",
        },
        {
          label: "Tone",
          value: "Premium energy",
          detail: "Expressive framing without sacrificing legibility or urgency.",
        },
        {
          label: "Priority",
          value: "Operations + revenue",
          detail: "Live events demand both polish and control at the same time.",
        },
      ]}
      proofPoints={EVNTO_PROOF_POINTS}
      leadDemo={{
        title: "Operations dashboard",
        description:
          "The live heartbeat of an event: capacity, velocity, revenue, attendee flow, and day-of execution.",
        badge: "Live ops",
        inspectionNotes: [
          "Whether commercial and operational signals share one visual language.",
          "Whether premium framing still leaves room for urgent controls.",
          "Whether status, capacity, and revenue can be read at a glance.",
        ],
        coverageNote:
          "Ticketing, venue, staff, and analytics should all feel like one live-event system with different moods.",
        viewportHeight: 860,
        children: <EventDashboardDemo />,
      }}
      supportingDemos={[
        {
          title: "Ticket tier builder",
          description:
            "Where monetization strategy becomes a usable control surface for pricing, inventory, and launch planning.",
          badge: "Ticketing",
          inspectionNotes: [],
          coverageNote: "",
          viewportHeight: 720,
          children: <TicketBuilderDemo />,
        },
        {
          title: "Venue zone overview",
          description:
            "Spatial planning that still feels premium and easy to read under real operational pressure.",
          badge: "Venue",
          inspectionNotes: [],
          coverageNote: "",
          viewportHeight: 760,
          children: <VenueLayoutDemo />,
        },
      ]}
      categories={EVNTO_CATEGORIES}
      categoryIntro="Use these cards to open event-specific lanes with deeper scenario inventory and component proof."
      accentTint="rgba(244, 63, 94, 0.16)"
      accentBorder="rgba(244, 63, 94, 0.28)"
    />
  );
}
