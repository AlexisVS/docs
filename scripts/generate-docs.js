#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration based on your actual structure
const config = {
    srcPath: '../../agves_app/src',
    docsPath: '.',
    modules: [
        {
            name: 'authorization',
            entities: ['permission', 'role'],
            hasServices: true,
            hasTests: true
        },
        {
            name: 'financial',
            entities: ['account', 'transaction'],
            hasServices: false,
            hasTests: false
        },
        {
            name: 'identity',
            entities: ['identity', 'identity-phone', 'identity-street', 'identity-property'],
            hasServices: false,
            hasTests: false
        },
        {
            name: 'sales',
            entities: [
                'attribute', 'attribute-category', 'attribute-value',
                'cart', 'cart-item', 'customer', 'order',
                'product', 'service', 'shop', 'shop-item', 'shop-item-category'
            ],
            hasServices: false,
            hasTests: false
        },
        {
            name: 'school',
            entities: ['school-class', 'student'],
            hasServices: false,
            hasTests: false
        }
    ]
};

// Generate all documentation
const generateAllDocs = async () => {
    console.log('🚀 Starting documentation generation...');

    try {
        // Create directory structure
        await createDirectoryStructure();

        // Generate core architecture docs
        await generateArchitectureDocs();

        // Generate module documentation
        await generateModuleDocs();

        // Generate component documentation
        await generateComponentDocs();

        // Generate API reference
        await generateApiReference();

        // Update navigation in docs.json
        await updateDocsConfig();

        console.log('✅ Documentation generation completed successfully!');
        console.log('📚 Run `mintlify dev` to preview your documentation');

    } catch (error) {
        console.error('❌ Error generating documentation:', error);
        process.exit(1);
    }
};

const createDirectoryStructure = async () => {
    const dirs = [
        'architecture',
        'frontend',
        'backend',
        'modules',
        'components',
        'testing',
        'api-reference'
    ];

    // Create module subdirectories
    config.modules.forEach(module => {
        dirs.push(`modules/${module.name}`);
        dirs.push(`api-reference/${module.name}`);
    });

    dirs.forEach(dir => {
        const fullPath = path.join(config.docsPath, dir);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, {recursive: true});
        }
    });
};

