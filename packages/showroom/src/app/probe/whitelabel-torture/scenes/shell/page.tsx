import { TortureFirstPaint, type TortureRouteProps } from '@/components/torture-first-paint';
import { TortureFrame } from '@/components/torture-sections/frame';
import { NavFbStates } from '@/components/torture-sections/nav';
import { HeadersFbStates } from '@/components/torture-sections/headers';
import { HeadersPatternsFbStates } from '@/components/torture-sections/headers-patterns';
import { NavigationPatternsFbStates } from '@/components/torture-sections/navigation-patterns';
import { WorkspaceChromeFbStates } from '@/components/torture-sections/workspace-chrome';
import { TenantBrandingStates } from '@/components/torture-sections/tenant-branding';

export default async function ShellScenePage({ searchParams }: TortureRouteProps) {
  const query = await searchParams;

  return (
    <>
      <TortureFirstPaint query={query} />
      <TortureFrame>
        <NavFbStates />
        <HeadersFbStates />
        <HeadersPatternsFbStates />
        <NavigationPatternsFbStates />
        <WorkspaceChromeFbStates />
        <TenantBrandingStates />
      </TortureFrame>
    </>
  );
}
