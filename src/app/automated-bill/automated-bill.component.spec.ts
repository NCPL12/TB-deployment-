import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomatedBillComponent } from './automated-bill.component';

describe('AutomatedBillComponent', () => {
  let component: AutomatedBillComponent;
  let fixture: ComponentFixture<AutomatedBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutomatedBillComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AutomatedBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
