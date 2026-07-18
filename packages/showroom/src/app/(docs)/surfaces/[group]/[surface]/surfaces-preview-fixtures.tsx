'use client';

import type { ReactNode } from 'react';
import { ADMIN_SURFACE_PREVIEWS } from './surfaces-preview-admin';
import { DATA_SURFACE_PREVIEWS } from './surfaces-preview-data';
import { EXPERIENCE_SURFACE_PREVIEWS } from './surfaces-preview-experience';
import { FORMS_SURFACE_PREVIEWS } from './surfaces-preview-forms';
import { OPERATIONS_SURFACE_PREVIEWS } from './surfaces-preview-operations';
import { WORKSPACE_SURFACE_PREVIEWS } from './surfaces-preview-workspace';

// Surface recipes that must not be rendered three times in the engine
// comparison grid (e.g. full-bleed overlays). Empty for now.
export const SINGLE_RUNTIME_SURFACE_SLUGS = new Set<string>([]);

// ---------------------------------------------------------------------------
// Complete 36-surface live-preview map, assembled from the six per-group
// fixture modules. Every slug matches the surfaces registry exactly. Fixtures
// use neutral, domain-free vocabulary per the DS ownership law; the only
// forbidden-token substrings are adjudicated DS API names (chat message `role`,
// TeamSurface `role`/`roles`/`onRoleChange`/`TeamRole`, scheduler
// `events`/`onEventClick`), never mock copy.
// ---------------------------------------------------------------------------

export const SURFACE_PREVIEWS: Record<string, ReactNode> = {
  ...ADMIN_SURFACE_PREVIEWS,
  ...DATA_SURFACE_PREVIEWS,
  ...EXPERIENCE_SURFACE_PREVIEWS,
  ...FORMS_SURFACE_PREVIEWS,
  ...OPERATIONS_SURFACE_PREVIEWS,
  ...WORKSPACE_SURFACE_PREVIEWS,
};

export function renderSurfacePreview(slug: string) {
  return SURFACE_PREVIEWS[slug] ?? null;
}
