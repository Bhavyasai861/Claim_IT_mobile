import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewClaimPage } from './view-claim.page';

const routes: Routes = [
  {
    path: '',
    component: ViewClaimPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewClaimPageRoutingModule {}
