import { CoronerValueType } from '../common';

export interface SimpleSelectRow {
    readonly values: Readonly<Record<string, CoronerValueType>>;

    select(attribute: string): CoronerValueType;
    trySelect(attribute: string): CoronerValueType | undefined;
}

export interface SimpleSelectRows {
    readonly rows: readonly SimpleSelectRow[];
    readonly total: number;

    select(attribute: string): CoronerValueType[];
    trySelect(attribute: string): CoronerValueType[] | undefined;
}
