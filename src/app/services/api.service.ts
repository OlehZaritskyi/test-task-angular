import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IFormsArray, IResponse } from '../common/interfaces';

@Injectable()
export class ApiService {
  http = inject(HttpClient);

  checkUsername(username: string): Observable<{ isAvailable: boolean }> {
    return this.http.post<{ isAvailable: boolean }>('/api/checkUsername', { username });
  }

  submitForm(data: IFormsArray[]): Observable<IResponse> {
    return this.http.post<IResponse>('/api/submitForm', data);
  }
}
