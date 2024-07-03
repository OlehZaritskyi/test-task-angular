import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IFormsArray, IResponse } from '../interfaces/main.inreface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {}

  checkUsername(username: string): Observable<{ isAvailable: boolean }> {
    return this.http.post<{ isAvailable: boolean }>('/api/checkUsername', { username });
  }

  submitForm(data: IFormsArray[]): Observable<IResponse> {
    return this.http.post<IResponse>('/api/submitForm', data);
  }
}
