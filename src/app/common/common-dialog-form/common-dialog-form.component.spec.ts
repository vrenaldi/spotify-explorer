import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonDialogFormComponent } from './common-dialog-form.component';

describe('CommonDialogFormComponent', () => {
  let component: CommonDialogFormComponent;
  let fixture: ComponentFixture<CommonDialogFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonDialogFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonDialogFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
