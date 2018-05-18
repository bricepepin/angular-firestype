import { Injectable, Optional, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { FirebaseOptions, FirebaseAppConfig } from '@firebase/app-types';
import { DocumentReference, CollectionReference, Settings } from '@firebase/firestore-types';
import { FirebaseOptionsToken, FirebaseNameOrConfigToken } from 'angularfire2';
import { AngularFirestore, QueryFn, FirestoreSettingsToken, EnablePersistenceToken } from 'angularfire2/firestore';

import { Collection } from './collection/collection';
import { Document } from './document/document';
import { ModelToken } from './model/model-token';
import { ModelType } from './model/model-type';
import { ObjectOf } from './object-of';
import { Transaction } from './transaction/transaction';
import { Query } from './collection/query';

/**
 * Type handling for AngularFirestore
 */
@Injectable({
  providedIn: 'root'
})
export class AngularFirestype extends AngularFirestore {
  /** Firestore constructor */
  constructor(@Inject(FirebaseOptionsToken) options: FirebaseOptions,
      @Optional() @Inject(FirebaseNameOrConfigToken) nameOrConfig: string | FirebaseAppConfig | undefined,
      @Optional() @Inject(EnablePersistenceToken) shouldEnablePersistence: boolean,
      @Optional() @Inject(FirestoreSettingsToken) settings: Settings,
      @Inject(PLATFORM_ID) platformId: Object,
      zone: NgZone,
      @Inject(ModelToken) readonly model: ObjectOf<ModelType<any>> = {}) {
    super(options, nameOrConfig, shouldEnablePersistence, settings, PLATFORM_ID, zone);
  }

  /**
   * Create a reference to a Firestore Collection based on a path or
   * CollectionReference and an optional query function to narrow the result set.
   * @param pathOrRef
   * @param queryFn
   */
  collection<T>(pathOrRef: string | CollectionReference, queryFn?: QueryFn): Collection<T> {
    const ref: CollectionReference = typeof pathOrRef === 'string' ? this.firestore.collection(pathOrRef) : pathOrRef;
    const queryBuilder = queryFn as any;
    return new Collection<T>(ref, queryFn ? queryBuilder(new Query(ref)).build() : ref, this);
  }

  /**
   * Create a reference to a Firestore Document based on a path or
   * DocumentReference. Note that documents are not queryable because they are
   * simply objects. However, documents have sub-collections that return a
   * Collection reference and can be queried.
   * @param pathOrRef
   */
  doc<T>(pathOrRef: string | DocumentReference): Document<T> {
    const ref: DocumentReference = typeof pathOrRef === 'string' ? this.firestore.doc(pathOrRef) : pathOrRef;
    return new Document<T>(ref, this);
  }

  /**
   * Executes the given updateFunction and then attempts to commit the
   * changes applied within the transaction. If any document read within the
   * transaction has changed, the updateFunction will be retried. If it fails
   * to commit after 5 attempts, the transaction will fail.
   *
   * @param updateFunction The function to execute within the transaction
   * context.
   * @return If the transaction completed successfully or was explicitly
   * aborted (by the updateFunction returning a failed Promise), the Promise
   * returned by the updateFunction will be returned here. Else if the
   * transaction failed, a rejected Promise with the corresponding failure
   * error will be returned.
   */
  runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>): Promise<T> {
    return this.firestore.runTransaction(fTransaction => {
      return updateFunction(new Transaction(fTransaction, this));
    });
  }
}
