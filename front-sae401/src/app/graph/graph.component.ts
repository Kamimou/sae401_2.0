import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api';

@Component({
  standalone: true,
  selector: 'app-graph',
  imports: [CommonModule],
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {
  logements = signal<any[]>([]);
  erreur = signal<string | null>(null);
  private api = inject(ApiService);

  ngOnInit(): void {
    this.api.getLogements().subscribe({
      next: (data) => {
        this.logements.set(data);
      },
      error: (err) => {
        console.error(err);
        this.erreur.set('Erreur lors du chargement des données');
      }
    });
  }
}
