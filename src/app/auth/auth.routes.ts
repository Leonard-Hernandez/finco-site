import { Routes } from '@angular/router';
import { AuthLayoutComponent } from '@app/auth/layouts/auth-layout/auth-layout.component';
import LoginPageComponent from '@app/auth/pages/login-page/login-page.component';
import { AuthCallbackComponent } from '@app/auth/pages/auth-callback/auth-callback.component';

/** OAuth redirect_uri registered in authco: <origin>/auth/callback. */
export const authCallbackRoutes: Routes = [
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            {
                path: '',
                component: AuthCallbackComponent
            }
        ]
    }
];

export const authRoutes: Routes = [
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            {
                path: 'login',
                component: LoginPageComponent
            },
            {
                path: '**',
                redirectTo: 'login'
            }
        ]
    }
];

export default authRoutes;
