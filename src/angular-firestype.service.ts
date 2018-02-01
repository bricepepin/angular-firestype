import { Injectable, Optional, Inject } from '@angular/core';
import { DocumentReference } from '@firebase/firestore-types';
import { FirebaseApp } from 'angularfire2';
import { associateQuery, AngularFirestore, QueryFn } from 'angularfire2/firestore';

import { EnablePersistenceToken } from './enable-persistence-token';
import { Collection } from './collection/collection';
import { Document } from './document/document';

/**
 * Type handling for AngularFirestore
 */
@Injectable()
export class AngularFirestype extends AngularFirestore {
  /** Firestore constructor */
  constructor(public app: FirebaseApp, @Optional() @Inject(EnablePersistenceToken) shouldEnablePersistence: boolean) {
    super(app, shouldEnablePersistence);
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
}
