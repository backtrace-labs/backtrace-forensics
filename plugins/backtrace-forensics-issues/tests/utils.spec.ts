import { memoize } from '../src/implementation/utils';

describe('memoize', () => {
    it('should return the same result as the first call', () => {
        let number = 42;

        const fn = () => {
            return number++;
        };

        const memoized = memoize(fn);

        const res1 = memoized();
        const res2 = memoized();
        const res3 = memoized();

        expect(res1).toEqual(42);
        expect(res2).toEqual(42);
        expect(res3).toEqual(42);
    });

    it('should call the memoized function only once', () => {
        const fn = jest.fn();

        const memoized = memoize(fn);

        memoized();
        memoized();
        memoized();
        memoized();

        expect(fn).toBeCalledTimes(1);
    });
});
