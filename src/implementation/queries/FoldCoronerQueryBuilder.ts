import { format } from 'util';
import { ICoronerQueryExecutor } from '../../interfaces/ICoronerQueryExecutor';
import { IFoldCoronerSimpleResponseBuilder } from '../../interfaces/responses/IFoldCoronerSimpleResponseBuilder';
import { QuerySource } from '../../models/QuerySource';
import { AddFold, FoldedCoronerQuery, SetFoldGroup } from '../../queries/fold';
import { CoronerValueType, OrderDirection } from '../../requests/common';
import { CountFoldOrder, FoldOperator, FoldOrder, FoldQueryRequest, Folds, GetRequestFold } from '../../requests/fold';
import { FoldQueryResponse, RawFoldQueryResponse } from '../../responses/fold';
import { cloneFoldRequest } from '../requests/cloneRequest';
import { CommonCoronerQueryBuilder } from './CommonCoronerQueryBuilder';

export class FoldedCoronerQueryBuilder<R extends FoldQueryRequest = FoldQueryRequest<never, ['*']>>
    extends CommonCoronerQueryBuilder
    implements FoldedCoronerQuery<R>
{
    readonly #request: R;
    readonly #executor: ICoronerQueryExecutor;
    readonly #simpleResponseBuilder: IFoldCoronerSimpleResponseBuilder;

    constructor(request: R, executor: ICoronerQueryExecutor, builder: IFoldCoronerSimpleResponseBuilder) {
        super(request);
        this.#request = request;
        this.#executor = executor;
        this.#simpleResponseBuilder = builder;
    }

    public fold<A extends string, V extends CoronerValueType, O extends FoldOperator<V>>(
        attribute: A,
        ...fold: O
    ): FoldedCoronerQuery<AddFold<R, A, O>> {
        const request = cloneFoldRequest(this.#request);

        if (!request.fold) {
            request.fold = {};
        }

        if (request.fold[attribute]) {
            request.fold[attribute] = [...request.fold[attribute], fold];
        } else {
            request.fold[attribute] = [fold];
        }

        return this.createInstance(request) as unknown as FoldedCoronerQuery<AddFold<R, A, O>>;
    }

    public dynamicFold(): FoldedCoronerQuery<FoldQueryRequest<Folds>> {
        return this as FoldedCoronerQuery<FoldQueryRequest<Folds>>;
    }

    public group<A extends string>(attribute: A): FoldedCoronerQuery<SetFoldGroup<R, A>> {
        const request = cloneFoldRequest(this.#request);
        if (attribute === '*') {
            request.group = undefined;
        } else {
            request.group = [attribute];
        }

        return this.createInstance(request) as unknown as FoldedCoronerQuery<SetFoldGroup<R, A>>;
    }

    public order<F extends GetRequestFold<R>, A extends keyof F & string, I extends number>(
        attribute: A,
        direction: OrderDirection,
        index: I
    ): FoldedCoronerQuery<R>;
    public order<F extends GetRequestFold<R>, A extends keyof F & string, O extends F[A][number]>(
        attribute: A,
        direction: OrderDirection,
        ...fold: O
    ): FoldedCoronerQuery<R>;
    public order(
        attribute: string,
        direction: OrderDirection,
        ...foldOrIndex: [number] | FoldOperator
    ): FoldedCoronerQuery<R> {
        let index: number;
        if (typeof foldOrIndex[0] === 'number') {
            index = foldOrIndex[0];
        } else {
            const attributeFolds = this.#request.fold && this.#request.fold[attribute];
            if (!attributeFolds) {
                throw new Error(`Attribute ${attribute} was not folded before.`);
            }

            index = attributeFolds.findIndex((d) => {
                for (let i = 0; i < d.length; i++) {
                    if (d[i] !== foldOrIndex[i]) {
                        return false;
                    }
                }

                return true;
            });

            if (index === -1) {
                throw new Error(`Attribute ${attribute} is not folded on ${format(foldOrIndex)}.`);
            }
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

    public orderByCount(direction: OrderDirection): FoldedCoronerQuery<R> {
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

    public json(): R {
        return this.#request;
    }

    public async post(source?: Partial<QuerySource>): Promise<FoldQueryResponse<R>> {
        if (!this.#request.fold && !this.#request.group) {
            throw new Error('Fold or group query expected.');
        }

        const response = (await this.#executor.execute<RawFoldQueryResponse<R>>(
            this.#request,
            source
        )) as FoldQueryResponse<R>;

        if (response.success) {
            const json = response.json();
            response.first = () => this.#simpleResponseBuilder.first(json.response, this.#request);
            response.all = () => this.#simpleResponseBuilder.rows(json.response, this.#request);
        }
        return response;
    }

    protected createInstance(request: R): this {
        return new FoldedCoronerQueryBuilder<R>(request, this.#executor, this.#simpleResponseBuilder) as this;
    }
}
