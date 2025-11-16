@echo off
REM BuildAQ CI/CD Setup Script for Windows
REM This script helps set up the CI/CD pipeline for the BuildAQ platform

echo.
echo 🚀 BuildAQ CI/CD Setup Script (Windows)
echo =======================================

REM Check if running in the correct directory
if not exist "package.json" (
    echo ❌ Please run this script from the root of your BuildAQ repository
    pause
    exit /b 1
)

echo.
echo ℹ️ Setting up CI/CD pipeline for BuildAQ platform...

REM Step 1: Check prerequisites
echo.
echo ℹ️ Step 1: Checking prerequisites...

REM Check if GitHub CLI is installed
where gh >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo ✅ GitHub CLI found
    
    REM Check if user is authenticated
    gh auth status >nul 2>nul
    if %ERRORLEVEL% == 0 (
        echo ✅ GitHub CLI authenticated
    ) else (
        echo ⚠️ GitHub CLI not authenticated. Run 'gh auth login' first
    )
) else (
    echo ⚠️ GitHub CLI not found. Install from: https://cli.github.com/
)

REM Check if Azure CLI is installed
where az >nul 2>nul
if %ERRORLEVEL% == 0 (
    echo ✅ Azure CLI found
    
    REM Check if user is logged in
    az account show >nul 2>nul
    if %ERRORLEVEL% == 0 (
        echo ✅ Azure CLI authenticated
    ) else (
        echo ⚠️ Azure CLI not authenticated. Run 'az login' first
    )
) else (
    echo ⚠️ Azure CLI not found. Install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
)

REM Step 2: Create necessary directories
echo.
echo ℹ️ Step 2: Creating CI/CD configuration directories...

if not exist ".github\workflows" mkdir .github\workflows
if not exist "docker\shell" mkdir docker\shell
if not exist "docker\schools" mkdir docker\schools
if not exist "docker\hospital" mkdir docker\hospital
if not exist "docker\backend" mkdir docker\backend
if not exist "k8s\staging" mkdir k8s\staging
if not exist "k8s\production" mkdir k8s\production
if not exist "performance" mkdir performance
if not exist "monitoring\prometheus" mkdir monitoring\prometheus

echo ✅ Directory structure created

REM Step 3: Create performance test configuration
echo.
echo ℹ️ Step 3: Creating performance test configuration...

if not exist "performance\load-test.yml" (
    echo config: > performance\load-test.yml
    echo   target: 'https://api.buildaq.com' >> performance\load-test.yml
    echo   phases: >> performance\load-test.yml
    echo     - duration: 60 >> performance\load-test.yml
    echo       arrivalRate: 10 >> performance\load-test.yml
    echo     - duration: 120 >> performance\load-test.yml
    echo       arrivalRate: 50 >> performance\load-test.yml
    echo. >> performance\load-test.yml
    echo scenarios: >> performance\load-test.yml
    echo   - name: "API Load Test" >> performance\load-test.yml
    echo     flow: >> performance\load-test.yml
    echo       - get: >> performance\load-test.yml
    echo           url: "/health" >> performance\load-test.yml
    
    echo ✅ Performance test configuration created
)

REM Step 4: Instructions for manual setup
echo.
echo ℹ️ Step 4: Manual setup required...
echo.
echo Please complete the following steps manually:
echo.
echo 📋 GitHub Repository Secrets:
echo Go to: https://github.com/[your-username]/buildaq.com/settings/secrets/actions
echo Add the following secrets:
echo   - AZURE_CREDENTIALS (Azure service principal JSON)
echo   - AZURE_ACR_USERNAME (Container registry username)
echo   - AZURE_ACR_PASSWORD (Container registry password)
echo   - SNYK_TOKEN (Security scanning token)
echo.
echo 📋 Azure Resources Setup:
echo 1. Create Resource Group: buildaq-rg
echo 2. Create Container Registry: buildaq.azurecr.io
echo 3. Create Kubernetes Service: buildaq-aks
echo 4. Configure DNS for buildaq.com and subdomains
echo.
echo You can use the Azure Portal or run these Azure CLI commands:
echo.
echo az group create --name buildaq-rg --location eastus
echo az acr create --resource-group buildaq-rg --name buildaq --sku Standard --admin-enabled true
echo az aks create --resource-group buildaq-rg --name buildaq-aks --node-count 2 --attach-acr buildaq
echo.

REM Step 5: Commit instructions
echo.
echo ℹ️ Step 5: Deployment instructions...
echo.
echo 🚀 Next Steps:
echo 1. Commit and push the CI/CD files:
echo    git add .
echo    git commit -m "Add CI/CD pipeline configuration"
echo    git push origin main
echo.
echo 2. The CI/CD pipeline will trigger automatically on push to main
echo.
echo 3. Monitor deployment:
echo    - GitHub Actions: GitHub repository ^> Actions tab
echo    - Azure Portal: https://portal.azure.com
echo.
echo 4. Access your applications once deployed:
echo    - Main site: https://buildaq.com
echo    - Schools: https://schools.buildaq.com
echo    - APIs: https://api.buildaq.com/health
echo.

echo 📚 Documentation:
echo - buildaq-cicd-setup.md (Detailed CI/CD guide)
echo - buildaq-micro-frontend-architecture.md (Architecture overview)
echo - GitHub Actions logs (For troubleshooting)
echo.

echo ✅ Setup script completed successfully! 🚀
echo.
echo ⚠️ Security Reminder:
echo - Keep your secrets secure and rotate them regularly
echo - Monitor security scan results
echo - Review production deployments before approval
echo.

pause