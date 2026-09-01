/**
 * @fileoverview Modern engine for the Empty component.
 * Uses the semantic icon system so visuals inherit tenant iconography,
 * weight, color, and accessibility rules.
 */

'use client';

import React, { forwardRef } from 'react';
import type { EmptyProps } from '../../contracts';
import { EMPTY_DEFAULTS } from '../../contracts';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { CommunicationInboxIcon } from '@/graphics/icons/semantic/generated/roles/communication-inbox';

// data-part="icon" is what the skin sizes the preset illustration from; a
// caller-supplied ReactNode image is deliberately left unstamped (owns its size).
const DefaultImage: React.FC = () => (
  <CommunicationInboxIcon
    decorative
    size={36}
    className="rottay-empty__illustration"
    data-part="icon"
  />
);

const SimpleImage: React.FC = () => (
  <CommunicationInboxIcon
    decorative
    size={28}
    className="rottay-empty__illustration"
    data-part="icon"
  />
);

const ModernEmpty = forwardRef<HTMLDivElement, EmptyProps>((props, ref) => {
  // Optional + English floor: a bare composition (no I18nProvider above it,
  // e.g. direct engine renders in tests) must still render — a hard provider
  // requirement would crash it. Idiom matches Spinner/rate modern.
  const i18n = useOptionalTranslation('components');
  const {
    image = EMPTY_DEFAULTS.image,
    imageStyle,
    description,
    children,
    className = '',
    style,
    'data-part': dataPart,
    role,
    'aria-live': ariaLive,
    // Caller passthrough (id / aria-* / data-* / data-testid): forwarded to the
    // root element. It spreads BEFORE the engine's own stamps so the skin
    // contract (data-image / data-has-*) always lands last. The ANNOUNCEMENT
    // contract is resolved below instead of stamped after the spread — stamping
    // it made the default unsilenceable, which is the opposite of pass-through.
    ...rest
  } = props;

  const displayDescription = description ?? i18n?.tOr('empty.description', 'No data') ?? 'No data';
  const imageType = typeof image === 'string' ? image : image ? 'custom' : 'none';

  // The default is the PAIR (status + polite), so re-roling drops the implied
  // politeness rather than contradicting the new role: `role="alert"` is
  // implicitly assertive, and forcing `polite` onto it would fight it. An
  // explicit `aria-live` still wins on its own, keeping `role="status"` intact.
  const resolvedRole = role ?? 'status';
  const resolvedAriaLive = ariaLive ?? (resolvedRole === 'status' ? 'polite' : undefined);

  const renderImage = () => {
    if (image === 'default') return <DefaultImage />;
    if (image === 'simple') return <SimpleImage />;
    return image;
  };

  return (
    <div
      {...rest}
      ref={ref}
      className={`rottay-empty rottay-empty--modern ${className}`}
      data-part={dataPart ?? 'root'}
      data-image={imageType}
      data-has-description={Boolean(displayDescription)}
      data-has-footer={Boolean(children)}
      style={style}
      role={resolvedRole}
      aria-live={resolvedAriaLive}
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
