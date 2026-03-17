import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './services/api';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  logements: any[] = [];
  private api = inject(ApiService);

  ngOnInit(): void {
    this.api.getLogements().subscribe({
      next: (data) => {
        this.logements = data;
        console.log(data);
      },
      error: (err) => {
        console.error('Erreur API', err);
      }
    });
  }
}