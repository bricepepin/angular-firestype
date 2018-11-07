import { firestore } from 'firebase/app';
import { DocumentSnapshot } from '../document/document-snapshot';

/** A typed QuerySnapshot */
export interface QuerySnapshot<T> extends firestore.QuerySnapshot {
    /** Get the Documents corresponding to this query snapshot */
    documents(): DocumentSnapshot<T>[];

    /** Get the custom objects from the data of this query */
    models(): T[];
}
