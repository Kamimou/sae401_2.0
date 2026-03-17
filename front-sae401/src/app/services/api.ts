import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  getLogements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/statistique/logement`);
  }
}
