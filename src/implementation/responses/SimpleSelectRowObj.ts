import { Result } from '@backtrace/utils';
import { CoronerValueType, SimpleSelectRow } from '../../coroner';

export class SimpleSelectRowObj implements SimpleSelectRow {
    constructor(public readonly values: Readonly<Record<string, CoronerValueType>>) {}

    public select(attribute: string): CoronerValueType {
        return Result.unwrap(this.trySelect(attribute));
    }

    public trySelect(attribute: string): Result<CoronerValueType, Error> {
        if (!(attribute in this.values)) {
            return Result.err(new Error(`Attribute "${attribute}" does not exist.`));
        }

        const value = this.values[attribute as keyof typeof this.values];
        if (value === undefined) {
            return Result.err(new Error(`Value for attribute "${attribute} does not exist.`));
        }

        return Result.ok(value);
    }
}
