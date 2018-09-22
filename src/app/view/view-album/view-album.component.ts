import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';

import { Subject } from 'rxjs';
import { takeUntil, concatMap } from 'rxjs/operators';

import { Thumbnail, Track, ImgType, Album, User, Batch, SnackBarType, ThumbnailType } from '../../models/spotify.model';
import { SpotifyService } from '../../services/spotify.service';
import { DataService } from '../../services/data.service';
import { CommonSnackBarComponent } from '../../common/common-snack-bar/common-snack-bar.component';

@Component({
  selector: 'app-view-album',
  templateUrl: './view-album.component.html',
  styleUrls: ['./view-album.component.scss']
})
export class ViewAlbumComponent implements OnInit, OnDestroy {
  currUser: User;

  albumId: string;
  initLoading: boolean;

  album: Thumbnail;
  tracks: Track[];
  isOwner: boolean;
  isSaved: boolean;
  total: number;
  isLoading: boolean;

  unsubscribe: Subject<any> = new Subject();

  constructor(
    private dataService: DataService,
    private spotifyService: SpotifyService,
    private route: ActivatedRoute,
    public matSnackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit() {
    this.dataService.currUser.pipe(takeUntil(this.unsubscribe))
      .subscribe(currUser => { this.currUser = currUser; });

    this.albumId = this.route.snapshot.paramMap.get("albumId");
    this.initLoading = true;

    this.album = new Thumbnail("", "", ImgType.NotProfile, ThumbnailType.View);
    this.tracks = [];
    this.total = 0;
    this.isLoading = false;

    this.getAlbum();
  }

  getAlbum() {
    this.spotifyService.getAlbum(this.albumId).pipe(
      concatMap(([album, total]: [Album, number]) => {
        this.album = new Thumbnail(album.id, album.name, ImgType.NotProfile, ThumbnailType.View, album.image, album.artists);
        this.tracks = this.tracks.concat(album.tracks);
        this.total = total;

        this.isOwner = album.artists.filter(artist => artist.id == this.currUser.id).length > 0;

        return this.spotifyService.checkCurrUserSavedAlbums([new Album(this.albumId, "", [])]);
      }),
      takeUntil(this.unsubscribe)
    ).subscribe(
      (result: boolean) => {
        this.isSaved = result[0];
        this.initLoading = false;
      },
      (response: HttpErrorResponse) => {
        localStorage.setItem("redirectURL", this.router.url);
        this.spotifyService.onError(response);
      }
    );
  }

  loadMore() {
    if ((this.tracks.length >= this.total) || this.isLoading) return;

    this.getAlbumTracks(new Batch(40, this.tracks.length, this.tracks[this.tracks.length - 1].id));
  }

  getAlbumTracks(currBatch: Batch) {
    this.isLoading = true;
    this.spotifyService.getAlbumTracks(this.albumId, currBatch).pipe(takeUntil(this.unsubscribe))
      .subscribe(
        ([tracks, total]: [Track[], number]) => {
          this.tracks = this.tracks.concat(tracks);


          this.isLoading = false;
        },
        (response: HttpErrorResponse) => {
          localStorage.setItem("redirectURL", this.router.url);
          this.spotifyService.onError(response);
        }
      );
  }

  toggleSavedAlbum() {
    if (this.isSaved) {
      this.spotifyService.removeAlbumsCurrUser([new Album(this.albumId, "", [])]).pipe(
        concatMap(() => this.spotifyService.removeTracksUser(this.tracks)),
        takeUntil(this.unsubscribe)
      ).subscribe(
        () => {
          this.isSaved = !this.isSaved;
          this.tracks.forEach(track => { track.isSaved = false; });

          this.matSnackBar.openFromComponent(CommonSnackBarComponent, { duration: 2000, data: SnackBarType.LibraryRemoved });
        },
        (response: HttpErrorResponse) => {
          localStorage.setItem("redirectURL", this.router.url);
          this.spotifyService.onError(response);
        }
      );
    }
    else {
      this.spotifyService.saveAlbumsCurrUser([new Album(this.albumId, "", [])]).pipe(
        concatMap(() => this.spotifyService.saveTracksUser(this.tracks)),
        takeUntil(this.unsubscribe)
      ).subscribe(
        () => {
          this.isSaved = !this.isSaved;
          this.tracks.forEach(track => { track.isSaved = true; });

          this.matSnackBar.openFromComponent(CommonSnackBarComponent, { duration: 2000, data: SnackBarType.LibrarySaved });
        },
        (response: HttpErrorResponse) => {
          localStorage.setItem("redirectURL", this.router.url);
          this.spotifyService.onError(response);
        }
      );
    }
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
