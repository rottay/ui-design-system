# Web3 Module (dm-web3)

> **Blockchain integration: NFTs, tokens, wallets, and staking**

## What It Does

The Web3 module provides comprehensive blockchain integration supporting multiple chains (Ethereum, Polygon, Arbitrum, etc.). It handles token deployment and management, NFT minting for badges and certificates, wallet management (custodial and smart wallets), and staking pools.

The module supports both custodial wallets (platform-managed) and smart wallets using account abstraction. NFTs can represent event tickets, achievement badges, or verifiable certificates. Transaction management includes retry and cancellation capabilities.

## When to Use

- **Token Management**: Deploy and manage ERC-20 tokens
- **NFT Minting**: Create badges, certificates, tickets
- **Wallet Operations**: Manage user crypto wallets
- **Staking**: Deploy and manage staking pools
- **Transactions**: Submit and track blockchain transactions

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Token** | ERC-20 token |
| **NFT** | Non-fungible token (badge, certificate) |
| **Wallet** | User's blockchain wallet |
| **StakingPool** | Token staking pool |
| **Transaction** | Blockchain transaction |
| **SessionKey** | Temporary signing key |

## Documentation

| File | Content |
|------|---------|
| [USE-CASES.md](./USE-CASES.md) | All 46 use cases with descriptions |
| [ENTITIES.md](./ENTITIES.md) | Data schemas and relationships |

## Import

```typescript
// Tokens
import { makeDeployTokenUC, makeMintTokensUC, makeTransferTokensUC } from '@rottay/web3';

// NFTs
import { makeDeployCollectionUC, makeMintBadgeUC, makeMintCertificateUC } from '@rottay/web3';

// Wallets
import { makeCreateCustodialWalletUC, makeCreateSmartWalletUC, makeLinkExternalWalletUC } from '@rottay/web3';

// Staking
import { makeDeployPoolUC, makeStakeUC, makeClaimRewardsUC } from '@rottay/web3';
```

## Supported Chains

```typescript
type Chain =
  | 'ethereum'
  | 'polygon'
  | 'arbitrum'
  | 'optimism'
  | 'base'
  | 'avalanche';
```

## NFT Types

```typescript
type NFTType =
  | 'badge'       // Achievement badge
  | 'certificate' // Verifiable certificate
  | 'ticket'      // Event ticket
  | 'collectible';// General collectible
```

## REVIEW-2026: Result Pattern Migration

- **Status**: Complete -- ALL 46 use cases migrated (31 mutations + 15 queries)
- **Codebase**: ~150K LOC
- **Pattern**: All use cases return `Result<T>` using `createSuccessResult(data)` and `createErrorResult(code, message, details)` from `@rottay/core`
- **Previous pattern**: Mixed throwing errors and manual `{ success: true/false }` objects
- **Areas covered**: wallet, token, staking, nft, payment, transaction, session-key, analytics
- Mutations inherit from `BaseMutationUseCase`, queries from `BaseQueryUseCase`

## Session 2026-02-06 Changes

- **21 deprecated re-export shims deleted**: Legacy barrel re-exports that were kept for backward compatibility have been removed. All consumers now import directly from the canonical paths.
- **ESLint v9 flat config**: Migrated from `.eslintrc.json` to ESLint v9 flat config (`eslint.config.js`). Legacy `.eslintrc.json` deleted.

## Related Modules

- [Events](../events/) - NFT tickets
- [Payments](../payments/) - Crypto payments
