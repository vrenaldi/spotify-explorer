import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonSnackBarComponent } from './common-snack-bar.component';

describe('CommonSnackBarComponent', () => {
  let component: CommonSnackBarComponent;
  let fixture: ComponentFixture<CommonSnackBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonSnackBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonSnackBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
