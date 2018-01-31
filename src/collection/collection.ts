import { CollectionReference, Query, DocumentChangeType, DocumentReference } from '@firebase/firestore-types';
import { AngularFirestoreCollection, DocumentChangeAction as afDocumentChangeAction } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

import { ModelTransformer } from '../model/model-transformer';
import { Document } from '../document/document';
import { DocumentChangeAction } from '../document/document-change-action';

export class Collection<T> extends AngularFirestoreCollection<T> {
  private transformer: ModelTransformer<T>;

  constructor(public readonly ref: CollectionReference, private readonly collectionQuery: Query) {
    super(ref, collectionQuery);
    this.transformer = new ModelTransformer<T>(this.ref.path);
  }

 /**
   * Listen to the latest change in the stream. This method returns changes
   * as they occur and they are not sorted by query order. This allows you to construct
   * your own data structure.
   * @param events
   */
  stateChanges(events?: DocumentChangeType[]): Observable<DocumentChangeAction[]> {
    return super.stateChanges(events).map(actions => this.toTypedActions(actions));
  }

  /**
   * Create a stream of synchronized changes. This method keeps the local array in sorted
   * query order.
   * @param events
   */
  snapshotChanges(events?: DocumentChangeType[]): Observable<DocumentChangeAction[]> {
    return super.snapshotChanges(events).map(actions => this.toTypedActions(actions));
  }

  /** Listen to all documents in the collection and its possible query as an Observable. */
  valueChanges(events?: DocumentChangeType[]): Observable<T[]> {
    return super.valueChanges(events).map(data => {
      const models: T[] = [];

      for (const element of data) {
        models.push(this.transformer.toModel(element));
      }

      return models;
    });
  }

  /** Add data to a collection reference. */
  add(data: T): Promise<DocumentReference> {
    return super.add(this.transformer.toData(data));
  }

  /** Create a reference to a single document in a collection. */
  doc<U>(path: string): Document<U> {
    return new Document<U>(this.ref.doc(path));
  }

  /**
   * Return current value of the document, without updates afterwards.
   * The unsubscribe process is done automatically.
   */
  current(callback: (model: T[]) => void) {
    this.valueChanges().first().subscribe(callback);
  }

  /**
   * Return current snapshot of the document, without updates afterwards.
   * The unsubscribe process is done automatically.
   */
  currentSnapshot(callback: (snapshot: DocumentChangeAction[]) => void) {
      this.snapshotChanges().first().subscribe(callback);
  }

  /**
   * Cast generic actions to typed ones
   * @param actions : array of action to cast
   */
  private toTypedActions(actions: afDocumentChangeAction[]): DocumentChangeAction[] {
    const typedActions = actions as DocumentChangeAction[];

      for (const element of typedActions) {
        const document = element.payload.doc;
        document.rawData = document.data;
        document.data = () => this.transformer.toModel(document.rawData());
      }

      return typedActions;
  }
}
