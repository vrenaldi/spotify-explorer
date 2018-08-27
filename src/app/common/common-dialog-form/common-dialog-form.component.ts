import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { DialogType } from '../../models/spotify.model';

@Component({
  selector: 'app-common-dialog-form',
  templateUrl: './common-dialog-form.component.html',
  styleUrls: ['./common-dialog-form.component.scss']
})
export class CommonDialogFormComponent implements OnInit {
  dialogType = DialogType;

  title: string;
  btnSubmitLabel: string;
  contentForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<CommonDialogFormComponent>,
  ) { }

  ngOnInit() {
    if (this.data == DialogType.CreatePlaylist) {
      this.title = "Create New Playlist";
      this.btnSubmitLabel = "Create";

      this.contentForm = this.formBuilder.group({
        playlistName: ["", Validators.required]
      });
    }
  }

  formSubmit() { this.dialogRef.close(this.contentForm.value); }
}
