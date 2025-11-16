# BuildAQ Shell + Module Federation Implementation Guide

## Quick Start Commands

### 1. Create Shell Repository
```powershell
# Create and clone shell repository
gh repo create buildaq-shell --public
cd ..
git clone https://github.com/santhoshkumarvaranasi/buildaq-shell.git
cd buildaq-shell

# Initialize Angular project with Module Federation
npm install -g @angular/cli @angular-architects/module-federation
ng new buildaq-shell --routing --style=scss --package-manager=npm
cd buildaq-shell
ng add @angular-architects/module-federation --project shell --type host --port 4200

# Install dependencies
npm install @nebular/theme @nebular/eva-icons @azure/msal-angular @azure/msal-browser
```

### 2. Create Schools Domain Repository  
```powershell
# Create and clone schools repository
gh repo create buildaq-schools --public
cd ..
git clone https://github.com/santhoshkumarvaranasi/buildaq-schools.git
cd buildaq-schools

# Initialize Angular project with Module Federation
ng new buildaq-schools --routing --style=scss --package-manager=npm
cd buildaq-schools
ng add @angular-architects/module-federation --project buildaq-schools --type remote --port 4201

# Install dependencies
npm install @nebular/theme @nebular/eva-icons
```

## Shell Application Implementation

### 1. Shell Module Federation Config

```typescript
// buildaq-shell/webpack.config.js
const ModuleFederationPlugin = require("@module-federation/webpack");

module.exports = {
  mode: "development",
  plugins: [
    new ModuleFederationPlugin({
      name: "shell",
      remotes: {},
      shared: {
        "@angular/core": { singleton: true, strictVersion: true },
        "@angular/common": { singleton: true, strictVersion: true },
        "@angular/router": { singleton: true, strictVersion: true },
        "@nebular/theme": { singleton: true, strictVersion: true },
        "rxjs": { singleton: true, strictVersion: true }
      }
    })
  ]
};
```

### 2. Shell App Module

```typescript
// buildaq-shell/src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { 
  NbThemeModule, 
  NbLayoutModule, 
  NbSidebarModule,
  NbMenuModule,
  NbUserModule,
  NbActionsModule,
  NbButtonModule
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

import { MsalModule, MsalService, MSAL_INSTANCE } from '@azure/msal-angular';
import { PublicClientApplication, IPublicClientApplication } from '@azure/msal-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { LayoutModule } from './layout/layout.module';

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: 'your-azure-ad-b2c-client-id',
      authority: 'https://your-tenant.b2clogin.com/your-tenant.onmicrosoft.com/B2C_1_signup_signin',
      redirectUri: window.location.origin,
    },
    cache: {
      cacheLocation: 'sessionStorage'
    }
  });
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule,
    AppRoutingModule,
    
    // Nebular modules
    NbThemeModule.forRoot({ name: 'buildaq-theme' }),
    NbLayoutModule,
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbUserModule,
    NbActionsModule,
    NbButtonModule,
    NbEvaIconsModule,
    
    // MSAL
    MsalModule,
    
    // App modules
    CoreModule,
    LayoutModule
  ],
  providers: [
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    MsalService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### 3. Remote Loader Service

```typescript
// buildaq-shell/src/app/core/remote-loader.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

export interface RemoteConfig {
  url: string;
  exposed: string;
  displayName: string;
  route: string;
  version: string;
  enabled: boolean;
}

export interface RemoteRegistry {
  [key: string]: RemoteConfig;
}

@Injectable({ providedIn: 'root' })
export class RemoteLoaderService {
  private remotes = new Map<string, any>();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  async loadRemotes(): Promise<void> {
    try {
      const registry = await this.http.get<RemoteRegistry>('/assets/remotes.json').toPromise();
      
      for (const [name, config] of Object.entries(registry)) {
        if (config.enabled) {
          await this.loadRemote(name, config);
        }
      }
    } catch (error) {
      console.error('Failed to load remotes registry:', error);
    }
  }

