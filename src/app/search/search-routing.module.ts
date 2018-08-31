import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchComponent } from './search.component';
import { SearchArtistsComponent } from './search-artists/search-artists.component';
import { SearchTracksComponent } from './search-tracks/search-tracks.component';
import { SearchAlbumsComponent } from './search-albums/search-albums.component';
import { SearchPlaylistsComponent } from './search-playlists/search-playlists.component';

const routes: Routes = [
  {
    path: "", component: SearchComponent, children: [
      { path: "artists/:query", component: SearchArtistsComponent },
      { path: "tracks/:query", component: SearchTracksComponent },
      { path: "albums/:query", component: SearchAlbumsComponent },
      { path: "playlists/:query", component: SearchPlaylistsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchRoutingModule { }
