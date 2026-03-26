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

type Region = {
    code?: string;
    nom?: string;
    departements?: Array<{ code?: string; nom?: string }>;
};

type StatistiqueLogement = {
    departement?: { nom?: string; code?: string };
    tauxLogementVacants?: number | string | null;
    taux_logement_vacants?: number | string | null;
    construction?: number | string | null;
    nombreLogement?: number | string | null;
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

    logements = signal<StatistiqueLogement[]>([]);
    logementsFiltres = signal<StatistiqueLogement[]>([]);
    regions = signal<Region[]>([]);
    departements = signal<any[]>([]);
    departementsFiltres = signal<any[]>([]);
    searchTerm = signal('');
    selectedRegion = signal<Region | null>(null);
    selectedDepartement = signal<any | null>(null);
    errorMessage = signal<string | null>(null);

    private api = inject(ApiService);
    private cdr = inject(ChangeDetectorRef);
    private chart: Chart | null = null;

    constructor() {
        // Filtre recherche départements + région
        effect(() => {
            const term = this.searchTerm().toLowerCase();
            let all = this.departements();

            const region = this.selectedRegion();
            if (region?.code) {
                all = all.filter((dept) => this.extractRegionCode(dept) === region.code);
            }

            this.departementsFiltres.set(
                all.filter(dept =>
                    dept.nom?.toLowerCase().includes(term) ||
                    dept.code?.toLowerCase().includes(term)
                )
            );
        });

        // Mise à jour du graphe selon les filtres
        effect(() => {
            this.applyCombinedFilters();
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

        this.api.getRegions().subscribe({
            next: (data) => {
                const regionsRecues = Array.isArray(data)
                    ? data
                    : (data as any)?.['hydra:member'] || [];

                this.regions.set(regionsRecues);
            },
            error: (err) => {
                console.error('Erreur régions:', err);
            }
        });

        this.api.getLogements().subscribe({
            next: (data) => {
                const logementsRecus = Array.isArray(data)
                    ? data
                    : (data as any)?.['hydra:member'] || [];

                this.logements.set(logementsRecus);
                this.logementsFiltres.set(logementsRecus);
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

    onRegionChange(regionCode: string): void {
        const region = this.regions().find((r) => r.code === regionCode) ?? null;
        this.selectedRegion.set(region);

        const currentDept = this.selectedDepartement();
        if (currentDept?.code && region?.code && this.extractRegionCode(currentDept) !== region.code) {
            this.selectedDepartement.set(null);
        }
    }

    onDepartementChange(deptCode: string): void {
        const dept = this.departements().find((d) => d.code === deptCode) ?? null;
        this.selectedDepartement.set(dept);
    }

    selectDepartement(dept: any): void {
        this.selectedDepartement.set(dept);
    }

    clearFilter(): void {
        this.searchTerm.set('');
        this.selectedRegion.set(null);
        this.selectedDepartement.set(null);
        this.logementsFiltres.set(this.logements());
    }

    private applyCombinedFilters(): void {
        let result = this.logements();

        const selectedRegion = this.selectedRegion();
        if (selectedRegion?.code) {
            const deptCodesInRegion = this.departements()
                .filter((dept) => this.extractRegionCode(dept) === selectedRegion.code)
                .map((dept) => dept.code);

            result = result.filter((item) => deptCodesInRegion.includes(item.departement?.code));
        }

        const selectedDept = this.selectedDepartement();
        if (selectedDept?.code) {
            result = result.filter((item) => item.departement?.code === selectedDept.code);
        }

        this.logementsFiltres.set(result);
    }

    private renderChart(): void {
        const canvas = this.canvas?.nativeElement;
        const logementsFiltres = this.logementsFiltres().slice(0, 10);

        if (!canvas || logementsFiltres.length === 0) return;

        const labels = logementsFiltres.map((item) => {
            const deptCode = item.departement?.code ?? '';
            const deptName = item.departement?.nom ?? 'N/A';
            const regionName = this.getRegionNameFromDepartementCode(item.departement?.code);
            return `${deptCode} - ${deptName} / ${regionName}`;
        });

        const tauxLogementsVacants = logementsFiltres.map((item) =>
            Number(item.tauxLogementVacants ?? item.taux_logement_vacants ?? 0)
        );

        const constructionSurDisponible = logementsFiltres.map((item) => {
            const construction = Number(item.construction ?? 0);
            const nombreLogements = Number(item.nombreLogement ?? 0);

            if (nombreLogements <= 0) {
                return 0;
            }

            return Number(((construction / nombreLogements) * 100).toFixed(2));
        });

        this.chart?.destroy();
        this.chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Taux de logements vacants (%)',
                        data: tauxLogementsVacants,
                        backgroundColor: '#1d4ed8',
                        borderColor: '#1e3a8a',
                        borderWidth: 1,
                    },
                    {
                        label: 'Logements en construction / disponibles (%)',
                        data: constructionSurDisponible,
                        backgroundColor: '#10b981',
                        borderColor: '#047857',
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
                        title: {
                            display: true,
                            text: 'Pourcentage (%)'
                        }
                    },
                },
            },
        });
    }

    private extractRegionCode(departement: any): string | undefined {
        const codeRegion = departement?.codeRegion;

        if (!codeRegion) {
            return undefined;
        }

        if (typeof codeRegion === 'string') {
            return codeRegion;
        }

        return codeRegion.code;
    }

    private getRegionNameFromDepartementCode(departementCode?: string): string {
        if (!departementCode) {
            return 'Région inconnue';
        }

        const departement = this.departements().find((d) => d.code === departementCode);
        const regionCode = this.extractRegionCode(departement);

        if (!regionCode) {
            return 'Région inconnue';
        }

        return this.regions().find((r) => r.code === regionCode)?.nom ?? regionCode;
    }
}
