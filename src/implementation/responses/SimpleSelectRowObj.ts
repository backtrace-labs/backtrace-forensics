import { CoronerValueType, SimpleSelectRow } from '../../coroner';

export class SimpleSelectRowObj implements SimpleSelectRow {
    constructor(public readonly values: Readonly<Record<string, CoronerValueType>>) {}

    public select(attribute: string): CoronerValueType {
        if (!(attribute in this.values)) {
            throw new Error(`Attribute "${attribute}" does not exist.`);
        }

        const value = this.trySelect(attribute);
        if (value === undefined) {
            throw new Error(`Value for attribute "${attribute} does not exist.`);
        }

        return value;
    }

    public trySelect(attribute: string): CoronerValueType | undefined {
        return this.values[attribute as keyof typeof this.values];
    }
}
