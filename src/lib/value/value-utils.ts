import { ValueType } from './value-type';
import { ValueDescriptor } from './value-descriptor';
import { ObjectOf } from '../utils/object-of';

/**
 * Value utility class.
 */
export class ValueUtils {
    /** Return the valueType matching provided path */
    static getValueType<T>(path: string = '', model: ObjectOf<ValueType<any>>): ValueType<T> {
        const segments: string[] = path.replace(/^\//, '').split('/');
        let descriptor: ValueDescriptor<any> = null;
        let current: ValueType<T> = model[segments[0]];

        for (let i = 2; i < segments.length; i += 2) {
            descriptor = this.getDescriptor(current);

            if (descriptor && descriptor.subcollections && descriptor.subcollections[segments[i]]) {
                current = descriptor.subcollections[segments[i]];
            } else {
                current = null;
                break;
            }
        }

        if (!current) {
            throw new Error('Value type not found for path ' + path);
        }

        if (descriptor && descriptor.structure && descriptor.elements) {
            throw new Error('A value descriptor cannot have both \'structure\' and \'elements\' attributes. '
            + '\'structure\' is for custom object definition and \'elements\' is used to define elements types of a collection. '
            + 'Value: ' + JSON.stringify(current));
        }

        return current;
    }

    /** Return the descripyor of a valueType or null */
    static getDescriptor<T>(descriptor: ValueType<T>): ValueDescriptor<T> {
        return descriptor && (descriptor as ValueDescriptor<T>).type ? descriptor as ValueDescriptor<T> : null;
    }

    /** Return the type of a valueType */
    static getType<T>(valueType: ValueType<T>): new (...args: any[]) => T {
        const valueDescriptor = this.getDescriptor<T>(valueType);
        return valueDescriptor ? valueDescriptor.type : valueType as new (...args: any[]) => T;
    }
}
