import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    inject,
    signal,
    effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { ApiService } from '../../services/api';

type TauxPauvrete = {
    departement?: { nom?: string; code?: string };
    tauxPauvrete?: number | string | null;
    taux_pauvrete?: number | string | null;
};

@Component({
    selector: 'app-graph2',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './graph2.html',
    styleUrl: './graph2.css',
})
export class Graph2 implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('tauxP') canvas?: ElementRef<HTMLCanvasElement>;

    taux_pauvrete = signal<TauxPauvrete[]>([]);
    taux_pauvreteFiltres = signal<TauxPauvrete[]>([]);
    departements = signal<any[]>([]);
    departementsFiltres = signal<any[]>([]);
    searchTerm = signal('');
    selectedDepartement = signal<any | null>(null);
    errorMessage = signal<string | null>(null);

    private api = inject(ApiService);
    private cdr = inject(ChangeDetectorRef);
    private chart: Chart | null = null;

    constructor() {
        // Filtre recherche départements temps réel
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

        // Mise à jour chart quand taux_pauvreteFiltres change
        effect(() => {
            this.renderChart();
        });
    }

    ngOnInit(): void {
        // Load départements
        this.api.getDepartements().subscribe({
            next: (data) => {
                const departementsRecus = Array.isArray(data)
                    ? data
                    : (data as any)?.['hydra:member'] || (data as any)?.departements || [];

                this.departements.set(departementsRecus);
                this.departementsFiltres.set(departementsRecus);
            },
            error: (err) => {
                console.error('Erreur départements:', err);
            }
        });

        // Réutilise l'endpoint existant logement qui expose aussi tauxPauvrete.
        this.api.getLogements().subscribe({
            next: (data) => {
                this.taux_pauvrete.set(data ?? []);
                this.taux_pauvreteFiltres.set(data ?? []);
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.errorMessage.set(err?.message ?? 'Erreur inconnue');
            },
        });
    }

    ngAfterViewInit(): void {
        this.renderChart();
    }

    ngOnDestroy(): void {
        this.chart?.destroy();
        this.chart = null;
    }

    selectDepartement(dept: any): void {
        this.selectedDepartement.set(dept);
        if (dept) {
            this.taux_pauvreteFiltres.set(
                this.taux_pauvrete().filter(t => t.departement?.code === dept.code)
            );
        } else {
            this.taux_pauvreteFiltres.set(this.taux_pauvrete());
        }
    }

    clearFilter(): void {
        this.searchTerm.set('');
        this.selectedDepartement.set(null);
        this.taux_pauvreteFiltres.set(this.taux_pauvrete());
    }

    private renderChart(): void {
        const canvas = this.canvas?.nativeElement;
        const taux_pauvreteFiltres = this.taux_pauvreteFiltres().slice(0, 10);

        if (!canvas || taux_pauvreteFiltres.length === 0) return;

        const labels = taux_pauvreteFiltres.map(
            (taux) => taux.departement?.nom ?? 'N/A'
        );

        const taux_pauvrete = taux_pauvreteFiltres.map((taux) => Number(taux.tauxPauvrete ?? taux.taux_pauvrete ?? 0));

        this.chart?.destroy();
        this.chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Taux de pauvreté',
                        data: taux_pauvrete,
                        backgroundColor: '#0096C7',
                        borderColor: 'black',
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                        },
                    },
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
    }
}
