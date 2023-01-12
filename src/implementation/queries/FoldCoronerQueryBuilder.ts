import { format } from 'util';
import { AttributeList, AttributeValueType } from '../../common/attributes';
import { ICoronerQueryExecutor } from '../../interfaces/ICoronerQueryExecutor';
import { IFoldCoronerSimpleResponseBuilder } from '../../interfaces/responses/IFoldCoronerSimpleResponseBuilder';
import { QuerySource } from '../../models/QuerySource';
import {
    AddFold,
    AddVirtualColumn,
    FoldedCoronerQuery,
    FoldFilterInput,
    FoldFilterOperatorInput,
    SetFoldGroup,
} from '../../queries/fold';
import { nextPage, OrderDirection } from '../../requests/common';
import {
    CountFoldOrder,
    FoldFilter,
    FoldFilterParamOperator,
    FoldOperator,
    FoldOrder,
    FoldQueryRequest,
    Folds,
    FoldVirtualColumn,
    FoldVirtualColumnType,
    FoldVirtualColumnTypes,
    GetRequestFold,
    GroupFoldOrder,
} from '../../requests/fold';
import { FoldQueryResponse, RawFoldQueryResponse } from '../../responses/fold';
import { cloneFoldRequest } from '../requests/cloneRequest';
import { CommonCoronerQueryBuilder } from './CommonCoronerQueryBuilder';

export class FoldedCoronerQueryBuilder<
        AL extends AttributeList,
        R extends FoldQueryRequest = FoldQueryRequest<never, ['*']>
    >
    extends CommonCoronerQueryBuilder<AL>
    implements FoldedCoronerQuery<AL, R>
{
    readonly #request: R;
    readonly #attributeList: AL;
    readonly #executor: ICoronerQueryExecutor;
    readonly #simpleResponseBuilder: IFoldCoronerSimpleResponseBuilder;

    constructor(
        request: R,
        attributeList: AL,
        executor: ICoronerQueryExecutor,
        builder: IFoldCoronerSimpleResponseBuilder
    ) {
        super(request);
        this.#request = request;
        this.#attributeList = attributeList;
        this.#executor = executor;
        this.#simpleResponseBuilder = builder;
    }

    public fold<A extends string, O extends FoldOperator>(
        attribute: string,
        ...fold: FoldOperator
    ): FoldedCoronerQuery<AL, AddFold<R, A, O>> {
        const request = cloneFoldRequest(this.#request);

        if (!request.fold) {
            request.fold = {};
        }

        if (request.fold[attribute]) {
            request.fold[attribute] = [...request.fold[attribute], fold];
        } else {
            request.fold[attribute] = [fold];
        }

        return this.createInstance(request) as unknown as FoldedCoronerQuery<AL, AddFold<R, A, O>>;
    }

    public dynamicFold(): FoldedCoronerQuery<AL, FoldQueryRequest<Folds>> {
        return this as FoldedCoronerQuery<AL, FoldQueryRequest<Folds>>;
    }

    public group<A extends string>(attribute: A): FoldedCoronerQuery<AL, SetFoldGroup<R, A>> {
        const request = cloneFoldRequest(this.#request);
        if (attribute === '*') {
            request.group = undefined;
        } else {
            request.group = [attribute];
        }

        return this.createInstance(request) as unknown as FoldedCoronerQuery<AL, SetFoldGroup<R, A>>;
    }

    public order<F extends GetRequestFold<R>, A extends keyof F & string, I extends number>(
        attribute: A,
        direction: OrderDirection,
        index: I
    ): FoldedCoronerQuery<AL, R>;
    public order<F extends GetRequestFold<R>, A extends keyof F & string, O extends F[A][number]>(
        attribute: A,
        direction: OrderDirection,
        ...fold: O
    ): FoldedCoronerQuery<AL, R>;
    public order(
        attribute: string,
        direction: OrderDirection,
        ...foldOrIndex: [number] | FoldOperator
    ): FoldedCoronerQuery<AL, R> {
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

    public orderByCount(direction: OrderDirection): FoldedCoronerQuery<AL, R> {
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
    ): FoldedCoronerQuery<AL, R> {
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

    public havingCount<O extends FoldFilterOperatorInput>(operator: O, value: number): FoldedCoronerQuery<AL, R> {
        const op = this.getFoldFilterOperator(operator);

        let request = cloneFoldRequest(this.#request);
        request = this.addHaving(request, {
            op,
            params: [value],
            property: [';count'],
        });

        return this.createInstance(request);
    }

    public orderByGroup(direction: OrderDirection): FoldedCoronerQuery<AL, R> {
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
    ): FoldedCoronerQuery<AL, AddVirtualColumn<R, FoldVirtualColumn>> {
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

        return this.createInstance(request) as unknown as FoldedCoronerQuery<
            AL,
            AddVirtualColumn<R, FoldVirtualColumn>
        >;
    }

    private addHaving(request: R, foldFilter: FoldFilter): R {
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

    public json(): R {
        return this.#request;
    }

    public async post(source?: Partial<QuerySource>): Promise<FoldQueryResponse<R, this>> {
        if (!this.#request.fold && !this.#request.group) {
            throw new Error('Fold or group query expected.');
        }

        const response = await this.#executor.execute<RawFoldQueryResponse<R>>(this.#request, source);
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

    protected createInstance(request: R): this {
        return new FoldedCoronerQueryBuilder<AL, R>(
            request,
            this.#attributeList,
            this.#executor,
            this.#simpleResponseBuilder
        ) as this;
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
            throw new Error(`Attribute ${attribute} is not folded on ${format(operator)}.`);
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
