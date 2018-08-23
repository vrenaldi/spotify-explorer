import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatListModule
} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule, MatCardModule, MatIconModule, MatListModule
  ],
  exports: [
    MatButtonModule, MatCardModule, MatIconModule, MatListModule
  ],
  declarations: []
})
export class MaterialModule { }
