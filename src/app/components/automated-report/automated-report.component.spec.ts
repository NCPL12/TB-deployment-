import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomatedReportComponent } from './automated-report.component';

describe('AutomatedReportComponent', () => {
  let component: AutomatedReportComponent;
  let fixture: ComponentFixture<AutomatedReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutomatedReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AutomatedReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
