'use client';

import Link from 'next/link';
import { useMemo, type ComponentProps } from 'react';
import { useShowroom } from '@/components/showroom-context';
import { applyShowroomRuntimeQuery } from '@/components/runtime/query';

type ShowroomLinkProps = ComponentProps<typeof Link>;

export function ShowroomLink(props: ShowroomLinkProps) {
  const { linkQuery } = useShowroom();

  const href = useMemo(
    () =>
      typeof props.href === 'string'
        ? applyShowroomRuntimeQuery(props.href, linkQuery.tenant, linkQuery.engine)
        : props.href,
    [props.href, linkQuery.engine, linkQuery.tenant]
  );

  return <Link {...props} href={href} prefetch={props.prefetch ?? false} />;
}
