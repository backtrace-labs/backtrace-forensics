import { CoronerQueryCreator as CoronerQueryCreatorContract } from '../';
import { Attribute } from '../queries/common';
import { CoronerQueryExecutor } from './CoronerQueryExecutor';
import { CoronerQueryBuilder } from './queries/CoronerQueryBuilder';

export class CoronerQueryCreator implements CoronerQueryCreatorContract {
    readonly #executor: CoronerQueryExecutor;

    constructor(executor: CoronerQueryExecutor) {
        this.#executor = executor;
    }

    public create<T extends Attribute = never>() {
        return new CoronerQueryBuilder<T>({}, this.#executor);
    }
}
