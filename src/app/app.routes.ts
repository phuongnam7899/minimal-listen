import { Routes } from '@angular/router';
import { ListenComponent } from './listen/listen.component';

export const routes: Routes = [
  { path: 'listen', component: ListenComponent },
  { path: '', redirectTo: '/listen', pathMatch: 'full' },
  { path: '**', redirectTo: '/listen' },
];
