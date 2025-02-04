import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { SplashPage } from './pages/authentication/splash/splash.page';


const routes: Routes = [
  { path: '', redirectTo: 'splash', pathMatch: 'full' }, // Default route is splash
  { path: 'splash', component: SplashPage }, // Splash route
  {
    path: 'login',
    loadChildren: () => import('./pages/authentication/login/login.module').then(m => m.LoginPageModule),
  },
  {
    path: 'claimIt',
    component: AppComponent, // Ensure AppComponent is the first to load
    children: [


      {
        path: 'admin-home',
        loadChildren: () => import('./pages/admin/admin-home/admin-home.module').then(m => m.AdminHomePageModule)
      },
      {
        path: 'additem',
        loadChildren: () => import('./pages/admin/additem/additem.module').then(m => m.AdditemPageModule)
      },
      {
        path: 'user-home',
        loadChildren: () => import('./pages/user/user-home/user-home.module').then(m => m.UserHomePageModule)
      },
      {
        path: 'approve-reject',
        loadChildren: () => import('./pages/admin/approve-reject/approve-reject.module').then(m => m.ApproveRejectPageModule)
      },
      {
        path: 'notifications',
        loadChildren: () => import('./pages/admin/notifications/notifications.module').then(m => m.NotificationsPageModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/user/dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: 'view-claim',
        loadChildren: () => import('./pages/user/view-claim/view-claim.module').then(m => m.ViewClaimPageModule)
      },
      {
        path: 'expired-items',
        loadChildren: () => import('./pages/admin/expired-items/expired-items.module').then(m => m.ExpiredItemsPageModule)
      },

    ]
  },
  {
    path: 'splash',
    loadChildren: () => import('./pages/authentication/splash/splash.module').then( m => m.SplashPageModule)
  },
  {
    path: 'expired-items',
    loadChildren: () => import('./pages/admin/expired-items/expired-items.module').then( m => m.ExpiredItemsPageModule)
  }





];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }