import { SelectOfRequest } from '../../queries';
import { CoronerValueType, SelectQueryRequest } from '../../requests';

export interface SimpleSelectRow<R extends SelectQueryRequest> {
    values: { [A in SelectOfRequest<R>[number]]: CoronerValueType };

    select(attribute: SelectOfRequest<R>[number]): CoronerValueType;
    trySelect(attribute: SelectOfRequest<R>[number]): CoronerValueType;
    trySelect(attribute: string): CoronerValueType | undefined;
}

export interface SimpleSelectRows<R extends SelectQueryRequest> {
    rows: SimpleSelectRow<R>[];

    select(attribute: SelectOfRequest<R>[number]): CoronerValueType[];
    trySelect(attribute: SelectOfRequest<R>[number]): CoronerValueType[] | undefined;
    trySelect(attribute: string): CoronerValueType[] | undefined;
}
