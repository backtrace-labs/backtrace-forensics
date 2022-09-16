import { AttributeValueType } from '../../common/attributes';
import { CoronerValueType, InputValueType } from '../../requests';

export function convertInputValue(input: InputValueType): AttributeValueType {
    let result: CoronerValueType;
    if (input instanceof Date) {
        result = `${Math.floor(input.getTime() / 1000)}.`;
    } else {
        result = input;
    }
    return result;
}
