# BuildAQ Demo Applications - Deployment Guide

This guide explains how to deploy the BuildAQ demo applications to enable subdomain access from the corporate website.

## Deployment Architecture

```
buildaq.com (Main Site)
├── schools.buildaq.com (Schools App)
├── healthcare.buildaq.com (Healthcare App - Coming Soon)
└── realestate.buildaq.com (Real Estate App - Coming Soon)
```

## 1. Schools App Deployment (schools.buildaq.com)

### Option A: Azure Static Web Apps (Recommended)

1. **Create Azure Static Web App**
   ```bash
   az staticwebapp create \
     --name buildaq-schools \
     --resource-group buildaq-rg \
     --source https://github.com/santhoshkumarvaranasi/buildaq-schools \
     --location "Central US" \
     --branch main \
     --app-location "/src" \
     --output-location "/dist"
   ```

2. **Configure Custom Domain**
   - Add CNAME record: `schools.buildaq.com` → `<your-static-web-app>.azurestaticapps.net`
   - Configure SSL certificate (automatic with Azure)

3. **Update Build Configuration**
   Create `staticwebapp.config.json` in buildaq-schools root:
   ```json
   {
     "routes": [
       {
         "route": "/remoteEntry.js",
         "headers": {
           "Access-Control-Allow-Origin": "*",
           "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
           "Access-Control-Allow-Headers": "Content-Type"
         }
       },
       {
         "route": "/*",
         "serve": "/index.html",
         "statusCode": 200
       }
     ],
     "responseOverrides": {
       "404": {
         "rewrite": "/index.html",
         "statusCode": 200
       }
     }
   }
   ```

### Option B: Netlify Deployment

1. **Connect Repository**
   - Link https://github.com/santhoshkumarvaranasi/buildaq-schools to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist/buildaq-schools`

2. **Configure Custom Domain**
   - Add custom domain: `schools.buildaq.com`
   - Set up DNS: CNAME `schools` → `<your-site>.netlify.app`

3. **Add Headers Configuration**
   Create `_headers` file in `src/assets/`:
   ```
   /remoteEntry.js
     Access-Control-Allow-Origin: *
     Access-Control-Allow-Methods: GET, POST, OPTIONS
     Access-Control-Allow-Headers: Content-Type
   
   /*
     X-Frame-Options: DENY
     X-XSS-Protection: 1; mode=block
     X-Content-Type-Options: nosniff
   ```

## 2. Update Main Website (buildaq.com)

### Update Demo Section Links

In the main `index.html`, the schools demo link is currently:
```html
<a href="https://schools.buildaq.com" target="_blank" class="demo-btn primary">
```

This will automatically work once the subdomain is deployed.

### Update Analytics Tracking

Add subdomain tracking in `script.js`:
```javascript
// Track cross-domain demo launches
function trackDemoLaunch(appType, url) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'demo_launch', {
            'demo_type': appType,
            'demo_url': url,
            'event_category': 'demo_interaction',
            'custom_map': {'custom_dimension_1': 'subdomain_access'}
        });
    }
    window.open(url, '_blank');
}
```

## 3. DNS Configuration

### Required DNS Records

Add these CNAME records to your DNS provider:

```
Type    Name        Value                           TTL
CNAME   schools     <azure-static-web-app>.azurestaticapps.net    3600
CNAME   healthcare  <future-deployment-url>                      3600  
CNAME   realestate  <future-deployment-url>                      3600
```

### Domain Verification

1. Verify domain ownership with your cloud provider
2. Configure SSL certificates (automatic with most providers)
3. Test subdomain accessibility

## 4. Cross-Origin Configuration

### CORS Headers

Ensure the schools app serves proper CORS headers for Module Federation:

```javascript
// In buildaq-schools webpack.config.js
const ModuleFederationPlugin = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederation({
  name: "schools",
  filename: "remoteEntry.js",
  exposes: {
    './SchoolsModule': './src/app/schools/schools-module.ts',
  },
  // Important: Configure for production subdomain
  publicPath: "https://schools.buildaq.com/",
});
```

### Update Shell Configuration

Update the shell app to load from production URL:

```typescript
// In buildaq-shell app.routes.ts
{
  path: 'schools',
  loadChildren: () => loadRemoteModule({
    type: 'module',
    remoteEntry: 'https://schools.buildaq.com/remoteEntry.js', // Production URL
    exposedModule: './SchoolsModule'
  }).then(m => m.SchoolsModule)
}
```

## 5. GitHub Actions CI/CD

### Schools App Auto-Deployment

Create `.github/workflows/deploy-schools.yml` in buildaq-schools:

```yaml
name: Deploy Schools App

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          output_location: "dist/buildaq-schools"
```

## 6. Testing the Integration

### Local Testing

1. Start schools app locally: `cd buildaq-schools && npm start`
2. Start shell app locally: `cd buildaq-shell && npm start`
3. Test Module Federation integration at http://localhost:4200

### Production Testing

1. Deploy schools app to `schools.buildaq.com`
2. Update shell app with production URL
3. Deploy shell app
4. Test full integration from main website

### Verification Checklist

- [ ] Schools app loads at `https://schools.buildaq.com`
- [ ] remoteEntry.js accessible at `https://schools.buildaq.com/remoteEntry.js`
- [ ] CORS headers properly configured
- [ ] SSL certificate valid
- [ ] Demo link on main site works
- [ ] Analytics tracking functional
- [ ] Module Federation integration working

## 7. Monitoring & Maintenance

### Performance Monitoring

- Set up Application Insights for Azure Static Web Apps
- Monitor Core Web Vitals for each subdomain
- Track user engagement across subdomains

### Update Process

1. Push changes to respective GitHub repositories
2. GitHub Actions automatically deploy updates
3. Verify functionality across all demo links
4. Update main website if new features added

## 8. Security Considerations

### Content Security Policy

Add CSP headers to main site for subdomain integration:

```
Content-Security-Policy: 
  default-src 'self' 
  *.buildaq.com; 
  script-src 'self' 
  'unsafe-inline' 
  *.buildaq.com 
  *.googletagmanager.com;
```

### Authentication Integration

For future cross-subdomain authentication:

- Use shared domain cookies (`.buildaq.com`)
- Implement JWT tokens for cross-domain auth
- Configure CORS for authentication endpoints

---

**Note**: Replace placeholder URLs and tokens with actual values during deployment. Ensure all secrets are properly configured in GitHub repository settings.