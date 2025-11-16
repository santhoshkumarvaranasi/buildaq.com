# TechnoSchools Frontend Architecture

## Angular + Nebular Implementation Guide

### **Why Angular + Nebular for School Management:**

**🏫 Perfect for Educational Platforms:**
- **Admin dashboards** with rich data tables
- **Student/Teacher portals** with different layouts
- **Parent interfaces** optimized for mobile
- **Real-time notifications** and updates
- **Multi-role navigation** and permissions

### **Nebular Features for Schools:**

**📊 Data Visualization:**
- **Student performance charts** (built-in Chart.js integration)
- **Attendance heat maps** and calendars
- **Financial dashboards** for fee tracking
- **Academic progress visualizations**

**📱 Mobile-First Design:**
- **Responsive sidebar** that collapses on mobile
- **Touch-optimized** components for tablets
- **PWA capabilities** for app-like experience
- **Offline data** for attendance marking

**🎨 Professional Themes:**
- **Multiple built-in themes** (light, dark, cosmic)
- **Customizable color schemes** per school branding
- **Consistent design language** across all modules

## Project Setup

### **1. Create Angular Project with Nebular:**

```bash
# Create Angular project
ng new techno-schools-web --routing --style=scss --package-manager=npm

# Navigate to project
cd techno-schools-web

# Add Nebular
ng add @nebular/theme

# Add additional Nebular modules
npm install @nebular/eva-icons
npm install @eva-design/eva
npm install nebular-icons

# Add complementary packages
npm install @angular/cdk
npm install chart.js
npm install ng2-charts
npm install @angular/pwa
npm install rxjs
npm install @ngrx/store @ngrx/effects @ngrx/store-devtools
```

### **2. Project Structure:**

```
src/
├── app/
│   ├── core/                 # Singleton services, guards, interceptors
│   │   ├── auth/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── services/
│   ├── shared/              # Shared components, pipes, directives
│   │   ├── components/
│   │   ├── pipes/
│   │   └── models/
│   ├── features/            # Feature modules
│   │   ├── dashboard/
│   │   ├── students/
│   │   ├── teachers/
│   │   ├── academics/
│   │   ├── fees/
│   │   └── reports/
│   ├── layouts/             # Different layouts for different user roles
│   │   ├── admin-layout/
│   │   ├── teacher-layout/
│   │   ├── student-layout/
│   │   └── parent-layout/
│   └── theme/               # Custom theme configuration
├── assets/
│   ├── images/
│   ├── icons/
│   └── themes/
├── environments/
└── styles/
```

### **3. Nebular Theme Configuration:**

```typescript
// src/app/theme/theme.module.ts
import { NgModule } from '@angular/core';
import { 
  NbThemeModule, 
  NbLayoutModule, 
  NbSidebarModule,
  NbMenuModule,
  NbUserModule,
  NbActionsModule,
  NbSearchModule,
  NbContextMenuModule,
  NbButtonModule,
  NbCardModule,
  NbTabsetModule,
  NbRouteTabsetModule,
  NbStepperModule,
  NbListModule,
  NbAccordionModule,
  NbProgressBarModule,
  NbCalendarModule,
  NbCalendarRangeModule,
  NbDatepickerModule,
  NbDialogModule,
  NbToastrModule,
  NbTooltipModule,
  NbSpinnerModule,
  NbSelectModule,
  NbInputModule,
  NbCheckboxModule,
  NbRadioModule,
  NbToggleModule,
  NbFormFieldModule,
  NbIconModule,
  NbEvaIconsModule,
  NbAlertModule,
  NbPopoverModule,
  NbChatModule,
  NbTableModule,
  NbTreeGridModule
} from '@nebular/theme';

const NB_MODULES = [
  NbLayoutModule,
  NbSidebarModule,
  NbMenuModule,
  NbUserModule,
  NbActionsModule,
  NbSearchModule,
  NbContextMenuModule,
  NbButtonModule,
  NbCardModule,
  NbTabsetModule,
  NbRouteTabsetModule,
  NbStepperModule,
  NbListModule,
  NbAccordionModule,
  NbProgressBarModule,
  NbCalendarModule,
  NbCalendarRangeModule,
  NbDatepickerModule,
  NbDialogModule.forRoot(),
  NbToastrModule.forRoot(),
  NbTooltipModule,
  NbSpinnerModule,
  NbSelectModule,
  NbInputModule,
  NbCheckboxModule,
  NbRadioModule,
  NbToggleModule,
  NbFormFieldModule,
  NbIconModule,
  NbEvaIconsModule,
  NbAlertModule,
  NbPopoverModule,
  NbChatModule,
  NbTableModule,
  NbTreeGridModule
];

@NgModule({
  imports: [
    NbThemeModule.forRoot(
      {
        name: 'default',
      },
      [ // themes
        {
          name: 'default',
          base: 'default',
        },
        {
          name: 'dark',
          base: 'dark',
        },
        {
          name: 'cosmic',
          base: 'cosmic',
        },
        {
          name: 'corporate',
          base: 'corporate',
        },
      ],
      { // layout direction
        direction: 'ltr',
      },
    ),
    ...NB_MODULES,
  ],
  exports: [
    ...NB_MODULES,
  ],
})
export class ThemeModule { }
```

### **4. Custom School Theme:**

