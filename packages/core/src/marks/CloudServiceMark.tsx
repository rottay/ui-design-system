import React, { forwardRef } from 'react';

import { TheSvgCloudServiceMarkAdapter } from './adapters/thesvg-react';
import {
  isCloudProvider,
  isCloudService,
  resolveCloudOpticalVariant,
} from './registry';
import { resolveMarkAccessibility, warnMarkOnce } from './runtime';
import type { CloudServiceMarkProps } from './types';

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
      warnMarkOnce(`unknown-cloud:${key}`, `Unknown cloud service "${key}"; rendered null.`);
      return null;
    }

    const accessibility = resolveMarkAccessibility(
      `cloud:${provider}:${service}`,
      label,
      decorative,
    );
    if (!accessibility) return null;

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

