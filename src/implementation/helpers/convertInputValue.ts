import { CoronerValueType, InputValueType } from '../../requests';

export function convertInputValue(input: InputValueType): CoronerValueType {
    let result: CoronerValueType;
    if (input instanceof Date) {
        // Not sure if that
        result = `${input.getTime() / 1000}.`;
    } else {
        result = input;
    }
    return result;
}
