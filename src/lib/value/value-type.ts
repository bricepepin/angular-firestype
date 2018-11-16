import { ValueDescriptor } from './value-descriptor';

/* Value type representation */
export type ValueType<T> = (new (...args: any[]) => T) | ValueDescriptor<T>;
