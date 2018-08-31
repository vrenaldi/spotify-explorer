import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchTracksComponent } from './search-tracks.component';

describe('SearchTracksComponent', () => {
  let component: SearchTracksComponent;
  let fixture: ComponentFixture<SearchTracksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchTracksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchTracksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
