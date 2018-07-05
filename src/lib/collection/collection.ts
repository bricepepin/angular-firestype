import { CollectionReference, Query, DocumentChangeType, DocumentReference } from '@firebase/firestore-types';
import { AngularFirestoreCollection, DocumentChangeAction as ADocumentChangeAction } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ModelTransformer } from '../model/model-transformer';
import { Document } from '../document/document';
import { DocumentChangeAction } from '../document/document-change-action';
import { AngularFirestype } from '../angular-firestype.service';

export class Collection<T> extends AngularFirestoreCollection<T> {
  private transformer: ModelTransformer<T>;

  constructor(ref: CollectionReference, query: Query, private db: AngularFirestype) {
    super(ref, query, db);
    this.transformer = new ModelTransformer<T>(this.ref.path, this.db);
  }

 /**
   * Listen to the latest change in the stream. This method returns changes
   * as they occur and they are not sorted by query order. This allows you to construct
   * your own data structure.
   * @param events
   */
  stateChanges(events?: DocumentChangeType[]): Observable<DocumentChangeAction<T>[]> {
    return super.stateChanges(events)
      .pipe(map(actions => this.typeActions(actions)));
  }

  /**
   * Create a stream of synchronized changes. This method keeps the local array in sorted
   * query order.
   * @param events
   */
  snapshotChanges(events?: DocumentChangeType[]): Observable<DocumentChangeAction<T>[]> {
    return super.snapshotChanges(events)
      .pipe(map(actions => this.typeActions(actions)));
  }

  /** Listen to all documents in the collection and its possible query as an Observable. */
  valueChanges(): Observable<T[]> {
    return super.valueChanges()
      .pipe(
        map(data => {
          const models: T[] = [];

          for (const element of data) {
            models.push(this.transformer.toModel(element));
          }

          return models;
        })
      );
  }

  /** Add data to a collection reference. */
  add(data: T): Promise<DocumentReference> {
    return super.add(this.transformer.toData(data));
  }

  /** Add data to a collection reference and return a Document referencing it. */
  addDocument(data: T): Promise<Document<T>> {
    return this.add(data)
      .then(ref => Promise.resolve(new Document<T>(ref, this.db)));
  }

  /** Create a reference to a single document in a collection. */
  doc<U>(path?: string): Document<U> {
    return new Document<U>(this.ref.doc(path), this.db);
  }

  /** Create a reference to a single document in a collection with the same type as the collection. */
  document(path?: string): Document<T> {
    return this.doc<T>(path);
  }

  /**
   * Cast generic actions to typed ones
   * @param actions : array of actions to cast
   */
  private typeActions(actions: ADocumentChangeAction<T>[]): DocumentChangeAction<T>[] {
    for (const element of actions) {
      Document.fromSnapshot<T>(element.payload.doc, this.transformer, this.db);
    }

    return actions as DocumentChangeAction<T>[];
  }
}
