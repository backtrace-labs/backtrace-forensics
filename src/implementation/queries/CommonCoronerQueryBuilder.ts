import { Attribute, CommonCoronerQuery, QueryObjectValue } from '../../queries/common';
import { FilterOperator, QueryFilter, QueryRequest } from '../../requests/common';
import { cloneRequest } from '../requests/cloneRequest';

export abstract class CommonCoronerQueryBuilder<T extends Attribute> implements CommonCoronerQuery<T> {
    readonly #request: QueryRequest;

    constructor(request: QueryRequest) {
        this.#request = request;
    }

    public limit(count: number): this {
        const request = cloneRequest(this.#request);
        request.limit = count;
        return this.createInstance(request);
    }

    public offset(count: number): this {
        const request = cloneRequest(this.#request);
        request.offset = count;
        return this.createInstance(request);
    }

    public template(template: string): this {
        const request = cloneRequest(this.#request);
        request.template = template;
        return this.createInstance(request);
    }

    public filter<A extends keyof T & string, V extends QueryObjectValue<T, A>>(
        attribute: A,
        operator: FilterOperator<V>,
        value: V
    ): this {
        const request = cloneRequest(this.#request);
        if (!request.filter || !request.filter.length) {
            const filter: QueryFilter = {};
            filter[attribute] = [[operator, value]];
            request.filter = [filter];
        } else if (!request.filter[0][attribute]) {
            request.filter[0][attribute] = [[operator, value]];
        } else {
            request.filter[0][attribute].push([operator, value]);
        }

        return this.createInstance(request);
    }

    public getRequest(): QueryRequest {
        return this.#request;
    }

    protected abstract createInstance(request: QueryRequest): this;
}
