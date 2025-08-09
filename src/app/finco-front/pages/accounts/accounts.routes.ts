import { Routes } from '@angular/router';
import { AccountsListPageComponent } from './accounts-list-page/accounts-list-page.component';
import { AccountOpertionComponent } from './account-opertion/account-opertion.component';
import { AccountDetailsComponent } from './account-details/account-details.component';

export const accountsRoutes: Routes = [

    {
        path: '',
        component: AccountsListPageComponent
    },
    {
        path: ':id',
        component: AccountDetailsComponent
    },
    {
        path: ':id/:operation',
        component: AccountOpertionComponent
    },
    {
        path: '**',
        redirectTo: ''
    }
];

export default accountsRoutes;