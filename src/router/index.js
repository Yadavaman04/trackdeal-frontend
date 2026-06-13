import { createRouter, createWebHistory } from 'vue-router';
import { setupRouterGuards } from './guards';
import { h } from 'vue';
import { authRoutes } from '@/modules/auth';

// Top-Level Layouts
const AuthLayout = () => import('@/layouts/AuthLayout.vue');
const AppLayout = () => import('@/layouts/AppLayout.vue');
const SettingsLayout = () => import('@/layouts/SettingsLayout.vue');
const ReportLayout = () => import('@/layouts/ReportLayout.vue');
const Dashboard = () => import('@/modules/dashboards/pages/Dashboard.vue');

// Helper function to render a quick placeholder view to keep scaffolding compilable
const defineMockView = (title) => ({
  name: `${title.replace(/\s+/g, '')}Placeholder`,
  render() {
    return h('div', { class: 'p-6 bg-surface border border-default rounded-lg shadow-sm' }, [
      h('h1', { class: 'font-heading text-xl font-bold mb-2' }, `${title} View`),
      h('p', { class: 'text-slate-600 text-sm' }, `Scaffolding placeholder workspace. Business logic implementation is pending.`)
    ]);
  }
});

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/',
    component: AuthLayout,
    children: authRoutes
  },
  {
    path: '/app',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/app/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard
      },

      {
        path: 'leads',
        name: 'Leads',
        component: () => import('@/modules/leads/pages/LeadsList.vue')
      },
      {
        path: 'leads/:id',
        name: 'LeadDetails',
        component: () => import('@/modules/leads/pages/LeadDetails.vue')
      },
      {
        path: 'deals',
        name: 'Deals',
        component: () => import('@/modules/deals/pages/DealsList.vue')
      },
      {
        path: 'deals/:id',
        name: 'DealDetails',
        component: () => import('@/modules/deals/pages/DealDetails.vue')
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: () => import('@/modules/tasks/pages/TasksList.vue')
      },
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('@/modules/properties/pages/ProjectsList.vue')
      },
      {
        path: 'projects/:id',
        name: 'ProjectDetails',
        component: () => import('@/modules/properties/pages/ProjectDetails.vue')
      },
      {
        path: 'projects/:id/analytics',
        name: 'ProjectAnalytics',
        component: () => import('@/modules/properties/pages/ProjectAnalytics.vue')
      },
      {
        path: 'properties',
        name: 'Properties',
        component: () => import('@/modules/properties/pages/PropertiesList.vue')
      },
      {
        path: 'properties/:id',
        name: 'PropertyDetails',
        component: () => import('@/modules/properties/pages/PropertyDetails.vue')
      },
      {
        path: 'builders',
        name: 'Builders',
        component: () => import('@/modules/properties/pages/BuildersList.vue')
      },
      {
        path: 'builders/:id',
        name: 'BuilderDetails',
        component: () => import('@/modules/properties/pages/BuilderDetails.vue')
      },
      {
        path: 'commissions',
        name: 'CommissionsDashboard',
        component: () => import('@/modules/commissions/pages/CommissionsDashboard.vue'),
        meta: { permission: 'commissions.read', featureFlag: 'commissionModule' }
      },
      {
        path: 'commissions/list',
        name: 'CommissionsList',
        component: () => import('@/modules/commissions/pages/CommissionsList.vue'),
        meta: { permission: 'commissions.read', featureFlag: 'commissionModule' }
      },
      {
        path: 'commissions/:id',
        name: 'CommissionDetails',
        component: () => import('@/modules/commissions/pages/CommissionDetails.vue'),
        meta: { permission: 'commissions.read', featureFlag: 'commissionModule' }
      },
      {
        path: 'reports',
        component: ReportLayout,
        meta: { featureFlag: 'reportsModule' },
        children: [
          {
            path: '',
            redirect: '/app/reports/dashboard'
          },
          {
            path: 'dashboard',
            name: 'ReportsDashboard',
            component: () => import('@/modules/reports/pages/ReportsDashboard.vue')
          },
          {
            path: 'builder',
            name: 'CustomReportBuilder',
            component: () => import('@/modules/reports/pages/CustomReportBuilder.vue')
          },
          {
            path: 'export',
            name: 'ExportCenter',
            component: () => import('@/modules/reports/pages/ExportCenter.vue')
          },
          {
            path: 'viewer/:type',
            name: 'ReportViewer',
            component: () => import('@/modules/reports/pages/ReportViewer.vue')
          }
        ]
      },
      {
        path: 'settings',
        component: SettingsLayout,
        children: [
          {
            path: '',
            redirect: '/app/settings/org'
          },
          {
            path: 'org',
            name: 'OrgSettings',
            component: () => import('@/modules/settings/pages/OrgSettings.vue')
          },
          {
            path: 'branches',
            name: 'BranchSettings',
            component: () => import('@/modules/settings/pages/BranchSettings.vue'),
            meta: { requiresOrgType: ['ENTERPRISE_AGENCY'] }
          },
          {
            path: 'users',
            name: 'UserSettings',
            component: () => import('@/modules/settings/pages/UserSettings.vue'),
            meta: { requiresOrgType: ['AGENCY', 'ENTERPRISE_AGENCY'] }
          },
          {
            path: 'roles',
            name: 'RoleSettings',
            component: () => import('@/modules/settings/pages/RoleSettings.vue'),
            meta: { requiresOrgType: ['AGENCY', 'ENTERPRISE_AGENCY'] }
          }
        ]
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: {
      render() {
        return h('div', { class: 'min-h-screen flex items-center justify-center bg-background' }, [
          h('div', { class: 'text-center' }, [
            h('h1', { class: 'font-heading text-4xl font-bold text-red-500 mb-2' }, '404'),
            h('p', { class: 'text-slate-600 mb-4' }, 'The page you requested could not be found.'),
            h('a', { href: '/app/dashboard', class: 'px-4 py-2 bg-primary text-white rounded font-medium' }, 'Back to Dashboard')
          ])
        ]);
      }
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
});

setupRouterGuards(router);

export default router;
