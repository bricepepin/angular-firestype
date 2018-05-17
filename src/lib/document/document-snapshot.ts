import { DocumentData, DocumentSnapshot } from '@firebase/firestore-types';
import { Document } from './document';

/** A typed Document Snapshot */
export interface DocumentSnapshot<T> extends DocumentSnapshot {
    /** Get the Document reference corresponding to this snapshot */
    document(): Document<T>;

    /** Get the custom object from the data of this document */
    model(): T;
}
