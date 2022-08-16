import { DynamicCoronerQuery, StaticCoronerQuery } from './queries/common';

// TESTING STUFF
(async () => {
    interface Test {
        timestamp: number;
        fingerprint: string;
        _deleted: boolean;
    }

    const staticQuery = {} as StaticCoronerQuery<Test>;
    const dynamicQuery = {} as DynamicCoronerQuery;
    let runtimeStaticFold = staticQuery.fold();
    let runtimeDynamicFold = dynamicQuery.fold();

    const attrs: (keyof Test)[] = ['timestamp', 'fingerprint', '_deleted'];
    for (const attr of attrs) {
        runtimeStaticFold = runtimeStaticFold.fold(attr, 'head');
        runtimeDynamicFold = runtimeDynamicFold.fold(attr, 'head');
    }

    runtimeStaticFold = runtimeStaticFold.group('timestamp');
    runtimeDynamicFold = runtimeDynamicFold.group('timestamp');

    const staticFold = staticQuery
        .fold('timestamp', 'distribution', 1)
        .fold('_deleted', 'max')
        .fold('_deleted', 'min')
        .fold('_deleted', 'head')
        .group('_deleted');

    const foldResult = await staticFold.execute();

    if (!foldResult.error) {
        const test = foldResult.response;
        const simpleTest = test.first();
        simpleTest?.attributes._deleted;
    }

    let runtimeStaticSelect = staticQuery.select();
    let runtimeDynamicSelect = dynamicQuery.select<string>();

    for (const attr of attrs) {
        runtimeStaticSelect = runtimeStaticSelect.select(attr);
        runtimeDynamicSelect = runtimeDynamicSelect.select(attr);
    }

    runtimeStaticSelect.execute().then((s) => !s.error && s.response.values[1]);
    runtimeDynamicSelect.execute().then((s) => !s.error && s.response.values[1][1]);

    const staticSelect = staticQuery.select('timestamp');
    const selectResult = await staticSelect.execute();
    if (!selectResult.error) {
        const simple = selectResult.response.first();
    }

    const dynamicSelectQuery = {} as DynamicCoronerQuery;
    const dynamicSelectResult = await dynamicSelectQuery
        .filter('b', 'greater-than', 456)
        // .filter('a', 'regular-expression', '123')
        // .filter('c', 'regular-expression', 'abx')
        // .filter('b', 'at-least', 456)
        .select('a')
        .select('b')
        .select('c')
        .execute();
    if (!dynamicSelectResult.error) {
        const test = dynamicSelectResult.response.first();
        // b.response.values[2][1].
        if (test) {
            test;
        }
    }

    const dynamicFoldQuery = {} as DynamicCoronerQuery;
    const dynamicFoldResult = await dynamicFoldQuery
        .filter('b', 'greater-than', 456)
        // .filter('a', 'regular-expression', '123')
        // .filter('c', 'regular-expression', 'abx')
        // .filter('b', 'at-least', 456)
        // .select('a')
        // .select('b')
        // .select('c')
        .fold('a', 'head')
        .fold('a', 'min')
        .fold('c', 'sum')
        .group('a')
        .execute();
    if (!dynamicFoldResult.error) {
        const test = dynamicFoldResult.response.first();
        // b.response.values[2][1].
        if (test) {
            test.attributes.a.z;
        }
    }

    let semiRuntimeFold = staticQuery.fold('timestamp', 'head').fold('fingerprint', 'min');
    if (true) {
        semiRuntimeFold = semiRuntimeFold.fold('_deleted', 'max');
    }

    semiRuntimeFold.execute().then((r) => !r.error && r.response.first()?.attributes);
})();

type Test<A extends string, B extends boolean> = [A, B];
type TestArray = Test<string, boolean>[];

type TestObject<A extends Test<string, boolean>[]> = {
    [I in keyof A]: A[I];
};

const a = {} as TestObject<[['a', true], ['b', false]]>;
