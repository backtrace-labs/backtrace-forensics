import { CoronerQueryExecutor } from './implementation/CoronerQueryExecutor';
import { FoldCoronerQueryBuilderFactory } from './implementation/factories/FoldCoronerQueryBuilderFactory';
import { SelectCoronerQueryBuilderFactory } from './implementation/factories/SelectCoronerQueryBuilderFactory';
import { NodeCoronerQueryMaker } from './implementation/NodeCoronerQueryMaker';
import { CoronerQueryBuilder } from './implementation/queries/CoronerQueryBuilder';
import { FoldCoronerSimpleResponseBuilder } from './implementation/responses/FoldCoronerSimpleResponseBuilder';
import { SelectCoronerSimpleResponseBuilder } from './implementation/responses/SelectCoronerSimpleResponseBuilder';
import { IFoldCoronerQueryBuilderFactory } from './interfaces/factories/IFoldCoronerQueryBuilderFactory';
import { ISelectCoronerQueryBuilderFactory } from './interfaces/factories/ISelectCoronerQueryBuilderFactory';
import { ICoronerQueryExecutor } from './interfaces/ICoronerQueryExecutor';
import { ICoronerQueryMaker } from './interfaces/ICoronerQueryMaker';
import { QuerySource } from './models/QuerySource';
import { Attribute, CoronerQuery } from './queries/common';
import { QueryRequest } from './requests/common';

export { QuerySource };
export { ICoronerQueryMaker };

export interface BacktraceForensicOptions {
    defaultSource?: Partial<QuerySource>;
    queryMaker?: ICoronerQueryMaker;
}

export class BacktraceForensic {
    public readonly options: BacktraceForensicOptions;

    readonly #executor: ICoronerQueryExecutor;
    readonly #foldFactory: IFoldCoronerQueryBuilderFactory;
    readonly #selectFactory: ISelectCoronerQueryBuilderFactory;

    constructor(options?: Partial<BacktraceForensicOptions>) {
        this.options = this.getDefaultOptions(options);

        this.#executor = new CoronerQueryExecutor(
            this.options.queryMaker ?? new NodeCoronerQueryMaker(),
            this.options.defaultSource
        );
        this.#foldFactory = new FoldCoronerQueryBuilderFactory(this.#executor, new FoldCoronerSimpleResponseBuilder());
        this.#selectFactory = new SelectCoronerQueryBuilderFactory(
            this.#executor,
            new SelectCoronerSimpleResponseBuilder()
        );
    }

    public create<T extends Attribute = Attribute>(request?: QueryRequest): CoronerQuery<T> {
        return new CoronerQueryBuilder(request ?? {}, this.#foldFactory, this.#selectFactory);
    }

    public static create<T extends Attribute = Attribute>(
        options?: Partial<BacktraceForensicOptions>,
        request?: QueryRequest
    ): CoronerQuery<T> {
        return new BacktraceForensic(options).create(request);
    }

    private getDefaultOptions(options?: BacktraceForensicOptions) {
        return Object.assign({}, {}, options);
    }
}
