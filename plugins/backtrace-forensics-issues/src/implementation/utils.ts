export function memoize<T>(fn: () => T): () => T {
    let cached: T;
    let isCached = false;

    return function memoized() {
        if (isCached) {
            return cached;
        }

        cached = fn();
        isCached = true;
        return cached;
    };
}
