import { Result } from '@backtrace/utils';
import { CoronerValueType, FoldOperator, SimpleFoldAttributes, SimpleFoldRow, SimpleFoldValue } from '../../coroner';
import { AmbiguousFoldError, AttributeNotFoldedError, AttributeNotGroupedError } from '../../common/errors';

export class SimpleFoldRowObj implements SimpleFoldRow {
    constructor(public readonly attributes: Readonly<SimpleFoldAttributes>, public readonly count: number) {}

    public fold<O extends FoldOperator>(attribute: string, ...fold: O): SimpleFoldValue<O[0]> {
        return Result.unwrap(this.tryFold(attribute, ...fold));
    }

    public tryFold<O extends FoldOperator>(attribute: string, ...fold: O): Result<SimpleFoldValue<O[0]>, Error> {
        const result = this.filterFolds(attribute, ...fold);
        if (result.length > 1) {
            return Result.err(new AmbiguousFoldError());
        }

        if (!result.length) {
            return Result.err(new AttributeNotFoldedError(attribute, fold));
        }

        return Result.ok(result[0] as SimpleFoldValue<O[0]>);
    }

    public group(attribute?: string | undefined): CoronerValueType {
        return Result.unwrap(this.tryGroup(attribute));
    }

    public tryGroup(attribute?: string | undefined): Result<CoronerValueType, Error> {
        if (attribute === '*') {
            attribute = undefined;
        }

        for (const key in this.attributes) {
            if (attribute != null && key !== attribute) {
                continue;
            }

            const attributeValues = this.attributes[key];
            if ('groupKey' in attributeValues && attributeValues.groupKey != undefined) {
                return Result.ok(attributeValues.groupKey);
            }
        }

        if (attribute == undefined) {
            return Result.ok('*');
        }

        return Result.err(new AttributeNotGroupedError(attribute));
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
