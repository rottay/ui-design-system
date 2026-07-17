import React, { forwardRef } from 'react';

import {
  isGraphicAssetAdapterEnabled,
  reportGraphicAssetTelemetry,
} from '@/infrastructure/runtime/graphics/asset-governance/runtime/control';
import { TheSvgCloudServiceMarkAdapter } from '../../runtime/adapters/thesvg-react/cloud-service';
import {
  isCloudProvider,
  isCloudService,
  type CloudServiceMarkProps,
} from '../../foundation/catalog';
import {
  resolveCloudOpticalVariant,
  resolveMarkAccessibility,
  warnMarkOnce,
} from '../../runtime/resolution';

/** Supplier-independent renderer for the fixed, optically-sized cloud corpus. */
export const CloudServiceMark = forwardRef<SVGSVGElement, CloudServiceMarkProps>(
  function CloudServiceMark(props, ref) {
    const {
      provider,
      service,
      size = 'md',
      width,
      height,
      label,
      decorative,
      className,
      style,
      id,
      'aria-describedby': ariaDescribedBy,
      'data-testid': testId,
    } = props;

    if (!isCloudProvider(provider) || !isCloudService(service)) {
      const key = `${String(provider)}:${String(service)}`;
      reportGraphicAssetTelemetry({
        code: 'unmapped-name',
        assetClass: 'cloud-service-mark',
        assetKey: key,
        outcome: 'dropped',
      });
      warnMarkOnce(`unknown-cloud:${key}`, `Unknown cloud service "${key}"; rendered null.`);
      return null;
    }

    const accessibility = resolveMarkAccessibility(
      `cloud:${provider}:${service}`,
      label,
      decorative,
    );
    if (!accessibility) {
      reportGraphicAssetTelemetry({
        code: 'accessible-name-failure',
        assetClass: 'cloud-service-mark',
        assetKey: `${provider}:${service}`,
        outcome: 'dropped',
      });
      return null;
    }

    if (!isGraphicAssetAdapterEnabled('cloud-service-mark', `${provider}:${service}`)) return null;

    return (
      <TheSvgCloudServiceMarkAdapter
        ref={ref}
        provider={provider}
        service={service}
        opticalVariant={resolveCloudOpticalVariant(size)}
        size={size}
        width={width}
        height={height}
        label={accessibility.label}
        className={className}
        style={style}
        id={id}
        ariaDescribedBy={ariaDescribedBy}
        testId={testId}
      />
    );
  },
);

CloudServiceMark.displayName = 'CloudServiceMark';
