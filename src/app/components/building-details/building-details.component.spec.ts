import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildingDetailsComponent } from './building-details.component';

describe('BuildingDetailsComponent', () => {
  let component: BuildingDetailsComponent;
  let fixture: ComponentFixture<BuildingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildingDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BuildingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
