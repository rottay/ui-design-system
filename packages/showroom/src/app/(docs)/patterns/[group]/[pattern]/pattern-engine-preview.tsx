'use client';

import { EngineComparison } from '@/components/playground';
import { PatternPreview } from './pattern-preview';
import { SINGLE_RUNTIME_PATTERN_SLUGS } from './pattern-preview-fixtures';

export function PatternEnginePreview({ slug }: { slug: string }) {
  if (SINGLE_RUNTIME_PATTERN_SLUGS.has(slug)) {
    return <PatternPreview slug={slug} />;
  }

  return (
    <EngineComparison
      title="Pattern render check"
      description="Switch engines to re-render the same pattern, one engine at a time, with the active brand untouched."
    >
      <PatternPreview slug={slug} />
    </EngineComparison>
  );
}
