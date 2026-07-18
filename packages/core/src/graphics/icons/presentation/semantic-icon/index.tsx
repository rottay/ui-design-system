import { forwardRef } from 'react';

import { reportGraphicAssetTelemetry } from '../../../../infrastructure/runtime/graphics/asset-governance/runtime/control';
import type { IconProps } from '../../foundation/contracts/registry/semantic';
import { resolveGeneratedIcon } from '../semantic/generated/facade-map';

const warnedInputs = new Set<string>();

function warnOnce(key: string, message: string): void {
  if (process.env.NODE_ENV === 'production' || warnedInputs.has(key)) return;
  warnedInputs.add(key);
  console.warn(`[Rottay Icon] ${message}`);
}

/** Supplier-independent semantic icon renderer. */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon({ name, ...props }, ref) {
  const Component = resolveGeneratedIcon(name);
  if (!Component) {
    reportGraphicAssetTelemetry({
      code: 'unmapped-name',
      assetClass: 'semantic-icon',
      assetKey: String(name),
      outcome: 'dropped',
    });
    warnOnce(`unknown:${String(name)}`, `Unknown semantic icon "${String(name)}"; rendered null.`);
    return null;
  }

  return <Component ref={ref} {...props} />;
});

Icon.displayName = 'Icon';
