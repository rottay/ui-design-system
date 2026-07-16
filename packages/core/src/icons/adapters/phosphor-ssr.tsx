import React, { forwardRef } from 'react';
import type { Icon as PhosphorIcon, IconWeight as PhosphorIconWeight } from '@phosphor-icons/react';
import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { ArrowsOutSimpleIcon } from '@phosphor-icons/react/dist/ssr/ArrowsOutSimple';
import { BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { BrainIcon } from '@phosphor-icons/react/dist/ssr/Brain';
import { BriefcaseIcon } from '@phosphor-icons/react/dist/ssr/Briefcase';
import { CalendarCheckIcon } from '@phosphor-icons/react/dist/ssr/CalendarCheck';
import { ChartBarIcon } from '@phosphor-icons/react/dist/ssr/ChartBar';
import { ChatCircleDotsIcon } from '@phosphor-icons/react/dist/ssr/ChatCircleDots';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { CheckIcon } from '@phosphor-icons/react/dist/ssr/Check';
import { CompassIcon } from '@phosphor-icons/react/dist/ssr/Compass';
import { CopyIcon } from '@phosphor-icons/react/dist/ssr/Copy';
import { EnvelopeSimpleIcon } from '@phosphor-icons/react/dist/ssr/EnvelopeSimple';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { FileMagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/FileMagnifyingGlass';
import { FingerprintIcon } from '@phosphor-icons/react/dist/ssr/Fingerprint';
import { FunnelIcon } from '@phosphor-icons/react/dist/ssr/Funnel';
import { GaugeIcon } from '@phosphor-icons/react/dist/ssr/Gauge';
import { GearIcon } from '@phosphor-icons/react/dist/ssr/Gear';
import { HandshakeIcon } from '@phosphor-icons/react/dist/ssr/Handshake';
import { HouseIcon } from '@phosphor-icons/react/dist/ssr/House';
import { InfoIcon } from '@phosphor-icons/react/dist/ssr/Info';
import { KanbanIcon } from '@phosphor-icons/react/dist/ssr/Kanban';
import { KeyIcon } from '@phosphor-icons/react/dist/ssr/Key';
import { ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { LockIcon } from '@phosphor-icons/react/dist/ssr/Lock';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { MailboxIcon } from '@phosphor-icons/react/dist/ssr/Mailbox';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { PhoneIcon } from '@phosphor-icons/react/dist/ssr/Phone';
import { PlayIcon } from '@phosphor-icons/react/dist/ssr/Play';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { PulseIcon } from '@phosphor-icons/react/dist/ssr/Pulse';
import { RobotIcon } from '@phosphor-icons/react/dist/ssr/Robot';
import { ShieldCheckIcon } from '@phosphor-icons/react/dist/ssr/ShieldCheck';
import { SparkleIcon } from '@phosphor-icons/react/dist/ssr/Sparkle';
import { SpinnerGapIcon } from '@phosphor-icons/react/dist/ssr/SpinnerGap';
import { TableIcon } from '@phosphor-icons/react/dist/ssr/Table';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { UserCircleIcon } from '@phosphor-icons/react/dist/ssr/UserCircle';
import { UserFocusIcon } from '@phosphor-icons/react/dist/ssr/UserFocus';
import { WarningIcon } from '@phosphor-icons/react/dist/ssr/Warning';
import { WaveformIcon } from '@phosphor-icons/react/dist/ssr/Waveform';
import { WrenchIcon } from '@phosphor-icons/react/dist/ssr/Wrench';
import { XCircleIcon } from '@phosphor-icons/react/dist/ssr/XCircle';
import { XIcon } from '@phosphor-icons/react/dist/ssr/X';

import { ICON_SIZE_TOKENS } from '../tokens';
import type { IconName } from '../semantic/registry';
import type { AdapterIconWeight } from '../semantic/presentation';
import type {
  IconMirroring,
  IconRole,
  IconState,
  IconTone,
  SemanticIconSize,
} from '../semantic/types';

const PHOSPHOR_GLYPHS = {
  'action.add': PlusIcon,
  'action.edit': PencilSimpleIcon,
  'action.delete': TrashIcon,
  'action.copy': CopyIcon,
  'action.search': MagnifyingGlassIcon,
  'action.filter': FunnelIcon,
  'action.close': XIcon,
  'action.confirm': CheckIcon,
  'action.retry': ArrowClockwiseIcon,
  'action.play': PlayIcon,
  'action.reveal': EyeIcon,
  'action.conceal': EyeSlashIcon,
  'navigation.home': HouseIcon,
  'navigation.back': ArrowLeftIcon,
  'navigation.forward': ArrowRightIcon,
  'navigation.expand': ArrowsOutSimpleIcon,
  'navigation.menu': ListIcon,
  'navigation.settings': GearIcon,
  'navigation.profile': UserCircleIcon,
  'navigation.route': CompassIcon,
  'status.success': CheckCircleIcon,
  'status.warning': WarningIcon,
  'status.error': XCircleIcon,
  'status.info': InfoIcon,
  'status.loading': SpinnerGapIcon,
  'status.secure': ShieldCheckIcon,
  'status.live': PulseIcon,
  'communication.email': EnvelopeSimpleIcon,
  'communication.message': ChatCircleDotsIcon,
  'communication.notification': BellIcon,
  'communication.voice': WaveformIcon,
  'communication.call': PhoneIcon,
  'communication.inbox': MailboxIcon,
  'auth.password': LockIcon,
  'auth.passkey': FingerprintIcon,
  'auth.sso': KeyIcon,
  'data.chart': ChartBarIcon,
  'data.table': TableIcon,
  'data.gauge': GaugeIcon,
  'data.trend': TrendUpIcon,
  'ai.assistant': RobotIcon,
  'ai.reasoning': BrainIcon,
  'ai.sparkles': SparkleIcon,
  'ai.tool': WrenchIcon,
  'bithire.candidate': UserFocusIcon,
  'bithire.interview': CalendarCheckIcon,
  'bithire.pipeline': KanbanIcon,
  'bithire.evidence': FileMagnifyingGlassIcon,
  'bithire.job': BriefcaseIcon,
  'bithire.offer': HandshakeIcon,
} as const satisfies Record<IconName, PhosphorIcon>;

interface PhosphorSsrAdapterProps {
  name: IconName;
  role: IconRole;
  state: IconState;
  size: SemanticIconSize;
  tone: IconTone;
  weight: AdapterIconWeight;
  mirroring: IconMirroring;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  ariaDescribedBy?: string;
  testId?: string;
}

const SIZE_FALLBACKS: Readonly<Record<keyof typeof ICON_SIZE_TOKENS, string>> = {
  xs: 'var(--ds-icon-xs-size, 0.75rem)',
  sm: 'var(--ds-icon-sm-size, 1rem)',
  md: 'var(--ds-icon-md-size, 1.25rem)',
  lg: 'var(--ds-icon-lg-size, 1.5rem)',
  xl: 'var(--ds-icon-xl-size, 2rem)',
  '2xl': 'var(--ds-icon-2xl-size, 3rem)',
};

function resolveSize(size: SemanticIconSize): string | number {
  if (typeof size === 'number') {
    return Number.isFinite(size) && size > 0 ? size : SIZE_FALLBACKS.md;
  }
  return SIZE_FALLBACKS[size] ?? SIZE_FALLBACKS.md;
}

/** The only module allowed to translate semantic names into Phosphor glyphs. */
export const PhosphorSsrIconAdapter = forwardRef<SVGSVGElement, PhosphorSsrAdapterProps>(
  function PhosphorSsrIconAdapter(
    {
      name,
      role,
      state,
      size,
      tone,
      weight,
      mirroring,
      label,
      className,
      style,
      id,
      ariaDescribedBy,
      testId,
    },
    ref,
  ) {
    const Glyph = PHOSPHOR_GLYPHS[name];
    if (!Glyph) return null;

    const isLabeled = typeof label === 'string';
    const mirrorMarker = mirroring === 'auto' ? 'auto' : mirroring ? 'true' : 'false';

    return (
      <Glyph
        ref={ref}
        id={id}
        size={resolveSize(size)}
        color="currentColor"
        weight={weight as PhosphorIconWeight}
        mirrored={mirroring === true}
        alt={label}
        className={`rottay-icon rottay-semantic-icon ${className ?? ''}`.trim()}
        style={style}
        focusable="false"
        role={isLabeled ? 'img' : undefined}
        aria-label={isLabeled ? label : undefined}
        aria-describedby={ariaDescribedBy}
        aria-hidden={isLabeled ? undefined : true}
        data-testid={testId}
        data-part="icon"
        data-icon-name={name}
        data-icon-role={role}
        data-icon-state={state}
        data-icon-tone={tone}
        data-icon-weight={weight}
        data-icon-mirrored={mirrorMarker}
      />
    );
  },
);

PhosphorSsrIconAdapter.displayName = 'PhosphorSsrIconAdapter';
