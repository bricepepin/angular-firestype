import { DocumentData } from '@firebase/firestore-types';

import { Model } from './model';
import { ModelDescriptor } from './model-descriptor';
import { ModelType } from './model-type';

/** Transforms a model to data and data to model for a database path */
export class ModelTransformer<T> {
    private descriptor: ModelType<T>;

    constructor(private path: string = '') {
        const segments: string[] = path.split('/');
        let current: ModelType<any> = Model.descriptors[segments[0]];

        for (let i = 2; i < segments.length; i += 2) {
            const modelDescriptor: ModelDescriptor<any> = this.getModelDescriptor<any>(current);

            if (modelDescriptor && modelDescriptor.subcollections && modelDescriptor.subcollections[segments[i]]) {
                current = modelDescriptor.subcollections[segments[i]];
            } else {
                current = null;
                break;
            }
        }

        if (!current) {
            throw new Error('Model descriptor not found for path: ' + path);
        }

        this.descriptor = current;
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

    /** Return the modelDescriptor of a descriptor if he got one or null */
    private getModelDescriptor<U>(descriptor: ModelType<U>): ModelDescriptor<U> {
        return descriptor && (descriptor as ModelDescriptor<U>).type ? descriptor as ModelDescriptor<U> : null;
    }

    /** Return an instanciation of the descriptor with provided data */
    private instanciate<U>(data: DocumentData, descriptor: ModelType<U>): U {
        let model: U;

        if (data) {
            const modelDescriptor: ModelDescriptor<U> = this.getModelDescriptor<U>(descriptor);
            const constructor: new (...args: any[]) => U = modelDescriptor ? modelDescriptor.type : descriptor as new (...args: any[]) => U;
            const args: any[] = [];

            // Instanciate submodels
            if (modelDescriptor && modelDescriptor.structure) {
                for (const name of Object.keys(modelDescriptor.structure)) {
                    if (data[name] !== undefined) {
                        data[name] = this.instanciate<any>(data[name], modelDescriptor.structure[name]);
                    }
                }
            }

            // Extract constructor arguments
            if (modelDescriptor && modelDescriptor.arguments) {
                for (const name of modelDescriptor.arguments) {
                    args.push(data[name]);
                    delete data[name];
                }
            }

            // Instanciate model and affect data
            model = new constructor(...args);
            Object.assign(model, data);
        }

        return model;
    }

    /** Return an object from a custom type using a descriptor */
    private objectify<U>(model: U, descriptor: ModelType<U>): U {
        let data: U;

        if (model) {
            data = Object.assign({}, model);
            const modelDescriptor: ModelDescriptor<U> = this.getModelDescriptor<U>(descriptor);

            // Objectify submodels
            if (modelDescriptor && modelDescriptor.structure) {
                for (const name of Object.keys(modelDescriptor.structure)) {
                    if (data[name] !== undefined) {
                        data[name] = this.objectify<any>(data[name], modelDescriptor.structure[name]);
                    }
                }
            }
        }

        return data;
    }
}
