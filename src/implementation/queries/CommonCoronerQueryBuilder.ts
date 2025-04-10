import { Result } from '@backtrace/utils';
import { CommonCoronerQuery, FilterOperator, QueryFilter, QueryRequest, QueryResponse } from '../../coroner/common';
import { AttributeType } from '../../coroner/common/attributes';
import { QuerySource } from '../../models';
import { cloneRequest } from '../requests/cloneRequest';
import { CoronerError } from '../../coroner/common/errors';

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

    public filter<V extends AttributeType>(attribute: string, ...operator: FilterOperator<V>): this;
    public filter<V extends AttributeType>(attribute: string, filters: readonly FilterOperator<V>[]): this;
    public filter(...filters: QueryFilter[]): this;
    public filter(...params: unknown[]): this {
        const singleAttribute = typeof params[0] === 'string'; // params[0] will be a string if filters for a single attribute are passed
        if (!singleAttribute) {
            const filters = params as QueryFilter[];
            let instance = this;
            for (const filter of filters) {
                for (const key in filter) {
                    instance = instance.filter(key, filter[key]);
                }
            }

            return instance;
        }

        const attribute = params[0] as string;
        const singleFilter = typeof params[1] === 'string'; // params[1] will be a string if single filter is passed, or an array if multiple
        if (!singleFilter) {
            const filters = params.slice(1) as readonly FilterOperator[];
            let instance = this;
            for (const filter of filters) {
                instance = instance.filter(attribute, ...filter);
            }

            return instance;
        }

        const filter = params.slice(1) as unknown as FilterOperator;
        const request = cloneRequest(this.#request);
        if (!request.filter || !request.filter.length) {
            request.filter = [
                {
                    [attribute]: [filter],
                },
            ];
        } else if (!request.filter[0][attribute]) {
            request.filter[0][attribute] = [filter];
        } else {
            request.filter[0][attribute] = [...request.filter[0][attribute], filter];
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

    public abstract post(source?: Partial<QuerySource> | undefined): Promise<Result<QueryResponse, Error>>;
    protected abstract createInstance(request: QueryRequest): this;
}
