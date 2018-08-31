import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { fromEvent, Subject } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';

import { Route } from '../models/route.model';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  @ViewChild("inputSearch") inputSearch: ElementRef;

  routes: Route[];
  query: string;

  unsubscribe: Subject<any> = new Subject();

  constructor(private router: Router) {
    this.query = "";
    this.routes = [
      { path: "artists", label: "Artists" },
      { path: "tracks", label: "Songs" },
      { path: "albums", label: "Albums" },
      { path: "playlists", label: "Playlists" }
    ];
  }

  ngOnInit() {
    let url: string[] = decodeURI(this.router.url).split("/");
    if (url[3]) {
      this.inputSearch.nativeElement.value = url[3];
      this.query = url[3];
    }
    else this.inputSearch.nativeElement.value = "";

    this.inputSearch.nativeElement.focus();

    fromEvent(this.inputSearch.nativeElement, "input").pipe(
      debounceTime(300),
      map((event: any) => event.target.value),
      takeUntil(this.unsubscribe)
    ).subscribe(query => {
      this.query = query;
      if (query == "") this.router.navigate(["search"]);
      else this.router.navigate(["search", "artists", query]);
    });
  }

  formSubmit() { return false; }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
