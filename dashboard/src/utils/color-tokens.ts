/**
 * Color Token Utilities
 *
 * Provides helper functions and mappings for working with color tokens
 * across the application, especially for domain-specific theming.
 */

export type DomainId =
  | "decision-intelligence"
  | "knowledge-evidence"
  | "patient-clinical-data"
  | "workflow-care-pathways"
  | "integration-interoperability";

export interface DomainColorTokens {
  color: string;
  colorLight: string;
  colorDark: string;
  colorHover: string;
}

/**
 * Maps domain IDs to their CSS variable names
 */
export const domainColorMap: Record<DomainId, DomainColorTokens> = {
  "decision-intelligence": {
    color: "var(--color-accent-decision-intelligence)",
    colorLight: "var(--color-accent-decision-intelligence-light)",
    colorDark: "var(--color-accent-decision-intelligence-dark)",
    colorHover: "var(--color-accent-decision-intelligence-hover)",
  },
  "knowledge-evidence": {
    color: "var(--color-accent-knowledge-evidence)",
    colorLight: "var(--color-accent-knowledge-evidence-light)",
    colorDark: "var(--color-accent-knowledge-evidence-dark)",
    colorHover: "var(--color-accent-knowledge-evidence-hover)",
  },
  "patient-clinical-data": {
    color: "var(--color-accent-patient-data)",
    colorLight: "var(--color-accent-patient-data-light)",
    colorDark: "var(--color-accent-patient-data-dark)",
    colorHover: "var(--color-accent-patient-data-hover)",
  },
  "workflow-care-pathways": {
    color: "var(--color-accent-workflow)",
    colorLight: "var(--color-accent-workflow-light)",
    colorDark: "var(--color-accent-workflow-dark)",
    colorHover: "var(--color-accent-workflow-hover)",
  },
  "integration-interoperability": {
    color: "var(--color-accent-integration)",
    colorLight: "var(--color-accent-integration-light)",
    colorDark: "var(--color-accent-integration-dark)",
    colorHover: "var(--color-accent-integration-hover)",
  },
};

/**
 * Gets the color tokens for a specific domain
 */
export function getDomainColors(domainId: DomainId): DomainColorTokens {
  return domainColorMap[domainId] || domainColorMap["decision-intelligence"];
}

/**
 * Gets the CSS class name for a domain
 */
export function getDomainClassName(domainId: DomainId): string {
  const classMap: Record<DomainId, string> = {
    "decision-intelligence": "domain-decision-intelligence",
    "knowledge-evidence": "domain-knowledge-evidence",
    "patient-clinical-data": "domain-patient-data",
    "workflow-care-pathways": "domain-workflow",
    "integration-interoperability": "domain-integration",
  };
  return classMap[domainId] || "domain-decision-intelligence";
}

/**
 * Converts a hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Creates an rgba color string with a specific opacity
 */
export function colorWithOpacity(hex: string, opacity: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Semantic color tokens
 */
export const semanticColors = {
  success: {
    color: "var(--color-success)",
    light: "var(--color-success-light)",
    dark: "var(--color-success-dark)",
    text: "var(--color-success-text)",
  },
  warning: {
    color: "var(--color-warning)",
    light: "var(--color-warning-light)",
    dark: "var(--color-warning-dark)",
    text: "var(--color-warning-text)",
  },
  error: {
    color: "var(--color-error)",
    light: "var(--color-error-light)",
    dark: "var(--color-error-dark)",
    text: "var(--color-error-text)",
  },
  info: {
    color: "var(--color-info)",
    light: "var(--color-info-light)",
    dark: "var(--color-info-dark)",
    text: "var(--color-info-text)",
  },
} as const;
