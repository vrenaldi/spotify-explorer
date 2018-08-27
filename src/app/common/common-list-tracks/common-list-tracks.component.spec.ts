import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonListTracksComponent } from './common-list-tracks.component';

describe('CommonListTracksComponent', () => {
  let component: CommonListTracksComponent;
  let fixture: ComponentFixture<CommonListTracksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonListTracksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonListTracksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
