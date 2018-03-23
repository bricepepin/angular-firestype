import { DocumentChangeAction } from 'angularfire2/firestore';
import { DocumentChange } from './document-change';

/** A typed Document Snapshot */
export interface DocumentChangeAction<T> extends DocumentChangeAction {
    /** Document change of the action */
    payload: DocumentChange<T>;
}