const generateArchitectureDocs = async () => {
    // Architecture Overview
    const architectureOverview = `---
title: "Architecture Overview"
description: "High-level overview of the AGVES application architecture and design principles"
---

## Architecture Philosophy

AGVES follows an **entity-driven architecture** that prioritizes:

- **Business Logic Clarity**: Each entity encapsulates its domain logic
- **Type Safety**: End-to-end TypeScript with Laravel-generated types
- **Loose Coupling**: Dependency injection for service management
- **Event-Driven Communication**: Reactive updates across the system

## System Components

<CardGroup cols={2}>
  <Card title="Frontend (Next.js 15)" icon="react">
    - App Router with dynamic routing
    - Entity-aware components
    - Real-time form validation
    - Multi-language support
  </Card>
  <Card title="Backend (Laravel)" icon="server">
    - RESTful API endpoints
    - Type generation for frontend
    - Role-based authorization
    - Event broadcasting
  </Card>
</CardGroup>

## Key Design Patterns

### Entity-Driven Development
Every business concept is modeled as an entity with:
- Standardized CRUD operations
- Automatic form generation
- Relationship management
- Internationalization support

### Dependency Injection
Services are managed through InversifyJS container for:
- Testability and mocking
- Environment-specific implementations
- Loose coupling between components

### Event-Driven Architecture
Events flow through the system to:
- Maintain data consistency
- Enable reactive UI updates
- Decouple business logic

## Module Structure

Each business module follows a consistent pattern:

\`\`\`
modules/[module]/
├── [module].tsx           # Module configuration
├── index.tsx              # Exports
├── entities/              # Entity definitions
├── i18n/                  # Translations
├── services/              # Business logic (optional)
└── __tests__/             # Tests (optional)
\`\`\`

## Next Steps

Explore specific architectural components:
- [Entity System](/architecture/entity-system)
- [Dependency Injection](/architecture/dependency-injection)
- [Event System](/architecture/event-system)
- [Internationalization](/architecture/internationalization)
`;

    // Write architecture overview
    fs.writeFileSync(path.join(config.docsPath, 'architecture/overview.mdx'), architectureOverview);

    // Entity System Documentation
    const entitySystemDoc = `---
title: "Entity System"
description: "Understanding the entity-driven architecture and how entities are managed across the application"
---

## Overview

The AGVES application is built around an **entity-driven architecture** where business logic is organized around entities with standardized patterns for CRUD operations, relationships, and event handling.

## Entity Structure

Every entity in the system follows a consistent pattern:

\`\`\`
modules/[module]/
├── entities/
│   └── [entity-name].tsx     # Entity definition with fields, relationships
├── i18n/
│   └── entities/
│       └── [entity-name].ts  # Translations for the entity
└── services/                 # Optional business logic services
\`\`\`

## Entity Definition Pattern

\`\`\`typescript
// modules/authorization/entities/permission.tsx
import { Entity } from '@/lib/entity/entity';

export const PermissionEntity = Entity.create('permission', {
  module: 'authorization',
  fields: {
    id: { type: 'number', primary: true },
    name: { type: 'string', required: true },
    description: { type: 'string', nullable: true },
    module: { type: 'string', nullable: true }
  },
  relationships: {
    roles: {
      type: 'belongsToMany',
      entity: 'role',
      module: 'authorization'
    }
  }
});
\`\`\`

## Available Modules

<CardGroup cols={2}>
${config.modules.map(module => `  <Card
    title="${module.name.charAt(0).toUpperCase() + module.name.slice(1)}"
    href="/modules/${module.name}"
  >
    ${module.entities.length} entities: ${module.entities.slice(0, 3).join(', ')}${module.entities.length > 3 ? '...' : ''}
  </Card>`).join('\n')}
</CardGroup>

## Entity Features

### Automatic API Integration
All entities automatically get CRUD operations through the API service layer:

\`\`\`typescript
const { data: permissions } = useEntityQuery('permission', 'authorization');
\`\`\`

### Relationship Management
Entities can define relationships that are automatically resolved:

\`\`\`typescript
relationships: {
  roles: {
    type: 'belongsToMany',
    entity: 'role',
    module: 'authorization'
  }
}
\`\`\`

### Form Generation
Forms are automatically generated based on entity field definitions:

\`\`\`typescript
<EntityFormComponent 
  entityName="permission" 
  moduleName="authorization" 
/>
\`\`\`

### Internationalization
All entity fields and labels are automatically translated:

\`\`\`typescript
// i18n/entities/permission.ts
export default {
  fields: {
    name: 'Nom',
    description: 'Description'
  }
};
\`\`\`

## Next Steps

- Learn about [Dependency Injection](/architecture/dependency-injection)
- Explore [Event System](/architecture/event-system)
- See [Module Examples](/modules/overview)
`;

    // Generate other architecture docs (simplified for brevity)
    const diDoc = `---
title: "Dependency Injection"
description: "InversifyJS container setup for service management and loose coupling"
---

## Overview

The application uses **InversifyJS** for dependency injection, providing a clean way to manage services and maintain loose coupling between components.

## Container Setup

The DI container is configured in \`/lib/implementations/next/container/\`:

\`\`\`typescript
// lib/implementations/next/container/container-singleton.ts
import { Container } from 'inversify';

const container = new Container();

// Service registrations
container.bind('ApiService').to(ApiService);
container.bind('EventService').to(EventService);
container.bind('AuthorizationService').to(AuthorizationService);

export { container };
\`\`\`

## Using Services

Services are accessed through custom hooks:

\`\`\`typescript
import { useContainer } from '@/lib/implementations/next/hooks/container/container';

export const useAuthorizationService = () => {
  const container = useContainer();
  return container.get<AuthorizationService>('AuthorizationService');
};
\`\`\`

## Benefits

- **Testability**: Easy mocking for tests
- **Flexibility**: Environment-specific implementations
- **Loose Coupling**: Interface-based dependencies
`;

    // Write architecture docs
    fs.writeFileSync(path.join(config.docsPath, 'architecture/entity-system.mdx'), entitySystemDoc);
    fs.writeFileSync(path.join(config.docsPath, 'architecture/dependency-injection.mdx'), diDoc);
};

