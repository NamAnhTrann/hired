import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDetailPage } from './view-detail-page';

describe('ViewDetailPage', () => {
  let component: ViewDetailPage;
  let fixture: ComponentFixture<ViewDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDetailPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
