import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Data,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, take } from 'rxjs/operators';

import { AVAILABLE_LOCALES } from 'ish-core/configurations/injection-keys';
import { Locale } from 'ish-core/models/locale/locale.model';
import { CookiesService } from 'ish-core/services/cookies/cookies.service';
import { ApplyConfiguration } from 'ish-core/store/configuration';
import { SelectLocale, getCurrentLocale } from 'ish-core/store/locale';
import { mapToProperty, whenTruthy } from 'ish-core/utils/operators';

export class SetLanguageGuard implements CanActivate, CanActivateChild {
  constructor(
    private store: Store<{}>,
    private router: Router,
    @Inject(AVAILABLE_LOCALES) private locales: Locale[],
    @Inject(PLATFORM_ID) private platformId: string,
    private cookies: CookiesService
  ) {}

  canActivateChild = this.canActivate;

  private findLocale(lang: string): Locale {
    return this.locales.find(loc => loc.lang === lang);
  }

  private setLocaleByRouteDefinition(data: Data) {
    let lang = data.lang;
    let channel = data.channel;

    if (!lang && isPlatformBrowser(this.platformId)) {
      const cookieContent = this.cookies.get('channel');
      if (cookieContent) {
        const cookie = JSON.parse(cookieContent);
        lang = cookie.lang;
        channel = cookie.channel;
      }
    }

    const routeLocale = this.findLocale(lang);
    if (routeLocale) {
      this.store.dispatch(new SelectLocale({ lang: routeLocale.lang }));
      this.store.dispatch(new ApplyConfiguration({ channel }));
      if (isPlatformBrowser(this.platformId)) {
        const cookieContent = {
          lang: routeLocale.lang,
          channel,
        };
        this.cookies.put('channel', JSON.stringify(cookieContent));
      }
    }
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    this.setLocaleByRouteDefinition(route.data);

    return this.store.pipe(
      select(getCurrentLocale),
      mapToProperty('displayName'),
      distinctUntilChanged(),
      whenTruthy(),
      take(1),
      map(name => {
        const firstPath = state.url.split('/')[1];

        if (firstPath !== name) {
          const newUrl = `/${name}${state.url}`;
          return this.router.parseUrl(newUrl);
        } else {
          return true;
        }
      })
    );
  }
}
