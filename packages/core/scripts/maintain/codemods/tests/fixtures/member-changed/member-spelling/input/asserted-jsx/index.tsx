import { TenantProvider, type TenantConfig } from '@rottay/design-system';
import { legacy } from '../foreign';

export const App = () => <TenantProvider config={legacy as TenantConfig}>{null}</TenantProvider>;
