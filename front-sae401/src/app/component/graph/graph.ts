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

type Logement = {
    departement?: { nom?: string; code?: string };
    nombreLogement?: number | string | null;
    construction?: number | string | null;
};

@Component({
    standalone: true,
    selector: 'app-graph',
    imports: [CommonModule, FormsModule],
    templateUrl: './graph.html',
    styleUrls: ['./graph.css'],
})
export class Graph implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('indicDemo') canvas?: ElementRef<HTMLCanvasElement>;

    logements = signal<Logement[]>([]);
    logementsFiltres = signal<Logement[]>([]);
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

        // Mise à jour chart quand logementsFiltres change
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

        // Load logements
        this.api.getLogements().subscribe({
            next: (data) => {
                this.logements.set(data ?? []);
                this.logementsFiltres.set(data ?? []);
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
            this.logementsFiltres.set(
                this.logements().filter(l => l.departement?.code === dept.code)
            );
        } else {
            this.logementsFiltres.set(this.logements());
        }
    }

    clearFilter(): void {
        this.searchTerm.set('');
        this.selectedDepartement.set(null);
        this.logementsFiltres.set(this.logements());
    }

    private renderChart(): void {
        const canvas = this.canvas?.nativeElement;
        const logementsFiltres = this.logementsFiltres().slice(0, 10);

        if (!canvas || logementsFiltres.length === 0) return;

        const labels = logementsFiltres.map(
            (logement) => logement.departement?.nom ?? 'N/A'
        );

        const nombreLogements = logementsFiltres.map((logement) => Number(logement.nombreLogement ?? 0));
        const constructions = logementsFiltres.map((logement) => Number(logement.construction ?? 0));

        this.chart?.destroy();
        this.chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Nombre de logements',
                        data: nombreLogements,
                        backgroundColor: '#023E8A',
                        borderColor: 'black',
                        borderWidth: 1,
                    },
                    {
                        label: 'Construction',
                        data: constructions,
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

