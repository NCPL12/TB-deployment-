import { Routes } from '@angular/router';
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
import { TenantManagementComponent } from './components/tenant-management/tenant-management.component';
import { ExportKwhReportComponent } from './components/export-kwh-report/export-kwh-report.component';
import { EnergyMeterManagementComponent } from './components/energy-meter-management/energy-meter-management.component';
import { HomeComponent } from './components/home/home.component';
import { BillingComponent } from './components/billing/billing.component';
import { LoginComponent } from './components/login/login.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { authGuard } from './guards/auth.guard';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { ManualBillingComponent } from './components/manual-billing/manual-billing.component';
import { BillingHistoryComponent } from './components/billing-history/billing-history.component';
import { BuildingDetailsComponent } from './components/building-details/building-details.component';
import { MonthlyReportComponent } from './components/monthly-report/monthly-report.component';
import { AutomatedBillComponent } from './automated-bill/automated-bill.component';
import { FloorManagementComponent } from './components/floor-management/floor-management.component';
import { FloorEnergyManagementComponent } from './floor-energymeter-management/floor-energy-management.component';
import { ReportHistoryComponent } from './components/report-history/report-history.component';
import {  AutomatedReportComponent} from './components/automated-report/automated-report.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    canActivate: [authGuard], 
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'export-kwh-report', component: ExportKwhReportComponent },
      { path: 'daily-visual-report', component: BarChartComponent },
      { path: 'tenant-management', component: TenantManagementComponent },
      { path: 'floor-management', component: FloorManagementComponent },
      { path: 'report-history', component: ReportHistoryComponent },
      { path: 'energy-meter-management', component: EnergyMeterManagementComponent },
      { path: 'floor-energy-management', component: FloorEnergyManagementComponent },
      { path: 'billing', component: BillingComponent },
      { path: 'manual-billing', component: ManualBillingComponent },
      { path: 'history', component: BillingHistoryComponent },
      { path: 'building-details', component: BuildingDetailsComponent },
      { path: 'automated-bill', component: AutomatedBillComponent },
      { path: 'automated-report', component:AutomatedReportComponent },
      { path: 'monthly-report', component: MonthlyReportComponent},
      { path: '', redirectTo: '/home', pathMatch: 'full' },
    ],
  },
  // Apply authGuard separately to enforce role-based restrictions
  { 
    path: 'user-management', 
    component: UserManagementComponent, 
    canActivate: [authGuard] 
  },
  { path: '**', component: NotFoundComponent },
];
