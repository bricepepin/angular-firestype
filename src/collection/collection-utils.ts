import { Document } from '../document/document';
import { Transaction } from '../transaction/transaction';

/** Set of collection utilities */
export namespace CollectionUtils {
    /**
     * Move a document. Delete the old document and create the new one with the parameter value or the old document value.
     * @param oldDocument the original document.
     * @param newDocument the document to create.
     * @param value the value to set to the new document. If not provided, value is taken from the old document.
     */
    export function moveDocument<T>(oldDocument: Document<T>, newDocument: Document<T>, value?: T)
            : (transaction: Transaction) => Promise<T> {
        return transaction => {
            function moveData(data: T): Promise<T> {
                return new Promise<T>(resolve => {
                    if (oldDocument.ref.path !== newDocument.ref.path) {
                        transaction.delete(oldDocument);
                    }

                    transaction.set(newDocument, data);
                    resolve(data);
                });
            }

            return value ? moveData(value) : transaction.get(oldDocument).then(snapshot => moveData(snapshot.model()));
        };
    }
}
