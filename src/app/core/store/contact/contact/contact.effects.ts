import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { concatMap, map, mapTo } from 'rxjs/operators';

import { ContactService } from 'ish-core/services/contact/contact.service';
import { mapErrorToAction, mapToPayloadProperty } from 'ish-core/utils/operators';

import {
  ContactActionTypes,
  CreateContact,
  CreateContactFail,
  CreateContactSuccess,
  LoadContact,
  LoadContactFail,
  LoadContactSuccess,
} from './contact.actions';

@Injectable()
export class ContactEffects {
  constructor(private actions$: Actions, private store: Store<{}>, private contactService: ContactService) {}

  /**
   * Load the contact subjects, which the customer can select for his request
   */
  @Effect()
  loadSubjects$ = this.actions$.pipe(
    ofType<LoadContact>(ContactActionTypes.LoadContact),
    concatMap(() =>
      this.contactService.getContactSubjects().pipe(
        map(subjects => new LoadContactSuccess({ subjects })),
        mapErrorToAction(LoadContactFail)
      )
    )
  );

  /**
   * Send the contact request, when a customer want to get in contact with the shop
   */
  @Effect()
  createContact$ = this.actions$.pipe(
    ofType<CreateContact>(ContactActionTypes.CreateContact),
    mapToPayloadProperty('contact'),
    concatMap(contact =>
      this.contactService.createContactRequest(contact).pipe(
        mapTo(new CreateContactSuccess()),
        mapErrorToAction(CreateContactFail)
      )
    )
  );
}