const generateModuleDocs = async () => {
    // Generate modules overview
    const modulesOverview = `---
title: "Business Modules Overview"
description: "Overview of the business modules that make up the AGVES application"
---

## Module Architecture

The AGVES application is organized into **${config.modules.length} core business modules**, each handling specific domain logic:

<CardGroup cols={2}>
${config.modules.map(module => `  <Card
    title="${module.name.charAt(0).toUpperCase() + module.name.slice(1)} Module"
    href="/modules/${module.name}"
    icon="${getModuleIcon(module.name)}"
  >
    ${module.entities.length} entities • ${module.hasServices ? 'Has services' : 'No services'} • ${module.hasTests ? 'Has tests' : 'No tests'}
  </Card>`).join('\n')}
</CardGroup>

## Common Module Patterns

All modules follow a consistent structure that promotes:

### Standardized Organization
\`\`\`
modules/[module]/
├── [module].tsx           # Module configuration
├── index.tsx              # Module exports
├── entities/              # Entity definitions
├── i18n/                  # Internationalization
├── services/              # Business logic (optional)
└── __tests__/             # Module tests (optional)
\`\`\`

### Automatic API Integration
Each module automatically exposes RESTful endpoints:
- **GET** \`/api/{module}/{entity}\` - List entities
- **POST** \`/api/{module}/{entity}\` - Create entity
- **GET** \`/api/{module}/{entity}/{id}\` - Show specific entity
- **PUT** \`/api/{module}/{entity}/{id}\` - Update entity
- **DELETE** \`/api/{module}/{entity}/{id}\` - Delete entity

### Entity Relationships
Modules can define relationships between entities:
- Within the same module
- Cross-module relationships
- Many-to-many associations
- Polymorphic relationships

## Module Details

Click on any module above to see:
- Complete entity documentation
- API reference with examples
- Usage patterns and best practices
- Type definitions and relationships

## Development Workflow

### Adding New Modules
1. Create module structure in \`/src/modules/[name]/\`
2. Define entities with fields and relationships
3. Add internationalization files
4. Register module in the application
5. Generate documentation with \`npm run generate:docs\`

### Cross-Module Integration
Modules can interact through:
- **Shared services** via dependency injection
- **Event system** for reactive updates
- **Entity relationships** for data modeling
- **Authorization** for access control
`;

    fs.writeFileSync(path.join(config.docsPath, 'modules/overview.mdx'), modulesOverview);

    // Generate individual module docs
    for (const module of config.modules) {
        const moduleDoc = `---
title: "${module.name.charAt(0).toUpperCase() + module.name.slice(1)} Module"
description: "Business logic and entities for ${module.name} management"
---

## Overview

The ${module.name} module handles all ${module.name}-related business logic and provides the following entities:

<CardGroup cols={2}>
${module.entities.map(entity => {
            const displayName = entity.split('-').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            return `  <Card
    title="${displayName}"
    href="/api-reference/${module.name}/${entity}"
  >
    Manage ${displayName.toLowerCase()} operations
  </Card>`;
        }).join('\n')}
</CardGroup>

## Module Structure

\`\`\`
modules/${module.name}/
├── ${module.name}.tsx              # Module configuration
├── index.tsx                   # Module exports
├── entities/                   # Entity definitions
${module.entities.map(entity => `│   ├── ${entity}.tsx`).join('\n')}
├── i18n/                      # Internationalization
│   ├── translations.ts        # Module translations
│   └── entities/              # Entity translations
${module.entities.map(entity => `│       ├── ${entity}.ts`).join('\n')}${module.hasServices ? `
└── services/                  # Business logic services
    └── ${module.name}-service.ts` : ''}${module.hasTests ? `
└── __tests__/                 # Module tests
    └── service/` : ''}
\`\`\`

## Usage Examples

### Querying Entities
\`\`\`typescript
import { useEntityQuery } from '@/lib/implementations/next/api/hooks/entity/query';

function ${module.name.charAt(0).toUpperCase() + module.name.slice(1)}List() {
  const { data: entities } = useEntityQuery('${module.entities[0]}', '${module.name}');
  
  return (
    <div>
      {entities?.map(entity => (
        <div key={entity.id}>{entity.name}</div>
      ))}
    </div>
  );
}
\`\`\`

### Creating Entities
\`\`\`typescript
import { EntityFormComponent } from '@/lib/implementations/next/components/entity';

function Create${module.name.charAt(0).toUpperCase() + module.name.slice(1)}() {
  return (
    <EntityFormComponent 
      entityName="${module.entities[0]}" 
      moduleName="${module.name}"
      mode="create"
    />
  );
}
\`\`\`

## API Endpoints

All entities in this module are available through RESTful endpoints:

\`\`\`bash
GET    /api/${module.name}/{entity}           # List entities
POST   /api/${module.name}/{entity}           # Create entity
GET    /api/${module.name}/{entity}/{id}      # Show entity
PUT    /api/${module.name}/{entity}/{id}      # Update entity
DELETE /api/${module.name}/{entity}/{id}      # Delete entity
\`\`\`

## Related Documentation

- [Entity System Architecture](/architecture/entity-system)
- [API Reference](/api-reference/${module.name}/${module.entities[0]})
- [Frontend Components](/components/overview)
`;

        fs.writeFileSync(
            path.join(config.docsPath, `modules/${module.name}.mdx`),
            moduleDoc
        );
    }
};

