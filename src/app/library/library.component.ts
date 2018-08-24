import { Component, OnInit } from '@angular/core';
import { Route } from '../models/route.model';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {
  routes: Route[];

  constructor() {
    this.routes = [
      { path: "playlists", label: "Playlists" },
      { path: "tracks", label: "Songs" },
      { path: "albums", label: "Albums" },
      { path: "artists", label: "Artists" }
    ];
  }

  ngOnInit() {
  }

}
