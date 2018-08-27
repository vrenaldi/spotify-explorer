import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { List, ImgType } from '../../models/spotify.model';

@Component({
  selector: 'common-list',
  templateUrl: './common-list.component.html',
  styleUrls: ['./common-list.component.scss']
})
export class CommonListComponent implements OnInit {
  @Input() source: List[];
  imgType = ImgType;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goToDetail(list: List) {
    if (list.routes.length == 0) return;


    let routes: string[] = ["view"];
    for (let i = 0; i < list.routes.length; i++) {
      routes.push(list.routes[i]);

      if (i == 0) routes.push(list.id);
      else routes.push(list.subLists[i - 1].id)
    }

    this.router.navigate(routes);
  }
}
