# BuildAQ Implementation Roadmap

## Phase 1: Foundation Setup (Month 1)

### **1. Create Nx Monorepo:**
```bash
# Initialize BuildAQ Platform
npx create-nx-workspace@latest buildaq-platform --preset=empty
cd buildaq-platform

# Add shell application (main orchestrator)  
nx g @nx/angular:app shell --routing --style=scss

# Add schools micro-frontend
nx g @nx/angular:app schools --routing --style=scss

# Add shared libraries
nx g @nx/angular:lib shared-ui --buildable --publishable
nx g @nx/js:lib shared-auth --buildable --publishable
nx g @nx/js:lib shared-utils --buildable --publishable

# Configure Module Federation
npm install @module-federation/webpack --save-dev
```

### **2. Configure Module Federation:**

```typescript
// apps/shell/webpack.config.js
const ModuleFederationPlugin = require('@module-federation/webpack');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        schools: 'schools@https://schools.buildaq.com/remoteEntry.js',
        // Future domains will be added here
      },
      shared: {
        '@angular/core': { singleton: true, strictVersion: true },
        '@angular/common': { singleton: true, strictVersion: true },
        '@angular/router': { singleton: true, strictVersion: true },
        '@buildaq/shared-auth': { singleton: true },
      },
    }),
  ],
};

// apps/schools/webpack.config.js  
const ModuleFederationPlugin = require('@module-federation/webpack');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'schools',
      filename: 'remoteEntry.js',
      exposes: {
        './Module': './src/app/remote-entry/entry.module.ts',
      },
      shared: {
        '@angular/core': { singleton: true, strictVersion: true },
        '@angular/common': { singleton: true, strictVersion: true },
        '@angular/router': { singleton: true, strictVersion: true },
        '@buildaq/shared-auth': { singleton: true },
      },
    }),
  ],
};
```

## Phase 2: Shared Infrastructure (Month 1-2)

### **3. Shared Authentication Service:**

```typescript
// libs/shared-auth/src/lib/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'https://auth.buildaq.com';
  
  async loginWithDomain(credentials: LoginRequest, domain: string): Promise<AuthResult> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...credentials, domain })
    });
    
    const result = await response.json();
    
    // Store token with domain access
    localStorage.setItem('buildaq-token', result.token);
    localStorage.setItem('buildaq-domains', JSON.stringify(result.allowedDomains));
    
    return result;
  }
  
  hasAccessToDomain(domain: string): boolean {
    const allowedDomains = JSON.parse(localStorage.getItem('buildaq-domains') || '[]');
    return allowedDomains.includes(domain);
  }
  
  getCurrentUser(): Observable<User> {
    const token = localStorage.getItem('buildaq-token');
    if (!token) return of(null);
    
    return this.http.get<User>(`${this.baseUrl}/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
```

### **4. Shared UI Components:**

```typescript
// libs/shared-ui/src/lib/components/domain-switcher/domain-switcher.component.ts
@Component({
  selector: 'buildaq-domain-switcher',
  template: `
    <nb-select placeholder="Switch Domain" [(selected)]="selectedDomain" (selectedChange)="switchDomain($event)">
      <nb-option *ngFor="let domain of availableDomains" [value]="domain">
        <nb-icon [icon]="getDomainIcon(domain)"></nb-icon>
        {{ getDomainName(domain) }}
      </nb-option>
    </nb-select>
  `
})
export class DomainSwitcherComponent {
  @Input() availableDomains: string[] = [];
  @Output() domainChanged = new EventEmitter<string>();
  
  selectedDomain: string;
  
  switchDomain(domain: string) {
    // Navigate to selected domain
    window.location.href = `https://${domain}.buildaq.com`;
    this.domainChanged.emit(domain);
  }
  
  getDomainIcon(domain: string): string {
    const icons = {
      schools: 'book-outline',
      hospital: 'heart-outline', 
      retail: 'shopping-bag-outline',
      finance: 'credit-card-outline',
      logistics: 'car-outline',
      hrms: 'people-outline',
      crm: 'person-outline'
    };
    return icons[domain] || 'grid-outline';
  }
  
  getDomainName(domain: string): string {
    const names = {
      schools: 'Education',
      hospital: 'Healthcare',
      retail: 'Retail POS', 
      finance: 'Finance',
      logistics: 'Logistics',
      hrms: 'HR Management',
      crm: 'CRM'
    };
    return names[domain] || domain;
  }
}
```

## Phase 3: Domain Development (Month 2-12)

### **5. Schools Domain Implementation:**
```bash
# Schools-specific dependencies
npm install @nebular/theme @nebular/eva-icons
npm install @angular/cdk chart.js ng2-charts

