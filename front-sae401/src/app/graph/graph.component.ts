import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api';

@Component({
  standalone: true,
  selector: 'app-graph',
  imports: [CommonModule, FormsModule],
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {
  logements = signal<any[]>([]);
  departements = signal<any[]>([]);
  departementsFiltres = signal<any[]>([]);
  searchTerm = signal('');
  selectedDepartement = signal<any | null>(null);
  erreur = signal<string | null>(null);

  private api = inject(ApiService);

  constructor() {
    // Filtrage temps réel
    effect(() => {
      const term = this.searchTerm().toLowerCase();
      const all = this.departements();
      this.departementsFiltres.set(
        all.filter(dept => 
          dept.nom?.toLowerCase().includes(term) || 
          dept.code?.toLowerCase().includes(term)
        )
      );
    });
  }

  ngOnInit(): void {
    // Chargement départements
    this.api.getDepartements().subscribe({
      next: (data) => {
        this.departements.set(data);
        this.departementsFiltres.set(data);
      },
      error: (err) => {
        console.error('Erreur départements:', err);
      }
    });

    // Chargement logements existant
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

  selectDepartement(dept: any): void {
    this.selectedDepartement.set(dept);
    // Filtre les logements pour ce département
    const filteredLogements = this.logements().filter(l => 
      l.departement?.code === dept.code
    );
    this.logements.set(filteredLogements);
  }

  clearFilter(): void {
    this.selectedDepartement.set(null);
    this.searchTerm.set('');
    // Recharger tous les logements
    this.api.getLogements().subscribe({
      next: (data) => {
        this.logements.set(data);
      }
    });
  }
}

