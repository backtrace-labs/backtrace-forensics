import { QuerySource } from '../models/QuerySource';
import { CoronerValueType, OrderDirection } from '../requests';
import { FoldOperator, FoldQueryRequest, Folds, GetRequestFold } from '../requests/fold';
import { FoldQueryResponse } from '../responses/fold';
import { CommonCoronerQuery } from './common';

export interface FoldCoronerQuery<R extends FoldQueryRequest = FoldQueryRequest<never, ['*']>>
    extends CommonCoronerQuery {
    /**
     * Returns the query as dynamic fold. Use this to assign folds in runtime, without knowing the types.
     * @example
     * let query = query.fold()
     * query = query.fold('fingerprint', 'head');
     * query = query.fold('timestamp', 'tail');
     */
    dynamicFold(): FoldedCoronerQuery<FoldQueryRequest<Folds>>;

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
    fold<A extends string, V extends CoronerValueType, O extends FoldOperator<V>>(
        attribute: A,
        ...fold: O
    ): FoldedCoronerQuery<AddFold<R, A, O>>;

    /**
     * Sets the request group-by attribute. The attribute grouped by will be visible as `groupKey` in simple response.
     *
     * Request mutation: `request.group = [attribute]`
     * @param attribute Attribute to group by.
     * @example
     * query.group('fingerprint')
     */
    group<A extends string>(attribute: A): FoldedCoronerQuery<SetFoldGroup<R, A>>;
}

export interface FoldedCoronerQuery<R extends FoldQueryRequest> extends FoldCoronerQuery<R> {
    /**
     * Adds order on attribute fold with index and direction specified.
     * @param attribute Attribute to order by.
     * @param direction Order direction.
     * @param index Index of fold to fold upon.
     * Index must be less than number of folds made on this attribute, else the query will fail.
     * @example
     * // This will order descending on attribute 'a', fold 'head', then ascending on attribute 'a', fold 'tail'
     * query.fold('a', 'head').fold('a', 'tail').order('a', 'descending', 0).order('a', 'ascending', 1)
     */
    order<F extends GetRequestFold<R>, A extends keyof F & string, I extends number>(
        attribute: A,
        direction: OrderDirection,
        index: I
    ): FoldedCoronerQuery<R>;

    /**
     * Adds order on attribute fold with direction specified.
     * @param attribute Attribute to order by.
     * @param direction Order direction.
     * @param fold Fold to order by. Number of arguments may vary on used fold.
     * Attribute must be folded on this fold, else the query will fail.
     * @example
     * // This will order descending on attribute 'a', fold 'head', then ascending on attribute 'a', fold 'tail'
     * query.fold('a', 'head').fold('a', 'tail').order('a', 'descending', 'head').order('a', 'ascending', 'tail')
     */
    order<F extends GetRequestFold<R>, A extends keyof F & string, O extends F[A][number]>(
        attribute: A,
        direction: OrderDirection,
        ...fold: O
    ): FoldedCoronerQuery<R>;

    /**
     * Adds order on count direction specified.
     * @param direction Order direction.
     * @example
     * // This will order descending on count
     * query.fold('a', 'head').fold('a', 'tail').orderByCount('descending')
     */
    orderByCount(direction: OrderDirection): FoldedCoronerQuery<R>;

    /**
     * Returns the built request.
     */
    json(): R;

    /**
     * Makes a POST call to Coroner with the built request. You need to make at least a single fold or group.
     * @param source Where to make the request. If not specified, will supply data from default source.
     * @example
     * const response = await query.filter('fingerprint', '...').fold('a', 'head').group('b').post();
     * if (!response.error) {
     *     const row = response.response.first();
     *     const a = row.attributes.a.head;
     *     const b = row.attributes.b.groupKey;
     * }
     */
    post(source?: Partial<QuerySource>): Promise<FoldQueryResponse<R>>;
}

export type AddFold<R extends FoldQueryRequest, A extends string, O extends FoldOperator> = R extends FoldQueryRequest<
    infer F,
    infer G
>
    ? [F] extends [never]
        ? FoldQueryRequest<Folds<A, readonly [O]>, G>
        : A extends keyof F
        ? FoldQueryRequest<Omit<F, A> & Folds<A, [...F[A], O]>, G>
        : FoldQueryRequest<F & Folds<A, readonly [O]>, G>
    : never;

export type SetFoldGroup<R extends FoldQueryRequest, A extends string> = FoldQueryRequest<NonNullable<R['fold']>, [A]>;

export type DefaultGroup = '*';
