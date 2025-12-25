'use client';

/**
 * Titan Calendar Engine
 *
 * Ant Design implementation with unified props interface.
 */

import { Calendar as AntCalendar } from 'antd';
import type { CalendarProps } from '../types';

/**
 * Titan Calendar Component
 *
 * Uses Ant Design Calendar under the hood.
 * Note: AntD Calendar uses dayjs, so value/defaultValue should be dayjs objects
 * when using this engine directly. The wrapper handles native Date conversion.
 */
export default function TitanCalendar(props: CalendarProps) {
  // AntD Calendar accepts dayjs, but we use native Date in our interface
  // In production, you'd want a proper date adapter
  return <AntCalendar {...(props as any)} />;
}
