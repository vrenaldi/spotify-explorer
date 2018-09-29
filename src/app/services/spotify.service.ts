import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef, MatDialog } from '@angular/material';

import { of } from 'rxjs';
import { map, concatMap, filter, take } from 'rxjs/operators';

import { DataService } from './data.service';
import { Batch, Playlist, User, Track, Artist, Album, Search, DialogType } from '../models/spotify.model';
import { CommonDialogConfirmationComponent } from '../common/common-dialog-confirmation/common-dialog-confirmation.component';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  readonly baseEndpoint = "	https://api.spotify.com/v1/";
  readonly stateKey = "spotify_auth_state";

  readonly maxSearchOffset = 10000;

  dialogConfirmationRef: MatDialogRef<CommonDialogConfirmationComponent>;

  constructor(
    private dataService: DataService,
    private http: HttpClient,
    private dialog: MatDialog
  ) { }

  checkLogin(): boolean {
    let accessToken = this.dataService.fragments.accessToken;
    let state = this.dataService.fragments.state;
    let storedState = localStorage.getItem(this.stateKey);

    if (!accessToken || state == null || state !== storedState) {
      this.login();
      return false;
    }

    if (accessToken) return true;
  }

  login() {
    let client_id = "a0ea5a865c3942f5ade85c5364080c38";
    let redirect_uri = `${location.protocol}//${location.hostname}${location.port ? `:${location.port}` : ``}/login`;
    // let redirect_uri = "https://vrenaldi.github.io/spotify-explorer/login";
    let state = this.generateRandomString(16);
    let scope = "playlist-modify-public " +
      "playlist-modify-private " +
      "user-follow-modify " +
      "user-follow-read " +
      "user-library-modify " +
      "user-library-read " +
      "user-read-email " +
      "user-read-private";
    localStorage.setItem(this.stateKey, state);

    let url = "https://accounts.spotify.com/authorize";
    url += "?response_type=token";
    url += "&client_id=" + encodeURIComponent(client_id);
    url += "&redirect_uri=" + encodeURIComponent(redirect_uri);
    url += "&state=" + encodeURIComponent(state);
    url += "&scope=" + encodeURIComponent(scope);

    window.location.href = url;
  }

  generateRandomString(length: number) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  getCurrUserProfile() {
    let options = { headers: this.generateHeaders() };
    return this.http.get(`${this.baseEndpoint}me`, options);
  }

  // ========================================
  // Playlists
  // ========================================
  getCurrUserPlaylists(currBatch: Batch) {
    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.Batch], currBatch)
    };
    return this.http.get(`${this.baseEndpoint}me/playlists`, options).pipe(
      map((results: any) => {
        let playlists: Playlist[] = [];

        results.items.forEach(item => {
          let owner = new User(item.owner.id, item.owner.display_name);
          playlists.push(new Playlist(item.id, item.name, owner, this.extractImage(item.images)));
        });
        return [playlists, results.total];
      })
    );
  }

  createPlaylist(name: string, user: User) {
    let options = { headers: this.generateHeaders() };
    let body = { name: name };
    return this.http.post(`${this.baseEndpoint}users/${user.id}/playlists`, body, options);
  }

  checkUsersFollowPlaylist(ownerId: string, playlistId: string, users: User[]) {
    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.Ids], users)
    };
    return this.http.get(`${this.baseEndpoint}users/${ownerId}/playlists/${playlistId}/followers/contains`, options);
  }

  followPlaylist(ownerId: string, playlistId: string) {
    let options = { headers: this.generateHeaders() };
    return this.http.put(`${this.baseEndpoint}users/${ownerId}/playlists/${playlistId}/followers`, {}, options);
  }

  unfollowPlaylist(ownerId: string, playlistId: string) {
    let options = { headers: this.generateHeaders() };
    return this.http.delete(`${this.baseEndpoint}users/${ownerId}/playlists/${playlistId}/followers`, options);
  }

  getPlaylist(ownerId: string, playlistId: string) {
    let options = { headers: this.generateHeaders() };
    let playlist: Playlist;
    let total: number;

    return this.http.get(`${this.baseEndpoint}users/${ownerId}/playlists/${playlistId}`, options).pipe(
      concatMap((result: any) => {
        let owner: User = new User(result.owner.id, result.owner.display_name);
        let tracks: Track[] = [];

        let limit = Math.min(result.tracks.total, new Batch().limit);
        for (let i = 0; i < limit; i++) {
          let track = result.tracks.items[i].track;
          let artists: Artist[] = [];
          let album = new Album(track.album.id, track.album.name, [], this.extractImage(track.album.images));

          track.artists.forEach(artist => {
            artists.push(new Artist(artist.id, artist.name));
          });

          tracks.push(new Track(track.id, track.name, track.duration_ms, false, track.uri, track.preview_url, artists, album));
        };

        playlist = new Playlist(result.id, result.name, owner, this.extractImage(result.images), tracks);
        total = result.tracks.total;

        return this.checkCurrUserSavedTracks(tracks);
      }),
      map((results: any) => {
        results.forEach((result, resultIndex) => {
          playlist.tracks[resultIndex].isSaved = result;
        });

        return [playlist, total];
      })
    );
  }

  getPlaylistTracks(ownerId: string, playlistId: string, currBatch: Batch) {
    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.Batch], currBatch)
    };
    let tracks: Track[];
    let total: number;

    return this.http.get(`${this.baseEndpoint}users/${ownerId}/playlists/${playlistId}/tracks`, options).pipe(
      concatMap((results: any) => {
        tracks = [];
        total = results.total;

        results.items.forEach(item => {
          let track = item.track;
          let artists: Artist[] = [];
          let album = new Album(track.album.id, track.album.name, [], this.extractImage(track.album.images));

          track.artists.forEach(artist => {
            artists.push(new Artist(artist.id, artist.name));
          });

          tracks.push(new Track(track.id, track.name, track.duration_ms, false, track.uri, track.preview_url, artists, album));
        });
        return this.checkCurrUserSavedTracks(tracks);
      }),
      map((results: any) => {
        results.forEach((result, resultIndex) => {
          tracks[resultIndex].isSaved = result;
        });
        return [tracks, total];
      })
    );
  }

  checkCurrUserSavedTracks(tracks: Track[]) {
    if (tracks.length == 0) return of([]);

    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.Ids], tracks)
    };
    return this.http.get(`${this.baseEndpoint}me/tracks/contains`, options);
  }

  addTracksPlaylist(playlist: Playlist, tracks: Track[]) {
    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.URIs], tracks)
    };
    return this.http.post(`${this.baseEndpoint}users/${playlist.owner.id}/playlists/${playlist.id}/tracks`, {}, options);
  }

  removeTracksPlaylist(playlist: Playlist, tracks: Track[], position: number[]) {
    let options = {
      headers: this.generateHeaders(),
      body: { "tracks": [] }
    };
    tracks.forEach((track, trackIndex) => {
      options.body.tracks.push({ "uri": track.uri, "positions": [position[trackIndex]] });
    });
    return this.http.delete(`${this.baseEndpoint}users/${playlist.owner.id}/playlists/${playlist.id}/tracks`, options);
  }

  searchPlaylists(params: Search, currBatch: Batch) {
    let values: any = { ...params, ...currBatch };
    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.Batch, ParamType.Search], values)
    };
    return this.http.get(`${this.baseEndpoint}search`, options).pipe(
      map((results: any) => {
        let playlists: Playlist[] = [];

        results.playlists.items.forEach(item => {
          let owner = new User(item.owner.id, item.owner.display_name);
          playlists.push(new Playlist(item.id, item.name, owner, this.extractImage(item.images)));
        });
        return [playlists, Math.min(results.playlists.total, this.maxSearchOffset)];
      })
    );
  }
  // ========================================


  // ========================================
  // Tracks
  // ========================================
  getCurrUserSavedTracks(currBatch: Batch) {
    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.Batch], currBatch)
    };
    return this.http.get(`${this.baseEndpoint}me/tracks`, options).pipe(
      map((results: any) => {
        let tracks: Track[] = [];

        results.items.forEach(item => {
          let track = item.track;
          let artists: Artist[] = [];
          let album = new Album(track.album.id, track.album.name, [], this.extractImage(track.album.images));

          track.artists.forEach(artist => {
            artists.push(new Artist(artist.id, artist.name));
          });

          tracks.push(new Track(track.id, track.name, track.duration_ms, true, track.uri, track.preview_url, artists, album));
        });
        return [tracks, results.total];
      })
    );
  }

  saveTracksUser(tracks: Track[]) {
    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.Ids], tracks)
    };
    return this.http.put(`${this.baseEndpoint}me/tracks`, {}, options);
  }

  removeTracksUser(tracks: Track[]) {
    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.Ids], tracks)
    };
    return this.http.delete(`${this.baseEndpoint}me/tracks`, options);
  }

  searchTracks(params: Search, currBatch: Batch) {
    let values: any = { ...params, ...currBatch };
    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.Batch, ParamType.Search], values)
    };
    let tracks: Track[];
    let total: number;

    return this.http.get(`${this.baseEndpoint}search`, options).pipe(
      concatMap((results: any) => {
        tracks = [];

        results.tracks.items.forEach(item => {
          let artists: Artist[] = [];
          let album = new Album(item.album.id, item.album.name, [], this.extractImage(item.album.images));

          item.artists.forEach(artist => {
            artists.push(new Artist(artist.id, artist.name));
          });

          tracks.push(new Track(item.id, item.name, item.duration_ms, false, item.uri, item.preview_url, artists, album));
        });
        total = results.tracks.total;

        return this.checkCurrUserSavedTracks(tracks);
      }),
      map((results: any) => {
        results.forEach((result, resultIndex) => {
          tracks[resultIndex].isSaved = result;
        });
        return [tracks, Math.min(total, this.maxSearchOffset)];
      })
    );
  }
  // ========================================


  // ========================================
  // Albums
  // ========================================
  getCurrUserSavedAlbums(currBatch: Batch) {
    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.Batch], currBatch)
    };
    return this.http.get(`${this.baseEndpoint}me/albums`, options).pipe(
      map((results: any) => {
        let albums: Album[] = [];

        results.items.forEach(item => {
          let album = item.album;
          let artists: Artist[] = [];

          album.artists.forEach(artist => {
            artists.push(new Artist(artist.id, artist.name));
          });

          albums.push(new Album(album.id, album.name, artists, this.extractImage(album.images)));
        });
        return [albums, results.total];
      })
    );
  }

  getAlbum(albumId: string) {
    let options = { headers: this.generateHeaders() };
    let album: Album;
    let total: number;

    return this.http.get(`${this.baseEndpoint}albums/${albumId}`, options).pipe(
      concatMap((result: any) => {
        let artists: Artist[] = [];
        let tracks: Track[] = [];

        result.artists.forEach(artist => {
          artists.push(new Artist(artist.id, artist.name));
        });

        let limit = Math.min(result.tracks.total, new Batch().limit);
        for (let i = 0; i < limit; i++) {
          let track = result.tracks.items[i];
          let artists: Artist[] = [];

          track.artists.forEach(artist => {
            artists.push(new Artist(artist.id, artist.name));
          });

          tracks.push(new Track(track.id, track.name, track.duration_ms, false, track.uri, track.preview_url, artists));
        };
        album = new Album(result.id, result.name, artists, this.extractImage(result.images), tracks);
        total = result.tracks.total

        return this.checkCurrUserSavedTracks(tracks);
      }),
      map((results: any) => {
        results.forEach((result, resultIndex) => {
          album.tracks[resultIndex].isSaved = result;
        });
        return [album, total];
      })
    );
  }

  getAlbumTracks(albumId: string, currBatch: Batch) {
    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.Batch], currBatch)
    };
    let tracks: Track[];
    let total: number;

    return this.http.get(`${this.baseEndpoint}albums/${albumId}/tracks`, options).pipe(
      concatMap((results: any) => {
        tracks = [];

        results.items.forEach(item => {
          let track = item;
          let artists: Artist[] = [];

          track.artists.forEach(artist => {
            artists.push(new Artist(artist.id, artist.name));
          });

          tracks.push(new Track(track.id, track.name, track.duration_ms, false, track.uri, track.preview_url, artists));
        });
        total = results.total;
        return this.checkCurrUserSavedTracks(tracks);
      }),
      map((results: any) => {
        results.forEach((result, resultIndex) => {
          tracks[resultIndex].isSaved = result;
        });
        return [tracks, total];
      })
    );
  }

  checkCurrUserSavedAlbums(albums: Album[]) {
    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.Ids], albums)
    };
    return this.http.get(`${this.baseEndpoint}me/albums/contains`, options);
  }

  saveAlbumsCurrUser(albums: Album[]) {
    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.Ids], albums)
    };
    return this.http.put(`${this.baseEndpoint}me/albums`, {}, options);
  }

  removeAlbumsCurrUser(albums: Album[]) {
    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.Ids], albums)
    };
    return this.http.delete(`${this.baseEndpoint}me/albums`, options);
  }

  searchAlbums(params: Search, currBatch: Batch) {
    let values: any = { ...params, ...currBatch };
    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.Batch, ParamType.Search], values)
    };
    return this.http.get(`${this.baseEndpoint}search`, options).pipe(
      map((results: any) => {
        let albums: Album[] = [];

        results.albums.items.forEach(item => {
          let artists: Artist[] = [];

          item.artists.forEach(artist => {
            artists.push(new Artist(artist.id, artist.name));
          });

          albums.push(new Album(item.id, item.name, artists, this.extractImage(item.images)));
        });
        return [albums, Math.min(results.albums.total, this.maxSearchOffset)];
      })
    );
  }
  // ========================================


  // ========================================
  // Artists
  // ========================================
  getCurrUserFollowedArtists(currBatch: Batch) {
    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.CursorBatch], currBatch)
    };
    return this.http.get(`${this.baseEndpoint}me/following?type=artist`, options).pipe(
      map((results: any) => {
        let artists: Artist[] = [];

        results.artists.items.forEach(item => {
          artists.push(new Artist(item.id, item.name, this.extractImage(item.images)));
        });

        return [artists, results.artists.total];
      })
    );
  }

  getArtist(artistId: string) {
    let options = { headers: this.generateHeaders() };
    return this.http.get(`${this.baseEndpoint}artists/${artistId}`, options).pipe(
      map((result: any) => {
        return new Artist(result.id, result.name, this.extractImage(result.images));
      })
    );
  }

  getArtistTopTracks(artistId: string, user: User) {
    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.Localization], user)
    };
    let tracks: Track[];
    return this.http.get(`${this.baseEndpoint}artists/${artistId}/top-tracks`, options).pipe(
      concatMap((results: any) => {
        tracks = [];

        results.tracks.forEach(track => {
          let artists: Artist[] = [];
          let album = new Album(track.album.id, track.album.name, [], this.extractImage(track.album.images));

          track.artists.forEach(artist => {
            artists.push(new Artist(artist.id, artist.name));
          });

          tracks.push(new Track(track.id, track.name, track.duration_ms, false, track.uri, track.preview_url, artists, album));
        });
        return this.checkCurrUserSavedTracks(tracks);
      }),
      map((results: any) => {
        results.forEach((result, resultIndex) => {
          tracks[resultIndex].isSaved = result;
        });
        return tracks;
      })
    );
  }

  getArtistAlbums(artistId: string, currBatch: Batch) {
    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.Batch], currBatch)
    };
    options.params.include_groups = "album";
    return this.http.get(`${this.baseEndpoint}artists/${artistId}/albums`, options).pipe(
      map((results: any) => {
        let albums: Album[] = [];

        results.items.forEach(item => {
          let artists: Artist[] = [];

          item.artists.forEach(artist => {
            artists.push(new Artist(artist.id, artist.name));
          });

          albums.push(new Album(item.id, item.name, artists, this.extractImage(item.images)));
        });
        return [albums, results.total];
      })
    );
  }

  checkCurrUserFollowsArtists(artists: Artist[]) {
    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.Ids], artists)
    };
    options.params.type = "artist";
    return this.http.get(`${this.baseEndpoint}me/following/contains`, options);
  }

  followArtists(artists: Artist[]) {
    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.Ids], artists)
    };
    options.params.type = "artist";
    return this.http.put(`${this.baseEndpoint}me/following`, {}, options);
  }

  unfollowArtists(artists: Artist[]) {
    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.Ids], artists)
    };
    options.params.type = "artist";
    return this.http.delete(`${this.baseEndpoint}me/following`, options);
  }

  searchArtists(params: Search, currBatch: Batch) {
    let values: any = { ...params, ...currBatch };
    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.Batch, ParamType.Search], values)
    };
    return this.http.get(`${this.baseEndpoint}search`, options).pipe(
      map((results: any) => {
        let artists: Artist[] = [];

        results.artists.items.sort((a, b) => +b.popularity - +a.popularity);
        results.artists.items.forEach(item => {
          artists.push(new Artist(item.id, item.name, this.extractImage(item.images)));
        });

        return [artists, Math.min(results.artists.total, this.maxSearchOffset)];
      })
    );
  }
  // ========================================

  generateHeaders() {
    let headers = { "Authorization": `Bearer ${this.dataService.fragments.accessToken}` };
    return headers;
  }

  generateParams(paramTypes: ParamType[], values: any) {
    let params: any = {};

    paramTypes.forEach(paramType => {
      if (paramType == ParamType.Batch) {
        params.limit = values.limit.toString();
        params.offset = values.offset.toString();
      }
      if (paramType == ParamType.CursorBatch) {
        params.limit = values.limit.toString();
        if (values.lastId.toString().length > 0) params.after = values.lastId.toString();
      }
      if (paramType == ParamType.Ids) {
        params.ids = "";
        values.forEach(element => { params.ids += `${element.id.toString()},`; });
        params.ids = params.ids.slice(0, -1);
      }
      if (paramType == ParamType.URIs) {
        params.uris = "";
        values.forEach(element => { params.uris += `${element.uri.toString()},`; });
        params.uris = params.uris.slice(0, -1);
      }
      if (paramType == ParamType.Localization) {
        params.country = values.country.toString();
      }
      if (paramType == ParamType.Search) {
        params.q = values.q.toString();
        params.type = values.type.toString();
      }
    });

    return params;
  }

  extractImage(images): string {
    return (images && images.length > 0) ? images[0].url : "";
  }

  onError(response: HttpErrorResponse) {
    let error = response.error.error;

    if (error.status == 401) {
      let message: string[] = error.message.toLowerCase().split(" ");

      if (message.includes("token") && message.includes("expired")) {
        this.dialogConfirmationRef = this.dialog.open(CommonDialogConfirmationComponent, { data: DialogType.TokenExpired });

        this.dialogConfirmationRef.afterClosed().pipe(
          filter(isConfirm => isConfirm),
          take(1)
        ).subscribe(() => {
          localStorage.removeItem(this.stateKey);
          this.checkLogin();
        });
      }
    }
  }
}

enum ParamType {
  Batch,
  CursorBatch,
  Ids,
  URIs,
  Localization,
  Search
}