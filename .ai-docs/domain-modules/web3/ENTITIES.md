# dm-web3 - Entities

> **Entidades del módulo Web3**

---

## Entidades Principales

### Wallet

```typescript
interface Wallet {
  id: string;
  tenantId: string;
  userId?: string;
  companyId?: string;
  address: string;
  type: WalletType;
  chain: Chain;
  status: WalletStatus;
  isPrimary: boolean;
  label?: string;
  provider?: string;        // For custodial wallets
  encryptedPrivateKey?: string;
  smartWalletAddress?: string;
  metadata: Record<string, unknown>;
  verifiedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type WalletType =
  | 'custodial'      // Platform-managed
  | 'external'       // User-owned
  | 'smart_wallet';  // Account Abstraction

type WalletStatus =
  | 'pending'
  | 'active'
  | 'deactivated';
```

### Token

```typescript
interface Token {
  id: string;
  tenantId: string;
  companyId: string;
  name: string;
  symbol: string;
  decimals: number;
  chain: Chain;
  contractAddress: string;
  totalSupply: string;
  maxSupply?: string;
  type: TokenType;
  deployedAt: Date;
  deployerAddress: string;
  transactionHash: string;
  metadata: {
    description?: string;
    website?: string;
    logoUrl?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type TokenType =
  | 'utility'
  | 'governance'
  | 'reward';
```

### NFTCollection

