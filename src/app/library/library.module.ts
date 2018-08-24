import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../material.module';

import { LibraryRoutingModule } from './library-routing.module';
import { LibraryComponent } from './library.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    LibraryRoutingModule
  ],
  declarations: [LibraryComponent]
})
export class LibraryModule { }
