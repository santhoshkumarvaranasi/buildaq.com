# BuildAQ Independent Repository Architecture

## Overview
This document outlines the corrected architecture where **buildaq.com is completely independent** from all micro-frontend applications. Each domain/subdomain represents a separate business solution with its own repository, CI/CD pipeline, and deployment strategy.

## Repository Structure

### 1. Corporate Website (Current Repository)
```
Repository: github.com/santhoshkumarvaranasi/buildaq.com
Domain: buildaq.com
Purpose: Corporate website, portfolio, company information
Technology: Static HTML/CSS/JS (current), can evolve to React/Next.js
Deployment: GitHub Pages (current) or Azure Static Web Apps
```

### 2. Independent Business Domain Repositories
Each business vertical gets its own repository and infrastructure:

```
Repository: github.com/santhoshkumarvaranasi/buildaq-schools
Domain: schools.buildaq.com
Purpose: Complete school management system
Technology: Angular + Nebular frontend + .NET 8 backend

Repository: github.com/santhoshkumarvaranasi/buildaq-hospital  
Domain: hospital.buildaq.com
Purpose: Hospital management system
Technology: Angular + Nebular frontend + .NET 8 backend

Repository: github.com/santhoshkumarvaranasi/buildaq-retail
Domain: retail.buildaq.com
Purpose: E-commerce and retail management
Technology: React + Material-UI frontend + .NET 8 backend

Repository: github.com/santhoshkumarvaranasi/buildaq-finance
Domain: finance.buildaq.com
Purpose: Financial services and banking
Technology: Angular + PrimeNG frontend + .NET 8 backend

Repository: github.com/santhoshkumarvaranasi/buildaq-logistics
Domain: logistics.buildaq.com
Purpose: Supply chain and logistics management
Technology: Vue.js + Vuetify frontend + .NET 8 backend

Repository: github.com/santhoshkumarvaranasi/buildaq-hrms
Domain: hrms.buildaq.com
Purpose: Human resource management system
Technology: Angular + Nebular frontend + .NET 8 backend

Repository: github.com/santhoshkumarvaranasi/buildaq-crm
Domain: crm.buildaq.com
Purpose: Customer relationship management
Technology: React + Ant Design frontend + .NET 8 backend
```

## Architecture Benefits

### 1. Complete Independence
- **Separate Codebases**: Each domain has its own repository
- **Independent Teams**: Different teams can work on different domains
- **Technology Freedom**: Each domain can choose its own tech stack
- **Deployment Isolation**: Issues in one domain don't affect others
- **Scaling**: Each domain scales based on its own usage patterns

### 2. Business Advantages
- **Revenue Isolation**: Each domain can have its own pricing model
- **Client Separation**: Different client bases for different domains
- **Feature Development**: Independent feature roadmaps
- **Compliance**: Domain-specific compliance requirements (HIPAA for hospital, FERPA for schools)

### 3. Development Benefits
- **Faster Development**: Smaller codebases are easier to manage
- **Clear Ownership**: Domain teams own their entire stack
- **Technology Evolution**: Each domain can upgrade independently
- **Testing Isolation**: Domain-specific test suites

## DNS and Infrastructure Strategy

### 1. DNS Configuration
```
buildaq.com               → GitHub Pages (corporate site)
schools.buildaq.com       → Azure Container Apps (schools app)
hospital.buildaq.com      → Azure Container Apps (hospital app)
retail.buildaq.com        → Azure Container Apps (retail app)
finance.buildaq.com       → Azure Container Apps (finance app)
logistics.buildaq.com     → Azure Container Apps (logistics app)
hrms.buildaq.com         → Azure Container Apps (hrms app)
crm.buildaq.com          → Azure Container Apps (crm app)

# API endpoints (all separate)
api.schools.buildaq.com   → Azure Container Apps (schools API)
api.hospital.buildaq.com  → Azure Container Apps (hospital API)
api.retail.buildaq.com    → Azure Container Apps (retail API)
# ... etc
```

### 2. Infrastructure Separation
Each domain gets its own:
- **Azure Resource Group**: `buildaq-{domain}-rg`
- **Container Registry**: `buildaq{domain}.azurecr.io` or shared `buildaq.azurecr.io` with domain prefixes
- **Database**: Domain-specific Azure SQL databases
- **Storage**: Domain-specific blob storage
- **Monitoring**: Domain-specific Application Insights

## Current Repository (buildaq.com) Simplification

### 1. Remove Micro-Frontend Complexity
The current repository should focus ONLY on:
- Corporate website functionality
- Company portfolio
- Contact forms
- SEO and marketing content
- Business development materials

### 2. Clean Up Current CI/CD
Remove from current repository:
- Nx monorepo setup (not needed for corporate site)
- Complex micro-frontend configurations
- Multiple domain Docker configurations
- Domain-specific pipelines

