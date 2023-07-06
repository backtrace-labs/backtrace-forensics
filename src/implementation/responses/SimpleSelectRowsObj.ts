import { CoronerValueType, SimpleSelectRow, SimpleSelectRows } from '../../coroner';

export class SimpleSelectRowsObj implements SimpleSelectRows {
    constructor(public readonly rows: readonly SimpleSelectRow[], public readonly total: number) {}

    public select(attribute: string): CoronerValueType[] {
        return this.rows.map((r) => r.select(attribute));
    }

    public trySelect(attribute: string): CoronerValueType[] | undefined {
        const result = this.rows.map((r) => r.trySelect(attribute));
        if (result.some((r) => r === undefined)) {
            return undefined as any;
        }

        return result as CoronerValueType[];
    }
}
