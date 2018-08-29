import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogRef, MatDialog, MatSnackBar } from '@angular/material';

import { Subject } from 'rxjs';
import { takeUntil, filter, switchMap, concatMap } from 'rxjs/operators';

import { DataService } from '../../services/data.service';
import { SpotifyService } from '../../services/spotify.service';
import { User, DialogType, SnackBarType, Track, Thumbnail, ImgType, Playlist, Batch } from '../../models/spotify.model';

import { CommonDialogConfirmationComponent } from '../../common/common-dialog-confirmation/common-dialog-confirmation.component';
import { CommonSnackBarComponent } from '../../common/common-snack-bar/common-snack-bar.component';

@Component({
  selector: 'app-view-playlist',
  templateUrl: './view-playlist.component.html',
  styleUrls: ['./view-playlist.component.scss']
})
export class ViewPlaylistComponent implements OnInit, OnDestroy {
  currUser: User;

  ownerId: string;
  playlistId: string;
  isFollowed: boolean;
  initLoading: boolean;

  playlist: Thumbnail;
  tracks: Track[];
  total: number;
  isLoading: boolean;

  dialogFormRef: MatDialogRef<CommonDialogConfirmationComponent>;

  unsubscribe: Subject<any> = new Subject();

  constructor(
    private dataService: DataService,
    private spotifyService: SpotifyService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    public matSnackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.dataService.currUser.pipe(takeUntil(this.unsubscribe))
      .subscribe(user => { this.currUser = user; });

    this.ownerId = this.route.snapshot.paramMap.get("ownerId");
    this.playlistId = this.route.snapshot.paramMap.get("playlistId");
    this.initLoading = true;

    this.playlist = new Thumbnail("", "", ImgType.NotProfile);
    this.tracks = [];
    this.total = 0;
    this.isLoading = false;

    this.getPlaylist();
  }

  getPlaylist() {
    this.spotifyService.getPlaylist(this.ownerId, this.playlistId).pipe(
      concatMap(([playlist, total]: [Playlist, number]) => {
        this.playlist = new Thumbnail(playlist.id, playlist.name, ImgType.NotProfile, playlist.image, [playlist.owner]);
        this.tracks = this.tracks.concat(playlist.tracks);
        this.total = total;

        return this.spotifyService.checkUsersFollowPlaylist(this.ownerId, this.playlistId, [this.currUser])
      }),
      takeUntil(this.unsubscribe))
      .subscribe(
        (result: boolean) => {
          this.isFollowed = result[0];
          this.initLoading = false;
        },
      // (response: HttpErrorResponse) => {
      //   localStorage.setItem("redirectURL", `/view/playlist/${this.playlistId}/user/${this.ownerId}`);
      //   this.spotifyService.onError(response);
      // }
    );
  }

  loadMore() {
    if ((this.tracks.length >= this.total) || this.isLoading) return;

    this.getPlaylistTracks(new Batch(40, this.tracks.length, this.tracks[this.tracks.length - 1].id));
  }

  getPlaylistTracks(currBatch: Batch) {
    this.isLoading = true;
    this.spotifyService.getPlaylistTracks(this.ownerId, this.playlistId, currBatch).pipe(takeUntil(this.unsubscribe))
      .subscribe(
        ([tracks, total]: [Track[], number]) => {
          this.tracks = this.tracks.concat(tracks);
          this.total = total;

          this.isLoading = false;
        },
      // (response: HttpErrorResponse) => {
      //   localStorage.setItem("redirectURL", `/view/playlist/${this.playlistId}/user/${this.ownerId}`);
      //   this.spotifyService.onError(response);
      // }
    );
  }

  toggleFollowedPlaylist() {
    if (this.isFollowed) {
      this.spotifyService.unfollowPlaylist(this.ownerId, this.playlistId).pipe(takeUntil(this.unsubscribe))
        .subscribe(
          () => {
            this.isFollowed = !this.isFollowed;
            this.matSnackBar.openFromComponent(CommonSnackBarComponent, { duration: 2000, data: SnackBarType.LibraryRemoved });
          },
        // (response: HttpErrorResponse) => {
        //   localStorage.setItem("redirectURL", `/view/playlist/${this.playlistId}/user/${this.ownerId}`);
        //   this.spotifyService.onError(response);
        // }
      );
    }
    else {
      this.spotifyService.followPlaylist(this.ownerId, this.playlistId).pipe(takeUntil(this.unsubscribe))
        .subscribe(
          () => {
            this.isFollowed = !this.isFollowed;
            this.matSnackBar.openFromComponent(CommonSnackBarComponent, { duration: 2000, data: SnackBarType.LibrarySaved });
          },
        // (response: HttpErrorResponse) => {
        //   localStorage.setItem("redirectURL", `/view/playlist/${this.playlistId}/user/${this.ownerId}`);
        //   this.spotifyService.onError(response);
        // }
      );
    }
  }

  deletePlaylist() {
    this.dialogFormRef = this.dialog.open(CommonDialogConfirmationComponent, { data: DialogType.DeletePlaylist });

    this.dialogFormRef.afterClosed().pipe(
      filter(isConfirm => isConfirm),
      switchMap(isConfirm => this.spotifyService.unfollowPlaylist(this.ownerId, this.playlistId)),
      takeUntil(this.unsubscribe)
    ).subscribe(
      (result: any) => {
        this.router.navigate(["library", "playlists"]);
        this.matSnackBar.openFromComponent(CommonSnackBarComponent, { duration: 2000, data: SnackBarType.LibraryRemoved });
      },
      // (response: HttpErrorResponse) => {
      //   localStorage.setItem("redirectURL", `/view/playlist/${this.playlistId}/user/${this.ownerId}`);
      //   this.spotifyService.onError(response);
      // }
    );
  }

  addToPlaylist([playlists, track]: [Playlist[], Track]) {
    if (playlists.filter(playlist => playlist.id == this.playlistId).length > 0) {
      this.tracks.push(track);
    }
  }

  removeFromPlaylist([trackToRemove, position]: [Track, number]) {
    let playlist = new Playlist(this.playlistId, "", new User(this.ownerId, ""));
    this.spotifyService.removeTracksPlaylist(playlist, [trackToRemove], [position]).pipe(takeUntil(this.unsubscribe))
      .subscribe(
        () => {
          this.tracks.splice(position, 1);
          this.matSnackBar.openFromComponent(CommonSnackBarComponent, { duration: 2000, data: SnackBarType.PlaylistRemoved });
        },
      // (response: HttpErrorResponse) => {
      //   localStorage.setItem("redirectURL", `/view/playlist/${this.playlistId}/user/${this.ownerId}`);
      //   this.spotifyService.onError(response);
      // }
    );
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
