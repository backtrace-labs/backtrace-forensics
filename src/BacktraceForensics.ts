import { CoronerQueryExecutor } from './implementation/CoronerQueryExecutor';
import { FoldCoronerQueryBuilderFactory } from './implementation/factories/FoldCoronerQueryBuilderFactory';
import { SelectCoronerQueryBuilderFactory } from './implementation/factories/SelectCoronerQueryBuilderFactory';
import { NodeCoronerQueryMaker } from './implementation/NodeCoronerQueryMaker';
import { CoronerQueryBuilder } from './implementation/queries/CoronerQueryBuilder';
import { FoldCoronerSimpleResponseBuilder } from './implementation/responses/FoldCoronerSimpleResponseBuilder';
import { SelectCoronerSimpleResponseBuilder } from './implementation/responses/SelectCoronerSimpleResponseBuilder';
import { IFoldCoronerQueryBuilderFactory } from './interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ISelectCoronerQueryBuilderFactory } from './interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { ICoronerQueryExecutor } from './interfaces/ICoronerQueryExecutor';
import { ICoronerQueryMaker } from './interfaces/ICoronerQueryMaker';
import { QuerySource } from './models/QuerySource';
import { FoldCoronerQuery, FoldedCoronerQuery, SelectCoronerQuery, SelectedCoronerQuery } from './queries';
import { CoronerQuery } from './queries/common';
import {
    FoldQueryRequest,
    InferFoldQueryRequest,
    InferSelectQueryRequest,
    isFoldRequest,
    isSelectRequest,
    SelectQueryRequest,
} from './requests';
import { QueryRequest } from './requests/common';

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

export class BacktraceForensics {
    public readonly options: BacktraceForensicOptions;

    readonly #executor: ICoronerQueryExecutor;
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
    }

    /**
     * Creates a new query with options from the instance.
     * @param request Request to use with the query. If not provided, will create an empty request.
     * @example
     * const instance = new BacktraceForensics();
     * const query = instance.create().filter(...).fold(...);
     */
    public create<R extends QueryRequest>(request?: R): CoronerQuery;
    public create<R extends SelectQueryRequest>(request?: R): SelectedCoronerQuery<InferSelectQueryRequest<R>>;
    public create<R extends FoldQueryRequest>(request?: R): FoldedCoronerQuery<InferFoldQueryRequest<R>>;
    public create(
        request?: QueryRequest
    ): CoronerQuery | SelectCoronerQuery<SelectQueryRequest> | FoldCoronerQuery<FoldQueryRequest> {
        if (request) {
            if (isSelectRequest(request)) {
                return this.#selectFactory.create(request as SelectQueryRequest);
            } else if (isFoldRequest(request)) {
                return this.#foldFactory.create(request as FoldQueryRequest);
            }
        }

        return new CoronerQueryBuilder(request ?? {}, this.#foldFactory, this.#selectFactory);
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
        request?: R
    ): CoronerQuery;
    public static create<R extends SelectQueryRequest>(
        options?: Partial<BacktraceForensicOptions>,
        request?: R
    ): SelectedCoronerQuery<InferSelectQueryRequest<R>>;
    public static create<R extends FoldQueryRequest>(
        options?: Partial<BacktraceForensicOptions>,
        request?: R
    ): FoldedCoronerQuery<InferFoldQueryRequest<R>>;
    public static create(
        options?: Partial<BacktraceForensicOptions>,
        request?: QueryRequest
    ): CoronerQuery | SelectCoronerQuery<SelectQueryRequest> | FoldCoronerQuery<FoldQueryRequest> {
        return new BacktraceForensics(options).create(request);
    }

    private getDefaultOptions(options?: BacktraceForensicOptions) {
        return Object.assign({}, {}, options);
    }
}
