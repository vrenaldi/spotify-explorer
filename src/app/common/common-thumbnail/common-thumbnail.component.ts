import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Thumbnail, ImgType } from '../../models/spotify.model';

@Component({
  selector: 'common-thumbnail',
  templateUrl: './common-thumbnail.component.html',
  styleUrls: ['./common-thumbnail.component.scss']
})
export class CommonThumbnailComponent implements OnInit {
  @Input() source: Thumbnail;
  imgType = ImgType;

  @ViewChild("imgThumbnail") imgThumbnail: ElementRef;

  constructor() { }

  ngOnInit() {
  }

  setIconSize() {
    let width = +this.imgThumbnail.nativeElement.clientWidth;
    return {
      'font-size': width / 2 + "px",
      'top': width / 4 + "px"
    };
  }
}
