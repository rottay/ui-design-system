import React, { forwardRef } from 'react';
import AwsAwsLambda, { type AwsAwsLambdaVariant } from '@thesvg/react/aws-aws-lambda';
import AwsAmazonBedrock, {
  type AwsAmazonBedrockVariant,
} from '@thesvg/react/aws-amazon-bedrock';
import AwsAmazonSimpleStorageService, {
  type AwsAmazonSimpleStorageServiceVariant,
} from '@thesvg/react/aws-amazon-simple-storage-service';
import AwsAmazonRds, { type AwsAmazonRdsVariant } from '@thesvg/react/aws-amazon-rds';

import type {
  CloudOpticalVariant,
  CloudProvider,
  CloudService,
} from '../../../../foundation/catalog';
import {
  sharedSvgProps,
  type SharedMarkAdapterProps,
} from '..';

interface CloudServiceMarkAdapterProps extends SharedMarkAdapterProps {
  provider: CloudProvider;
  service: CloudService;
  opticalVariant: CloudOpticalVariant;
}

/** The sole module that translates DS cloud services into renderer components. */
export const TheSvgCloudServiceMarkAdapter = forwardRef<
  SVGSVGElement,
  CloudServiceMarkAdapterProps
>(function TheSvgCloudServiceMarkAdapter(props, ref) {
  const { provider, service, opticalVariant } = props;
  const svgProps = {
    ...sharedSvgProps(props),
    ref,
    'data-asset-class': 'cloud-service-mark',
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
