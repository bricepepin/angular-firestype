import { DocumentReference, SetOptions } from '@firebase/firestore-types';
import { AngularFirestoreDocument, associateQuery, QueryFn, Action } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

import { ModelTransformer } from '../model/model-transformer';
import { Collection } from '../collection/collection';
import { DocumentSnapshot } from './document-snapshot';

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
    snapshotChanges(): Observable<Action<DocumentSnapshot>> {
        return super.snapshotChanges().map(action => {
            const typedAction = action as Action<DocumentSnapshot>;
            typedAction.payload.rawData = typedAction.payload.data;
            typedAction.payload.data = () => this.transformer.toModel(typedAction.payload.rawData());
            return typedAction;
        });
    }

    /**
     * Return current value of the document, without updates afterwards.
     * The unsubscribe process is done automatically.
     */
    current(callback: (model: T) => void) {
        this.valueChanges().first().subscribe(callback);
    }

    /**
     * Return current snapshot of the document, without updates afterwards.
     * The unsubscribe process is done automatically.
     */
    currentSnapshot(callback: (snapshot: Action<DocumentSnapshot>) => void) {
        this.snapshotChanges().first().subscribe(callback);
    }
}
