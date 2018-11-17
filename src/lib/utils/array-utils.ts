export class ArrayUtils {
    /** Return the first element of an array or null */
    static first<T>(array: T[]): T {
       return array && array.length > 0 ? array[0] : null;
    }
}
