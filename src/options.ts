import { FirebaseFirestore } from '@firebase/firestore-types';
import { firestore } from 'firebase/app';
import { ObjectOf } from './object-of';
import { ModelType } from './model/model-type';

/**
 * Options of AngularFirestype.
 * model and firestore needs to be defined before use.
 */
export class Options {
    /** User defined model */
    private static userModel: ObjectOf<ModelType<any>> = null;

    /** Firestore instance used by AngularFirestype to perform database operations */
    private static firestoreInstance: FirebaseFirestore = null;

    /** Firestore static reference that AngularFirestype will use. */
    static firestoreStatic = firestore;

    /** Return user defined model. If not defined, throw an error. */
    static model(): ObjectOf<ModelType<any>> {
        if (this.userModel === null) {
            throw new Error('Model description needs to be defined before use by AngularFirestype.');
        }

        return this.userModel;
    }

    /** Define user model. */
    static setModel(model: ObjectOf<ModelType<any>>) {
        this.userModel = model;
    }

    /** Return firestore instance. If not defined, throw an error. */
    static firestore(): FirebaseFirestore {
        if (this.firestoreInstance === null) {
            throw new Error('Firestore instance needs to be defined before use by AngularFirestype.');
        }

        return this.firestoreInstance;
    }

    /** Define firestore instance used by AngularFirestype. */
    static setFirestore(instance: FirebaseFirestore) {
        this.firestoreInstance = instance;
    }
}
