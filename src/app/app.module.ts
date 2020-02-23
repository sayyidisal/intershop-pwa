import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';

import { CoreModule } from 'ish-core/core.module';
import { addGlobalGuard } from 'ish-core/utils/routing';

import { AppComponent } from './app.component';
import { QuotingRoutingModule } from './extensions/quoting/pages/quoting-routing.module';
import { AppLastRoutingModule } from './pages/app-last-routing.module';
import { AppRoutingModule } from './pages/app-routing.module';
import { SetLanguageGuard } from './pages/top-level-language.route';
import { ShellModule } from './shell/shell.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'intershop-pwa' }),
    BrowserAnimationsModule,
    CoreModule,
    ShellModule,
    AppRoutingModule,
    QuotingRoutingModule,
    AppLastRoutingModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(router: Router) {
    addGlobalGuard(router, SetLanguageGuard);
  }
}
