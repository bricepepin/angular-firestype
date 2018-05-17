import { InjectionToken } from '@angular/core';
import { ObjectOf } from '../object-of';
import { ModelType } from './model-type';

/** Injection token for model descriptors */
export const ModelToken = new InjectionToken<ObjectOf<ModelType<any>>>('AngularFirestype.ModelToken');
