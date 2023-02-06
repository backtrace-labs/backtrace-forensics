import { CoronerQuery, QueryRequest } from '../../coroner/common';
import {
    FoldedCoronerQuery,
    FoldQueryRequest,
    FoldVirtualColumnType,
    FoldVirtualColumnTypes,
} from '../../coroner/fold';
import { SelectedCoronerQuery } from '../../coroner/select';
import { ICoronerQueryExecutor } from '../../interfaces';
import { IFoldCoronerQueryBuilderFactory } from '../../interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ISelectCoronerQueryBuilderFactory } from '../../interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { CommonCoronerQueryBuilder } from './CommonCoronerQueryBuilder';

export class CoronerQueryBuilder extends CommonCoronerQueryBuilder implements CoronerQuery {
    readonly #request: QueryRequest;
    readonly #executor: ICoronerQueryExecutor;
    readonly #foldQueryFactory: IFoldCoronerQueryBuilderFactory;
    readonly #selectQueryFactory: ISelectCoronerQueryBuilderFactory;

    constructor(
        request: QueryRequest,
        executor: ICoronerQueryExecutor,
        foldQueryFactory: IFoldCoronerQueryBuilderFactory,
        selectQueryFactory: ISelectCoronerQueryBuilderFactory
    ) {
        super(request, executor);
        this.#request = request;
        this.#executor = executor;
        this.#foldQueryFactory = foldQueryFactory;
        this.#selectQueryFactory = selectQueryFactory;
    }

    public select(...attributes: string[]): SelectedCoronerQuery {
        const query = this.#selectQueryFactory.create(this.#request);
        return query.select(...attributes);
    }

    public fold(attribute?: string, ...fold: any): FoldedCoronerQuery {
        if (!attribute) {
            return this.#foldQueryFactory.create(this.#request as FoldQueryRequest);
        }

        const query = this.#foldQueryFactory.create(this.#request as FoldQueryRequest);
        return query.fold(attribute, ...fold);
    }

    public group(attribute: string): FoldedCoronerQuery {
        const query = this.#foldQueryFactory.create(this.#request as FoldQueryRequest);
        return query.group(attribute);
    }

    public virtualColumn(
        name: string,
        type: FoldVirtualColumnType,
        params: FoldVirtualColumnTypes[keyof FoldVirtualColumnTypes][1]
    ): FoldedCoronerQuery {
        const query = this.#foldQueryFactory.create(this.#request as FoldQueryRequest);
        return query.virtualColumn(name, type, params);
    }

    protected createInstance(request: QueryRequest): this {
        return new CoronerQueryBuilder(
            request,
            this.#executor,
            this.#foldQueryFactory,
            this.#selectQueryFactory
        ) as this;
    }
}
