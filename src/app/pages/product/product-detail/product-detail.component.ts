import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ProductContextFacade } from 'ish-core/facades/product-context.facade';
import { VariationOptionGroup } from 'ish-core/models/product-variation/variation-option-group.model';
import { VariationSelection } from 'ish-core/models/product-variation/variation-selection.model';
import {
  ProductView,
  VariationProductMasterView,
  VariationProductView,
} from 'ish-core/models/product-view/product-view.model';
import { ProductHelper, ProductPrices } from 'ish-core/models/product/product.model';

@Component({
  selector: 'ish-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent implements OnInit {
  @Input() price: ProductPrices;
  @Input() variationOptions: VariationOptionGroup[];
  @Output() selectVariation = new EventEmitter<VariationSelection>();

  productDetailForm: FormGroup;
  readonly quantityControlName = 'quantity';

  isVariationProduct = ProductHelper.isVariationProduct;
  isMasterProduct = ProductHelper.isMasterProduct;
  isRetailSet = ProductHelper.isRetailSet;

  product$: Observable<ProductView | VariationProductView | VariationProductMasterView>;

  constructor(private productContext: ProductContextFacade) {}

  ngOnInit() {
    this.product$ = this.productContext.product$;
    this.productDetailForm = new FormGroup({
      [this.quantityControlName]: new FormControl(),
    });
    this.productContext.connectQuantity(
      this.productDetailForm.get(this.quantityControlName).valueChanges.pipe(map<string, number>(v => +v))
    );
  }

  variationSelected(selection: VariationSelection) {
    this.selectVariation.emit(selection);
  }
}
