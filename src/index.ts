import { DynamicCoronerQuery, QueryObject, StaticCoronerQuery } from './queries/common';
import { FoldedCoronerQueryExecutor } from './queries/fold';
import { SelectedCoronerQueryExecutor } from './queries/select';

export interface CoronerQueryCreator {
    create<T extends QueryObject<T> = never>(): [T] extends [never] ? DynamicCoronerQuery : StaticCoronerQuery<T>;
    createStatic<T extends QueryObject<T>>(): StaticCoronerQuery<T>;
}

export type CoronerQuery = FoldedCoronerQueryExecutor & SelectedCoronerQueryExecutor & CoronerQueryCreator;
