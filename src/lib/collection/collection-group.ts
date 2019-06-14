import { firestore } from 'firebase/app';
import { AngularFirestoreCollectionGroup, DocumentChangeAction as ADocumentChangeAction } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ValueTransformer } from '../value/value-transformer';
import { Document } from '../document/document';
import { DocumentChangeAction } from '../document/document-change-action';
import { AngularFirestype } from '../angular-firestype.service';
import { QuerySnapshot } from './query-snapshot';
import { DocumentSnapshot } from '../document/document-snapshot';
import { ArrayUtils } from '../utils/array-utils';
import { CollectionUtils } from './collection-utils';

export class CollectionGroup<T> extends AngularFirestoreCollectionGroup<T> {
  private fQuery: firestore.Query;

  constructor(private id: string, query: firestore.Query, private db: AngularFirestype, private transformer: ValueTransformer<T> = null) {
    super(query, db);
    this.fQuery = query;
    this.transformer = transformer || new ValueTransformer<T>(id, db);
  }

 /**
   * Listen to the latest change in the stream. This method returns changes
   * as they occur and they are not sorted by query order. This allows you to construct
   * your own data structure.
   * @param events
   */
  stateChanges(events?: firestore.DocumentChangeType[]): Observable<DocumentChangeAction<T>[]> {
    return super.stateChanges(events).pipe(map(actions => CollectionUtils.typeActions(actions, this.db, this.transformer)));
  }

  /**
   * Create a stream of synchronized changes. This method keeps the local array in sorted
   * query order.
   * @param events
   */
  snapshotChanges(events?: firestore.DocumentChangeType[]): Observable<DocumentChangeAction<T>[]> {
    return super.snapshotChanges(events).pipe(map(actions => CollectionUtils.typeActions(actions, this.db, this.transformer)));
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
  valueChanges(): Observable<T[]> {
    return super.valueChanges().pipe(map(data => data.map(element => this.transformer.toValue(element))));
  }

  /** Listen to first document value of the query as an Observable. */
  firstValueChanges(): Observable<T> {
    return super.valueChanges().pipe(map(ArrayUtils.first), map(data => data ? this.transformer.toValue(data) : null));
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
   * Creates and returns a new Collection with the additional filter that documents
   * must contain the specified field and the value should satisfy the
   * relation constraint provided.
   *
   * @param fieldPath The path to compare
   * @param opStr The operation string (e.g "<", "<=", "==", ">", ">=").
   * @param value The value for comparison
   * @return The created CollectionGroup
   */
  where(fieldPath: string | firestore.FieldPath, opStr: firestore.WhereFilterOp, value: any): CollectionGroup<T> {
    const query = this.fQuery.where(fieldPath, opStr, value instanceof Document ? value.ref : value);
    return new CollectionGroup<T>(this.id, query, this.db, this.transformer);
  }

  /**
   * Creates and returns a new Collection that's additionally sorted by the
   * specified field, optionally in descending order instead of ascending.
   *
   * @param fieldPath The field to sort by.
   * @param directionStr Optional direction to sort by ('asc' or 'desc'). If
   * not specified, order will be ascending.
   * @return The created CollectionGroup
   */
  orderBy(fieldPath: string | firestore.FieldPath, directionStr?: firestore.OrderByDirection): CollectionGroup<T> {
      const query = this.fQuery.orderBy(fieldPath, directionStr);
      return new CollectionGroup<T>(this.id, query, this.db, this.transformer);
  }

  /**
   * Creates and returns a new Collection that's additionally limited to only
   * return up to the specified number of documents.
   *
   * @param limit The maximum number of items to return.
   * @return The created CollectionGroup
   */
  limit(limit: number): CollectionGroup<T> {
      const query = this.fQuery.limit(limit);
      return new CollectionGroup<T>(this.id, query, this.db, this.transformer);
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
   * @return The created CollectionGroup
   */
  startAt(snapshotOrFieldValue: DocumentSnapshot<any> | any, ...fieldValues: any[]): CollectionGroup<T> {
      const query = this.fQuery.startAt(snapshotOrFieldValue, fieldValues);
      return new CollectionGroup<T>(this.id, query, this.db, this.transformer);
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
   * @return The created CollectionGroup
   */
  startAfter(snapshotOrFieldValue: DocumentSnapshot<any> | any, ...fieldValues: any[]): CollectionGroup<T> {
      const query = this.fQuery.startAfter(snapshotOrFieldValue, fieldValues);
      return new CollectionGroup<T>(this.id, query, this.db, this.transformer);
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
   * @return The created CollectionGroup
   */
  endBefore(snapshotOrFieldValue: DocumentSnapshot<any> | any, ...fieldValues: any[]): CollectionGroup<T> {
      const query = this.fQuery.endBefore(snapshotOrFieldValue, fieldValues);
      return new CollectionGroup<T>(this.id, query, this.db, this.transformer);
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
   * @return The created CollectionGroup
   */
  endAt(snapshotOrFieldValue: DocumentSnapshot<any> | any, ...fieldValues: any[]): CollectionGroup<T> {
      const query = this.fQuery.endAt(snapshotOrFieldValue, fieldValues);
      return new CollectionGroup<T>(this.id, query, this.db, this.transformer);
  }
}
