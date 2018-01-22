import { ModelDescriptor } from './model-descriptor';

/* Model type representation */
export type ModelType<T> = (new (...args: any[]) => T) | ModelDescriptor<T>;
