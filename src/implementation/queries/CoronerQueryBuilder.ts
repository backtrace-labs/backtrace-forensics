import { Extension, Plugins } from '../../common';
import {
    CommonCoronerQuery,
    CoronerQuery,
    FailedQueryResponse,
    QueryRequest,
    QueryResponse,
    RawQueryResponse,
    SuccessfulQueryResponse,
    nextPage,
} from '../../coroner/common';
import {
    FoldQueryRequest,
    FoldVirtualColumnType,
    FoldVirtualColumnTypes,
    FoldedCoronerQuery,
} from '../../coroner/fold';
import { SelectedCoronerQuery } from '../../coroner/select';
import { ICoronerQueryExecutor } from '../../interfaces';
import { IFoldCoronerQueryBuilderFactory } from '../../interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ISelectCoronerQueryBuilderFactory } from '../../interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { QuerySource } from '../../models';
import { CommonCoronerQueryBuilder } from './CommonCoronerQueryBuilder';

export class CoronerQueryBuilder extends CommonCoronerQueryBuilder implements CoronerQuery {
    readonly #request: QueryRequest;
    readonly #buildSelf: (request: QueryRequest) => CoronerQueryBuilder;
    readonly #executor: ICoronerQueryExecutor;
    readonly #foldQueryFactory: IFoldCoronerQueryBuilderFactory;
    readonly #selectQueryFactory: ISelectCoronerQueryBuilderFactory;
    readonly #failedResponseExtensions: Extension<FailedQueryResponse>[];
    readonly #successfulResponseExtensions: Extension<SuccessfulQueryResponse>[];

    constructor(
        request: QueryRequest,
        executor: ICoronerQueryExecutor,
        buildSelf: (request: QueryRequest) => CoronerQueryBuilder,
        foldQueryFactory: IFoldCoronerQueryBuilderFactory,
        selectQueryFactory: ISelectCoronerQueryBuilderFactory,
        failedResponseExtensions?: Extension<FailedQueryResponse>[],
        successfulResponseExtensions?: Extension<SuccessfulQueryResponse>[],
    ) {
        super(request);
        this.#executor = executor;
        this.#request = request;
        this.#buildSelf = buildSelf;
        this.#foldQueryFactory = foldQueryFactory;
        this.#selectQueryFactory = selectQueryFactory;
        this.#failedResponseExtensions = failedResponseExtensions ?? [];
        this.#successfulResponseExtensions = successfulResponseExtensions ?? [];
    }

    public select(...attributes: string[]): SelectedCoronerQuery {
        const query = this.#selectQueryFactory.create(this.#request);
        return query.select(...attributes);
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
    ): Promise<QueryResponse<RawQueryResponse, CommonCoronerQuery>> {
        const response = await this.#executor.execute<RawQueryResponse>(this.#request, source);
        if (response.error) {
            const queryResponse: FailedQueryResponse = {
                success: false,
                query: this,
                json: () => response,
            };
            Plugins.extend(queryResponse, this.#failedResponseExtensions);
            return queryResponse;
        }

        const queryResponse: SuccessfulQueryResponse = {
            success: true,
            query: this,
            json: () => response,
            nextPage: () => {
                const request = nextPage(this.#request, response);
                return this.createInstance(request);
            },
        };
        Plugins.extend(queryResponse, this.#successfulResponseExtensions);
        return queryResponse;
    }

    protected createInstance(request: QueryRequest): this {
        return this.#buildSelf(request) as this;
    }
}