  private async loadRemote(name: string, config: RemoteConfig): Promise<void> {
    try {
      // Dynamically import the remote
      const container = await this.loadScript(config.url);
      await container.init(__webpack_share_scopes__.default);
      
      const factory = await container.get(config.exposed);
      const module = factory();
      
      this.remotes.set(name, { module, config });
      this.addRemoteRoute(name, config);
      
      console.log(`Successfully loaded remote: ${name}`);
    } catch (error) {
      console.error(`Failed to load remote ${name}:`, error);
      this.handleRemoteLoadError(name, error);
    }
  }

  private loadScript(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      script.onload = () => {
        const container = window[this.getContainerName(url)];
        resolve(container);
      };
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      document.head.appendChild(script);
    });
  }

  private getContainerName(url: string): string {
    // Extract container name from URL (assumes pattern like /remoteEntry.js)
    return url.includes('schools') ? 'schools' : 'unknown';
  }

  private addRemoteRoute(name: string, config: RemoteConfig): void {
    // Dynamic route addition would be implemented here
    // This is a simplified version - actual implementation would be more complex
  }

  private handleRemoteLoadError(name: string, error: any): void {
    // Provide fallback UI or redirect to error page
    console.error(`Remote ${name} failed to load:`, error);
  }

  getRemote(name: string): any {
    return this.remotes.get(name);
  }

  getLoadedRemotes(): string[] {
    return Array.from(this.remotes.keys());
  }
}
```

### 4. Authentication Service

```typescript
// buildaq-shell/src/app/core/auth.service.ts
import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult, SilentRequest } from '@azure/msal-browser';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserContext {
  userId: string;
  email: string;
  name: string;
  tenantId: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userContextSubject = new BehaviorSubject<UserContext | null>(null);
  public userContext$ = this.userContextSubject.asObservable();

  constructor(private msalService: MsalService) {
    this.initializeUserContext();
  }

  async login(): Promise<void> {
    try {
      const loginRequest = {
        scopes: ['openid', 'profile', 'email', 'offline_access'],
        prompt: 'select_account'
      };

      const result = await this.msalService.instance.loginPopup(loginRequest);
      this.setUserContext(result);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.msalService.instance.logoutPopup();
      this.userContextSubject.next(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  async getAccessToken(): Promise<string> {
    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length === 0) {
      throw new Error('No authenticated accounts found');
    }

    const silentRequest: SilentRequest = {
      scopes: ['https://buildaq.onmicrosoft.com/api/access'],
      account: accounts[0]
    };

    try {
      const result = await this.msalService.instance.acquireTokenSilent(silentRequest);
      return result.accessToken;
    } catch (error) {
      console.error('Silent token acquisition failed:', error);
      // Fallback to interactive token acquisition
      const result = await this.msalService.instance.acquireTokenPopup(silentRequest);
      return result.accessToken;
    }
  }

  getUserContext(): UserContext | null {
    return this.userContextSubject.value;
  }

  isAuthenticated(): boolean {
    const accounts = this.msalService.instance.getAllAccounts();
    return accounts.length > 0;
  }

  private initializeUserContext(): void {
    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length > 0) {
      this.setUserContextFromAccount(accounts[0]);
    }
  }

  private setUserContext(result: AuthenticationResult): void {
    if (result.account) {
      this.setUserContextFromAccount(result.account);
    }
  }

  private setUserContextFromAccount(account: any): void {
    const userContext: UserContext = {
      userId: account.localAccountId,
      email: account.username,
      name: account.name || account.username,
      tenantId: account.tenantId,
      roles: account.idTokenClaims?.roles || []
    };

    this.userContextSubject.next(userContext);
  }
}
```

### 5. Shell Layout Component

```typescript
// buildaq-shell/src/app/layout/layout.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NbMenuItem, NbMenuService } from '@nebular/theme';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, UserContext } from '../core/auth.service';
import { RemoteLoaderService } from '../core/remote-loader.service';

@Component({
  selector: 'app-layout',
  template: `
    <nb-layout>
      <nb-layout-header fixed>
        <div class="header-container">
          <div class="logo">
            <img src="/assets/images/buildaq-logo.png" alt="BuildAQ" />
          </div>
          <div class="header-actions">
            <nb-user 
              *ngIf="userContext"
              [name]="userContext.name"
              [title]="userContext.email"
              (click)="openUserMenu()">
            </nb-user>
            <nb-actions *ngIf="!userContext">
              <nb-action (click)="login()">
                <nb-icon icon="log-in-outline"></nb-icon>
                Login
              </nb-action>
            </nb-actions>
          </div>
        </div>
      </nb-layout-header>

      <nb-layout-sidebar>
        <nb-menu [items]="menuItems"></nb-menu>
      </nb-layout-sidebar>

      <nb-layout-column>
        <router-outlet></router-outlet>
      </nb-layout-column>
    </nb-layout>
  `,
  styles: [`
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 1rem;
    }
    
    .logo img {
      height: 40px;
    }
    
    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
  `]
})
export class LayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  userContext: UserContext | null = null;
  menuItems: NbMenuItem[] = [
    {
      title: 'Dashboard',
      icon: 'home-outline',
      link: '/dashboard'
    }
  ];

  constructor(
    private authService: AuthService,
    private remoteLoader: RemoteLoaderService,
    private menuService: NbMenuService
  ) {}

  ngOnInit(): void {
    this.authService.userContext$
      .pipe(takeUntil(this.destroy$))
      .subscribe(userContext => {
        this.userContext = userContext;
        if (userContext) {
          this.loadRemoteApplications();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async login(): Promise<void> {
    try {
      await this.authService.login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  openUserMenu(): void {
    // Implement user menu functionality
  }

  private async loadRemoteApplications(): Promise<void> {
    try {
      await this.remoteLoader.loadRemotes();
      this.updateMenuWithRemotes();
    } catch (error) {
      console.error('Failed to load remote applications:', error);
    }
  }

  private updateMenuWithRemotes(): void {
    const remotes = this.remoteLoader.getLoadedRemotes();
    // Update menu items with loaded remotes
    // This would be implemented based on your specific menu structure
  }
}
```

### 6. Remote Registry Configuration

```json
// buildaq-shell/src/assets/remotes.json
{
  "schools": {
    "url": "http://localhost:4201/remoteEntry.js",
    "exposed": "./SchoolsModule",
    "displayName": "School Management",
    "route": "/schools",
    "version": "1.0.0",
    "enabled": true
  }
}
```

## Schools Remote Implementation

### 1. Schools Module Federation Config

```typescript
// buildaq-schools/webpack.config.js
const ModuleFederationPlugin = require("@module-federation/webpack");

module.exports = {
  mode: "development",
  plugins: [
    new ModuleFederationPlugin({
      name: "schools",
      filename: "remoteEntry.js",
      exposes: {
        "./SchoolsModule": "./src/app/schools/schools.module.ts",
      },
      shared: {
        "@angular/core": { singleton: true, strictVersion: true },
        "@angular/common": { singleton: true, strictVersion: true },
        "@angular/router": { singleton: true, strictVersion: true },
        "@nebular/theme": { singleton: true, strictVersion: true },
        "rxjs": { singleton: true, strictVersion: true }
      }
    })
  ]
};
```

### 2. Schools Module

```typescript
// buildaq-schools/src/app/schools/schools.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { 
  NbCardModule, 
  NbListModule, 
  NbButtonModule,
  NbInputModule,
  NbFormFieldModule
} from '@nebular/theme';

import { SchoolsRoutingModule } from './schools-routing.module';
import { SchoolsComponent } from './schools.component';
import { StudentListComponent } from './components/student-list/student-list.component';
import { TeacherListComponent } from './components/teacher-list/teacher-list.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@NgModule({
  declarations: [
    SchoolsComponent,
    StudentListComponent,
    TeacherListComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SchoolsRoutingModule,
    
    // Nebular modules
    NbCardModule,
    NbListModule,
    NbButtonModule,
    NbInputModule,
    NbFormFieldModule
  ]
})
export class SchoolsModule { }
```

### 3. Schools Routing

```typescript
// buildaq-schools/src/app/schools/schools-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SchoolsComponent } from './schools.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { StudentListComponent } from './components/student-list/student-list.component';
import { TeacherListComponent } from './components/teacher-list/teacher-list.component';

const routes: Routes = [
  {
    path: '',
    component: SchoolsComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'students', component: StudentListComponent },
      { path: 'teachers', component: TeacherListComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchoolsRoutingModule { }
```

### 4. Schools Main Component

```typescript
// buildaq-schools/src/app/schools/schools.component.ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-schools',
  template: `
    <div class="schools-container">
      <h1>School Management System</h1>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .schools-container {
      padding: 2rem;
    }
    
    h1 {
      color: var(--color-primary-500);
      margin-bottom: 2rem;
    }
  `]
})
export class SchoolsComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
    console.log('Schools module loaded successfully');
  }
}
```

## CI/CD Implementation

### 1. Shell CI/CD Pipeline

```yaml
# buildaq-shell/.github/workflows/deploy.yml
name: Deploy Shell Application

