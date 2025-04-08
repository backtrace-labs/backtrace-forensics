import { Result } from '@backtrace/utils';
import { Extension, Plugins } from '../../common';
import { OrderDirection, nextPage } from '../../coroner/common';
import { CoronerError } from '../../coroner/common/errors';
import {
    RawSelectQueryResponse,
    SelectOrder,
    SelectQueryRequest,
    SelectWildcard,
    SelectedCoronerQuery,
    SimpleSelectRow,
    SimpleSelectRows,
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
    readonly #buildSelf: (request: SelectQueryRequest) => SelectedCoronerQueryBuilder;
    readonly #simpleResponseBuilder: ISelectCoronerSimpleResponseBuilder;
    readonly #successfulSelectResponseExtensions: Extension<SelectQueryResponse>[];

    constructor(
        request: SelectQueryRequest,
        executor: ICoronerQueryExecutor,
        buildSelf: (request: SelectQueryRequest) => SelectedCoronerQueryBuilder,
        builder: ISelectCoronerSimpleResponseBuilder,
        successfulSelectResponseExtensions?: Extension<SelectQueryResponse>[],
    ) {
        super(request);
        this.#request = request;
        this.#executor = executor;
        this.#buildSelf = buildSelf;
        this.#simpleResponseBuilder = builder;
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

    public selectAll(opts?: SelectWildcard): SelectedCoronerQuery {
        const request = cloneSelectRequest(this.#request);
        request.select_wildcard = opts ?? { derived: true, physical: true, virtual: true };

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

    public async post(source?: Partial<QuerySource>): Promise<Result<SelectQueryResponse, CoronerError>> {
        const response = await this.#executor.execute<RawSelectQueryResponse>(this.#request, source);
        if (response.error) {
            return Result.err(new CoronerError(response.error));
        }

        const total = response._.runtime.filter.rows;

        let cachedFirst: SimpleSelectRow | undefined | null = null;
        let cachedAll: SimpleSelectRows | null = null;

        const queryResponse: SelectQueryResponse = {
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
        return Result.ok(queryResponse);
    }

    protected createInstance(request: SelectQueryRequest): this {
        return this.#buildSelf(request) as this;
    }
}
