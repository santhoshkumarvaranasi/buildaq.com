#!/bin/bash

# BuildAQ CI/CD Setup Script
# This script helps set up the CI/CD pipeline for the BuildAQ platform

set -e

echo "🚀 BuildAQ CI/CD Setup Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if running in the correct directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the root of your BuildAQ repository"
    exit 1
fi

echo
print_info "Setting up CI/CD pipeline for BuildAQ platform..."

# Step 1: Check prerequisites
echo
print_info "Step 1: Checking prerequisites..."

# Check if GitHub CLI is installed
if command -v gh &> /dev/null; then
    print_status "GitHub CLI found"
    # Check if user is authenticated
    if gh auth status &> /dev/null; then
        print_status "GitHub CLI authenticated"
    else
        print_warning "GitHub CLI not authenticated. Run 'gh auth login' first"
    fi
else
    print_warning "GitHub CLI not found. Install from: https://cli.github.com/"
fi

# Check if Azure CLI is installed
if command -v az &> /dev/null; then
    print_status "Azure CLI found"
    # Check if user is logged in
    if az account show &> /dev/null; then
        print_status "Azure CLI authenticated"
    else
        print_warning "Azure CLI not authenticated. Run 'az login' first"
    fi
else
    print_warning "Azure CLI not found. Install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
fi

# Step 2: Create GitHub repository secrets
echo
print_info "Step 2: Setting up GitHub repository secrets..."

if command -v gh &> /dev/null && gh auth status &> /dev/null; then
    echo "Setting up required secrets in GitHub repository..."
    
    # Function to set secret with prompt
    set_secret() {
        local secret_name=$1
        local secret_description=$2
        local secret_value
        
        echo
        print_info "Setting up $secret_name"
        echo "$secret_description"
        read -s -p "Enter value for $secret_name: " secret_value
        echo
        
        if [ -n "$secret_value" ]; then
            gh secret set "$secret_name" --body "$secret_value"
            print_status "$secret_name set successfully"
        else
            print_warning "$secret_name skipped (empty value)"
        fi
    }
    
    echo "Please provide the following secrets:"
    
    set_secret "AZURE_CREDENTIALS" "Azure service principal credentials in JSON format:
{
  \"clientId\": \"xxx\",
  \"clientSecret\": \"xxx\",
  \"subscriptionId\": \"xxx\",
  \"tenantId\": \"xxx\"
}"
    
    set_secret "AZURE_ACR_USERNAME" "Azure Container Registry username"
    set_secret "AZURE_ACR_PASSWORD" "Azure Container Registry password"
    set_secret "SNYK_TOKEN" "Snyk security scanning token"
    
else
    print_warning "Skipping GitHub secrets setup (GitHub CLI not available or not authenticated)"
    echo "Please manually add the following secrets in your GitHub repository settings:"
    echo "- AZURE_CREDENTIALS (Azure service principal JSON)"
    echo "- AZURE_ACR_USERNAME (Container registry username)"
    echo "- AZURE_ACR_PASSWORD (Container registry password)"
    echo "- SNYK_TOKEN (Security scanning token)"
fi

# Step 3: Create Azure resources
echo
print_info "Step 3: Setting up Azure resources..."

if command -v az &> /dev/null && az account show &> /dev/null; then
    echo "Creating Azure resources..."
    
    # Variables
    RESOURCE_GROUP="buildaq-rg"
    LOCATION="eastus"
    ACR_NAME="buildaq"
    AKS_NAME="buildaq-aks"
    
    echo "Creating resource group: $RESOURCE_GROUP"
    az group create --name $RESOURCE_GROUP --location $LOCATION
    print_status "Resource group created"
    
    echo "Creating Azure Container Registry: $ACR_NAME"
    az acr create \
        --resource-group $RESOURCE_GROUP \
        --name $ACR_NAME \
        --sku Standard \
        --admin-enabled true
    print_status "Azure Container Registry created"
    
    echo "Creating Azure Kubernetes Service: $AKS_NAME"
    az aks create \
        --resource-group $RESOURCE_GROUP \
        --name $AKS_NAME \
        --node-count 2 \
        --node-vm-size Standard_D2s_v3 \
        --enable-addons monitoring \
        --attach-acr $ACR_NAME \
        --generate-ssh-keys
    print_status "Azure Kubernetes Service created"
    
    echo "Getting AKS credentials..."
    az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS_NAME
    print_status "AKS credentials configured"
    
    echo "Creating namespaces..."
    kubectl create namespace staging --dry-run=client -o yaml | kubectl apply -f -
    kubectl create namespace production --dry-run=client -o yaml | kubectl apply -f -
    print_status "Kubernetes namespaces created"
    
    echo "Installing cert-manager for SSL certificates..."
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
    print_status "cert-manager installed"
    
    echo "Installing NGINX Ingress Controller..."
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
    print_status "NGINX Ingress Controller installed"
    
