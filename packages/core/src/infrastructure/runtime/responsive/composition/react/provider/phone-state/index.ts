'use client';

import { useContext } from 'react';

import { buildRangeQuery } from '../../../../../../../foundation/contracts/kernel/responsive/breakpoints';
import { useMediaQuery } from '../../../../runtime/media-query';
import { ResponsiveContext } from '..';

const PHONE_QUERY = buildRangeQuery('xs', 'sm');

/**
 * Resolve only the phone breakpoint without retaining touch, orientation or
 * motion-preference runtimes. Uses the shared provider snapshot when present
 * and keeps the same provider-less fallback contract as `useBreakpoints`.
 */
export function usePhoneBreakpoint(): boolean {
  const responsiveContext = useContext(ResponsiveContext);
  const fallbackIsPhone = useMediaQuery(PHONE_QUERY);
  return responsiveContext?.isPhone ?? fallbackIsPhone;
}
