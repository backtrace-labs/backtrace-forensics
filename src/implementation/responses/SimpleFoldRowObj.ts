import { CoronerValueType, FoldOperator, SimpleFoldAttributes, SimpleFoldRow, SimpleFoldValue } from '../../coroner';

export class SimpleFoldRowObj implements SimpleFoldRow {
    constructor(public readonly attributes: Readonly<SimpleFoldAttributes>, public readonly count: number) {}

    public fold<O extends FoldOperator>(attribute: string, ...fold: O): SimpleFoldValue<O[0]> {
        const result = this.tryFold(attribute, ...fold);
        if (result === undefined) {
            throw new Error(`Attribute "${attribute}" or fold ${JSON.stringify(fold)} does not exist.`);
        }
        return result;
    }

    public tryFold<O extends FoldOperator>(attribute: string, ...fold: O): SimpleFoldValue<O[0]> | undefined {
        const result = this.filterFolds(attribute, ...fold);
        if (result.length > 1) {
            throw new Error(
                'Ambiguous results found. This can happen when there are two columns with the same fold operator. ' +
                    'Try providing the built request to the simple response builder.',
            );
        }

        return result[0] as SimpleFoldValue<O[0]> | undefined;
    }

    public group(attribute?: string | undefined): CoronerValueType {
        const result = this.tryGroup(attribute);
        if (result === undefined) {
            throw new Error(`Attribute "${attribute}" does not exist or wasn't grouped on.`);
        }
        return result;
    }

    public tryGroup(attribute?: string | undefined): CoronerValueType | undefined {
        if (attribute === '*') {
            attribute = undefined;
        }

        for (const key in this.attributes) {
            if (attribute != null && key !== attribute) {
                continue;
            }

            const attributeValues = this.attributes[key];
            if ('groupKey' in attributeValues) {
                return attributeValues.groupKey;
            }
        }

        if (!attribute) {
            return '*';
        }

        return undefined;
    }

    private filterFolds(attribute: string, ...search: FoldOperator): SimpleFoldValue[] {
        const result: SimpleFoldValue[] = [];
        if (!this.attributes[attribute] || !this.attributes[attribute][search[0]]) {
            return result;
        }

        const searchKey = search.join(';');
        const folds = this.attributes[attribute][search[0]];
        if (!folds) {
            return [];
        }

        for (const fold of folds) {
            const foldKey = fold.rawFold.join(';');

            // Exact match, return the value
            if (searchKey === foldKey) {
                return [fold.value];
            }

            // Partial match, add and continue
            if (searchKey.startsWith(foldKey)) {
                result.push(fold.value);
            }
        }

        return result;
    }
}
