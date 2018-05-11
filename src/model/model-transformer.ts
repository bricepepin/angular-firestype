import { firestore } from 'firebase/app';
import { DocumentData } from '@firebase/firestore-types';
import { Document } from '../document/document';
import { ModelDescriptor } from './model-descriptor';
import { ModelType } from './model-type';
import { ModelUtils } from './model-utils';
import { ModelOptions } from './model-options';
import { AngularFirestype } from '../angular-firestype.service';

/** Transforms a model to data and data to model for a database path */
export class ModelTransformer<T> {
    private descriptor: ModelType<T>;

    constructor(path: string, private db: AngularFirestype, private options: ModelOptions<T> = {}) {
        this.descriptor = ModelUtils.getModelType<T>(path, this.db.model);
    }

    /** Initialize a custom object from data and model descriptor */
    toModel(data: DocumentData): T {
        return this.instanciate<T>(data, this.descriptor);
    }

    /** Get data from a custom object and model descriptor */
    toData(model: T): T {
        return this.objectify<T>(model, this.descriptor);
    }

    /** Get data from a partial custom object and model descriptor */
    toPartialData(model: Partial<T>): Partial<T> {
        return this.objectify<Partial<T>>(model, this.descriptor);
    }

    /** Return an instanciation of the descriptor with provided data */
    private instanciate<U>(data: DocumentData, descriptor: ModelType<U>): U {
        let model: U;

        if (data) {
            const modelDescriptor: ModelDescriptor<U> = ModelUtils.getModelDescriptor<U>(descriptor);
            const constructor: new (...args: any[]) => U = ModelUtils.getType<U>(descriptor);
            const args: any[] = [];

            if (modelDescriptor) {
                // Instanciate submodels of a custom model
                if (modelDescriptor.structure) {
                    for (const name of Object.keys(modelDescriptor.structure)) {
                        this.instanciateField(data, name, modelDescriptor.structure[name]);
                    }
                } else if (modelDescriptor.elements) {     // Instanciate elements of a collection
                    for (const name of Object.keys(data)) {
                        this.instanciateField(data, name, modelDescriptor.elements);
                    }
                }

                // Extract constructor arguments
                if (modelDescriptor.arguments) {
                    for (const name of modelDescriptor.arguments) {
                        args.push(data[name]);
                        delete data[name];
                    }
                }

                // Instanciate model and affect data
                model = new constructor(...args);
                Object.assign(model, data);
            }
        }

        return model;
    }

    /** Instanciate data[name] using modelType information */
    private instanciateField(data: DocumentData, name: string, modelType: ModelType<any>): any {
        if (data[name] !== undefined && data[name] !== null) {
            if (ModelUtils.getType(modelType) === Document) {
                data[name] = this.db.doc(data[name]);
            } else {
                data[name] = this.instanciate(data[name], modelType);
            }
        }
    }

    /** Return an object from a custom type using a descriptor */
    private objectify<U>(model: U, descriptor: ModelType<U>): U {
        let data: U;

        if (model) {
            data = Object.assign({}, model);
            const modelDescriptor: ModelDescriptor<U> = ModelUtils.getModelDescriptor<U>(descriptor);

            if (modelDescriptor) {
                const options = Object.assign(modelDescriptor.options || {}, this.options);

                // Objectify submodels
                if (modelDescriptor.structure) {
                    for (const name of Object.keys(modelDescriptor.structure)) {
                        this.objectifyField(data, name, modelDescriptor.structure[name]);
                    }
                } else if (modelDescriptor.elements) {    // Objectify elements of a collection
                    for (const name of Object.keys(data)) {
                        this.objectifyField(data, name, modelDescriptor.elements);
                    }
                }

                // Options handling
                if (options.timestampOnCreate && !model[options.timestampOnCreate]) {
                    data[options.timestampOnCreate] = firestore.FieldValue.serverTimestamp() as any;
                }

                if (options.timestampOnUpdate) {
                    data[options.timestampOnUpdate] = firestore.FieldValue.serverTimestamp() as any;
                }
            }
        }

        return data;
    }

    /** Objectify data[name] using modelType information */
    private objectifyField(data: DocumentData, name: string, modelType: ModelType<any>): any {
        if (data[name] !== undefined && data[name] !== null) {
            if (ModelUtils.getType(modelType) === Document) {
                data[name] = this.options.refAsPath ? data[name].ref.path : data[name].ref;
            } else {
                data[name] = this.objectify(data[name], modelType);
            }
        }
    }
}
