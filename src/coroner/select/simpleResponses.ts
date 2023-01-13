import { CoronerValueType } from '../common';

export interface SimpleSelectRow {
    values: Record<string, CoronerValueType>;

    select(attribute: string): CoronerValueType;
    trySelect(attribute: string): CoronerValueType | undefined;
}

export interface SimpleSelectRows {
    rows: SimpleSelectRow[];

    select(attribute: string): CoronerValueType[];
    trySelect(attribute: string): CoronerValueType[] | undefined;
}
