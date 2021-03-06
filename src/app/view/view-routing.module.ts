import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewPlaylistComponent } from './view-playlist/view-playlist.component';
import { ViewAlbumComponent } from './view-album/view-album.component';
import { ViewArtistComponent } from './view-artist/view-artist.component';

const routes: Routes = [
  {
    path: "", children: [
      { path: "playlist/:playlistId/user/:ownerId", component: ViewPlaylistComponent },
      { path: "album/:albumId", component: ViewAlbumComponent },
      { path: "artist/:artistId", component: ViewArtistComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ViewRoutingModule { }