```scss
// src/themes/school-theme.scss
@import '~@nebular/theme/styles/theming';
@import '~@eva-design/eva/themes/eva';

// Custom color scheme for schools
$nb-theme: nb-register-theme((
  color-basic-100: #ffffff,
  color-basic-200: #f7f9fc,
  color-basic-300: #edf1f7,
  color-basic-400: #e4e9f2,
  color-basic-500: #c5cee0,
  color-basic-600: #8f9bb3,
  color-basic-700: #2e3a59,
  color-basic-800: #222b45,
  color-basic-900: #192038,
  color-basic-1000: #151a30,
  color-basic-1100: #101426,

  color-primary-100: #d6f4ff,
  color-primary-200: #abdcff,
  color-primary-300: #7db8ff,
  color-primary-400: #598eff,
  color-primary-500: #2448ff, // School primary color
  color-primary-600: #1a35db,
  color-primary-700: #1225b7,
  color-primary-800: #0b1793,
  color-primary-900: #060f7a,

  color-success-100: #dffff3,
  color-success-200: #bffde7,
  color-success-300: #9cf7db,
  color-success-400: #81eed0,
  color-success-500: #5ce2c2, // Success color for attendance
  color-success-600: #42c2a5,
  color-success-700: #2ba388,
  color-success-800: #19846c,
  color-success-900: #0e6d58,

  color-warning-100: #fffad6,
  color-warning-200: #fff2ad,
  color-warning-300: #ffe684,
  color-warning-400: #ffda65,
  color-warning-500: #ffc73a, // Warning for pending fees
  color-warning-600: #db9e2a,
  color-warning-700: #b7781d,
  color-warning-800: #935512,
  color-warning-900: #7a3e0a,

  color-danger-100: #ffe8d6,
  color-danger-200: #ffcaad,
  color-danger-300: #ffa684,
  color-danger-400: #ff8565,
  color-danger-500: #ff5933, // Danger for absences
  color-danger-600: #db3b25,
  color-danger-700: #b7261a,
  color-danger-800: #931612,
  color-danger-900: #7a0c0d,
), default, default);
```

### **5. Layout Components for Different Roles:**

```typescript
// src/app/layouts/admin-layout/admin-layout.component.ts
import { Component } from '@angular/core';
import { NbMenuItem } from '@nebular/theme';

@Component({
  selector: 'app-admin-layout',
  template: `
    <nb-layout windowMode>
      <nb-layout-header fixed>
        <nb-header>
          <nb-actions size="small">
            <nb-action icon="menu-outline" (click)="toggleSidebar()"></nb-action>
          </nb-actions>
          
          <nb-actions size="small" class="header-right">
            <nb-action icon="bell-outline" [badge]="notificationCount"></nb-action>
            <nb-action>
              <nb-user [menu]="userMenu" name="Admin User" title="School Administrator">
              </nb-user>
            </nb-action>
          </nb-actions>
        </nb-header>
      </nb-layout-header>

      <nb-layout-column>
        <nb-sidebar class="menu-sidebar" tag="menu-sidebar">
          <nb-menu [items]="menuItems"></nb-menu>
        </nb-sidebar>
        
        <nb-layout-column class="main-content">
          <router-outlet></router-outlet>
        </nb-layout-column>
      </nb-layout-column>
    </nb-layout>
  `
})
export class AdminLayoutComponent {
  notificationCount = 5;
  
  menuItems: NbMenuItem[] = [
    {
      title: 'Dashboard',
      icon: 'home-outline',
      link: '/admin/dashboard',
    },
    {
      title: 'Students',
      icon: 'people-outline',
      children: [
        {
          title: 'All Students',
          link: '/admin/students',
        },
        {
          title: 'Admissions',
          link: '/admin/students/admissions',
        },
        {
          title: 'Attendance',
          link: '/admin/students/attendance',
        }
      ],
    },
    {
      title: 'Teachers',
      icon: 'person-outline',
      link: '/admin/teachers',
    },
    {
      title: 'Academics',
      icon: 'book-outline',
      children: [
        {
          title: 'Classes & Sections',
          link: '/admin/academics/classes',
        },
        {
          title: 'Subjects',
          link: '/admin/academics/subjects',
        },
        {
          title: 'Timetable',
          link: '/admin/academics/timetable',
        }
      ],
    },
    {
      title: 'Fee Management',
      icon: 'credit-card-outline',
      link: '/admin/fees',
    },
    {
      title: 'Reports',
      icon: 'bar-chart-outline',
      children: [
        {
          title: 'Academic Reports',
          link: '/admin/reports/academic',
        },
        {
          title: 'Financial Reports',
          link: '/admin/reports/financial',
        },
        {
          title: 'Attendance Reports',
          link: '/admin/reports/attendance',
        }
      ],
    }
  ];

  userMenu = [
    { title: 'Profile' },
    { title: 'Settings' },
    { title: 'Logout' }
  ];

  toggleSidebar() {
    // Implementation for sidebar toggle
  }
}
```

## Key Benefits of This Setup:

### **🎯 Perfect for Schools:**
- **Role-based layouts** (Admin, Teacher, Student, Parent views)
- **Rich data tables** for student/teacher management
- **Calendar components** for events and scheduling
- **Chart components** for analytics and reports
- **Mobile-optimized** for teachers using tablets

### **🚀 Performance Benefits:**
- **Lazy loading** for each feature module
- **PWA capabilities** for offline attendance
- **Optimized bundle sizes** with tree shaking
- **Fast rendering** with OnPush change detection

### **🔧 Developer Experience:**
- **Consistent UI components** across the entire app
- **Type-safe** development with TypeScript
- **Easy theming** and customization
- **Rich documentation** and community support

**This Angular + Nebular setup gives you enterprise-grade UI components specifically designed for admin interfaces like school management systems! 🏫📱**