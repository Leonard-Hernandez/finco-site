import { Routes } from '@angular/router';
import { AccountsListPageComponent } from './accounts-list-page/accounts-list-page.component';
import { AccountOpertionComponent } from './account-opertion/account-opertion.component';
import { AccountDetailsComponent } from './account-details/account-details.component';
import { AccountFormComponent } from './account-form/account-form.component';


export const accountsRoutes: Routes = [

    {
        path: '',
        component: AccountsListPageComponent
    },
    {
        path: 'details/:id',
        component: AccountDetailsComponent
    },
    {
        path: 'operation/:id/:operation',
        component: AccountOpertionComponent
    },
    {
        path: 'create',
        component: AccountFormComponent
    },
    {
        path: 'edit/:id',
        component: AccountFormComponent
    },
    {
        path: '**',
        redirectTo: ''
    }
];

export default accountsRoutes;