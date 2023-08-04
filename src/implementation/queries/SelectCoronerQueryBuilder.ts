import { Extension, Plugins } from '../../common';
import { OrderDirection, nextPage } from '../../coroner/common';
import {
    FailedSelectQueryResponse,
    RawSelectQueryResponse,
    SelectOrder,
    SelectQueryRequest,
    SelectQueryResponse,
    SelectedCoronerQuery,
    SimpleSelectRow,
    SimpleSelectRows,
    SuccessfulSelectQueryResponse,
} from '../../coroner/select';
import { ICoronerQueryExecutor } from '../../interfaces/ICoronerQueryExecutor';
import { ISelectCoronerSimpleResponseBuilder } from '../../interfaces/responses/ISelectCoronerSimpleResponseBuilder';
import { QuerySource } from '../../models/QuerySource';
import { cloneSelectRequest } from '../requests/cloneRequest';
import { CommonCoronerQueryBuilder } from './CommonCoronerQueryBuilder';

export class SelectedCoronerQueryBuilder extends CommonCoronerQueryBuilder implements SelectedCoronerQuery {
    readonly #request: SelectQueryRequest;
    readonly #executor: ICoronerQueryExecutor;
    readonly #buildSelf: (request: SelectQueryRequest) => SelectedCoronerQueryBuilder;
    readonly #simpleResponseBuilder: ISelectCoronerSimpleResponseBuilder;
    readonly #failedResponseExtensions: Extension<FailedSelectQueryResponse>[];
    readonly #successfulSelectResponseExtensions: Extension<SuccessfulSelectQueryResponse>[];

    constructor(
        request: SelectQueryRequest,
        executor: ICoronerQueryExecutor,
        buildSelf: (request: SelectQueryRequest) => SelectedCoronerQueryBuilder,
        builder: ISelectCoronerSimpleResponseBuilder,
        failedResponseExtensions?: Extension<FailedSelectQueryResponse>[],
        successfulSelectResponseExtensions?: Extension<SuccessfulSelectQueryResponse>[],
    ) {
        super(request);
        this.#request = request;
        this.#executor = executor;
        this.#buildSelf = buildSelf;
        this.#simpleResponseBuilder = builder;
        this.#failedResponseExtensions = failedResponseExtensions ?? [];
        this.#successfulSelectResponseExtensions = successfulSelectResponseExtensions ?? [];
    }

    public select(...attributes: string[]): SelectedCoronerQuery {
        const request = cloneSelectRequest(this.#request);
        if (!request.select) {
            request.select = attributes;
        } else {
            request.select = [...request.select, ...attributes];
        }

        return this.createInstance(request) as unknown as SelectedCoronerQuery;
    }

    public order(attribute: string, direction: OrderDirection): this {
        const order: SelectOrder = {
            name: attribute,
            ordering: direction,
        };

        const request = cloneSelectRequest(this.#request);
        if (request.order) {
            request.order = [...request.order, order];
        } else {
            request.order = [order];
        }

        return this.createInstance(request);
    }

    public json(): SelectQueryRequest {
        return this.#request;
    }

    public async post(source?: Partial<QuerySource>): Promise<SelectQueryResponse> {
        const response = await this.#executor.execute<RawSelectQueryResponse>(this.#request, source);
        if (response.error) {
            const queryResponse: FailedSelectQueryResponse = {
                success: false,
                query: this,
                json: () => response,
            };
            Plugins.extend(queryResponse, this.#failedResponseExtensions);
            return queryResponse;
        }

        const total = response._.runtime.filter.rows;

        let cachedFirst: SimpleSelectRow | undefined | null = null;
        let cachedAll: SimpleSelectRows | null = null;

        const queryResponse: SuccessfulSelectQueryResponse = {
            success: true,
            query: this,
            total,
            json: () => response,
            first: () =>
                cachedFirst !== null ? cachedFirst : (cachedFirst = this.#simpleResponseBuilder.first(response)),
            all: () => cachedAll ?? (cachedAll = this.#simpleResponseBuilder.rows(response)),
            nextPage: () => {
                const request = nextPage(this.#request, response);
                return this.createInstance(request);
            },
        };
        Plugins.extend(queryResponse, this.#successfulSelectResponseExtensions);
        return queryResponse;
    }

    protected createInstance(request: SelectQueryRequest): this {
        return this.#buildSelf(request) as this;
    }
}
