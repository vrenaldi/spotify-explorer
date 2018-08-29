import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { CustomCommonModule } from '../common/custom-common.module';
import { MaterialModule } from '../material.module';
import { ViewRoutingModule } from './view-routing.module';

import { ViewPlaylistComponent } from './view-playlist/view-playlist.component';
import { ViewAlbumComponent } from './view-album/view-album.component';

@NgModule({
  imports: [
    CommonModule,
    CustomCommonModule,
    InfiniteScrollModule,
    MaterialModule,
    ViewRoutingModule
  ],
  declarations: [ViewPlaylistComponent, ViewAlbumComponent]
})
export class ViewModule { }
