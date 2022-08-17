import { Attribute, JoinAttributes } from '../../queries/common';
import { SelectedCoronerQuery } from '../../queries/select';
import { CommonQueryRequest, CoronerValueType } from '../../requests/common';
import { SelectQueryRequest } from '../../requests/select';
import { CoronerResponse } from '../../responses/common';
import { SelectQueryResponse } from '../../responses/select';
import { CoronerQueryExecutor } from '../CoronerQueryExecutor';
import { cloneSelectRequest } from './cloneRequest';
import { CommonCoronerQueryBuilder } from './CommonCoronerQueryBuilder';

export class SelectedCoronerQueryBuilder<T extends Attribute<string, CoronerValueType>, S extends string[] = []>
    extends CommonCoronerQueryBuilder<T>
    implements SelectedCoronerQuery<T, S>
{
    readonly #request: SelectQueryRequest<T, S>;
    readonly #executor: CoronerQueryExecutor;

    constructor(request: SelectQueryRequest<T, S>, executor: CoronerQueryExecutor) {
        super(request);
        this.#request = request;
        this.#executor = executor;
    }

    public select<A extends string>(): SelectedCoronerQuery<T, A[]>;
    public select<V extends CoronerValueType, A extends string>(
        attribute: A
    ): SelectedCoronerQuery<JoinAttributes<T, A, V>, [...S, A]>;
    public select<V extends CoronerValueType, A extends string>(
        attribute?: string
    ): SelectedCoronerQuery<T, A[]> | SelectedCoronerQuery<JoinAttributes<T, A, V>, [...S, A]> {
        if (!attribute) {
            return this as unknown as SelectedCoronerQuery<T, A[]>;
        }

        const request = cloneSelectRequest<T, [...S, A]>(this.#request);
        if (!request.select) {
            request.select = [attribute] as unknown as [...S, A];
        } else {
            request.select.push(attribute);
        }

        return this.createInstance(request) as unknown as SelectedCoronerQuery<JoinAttributes<T, A, V>, [...S, A]>;
    }

    public getResponse(): Promise<CoronerResponse<SelectQueryResponse<T, S>>> {
        return this.#executor.execute(this.#request);
    }

    protected createInstance(request: CommonQueryRequest): this {
        return new SelectedCoronerQueryBuilder<T, S>(request, this.#executor) as this;
    }
}
