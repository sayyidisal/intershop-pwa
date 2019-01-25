import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { FeatureToggleModule } from 'ish-core/feature-toggle.module';
import { Product } from 'ish-core/models/product/product.model';

import { ProductDetailComponent } from './product-detail.component';

describe('Product Detail Component', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let element: HTMLElement;

  beforeEach(async(() => {
    const prod = { sku: 'sku' } as Product;

    TestBed.configureTestingModule({
      imports: [FeatureToggleModule, ReactiveFormsModule, TranslateModule.forRoot()],
      declarations: [ProductDetailComponent],
      // TODO: prepare more detailed test
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ProductDetailComponent);
        component = fixture.componentInstance;
        element = fixture.nativeElement;
        component.product = prod;
      });
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
