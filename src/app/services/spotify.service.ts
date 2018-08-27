import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { DataService } from './data.service';
import { Batch, Playlist, User, Track, Artist, Album } from '../models/spotify.model';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  readonly baseEndpoint = "	https://api.spotify.com/v1/";
  readonly stateKey = "spotify_auth_state";

  constructor(
    private dataService: DataService,
    private http: HttpClient
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
    let state = this.generateRandomString(16);
    let scope = "user-read-private";
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

  removeTracksUser(tracks: Track[]) {
    let options = {
      headers: this.generateHeaders(),
      params: this.generateParams([ParamType.Ids], tracks)
    };
    return this.http.delete(`${this.baseEndpoint}me/tracks`, options);
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
      if (paramType == ParamType.Ids) {
        params.ids = "";
        values.forEach(element => { params.ids += `${element.id.toString()},`; });
        params.ids = params.ids.slice(0, -1);
      }
    });

    return params;
  }

  extractImage(images): string {
    return (images && images.length > 0) ? images[0].url : "";
  }
}

enum ParamType {
  Batch,
  Ids
}