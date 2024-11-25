import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card'; // Importar módulo de Material Card
import { HttpClientModule } from '@angular/common/http'; // Importar HttpClientModule

import { AppComponent } from './app.component';
import { QueryRecordsComponent } from './components/query-records/query-records.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        HttpClientModule, // Agregar HttpClientModule
        FormsModule,
        MatCardModule // Agregar módulo de Material Card
      ],
      declarations: [
        AppComponent,
        QueryRecordsComponent
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'GORSEIA'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('GORSEIA');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, GORSEIA');
  });
});
