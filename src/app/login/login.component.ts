import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { Subject } from 'rxjs';
import { takeUntil, filter, map } from 'rxjs/operators';

import { DataService } from '../services/data.service';
import { SpotifyService } from '../services/spotify.service';
import { User } from '../models/user.model';

@Component({
  template: ""
})
export class LoginComponent implements OnInit, OnDestroy {
  unsubscribe: Subject<any> = new Subject();

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private spotifyService: SpotifyService,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.fragment.pipe(
      takeUntil(this.unsubscribe),
      filter((fragments: string) => (fragments) && (fragments != "")),
      map((fragments: string) => fragments.split("&").map(keyValue => keyValue.split("=")))
    ).subscribe((fragments: string[][]) => {
      fragments.forEach(fragment => {
        if (fragment[0] == "access_token") this.dataService.fragments.accessToken = fragment[1];
        if (fragment[0] == "state") this.dataService.fragments.state = fragment[1];
      });

      this.spotifyService.getCurrUserProfile().pipe(takeUntil(this.unsubscribe))
        .subscribe(
          (user: any) => {
            this.dataService.user.next(new User(user.id, user.display_name, this.spotifyService.extractImage(user.images), user.country, user.email));

            // let redirectURL: string = "/library/playlists";
            let redirectURL: string = "/library";
            if (localStorage.getItem("redirectURL")) {
              redirectURL = localStorage.getItem("redirectURL");
              localStorage.removeItem("redirectURL");
            }

            this.router.navigate([redirectURL]);
          },
          // (response: HttpErrorResponse) => {
          //   localStorage.setItem("redirectURL", "/library/playlists");
          //   this.spotifyService.onError(response);
          // }
        );
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
