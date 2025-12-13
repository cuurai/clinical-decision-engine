# Color Token System

This document describes the comprehensive color token system used throughout the cuur.ai dashboard for consistent theming and styling.

## Overview

The color token system is built on CSS custom properties (CSS variables) defined in `src/App.css`. This allows for:

- Consistent theming across all components
- Easy theme switching (light/dark modes)
- Domain-specific color theming
- Maintainable color management

## Token Categories

### 1. Base Colors

Base colors define the fundamental color palette for backgrounds, surfaces, and borders.

```css
--color-bg-primary: #1e1e1e; /* Main background */
--color-bg-secondary: #2d2e30; /* Secondary background */
--color-surface: #2d2e30; /* Card/panel backgrounds */
--color-surface-hover: #3c4043; /* Hover state */
--color-border: #3c4043; /* Borders */
```

### 2. Text Colors

Text colors provide a hierarchy for readability.

```css
--color-text-primary: #e8eaed; /* Main text (white) */
--color-text-secondary: #bdc1c6; /* Secondary text (light grey) */
--color-text-tertiary: #9aa0a6; /* Tertiary text (lighter grey) */
--color-text-disabled: #5f6368; /* Disabled text */
```

### 3. Domain/Service Accent Colors

Each domain has its own accent color with light, dark, and hover variants:

#### Decision Intelligence (Pink/Magenta)

```css
--color-accent-decision-intelligence: #f48fb1;
--color-accent-decision-intelligence-light: rgba(244, 143, 177, 0.15);
--color-accent-decision-intelligence-dark: #e91e63;
--color-accent-decision-intelligence-hover: rgba(244, 143, 177, 0.25);
```

#### Knowledge & Evidence (Green)

```css
--color-accent-knowledge-evidence: #81c995;
--color-accent-knowledge-evidence-light: rgba(129, 201, 149, 0.15);
--color-accent-knowledge-evidence-dark: #4caf50;
--color-accent-knowledge-evidence-hover: rgba(129, 201, 149, 0.25);
```

#### Patient Clinical Data (Blue)

```css
--color-accent-patient-data: #64b5f6;
--color-accent-patient-data-light: rgba(100, 181, 246, 0.15);
--color-accent-patient-data-dark: #2196f3;
--color-accent-patient-data-hover: rgba(100, 181, 246, 0.25);
```

#### Workflow & Care Pathways (Teal)

```css
--color-accent-workflow: #4dd0e1;
--color-accent-workflow-light: rgba(77, 208, 225, 0.15);
--color-accent-workflow-dark: #00bcd4;
--color-accent-workflow-hover: rgba(77, 208, 225, 0.25);
```

#### Integration & Interoperability (Orange/Yellow)

```css
--color-accent-integration: #ffb74d;
--color-accent-integration-light: rgba(255, 183, 77, 0.15);
--color-accent-integration-dark: #ff9800;
--color-accent-integration-hover: rgba(255, 183, 77, 0.25);
```

### 4. Semantic Colors

Semantic colors convey meaning (success, warning, error, info):

```css
--color-success: #81c995;
--color-warning: #ffb74d;
--color-error: #f28b82;
--color-info: #64b5f6;
```

Each semantic color has `-light`, `-dark`, and `-text` variants.

### 5. Component-Specific Colors

#### Buttons

```css
--color-button-primary-bg: #1a73e8;
--color-button-primary-bg-hover: #1557b0;
--color-button-primary-text: #ffffff;
```

#### Badges & Notifications

```css
--color-badge-bg: var(--color-error);
--color-badge-text: #ffffff;
```

#### User Avatar

```css
--color-avatar-bg: linear-gradient(135deg, var(--color-primary) 0%, var(--color-purple) 100%);
--color-avatar-text: #ffffff;
```

## Usage Examples

### Using Domain Colors

#### In CSS

```css
.service-card {
  background-color: var(--color-accent-decision-intelligence-light);
  border-left: 3px solid var(--color-accent-decision-intelligence);
}

.service-card:hover {
  background-color: var(--color-accent-decision-intelligence-hover);
}
```

#### Using Utility Classes

```jsx
<div className="domain-decision-intelligence">
  <div style={{ backgroundColor: "var(--domain-color-light)" }}>Content</div>
</div>
```

#### In TypeScript/React

```typescript
import { getDomainColors, getDomainClassName } from "../utils/color-tokens";

const colors = getDomainColors("decision-intelligence");
const className = getDomainClassName("decision-intelligence");

// Use in inline styles or className
<div className={className} style={{ color: colors.color }}>
  Content
</div>;
```

### Using Semantic Colors

```css
.alert-success {
  background-color: var(--color-success-light);
  color: var(--color-success);
  border: 1px solid var(--color-success-dark);
}

.alert-error {
  background-color: var(--color-error-light);
  color: var(--color-error);
  border: 1px solid var(--color-error-dark);
}
```

### Using Component Colors

```css
.btn-primary {
  background-color: var(--color-button-primary-bg);
  color: var(--color-button-primary-text);
}

.btn-primary:hover {
  background-color: var(--color-button-primary-bg-hover);
}
```

## Best Practices

1. **Always use tokens**: Never hardcode color values. Use CSS variables instead.

2. **Use semantic names**: Choose tokens that describe purpose, not appearance.

   - ✅ `var(--color-text-primary)`
   - ❌ `var(--color-white)`

3. **Leverage domain utilities**: Use `getDomainColors()` and `getDomainClassName()` for domain-specific theming.

4. **Maintain consistency**: Use the same token for the same purpose across components.

5. **Consider accessibility**: Ensure sufficient contrast ratios when combining colors.

## Color Token Utilities

The `src/utils/color-tokens.ts` file provides helper functions:

- `getDomainColors(domainId)`: Returns color tokens for a domain
- `getDomainClassName(domainId)`: Returns CSS class name for a domain
- `hexToRgb(hex)`: Converts hex to RGB
- `colorWithOpacity(hex, opacity)`: Creates rgba color with opacity
- `semanticColors`: Object with semantic color tokens

## Adding New Colors

When adding new colors:

1. Add the token to `:root` in `src/App.css`
2. Follow the naming convention: `--color-{category}-{variant}`
3. Include variants (light, dark, hover) if needed
4. Update this documentation
5. Consider adding utility functions if needed

## Theme Switching (Future)

The token system is designed to support theme switching. To add a light theme:

1. Create a `[data-theme="light"]` selector
2. Override color tokens with light theme values
3. Toggle the `data-theme` attribute on the root element

Example:

```css
[data-theme="light"] {
  --color-bg-primary: #ffffff;
  --color-text-primary: #202124;
  /* ... other overrides */
}
```
