import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApproveRejectPage } from './approve-reject.page';

const routes: Routes = [
  {
    path: '',
    component: ApproveRejectPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApproveRejectPageRoutingModule {}
