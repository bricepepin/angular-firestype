import { firestore } from 'firebase/app';
import { AngularFirestoreCollection, DocumentChangeAction as ADocumentChangeAction } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ValueTransformer } from '../value/value-transformer';
import { Document } from '../document/document';
import { DocumentChangeAction } from '../document/document-change-action';
import { AngularFirestype } from '../angular-firestype.service';
import { QuerySnapshot } from './query-snapshot';
import { DocumentSnapshot } from '../document/document-snapshot';

export class Collection<T> extends AngularFirestoreCollection<T> {
  private transformer: ValueTransformer<T>;

  constructor(ref: firestore.CollectionReference, query: firestore.Query, private db: AngularFirestype) {
    super(ref, query, db);
    this.transformer = new ValueTransformer<T>(this.ref.path, this.db);
  }

  /** Return a typed query from a generic QuerySnapshot and a transformer */
  static fromSnapshot<T>(firestoreSnapshot: firestore.QuerySnapshot, transformer: ValueTransformer<T>, db: AngularFirestype)
      : QuerySnapshot<T> {
    const snapshot = firestoreSnapshot as QuerySnapshot<T>;
    snapshot.documents = snapshot.docs.map(doc => Document.fromSnapshot(doc, transformer, db));
    snapshot.values = snapshot.documents.map(document => document.value);
    return snapshot;
  }

 /**
   * Listen to the latest change in the stream. This method returns changes
   * as they occur and they are not sorted by query order. This allows you to construct
   * your own data structure.
   * @param events
   */
  stateChanges(events?: firestore.DocumentChangeType[]): Observable<DocumentChangeAction<T>[]> {
    return super.stateChanges(events)
      .pipe(map(actions => this.typeActions(actions)));
  }

  /**
   * Create a stream of synchronized changes. This method keeps the local array in sorted
   * query order.
   * @param events
   */
  snapshotChanges(events?: firestore.DocumentChangeType[]): Observable<DocumentChangeAction<T>[]> {
    return super.snapshotChanges(events)
      .pipe(map(actions => this.typeActions(actions)));
  }

  /** Listen to all documents in the collection and its possible query as an Observable. */
  documentChanges(): Observable<DocumentSnapshot<T>[]> {
    return this.snapshotChanges().pipe(map(actions => actions.map(action => action.payload.doc)));
  }

  /** Listen to all documents values in the collection and its possible query as an Observable. */
  valueChanges(): Observable<T[]> {
    return super.valueChanges().pipe(map(data => data.map(element => this.transformer.toValue(element))));
  }

  /** Add data to a collection reference. */
  add(data: T): Promise<firestore.DocumentReference> {
    return super.add(this.transformer.toData(data));
  }

  /** Add data to a collection reference and return a Document referencing it. */
  addDocument(data: T): Promise<Document<T>> {
    return this.add(data)
      .then(ref => new Document<T>(ref, this.db));
  }

  /** Create a reference to a single document in a collection */
  document(path?: string): Document<T> {
    return new Document<T>(this.ref.doc(path), this.db);
  }

  /**
   * Retrieve the results of the query once.
   * @param options
   */
  get(options?: firestore.GetOptions): Observable<QuerySnapshot<T>> {
    return super.get(options).pipe(map(snapshot => Collection.fromSnapshot(snapshot, this.transformer, this.db)));
  }

  /** Retrieve the references of the query documents once */
  documents(options?: firestore.GetOptions): Observable<DocumentSnapshot<T>[]> {
    return this.get(options).pipe(map(snapshot => snapshot.documents));
  }

  /** Retrieve the value of the query documents once */
  values(options?: firestore.GetOptions): Observable<T[]> {
    return this.get(options).pipe(map(snapshot => snapshot.values));
  }

  /**
   * Cast generic actions to typed ones
   * @param actions : array of actions to cast
   */
  private typeActions(actions: ADocumentChangeAction<T>[]): DocumentChangeAction<T>[] {
    actions.forEach(action => Document.fromSnapshot<T>(action.payload.doc, this.transformer, this.db));
    return actions as DocumentChangeAction<T>[];
  }
}
