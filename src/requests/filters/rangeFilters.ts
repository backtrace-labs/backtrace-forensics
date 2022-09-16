import { DictionaryType, StringType, UIntType, UUIDType, ValueAttributeType } from '../../common/attributes';
import { convertInputValue } from '../../implementation/helpers/convertInputValue';
import { InputValueType, QueryAttributeFilter } from '../common';

type RangeSupportedTypes = UIntType | UUIDType | StringType | DictionaryType;

export function range<V extends InputValueType<RangeSupportedTypes>, T extends ValueAttributeType<V>>(
    from: V,
    to: V
): QueryAttributeFilter<T>[] {
    const filters: QueryAttributeFilter<T>[] = [];
    filters.push(['at-least', convertInputValue(from)] as unknown as QueryAttributeFilter<T>);
    filters.push(['at-most', convertInputValue(to)] as unknown as QueryAttributeFilter<T>);
    return filters;
}
