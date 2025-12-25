'use client';

import { createEngineComponent, lazyEngine } from '../../../engine/createEngineComponent';
import type { BreadcrumbProps } from './types';
import TitanBreadcrumb from './engines/titan';

/**
 * Breadcrumb Component
 *
 * Multi-engine breadcrumb navigation that automatically uses the correct implementation
 * based on the current engine context.
 *
 * Supported engines:
 * - titan: Ant Design Breadcrumb (full featured)
 * - hermes: DaisyUI breadcrumbs
 * - apollo: HTML + Tailwind CSS breadcrumb
 * - athena: Same as apollo
 */
export const Breadcrumb = createEngineComponent<BreadcrumbProps>({
  titan: TitanBreadcrumb,
  hermes: lazyEngine(() =>
    import('./engines/hermes').then((m) => ({
      default: m.default,
    }))
  ),
  apollo: lazyEngine(() =>
    import('./engines/apollo').then((m) => ({
      default: m.default,
    }))
  ),
  athena: lazyEngine(() =>
    import('./engines/athena').then((m) => ({
      default: m.default,
    }))
  ),
}, { displayName: 'Breadcrumb' });
