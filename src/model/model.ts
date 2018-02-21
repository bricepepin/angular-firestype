import { InjectionToken } from '@angular/core';
import { ObjectOf } from '../object-of';
import { ModelType } from './model-type';

export class Model {
    static descriptors: ObjectOf<ModelType<any>> = {};
}
