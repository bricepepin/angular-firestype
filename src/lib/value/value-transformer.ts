import { firestore } from 'firebase/app';

import { Document } from '../document/document';
import { ValueDescriptor } from './value-descriptor';
import { ValueType } from './value-type';
import { ValueUtils } from './value-utils';
import { ValueOptions } from './value-options';
import { AngularFirestype } from '../angular-firestype.service';

/** Transforms a value to data and data to value for a database path */
export class ValueTransformer<T> {
    private descriptor: ValueType<T>;

    constructor(path: string, private db: AngularFirestype, private options: ValueOptions<T> = {}) {
        this.descriptor = ValueUtils.getValueType<T>(path, this.db.model);
    }

    /** Initialize a custom object from data and value descriptor */
    toValue(data: firestore.DocumentData): T {
        return this.instanciate<T>(data, this.descriptor);
    }

    /** Get data from a custom object and value descriptor */
    toData(value: T): T {
        return this.objectify<T>(value, this.descriptor);
    }

    /** Get data from a partial custom object and value descriptor */
    toPartialData(value: Partial<T>): Partial<T> {
        return this.objectify<Partial<T>>(value, this.descriptor);
    }

    /** Return an instanciation of the descriptor with provided data */
    private instanciate<U>(data: firestore.DocumentData, descriptor: ValueType<U>): U {
        let value: U;

        if (data) {
            const valueDescriptor: ValueDescriptor<U> = ValueUtils.getValueDescriptor<U>(descriptor);
            const constructor: new (...args: any[]) => U = ValueUtils.getType<U>(descriptor);
            const args: any[] = [];

            if (valueDescriptor) {
                // Instanciate subvalues of a custom value
                if (valueDescriptor.structure) {
                    for (const name of Object.keys(valueDescriptor.structure)) {
                        this.instanciateField(data, name, valueDescriptor.structure[name]);
                    }
                } else if (valueDescriptor.elements) {     // Instanciate elements of a collection
                    for (const name of Object.keys(data)) {
                        this.instanciateField(data, name, valueDescriptor.elements);
                    }
                }

                // Extract constructor arguments
                if (valueDescriptor.arguments) {
                    for (const name of valueDescriptor.arguments) {
                        args.push(data[name as any]);
                        delete data[name as any];
                    }
                }

                // Instanciate value and affect data
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

    /** Return an object from a custom type using a descriptor */
    private objectify<U>(value: U, descriptor: ValueType<U>): U {
        let data: U;

        if (value) {
            data = Object.assign({}, value);
            const valueDescriptor: ValueDescriptor<U> = ValueUtils.getValueDescriptor<U>(descriptor);

            if (valueDescriptor) {
                const options = Object.assign(valueDescriptor.options || {}, this.options);

                // Objectify subvalues
                if (valueDescriptor.structure) {
                    for (const name of Object.keys(valueDescriptor.structure)) {
                        this.objectifyField(data, name, valueDescriptor.structure[name]);
                    }
                } else if (valueDescriptor.elements) {    // Objectify elements of a collection
                    for (const name of Object.keys(data)) {
                        this.objectifyField(data, name, valueDescriptor.elements);
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
