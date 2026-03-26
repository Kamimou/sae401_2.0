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
import { Graph2 } from "../graph2/graph2";

type Region = {
    code?: string;
    nom?: string;
    departements?: any[];
};

type Logement = {
    departement?: {
        nom?: string;
        code?: string;
    };
    nombreLogement?: number | string | null;
    construction?: number | string | null;
};

@Component({
    standalone: true,
    selector: 'app-graph',
    imports: [CommonModule, FormsModule, Graph2],
    templateUrl: './graph.html',
    styleUrls: ['./graph.css'],
})
export class Graph implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('indicDemo') canvas?: ElementRef<HTMLCanvasElement>;

    // --- Variables de données (Signals Angular) ---
    logements = signal<Logement[]>([]);
    logementsFiltres = signal<Logement[]>([]);
    departements = signal<any[]>([]);
    departementsFiltres = signal<any[]>([]);
    regions = signal<Region[]>([]);
    regionsFiltres = signal<Region[]>([]);
    searchTerm = signal('');
    searchRegionTerm = signal('');
    selectedDepartement = signal<any | null>(null);
    selectedRegion = signal<Region | null>(null);
    errorMessage = signal<string | null>(null);

    private api = inject(ApiService);
    private cdr = inject(ChangeDetectorRef);
    private chart: Chart | null = null;

    constructor() {
        // Logique de recherche pour les Régions
        effect(() => {
            const term = this.searchRegionTerm().toLowerCase();
            this.regionsFiltres.set(
                this.regions().filter(r =>
                    r.nom?.toLowerCase().includes(term) ||
                    r.code?.toLowerCase().includes(term)
                )
            );
        });

        // Logique de recherche pour les Départements
        effect(() => {
            const term = this.searchTerm().toLowerCase();
            let filtered = this.departements();

            filtered = filtered.filter(dept =>
                dept.nom?.toLowerCase().includes(term) ||
                dept.code?.toLowerCase().includes(term)
            );

            const selRegion = this.selectedRegion();
            if (selRegion?.departements) {
                const deptCodesRegion = selRegion.departements.map((d: any) => d.code);
                filtered = filtered.filter(dept => deptCodesRegion.includes(dept.code));
            }

            this.departementsFiltres.set(filtered);
        });

        // Mise à jour automatique du graphique quand les filtres changent
        effect(() => {
            this.appliquerFiltresCombinés();
            this.renderChart();
        });
    }

    ngOnInit(): void {
        // Au chargement du composant, on récupère toutes les données depuis l'API

        // 1. Récupération des départements
        this.api.getDepartements().subscribe({
            next: (data) => {
                const depts = Array.isArray(data) ? data : data?.['hydra:member'] || [];
                this.departements.set(depts);
                this.departementsFiltres.set(depts);
            },
            error: (err) => console.error('Erreur départements:', err)
        });

        // 2. Récupération des données de logement
        this.api.getLogements().subscribe({
            next: (data) => {
                const logementsData = Array.isArray(data) ? data : data?.['hydra:member'] || [];
                this.logements.set(logementsData);
                this.logementsFiltres.set(logementsData);
                this.cdr.detectChanges(); // Force Angular à voir le changement pour le canvas
            },
            error: (err) => {
                this.errorMessage.set(err?.message ?? 'Erreur inconnue');
            }
        });

        // 3. Récupération des régions
        this.api.getRegions().subscribe({
            next: (data) => {
                const regionsData = Array.isArray(data) ? data : data?.['hydra:member'] || [];
                console.log('Régions API:', regionsData);
                this.regions.set(regionsData);
                this.regionsFiltres.set(regionsData);
            },
            error: (err) => console.error('Erreur régions:', err)
        });
    }

    ngAfterViewInit(): void {
        // Une fois que l'affichage est prêt, on dessine le graphique
        this.renderChart();
    }

    ngOnDestroy(): void {
        // On détruit le graphique quand on quitte la page pour éviter les fuites de mémoire
        this.chart?.destroy();
    }

    selectRegion(region: Region): void {
        this.selectedRegion.set(region);
    }

    selectDepartement(dept: any): void {
        this.selectedDepartement.set(dept);
    }

    clearFilters(): void {
        this.searchTerm.set('');
        this.searchRegionTerm.set('');
        this.selectedRegion.set(null);
        this.selectedDepartement.set(null);
        this.logementsFiltres.set(this.logements());
    }

    getTitreDynamique(): string {
        let titre = "Alerte Sociale : Chômage vs Logement";

        if (this.selectedRegion()) {
            titre += ` - ${this.selectedRegion()?.nom}`;
        }
        if (this.selectedDepartement()) {
            titre += ` / ${this.selectedDepartement()?.nom}`;
        }

        return titre;
    }

    private appliquerFiltresCombinés(): void {
        // Cette fonction recalcule la liste logementsFiltres selon ce qui est sélectionné
        let result = this.logements();

        // Si une région est choisie, on ne garde que ses départements
        const selRegion = this.selectedRegion();
        if (selRegion?.departements && selRegion.departements.length > 0) {
            const deptCodes = selRegion.departements.map((d: any) => d.code);
            result = result.filter(l => deptCodes.includes(l.departement?.code));
        }

        // Si un département précis est choisi, on filtre encore plus
        const selDept = this.selectedDepartement();
        if (selDept?.code) {
            result = result.filter(l => l.departement?.code === selDept.code);
        }

        this.logementsFiltres.set(result);
    }

    private renderChart(): void {
        if (typeof window === 'undefined') return;

        const canvas = this.canvas?.nativeElement;
        const chartData = this.getRegionalChartData();

        if (!canvas || chartData.labels.length === 0) return;

        const ctx = canvas.getContext('2d');
        let bgSociaux: any = '#3b82f6';
        let bgChomage: any = '#f59e0b';
        let hoverSociaux: any = '#2563eb';
        let hoverChomage: any = '#d97706';

        if (ctx) {
            bgSociaux = ctx.createLinearGradient(0, 0, 0, 400);
            bgSociaux.addColorStop(0, 'rgba(59, 130, 246, 0.85)');
            bgSociaux.addColorStop(1, 'rgba(37, 99, 235, 0.4)');

            bgChomage = ctx.createLinearGradient(0, 0, 0, 400);
            bgChomage.addColorStop(0, 'rgba(245, 158, 11, 0.85)');
            bgChomage.addColorStop(1, 'rgba(217, 119, 6, 0.4)');

            hoverSociaux = ctx.createLinearGradient(0, 0, 0, 400);
            hoverSociaux.addColorStop(0, 'rgba(59, 130, 246, 1)');
            hoverSociaux.addColorStop(1, 'rgba(37, 99, 235, 0.8)');

            hoverChomage = ctx.createLinearGradient(0, 0, 0, 400);
            hoverChomage.addColorStop(0, 'rgba(245, 158, 11, 1)');
            hoverChomage.addColorStop(1, 'rgba(217, 119, 6, 0.8)');
        }

        this.chart?.destroy();
        this.chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: 'Taux de logements sociaux (%)',
                        data: chartData.socialHousingRates,
                        backgroundColor: bgSociaux,
                        hoverBackgroundColor: hoverSociaux,
                        borderColor: '#2563eb',
                        borderWidth: { top: 2, right: 0, bottom: 0, left: 0 },
                        borderRadius: 6,
                        borderSkipped: false,
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    },
                    {
                        label: 'Taux de chômage (%)',
                        data: chartData.unemploymentRates,
                        backgroundColor: bgChomage,
                        hoverBackgroundColor: hoverChomage,
                        borderColor: '#d97706',
                        borderWidth: { top: 2, right: 0, bottom: 0, left: 0 },
                        borderRadius: 6,
                        borderSkipped: false,
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: { family: "'Outfit', sans-serif", size: 13 },
                            color: '#475569'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleFont: { family: "'Outfit', sans-serif", size: 14, weight: 'bold' },
                        bodyFont: { family: "'Outfit', sans-serif", size: 13 },
                        padding: 12,
                        cornerRadius: 8,
                        boxPadding: 6
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { family: "'Outfit', sans-serif", size: 12 },
                            color: '#64748b',
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 35,
                        grid: {
                            color: '#e2e8f0',
                            tickLength: 0
                        },
                        border: {
                            dash: [5, 5],
                            display: false
                        },
                        ticks: {
                            font: { family: "'Outfit', sans-serif", size: 12 },
                            color: '#64748b',
                            padding: 10
                        },
                        title: {
                            display: true,
                            text: 'Pourcentage (%)',
                            font: { family: "'Outfit', sans-serif", size: 13 },
                            color: '#94a3b8',
                            padding: { bottom: 10 }
                        }
                    }
                },
                animation: {
                    duration: 1200,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    private generateFakeRate(seed: string, base: number, variance: number): number {
        const hash = seed.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        return Number((base + (hash % variance) + ((hash % 100) / 100)).toFixed(1));
    }

    private getRegionalChartData(): {
        labels: string[];
        socialHousingRates: number[];
        unemploymentRates: number[];
    } {
        const selDept = this.selectedDepartement();
        const selRegion = this.selectedRegion();

        let labels: string[] = [];
        let socialHousingRates: number[] = [];
        let unemploymentRates: number[] = [];

        if (selDept) {
            // Afficher le département sélectionné
            labels = [selDept.nom || selDept.code || 'Département'];
            socialHousingRates = [this.generateFakeRate(selDept.code || '1', 12, 10)];
            unemploymentRates = [this.generateFakeRate((selDept.code || '1') + 'u', 6, 6)];
        } else if (selRegion && selRegion.departements && selRegion.departements.length > 0) {
            // Afficher tous les départements de la région
            const depts = selRegion.departements;
            labels = depts.map(d => d.nom || d.code);
            socialHousingRates = depts.map(d => this.generateFakeRate(d.code || '1', 10, 12));
            unemploymentRates = depts.map(d => this.generateFakeRate((d.code || '1') + 'u', 5, 8));
        } else {
            // Vue Globale : Afficher les régions principales
            const sourceRegions = this.regions().slice(0, 15);
            if (sourceRegions.length > 0) {
                labels = sourceRegions.map(region => region.nom ?? region.code ?? 'Région');
                socialHousingRates = sourceRegions.map(region => this.generateFakeRate(region.code || '1', 11, 8));
                unemploymentRates = sourceRegions.map(region => this.generateFakeRate((region.code || '1') + 'u', 6, 5));
            } else {
                labels = ['Ile-de-France', 'Occitanie', 'Nouvelle-Aquitaine', 'Hauts-de-France', 'PACA'];
                socialHousingRates = [22.4, 14.1, 11.8, 18.7, 13.2];
                unemploymentRates = [7.3, 9.1, 8.2, 10.4, 8.9];
            }
        }

        return { labels, socialHousingRates, unemploymentRates };
    }
}
