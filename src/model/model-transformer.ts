import { DocumentData } from '@firebase/firestore-types';
import { firestore } from 'firebase/app';

import { Document } from '../document/document';
import { Model } from './model';
import { ModelDescriptor } from './model-descriptor';
import { ModelType } from './model-type';

/** Transforms a model to data and data to model for a database path */
export class ModelTransformer<T> {
    private descriptor: ModelType<T>;

    constructor(private path: string) {
        this.descriptor = Model.getModelType<T>(path);
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
            const modelDescriptor: ModelDescriptor<U> = Model.getModelDescriptor<U>(descriptor);
            const constructor: new (...args: any[]) => U = Model.getType<U>(descriptor);
            const args: any[] = [];

            if (modelDescriptor) {
                // Instanciate submodels of a custom model
                if (modelDescriptor.structure) {
                    for (const name of Object.keys(modelDescriptor.structure)) {
                        if (data[name] !== undefined) {
                            if (Model.getType(modelDescriptor.structure[name]) === Document) {
                                data[name] = data[name] !== null ? new Document(data[name]) : null;
                            } else {
                                data[name] = this.instanciate<any>(data[name], modelDescriptor.structure[name]);
                            }
                        }
                    }
                } else if (modelDescriptor.elements) {     // Instanciate elements of a collection
                    for (const name of Object.keys(data)) {
                        if (data[name] !== undefined) {
                            if (Model.getType(modelDescriptor.elements) === Document) {
                                data[name] = data[name] !== null ? new Document(data[name]) : null;
                            } else {
                                data[name] = this.instanciate<any>(data[name], modelDescriptor.elements);
                            }
                        }
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

    /** Return an object from a custom type using a descriptor */
    private objectify<U>(model: U, descriptor: ModelType<U>): U {
        let data: U;

        if (model) {
            data = Object.assign({}, model);
            const modelDescriptor: ModelDescriptor<U> = Model.getModelDescriptor<U>(descriptor);

            if (modelDescriptor) {
                // Objectify submodels
                if (modelDescriptor.structure) {
                    for (const name of Object.keys(modelDescriptor.structure)) {
                        if (data[name] !== undefined) {
                            if (modelDescriptor.structure[name] === Document) {
                                data[name] = data[name] !== null ? data[name].ref : null;
                            } else {
                                data[name] = this.objectify<any>(data[name], modelDescriptor.structure[name]);
                            }
                        }
                    }
                } else if (modelDescriptor.elements) {    // Objectify elements of a collection
                    for (const name of Object.keys(data)) {
                        if (data[name] !== undefined) {
                            if (modelDescriptor.elements === Document) {
                                data[name] = data[name] !== null ? data[name].ref : null;
                            } else {
                                data[name] = this.objectify<any>(data[name], modelDescriptor.elements);
                            }
                        }
                    }
                }

                // Options handling
                const options = modelDescriptor.options;
                if (options) {
                    if (options.timestampOnCreate && !model[options.timestampOnCreate]) {
                        data[options.timestampOnCreate] = firestore.FieldValue.serverTimestamp() as any;
                    }

                    if (options.timestampOnUpdate) {
                        data[options.timestampOnUpdate] = firestore.FieldValue.serverTimestamp() as any;
                    }
                }
            }
        }

        return data;
    }
}
