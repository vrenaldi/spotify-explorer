import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DialogType, Playlist, Batch, User } from '../../models/spotify.model';
import { DataService } from '../../services/data.service';
import { SpotifyService } from '../../services/spotify.service';

@Component({
  selector: 'app-common-dialog-form',
  templateUrl: './common-dialog-form.component.html',
  styleUrls: ['./common-dialog-form.component.scss']
})
export class CommonDialogFormComponent implements OnInit, OnDestroy {
  dialogType = DialogType;
  currUser: User;

  title: string;
  btnSubmitLabel: string;
  contentForm: FormGroup;

  playlists: Playlist[];
  playlistsFiltered: Playlist[];
  total: number;
  isLoading: boolean;

  unsubscribe: Subject<any> = new Subject();

  constructor(
    @Inject(MAT_DIALOG_DATA) private data,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<CommonDialogFormComponent>,
    private dataService: DataService,
    private spotifyService: SpotifyService
  ) { }

  ngOnInit() {
    if (this.data == DialogType.CreatePlaylist) {
      this.title = "Create New Playlist";
      this.btnSubmitLabel = "Create";

      this.contentForm = this.formBuilder.group({
        playlistName: ["", Validators.required]
      });
    }
    else if (this.data == DialogType.AddToPlaylist) {
      this.dataService.currUser.pipe(takeUntil(this.unsubscribe))
        .subscribe(user => { this.currUser = user; });

      this.title = "Add to playlist";
      this.btnSubmitLabel = "Add";
      this.contentForm = this.formBuilder.group({
        "playlists": [[], Validators.required]
      });

      this.playlists = [];
      this.playlistsFiltered = [];
      this.total = 0;
      this.isLoading = false;

      this.getCurrUserPlaylists(new Batch());
    }
  }

  getCurrUserPlaylists(currBatch: Batch) {
    this.isLoading = true;
    this.spotifyService.getCurrUserPlaylists(currBatch).pipe(takeUntil(this.unsubscribe))
      .subscribe(
        ([playlists, total]: [Playlist[], number]) => {
          this.playlists = this.playlists.concat(playlists);
          this.playlistsFiltered = this.playlists.filter(playlist => playlist.owner.id == this.currUser.id);
          this.total = total;

          this.isLoading = false;
        },
      // (response: HttpErrorResponse) => {
      //   localStorage.setItem("redirectURL", "/library/playlists");
      //   this.spotifyService.onError(response);
      // }
    );
  }

  loadMore() {
    if ((this.playlists.length >= this.total) || this.isLoading) return;

    this.getCurrUserPlaylists(new Batch(40, this.playlists.length, this.playlists[this.playlists.length - 1].id));
  }

  formSubmit() { this.dialogRef.close(this.contentForm.value); }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
