import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { CHAT_ROUTES } from './features/chat/chat.routes';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'login'
	},
	...AUTH_ROUTES,
	{
		path: 'dashboard',
		canActivate: [authGuard],
		loadComponent: () => import('./shared/dashboard-placeholder.component').then((m) => m.DashboardPlaceholderComponent)
	},
  ...CHAT_ROUTES,
	{
		path: '**',
		redirectTo: 'login'
	}
];