# Generate schools modules
nx g @nx/angular:lib schools-core --buildable
nx g @nx/angular:lib schools-features --buildable
nx g component students --project=schools-features
nx g component teachers --project=schools-features  
nx g component academics --project=schools-features
```

### **6. Hospital Domain (Different Tech Stack):**
```bash
# Add React application for hospital domain
nx g @nx/react:app hospital --routing --style=styled-components

# Hospital-specific dependencies
npm install antd @ant-design/icons
npm install react-query axios
npm install @types/react @types/react-dom

# Generate hospital components
nx g @nx/react:component patients --project=hospital
nx g @nx/react:component appointments --project=hospital
nx g @nx/react:component medical-records --project=hospital
```

### **7. Retail Domain (Vue.js):**
```bash
# Add Vue application for retail domain
nx g @nx/vue:app retail --routing --style=scss

# Retail-specific dependencies  
npm install quasar @quasar/extras
npm install pinia vue-router@4

# Generate retail components
nx g @nx/vue:component inventory --project=retail
nx g @nx/vue:component pos --project=retail
nx g @nx/vue:component reports --project=retail
```

## Phase 4: Deployment Architecture (Month 3-4)

### **8. Azure Infrastructure Setup:**

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
    - main
  paths:
    include:
    - apps/schools/*
    - libs/shared-*/*

pool:
  vmImage: 'ubuntu-latest'

variables:
  azureSubscription: 'BuildAQ-Production'
  containerRegistry: 'buildaqacr.azurecr.io'

stages:
- stage: Build
  jobs:
  - job: BuildApps
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '18.x'
    
    - script: npm ci
      displayName: 'Install dependencies'
    
    - script: npx nx build shell --prod
      displayName: 'Build Shell App'
      
    - script: npx nx build schools --prod  
      displayName: 'Build Schools App'
    
    - task: Docker@2
      inputs:
        command: 'buildAndPush'
        repository: 'schools-frontend'
        containerRegistry: $(containerRegistry)
        tags: |
          $(Build.BuildId)
          latest

- stage: Deploy
  jobs:
  - job: DeployToAzure
    steps:
    - task: AzureContainerApps@1
      inputs:
        azureSubscription: $(azureSubscription)
        containerAppName: 'buildaq-schools'
        resourceGroup: 'buildaq-platform'
        imageToDeploy: '$(containerRegistry)/schools-frontend:$(Build.BuildId)'
```

### **9. Kubernetes Manifests:**

```yaml
# k8s/schools-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: buildaq-schools
  labels:
    domain: schools
    
---
# k8s/schools-deployment.yaml
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
        - name: DOMAIN_NAME
          value: "schools"
        - name: AUTH_SERVICE_URL
          value: "https://auth.buildaq.com"
        - name: API_BASE_URL
          value: "https://api.schools.buildaq.com"
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
        readinessProbe:
          httpGet:
            path: /ready
            port: 80
          initialDelaySeconds: 5
```

## Phase 5: Monitoring & Analytics (Month 4)

### **10. Shared Analytics:**

```typescript
// libs/shared-analytics/src/lib/analytics.service.ts
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private domain: string;
  
  init(domain: string) {
    this.domain = domain;
    
    // Initialize domain-specific Google Analytics
    gtag('config', `GA_MEASUREMENT_ID_${domain.toUpperCase()}`, {
      custom_map: { dimension1: 'domain' },
      domain_name: `${domain}.buildaq.com`
    });
  }
  
  trackEvent(action: string, category: string, label?: string, value?: number) {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      custom_domain: this.domain
    });
  }
  
  trackUserJourney(step: string, funnel: string) {
    gtag('event', 'user_journey', {
      step: step,
      funnel: funnel,
      domain: this.domain,
      timestamp: Date.now()
    });
  }
}
```

## Success Metrics per Domain

### **Schools Domain:**
- User registrations per month
- Active schools using the platform  
- Student records managed
- Revenue per school

### **Hospital Domain:**
- Patient management efficiency
- Appointment scheduling usage
- Medical record digital conversion
- Revenue per hospital

### **Retail Domain:**
- Transaction volume processed
- Inventory items managed
- POS system uptime
- Revenue per store

This architecture allows BuildAQ to become a comprehensive business solution platform! 🚀