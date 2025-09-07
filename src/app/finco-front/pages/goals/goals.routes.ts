import { Routes } from '@angular/router';
import { GoalsListPageComponent } from './goals-list-page/goals-list-page.component';
import { GoalsDetailsComponent } from './goals-details/goals-details.component';
import { GoalsOpertionComponent } from './goals-opertion/goals-opertion.component';


export const goalsRoutes: Routes = [

    {
        path: '',
        component: GoalsListPageComponent
    },
    {
        path: 'details/:id',
        component: GoalsDetailsComponent
    },
    {
        path: 'operation/:id/:operation',
        component: GoalsOpertionComponent
    },
    {
        path: '**',
        redirectTo: ''
    }
];

export default goalsRoutes;