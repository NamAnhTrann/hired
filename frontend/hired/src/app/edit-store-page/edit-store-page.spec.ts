import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStorePage } from './edit-store-page';

describe('EditStorePage', () => {
  let component: EditStorePage;
  let fixture: ComponentFixture<EditStorePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditStorePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditStorePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
