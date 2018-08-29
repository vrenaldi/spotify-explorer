import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';

import { Subject } from 'rxjs';
import { takeUntil, concatMap } from 'rxjs/operators';

import { Thumbnail, ImgType, Artist, User, SnackBarType, Track, List, Batch, Album } from '../../models/spotify.model';
import { SpotifyService } from '../../services/spotify.service';
import { DataService } from '../../services/data.service';
import { CommonSnackBarComponent } from '../../common/common-snack-bar/common-snack-bar.component';

@Component({
  selector: 'app-view-artist',
  templateUrl: './view-artist.component.html',
  styleUrls: ['./view-artist.component.scss']
})
export class ViewArtistComponent implements OnInit, OnDestroy {
  currUser: User;

  artistId: string;
  initLoading: boolean;

  artist: Thumbnail;
  topTracks: Track[];
  albums: List[];
  isFollowed: boolean;
  total: number;
  isLoading: boolean;

  unsubscribe: Subject<any> = new Subject();

  constructor(
    private dataService: DataService,
    private spotifyService: SpotifyService,
    private route: ActivatedRoute,
    public matSnackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.dataService.currUser.pipe(takeUntil(this.unsubscribe))
      .subscribe(currUser => { this.currUser = currUser; });

    this.artistId = this.route.snapshot.paramMap.get("artistId");
    this.initLoading = true;

    this.artist = new Thumbnail("", "", ImgType.Profile);
    this.albums = [];
    this.total = 0;
    this.isLoading = false;

    this.getArtist();
  }

  getArtist() {
    this.spotifyService.getArtist(this.artistId).pipe(
      concatMap((artist: Artist) => {
        this.artist = new Thumbnail(artist.id, artist.name, ImgType.Profile, artist.image);
        return this.spotifyService.getArtistTopTracks(this.artistId, this.currUser);
      }),
      concatMap((tracks: Track[]) => {
        this.topTracks = tracks.slice(0, 5);
        return this.spotifyService.checkCurrUserFollowsArtists([new Artist(this.artistId, "")]);
      }),
      concatMap((result: boolean) => {
        this.isFollowed = result[0];
        return this.spotifyService.getArtistAlbums(this.artistId, new Batch());
      }),
      takeUntil(this.unsubscribe)
    ).subscribe(
      ([albums, total]: [Album[], number]) => {
        this.albums = this.albums.concat(albums.map(album => new List(album.id, album.name, ImgType.NotProfile
          , album.image, ["album"], album.artists)));
        this.total = total;

        this.isLoading = false;
        this.initLoading = false;
      },
      // (response: HttpErrorResponse) => {
      //   localStorage.setItem("redirectURL", `/view/artist/${this.artistId}`);
      //   this.spotifyService.onError(response);
      // }
    );
  }

  loadMore() {
    if ((this.albums.length >= this.total) || this.isLoading) return;

    this.isLoading = true;
    this.spotifyService.getArtistAlbums(this.artistId, new Batch(40, this.albums.length, this.albums[this.albums.length - 1].id)).pipe(takeUntil(this.unsubscribe))
      .subscribe(
        ([albums, total]: [Album[], number]) => {
          this.albums = this.albums.concat(albums.map(album => new List(album.id, album.name, ImgType.NotProfile
            , album.image, ["album"], album.artists)));
          this.total = total;

          this.isLoading = false;
        },
      // (response: HttpErrorResponse) => {
      //   localStorage.setItem("redirectURL", `/view/artist/${this.artistId}`);
      //   this.spotifyService.onError(response);
      // }
    );
  }

  toggleFollowedArtist() {
    if (this.isFollowed) {
      this.spotifyService.unfollowArtists([new Artist(this.artistId, "")]).pipe(takeUntil(this.unsubscribe))
        .subscribe(
          () => {
            this.isFollowed = !this.isFollowed;
            this.matSnackBar.openFromComponent(CommonSnackBarComponent, { duration: 2000, data: SnackBarType.LibraryRemoved });
          },
        // (response: HttpErrorResponse) => {
        //   localStorage.setItem("redirectURL", `/view/artist/${this.artistId}`);
        //   this.spotifyService.onError(response);
        // }
      );
    }
    else {
      this.spotifyService.followArtists([new Artist(this.artistId, "")]).pipe(takeUntil(this.unsubscribe))
        .subscribe(
          () => {
            this.isFollowed = !this.isFollowed;
            this.matSnackBar.openFromComponent(CommonSnackBarComponent, { duration: 2000, data: SnackBarType.LibrarySaved });
          },
        // (response: HttpErrorResponse) => {
        //   localStorage.setItem("redirectURL", `/view/artist/${this.artistId}`);
        //   this.spotifyService.onError(response);
        // }
      );
    }
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
