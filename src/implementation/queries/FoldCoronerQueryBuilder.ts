import { format } from 'util';
import { nextPage, OrderDirection } from '../../coroner/common';
import { AttributeValueType } from '../../coroner/common/attributes';
import {
    CountFoldOrder,
    FoldedCoronerQuery,
    FoldFilter,
    FoldFilterInput,
    FoldFilterOperatorInput,
    FoldFilterParamOperator,
    FoldOperator,
    FoldOrder,
    FoldQueryRequest,
    FoldQueryResponse,
    FoldVirtualColumn,
    FoldVirtualColumnType,
    FoldVirtualColumnTypes,
    GroupFoldOrder,
    RawFoldQueryResponse,
} from '../../coroner/fold';
import { ICoronerQueryExecutor } from '../../interfaces/ICoronerQueryExecutor';
import { IFoldCoronerSimpleResponseBuilder } from '../../interfaces/responses/IFoldCoronerSimpleResponseBuilder';
import { QuerySource } from '../../models/QuerySource';
import { foldStartsWith } from '../helpers/foldsEqual';
import { cloneFoldRequest } from '../requests/cloneRequest';
import { CommonCoronerQueryBuilder } from './CommonCoronerQueryBuilder';

export class FoldedCoronerQueryBuilder extends CommonCoronerQueryBuilder implements FoldedCoronerQuery {
    readonly #request: FoldQueryRequest;
    readonly #executor: ICoronerQueryExecutor;
    readonly #simpleResponseBuilder: IFoldCoronerSimpleResponseBuilder;

    constructor(
        request: FoldQueryRequest,
        executor: ICoronerQueryExecutor,
        builder: IFoldCoronerSimpleResponseBuilder
    ) {
        super(request, executor);
        this.#request = request;
        this.#executor = executor;
        this.#simpleResponseBuilder = builder;
    }

