import { Injectable, Optional, Inject } from '@angular/core';
import { DocumentReference } from '@firebase/firestore-types';
import { FirebaseApp } from 'angularfire2';
import { associateQuery, AngularFirestore, QueryFn } from 'angularfire2/firestore';

import { EnablePersistenceToken } from './enable-persistence-token';
import { Collection } from './collection/collection';
import { Document } from './document/document';
import { Model } from './model/model';
import { ModelToken } from './model/model-token';
import { ModelType } from './model/model-type';
import { ObjectOf } from './object-of';
import { Transaction } from './transaction/transaction';

/**
 * Type handling for AngularFirestore
 */
@Injectable()
export class AngularFirestype extends AngularFirestore {
  /** Firestore constructor */
  constructor(public app: FirebaseApp, @Inject(EnablePersistenceToken) shouldEnablePersistence: boolean,
      @Inject(ModelToken) model: ObjectOf<ModelType<any>>) {
    super(app, shouldEnablePersistence);
    Model.descriptors = model;
  }

  /**
   * Create a reference to a Collection based on a path and an optional query function to narrow the result set.
   * This collection handle the type transformation accept custom objects and return them initialiazed.
   */
  collection<T>(path: string, queryFn?: QueryFn): Collection<T> {
    const collectionRef = this.firestore.collection(path);
    const { ref, query } = associateQuery(collectionRef, queryFn);
    return new Collection<T>(ref, query);
  }

  /**
   * Create a reference to a Firestore Document based on a path. Note that documents
   * are not queryable because they are simply objects. However, documents have
   * sub-collections that return a Collection reference and can be queried.
   * This collection handle the type transformation accept custom objects and return them initialiazed.
   */
  doc<T>(path: string): Document<T> {
    const ref: DocumentReference = this.firestore.doc(path);
    return new Document<T>(ref);
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
      return updateFunction(new Transaction(fTransaction));
    });
  }
}
