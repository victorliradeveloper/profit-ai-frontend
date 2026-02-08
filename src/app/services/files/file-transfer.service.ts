import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type UploadS3Response = {
  key: string;
};

@Injectable({
  providedIn: 'root'
})
export class FileTransferService {
  constructor(
    private http: HttpClient
  ) {}

  uploadAvatar(file: File): Observable<UploadS3Response> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadS3Response>(
      `${environment.apiBaseUrl}/v1/s3/upload`,
      formData,
      {}
    );
  }

  downloadByKey(key: string): Observable<Blob> {
    return this.http.get(
      `${environment.apiBaseUrl}/v1/s3/download/${encodeURIComponent(key)}`,
      { responseType: 'blob' as const }
    );
  }
}

