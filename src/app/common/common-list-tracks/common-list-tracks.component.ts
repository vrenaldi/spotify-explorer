import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { MatSnackBar } from '@angular/material';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Track, SnackBarType } from '../../models/spotify.model';
import { SpotifyService } from '../../services/spotify.service';
import { CommonSnackBarComponent } from '../common-snack-bar/common-snack-bar.component';

@Component({
  selector: 'common-list-tracks',
  templateUrl: './common-list-tracks.component.html',
  styleUrls: ['./common-list-tracks.component.scss']
})
export class CommonListTracksComponent implements OnInit, OnDestroy {
  @Input() source: Track[];
  @Output() oRemoveTrack: EventEmitter<Track>;

  @ViewChildren("audio") audios: QueryList<ElementRef>;

  nowPlaying: number;
  currPreviewProgress: number;

  unsubscribe: Subject<any> = new Subject();

  constructor(
    private spotifyService: SpotifyService,
    public matSnackBar: MatSnackBar
  ) {
    this.oRemoveTrack = new EventEmitter();
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

  removeTrack(track: Track, index: number) {
    this.spotifyService.removeTracksUser([track]).pipe(takeUntil(this.unsubscribe))
      .subscribe(
        () => {
          this.source[index].isSaved = false;
          this.oRemoveTrack.emit(track);
          this.matSnackBar.openFromComponent(CommonSnackBarComponent, { duration: 2000, data: SnackBarType.LibraryRemoved });
        },
      // (response: HttpErrorResponse) => {
      //   localStorage.setItem("redirectURL", "/library/playlists");
      //   this.spotifyService.onError(response);
      // }
    );
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
