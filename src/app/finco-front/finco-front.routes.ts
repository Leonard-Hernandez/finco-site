import { Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { TransactionsStatsComponent } from './pages/transactions/transactions-stats/transactions-stats.component';

export const fincoFrontRoutes: Routes = [

    {
        path: '',
        component: DashboardPageComponent
    },
    {
        path: 'accounts',
        loadChildren: () => import ('./pages/accounts/accounts.routes')
    },
    {
        path: 'goals',
        loadChildren: () => import ('./pages/goals/goals.routes')
    },
    {
        path: 'transactions',
        component: TransactionsStatsComponent
        
    },
    {
        path: '**',
        redirectTo: ''
    }

];

export default fincoFrontRoutes;