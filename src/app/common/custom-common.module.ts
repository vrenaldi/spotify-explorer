import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../material.module';

import { CommonListComponent } from './common-list/common-list.component';
import { CommonDialogFormComponent } from './common-dialog-form/common-dialog-form.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  exports: [
    CommonListComponent
  ],
  declarations: [
    CommonListComponent,
    CommonDialogFormComponent
  ],
  entryComponents: [
    CommonDialogFormComponent
  ]
})
export class CustomCommonModule { }
