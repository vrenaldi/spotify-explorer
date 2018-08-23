import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  fragments: SpotifyFragments;

  toolbarHeight: BehaviorSubject<number>;
  user: BehaviorSubject<User>;

  constructor() {
    this.fragments = { accessToken: "", state: "" };

    this.toolbarHeight = new BehaviorSubject(56);
    this.user = new BehaviorSubject(new User("", ""));
  }
}

interface SpotifyFragments {
  accessToken: string,
  state: string
}
