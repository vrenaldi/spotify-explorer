import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CustomCommonModule } from '../common/custom-common.module';
import { MaterialModule } from '../material.module';
import { SearchRoutingModule } from './search-routing.module';

import { SearchComponent } from './search.component';
import { SearchArtistsComponent } from './search-artists/search-artists.component';
import { SearchTracksComponent } from './search-tracks/search-tracks.component';
import { SearchAlbumsComponent } from './search-albums/search-albums.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    InfiniteScrollModule,
    CustomCommonModule,
    MaterialModule,
    SearchRoutingModule
  ],
  declarations: [SearchComponent, SearchArtistsComponent, SearchTracksComponent, SearchAlbumsComponent]
})
export class SearchModule { }
