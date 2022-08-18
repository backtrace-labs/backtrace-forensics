import { QuerySource } from '../models/QuerySource';
import { CoronerValueType } from '../requests/common';
import { Fold, FoldOperator, FoldQueryRequest, Folds } from '../requests/fold';
import { CoronerResponse } from '../responses/common';
import { FoldQueryResponse } from '../responses/fold';
import { Attribute, CommonCoronerQuery, JoinAttributes, QueryObjectValue } from './common';

export interface FoldCoronerQuery<T extends Attribute, F extends Folds = never, G extends string | DefaultGroup = '*'>
    extends CommonCoronerQuery<T> {
    /**
     * Returns the query as dynamic fold. Use this to assign folds in runtime, without knowing the types.
     * @example
     * let query = query.fold()
     * query = query.fold('fingerprint', 'head');
     * query = query.fold('timestamp', 'tail');
     */
    fold<A extends string>(): FoldedCoronerQuery<T, [F] extends [never] ? Folds<A> : F, string>;

    /**
     * Adds provided fold to the request.
     *
     * Request mutation: `request.fold[attribute] += [...fold]`
     * @param attribute Attribute to fold on.
     * @param fold Fold to use. Number of arguments may vary on used fold.
     * @example
     * query.fold('fingerprint', 'head')
     *      .fold('fingerprint', 'tail')
     *      .fold('timestamp', 'distribution', 3)
     */
    fold<A extends string, V extends QueryObjectValue<T, A>, O extends FoldOperator<V>>(
        attribute: A,
        ...fold: O
    ): FoldedCoronerQuery<JoinAttributes<T, A, V>, JoinFolds<F, A, O>, G>;

    /**
     * Sets the request group-by attribute. The attribute grouped by will be visible as `groupKey` in simple response.
     *
     * Request mutation: `request.group = [attribute]`
     * @param attribute Attribute to group by.
     * @example
     * query.group('fingerprint')
     */
    group<A extends string>(attribute: A): FoldedCoronerQuery<T, F, A>;
}

export interface FoldedCoronerQuery<T extends Attribute, F extends Folds, G extends string | DefaultGroup>
    extends FoldCoronerQuery<T, F, G> {
    /**
     * Returns the built request.
     */
    getRequest(): FoldQueryRequest<T, F, G>;

    /**
     * Makes a POST call to Coroner with the built request. You need to make at least a single fold or group.
     * @param source Where to make the request. If not specified, will supply data from default source.
     * @example
     * const response = await query.filter('fingerprint', '...').fold('a', 'head').group('b').getResponse();
     * if (!response.error) {
     *     const row = response.response.first();
     *     const a = row.attributes.a.head;
     *     const b = row.attributes.b.groupKey;
     * }
     */
    getResponse(source?: Partial<QuerySource>): Promise<CoronerResponse<FoldQueryResponse<T, F, G>>>;
}

export type JoinFolds<F extends Folds, A extends string, O extends FoldOperator<CoronerValueType>> = [F] extends [never]
    ? { [K in A]: Fold<K, [O]> }
    : F extends { [K in A]: Fold<A, infer AF> }
    ? { [K in A]: Fold<A, [...AF, O]> } & Pick<F, Exclude<keyof F, A>>
    : F & { [K in A]: Fold<K, [O]> };

export type DefaultGroup = '*';
