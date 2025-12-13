# Clinical Decision Engine Dashboard

A minimalist, responsive dashboard for managing and monitoring Clinical Decision Engine services, inspired by Google Cloud Platform UX.

## Features

- **Minimalist Design**: Clean, modern interface inspired by Google Cloud Platform
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Service Overview**: Browse all services organized by category
- **Resource Navigation**: Deep dive into service resources and endpoints
- **Full API Integration**: Complete CRUD operations for all backend resources
- **Type-Safe**: Built with TypeScript for type safety and better developer experience
- **Comprehensive Coverage**: All 200+ routes from the backend services are available

## Services

The dashboard displays five main service categories:

1. **Decision Intelligence** - AI-powered decision support, risk assessments, and recommendations
2. **Knowledge & Evidence** - Clinical rules, guidelines, ontologies, and evidence-based knowledge
3. **Patient Clinical Data** - Patient records, encounters, observations, and clinical documentation
4. **Workflow & Care Pathways** - Care plans, workflows, tasks, and care pathway management
5. **Integration & Interoperability** - External system integrations, FHIR/HL7 mappings, and data exchange

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
cd dashboard
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### API Configuration

The dashboard connects to the backend API. Configure the API base URL:

1. Create a `.env` file in the dashboard directory:

```bash
VITE_API_BASE_URL=http://localhost:3001
```

2. Or set it in your environment before running:

```bash
export VITE_API_BASE_URL=http://localhost:3001
npm run dev
```

The dashboard will automatically include the `X-Org-Id` header from `localStorage.getItem('orgId')` if available.

### Build

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
dashboard/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.tsx    # Main dashboard view
│   │   ├── ServiceCard.tsx  # Service card component
│   │   ├── ServiceDetail.tsx # Service detail view
│   │   ├── ResourceCard.tsx # Resource card component
│   │   ├── ResourceDetail.tsx # Resource detail view with API integration
│   │   └── Header.tsx        # Top navigation header
│   ├── config/
│   │   └── api.ts           # API client configuration
│   ├── services/
│   │   └── api.ts           # Generic resource service layer
│   ├── hooks/
│   │   └── useResource.ts   # React hook for resource operations
│   ├── types/
│   │   └── services.ts       # Service definitions and types (200+ resources)
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # Entry point
│   └── App.css              # Global styles
├── index.html               # HTML template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## Design System

The dashboard uses a GCP-inspired design system with:

- **Colors**: Primary blue (#4285F4), success green (#34A853), warning yellow (#FBBC04), error red (#EA4335)
- **Typography**: Google Sans-inspired font stack
- **Spacing**: Consistent 4px base unit spacing scale
- **Shadows**: Subtle elevation shadows for depth
- **Transitions**: Smooth 150-200ms transitions

## API Integration

The dashboard includes a comprehensive API service layer:

### Resource Service

All resources support full CRUD operations:

- `list(params?)` - List resources with pagination and filtering
- `get(id)` - Get a single resource by ID
- `create(data)` - Create a new resource
- `update(id, data)` - Update an existing resource
- `delete(id)` - Delete a resource

### Using the API

```typescript
import { createResourceService } from "./services/api";

// Create a service for a specific resource
const alertEvaluationsService = createResourceService("/alert-evaluations");

// List all alert evaluations
const result = await alertEvaluationsService.list({ limit: 10, offset: 0 });

// Get a specific alert evaluation
const item = await alertEvaluationsService.get("123");

// Create a new alert evaluation
const newItem = await alertEvaluationsService.create({ ...data });

// Update an alert evaluation
const updated = await alertEvaluationsService.update("123", { ...data });

// Delete an alert evaluation
await alertEvaluationsService.delete("123");
```

### React Hook

Use the `useResource` hook for React components:

```typescript
import { useResource } from "./hooks/useResource";

function MyComponent() {
  const { data, loading, error, create, update, remove } = useResource({
    serviceId: "decision-intelligence",
    resourceId: "alert-evaluations",
    autoFetch: true,
  });

  // Component implementation...
}
```

## Resource Coverage

The dashboard includes **all routes** from the backend services:

- **Decision Intelligence**: 33 resources (sessions, assessments, recommendations, models, simulations, etc.)
- **Knowledge & Evidence**: 33 resources (rules, guidelines, ontologies, value sets, etc.)
- **Patient Clinical Data**: 39 resources (patients, encounters, observations, medications, etc.)
- **Workflow & Care Pathways**: 33 resources (workflows, care plans, tasks, alerts, etc.)
- **Integration & Interoperability**: 33 resources (external systems, FHIR/HL7, integrations, etc.)

**Total: 171+ resources** covering all backend capabilities.

## Customization

To add or modify services, edit `src/types/services.ts`. Each service includes:

- ID, name, and description
- Icon and color
- Category (core, data, workflow, integration)
- List of resources with API paths

The API client automatically handles:

- Organization ID headers (`X-Org-Id`)
- Error handling and retries
- Request/response serialization
- TypeScript type safety

## License

Part of the Clinical Decision Engine project.
