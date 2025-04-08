import { Result } from '@backtrace/utils';
import { Plugins } from './common/plugin';
import { CoronerQuery, defaultRequest, DescribeAttribute, QueryRequest } from './coroner/common';
import { CoronerError } from './coroner/common/errors';
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
import {
    CoronerApiCallerProvider,
    getApiCallerFactory,
    ICoronerApiCallerFactory,
} from './interfaces/factories/ICoronerQueryMakerFactory';
import { IFoldCoronerQueryBuilderFactory } from './interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ISelectCoronerQueryBuilderFactory } from './interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { ICoronerDescribeExecutor } from './interfaces/ICoronerDescribeExecutor';
import { ICoronerQueryExecutor } from './interfaces/ICoronerQueryExecutor';
import { DescribeSource } from './models/DescribeSource';
import { QuerySource } from './models/QuerySource';

export interface ForensicsOptions {
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
    readonly defaultSource?: Partial<QuerySource>;

    /**
     * Use this to override the default API caller for API calls.
     *
     * The caller must implement the `ICoronerApiCaller` interface.
     *
     * @example
     * options.apiCaller = new NodeCoronerApiCaller({
     *   disableSslVerification: true
     * })
     * options.apiCaller = async () => new MyCoronerApiCaller();
     * options.apiCaller = {
     *   async create() {
     *     return new MyCoronerApiCaller();
     *   }
     * }
     */
    readonly apiCaller?: CoronerApiCallerProvider | ICoronerApiCallerFactory;

    /**
     * @deprecated Use `apiCallerFactory`.
     */
    readonly queryMakerFactory?: ICoronerApiCallerFactory;

    /**
     * Plugins to use with this instance of Forensics.
     *
     * @example
     * options.plugins = [issuePlugin, otherPlugin];
     */
    readonly plugins?: Plugins.ForensicsPlugin[];
}

export interface CreateQueryOptions<R extends QueryRequest = QueryRequest> {
    request?: R;
}

export class Forensics {
    public readonly options: ForensicsOptions;

    readonly #queryExecutor: ICoronerQueryExecutor;
    readonly #describeExecutor: ICoronerDescribeExecutor;
    readonly #queryFactory: CoronerQueryBuilderFactory;
    readonly #foldFactory: IFoldCoronerQueryBuilderFactory;
    readonly #selectFactory: ISelectCoronerQueryBuilderFactory;

    constructor(options?: Partial<ForensicsOptions>) {
        this.options = this.getDefaultOptions(options);

        const apiCallerFactory = getApiCallerFactory(
            this.options.apiCaller ?? this.options.queryMakerFactory ?? new PlatformCoronerApiCallerFactory(),
        );

        this.#queryExecutor = new CoronerQueryExecutor(apiCallerFactory, this.options.defaultSource);

        this.#describeExecutor = new CoronerDescribeExecutor(apiCallerFactory, this.options.defaultSource);

        const pluginContext: Plugins.PluginContext = {
            options: this.options,
            apiCallerFactory,
            forensics: this,
        };

        const foldedQueryBuilderExtensions = this.options.plugins
            ?.flatMap((p) => [
                ...(p.queryExtensions ?? []),
                ...(p.foldQueryExtensions ?? []),
                ...(p.foldedQueryExtensions ?? []),
            ])
            .map((ext) => ext(pluginContext));

        const successfulFoldResponseExtensions = this.options.plugins
            ?.flatMap((p) => [
                ...(p.responseExtensions ?? []),
                ...(p.successfulResponseExtensions ?? []),
                ...(p.foldQueryExtensions ?? []),
                ...(p.successfulFoldResponseExtensions ?? []),
            ])
            .map((ext) => ext(pluginContext));

        this.#foldFactory = new FoldCoronerQueryBuilderFactory(
            this.#queryExecutor,
            new FoldCoronerSimpleResponseBuilder(),
            foldedQueryBuilderExtensions,
            successfulFoldResponseExtensions,
        );

        const selectedQueryBuilderExtensions = this.options.plugins
            ?.flatMap((p) => [
                ...(p.queryExtensions ?? []),
                ...(p.selectQueryExtensions ?? []),
                ...(p.selectedQueryExtensions ?? []),
            ])
            .map((ext) => ext(pluginContext));

        const successfulSelectResponseExtensions = this.options.plugins
            ?.flatMap((p) => [
                ...(p.responseExtensions ?? []),
                ...(p.successfulResponseExtensions ?? []),
                ...(p.selectQueryExtensions ?? []),
                ...(p.successfulSelectResponseExtensions ?? []),
            ])
            .map((ext) => ext(pluginContext));

        this.#selectFactory = new SelectCoronerQueryBuilderFactory(
            this.#queryExecutor,
            new SelectCoronerSimpleResponseBuilder(),
            selectedQueryBuilderExtensions,
            successfulSelectResponseExtensions,
        );

        const baseQueryBuilderExtensions = this.options.plugins
            ?.flatMap((p) => [
                ...(p.queryExtensions ?? []),
                ...(p.foldQueryExtensions ?? []),
                ...(p.selectQueryExtensions ?? []),
            ])
            .map((ext) => ext(pluginContext));

        const successfulBaseResponseExtensions = this.options.plugins
            ?.flatMap((p) => [...(p.responseExtensions ?? []), ...(p.successfulResponseExtensions ?? [])])
            .map((ext) => ext(pluginContext));

        this.#queryFactory = new CoronerQueryBuilderFactory(
            this.#queryExecutor,
            this.#foldFactory,
            this.#selectFactory,
            baseQueryBuilderExtensions,
            successfulBaseResponseExtensions,
        );
    }

    /**
     * Creates a new query with options from the instance.
     * @param request Request to use with the query. If not provided, will create an empty request.
     * @example
     * const instance = new Forensics();
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

    public async describe(source?: Partial<DescribeSource>): Promise<Result<DescribeAttribute[], CoronerError>> {
        const result = await this.#describeExecutor.execute(source);
        if (result.error) {
            return Result.err(new CoronerError(result.error));
        }
        return Result.ok(result.describe);
    }

    /**
     * Creates a new query.
     * @param request Request to use with the query. If not provided, will create an empty request.
     * @param options Options to be used with the query.
     * @example
     * const query = Forensics.create().filter(...).fold(...);
     */
    public static create<R extends QueryRequest>(
        options?: Partial<ForensicsOptions>,
        createOptions?: CreateQueryOptions<R>,
    ): CoronerQuery;
    public static create<R extends SelectQueryRequest>(
        options?: Partial<ForensicsOptions>,
        createOptions?: CreateQueryOptions<R>,
    ): SelectedCoronerQuery;
    public static create<R extends FoldQueryRequest>(
        options?: Partial<ForensicsOptions>,
        createOptions?: CreateQueryOptions<R>,
    ): FoldedCoronerQuery;
    public static create(
        options?: Partial<ForensicsOptions>,
        createOptions?: CreateQueryOptions<QueryRequest>,
    ): CoronerQuery | SelectCoronerQuery | FoldCoronerQuery {
        return new Forensics(options).create(createOptions);
    }

    public static describe(source?: Partial<DescribeSource>, options?: Partial<ForensicsOptions>) {
        return new Forensics(options).describe(source);
    }

    private getDefaultOptions(options?: ForensicsOptions) {
        return Object.assign({}, {}, options);
    }
}

export const BacktraceForensics = Forensics;
export type BacktraceForensics = typeof Forensics;
