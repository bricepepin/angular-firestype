import { DocumentSnapshot } from '@angular/fire/firestore';
import { Document } from './document';

export type DocumentSnapshot<T> = DocumentSnapshot<T> & {
    /** Custom object from the data of this document */
    value: T;

    /** Document reference corresponding to this snapshot */
    document: Document<T>;
};