on:
  push:
    branches: [ main ]

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build:prod
      
      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "dist"
          api_location: ""
          output_location: ""
```

### 2. Schools CI/CD Pipeline

```yaml
# buildaq-schools/.github/workflows/deploy.yml
name: Deploy Schools Remote

on:
  push:
    branches: [ main ]

env:
  AZURE_CONTAINER_REGISTRY: buildaq.azurecr.io

jobs:
  build-frontend:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build remote
        run: npm run build:prod
      
      - name: Upload to Azure Storage
        run: |
          az storage blob upload-batch \
            --account-name buildaq \
            --destination 'remotes/schools' \
            --source 'dist' \
            --overwrite
        env:
          AZURE_STORAGE_KEY: ${{ secrets.AZURE_STORAGE_KEY }}
      
      - name: Update remote registry
        run: |
          # Update the shell's remotes.json with new version
          curl -X POST https://api.buildaq.com/remotes/update \
            -H "Authorization: Bearer ${{ secrets.API_TOKEN }}" \
            -d '{
              "name": "schools",
              "version": "${{ github.sha }}",
              "url": "https://buildaq.blob.core.windows.net/remotes/schools/remoteEntry.js"
            }'

  build-backend:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0'
      
      - name: Restore dependencies
        run: dotnet restore backend/
      
      - name: Build application
        run: dotnet build backend/ --configuration Release --no-restore
      
      - name: Run tests
        run: dotnet test backend/ --configuration Release --no-build
      
      - name: Publish application
        run: dotnet publish backend/src/Schools.API/ --configuration Release --output ./publish
      
      - name: Build Docker image
        run: |
          docker build -t ${{ env.AZURE_CONTAINER_REGISTRY }}/schools-api:${{ github.sha }} .
      
      - name: Login to ACR
        run: |
          echo ${{ secrets.ACR_PASSWORD }} | docker login ${{ env.AZURE_CONTAINER_REGISTRY }} -u ${{ secrets.ACR_USERNAME }} --password-stdin
      
      - name: Push Docker image
        run: |
          docker push ${{ env.AZURE_CONTAINER_REGISTRY }}/schools-api:${{ github.sha }}
      
      - name: Deploy to Container Apps
        run: |
          az containerapp update \
            --name schools-api \
            --resource-group buildaq-rg \
            --image ${{ env.AZURE_CONTAINER_REGISTRY }}/schools-api:${{ github.sha }}
```

## Development Commands

### Start Shell Development
```bash
cd buildaq-shell
npm install
npm start
# Shell runs on http://localhost:4200
```

### Start Schools Remote Development
```bash
cd buildaq-schools  
npm install
npm start
# Remote runs on http://localhost:4201
```

### Build for Production
```bash
# Shell
cd buildaq-shell
npm run build:prod

# Schools Remote
cd buildaq-schools
npm run build:prod
```

### Test Integration Locally
```bash
# Start both applications
# Shell will load remote from localhost:4201
# Test navigation between shell and remote
```

This implementation provides a complete working example of the Shell + Module Federation architecture for BuildAQ's multi-domain platform. Each piece can be developed and deployed independently while maintaining a consistent user experience.