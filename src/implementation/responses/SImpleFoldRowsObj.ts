import { CoronerValueType, FoldOperator, SimpleFoldRow, SimpleFoldRows, SimpleFoldValue } from '../../coroner';

export class SimpleFoldRowsObj implements SimpleFoldRows {
    constructor(public readonly rows: readonly SimpleFoldRow[], public readonly total: number) {}

    public fold<O extends FoldOperator>(attribute: string, ...fold: O): SimpleFoldValue<O[0]>[] {
        return this.rows.map((r) => r.fold(attribute, ...fold));
    }

    public tryFold<O extends FoldOperator>(attribute: string, ...fold: O) {
        const result = this.rows.map((r) => r.tryFold(attribute, ...fold));
        if (result.some((r) => r === undefined)) {
            // all overloads accept undefined as return param, but TS fails for some reason
            return undefined as any;
        }

        return result;
    }

    public group(attribute?: string | undefined): CoronerValueType[] | '*'[] {
        const group = this.tryGroup(attribute);
        if (!group) {
            throw new Error(`Attribute "${attribute}" does not exist or wasn't grouped on.`);
        }

        return group;
    }

    public tryGroup(attribute?: string | undefined) {
        const result = this.rows.map((r) => r.tryGroup(attribute));
        if (result.some((r) => r === undefined)) {
            // all overloads accept undefined as return param, but TS fails for some reason
            return undefined as any;
        }

        return result;
    }
}
