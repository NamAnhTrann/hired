import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingPage } from './setting-page';

describe('SettingPage', () => {
  let component: SettingPage;
  let fixture: ComponentFixture<SettingPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
