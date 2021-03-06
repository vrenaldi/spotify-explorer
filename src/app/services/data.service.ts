import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { User } from '../models/spotify.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  readonly tabsHeight: number;
  readonly formItemHeight: number;

  fragments: SpotifyFragments;

  toolbarHeight: BehaviorSubject<number>;
  currUser: BehaviorSubject<User>;

  constructor() {
    this.tabsHeight = 49;
    this.formItemHeight = 56.56;

    this.fragments = { accessToken: "", state: "" };

    this.toolbarHeight = new BehaviorSubject(56);
    this.currUser = new BehaviorSubject(new User("", ""));
  }
}

interface SpotifyFragments {
  accessToken: string,
  state: string
}
