import { Component, OnInit, OnDestroy } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router, RouterEvent, NavigationStart } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil, take } from "rxjs/operators";

import { DataService } from './services/data.service';
import { User } from './models/spotify.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  toolbarHeight: number;
  user: User;

  unsubscribe: Subject<any> = new Subject();

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private dataService: DataService) { }

  ngOnInit() {
    this.breakpointObserver.observe("(max-width: 600px)").pipe(takeUntil(this.unsubscribe))
      .subscribe(result => {
        if (result.matches) this.dataService.toolbarHeight.next(56);
        else this.dataService.toolbarHeight.next(64);
      });

    this.dataService.toolbarHeight.pipe(takeUntil(this.unsubscribe))
      .subscribe(toolbarHeight => { this.toolbarHeight = toolbarHeight; })
    this.dataService.currUser.pipe(takeUntil(this.unsubscribe))
      .subscribe(userProfile => { this.user = userProfile; });

    this.router.events.pipe(take(1)).subscribe((event: RouterEvent) => {
      if (event instanceof NavigationStart) {
        if (!event.url.startsWith("/login")) localStorage.setItem("redirectURL", decodeURI(event.url));
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
