import { ValueConverter } from '../lib';

describe('ValueConverter', () => {
    describe('toLabels', () => {
        it('should throw an error when input is not of string type', () => {
            const input = 123;
            expect(() => ValueConverter.toLabels(input)).toThrowError('Invalid value type, expected string.');
        });

        it('should return array of one string if there are no whitespaces', () => {
            const input = 'abc';
            const expected = ['abc'];
            expect(ValueConverter.toLabels(input)).toEqual(expected);
        });

        it('should return array of strings splitted by space', () => {
            const input = 'abc def ghi';
            const expected = ['abc', 'def', 'ghi'];
            expect(ValueConverter.toLabels(input)).toEqual(expected);
        });

        it('should return empty array if the string is empty', () => {
            const input = '';
            const expected: string[] = [];
            expect(ValueConverter.toLabels(input)).toEqual(expected);
        });

        it('should return array without whitespaces if separated by multiple whitespace', () => {
            const input = 'abc    def        ghi';
            const expected = ['abc', 'def', 'ghi'];
            expect(ValueConverter.toLabels(input)).toEqual(expected);
        });

        it('should return array of one string if separated by tab', () => {
            const input = 'abc\tdef';
            const expected = ['abc\tdef'];
            expect(ValueConverter.toLabels(input)).toEqual(expected);
        });

        it('should return array of one string if separated by CR', () => {
            const input = 'abc\rdef';
            const expected = ['abc\rdef'];
            expect(ValueConverter.toLabels(input)).toEqual(expected);
        });

        it('should return array of one string if separated by LF', () => {
            const input = 'abc\ndef';
            const expected = ['abc\ndef'];
            expect(ValueConverter.toLabels(input)).toEqual(expected);
        });

        it('should return array of one string if separated by CRLF', () => {
            const input = 'abc\r\ndef';
            const expected = ['abc\r\ndef'];
            expect(ValueConverter.toLabels(input)).toEqual(expected);
        });
    });

    describe('toCallstack', () => {
        it('should throw an error when input is not of string type', () => {
            const input = 123;
            expect(() => ValueConverter.toCallstack(input)).toThrowError('Invalid value type, expected string.');
        });

        it('should throw an error when input is not a valid JSON', () => {
            const input = '{';
            expect(() => ValueConverter.toCallstack(input)).toThrowError();
        });

        it('should throw an error when "frame" is not an array', () => {
            const input = '{ "frame": 123 }';
            expect(() => ValueConverter.toCallstack(input)).toThrowError(
                'Invalid JSON, expected "frame" to be an array.',
            );
        });

        it('should throw an error when "frame" is an array of non-strings', () => {
            const input = '{ "frame": [123, 456] }';
            expect(() => ValueConverter.toCallstack(input)).toThrowError(
                'Invalid JSON, expected all "frame" elements to be of string type.',
            );
        });

        it('should throw an error when "frame" array has a non-string value', () => {
            const input = '{ "frame": ["abc", 456] }';
            expect(() => ValueConverter.toCallstack(input)).toThrowError(
                'Invalid JSON, expected all "frame" elements to be of string type.',
            );
        });

        it('should return empty "frame" array if input is empty', () => {
            const input = '{ "frame": [] }';
            const expected: string[] = [];
            expect(ValueConverter.toCallstack(input)).toEqual(expected);
        });

        it('should return an empty array if JSON has no "frame" property', () => {
            const input = '{ "prop": 123 }';
            const expected: string[] = [];
            expect(ValueConverter.toCallstack(input)).toEqual(expected);
        });

        it('should return an empty array if JSON is empty', () => {
            const input = '{ }';
            const expected: string[] = [];
            expect(ValueConverter.toCallstack(input)).toEqual(expected);
        });

        it('should return "frame" array', () => {
            const input = '{ "frame": ["abc", "def"] }';
            const expected = ['abc', 'def'];
            expect(ValueConverter.toCallstack(input)).toEqual(expected);
        });
    });
});
