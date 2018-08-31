import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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

  search: Search;

  playlists: List[];
  total: number;
  isLoading: boolean;

  unsubscribe: Subject<any> = new Subject();

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private spotifyService: SpotifyService
  ) { }

  ngOnInit() {
    this.formItemHeight = this.dataService.formItemHeight;
    this.tabsHeight = this.dataService.tabsHeight;
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
      // (response: HttpErrorResponse) => {
      //   localStorage.setItem("redirectURL", `/search/playlists/${this.search.q}`);
      //   this.spotifyService.onError(response);
      // }
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
      // (response: HttpErrorResponse) => {
      //   localStorage.setItem("redirectURL", `/search/playlists/${this.search.q}`);
      //   this.spotifyService.onError(response);
      // }
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
