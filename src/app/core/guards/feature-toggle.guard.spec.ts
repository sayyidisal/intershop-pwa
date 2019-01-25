import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';

import { configurationReducer } from 'ish-core/store/configuration/configuration.reducer';
import { FeatureToggleGuard, FeatureToggleModule } from '../feature-toggle.module';

describe('Feature Toggle Guard', () => {
  let router: Router;

  beforeEach(() => {
    @Component({ template: 'dummy', changeDetection: ChangeDetectionStrategy.OnPush })
    // tslint:disable-next-line:prefer-mocks-instead-of-stubs-in-tests
    class DummyComponent {}

    TestBed.configureTestingModule({
      declarations: [DummyComponent],
      imports: [
        FeatureToggleModule,
        RouterTestingModule.withRoutes([
          {
            path: 'error',
            component: DummyComponent,
          },
          {
            path: 'feature1',
            component: DummyComponent,
            canActivate: [FeatureToggleGuard],
            data: { feature: 'feature1' },
          },
          {
            path: 'feature2',
            component: DummyComponent,
            canActivate: [FeatureToggleGuard],
            data: { feature: 'feature2' },
          },
        ]),
        StoreModule.forRoot(
          { configuration: configurationReducer },
          { initialState: { configuration: { features: ['feature1'] } } }
        ),
      ],
    });

    router = TestBed.get(Router);
  });

  it('should navigate to activated features successfully', fakeAsync(() => {
    router.navigate(['/feature1']);
    tick(2000);

    expect(router.url).toEndWith('feature1');
  }));

  it('should not navigate to deactivated features', fakeAsync(() => {
    router.navigate(['/feature2']);
    tick(2000);

    expect(router.url).toEndWith('error');
  }));
});
