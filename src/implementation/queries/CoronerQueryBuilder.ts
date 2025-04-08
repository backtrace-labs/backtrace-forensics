import { Result } from '@backtrace/utils';
import { Extension, Plugins } from '../../common';
import {
    CommonCoronerQuery,
    CoronerQuery,
    QueryRequest,
    QueryResponse,
    RawQueryResponse,
    nextPage,
} from '../../coroner/common';
import {
    FoldQueryRequest,
    FoldVirtualColumnType,
    FoldVirtualColumnTypes,
    FoldedCoronerQuery,
} from '../../coroner/fold';
import { SelectWildcard, SelectedCoronerQuery } from '../../coroner/select';
import { ICoronerQueryExecutor } from '../../interfaces';
import { IFoldCoronerQueryBuilderFactory } from '../../interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ISelectCoronerQueryBuilderFactory } from '../../interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { QuerySource } from '../../models';
import { CommonCoronerQueryBuilder } from './CommonCoronerQueryBuilder';
import { CoronerError } from '../../coroner/common/errors';

export class CoronerQueryBuilder extends CommonCoronerQueryBuilder implements CoronerQuery {
    readonly #request: QueryRequest;
    readonly #buildSelf: (request: QueryRequest) => CoronerQueryBuilder;
    readonly #executor: ICoronerQueryExecutor;
    readonly #foldQueryFactory: IFoldCoronerQueryBuilderFactory;
    readonly #selectQueryFactory: ISelectCoronerQueryBuilderFactory;
    readonly #successfulResponseExtensions: Extension<QueryResponse>[];

    constructor(
        request: QueryRequest,
        executor: ICoronerQueryExecutor,
        buildSelf: (request: QueryRequest) => CoronerQueryBuilder,
        foldQueryFactory: IFoldCoronerQueryBuilderFactory,
        selectQueryFactory: ISelectCoronerQueryBuilderFactory,
        successfulResponseExtensions?: Extension<QueryResponse>[],
    ) {
        super(request);
        this.#executor = executor;
        this.#request = request;
        this.#buildSelf = buildSelf;
        this.#foldQueryFactory = foldQueryFactory;
        this.#selectQueryFactory = selectQueryFactory;
        this.#successfulResponseExtensions = successfulResponseExtensions ?? [];
    }

    public select(...attributes: string[]): SelectedCoronerQuery {
        const query = this.#selectQueryFactory.create(this.#request);
        return query.select(...attributes);
    }

    public selectAll(options?: SelectWildcard): SelectedCoronerQuery {
        const query = this.#selectQueryFactory.create(this.#request);
        return query.selectAll(options);
    }

    public fold(attribute?: string, ...fold: any): FoldedCoronerQuery {
        if (!attribute) {
            return this.#foldQueryFactory.create(this.#request as FoldQueryRequest);
        }

        const query = this.#foldQueryFactory.create(this.#request as FoldQueryRequest);
        return query.fold(attribute, ...fold);
    }

    public group(attribute: string): FoldedCoronerQuery {
        const query = this.#foldQueryFactory.create(this.#request as FoldQueryRequest);
        return query.group(attribute);
    }

    public virtualColumn(
        name: string,
        type: FoldVirtualColumnType,
        params: FoldVirtualColumnTypes[keyof FoldVirtualColumnTypes][1],
    ): FoldedCoronerQuery {
        const query = this.#foldQueryFactory.create(this.#request as FoldQueryRequest);
        return query.virtualColumn(name, type, params);
    }

    public async post(
        source?: Partial<QuerySource> | undefined,
    ): Promise<Result<QueryResponse<RawQueryResponse, CommonCoronerQuery>, CoronerError>> {
        const response = await this.#executor.execute<RawQueryResponse>(this.#request, source);
        if (response.error) {
            return Result.err(new CoronerError(response.error));
        }

        const queryResponse: QueryResponse = {
            query: this,
            json: () => response,
            nextPage: () => {
                const request = nextPage(this.#request, response);
                return this.createInstance(request);
            },
        };
        Plugins.extend(queryResponse, this.#successfulResponseExtensions);
        return Result.ok(queryResponse);
    }

    protected createInstance(request: QueryRequest): this {
        return this.#buildSelf(request) as this;
    }
}
