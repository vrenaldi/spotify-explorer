import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AboutRoutingModule } from './about-routing.module';
import { AboutComponent } from './about.component';
import { MaterialModule } from '../material.module';

@NgModule({
  imports: [
    CommonModule,
    AboutRoutingModule,
    MaterialModule
  ],
  declarations: [AboutComponent]
})
export class AboutModule { }
