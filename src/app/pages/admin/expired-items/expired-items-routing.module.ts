import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExpiredItemsPage } from './expired-items.page';

const routes: Routes = [
  {
    path: '',
    component: ExpiredItemsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpiredItemsPageRoutingModule {}
