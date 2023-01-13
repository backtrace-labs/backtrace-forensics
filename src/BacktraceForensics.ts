import { CoronerQuery, defaultRequest, QueryRequest } from './coroner/common';
import { FoldCoronerQuery, FoldedCoronerQuery, FoldQueryRequest, isFoldRequest } from './coroner/fold';
import { isSelectRequest, SelectCoronerQuery, SelectedCoronerQuery, SelectQueryRequest } from './coroner/select';
import { CoronerQueryExecutor } from './implementation/CoronerQueryExecutor';
import { CoronerQueryBuilderFactory } from './implementation/factories/CoronerQueryBuilderFactory';
import { FoldCoronerQueryBuilderFactory } from './implementation/factories/FoldCoronerQueryBuilderFactory';
import { SelectCoronerQueryBuilderFactory } from './implementation/factories/SelectCoronerQueryBuilderFactory';
import { NodeCoronerQueryMaker } from './implementation/NodeCoronerQueryMaker';
import { FoldCoronerSimpleResponseBuilder } from './implementation/responses/FoldCoronerSimpleResponseBuilder';
import { SelectCoronerSimpleResponseBuilder } from './implementation/responses/SelectCoronerSimpleResponseBuilder';
import { IFoldCoronerQueryBuilderFactory } from './interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ISelectCoronerQueryBuilderFactory } from './interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { ICoronerQueryExecutor } from './interfaces/ICoronerQueryExecutor';
import { ICoronerQueryMaker } from './interfaces/ICoronerQueryMaker';
import { QuerySource } from './models/QuerySource';

export interface BacktraceForensicOptions {
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
     * Use this to override the default query maker for API calls.
     *
     * Must implement `ICoronerQueryMaker`.
     * @example
     * options.queryMaker = {
     *     query: (source, request) => {
     *         // make the request and return the response
     *     }
     * }
     */
    queryMaker?: ICoronerQueryMaker;
}

export interface CreateQueryOptions<R extends QueryRequest = QueryRequest> {
    request?: R;
}

export class BacktraceForensics {
    public readonly options: BacktraceForensicOptions;

    readonly #executor: ICoronerQueryExecutor;
    readonly #queryFactory: CoronerQueryBuilderFactory;
    readonly #foldFactory: IFoldCoronerQueryBuilderFactory;
    readonly #selectFactory: ISelectCoronerQueryBuilderFactory;

    constructor(options?: Partial<BacktraceForensicOptions>) {
        this.options = this.getDefaultOptions(options);

        this.#executor = new CoronerQueryExecutor(
            this.options.queryMaker ?? new NodeCoronerQueryMaker(),
            this.options.defaultSource
        );
        this.#foldFactory = new FoldCoronerQueryBuilderFactory(this.#executor, new FoldCoronerSimpleResponseBuilder());
        this.#selectFactory = new SelectCoronerQueryBuilderFactory(
            this.#executor,
            new SelectCoronerSimpleResponseBuilder()
        );
        this.#queryFactory = new CoronerQueryBuilderFactory(this.#foldFactory, this.#selectFactory);
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

    /**
     * Creates a new query.
     * @param request Request to use with the query. If not provided, will create an empty request.
     * @param options Options to be used with the query.
     * @example
     * const query = BacktraceForensics.create().filter(...).fold(...);
     */
    public static create<R extends QueryRequest>(
        options?: Partial<BacktraceForensicOptions>,
        createOptions?: CreateQueryOptions<R>
    ): CoronerQuery;
    public static create<R extends SelectQueryRequest>(
        options?: Partial<BacktraceForensicOptions>,
        createOptions?: CreateQueryOptions<R>
    ): SelectedCoronerQuery;
    public static create<R extends FoldQueryRequest>(
        options?: Partial<BacktraceForensicOptions>,
        createOptions?: CreateQueryOptions<R>
    ): FoldedCoronerQuery;
    public static create(
        options?: Partial<BacktraceForensicOptions>,
        createOptions?: CreateQueryOptions<QueryRequest>
    ): CoronerQuery | SelectCoronerQuery | FoldCoronerQuery {
        return new BacktraceForensics(options).create(createOptions);
    }

    private getDefaultOptions(options?: BacktraceForensicOptions) {
        return Object.assign({}, {}, options);
    }
}
