/**
 * Shared Types - Main Export
 *
 * Auto-generated from OpenAPI common files
 * Generator: shared-types-generator v1.0.0
 *
 * This file re-exports types from generated shared type modules and adds
 * convenient type aliases for all shared schemas.
 *
 * ⚠️ DO NOT EDIT MANUALLY - this file is auto-generated
 */

import type { components, operations } from "./_master.types.js";

// ============================================================================
// Re-export all generated types
// ============================================================================

export type { components, operations };

// ============================================================================
// Convenient Type Aliases for Schemas
// ============================================================================

export type Account = components["schemas"]["Account"];
export type AccountId = components["schemas"]["AccountId"];
export type AccountStatus = components["schemas"]["AccountStatus"];
export type AccountType = components["schemas"]["AccountType"];
export type Amount = components["schemas"]["Amount"];
export type ApiKey = components["schemas"]["ApiKey"];
export type ApiKeyStatus = components["schemas"]["ApiKeyStatus"];
export type ApiListResponse = components["schemas"]["ApiListResponse"];
export type ApiResponse = components["schemas"]["ApiResponse"];
export type ChainId = components["schemas"]["ChainId"];
export type CorporateActionType = components["schemas"]["CorporateActionType"];
export type Currency = components["schemas"]["Currency"];
export type DataEnvelope = components["schemas"]["DataEnvelope"];
export type DistributionStatus = components["schemas"]["DistributionStatus"];
export type DnssecRequiredError = components["schemas"]["DnssecRequiredError"];
export type DomainPrefix = components["schemas"]["DomainPrefix"];
export type ErrorEnvelope = components["schemas"]["ErrorEnvelope"];
export type EscrowAccountId = components["schemas"]["EscrowAccountId"];
export type ListResponseEnvelope = components["schemas"]["ListResponseEnvelope"];
export type Locale = components["schemas"]["Locale"];
export type MilestoneStatus = components["schemas"]["MilestoneStatus"];
export type NullableTimestamp = components["schemas"]["NullableTimestamp"];
export type OfferingId = components["schemas"]["OfferingId"];
export type OfferingStatus = components["schemas"]["OfferingStatus"];
export type Org = components["schemas"]["Org"];
export type OrgId = components["schemas"]["OrgId"];
export type OrgMismatchError = components["schemas"]["OrgMismatchError"];
export type OrgStatus = components["schemas"]["OrgStatus"];
export type OrgUnverifiedError = components["schemas"]["OrgUnverifiedError"];
export type PageInfo = components["schemas"]["PageInfo"];
export type PageMeta = components["schemas"]["PageMeta"];
export type PageResponse = components["schemas"]["PageResponse"];
export type PagedDataEnvelope = components["schemas"]["PagedDataEnvelope"];
export type PayDirection = components["schemas"]["PayDirection"];
export type PayMethod = components["schemas"]["PayMethod"];
export type PayStatus = components["schemas"]["PayStatus"];
export type Percentage = components["schemas"]["Percentage"];
export type Problem = components["schemas"]["Problem"];
export type ProjectStatus = components["schemas"]["ProjectStatus"];
export type ProjectType = components["schemas"]["ProjectType"];
export type ResourcePrefixMapping = components["schemas"]["ResourcePrefixMapping"];
export type ResourcePrefixMappings = components["schemas"]["ResourcePrefixMappings"];
export type ResponseMeta = components["schemas"]["ResponseMeta"];
export type Rights = components["schemas"]["Rights"];
export type Role = components["schemas"]["Role"];
export type SubscriptionId = components["schemas"]["SubscriptionId"];
export type SubscriptionStatus = components["schemas"]["SubscriptionStatus"];
export type Timestamp = components["schemas"]["Timestamp"];
export type TokenStandard = components["schemas"]["TokenStandard"];
export type Tranche = components["schemas"]["Tranche"];
export type ValidationError = components["schemas"]["ValidationError"];
export type WalletId = components["schemas"]["WalletId"];
export type WebhookDomainMismatchError = components["schemas"]["WebhookDomainMismatchError"];

