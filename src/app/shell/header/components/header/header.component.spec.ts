import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { MEDIUM_BREAKPOINT_WIDTH } from 'ish-core/configurations/injection-keys';
import { FeatureToggleModule } from 'ish-core/feature-toggle.module';
import { IconModule } from 'ish-core/icon.module';
import { configurationReducer } from 'ish-core/store/configuration/configuration.reducer';
import { MockComponent } from 'ish-core/utils/dev/mock.component';

import { HeaderComponent } from './header.component';

describe('Header Component', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let element: HTMLElement;
  let component: HeaderComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FeatureToggleModule,
        IconModule,
        NgbCollapseModule,
        RouterTestingModule,
        StoreModule.forRoot(
          { configuration: configurationReducer },
          { initialState: { configuration: { features: ['compare'] } } }
        ),
        TranslateModule.forRoot(),
      ],
      declarations: [
        HeaderComponent,
        MockComponent({
          selector: 'ish-product-compare-status-container',
          template: 'Product Compare Status Container',
        }),
        MockComponent({
          selector: 'ish-search-box-container',
          template: 'Search Box Container',
          inputs: ['configuration'],
        }),
        MockComponent({ selector: 'ish-header-navigation-container', template: 'Header Navigation Container' }),
        MockComponent({ selector: 'ish-language-switch-container', template: 'Language Switch Container' }),
        MockComponent({ selector: 'ish-login-status-container', template: 'Login Status Container' }),
        MockComponent({ selector: 'ish-mini-basket-container', template: 'Mini Basket Container' }),
        MockComponent({ selector: 'ish-user-information-mobile', template: 'Mobile User Information' }),
      ],
      providers: [{ provide: MEDIUM_BREAKPOINT_WIDTH, useValue: 768 }],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        element = fixture.nativeElement;
      });
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  describe('rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should render User Links on template', () => {
      expect(element.getElementsByTagName('ish-login-status-container')[0].textContent).toContain(
        'Login Status Container'
      );
      expect(element.getElementsByTagName('ish-product-compare-status-container')[0].textContent).toContain(
        'Product Compare Status Container'
      );
    });
    it('should render Language Switch on template', () => {
      expect(element.getElementsByTagName('ish-language-switch-container')[0].textContent).toContain(
        'Language Switch Container'
      );
    });

    it('should render Search Box on template', () => {
      expect(element.getElementsByTagName('ish-search-box-container')[0].textContent).toContain('Search Box Container');
    });

    it('should render Header Navigation on template', () => {
      expect(element.getElementsByTagName('ish-header-navigation-container')[0].textContent).toContain(
        'Header Navigation Container'
      );
    });
  });
});
