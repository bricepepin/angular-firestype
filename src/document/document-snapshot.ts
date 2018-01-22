import * as firebase from 'firebase/app';

/** A typed Document Snapshot */
export interface DocumentSnapshot extends firebase.firestore.DocumentSnapshot {
    /** Get typed data from this document */
    data(): any;

    /** Retrieves all fields of the document as an Object */
    rawData(): firebase.firestore.DocumentData;
}
