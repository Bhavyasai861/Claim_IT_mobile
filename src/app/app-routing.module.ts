import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    // loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
    loadChildren: () => import('./pages/authentication/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/authentication/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'admin-home',
    loadChildren: () => import('./pages/admin/admin-home/admin-home.module').then( m => m.AdminHomePageModule)
  },
  {
    path: 'additem',
    loadChildren: () => import('./pages/admin/additem/additem.module').then( m => m.AdditemPageModule)
  },
  {
    path: 'user-home',
    loadChildren: () => import('./pages/user/user-home/user-home.module').then( m => m.UserHomePageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
