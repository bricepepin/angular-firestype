import { Query as FQuery, FieldPath, WhereFilterOp, OrderByDirection } from '@firebase/firestore-types';
import { Document } from '../document/document';
import { DocumentSnapshot } from '../document/document-snapshot';

/** A Query supporting Document as filters */
export class Query {
    constructor(private fQuery: FQuery) { }

    /** Return the built query */
    build(): FQuery {
        return this.fQuery;
    }

    /**
     * Creates and returns a new Query with the additional filter that documents
     * must contain the specified field and the value should satisfy the
     * relation constraint provided.
     *
     * @param fieldPath The path to compare
     * @param opStr The operation string (e.g "<", "<=", "==", ">", ">=").
     * @param value The value for comparison
     * @return This query to chain calls.
     */
    where(fieldPath: string | FieldPath, opStr: WhereFilterOp, value: any): Query {
        this.fQuery = this.fQuery.where(fieldPath, opStr, value instanceof Document ? value.ref : value);
        return this;
    }

    /**
     * Creates and returns a new Query that's additionally sorted by the
     * specified field, optionally in descending order instead of ascending.
     *
     * @param fieldPath The field to sort by.
     * @param directionStr Optional direction to sort by ('asc' or 'desc'). If
     * not specified, order will be ascending.
     * @return This query to chain calls.
     */
    orderBy(fieldPath: string | FieldPath, directionStr?: OrderByDirection): Query {
        this.fQuery = this.fQuery.orderBy(fieldPath, directionStr);
        return this;
    }

    /**
     * Creates and returns a new Query that's additionally limited to only
     * return up to the specified number of documents.
     *
     * @param limit The maximum number of items to return.
     * @return This query to chain calls.
     */
    limit(limit: number): Query {
        this.fQuery = this.fQuery.limit(limit);
        return this;
    }

    /**
     * Creates and returns a new Query that starts at the provided document
     * (inclusive). The starting position is relative to the order of the query.
     * The document must contain all of the fields provided in the orderBy of
     * this query. The order of the field values
     * must match the order of the order by clauses of the query.
     *
     * @param snapshotOrFieldValue the snapshot or the first field value of the document to start at.
     * @param fieldValues The other field values to start this query at, in order
     * of the query's order by.
     * @return This query to chain calls.
     */
    startAt(snapshotOrFieldValue: DocumentSnapshot<any> | any, ...fieldValues: any[]): Query {
        this.fQuery = this.fQuery.startAt(snapshotOrFieldValue, fieldValues);
        return this;
    }

    /**
     * Creates and returns a new Query that starts after the provided document
     * (exclusive). The starting position is relative to the order of the query.
     * The document must contain all of the fields provided in the orderBy of
     * this query. The order of the field values
     * must match the order of the order by clauses of the query.
     *
     * @param snapshotOrFieldValue the snapshot or the first field value of the document to start after.
     * @param fieldValues The other field values to start this query after, in order
     * of the query's order by.
     * @return This query to chain calls.
     */
    startAfter(snapshotOrFieldValue: DocumentSnapshot<any> | any, ...fieldValues: any[]): Query {
        this.fQuery = this.fQuery.startAfter(snapshotOrFieldValue, fieldValues);
        return this;
    }

    /**
     * Creates and returns a new Query that ends before the provided document
     * (exclusive). The end position is relative to the order of the query. The
     * document must contain all of the fields provided in the orderBy of this
     * query. The order of the field values
     * must match the order of the order by clauses of the query.
     *
     * @param snapshotOrFieldValue the snapshot or the first field value of the document to end before.
     * @param fieldValues The other field values to end this query before, in order
     * of the query's order by.
     * @return This query to chain calls.
     */
    endBefore(snapshotOrFieldValue: DocumentSnapshot<any> | any, ...fieldValues: any[]): Query {
        this.fQuery = this.fQuery.endBefore(snapshotOrFieldValue, fieldValues);
        return this;
    }

    /**
     * Creates and returns a new Query that ends at the provided document
     * (inclusive). The end position is relative to the order of the query. The
     * document must contain all of the fields provided in the orderBy of this
     * query. The order of the field values
     * must match the order of the order by clauses of the query.
     *
     * @param snapshotOrFieldValue the snapshot or the first field value of the document to end at.
     * @param fieldValues The other field values to end this query at, in order
     * of the query's order by.
     * @return This query to chain calls.
     */
    endAt(snapshotOrFieldValue: DocumentSnapshot<any> | any, ...fieldValues: any[]): Query {
        this.fQuery = this.fQuery.endAt(snapshotOrFieldValue, fieldValues);
        return this;
    }
}
