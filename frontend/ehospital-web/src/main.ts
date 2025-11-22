import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeEs from '@angular/common/locales/es';
import localeFr from '@angular/common/locales/fr';
import localeAr from '@angular/common/locales/ar';
import localeDe from '@angular/common/locales/de';
import localeZh from '@angular/common/locales/zh';
import localeJa from '@angular/common/locales/ja';
import localePt from '@angular/common/locales/pt';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { tokenInterceptor } from './app/core/interceptors/token-interceptor';

// Register locale data
registerLocaleData(localeEn);
registerLocaleData(localeEs);
registerLocaleData(localeFr);
registerLocaleData(localeAr);
registerLocaleData(localeDe);
registerLocaleData(localeZh);
registerLocaleData(localeJa);
registerLocaleData(localePt);

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([tokenInterceptor]))
  ]
}).catch(err => console.error(err));
