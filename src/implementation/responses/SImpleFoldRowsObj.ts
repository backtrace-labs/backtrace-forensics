import { Result } from '@backtrace/utils';
import {
    CoronerValueType,
    DefaultGroup,
    FoldOperator,
    SimpleFoldRow,
    SimpleFoldRows,
    SimpleFoldValue,
} from '../../coroner';

export class SimpleFoldRowsObj implements SimpleFoldRows {
    constructor(public readonly rows: readonly SimpleFoldRow[], public readonly total: number) {}

    public fold<O extends FoldOperator>(attribute: string, ...fold: O): SimpleFoldValue<O[0]>[] {
        return Result.unwrap(this.tryFold(attribute, ...fold));
    }

    public tryFold<O extends FoldOperator>(attribute: string, ...fold: O): Result<SimpleFoldValue<O[0]>[], Error> {
        const result = this.rows.map((r) => r.tryFold(attribute, ...fold));
        return Result.flat(result);
    }

    public group(attribute?: string | undefined): CoronerValueType[] | '*'[] {
        return Result.unwrap(this.tryGroup(attribute));
    }

    public tryGroup(attribute?: string | undefined): Result<CoronerValueType[] | DefaultGroup[], Error> {
        const result = this.rows.map((r) => r.tryGroup(attribute));
        return Result.flat(result);
    }
}
