import { InjectionToken } from '@angular/core';
import { ObjectOf } from './utils/object-of';
import { ValueType } from './value/value-type';

/** Injection token for value descriptors */
export const ModelToken = new InjectionToken<ObjectOf<ValueType<any>>>('AngularFirestype.ModelToken');
