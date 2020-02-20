import { OnDestroy } from '@angular/core';
import { Observable, ReplaySubject, Subject, combineLatest } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';

import { ProductCompletenessLevel } from 'ish-core/models/product/product.model';

import { ShoppingFacade } from './shopping.facade';

// tslint:disable: member-ordering
export class ProductContextFacade implements OnDestroy {
  private level = ProductCompletenessLevel.List;
  setCompletenessLevel(level: ProductCompletenessLevel) {
    this.level = level;
  }

  constructor(private shoppingFacade: ShoppingFacade) {
    this.connectQuantity(this.product$.pipe(map(product => product.minOrderQuantity || 1)));
  }

  // tslint:disable-next-line: variable-name
  private _sku$ = new ReplaySubject<string>(1);
  connectSKU(stream: Observable<string>) {
    stream.pipe(takeUntil(this.destroy$)).subscribe(this._sku$);
  }
  sku$ = this._sku$.asObservable();

  // tslint:disable-next-line: variable-name
  private _quantity$ = new ReplaySubject<number>(1);
  connectQuantity(stream: Observable<number>) {
    stream.pipe(takeUntil(this.destroy$)).subscribe(this._quantity$);
  }
  quantity$ = this._quantity$.asObservable();

  product$ = this.shoppingFacade.product$(this._sku$, this.level);
  loading$ = this.shoppingFacade.productNotReady$(this._sku$, this.level);
  productVariationOptions$ = this.shoppingFacade.productVariationOptions$(this._sku$);

  addToBasket() {
    combineLatest([this._sku$, this._quantity$])
      .pipe(take(1))
      .subscribe(([sku, quantity]) => {
        console.log('add to basket', quantity, 'x', sku);
        this.shoppingFacade.addProductToBasket(sku, quantity);
      });
  }

  addToCompare() {
    this._sku$.pipe(take(1)).subscribe(sku => this.shoppingFacade.addProductToCompare(sku));
  }

  private destroy$ = new Subject();

  ngOnDestroy() {
    this.destroy$.next();
  }
}