const generateComponentDocs = async () => {
    const componentsOverview = `---
title: "Components Overview"
description: "Reusable UI components and their usage patterns"
---

## Component Architecture

The application uses a layered component architecture:

\`\`\`
components/                           # Shared components
lib/implementations/next/components/  # Next.js specific components
app/[locale]/components/             # App-specific components
\`\`\`

## Core Component Categories

### Entity Components
Specialized components for entity operations:

\`\`\`typescript
// Auto-generated forms
<EntityFormComponent 
  entityName="permission" 
  moduleName="authorization" 
/>

// Data tables with pagination
<EntityDataTable 
  entityName="role" 
  moduleName="authorization" 
/>

// Field displays with proper formatting
<EntityFieldsDisplay 
  entity={roleData}
  entityName="role"
  moduleName="authorization"
/>
\`\`\`

### Form Components
Located in \`/lib/implementations/next/components/fields/\` and \`/inputs/\`

<CardGroup cols={2}>
  <Card title="Field Components">
    Display-only components for showing data with proper formatting
  </Card>
  <Card title="Input Components">
    Interactive form input components with validation
  </Card>
</CardGroup>

### Select Components
Advanced select components with API integration:

\`\`\`typescript
<Select
  entityName="role"
  moduleName="authorization"
  multiple={false}
  searchable={true}
  placeholder="Select a role..."
/>
\`\`\`

## Best Practices

### Component Naming
- **Fields**: \`[Type]Field.tsx\` (e.g., \`TextField.tsx\`)
- **Inputs**: \`[Type]Input.tsx\` (e.g., \`TextInput.tsx\`) 
- **Entity Components**: \`Entity[Purpose]Component.tsx\`

### Styling
- Use **TailwindCSS** for utility-first styling
- **Material-UI** components for complex interactions
- Custom styles in \`style.ts\` files when needed
`;

    fs.writeFileSync(
        path.join(config.docsPath, 'components/overview.mdx'),
        componentsOverview
    );
};

const generateApiReference = async () => {
    // Generate API introduction
    const apiIntroduction = `---
title: "API Introduction"
description: "Introduction to the AGVES API and authentication"
---

## Overview

The AGVES API provides RESTful endpoints for all business entities across ${config.modules.length} modules. All endpoints follow consistent patterns for CRUD operations, pagination, and relationship loading.

## Base URL

\`\`\`
http://localhost:80/api
\`\`\`

## Authentication

All API endpoints require authentication via Bearer token:

\`\`\`bash
Authorization: Bearer {your-token}
\`\`\`

## Common Patterns

### List Endpoints
All list endpoints support:
- **Pagination**: \`?page=1&per_page=15\`
- **Search**: \`?search=term\`
- **Relationships**: \`?include=relationship1,relationship2\`

### Response Format
All responses follow a consistent format:

\`\`\`json
{
  "data": [...],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 100
  }
}
\`\`\`

## Available Modules

<CardGroup cols={2}>
${config.modules.map(module => `  <Card
    title="${module.name.charAt(0).toUpperCase() + module.name.slice(1)}"
    href="/api-reference/${module.name}/${module.entities[0]}"
  >
    ${module.entities.length} entities available
  </Card>`).join('\n')}
</CardGroup>
`;

    fs.writeFileSync(path.join(config.docsPath, 'api-reference/introduction.mdx'), apiIntroduction);

    // Generate API docs for each module
    for (const module of config.modules) {
        for (const entity of module.entities) {
            const apiDoc = generateEntityApiDoc(module.name, entity);
            const filePath = path.join(config.docsPath, `api-reference/${module.name}/${entity}.mdx`);
            fs.writeFileSync(filePath, apiDoc);
        }
    }
};

