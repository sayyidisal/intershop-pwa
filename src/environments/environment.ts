// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  platformId: '',
  production: false,
  needMock: true,
  rest_url: 'http://localhost/INTERSHOP/rest/WFS/inSPIRED-inTRONICS-Site/-',
  base_url: 'http://localhost',

  locales: [
    { 'lang': 'en_US', 'currency': 'USD', value: 'English', displayValue: 'en' },
    { 'lang': 'de_DE', 'currency': 'EUR', value: 'German', displayValue: 'de' },
    { 'lang': 'fr_FR', 'currency': 'EUR', value: 'French', displayValue: 'fr' }
  ],
  prefix: 'ROUTES'
};
