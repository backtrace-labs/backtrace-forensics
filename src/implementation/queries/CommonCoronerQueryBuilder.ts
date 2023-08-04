import {
    CommonCoronerQuery,
    FilterOperator,
    QueryAttributeFilter,
    QueryFilter,
    QueryRequest,
    QueryResponse
} from '../../coroner/common';
import { AttributeType, AttributeValueType } from '../../coroner/common/attributes';
import { QuerySource } from '../../models';
import { convertInputValue } from '../helpers/convertInputValue';
import { cloneRequest } from '../requests/cloneRequest';

export abstract class CommonCoronerQueryBuilder implements CommonCoronerQuery {
    readonly #request: QueryRequest;

    constructor(request: QueryRequest) {
        this.#request = request;
    }

    public limit(count: number | null | undefined): this {
        const request = cloneRequest(this.#request);
        request.limit = count ?? undefined;
        return this.createInstance(request);
    }

    public offset(count: number | null | undefined): this {
        const request = cloneRequest(this.#request);
        request.offset = count ?? undefined;
        return this.createInstance(request);
    }

    public template(template: string): this {
        const request = cloneRequest(this.#request);
        request.template = template;
        return this.createInstance(request);
    }

    public filter<V extends AttributeType>(
        attribute: string,
        operator: FilterOperator<V>,
        value: AttributeValueType<V>
    ): this;
    public filter(attribute: string, filters: readonly QueryAttributeFilter[]): this;
    public filter(...filters: QueryFilter[]): this;
    public filter<V extends AttributeType>(...params: unknown[]): this {
        const attributeOrFilters = params[0] as string | QueryFilter;
        const operatorOrFilters = params[1] as FilterOperator<V> | readonly QueryAttributeFilter[];
        const value = params[2] as AttributeValueType<V> | undefined;

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
            const filters = params as QueryFilter[];
            let instance = this;
            for (const filter of filters) {
                for (const key in attributeOrFilters) {
                    instance = instance.filter(key, attributeOrFilters[key]);
                }
            }

            return instance;
        }

        return this.createInstance(request);
    }

    public table(name: string): this {
        const request = cloneRequest(this.#request);

        request.table = name;

        return this.createInstance(request);
    }

    public json(): QueryRequest {
        return this.#request;
    }


    public abstract post(source?: Partial<QuerySource> | undefined): Promise<QueryResponse>;
    protected abstract createInstance(request: QueryRequest): this;
}
