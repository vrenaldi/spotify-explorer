import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { HttpErrorResponse } from '@angular/common/http';

import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

import { DataService } from '../../services/data.service';
import { SpotifyService } from '../../services/spotify.service';
import { List, Batch, Search, Playlist, ImgType } from '../../models/spotify.model';

@Component({
  selector: 'app-search-playlists',
  templateUrl: './search-playlists.component.html',
  styleUrls: ['./search-playlists.component.scss']
})
export class SearchPlaylistsComponent implements OnInit {
  formItemHeight: number;
  tabsHeight: number;

  isSmall: boolean;

  search: Search;

  playlists: List[];
  total: number;
  isLoading: boolean;

  unsubscribe: Subject<any> = new Subject();

  constructor(
    private route: ActivatedRoute,
    private breakpointObserver: BreakpointObserver,
    private dataService: DataService,
    private spotifyService: SpotifyService,
    private router: Router
  ) { }

  ngOnInit() {
    this.formItemHeight = this.dataService.formItemHeight;
    this.tabsHeight = this.dataService.tabsHeight;
    this.breakpointObserver.observe("(min-width: 450px)").pipe(takeUntil(this.unsubscribe))
      .subscribe(result => {
        if (result.matches) this.isSmall = false;
        else this.isSmall = true;
      });

    this.total = 0;

    this.route.paramMap.pipe(
      switchMap(param => {
        this.search = { q: param.get("query"), type: "playlist" };
        this.playlists = [];
        this.isLoading = true;
        return this.spotifyService.searchPlaylists(this.search, new Batch());
      }),
      takeUntil(this.unsubscribe)
    ).subscribe(
      ([playlists, total]: [Playlist[], number]) => {
        this.subsToSearchPlaylists(playlists, total);
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

    this.isLoading = true;
    this.spotifyService.searchPlaylists(this.search, new Batch(40, this.playlists.length, this.playlists[this.playlists.length - 1].id)).pipe(takeUntil(this.unsubscribe))
      .subscribe(
        ([playlists, total]: [Playlist[], number]) => {
          this.subsToSearchPlaylists(playlists, total);
          this.isLoading = false;
        },
        (response: HttpErrorResponse) => {
          localStorage.setItem("redirectURL", this.router.url);
          this.spotifyService.onError(response);
        }
      );
  }

  subsToSearchPlaylists(playlists: Playlist[], total: number) {
    this.playlists = this.playlists.concat(playlists.map(playlist => new List(playlist.id, playlist.name, ImgType.NotProfile,
      playlist.image, ["playlist", "user"], [playlist.owner])));
    this.total = total;
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
