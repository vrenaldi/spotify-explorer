import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MaterialModule } from '../material.module';

import { CommonListComponent } from './common-list/common-list.component';
import { CommonDialogFormComponent } from './common-dialog-form/common-dialog-form.component';
import { CommonListTracksComponent } from './common-list-tracks/common-list-tracks.component';
import { CommonSnackBarComponent } from './common-snack-bar/common-snack-bar.component';
import { CommonDialogConfirmationComponent } from './common-dialog-confirmation/common-dialog-confirmation.component';
import { CommonThumbnailComponent } from './common-thumbnail/common-thumbnail.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InfiniteScrollModule,
    MaterialModule
  ],
  exports: [
    CommonListComponent,
    CommonListTracksComponent,
    CommonThumbnailComponent
  ],
  declarations: [
    CommonListComponent,
    CommonDialogFormComponent,
    CommonListTracksComponent,
    CommonSnackBarComponent,
    CommonDialogConfirmationComponent,
    CommonThumbnailComponent
  ],
  entryComponents: [
    CommonDialogFormComponent,
    CommonSnackBarComponent,
    CommonDialogConfirmationComponent
  ]
})
export class CustomCommonModule { }
