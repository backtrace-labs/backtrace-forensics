import { QuerySource } from '../models/QuerySource';
import { CoronerValueType } from '../requests';
import { FoldOperator, FoldQueryRequest, Folds } from '../requests/fold';
import { CoronerResponse } from '../responses/common';
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
     * Returns the built request.
     */
    getRequest(): R;

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
    getResponse(source?: Partial<QuerySource>): Promise<CoronerResponse<FoldQueryResponse<R>>>;
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
