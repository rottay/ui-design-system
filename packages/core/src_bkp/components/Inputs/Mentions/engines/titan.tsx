'use client';

/**
 * Titan Mentions Engine
 *
 * Ant Design implementation with unified props interface.
 */

import { Mentions as AntMentions } from 'antd';
import type { MentionsProps } from '../types';

/**
 * Map unified props to Ant Design Mentions props
 */
function mapToAntProps(props: MentionsProps) {
  const {
    options,
    optionRender,
    ...rest
  } = props;

  // Map options to AntD format
  const antOptions = options?.map((opt) => ({
    value: opt.value,
    label: opt.label,
    disabled: opt.disabled,
  }));

  return {
    ...rest,
    options: antOptions,
  };
}

/**
 * Titan Mentions Component
 *
 * Uses Ant Design Mentions under the hood.
 */
export default function TitanMentions(props: MentionsProps) {
  const antProps = mapToAntProps(props);
  return <AntMentions {...antProps} />;
}
