import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

import { SpotifyService } from '../../services/spotify.service';
import { DataService } from '../../services/data.service';
import { List, Artist, ImgType, Batch, Search } from '../../models/spotify.model';

@Component({
  selector: 'app-search-artists',
  templateUrl: './search-artists.component.html',
  styleUrls: ['./search-artists.component.scss']
})
export class SearchArtistsComponent implements OnInit, OnDestroy {
  formItemHeight: number;
  tabsHeight: number;

  search: Search;

  artists: List[];
  total: number;
  isLoading: boolean;

  unsubscribe: Subject<any> = new Subject();

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private spotifyService: SpotifyService
  ) {
    this.artists = [];
    this.total = 0;
    this.isLoading = false;
  }

  ngOnInit() {
    this.formItemHeight = this.dataService.formItemHeight;
    this.tabsHeight = this.dataService.tabsHeight;

    this.route.paramMap.pipe(
      switchMap(param => {
        this.search = { q: param.get("query"), type: "artist" };
        this.artists = [];
        this.isLoading = true;
        return this.spotifyService.searchArtists(this.search, new Batch());
      }),
      takeUntil(this.unsubscribe)
    ).subscribe(
      ([artists, total]: [Artist[], number]) => {
        this.subsToSearchArtists(artists, total);
        this.isLoading = false;
      },
      // (response: HttpErrorResponse) => {
      //   localStorage.setItem("redirectURL", `/search/artists/${this.search.q}`);
      //   this.spotifyService.onError(response);
      // }
    );
  }

  loadMore() {
    this.isLoading = true;
    this.spotifyService.searchArtists(this.search, new Batch(40, this.artists.length, this.artists[this.artists.length - 1].id)).pipe(takeUntil(this.unsubscribe))
      .subscribe(
        ([artists, total]: [Artist[], number]) => {
          this.subsToSearchArtists(artists, total);
          this.isLoading = false;
        },
      // (response: HttpErrorResponse) => {
      //   localStorage.setItem("redirectURL", `/search/artists/${this.search.q}`);
      //   this.spotifyService.onError(response);
      // }
    );
  }

  subsToSearchArtists(artists: Artist[], total: number) {
    this.artists = this.artists.concat(artists.map(artist => new List(artist.id, artist.name, ImgType.Profile,
      artist.image, ["artist"])));
    this.total = total;
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
