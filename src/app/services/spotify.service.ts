import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { DataService } from './data.service';

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

  generateHeaders() {
    let headers = { "Authorization": `Bearer ${this.dataService.fragments.accessToken}` };
    return headers;
  }

  extractImage(images): string {
    return (images && images.length > 0) ? images[0].url : "";
  }
}