import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DataService } from '../../services/data.service';
import { SpotifyService } from '../../services/spotify.service';
import { List, Batch, ImgType, Artist } from '../../models/spotify.model';

@Component({
  selector: 'app-library-artists',
  templateUrl: './library-artists.component.html',
  styleUrls: ['./library-artists.component.scss']
})
export class LibraryArtistsComponent implements OnInit, OnDestroy {
  tabsHeight: number;

  artists: List[];
  total: number;
  isLoading: boolean;

  unsubscribe: Subject<any> = new Subject();

  constructor(
    private dataService: DataService,
    private spotifyService: SpotifyService
  ) { }

  ngOnInit() {
    this.tabsHeight = this.dataService.tabsHeight;

    this.artists = [];
    this.total = 0;
    this.isLoading = true;

    this.getCurrUserFollowedArtists(new Batch());
  }

  getCurrUserFollowedArtists(currBatch: Batch) {
    this.isLoading = true;
    this.spotifyService.getCurrUserFollowedArtists(currBatch).pipe(takeUntil(this.unsubscribe))
      .subscribe(
        ([artists, total]: [Artist[], number]) => {
          this.artists = this.artists.concat(artists.map(artist => new List(artist.id, artist.name, ImgType.Profile,
            artist.image, ["artist"])));
          this.total = total;

          this.isLoading = false;
        },
      // (response: HttpErrorResponse) => {
      //   localStorage.setItem("redirectURL", "/library/artists");
      //   this.spotifyService.onError(response);
      // }
    );
  }

  loadMore() {
    if ((this.artists.length >= this.total) || this.isLoading) return;

    this.getCurrUserFollowedArtists(new Batch(40, this.artists.length, this.artists[this.artists.length - 1].id));
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
