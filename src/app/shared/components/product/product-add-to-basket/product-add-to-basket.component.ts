import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { CheckoutFacade } from 'ish-core/facades/checkout.facade';
import { ProductContextFacade } from 'ish-core/facades/product-context.facade';
import { whenFalsy } from 'ish-core/utils/operators';

/**
 * Displays an add to cart button with an icon or a text label. After clicking the button a loading animation is displayed
 *
 * @example
 * <ish-product-add-to-basket
    [class]="'btn-lg btn-block'"
    [disabled]="productDetailForm.invalid"
    [translationKey]="isRetailSet(product) ? 'product.add_to_cart.retailset.link' : 'product.add_to_cart.link'"
  ></ish-product-add-to-basket>
 */
@Component({
  selector: 'ish-product-add-to-basket',
  templateUrl: './product-add-to-basket.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// tslint:disable-next-line:ccp-no-intelligence-in-components
export class ProductAddToBasketComponent implements OnInit, OnDestroy {
  basketLoading$: Observable<boolean>;

  /**
   * When true, it specifies that the button should be disabled
   */
  @Input() disabled = false;
  /**
   * when 'icon', the button label is an icon, otherwise it is text
   */
  @Input() displayType?: 'icon' | 'link' = 'link';
  /**
   * additional css styling
   */
  @Input() class?: string;
  /**
   * translationKey for the button label
   */
  @Input() translationKey = 'product.add_to_cart.link';

  isAvailable$: Observable<boolean>;

  constructor(private checkoutFacade: CheckoutFacade, private productContext: ProductContextFacade) {}

  // fires 'true' after add To Cart is clicked and basket is loading
  displaySpinner$ = new BehaviorSubject(false);

  private destroy$ = new Subject();

  ngOnInit() {
    this.isAvailable$ = this.productContext.product$.pipe(map(product => product.inStock && product.availability));

    this.basketLoading$ = this.checkoutFacade.basketLoading$;

    // update emitted to display spinning animation
    this.basketLoading$
      .pipe(
        whenFalsy(),
        takeUntil(this.destroy$)
      )
      .subscribe(this.displaySpinner$); // false
  }

  addToBasket() {
    this.productContext.addToBasket();
    this.displaySpinner$.next(true);
  }

  get displayIcon(): boolean {
    return this.displayType === 'icon';
  }

  ngOnDestroy() {
    this.destroy$.next();
  }
}
