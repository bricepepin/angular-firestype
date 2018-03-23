import { DocumentChange } from '@firebase/firestore-types';
import { DocumentSnapshot } from './document-snapshot';

/** A typed Document Change */
export interface DocumentChange<T> extends DocumentChange {
    /** Document snapshot of the change */
    doc: DocumentSnapshot<T>;
}
