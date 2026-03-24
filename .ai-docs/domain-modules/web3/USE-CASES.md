# dm-web3 - Use Cases

> **NFTs, Tokens, Blockchain, Staking**

**Total: 46 use cases (31 mutations, 15 queries) | 46 zero-arg factories (100% coverage)**

**REVIEW-2026 Result Pattern**: ALL 46 use cases migrated (31 mutations + 15 queries). Uses `createSuccessResult(data)` / `createErrorResult(code, message, details)` from `@rottay/core`. Areas: wallet, token, staking, nft, payment, transaction, session-key, analytics. ~150K LOC.

---

## Quick Index

- [Overview](#overview)
- [Mutations](#mutations)
  - [token](#token)
  - [nft](#nft)
  - [staking](#staking)
  - [transaction](#transaction)
  - [wallet](#wallet)
  - [payment](#payment)
  - [session-key](#session-key)
- [Queries](#queries)
  - [token](#token-1)
  - [nft](#nft-1)
  - [staking](#staking-1)
  - [wallet](#wallet-1)
  - [transaction](#transaction-1)
  - [analytics](#analytics)
- [Entities](#entities)
- [Supported Chains](#supported-chains)
- [Transaction Status](#transaction-status)
- [NFT Standards](#nft-standards)
- [Related](#related)

---

## Overview

The **dm-web3** module provides blockchain integration capabilities for the Rottay platform. It handles:

- **Token Management**: Deploy, mint, burn, and transfer ERC-20 tokens for company loyalty programs and rewards
- **NFT Operations**: Create and manage NFT collections for badges, certificates, tickets, and collectibles
- **Staking**: Deploy staking pools with configurable tiers, manage stakes, and distribute rewards
- **Wallet Management**: Create custodial wallets, smart wallets (Account Abstraction), and link external wallets
- **Crypto Payments**: On-ramp (fiat to crypto) and off-ramp (crypto to fiat) payment flows
- **Session Keys**: Manage session keys for gasless transactions and improved UX

---

## Mutations

### token
| Use Case | Description | Class |
|----------|-------------|-------|
| deploy | Deploy ERC-20 token | `DeployTokenUseCase` |
| mint | Mint tokens | `MintTokenUseCase` |
| burn | Burn tokens | `BurnTokenUseCase` |
| transfer | Transfer tokens | `TransferTokenUseCase` |
| approve | Approve allowance | `ApproveTokenUseCase` |

### nft
| Use Case | Description | Class |
|----------|-------------|-------|
| deploy-collection | Deploy NFT collection | `DeployCollectionUseCase` |
| mint-badge | Mint badge NFT | `MintBadgeUseCase` |
| mint-certificate | Mint certificate NFT | `MintCertificateUseCase` |
| burn-nft | Burn NFT | `BurnNftUseCase` |
| transfer-nft | Transfer NFT | `TransferNftUseCase` |
| verify-certificate | Verify certificate | `VerifyCertificateUseCase` |

### staking
| Use Case | Description | Class |
|----------|-------------|-------|
| deploy-pool | Deploy staking pool | `DeployPoolUseCase` |
| configure-tiers | Configure staking tiers | `ConfigureTiersUseCase` |
| stake | Stake tokens | `StakeUseCase` |
| unstake | Withdraw stake | `UnstakeUseCase` |
| claim-rewards | Claim rewards | `ClaimRewardsUseCase` |
| compound-rewards | Compound rewards | `CompoundRewardsUseCase` |

### transaction
| Use Case | Description | Class |
|----------|-------------|-------|
| submit | Submit transaction | `SubmitTransactionUseCase` |
| retry | Retry transaction | `RetryTransactionUseCase` |
| cancel | Cancel pending transaction | `CancelTransactionUseCase` |

### wallet
| Use Case | Description | Class |
|----------|-------------|-------|
| create-custodial | Create custodial wallet | `CreateCustodialWalletUseCase` |
| create-smart-wallet | Create smart wallet (AA) | `CreateSmartWalletUseCase` |
| link-external | Link external wallet | `LinkExternalWalletUseCase` |
| deactivate | Deactivate wallet | `DeactivateWalletUseCase` |
| set-primary | Set primary wallet | `SetPrimaryWalletUseCase` |
| verify | Verify wallet ownership | `VerifyWalletUseCase` |

### payment
| Use Case | Description | Class |
|----------|-------------|-------|
| create-onramp-session | Create on-ramp session | `CreateOnrampSessionUseCase` |
| create-offramp-session | Create off-ramp session | `CreateOfframpSessionUseCase` |
| handle-payment-webhook | Process payment webhook | `HandlePaymentWebhookUseCase` |

### session-key
| Use Case | Description | Class |
|----------|-------------|-------|
| create | Create session key | `CreateSessionKeyUseCase` |
| revoke | Revoke session key | `RevokeSessionKeyUseCase` |

---

## Queries

### token
| Use Case | Description | Class |
|----------|-------------|-------|
| get-balance | Get token balance | `GetTokenBalanceQuery` |
| get-by-company | Get company token | `GetTokenByCompanyQuery` |

### nft
| Use Case | Description | Class |
|----------|-------------|-------|
| get-badges-by-wallet | Get wallet badges | `GetBadgesByWalletQuery` |
| get-certificates-by-wallet | Get wallet certificates | `GetCertificatesByWalletQuery` |

### staking
| Use Case | Description | Class |
|----------|-------------|-------|
| get-pool-stats | Get pool statistics | `GetPoolStatsQuery` |
| get-position | Get staking position | `GetStakingPositionQuery` |
| list-pools | List available pools | `ListPoolsQuery` |

### wallet
| Use Case | Description | Class |
|----------|-------------|-------|
| get-by-id | Get wallet by ID | `GetWalletByIdQuery` |
| get-by-user | Get user wallets | `GetWalletsByUserQuery` |
| get-by-company | Get company wallets | `GetWalletsByCompanyQuery` |
| get-balances | Get wallet balances | `GetWalletBalancesQuery` |

### transaction
| Use Case | Description | Class |
|----------|-------------|-------|
| get-history | Get transaction history | `GetTransactionHistoryQuery` |

### analytics
| Use Case | Description | Class |
|----------|-------------|-------|
| holder-distribution | Get holder distribution | `HolderDistributionQuery` |
| staking-metrics | Get staking metrics | `StakingMetricsQuery` |
| transaction-volume | Get transaction volume | `TransactionVolumeQuery` |

---

## Entities

| Entity | Description |
|--------|-------------|
| `Token` | ERC-20 token deployed by a company |
| `NFTCollection` | NFT collection (badges, certificates, tickets) |
| `NFT` | Individual NFT within a collection |
| `StakingPool` | Staking pool configuration and state |
| `StakingPosition` | User's stake in a pool |
| `StakingTier` | Tier configuration with rewards multiplier |
| `Wallet` | User or company blockchain wallet |
| `Transaction` | Blockchain transaction record |
| `SessionKey` | Temporary key for gasless transactions |

---

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

---

## Transaction Status

```typescript
type TransactionStatus =
  | 'pending'
  | 'submitted'
  | 'confirming'
  | 'confirmed'
  | 'failed'
  | 'cancelled';
```

---

## NFT Standards

```typescript
type NFTStandard =
  | 'ERC721'     // Standard NFT
  | 'ERC1155';   // Multi-token

type NFTType =
  | 'badge'        // Achievement badge
  | 'certificate'  // Verifiable certificate
  | 'ticket'       // Event ticket
  | 'collectible'; // General collectible
```

---

## Related

### dm-events
- **NFT Tickets**: Event tickets can be minted as NFTs using `mint-badge` or dedicated ticket NFT types
- **Check-in Verification**: NFT ticket ownership verified during event check-in
- **Live Session Tips**: Tips can be sent using tokens via `transfer` use case

### dm-payments
- **On-ramp/Off-ramp**: Crypto payment flows coordinated with `CryptoOrchestrator`
- **Payment Webhooks**: Web3 module handles crypto payment webhooks from providers (MoonPay, Transak)
- **Subscription Payments**: Token-based subscriptions can use staking rewards
