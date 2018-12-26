import { firestore } from 'firebase/app';

import { Document } from '../document/document';
import { ValueDescriptor } from './value-descriptor';
import { ValueType } from './value-type';
import { ValueUtils } from './value-utils';
import { ValueOptions } from './value-options';
import { AngularFirestype } from '../angular-firestype.service';

/** Transforms a value to data and data to value for a database path */
export class ValueTransformer<T> {
    private valueType: ValueType<T>;

    constructor(path: string, private db: AngularFirestype, private options: ValueOptions<T> = {}) {
        this.valueType = ValueUtils.getValueType<T>(path, this.db.model);
    }

    /** Initialize a custom object from data and value descriptor */
    toValue(data: firestore.DocumentData): T {
        return this.instanciate<T>(data, this.valueType);
    }

    /** Get data from a custom object and value descriptor */
    toData(value: T): T {
        return this.objectify<T>(value, this.valueType);
    }

    /** Get data from a partial custom object and value descriptor */
    toPartialData(value: Partial<T>): Partial<T> {
        return this.objectify<Partial<T>>(value, this.valueType);
    }

    /** Return an instanciation of the data with provided valueType */
    private instanciate<U>(data: firestore.DocumentData, valueType: ValueType<U>): U {
        let value: U = null;

        if (data) {
            const descriptor: ValueDescriptor<U> = ValueUtils.getDescriptor<U>(valueType);

            if (descriptor && descriptor.structure) {
                for (const name of Object.keys(descriptor.structure)) {
                    this.instanciateField(data, name, descriptor.structure[name]);
                }
            }

            if ((descriptor && descriptor.elements) || data instanceof Array) { // handle collections
                for (const name of Object.keys(data)) {
                    this.instanciateField(data, name, descriptor ? descriptor.elements : valueType);
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
                        args.push(data[name as any]);
                        delete data[name as any];
                    }
                }

                value = new constructor(...args);
                Object.assign(value, data);
            }
        }

        return value;
    }

    /** Instanciate data[name] using valueType information */
    private instanciateField(data: firestore.DocumentData, name: string, valueType: ValueType<any>): any {
        if (data[name] !== undefined && data[name] !== null) {
            if (ValueUtils.getType(valueType) === Document) {
                data[name] = this.db.doc(data[name]);
            } else {
                data[name] = this.instanciate(data[name], valueType);
            }
        }
    }

    /** Return an object from a custom type using a valueType */
    private objectify<U>(value: U, valueType: ValueType<U>): U {
        let data: U = null;

        if (value) {
            data = value instanceof Array ? value : Object.assign({}, value);
            const descriptor: ValueDescriptor<U> = ValueUtils.getDescriptor<U>(valueType);
            const options = Object.assign((descriptor && descriptor.options) || {}, this.options);

            if (descriptor && descriptor.structure) { // Handle sub objects
                for (const name of Object.keys(descriptor.structure)) {
                    this.objectifyField(data, name, descriptor.structure[name]);
                }
            } else if ((descriptor && descriptor.elements) || value instanceof Array) { // handle collections
                for (const name of Object.keys(data)) {
                    this.objectifyField(data, name, descriptor ? descriptor.elements : valueType);
                }
            }

            // Options handling
            if (options.timestampOnCreate && !value[options.timestampOnCreate]) {
                data[options.timestampOnCreate] = firestore.FieldValue.serverTimestamp() as any;
            }

            if (options.timestampOnUpdate) {
                data[options.timestampOnUpdate] = firestore.FieldValue.serverTimestamp() as any;
            }
        }

        return data;
    }

    /** Objectify data[name] using valueType information */
    private objectifyField(data: firestore.DocumentData, name: string, valueType: ValueType<any>): any {
        if (data[name] !== undefined && data[name] !== null) {
            if (ValueUtils.getType(valueType) === Document) {
                data[name] = this.options.refAsPath ? data[name].ref.path : data[name].ref;
            } else {
                data[name] = this.objectify(data[name], valueType);
            }
        }
    }
}
