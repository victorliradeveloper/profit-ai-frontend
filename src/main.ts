import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatPaginatorIntl } from '@angular/material/paginator';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/interceptors/auth.interceptor';
import { getPtBrPaginatorIntl } from './app/components/table/data-table/paginator-intl-ptbr';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    { provide: MatPaginatorIntl, useFactory: getPtBrPaginatorIntl },
  ]
}).catch(() => undefined);
