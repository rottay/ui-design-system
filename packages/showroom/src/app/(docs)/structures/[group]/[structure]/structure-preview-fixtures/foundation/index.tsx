'use client';

import { forwardRef, type SVGProps } from 'react';
import { Icon, type IconName } from '@rottay/design-system/icons';

type FixtureIconProps = Omit<SVGProps<SVGSVGElement>, 'ref'> & {
  size?: string | number;
  'data-testid'?: string;
};

function createDecorativeFixtureIcon(name: IconName, displayName: string) {
  const FixtureIcon = forwardRef<SVGSVGElement, FixtureIconProps>(
    function DecorativeFixtureIcon(
      {
        size = 20,
        className,
        style,
        id,
        'aria-describedby': ariaDescribedBy,
        'data-testid': testId,
      },
      ref,
    ) {
      return (
        <Icon
          name={name}
          ref={ref}
          decorative
          size={typeof size === 'number' ? size : 'md'}
          className={className}
          style={style}
          id={id}
          aria-describedby={ariaDescribedBy}
          data-testid={testId}
        />
      );
    },
  );

  FixtureIcon.displayName = displayName;
  return FixtureIcon;
}

const ActionRefreshIcon = createDecorativeFixtureIcon(
  'action.refresh',
  'ActionRefreshFixtureIcon',
);
const ActionUploadIcon = createDecorativeFixtureIcon(
  'action.upload',
  'ActionUploadFixtureIcon',
);
const CommunicationMessageIcon = createDecorativeFixtureIcon(
  'communication.message',
  'CommunicationMessageFixtureIcon',
);
const ContentDocumentIcon = createDecorativeFixtureIcon(
  'content.document',
  'ContentDocumentFixtureIcon',
);
const EntityGroupIcon = createDecorativeFixtureIcon(
  'entity.group',
  'EntityGroupFixtureIcon',
);
const LocationGlobalIcon = createDecorativeFixtureIcon(
  'location.global',
  'LocationGlobalFixtureIcon',
);
const LocationPlaceIcon = createDecorativeFixtureIcon(
  'location.place',
  'LocationPlaceFixtureIcon',
);
const TimeDateIcon = createDecorativeFixtureIcon('time.date', 'TimeDateFixtureIcon');
const AccessAdminIcon = createDecorativeFixtureIcon(
  'access.admin',
  'AccessAdminFixtureIcon',
);
const IdentityProvisioningIcon = createDecorativeFixtureIcon(
  'identity.provisioning',
  'IdentityProvisioningFixtureIcon',
);
const SecurityProtectionIcon = createDecorativeFixtureIcon(
  'security.protection',
  'SecurityProtectionFixtureIcon',
);
const AnalyticsActivityIcon = createDecorativeFixtureIcon(
  'analytics.activity',
  'AnalyticsActivityFixtureIcon',
);
const AnalyticsBarIcon = createDecorativeFixtureIcon(
  'analytics.bar',
  'AnalyticsBarFixtureIcon',
);
const BillingCreditCardIcon = createDecorativeFixtureIcon(
  'billing.credit-card',
  'BillingCreditCardFixtureIcon',
);
const OperationsSupportIcon = createDecorativeFixtureIcon(
  'operations.support',
  'OperationsSupportFixtureIcon',
);

const noop = () => {};

export {
  ActionRefreshIcon,
  ActionUploadIcon,
  CommunicationMessageIcon,
  ContentDocumentIcon,
  EntityGroupIcon,
  LocationGlobalIcon,
  LocationPlaceIcon,
  TimeDateIcon,
  AccessAdminIcon,
  IdentityProvisioningIcon,
  SecurityProtectionIcon,
  AnalyticsActivityIcon,
  AnalyticsBarIcon,
  BillingCreditCardIcon,
  OperationsSupportIcon,
  noop,
};
