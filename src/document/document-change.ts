import * as firebase from 'firebase/app';
import { DocumentSnapshot } from './document-snapshot';

/** A typed Document Change */
export interface DocumentChange extends firebase.firestore.DocumentChange {
    /** Document snapshot of the change */
    doc: DocumentSnapshot;
}
