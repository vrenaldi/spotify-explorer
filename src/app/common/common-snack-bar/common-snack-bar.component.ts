import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material';

import { SnackBarType } from '../../models/spotify.model';

@Component({
  selector: 'app-common-snack-bar',
  templateUrl: './common-snack-bar.component.html',
  styleUrls: ['./common-snack-bar.component.scss']
})
export class CommonSnackBarComponent implements OnInit {
  @ViewChild("message") message: ElementRef;

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }

  ngOnInit() {
    if (this.data == SnackBarType.LibrarySaved) this.message.nativeElement.innerHTML = "Saved to your Library";
    else if (this.data == SnackBarType.LibraryRemoved) this.message.nativeElement.innerHTML = "Removed from your Library";
    else if (this.data == SnackBarType.PlaylistAdded) this.message.nativeElement.innerHTML = "Track was added to your Playlist(s)";
    else if (this.data == SnackBarType.PlaylistRemoved) this.message.nativeElement.innerHTML = "Track was removed from your Playlist";
    else if (this.data == SnackBarType.PreviewNotAvailable) this.message.nativeElement.innerHTML = "Preview is not available";
  }

}
