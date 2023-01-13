import { nextPage, OrderDirection } from '../../coroner/common';
import {
    RawSelectQueryResponse,
    SelectedCoronerQuery,
    SelectOrder,
    SelectQueryRequest,
    SelectQueryResponse,
} from '../../coroner/select';
import { ICoronerQueryExecutor } from '../../interfaces/ICoronerQueryExecutor';
import { ISelectCoronerSimpleResponseBuilder } from '../../interfaces/responses/ISelectCoronerSimpleResponseBuilder';
import { QuerySource } from '../../models/QuerySource';
import { cloneSelectRequest } from '../requests/cloneRequest';
import { CommonCoronerQueryBuilder } from './CommonCoronerQueryBuilder';

export class SelectedCoronerQueryBuilder extends CommonCoronerQueryBuilder implements SelectedCoronerQuery {
    readonly #request: SelectQueryRequest;
    readonly #executor: ICoronerQueryExecutor;
    readonly #simpleResponseBuilder: ISelectCoronerSimpleResponseBuilder;

    constructor(
        request: SelectQueryRequest,
        executor: ICoronerQueryExecutor,
        builder: ISelectCoronerSimpleResponseBuilder
    ) {
        super(request);
        this.#request = request;
        this.#executor = executor;
        this.#simpleResponseBuilder = builder;
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
        if (!this.#request.select) {
            throw new Error('Select query expected.');
        }

        const response = await this.#executor.execute<RawSelectQueryResponse>(this.#request, source);
        if (response.error) {
            return {
                success: false,
                json: () => response,
            };
        }

        return {
            success: true,
            json: () => response,
            first: () => this.#simpleResponseBuilder.first(response.response),
            all: () => this.#simpleResponseBuilder.rows(response.response),
            nextPage: () => {
                const request = nextPage(this.#request, response);
                return this.createInstance(request);
            },
        };
    }

    protected createInstance(request: SelectQueryRequest): this {
        return new SelectedCoronerQueryBuilder(request, this.#executor, this.#simpleResponseBuilder) as this;
    }
}
