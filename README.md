# BuildAQ Test Website

Simple coming soon page for BuildAQ domain.

## Local Testing

Open `index.html` in your browser to preview locally.

## Deploy to Azure Static Web Apps

### Method 1: Using Azure Portal (Easiest)

1. **Login to Azure Portal**
   - Go to https://portal.azure.com
   - Sign in with your account

2. **Create Static Web App**
   - Click "Create a resource"
   - Search for "Static Web Apps"
   - Click "Create"
   - Fill in:
     - Subscription: Your subscription
     - Resource Group: Create new → "buildaq-rg"
     - Name: buildaq
     - Region: Southeast Asia
     - Deployment source: "Other"
   - Click "Review + Create" → "Create"

3. **Upload Files**
   - Once created, go to the resource
   - Note the deployment URL (something like: https://buildaq.azurestaticapps.net)
   - You can deploy via:
     - GitHub (connect repository)
     - Azure CLI (see below)
     - VS Code extension

### Method 2: Using Azure CLI

1. **Install Azure CLI** (if not already installed)
   ```powershell
   winget install Microsoft.AzureCLI
   ```

2. **Login to Azure**
   ```powershell
   az login
   ```

3. **Create Resource Group**
   ```powershell
   az group create --name buildaq-rg --location southeastasia
   ```

4. **Create Static Web App**
   ```powershell
   az staticwebapp create --name buildaq --resource-group buildaq-rg --source . --location southeastasia --branch main --app-location / --output-location /
   ```

5. **Deploy**
   ```powershell
   az staticwebapp deploy --name buildaq --resource-group buildaq-rg --source .
   ```

### Method 3: Using VS Code Extension

1. Install "Azure Static Web Apps" extension in VS Code
2. Click Azure icon in sidebar
3. Sign in to Azure
4. Right-click on "Static Web Apps" → "Create Static Web App"
5. Follow prompts
6. Deploy your files

## Link Custom Domain (buildaq.com)

### In Azure:

1. Go to your Static Web App in Azure Portal
2. Click "Custom domains" in left menu
3. Click "+ Add"
4. Enter: `buildaq.com`
5. Azure will provide DNS records (either CNAME or TXT)

### In Namecheap:

1. Login to Namecheap
2. Go to Domain List → buildaq.com → Manage
3. Click "Advanced DNS" tab
4. Add the DNS records provided by Azure:

**Option A - CNAME (for www):**
```
Type: CNAME Record
Host: www
Value: [your-app].azurestaticapps.net
TTL: Automatic
```

**Option B - For root domain (@):**
```
Type: ALIAS or ANAME Record (if supported)
Host: @
Value: [your-app].azurestaticapps.net
```

**If ALIAS not supported, use URL Redirect:**
```
Type: URL Redirect
Host: @
Value: https://www.buildaq.com
```

5. Save changes
6. Wait 10-60 minutes for DNS propagation

## Test Your Website

Once deployed and DNS is updated:
- Visit: https://buildaq.com
- You should see your coming soon page!

## Files in This Project

- `index.html` - Main HTML page
- `styles.css` - Styling
- `staticwebapp.config.json` - Azure Static Web Apps configuration
- `README.md` - This file

## Next Steps

Once this test page is live, you can:
1. Replace it with full portfolio website
2. Add more pages
3. Set up contact forms
4. Add analytics
5. Create blog section
