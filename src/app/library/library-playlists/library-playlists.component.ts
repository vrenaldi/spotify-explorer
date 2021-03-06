import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';

import { Subject } from 'rxjs';
import { takeUntil, filter, switchMap } from 'rxjs/operators';

import { DataService } from '../../services/data.service';
import { SpotifyService } from '../../services/spotify.service';
import { Batch, Playlist, List, ImgType, DialogType, User } from '../../models/spotify.model';

import { CommonDialogFormComponent } from '../../common/common-dialog-form/common-dialog-form.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-library-playlists',
  templateUrl: './library-playlists.component.html',
  styleUrls: ['./library-playlists.component.scss']
})
export class LibraryPlaylistsComponent implements OnInit, OnDestroy {
  tabsHeight: number;
  currUser: User;

  isSmall: boolean;

  playlists: List[];
  total: number;
  isLoading: boolean;

  dialogFormRef: MatDialogRef<CommonDialogFormComponent>;

  unsubscribe: Subject<any> = new Subject();

  constructor(
    private breakpointObserver: BreakpointObserver,
    private dataService: DataService,
    private spotifyService: SpotifyService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit() {
    this.tabsHeight = this.dataService.tabsHeight;
    this.dataService.currUser.pipe(takeUntil(this.unsubscribe))
      .subscribe(currUser => { this.currUser = currUser; });

    this.breakpointObserver.observe("(min-width: 450px)").pipe(takeUntil(this.unsubscribe))
      .subscribe(result => {
        if (result.matches) this.isSmall = false;
        else this.isSmall = true;
      });

    this.playlists = [];
    this.total = 0;
    this.isLoading = false;

    this.getCurrUserPlaylists(new Batch());
  }

  getCurrUserPlaylists(currBatch: Batch) {
    this.isLoading = true;
    this.spotifyService.getCurrUserPlaylists(currBatch).pipe(takeUntil(this.unsubscribe))
      .subscribe(
        ([playlists, total]: [Playlist[], number]) => {
          this.playlists = this.playlists.concat(playlists.map(playlist => new List(playlist.id, playlist.name, ImgType.NotProfile,
            playlist.image, ["playlist", "user"], [playlist.owner])));
          this.total = total;

          this.isLoading = false;
        },
        (response: HttpErrorResponse) => {
          localStorage.setItem("redirectURL", this.router.url);
          this.spotifyService.onError(response);
        }
      );
  }

  loadMore() {
    if ((this.playlists.length >= this.total) || this.isLoading) return;

    this.getCurrUserPlaylists(new Batch(40, this.playlists.length, this.playlists[this.playlists.length - 1].id));
  }

  createPlaylist() {
    this.dialogFormRef = this.dialog.open(CommonDialogFormComponent, { data: DialogType.CreatePlaylist });

    this.dialogFormRef.afterClosed().pipe(
      filter(formValue => formValue),
      switchMap(formValue => this.spotifyService.createPlaylist(formValue.playlistName, this.currUser)),
      takeUntil(this.unsubscribe)
    ).subscribe(
      (result: any) => { this.router.navigate(["view", "playlist", result.id, "user", this.currUser.id]); },
      (response: HttpErrorResponse) => {
        localStorage.setItem("redirectURL", this.router.url);
        this.spotifyService.onError(response);
      }
    );
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
