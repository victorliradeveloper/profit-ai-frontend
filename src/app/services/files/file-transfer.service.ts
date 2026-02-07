import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileTransferService {
  constructor(
    private http: HttpClient
  ) {}

  upload(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(
      `${environment.apiBaseUrl}/upload`,
      formData,
      { responseType: 'text' }
    );
  }

  download(filename: string): Observable<Blob> {
    return this.http.get(
      `${environment.apiBaseUrl}/download/${encodeURIComponent(filename)}`,
      { responseType: 'blob' }
    );
  }
}

