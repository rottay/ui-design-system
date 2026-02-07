import type { EngineAwareProps } from '../../../../types';

export type ApiKeyManagerPreset = 'table' | 'cards';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  createdAt: string;
  lastUsed?: string;
  scopes?: string[];
  status: 'active' | 'revoked';
}

export interface ApiKeyManagerProps extends EngineAwareProps {
  preset?: ApiKeyManagerPreset;
  keys: ApiKey[];
  onCreate?: () => void;
  onRevoke?: (keyId: string) => void;
  onCopy?: (key: string) => void;
  scopes?: string[];
  className?: string;
  style?: React.CSSProperties;
}

export const API_KEY_MANAGER_DEFAULTS = {
  preset: 'table' as ApiKeyManagerPreset,
  keys: [],
};
