import { Component, OnInit, Input, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Thumbnail, ImgType, ThumbnailType } from '../../models/spotify.model';

@Component({
  selector: 'common-thumbnail',
  templateUrl: './common-thumbnail.component.html',
  styleUrls: ['./common-thumbnail.component.scss']
})
export class CommonThumbnailComponent implements OnInit, AfterViewInit {
  @Input() source: Thumbnail;
  imgType = ImgType;
  thumbnailType = ThumbnailType;

  @ViewChild("imgThumbnail") imgThumbnail: ElementRef;

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
  }

  ngAfterViewInit() { this.cd.detectChanges(); }

  setIconSize() {
    let width = +this.imgThumbnail.nativeElement.clientWidth;
    return {
      'font-size': width / 2 + "px",
      'top': width / 4 + "px"
    };
  }
}
