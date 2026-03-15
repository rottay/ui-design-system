/**
 * W3WalletConnect - All Presets
 */

export { WizardW3WalletConnect } from './wizard';
export { ModalW3WalletConnect } from './modal';

import type { W3WalletConnectPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3WalletConnectProps } from '../core';
import { WizardW3WalletConnect } from './wizard';
import { ModalW3WalletConnect } from './modal';

export const W3_WALLET_CONNECT_PRESETS: Record<W3WalletConnectPreset, ComponentType<W3WalletConnectProps>> = {
  wizard: WizardW3WalletConnect,
  modal: ModalW3WalletConnect,
};
