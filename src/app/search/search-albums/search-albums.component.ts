import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { HttpErrorResponse } from '@angular/common/http';

import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

import { DataService } from '../../services/data.service';
import { SpotifyService } from '../../services/spotify.service';
import { List, Search, ImgType, Album, Batch } from '../../models/spotify.model';

@Component({
  selector: 'app-search-albums',
  templateUrl: './search-albums.component.html',
  styleUrls: ['./search-albums.component.scss']
})
export class SearchAlbumsComponent implements OnInit, OnDestroy {
  formItemHeight: number;
  tabsHeight: number;

  isSmall: boolean;

  search: Search;

  albums: List[];
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
        this.search = { q: param.get("query"), type: "album" };
        this.albums = [];
        this.isLoading = true;
        return this.spotifyService.searchAlbums(this.search, new Batch());
      }),
      takeUntil(this.unsubscribe)
    ).subscribe(
      ([albums, total]: [Album[], number]) => {
        this.subsToSearchAlbums(albums, total);
        this.isLoading = false;
      },
      (response: HttpErrorResponse) => {
        localStorage.setItem("redirectURL", this.router.url);
        this.spotifyService.onError(response);
      }
    );
  }

  loadMore() {
    if ((this.albums.length >= this.total) || this.isLoading) return;

    this.isLoading = true;
    this.spotifyService.searchAlbums(this.search, new Batch(40, this.albums.length, this.albums[this.albums.length - 1].id)).pipe(takeUntil(this.unsubscribe))
      .subscribe(
        ([albums, total]: [Album[], number]) => {
          this.subsToSearchAlbums(albums, total);
          this.isLoading = false;
        },
        (response: HttpErrorResponse) => {
          localStorage.setItem("redirectURL", this.router.url);
          this.spotifyService.onError(response);
        }
      );
  }

  subsToSearchAlbums(albums: Album[], total: number) {
    this.albums = this.albums.concat(albums.map(album => new List(album.id, album.name, ImgType.NotProfile
      , album.image, ["album"], album.artists)));
    this.total = total;
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
