import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

import { DataService } from '../../services/data.service';
import { SpotifyService } from '../../services/spotify.service';
import { Track, Search, Batch } from '../../models/spotify.model';

@Component({
  selector: 'app-search-tracks',
  templateUrl: './search-tracks.component.html',
  styleUrls: ['./search-tracks.component.scss']
})
export class SearchTracksComponent implements OnInit, OnDestroy {
  formItemHeight: number;
  tabsHeight: number;

  search: Search;

  tracks: Track[];
  total: number;
  isLoading: boolean;

  unsubscribe: Subject<any> = new Subject();

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private spotifyService: SpotifyService,
    private router: Router
  ) { }

  ngOnInit() {
    this.formItemHeight = this.dataService.formItemHeight;
    this.tabsHeight = this.dataService.tabsHeight;
    this.total = 0;

    this.route.paramMap.pipe(
      switchMap(param => {
        this.search = { q: param.get("query"), type: "track" };
        this.tracks = [];
        this.isLoading = true;
        return this.spotifyService.searchTracks(this.search, new Batch());
      }),
      takeUntil(this.unsubscribe)
    ).subscribe(
      ([tracks, total]: [Track[], number]) => {
        this.subsToSearchTracks(tracks, total);
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

    this.isLoading = true;
    this.spotifyService.searchTracks(this.search, new Batch(40, this.tracks.length, this.tracks[this.tracks.length - 1].id)).pipe(takeUntil(this.unsubscribe))
      .subscribe(
        ([tracks, total]: [Track[], number]) => {
          this.subsToSearchTracks(tracks, total);
          this.isLoading = false;
        },
        (response: HttpErrorResponse) => {
          localStorage.setItem("redirectURL", this.router.url);
          this.spotifyService.onError(response);
        }
      );
  }

  subsToSearchTracks(tracks: Track[], total: number) {
    this.tracks = this.tracks.concat(tracks);
    this.total = total;
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
