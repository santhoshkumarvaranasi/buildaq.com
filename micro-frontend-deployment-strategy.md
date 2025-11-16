# BuildAQ Micro-Frontend Deployment Strategy

## Architecture Decision: Shell + Module Federation

**Recommendation**: Use a lightweight Shell application with Module Federation remotes for optimal balance of independence and consistency.

## Overview

The BuildAQ platform will use a **Shell-first architecture** where:
- **Shell App** (`buildaq.com`) provides layout, authentication, and orchestration
- **Domain Apps** (schools, hospital, retail, etc.) are Module Federation remotes
- Each domain maintains independent repositories and deployment pipelines
- Runtime composition enables independent deployability with consistent UX

## Architecture Components

### 1. Shell Application (Host)
**Repository**: `buildaq-shell`  
**Domain**: `buildaq.com`  
**Technology**: Angular 18 + Module Federation

**Responsibilities**:
- Base layout (header, navigation, footer)
- Authentication & authorization (Azure AD B2C)
- User session management
- Remote loading and routing
- Global error handling
- Shared analytics and monitoring
- Theme and branding consistency

### 2. Domain Applications (Remotes)
**Repositories**: `buildaq-schools`, `buildaq-hospital`, etc.  
**Domains**: `schools.buildaq.com`, `hospital.buildaq.com`, etc.  
**Technology**: Angular 18 + .NET 8 APIs

**Responsibilities**:
- Domain-specific business logic
- Independent backend microservices
- Expose components via Module Federation
- Consume shell-provided authentication
- Domain-specific data management
- Backend microservices
- Database
- CI/CD pipeline
- Infrastructure
- Domain/subdomain

## Domain-Specific Deployment Models

### 1. Schools Domain (schools.buildaq.com)

#### Repository Structure
```
github.com/santhoshkumarvaranasi/buildaq-schools/
├── frontend/                           # Angular + Nebular Micro-Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── student-management/
│   │   │   ├── teacher-management/
│   │   │   ├── academic-management/
│   │   │   ├── fee-management/
│   │   │   └── shared/
│   │   └── assets/
│   ├── package.json
│   ├── angular.json
│   └── Dockerfile
├── backend/                            # .NET 8 Microservices
│   ├── src/
│   │   ├── Schools.API/               # Main API Gateway
│   │   ├── Students.API/              # Student microservice
│   │   ├── Teachers.API/              # Teacher microservice
│   │   ├── Academics.API/             # Academic microservice
│   │   ├── Fees.API/                  # Fee microservice
│   │   └── Shared/                    # Shared libraries
│   └── docker-compose.yml
├── infrastructure/                     # Azure Resources
│   ├── bicep/
│   │   ├── main.bicep
│   │   ├── app-service.bicep
│   │   ├── database.bicep
│   │   └── storage.bicep
│   └── terraform/ (alternative)
├── .github/workflows/
│   ├── deploy-frontend.yml
│   ├── deploy-backend.yml
│   └── deploy-infrastructure.yml
└── README.md
```

#### Deployment Architecture
```
DNS: schools.buildaq.com
├── Frontend: Azure Static Web Apps (Angular SPA)
│   ├── Route: /students/* → Student Management Module
│   ├── Route: /teachers/* → Teacher Management Module
│   ├── Route: /academics/* → Academic Management Module
│   └── Route: /fees/* → Fee Management Module
│
└── Backend: Azure Container Apps (Microservices)
    ├── API Gateway: api.schools.buildaq.com
    ├── Students API: students-api.schools.buildaq.com
    ├── Teachers API: teachers-api.schools.buildaq.com
    ├── Academics API: academics-api.schools.buildaq.com
    └── Fees API: fees-api.schools.buildaq.com

Database: Azure SQL Database (schools-db)
Storage: Azure Blob Storage (schools-storage)
Cache: Azure Redis Cache (schools-cache)
```

#### Micro-Frontend Implementation
```typescript
// frontend/src/main.ts - Module Federation Host
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// Enable micro-frontend routing
const routes = [
  {
    path: 'students',
    loadChildren: () => import('./app/student-management/student.module').then(m => m.StudentModule)
  },
  {
    path: 'teachers', 
    loadChildren: () => import('./app/teacher-management/teacher.module').then(m => m.TeacherModule)
  },
  {
    path: 'academics',
    loadChildren: () => import('./app/academic-management/academic.module').then(m => m.AcademicModule)
  },
  {
    path: 'fees',
    loadChildren: () => import('./app/fee-management/fee.module').then(m => m.FeeModule)
  }
];

platformBrowserDynamic().bootstrapModule(AppModule);
```

### 2. Hospital Domain (hospital.buildaq.com)

#### Repository Structure
```
github.com/santhoshkumarvaranasi/buildaq-hospital/
├── frontend/                           # Angular + Nebular (Healthcare UI)
│   ├── src/app/
│   │   ├── patient-management/
│   │   ├── doctor-management/
│   │   ├── appointment-management/
│   │   ├── billing-management/
│   │   ├── inventory-management/
│   │   └── shared/
│   └── Dockerfile
├── backend/                            # .NET 8 Microservices
│   ├── src/
│   │   ├── Hospital.API/              # API Gateway
│   │   ├── Patients.API/              # Patient microservice
│   │   ├── Doctors.API/               # Doctor microservice
│   │   ├── Appointments.API/          # Appointment microservice
│   │   ├── Billing.API/               # Billing microservice
│   │   └── Inventory.API/             # Inventory microservice
│   └── docker-compose.yml
└── infrastructure/
```

#### Deployment Architecture
```
DNS: hospital.buildaq.com
├── Frontend: Azure Static Web Apps (Angular SPA)
│   ├── Route: /patients/* → Patient Management
│   ├── Route: /doctors/* → Doctor Management  
│   ├── Route: /appointments/* → Appointment Management
│   ├── Route: /billing/* → Billing Management
│   └── Route: /inventory/* → Inventory Management
│
└── Backend: Azure Container Apps
    ├── API Gateway: api.hospital.buildaq.com
    ├── Patients API: patients-api.hospital.buildaq.com
    ├── Doctors API: doctors-api.hospital.buildaq.com
    ├── Appointments API: appointments-api.hospital.buildaq.com
    ├── Billing API: billing-api.hospital.buildaq.com
    └── Inventory API: inventory-api.hospital.buildaq.com

Database: Azure SQL Database (hospital-db)
Storage: Azure Blob Storage (hospital-storage) 
Cache: Azure Redis Cache (hospital-cache)
```

### 3. Retail Domain (retail.buildaq.com)

#### Technology Stack
- **Frontend**: React + Material-UI (E-commerce focused)
- **Backend**: .NET 8 + Entity Framework

#### Repository Structure
```
github.com/santhoshkumarvaranasi/buildaq-retail/
├── frontend/                           # React Micro-Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── product-catalog/
│   │   │   ├── shopping-cart/
│   │   │   ├── order-management/
│   │   │   ├── customer-management/
│   │   │   └── inventory-management/
│   │   └── App.js
│   ├── package.json
│   ├── webpack.config.js              # Module Federation config
│   └── Dockerfile
├── backend/                            # .NET 8 Microservices
│   ├── src/
│   │   ├── Retail.API/                # API Gateway
│   │   ├── Products.API/              # Product catalog
│   │   ├── Orders.API/                # Order processing
│   │   ├── Customers.API/             # Customer management
│   │   ├── Inventory.API/             # Inventory management
│   │   └── Payments.API/              # Payment processing
│   └── docker-compose.yml
└── infrastructure/
```

#### Deployment Architecture
```
DNS: retail.buildaq.com
├── Frontend: Azure Static Web Apps (React SPA)
│   ├── Route: /products/* → Product Catalog
│   ├── Route: /cart/* → Shopping Cart
│   ├── Route: /orders/* → Order Management
│   ├── Route: /customers/* → Customer Management
│   └── Route: /inventory/* → Inventory Management
│
└── Backend: Azure Container Apps
    ├── API Gateway: api.retail.buildaq.com
    ├── Products API: products-api.retail.buildaq.com
    ├── Orders API: orders-api.retail.buildaq.com
    ├── Customers API: customers-api.retail.buildaq.com
    ├── Inventory API: inventory-api.retail.buildaq.com
    └── Payments API: payments-api.retail.buildaq.com

Database: Azure SQL Database (retail-db)
Storage: Azure Blob Storage (retail-storage)
Cache: Azure Redis Cache (retail-cache)
Search: Azure Cognitive Search (product search)
```

## Micro-Frontend Communication Patterns

### 1. Cross-Domain Communication (Minimal)
Since each domain is independent, cross-domain communication should be minimal:

```typescript
// Shared authentication service across domains
@Injectable({
  providedIn: 'root'
})
export class CrossDomainAuthService {
  private authDomain = 'auth.buildaq.com';
  
  async checkAuthStatus(): Promise<boolean> {
    try {
      const response = await fetch(`https://${this.authDomain}/api/auth/status`, {
        credentials: 'include'
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
  
  redirectToLogin(): void {
    window.location.href = `https://${this.authDomain}/login?returnUrl=${encodeURIComponent(window.location.href)}`;
  }
}
```

### 2. Shared Components via NPM Packages
```json
{
  "name": "@buildaq/shared-components",
  "version": "1.0.0",
  "description": "Shared UI components for BuildAQ domains",
  "main": "dist/index.js",
  "dependencies": {
    "@angular/core": "^18.0.0"
  }
}
```

### 3. Event-Driven Communication
```typescript
// Cross-domain event bus for minimal communication
export class CrossDomainEventBus {
  private eventTarget = new EventTarget();
  
  emit(eventName: string, data: any): void {
    const event = new CustomEvent(`buildaq:${eventName}`, { detail: data });
    this.eventTarget.dispatchEvent(event);
  }
  
  on(eventName: string, callback: (data: any) => void): void {
    this.eventTarget.addEventListener(`buildaq:${eventName}`, (event: any) => {
      callback(event.detail);
    });
  }
}
```

## Deployment Pipeline for Each Domain

### 1. Frontend Deployment (Angular/React)

```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend

on:
  push:
    branches: [ main ]
    paths: [ 'frontend/**' ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Run tests
        run: |
          cd frontend
          npm run test:ci
      
      - name: Build application
        run: |
          cd frontend
          npm run build:prod
        env:
          NG_APP_API_URL: ${{ secrets.API_URL }}
          NG_APP_DOMAIN: ${{ github.repository_name }}
      
      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "frontend/dist"
          api_location: ""
          output_location: ""
```

### 2. Backend Microservices Deployment

```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend Microservices

on:
  push:
    branches: [ main ]
    paths: [ 'backend/**' ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: ['gateway', 'students', 'teachers', 'academics', 'fees']
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0'
      
      - name: Restore dependencies
        run: |
          cd backend/src/${{ matrix.service }}.API
          dotnet restore
      
      - name: Build and test
        run: |
          cd backend/src/${{ matrix.service }}.API
          dotnet build --configuration Release
          dotnet test --configuration Release
      
      - name: Build Docker image
        run: |
          cd backend
          docker build -f src/${{ matrix.service }}.API/Dockerfile -t buildaq-${{ github.repository_name }}-${{ matrix.service }}:${{ github.sha }} .
      
      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Deploy to Azure Container Apps
        run: |
          az containerapp update \
            --name buildaq-${{ github.repository_name }}-${{ matrix.service }} \
            --resource-group buildaq-${{ github.repository_name }}-rg \
            --image buildaq.azurecr.io/buildaq-${{ github.repository_name }}-${{ matrix.service }}:${{ github.sha }}
```

## Infrastructure as Code (Per Domain)

### Bicep Template for Each Domain
```bicep
// infrastructure/bicep/main.bicep
param domainName string = 'schools'
param location string = resourceGroup().location

// Static Web App for Frontend
resource staticWebApp 'Microsoft.Web/staticSites@2022-03-01' = {
  name: 'buildaq-${domainName}-frontend'
  location: location
  properties: {
    customDomains: [
      {
        name: '${domainName}.buildaq.com'
        validationMethod: 'cname-delegation'
      }
    ]
  }
}

// Container Apps for Microservices
resource containerAppEnvironment 'Microsoft.App/managedEnvironments@2022-03-01' = {
  name: 'buildaq-${domainName}-env'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
    }
  }
}

// API Gateway Container App
resource apiGateway 'Microsoft.App/containerApps@2022-03-01' = {
  name: 'buildaq-${domainName}-gateway'
  location: location
  properties: {
    managedEnvironmentId: containerAppEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 80
        customDomains: [
          {
            name: 'api.${domainName}.buildaq.com'
            certificateId: '/subscriptions/.../certificates/wildcard-buildaq-com'
          }
        ]
      }
    }
    template: {
      containers: [
        {
          name: 'api-gateway'
          image: 'buildaq.azurecr.io/buildaq-${domainName}-gateway:latest'
          resources: {
            cpu: '0.5'
            memory: '1Gi'
          }
        }
      ]
    }
  }
}

// Azure SQL Database
resource sqlServer 'Microsoft.Sql/servers@2021-11-01' = {
  name: 'buildaq-${domainName}-sql'
  location: location
  properties: {
    administratorLogin: 'buildaqadmin'
    administratorLoginPassword: '${uniqueString(resourceGroup().id)}!'
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2021-11-01' = {
  parent: sqlServer
  name: '${domainName}-db'
  location: location
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: 2147483648 // 2GB
    requestedServiceObjectiveName: 'S0'
  }
}

// Redis Cache
resource redisCache 'Microsoft.Cache/Redis@2021-06-01' = {
  name: 'buildaq-${domainName}-cache'
  location: location
  properties: {
    sku: {
      name: 'Basic'
      family: 'C'
      capacity: 0
    }
  }
}

// Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2021-09-01' = {
  name: 'buildaq${domainName}storage'
  location: location
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
}
```

## Domain-Specific Technology Choices

### Schools Domain
- **Frontend**: Angular 18 + Nebular UI (Education-focused components)
- **Backend**: .NET 8 + Entity Framework Core
- **Database**: Azure SQL Database
- **Special Features**: Student portal, parent portal, teacher dashboard

### Hospital Domain
- **Frontend**: Angular 18 + Nebular UI (Healthcare compliance)
- **Backend**: .NET 8 + Entity Framework Core
- **Database**: Azure SQL Database (HIPAA compliant)
- **Special Features**: Patient records, appointment scheduling, billing

### Retail Domain
- **Frontend**: React 18 + Material-UI (Consumer-friendly)
- **Backend**: .NET 8 + Entity Framework Core
- **Database**: Azure SQL Database + Azure Cosmos DB (product catalog)
- **Special Features**: E-commerce checkout, inventory management, analytics

### Finance Domain
- **Frontend**: Angular 18 + PrimeNG (Data-heavy interfaces)
- **Backend**: .NET 8 + Entity Framework Core
- **Database**: Azure SQL Database (encrypted)
- **Special Features**: Financial reporting, transaction processing, compliance

### Logistics Domain
- **Frontend**: Vue.js 3 + Vuetify (Operational dashboards)
- **Backend**: .NET 8 + Entity Framework Core
- **Database**: Azure SQL Database + Azure Cosmos DB (tracking data)
- **Special Features**: Route optimization, tracking, warehouse management

## Security and Compliance

### Cross-Domain Authentication
```typescript
// Shared authentication service
export class BuildAQAuthService {
  private authDomain = 'auth.buildaq.com';
  
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const response = await fetch(`https://${this.authDomain}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'include'
    });
    
    return response.json();
  }
  
  async validateToken(): Promise<boolean> {
    const response = await fetch(`https://${this.authDomain}/api/auth/validate`, {
      credentials: 'include'
    });
    
    return response.ok;
  }
}
```

### Domain-Specific Security
Each domain implements its own security requirements:
- **Schools**: FERPA compliance for student data
- **Hospital**: HIPAA compliance for patient data  
- **Finance**: PCI DSS compliance for payment data
- **Retail**: GDPR compliance for customer data

## Monitoring and Observability

### Per-Domain Monitoring
```typescript
// Domain-specific monitoring service
@Injectable()
export class DomainMonitoringService {
  constructor(private domain: string) {}
  
