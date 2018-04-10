import { InjectionToken } from '@angular/core';
import { ObjectOf } from '../object-of';
import { ModelType } from './model-type';
import { ModelDescriptor } from './model-descriptor';
import { FirebaseFirestore } from '@firebase/firestore-types';

/**
 * Model definition.
 * This class needs types and firestore initialisation before use.
 */
export class Model {
    static types: ObjectOf<ModelType<any>> = {};
    static firestore: FirebaseFirestore = null;

    /** Return the modelType matching provided path */
    static getModelType<T>(path: string = ''): ModelType<T> {
        const segments: string[] = path.split('/');
        let current: ModelType<T> = this.types[segments[0]];

        for (let i = 2; i < segments.length; i += 2) {
            const modelDescriptor: ModelDescriptor<any> = this.getModelDescriptor(current);

            if (modelDescriptor && modelDescriptor.subcollections && modelDescriptor.subcollections[segments[i]]) {
                current = modelDescriptor.subcollections[segments[i]];
            } else {
                current = null;
                break;
            }
        }

        if (!current) {
            throw new Error('Model descriptor not found for path ' + path);
        }

        return current;
    }

    /** Return the modelDescriptor of a type or null */
    static getModelDescriptor<T>(descriptor: ModelType<T>): ModelDescriptor<T> {
        const modelDescriptor = descriptor && (descriptor as ModelDescriptor<T>).type ? descriptor as ModelDescriptor<T> : null;

        if (modelDescriptor && modelDescriptor.structure && modelDescriptor.elements) {
            throw new Error('A model descriptor cannot have both \'structure\' and \'elements\' attributes. '
            + '\'structure\' is for custom object definition and \'elements\' is used to define elements types of a collection. '
            + 'Model: ' + JSON.stringify(descriptor));
        }

        return modelDescriptor;
    }

    /** Return the type of a modelType */
    static getType<T>(modelType: ModelType<T>): new (...args: any[]) => T {
        const modelDescriptor = this.getModelDescriptor<T>(modelType);
        return modelDescriptor ? modelDescriptor.type : modelType as new (...args: any[]) => T;
    }
}
