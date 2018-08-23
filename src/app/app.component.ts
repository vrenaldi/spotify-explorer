import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil, take } from "rxjs/operators";

import { DataService } from './services/data.service';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  user: User;

  unsubscribe: Subject<any> = new Subject();

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.dataService.user.pipe(takeUntil(this.unsubscribe))
      .subscribe(userProfile => { this.user = userProfile; console.log(this.user); });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