const generateEntityApiDoc = (moduleName, entityName) => {
    const capitalizedModule = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
    const displayName = entityName.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    return `---
title: "${displayName}"
api: "GET /api/${moduleName}/${entityName}"
description: "Manage ${displayName.toLowerCase()} in the ${capitalizedModule} module"
---

## Overview

The ${displayName} API provides full CRUD operations for managing ${displayName.toLowerCase()} entities within the ${capitalizedModule} module.

## List ${displayName}

<ParamField query="page" type="integer" default="1">
  Page number for pagination
</ParamField>

<ParamField query="per_page" type="integer" default="15">
  Number of items per page (max 100)
</ParamField>

<ParamField query="search" type="string">
  Search term to filter results
</ParamField>

<RequestExample>

\`\`\`bash cURL
curl -X GET "http://localhost:80/api/${moduleName}/${entityName}" \\
  -H "Authorization: Bearer {token}" \\
  -H "Accept: application/json"
\`\`\`

\`\`\`typescript React Hook
import { useEntityQuery } from '@/lib/implementations/next/api/hooks/entity/query';

function ${displayName.replace(/\s/g, '')}List() {
  const { data, isLoading, error } = useEntityQuery('${entityName}', '${moduleName}');
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data?.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
\`\`\`

</RequestExample>

## Create ${displayName}

<ParamField body="name" type="string" required>
  The name of the ${displayName.toLowerCase()}
</ParamField>

<RequestExample>

\`\`\`typescript React Component
import { EntityFormComponent } from '@/lib/implementations/next/components/entity';

function Create${displayName.replace(/\s/g, '')}() {
  return (
    <EntityFormComponent 
      entityName="${entityName}" 
      moduleName="${moduleName}"
      mode="create"
      onSuccess={(data) => console.log('Created:', data)}
    />
  );
}
\`\`\`

</RequestExample>

## Frontend Components

\`\`\`typescript
// Data table with pagination
<EntityDataTable 
  entityName="${entityName}" 
  moduleName="${moduleName}" 
/>

// Form component
<EntityFormComponent 
  entityName="${entityName}" 
  moduleName="${moduleName}"
  mode="create"
/>
\`\`\`
`;
};

const updateDocsConfig = async () => {
    // Read current docs.json (new format)
    const docsConfigPath = path.join(config.docsPath, 'docs.json');
    let docsConfig;

    try {
        docsConfig = JSON.parse(fs.readFileSync(docsConfigPath, 'utf8'));
    } catch (error) {
        console.log('⚠️ Could not read docs.json, skipping navigation update');
        return;
    }

    // Find the API Reference tab
    const apiTab = docsConfig.navigation.tabs.find(tab => tab.tab === 'API Reference');

    if (apiTab) {
        // Update API Reference groups with generated pages
        apiTab.groups = [
            {
                "group": "API Documentation",
                "pages": [
                    "api-reference/introduction",
                    "api-reference/authentication"
                ]
            },
            ...config.modules.map(module => ({
                "group": module.name.charAt(0).toUpperCase() + module.name.slice(1),
                "pages": module.entities.map(entity => `api-reference/${module.name}/${entity}`)
            }))
        ];

        // Write updated config
        fs.writeFileSync(docsConfigPath, JSON.stringify(docsConfig, null, 2));
        console.log('✅ Updated docs.json navigation with generated API pages');
    } else {
        console.log('⚠️ API Reference tab not found in docs.json');
    }
};

// Helper function for module icons
const getModuleIcon = (moduleName) => {
    const iconMap = {
        'authorization': 'lock',
        'financial': 'credit-card',
        'identity': 'user',
        'sales': 'shopping-cart',
        'school': 'graduation-cap'
    };
    return iconMap[moduleName] || 'puzzle-piece';
};

// Run the generator
generateAllDocs().catch(console.error);
