import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { Product } from '../../../models/product/product.model';
import { ClearRecently, getRecentlyViewedProducts } from '../../store/recently';
import { ShoppingState } from '../../store/shopping.state';

@Component({
  selector: 'ish-recently-page-container',
  templateUrl: './recently-page.container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class RecentlyPageContainerComponent implements OnInit {

  products$: Observable<Product[]> = of([]);

  constructor(
    private store: Store<ShoppingState>
  ) { }

  ngOnInit() {
    this.products$ = this.store.pipe(select(getRecentlyViewedProducts));
  }

  clearAll() {
    this.store.dispatch(new ClearRecently);
  }

}
