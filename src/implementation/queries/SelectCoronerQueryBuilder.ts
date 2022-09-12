import { ICoronerQueryExecutor } from '../../interfaces/ICoronerQueryExecutor';
import { ISelectCoronerSimpleResponseBuilder } from '../../interfaces/responses/ISelectCoronerSimpleResponseBuilder';
import { QuerySource } from '../../models/QuerySource';
import { AddSelect, SelectedCoronerQuery } from '../../queries/select';
import { OrderDirection } from '../../requests';
import { SelectOrder, SelectQueryRequest } from '../../requests/select';
import { RawSelectQueryResponse, SelectQueryResponse } from '../../responses/select';
import { cloneSelectRequest } from '../requests/cloneRequest';
import { CommonCoronerQueryBuilder } from './CommonCoronerQueryBuilder';

export class SelectedCoronerQueryBuilder<R extends SelectQueryRequest>
    extends CommonCoronerQueryBuilder
    implements SelectedCoronerQuery<R>
{
    readonly #request: R;
    readonly #executor: ICoronerQueryExecutor;
    readonly #simpleResponseBuilder: ISelectCoronerSimpleResponseBuilder;

    constructor(request: R, executor: ICoronerQueryExecutor, builder: ISelectCoronerSimpleResponseBuilder) {
        super(request);
        this.#request = request;
        this.#executor = executor;
        this.#simpleResponseBuilder = builder;
    }

    public select<A extends string[]>(...attributes: A): SelectedCoronerQuery<AddSelect<R, A>> {
        const request = cloneSelectRequest(this.#request);
        if (!request.select) {
            request.select = attributes;
        } else {
            request.select = [...request.select, ...attributes];
        }

        return this.createInstance(request) as unknown as SelectedCoronerQuery<AddSelect<R, A>>;
    }

    public dynamicSelect(): SelectedCoronerQuery<SelectQueryRequest<string[]>> {
        return this as unknown as SelectedCoronerQuery<SelectQueryRequest<string[]>>;
    }

    public order<A extends string>(attribute: A, direction: OrderDirection): SelectedCoronerQuery<R> {
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

    public json(): R {
        return this.#request;
    }

    public async post(source?: Partial<QuerySource>): Promise<SelectQueryResponse<R>> {
        if (!this.#request.select) {
            throw new Error('Select query expected.');
        }

        const response = (await this.#executor.execute<RawSelectQueryResponse<R>>(
            this.#request,
            source
        )) as SelectQueryResponse<R>;

        if (response.success) {
            const json = response.json();
            response.first = () => this.#simpleResponseBuilder.first(json.response);
            response.all = () => this.#simpleResponseBuilder.rows(json.response);
        }
        return response;
    }

    protected createInstance(request: R): this {
        return new SelectedCoronerQueryBuilder<R>(request, this.#executor, this.#simpleResponseBuilder) as this;
    }
}
