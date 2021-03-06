import { Injectable, Optional, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { firestore } from 'firebase/app';
import { FirebaseOptionsToken, FirebaseNameOrConfigToken, FirebaseOptions, FirebaseAppConfig } from '@angular/fire';
import { AngularFirestore, FirestoreSettingsToken, EnablePersistenceToken, PersistenceSettingsToken } from '@angular/fire/firestore';

import { Collection } from './collection/collection';
import { Document } from './document/document';
import { ModelToken } from './model-token';
import { ValueType } from './value/value-type';
import { ObjectOf } from './utils/object-of';
import { StringUtils } from './utils/string-utils';
import { CollectionGroup } from './collection/collection-group';

/** Type handling for AngularFirestore */
@Injectable({
  providedIn: 'root'
})
export class AngularFirestype extends AngularFirestore {
  /** Firestore constructor */
  constructor(@Inject(FirebaseOptionsToken) options: FirebaseOptions,
      @Optional() @Inject(FirebaseNameOrConfigToken) nameOrConfig: string | FirebaseAppConfig | undefined,
      @Optional() @Inject(EnablePersistenceToken) shouldEnablePersistence: boolean,
      @Optional() @Inject(FirestoreSettingsToken) settings: firestore.Settings,
      @Inject(PLATFORM_ID) platformId: Object,
      zone: NgZone,
      @Optional() @Inject(PersistenceSettingsToken) persistenceSettings: firestore.PersistenceSettings | undefined,
      @Inject(ModelToken) readonly model: ObjectOf<ValueType<any>> = {}) {
    super(options, nameOrConfig, shouldEnablePersistence, settings, platformId, zone, persistenceSettings);
  }

  /** Create a reference to a Firestore Collection based on a path or CollectionReference */
  collection<T>(pathOrRef: string | firestore.CollectionReference): Collection<T> {
    const ref = StringUtils.isString(pathOrRef) ? this.firestore.collection(pathOrRef) : pathOrRef;
    return new Collection<T>(ref, ref, this);
  }

  /**
   * Create a reference to a Firestore CollectionGroup based on a collectionId.
   * collectionId needs to have a defined type at the root of the provided model.
   */
  collectionGroup<T>(collectionId: string): CollectionGroup<T> {
    return new CollectionGroup<T>(collectionId, this.firestore.collectionGroup(collectionId), this);
  }

  /**
   * Create a reference to a Firestore Document based on a path or
   * DocumentReference. Note that documents are not queryable because they are
   * simply objects. However, documents have sub-collections that return a
   * Collection reference and can be queried.
   */
  doc<T>(pathOrRef: string | firestore.DocumentReference): Document<T> {
    const ref = StringUtils.isString(pathOrRef) ? this.firestore.doc(pathOrRef) : pathOrRef;
    return new Document<T>(ref, this);
  }
}
