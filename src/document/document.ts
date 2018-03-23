import { DocumentReference, DocumentSnapshot as FDocumentSnapshot, SetOptions } from '@firebase/firestore-types';
import { AngularFirestoreDocument, associateQuery, QueryFn, Action } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

import { ModelTransformer } from '../model/model-transformer';
import { Collection } from '../collection/collection';
import { DocumentSnapshot } from './document-snapshot';

/** Return a typed DocumentSnapshot from a generic one and a transformer */
export function typeDocumentSnapshot<T>(fSnapshot: FDocumentSnapshot, transformer: ModelTransformer<T>): DocumentSnapshot<T> {
    const snapshot = fSnapshot as DocumentSnapshot<T>;
    snapshot.document = () => new Document<T>(snapshot.ref);
    snapshot.model = () => transformer.toModel(snapshot.data());
    return snapshot;
}

/** Typed document */
export class Document<T> extends AngularFirestoreDocument<T> {
    private transformer: ModelTransformer<T>;

    constructor(public ref: DocumentReference) {
        super(ref);
        this.transformer = new ModelTransformer<T>(this.ref.path);
    }

    /** Set object data to database */
    set(data: T, options?: SetOptions): Promise<void> {
        return super.set(this.transformer.toData(data), options);
    }

    /** Update a part of an object */
    update(data: Partial<T>): Promise<void> {
        return super.update(this.transformer.toPartialData(data));
    }

    /** Create a reference to a sub-collection given a path and an optional query function. */
    collection<U>(path: string, queryFn?: QueryFn): Collection<U> {
        const collectionRef = this.ref.collection(path);
        const { ref, query } = associateQuery(collectionRef, queryFn);
        return new Collection<U>(ref, query);
    }

    /** Listen to snapshot updates from the document. */
    snapshotChanges(): Observable<Action<DocumentSnapshot<T>>> {
        return super.snapshotChanges().map(action => {
            typeDocumentSnapshot<T>(action.payload, this.transformer);
            return action as Action<DocumentSnapshot<T>>;
        });
    }

    /**
     * Return current value of the document, without updates afterwards.
     * The unsubscribe process is done automatically.
     */
    current(value?: (model: T) => void, error?: (error: any) => void, complete?: () => void) {
        this.valueChanges().first().subscribe(value, error, complete);
    }

    /**
     * Return current snapshot of the document, without updates afterwards.
     * The unsubscribe process is done automatically.
     */
    currentSnapshot(value?: (snapshot: Action<DocumentSnapshot<T>>) => void, error?: (error: any) => void, complete?: () => void) {
        this.snapshotChanges().first().subscribe(value, error, complete);
    }
}
