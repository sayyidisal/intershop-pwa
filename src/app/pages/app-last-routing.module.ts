import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { matchCategoryRoute } from 'ish-core/routing/category/category.route';
import { matchProductRoute } from 'ish-core/routing/product/product.route';

import { topLevelRouteWrap } from './top-level-language.route';

const routes: Routes = [
  {
    matcher: matchProductRoute,
    loadChildren: () => import('./product/product-page.module').then(m => m.ProductPageModule),
  },
  {
    matcher: matchCategoryRoute,
    loadChildren: () => import('./category/category-page.module').then(m => m.CategoryPageModule),
  },
  { path: '**', redirectTo: '/error' },
];

@NgModule({
  imports: [RouterModule.forChild(topLevelRouteWrap(routes))],
})
export class AppLastRoutingModule {}
