import { Routes } from '@angular/router';
import { Home } from './component/home/home';
import { Graph } from './component/graph/graph';
import { Footer } from './component/footer/footer';
import { Header } from './component/header/header';

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'app-graph', component: Graph},
    {path: 'app-header', component: Header},
    {path: 'app-footer', component: Footer},
];
