import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { QueryRecord } from '../model/query';

@Injectable({
  providedIn: 'root'
})
export class QueryRecordService {
  private baseUrl = 'http://localhost:8081/api';
  private timeoutDuration = 15000; // 15 segundos timeout

  constructor(private http: HttpClient) {}

  private getHeaders(contentType: 'text/plain' | 'application/json' = 'text/plain'): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': contentType,
      'Accept': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error en la solicitud';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión.';
          break;
        case 404:
          errorMessage = 'El recurso solicitado no fue encontrado.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor.';
          break;
        default:
          errorMessage = `Error del servidor: ${error.status}, mensaje: ${error.message}`;
          break;
      }
    }

    console.error('Error detallado:', error);
    return throwError(() => new Error(errorMessage));
  }

  executeQuery(query: string): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/groq/query`, query, {
      headers: this.getHeaders('text/plain'),
      responseType: 'text' as 'json'
    }).pipe(
      timeout(this.timeoutDuration),
      catchError(this.handleError)
    );
  }

  executeQueryAndStore(query: string): Observable<QueryRecord> {
    return this.http.post<QueryRecord>(`${this.baseUrl}/groq/query-and-store`, query, {
      headers: this.getHeaders('text/plain')
    }).pipe(
      timeout(this.timeoutDuration),
      map(response => this.processQueryRecord(response)),
      catchError(this.handleError)
    );
  }

  getAllQueryRecords(): Observable<QueryRecord[]> {
    return this.http.get<QueryRecord[]>(`${this.baseUrl}/query-records`).pipe(
      timeout(this.timeoutDuration),
      map(records => records
        .map(record => this.processQueryRecord(record))
        .filter(record => record.status === 'A')
      ),
      catchError(this.handleError)
    );
  }

  getQueryRecordById(id: string): Observable<QueryRecord | null> {
    return this.http.get<QueryRecord>(`${this.baseUrl}/query-records/${id}`).pipe(
      timeout(this.timeoutDuration),
      map(record => {
        const processedRecord = this.processQueryRecord(record);
        return processedRecord.status === 'A' ? processedRecord : null;
      }),
      catchError(this.handleError)
    );
  }

  softDeleteQueryRecord(id: string): Observable<QueryRecord> {
    return this.http.patch<QueryRecord>(
      `${this.baseUrl}/query-records/${id}/status`,
      { status: 'I' },
      { headers: this.getHeaders('application/json') }
    ).pipe(
      timeout(this.timeoutDuration),
      map(record => this.processQueryRecord(record)),
      catchError(this.handleError)
    );
  }

  restoreQueryRecord(id: string): Observable<QueryRecord> {
    return this.http.patch<QueryRecord>(
      `${this.baseUrl}/query-records/${id}/status`,
      { status: 'A' },
      { headers: this.getHeaders('application/json') }
    ).pipe(
      timeout(this.timeoutDuration),
      map(record => this.processQueryRecord(record)),
      catchError(this.handleError)
    );
  }

  getAllQueryRecordsIncludingInactive(): Observable<QueryRecord[]> {
    return this.http.get<QueryRecord[]>(`${this.baseUrl}/query-records/all`).pipe(
      timeout(this.timeoutDuration),
      map(records => records.map(record => this.processQueryRecord(record))),
      catchError(this.handleError)
    );
  }

  toggleStatus(id: string, newStatus: 'A' | 'I'): Observable<QueryRecord> {
    return this.http.patch<QueryRecord>(
      `${this.baseUrl}/query-records/${id}/status`,
      { status: newStatus },
      { headers: this.getHeaders('application/json') }
    ).pipe(
      timeout(this.timeoutDuration),
      map(record => this.processQueryRecord(record)),
      catchError(this.handleError)
    );
  }

  private processQueryRecord(record: QueryRecord): QueryRecord {
    return {
      ...record,
      timestamp: new Date(record.timestamp),
      status: record.status || 'A' // Valor por defecto 'A' si no existe
    };
  }

  checkServerConnection(): Observable<boolean> {
    return this.http.get(`${this.baseUrl}/health-check`).pipe(
      timeout(5000), // Timeout más corto para verificación de conexión
      map(() => true),
      catchError(() => {
        console.error('No se pudo establecer conexión con el servidor');
        return throwError(() => new Error('Error de conexión con el servidor'));
      })
    );
  }
}
