# BuildAQ Micro-Frontend Architecture

## Multi-Domain Solution Strategy

### **Domain Map:**
```
buildaq.com                    # Main corporate website (existing)
├── schools.buildaq.com        # School Management System
├── hospital.buildaq.com       # Hospital Management System  
├── retail.buildaq.com         # Retail POS System
├── finance.buildaq.com        # Financial Management
├── logistics.buildaq.com      # Supply Chain Management
├── hrms.buildaq.com          # Human Resource Management
└── crm.buildaq.com           # Customer Relationship Management
```

## Micro-Frontend Architecture

### **Shell Application (Main Host)**
```
                    ┌─────────────────────────┐
                    │    builddaq.com         │
                    │   (Shell/Main Site)     │
                    │  Angular + Module Fed   │
                    └─────────┬───────────────┘
                              │
                    ┌─────────▼───────────────┐
                    │   Micro-Frontend        │
                    │   Orchestrator          │
                    │  (Route Management)     │
                    └─────────┬───────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐         ┌─────▼─────┐         ┌────▼────┐
   │Schools  │         │ Hospital  │         │ Retail  │
   │.buildaq │         │.buildaq   │         │.buildaq │
   │Angular  │         │ React     │         │ Vue.js  │
   └─────────┘         └───────────┘         └─────────┘
```

### **Technology Stack per Domain:**

| Domain | Subdomain | Frontend | Backend | Database | Specialization |
|--------|-----------|----------|---------|----------|---------------|
| **Schools** | schools.buildaq.com | Angular + Nebular | .NET 8 | SQL Server | Education Management |
| **Hospital** | hospital.buildaq.com | React + Ant Design | .NET 8 | SQL Server | Healthcare Systems |
| **Retail** | retail.buildaq.com | Vue.js + Quasar | Node.js | MongoDB | POS & Inventory |
| **Finance** | finance.buildaq.com | Angular + PrimeNG | .NET 8 | SQL Server | Accounting & Banking |
| **Logistics** | logistics.buildaq.com | React + Material-UI | Java Spring | PostgreSQL | Supply Chain |
| **HRMS** | hrms.buildaq.com | Angular + Nebular | .NET 8 | SQL Server | Human Resources |
| **CRM** | crm.buildaq.com | React + Chakra UI | Node.js | MongoDB | Customer Management |

## Implementation Approaches

### **Approach 1: Module Federation (Recommended)**

```typescript
// webpack.config.js for Shell App (buildaq.com)
const ModuleFederationPlugin = require('@module-federation/webpack');

module.exports = {
  mode: 'development',
  devServer: {
    port: 4200,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        schools: 'schools@https://schools.buildaq.com/remoteEntry.js',
        hospital: 'hospital@https://hospital.buildaq.com/remoteEntry.js',
        retail: 'retail@https://retail.buildaq.com/remoteEntry.js',
        finance: 'finance@https://finance.buildaq.com/remoteEntry.js',
        logistics: 'logistics@https://logistics.buildaq.com/remoteEntry.js',
        hrms: 'hrms@https://hrms.buildaq.com/remoteEntry.js',
        crm: 'crm@https://crm.buildaq.com/remoteEntry.js',
      },
    }),
  ],
};

// webpack.config.js for Schools App
const ModuleFederationPlugin = require('@module-federation/webpack');

module.exports = {
  mode: 'development',
  devServer: {
    port: 4201,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'schools',
      filename: 'remoteEntry.js',
      exposes: {
        './SchoolsModule': './src/app/schools/schools.module.ts',
        './StudentModule': './src/app/students/students.module.ts',
      },
      shared: {
        '@angular/core': { singleton: true, strictVersion: true },
        '@angular/common': { singleton: true, strictVersion: true },
        '@angular/router': { singleton: true, strictVersion: true },
      },
    }),
  ],
};
```

### **Approach 2: Independent Deployment with Proxy**

```nginx
# nginx.conf for buildaq.com (Main proxy)
server {
    listen 80;
    server_name buildaq.com www.buildaq.com;
    
    # Main corporate website
    location / {
        root /var/www/buildaq-main;
        try_files $uri $uri/ /index.html;
    }
    
    # API Gateway for all domains
    location /api/ {
        proxy_pass http://api-gateway:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name schools.buildaq.com;
    
    location / {
        proxy_pass http://schools-frontend:4201;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name hospital.buildaq.com;
    
    location / {
        proxy_pass http://hospital-frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### **Approach 3: Single-SPA Framework**

```typescript
// root-config.js (Main orchestrator)
import { registerApplication, start } from 'single-spa';

registerApplication({
  name: '@buildaq/schools',
  app: () => System.import('@buildaq/schools'),
  activeWhen: location => location.hostname === 'schools.buildaq.com',
});

registerApplication({
  name: '@buildaq/hospital',  
  app: () => System.import('@buildaq/hospital'),
  activeWhen: location => location.hostname === 'hospital.buildaq.com',
});

registerApplication({
  name: '@buildaq/retail',
  app: () => System.import('@buildaq/retail'),
  activeWhen: location => location.hostname === 'retail.buildaq.com',
});

start();
```

## Shared Infrastructure

### **Shared Components Library**
```typescript
// @buildaq/shared-components
export * from './authentication';
export * from './navigation';
export * from './user-management';
export * from './notifications';
export * from './reporting';
export * from './themes';
```

### **Shared Authentication Service**
```typescript
// @buildaq/auth-service
export class AuthService {
  private baseUrl = 'https://auth.buildaq.com';
  
