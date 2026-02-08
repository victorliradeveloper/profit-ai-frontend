import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '../http/api-url';
import { API_PATHS } from '../http/api-paths';

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
      apiUrl(API_PATHS.s3.upload),
      formData,
      {}
    );
  }

  downloadByKey(key: string): Observable<Blob> {
    return this.http.get(
      apiUrl(API_PATHS.s3.downloadByKey(key)),
      { responseType: 'blob' as const }
    );
  }
}

