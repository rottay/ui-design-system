import React, { forwardRef } from 'react';
import Openai, { type OpenaiVariant } from '@thesvg/react/openai';
import Anthropic, { type AnthropicVariant } from '@thesvg/react/anthropic';
import Github, { type GithubVariant } from '@thesvg/react/github';
import Linkedin, { type LinkedinVariant } from '@thesvg/react/linkedin';
import Instagram, { type InstagramVariant } from '@thesvg/react/instagram';
import X, { type XVariant } from '@thesvg/react/x';
import GoogleChrome, { type GoogleChromeVariant } from '@thesvg/react/google-chrome';
import AwsAwsLambda, { type AwsAwsLambdaVariant } from '@thesvg/react/aws-aws-lambda';
import AwsAmazonBedrock, {
  type AwsAmazonBedrockVariant,
} from '@thesvg/react/aws-amazon-bedrock';
import AwsAmazonSimpleStorageService, {
  type AwsAmazonSimpleStorageServiceVariant,
} from '@thesvg/react/aws-amazon-simple-storage-service';
import AwsAmazonRds, { type AwsAmazonRdsVariant } from '@thesvg/react/aws-amazon-rds';

import type { BrandMarkName, CloudOpticalVariant, CloudProvider, CloudService } from '../registry';
import type { MarkSize, MarkSizeToken, MarkVariant } from '../types';

const MARK_SIZE_FALLBACKS: Readonly<Record<MarkSizeToken, string>> = {
  xs: 'var(--ds-mark-xs-size, var(--ds-icon-xs-size, 0.75rem))',
  sm: 'var(--ds-mark-sm-size, var(--ds-icon-sm-size, 1rem))',
  md: 'var(--ds-mark-md-size, var(--ds-icon-md-size, 1.25rem))',
  lg: 'var(--ds-mark-lg-size, var(--ds-icon-lg-size, 1.5rem))',
  xl: 'var(--ds-mark-xl-size, var(--ds-icon-xl-size, 2rem))',
};

interface SharedMarkAdapterProps {
  size: MarkSize;
  width?: string | number;
  height?: string | number;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  ariaDescribedBy?: string;
  testId?: string;
}

interface BrandMarkAdapterProps extends SharedMarkAdapterProps {
  name: BrandMarkName;
  resolvedVariant: MarkVariant;
  sourceVariant: 'default' | 'mono' | 'light' | 'dark' | 'wordmark';
}

interface CloudServiceMarkAdapterProps extends SharedMarkAdapterProps {
  provider: CloudProvider;
  service: CloudService;
  opticalVariant: CloudOpticalVariant;
}

function resolveSize(size: MarkSize): string | number {
  if (typeof size === 'number') {
    return Number.isFinite(size) && size > 0 ? size : MARK_SIZE_FALLBACKS.md;
  }
  return MARK_SIZE_FALLBACKS[size] ?? MARK_SIZE_FALLBACKS.md;
}

function resolveDimension(
  value: string | number | undefined,
  fallback: string | number,
): string | number {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : fallback;
  if (typeof value === 'string') return value.trim().length > 0 ? value : fallback;
  return fallback;
}

function sharedSvgProps({
  size,
  width,
  height,
  label,
  className,
  style,
  id,
  ariaDescribedBy,
  testId,
}: SharedMarkAdapterProps) {
  const fallback = resolveSize(size);
  const isLabeled = typeof label === 'string';

  return {
    id,
    width: resolveDimension(width, fallback),
    height: resolveDimension(height, fallback),
    className: `rottay-mark ${className ?? ''}`.trim(),
    style,
    focusable: 'false',
    role: isLabeled ? 'img' : undefined,
    'aria-label': isLabeled ? label : undefined,
    'aria-describedby': ariaDescribedBy,
    'aria-hidden': isLabeled ? undefined : true,
    'data-testid': testId,
    'data-part': 'mark',
    'data-mark-source': 'thesvg',
  } as const;
}

/** The sole module that translates DS brand names into renderer components. */
export const TheSvgBrandMarkAdapter = forwardRef<SVGSVGElement, BrandMarkAdapterProps>(
  function TheSvgBrandMarkAdapter(props, ref) {
    const { name, resolvedVariant, sourceVariant } = props;
    const svgProps = {
      ...sharedSvgProps(props),
      ref,
      'data-mark-kind': 'brand',
      'data-mark-name': name,
      'data-mark-variant': resolvedVariant,
      'data-mark-source-variant': sourceVariant,
    } as const;

    switch (name) {
      case 'openai':
        return <Openai {...svgProps} variant={sourceVariant as OpenaiVariant} />;
      case 'anthropic':
        return <Anthropic {...svgProps} variant={sourceVariant as AnthropicVariant} />;
      case 'github':
        return <Github {...svgProps} variant={sourceVariant as GithubVariant} />;
      case 'linkedin':
        return <Linkedin {...svgProps} variant={sourceVariant as LinkedinVariant} />;
      case 'instagram':
        return <Instagram {...svgProps} variant={sourceVariant as InstagramVariant} />;
      case 'x':
        return <X {...svgProps} variant={sourceVariant as XVariant} />;
      case 'chrome':
        return <GoogleChrome {...svgProps} variant={sourceVariant as GoogleChromeVariant} />;
      default:
        return null;
    }
  },
);

TheSvgBrandMarkAdapter.displayName = 'TheSvgBrandMarkAdapter';

/** The sole module that translates DS cloud services into renderer components. */
export const TheSvgCloudServiceMarkAdapter = forwardRef<
  SVGSVGElement,
  CloudServiceMarkAdapterProps
>(function TheSvgCloudServiceMarkAdapter(props, ref) {
  const { provider, service, opticalVariant } = props;
  const svgProps = {
    ...sharedSvgProps(props),
    ref,
    'data-mark-kind': 'cloud-service',
    'data-mark-provider': provider,
    'data-mark-service': service,
    'data-mark-variant': opticalVariant,
    'data-mark-source-variant': opticalVariant,
  } as const;

  if (provider !== 'aws') return null;

  switch (service) {
    case 'lambda':
      return <AwsAwsLambda {...svgProps} variant={opticalVariant as AwsAwsLambdaVariant} />;
    case 'bedrock':
      return (
        <AwsAmazonBedrock
          {...svgProps}
          variant={opticalVariant as AwsAmazonBedrockVariant}
        />
      );
    case 's3':
      return (
        <AwsAmazonSimpleStorageService
          {...svgProps}
          variant={opticalVariant as AwsAmazonSimpleStorageServiceVariant}
        />
      );
    case 'rds':
      return <AwsAmazonRds {...svgProps} variant={opticalVariant as AwsAmazonRdsVariant} />;
    default:
      return null;
  }
});

TheSvgCloudServiceMarkAdapter.displayName = 'TheSvgCloudServiceMarkAdapter';

