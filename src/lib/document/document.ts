import { DocumentReference, DocumentSnapshot as FDocumentSnapshot, SetOptions } from '@firebase/firestore-types';
import { AngularFirestoreDocument, associateQuery, QueryFn, Action } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { ModelTransformer } from '../model/model-transformer';
import { Collection } from '../collection/collection';
import { DocumentSnapshot } from './document-snapshot';
import { Query } from '../collection/query';
import { AngularFirestype } from '../angular-firestype.service';

/** Return a typed DocumentSnapshot from a generic one and a transformer */
export function typeDocumentSnapshot<T>(fSnapshot: FDocumentSnapshot, transformer: ModelTransformer<T>, db: AngularFirestype)
        : DocumentSnapshot<T> {
    const snapshot = fSnapshot as DocumentSnapshot<T>;
    snapshot.document = () => new Document<T>(snapshot.ref, db);
    snapshot.model = () => transformer.toModel(snapshot.data());
    return snapshot;
}

/** Typed document */
export class Document<T> extends AngularFirestoreDocument<T> {
    readonly id: string;
    private transformer: ModelTransformer<T>;

    constructor(ref: DocumentReference, private db: AngularFirestype) {
        super(ref, db);
        this.id = ref.id;
        this.transformer = new ModelTransformer<T>(this.ref.path, this.db);
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
        const ref = this.ref.collection(path);
        const queryBuilder = queryFn as any;
        return new Collection<U>(ref, queryFn ? queryBuilder(new Query(ref)).build() : ref, this.db);
    }

    /** Listen to snapshot updates from the document. */
    snapshotChanges(): Observable<Action<DocumentSnapshot<T>>> {
        return super.snapshotChanges().pipe(
            map(action => {
                typeDocumentSnapshot<T>(action.payload, this.transformer, this.db);
                return action as Action<DocumentSnapshot<T>>;
            })
        );
    }

    /**
     * Return current value of the document, without updates afterwards.
     * The unsubscribe process is done automatically.
     */
    current(value?: (model: T) => void, error?: (error: any) => void, complete?: () => void) {
        this.valueChanges().pipe(first()).subscribe(value, error, complete);
    }

    /**
     * Return current snapshot of the document, without updates afterwards.
     * The unsubscribe process is done automatically.
     */
    currentSnapshot(value?: (snapshot: Action<DocumentSnapshot<T>>) => void, error?: (error: any) => void, complete?: () => void) {
        this.snapshotChanges().pipe(first()).subscribe(value, error, complete);
    }
}