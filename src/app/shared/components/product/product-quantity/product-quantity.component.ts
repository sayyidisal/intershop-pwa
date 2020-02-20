import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { range } from 'lodash-es';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

import { ProductContextFacade } from 'ish-core/facades/product-context.facade';
import { mapToProperty } from 'ish-core/utils/operators';
import { SelectOption } from 'ish-shared/forms/components/select/select.component';
import { SpecialValidators } from 'ish-shared/forms/validators/special-validators';

function generateSelectOptionsForRange(min: number, max: number): SelectOption[] {
  return range(min, max)
    .map(num => num.toString())
    .map(num => ({ label: num, value: num }));
}

@Component({
  selector: 'ish-product-quantity',
  templateUrl: './product-quantity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductQuantityComponent {
  @Input() readOnly = false;
  @Input() allowZeroQuantity = false;
  @Input() quantityLabel = 'product.quantity.label';
  @Input() parentForm: FormGroup;
  @Input() controlName: string;
  @Input() type?: 'input' | 'select' | 'counter';
  @Input() class?: string;

  isAvailable$: Observable<boolean>;
  quantity$: Observable<number>;
  quantityOptions$: Observable<SelectOption[]>;
  minOrderQuantity$: Observable<number>;
  maxOrderQuantity$: Observable<number>;

  constructor(productContext: ProductContextFacade) {
    this.isAvailable$ = productContext.product$.pipe(
      tap(product => {
        if (this.type === 'input') {
          this.parentForm
            .get(this.controlName)
            .setValidators(
              Validators.compose([
                Validators.required,
                Validators.min(this.allowZeroQuantity ? 0 : product.minOrderQuantity),
                Validators.max(product.maxOrderQuantity),
                SpecialValidators.integer,
              ])
            );
        }
        productContext.quantity$
          .pipe(take(1))
          .subscribe(quantity => this.parentForm.get(this.controlName).setValue(quantity));
      }),
      map(product => product.inStock && product.availability)
    );
    this.quantity$ = productContext.quantity$;
    this.quantityOptions$ = productContext.product$.pipe(
      map(product => generateSelectOptionsForRange(product.minOrderQuantity, product.maxOrderQuantity))
    );
    this.minOrderQuantity$ = productContext.product$.pipe(mapToProperty('minOrderQuantity'));
    this.maxOrderQuantity$ = productContext.product$.pipe(mapToProperty('maxOrderQuantity'));
  }

  get labelClass() {
    return this.quantityLabel.trim() === '' ? 'col-0' : 'label-quantity col-6';
  }

  get inputClass() {
    return this.quantityLabel.trim() === ''
      ? 'col-12' + (this.class ? this.class : '')
      : 'col-6' + (this.class ? this.class : '');
  }
}
