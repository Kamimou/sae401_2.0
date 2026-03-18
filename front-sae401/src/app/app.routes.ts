import { Routes } from '@angular/router';
import { AccueilComponent } from './accueil/accueil.component';
import { GraphComponent } from './graph/graph.component';

export const routes: Routes = [
  {
    path: '',
    component: AccueilComponent,
    pathMatch: 'full'
  },
  {
    path: 'graph',
    component: GraphComponent
  }
];
