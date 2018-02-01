import { ModelType } from './model-type';

/* Informations about a model used to normalize and denormalize data */
export interface ModelDescriptor<T> {
    /**
     * Model type. Reference to the type of data that will be send and retrieve from database.
     * The constructor needs to be idempotent to work properly.
     * This information is required.
     */
    type: new (...args: any[]) => T;

    /**
     * Array of fields names coming from database that will be send to constructor at instanciation time.
     * Fields that are not in this list will be added after instanciantiation only.
     * /!\ Order is important /!\
     */
    arguments?: (keyof T)[];

    /**
     * Map defining the structure of the model. All custom types contained in this object and their subobjects needs
     * to be added to allow proper model transformation
     */
    structure?: {[P in keyof T]: ModelType<any>};

    /** Map of model's subcollections that need to be instanciated */
    subcollections?: {[P in keyof T]: ModelType<any>};
}