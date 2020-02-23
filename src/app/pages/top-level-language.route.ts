import { Inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Data,
  Router,
  RouterStateSnapshot,
  Routes,
  UrlTree,
} from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, take } from 'rxjs/operators';

import { AVAILABLE_LOCALES } from 'ish-core/configurations/injection-keys';
import { Locale } from 'ish-core/models/locale/locale.model';
import { ApplyConfiguration } from 'ish-core/store/configuration';
import { SelectLocale, getCurrentLocale } from 'ish-core/store/locale';
import { mapToProperty, whenTruthy } from 'ish-core/utils/operators';

export class SetLanguageGuard implements CanActivate, CanActivateChild {
  constructor(private store: Store<{}>, private router: Router, @Inject(AVAILABLE_LOCALES) private locales: Locale[]) {}

  canActivateChild = this.canActivate;

  private findLocale(lang: string): Locale {
    return this.locales.find(loc => loc.lang === lang);
  }

  private setLocaleByRouteDefinition(data: Data) {
    const lang = data.lang;
    const channel = data.channel;

    const routeLocale = this.findLocale(lang);
    if (routeLocale) {
      this.store.dispatch(new SelectLocale({ lang: routeLocale.lang }));
      this.store.dispatch(new ApplyConfiguration({ channel }));
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

export function topLevelRouteWrap(children: Routes): Routes {
  return [
    {
      path: '',
      children,
    },
    {
      path: 'se-sv',
      data: {
        lang: 'de_DE',
        channel: 'inSPIRED-inTRONICS-Site',
      },
      children,
    },
    {
      path: 'en-us',
      data: {
        lang: 'en_US',
        channel: 'inSPIRED-inTRONICS_Business-Site',
      },
      children,
    },
  ];
}
