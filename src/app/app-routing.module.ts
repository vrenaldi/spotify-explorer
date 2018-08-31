import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from "./auth.guard";

const routes: Routes = [
  { path: "search", loadChildren: "./search/search.module#SearchModule", canLoad: [AuthGuard] },
  { path: "library", loadChildren: "./library/library.module#LibraryModule", canLoad: [AuthGuard] },
  { path: "view", loadChildren: "./view/view.module#ViewModule", canLoad: [AuthGuard] },
  { path: "", redirectTo: "library", pathMatch: "full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