  login(credentials: LoginCredentials): Observable<AuthResult> {
    // Centralized authentication for all domains
  }
  
  getToken(): string {
    // JWT token valid across all subdomains
  }
  
  hasPermission(domain: string, permission: string): boolean {
    // Domain-specific permissions
  }
}
```

### **Shared Backend Services**

```csharp
// BuildAQ.Shared.Authentication
public class MultiTenantAuthService 
{
    public async Task<ClaimsPrincipal> ValidateTokenAsync(string token, string domain)
    {
        // Validate JWT and extract domain-specific claims
    }
    
    public async Task<bool> HasDomainAccessAsync(string userId, string domain)
    {
        // Check if user has access to specific domain
    }
}

// BuildAQ.Shared.Infrastructure  
public class TenantResolver
{
    public string GetTenantFromSubdomain(HttpContext context)
    {
        var host = context.Request.Host.Host;
        return host.Split('.')[0]; // Extract subdomain
    }
}
```

## Deployment Architecture

### **Azure Container Apps (Recommended)**

```yaml
# azure-container-apps.yml
apiVersion: app.containers.azure.com/v1beta1
kind: ContainerApp
metadata:
  name: buildaq-shell
spec:
  configuration:
    ingress:
      external: true
      targetPort: 80
      customDomains:
        - name: buildaq.com
          certificateId: buildaq-ssl-cert
  template:
    containers:
    - name: shell-app
      image: buildaqacr.azurecr.io/shell:latest
      
---
apiVersion: app.containers.azure.com/v1beta1  
kind: ContainerApp
metadata:
  name: buildaq-schools
spec:
  configuration:
    ingress:
      external: true
      targetPort: 80
      customDomains:
        - name: schools.buildaq.com
          certificateId: schools-ssl-cert
  template:
    containers:
    - name: schools-app
      image: buildaqacr.azurecr.io/schools:latest
```

### **Kubernetes Deployment**

```yaml
# schools-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: schools-frontend
  namespace: buildaq-schools
spec:
  replicas: 3
  selector:
    matchLabels:
      app: schools-frontend
  template:
    metadata:
      labels:
        app: schools-frontend
    spec:
      containers:
      - name: schools-app
        image: buildaqacr.azurecr.io/schools-frontend:latest
        ports:
        - containerPort: 80
        env:
        - name: API_BASE_URL
          value: "https://api.schools.buildaq.com"
        - name: AUTH_DOMAIN
          value: "schools"

---
apiVersion: v1
kind: Service
metadata:
  name: schools-frontend-service
  namespace: buildaq-schools
spec:
  selector:
    app: schools-frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: schools-ingress
  namespace: buildaq-schools
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt
spec:
  tls:
  - hosts:
    - schools.buildaq.com
    secretName: schools-tls
  rules:
  - host: schools.buildaq.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: schools-frontend-service
            port:
              number: 80
```

## Development Workflow

### **Repository Structure:**
```
BuildAQ-Platform/
├── apps/
│   ├── shell/                 # Main orchestrator app
│   ├── schools/              # School management micro-frontend
│   ├── hospital/             # Hospital management
│   ├── retail/               # Retail POS system
│   ├── finance/              # Financial management
│   └── shared/               # Shared components library
├── libs/
│   ├── shared-ui/            # Common UI components
│   ├── shared-auth/          # Authentication library
│   ├── shared-utils/         # Utility functions
│   └── shared-types/         # TypeScript types
├── tools/
│   ├── deployment/           # Deployment scripts
│   └── generators/           # Code generators
└── infrastructure/
    ├── azure/                # Azure infrastructure as code
    ├── kubernetes/           # K8s manifests
    └── docker/               # Dockerfiles
```

### **Monorepo with Nx (Recommended):**
```bash
# Create Nx workspace
npx create-nx-workspace@latest buildaq-platform --preset=empty

# Add applications
nx g @nx/angular:app shell --routing --style=scss
nx g @nx/angular:app schools --routing --style=scss  
nx g @nx/react:app hospital --routing --style=scss
nx g @nx/vue:app retail --routing --style=scss

# Add shared libraries
nx g @nx/angular:lib shared-ui
nx g @nx/js:lib shared-auth
nx g @nx/js:lib shared-utils

# Build specific app
nx build schools --prod

# Build all apps
nx run-many --target=build --all

# Deploy specific domain
nx deploy schools --environment=production
```

## Benefits of This Architecture

### **🚀 Independent Development:**
- **Different teams** can work on different domains
- **Different technologies** per domain expertise
- **Independent release cycles**
- **Technology freedom** per domain

### **📈 Business Scalability:**
- **Add new domains** without affecting existing ones
- **Domain-specific optimizations**
- **Independent scaling** per business unit
- **Easier to sell** individual solutions

### **🔧 Technical Advantages:**
- **Fault isolation** - one domain failure doesn't affect others
- **Technology diversity** - use best tool for each domain
- **Team independence** - parallel development
- **Performance optimization** per domain

### **💰 Revenue Model:**
- **SaaS per domain** ($100-500/month per domain)
- **Custom development** for enterprise clients
- **White-label solutions** for partners
- **Domain expertise** selling consulting

## Implementation Priority

1. **Phase 1:** Set up shell app and schools domain (proven concept)
2. **Phase 2:** Add hospital domain (healthcare is lucrative)
3. **Phase 3:** Add retail and finance (broader market)
4. **Phase 4:** Add logistics and HRMS (enterprise focus)
5. **Phase 5:** Add CRM and custom domains

This architecture positions BuildAQ as a comprehensive business solution platform! 🚀