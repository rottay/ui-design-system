/**
 * Capture-time judging overlay, mounted by the SCENE PAGES rather than by the
 * ground layout.
 *
 * A Next.js layout cannot read searchParams — that is the same constraint that
 * forces the tenant to be static per segment. The judge mode is per-CAPTURE,
 * not per-tenant, so it belongs on the page, which can read them. Mounting it
 * in the layout silently did nothing, which is exactly how a recognition test
 * can appear to run while measuring nothing.
 */

import { judgeModeStyle, isJudgeMode, type JudgeMode } from '../ground/stamp';

export async function JudgeOverlay({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = typeof params.judge === 'string' ? params.judge : null;
  const mode: JudgeMode = isJudgeMode(raw) ? raw : 'none';
  const css = judgeModeStyle(mode);
  if (!css) return null;
  return <style data-testid="lab-judge-mode" data-judge={mode} dangerouslySetInnerHTML={{ __html: css }} />;
}
