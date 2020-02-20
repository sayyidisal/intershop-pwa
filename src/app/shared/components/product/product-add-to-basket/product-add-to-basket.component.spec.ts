import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { combineReducers } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';

import { ProductContextFacade } from 'ish-core/facades/product-context.facade';
import { createProductView } from 'ish-core/models/product-view/product-view.model';
import { Product } from 'ish-core/models/product/product.model';
import { checkoutReducers } from 'ish-core/store/checkout/checkout-store.module';
import { ngrxTesting } from 'ish-core/utils/dev/ngrx-testing';
import { categoryTree } from 'ish-core/utils/dev/test-data-utils';

import { ProductAddToBasketComponent } from './product-add-to-basket.component';

describe('Product Add To Basket Component', () => {
  let component: ProductAddToBasketComponent;
  let fixture: ComponentFixture<ProductAddToBasketComponent>;
  let translate: TranslateService;
  let element: HTMLElement;
  let productContext: ProductContextFacade;

  beforeEach(async(() => {
    const product = createProductView(
      {
        sku: 'sku',
        inStock: true,
        minOrderQuantity: 1,
        availability: true,
      } as Product,
      categoryTree()
    );

    productContext = mock(ProductContextFacade);
    when(productContext.product$).thenReturn(of(product));

    TestBed.configureTestingModule({
      imports: [
        ToastrModule.forRoot(),
        TranslateModule.forRoot(),
        ngrxTesting({
          reducers: {
            checkout: combineReducers(checkoutReducers),
          },
        }),
      ],
      declarations: [MockComponent(FaIconComponent), ProductAddToBasketComponent],
      providers: [{ provide: ProductContextFacade, useFactory: () => instance(productContext) }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductAddToBasketComponent);
    component = fixture.componentInstance;
    translate = TestBed.get(TranslateService);
    translate.setDefaultLang('en');
    translate.use('en');
    element = fixture.nativeElement;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should not render when inStock = false', () => {
    when(productContext.product$).thenReturn(
      of(
        createProductView(
          {
            sku: 'sku',
            inStock: false,
          } as Product,
          categoryTree()
        )
      )
    );
    fixture.detectChanges();
    expect(element.querySelector('button')).toBeFalsy();
  });

  it('should show button when display type is not icon ', () => {
    fixture.detectChanges();
    expect(element.querySelector('button').className).toContain('btn-primary');
  });

  it('should show icon button when display type is icon ', () => {
    component.displayType = 'icon';
    fixture.detectChanges();
    expect(element.querySelector('fa-icon')).toBeTruthy();
  });

  it('should show disable button when "disabled" is set to "false" ', () => {
    component.disabled = true;
    fixture.detectChanges();
    expect(element.querySelector('button').disabled).toBeTruthy();
  });

  it('should use default translation when nothing is configured', () => {
    fixture.detectChanges();
    expect(element.textContent).toMatchInlineSnapshot(`"product.add_to_cart.link"`);
  });

  it('should use configured translation when it is configured', () => {
    component.translationKey = 'abc';
    fixture.detectChanges();
    expect(element.textContent).toMatchInlineSnapshot(`"abc"`);
  });
});
