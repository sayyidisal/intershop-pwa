import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { async, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { anything, instance, mock, verify, when } from 'ts-mockito/lib/ts-mockito';
import { Product } from '../../../../models/product.model';
import { ProductListService } from '../../../../shared/services/products/products.service';
import { ProductListComponent } from './product-list.component';

describe('Product List Component', () => {
  let fixture: ComponentFixture<ProductListComponent>;
  let component: ProductListComponent;
  let element: HTMLElement;
  let productListService: ProductListService;
  const activatedRouteMock = {
    'url': Observable.of(
      [{ 'path': 'cameras', 'parameters': {} },
      { 'path': 'cameras', 'parameters': {} }
      ])
  };

  beforeEach(async(() => {
    productListService = mock(ProductListService);
    TestBed.configureTestingModule({
      declarations: [ProductListComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: ProductListService, useFactory: () => instance(productListService) }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    when(productListService.getProductList(anything())).thenReturn(Observable.of([new Product()]));
  });

  it('should retrieve products when created', () => {
    verify(productListService.getProductList(anything())).never();
    fixture.detectChanges();
    expect(component.products).not.toBe(null);
    verify(productListService.getProductList(anything())).once();
  });

  it('should check if the data is being rendered on the page', () => {
    fixture.detectChanges();
    const thumbs = element.querySelectorAll('is-product-tile');
    expect(thumbs.length).toBe(1);
  });
});