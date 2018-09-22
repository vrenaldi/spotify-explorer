import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { MatSnackBar, MatDialogRef, MatDialog } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil, filter, concatMap, concatAll } from 'rxjs/operators';

import { Track, SnackBarType, Playlist, DialogType } from '../../models/spotify.model';
import { SpotifyService } from '../../services/spotify.service';
import { CommonSnackBarComponent } from '../common-snack-bar/common-snack-bar.component';
import { CommonDialogFormComponent } from '../common-dialog-form/common-dialog-form.component';

@Component({
  selector: 'common-list-tracks',
  templateUrl: './common-list-tracks.component.html',
  styleUrls: ['./common-list-tracks.component.scss']
})
export class CommonListTracksComponent implements OnInit, OnDestroy {
  @Input() source: Track[];
  @Input() isRemovableFromPlaylist: boolean;
  @Output() oRemoveTrack: EventEmitter<Track>;
  @Output() oAddToPlaylist: EventEmitter<[Playlist[], Track]>;
  @Output() oRemoveFromPlaylist: EventEmitter<[Track, number]>;

  @ViewChildren("audio") audios: QueryList<ElementRef>;

  nowPlaying: number;
  currPreviewProgress: number;

  dialogFormRef: MatDialogRef<CommonDialogFormComponent>;

  unsubscribe: Subject<any> = new Subject();

  constructor(
    private spotifyService: SpotifyService,
    public matSnackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.oRemoveTrack = new EventEmitter();
    this.oAddToPlaylist = new EventEmitter();
    this.oRemoveFromPlaylist = new EventEmitter();
  }

  ngOnInit() {
  }

  previewTrack(event: any, audio: HTMLAudioElement, track: Track, index: number) {
    if (event.target.classList.contains("more-vert")) return;

    if (this.nowPlaying != undefined) {
      let turnOff: boolean = (this.nowPlaying == index);
      this.resetPreview(this.nowPlaying);

      if (turnOff) return;
    }

    if (track.previewURL != null) {
      audio.play();
      this.nowPlaying = index;
    }
    else
      this.matSnackBar.openFromComponent(CommonSnackBarComponent, { duration: 2000, data: SnackBarType.PreviewNotAvailable });
  }

  previewProgressUpdate(index: number) {
    let currAudio: HTMLAudioElement = this.audios.toArray()[index].nativeElement;
    this.currPreviewProgress = Math.round(currAudio.currentTime / currAudio.duration * 100);
  }

  resetPreview(index: number) {
    let currAudio: HTMLAudioElement = this.audios.toArray()[index].nativeElement;
    currAudio.pause();
    currAudio.currentTime = 0;

    this.nowPlaying = undefined;
    this.currPreviewProgress = 0;
  }

  saveTrack(track: Track, index: number) {
    this.spotifyService.saveTracksUser([track]).pipe(takeUntil(this.unsubscribe))
      .subscribe(
        () => {
          this.source[index].isSaved = true;
          this.matSnackBar.openFromComponent(CommonSnackBarComponent, { duration: 2000, data: SnackBarType.LibrarySaved });
        },
        (response: HttpErrorResponse) => {
          localStorage.setItem("redirectURL", this.router.url);
          this.spotifyService.onError(response);
        }
      );
  }

  removeTrack(track: Track, index: number) {
    this.spotifyService.removeTracksUser([track]).pipe(takeUntil(this.unsubscribe))
      .subscribe(
        () => {
          this.source[index].isSaved = false;
          this.oRemoveTrack.emit(track);
          this.matSnackBar.openFromComponent(CommonSnackBarComponent, { duration: 2000, data: SnackBarType.LibraryRemoved });
        },
        (response: HttpErrorResponse) => {
          localStorage.setItem("redirectURL", this.router.url);
          this.spotifyService.onError(response);
        }
      );
  }

  addToPlaylist(track: Track) {
    let isCancelled: boolean = true;
    let selectedPlaylists: Playlist[];

    this.dialogFormRef = this.dialog.open(CommonDialogFormComponent, { data: DialogType.AddToPlaylist, autoFocus: false });

    this.dialogFormRef.afterClosed().pipe(
      filter(formValue => formValue && formValue.playlists.length > 0),
      concatMap(formValue => {
        isCancelled = false;
        selectedPlaylists = formValue.playlists;

        return formValue.playlists.map(playlist => this.spotifyService.addTracksPlaylist(playlist, [track]));
      }),
      concatAll(),
      takeUntil(this.unsubscribe)
    ).subscribe(
      () => { },
      (response: HttpErrorResponse) => {
        localStorage.setItem("redirectURL", this.router.url);
        this.spotifyService.onError(response);
      },
      () => {
        if (!isCancelled) {
          this.oAddToPlaylist.emit([selectedPlaylists, track]);
          this.matSnackBar.openFromComponent(CommonSnackBarComponent, { duration: 2000, data: SnackBarType.PlaylistAdded });
        }
      });
  }

  removeFromPlaylist(track: Track, position: number) {
    this.oRemoveFromPlaylist.emit([track, position]);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