    public fold(attribute?: string, ...fold: FoldOperator): this {
        if (!attribute) {
            return this;
        }

        const request = cloneFoldRequest(this.#request);

        if (!request.fold) {
            request.fold = {};
        }

        if (request.fold[attribute]) {
            request.fold[attribute] = [...request.fold[attribute], fold];
        } else {
            request.fold[attribute] = [fold];
        }

        return this.createInstance(request);
    }

    public removeFold(attribute: string, ...foldToRemove: Partial<FoldOperator>): this {
        const request = cloneFoldRequest(this.#request);
        if (!request.fold?.[attribute]) {
            return this.createInstance(request);
        }

        const newFold: FoldOperator[] = [];
        for (const fold of request.fold[attribute]) {
            if (!foldStartsWith(fold, foldToRemove)) {
                newFold.push(fold);
            }
        }

        if (newFold.length) {
            request.fold[attribute] = newFold;
        } else {
            delete request.fold[attribute];
        }

        return this.createInstance(request);
    }

    public group(attribute: string): FoldedCoronerQuery {
        const request = cloneFoldRequest(this.#request);
        if (attribute === '*') {
            request.group = undefined;
        } else {
            request.group = [attribute];
        }

        return this.createInstance(request);
    }

    public order(attribute: string, direction: OrderDirection, ...foldOrIndex: [number] | FoldOperator): this {
        let index: number;
        if (typeof foldOrIndex[0] === 'number') {
            index = foldOrIndex[0];
        } else {
            index = this.findAttributeFoldIndex(attribute, foldOrIndex as FoldOperator);
        }

        const request = cloneFoldRequest(this.#request);

        const order: FoldOrder = {
            name: `${attribute};${index}`,
            ordering: direction,
        };

        if (request.order) {
            request.order = [...request.order, order];
        } else {
            request.order = [order];
        }

        return this.createInstance(request);
    }

    public orderByCount(direction: OrderDirection): this {
        const request = cloneFoldRequest(this.#request);

        const order: CountFoldOrder = {
            name: ';count',
            ordering: direction,
        };

        if (request.order) {
            request.order = [...request.order, order];
        } else {
            request.order = [order];
        }

        return this.createInstance(request);
    }

    public having(
        attribute: string,
        foldOrIndex: number | FoldOperator,
        operator: FoldFilterOperatorInput,
        valueIndexOrValue: number | FoldFilterInput<FoldOperator>,
        value?: unknown
    ): this {
        let index: number;
        if (typeof foldOrIndex === 'number') {
            index = foldOrIndex;
        } else {
            index = this.findAttributeFoldIndex(attribute, foldOrIndex as FoldOperator);
        }

        const op = this.getFoldFilterOperator(operator);

        let values: [number, unknown][] = [];
        // If value is undefined, this must mean that valueIndexOrValue is a fold-specific filter
        if (value === undefined) {
            values = this.getFoldFilterValues(valueIndexOrValue);
        } else {
            values = [[valueIndexOrValue as number, value]];
        }

        let request = cloneFoldRequest(this.#request);
        for (const [valueIndex, value] of values) {
            request = this.addHaving(request, {
                op,
                params: [value as AttributeValueType],
                property: [`${attribute};${index};${valueIndex}`],
            });
        }

        return this.createInstance(request);
    }

    public havingCount<O extends FoldFilterOperatorInput>(operator: O, value: number): this {
        const op = this.getFoldFilterOperator(operator);

        let request = cloneFoldRequest(this.#request);
        request = this.addHaving(request, {
            op,
            params: [value],
            property: [';count'],
        });

        return this.createInstance(request);
    }

    public orderByGroup(direction: OrderDirection): this {
        const request = cloneFoldRequest(this.#request);

        const order: GroupFoldOrder = {
            name: ';group',
            ordering: direction,
        };

        if (request.order) {
            request.order = [...request.order, order];
        } else {
            request.order = [order];
        }

        return this.createInstance(request);
    }

    public virtualColumn(
        name: string,
        type: FoldVirtualColumnType,
        params: FoldVirtualColumnTypes[keyof FoldVirtualColumnTypes][1]
    ): this {
        const request = cloneFoldRequest(this.#request);

        const virtualColumn = {
            name,
            type,
            [type]: params,
        } as FoldVirtualColumn;

        if (request.virtual_columns) {
            request.virtual_columns = [...request.virtual_columns, virtualColumn];
        } else {
            request.virtual_columns = [virtualColumn];
        }

        return this.createInstance(request);
    }

    private addHaving(request: FoldQueryRequest, foldFilter: FoldFilter): FoldQueryRequest {
        if (!request.having || request.having.length === 0) {
            request.having = [foldFilter];
        } else {
            request.having = [
                ...request.having,
                foldFilter,
                {
                    op: 'boolean',
                    params: ['and'],
                },
            ];
        }

        return request;
    }

    public json(): FoldQueryRequest {
        return this.#request;
    }

    public async post(source?: Partial<QuerySource>): Promise<FoldQueryResponse> {
        const response = await this.#executor.execute<RawFoldQueryResponse>(this.#request, source);
        if (response.error) {
            return {
                success: false,
                json: () => response,
            };
        }

        return {
            success: true,
            json: () => response,
            first: () => this.#simpleResponseBuilder.first(response.response, this.#request),
            all: () => this.#simpleResponseBuilder.rows(response.response, this.#request),
            nextPage: () => {
                const request = nextPage(this.#request, response);
                return this.createInstance(request);
            },
        };
    }

    protected createInstance(request: FoldQueryRequest): this {
        return new FoldedCoronerQueryBuilder(request, this.#executor, this.#simpleResponseBuilder) as this;
    }

    private findAttributeFoldIndex(attribute: string, operator: FoldOperator) {
        const attributeFolds = this.#request.fold && this.#request.fold[attribute];
        if (!attributeFolds) {
            throw new Error(`Attribute ${attribute} was not folded before.`);
        }

        const index = attributeFolds.findIndex((d) => {
            for (let i = 0; i < d.length; i++) {
                if (d[i] !== operator[i]) {
                    return false;
                }
            }

            return true;
        });

        if (index === -1) {
            throw new Error(`Attribute ${attribute} is not folded on ${JSON.stringify(operator)}.`);
        }

        return index;
    }

    private getFoldFilterOperator(operator: FoldFilterOperatorInput): FoldFilterParamOperator {
        switch (operator) {
            case 'equal':
                return '==';
            case 'not-equal':
                return '!=';
            case 'greater-than':
                return '>';
            case 'less-than':
                return '<';
            case 'at-least':
                return '>=';
            case 'at-most':
                return '<=';
            default:
                return operator;
        }
    }

    private getFoldFilterValues(foldFilterInput: FoldFilterInput): [number, unknown][] {
        if (foldFilterInput == null) {
            return [];
        }

        const result: [number, unknown][] = [];
        if (typeof foldFilterInput === 'object') {
            if ('from' in foldFilterInput || 'to' in foldFilterInput) {
                if (foldFilterInput.from !== undefined) {
                    result.push([0, foldFilterInput.from]);
                }
                if (foldFilterInput.to !== undefined) {
                    result.push([1, foldFilterInput.to]);
                }
            } else if ('keys' in foldFilterInput || 'tail' in foldFilterInput) {
                if (foldFilterInput.keys !== undefined) {
                    result.push([0, foldFilterInput.keys]);
                }
                if (foldFilterInput.tail !== undefined) {
                    result.push([1, foldFilterInput.tail]);
                }
            }
        } else {
            result.push([0, foldFilterInput]);
        }

        return result;
    }
}
