import { ValueType } from './value-type';
import { ValueOptions } from './value-options';

/* Informations about a value used to normalize and denormalize data */
export interface ValueDescriptor<T> {
    /**
     * Value type. Reference to the type of data that will be send and retrieve from database.
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
     * Map of types defining the structure of the value.
     * All custom types contained in this object and their subobjects needs to be added to allow proper value transformation.
     */
    structure?: {[P in keyof T]: ValueType<any>};

    /**
     * If the value is a collection, define the type of its elements.
     */
    elements?: ValueType<any>;

    /** Map of value's subcollections that need to be instancied */
    subcollections?: {[P in keyof T]: ValueType<any>};

    /** List of options */
    options?: ValueOptions<T>;
}
