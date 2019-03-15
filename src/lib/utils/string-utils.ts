export class StringUtils {
    /** Return true if the value in parameter is a string */
    static isString(value: any): value is string {
        return typeof value === 'string' || value instanceof String;
     }
}