```typescript
interface NFTCollection {
  id: string;
  tenantId: string;
  companyId: string;
  name: string;
  symbol: string;
  chain: Chain;
  contractAddress: string;
  standard: NFTStandard;
  type: NFTType;
  baseUri: string;
  maxSupply?: number;
  totalMinted: number;
  royaltyBps: number;        // Basis points (e.g., 250 = 2.5%)
  royaltyRecipient: string;
  deployedAt: Date;
  deployerAddress: string;
  transactionHash: string;
  metadata: {
    description?: string;
    imageUrl?: string;
    externalUrl?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### NFTBadge

ERC-1155 badge NFTs with expiration and transferability.

```typescript
interface NFTBadge {
  id: string;
  tenantId: string;
  collectionId: string;
  tokenId: string;
  ownerAddress: string;
  mintedTo: string;
  quantity: number;
  metadata: NFTBadgeMetadata;
  expiresAt?: Date;
  isTransferable: boolean;
  mintedAt: Date;
  mintTransactionHash: string;
  burnedAt?: Date;
  burnTransactionHash?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface NFTBadgeMetadata {
  name: string;
  description: string;
  image: string;
  externalUrl?: string;
  attributes: NFTAttribute[];
  badgeType: 'achievement' | 'membership' | 'access' | 'reward';
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface NFTAttribute {
  traitType: string;
  value: string | number;
  displayType?: 'number' | 'date' | 'boost_percentage';
}
```

### NFTCertificate

ERC-721 certificate NFTs with verification.

```typescript
interface NFTCertificate {
  id: string;
  tenantId: string;
  collectionId: string;
  tokenId: string;
  ownerAddress: string;
  mintedTo: string;
  metadata: NFTCertificateMetadata;
  mintedAt: Date;
  mintTransactionHash: string;
  burnedAt?: Date;
  burnTransactionHash?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface NFTCertificateMetadata {
  name: string;
  description: string;
  image: string;
  externalUrl?: string;
  attributes: NFTAttribute[];
  issuedTo: string;
  issuedBy: string;
  issuedAt: Date;
  validUntil?: Date;
  certificateType: 'completion' | 'attendance' | 'achievement' | 'license';
  certificateHash: string;
  verificationUrl?: string;
}
```

### StakingPool

```typescript
interface StakingPool {
  id: string;
  tenantId: string;
  companyId: string;
  name: string;
  chain: Chain;
  contractAddress: string;
  stakingTokenId: string;
  rewardTokenId: string;
  totalStaked: string;
  rewardRate: string;        // Tokens per second
  startTime: Date;
  endTime?: Date;
  minStake?: string;
  maxStake?: string;
  lockPeriodDays: number;
  tiers: StakingTier[];
  deployedAt: Date;
  transactionHash: string;
  status: StakingPoolStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

type StakingPoolStatus =
  | 'active'
  | 'paused'
  | 'ended';

interface StakingTier {
  name: string;
  minStake: string;
  multiplier: number;
  benefits: string[];
}
```

### StakingPosition

```typescript
interface StakingPosition {
  id: string;
  tenantId: string;
  poolId: string;
  userId: string;
  walletAddress: string;
  amount: string;
  tier: string;
  pendingRewards: string;
  claimedRewards: string;
  stakedAt: Date;
  unlockAt: Date;
  lastClaimAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Transaction

```typescript
interface Transaction {
  id: string;
  tenantId: string;
  userId?: string;
  type: TransactionType;
  chain: Chain;
  hash?: string;
  status: TransactionStatus;
  from: string;
  to: string;
  value: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: number;
  blockNumber?: number;
  blockHash?: string;
  confirmations: number;
  error?: string;
  metadata: Record<string, unknown>;
  submittedAt?: Date;
  confirmedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type TransactionType =
  | 'token_mint'
  | 'token_transfer'
  | 'token_burn'
  | 'nft_mint'
  | 'nft_transfer'
  | 'nft_burn'
  | 'stake'
  | 'unstake'
  | 'claim_rewards'
  | 'contract_deploy'
  | 'contract_interaction';
```

### SessionKey

```typescript
interface SessionKey {
  id: string;
  tenantId: string;
  userId: string;
  walletId: string;
  publicKey: string;
  permissions: SessionKeyPermission[];
  expiresAt: Date;
  revokedAt?: Date;
  usageCount: number;
  maxUsage?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface SessionKeyPermission {
  contractAddress: string;
  functionSelector: string;
  maxValue?: string;
  rateLimit?: number;
}
```

### PaymentSession

On-ramp/off-ramp payment sessions for crypto purchases.

```typescript
interface PaymentSession {
  id: string;
  tenantId: string;
  userId: string;
  provider: 'moonpay' | 'transak' | 'ramp';
  type: 'on_ramp' | 'off_ramp';
  status: PaymentSessionStatus;
  fiatAmount: number;
  fiatCurrency: string;
  cryptoAmount?: string;
  cryptoAsset: string;
  chain: string;
  walletAddress: string;
  exchangeRate?: number;
  fees?: {
    network: number;
    provider: number;
    platform: number;
    total: number;
  };
  externalId?: string;
  widgetUrl?: string;
  transactionHash?: string;
  completedAt?: Date;
  failedAt?: Date;
  errorCode?: string;
  errorMessage?: string;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type PaymentSessionStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'processing'
  | 'confirming'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired';
```

---

## Relaciones

```
User           1──*  Wallet
Company        1──*  Wallet
Company        1──*  Token
Company        1──*  NFTCollection
NFTCollection  1──*  NFTBadge
NFTCollection  1──*  NFTCertificate
Company        1──*  StakingPool
StakingPool    1──*  StakingPosition
User           1──*  StakingPosition
Wallet         1──*  Transaction
Wallet         1──*  SessionKey
User           1──*  PaymentSession
```

---

## Database Tables

Schema files located in `dm-web3/adapters/out/persistence/schemas/`.

| Entity | DB Table | Key Columns | Notes |
|--------|----------|-------------|-------|
| Wallet | `crypto_wallets` | id, tenant_id, company_id, user_id, address, chain_id, chain_type, type, provider, is_primary, encrypted_private_key, smart_account_address, eoa_address, verified_at, is_active, deleted_at | Unique on (tenant_id, address, chain_id). Types: custodial, smart_wallet, external, mpc. |
| WalletSession | `crypto_wallet_sessions` | id, tenant_id, wallet_id (FK -> crypto_wallets), signer_address, session_key_address, permissions (JSON), approved_targets (JSON), native_token_limit_wei, valid_from, valid_until, max_usage_count, usage_count, is_active, revoked_at | Smart wallet session keys with granular permissions and time-limited validity. FK cascade on wallet_id. |
| TenantToken | `crypto_tenant_tokens` | id, tenant_id, company_id, contract_address, chain_id, name, symbol, decimals, initial_supply_wei, max_supply_wei, current_supply_wei, is_mintable, is_burnable, is_pausable, status, deployment_tx_hash, deployed_at, deleted_at | ERC-20 tokens. Unique on (contract_address, chain_id). |
| StakingPool | `staking_pools` | id, tenant_id, company_id, contract_address, chain_id, name, staking_token_id (FK -> crypto_tenant_tokens), reward_token_id (FK), total_staked_wei, reward_rate_per_second_wei, min_stake_amount_wei, pool_cap_wei, is_compounding_enabled, status, starts_at, ends_at, total_stakers_count, deleted_at | Unique on (contract_address, chain_id). FK restrict on staking_token_id. |
| StakingTier | `staking_tiers` | id, tenant_id, pool_id (FK -> staking_pools), tier_id, name, apy_bps, lock_days, minimum_stake_wei, maximum_stake_wei, bonus_multiplier_bps, total_staked_wei, stakers_count, is_active | FK cascade on pool_id. APY in basis points (500 = 5%). |
| StakingPosition | `staking_positions` | id, tenant_id, pool_id (FK), tier_id (FK -> staking_tiers), wallet_id (FK -> crypto_wallets), chain_id, amount_wei, reward_debt_wei, staked_at_unix, unlock_at_unix, total_claimed_wei, unstake_status, stake_tx_hash, is_active | FK cascade on pool_id and wallet_id. FK restrict on tier_id. |
| NFTCollection | `nft_collections` | id, tenant_id, company_id, contract_address, chain_id, name, symbol, collection_type, token_standard, is_soulbound, is_transferable, has_royalties, royalty_bps, max_supply, total_minted, total_burned, admin_address, status, is_active, deleted_at | Unique on (contract_address, chain_id). Types: badges (ERC-1155), certificates (ERC-721). |
| NFTBadge | `nft_badges` | id, tenant_id, collection_id (FK -> nft_collections), wallet_id (FK -> crypto_wallets), token_id, amount, chain_id, badge_type, name, tier, rarity, points, expires_at, mint_tx_hash, mint_block_number, is_active, burned_at | ERC-1155 badges. FK cascade on collection_id and wallet_id. |
| NFTCertificate | `nft_certificates` | id, tenant_id, collection_id (FK -> nft_collections), wallet_id (FK -> crypto_wallets), token_id, chain_id, certificate_type, name, recipient_name, issuer_name, issued_at, valid_until, verification_code, is_soulbound, is_revoked, is_active, burned_at | ERC-721 certificates. Unique on (collection_id, token_id) and (tenant_id, verification_code). |
| CryptoTransaction | `crypto_transactions` | id, tenant_id, company_id, wallet_id (FK -> crypto_wallets), chain_id, transaction_hash, block_number, type, status, from_address, to_address, value_wei, gas_limit, gas_used, is_sponsored, confirmations, error_message, retry_count, related_entity_type, related_entity_id | Unique on transaction_hash. Types: transfer, mint, burn, stake, unstake, deploy_*, etc. |
| CryptoOnrampSession | `crypto_onramp_sessions` | id, tenant_id, company_id, user_id, wallet_id (FK -> crypto_wallets), session_type, provider, provider_session_id, fiat_currency, fiat_amount, crypto_currency, crypto_amount, chain_id, wallet_address, status, tx_hash, expires_at | On-ramp/off-ramp fiat-crypto sessions. Providers: moonpay, transak, ramp, stripe. FK cascade on wallet_id. |
