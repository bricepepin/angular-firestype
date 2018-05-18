import { DocumentChange } from 'angularfire2/firestore';
import { DocumentSnapshot } from './document-snapshot';

/** A typed Document Change */
export interface DocumentChange<T> extends DocumentChange<T> {
    /** Document snapshot of the change */
    doc: DocumentSnapshot<T>;
}
