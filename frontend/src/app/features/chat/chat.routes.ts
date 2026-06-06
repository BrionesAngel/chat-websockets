import { authGuard } from "@/core/guards/auth.guard";
import { Routes } from "@angular/router";

export const CHAT_ROUTES: Routes = [
  {
    path: 'chat',
    canActivate: [authGuard],
    loadComponent: () => import('./chat.component').then(m => m.ChatComponent)
  }
]
