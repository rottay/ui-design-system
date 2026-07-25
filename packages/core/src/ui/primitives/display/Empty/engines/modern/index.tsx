/**
 * @fileoverview Modern engine for the Empty component.
 * Uses the semantic icon system so visuals inherit tenant iconography,
 * weight, color, and accessibility rules.
 */

'use client';

import React, { forwardRef } from 'react';
import type { EmptyProps } from '../../contracts';
import { EMPTY_DEFAULTS } from '../../contracts';
import { useTranslation } from '@/infrastructure/runtime/i18n';
import { CommunicationInboxIcon } from '@/graphics/icons/presentation/semantic/generated/roles/communication-inbox';

const DefaultImage: React.FC = () => (
  <CommunicationInboxIcon
    decorative
    size={36}
    className="rottay-empty__illustration"
  />
);

const SimpleImage: React.FC = () => (
  <CommunicationInboxIcon
    decorative
    size={28}
    className="rottay-empty__illustration"
  />
);

const ModernEmpty = forwardRef<HTMLDivElement, EmptyProps>((props, ref) => {
  const { t } = useTranslation('components');
  const {
    image = EMPTY_DEFAULTS.image,
    imageStyle,
    description,
    children,
    className = '',
    style,
  } = props;

  const displayDescription = description ?? t('empty.description');
  const imageType = typeof image === 'string' ? image : image ? 'custom' : 'none';

  const renderImage = () => {
    if (image === 'default') return <DefaultImage />;
    if (image === 'simple') return <SimpleImage />;
    return image;
  };

  return (
    <div
      ref={ref}
      className={`rottay-empty rottay-empty--modern ${className}`}
      data-part="root"
      data-image={imageType}
      data-has-description={Boolean(displayDescription)}
      data-has-footer={Boolean(children)}
      style={style}
      role="status"
      aria-live="polite"
    >
      {image && (
        <div className="rottay-empty__visual" data-part="image" style={imageStyle}>
          {renderImage()}
        </div>
      )}

      {displayDescription && (
        <p className="rottay-empty__description" data-part="description">
          {displayDescription}
        </p>
      )}

      {children && (
        <div className="rottay-empty__footer" data-part="footer">
          {children}
        </div>
      )}
    </div>
  );
});

ModernEmpty.displayName = 'ModernEmpty';

export default ModernEmpty;
