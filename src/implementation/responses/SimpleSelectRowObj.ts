import { Result } from '@backtrace/utils';
import { CoronerValueType, SimpleSelectRow } from '../../coroner';
import { NoAttributeError } from '../../common/errors';

export class SimpleSelectRowObj implements SimpleSelectRow {
    constructor(public readonly values: Readonly<Record<string, CoronerValueType>>) {}

    public select(attribute: string): CoronerValueType {
        return Result.unwrap(this.trySelect(attribute));
    }

    public trySelect(attribute: string): Result<CoronerValueType, Error> {
        if (!(attribute in this.values)) {
            return Result.err(new NoAttributeError(attribute));
        }

        const value = this.values[attribute];
        return Result.ok(value);
    }
}
