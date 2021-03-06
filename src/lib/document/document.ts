import { firestore } from 'firebase/app';
import { AngularFirestoreDocument, Action } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ValueTransformer } from '../value/value-transformer';
import { Collection } from '../collection/collection';
import { DocumentSnapshot } from './document-snapshot';
import { AngularFirestype } from '../angular-firestype.service';

/** Typed document */
export class Document<T> extends AngularFirestoreDocument<T> {
  readonly id: string;
  readonly path: string;

  constructor(ref: firestore.DocumentReference, private db: AngularFirestype, private transformer: ValueTransformer<T> = null) {
    super(ref, db);
    this.id = ref.id;
    this.path = ref.path;
    this.transformer = transformer || new ValueTransformer<T>(ref.path, db);
  }

  /** Return a typed Document from a generic DocumentSnapshot and a transformer */
  static fromSnapshot<T>(firebaseSnapshot: firestore.DocumentSnapshot, db: AngularFirestype, transformer?: ValueTransformer<T>)
      : DocumentSnapshot<T> {
    const snapshot = firebaseSnapshot as DocumentSnapshot<T>;
    snapshot.document = new Document<T>(snapshot.ref, db, transformer);
    snapshot.value = snapshot.document.transformer.toValue(snapshot.data());
    return snapshot;
  }

  /** Set value to database */
  set(value: T, options?: firestore.SetOptions): Promise<void> {
    return super.set(this.transformer.toData(value), options);
  }

  /** Update a part of an object */
  update(value: Partial<T>): Promise<void> {
    return super.update(this.transformer.toPartialData(value));
  }

  /** Create a reference to a sub-collection given a path and an optional query function. */
  collection<U>(path: string): Collection<U> {
    const ref = this.ref.collection(path);
    return new Collection<U>(ref, ref, this.db);
  }

  /** Return the parent collection */
  parent(): Collection<T> {
    return new Collection<T>(this.ref.parent, null, this.db, this.transformer);
  }

  /** Listen to snapshot updates from the document. */
  snapshotChanges(): Observable<Action<DocumentSnapshot<T>>> {
    return super.snapshotChanges().pipe(
      map(action => {
        Document.fromSnapshot<T>(action.payload, this.db, this.transformer);
        return action as Action<DocumentSnapshot<T>>;
      })
    );
  }

  /** Listen to document updates. */
  documentChanges(): Observable<DocumentSnapshot<T>> {
    return this.snapshotChanges().pipe(map(action => action.payload));
  }

  /** Listen to unwrapped snapshot updates from the document. */
  valueChanges(): Observable<T> {
    return super.valueChanges().pipe(map(data => this.transformer.toValue(data)));
  }

  /** Retrieve the document once */
  get(options?: firestore.GetOptions): Observable<DocumentSnapshot<T>> {
    return super.get(options).pipe(map(document => Document.fromSnapshot<T>(document, this.db, this.transformer)));
  }

  /** Retrieve the value of the document once */
  value(options?: firestore.GetOptions): Observable<T> {
    return super.get(options).pipe(map(document => this.transformer.toValue(document.data())));
  }
}
