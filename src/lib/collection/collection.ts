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
import { ArrayUtils } from '../utils/array-utils';

export class Collection<T> extends AngularFirestoreCollection<T> {
  readonly id: string;
  readonly path: string;
  private fQuery: firestore.Query;

  constructor(ref: firestore.CollectionReference, query: firestore.Query, private db: AngularFirestype,
      private transformer: ValueTransformer<T> = null) {
    super(ref, query, db);
    this.fQuery = query;
    this.id = ref.id;
    this.path = ref.path;
    this.transformer = transformer || new ValueTransformer<T>(ref.path, db);
  }

 /**
   * Listen to the latest change in the stream. This method returns changes
   * as they occur and they are not sorted by query order. This allows you to construct
   * your own data structure.
   * @param events
   */
  stateChanges(events?: firestore.DocumentChangeType[]): Observable<DocumentChangeAction<T>[]> {
    return super.stateChanges(events).pipe(map(actions => this.typeActions(actions)));
  }

  /**
   * Create a stream of synchronized changes. This method keeps the local array in sorted
   * query order.
   * @param events
   */
  snapshotChanges(events?: firestore.DocumentChangeType[]): Observable<DocumentChangeAction<T>[]> {
    return super.snapshotChanges(events).pipe(map(actions => this.typeActions(actions)));
  }

  /** Listen to all documents of the query as an Observable. */
  documentChanges(events?: firestore.DocumentChangeType[]): Observable<DocumentSnapshot<T>[]> {
    return super.snapshotChanges(events).pipe(
      map(actions => actions.map(action => Document.fromSnapshot<T>(action.payload.doc, this.db, this.transformer)))
    );
  }

  /** Listen to first document of the query as an Observable. */
  firstDocumentChanges(events?: firestore.DocumentChangeType[]): Observable<DocumentSnapshot<T>> {
    return super.snapshotChanges(events).pipe(
      map(ArrayUtils.first),
      map(action => action ? Document.fromSnapshot<T>(action.payload.doc, this.db, this.transformer) : null)
    );
  }

  /** Listen to all documents values of the query as an Observable. */
  valueChanges({}?): Observable<T[]>;
  valueChanges<K extends string>(options: {idField: K}): Observable<(T & { [U in K]: string })[]>;
  valueChanges<K extends string>(options: {idField?: K} = {}): Observable<T[]> {
    return super.valueChanges(options).pipe(map(data => data.map(element => this.transformer.toValue(element))));
  }

  /** Listen to first document value of the query as an Observable. */
  firstValueChanges(): Observable<T> {
    return super.valueChanges().pipe(map(ArrayUtils.first), map(data => data ? this.transformer.toValue(data) : null));
  }

  /** Add value to a collection reference. */
  add(value: T): Promise<firestore.DocumentReference> {
    return super.add(this.transformer.toData(value));
  }

  /** Add value to a collection reference and return a Document referencing it. */
  addDocument(value: T): Promise<Document<T>> {
    return this.add(value).then(ref => new Document<T>(ref, this.db, this.transformer));
  }

  /** Create a reference to a single document in a collection */
  document(path?: string): Document<T> {
    return new Document<T>(this.ref.doc(path), this.db, this.transformer);
  }

  /** Return the parent document */
  parent<U>(): Document<U> {
    return this.ref.parent ? new Document<U>(this.ref.parent, this.db) : null;
  }

  /**
   * Retrieve the results of the query once.
   * @param options
   */
  get(options?: firestore.GetOptions): Observable<QuerySnapshot<T>> {
    return super.get(options).pipe(map(fSnapshot => {
      const snapshot = fSnapshot as QuerySnapshot<T>;
      snapshot.documents = snapshot.docs.map(doc => Document.fromSnapshot(doc, this.db, this.transformer));
      snapshot.values = snapshot.documents.map(document => document.value);
      return snapshot;
    }));
  }

  /** Retrieve the documents of the query once */
  getDocuments(options?: firestore.GetOptions): Observable<DocumentSnapshot<T>[]> {
    return super.get(options).pipe(
      map(fSnapshot => fSnapshot.docs.map(doc => Document.fromSnapshot(doc, this.db, this.transformer)))
    );
  }

  /** Retrieve the first document of the query once */
  getFirstDocument(options?: firestore.GetOptions): Observable<DocumentSnapshot<T>> {
    return super.get(options).pipe(
      map(fSnapshot => ArrayUtils.first(fSnapshot.docs)),
      map(doc => doc ? Document.fromSnapshot(doc, this.db, this.transformer) : null)
    );
  }

  /** Retrieve the value of the query documents once */
  values(options?: firestore.GetOptions): Observable<T[]> {
    return super.get(options).pipe(map(fSnapshot => fSnapshot.docs.map(doc => this.transformer.toValue(doc.data()))));
  }

  /** Retrieve the first document of the query once */
  firstValue(options?: firestore.GetOptions): Observable<T> {
    return super.get(options).pipe(
      map(fSnapshot => ArrayUtils.first(fSnapshot.docs)),
      map(doc => doc ? this.transformer.toValue(doc.data()) : null)
    );
  }