  trackUserAction(action: string, metadata?: any): void {
    fetch(`https://monitoring.buildaq.com/api/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain: this.domain,
        action,
        metadata,
        timestamp: new Date().toISOString(),
        sessionId: this.getSessionId()
      })
    });
  }
  
  trackError(error: Error, context?: string): void {
    fetch(`https://monitoring.buildaq.com/api/errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain: this.domain,
        error: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
      })
    });
  }
}
```

## DNS Configuration Strategy

### Main Domain
```
buildaq.com → GitHub Pages (corporate website)
```

### Business Domain Mapping
```
schools.buildaq.com     → Azure Static Web Apps (schools frontend)
api.schools.buildaq.com → Azure Container Apps (schools APIs)

hospital.buildaq.com    → Azure Static Web Apps (hospital frontend)  
api.hospital.buildaq.com → Azure Container Apps (hospital APIs)

retail.buildaq.com      → Azure Static Web Apps (retail frontend)
api.retail.buildaq.com  → Azure Container Apps (retail APIs)

finance.buildaq.com     → Azure Static Web Apps (finance frontend)
api.finance.buildaq.com → Azure Container Apps (finance APIs)

logistics.buildaq.com   → Azure Static Web Apps (logistics frontend)
api.logistics.buildaq.com → Azure Container Apps (logistics APIs)

hrms.buildaq.com        → Azure Static Web Apps (HRMS frontend)
api.hrms.buildaq.com    → Azure Container Apps (HRMS APIs)

crm.buildaq.com         → Azure Static Web Apps (CRM frontend)
api.crm.buildaq.com     → Azure Container Apps (CRM APIs)
```

### Shared Services
```
auth.buildaq.com        → Azure Container Apps (shared authentication)
monitoring.buildaq.com  → Azure Container Apps (shared monitoring)
cdn.buildaq.com         → Azure CDN (shared assets)
```

## Benefits of This Micro-Frontend Architecture

1. **Complete Independence**: Each domain can evolve separately
2. **Technology Freedom**: Different frameworks per domain
3. **Team Autonomy**: Different teams can own different domains
4. **Deployment Isolation**: Issues in one domain don't affect others
5. **Business Flexibility**: Each domain can have its own pricing model
6. **Scalability**: Each domain scales based on its own usage patterns
7. **Future Exit Strategy**: Domains can be sold or spun off independently

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
1. Create first domain repository (buildaq-schools)
2. Setup Angular + .NET 8 stack
3. Implement basic CRUD operations
4. Deploy to schools.buildaq.com

### Phase 2: Scale Domains (Week 3-8)
1. Create additional domain repositories
2. Implement domain-specific features
3. Deploy each domain independently

### Phase 3: Business Launch (Month 2-3)
1. Launch each domain with customers
2. Implement domain-specific pricing models
3. Scale based on usage patterns

This micro-frontend architecture gives you maximum flexibility while maintaining clear separation of concerns and enabling independent business growth for each domain!