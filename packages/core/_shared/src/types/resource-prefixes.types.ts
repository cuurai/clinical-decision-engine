/**
 * Resource Prefix Types for Clinical Decision Engine
 *
 * Domain prefixes and resource ID formatting conventions.
 */

/**
 * Domain prefix for Clinical Decision Engine domains
 * @enum {string}
 */
export type DomainPrefix = "DEC" | "KNO" | "PAT" | "WOR" | "INT";

/**
 * Resource prefix mapping for ID generation
 */
export interface ResourcePrefixMapping {
  /** Normalized resource name (lowercase, alphanumeric) */
  resource: string;
  /** Original entity class/type name */
  entity: string;
  /**
   * Domain name
   * @enum {string}
   */
  domain: "decision-intelligence" | "knowledge-evidence" | "patient-clinical-data" | "workflow-care-pathways" | "integration-interoperability";
  /** Two-letter domain prefix */
  domainPrefix: DomainPrefix;
  /** Three-letter entity prefix (always exactly 3 characters) */
  prefix: string;
}

/**
 * Complete mapping of all resource prefixes
 */
export type ResourcePrefixMappings = ResourcePrefixMapping[];
