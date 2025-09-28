import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Register Indonesian locale data for Angular pipes
import localeId from '@angular/common/locales/id';
import { registerLocaleData } from '@angular/common';
registerLocaleData(localeId, 'id');

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
