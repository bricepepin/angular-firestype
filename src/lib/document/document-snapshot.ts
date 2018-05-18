import { DocumentSnapshotExists } from 'angularfire2/firestore';
import { Document } from './document';

export interface DocumentSnapshot<T> extends DocumentSnapshotExists<T> {
    /** Get the Document reference corresponding to this snapshot */
    document(): Document<T>;

    /** Get the custom object from the data of this document */
    model(): T;
}
