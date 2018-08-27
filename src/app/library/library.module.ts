import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CustomCommonModule } from '../common/custom-common.module';
import { MaterialModule } from '../material.module';

import { LibraryRoutingModule } from './library-routing.module';
import { LibraryComponent } from './library.component';
import { LibraryPlaylistsComponent } from './library-playlists/library-playlists.component';
import { LibraryTracksComponent } from './library-tracks/library-tracks.component';

@NgModule({
  imports: [
    CommonModule,
    InfiniteScrollModule,
    CustomCommonModule,
    MaterialModule,
    LibraryRoutingModule
  ],
  declarations: [
    LibraryComponent,
    LibraryPlaylistsComponent,
    LibraryTracksComponent
  ]
})
export class LibraryModule { }
