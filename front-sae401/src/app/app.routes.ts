import { Routes } from '@angular/router';
import { Home } from './component/home/home';
import { Graph } from './component/graph/graph';
import { Footer } from './component/footer/footer';
import { Header } from './component/header/header';
import { Graph2 } from './component/graph2/graph2';

export const routes: Routes = [
    {path: '', component: Home, title: 'Accueil Analyse Sociale'},
    {path: 'app-graph', component: Graph, title: 'Graphiques Analyse Sociale'},
    {path: 'app-header', component: Header},
    {path: 'app-footer', component: Footer},
    {path: 'app-graph2', component: Graph2, title: 'Données Territoriales'},
];
