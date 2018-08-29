import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DialogType } from '../../models/spotify.model';

@Component({
  selector: 'app-common-dialog-confirmation',
  templateUrl: './common-dialog-confirmation.component.html',
  styleUrls: ['./common-dialog-confirmation.component.scss']
})
export class CommonDialogConfirmationComponent implements OnInit {
  content: string;
  btnSubmitLabel: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data,
    private dialogRef: MatDialogRef<CommonDialogConfirmationComponent>
  ) { }

  ngOnInit() {
    if (this.data == DialogType.DeletePlaylist) {
      this.content = "Do you really want to delete this playlist?";
      this.btnSubmitLabel = "Delete";
    }
  }

  confirm() { this.dialogRef.close(true); }
}
