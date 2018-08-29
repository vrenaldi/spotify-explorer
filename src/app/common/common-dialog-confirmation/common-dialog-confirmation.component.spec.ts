import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonDialogConfirmationComponent } from './common-dialog-confirmation.component';

describe('CommonDialogConfirmationComponent', () => {
  let component: CommonDialogConfirmationComponent;
  let fixture: ComponentFixture<CommonDialogConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonDialogConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonDialogConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
