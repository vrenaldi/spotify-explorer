import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewArtistComponent } from './view-artist.component';

describe('ViewArtistComponent', () => {
  let component: ViewArtistComponent;
  let fixture: ComponentFixture<ViewArtistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewArtistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewArtistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
