import type { ReactNode } from 'react';
import type { TenantConfig } from '@rottay/design-system';
import {
  compileTenantThemeDocumentV2,
  documentThemeAdmission,
  mountTenantTheme,
  staticThemeIntent,
  type MountedTenantTheme,
} from '@rottay/design-system/server';

import { buildRootStampScript } from '../stamp/index.mjs';
import { GroundStage, type GroundStageProps } from '../stage';

type CompileInput = Parameters<typeof compileTenantThemeDocumentV2>[0];
type MountOptions = NonNullable<Parameters<typeof mountTenantTheme>[1]>;
type Vertical = CompileInput['verticalKey'];

/** The two lawful origins: the vertical's code-owned baseline, or a decision document. */
export type GroundSource =
  | { readonly kind: 'static'; readonly vertical?: Vertical }
  | {
      readonly kind: 'document';
      readonly vertical?: Vertical;
      readonly document: CompileInput['document'];
      readonly tenantId: string;
      readonly rowVersion?: number;
      readonly name?: string;
    };

export interface GroundRequest {
  readonly source: GroundSource;
  readonly slug: string;
  readonly mode: 'light' | 'dark';
  readonly locale?: MountOptions['locale'];
  readonly density?: MountOptions['density'];
  readonly viewport?: MountOptions['viewport'];
}

export interface Ground {
  /** A server value: its receipt is refused once copied across the flight boundary. */
  readonly mounted: MountedTenantTheme;
  readonly stamp: string;
  readonly stage: Omit<GroundStageProps, 'children' | 'styleTestId'>;
}

const DEFAULT_VERTICAL: Vertical = 'bithire';

export async function groundFor(request: GroundRequest): Promise<Ground> {
  const { source, slug, mode, locale = 'en', density, viewport } = request;
  const vertical = source.vertical ?? DEFAULT_VERTICAL;
  const options: MountOptions = {
    themeMode: mode,
    locale,
    ...(density ? { density } : {}),
    ...(viewport ? { viewport } : {}),
  };
  const stageBase = { vertical, mode, locale, ...(viewport ? { viewport } : {}) };

  if (source.kind === 'static') {
    const mounted = await mountTenantTheme(staticThemeIntent(vertical, slug), options);
    return {
      mounted,
      stamp: buildRootStampScript(mounted.rootAttributes),
      stage: { ...stageBase, tenantConfig: null, artifact: null, styleElements: mounted.styleElements },
    };
  }

  const { intent } = documentThemeAdmission({ vertical, slug, document: source.document });
  const { artifact } = compileTenantThemeDocumentV2({
    document: source.document,
    tenantId: source.tenantId,
    slug,
    verticalKey: vertical,
    rowVersion: source.rowVersion ?? 1,
  });
  const mounted = await mountTenantTheme(intent, { ...options, artifact });
  const name = source.name ?? slug;
  const tenantConfig: TenantConfig = {
    slug,
    name,
    vertical,
    theme: mode,
    plan: 'enterprise',
    features: ['*'],
    branding: { companyName: name },
  };
  return {
    mounted,
    stamp: buildRootStampScript(mounted.rootAttributes),
    stage: { ...stageBase, tenantConfig, artifact, styleElements: mounted.styleElements },
  };
}

export interface ProbeGroundProps {
  readonly request: GroundRequest;
  /** Prefix of the stamp's and the artifact styles' test ids. */
  readonly testId?: string;
  readonly children?: ReactNode;
}

/** A page cannot own `<html>`, so the stamp is the first element of the ground it renders. */
export async function ProbeGround({ request, testId = 'probe-ground', children }: ProbeGroundProps) {
  const ground = await groundFor(request);
  return (
    <>
      <script data-testid={`${testId}-stamp`} dangerouslySetInnerHTML={{ __html: ground.stamp }} />
      <GroundStage {...ground.stage} styleTestId={`${testId}-artifact-style`}>
        {children}
      </GroundStage>
    </>
  );
}
