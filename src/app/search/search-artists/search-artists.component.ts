import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { HttpErrorResponse } from '@angular/common/http';

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

  isSmall: boolean;

  search: Search;

  artists: List[];
  total: number;
  isLoading: boolean;

  unsubscribe: Subject<any> = new Subject();

  constructor(
    private route: ActivatedRoute,
    private breakpointObserver: BreakpointObserver,
    private dataService: DataService,
    private spotifyService: SpotifyService,
    private router: Router
  ) {
  }

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
      (response: HttpErrorResponse) => {
        localStorage.setItem("redirectURL", this.router.url);
        this.spotifyService.onError(response);
      }
    );
  }

  loadMore() {
    if ((this.artists.length >= this.total) || this.isLoading) return;

    this.isLoading = true;
    this.spotifyService.searchArtists(this.search, new Batch(40, this.artists.length, this.artists[this.artists.length - 1].id)).pipe(takeUntil(this.unsubscribe))
      .subscribe(
        ([artists, total]: [Artist[], number]) => {
          this.subsToSearchArtists(artists, total);
          this.isLoading = false;
        },
        (response: HttpErrorResponse) => {
          localStorage.setItem("redirectURL", this.router.url);
          this.spotifyService.onError(response);
        }
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
