import { AttributeList } from '../../common/attributes';
import { ICoronerQueryExecutor } from '../../interfaces/ICoronerQueryExecutor';
import { ISelectCoronerSimpleResponseBuilder } from '../../interfaces/responses/ISelectCoronerSimpleResponseBuilder';
import { QuerySource } from '../../models/QuerySource';
import { AddSelect, SelectedCoronerQuery } from '../../queries/select';
import { OrderDirection } from '../../requests';
import { SelectOrder, SelectQueryRequest } from '../../requests/select';
import { RawSelectQueryResponse, SelectQueryResponse } from '../../responses/select';
import { cloneSelectRequest } from '../requests/cloneRequest';
import { CommonCoronerQueryBuilder } from './CommonCoronerQueryBuilder';

export class SelectedCoronerQueryBuilder<AL extends AttributeList, R extends SelectQueryRequest>
    extends CommonCoronerQueryBuilder<AL>
    implements SelectedCoronerQuery<AL, R>
{
    readonly #request: R;
    readonly #attributeList: AttributeList;
    readonly #executor: ICoronerQueryExecutor;
    readonly #simpleResponseBuilder: ISelectCoronerSimpleResponseBuilder;

    constructor(
        request: R,
        attributeList: AttributeList,
        executor: ICoronerQueryExecutor,
        builder: ISelectCoronerSimpleResponseBuilder
    ) {
        super(request);
        this.#request = request;
        this.#attributeList = attributeList;
        this.#executor = executor;
        this.#simpleResponseBuilder = builder;
    }

    public select<A extends string[]>(...attributes: A): SelectedCoronerQuery<AL, AddSelect<R, A>> {
        const request = cloneSelectRequest(this.#request);
        if (!request.select) {
            request.select = attributes;
        } else {
            request.select = [...request.select, ...attributes];
        }

        return this.createInstance(request) as unknown as SelectedCoronerQuery<AL, AddSelect<R, A>>;
    }

    public dynamicSelect(): SelectedCoronerQuery<AL, SelectQueryRequest<string[]>> {
        return this as unknown as SelectedCoronerQuery<AL, SelectQueryRequest<string[]>>;
    }

    public order<A extends string>(attribute: A, direction: OrderDirection): SelectedCoronerQuery<AL, R> {
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
        return new SelectedCoronerQueryBuilder<AL, R>(
            request,
            this.#attributeList,
            this.#executor,
            this.#simpleResponseBuilder
        ) as this;
    }
}
