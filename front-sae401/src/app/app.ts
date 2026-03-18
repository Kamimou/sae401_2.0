import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './services/api';
import { AccueilComponent } from './accueil/accueil.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, AccueilComponent, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  logements = signal<any[]>([]);
  errorMessage = signal<string | null>(null);
  private api = inject(ApiService);

  ngOnInit(): void {
    this.api.getLogements().subscribe({
      next: (data) => {
        this.logements.set(data);
        console.log(data);
      },
      error: (err) => {
        console.error('Erreur API', err);
        this.errorMessage.set(err?.message ?? 'Erreur inconnue');
      }
    });
  }
}