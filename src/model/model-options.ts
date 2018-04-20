import { DocumentData } from '@firebase/firestore-types';
import { Document } from '../document/document';
import { Options } from '../options';
import { ModelDescriptor } from './model-descriptor';
import { ModelType } from './model-type';
import { ModelUtils } from './model-utils';

/** Options to apply on model transformation */
export interface ModelOptions<T> {
    /** Transform firebase references to a string of the reference path on transformation if set to true */
    refAsPath?: boolean;

    /** Add a server timestamp on provided attribute when it is not yet defined */
    timestampOnCreate?: keyof T;

    /** Add a server timestamp on provided attribute on each update */
    timestampOnUpdate?: keyof T;
}
