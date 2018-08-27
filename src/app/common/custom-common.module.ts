import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../material.module';

import { CommonListComponent } from './common-list/common-list.component';
import { CommonDialogFormComponent } from './common-dialog-form/common-dialog-form.component';
import { CommonListTracksComponent } from './common-list-tracks/common-list-tracks.component';
import { CommonSnackBarComponent } from './common-snack-bar/common-snack-bar.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  exports: [
    CommonListComponent,
    CommonListTracksComponent
  ],
  declarations: [
    CommonListComponent,
    CommonDialogFormComponent,
    CommonListTracksComponent,
    CommonSnackBarComponent
  ],
  entryComponents: [
    CommonDialogFormComponent,
    CommonSnackBarComponent
  ]
})
export class CustomCommonModule { }
