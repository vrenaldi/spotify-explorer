import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonGalleryComponent } from './common-gallery.component';

describe('CommonGalleryComponent', () => {
  let component: CommonGalleryComponent;
  let fixture: ComponentFixture<CommonGalleryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonGalleryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
