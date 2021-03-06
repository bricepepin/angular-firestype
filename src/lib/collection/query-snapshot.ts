import { firestore } from 'firebase/app';
import { DocumentSnapshot } from '../document/document-snapshot';

/** A typed QuerySnapshot */
export interface QuerySnapshot<T> extends firestore.QuerySnapshot {
    /** Documents corresponding to this query snapshot */
    documents: DocumentSnapshot<T>[];

    /** Custom objects from the data of this query */
    values: T[];
}
