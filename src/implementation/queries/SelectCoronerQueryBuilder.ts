import { ICoronerQueryExecutor } from '../../interfaces/ICoronerQueryExecutor';
import { ISelectCoronerSimpleResponseBuilder } from '../../interfaces/responses/ISelectCoronerSimpleResponseBuilder';
import { QuerySource } from '../../models/QuerySource';
import { Attribute, JoinAttributes } from '../../queries/common';
import { SelectedCoronerQuery } from '../../queries/select';
import { CoronerValueType, QueryRequest } from '../../requests/common';
import { SelectQueryRequest } from '../../requests/select';
import { CoronerResponse } from '../../responses/common';
import { SelectQueryResponse } from '../../responses/select';
import { cloneSelectRequest } from '../requests/cloneRequest';
import { CommonCoronerQueryBuilder } from './CommonCoronerQueryBuilder';

export class SelectedCoronerQueryBuilder<T extends Attribute, S extends string[] = []>
    extends CommonCoronerQueryBuilder<T>
    implements SelectedCoronerQuery<T, S>
{
    readonly #request: SelectQueryRequest<T, S>;
    readonly #executor: ICoronerQueryExecutor;
    readonly #simpleResponseBuilder: ISelectCoronerSimpleResponseBuilder;

    constructor(
        request: SelectQueryRequest<T, S>,
        executor: ICoronerQueryExecutor,
        builder: ISelectCoronerSimpleResponseBuilder
    ) {
        super(request);
        this.#request = request;
        this.#executor = executor;
        this.#simpleResponseBuilder = builder;
    }

    public select<A extends string>(): SelectedCoronerQuery<T, A[]>;
    public select<V extends CoronerValueType, A extends string>(
        ...attributes: A[]
    ): SelectedCoronerQuery<JoinAttributes<T, A, V>, [...S, A]>;
    public select<V extends CoronerValueType, A extends string>(
        ...attributes: string[]
    ): SelectedCoronerQuery<T, A[]> | SelectedCoronerQuery<JoinAttributes<T, A, V>, [...S, A]> {
        if (!attributes || !attributes.length) {
            return this as unknown as SelectedCoronerQuery<T, A[]>;
        }

        const attributesToAdd = attributes.filter((a) => !this.#request.select?.includes(a));
        if (!attributesToAdd.length) {
            return this as unknown as SelectedCoronerQuery<JoinAttributes<T, A, V>, [...S, A]>;
        }

        const request = cloneSelectRequest<T, [...S, A]>(this.#request);
        if (!request.select) {
            request.select = attributesToAdd as unknown as [...S, A];
        } else {
            request.select.push(...attributesToAdd);
        }

        return this.createInstance(request) as unknown as SelectedCoronerQuery<JoinAttributes<T, A, V>, [...S, A]>;
    }

    public async getResponse(source?: Partial<QuerySource>): Promise<CoronerResponse<SelectQueryResponse<T, S>>> {
        if (!this.#request.select) {
            throw new Error('Select query expected.');
        }

        const response = await this.#executor.execute<SelectQueryResponse<T, S>>(this.#request, source);
        if (!response.error) {
            response.response.first = () => this.#simpleResponseBuilder.first(response.response);
            response.response.toArray = () => this.#simpleResponseBuilder.toArray(response.response);
        }
        return response;
    }

    protected createInstance(request: QueryRequest): this {
        return new SelectedCoronerQueryBuilder<T, S>(request, this.#executor, this.#simpleResponseBuilder) as this;
    }
}
