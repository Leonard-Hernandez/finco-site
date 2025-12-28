import { Routes } from '@angular/router';
import { NotAuthenticatedGuard } from './auth/guard/not-authenticated.guard';
import { AuthenticatedGuard } from './auth/guard/authenticated.guard';
import { ChatComponent } from './finco-front/pages/ai/chat/chat.component';

export const routes: Routes = [
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
        path: 'chat',
        component: ChatComponent
    },
    {
        path: '**',
        redirectTo: ''
    }
];
