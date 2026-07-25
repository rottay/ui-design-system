import type { Meta, StoryObj } from "@storybook/react-vite";

import type { TenantConfig } from "@/foundation/contracts";
import { DesignSystemProvider } from "@/infrastructure/runtime/bootstrap";
import { BithireCandidateIcon } from "@/graphics/icons/presentation/semantic/generated/roles/bithire-candidate";
import { ActionAddIcon } from "@/graphics/icons/presentation/semantic/generated/roles/action-add";
import { NavigationSettingsIcon } from "@/graphics/icons/presentation/semantic/generated/roles/navigation-settings";
import { Badge, Card, Text } from "@/ui/primitives";
import { Button } from "@/ui/primitives/inputs/Button";
import { PatternPageShell } from "@/ui/patterns/shell/page-shell";

import { VisualExcellencePreviewFixture } from "./runtime/tenant-theme-preview/fixtures";

const BITHIRE_PREVIEW: TenantConfig = {
  slug: "bithire",
  name: "BitHire",
  engine: "modern",
  theme: "light",
  plan: "enterprise",
  features: ["all"],
  branding: { companyName: "BitHire" },
};

function PageHeaderContent() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "var(--ds-spacing-4, 16px)",
      }}
    >
      <Card variant="outlined">
        <Card.Header
          eyebrow="Decision signal"
          icon={<BithireCandidateIcon size={17} decorative />}
          title="Decision readiness"
          subtitle="Evidence required for the next milestone"
          extra={<Badge tone="success" badgeStyle="soft">84%</Badge>}
          divider
        />
        <Card.Body>
          <Text size="sm" color="secondary">
            Core fit and compensation are verified. One leadership signal remains open.
          </Text>
        </Card.Body>
      </Card>
      <Card variant="outlined">
        <Card.Header
          eyebrow="Momentum"
          icon={<NavigationSettingsIcon size={17} decorative />}
          title="Recent journey"
          subtitle="Four decision-changing moments"
          extra={<Badge tone="primary" badgeStyle="soft">Today</Badge>}
          divider
        />
        <Card.Body>
          <Text size="sm" color="secondary">
            Panel confirmed after the candidate replied through the preferred channel.
          </Text>
        </Card.Body>
      </Card>
      <Card variant="outlined">
        <Card.Header
          eyebrow="Intelligence"
          icon={<ActionAddIcon size={17} decorative />}
          title="AI opportunity"
          subtitle="Highest-value next action"
          extra={<Badge tone="neutral" badgeStyle="outline">850 tokens</Badge>}
          divider
        />
        <Card.Body>
          <Text size="sm" color="secondary">
            Prepare a cited panel brief and close the remaining evidence gap.
          </Text>
        </Card.Body>
      </Card>
    </div>
  );
}

const meta = {
  title: "System/Modern Visual Excellence",
  component: VisualExcellencePreviewFixture,
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "desktop" },
    tenant: "bithire",
    engine: "modern",
  },
  decorators: [
    (Story) => (
      <DesignSystemProvider
        tenantConfig={BITHIRE_PREVIEW}
        forceEngine="modern"
        skipCssLoading
      >
        <Story />
      </DesignSystemProvider>
    ),
  ],
} satisfies Meta<typeof VisualExcellencePreviewFixture>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BitHireDesktop: Story = {};

export const BitHireMobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile" } },
  decorators: [
    (Story) => (
      <div className="storybook-mobile-viewport">
        <Story />
      </div>
    ),
  ],
};

export const PageHeaderSystem: Story = {
  render: () => (
    <div
      style={{
        minHeight: "100vh",
        padding: "clamp(16px, 3vw, 36px)",
        background: "var(--ds-shell-bg, var(--ds-color-bg-primary))",
      }}
    >
      <PatternPageShell
        title="Candidate intelligence"
        eyebrow="Hiring workspace"
        icon={<BithireCandidateIcon size={20} decorative />}
        subtitle="Resolve the next decision with verified evidence and role-aware AI."
        breadcrumbs={[
          { label: "Candidates", href: "#" },
          { label: "Alex Morgan" },
        ]}
        actions={(
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={<NavigationSettingsIcon size={14} decorative />}
            >
              Customize
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<ActionAddIcon size={14} decorative />}
            >
              Add evidence
            </Button>
          </>
        )}
        tabs={[
          {
            key: "overview",
            label: "Overview",
            content: <PageHeaderContent />,
          },
          {
            key: "journey",
            label: "Journey",
            content: <PageHeaderContent />,
          },
          {
            key: "evidence",
            label: "Evidence",
            content: <PageHeaderContent />,
          },
        ]}
      >
        <PageHeaderContent />
      </PatternPageShell>
    </div>
  ),
};
