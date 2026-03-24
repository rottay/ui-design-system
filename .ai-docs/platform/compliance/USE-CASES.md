# Compliance Module - Use Cases

> **Compliance: KYC, AML, GDPR, Healthcare, Gaming, Crypto, and more**

**Total: 159 use cases (96 mutations, 63 queries)**

---

## Quick Index

- [Overview](#overview)
- [KYC](#kyc) - Know Your Customer verification
- [KYC Extended](#kyc-extended) - Additional KYC operations
- [AML](#aml) - Anti-Money Laundering
- [GDPR](#gdpr) - General Data Protection Regulation
- [GDPR Extended](#gdpr-extended) - Additional GDPR operations
- [Healthcare](#healthcare) - HIPAA compliance
- [Gaming](#gaming) - Responsible gambling
- [Crypto](#crypto) - Cryptocurrency regulations
- [Banking](#banking) - Open Banking and PSD2
- [Consumer](#consumer) - Consumer privacy rights
- [HR-Employment](#hr-employment) - Employment compliance
- [Securities](#securities) - Securities regulations
- [Insurance](#insurance) - Insurance regulations
- [Breach Management](#breach-management) - Data breach handling
- [Entities](#entities)
- [Related](#related)

---

## Overview

The **Compliance Module** provides a comprehensive framework for regulatory compliance across multiple domains and jurisdictions. It handles identity verification (KYC), financial crime prevention (AML), data privacy (GDPR, CCPA), industry-specific regulations (Healthcare, Gaming, Crypto, Banking), and emerging compliance areas.

Key capabilities:
- **Identity Verification**: Document verification, biometric checks, and manual review workflows
- **Transaction Monitoring**: Real-time risk analysis, alert management, and suspicious activity reporting
- **Privacy Management**: Consent tracking, data subject requests, and data portability
- **Audit & Reporting**: Comprehensive audit trails, regulatory reporting, and compliance metrics

---

## Compliance Domains

| Domain | Mutations | Queries | Total | Description |
|--------|-----------|---------|-------|-------------|
| [KYC](#kyc) | 7 | 6 | 13 | Know Your Customer verification |
| [KYC Extended](#kyc-extended) | 5 | 5 | 10 | Additional verification and officer management |
| [AML](#aml) | 15 | 13 | 28 | Anti-Money Laundering detection and reporting |
| [GDPR](#gdpr) | 10 | 6 | 16 | EU data protection and privacy rights |
| [GDPR Extended](#gdpr-extended) | 3 | 7 | 10 | Deletion, portability, data export, and DSAR extensions |
| [Healthcare](#healthcare) | 7 | 2 | 9 | HIPAA compliance and PHI management |
| [Gaming](#gaming) | 11 | 6 | 17 | Responsible gambling, licensing, and reporting |
| [Crypto](#crypto) | 7 | 3 | 10 | Cryptocurrency regulations and Travel Rule |
| [Banking](#banking) | 6 | 2 | 8 | Open Banking, PSD2, and DORA |
| [Consumer](#consumer) | 6 | 3 | 9 | Consumer privacy rights (CCPA, etc.) |
| [HR-Employment](#hr-employment) | 8 | 4 | 12 | Employment background checks and classification |
| [Securities](#securities) | 8 | 5 | 13 | SEC, MiFID, and crowdfunding |
| [Insurance](#insurance) | 1 | 0 | 1 | Solvency II capital requirements |
| [Breach Management](#breach-management) | 2 | 1 | 3 | Data breach reporting and notifications |

---

## KYC

### Mutations
| Use Case | Factory | Description |
|----------|---------|-------------|
| initiate-verification | `makeInitiateVerificationUseCase()` | Initiates KYC verification process |
| submit-verification | `makeSubmitVerificationUseCase()` | Submits verification data |
| upload-document | `makeUploadDocumentUseCase()` | Uploads identity document |
| complete-manual-review | `makeCompleteManualReviewUseCase()` | Completes manual review |
| screen-user | `makeScreenUserUseCase()` | Screens user against watchlists |
| review-screening-match | `makeReviewScreeningMatchUseCase()` | Reviews screening match |
| assign-verification | `makeAssignVerificationUseCase()` | Assigns verification to officer |

### Queries
| Use Case | Factory | Description |
|----------|---------|-------------|
| kyc-status | `makeGetKYCStatusQuery()` | Gets user KYC status |
| kyc-required | `makeCheckKYCRequiredQuery()` | Checks if KYC is required |
| verification-session | `makeGetVerificationSessionQuery()` | Gets active verification session |
| pending-verifications | `makeGetPendingVerificationsQuery()` | Gets pending verifications |
| officer-workload | `makeGetOfficerWorkloadQuery()` | Gets officer workload |
| kyc-metrics | `makeGetKYCMetricsQuery()` | Gets KYC metrics |

---

## KYC Extended

### Mutations
| Use Case | Factory | Description |
|----------|---------|-------------|
| cancel-verification | `makeCancelVerificationUseCase()` | Cancels verification |
| rescreen-user | `makeRescreenUserUseCase()` | Rescreens existing user |
| request-manual-review | `makeRequestManualReviewUseCase()` | Requests manual review |
| unassign-verification | `makeUnassignVerificationUseCase()` | Unassigns verification |
| update-officer-capacity | `makeUpdateOfficerCapacityUseCase()` | Updates officer capacity |

### Queries
| Use Case | Factory | Description |
|----------|---------|-------------|
| verification-status | `makeGetVerificationStatusQuery()` | Gets verification status |
| verification-history | `makeGetVerificationHistoryQuery()` | Gets verification history |
| verification-sessions | `makeListVerificationSessionsQuery()` | Lists verification sessions |
| document-status | `makeGetDocumentStatusQuery()` | Gets document status |
| kyc-documents | `makeGetKYCDocumentsQuery()` | Gets user KYC documents |

---

## AML

### Mutations
| Use Case | Factory | Description |
|----------|---------|-------------|
| create-transaction | `makeCreateTransactionUseCase()` | Records transaction for analysis |
| analyze-transaction | `makeAnalyzeTransactionUseCase()` | Analyzes transaction for risk |
| create-alert | `makeCreateAMLAlertUseCase()` | Creates AML alert |
| review-alert | `makeReviewAlertUseCase()` | Reviews AML alert |
| create-rule | `makeCreateTransactionRuleUseCase()` | Creates detection rule |
| file-sar | `makeFileSARUseCase()` | Generates Suspicious Activity Report |
| bulk-update-transaction-status | `makeBulkUpdateTransactionStatusUseCase()` | Bulk flag/block/clear transactions |
| update-transaction-rule | `makeUpdateTransactionRuleUseCase()` | Updates an existing transaction monitoring rule |
| delete-transaction-rule | `makeDeleteTransactionRuleUseCase()` | Soft-deletes a transaction monitoring rule |
| update-sar | `makeUpdateSARUseCase()` | Updates SAR details, status, or narrative |
| delete-sar | `makeDeleteSARUseCase()` | Soft-deletes a SAR record |
| bulk-update-alert-status | `makeBulkUpdateAlertStatusUseCase()` | Bulk updates alert statuses |
| bulk-alert-operations | `makeBulkAlertOperationsUseCase()` | Bulk assign/escalate/close alerts |
| upload-alert-evidence | `makeUploadAlertEvidenceUseCase()` | Attaches evidence to an AML alert |
| delete-alert-evidence | `makeDeleteAlertEvidenceUseCase()` | Removes evidence from an AML alert |

### Queries
| Use Case | Factory | Description |
|----------|---------|-------------|
| transaction | `makeGetTransactionQuery()` | Gets transaction |
| alerts | `makeListAlertsQuery()` | Lists AML alerts |
| user-risk-profile | `makeGetUserRiskProfileQuery()` | Gets user risk profile |
| metrics | `makeGetAMLMetricsQuery()` | Gets AML metrics |
| list-transactions | `makeListTransactionsQuery()` | Paginated list of financial transactions with filtering and aggregate metrics |
| list-user-risk-profiles | `makeListUserRiskProfilesQuery()` | Paginated list of user risk profiles with risk level filtering |
| list-transaction-rules | `makeListTransactionRulesQuery()` | Paginated list of AML transaction monitoring rules |
| get-rule-triggers | `makeGetRuleTriggersQuery()` | Gets trigger history for a specific transaction rule |
| test-transaction-rule | `makeTestTransactionRuleQuery()` | Tests a transaction rule against sample data |
| list-sars | `makeListSARsQuery()` | Paginated list of Suspicious Activity Reports with filtering |
| get-sar-detail | `makeGetSARDetailQuery()` | Detailed view of a single SAR with timeline and related data |
| get-alert-detail | `makeGetAlertDetailQuery()` | Detailed view of a single AML alert with investigation context |
| list-alert-evidence | `makeListAlertEvidenceQuery()` | Lists evidence items attached to an AML alert |

---

## GDPR

### Mutations
| Use Case | Factory | Description |
|----------|---------|-------------|
| submit-dsar | `makeSubmitDsarUseCase()` | Submits Data Subject Access Request |
| assign-dsar | `makeAssignDsarUseCase()` | Assigns DSAR to handler |
| complete-dsar | `makeCompleteDsarUseCase()` | Completes DSAR processing |
| grant-consent | `makeGrantConsentUseCase()` | Records user consent |
| withdraw-consent | `makeWithdrawConsentUseCase()` | Withdraws consent |
| request-data-portability | `makeRequestDataPortabilityUseCase()` | Requests data portability |
| request-data-deletion | `makeRequestDataDeletionUseCase()` | Requests right to erasure |
| create-lia | `makeCreateLIAUseCase()` | Creates Legitimate Interest Assessment |
| approve-lia | `makeApproveLIAUseCase()` | Approves LIA |
| document-ropa | `makeDocumentROPAUseCase()` | Documents Records of Processing Activities |

### Queries
| Use Case | Factory | Description |
|----------|---------|-------------|
| list-dsars | `makeListDsarsQuery()` | Lists DSARs |
| dsar-status | `makeGetDSARStatusQuery()` | Gets DSAR status |
| consent-status | `makeGetConsentStatusQuery()` | Gets consent status |
| lia-status | `makeGetLIAStatusQuery()` | Gets LIA results |
| list-lias | `makeListLIAsQuery()` | Lists LIAs |
| list-ropas | `makeListROPAsQuery()` | Gets ROPA records |

---

## GDPR Extended

### Mutations
| Use Case | Factory | Description |
|----------|---------|-------------|
| process-data-deletion | `makeProcessDataDeletionUseCase()` | Processes data deletion |
| complete-portability-request | `makeCompletePortabilityRequestUseCase()` | Completes portability request |
| document-processing-activity | `makeDocumentProcessingActivityUseCase()` | Documents processing activity |

### Queries
| Use Case | Factory | Description |
|----------|---------|-------------|
| list-deletion-records | `makeListDeletionRecordsQuery()` | Lists deletion records |
| get-deletion-status | `makeGetDeletionStatusQuery()` | Gets deletion status |
| list-urgent-dsars | `makeListUrgentDSARsQuery()` | Lists urgent DSARs |
| get-portability-status | `makeGetPortabilityStatusQuery()` | Gets portability status |
| list-portability-requests | `makeListPortabilityRequestsQuery()` | Lists portability requests |
| get-data-export-status | `makeGetDataExportStatusUseCase()` | Gets data export request status |
| list-data-export-requests | `makeListDataExportRequestsUseCase()` | Lists all data export requests |

---

## Healthcare

### Mutations
| Use Case | Factory | Description |
|----------|---------|-------------|
| register-phi-record | `makeRegisterPHIRecordUseCase()` | Registers Protected Health Information |
| log-phi-access | `makeLogPHIAccessUseCase()` | Logs PHI access |
| process-access-request | `makeProcessAccessRequestUseCase()` | Processes access request |
| provide-accounting-of-disclosures | `makeProvideAccountingOfDisclosuresUseCase()` | Generates accounting of disclosures |
| report-hipaa-breach | `makeReportHIPAABreachUseCase()` | Reports HIPAA breach |
| notify-hhs | `makeNotifyHHSUseCase()` | Notifies HHS |
| complete-risk-assessment | `makeCompleteRiskAssessmentUseCase()` | Completes risk assessment |

### Queries
| Use Case | Factory | Description |
|----------|---------|-------------|
| get-phi-access-history | `makeGetPHIAccessHistoryQuery()` | Gets PHI access history |
| get-accounting-of-disclosures | `makeGetAccountingOfDisclosuresQuery()` | Gets accounting of disclosures |

---

## Gaming

### Mutations
| Use Case | Factory | Description |
|----------|---------|-------------|
| set-limit | `makeSetLimitUseCase()` | Sets betting/deposit limit |
| request-self-exclusion | `makeRequestSelfExclusionUseCase()` | Requests self-exclusion |
| trigger-reality-check | `makeTriggerRealityCheckUseCase()` | Triggers reality check |
| start-gameplay-session | `makeStartGameplaySessionUseCase()` | Starts gameplay session |
| end-gameplay-session | `makeEndGameplaySessionUseCase()` | Ends gameplay session |
| register-operator-license | `makeRegisterOperatorLicenseUseCase()` | Registers operator license |
| renew-operator-license | `makeRenewOperatorLicenseUseCase()` | Renews operator license |
| report-ggr | `makeReportGGRUseCase()` | Reports Gross Gaming Revenue |
| submit-rg-compliance-report | `makeSubmitRGComplianceReportUseCase()` | Submits RG compliance report |
| register-affiliate | `makeRegisterAffiliateUseCase()` | Registers affiliate |
| report-player-complaint | `makeReportPlayerComplaintUseCase()` | Reports player complaint |

### Queries
| Use Case | Factory | Description |
|----------|---------|-------------|
| get-active-limits | `makeGetActiveLimitsQuery()` | Gets active limits |
| get-exclusion-status | `makeGetExclusionStatusQuery()` | Gets exclusion status |
| get-limit-usage | `makeGetLimitUsageQuery()` | Gets limit usage |
| list-gameplay-sessions | `makeListGameplaySessionsQuery()` | Lists gameplay sessions |
| get-license-status | `makeGetLicenseStatusQuery()` | Gets licensing status |
| get-rg-compliance-metrics | `makeGetRGComplianceMetricsQuery()` | Gets RG compliance metrics |

---

## Crypto

### Mutations
| Use Case | Factory | Description |
|----------|---------|-------------|
| send-travel-rule-message | `makeSendTravelRuleMessageUseCase()` | Sends Travel Rule message |
| receive-travel-rule-message | `makeReceiveTravelRuleMessageUseCase()` | Receives Travel Rule message |
| screen-wallet | `makeScreenWalletUseCase()` | Screens wallets |
| register-counterparty-vasp | `makeRegisterCounterpartyVaspUseCase()` | Registers counterparty VASP |
| update-vasp-compliance | `makeUpdateVaspComplianceUseCase()` | Updates VASP compliance |
| update-mica-authorization | `makeUpdateMicaAuthorizationUseCase()` | Updates MiCA authorization |
| report-suspicious-transaction | `makeReportSuspiciousTransactionUseCase()` | Reports suspicious transaction |

### Queries
| Use Case | Factory | Description |
|----------|---------|-------------|
| get-travel-rule-status | `makeGetTravelRuleStatusQuery()` | Gets Travel Rule status |
| get-wallet-risk-history | `makeGetWalletRiskHistoryQuery()` | Gets wallet risk history |
| get-mica-authorization-status | `makeGetMicaAuthorizationStatusQuery()` | Gets MiCA status |

---

## Banking

### Mutations
| Use Case | Factory | Description |
|----------|---------|-------------|
| create-aisp-consent | `makeCreateAISPConsentUseCase()` | Creates AISP consent |
| create-pisp-consent | `makeCreatePISPConsentUseCase()` | Creates PISP consent |
| initiate-sca-challenge | `makeInitiateSCAChallengeUseCase()` | Initiates SCA challenge |
| submit-incident-report | `makeSubmitIncidentReportUseCase()` | Submits incident report |
| report-ict-incident | `makeReportICTIncidentUseCase()` | Reports ICT incident (DORA) |
| perform-resilience-test | `makePerformResilienceTestUseCase()` | Performs resilience test |

### Queries
| Use Case | Factory | Description |
|----------|---------|-------------|
| get-open-banking-consents | `makeGetOpenBankingConsentsQuery()` | Gets Open Banking consents |
| get-tpp-access-history | `makeGetTPPAccessHistoryQuery()` | Gets TPP access history |

---

## Consumer

### Mutations
| Use Case | Factory | Description |
|----------|---------|-------------|
| update-privacy-choices | `makeUpdatePrivacyChoicesUseCase()` | Updates privacy choices |
| process-do-not-sell-request | `makeProcessDoNotSellRequestUseCase()` | Processes Do Not Sell request |
| process-limit-sharing-request | `makeProcessLimitSharingRequestUseCase()` | Processes Limit Sharing request |
| record-consumer-consent | `makeRecordConsumerConsentUseCase()` | Records consumer consent |
| process-consumer-access-request | `makeProcessConsumerAccessRequestUseCase()` | Processes consumer access request |
| process-consumer-deletion-request | `makeProcessConsumerDeletionRequestUseCase()` | Processes consumer deletion request |

### Queries
| Use Case | Factory | Description |
|----------|---------|-------------|
| get-consumer-privacy-choices | `makeGetConsumerPrivacyChoicesQuery()` | Gets consumer privacy choices |
| get-consumer-request-status | `makeGetConsumerRequestStatusQuery()` | Gets consumer request status |
| get-data-sold-history | `makeGetDataSoldHistoryQuery()` | Gets data sold history |

---

## HR-Employment

### Mutations
| Use Case | Factory | Description |
|----------|---------|-------------|
| initiate-background-check | `makeInitiateBackgroundCheckUseCase()` | Initiates background check |
| record-authorization | `makeRecordAuthorizationUseCase()` | Records authorization |
| receive-report | `makeReceiveReportUseCase()` | Receives background check report |
| send-pre-adverse-action | `makeSendPreAdverseActionUseCase()` | Sends pre-adverse action notice |
| send-final-adverse-action | `makeSendFinalAdverseActionUseCase()` | Sends final adverse action |
| handle-dispute | `makeHandleDisputeUseCase()` | Handles dispute |
| record-assessment | `makeRecordAssessmentUseCase()` | Records employment assessment |
| classify-worker | `makeClassifyWorkerUseCase()` | Classifies worker type |

### Queries
| Use Case | Factory | Description |
|----------|---------|-------------|
| get-background-check-status | `makeGetBackgroundCheckStatusQuery()` | Gets background check status |
| list-pending-authorizations | `makeListPendingAuthorizationsQuery()` | Lists pending authorizations |
| list-pending-adverse-actions | `makeListPendingAdverseActionsQuery()` | Lists pending adverse actions |
| get-classification-history | `makeGetClassificationHistoryQuery()` | Gets classification history |

---

## Securities

### Mutations
| Use Case | Factory | Description |
|----------|---------|-------------|
| categorize-investor | `makeCategorizeInvestorUseCase()` | Categorizes investor (MiFID) |
| assess-suitability | `makeAssessSuitabilityUseCase()` | Assesses suitability |
| conduct-appropriateness-test | `makeConductAppropriatenessTestUseCase()` | Conducts appropriateness test |
| provide-best-execution | `makeProvideBestExecutionUseCase()` | Provides best execution |
| validate-investment-limits | `makeValidateInvestmentLimitsUseCase()` | Validates investment limits |
| record-investment | `makeRecordInvestmentUseCase()` | Records investment |
| file-form-d | `makeFileFormDUseCase()` | Files SEC Form D |
| update-accredited-status | `makeUpdateAccreditedStatusUseCase()` | Updates accredited status |

### Queries
| Use Case | Factory | Description |
|----------|---------|-------------|
| get-investor-profile | `makeGetInvestorProfileQuery()` | Gets investor profile |
| get-suitability-history | `makeGetSuitabilityHistoryQuery()` | Gets suitability history |
| get-annual-investment-total | `makeGetAnnualInvestmentTotalQuery()` | Gets annual investment total |
| check-investment-limit | `makeCheckInvestmentLimitQuery()` | Checks investment limit |
| verify-accredited-status | `makeVerifyAccreditedStatusQuery()` | Verifies accredited status |

---

## Insurance

### Mutations
| Use Case | Factory | Description |
|----------|---------|-------------|
| calculate-scr | `makeCalculateSCRUseCase()` | Calculates Solvency Capital Requirement |

---

## Breach Management

### Mutations
| Use Case | Factory | Description |
|----------|---------|-------------|
| report-data-breach | `makeReportDataBreachUseCase()` | Reports data breach |
| notify-authority | `makeNotifyAuthorityUseCase()` | Notifies regulatory authority |

### Queries
| Use Case | Factory | Description |
|----------|---------|-------------|
| active-breaches | `makeGetActiveBreachesQuery()` | Gets active breaches |

---

## Entities

| Entity | Description |
|--------|-------------|
| Verification | KYC verification session and results |
| Document | Identity document for verification |
| ScreeningMatch | Watchlist screening match |
| Officer | Compliance officer for manual reviews |
| Transaction | Financial transaction for AML analysis |
| Alert | AML alert for suspicious activity |
| Rule | Detection rule for transaction monitoring |
| SAR | Suspicious Activity Report |
| Consent | User consent record |
| DSAR | Data Subject Access Request |
| PhiRecord | Protected Health Information record |
| Breach | Data breach incident |
| Limit | Gambling limit (deposit, bet, loss) |
| Exclusion | Self-exclusion record |
| GameplaySession | Gaming session for tracking |
| Wallet | Cryptocurrency wallet for screening |
| VASP | Virtual Asset Service Provider |
| BankingConsent | Open Banking consent (AISP/PISP) |

---

## Related

| Module | Relationship |
|--------|-------------|
| [Auth](/platform/auth/USE-CASES.md) | User authentication for KYC workflows |
| [Users](/platform/users/USE-CASES.md) | User profile data for compliance checks |
| [Payments](/domain-modules/payments/USE-CASES.md) | Transaction data for AML monitoring |
| [Documents](/platform/documents/USE-CASES.md) | Document storage for KYC |
| [Notifications](/platform/notifications/USE-CASES.md) | Compliance alerts and notifications |
| [Audit](/platform/audit/USE-CASES.md) | Audit trail for compliance events |
| [Recruiter](/domain-modules/recruiter/USE-CASES.md) | AI hiring compliance integration |
| [Staff](/domain-modules/staff/USE-CASES.md) | HR employment compliance |
