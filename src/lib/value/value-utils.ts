import { ValueType } from './value-type';
import { ValueDescriptor } from './value-descriptor';
import { ObjectOf } from '../utils/object-of';

/**
 * Value utility class.
 */
export class ValueUtils {
    /** Return the valueType matching provided path */
    static getValueType<T>(path: string = '', value: ObjectOf<ValueType<any>>): ValueType<T> {
        const segments: string[] = path.replace(/^\//, '').split('/');
        let current: ValueType<T> = value[segments[0]];

        for (let i = 2; i < segments.length; i += 2) {
            const valueDescriptor: ValueDescriptor<any> = this.getValueDescriptor(current);

            if (valueDescriptor && valueDescriptor.subcollections && valueDescriptor.subcollections[segments[i]]) {
                current = valueDescriptor.subcollections[segments[i]];
            } else {
                current = null;
                break;
            }
        }

        if (!current) {
            throw new Error('Value descriptor not found for path ' + path);
        }

        return current;
    }

    /** Return the valueDescriptor of a type or null */
    static getValueDescriptor<T>(descriptor: ValueType<T>): ValueDescriptor<T> {
        const valueDescriptor = descriptor && (descriptor as ValueDescriptor<T>).type ? descriptor as ValueDescriptor<T> : null;

        if (valueDescriptor && valueDescriptor.structure && valueDescriptor.elements) {
            throw new Error('A value descriptor cannot have both \'structure\' and \'elements\' attributes. '
            + '\'structure\' is for custom object definition and \'elements\' is used to define elements types of a collection. '
            + 'Value: ' + JSON.stringify(descriptor));
        }

        return valueDescriptor;
    }

    /** Return the type of a valueType */
    static getType<T>(valueType: ValueType<T>): new (...args: any[]) => T {
        const valueDescriptor = this.getValueDescriptor<T>(valueType);
        return valueDescriptor ? valueDescriptor.type : valueType as new (...args: any[]) => T;
    }
}
