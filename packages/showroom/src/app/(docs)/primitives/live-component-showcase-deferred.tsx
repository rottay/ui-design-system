'use client';

import dynamic from 'next/dynamic';

import { ShowcaseLoading } from './showcase-loading';

const LiveComponentShowcase = dynamic(
  () =>
    import('@/components/live-component-showcase').then(
      (module) => module.LiveComponentShowcase
    ),
  {
    ssr: false,
    loading: () => <ShowcaseLoading />,
  }
);

export function LiveComponentShowcaseDeferred() {
  return <LiveComponentShowcase mode="compact" showIntro={false} />;
}
