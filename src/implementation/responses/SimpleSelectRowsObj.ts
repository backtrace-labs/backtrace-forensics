import { Result } from '@backtrace/utils';
import { CoronerValueType, SimpleSelectRow, SimpleSelectRows } from '../../coroner';

export class SimpleSelectRowsObj implements SimpleSelectRows {
    constructor(public readonly rows: readonly SimpleSelectRow[], public readonly total: number) {}

    public select(attribute: string): CoronerValueType[] {
        return Result.unwrap(this.trySelect(attribute));
    }

    public trySelect(attribute: string): Result<CoronerValueType[], Error> {
        return Result.flat(this.rows.map((r) => r.trySelect(attribute)));
    }
}
