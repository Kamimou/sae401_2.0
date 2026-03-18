import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent {
  titre = 'Statistiques Logements';
  description = 'Bienvenue dans l\'application de suivi des logements par département.';
}
