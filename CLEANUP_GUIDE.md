# Repository Cleanup Guide

## Overview
This guide explains how to clean up the current buildaq.com repository to focus ONLY on the corporate website, removing all micro-frontend complexity.

## Current Repository Purpose
**buildaq.com repository should ONLY contain:**
- Corporate website files (HTML, CSS, JS)
- Company portfolio and marketing materials
- Contact forms and business information
- Simple deployment to GitHub Pages

## Files to Keep (Corporate Website Only)

### ✅ Essential Files
```
buildaq.com/
├── index.html                          # Main corporate website
├── script.js                           # Corporate website functionality  
├── styles.css                          # Corporate website styling
├── README.md                           # Project documentation
├── .github/workflows/deploy-corporate.yml  # Simple GitHub Pages deployment
└── buildaq-independent-architecture.md     # Architecture documentation
```

### ✅ Keep for Documentation/Reference
```
├── buildaq-micro-frontend-architecture.md   # Future reference
├── buildaq-implementation-roadmap.md        # Future reference
├── techno-schools-*.md                      # Future reference for schools domain
```

## Files to Remove (Micro-Frontend Complexity)

### ❌ Remove Complex CI/CD Files
```
├── .github/workflows/ci-cd.yml        # Complex multi-domain pipeline
├── azure-pipelines.yml                # Azure DevOps pipeline
├── buildaq-cicd-setup.md              # Complex CI/CD documentation
├── buildaq-monitoring-setup.md        # Complex monitoring setup
├── setup-cicd.sh                      # Complex setup script
├── setup-cicd.bat                     # Complex setup script
```

### ❌ Remove Docker Configurations
```
├── docker/                            # All Docker configurations
│   ├── shell/
│   ├── schools/
│   ├── backend/
│   └── ...
```

### ❌ Remove Kubernetes Configurations
```
├── k8s/                               # All Kubernetes manifests
│   ├── staging/
│   ├── production/
│   └── monitoring/
```

### ❌ Remove Monitoring Configurations
```
├── monitoring/                        # All monitoring configs
├── performance/                       # Performance testing
```

## Cleanup Commands

### Step 1: Remove Complex Files
```bash
# Remove complex CI/CD files
rm .github/workflows/ci-cd.yml
rm azure-pipelines.yml
rm buildaq-cicd-setup.md
rm buildaq-monitoring-setup.md
rm setup-cicd.sh
rm setup-cicd.bat

# Remove Docker, Kubernetes, Monitoring directories
rm -rf docker/
rm -rf k8s/
rm -rf monitoring/
rm -rf performance/

# Note: Keep buildaq-independent-architecture.md for reference
```

### Step 2: Update README.md
Update README.md to reflect the simplified corporate website focus:

```markdown
# BuildAQ Corporate Website

## Overview
This repository contains the corporate website for BuildAQ, showcasing our business solutions and company portfolio.

**Live Site**: [https://buildaq.com](https://buildaq.com)

## Repository Purpose
This repository is focused ONLY on the corporate marketing website. 

**Independent Business Domains:**
- 🏫 Schools: `buildaq-schools` repository → schools.buildaq.com
- 🏥 Hospital: `buildaq-hospital` repository → hospital.buildaq.com  
- 🛒 Retail: `buildaq-retail` repository → retail.buildaq.com
- 💰 Finance: `buildaq-finance` repository → finance.buildaq.com
- 📦 Logistics: `buildaq-logistics` repository → logistics.buildaq.com
- 👥 HRMS: `buildaq-hrms` repository → hrms.buildaq.com
- 🤝 CRM: `buildaq-crm` repository → crm.buildaq.com

## Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript
- **Deployment**: GitHub Pages
- **Domain**: buildaq.com
- **CI/CD**: GitHub Actions (simple static deployment)

## Development
```bash
# Clone repository
git clone https://github.com/santhoshkumarvaranasi/buildaq.com.git
cd buildaq.com

# Make changes to index.html, styles.css, script.js
# Test locally by opening index.html in browser

# Commit and push (auto-deploys via GitHub Actions)
git add .
git commit -m "Update corporate website"
git push origin main
```

## Architecture
Each business domain operates as a completely independent application with its own repository, tech stack, and infrastructure. See `buildaq-independent-architecture.md` for details.

## Contact
- Email: varanasi.santhoshkumar@gmail.com
- Website: https://buildaq.com
```

### Step 3: Commit Cleanup
```bash
git add .
git commit -m "Simplify repository for corporate website only

- Remove complex micro-frontend CI/CD configurations
- Remove Docker, Kubernetes, monitoring setups  
- Focus repository on corporate website deployment
- Each business domain will have separate repositories
- Keep documentation for future reference"

git push origin main
```

## Future Repository Structure

### Current Repository (buildaq.com)
**Purpose**: Corporate marketing website only
**Deployment**: GitHub Pages
**Technology**: Static HTML/CSS/JS

### Future Domain Repositories
Create separate repositories for each business domain:

```bash
# Create schools domain repository
gh repo create buildaq-schools --public
cd ../
git clone https://github.com/santhoshkumarvaranasi/buildaq-schools.git
# Setup Angular + .NET 8 stack for schools domain

# Create hospital domain repository  
gh repo create buildaq-hospital --public
cd ../
git clone https://github.com/santhoshkumarvaranasi/buildaq-hospital.git
# Setup Angular + .NET 8 stack for hospital domain

# Repeat for other domains...
```

### DNS Configuration Strategy
```
# Corporate site (current repository)
buildaq.com → GitHub Pages

# Independent business domains (future repositories)
schools.buildaq.com → Azure Container Apps (from buildaq-schools repo)
hospital.buildaq.com → Azure Container Apps (from buildaq-hospital repo)
retail.buildaq.com → Azure Container Apps (from buildaq-retail repo)
finance.buildaq.com → Azure Container Apps (from buildaq-finance repo)
logistics.buildaq.com → Azure Container Apps (from buildaq-logistics repo)
hrms.buildaq.com → Azure Container Apps (from buildaq-hrms repo)
crm.buildaq.com → Azure Container Apps (from buildaq-crm repo)
```

## Benefits of This Approach

1. **Simplicity**: Corporate site remains simple and fast
2. **Independence**: Each business domain can evolve separately
3. **Technology Freedom**: Each domain can choose its own tech stack
4. **Team Separation**: Different teams can own different domains
5. **Deployment Isolation**: Issues in one domain don't affect others
6. **Business Model Flexibility**: Each domain can have its own pricing
7. **Future Exit Strategy**: Domains can be sold or spun off independently

## Next Steps

1. **Immediate**: Clean up current repository (remove complex files)
2. **Week 1**: Create first domain repository (buildaq-schools)
3. **Week 2**: Deploy schools.buildaq.com with working Angular + .NET 8 app
4. **Month 1**: Launch schools domain with initial customers
5. **Month 2-3**: Replicate pattern for other domains

This simplified approach gives you maximum flexibility while keeping each concern separated and manageable!