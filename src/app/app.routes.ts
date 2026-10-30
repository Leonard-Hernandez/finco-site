import { Routes } from '@angular/router';
import { NotAuthenticatedGuard } from './auth/guard/not-authenticated.guard';
import { AuthenticatedGuard } from './auth/guard/authenticated.guard';

export const routes: Routes = [
    {
        // Unguarded: the Back button can replay the callback while a session is valid.
        path: 'auth/callback',
        loadChildren: () => import ('./auth/auth.routes').then((m) => m.authCallbackRoutes)
    },
    {
        path: 'auth',
        loadChildren: () => import ('./auth/auth.routes'),
        canMatch:[NotAuthenticatedGuard]
    },
    {
        path: '',
        canMatch:[AuthenticatedGuard],
        loadChildren: () => import ('./finco-front/finco-front.routes'),
    },
    {
        path: '**',
        redirectTo: ''
    }
];
