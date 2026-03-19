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
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { ApiService } from '../../services/api';

type Logement = {
    departement?: { nom?: string };
    nombreLogement?: number | string | null;
    construction?: number | string | null;
    logementsMisEnLocation?: number | string | null;
};

@Component({
    standalone: true,
    selector: 'app-graph',
    imports: [CommonModule],
    templateUrl: './graph.html',
    styleUrls: ['./graph.css'],
})
export class Graph implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('indicDemo') canvas?: ElementRef<HTMLCanvasElement>;

    logements = signal<Logement[]>([]);
    errorMessage = signal<string | null>(null);


    private api = inject(ApiService);
    private cdr = inject(ChangeDetectorRef);
    private chart: Chart | null = null;

    
    
    // Récupère les données des logements
    ngOnInit(): void {
        this.api.getLogements().subscribe({
            next: (data) => {
                this.logements.set(data ?? []);
                this.cdr.detectChanges(); // force le rendu du canvas avant de dessiner
                this.renderChart();
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

    private renderChart(): void {
        const canvas = this.canvas?.nativeElement;
        const logements = this.logements().slice(0, 10); // affiche de index 0 à 10 départements

        if (!canvas || logements.length === 0) {
            return;
        }

        const labels = logements.map(
            (logement, index) => logement.departement?.nom ?? `Departement ${index + 1}`,// création des axes du tableau
        );

        const nombreLogements = logements.map((logement) => Number(logement.nombreLogement ?? 0));
        const constructions = logements.map((logement) => Number(logement.construction ?? 0));

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