import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LibraryComponent } from './library.component';
import { LibraryPlaylistsComponent } from './library-playlists/library-playlists.component';

const routes: Routes = [
  {
    path: "", component: LibraryComponent, children: [
      { path: "playlists", component: LibraryPlaylistsComponent },
      // { path: "tracks", component: LibraryTracksComponent },
      // { path: "albums", component: LibraryAlbumsComponent },
      // { path: "artists", component: LibraryArtistsComponent },
      { path: "", redirectTo: "playlists", pathMatch: "full" }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LibraryRoutingModule { }
