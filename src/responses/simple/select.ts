import { CoronerValueType, SelectQueryRequest } from '../../requests';

export interface SimpleSelectRow<R extends SelectQueryRequest> {
    values: { [A in NonNullable<R['select']>[number]]: CoronerValueType };

    select(attribute: NonNullable<R['select']>[number]): CoronerValueType;
    trySelect(attribute: NonNullable<R['select']>[number]): CoronerValueType;
    trySelect(attribute: string): CoronerValueType | undefined;
}

export interface SimpleSelectRows<R extends SelectQueryRequest> {
    rows: SimpleSelectRow<R>[];

    select(attribute: NonNullable<R['select']>[number]): CoronerValueType[];
    trySelect(attribute: NonNullable<R['select']>[number]): CoronerValueType[] | undefined;
    trySelect(attribute: string): CoronerValueType[] | undefined;
}
