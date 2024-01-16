import { deepClone } from '../src/common/deepClone';

describe('deepClone', () => {
    it('should clone arrays', () => {
        const array = [1, 2, 3, 4, 5];
        const result = deepClone(array);

        expect(result).not.toBe(array);
        expect(result).toEqual(array);
    });

    it('should clone nested arrays', () => {
        const array = [
            [1, 2],
            [3, 4],
            [5, 6],
        ];

        const result = deepClone(array);

        expect(result).not.toBe(array);
        expect(result).toEqual(array);

        for (let i = 0; i < array.length; i++) {
            expect(result[i]).not.toBe(array[i]);
            expect(result[i]).toEqual(array[i]);
        }
    });

    it('should clone objects', () => {
        const obj = { a: 123, b: 456, c: 789 };
        const result = deepClone(obj);

        expect(result).not.toBe(obj);
        expect(result).toEqual(obj);
    });

    it('should clone nested objects', () => {
        const obj = { a: { x: 123 }, b: { y: 456 }, c: { z: 789 } };
        const result = deepClone(obj);

        expect(result).not.toBe(obj);
        expect(result).toEqual(obj);

        for (const key in obj) {
            expect(result[key as never]).not.toBe(obj[key as never]);
            expect(result[key as never]).toEqual(obj[key as never]);
        }
    });
});
