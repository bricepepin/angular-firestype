import { DocumentSnapshot } from '@angular/fire/firestore';
import { Document } from './document';

export type DocumentSnapshot<T> = DocumentSnapshot<T> & {
    /** Get the Document reference corresponding to this snapshot */
    document(): Document<T>;

    /** Get the custom object from the data of this document */
    model(): T;
};
