import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DataService } from '../../services/data.service';
import { SpotifyService } from '../../services/spotify.service';
import { Batch, Track } from '../../models/spotify.model';

@Component({
  selector: 'app-library-tracks',
  templateUrl: './library-tracks.component.html',
  styleUrls: ['./library-tracks.component.scss']
})
export class LibraryTracksComponent implements OnInit, OnDestroy {
  tabsHeight: number;

  tracks: Track[];
  total: number;
  isLoading: boolean;

  unsubscribe: Subject<any> = new Subject();

  constructor(
    private dataService: DataService,
    private spotifyService: SpotifyService,
    private router: Router
  ) { }

  ngOnInit() {
    this.tabsHeight = this.dataService.tabsHeight;

    this.tracks = [];
    this.total = 0;
    this.isLoading = false;

    this.getCurrUserSavedTracks(new Batch());
  }

  getCurrUserSavedTracks(currBatch: Batch) {
    this.isLoading = true;
    this.spotifyService.getCurrUserSavedTracks(currBatch).pipe(takeUntil(this.unsubscribe))
      .subscribe(
        ([tracks, total]: [Track[], number]) => {
          this.tracks = this.tracks.concat(tracks);
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
    if ((this.tracks.length >= this.total) || this.isLoading) return;

    this.getCurrUserSavedTracks(new Batch(40, this.tracks.length, this.tracks[this.tracks.length - 1].id));
  }

  removeTrack(trackToRemove: Track) {
    this.tracks = this.tracks.filter((track: Track) => track.id != trackToRemove.id);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
