import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryTracksComponent } from './library-tracks.component';

describe('LibraryTracksComponent', () => {
  let component: LibraryTracksComponent;
  let fixture: ComponentFixture<LibraryTracksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryTracksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryTracksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
