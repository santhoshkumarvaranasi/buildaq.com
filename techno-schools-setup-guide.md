# TechnoSchools Development Setup

## Create Project Structure

```bash
# Create solution
dotnet new sln -n TechnoSchools

# Create shared libraries
dotnet new classlib -n TechnoSchools.Shared.Kernel
dotnet new classlib -n TechnoSchools.Shared.Infrastructure
dotnet new classlib -n TechnoSchools.Shared.Contracts

# Create Authentication Service
dotnet new webapi -n TechnoSchools.Auth.API
dotnet new classlib -n TechnoSchools.Auth.Core
dotnet new classlib -n TechnoSchools.Auth.Infrastructure

# Create Student Management Service
dotnet new webapi -n TechnoSchools.Student.API
dotnet new classlib -n TechnoSchools.Student.Core
dotnet new classlib -n TechnoSchools.Student.Infrastructure

# Create Academic Service
dotnet new webapi -n TechnoSchools.Academic.API
dotnet new classlib -n TechnoSchools.Academic.Core
dotnet new classlib -n TechnoSchools.Academic.Infrastructure

# Create Fee Management Service
dotnet new webapi -n TechnoSchools.Fee.API
dotnet new classlib -n TechnoSchools.Fee.Core
dotnet new classlib -n TechnoSchools.Fee.Infrastructure

# Create API Gateway
dotnet new webapi -n TechnoSchools.Gateway

# Create Angular frontend
ng new techno-schools-web --routing --style=scss --package-manager=npm

# Add projects to solution
dotnet sln add **/*.csproj
```

## Key NuGet Packages

### **Shared Infrastructure:**
```xml
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.0" />
<PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="12.0.1" />
<PackageReference Include="FluentValidation.AspNetCore" Version="11.3.0" />
<PackageReference Include="Serilog.AspNetCore" Version="8.0.0" />
<PackageReference Include="MediatR" Version="12.2.0" />
```

### **Authentication Service:**
```xml
<PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="8.0.0" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />
<PackageReference Include="Microsoft.AspNetCore.Identity.UI" Version="8.0.0" />
<PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="7.0.3" />
```

### **API Gateway:**
```xml
<PackageReference Include="Ocelot" Version="19.0.2" />
<PackageReference Include="Ocelot.Provider.Consul" Version="19.0.2" />
```

### **Real-time Communications:**
```xml
<PackageReference Include="Microsoft.AspNetCore.SignalR" Version="8.0.0" />
<PackageReference Include="Microsoft.AspNetCore.SignalR.Client" Version="8.0.0" />
```

### **Background Jobs:**
```xml
<PackageReference Include="Hangfire.Core" Version="1.8.6" />
<PackageReference Include="Hangfire.SqlServer" Version="1.8.6" />
<PackageReference Include="Hangfire.AspNetCore" Version="1.8.6" />
```

## Docker Setup

### **Docker Compose for Development:**
```yaml
version: '3.8'
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      SA_PASSWORD: "YourStrong@Password123"
      ACCEPT_EULA: "Y"
    ports:
      - "1433:1433"
    volumes:
      - sqlserver_data:/var/opt/mssql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  mongodb:
    image: mongo:7
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  # Auth Service
  auth-service:
    build:
      context: .
      dockerfile: src/Services/Auth/TechnoSchools.Auth.API/Dockerfile
    ports:
      - "5001:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Server=sqlserver;Database=TechnoSchoolsAuth;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True
    depends_on:
      - sqlserver

  # Student Service
  student-service:
    build:
      context: .
      dockerfile: src/Services/Student/TechnoSchools.Student.API/Dockerfile
    ports:
      - "5002:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Server=sqlserver;Database=TechnoSchoolsStudent;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True
    depends_on:
      - sqlserver

  # API Gateway
  gateway:
    build:
      context: .
      dockerfile: src/Web/TechnoSchools.Gateway/Dockerfile
    ports:
      - "5000:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
    depends_on:
      - auth-service
      - student-service

volumes:
  sqlserver_data:
  redis_data:
  mongodb_data:
```

## Azure Infrastructure (Bicep Template)

### **Resource Group Setup:**
```bicep
// main.bicep
param location string = resourceGroup().location
param environmentName string = 'dev'
param projectName string = 'technoschools'

// Azure SQL Server
resource sqlServer 'Microsoft.Sql/servers@2023-05-01-preview' = {
  name: '${projectName}-sql-${environmentName}'
  location: location
  properties: {
    administratorLogin: 'sqladmin'
    administratorLoginPassword: 'YourSecurePassword@123'
    version: '12.0'
  }
}

// Azure SQL Database
resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-05-01-preview' = {
  parent: sqlServer
  name: '${projectName}-db-${environmentName}'
  location: location
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: 2147483648 // 2GB
    requestedServiceObjectiveName: 'S0'
  }
}

// Azure Container Registry
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: '${projectName}acr${environmentName}'
  location: location
  sku: {
    name: 'Standard'
  }
  properties: {
    adminUserEnabled: true
  }
}

// Azure Kubernetes Service
resource aksCluster 'Microsoft.ContainerService/managedClusters@2023-08-01' = {
  name: '${projectName}-aks-${environmentName}'
  location: location
  properties: {
    dnsPrefix: '${projectName}${environmentName}'
    agentPoolProfiles: [
      {
        name: 'agentpool'
        count: 2
        vmSize: 'Standard_B2s'
        osType: 'Linux'
        mode: 'System'
      }
    ]
    servicePrincipalProfile: {
      clientId: 'msi'
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
}

// Azure Cache for Redis
resource redisCache 'Microsoft.Cache/redis@2023-08-01' = {
  name: '${projectName}-redis-${environmentName}'
  location: location
  properties: {
    sku: {
      name: 'Basic'
      family: 'C'
      capacity: 0
    }
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
  }
}

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${projectName}-ai-${environmentName}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    Request_Source: 'rest'
  }
}
```

## Development Commands

### **Database Migrations:**
```bash
# Add migration
dotnet ef migrations add InitialCreate --project TechnoSchools.Auth.Infrastructure --startup-project TechnoSchools.Auth.API

# Update database
dotnet ef database update --project TechnoSchools.Auth.Infrastructure --startup-project TechnoSchools.Auth.API
```

### **Run Services Locally:**
```bash
# Start infrastructure
docker-compose up -d sqlserver redis mongodb

# Run services
dotnet run --project src/Services/Auth/TechnoSchools.Auth.API --urls="https://localhost:5001"
dotnet run --project src/Services/Student/TechnoSchools.Student.API --urls="https://localhost:5002"
dotnet run --project src/Web/TechnoSchools.Gateway --urls="https://localhost:5000"

# Run Angular frontend
cd src/Web/techno-schools-web
npm start
```

### **Testing:**
```bash
# Unit tests
dotnet test

# Integration tests
dotnet test --filter Category=Integration

# Load tests
dotnet run --project tests/LoadTests
```