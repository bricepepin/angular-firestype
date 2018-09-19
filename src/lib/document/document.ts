import { firestore } from 'firebase/app';
import { AngularFirestoreDocument, QueryFn, Action } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ModelTransformer } from '../model/model-transformer';
import { Collection } from '../collection/collection';
import { DocumentSnapshot } from './document-snapshot';
import { Query } from '../collection/query';
import { AngularFirestype } from '../angular-firestype.service';

/** Typed document */
export class Document<T> extends AngularFirestoreDocument<T> {
  readonly id: string;
  private transformer: ModelTransformer<T>;

  constructor(ref: firestore.DocumentReference, private db: AngularFirestype) {
    super(ref, db);
    this.id = ref.id;
    this.transformer = new ModelTransformer<T>(this.ref.path, this.db);
  }

  /** Return a typed Document from a generic DocumentSnapshot and a transformer */
  static fromSnapshot<T>(firestoreSnapshot: firestore.DocumentSnapshot, transformer: ModelTransformer<T>, db: AngularFirestype)
      : DocumentSnapshot<T> {
    const snapshot = firestoreSnapshot as DocumentSnapshot<T>;
    snapshot.document = () => new Document<T>(snapshot.ref, db);
    snapshot.model = () => transformer.toModel(snapshot.data());
    return snapshot;
  }

  /** Set object data to database */
  set(data: T, options?: firestore.SetOptions): Promise<void> {
    return super.set(this.transformer.toData(data), options);
  }

  /** Update a part of an object */
  update(data: Partial<T>): Promise<void> {
    return super.update(this.transformer.toPartialData(data));
  }

  /** Create a reference to a sub-collection given a path and an optional query function. */
  collection<U>(path: string, queryFn?: QueryFn): Collection<U> {
    const ref = this.ref.collection(path);
    const queryBuilder = queryFn as any;
    return new Collection<U>(ref, queryFn ? queryBuilder(new Query(ref)).build() : ref, this.db);
  }

  /** Listen to snapshot updates from the document. */
  snapshotChanges(): Observable<Action<DocumentSnapshot<T>>> {
    return super.snapshotChanges()
      .pipe(
        map(action => {
          Document.fromSnapshot<T>(action.payload, this.transformer, this.db);
          return action as Action<DocumentSnapshot<T>>;
        })
      );
  }
}
