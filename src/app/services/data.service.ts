import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  fragments: SpotifyFragments;
  user: BehaviorSubject<User>;

  constructor() {
    this.fragments = { accessToken: "", state: "" };
    this.user = new BehaviorSubject(new User("", ""));
  }
}

interface SpotifyFragments {
  accessToken: string,
  state: string
}
