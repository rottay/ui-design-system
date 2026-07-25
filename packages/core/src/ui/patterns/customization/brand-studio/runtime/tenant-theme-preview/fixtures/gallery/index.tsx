"use client";

/**
 * @fileoverview Stacked gallery of the three domain-free preview fixtures.
 *
 * A convenience component that renders the list, form, and dashboard fixtures in
 * one column with quiet labels, suitable for the Brand Studio preview galleries
 * slot, the showroom, and the divergence demo. Preview fixture, not product
 * code; carries no product vocabulary.
 */

import { Box, Stack, Text } from "@/ui/primitives";

import { DashboardMetricsPreviewFixture } from "../dashboard-metrics";
import { FormDetailPreviewFixture } from "../form-detail";
import { ListCollectionPreviewFixture } from "../list-collection";
import { VisualExcellencePreviewFixture } from "../visual-excellence";

function GallerySection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <Stack data-part="preview-gallery-section" spacing="xs">
      <Text size="xs" weight="semibold" style={{ display: "block" }}>
        {label}
      </Text>
      <Box data-part="preview-gallery-body">{children}</Box>
    </Stack>
  );
}

/** All three preview fixtures stacked; drop into the preview galleries slot. */
export function TenantThemePreviewGallery(): React.ReactElement {
  return (
    <Stack data-part="preview-gallery" spacing="lg" fullWidth>
      <GallerySection label="Visual excellence stress fixture">
        <VisualExcellencePreviewFixture />
      </GallerySection>
      <GallerySection label="Dashboard">
        <DashboardMetricsPreviewFixture />
      </GallerySection>
      <GallerySection label="Collection">
        <ListCollectionPreviewFixture />
      </GallerySection>
      <GallerySection label="Detail form">
        <FormDetailPreviewFixture />
      </GallerySection>
    </Stack>
  );
}
