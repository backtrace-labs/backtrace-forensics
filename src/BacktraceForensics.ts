import { CoronerQuery, defaultRequest, QueryRequest } from './coroner/common';
import { FoldCoronerQuery, FoldedCoronerQuery, FoldQueryRequest, isFoldRequest } from './coroner/fold';
import { isSelectRequest, SelectCoronerQuery, SelectedCoronerQuery, SelectQueryRequest } from './coroner/select';
import { CoronerDescribeExecutor } from './implementation/CoronerDescribeExecutor';
import { CoronerQueryExecutor } from './implementation/CoronerQueryExecutor';
import { CoronerQueryBuilderFactory } from './implementation/factories/CoronerQueryBuilderFactory';
import { FoldCoronerQueryBuilderFactory } from './implementation/factories/FoldCoronerQueryBuilderFactory';
import { PlatformCoronerApiCallerFactory } from './implementation/factories/PlatformCoronerApiCallerFactory';
import { SelectCoronerQueryBuilderFactory } from './implementation/factories/SelectCoronerQueryBuilderFactory';
import { FoldCoronerSimpleResponseBuilder } from './implementation/responses/FoldCoronerSimpleResponseBuilder';
import { SelectCoronerSimpleResponseBuilder } from './implementation/responses/SelectCoronerSimpleResponseBuilder';
import { ICoronerApiCallerFactory } from './interfaces/factories/ICoronerQueryMakerFactory';
import { IFoldCoronerQueryBuilderFactory } from './interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ISelectCoronerQueryBuilderFactory } from './interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { ICoronerDescribeExecutor } from './interfaces/ICoronerDescribeExecutor';
import { ICoronerQueryExecutor } from './interfaces/ICoronerQueryExecutor';
import { QuerySource } from './models/QuerySource';

export interface BacktraceForensicsOptions {
    /**
     * Data from this source will be used as defaults for API calls.
     *
     * You can override this in `post()` functions in queries.
     * @example
     * options.defaultSource = {
     *     address: 'http://sample.sp.backtrace.io',
     *     token: '00112233445566778899AABBCCDDEEFF'
     * };
     *
     * // Will use `address` and `token` from defaults
     * query.post({ project: 'coroner' });
     */
    defaultSource?: Partial<QuerySource>;

    /**
     * Use this to override the default query maker factory for API calls.
     *
     * Return type of factory `create` function must implement `ICoronerQueryMaker`.
     * @example
     * options.queryMaker = {
     *     query: (source, request) => {
     *         // make the request and return the response
     *     }
     * }
     */
    queryMakerFactory?: ICoronerApiCallerFactory;
}

export interface CreateQueryOptions<R extends QueryRequest = QueryRequest> {
    request?: R;
}

export class BacktraceForensics {
    public readonly options: BacktraceForensicsOptions;

    readonly #queryExecutor: ICoronerQueryExecutor;
    readonly #describeExecutor: ICoronerDescribeExecutor;
    readonly #queryFactory: CoronerQueryBuilderFactory;
    readonly #foldFactory: IFoldCoronerQueryBuilderFactory;
    readonly #selectFactory: ISelectCoronerQueryBuilderFactory;

    constructor(options?: Partial<BacktraceForensicsOptions>) {
        this.options = this.getDefaultOptions(options);

        const queryMakerFactory = this.options.queryMakerFactory ?? new PlatformCoronerApiCallerFactory();

        this.#queryExecutor = new CoronerQueryExecutor(queryMakerFactory, this.options.defaultSource);

        this.#describeExecutor = new CoronerDescribeExecutor(queryMakerFactory, this.options.defaultSource);

        this.#foldFactory = new FoldCoronerQueryBuilderFactory(
            this.#queryExecutor,
            new FoldCoronerSimpleResponseBuilder()
        );

        this.#selectFactory = new SelectCoronerQueryBuilderFactory(
            this.#queryExecutor,
            new SelectCoronerSimpleResponseBuilder()
        );

        this.#queryFactory = new CoronerQueryBuilderFactory(
            this.#queryExecutor,
            this.#foldFactory,
            this.#selectFactory
        );
    }

    /**
     * Creates a new query with options from the instance.
     * @param request Request to use with the query. If not provided, will create an empty request.
     * @example
     * const instance = new BacktraceForensics();
     * const query = instance.create().filter(...).fold(...);
     */
    public create<R extends QueryRequest>(options?: CreateQueryOptions<R>): CoronerQuery;
    public create<R extends SelectQueryRequest>(options?: CreateQueryOptions<R>): SelectedCoronerQuery;
    public create<R extends FoldQueryRequest>(options?: CreateQueryOptions<R>): FoldedCoronerQuery;
    public create(options?: CreateQueryOptions<QueryRequest>): CoronerQuery | SelectCoronerQuery | FoldCoronerQuery {
        if (options) {
            const { request } = options;
            if (request) {
                if (isSelectRequest(request)) {
                    return this.#selectFactory.create(request as SelectQueryRequest);
                } else if (isFoldRequest(request)) {
                    return this.#foldFactory.create(request as FoldQueryRequest);
                } else {
                    return this.#queryFactory.create(defaultRequest);
                }
            }
        }

        return this.#queryFactory.create(defaultRequest);
    }

    public describe(source?: Partial<QuerySource>) {
        return this.#describeExecutor.execute(source);
    }

    /**
     * Creates a new query.
     * @param request Request to use with the query. If not provided, will create an empty request.
     * @param options Options to be used with the query.
     * @example
     * const query = BacktraceForensics.create().filter(...).fold(...);
     */
    public static create<R extends QueryRequest>(
        options?: Partial<BacktraceForensicsOptions>,
        createOptions?: CreateQueryOptions<R>
    ): CoronerQuery;
    public static create<R extends SelectQueryRequest>(
        options?: Partial<BacktraceForensicsOptions>,
        createOptions?: CreateQueryOptions<R>
    ): SelectedCoronerQuery;
    public static create<R extends FoldQueryRequest>(
        options?: Partial<BacktraceForensicsOptions>,
        createOptions?: CreateQueryOptions<R>
    ): FoldedCoronerQuery;
    public static create(
        options?: Partial<BacktraceForensicsOptions>,
        createOptions?: CreateQueryOptions<QueryRequest>
    ): CoronerQuery | SelectCoronerQuery | FoldCoronerQuery {
        return new BacktraceForensics(options).create(createOptions);
    }

    public static describe(source?: Partial<QuerySource>, options?: Partial<BacktraceForensicsOptions>) {
        return new BacktraceForensics(options).describe(source);
    }

    private getDefaultOptions(options?: BacktraceForensicsOptions) {
        return Object.assign({}, {}, options);
    }
}
