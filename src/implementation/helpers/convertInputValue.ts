import { CoronerValueType, InputValueType } from '../../coroner/common';
import { AttributeValueType } from '../../coroner/common/attributes';

export function convertInputValue(input: InputValueType): AttributeValueType {
    let result: CoronerValueType;
    if (input instanceof Date) {
        result = `${Math.floor(input.getTime() / 1000)}.`;
    } else {
        result = input;
    }
    return result;
}
