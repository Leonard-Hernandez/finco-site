import { Routes } from '@angular/router';
import { AuthLayoutComponent } from '@app/auth/layouts/auth-layout/auth-layout.component';
import LoginPageComponent from '@app/auth/pages/login-page/login-page.component';
import { RegisterPageComponent } from '@app/auth/pages/register-page/register-page.component';
import { OauthSuccessLoginComponent } from '@app/auth/pages/oauth-success-login/oauth-success-login.component';

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
                path: 'register',
                component: RegisterPageComponent
            },
            {
                path: 'oauth-success',
                component: OauthSuccessLoginComponent
            },
            {
                path: '**',
                redirectTo: 'login'
            }
        ]
    }
];

export default authRoutes;