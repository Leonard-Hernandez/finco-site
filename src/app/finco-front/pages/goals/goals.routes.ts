import { Routes } from '@angular/router';
import { GoalsListPageComponent } from './goals-list-page/goals-list-page.component';
import { GoalsDetailsComponent } from './goals-details/goals-details.component';
import { GoalsOpertionComponent } from './goals-opertion/goals-opertion.component';
import { GoalFormComponent } from './goal-form/goal-form.component';


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
        path: 'create',
        component: GoalFormComponent
    },
    {
        path: 'edit/:id',
        component: GoalFormComponent
    },
    {
        path: '**',
        redirectTo: ''
    }
];

export default goalsRoutes;