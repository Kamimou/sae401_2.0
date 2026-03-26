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
        // Filtre recherche régions
        effect(() => {
            const term = this.searchRegionTerm().toLowerCase();
            this.regionsFiltres.set(
                this.regions().filter(r => 
                    r.nom?.toLowerCase().includes(term) || 
                    r.code?.toLowerCase().includes(term)
                )
            );
        });
        
        // Filtre recherche départements + filtre région
        effect(() => {
            const term = this.searchTerm().toLowerCase();
            let filtered = this.departements();
            
            // Recherche texte
            filtered = filtered.filter(dept => 
                dept.nom?.toLowerCase().includes(term) || 
                dept.code?.toLowerCase().includes(term)
            );
            
            // Filtre par région sélectionnée
            const selRegion = this.selectedRegion();
            if (selRegion?.departements) {
                const deptCodesRegion = selRegion.departements.map((d: any) => d.code);
                filtered = filtered.filter(dept => deptCodesRegion.includes(dept.code));
            }
            
            this.departementsFiltres.set(filtered);
        });
        
        // Filtre combiné + chart
        effect(() => {
            this.appliquerFiltresCombinés();
            this.renderChart();
        });
    }
    
    ngOnInit(): void {
        // Load départements
        this.api.getDepartements().subscribe({
            next: (data) => {
                const depts = Array.isArray(data) ? data : data?.['hydra:member'] || [];
                this.departements.set(depts);
                this.departementsFiltres.set(depts);
            },
            error: (err) => console.error('Erreur départements:', err)
        });
        
        // Load logements
        this.api.getLogements().subscribe({
            next: (data) => {
                const logementsData = Array.isArray(data) ? data : data?.['hydra:member'] || [];
                this.logements.set(logementsData);
                this.logementsFiltres.set(logementsData);
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.errorMessage.set(err?.message ?? 'Erreur inconnue');
            }
        });
        
        // Load régions
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
        this.renderChart();
    }
    
    ngOnDestroy(): void {
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
    
    private appliquerFiltresCombinés(): void {
        let result = this.logements();
        
        // Filtre région → départements de cette région
        const selRegion = this.selectedRegion();
        if (selRegion?.departements && selRegion.departements.length > 0) {
            const deptCodes = selRegion.departements.map((d: any) => d.code);
            result = result.filter(l => deptCodes.includes(l.departement?.code));
        }
        
        // Filtre département
        const selDept = this.selectedDepartement();
        if (selDept?.code) {
            result = result.filter(l => l.departement?.code === selDept.code);
        }
        
        this.logementsFiltres.set(result);
    }
    
    private renderChart(): void {
        const canvas = this.canvas?.nativeElement;
        const data = this.logementsFiltres().slice(0, 10);
        
        if (!canvas || data.length === 0) return;
        
        const labels = data.map(l => `${l.departement?.code ?? ''} - ${l.departement?.nom ?? 'N/A'}`);
        const nombreLogements = data.map(l => Number(l.nombreLogement ?? 0));
        const constructions = data.map(l => Number(l.construction ?? 0));
        
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
                        borderWidth: 1
                    },
                    {
                        label: 'Construction',
                        data: constructions,
                        backgroundColor: '#0096C7',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: { ticks: { maxRotation: 45 } },
                    y: { beginAtZero: true }
                }
            }
        });
    }
}
