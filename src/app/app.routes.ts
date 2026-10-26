import { Routes } from '@angular/router';

import { AdminLayout } from './core/theme/layouts/admin-layout/admin-layout';
import { AgentLayout } from './core/theme/layouts/agent-layout/agent-layout';
import { CustomerLayout } from './core/theme/layouts/customer-layout/customer-layout';

import { Dashboard as AdminDashboard } from './features/admin/pages/dashboard/dashboard';
import { Dashboard as AgentDashboard } from './features/agent/pages/dashboard/dashboard';
import { Dashboard as CustomerDashboard } from './features/customer/pages/dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'admin/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    component: AdminLayout,
    children: [
      {
        path: 'dashboard',
        component: AdminDashboard
      },
      {
        path: 'kyc',
        loadComponent: () =>
          import('./features/admin/pages/kyc/kyc-list/kyc-list')
            .then(m => m.KycList)
      },
      {
        path: 'kyc/:kycId',
        loadComponent: () =>
          import('./features/admin/pages/kyc/kyc-details/kyc-details')
            .then(m => m.KycDetails)
      }
    ]
  },
  {
    path: 'agent',
    component: AgentLayout,
    children: [
      {
        path: 'dashboard',
        component: AgentDashboard
      },
      {
        path: 'kyc',
        loadComponent: () =>
          import('./features/agent/pages/kyc/kyc')
            .then(m => m.AgentKyc)
      }
    ]
  },
  {
    path: 'customer',
    component: CustomerLayout,
    children: [
      {
        path: 'dashboard',
        component: CustomerDashboard
      },

{
  path: 'kyc',
  loadComponent: () =>
    import('./features/customer/pages/kyc/customer-kyc')
      .then(m => m.CustomerKycPage)
}

    ]
  },
  {
    path: '**',
    redirectTo: 'admin/dashboard'
  },
  
];