  /**
   * Cast generic actions to typed ones
   * @param actions : array of actions to cast
   */
  private typeActions(actions: ADocumentChangeAction<T>[]): DocumentChangeAction<T>[] {
    actions.forEach(action => Document.fromSnapshot<T>(action.payload.doc, this.db, this.transformer));
    return actions as DocumentChangeAction<T>[];
  }

  /**
   * Creates and returns a new Collection with the additional filter that documents
   * must contain the specified field and the value should satisfy the
   * relation constraint provided.
   *
   * @param fieldPath The path to compare
   * @param opStr The operation string (e.g "<", "<=", "==", ">", ">=").
   * @param value The value for comparison
   * @return The created Collection
   */
  where(fieldPath: string | firestore.FieldPath, opStr: firestore.WhereFilterOp, value: any): Collection<T> {
    const query = this.fQuery.where(fieldPath, opStr, value instanceof Document ? value.ref : value);
    return new Collection<T>(this.ref, query, this.db, this.transformer);
  }

  /**
   * Creates and returns a new Collection that's additionally sorted by the
   * specified field, optionally in descending order instead of ascending.
   *
   * @param fieldPath The field to sort by.
   * @param directionStr Optional direction to sort by ('asc' or 'desc'). If
   * not specified, order will be ascending.
   * @return The created Collection
   */
  orderBy(fieldPath: string | firestore.FieldPath, directionStr?: firestore.OrderByDirection): Collection<T> {
      const query = this.fQuery.orderBy(fieldPath, directionStr);
      return new Collection<T>(this.ref, query, this.db, this.transformer);
  }

  /**
   * Creates and returns a new Collection that's additionally limited to only
   * return up to the specified number of documents.
   *
   * @param limit The maximum number of items to return.
   * @return The created Collection
   */
  limit(limit: number): Collection<T> {
      const query = this.fQuery.limit(limit);
      return new Collection<T>(this.ref, query, this.db, this.transformer);
  }

  /**
   * Creates and returns a new Collection that starts at the provided document
   * (inclusive). The starting position is relative to the order of the query.
   * The document must contain all of the fields provided in the orderBy of
   * this query. The order of the field values
   * must match the order of the order by clauses of the query.
   *
   * @param snapshotOrFieldValue the snapshot or the first field value of the document to start at.
   * @param fieldValues The other field values to start this query at, in order
   * of the query's order by.
   * @return The created Collection
   */
  startAt(snapshotOrFieldValue: DocumentSnapshot<any> | any, ...fieldValues: any[]): Collection<T> {
      const query = this.fQuery.startAt(snapshotOrFieldValue, fieldValues);
      return new Collection<T>(this.ref, query, this.db, this.transformer);
  }

  /**
   * Creates and returns a new Collection that starts after the provided document
   * (exclusive). The starting position is relative to the order of the query.
   * The document must contain all of the fields provided in the orderBy of
   * this query. The order of the field values
   * must match the order of the order by clauses of the query.
   *
   * @param snapshotOrFieldValue the snapshot or the first field value of the document to start after.
   * @param fieldValues The other field values to start this query after, in order
   * of the query's order by.
   * @return The created Collection
   */
  startAfter(snapshotOrFieldValue: DocumentSnapshot<any> | any, ...fieldValues: any[]): Collection<T> {
      const query = this.fQuery.startAfter(snapshotOrFieldValue, fieldValues);
      return new Collection<T>(this.ref, query, this.db, this.transformer);
  }

  /**
   * Creates and returns a new Collection that ends before the provided document
   * (exclusive). The end position is relative to the order of the query. The
   * document must contain all of the fields provided in the orderBy of this
   * query. The order of the field values
   * must match the order of the order by clauses of the query.
   *
   * @param snapshotOrFieldValue the snapshot or the first field value of the document to end before.
   * @param fieldValues The other field values to end this query before, in order
   * of the query's order by.
   * @return The created Collection
   */
  endBefore(snapshotOrFieldValue: DocumentSnapshot<any> | any, ...fieldValues: any[]): Collection<T> {
      const query = this.fQuery.endBefore(snapshotOrFieldValue, fieldValues);
      return new Collection<T>(this.ref, query, this.db, this.transformer);
  }

  /**
   * Creates and returns a new Collection that ends at the provided document
   * (inclusive). The end position is relative to the order of the query. The
   * document must contain all of the fields provided in the orderBy of this
   * query. The order of the field values
   * must match the order of the order by clauses of the query.
   *
   * @param snapshotOrFieldValue the snapshot or the first field value of the document to end at.
   * @param fieldValues The other field values to end this query at, in order
   * of the query's order by.
   * @return The created Collection
   */
  endAt(snapshotOrFieldValue: DocumentSnapshot<any> | any, ...fieldValues: any[]): Collection<T> {
      const query = this.fQuery.endAt(snapshotOrFieldValue, fieldValues);
      return new Collection<T>(this.ref, query, this.db, this.transformer);
  }
}
