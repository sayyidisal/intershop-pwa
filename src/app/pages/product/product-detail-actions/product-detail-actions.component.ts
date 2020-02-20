import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';

import { ProductContextFacade } from 'ish-core/facades/product-context.facade';
import { ProductHelper } from 'ish-core/models/product/product.model';

@Component({
  selector: 'ish-product-detail-actions',
  templateUrl: './product-detail-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailActionsComponent {
  // TODO: to be removed once channelName inforamtion available in system
  channelName = 'inTRONICS';

  isMasterProduct = ProductHelper.isMasterProduct;

  product$ = this.productContext.product$;

  constructor(@Inject(DOCUMENT) public document: Document, private productContext: ProductContextFacade) {}

  addToCompare() {
    this.productContext.addToCompare();
  }
}
