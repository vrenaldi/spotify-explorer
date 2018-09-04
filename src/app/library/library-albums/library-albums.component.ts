import { Component, OnInit, OnDestroy } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DataService } from '../../services/data.service';
import { SpotifyService } from '../../services/spotify.service';
import { List, Batch, Album, ImgType } from '../../models/spotify.model';

@Component({
  selector: 'app-library-albums',
  templateUrl: './library-albums.component.html',
  styleUrls: ['./library-albums.component.scss']
})
export class LibraryAlbumsComponent implements OnInit, OnDestroy {
  tabsHeight: number;
  isSmall: boolean;

  albums: List[];
  total: number;
  isLoading: boolean;

  unsubscribe: Subject<any> = new Subject();

  constructor(
    private breakpointObserver: BreakpointObserver,
    private dataService: DataService,
    private spotifyService: SpotifyService
  ) { }

  ngOnInit() {
    this.tabsHeight = this.dataService.tabsHeight;
    this.breakpointObserver.observe("(min-width: 450px)").pipe(takeUntil(this.unsubscribe))
      .subscribe(result => {
        if (result.matches) this.isSmall = false;
        else this.isSmall = true;
      });

    this.albums = [];
    this.total = 0;
    this.isLoading = false;

    this.getCurrUserSavedAlbums(new Batch());
  }

  getCurrUserSavedAlbums(currBatch: Batch) {
    this.isLoading = true;
    this.spotifyService.getCurrUserSavedAlbums(currBatch).pipe(takeUntil(this.unsubscribe))
      .subscribe(
        ([albums, total]: [Album[], number]) => {
          this.albums = this.albums.concat(albums.map(album => new List(album.id, album.name, ImgType.NotProfile
            , album.image, ["album"], album.artists)));
          this.total = total;

          this.isLoading = false;
        },
      // (response: HttpErrorResponse) => {
      //   localStorage.setItem("redirectURL", "/library/albums");
      //   this.spotifyService.onError(response);
      // }
    );
  }

  loadMore() {
    if ((this.albums.length >= this.total) || this.isLoading) return;

    this.getCurrUserSavedAlbums(new Batch(40, this.albums.length, this.albums[this.albums.length - 1].id));
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
