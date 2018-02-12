import { Transaction as FTransaction, SetOptions, FieldPath } from '@firebase/firestore-types';
import { Document, typeDocumentSnapshot } from '../document/document';
import { DocumentSnapshot } from '../document/document-snapshot';
import { ModelTransformer } from '../model/model-transformer';

/**
 * A reference to a transaction.
 * The `Transaction` object passed to a transaction's updateFunction provides
 * the methods to read and write data within the transaction context. See
 * `Firestore.runTransaction()`.
 */
export class Transaction {
    /** Initialize transaction with firestore internal transaction */
    constructor(private fTransaction: FTransaction) {
    }

    /**
     * Reads the document
     * @param document The document to be read.
     * @return A DocumentSnapshot for the read data.
     */
    get<T>(document: Document<T>): Promise<DocumentSnapshot> {
        const transformer = new ModelTransformer<T>(document.ref.path);

        return new Promise<DocumentSnapshot>((resolve, reject) => {
            this.fTransaction.get(document.ref)
                .then(documentSnapshot => resolve(typeDocumentSnapshot<T>(documentSnapshot, transformer)));
        });
    }

    /**
     * Writes to the document referred to.
     * If the document does not exist yet, it will be created. If you pass
     * `SetOptions`, the provided data can be merged into the existing document.
     *
     * @param document A document to be set.
     * @param data An instance of the document type.
     * @param options An object to configure the set behavior.
     * @return This `Transaction` instance. Used for chaining method calls.
     */
    set<T>(document: Document<T>, data: T, options?: SetOptions): Transaction {
        const transformer = new ModelTransformer<T>(document.ref.path);
        this.fTransaction.set(document.ref, transformer.toData(data), options);
        return this;
    }

    /**
     * Updates fields in the document.
     * The update will fail if applied to a document that does not exist.
     *
     * @param documen A document to be updated.
     * @param dataOrField: Either an object containing the fields and values with which to
     * update the document, or the first field to update. Fields can contain dots to reference nested fields
     * within the document.
     * @param value The first value if using fields.
     * @param moreFieldsAndValues Additional key/value pairs when using fields.
     * @return This `Transaction` instance. Used for chaining method calls.
     */
    update<T>(document: Document<T>, dataOrField: Partial<T> | string | FieldPath, value?: any, ...moreFieldsAndValues: any[])
            : Transaction {
        if (typeof dataOrField === 'string' || dataOrField instanceof FieldPath) {
            this.fTransaction.update(document.ref, dataOrField, value, ...moreFieldsAndValues);
        } else {
            const transformer = new ModelTransformer<T>(document.ref.path);
            this.fTransaction.update(document.ref, transformer.toPartialData(dataOrField));
        }

        return this;
    }

    /**
     * Deletes the document.
     *
     * @param document A document to be deleted.
     * @return This `Transaction` instance. Used for chaining method calls.
     */
    delete<T>(document: Document<T>): Transaction {
        this.fTransaction.delete(document.ref);
        return this;
    }
}
