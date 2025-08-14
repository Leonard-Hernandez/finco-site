import { Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { TransactionsStatsComponent } from './pages/transactions/transactions-stats/transactions-stats.component';
import { FincoFrontLayoutComponent } from './layouts/finco-front-layout/finco-front-layout.component';

export const fincoFrontRoutes: Routes = [

    {
        path: '',
        component: FincoFrontLayoutComponent,
        children: [
            {
                path: '',
                component: DashboardPageComponent
            },
            {
                path: 'accounts',
                loadChildren: () => import('./pages/accounts/accounts.routes')
            },
            {
                path: 'goals',
                loadChildren: () => import('./pages/goals/goals.routes')
            },
            {
                path: 'transactions',
                component: TransactionsStatsComponent
            },
            {
                path: '**',
                redirectTo: ''
            }
        ]
    }

];

export default fincoFrontRoutes;