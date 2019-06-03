import { firestore } from 'firebase/app';

import { Document } from '../document/document';
import { ValueDescriptor } from './value-descriptor';
import { ValueType } from './value-type';
import { ValueUtils } from './value-utils';
import { ValueOptions } from './value-options';
import { AngularFirestype } from '../angular-firestype.service';
import { StringUtils } from '../utils/string-utils';

/** Transforms a value to data and data to value for a database path */
export class ValueTransformer<T> {
    private valueType: ValueType<T>;

    constructor(path: string, private db: AngularFirestype, private options: ValueOptions<T> = {}) {
        this.valueType = ValueUtils.getValueType<T>(path, db.model);
    }

    /** Initialize a custom object from data and value descriptor */
    toValue(data: firestore.DocumentData): T {
        return this.instanciate<T>(data, this.valueType);
    }

    /** Get data from a custom object and value descriptor */
    toData(value: T): T {
        return this.objectify(value, this.valueType);
    }

    /** Get data from a partial custom object and value descriptor */
    toPartialData(value: Partial<T>): Partial<T> {
        return this.objectify(value, this.valueType, true);
    }

    /** Return an instanciation of the data with provided valueType */
    private instanciate<U>(data: any, valueType: ValueType<U>): U {
        let value: U = null;

        if (data) {
            const descriptor: ValueDescriptor<U> = ValueUtils.getDescriptor<U>(valueType);

            if (descriptor && descriptor.structure) {
                for (const name of Object.keys(descriptor.structure)) {
                    data[name] = this.instanciateField(data[name], descriptor.structure[name]);
                }
            } else if ((descriptor && descriptor.elements) || data instanceof Array) { // handle collections
                for (const name of Object.keys(data)) {
                    data[name] = this.instanciateField(data[name], descriptor ? descriptor.elements : valueType);
                }
            }

            // Instanciate value and affect data
            if (data instanceof Array) {
                value = data as any;
            } else {
                const constructor: new (...args: any[]) => U = ValueUtils.getType<U>(valueType);
                const args: any[] = [];

                // Extract constructor arguments
                if (descriptor && descriptor.arguments) {
                    for (const name of descriptor.arguments) {
                        args.push(data[name]);
                        delete data[name];
                    }
                }

                value = new constructor(...args);
                Object.assign(value, data);
            }
        }

        return value;
    }

    /** Instanciate data using valueType information */
    private instanciateField(data: any, valueType: ValueType<any>): any {
        if (data !== undefined) {
            if (ValueUtils.getType(valueType) === Document && (data instanceof firestore.DocumentReference || StringUtils.isString(data))) {
                return this.db.doc(data);
            } else {
                return this.instanciate(data, valueType);
            }
        }
    }

    /** Return an object from a custom type using a valueType */
    private objectify(value: Partial<T>, valueType: ValueType<T>, partial: boolean = false): T {
        let data: any = null;

        if (value) {
            data = value instanceof Array ? value : Object.assign({}, value);
            const descriptor: ValueDescriptor<T> = ValueUtils.getDescriptor<T>(valueType);
            const options = Object.assign((descriptor && descriptor.options) || {}, this.options);

            if (descriptor && descriptor.structure) { // Handle sub objects
                for (const name of Object.keys(descriptor.structure)) {
                    data[name] = this.objectifyField(data[name], descriptor.structure[name]);
                }
            } else if ((descriptor && descriptor.elements) || value instanceof Array) { // handle collections
                for (const name of Object.keys(data)) {
                    data[name] = this.objectifyField(data[name], descriptor ? descriptor.elements : valueType);
                }
            }

            // Ignore fields
            if (descriptor && descriptor.ignoreFields) {
                let ignoreFields = descriptor.ignoreFields;

                if (!(ignoreFields instanceof Array)) {
                    ignoreFields = partial ? ignoreFields.update : ignoreFields.set;
                }

                if (ignoreFields) {
                    for (const field of ignoreFields) {
                        delete data[field];
                    }
                }
            }

            // Options handling
            if (options.timestampOnCreate && !value[options.timestampOnCreate]) {
                data[options.timestampOnCreate] = firestore.FieldValue.serverTimestamp();
            }

            if (options.timestampOnUpdate) {
                data[options.timestampOnUpdate] = firestore.FieldValue.serverTimestamp();
            }
        }

        return data;
    }

    /** Objectify data using valueType information */
    private objectifyField(value: any, valueType: ValueType<any>): any {
        if (value !== undefined) {
            if (ValueUtils.getType(valueType) === Document && value instanceof Document) {
                return this.options.refAsPath ? value.ref.path : value.ref;
            } else {
                return this.objectify(value, valueType);
            }
        }
    }
}
