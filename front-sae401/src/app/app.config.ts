import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';

// When rendering on the server, Node's fetch rejects self-signed TLS certs.
// Symfony dev server uses a self-signed certificate, so we relax rejection for dev.
if (typeof process !== 'undefined' && process.env) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch())
  ]
};