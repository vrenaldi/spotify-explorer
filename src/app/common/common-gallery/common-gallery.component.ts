import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { List, Thumbnail, SubThumbnail, ThumbnailType } from '../../models/spotify.model';

@Component({
  selector: 'common-gallery',
  templateUrl: './common-gallery.component.html',
  styleUrls: ['./common-gallery.component.scss']
})
export class CommonGalleryComponent implements OnInit, OnDestroy {
  @Input() source: List[];
  gridCols: number;

  unsubscribe: Subject<any> = new Subject();

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router
  ) {
    this.gridCols = 2;
  }

  ngOnInit() {
    this.breakpointObserver.observe("(min-width: 1280px)").pipe(takeUntil(this.unsubscribe))
      .subscribe(result => {
        if (result.matches) this.gridCols = 8;
      });
    this.breakpointObserver.observe("(min-width: 600px) and (max-width: 1279px)").pipe(takeUntil(this.unsubscribe))
      .subscribe(result => {
        if (result.matches) this.gridCols = 4;
      });
    this.breakpointObserver.observe("(max-width: 599px)").pipe(takeUntil(this.unsubscribe))
      .subscribe(result => {
        if (result.matches) this.gridCols = 2;
      });
  }

  lastInRow(index: number): boolean {
    if ((index + 1) % this.gridCols == 0) return true;

    return false;
  }

  toThumbnail(item: List): Thumbnail {
    let subThumbnails: SubThumbnail[] = [];
    item.subLists.forEach(element => { subThumbnails.push(new SubThumbnail(element.id, element.name, element.image)); });

    return new Thumbnail(item.id, item.name, item.imgType, ThumbnailType.Gallery, item.image, subThumbnails);
  }

  goToDetail(item: List) {
    if (item.routes.length == 0) return;


    let routes: string[] = ["view"];
    for (let i = 0; i < item.routes.length; i++) {
      routes.push(item.routes[i]);

      if (i == 0) routes.push(item.id);
      else routes.push(item.subLists[i - 1].id)
    }

    this.router.navigate(routes);
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
