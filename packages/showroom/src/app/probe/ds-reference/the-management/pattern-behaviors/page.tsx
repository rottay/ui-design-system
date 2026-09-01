import { PatternBehaviorScene, type PatternBehaviorCase } from '../../sections/pattern-behaviors';
import { JudgeOverlay } from '../../judge';

const CASES: PatternBehaviorCase[] = [
  'live-feed-shell-continuity',
  'comment-thread-disclosure-truncation',
  'activity-log-diff-and-busy',
  'notification-center-row-actions',
  'filter-panel-collapsed-inert',
  'file-manager-locale-and-roving',
  'environment-toggle-menu-semantics',
  'pricing-table-comparison-semantics',
  'workspace-switcher-row-model',
  'empty-state-illustration-and-skeleton',
  'user-profile-card-grapheme-and-affordance',
  'cockpit-header-trail-and-posture',
  'workbench-header-skeleton-footprint',
  'decision-comparison-wrap-and-rtl',
  'record-facts-narrow-description',
];

export default async function PatternBehaviorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.only) ? params.only[0] : params.only;
  const only = (CASES as string[]).includes(raw ?? '')
    ? (raw as PatternBehaviorCase)
    : 'live-feed-shell-continuity';
  return (
    <>
      <JudgeOverlay searchParams={searchParams} />
      <PatternBehaviorScene only={only} />
    </>
  );
}
