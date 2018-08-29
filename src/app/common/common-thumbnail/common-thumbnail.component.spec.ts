import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonThumbnailComponent } from './common-thumbnail.component';

describe('CommonThumbnailComponent', () => {
  let component: CommonThumbnailComponent;
  let fixture: ComponentFixture<CommonThumbnailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonThumbnailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonThumbnailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
