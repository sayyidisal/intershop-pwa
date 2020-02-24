import { Routes } from '@angular/router';

export function topLevelRouteWrap(children: Routes): Routes {
  return [
    {
      path: '',
      children,
    },
    {
      path: 'en-us',
      data: {
        lang: 'en_US',
        channel: 'inSPIRED-inTRONICS-Site',
      },
      children,
    },
    {
      path: 'se-sv',
      data: {
        lang: 'de_DE',
        channel: 'inSPIRED-inTRONICS_Business-Site',
      },
      children,
    },
  ];
}
