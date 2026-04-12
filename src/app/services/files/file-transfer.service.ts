import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, OperatorFunction } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isNonEmptyString } from '../utils/string.utils';
import { LoggerService } from '../logger/logger.service';
import { apiUrl } from '../http/api-url';
import { API_PATHS } from '../http/api-paths';

export interface UploadS3Response {
  key: string;
}

interface FileTransferConfig {
  readonly uploadUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileTransferService {
  private readonly config: FileTransferConfig = {
    uploadUrl: apiUrl(API_PATHS.s3.upload)
  };

  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) {}

  uploadAvatar(file: File): Observable<UploadS3Response> {
    this.validateFile(file);
    
    const formData = this.createFormData(file);
    
    return this.http.post<UploadS3Response>(
      this.config.uploadUrl,
      formData
    ).pipe(
      this.handleHttpError('uploadAvatar')
    );
  }

  downloadByKey(key: string): Observable<Blob> {
    this.validateKey(key);
    
    return this.http.get(
      apiUrl(API_PATHS.s3.downloadByKey(key)),
      { responseType: 'blob' as const }
    ).pipe(
      this.handleHttpError('downloadByKey')
    );
  }

  private createFormData(file: File): FormData {
    const formData = new FormData();
    formData.append('file', file);
    return formData;
  }

  private validateFile(file: File): asserts file is File {
    if (!file?.size) {
      throw new Error('Invalid file');
    }
  }

  private validateKey(key: string): asserts key is string {
    if (!isNonEmptyString(key)) {
      throw new Error('Invalid S3 key');
    }
  }

  private handleHttpError<T>(operation: string): OperatorFunction<T, T> {
    return catchError((error: unknown) => {
      this.logger.error(`FileTransferService [${operation}] failed:`, error);
      return throwError(() => error);
    }) as OperatorFunction<T, T>;
  }
}