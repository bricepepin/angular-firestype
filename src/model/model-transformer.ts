import * as firebase from 'firebase/app';

import { ModelDescriptor } from './model-descriptor';
import { ModelType } from './model-type';

/** Transforms a model to data and data to model for a database path */
export class ModelTransformer<T> {
    private static descriptors: {[key: string]: ModelType<any>} = {};
    private descriptor: ModelType<T>;

    constructor(private path: string = '') {
        const segments: string[] = path.split('/');
        let current: ModelType<any> = ModelTransformer.descriptors[segments[0]];

        for (const i = 2; i < segments.length; i + 2) {
            const modelDescriptor: ModelDescriptor<any> = this.getModelDescriptor<any>(current);

            if (modelDescriptor && modelDescriptor.subcollections) {
                current = modelDescriptor.subcollections[segments[i]];
            } else {
                current = null;
                break;
            }
        }

        this.descriptor = current;
    }

    /** Set the available descriptors list */
    static setDescriptors(descriptors: {[key: string]: ModelType<any>}) {
        ModelTransformer.descriptors = descriptors || {};
    }

    /** Initialize a custom object from data and model descriptor */
    toModel(data: firebase.firestore.DocumentData): T {
        return this.descriptor ? this.instanciate<T>(data, this.descriptor) : data as T;
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
    private instanciate<U>(data: firebase.firestore.DocumentData, descriptor: ModelType<U>): U {
        const modelDescriptor: ModelDescriptor<U> = this.getModelDescriptor<U>(descriptor);
        const constructor: new (...args: any[]) => U = modelDescriptor ? modelDescriptor.type : descriptor as new (...args: any[]) => U;
        const args: any[] = [];

        // Instanciate submodels
        if (modelDescriptor && modelDescriptor.structure) {
            for (const name of Object.keys(modelDescriptor.structure)) {
                data[name] = this.instanciate<any>(data[name], modelDescriptor.structure[name]);
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
        const model: U = new constructor(...args);
        Object.assign(model, data);
        return model;
    }

    /** Return an object from a custom type using a descriptor */
    private objectify<U>(model: U, descriptor: ModelType<U>): U {
        const modelDescriptor: ModelDescriptor<U> = this.getModelDescriptor<U>(descriptor);
        const data = Object.assign({}, model);

         // Objectify submodels
         if (modelDescriptor && modelDescriptor.structure) {
            for (const name of Object.keys(modelDescriptor.structure)) {
                data[name] = this.objectify<any>(data[name], modelDescriptor.structure[name]);
            }
        }

        return data;
    }
}