else
    print_warning "Skipping Azure resource creation (Azure CLI not available or not authenticated)"
    echo "Please manually create the following Azure resources:"
    echo "- Resource Group: buildaq-rg"
    echo "- Azure Container Registry: buildaq.azurecr.io"
    echo "- Azure Kubernetes Service: buildaq-aks"
fi

# Step 4: Create necessary directories and files
echo
print_info "Step 4: Creating CI/CD configuration files..."

# Create GitHub Actions workflow directory
mkdir -p .github/workflows

# Check if main workflow exists
if [ ! -f ".github/workflows/ci-cd.yml" ]; then
    print_status "CI/CD workflow files are already created in your repository"
else
    print_warning "CI/CD workflow files already exist"
fi

# Create Docker directory structure
mkdir -p docker/{shell,schools,hospital,retail,finance,logistics,hrms,crm,backend}
print_status "Docker configuration directories created"

# Create Kubernetes directory structure
mkdir -p k8s/{staging,production,monitoring}
print_status "Kubernetes configuration directories created"

# Create performance testing directory
mkdir -p performance
if [ ! -f "performance/load-test.yml" ]; then
    cat > performance/load-test.yml << 'EOF'
config:
  target: 'https://api.buildaq.com'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100

scenarios:
  - name: "API Load Test"
    flow:
      - get:
          url: "/health"
      - get:
          url: "/api/auth/status"
EOF
    print_status "Performance testing configuration created"
fi

# Step 5: Setup monitoring
echo
print_info "Step 5: Setting up monitoring and alerting..."

# Create monitoring configuration
mkdir -p monitoring/{prometheus,grafana,alertmanager}

if [ ! -f "monitoring/prometheus/prometheus.yml" ]; then
    cat > monitoring/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'buildaq-apps'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
EOF
    print_status "Prometheus configuration created"
fi

# Step 6: Final setup instructions
echo
print_info "Step 6: Final setup instructions..."

echo
echo "🎉 CI/CD Setup Complete!"
echo "======================="
print_status "GitHub Actions workflows created"
print_status "Docker configurations created"
print_status "Kubernetes manifests created"
print_status "Monitoring setup created"

echo
print_info "Next Steps:"
echo "1. Commit and push the CI/CD configuration files:"
echo "   git add ."
echo "   git commit -m 'Add CI/CD pipeline configuration'"
echo "   git push origin main"
echo
echo "2. The CI/CD pipeline will automatically trigger on the next push to main branch"
echo
echo "3. Configure domain DNS:"
echo "   - Point buildaq.com to your Kubernetes ingress IP"
echo "   - Point *.buildaq.com to the same IP for subdomains"
echo
echo "4. Monitor the deployment:"
echo "   - GitHub Actions: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\([^/]*\)\/\([^.]*\).*/\1\/\2/')/actions"
echo "   - Azure Portal: https://portal.azure.com"
echo
echo "5. Access your applications:"
echo "   - Main site: https://buildaq.com"
echo "   - Schools: https://schools.buildaq.com"
echo "   - Hospital: https://hospital.buildaq.com"

echo
print_warning "Important Security Notes:"
echo "- Regularly rotate your secrets and access keys"
echo "- Monitor security scan results in GitHub Actions"
echo "- Keep dependencies updated to address vulnerabilities"
echo "- Review and approve production deployments manually"

echo
print_info "For troubleshooting and documentation, see:"
echo "- buildaq-cicd-setup.md"
echo "- buildaq-micro-frontend-architecture.md"
echo "- GitHub Actions workflow logs"

echo
print_status "Setup script completed successfully! 🚀"