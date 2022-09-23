import { AttributeList, AttributeType, AttributeValueType, CommonAttributes } from '../../common/attributes';
import { CommonCoronerQuery } from '../../queries/common';
import { FilterOperator, QueryAttributeFilter, QueryFilter, QueryRequest } from '../../requests/common';
import { convertInputValue } from '../helpers/convertInputValue';
import { cloneRequest } from '../requests/cloneRequest';

export abstract class CommonCoronerQueryBuilder<AL extends AttributeList> implements CommonCoronerQuery<AL> {
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

    public filter<
        A extends string,
        V extends A extends keyof CommonAttributes ? CommonAttributes[A][2] : AttributeType,
    >(attribute: A, operator: FilterOperator<V>, value: AttributeValueType<V>): this;
    public filter<A extends string>(attribute: A, filters: readonly QueryAttributeFilter[]): this;
    public filter<A extends string>(filters: QueryFilter<A>): this;
    public filter<
        A extends string,
        V extends A extends keyof CommonAttributes ? CommonAttributes[A][2] : AttributeType,
    >(
        attributeOrFilters: A | QueryFilter<A>,
        operatorOrFilters?: FilterOperator<V> | readonly QueryAttributeFilter[],
        value?: AttributeValueType<V>,
    ): this {
        const request = cloneRequest(this.#request);
        if (typeof attributeOrFilters === 'string') {
            const attribute = attributeOrFilters;
            if (typeof operatorOrFilters === 'string') {
                const operator = operatorOrFilters;
                const filterValue = convertInputValue(value ?? null);
                if (!request.filter || !request.filter.length) {
                    const filter: QueryFilter = {};
                    filter[attribute] = [[operator, filterValue]];
                    request.filter = [filter];
                } else if (!request.filter[0][attribute]) {
                    request.filter[0][attribute] = [[operator, filterValue]];
                } else {
                    request.filter[0][attribute] = [...request.filter[0][attribute], [operator, filterValue]];
                }
            } else if (operatorOrFilters) {
                if (!request.filter || !request.filter.length) {
                    request.filter = [{ [attribute]: operatorOrFilters }];
                } else if (!request.filter[0][attribute]) {
                    request.filter[0][attribute] = operatorOrFilters;
                } else {
                    request.filter[0][attribute] = [...request.filter[0][attribute], ...operatorOrFilters];
                }
            }
        } else {
            let instance = this;
            for (const key in attributeOrFilters) {
                instance = this.filter(key, attributeOrFilters[key]);
            }
            return instance;
        }

        return this.createInstance(request);
    }

    public json(): QueryRequest {
        return this.#request;
    }

    protected abstract createInstance(request: QueryRequest): this;
}
