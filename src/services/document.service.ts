import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, from } from 'rxjs';
import { mergeMap, map, switchMap } from 'rxjs/operators';

export interface GetBatchIdResponse {
  batchId: string;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private _batchId: string = '';

  private headers: any = {
    Authorization: `Basic ${btoa('Administrator:Administrator')}`,
  };
  private endpointURL: string = 'http://192.168.1.10:8080/nuxeo';

  constructor(private httpClient: HttpClient) {}

  public getBatchId(): Observable<string> {
    const url = `${this.endpointURL}/site/api/v1/upload`;
    const options = { headers: this.headers };

    return this.httpClient
      .post<GetBatchIdResponse>(url, undefined, options)
      .pipe(map((value) => value.batchId));
  }

  public uploadDocumentFile(batchId: string, data: any): Observable<any> | any {
    this._batchId = batchId;

    const url = `${this.endpointURL}/site/api/v1/upload/${batchId}/0`;
    const options: any = {
      headers: {
        ...this.headers,
        'Content-Type': 'application/octet-stream',
        Accept: 'application/octet-stream',
      },
    };

    return from(
      fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: data,
      })
    );
  }

  public updateDocumentInfo(batchId: any) {
    const url = `${this.endpointURL}/api/v1/id/c77a9e52-789a-4a55-9fc7-d2527ac7598d`;
    const data = {
      'entity-type': 'document',
      repository: 'default',
      properties: {
        'file:content': {
          'upload-batch': this._batchId,
          'upload-fileId': '0',
        },
      },
    };
    const options = { headers: this.headers };

    return this.httpClient.put<GetBatchIdResponse>(url, data, options);
  }

  public completeDocumentProcess(data: any): Observable<any> {
    return this.getBatchId().pipe(
      switchMap((batchId: string) =>
        this.uploadDocumentFile(batchId, data).pipe(
          switchMap((batchId) => this.updateDocumentInfo(batchId))
        )
      )
    );
  }
}
