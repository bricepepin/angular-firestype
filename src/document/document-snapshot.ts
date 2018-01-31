import { DocumentData, DocumentSnapshot } from '@firebase/firestore-types';

/** A typed Document Snapshot */
export interface DocumentSnapshot extends DocumentSnapshot {
    /** Get typed data from this document */
    data(): any;

    /** Retrieves all fields of the document as an Object */
    rawData(): DocumentData;
}