### 3. Simplified CI/CD for Corporate Site
```yaml
# .github/workflows/deploy.yml (simplified)
name: Deploy Corporate Website

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

## Domain-Specific Repository Templates

### 1. Schools Repository Structure
```
buildaq-schools/
├── frontend/                    # Angular + Nebular
│   ├── src/app/
│   │   ├── students/
│   │   ├── teachers/
│   │   ├── academics/
│   │   └── administration/
│   └── package.json
├── backend/                     # .NET 8 Web API
│   ├── BuildAQ.Schools.API/
│   ├── BuildAQ.Schools.Core/
│   ├── BuildAQ.Schools.Infrastructure/
│   └── BuildAQ.Schools.Tests/
├── infrastructure/              # Terraform/ARM templates
│   ├── azure-resources.tf
│   └── kubernetes/
├── .github/workflows/          # Domain-specific CI/CD
│   └── deploy-schools.yml
└── README.md
```

### 2. Domain-Specific CI/CD Template
```yaml
# Template for each domain repository
name: Deploy {Domain} Application

on:
  push:
    branches: [ main, develop ]

env:
  DOMAIN: schools  # Change for each domain
  AZURE_RESOURCE_GROUP: buildaq-schools-rg
  AZURE_CONTAINER_APP: buildaq-schools-app

jobs:
  build-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install and build
        run: |
          cd frontend
          npm ci
          npm run build:prod
      - name: Upload frontend artifacts
        uses: actions/upload-artifact@v4
        with:
          name: frontend-build
          path: frontend/dist/

  build-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0'
      - name: Build and test
        run: |
          cd backend
          dotnet restore
          dotnet build --configuration Release
          dotnet test --configuration Release
      - name: Publish
        run: |
          cd backend
          dotnet publish --configuration Release --output ./publish
      - name: Upload backend artifacts
        uses: actions/upload-artifact@v4
        with:
          name: backend-build
          path: backend/publish/

  deploy:
    needs: [build-frontend, build-backend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v4
      
      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Deploy to Azure Container Apps
        run: |
          az containerapp update \
            --name ${{ env.AZURE_CONTAINER_APP }} \
            --resource-group ${{ env.AZURE_RESOURCE_GROUP }} \
            --image buildaq.azurecr.io/${{ env.DOMAIN }}:${{ github.sha }}
```

## Migration Strategy

### Phase 1: Simplify Current Repository (Immediate)
1. **Clean up buildaq.com repository**:
   - Remove complex micro-frontend CI/CD
   - Keep only corporate website files
   - Simplify to static site deployment

### Phase 2: Create First Domain Repository (Week 1-2)
1. **Create buildaq-schools repository**:
   - Setup Angular + Nebular frontend
   - Setup .NET 8 backend APIs
   - Configure domain-specific CI/CD
   - Deploy to schools.buildaq.com

### Phase 3: Scale to Other Domains (Week 3-8)
1. **Create additional domain repositories**:
   - buildaq-hospital
   - buildaq-retail
   - buildaq-finance
   - etc.

### Phase 4: Business Launch (Month 2-3)
1. **Launch each domain as separate business**:
   - Domain-specific marketing
   - Separate customer bases
   - Independent pricing models

## Technology Stack per Domain

### Corporate Site (buildaq.com)
- **Frontend**: Static HTML/CSS/JS → Next.js (future)
- **Deployment**: GitHub Pages → Vercel (future)
- **Purpose**: Marketing, portfolio, lead generation

### Business Domains (Flexibility per Domain)
- **Schools**: Angular + Nebular (education-focused UI)
- **Hospital**: Angular + Nebular (healthcare compliance)
- **Retail**: React + Material-UI (consumer-friendly)
- **Finance**: Angular + PrimeNG (data-heavy interfaces)
- **Logistics**: Vue.js + Vuetify (operational dashboards)
- **HRMS**: Angular + Nebular (enterprise feel)
- **CRM**: React + Ant Design (sales-focused)

### Backend (Consistent)
- **All Domains**: .NET 8 + Entity Framework + Azure SQL
- **Shared Libraries**: Authentication, logging, monitoring
- **Independent Databases**: Domain-specific schemas

## Revenue Model per Domain

### 1. Schools (schools.buildaq.com)
- **SaaS Model**: $5-15/student/month
- **Target**: Private schools, coaching centers
- **Revenue Potential**: $5-10K/month

### 2. Hospital (hospital.buildaq.com)
- **Tiered Pricing**: $200-1000/month per facility
- **Target**: Clinics, small-medium hospitals
- **Revenue Potential**: $8-15K/month

### 3. Retail (retail.buildaq.com)
- **Transaction-based**: 1-3% per transaction
- **Target**: Small-medium retailers
- **Revenue Potential**: $10-20K/month

[Continue for other domains...]

## Next Actions

1. **Immediate**: Clean up current buildaq.com repository
2. **This Week**: Create buildaq-schools repository and deploy
3. **Next Week**: Setup DNS for schools.buildaq.com
4. **Month 1**: Launch schools domain with first customers
5. **Month 2-3**: Replicate for hospital and retail domains

This independent architecture gives you:
- **Maximum flexibility** for each business domain
- **Technology choices** per domain
- **Independent scaling** and pricing
- **Clear separation** of concerns
- **Future exit strategies** (can sell individual domains)

Each domain becomes a standalone business that can grow, scale, and potentially be spun off or sold independently!