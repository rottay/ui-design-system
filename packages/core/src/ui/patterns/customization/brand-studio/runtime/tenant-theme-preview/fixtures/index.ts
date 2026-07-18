/**
 * @fileoverview Domain-free surface fixtures for the tenant-theme live preview.
 *
 * These three fixtures are the generic content that renders inside the preview
 * scope so a compiled tenant theme can be seen re-skinning real surfaces. They
 * are preview fixtures, not product code, and carry no tenant/candidate/role/
 * company/interview/event vocabulary. Production Brand Studio does not import
 * them; a consumer (showroom, the divergence demo, or app-platform) passes them
 * -- or its own content -- through the preview galleries slot.
 */

export { ListCollectionPreviewFixture } from './list-collection';
export { FormDetailPreviewFixture } from './form-detail';
export { DashboardMetricsPreviewFixture } from './dashboard-metrics';
export { TenantThemePreviewGallery } from './gallery';
