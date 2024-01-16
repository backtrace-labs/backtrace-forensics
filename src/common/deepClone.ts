export function deepClone<T>(obj: T): T {
    if (obj == undefined) {
        return obj;
    }

    const type = typeof obj;
    if (typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(deepClone) as T;
    }

    const result: Partial<typeof obj> = {};
    for (const key in obj) {
        result[key] = deepClone(obj[key]);
    }
    return result as T;
}
