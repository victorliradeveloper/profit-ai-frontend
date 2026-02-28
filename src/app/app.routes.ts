import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { PlanningComponent } from './pages/planning/planning.component';
import { AssistantComponent } from './pages/assistant/assistant.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: 'configuracoes', component: SettingsComponent, canActivate: [authGuard] },
  { path: 'planejamento', component: PlanningComponent, canActivate: [authGuard] },
  { path: 'transacoes', component: TransactionsComponent, canActivate: [authGuard] },
  { path: 'assistente', component: AssistantComponent, canActivate: [authGuard] },
  { path: 'relatorios', component: ReportsComponent, canActivate: [authGuard] },
  { path: 'categorias', component: CategoriesComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
